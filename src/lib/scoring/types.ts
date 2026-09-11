export const REVIEW_STATUSES = [
  "pass",
  "revise",
  "evidence_required",
  "human_review",
  "block",
] as const;

export type ReviewStatus = (typeof REVIEW_STATUSES)[number];
export type ReviewDimension = "policy" | "tone" | "language";
export type Severity = "low" | "medium" | "high" | "critical";
export type Confidence = "low" | "medium" | "high";

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

export type ReviewResult = {
  verdict: ReviewVerdict;
  summary: string;
  dimensions: Record<ReviewDimension, ReviewStatus>;
  extractedText: string;
  visualObservations: string[];
  findings: ReviewFinding[];
  revisedCopy: string | null;
  resubmissionChecklist: string[];
  engine: "gemini+rules" | "rules-only";
  limitations: string[];
};

