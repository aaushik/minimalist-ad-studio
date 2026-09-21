// PROTOTYPE: generate only the scene, then composite the original Vitamin B5 photo and exact copy.
// Run with: node --import tsx scripts/prototype-cloudflare-hybrid-b5.ts
// Use --prepare to inspect the source-photo cutout without calling Cloudflare.

import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

const outputRoot = path.join(process.cwd(), "docs/prototypes/cloudflare-hybrid-b5");
const sourcePhotoPath = path.join(process.cwd(), "docs/prototypes/b5-ad/b5-product.png");
const model = "@cf/black-forest-labs/flux-2-klein-9b";
const productUrl = "https://beminimalist.co/products/vitamin-b5-10-moisturizer";

const directions = [
  {
    id: "01-water-motion",
    title: "Water motion",
    prompt: "Create a square, high-end SKINCARE AD BACKGROUND ONLY. A bright white studio cyclorama with a restrained translucent pale-blue ribbon of water sweeping behind the lower half, delicate droplets, soft realistic reflections and ample light. Keep the entire upper 30 percent nearly blank for black headline text. Keep a tall empty central zone from 30 to 85 percent of image height for a real product photo to be placed later. Art direction is clean, clinical, calm and photographic. There is NO product, tube, bottle, package, pedestal, person, hand, logo, lettering, number, badge, or graphic text anywhere in the image.",
  },
  {
    id: "02-editorial",
    title: "Editorial detail",
    prompt: "Create a square, premium SKINCARE AD BACKGROUND ONLY. An editorial warm-white paper studio with faint tactile paper grain, a fine pale-blue line, subtle translucent glass and soft diagonal daylight shadow on the far right. Leave the left half quiet and empty for large black copy. Leave a tall empty zone in the right half for a real product photo to be placed later. Gentle asymmetry, restrained science-led visual language, refined natural light, credible commercial photography. There is NO product, tube, bottle, package, person, hand, logo, lettering, number, badge, or graphic text anywhere in the image.",
  },
  {
    id: "03-product-stage",
    title: "Product stage",
    prompt: "Create a square, high-end SKINCARE AD BACKGROUND ONLY. Warm ivory studio backdrop, a low pale-blue translucent acrylic product stage in the lower left, realistic soft shadow and subtle highlights. Leave a tall clear zone above the stage on the left for a real product photo to be placed later. Leave the right half quiet and open for black headline, product facts and a call to action. Calm minimalist commerce composition, polished studio photography, no excessive decoration. There is NO product, tube, bottle, package, person, hand, logo, lettering, number, badge, or graphic text anywhere in the image.",
  },
] as const;

function xml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;",
  })[character] || character);
}

async function credentials() {
  const env = await readFile(".env.local", "utf8");
  const value = (name: string) => env.match(new RegExp(`^\\s*${name}\\s*=\\s*(.*?)\\s*$`, "m"))?.[1]?.replace(/^['"]|['"]$/g, "") || "";
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || value("CLOUDFLARE_ACCOUNT_ID");
  const token = process.env.CLOUDFLARE_API_TOKEN || value("CLOUDFLARE_API_TOKEN");
  if (!accountId || !token) throw new Error("Cloudflare credentials are missing from .env.local.");
  return { accountId, token };
}

async function generateScene(accountId: string, token: string, prompt: string) {
  const form = new FormData();
  form.set("prompt", prompt);
  form.set("width", "1024");
  form.set("height", "1024");
  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!response.ok) throw new Error(`Cloudflare returned ${response.status}: ${(await response.text()).slice(0, 500)}`);
  const contentType = response.headers.get("content-type") || "";
  if (contentType.startsWith("image/")) return Buffer.from(await response.arrayBuffer());
  const body = await response.json() as { result?: { image?: string }; image?: string };
  const encoded = body.result?.image || body.image;
  if (!encoded) throw new Error("Cloudflare did not return an image.");
  return Buffer.from(encoded.replace(/^data:image\/[^;]+;base64,/, ""), "base64");
}

// Hand-traced silhouette for this one-product trial. The label/body pixels stay original.
async function cutOutOriginalProduct() {
  const meta = await sharp(sourcePhotoPath).metadata();
  if (meta.width !== 1100 || meta.height !== 1600) {
    throw new Error("The saved Vitamin B5 source photo changed; review the prototype mask before using it.");
  }
  const mask = `<svg xmlns="http://www.w3.org/2000/svg" width="1100" height="1600" viewBox="0 0 1100 1600">
    <path fill="#fff" d="M279 185 C440 183 650 183 810 185 L810 225 C809 235 801 241 798 248 C781 455 762 666 743 875 C725 1087 711 1244 701 1323 L704 1345 C708 1380 710 1450 707 1466 C705 1485 697 1493 679 1495 L421 1495 C404 1493 394 1484 392 1466 C390 1443 391 1376 394 1345 L397 1323 C380 1154 361 964 342 770 C324 568 300 347 283 248 C279 240 277 233 277 225 Z"/>
  </svg>`;
  const fullImage = await sharp(sourcePhotoPath)
    .ensureAlpha()
    .composite([{ input: Buffer.from(mask), blend: "dest-in" }])
    .png()
    .toBuffer();
  const masked = await sharp(fullImage)
    .extract({ left: 277, top: 183, width: 535, height: 1314 })
    .png()
    .toBuffer();
  return masked;
}

function copyOverlay(id: string) {
  const shared = `<text x="70" y="80" class="brand">Minimalist.</text><text x="70" y="1024" class="footer">DRAFT · REVIEW REQUIRED</text>`;
  const style = `<style>.brand{font:700 32px 'Liberation Sans',Arial,sans-serif;fill:#14181a}.eyebrow{font:700 24px 'Liberation Sans',Arial,sans-serif;letter-spacing:4px;fill:#49636c}.headline{font:700 74px 'Liberation Sans',Arial,sans-serif;fill:#111719}.sub{font:400 28px 'Liberation Sans',Arial,sans-serif;fill:#263238}.small{font:400 25px 'Liberation Sans',Arial,sans-serif;fill:#263238}.cta{font:700 27px 'Liberation Sans',Arial,sans-serif;fill:#111719}.footer{font:700 16px 'Liberation Sans',Arial,sans-serif;letter-spacing:2px;fill:#687d83}</style>`;
  let content: string;
  if (id === "01-water-motion") {
    content = `<defs><linearGradient id="floorFade" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#fff" stop-opacity="0"/><stop offset=".7" stop-color="#fff" stop-opacity=".86"/><stop offset="1" stop-color="#fff"/></linearGradient></defs>
      <rect x="0" y="0" width="1080" height="333" fill="#fff"/>
      <rect x="0" y="810" width="1080" height="140" fill="url(#floorFade)"/>
      <rect x="0" y="950" width="1080" height="130" fill="#fff"/>
      <text x="70" y="150" class="eyebrow">VITAMIN B5 10%</text>
      <text x="70" y="230" class="headline">Hydration for every day.</text>
      <text x="70" y="282" class="sub">Lightweight, oil-free moisturiser.</text>
      <rect x="40" y="925" width="1000" height="76" rx="8" fill="#fff"/>
      <text x="70" y="974" class="small">Vitamin B5 10% Moisturizer</text>
      <text x="800" y="974" class="cta">Explore product →</text>`;
  } else if (id === "02-editorial") {
    content = `<ellipse cx="826" cy="948" rx="145" ry="18" fill="#253238" opacity=".10"/>
      <rect x="34" y="150" width="526" height="705" rx="10" fill="#fff" opacity=".80"/>
      <text x="72" y="220" class="eyebrow">EVERYDAY CARE</text>
      <text x="70" y="320" class="headline">Lightweight</text>
      <text x="70" y="400" class="headline">hydration.</text>
      <line x1="72" y1="455" x2="260" y2="455" stroke="#a7cddc" stroke-width="5"/>
      <text x="72" y="530" class="sub">An oil-free moisturiser</text>
      <text x="72" y="568" class="sub">for oily and combination skin.</text>
      <text x="72" y="755" class="small">Vitamin B5 10% Moisturizer</text>
      <text x="72" y="815" class="cta">Explore product →</text>`;
  } else {
    content = `<rect x="94" y="166" width="432" height="760" rx="10" fill="#fffaf4"/>
      <rect x="520" y="186" width="526" height="714" rx="10" fill="#fff"/>
      <text x="586" y="258" class="eyebrow">VITAMIN B5 10%</text>
      <text x="585" y="360" class="headline">Daily</text>
      <text x="585" y="440" class="headline">moisturiser.</text>
      <line x1="586" y1="492" x2="780" y2="492" stroke="#a7cddc" stroke-width="5"/>
      <text x="586" y="572" class="sub">Lightweight hydration.</text>
      <text x="586" y="612" class="sub">Oil-free. 50g.</text>
      <rect x="586" y="765" width="397" height="77" rx="5" fill="#111719"/>
      <text x="614" y="816" class="cta" fill="#fff" style="fill:#fff">Explore product →</text>`;
  }
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080">${style}${content}${shared}</svg>`);
}

async function composeAd(id: string, scenePath: string, cutout: Buffer) {
  const productHeight = id === "01-water-motion" ? 625 : id === "02-editorial" ? 750 : 720;
  const product = await sharp(cutout).resize({ height: productHeight }).png().toBuffer();
  const meta = await sharp(product).metadata();
  const x = id === "01-water-motion" ? Math.round((1080 - (meta.width || 0)) / 2)
    : id === "02-editorial" ? 676 : 181;
  const y = id === "01-water-motion" ? 292 : id === "02-editorial" ? 190 : 228;
  const scene = await sharp(scenePath).resize(1080, 1080, { fit: "cover" }).png().toBuffer();
  await sharp(scene)
    .composite([
      { input: copyOverlay(id), left: 0, top: 0 },
      { input: product, left: x, top: y },
    ])
    .png()
    .toFile(path.join(outputRoot, `${id}-final.png`));
}

async function contactSheet() {
  const width = 480;
  const tiles = await Promise.all(directions.map((direction) =>
    sharp(path.join(outputRoot, `${direction.id}-final.png`)).resize(width, width).png().toBuffer(),
  ));
  await sharp({ create: { width: width * tiles.length, height: width, channels: 4, background: "#ffffff" } })
    .composite(tiles.map((input, index) => ({ input, left: width * index, top: 0 })))
    .png()
    .toFile(path.join(outputRoot, "three-final-ads.png"));
}

function gallery() {
  const cards = directions.map(({ id, title }) => `<article><h2>${xml(title)}</h2><div class="pair"><figure><img src="${id}-scene.png" alt="Generated empty scene"><figcaption>Cloudflare scene only</figcaption></figure><figure><img src="${id}-final.png" alt="Final ad with original product photo and exact text"><figcaption>Original product pixels + exact text</figcaption></figure></div></article>`).join("\n");
  return `<!doctype html><html lang="en"><meta charset="utf-8"><title>Vitamin B5 hybrid ad trial</title><style>body{font:16px/1.4 Arial,sans-serif;background:#eef1f1;color:#182126;margin:30px auto;max-width:1200px}header,article{background:#fff;padding:24px;margin:20px 0}h1{margin:0}h2{margin-top:0}.pair{display:grid;grid-template-columns:1fr 1fr;gap:24px}figure{margin:0}img{display:block;width:100%;aspect-ratio:1;object-fit:contain}figcaption{margin-top:8px;color:#5b666b}@media(max-width:700px){.pair{grid-template-columns:1fr}}</style><header><h1>Vitamin B5 · hybrid Cloudflare trial</h1><p>Three generated scenes. The final ads composite the original product photo and exact text after generation. These are review drafts, not approved advertising.</p></header>${cards}</html>`;
}

async function main() {
  await mkdir(outputRoot, { recursive: true });
  const cutout = await cutOutOriginalProduct();
  await copyFile(sourcePhotoPath, path.join(outputRoot, "source-product.png"));
  await writeFile(path.join(outputRoot, "product-cutout.png"), cutout);
  if (process.argv.includes("--prepare")) {
    console.log(`Inspect ${path.join(outputRoot, "product-cutout.png")}`);
    return;
  }

  const composeOnly = process.argv.includes("--compose-only");
  const cloudflare = composeOnly ? null : await credentials();
  const results: Array<{ id: string; prompt: string; status: string; error?: string }> = [];
  for (const direction of directions) {
    const scenePath = path.join(outputRoot, `${direction.id}-scene.png`);
    console.log(`${composeOnly ? "Reusing" : "Generating"} ${direction.title} scene...`);
    try {
      if (!composeOnly) {
        if (!cloudflare) throw new Error("Cloudflare credentials were not loaded.");
        const scene = await generateScene(cloudflare.accountId, cloudflare.token, direction.prompt);
        await sharp(scene).png().toFile(scenePath);
      }
      await composeAd(direction.id, scenePath, cutout);
      results.push({ id: direction.id, prompt: direction.prompt, status: "generated" });
      console.log(`Finished ${direction.title}.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      results.push({ id: direction.id, prompt: direction.prompt, status: "failed", error: message });
      console.error(`${direction.title}: ${message}`);
    }
  }
  await writeFile(path.join(outputRoot, "prompts.json"), JSON.stringify({ model, productUrl, sourcePhoto: "source-product.png", results }, null, 2));
  await writeFile(path.join(outputRoot, "index.html"), gallery());
  if (results.every((result) => result.status === "generated")) await contactSheet();
  console.log(`Review ${path.join(outputRoot, "index.html")}`);
  if (results.some((result) => result.status === "failed")) process.exitCode = 1;
}

main().catch((error) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
