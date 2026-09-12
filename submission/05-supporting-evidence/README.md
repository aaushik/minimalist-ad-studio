# Supporting evidence index

This index makes the basis for the scoring rules auditable without expanding
the one-page decision document. The rules were determined partly from the
extracted current-ad corpus—not merely checked against it after the fact—while
law, approved internal records and declared brand principles remain higher in
the evidence hierarchy.

## Canonical standard

- [Rule provenance and evidence hierarchy](../../docs/scorer/RULE_PROVENANCE.md)
- [Current-ad corpus → scoring-rule derivation](../../docs/scorer/RULE_PROVENANCE.md#how-the-current-ad-corpus-changed-the-rules)
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

## Corpus-derived scoring decisions

These are the measured current-ad signals that materially changed the scorer.
Counts use the 54 exact-normalized Meta copy executions; visual/layout decisions
come from the 20 directly inspected static executions. Patterns overlap.

| Corpus finding | Rules it produced or sharpened |
| --- | --- |
| Ingredient/concentration notation in 38/54 | L01 exact product identity; L03 ingredient/formulation → function → benefit |
| `science` in 20/54; `clinical` in 14/54 | T05 explanatory science; P02 substantiation for clinical/measurable claims |
| Time-bound results in 10/54; numeric outcomes in 6/54 | P02 evidence match; L04 complete claim context; P07 visible, proximate qualification |
| Dermatologist language in 9/54 | P03 source, permission, scope and date verification |
| `Say goodbye` in 10/54; `struggling`/`tired of` in 8/54; checked hyperbole/absolutes in 12/54 | P04 absolute-promise gate; T01–T04 respect, fear, hype and certainty checks; L02 evidence-matched verbs |
| Free-item, cashback and limited-time executions | P08 complete offer conditions; T06 factual promotion; L07 factual CTA |
| Restrained product heroes/routine diagrams and dense executions | L06 scannable hierarchy pass/revise anchors |

Frequency established what the scorer must inspect; it did not establish what
should pass. Policy and declared principles resolve risky current practice, and
approved internal records remain required for product and claim approval. The
full reasoning and boundary are recorded in the linked rule-provenance section.

## Known evidence gaps

The prototype did not have Minimalist's canonical SKU master, approved claims
registry, evidence packets, media-channel approvals, reviewer decisions or
offer system. It also lacks a human-labelled holdout set. Those gaps are
represented as escalation or `Evidence required`, and are the main reason the
tool does not claim to approve ads.
