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

function isDailyQuotaError(error: unknown) {
  return (
    error instanceof Error &&
    /daily free allocation|10,?000 neurons|used up[^.]*neurons/i.test(error.message)
  );
}

async function makeBackground(
  variant: PlannedVariant,
  services: CreativeGenerationServices,
): Promise<{ dataUrl?: string; warning?: string }> {
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const dataUrl = await services.generateScene(variant, attempt);
      if (await services.reviewScene(dataUrl, variant)) return { dataUrl };
    } catch (error) {
      if (isDailyQuotaError(error)) {
        return { warning: "cloudflare-daily-quota" };
      }
      // A second attempt may recover from a transient generation or review failure.
    }
  }

  return {
    warning: `${variant.directionLabel} uses its designed background because a generated scene was unavailable or did not pass review.`,
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
  let activeServices = services;

  if (activeServices) {
    try {
      proposedPlan = await activeServices.proposePlan(product, brief);
    } catch (error) {
      if (isDailyQuotaError(error)) {
        warnings.push(
          "The daily Cloudflare quota is exhausted. Page-supported copy and designed backgrounds will be used until it resets at 00:00 UTC.",
        );
        activeServices = null;
      } else {
        warnings.push("Cloudflare copy was unavailable, so page-supported copy variants were used.");
      }
    }
  } else {
    warnings.push("Cloudflare is not configured, so safe copy and background fallbacks were used.");
  }

  const plan = finalizeCreativePlan({ product, brief, proposedPlan });
  if (activeServices && plan.source === "fallback" && warnings.length === 0) {
    warnings.push("The generated copy did not pass factual checks, so page-supported copy variants were used.");
  }

  const backgrounds: Array<{ dataUrl?: string; warning?: string }> = activeServices
    ? await Promise.all(plan.variants.map((variant) => makeBackground(variant, activeServices)))
    : plan.variants.map(() => ({}));

  if (backgrounds.some((background) => background.warning === "cloudflare-daily-quota")) {
    warnings.push(
      "The daily Cloudflare quota is exhausted. Designed backgrounds will be used until it resets at 00:00 UTC.",
    );
  }

  const variants: CreativeVariant[] = plan.variants.map((variant, index) => {
    const background = backgrounds[index] ?? {};
    if (background.warning && background.warning !== "cloudflare-daily-quota") {
      warnings.push(background.warning);
    }

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
