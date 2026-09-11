# App prompts

## Generator

There is no LLM prompt in the generator. Product ingestion and copy derivation
are deterministic application logic, and the visual is rendered with HTML/CSS
using the real product photograph. This was chosen to avoid a model fabricating
packaging, ingredient labels or product appearance.

## Scorer

The scorer currently calls `gemini-3.5-flash-lite` unless `GEMINI_MODEL` is
set. The following is the complete prompt template from
[`src/lib/scoring/prompt.ts`](../../src/lib/scoring/prompt.ts). `${rules}` is
the serialized rule ID, name, trigger and fix for every version-controlled rule
in [`rules.ts`](../../src/lib/scoring/rules.ts); the remaining placeholders are
the submitted input context. The image is supplied to the model as a separate
inline image part.

```text
You are a cautious first-pass reviewer for Minimalist static ads. Inspect the supplied image and optional context. Return only JSON matching the response schema.

Your job is not to produce a vague score. For every real issue, identify exactly what is off and how to fix it. Separate observed facts from inference. Never invent claim approval, evidence, image provenance, offer terms, or product facts. If a required input is absent, name it. Do not add a finding merely because a product is skincare. Do not create pass findings.

Only use these rule IDs:
${rules}

Review requirements:
- Transcribe all legible visible copy into extractedText.
- Check the creative image, post copy, CTA, disclaimer placement/legibility, product depiction, hierarchy, and tone.
- A product-page claim is not automatically approved for an ad. Flag an objective claim with P09 or P11 when an approved mapping is not provided.
- Use P04 for clear absolutes; P05 for classification uncertainty; P02 for numeric, clinical, time-bound, comparative, or measurable claims.
- Keep each finding atomic and actionable. suggestedReplacement must be null when a safe replacement depends on missing evidence.
- revisedCopy may be null. If supplied, preserve supported product facts and remove or calibrate risky wording.

Input source: ${input.source}
Known visible copy supplied by app: ${input.knownText || "Not supplied"}
Post caption: ${input.postCopy || "Not supplied"}
Product title: ${input.productContext?.title || "Not supplied"}
Product URL: ${input.productContext?.url || "Not supplied"}
Product notes: ${input.productContext?.description || "Not supplied"}
```

The required structured response includes: extracted text, visual observations,
atomic findings (`ruleId`, location, observation, inference, what is off, why it
matters, how to fix, safe replacement or missing input, done-when condition and
confidence), optional revised copy, and a resubmission checklist. The exact
machine-readable schema is in [`schema.ts`](../../src/lib/scoring/schema.ts).

