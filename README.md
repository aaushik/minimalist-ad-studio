# Nudge.new PM Assignment — Minimalist Ad Studio

This repository will contain the working prototype and the evidence behind its
ad-review standard.

**Live app:** <https://nudge-new-assignment.vercel.app>

## Current status

The first generator surface is implemented. It accepts a Minimalist product
URL, reads the store's public product data and page metadata, composes an
editable 1080 × 1080 Meta creative using the real product image, and exports a
PNG. The scorer is the next implementation step.

## Run locally

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. No API key is needed for the generator.

The happy path uses Minimalist's public Shopify product JSON endpoint. If the
page read fails, the existing draft stays editable and the marketer can upload
a product photograph manually.

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
- [Meta reference review](docs/research/current-ads/static/META_REFERENCE_REVIEW.md)
- [Research log and corrections](docs/research/RESEARCH_LOG.md)
