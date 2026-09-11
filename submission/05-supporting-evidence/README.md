# Supporting evidence index

This index makes the basis for the scoring rules auditable without expanding
the one-page decision document.

## Canonical standard

- [Rule provenance and evidence hierarchy](../../docs/scorer/RULE_PROVENANCE.md)
- [Scoring rules v0](../../docs/scorer/SCORING_RULES_V0.md)
- [Executable scoring rules](../../src/lib/scoring/rules.ts)
- [Scorer v1 implementation notes](../../docs/scorer/SCORER_V1_IMPLEMENTATION.md)

## Research and validation

- [Initial brand and policy evidence](../../docs/research/01-initial-brand-evidence.md)
- [Candidate scoring standard](../../docs/research/03-candidate-scoring-standard.md)
- [22-page product validation](../../docs/research/04-product-page-validation.md)
- [Current Meta reference review](../../docs/research/current-ads/static/META_REFERENCE_REVIEW.md)
- [Research log and corrections](../../docs/research/RESEARCH_LOG.md)
- [Generator decision record](../../docs/decisions/GENERATOR_V1.md)

## Evidence coverage

| Evidence | Coverage | Role in the standard |
| --- | ---: | --- |
| Official product pages | 22 | Product identity, claim structures, tone, language and cross-category edge cases |
| Directly inspected static Meta ads | 20 | Current paid-ad execution patterns and visual/copy context |
| Exact-normalized Meta copy executions | 54 | Recurring paid-copy patterns without inflating duplicates |
| Minimalist About/Values | 2 declared-principle pages | Intended transparency, education and anti-fear direction |
| Indian policy sources | ASCI, Cosmetics Rules, CCPA | Mandatory truthfulness, substantiation, disclaimer and misleading-ad boundaries |

## Known evidence gaps

The prototype did not have Minimalist's canonical SKU master, approved claims
registry, evidence packets, media-channel approvals, reviewer decisions or
offer system. It also lacks a human-labelled holdout set. Those gaps are
represented as escalation or `Evidence required`, and are the main reason the
tool does not claim to approve ads.

