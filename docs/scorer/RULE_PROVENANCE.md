# Minimalist scorer — rule provenance

Status: **Living source of truth for why each scoring rule exists**

Last updated: 2026-09-12

## Purpose

This document stores the basis for the scorer. A rule should not be added,
removed or materially changed without updating its provenance, evidence
boundary and revision history here.

## Evidence hierarchy

When sources conflict, use this order:

1. **Applicable law and regulation** — mandatory boundary.
2. **Approved internal product and claim records** — exact product facts,
   substantiation, permitted wording, qualifiers, geography and channel. These
   records are currently unavailable.
3. **Minimalist's declared principles** — intended brand direction.
4. **Current official product pages and paid ads** — evidence of actual usage,
   not automatic evidence of approval or compliance.
5. **Older editorial content and third-party summaries** — context and
   discovery leads only; insufficient by themselves to create a rule.

The assignment requirement for an actionable response is an output-contract
source. It determines how findings are communicated, not whether a brand or
policy claim is true.

## Primary sources considered

### Brand and product

- [Minimalist — Our Values](https://beminimalist.co/pages/our-values)
- [Minimalist — About](https://beminimalist.co/pages/about)
- 22 official product pages: the original two-page review plus the 20-page
  validation recorded in
  [04-product-page-validation](../research/04-product-page-validation.md)
- Official current Meta corpus and direct review recorded in
  [META_REFERENCE_REVIEW](../research/current-ads/static/META_REFERENCE_REVIEW.md)

### Policy

- [ASCI Code, Chapter I](https://www.ascionline.in/the-asci-code/): objective
  facts should be capable of substantiation; research-based claims should name
  source and date; referenced persons or institutions require permission.
- [ASCI disclaimer guidance](https://www.ascionline.in/the-asci-code-guidelines/):
  disclaimers may clarify but not contradict or repair the material claim;
  material information must remain legible and appropriately proximate.
- [Cosmetics Rules, 2020](https://cdsco.gov.in/opencms/en/Acts-and-rules/Cosmetics-Rules/),
  Rule 36: a cosmetic must not purport or convey a false or misleading idea.
- [CCPA Guidelines for Prevention of Misleading Advertisements and
  Endorsements, 2022](https://consumeraffairs.nic.in/acts-and-rules/consumer-protection/consumer-protection):
  statutory misleading-advertising and endorsement context. A clause-by-clause
  product-category legal matrix is still outstanding.

## How the current-ad corpus changed the rules

The current Meta corpus was a rule-derivation input, not a post-hoc example
set. The measured signal-to-rule mapping is recorded once in the submission's
[corpus-derived scoring decisions](../../submission/05-supporting-evidence/README.md#corpus-derived-scoring-decisions);
the rule-by-rule table below records the complete source basis and boundary.
The corpus determined what the scorer looks for and supplied both positive and
risky anchors. ASCI, regulation, declared principles and the missing approved
internal records still determine whether a recurring pattern is acceptable.
The scorer does not calculate similarity to the corpus at runtime; these
findings were distilled into the versioned rules and prompt.

## Rule-by-rule basis

Confidence means confidence that the rule is useful for triage, not that the
scorer can make a final legal decision.

| Rule | Basis and observed evidence | Source layer | Confidence / boundary |
| --- | --- | --- | --- |
| P01 — Product accuracy | Product pages distinguish close variants, audiences, concentrations, use and warnings; notation and compound-name inconsistencies require a canonical record | Internal record required; 22 product pages | High triage confidence; block only on a confirmed registry contradiction |
| P02 — Objective claims | Numeric, clinical, comparative and time-bound claims recur throughout both product cohorts and Meta ads | ASCI Ch. I; product validation; Meta corpus | High; evidence match must preserve wording, population, method, outcome and timeframe |
| P03 — Authority claims | Dermatologist, independent-lab, supplier-study and pediatrician references recur across pages and ads | ASCI Ch. I; product validation | High; authority type, scope, source, permission and date must match |
| P04 — Absolute promises | Meta and product pages contain erase/eliminate/guarantee, disappearance, universal and no-side-effect constructions | ASCI truthfulness/misleading principles; product validation; Meta corpus | High flag confidence; final block versus human-review boundary needs policy owner approval |
| P05 — Product classification | Pages use healing, treatment, disease, bacterial and physiological mechanisms across skin, hair, lip, eye and baby products | Cosmetics Rule 36; product validation | High escalation confidence; classification/legal judgement remains human |
| P06 — Results/testimonials | Testimonials are embedded on product pages and before/after/testimonial formats occur in the ad corpus | ASCI truthfulness/permission principles; product pages; Meta corpus | High; requires source, permission, alteration, typicality and matching-use checks |
| P07 — Disclaimers | Claims and their study scope are often separated on pages; ads also use small independent-lab and result qualifiers | ASCI disclaimer guidance; product pages; Meta corpus | High; medium-specific legibility details must be implemented per current guidance |
| P08 — Offers | Product pages provide positive examples of thresholds, codes and free-item identity; Meta ads sometimes omit material conditions | ASCI disclaimer examples; CCPA context; product pages; Meta corpus | High for triage; checkout terms remain an external dependency |
| P09 — Missing approved claim | Product pages expose many factual claims, but the internal evidence/approval set is unavailable | ASCI substantiation rule; assignment safety objective | High; absence of a registry match returns `Evidence required`, never a fabricated pass |
| P10 — Asset integrity | Misleading product, label or result depiction would alter the factual representation received by the consumer | ASCI truthfulness/misleading principles; product-accuracy dependency | Medium-high; image-forensics confidence must be surfaced |
| P11 — Source-context transfer | Pages mix product studies, ingredient/supplier studies, consumer agreement and testimonials; shortening can remove scope and qualifiers | ASCI Ch. I/source-date rule; ASCI disclaimers; 20-page validation | High; official publication is not blanket ad-channel approval |
| T01 — Respect, not shame | Anti-fearmongering is declared intent; directly inspected current pages are mostly neutral/concern-led; older editorial `ugly pores` is only a counterexample | About/Values; pages; limited editorial context | Medium; operational examples need evaluation-set review |
| T02 — Inform, not frighten | Declared transparency and informed-choice intent; current pages usually explain a concern without escalating danger | About/Values; product validation; Meta corpus | Medium-high; do not infer fear from a concern image or word alone |
| T03 — Calm confidence | Declared anti-fluff intent conflicts with frequent `powerful`, `potent` and dramatic language in current practice | About/Values; product validation; Meta corpus | Medium; judge the complete promise/pressure, not isolated adjectives |
| T04 — Transparent expectations | Brand transparency plus repeated use of timeframes, populations and study limitations | About/Values; product validation; ASCI | High; certainty/universality issues also route through policy |
| T05 — Science as explanation | Ingredient → function → benefit structure holds strongly, but mechanisms sometimes cross into physiological or authority-heavy claims | About/Values; 22 product pages; Meta corpus | High for structure; P05/P02 must run before brand praise |
| T06 — Honest promotion | Offers are a normal product-page and ad format; clear thresholds/codes show promotions can remain factual | Product pages; Meta corpus; ASCI disclaimers | High; manipulation judgement still considers execution context |
| L01 — Exact product identity | Product/concentration naming is central, but `2%`/`02%`, spelling and compound-total variants occur | 22 product pages; Meta corpus; internal SKU record required | High; registered aliases must prevent false mismatch blocks |
| L02 — Efficacy verbs | Both cohorts commonly use reduces/repairs/prevents/treats; absolute verbs and categorical outcomes create greater risk | 20-page validation; Meta corpus; ASCI | High after amendment: evidence/approval controls the verb; calibrated verbs are fallback defaults |
| L03 — Explanatory structure | Ingredient/formulation → function → concern/benefit is consistent across categories | 22 product pages; Meta corpus | High; explanation must remain understandable and pass P02/P05 |
| L04 — Claim completeness | Good pages expose method/report/timeframe, while other claims detach conclusions from their basis | Product validation; ASCI source/date and disclaimer guidance | High; ad must keep material basis and qualifiers proximate |
| L05 — Specificity | Product identity, concerns, pH, use and mechanisms dominate; generic beauty filler also appears but carries less information | Product validation; Meta corpus; About/Values | Medium-high; filler is a revision issue unless it creates a policy problem |
| L06 — Scannable hierarchy | Product, benefit, mechanism, ideal user, evidence, usage and CTA recur across product pages and static ads | 22 product pages; Meta corpus | High as a usability pattern, not a mandatory template |
| L07 — CTA fit | Current commerce pages and ads commonly use direct factual actions; result-promising or pressure CTAs can change the claim | Product pages; Meta corpus; tone principles | Medium-high; evaluate CTA in the full offer/claim context |

## Output-contract basis

Every finding must state the exact location, what is off, why it matters, how to
fix it, a safe replacement when possible, the missing evidence or reviewer when
not, and a `done when` condition. This comes from the assignment's requirement
for actionable output and the user-confirmed interpretation recorded in
[SCORING_RULES_V0](SCORING_RULES_V0.md).

## Known gaps before final rules

- Minimalist's SKU master, approved claims registry and substantiation packet.
- Clause-level legal review by a qualified policy owner for therapeutic,
  vulnerable-audience and product-classification cases.
- Direct review of the seeded Google text-ad sample.
- Human-labelled holdout evaluation set for false passes, false blocks and
  usefulness of suggested fixes.

## Revision log

### 2026-09-12 — current-ad derivation made explicit

- Recorded the measured corpus signal behind each affected rule family.
- Clarified that corpus patterns determined checks and anchors but do not act
  as automatic evidence of approval.
- Clarified that the corpus is distilled into the rules rather than queried at
  runtime.

### 2026-09-11 — product-page validation

- Expanded official product-page evidence from 2 to 22 pages.
- Added P11 for source-context transfer.
- Amended L01 to require canonical identity plus registered aliases.
- Amended L02 so strong verbs are not automatically off-brand; evidence and
  approved wording determine acceptability.
- Clarified that T05/L03 cannot reward mechanism language before P02/P05 checks.
