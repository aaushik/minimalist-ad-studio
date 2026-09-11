# Candidate Minimalist ad-scoring standard

Status: **For human review — not yet encoded in the scorer**

Date: 2026-09-11

## Evidence used

- Meta displayed approximately 88 active image/meme results under the agreed
  filters; 80 distinct Library records were accessible after infinite scroll.
- Those records contained 94 downloadable creative images, 75 distinct exact
  file hashes, 54 exact-normalized copy executions, and 51 automated candidate
  concept groups.
- Twenty product-diverse static executions were directly inspected: acne and
  oil control, hydration/barrier care, sunscreen, retinol/anti-ageing, eye care,
  hair growth/greying, dandruff, bond repair, frizz, toner, routines, and offers.
- Two official brand-positioning pages and 22 official product pages were
  inspected separately. Published ads and product pages are evidence of current
  practice; the brand pages are evidence of declared intent. The expanded
  product-page review is recorded in `04-product-page-validation.md`.
- The ASCI Code and current official guidance are the initial policy sources.

This is enough to prototype the scorer's decision model, but not enough to call
the standard final. The seeded Google text-ad sample still needs direct review,
and Minimalist's internal substantiation files are unavailable.

## Important corpus finding

Current practice is internally inconsistent.

Among 54 exact-normalized Meta copy executions:

| Pattern | Executions containing it |
| --- | ---: |
| Ingredient or percentage notation | 38 |
| `science` / `science-backed` language | 20 |
| `clinical` language | 14 |
| `say goodbye` language | 10 |
| `struggling` or `tired of` opening | 8 |
| Time-bound result | 10 |
| Numeric outcome claim | 6 |
| Dermatologist language | 9 |
| One of several absolute/hyperbolic phrases checked | 12 |

Examples of restrained current executions include ingredient-led product
identity, concise concern/benefit explanations, and routine diagrams. Examples
of more aggressive current language include `Erase Dark Circles & Puffiness –
Fast!`, `turn back time`, `up to 100% reduction`, `fight ... at the root`, and
`guaranteed UV safety`.

Therefore, frequency in current ads cannot automatically become the brand
standard. Doing that would reproduce current drift—including risky claims—in
the scorer.

## Proposed interpretation of the three dimensions

### 1. Policy and claims

Objective: prevent an expensive false pass. The scorer should identify what
must be proved or reviewed; it should not pretend it can verify substantiation
from an image alone.

Candidate rules:

1. **Objective efficacy claims require evidence.** Flag clinical, scientific,
   numeric, time-bound, comparative, guaranteed, or typical-results claims and
   request the matching substantiation record.
2. **Authority claims require evidence.** `Dermatologist-tested`,
   `dermatologist-approved`, `clinically proven`, and similar language must map
   to an approved claim and study/source.
3. **Disclaimers cannot reverse the headline.** A footnote may qualify a claim,
   but cannot rescue a materially misleading main message.
4. **Cosmetic claims must not drift into unapproved therapeutic promises.**
   Wording such as `heals`, `treats the root cause`, `prevents blood-vessel
   breakage`, or biological activation claims should be escalated for legal or
   regulatory review unless specifically approved.
5. **Before/after and testimonial evidence must be traceable.** Require source,
   permission, timeframe, editing status, and confirmation that the presented
   result is not misleadingly exceptional.
6. **Offers must expose material conditions.** `Free`, cashback, coupon, and
   limited-time claims must state or link the conditions needed to understand
   the offer.
7. **Product facts must match an approved product record.** Product name,
   ingredient concentration, intended use, timing, and cautionary language must
   not be inferred from the ad corpus.
8. **Published product-page copy is not automatically ad-approved.** A claim
   transferred from a product page, ingredient or supplier study, testimonial,
   or packaging must retain its scope and map to an approved ad-channel claim.

Initial source basis:

- [ASCI Code](https://www.ascionline.in/the-asci-code/): objective claims should
  be capable of substantiation; advertisements must not mislead through
  implication, omission, ambiguity, or exaggeration.
- [ASCI disclaimer guidance](https://www.ascionline.in/the-asci-code-guidelines/):
  disclaimers may explain or qualify but should not contradict the main claim.
- [CDSCO Cosmetics Rules, 2020](https://cdsco.gov.in/opencms/opencms/en/Acts-and-rules/Cosmetics-Rules/):
  primary regulatory source to review before finalising cosmetic-versus-drug
  claim rules.
- [Consumer Affairs misleading-advertisement guidance](https://consumeraffairs.nic.in/latestnews/guidelines-prevention-misleading-advertisements-and-endorsements-misleading):
  additional statutory guidance to incorporate in the final policy matrix.

### 2. Brand tone

Objective: judge the stance the ad takes toward the customer, independently of
whether individual words are technically allowed.

Candidate rules:

1. **Inform, do not intimidate.** Name a concern without shaming a normal body
   feature, amplifying anxiety, or suggesting the customer is careless.
2. **Confident, not sensational.** Prefer a calm explanation of what the product
   is for over urgency, miracle framing, or transformation theatre.
3. **Respect customer agency.** Help the reader make a choice; do not imply that
   one product is the only route to acceptable skin or hair.
4. **Science should clarify.** Scientific references should explain an
   ingredient, mechanism, test, or expectation rather than operate as an empty
   authority badge.
5. **Offer-led ads remain permissible.** A promotion is not automatically
   off-brand if it remains clear, factual, and visually recognisable.

### 3. Brand language

Objective: judge the vocabulary and claim construction, not the emotional
attitude.

Candidate rules:

1. **Use the approved product name and concentration exactly.** Preserve
   product-specific notation rather than globally converting `02%` to `2%` or
   vice versa.
2. **Match efficacy verbs to approved evidence.** `Helps`, `supports`,
   `targets`, and `visibly reduces` are safer generation defaults when
   permitted. Stronger verbs are common in official product copy and are not
   automatically off-brand, but must match an approved, substantiated claim.
   Absolute constructions such as `erases`, `eliminates`, or `guarantees`
   remain high-risk.
3. **Connect ingredient to function to relevant benefit.** Specific explanatory
   structure is more characteristic than generic `glow-up` or `maximum results`
   language.
4. **Make numeric claims complete.** State outcome, population/basis, timeframe,
   and a readable source marker where applicable.
5. **Avoid generic authority filler.** `Backed by science` alone is weak brand
   evidence; identify the formulation fact or evidence it refers to.
6. **Keep the hierarchy scannable.** Product/concern, supporting mechanism or
   benefit, evidence/qualification, then CTA is a common usable structure—not a
   mandatory template.

## Proposed reviewer output

Do not average the three dimensions into one opaque score. The response is an
actionable edit brief: it must tell the marketer what is off, where it occurs,
and how to fix it. Return:

- overall verdict: `Pass`, `Revise`, `Evidence required`, or `Human review`;
- a separate finding list for each of the three required dimensions;
- exact flagged span or visual region;
- severity and confidence;
- rule ID and source;
- what is off and why it matters;
- a concrete next action: exact edit, precisely named evidence, corrected
  product fact, or named review decision;
- a suggested rewrite whenever it can be made without inventing proof or
  product facts;
- a consolidated revised version of the copy containing all safe edits; and
- a `done when` condition and short resubmission checklist.

For an unsupported claim, the output should provide two paths where possible:
identify the exact substantiation needed to retain it, or identify the claim
slot that must be replaced with wording from the approved claim set. Generic
directions such as `make it on-brand` or `check compliance` are not actionable
and do not satisfy the output contract.

## Decision required before implementation

### What does `brand fit` optimise for when current practice conflicts with
declared intent?

**Option A — Current-practice standard:** repeated published phrasing is treated
as on-brand. This is empirical, but it canonises drift and can reward risky
language.

**Option B — Declared-intent standard:** anti-fearmongering, transparent,
education-led principles override current practice. This is coherent, but may
mark many real Minimalist ads off-brand.

**Recommended — Layered standard:** declared intent sets the boundaries;
repeated current patterns supply examples inside those boundaries. The scorer
labels conflicts as `brand drift` rather than claiming the brand never uses
them. Policy risk always overrides frequency.

## Proposed release gate requiring approval

- High-severity policy issue: block export pending correction or human approval.
- Missing evidence for an objective claim: disable automatic approval and route
  to evidence review.
- Tone/language issue alone: recommend revision but do not hard-block export.
- A clean ad can pass only when product facts and every objective claim are
  either matched to an approved claim record or contain no evidence-dependent
  assertion.
