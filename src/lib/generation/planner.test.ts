import assert from "node:assert/strict";
import test from "node:test";

import type { ProductCreative } from "../product";
import { finalizeCreativePlan } from "./planner";

const product: ProductCreative = {
  sourceUrl: "https://beminimalist.co/products/vitamin-b5-10-moisturizer",
  title: "Vitamin B5 10% Moisturizer",
  eyebrow: "VITAMIN B5 10%",
  headline: "Lightweight hydration.\nBarrier care.",
  supportingCopy:
    "An everyday, oil-free moisturiser formulated for oily and combination skin.",
  badges: "Fragrance Free · Non-comedogenic",
  detailLine: "With Panthenol + Hyaluronic Acid",
  price: "₹332",
  compareAtPrice: "₹349",
  size: "50g",
  cta: "Explore moisturiser",
  imageUrl: "https://cdn.shopify.com/product.png",
};

test("a vague brief produces three copy and design variants", () => {
  const plan = finalizeCreativePlan({
    product,
    brief: "Make this feel calm, modern and premium.",
  });

  assert.equal(plan.interpretation.objective, "awareness");
  assert.equal(plan.variants.length, 3);
  assert.equal(new Set(plan.variants.map((variant) => variant.direction)).size, 3);
  assert.equal(new Set(plan.variants.map((variant) => variant.headline)).size, 3);
  assert.equal(new Set(plan.variants.map((variant) => variant.supportingCopy)).size, 3);
});

test("fallback copy stays distinct when the source repeats the product title", () => {
  const repeatedProduct: ProductCreative = {
    ...product,
    title: "Gentle Cleanser",
    eyebrow: "GENTLE CLEANSER",
    headline: "Gentle Cleanser",
    supportingCopy: "",
    badges: "",
    detailLine: "Gentle Cleanser",
    size: "100ml",
    price: "₹299",
  };

  const plan = finalizeCreativePlan({
    product: repeatedProduct,
    brief: "Build awareness",
  });

  assert.equal(new Set(plan.variants.map((variant) => variant.headline)).size, 3);
  assert.equal(new Set(plan.variants.map((variant) => variant.supportingCopy)).size, 3);
});

test("a commerce brief is interpreted without an objective selector", () => {
  const plan = finalizeCreativePlan({
    product,
    brief: "Drive purchases from people comparing moisturisers. Make the price and CTA clear.",
  });

  assert.equal(plan.interpretation.objective, "sales");
  assert.ok(plan.variants.some((variant) => variant.direction === "commerce-focus"));
});

test("an explicit awareness goal wins over visual ingredient language", () => {
  const plan = finalizeCreativePlan({
    product,
    brief: "Build awareness with a calm ingredient-led visual.",
  });

  assert.equal(plan.interpretation.objective, "awareness");
});

test("an unsafe model plan is discarded instead of publishing invented claims", () => {
  const plan = finalizeCreativePlan({
    product,
    brief: "Make three sales ads.",
    proposedPlan: {
      interpretation: {
        objective: "sales",
        audience: "Skincare shoppers",
        tone: "Direct",
        visualIntent: "Product focused",
      },
      variants: [
        {
          direction: "commerce-focus",
          messageAngle: "Fast results",
          eyebrow: "CLINICALLY PROVEN",
          headline: "90% clearer skin in 7 days",
          supportingCopy: "Guaranteed to cure dry skin.",
          cta: "Buy now",
          scenePrompt: "A clean blue studio surface",
          factsUsed: ["90% clearer skin in 7 days"],
        },
        {
          direction: "product-splash",
          messageAngle: "Offer",
          eyebrow: "LIMITED OFFER",
          headline: "90% clearer skin in 7 days — today only",
          supportingCopy: "Guaranteed results.",
          cta: "Buy now",
          scenePrompt: "A blue splash",
          factsUsed: ["Guaranteed results"],
        },
        {
          direction: "editorial-detail",
          messageAngle: "Proof",
          eyebrow: "DERMATOLOGIST APPROVED",
          headline: "A cure in one week",
          supportingCopy: "Permanent results for everyone.",
          cta: "Buy now",
          scenePrompt: "Editorial shadows",
          factsUsed: ["Permanent results for everyone"],
        },
      ],
    },
  });

  assert.equal(plan.source, "fallback");
  const allCopy = JSON.stringify(plan.variants);
  assert.doesNotMatch(allCopy, /90%|7 days|cure|guaranteed/i);
});

test("uncited non-numeric claims are rejected even when a real fact is cited", () => {
  const proposedPlan = {
    interpretation: {
      objective: "awareness" as const,
      audience: "Skincare shoppers",
      tone: "Calm",
      visualIntent: "Clean product campaign",
    },
    variants: [
      ["product-splash", "Deeply repairs damaged skin"],
      ["editorial-detail", "Meet the formula"],
      ["ingredient-story", "Formula for your routine"],
    ].map(
      ([direction, headline], index) => {
        const supportingCopy = [product.supportingCopy, product.detailLine, product.badges][index]!;
        return {
        direction,
        messageAngle: `Angle ${index + 1}`,
        eyebrow: "EVERYDAY CARE",
        headline,
        supportingCopy,
        cta: "Explore product",
        scenePrompt: "An abstract pale blue background with open space",
        factsUsed: [supportingCopy],
        };
      },
    ),
  };

  const plan = finalizeCreativePlan({ product, brief: "Build awareness", proposedPlan });

  assert.equal(plan.source, "fallback");
  assert.doesNotMatch(JSON.stringify(plan.variants), /deeply repairs damaged/i);
});

test("a valid model plan is kept when all cited facts come from the page", () => {
  const plan = finalizeCreativePlan({
    product,
    brief: "Explain the formula to oily skin shoppers.",
    proposedPlan: {
      interpretation: {
        objective: "education",
        audience: "Oily and combination skin shoppers",
        tone: "Clear and calm",
        visualIntent: "Ingredient-led product education",
      },
      variants: [
        {
          direction: "ingredient-story",
          messageAngle: "Formula",
          eyebrow: "WHAT'S INSIDE",
          headline: "Panthenol + Hyaluronic Acid",
          supportingCopy: product.supportingCopy,
          cta: "Explore formula",
          scenePrompt: "Soft water ripples and translucent ingredient forms",
          factsUsed: [product.detailLine, product.supportingCopy],
        },
        {
          direction: "editorial-detail",
          messageAngle: "Texture",
          eyebrow: product.eyebrow,
          headline: "Lightweight hydration",
          supportingCopy: product.detailLine,
          cta: "See product",
          scenePrompt: "Quiet editorial bathroom shelf with soft daylight",
          factsUsed: [product.eyebrow, product.detailLine],
        },
        {
          direction: "routine-grid",
          messageAngle: "Routine",
          eyebrow: "EVERYDAY CARE",
          headline: "For your routine",
          supportingCopy: product.badges,
          cta: "View routine",
          scenePrompt: "Orderly skincare routine grid with empty product space",
          factsUsed: [product.title, product.badges],
        },
      ],
    },
  });

  assert.equal(plan.source, "cloudflare");
  assert.equal(plan.interpretation.objective, "education");
  assert.equal(plan.variants[0]?.messageAngle, "Formula");
});

test("punctuation-only differences do not count as distinct copy routes", () => {
  const plan = finalizeCreativePlan({
    product,
    brief: "Explain the formula",
    proposedPlan: {
      interpretation: {
        objective: "education",
        audience: "Skincare shoppers",
        tone: "Clear",
        visualIntent: "Formula education",
      },
      variants: ["product-splash", "editorial-detail", "ingredient-story"].map(
        (direction, index) => ({
          direction,
          messageAngle: ["Formula", "Formula.", "FORMULA!"][index],
          eyebrow: "EVERYDAY CARE",
          headline: ["Product details", "Product details.", "PRODUCT DETAILS!"][index],
          supportingCopy: [product.supportingCopy, product.detailLine, product.badges][index],
          cta: "Explore product",
          scenePrompt: "Abstract pale blue surface with open space",
          factsUsed: [product.title, [product.supportingCopy, product.detailLine, product.badges][index]],
        }),
      ),
    },
  });

  assert.equal(plan.source, "fallback");
});
