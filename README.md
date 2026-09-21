# Nudge.new PM Assignment — Minimalist Ad Studio

This repository will contain the working prototype and the evidence behind its
ad-review standard.

**Live app:** <https://nudge-new-assignment.vercel.app>

**Complete assignment submission:** [submission/](submission/README.md)

## Current status

The generator accepts a Minimalist product URL and one free-form creative
brief. It infers the objective from the brief and returns three editable
1080 × 1080 Meta routes with different copy and design directions. Cloudflare
Workers AI writes the copy and generates background scenes. The app then adds
the original product photograph and exact text, so the model cannot redraw or
distort the pack label. Every route can be downloaded or sent directly to the
Scorer. Scorer also accepts an independently uploaded static ad.

Generated copy is checked against product-page facts. Generated scenes are
reviewed for text, packaging and people before use. Model errors, unsafe scenes,
or missing Cloudflare credentials produce three designed fallback drafts rather
than blocking the flow.

The scorer checks brand identity before applying the Minimalist rubric. A
clearly different brand receives no scores; an unclear creative is labelled as
uncertain and still assessed as if it were for Minimalist. In-scope results
contain three independent scores out of 5: Policy & Claims, Brand Tone, and
Brand Language. Each score includes a short reason and one prominent action
line, while the documented rules determine the number.

## Run locally

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local`. Add Cloudflare credentials for generated
copy and scenes, and a Gemini API key for scorer image reading:

```bash
cp .env.example .env.local
# edit GEMINI_API_KEY in .env.local
```

Open <http://localhost:3000>. The generator still returns three variants without
Cloudflare credentials by using its factual copy and designed background
fallbacks. Without a Gemini key, uploaded images are explicitly routed to human
visual review rather than receiving a false pass. Never name either provider's
credentials `NEXT_PUBLIC_*`; they must remain server-only.

The configured default is a free-tier Gemini Flash Lite model and can be
changed with `GEMINI_MODEL`. Google states that free-tier content may be used to
improve its products, so do not upload confidential or unreleased creative to
the free tier without approval.

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
