export const REVIEW_STATUSES = [
  "pass",
  "revise",
  "evidence_required",
  "human_review",
  "block",
] as const;

export type ReviewStatus = (typeof REVIEW_STATUSES)[number];
export const REVIEW_DIMENSIONS = ["policy", "tone", "language"] as const;
export type ReviewDimension = (typeof REVIEW_DIMENSIONS)[number];
export type Severity = "low" | "medium" | "high" | "critical";
export type Confidence = "low" | "medium" | "high";

export const BRAND_ASSESSMENT_STATUSES = ["minimalist", "unclear", "other_brand"] as const;
export type BrandAssessmentStatus = (typeof BRAND_ASSESSMENT_STATUSES)[number];

export type BrandAssessment = {
  status: BrandAssessmentStatus;
  detectedBrand: string | null;
  explanation: string;
  confidence: Confidence;
};

export type ProductContext = {
  title?: string;
  url?: string;
  description?: string;
};

export type ReviewInput = {
  source: "upload" | "generator";
  imageDataUrl?: string;
  postCopy?: string;
  knownText?: string;
  productContext?: ProductContext;
};

export type ReviewFinding = {
  id: string;
  ruleId: string;
  ruleName: string;
  dimension: ReviewDimension;
  status: Exclude<ReviewStatus, "pass">;
  severity: Severity;
  location: string;
  observed: string;
  inference: string | null;
  whatIsOff: string;
  whyItMatters: string;
  howToFix: string;
  suggestedReplacement: string | null;
  doneWhen: string;
  confidence: Confidence;
  missingInput: string | null;
  sourceBasis: string;
};

export type ReviewVerdict =
  | "ready_for_reviewer_approval"
  | "revise"
  | "evidence_required"
  | "human_review"
  | "do_not_publish";

export type DimensionScore = {
  score: 1 | 2 | 3 | 4 | 5;
  explanation: string;
  action: string;
  ruleIds: string[];
};

type ReviewResultBase = {
  brandAssessment: BrandAssessment;
  summary: string;
  extractedText: string;
  visualObservations: string[];
  findings: ReviewFinding[];
  revisedCopy: string | null;
  resubmissionChecklist: string[];
  engine: "gemini+rules" | "rules-only";
  limitations: string[];
};

export type ScoredReviewResult = ReviewResultBase & {
  scoringApplicable: true;
  verdict: ReviewVerdict;
  dimensions: Record<ReviewDimension, ReviewStatus>;
  dimensionScores: Record<ReviewDimension, DimensionScore>;
};

export type OutOfScopeReviewResult = ReviewResultBase & {
  scoringApplicable: false;
  verdict: "not_applicable";
  dimensions: null;
  dimensionScores: null;
};

export type ReviewResult = ScoredReviewResult | OutOfScopeReviewResult;
