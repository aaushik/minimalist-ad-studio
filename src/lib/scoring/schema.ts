import { z } from "zod";

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
  required: ["extractedText", "visualObservations", "findings", "revisedCopy", "resubmissionChecklist"],
  properties: {
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

