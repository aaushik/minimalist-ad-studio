import assert from "node:assert/strict";
import test from "node:test";

import type { ProductCreative } from "../product";
import { generateCreativeSet, type CreativeGenerationServices } from "./generate";

const product: ProductCreative = {
  sourceUrl: "https://beminimalist.co/products/vitamin-b5-10-moisturizer",
  title: "Vitamin B5 10% Moisturizer",
  eyebrow: "VITAMIN B5 10%",
  headline: "Lightweight hydration.\nBarrier care.",
  supportingCopy: "An everyday moisturiser for oily and combination skin.",
  badges: "Fragrance Free",
  detailLine: "With Panthenol + Hyaluronic Acid",
  price: "₹332",
  compareAtPrice: "₹349",
  size: "50g",
  cta: "Explore moisturiser",
  imageUrl: "https://cdn.shopify.com/product.png",
};

test("unsafe or failed scenes fall back while safe scenes are retained", async () => {
  const attempts = new Map<string, number>();
  const services: CreativeGenerationServices = {
    proposePlan: async () => null,
    generateScene: async (variant) => {
      const count = (attempts.get(variant.id) ?? 0) + 1;
      attempts.set(variant.id, count);
      if (variant.id === "variant-3") throw new Error("generation failed");
      return `data:image/jpeg;base64,${variant.id}-${count}`;
    },
    reviewScene: async (_dataUrl, variant) => variant.id === "variant-1",
  };

  const result = await generateCreativeSet({
    product,
    brief: "A quiet awareness campaign",
    services,
  });

  assert.equal(result.variants.length, 3);
  assert.equal(result.variants[0]?.backgroundSource, "cloudflare");
  assert.equal(result.variants[1]?.backgroundSource, "fallback");
  assert.equal(result.variants[2]?.backgroundSource, "fallback");
  assert.equal(attempts.get("variant-2"), 2);
  assert.ok(result.warnings.length >= 2);
});

test("the source product image is preserved across all composed variants", async () => {
  const result = await generateCreativeSet({
    product,
    brief: "Explain the formula",
    services: null,
  });

  assert.equal(result.variants.length, 3);
  assert.ok(result.variants.every((variant) => variant.creative.imageUrl === product.imageUrl));
  assert.equal(new Set(result.variants.map((variant) => variant.creative.headline)).size, 3);
});
