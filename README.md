# Nudge.new PM Assignment — Minimalist Ad Studio

This repository will contain the working prototype and the evidence behind its
ad-review standard.

**Live app:** <https://nudge-new-assignment.vercel.app>

## Current status

The generator accepts a Minimalist product URL, reads the store's public
product data and page metadata, composes an editable 1080 × 1080 Meta creative,
and exports a PNG. **Send to scorer** renders that creative in memory, opens the
Review tab and scores it automatically. Review also accepts an independently
uploaded static ad plus optional post copy and product URL.

The review output is deliberately actionable rather than a single opaque
number: it identifies the exact issue, explains why it matters, gives a fix and
a completion check, and discloses evidence gaps and confidence.

## Run locally

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and add a Gemini API key if you want image
reading:

```bash
cp .env.example .env.local
# edit GEMINI_API_KEY in .env.local
```

Open <http://localhost:3000>. No API key is needed for the generator or the
rules-only fallback. Without a key, uploaded images are explicitly routed to
human visual review rather than receiving a false pass. Do not name the key
`NEXT_PUBLIC_*`; it must remain server-only.

The configured default is a free-tier Gemini Flash Lite model and can be
changed with `GEMINI_MODEL`. Google states that free-tier content may be used to
improve its products, so do not upload confidential or unreleased creative to
the free tier without approval.

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
- [Scorer v1 implementation](docs/scorer/SCORER_V1_IMPLEMENTATION.md)
- [Meta reference review](docs/research/current-ads/static/META_REFERENCE_REVIEW.md)
- [Research log and corrections](docs/research/RESEARCH_LOG.md)
