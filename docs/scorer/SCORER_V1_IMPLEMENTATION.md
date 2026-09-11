# Scorer v1 implementation

## Product behaviour

The scorer accepts either an uploaded static ad or a creative handed off from
the generator. Both enter one `reviewAd` workflow and return the same
action-oriented contract:

- overall publication decision;
- policy/claims, brand-tone, and brand-language statuses;
- atomic findings with the exact observed span or visual region;
- what is off, why it matters, how to fix it, and a `done when` check;
- suggested wording only when a safe rewrite is possible;
- confidence, missing input, and the source basis for each finding;
- a resubmission checklist and disclosed engine limitations.

The overall decision is computed in code, not by the language model. Precedence
is `Block` → `Human review` → `Evidence required` → `Revise` → `Ready for
reviewer approval`.

## Technical seam

`reviewAd(input)` is the boundary between the web interface and review logic.
The generator renders its existing 1080 × 1080 DOM creative to an in-memory
JPEG, adds the exact known copy and product URL, then calls the same endpoint as
the upload surface. No round trip through a download/re-upload flow is needed.

The implementation has three layers:

1. `rules.ts` is the machine-readable rule registry. It stores every P/T/L
   rule, default action, status, severity, and evidence basis.
2. `analyze.ts` owns deterministic text checks, result assembly, deduplication,
   and verdict precedence.
3. `gemini.ts` is an optional server-only image-reading adapter. The API key
   never reaches the browser. Its structured observations are validated before
   being mapped back to the rule registry.

If Gemini is unavailable, supplied copy still receives deterministic checks.
An uploaded image is never falsely passed: the output explicitly requests a
human visual review and explains that disclaimer, hierarchy, and asset checks
were not completed.

## Rule and prompt basis

- Human-readable standard: `SCORING_RULES_V0.md`
- Rule derivation and source mapping: `RULE_PROVENANCE.md`
- Machine-readable rules: `src/lib/scoring/rules.ts`
- Versioned model instructions: `src/lib/scoring/prompt.ts`

The source basis combines the ASCI Code and disclaimer guidance, Indian
cosmetics/consumer-protection context, Minimalist About/Values, 22 validated
product pages across two cohorts, and the inspected current Meta ad corpus.
The internal approved-claims and SKU registries remain missing dependencies;
therefore the prototype does not invent claim approval.

