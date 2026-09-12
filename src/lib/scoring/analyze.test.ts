import assert from "node:assert/strict";
import test from "node:test";

import { assembleReview } from "./analyze";
import type { ModelReview } from "./schema";
import type { BrandAssessment } from "./types";

function modelReview(brandAssessment: BrandAssessment): ModelReview {
  return {
    brandAssessment,
    extractedText: "Visible ad copy",
    visualObservations: [],
    findings: [],
    revisedCopy: null,
    resubmissionChecklist: [],
  };
}

test("suppresses scores for an uploaded creative that is clearly another brand", () => {
  const model = modelReview({
    status: "other_brand",
    detectedBrand: "Example Brand",
    explanation: "The Example Brand wordmark is clearly visible.",
    confidence: "high",
  });
  model.findings.push({
    ruleId: "P04",
    location: "Headline",
    observed: "Guaranteed results",
    inference: null,
    whatIsOff: "Absolute promise",
    whyItMatters: "It is unsupported.",
    howToFix: "Remove it.",
    suggestedReplacement: null,
    doneWhen: "The promise is removed.",
    confidence: "high",
    missingInput: null,
  });

  const result = assembleReview({ source: "upload", imageDataUrl: "data:image/jpeg;base64,AA==" }, model);

  assert.equal(result.scoringApplicable, false);
  assert.equal(result.verdict, "not_applicable");
  assert.equal(result.dimensionScores, null);
  assert.equal(result.dimensions, null);
  assert.deepEqual(result.findings, []);
});

test("continues scoring an uploaded creative whose brand is unclear", () => {
  const result = assembleReview(
    { source: "upload", imageDataUrl: "data:image/jpeg;base64,AA==" },
    modelReview({
      status: "unclear",
      detectedBrand: null,
      explanation: "No legible brand identifier is visible.",
      confidence: "medium",
    }),
  );

  assert.equal(result.scoringApplicable, true);
  assert.equal(result.brandAssessment.status, "unclear");
  assert.ok(result.dimensionScores);
});

test("trusts a generator handoff as Minimalist context", () => {
  const result = assembleReview(
    { source: "generator", imageDataUrl: "data:image/jpeg;base64,AA==" },
    modelReview({
      status: "other_brand",
      detectedBrand: "Example Brand",
      explanation: "A different wordmark was inferred.",
      confidence: "low",
    }),
  );

  assert.equal(result.scoringApplicable, true);
  assert.equal(result.brandAssessment.status, "minimalist");
});

test("treats an upload as unclear when vision is unavailable and keeps rules-only scoring", () => {
  const result = assembleReview(
    { source: "upload", imageDataUrl: "data:image/jpeg;base64,AA==" },
    null,
    "Vision unavailable",
  );

  assert.equal(result.scoringApplicable, true);
  assert.equal(result.brandAssessment.status, "unclear");
  assert.equal(result.engine, "rules-only");
  assert.ok(result.dimensionScores);
});
