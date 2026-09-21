import type { ProductCreative } from "../product";
import { finalizeCreativePlan } from "./planner";
import type {
  CreativeVariant,
  GenerationResult,
  PlannedVariant,
  ProposedCreativePlan,
} from "./types";

export type CreativeGenerationServices = {
  proposePlan: (product: ProductCreative, brief: string) => Promise<ProposedCreativePlan | null>;
  generateScene: (variant: PlannedVariant, attempt: number) => Promise<string>;
  reviewScene: (dataUrl: string, variant: PlannedVariant) => Promise<boolean>;
};

async function makeBackground(
  variant: PlannedVariant,
  services: CreativeGenerationServices,
): Promise<{ dataUrl?: string; warning?: string }> {
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const dataUrl = await services.generateScene(variant, attempt);
      if (await services.reviewScene(dataUrl, variant)) return { dataUrl };
    } catch {
      // A second attempt may recover from a transient generation or review failure.
    }
  }

  return {
    warning: `${variant.directionLabel} uses its safe designed background because the generated scene did not pass review.`,
  };
}

export async function generateCreativeSet({
  product,
  brief,
  services,
}: {
  product: ProductCreative;
  brief: string;
  services: CreativeGenerationServices | null;
}): Promise<GenerationResult> {
  const warnings: string[] = [];
  let proposedPlan: ProposedCreativePlan | null = null;

  if (services) {
    try {
      proposedPlan = await services.proposePlan(product, brief);
    } catch {
      warnings.push("Cloudflare copy was unavailable, so page-supported copy variants were used.");
    }
  } else {
    warnings.push("Cloudflare is not configured, so safe copy and background fallbacks were used.");
  }

  const plan = finalizeCreativePlan({ product, brief, proposedPlan });
  if (services && plan.source === "fallback" && warnings.length === 0) {
    warnings.push("The generated copy did not pass factual checks, so page-supported copy variants were used.");
  }

  const backgrounds: Array<{ dataUrl?: string; warning?: string }> = services
    ? await Promise.all(plan.variants.map((variant) => makeBackground(variant, services)))
    : plan.variants.map(() => ({}));

  const variants: CreativeVariant[] = plan.variants.map((variant, index) => {
    const background = backgrounds[index] ?? {};
    if (background.warning) warnings.push(background.warning);

    return {
      ...variant,
      creative: {
        ...product,
        eyebrow: variant.eyebrow,
        headline: variant.headline,
        supportingCopy: variant.supportingCopy,
        cta: variant.cta,
      },
      backgroundDataUrl: background.dataUrl,
      backgroundSource: background.dataUrl ? "cloudflare" : "fallback",
    };
  });

  return {
    product,
    interpretation: plan.interpretation,
    variants,
    warnings,
  };
}
