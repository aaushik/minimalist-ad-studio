# 2. Build record

## Repository and history

- **Public repo:** <https://github.com/aaushik/minimalist-ad-studio>
- **Branch:** `main`
- **History:** preserved as incremental research, generator, safety, deployment,
  scorer and UI commits. It has not been squashed.

The implementation used Codex as the coding/research agent, Git and GitHub for
the build record, Next.js/TypeScript for the app, Gemini 3.5 Flash-Lite for
image understanding, and Vercel for hosting. No prompt-to-app builder was used.

## App prompts

[APP_PROMPTS.md](APP_PROMPTS.md) records the exact scorer prompt template and
explains the generator's deterministic path. The version-controlled executable
sources are:

- [`src/lib/scoring/prompt.ts`](../../src/lib/scoring/prompt.ts)
- [`src/lib/scoring/rules.ts`](../../src/lib/scoring/rules.ts)
- [`src/lib/scoring/schema.ts`](../../src/lib/scoring/schema.ts)

The prompt asks the vision model to report observations against allowed rule
IDs. The application, not the model, attaches source provenance, validates the
response, derives review states and calculates the three 1–5 scores.

## Full agent transcript

[`transcripts/`](transcripts/README.md) contains the raw Codex JSONL session
files for the assignment day, copied byte-for-byte and left unedited. They
include the primary planning, research, build and packaging conversations as
well as agent review sessions. JSONL preserves tool calls, command results,
reasoning records available in the export, corrections and failed attempts.

The record intentionally retains messy parts, including:

- revising language rules after the broader 20-page product validation showed
  that strong verbs were common in official copy;
- rejecting the assumption that official product-page copy is automatically
  approved for paid ads;
- tightening generated claims after early drafts overreached;
- finding and removing context that made the scorer look more capable than an
  arbitrary-image upload actually was; and
- replacing a verbose review wall with three concise, actionable score cards.

## Reproducing the commit trail

Run `git log --oneline --reverse` from the repository root. The history begins
with the evidence and scoring standard, then adds the generator, product-safety
corrections, deployment notes, URL coverage, scorer, input simplification and
the final three-dimension output.

