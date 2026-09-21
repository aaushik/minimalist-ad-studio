import type { ProductCreative } from "../product";

export const DIRECTION_IDS = [
  "product-splash",
  "editorial-detail",
  "ingredient-story",
  "routine-grid",
  "commerce-focus",
] as const;

export type DirectionId = (typeof DIRECTION_IDS)[number];
export type AdObjective = "awareness" | "education" | "sales" | "retargeting";

export type BriefInterpretation = {
  objective: AdObjective;
  audience: string;
  tone: string;
  visualIntent: string;
};

export type ProposedVariant = {
  direction: DirectionId;
  messageAngle: string;
  eyebrow: string;
  headline: string;
  supportingCopy: string;
  cta: string;
  scenePrompt: string;
  factsUsed: string[];
};

export type ProposedCreativePlan = {
  interpretation: BriefInterpretation;
  variants: ProposedVariant[];
};

export type PlannedVariant = ProposedVariant & {
  id: string;
  directionLabel: string;
};

export type CreativePlan = {
  interpretation: BriefInterpretation;
  variants: PlannedVariant[];
  source: "cloudflare" | "fallback";
};

export type CreativeVariant = PlannedVariant & {
  creative: ProductCreative;
  backgroundDataUrl?: string;
  backgroundSource: "cloudflare" | "fallback";
};

export type GenerationResult = {
  product: ProductCreative;
  interpretation: BriefInterpretation;
  variants: CreativeVariant[];
  warnings: string[];
};

