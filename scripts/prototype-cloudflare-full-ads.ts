// PROTOTYPE: Can Cloudflare produce three complete ads, including product and type?
// Run with: npm run prototype:cloudflare:full-ads

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

import { fetchProductCreative } from "../src/lib/product";

const outputRoot = path.join(process.cwd(), "docs/prototypes/cloudflare-full-ad-trial");
const model = "@cf/black-forest-labs/flux-2-klein-9b";
const productUrl = "https://beminimalist.co/products/vitamin-b5-10-moisturizer";

const directions = [
  {
    id: "01-water-motion",
    design: "Source-derived direction: a bright white studio, restrained pale-blue water motion, and a centered hero product. One large headline above, a small CTA below. Dynamic but calm.",
    headline: "Hydration for every day.",
  },
  {
    id: "02-editorial",
    design: "Source-derived direction: editorial split composition. Large product on the right, crisp black headline on the left, generous whitespace, subtle paper texture and a fine pale-blue rule. Precise and educational.",
    headline: "Meet your daily moisturizer.",
  },
  {
    id: "03-commerce",
    design: "Source-derived direction: a warm-white product stage with a subtle pale-blue pedestal. Product on the left, bold purchase message on the right, clear button near the bottom. Clean and direct.",
    headline: "A simple step for hydrated skin.",
  },
] as const;

async function credentials() {
  const env = await readFile(".env.local", "utf8");
  const value = (name: string) => env.match(new RegExp(`^\\s*${name}\\s*=\\s*(.*?)\\s*$`, "m"))?.[1]?.replace(/^['"]|['"]$/g, "") || "";
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || value("CLOUDFLARE_ACCOUNT_ID");
  const token = process.env.CLOUDFLARE_API_TOKEN || value("CLOUDFLARE_API_TOKEN");
  if (!accountId || !token) throw new Error("Cloudflare credentials are missing from .env.local.");
  return { accountId, token };
}

function makePrompt(productTitle: string, design: string, headline: string) {
  return [
    "Create a COMPLETE, ready-to-publish square social media image ad, not a background or mockup.",
    "Image 0 is the actual Minimalist product photo. Make that ONE product the hero, closely matching its tube, colors, label, and proportions. Do not add other products.",
    design,
    "Include finished, legible typography as part of the ad itself. Use exactly these short lines and no other ad copy:",
    'Brand: "Minimalist".',
    `Headline: "${headline}".`,
    `Product line: "${productTitle}".`,
    'Call to action: "Explore product".',
    "Use a premium, restrained skincare art direction: high contrast black type, warm white and very pale blue, ample space, clear hierarchy, studio-quality light.",
    "No discount, price, medical claim, extra logo, unrelated packaging, or small unreadable filler text.",
    "The output must be the finished ad, with its product and words already visible.",
  ].join(" ");
}

async function generate(accountId: string, token: string, productImage: Buffer, prompt: string) {
  const form = new FormData();
  form.set("prompt", prompt);
  form.set("width", "1024");
  form.set("height", "1024");
  form.set("input_image_0", new Blob([new Uint8Array(productImage)], { type: "image/png" }), "product.png");
  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`, {
    method: "POST", headers: { Authorization: `Bearer ${token}` }, body: form,
  });
  if (!response.ok) throw new Error(`Cloudflare returned ${response.status}: ${(await response.text()).slice(0, 500)}`);
  const contentType = response.headers.get("content-type") || "";
  if (contentType.startsWith("image/")) return Buffer.from(await response.arrayBuffer());
  const body = await response.json() as { result?: { image?: string }; image?: string };
  const encoded = body.result?.image || body.image;
  if (!encoded) throw new Error("Cloudflare did not return an image.");
  return Buffer.from(encoded.replace(/^data:image\/[^;]+;base64,/, ""), "base64");
}

async function main() {
  const { accountId, token } = await credentials();
  const product = await fetchProductCreative(productUrl);
  const imageResponse = await fetch(product.imageUrl);
  if (!imageResponse.ok) throw new Error(`Product photo returned ${imageResponse.status}.`);
  const image = await sharp(Buffer.from(await imageResponse.arrayBuffer()))
    .resize(480, 480, { fit: "contain", background: "white" }).png().toBuffer();
  await mkdir(outputRoot, { recursive: true });
  await writeFile(path.join(outputRoot, "product-reference.png"), image);

  const records = [];
  for (const direction of directions) {
    const prompt = makePrompt(product.title, direction.design, direction.headline);
    console.log(`Generating ${direction.id}...`);
    try {
      const ad = await generate(accountId, token, image, prompt);
      await sharp(ad).png().toFile(path.join(outputRoot, `${direction.id}.png`));
      records.push({ id: direction.id, status: "generated", prompt });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`${direction.id}: ${message}`);
      records.push({ id: direction.id, status: "failed", prompt, error: message });
    }
  }
  await writeFile(path.join(outputRoot, "prompts.json"), JSON.stringify({ model, productUrl, records }, null, 2));
  console.log(`Review the outputs in ${outputRoot}`);
}

main().catch((error) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
