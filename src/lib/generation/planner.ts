import type { ProductCreative } from "../product";
import {
  DIRECTION_IDS,
  type AdObjective,
  type BriefInterpretation,
  type CreativePlan,
  type DirectionId,
  type ProposedCreativePlan,
  type ProposedVariant,
} from "./types";

const DIRECTION_LABELS: Record<DirectionId, string> = {
  "product-splash": "Product splash",
  "editorial-detail": "Editorial detail",
  "ingredient-story": "Ingredient story",
  "routine-grid": "Routine grid",
  "commerce-focus": "Commerce focus",
};

const DIRECTIONS_BY_OBJECTIVE: Record<AdObjective, DirectionId[]> = {
  awareness: ["product-splash", "editorial-detail", "ingredient-story"],
  education: ["ingredient-story", "editorial-detail", "routine-grid"],
  sales: ["commerce-focus", "product-splash", "editorial-detail"],
  retargeting: ["product-splash", "commerce-focus", "routine-grid"],
};

const RISKY_CLAIMS =
  /\b(cure[sd]?|guarantee[sd]?|permanent(?:ly)?|clinically proven|dermatologist approved|doctor approved|instant results?|miracle|risk[- ]free)\b/i;

const SAFE_FRAMING_WORDS = new Set([
  "a", "an", "and", "another", "at", "buy", "care", "closer", "consider", "daily",
  "discover", "details", "everyday", "explore", "for", "formula", "get", "inside",
  "learn", "look", "meet", "more", "now", "of", "product", "return", "review",
  "routine", "see", "shop", "simple", "skin", "skincare", "started", "take", "that", "the",
  "this", "to", "view", "what", "whats", "why", "with", "your",
]);

const LIMITS = {
  messageAngle: 42,
  eyebrow: 38,
  headline: 72,
  supportingCopy: 165,
  cta: 28,
  scenePrompt: 360,
};

function nonEmpty(value: unknown, maxLength: number): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= maxLength;
}

function inferObjective(brief: string): AdObjective {
  if (/\b(retarget|remarket|revisit|remind|considering|cart|came back|returning)\b/i.test(brief)) {
    return "retargeting";
  }
  if (/\b(sale|sales|purchase|purchases|buy|shop|price|offer|conversion|convert|cta)\b/i.test(brief)) {
    return "sales";
  }
  if (/\b(awareness|discover|discovery|introduce|introduction|launch)\b/i.test(brief)) {
    return "awareness";
  }
  if (/\b(educat|explain|ingredient|formula|science|how|routine|benefit)\b/i.test(brief)) {
    return "education";
  }
  return "awareness";
}

function fallbackInterpretation(brief: string): BriefInterpretation {
  const objective = inferObjective(brief);
  return {
    objective,
    audience:
      objective === "retargeting"
        ? "People who have already considered the product"
        : objective === "sales"
          ? "Skincare shoppers comparing products"
          : "People discovering the product",
    tone: /\b(bold|energetic|bright)\b/i.test(brief) ? "Bold and direct" : "Clear and considered",
    visualIntent: brief.trim().slice(0, 180) || "Clean, product-led skincare creative",
  };
}

export function getProductFacts(product: ProductCreative) {
  return [
    product.title,
    product.eyebrow,
    product.headline.replaceAll("\n", " "),
    product.supportingCopy,
    product.badges,
    product.detailLine,
    product.price,
    product.compareAtPrice,
    product.size,
  ].filter((value): value is string => Boolean(value?.trim()));
}

function normalized(value: string) {
  return value
    .toLocaleLowerCase()
    .replaceAll(/[^\p{L}\p{N}]+/gu, " ")
    .replaceAll(/\s+/g, " ")
    .trim();
}

function numericalTokens(value: string) {
  return value.match(/\d+(?:[.,]\d+)?%?|₹\s?\d+(?:[.,]\d+)?/g) ?? [];
}

function wordTokens(value: string) {
  return value.toLocaleLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
}

function framingCopyIsGrounded(value: string, sourceWords: Set<string>) {
  return wordTokens(value).every(
    (word) => word.length <= 2 || sourceWords.has(word) || SAFE_FRAMING_WORDS.has(word),
  );
}

function headlineIsGrounded(value: string, facts: string[]) {
  const headline = normalized(value);
  const normalizedFacts = facts.map(normalized);
  if (normalizedFacts.some((fact) => fact.includes(headline))) return true;

  const genericHeadlines = new Set([
    "a closer look",
    "everyday care",
    "for your routine",
    "inside the formula",
    "product details",
    "shop the product",
    "take another look",
  ]);
  if (genericHeadlines.has(headline)) return true;

  const factualPrefixes = ["a closer look at ", "discover ", "explore ", "meet "];
  return factualPrefixes.some((prefix) => {
    if (!headline.startsWith(prefix)) return false;
    const remainder = headline.slice(prefix.length);
    return normalizedFacts.some((fact) => fact === remainder);
  });
}

function proposedPlanIsSafe(product: ProductCreative, plan: unknown): plan is ProposedCreativePlan {
  if (!plan || typeof plan !== "object") return false;
  const candidate = plan as ProposedCreativePlan;
  const interpretation = candidate.interpretation;
  if (
    !interpretation ||
    !["awareness", "education", "sales", "retargeting"].includes(interpretation.objective) ||
    !nonEmpty(interpretation.audience, 120) ||
    !nonEmpty(interpretation.tone, 80) ||
    !nonEmpty(interpretation.visualIntent, 220) ||
    !Array.isArray(candidate.variants) ||
    candidate.variants.length !== 3
  ) {
    return false;
  }

  const facts = getProductFacts(product);
  const normalizedFacts = new Set(facts.map(normalized));
  const sourceWords = new Set(wordTokens(facts.join(" ")));
  const sourceCorpus = facts.join(" ");
  const sourceNumbers = new Set(numericalTokens(sourceCorpus));
  const directions = new Set<string>();
  const headlines = new Set<string>();
  const supportingLines = new Set<string>();
  const messageAngles = new Set<string>();

  for (const variant of candidate.variants) {
    if (
      !variant ||
      !DIRECTION_IDS.includes(variant.direction) ||
      !nonEmpty(variant.messageAngle, LIMITS.messageAngle) ||
      !nonEmpty(variant.eyebrow, LIMITS.eyebrow) ||
      !nonEmpty(variant.headline, LIMITS.headline) ||
      !nonEmpty(variant.supportingCopy, LIMITS.supportingCopy) ||
      !nonEmpty(variant.cta, LIMITS.cta) ||
      !nonEmpty(variant.scenePrompt, LIMITS.scenePrompt) ||
      !Array.isArray(variant.factsUsed) ||
      variant.factsUsed.length === 0 ||
      variant.factsUsed.some(
        (fact) => typeof fact !== "string" || !normalizedFacts.has(normalized(fact)),
      )
    ) {
      return false;
    }

    const copy = [variant.eyebrow, variant.headline, variant.supportingCopy, variant.cta].join(" ");
    if (RISKY_CLAIMS.test(copy)) return false;
    if (numericalTokens(copy).some((token) => !sourceNumbers.has(token))) return false;
    if (!normalizedFacts.has(normalized(variant.supportingCopy))) return false;
    if (!framingCopyIsGrounded(variant.eyebrow, sourceWords)) return false;
    if (!headlineIsGrounded(variant.headline, facts)) return false;
    if (!framingCopyIsGrounded(variant.cta, sourceWords)) return false;

    directions.add(variant.direction);
    headlines.add(normalized(variant.headline));
    supportingLines.add(normalized(variant.supportingCopy));
    messageAngles.add(normalized(variant.messageAngle));
  }

  return (
    directions.size === 3 &&
    headlines.size === 3 &&
    supportingLines.size === 3 &&
    messageAngles.size === 3
  );
}

function safeLine(value: string | undefined, fallback: string) {
  const trimmed = value?.trim();
  return trimmed || fallback;
}

function clip(value: string, maxLength: number) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1).trimEnd()}…`;
}

function makeFallbackVariants(product: ProductCreative, objective: AdObjective): ProposedVariant[] {
  const directions = DIRECTIONS_BY_OBJECTIVE[objective];
  const title = safeLine(product.title, "Minimalist skincare");
  const pageCopy = safeLine(product.supportingCopy, `Explore ${title}.`);
  const formula = safeLine(product.detailLine, title);
  const commerceLine = [title, product.size, product.price].filter(Boolean).join(" · ");
  const copySets: Record<AdObjective, Array<Pick<ProposedVariant, "messageAngle" | "eyebrow" | "headline" | "supportingCopy" | "cta" | "factsUsed">>> = {
    awareness: [
      { messageAngle: "Product introduction", eyebrow: product.eyebrow || "MEET THE PRODUCT", headline: title, supportingCopy: pageCopy, cta: "Discover product", factsUsed: [title, pageCopy] },
      { messageAngle: "Editorial product detail", eyebrow: "A CLOSER LOOK", headline: product.headline || `Meet ${title}`, supportingCopy: `${formula}.`, cta: "Explore details", factsUsed: [formula, title] },
      { messageAngle: "Formula story", eyebrow: "INSIDE THE FORMULA", headline: formula, supportingCopy: commerceLine, cta: "View product", factsUsed: [formula, title, ...[product.size, product.price].filter(Boolean)] },
    ],
    education: [
      { messageAngle: "Formula", eyebrow: "INSIDE THE FORMULA", headline: formula, supportingCopy: pageCopy, cta: "Explore formula", factsUsed: [formula, pageCopy] },
      { messageAngle: "Product details", eyebrow: product.eyebrow || "PRODUCT DETAILS", headline: product.headline || title, supportingCopy: `${formula}.`, cta: "See details", factsUsed: [formula, title] },
      { messageAngle: "Routine placement", eyebrow: "EVERYDAY ROUTINE", headline: `Meet ${title}`, supportingCopy: commerceLine, cta: "View routine", factsUsed: [title, ...[product.size, product.price].filter(Boolean)] },
    ],
    sales: [
      { messageAngle: "Clear purchase choice", eyebrow: "SHOP THE PRODUCT", headline: title, supportingCopy: commerceLine, cta: "Shop now", factsUsed: [title, ...[product.size, product.price].filter(Boolean)] },
      { messageAngle: "Benefit-led product", eyebrow: product.eyebrow || "MINIMALIST SKINCARE", headline: product.headline || `Explore ${title}`, supportingCopy: pageCopy, cta: "View product", factsUsed: [title, pageCopy] },
      { messageAngle: "Considered detail", eyebrow: "WHY THIS PRODUCT", headline: formula, supportingCopy: `${title} · ${product.price}`.replace(/ · $/, ""), cta: "Explore details", factsUsed: [formula, title, ...[product.price].filter(Boolean)] },
    ],
    retargeting: [
      { messageAngle: "Product reminder", eyebrow: "TAKE ANOTHER LOOK", headline: title, supportingCopy: pageCopy, cta: "Return to product", factsUsed: [title, pageCopy] },
      { messageAngle: "Decision support", eyebrow: "PRODUCT DETAILS", headline: product.headline || `Consider ${title}`, supportingCopy: commerceLine, cta: "Review product", factsUsed: [title, ...[product.size, product.price].filter(Boolean)] },
      { messageAngle: "Routine reminder", eyebrow: "FOR YOUR ROUTINE", headline: formula, supportingCopy: `${title}.`, cta: "View details", factsUsed: [formula, title] },
    ],
  };

  const scenePrompts: Record<DirectionId, string> = {
    "product-splash": "Abstract water arcs and translucent blue forms, open central product area, no objects, no packaging, no words",
    "editorial-detail": "Soft editorial daylight and architectural shadows, pale mineral surface, open product area, no objects, no packaging, no words",
    "ingredient-story": "Macro translucent liquid textures and soft botanical color fields, open product area, no objects, no packaging, no words",
    "routine-grid": "Orderly geometric skincare routine backdrop with empty panels, warm daylight, no objects, no packaging, no words",
    "commerce-focus": "Clean high-contrast retail stage with soft blue gradient and empty product pedestal, no objects, no packaging, no words",
  };

  const variants = directions.map((direction, index) => ({
    direction,
    ...copySets[objective][index]!,
    scenePrompt: scenePrompts[direction],
  }));

  const usedHeadlines = new Set<string>();
  const usedSupportingLines = new Set<string>();
  const alternateHeadlines = ["Meet the product", "A closer look", "Inside the formula"];
  const supportingPrefixes = ["Product introduction: ", "Formula detail: ", "Product details: "];

  return variants.map((variant, index) => {
    let headline = clip(variant.headline, LIMITS.headline);
    if (usedHeadlines.has(normalized(headline))) headline = alternateHeadlines[index]!;
    usedHeadlines.add(normalized(headline));

    let supportingCopy = clip(variant.supportingCopy, LIMITS.supportingCopy);
    if (usedSupportingLines.has(normalized(supportingCopy))) {
      const prefix = supportingPrefixes[index]!;
      supportingCopy = `${prefix}${supportingCopy.slice(0, LIMITS.supportingCopy - prefix.length)}`;
    }
    usedSupportingLines.add(normalized(supportingCopy));

    return {
      ...variant,
      eyebrow: clip(variant.eyebrow, LIMITS.eyebrow),
      headline,
      supportingCopy,
      cta: clip(variant.cta, LIMITS.cta),
    };
  });
}

function toPlan(
  interpretation: BriefInterpretation,
  variants: ProposedVariant[],
  source: CreativePlan["source"],
): CreativePlan {
  return {
    interpretation,
    source,
    variants: variants.map((variant, index) => ({
      ...variant,
      id: `variant-${index + 1}`,
      directionLabel: DIRECTION_LABELS[variant.direction],
    })),
  };
}

export function finalizeCreativePlan({
  product,
  brief,
  proposedPlan,
}: {
  product: ProductCreative;
  brief: string;
  proposedPlan?: unknown;
}): CreativePlan {
  if (proposedPlanIsSafe(product, proposedPlan)) {
    return toPlan(proposedPlan.interpretation, proposedPlan.variants, "cloudflare");
  }

  const interpretation = fallbackInterpretation(brief);
  return toPlan(
    interpretation,
    makeFallbackVariants(product, interpretation.objective),
    "fallback",
  );
}
