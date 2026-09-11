import type { ReviewDimension, ReviewStatus, Severity } from "./types";

export type ScoringRule = {
  id: string;
  name: string;
  dimension: ReviewDimension;
  status: Exclude<ReviewStatus, "pass">;
  severity: Severity;
  trigger: string;
  action: string;
  sourceBasis: string;
};

const ASCI = "ASCI Code, Chapter I and disclaimer guidance";
const CORPUS = "Minimalist product-page validation (22 pages) and current Meta ad corpus";
const BRAND = "Minimalist About/Values, product pages, and current Meta ad corpus";

export const SCORING_RULES: ScoringRule[] = [
  { id: "P01", name: "Product accuracy", dimension: "policy", status: "block", severity: "critical", trigger: "Product identity, concentration, use, warning, or pack conflicts with the approved record.", action: "Correct the ad or selected product; confirm against the canonical SKU record.", sourceBasis: `${ASCI}; ${CORPUS}; internal product record required` },
  { id: "P02", name: "Objective claim substantiation", dimension: "policy", status: "evidence_required", severity: "high", trigger: "A numeric, percentage, time-bound, clinical, comparative, or measurable efficacy claim appears.", action: "Match the exact wording, population, method, outcome, and timeframe to an approved substantiation record.", sourceBasis: `${ASCI}; ${CORPUS}` },
  { id: "P03", name: "Authority endorsement", dimension: "policy", status: "evidence_required", severity: "high", trigger: "A dermatologist, doctor, expert, lab, or other authority endorsement appears.", action: "Attach the relevant test, survey, permission, approval scope, and date.", sourceBasis: `${ASCI}; ${CORPUS}` },
  { id: "P04", name: "Absolute promise", dimension: "policy", status: "block", severity: "critical", trigger: "The ad promises a cure, guarantee, erasure, elimination, 100% outcome, permanent or inevitable transformation.", action: "Remove the absolute promise and use an approved, calibrated benefit claim; a footnote alone is not enough.", sourceBasis: `${ASCI}; ${CORPUS}` },
  { id: "P05", name: "Product classification", dimension: "policy", status: "human_review", severity: "critical", trigger: "Wording may imply disease treatment, physiological alteration, healing, or a drug-like effect.", action: "Route the exact wording to regulatory/legal against the product classification and approved claim set.", sourceBasis: `Cosmetics Rules, Rule 36; ${CORPUS}` },
  { id: "P06", name: "Result image or testimonial", dimension: "policy", status: "evidence_required", severity: "high", trigger: "A before/after image, consumer result, review, or testimonial appears.", action: "Verify permission, source, timeframe, typicality, alterations, and matching product use.", sourceBasis: `${ASCI}; ${CORPUS}` },
  { id: "P07", name: "Disclaimer adequacy", dimension: "policy", status: "revise", severity: "high", trigger: "A needed disclaimer is absent, unreadable, detached, or contradicts the main claim.", action: "Make the qualification legible and proximate; weaken the main claim when a disclaimer cannot cure it.", sourceBasis: `${ASCI}; ${CORPUS}` },
  { id: "P08", name: "Offer conditions", dimension: "policy", status: "revise", severity: "medium", trigger: "A free item, cashback, discount, or limited-time promotion omits material eligibility or conditions.", action: "Add the threshold, code, dates, exclusions, and a clear proximate route to full terms.", sourceBasis: `ASCI disclaimer guidance; Consumer Protection context; ${CORPUS}` },
  { id: "P09", name: "Missing approved claim", dimension: "policy", status: "evidence_required", severity: "high", trigger: "A factual product claim has no matching approved claim record.", action: "Route the claim to the claims owner; do not infer approval from publication on another surface.", sourceBasis: `${ASCI}; internal claim registry required` },
  { id: "P10", name: "Asset integrity", dimension: "policy", status: "block", severity: "critical", trigger: "The product, packaging, result, or ingredient label appears fabricated or materially altered.", action: "Replace it with an approved asset or obtain explicit review of the alteration.", sourceBasis: `${ASCI}; product-accuracy dependency` },
  { id: "P11", name: "Source-context transfer", dimension: "policy", status: "evidence_required", severity: "high", trigger: "A claim is adapted from a page, pack, testimonial, or study without an approved ad-channel mapping.", action: "Match the ad wording, scope, qualifiers, geography, and channel to an approved claim and evidence record.", sourceBasis: `${ASCI}; ${CORPUS}` },
  { id: "T01", name: "Respect, not shame", dimension: "tone", status: "revise", severity: "high", trigger: "Normal skin or hair is framed as ugly, unacceptable, embarrassing, or the customer's fault.", action: "Name the concern neutrally and preserve the customer's agency.", sourceBasis: BRAND },
  { id: "T02", name: "Inform, not frighten", dimension: "tone", status: "revise", severity: "high", trigger: "The copy escalates danger, anxiety, or urgency beyond the evidence.", action: "State the concern and trade-off proportionately, without fear-based pressure.", sourceBasis: BRAND },
  { id: "T03", name: "Calm confidence", dimension: "tone", status: "revise", severity: "medium", trigger: "Miracle language, transformation theatre, repeated exclamation marks, or emoji pressure dominates.", action: "Replace hype with one specific, direct and supportable benefit.", sourceBasis: BRAND },
  { id: "T04", name: "Transparent expectations", dimension: "tone", status: "revise", severity: "high", trigger: "The copy implies certainty, universality, or instant success.", action: "Use calibrated wording and state material limits, population, and timeframe.", sourceBasis: `${BRAND}; ${ASCI}` },
  { id: "T05", name: "Science as explanation", dimension: "tone", status: "revise", severity: "medium", trigger: "Science or expert language is used as an authority badge without explaining relevance.", action: "Connect the ingredient, formulation, or test to an understandable function and approved benefit.", sourceBasis: BRAND },
  { id: "T06", name: "Promotion without manipulation", dimension: "tone", status: "revise", severity: "medium", trigger: "Artificial scarcity, hidden conditions, or emotional pressure dominates an offer.", action: "Present the offer and its real conditions factually.", sourceBasis: `${BRAND}; ${ASCI}` },
  { id: "L01", name: "Exact product identity", dimension: "language", status: "revise", severity: "high", trigger: "The name or concentration is generic, inconsistent, inferred, or not a registered alias.", action: "Use the canonical product name and concentration from the product record.", sourceBasis: `${CORPUS}; internal SKU record required` },
  { id: "L02", name: "Evidence-matched efficacy verbs", dimension: "language", status: "revise", severity: "high", trigger: "The benefit verb is stronger than its approved evidence or implies transformation.", action: "Use the exact approved verb; where permitted, prefer calibrated language such as helps, supports, or targets.", sourceBasis: `${CORPUS}; ${ASCI}` },
  { id: "L03", name: "Explanatory structure", dimension: "language", status: "revise", severity: "medium", trigger: "Ingredients or science terms appear without an understandable and supportable link to the benefit.", action: "Use ingredient/formulation → relevant function → expected benefit, after policy checks.", sourceBasis: BRAND },
  { id: "L04", name: "Claim completeness", dimension: "language", status: "revise", severity: "high", trigger: "A number or timeframe is detached from its basis, population, qualification, or source marker.", action: "Keep the material basis, population, timeframe, and qualification with the claim.", sourceBasis: `${CORPUS}; ${ASCI}` },
  { id: "L05", name: "Specificity over filler", dimension: "language", status: "revise", severity: "low", trigger: "Generic beauty filler replaces a concrete concern, formulation fact, use, or approved benefit.", action: "Replace the cliché with a specific, supportable product or usage fact.", sourceBasis: BRAND },
  { id: "L06", name: "Scannable hierarchy", dimension: "language", status: "revise", severity: "medium", trigger: "The ad is repetitive, internally inconsistent, or overloaded.", action: "Prioritise product/concern, supporting reason, qualification, then CTA.", sourceBasis: CORPUS },
  { id: "L07", name: "CTA fit", dimension: "language", status: "revise", severity: "medium", trigger: "The CTA promises a result or applies pressure unsupported by the offer.", action: "Use a direct factual action such as Explore product, Shop now, or Build your routine.", sourceBasis: `${CORPUS}; ${BRAND}` },
];

export const RULES_BY_ID = new Map(SCORING_RULES.map((rule) => [rule.id, rule]));

