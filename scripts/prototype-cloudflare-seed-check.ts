// PROTOTYPE: Compare a product-photo reference with a neutral design seed.
// Run with: npm run prototype:cloudflare:seed-check

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

const outputRoot = "/tmp/nudge-cloudflare-seed-check";
const productPath = "/tmp/nudge-cloudflare-reference-trial/moisturizer-splash/product.png";
const model = "@cf/black-forest-labs/flux-2-klein-4b";

const blueprint = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="480" viewBox="0 0 480 480">
<defs><linearGradient id="bg" x2="0" y2="1"><stop stop-color="#fcfdfd"/><stop offset="1" stop-color="#e9f2f5"/></linearGradient></defs>
<rect width="480" height="480" fill="url(#bg)"/>
<path d="M40 340 C110 240 200 310 255 365 S390 420 470 330" fill="none" stroke="#d1e4eb" stroke-width="30" opacity=".65"/>
<path d="M10 390 C120 315 195 365 280 410 S405 455 500 370" fill="none" stroke="#b9d8e4" stroke-width="7" opacity=".75"/>
<ellipse cx="240" cy="432" rx="140" ry="22" fill="#bdd4dd" opacity=".25"/>
<rect x="150" y="180" width="180" height="215" fill="#fff" opacity=".88"/>
<rect x="35" y="30" width="410" height="115" fill="#fff" opacity=".9"/>
</svg>`;

async function credentials() {
  const env = await readFile(".env.local", "utf8");
  const value = (name: string) => env.match(new RegExp(`^${name}=(.+)$`, "m"))?.[1]?.trim() || "";
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || value("CLOUDFLARE_ACCOUNT_ID");
  const token = process.env.CLOUDFLARE_API_TOKEN || value("CLOUDFLARE_API_TOKEN");
  if (!accountId || !token) throw new Error("Cloudflare credentials are missing from .env.local.");
  return { accountId, token };
}

async function generate(accountId: string, token: string, prompt: string, images: Buffer[]) {
  const form = new FormData();
  form.set("prompt", prompt);
  form.set("width", "1024");
  form.set("height", "1024");
  images.forEach((bytes, index) => {
    form.set(`input_image_${index}`, new Blob([new Uint8Array(bytes)], { type: "image/png" }), `reference-${index}.png`);
  });
  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`, {
    method: "POST", headers: { Authorization: `Bearer ${token}` }, body: form,
  });
  if (!response.ok) throw new Error(`Cloudflare returned ${response.status}: ${(await response.text()).slice(0, 500)}`);
  const body = await response.json() as { result?: { image?: string }; image?: string };
  const encoded = body.result?.image || body.image;
  if (!encoded) throw new Error("Cloudflare did not return an image.");
  return Buffer.from(encoded.replace(/^data:image\/[^;]+;base64,/, ""), "base64");
}

async function main() {
  const { accountId, token } = await credentials();
  const product = await readFile(productPath);
  const design = await sharp(Buffer.from(blueprint)).png().toBuffer();
  const emptyDesign = await sharp(Buffer.from(blueprint.replace('<rect x="150" y="180" width="180" height="215" fill="#fff" opacity=".88"/>', ""))).png().toBuffer();
  await mkdir(outputRoot, { recursive: true });
  await writeFile(path.join(outputRoot, "design-seed.png"), design);
  await writeFile(path.join(outputRoot, "empty-design-seed.png"), emptyDesign);
  const brief = "Original high-key square studio scene for a Minimalist moisturizer. A soft translucent water arc moves around a clean, empty central product zone. Gentle blue-grey light, substantial white space at the top for editable copy. The scene contains no product container, package, logo, letters, numbers, or promotional badge.";

  for (const variant of ["product-and-seed", "seed-only", "empty-scene"] as const) {
    const output = path.join(outputRoot, `${variant}.png`);
    try { await readFile(output); console.log(`Reusing ${variant}...`); continue; } catch { /* Generate missing image. */ }
    const images = variant === "product-and-seed" ? [product, design] : variant === "seed-only" ? [design] : [emptyDesign];
    const prompt = variant === "empty-scene"
      ? "Image 0 is an abstract design sketch. Create an empty square studio backdrop with only a white surface, soft pale-blue water arcs across the lower third, gentle reflections, and ample clear space in the center and upper half. The scene contains no objects, containers, products, typography, logos, or badges."
      : `${variant === "product-and-seed" ? "Image 0 shows the real product for visual context. Image 1 is an abstract design sketch." : "Image 0 is an abstract design sketch."} ${brief}`;
    console.log(`Generating ${variant}...`);
    const scene = await generate(accountId, token, prompt, images);
    await sharp(scene).png().toFile(output);
  }
  console.log(`Compare the two scenes in ${outputRoot}`);
}

main().catch((error) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
