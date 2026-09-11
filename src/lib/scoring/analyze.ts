import { RULES_BY_ID } from "./rules";
import type { ModelReview } from "./schema";
import type {
  Confidence,
  ReviewDimension,
  ReviewFinding,
  ReviewInput,
  ReviewResult,
  ReviewStatus,
  ReviewVerdict,
} from "./types";

type LocalMatch = {
  ruleId: string;
  pattern: RegExp;
  whatIsOff: string;
  whyItMatters: string;
  replacement?: string;
  confidence?: Confidence;
};

const LOCAL_MATCHES: LocalMatch[] = [
  { ruleId: "P04", pattern: /\b(erase[sd]?|eliminate[sd]?|cures?|guarantee[sd]?|permanent(?:ly)?|100\s*%|zero side effects?)\b/i, whatIsOff: "This is an absolute or guaranteed outcome.", whyItMatters: "A qualification cannot reliably correct an unconditional main promise.", replacement: "Helps target the visible concern with consistent use." },
  { ruleId: "P05", pattern: /\b(treats?|heals?|reverses?|kills? bacteria|eczema|psoriasis|dermatitis|melasma|wound(?:s| healing)?)\b/i, whatIsOff: "This may read as a disease-treatment or physiological claim.", whyItMatters: "The wording may exceed the product's approved cosmetic classification.", replacement: "Supports the appearance and comfort of concern-prone skin." },
  { ruleId: "P03", pattern: /\b(dermatologist|doctor|expert|pediatrician|paediatrician)[- ]?(approved|recommended|tested|backed)?\b/i, whatIsOff: "An expert or authority endorsement is being used.", whyItMatters: "The endorsement needs a matching source, scope, permission, and date." },
  { ruleId: "P02", pattern: /(?:\b(?:up to\s+)?\d+(?:\.\d+)?\s*%\s+(?:reduction|less|more|of|subjects?|users?|agree|improvement)|\b(?:reduces?|improves?|increases?)\b[^.\n]{0,45}\b\d+(?:\.\d+)?\s*%|\b(?:in|within|after)\s+\d+\s*(?:hours?|days?|weeks?|months?)\b|\bclinically\s+(?:proven|tested)\b|\b\d+x\s+(?:faster|more|better|stronger)\b)/i, whatIsOff: "This is a numeric, time-bound, clinical, or measurable efficacy claim.", whyItMatters: "The exact wording and conditions must match approved substantiation." },
  { ruleId: "P06", pattern: /\b(before\s*(?:&|and|\/)\s*after|real results?|customer review|testimonial)\b/i, whatIsOff: "The ad presents a result comparison or testimonial.", whyItMatters: "Permission, typicality, timeframe, alterations, and matching product use must be verified." },
  { ruleId: "P08", pattern: /\b(free|cashback|\d+\s*%\s*off|limited[- ]time|buy\s+\d+\s+get\s+\d+)\b/i, whatIsOff: "The promotion may be missing material conditions.", whyItMatters: "Customers need the threshold, validity, exclusions, and redemption route before acting." },
  { ruleId: "T01", pattern: /\b(ugly|disgusting|embarrassing|unacceptable|gross)\b/i, whatIsOff: "The concern is framed in shaming language.", whyItMatters: "Minimalist's tone should inform without judging the customer." },
  { ruleId: "T02", pattern: /\b(dangerous|toxic|scary|warning!|act now before|don't let .* ruin)\b/i, whatIsOff: "The copy uses fear or disproportionate urgency.", whyItMatters: "Fear-based pressure works against an evidence-led, informed choice." },
  { ruleId: "T03", pattern: /(?:!{2,}|[🔥🚨😱]{2,}|\b(miracle|life[- ]changing|magical transformation)\b)/iu, whatIsOff: "The execution relies on hype or pressure.", whyItMatters: "The brand standard calls for calm, specific confidence.", replacement: "State one concrete, supportable product benefit." },
  { ruleId: "L05", pattern: /\b(glow[- ]?up|maximum results?|powerful solution|flawless skin|unlock your beauty)\b/i, whatIsOff: "Generic beauty filler replaces useful product information.", whyItMatters: "Specific product facts are clearer and more credible." },
  { ruleId: "L07", pattern: /\b(buy now or regret|fix your skin now|get flawless now|don't miss your transformation)\b/i, whatIsOff: "The CTA adds pressure or promises a result.", whyItMatters: "A CTA changes the overall claim and should remain factual." },
];

const STATUS_ORDER: Record<ReviewStatus, number> = {
  pass: 0,
  revise: 1,
  evidence_required: 2,
  human_review: 3,
  block: 4,
};

function findingFromMatch(match: LocalMatch, textMatch: RegExpMatchArray, index: number): ReviewFinding {
  const rule = RULES_BY_ID.get(match.ruleId)!;
  return {
    id: `local-${rule.id}-${index}`,
    ruleId: rule.id,
    ruleName: rule.name,
    dimension: rule.dimension,
    status: rule.status,
    severity: rule.severity,
    location: "Visible or supplied ad copy",
    observed: textMatch[0],
    inference: null,
    whatIsOff: match.whatIsOff,
    whyItMatters: match.whyItMatters,
    howToFix: rule.action,
    suggestedReplacement: match.replacement ?? null,
    doneWhen: "The flagged wording is removed or replaced, and any required evidence or specialist approval is attached.",
    confidence: match.confidence ?? "high",
    missingInput: rule.status === "evidence_required" ? "Approved claim wording and substantiation record" : null,
    sourceBasis: rule.sourceBasis,
  };
}

export function analyzeText(input: ReviewInput): ReviewFinding[] {
  const text = [input.knownText, input.postCopy].filter(Boolean).join("\n").trim();
  if (!text) return [];

  const findings = LOCAL_MATCHES.flatMap((matcher, index) => {
    const match = text.match(matcher.pattern);
    return match ? [findingFromMatch(matcher, match, index)] : [];
  });

  if (input.productContext?.url && input.source === "generator") {
    const rule = RULES_BY_ID.get("P11")!;
    findings.push({
      id: "local-P11-product-page",
      ruleId: rule.id,
      ruleName: rule.name,
      dimension: rule.dimension,
      status: rule.status,
      severity: rule.severity,
      location: "Product-page-derived ad copy",
      observed: text.slice(0, 180),
      inference: "The generator used a public product page, but this prototype has no internal approved-claims registry.",
      whatIsOff: "Publication on a product page does not prove approval for this ad wording and channel.",
      whyItMatters: "Shortening or recombining copy can remove the population, timeframe, method, or qualification.",
      howToFix: rule.action,
      suggestedReplacement: null,
      doneWhen: "Each factual benefit line is linked to an approved ad-channel claim record with the same scope and qualifiers.",
      confidence: "high",
      missingInput: "Internal approved-claims registry and substantiation mapping",
      sourceBasis: rule.sourceBasis,
    });
  }

  return findings;
}

function normalizeModelFindings(model: ModelReview): ReviewFinding[] {
  return model.findings.flatMap((finding, index) => {
    const rule = RULES_BY_ID.get(finding.ruleId.toUpperCase());
    if (!rule) return [];
    return [{
      id: `vision-${rule.id}-${index}`,
      ruleId: rule.id,
      ruleName: rule.name,
      dimension: rule.dimension,
      status: rule.status,
      severity: rule.severity,
      location: finding.location,
      observed: finding.observed,
      inference: finding.inference,
      whatIsOff: finding.whatIsOff,
      whyItMatters: finding.whyItMatters,
      howToFix: finding.howToFix || rule.action,
      suggestedReplacement: finding.suggestedReplacement,
      doneWhen: finding.doneWhen,
      confidence: finding.confidence,
      missingInput: finding.missingInput,
      sourceBasis: rule.sourceBasis,
    }];
  });
}

function dedupeFindings(findings: ReviewFinding[]) {
  const seen = new Set<string>();
  return findings.filter((finding) => {
    const key = `${finding.ruleId}:${finding.observed.trim().toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function strongestStatus(statuses: ReviewStatus[]): ReviewStatus {
  return statuses.reduce<ReviewStatus>((strongest, status) =>
    STATUS_ORDER[status] > STATUS_ORDER[strongest] ? status : strongest, "pass");
}

function verdictFor(status: ReviewStatus): ReviewVerdict {
  if (status === "block") return "do_not_publish";
  if (status === "human_review") return "human_review";
  if (status === "evidence_required") return "evidence_required";
  if (status === "revise") return "revise";
  return "ready_for_reviewer_approval";
}

const VERDICT_SUMMARIES: Record<ReviewVerdict, string> = {
  do_not_publish: "Do not publish yet. Resolve the critical finding first.",
  human_review: "A specialist decision or missing visual review is required before publication.",
  evidence_required: "The creative needs claim evidence or an approved claim match before publication.",
  revise: "Revise the flagged copy or execution, then score the updated creative again.",
  ready_for_reviewer_approval: "No issue was detected by this prototype. It is ready for final reviewer approval—not automatically approved.",
};

export function assembleReview(
  input: ReviewInput,
  model: ModelReview | null,
  modelError?: string,
): ReviewResult {
  const local = analyzeText(input);
  const vision = model ? normalizeModelFindings(model) : [];
  const limitations: string[] = [];
  let findings = dedupeFindings([...local, ...vision]);

  if (!model && input.imageDataUrl) {
    findings.push({
      id: "input-visual-review",
      ruleId: "INPUT",
      ruleName: "Visual review unavailable",
      dimension: "policy",
      status: "human_review",
      severity: "high",
      location: "Uploaded creative",
      observed: "The image was received, but no vision model was available to read it.",
      inference: null,
      whatIsOff: "Visual copy, disclaimer legibility, layout, and asset integrity have not been assessed.",
      whyItMatters: "A text-only check cannot safely clear an image ad.",
      howToFix: "Configure GEMINI_API_KEY and rescore, or paste all visible copy and complete a manual visual review.",
      suggestedReplacement: null,
      doneWhen: "The image has been read by the vision scorer or signed off by a human reviewer.",
      confidence: "high",
      missingInput: "Vision analysis",
      sourceBasis: "Scorer input-quality safeguard",
    });
    limitations.push(modelError ?? "Gemini vision is not configured; only supplied text was checked.");
  }

  if (!input.imageDataUrl) {
    limitations.push("No ad image was supplied; visual hierarchy, disclaimer legibility, and asset integrity were not assessed.");
  }

  const dimensions = (["policy", "tone", "language"] as ReviewDimension[]).reduce(
    (result, dimension) => {
      result[dimension] = strongestStatus(findings.filter((finding) => finding.dimension === dimension).map((finding) => finding.status));
      return result;
    },
    { policy: "pass", tone: "pass", language: "pass" } as Record<ReviewDimension, ReviewStatus>,
  );
  const overallStatus = strongestStatus(Object.values(dimensions));
  const verdict = verdictFor(overallStatus);
  const checklist = model?.resubmissionChecklist ?? [];
  const actionableChecklist = findings.slice(0, 5).map((finding) => finding.doneWhen);

  return {
    verdict,
    summary: VERDICT_SUMMARIES[verdict],
    dimensions,
    extractedText: model?.extractedText || [input.knownText, input.postCopy].filter(Boolean).join("\n"),
    visualObservations: model?.visualObservations ?? [],
    findings,
    revisedCopy: model?.revisedCopy ?? null,
    resubmissionChecklist: [...new Set([...actionableChecklist, ...checklist])].slice(0, 7),
    engine: model ? "gemini+rules" : "rules-only",
    limitations,
  };
}
