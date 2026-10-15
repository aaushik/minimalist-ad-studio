import "server-only";

import { assembleReview } from "./analyze";
import type { ReviewInput, ReviewResult } from "./types";

export async function reviewAd(input: ReviewInput): Promise<ReviewResult> {
  return assembleReview(input, null);
}

