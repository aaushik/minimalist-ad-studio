// PROTOTYPE: Can Cloudflare turn product photos and curated ad references into distinct scenes?
// Run with: npm run prototype:cloudflare

import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

import { fetchProductCreative, type ProductCreative } from "../src/lib/product";

const outputRoot = "/tmp/nudge-cloudflare-reference-trial";
const model = "@cf/black-forest-labs/flux-2-klein-4b";

const products = [
  {
    id: "moisturizer",
    category: "moisturizer",
    url: "https://beminimalist.co/products/vitamin-b5-10-moisturizer",
    brief: "Introduce this moisturizer with a calm, educational feel. Show a sense of everyday hydration.",
    directions: ["splash", "editorial", "ingredient"],
  },
  {
    id: "sunscreen",
    category: "sunscreen",
    url: "https://beminimalist.co/products/multi-vitamin-spf-50",
    brief: "Introduce this sunscreen as part of a simple daily routine. Keep the visual precise and bright.",
    directions: ["editorial", "ingredient", "commerce"],
  },
  {
    id: "hair-serum",
    category: "hair serum",
    url: "https://beminimalist.co/products/hair-growth-actives-18",
    brief: "Present this hair serum with a factual, restrained product focus and clear visual hierarchy.",
    directions: ["splash", "routine", "commerce"],
  },
] as const;

const directions = {
  splash: {
    source: "S005-hydrating-shampoo-splash.jpg",
    borrow: "a bright white studio, restrained water motion around a central empty product zone",
    productZone: "the center below the headline",
    copyZone: "the upper quarter",
  },
  editorial: {
    source: "S004-hydrating-shampoo-detail.jpg",
    borrow: "an editorial split with generous explanatory space and subtle material detail",
    productZone: "the right half",
    copyZone: "the upper and middle left",
  },
  ingredient: {
    source: "S002-sensitive-skin.jpg",
    borrow: "airy ingredient-inspired grouping, soft texture, and substantial whitespace",
    productZone: "the lower right",
    copyZone: "the upper left",
  },
  routine: {
    source: "S006-oil-control-kit.jpg",
    borrow: "a clean modular grid and delicate connector lines for one product and its verified facts",
    productZone: "the lower left",
    copyZone: "the upper half",
  },
  commerce: {
    source: "S001-freebie-square.jpg",
    borrow: "a bright neutral product stage with clear space for price and a call to action",
    productZone: "the lower center",
    copyZone: "the upper third",
  },
} as const;

type DirectionId = keyof typeof directions;

async function localCredentials() {
  const values: Record<string, string> = {};
  try {
    const envFile = await readFile(".env.local", "utf8");
    for (const line of envFile.split(/\r?\n/)) {
      const match = line.match(/^\s*(CLOUDFLARE_ACCOUNT_ID|CLOUDFLARE_API_TOKEN)\s*=\s*(.*?)\s*$/);
      if (match) values[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
    }
  } catch {
    // Environment variables can supply the same values.
  }
  return {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID || values.CLOUDFLARE_ACCOUNT_ID,
    token: process.env.CLOUDFLARE_API_TOKEN || values.CLOUDFLARE_API_TOKEN,
  };
}

async function fetchBytes(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Could not download product image (${response.status}).`);
  return Buffer.from(await response.arrayBuffer());
}

function scenePrompt(product: ProductCreative, category: string, brief: string, direction: DirectionId) {
  const card = directions[direction];
  return [
    `Create an original square advertising scene for a Minimalist ${category}.`,
    `Image 0 shows the real product; use its visual identity and palette as context.`,
    `Image 1 is a design reference; borrow only ${card.borrow}.`,
    `The marketer's brief is: ${brief}`,
    `Keep ${card.productZone} clean for the original product photo and ${card.copyZone} clean for editable copy that will be added later.`,
    `Use precise studio lighting, a restrained palette, and generous whitespace.`,
    `The scene is empty of bottles, tubes, packaging, logos, lettering, numbers, badges, offers, and before-after results.`,
    `Do not recreate the product, wording, or promotion visible in image 1.`,
    `This is a new scene for ${product.title}, not a copy of either input image.`,
  ].join(" ");
}

async function generateScene(accountId: string, token: string, productImage: Buffer, sourceImage: Buffer, prompt: string) {
  const form = new FormData();
  form.set("prompt", prompt);
  form.set("width", "1024");
  form.set("height", "1024");
  form.set("input_image_0", new Blob([new Uint8Array(productImage)], { type: "image/png" }), "product.png");
  form.set("input_image_1", new Blob([new Uint8Array(sourceImage)], { type: "image/png" }), "design.png");

  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!response.ok) {
    throw new Error(`Cloudflare returned ${response.status}: ${(await response.text()).slice(0, 500)}`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.startsWith("image/")) return Buffer.from(await response.arrayBuffer());

  const body = await response.json() as { result?: { image?: string }; image?: string };
  const encoded = body.result?.image || body.image;
  if (!encoded) throw new Error("Cloudflare did not return an image.");
  return Buffer.from(encoded.replace(/^data:image\/[^;]+;base64,/, ""), "base64");
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char] || char);
}

function reportHtml(rows: Array<{ id: string; title: string; price: string; copy: string; direction: DirectionId }>) {
  const cards = rows.map((row) => {
    const folder = escapeHtml(row.id);
    return `<article><h2>${escapeHtml(row.title)} · ${row.direction}</h2>
      <div class="comparison">
        <figure><img src="${folder}/reference.png" alt="Source design reference"><figcaption>Design reference</figcaption></figure>
        <figure><div class="ad ${row.direction}" style="background-image:url('${folder}/scene.png')">
          <div class="copy"><strong>Minimalist.</strong><h3>${escapeHtml(row.title)}</h3><p>${escapeHtml(row.copy)}</p><b>${escapeHtml(row.price)}</b></div>
          <img class="product" src="${folder}/product.png" alt="Real product photo">
        </div><figcaption>Generated scene + exact product photo and page copy</figcaption></figure>
      </div></article>`;
  }).join("\n");
  return `<!doctype html><html lang="en"><meta charset="utf-8"><title>Cloudflare reference trial</title>
  <style>body{font:16px/1.4 Arial,sans-serif;background:#f4f4f2;color:#171717;margin:24px auto;max-width:1200px}h1{margin-bottom:0}header p{margin-top:4px;color:#555}article{background:#fff;padding:18px;margin:28px 0;border:1px solid #ddd}h2{font-size:18px}.comparison{display:grid;grid-template-columns:1fr 1fr;gap:18px}figure{margin:0}figure>img,.ad{width:100%;aspect-ratio:1;object-fit:contain}.ad{position:relative;background-size:cover;background-position:center;overflow:hidden}.copy{position:absolute;z-index:2;max-width:45%;padding:7%;font-size:clamp(10px,1.4vw,19px);background:rgba(255,255,255,.82)}.copy strong{font-size:.85em}.copy h3{font-size:1.5em;line-height:1.05}.copy p{font-size:.8em}.product{position:absolute;z-index:1;width:40%;height:45%;object-fit:contain;background:#fff}.splash .copy,.commerce .copy{top:0;left:0;max-width:86%;width:86%;text-align:center}.splash .product{top:37%;left:30%}.editorial .copy{top:14%;left:0}.editorial .product{top:28%;right:5%}.ingredient .copy{top:5%;left:0}.ingredient .product{bottom:8%;right:6%}.routine .copy{top:0;left:0;max-width:86%;width:86%}.routine .product{bottom:7%;left:8%}.commerce .product{bottom:5%;left:30%}figcaption{padding:8px 0;color:#555;font-size:13px}@media(max-width:700px){.comparison{grid-template-columns:1fr}.copy{font-size:3vw}}</style>
  <header><h1>PROTOTYPE · Cloudflare reference trial</h1><p>Compare each source reference with a generated scene. Text and the real product photo are overlaid locally for review.</p></header>${cards}</html>`;
}

async function main() {
  const { accountId, token } = await localCredentials();
  if (!accountId || !token) {
    throw new Error("Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN in .env.local, then run npm run prototype:cloudflare.");
  }

  await mkdir(outputRoot, { recursive: true });
  const reportRows: Array<{ id: string; title: string; price: string; copy: string; direction: DirectionId }> = [];
  const manifest = [];

  for (const item of products) {
    const product = await fetchProductCreative(item.url);
    const originalPhoto = await fetchBytes(product.imageUrl);
    const productInput = await sharp(originalPhoto).resize(480, 480, { fit: "contain", background: "white" }).png().toBuffer();

    for (const direction of item.directions) {
      const card = directions[direction];
      const id = `${item.id}-${direction}`;
      const folder = path.join(outputRoot, id);
      await mkdir(folder, { recursive: true });
      const sourcePath = path.join(process.cwd(), "docs/research/current-ads/static", card.source);
      const sourceInput = await sharp(sourcePath).resize(480, 480, { fit: "inside" }).png().toBuffer();
      const prompt = scenePrompt(product, item.category, item.brief, direction);

      console.log(`Generating ${id}...`);
      const scene = await generateScene(accountId, token, productInput, sourceInput, prompt);
      await Promise.all([
        sharp(scene).png().toFile(path.join(folder, "scene.png")),
        writeFile(path.join(folder, "product.png"), productInput),
        writeFile(path.join(folder, "reference.png"), sourceInput),
      ]);
      reportRows.push({ id, title: product.title, price: product.price, copy: product.supportingCopy, direction });
      manifest.push({ id, productUrl: product.sourceUrl, source: card.source, prompt });
    }
  }

  await Promise.all([
    writeFile(path.join(outputRoot, "index.html"), reportHtml(reportRows)),
    writeFile(path.join(outputRoot, "manifest.json"), JSON.stringify(manifest, null, 2)),
  ]);
  console.log(`Review the nine generated ads in ${path.join(outputRoot, "index.html")}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
