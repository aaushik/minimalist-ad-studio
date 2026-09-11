# Nudge.new PM Assignment — Minimalist Ad Studio

This repository will contain the working prototype and the evidence behind its
ad-review standard.

## Current status

The Meta reference corpus, 22-page official product review, rule-provenance
matrix, and version-zero scoring standard are ready for human review. The
scorer and generator are not implemented yet.

## Working sequence

1. Collect and review evidence.
2. Agree on the Minimalist brand and claims standard.
3. Create an evaluation set before implementing the scorer.
4. Implement and test the scorer for static image and text ads.
5. Implement product ingestion and the creative generator.
6. Connect scoring to generation and decide export controls.
7. Red-team the result and complete the submission documents.

## Evidence

- [Initial evidence review](docs/research/01-initial-brand-evidence.md)
- [Candidate scoring standard](docs/research/03-candidate-scoring-standard.md)
- [Product-page validation](docs/research/04-product-page-validation.md)
- [Scoring rules v0](docs/scorer/SCORING_RULES_V0.md)
- [Rule provenance](docs/scorer/RULE_PROVENANCE.md)
- [Meta reference review](docs/research/current-ads/static/META_REFERENCE_REVIEW.md)
- [Research log and corrections](docs/research/RESEARCH_LOG.md)
