# Nudge.new PM Assignment — Minimalist Ad Studio

This repository will contain the working prototype and the evidence behind its
ad-review standard.

**Live app:** <https://nudge-new-assignment.vercel.app>

**Complete assignment submission:** [submission/](submission/README.md)

## Current status

The generator accepts a Minimalist product URL and one free-form creative
brief. It infers the objective from the brief and returns three editable
1080 × 1080 Meta routes with different copy and design directions. The app uses
page-supported copy, designed backgrounds, and the original product photograph.
Every route can be downloaded or sent directly to the Scorer. Scorer also accepts
an independently uploaded static ad and pasted visible copy.

The Gemini and Cloudflare integrations have been removed. No credentials
are required for either service. The generator always uses its local composition
path; the scorer checks supplied text with documented rules and routes visual
checks to a human reviewer.

The scorer trusts product context from the generator. An uploaded creative is
labelled as uncertain until a human confirms its brand and visual content.
In-scope results
contain three independent scores out of 5: Policy & Claims, Brand Tone, and
Brand Language. Each score includes a short reason and one prominent action
line, while the documented rules determine the number.

## Run locally

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. No API keys are needed. For an uploaded ad, paste
its visible copy to get text checks. The image receives a human-review finding
because the app does not read its pixels automatically.

The product read uses Minimalist's public Shopify product JSON endpoint. A live,
supported product page is required to create a new three-route set.

## Working sequence

1. Collect and review evidence.
2. Agree on the Minimalist brand and claims standard.
3. Implement product ingestion and the first creative generator.
4. Create a focused evaluation set before implementing the scorer.
5. Implement the scorer for static image and text ads.
6. Connect scoring to generation and apply the chosen review-state controls.
7. Red-team the result and complete the submission documents.

## Evidence

- [Initial evidence review](docs/research/01-initial-brand-evidence.md)
- [Candidate scoring standard](docs/research/03-candidate-scoring-standard.md)
- [Product-page validation](docs/research/04-product-page-validation.md)
- [Scoring rules v0](docs/scorer/SCORING_RULES_V0.md)
- [Rule provenance](docs/scorer/RULE_PROVENANCE.md)
- [Scorer v1 implementation](docs/scorer/SCORER_V1_IMPLEMENTATION.md)
- [Meta reference review](docs/research/current-ads/static/META_REFERENCE_REVIEW.md)
- [Research log and corrections](docs/research/RESEARCH_LOG.md)
- [Creative generation exploration](docs/CREATIVE_GENERATION_PLAN.md)
- [Production creative generation specification](docs/CREATIVE_GENERATION_PRODUCTION_SPEC.md)
