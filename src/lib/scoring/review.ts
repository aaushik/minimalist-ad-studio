import "server-only";

import { assembleReview } from "./analyze";
import { reviewWithGemini } from "./gemini";
import type { ReviewInput, ReviewResult } from "./types";

export async function reviewAd(input: ReviewInput): Promise<ReviewResult> {
  try {
    const modelReview = await reviewWithGemini(input);
    return assembleReview(input, modelReview);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Vision review failed.";
    return assembleReview(input, null, `Gemini vision was unavailable: ${message}`);
  }
}

