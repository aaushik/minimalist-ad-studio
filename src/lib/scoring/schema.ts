import { z } from "zod";
import { BRAND_ASSESSMENT_STATUSES } from "./types";

export const modelFindingSchema = z.object({
  ruleId: z.string(),
  location: z.string(),
  observed: z.string(),
  inference: z.string().nullable(),
  whatIsOff: z.string(),
  whyItMatters: z.string(),
  howToFix: z.string(),
  suggestedReplacement: z.string().nullable(),
  doneWhen: z.string(),
  confidence: z.enum(["low", "medium", "high"]),
  missingInput: z.string().nullable(),
});

export const modelReviewSchema = z.object({
  brandAssessment: z.object({
    status: z.enum(BRAND_ASSESSMENT_STATUSES),
    detectedBrand: z.string().nullable(),
    explanation: z.string(),
    confidence: z.enum(["low", "medium", "high"]),
  }),
  extractedText: z.string(),
  visualObservations: z.array(z.string()),
  findings: z.array(modelFindingSchema),
  revisedCopy: z.string().nullable(),
  resubmissionChecklist: z.array(z.string()),
});

export type ModelReview = z.infer<typeof modelReviewSchema>;

export const MODEL_REVIEW_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["brandAssessment", "extractedText", "visualObservations", "findings", "revisedCopy", "resubmissionChecklist"],
  properties: {
    brandAssessment: {
      type: "object",
      additionalProperties: false,
      required: ["status", "detectedBrand", "explanation", "confidence"],
      properties: {
        status: { type: "string", enum: BRAND_ASSESSMENT_STATUSES },
        detectedBrand: { type: ["string", "null"] },
        explanation: { type: "string" },
        confidence: { type: "string", enum: ["low", "medium", "high"] },
      },
    },
    extractedText: { type: "string" },
    visualObservations: { type: "array", items: { type: "string" } },
    findings: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["ruleId", "location", "observed", "inference", "whatIsOff", "whyItMatters", "howToFix", "suggestedReplacement", "doneWhen", "confidence", "missingInput"],
        properties: {
          ruleId: { type: "string" },
          location: { type: "string" },
          observed: { type: "string" },
          inference: { type: ["string", "null"] },
          whatIsOff: { type: "string" },
          whyItMatters: { type: "string" },
          howToFix: { type: "string" },
          suggestedReplacement: { type: ["string", "null"] },
          doneWhen: { type: "string" },
          confidence: { type: "string", enum: ["low", "medium", "high"] },
          missingInput: { type: ["string", "null"] },
        },
      },
    },
    revisedCopy: { type: ["string", "null"] },
    resubmissionChecklist: { type: "array", items: { type: "string" } },
  },
} as const;
