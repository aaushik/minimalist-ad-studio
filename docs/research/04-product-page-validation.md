# Product-page validation of the scoring rules

Status: **Completed evidence pass; rules remain a decision draft**

Date observed: 2026-09-11

## Question

Do the initial scoring hypotheses, which were based on two product pages and the
current Meta ad corpus, still hold after reviewing a broader set of official
Minimalist product pages?

## Selection method

Two distinct cohorts were reviewed on the India website:

1. **Ten bestseller pages.** Starting from the order displayed in Minimalist's
   official [Best Sellers collection](https://beminimalist.co/collections/best-sellers),
   take the first ten products whose pages were not in the original two-page
   review. This prevents choosing only pages that fit the hypotheses.
2. **Ten additional cross-category pages.** Select products that did not carry a
   `Best Seller` badge in the inspected product-page content, spanning facial
   care, sun care, eye, lip, hair, body/routine, and baby care.

The website's taxonomy is inconsistent: many unbadged products are accessible
through a `/collections/best-sellers/` URL. Cohort 2 therefore means **not
explicitly badged as Best Seller on the inspected product page**, not a claim
about confidential sales rank. This limitation prevents false precision.

For every page, the review considered the product heading, benefit line,
description, formulation/mechanism section, ideal-user information, usage and
warnings, study/result copy, testimonial snippets, and displayed offer terms.
Customer reviews were not treated as brand-authored product claims.

## Cohort A — ten bestseller pages

| Product | Direct observations | Effect on the rules |
| --- | --- | --- |
| [Salicylic Acid + LHA 2% Cleanser](https://beminimalist.co/products/salicylic-lha-2-cleanser) | Ingredient/concentration identity; concern-led benefit; BHA/LHA mechanism; consumer percentages and timeframes; dermatologist-supervised safety statement | Supports L01, L03, L04, P02, P03 and P11; `prevents breakout` and antibacterial language reinforce P05 review |
| [SPF 50 Sunscreen](https://beminimalist.co/products/multi-vitamin-spf-50) | SPF/PA identity; filters linked to protection; independent-lab method, standard, report number and obtained SPF; categorical `white cast free` claim | Strong support for L03 and evidence-record fields; P02 applies to SPF and categorical performance claims |
| [Vitamin B5 10% Moisturizer](https://beminimalist.co/products/vitamin-b5-10-moisturizer) | Ingredient/concentration identity; hydration/barrier mechanism; three consumer percentages/timeframes; repair, irritation and cellular language | Supports L01, L03 and P02; reinforces P05 for physiological or wound-healing language |
| [Vitamin C 10% Face Serum](https://beminimalist.co/products/vitamin-c-ethyl-ascorbic-acid-10-acetyl-glucosamine-1) | Ingredient-led name; mechanism and supplier detail; three consumer outcomes with timeframes; `heal`, collagen, ageing and skin-lightening wording | Supports the explanatory structure but strengthens P02, P05 and P11 |
| [Salicylic Acid 2% Face Serum](https://beminimalist.co/products/salicylic-acid-2) | Concern-led headline; ingredient mechanism; clinical/consumer numbers and timeframes; `wards off acne`, antimicrobial and pathological-factor language | Supports L03 while strengthening P02 and P05; `flawless` is evidence for L05 review, not a universal ban |
| [Alpha Arbutin 2% Face Serum](https://beminimalist.co/products/alpha-arbutin-2) | Comparative in-vitro study with report number; consumer study outcomes; `dramatically`, `ensures`, skin-lightening and 9x/20x comparisons | Strongly supports P02, L04 and P11; confirms that published brand copy can conflict with calibrated-language preferences |
| [Marula Oil 5% Face Moisturizer](https://beminimalist.co/products/marula-05-moisturizer) | Ingredient-led identity and function; consumer percentages/timeframes; `treats` and immediate disappearance wording | Supports L01/L03 but strengthens P02 and P04; a product-page statement is not an ad-safe absolute by default |
| [Niacinamide 5% Face Serum](https://beminimalist.co/products/niacinamide-5-hyaluronic-acid-1) | Product-specific concentration; audience distinction from the 10% product; ingredient/function explanation; consumer outcomes; repair and UV-damage language | Supports exact product/audience matching under P01/L01 and evidence review under P02/P05 |
| [Vitamin C + E + Ferulic 16% Face Serum](https://beminimalist.co/products/vitamin-c-e-ferulic-16) | Product total is explained as 15% vitamin C plus a 1% antioxidant blend; supplier/scientific authority; potency comparison; testimonial | Supports formulation-to-benefit structure and shows why P01 must resolve compound concentration names from a canonical SKU record |
| [Hair Growth Actives 18% Hair Serum](https://beminimalist.co/products/hair-growth-actives-18) | Five actives sum to the named concentration; multiple timeframes; consumer percentages; comparison to other treatments; categorical safety/no-side-effects claim | Extends the rules beyond skincare; strongly supports P02, P04, P05 and P11 |

## Cohort B — ten additional cross-category pages

| Product/category | Direct observations | Effect on the rules |
| --- | --- | --- |
| [Hyaluronic + PGA 2% Face Serum](https://beminimalist.co/products/2-hyaluronic-acid) — facial serum | Ingredient/mechanism hierarchy; comparative clinical design and report number; consumer outcomes; immediate plumping language | Supports L03/L04 and P02; shows what useful substantiation metadata can look like |
| [SPF 60 Sunscreen](https://beminimalist.co/products/spf-60-silymarin) — sun care | Filter explanation; independent-lab method and obtained result; `all skin tones`, `reef safe`, pregnancy-safe and no-white-cast statements | Supports P02/P09; expands objective-claim detection beyond efficacy percentages |
| [Vitamin K + Retinal 1% Eye Cream](https://beminimalist.co/products/vitamin-k-retinal-01-eye-cream) — eye | Ingredient-to-benefit structure; supplier in-vitro results; physiological claims about vessels, lymphatic flow and root causes | Strong support for P02/P05/P11; supplier studies must not be presented as product outcomes without matching scope |
| [Glycolic Acid 8% Exfoliating Liquid](https://beminimalist.co/products/glycolic-acid-08-exfoliating-liquid-toner) — face/body/scalp | Multi-use product identity; free-acid mechanism; age limit and dermatologist-supervised safety test; no displayed quantified efficacy result | Supports L01/L03; shows that not every useful product page requires numeric efficacy copy |
| [L-Ascorbic Acid 8% Lip Treatment Balm](https://beminimalist.co/products/l-ascorbic-acid-08-lip-treatment-balm) — lip | Clear formulation structure but repeated `prevents`/`treats hyperpigmentation`; comparison to hydroquinone/kojic acid without an ad-ready study record on the page | Strengthens P02/P05/P11 and weakens any assumption that strong therapeutic verbs are rare brand exceptions |
| [Aquaporin Booster 5% Cleanser](https://beminimalist.co/products/aquaporin-booster-05-cleanser) — cleanser | Product name and mechanism are tightly connected; consumer results; claims about stimulating water channels and deeper hydration | Supports L03 but requires P02/P05 review for measurable and physiological claims |
| [Tranexamic 3% Face Serum](https://beminimalist.co/products/tranexamic-3-hpa) — pigmentation | Melasma/PIE/PIH positioning; consumer percentages/timeframes; melanogenesis and UVB claims; ingredient comparison with hydroquinone | Strongly supports P02/P05/P11 and the need for product-classification review |
| [Frizz Control Complex SPF 30 Hair Serum](https://beminimalist.co/products/frizz-control-complex-spf-30-hair-serum) — hair | Formulation-to-function explanation; hair-SPF claim; categorical all-hair-type/frizz-free wording; result timing appears in FAQ copy | Extends P02 and P11 to haircare and shows that claims may be distributed across page sections |
| [Body Care Kit](https://beminimalist.co/products/body-care-kit) — body/routine | Three exact constituent products and concentrations; step-by-step use; bacterial and melanin mechanisms; benefit claims inherited from component products | Supports P01/L01 and adds a dependency: a kit claim must remain traceable to each component's approved claim set |
| [Zinc Oxide + B5 Healing Ointment](https://beminimalist.co/products/pediatrics-zinc-oxide-b5-healing-ointment) — baby | Pediatrician/dermatologist authority; test population and sample size; quantified diaper-rash outcomes; eczema-prone and healing claims | Strongly supports P02/P03/P05 and demands higher caution for vulnerable-audience claims |

## Result: what held

The core language structure held across both cohorts:

- product or formulation identity is normally explicit;
- concern/benefit communication is specific rather than purely aspirational;
- ingredient or formulation is usually connected to a proposed function and
  benefit;
- pages commonly separate headline, mechanism, ideal user, usage, evidence and
  warnings into a scannable hierarchy; and
- objective, comparative, authority and testimonial claims are common enough
  that evidence handling must be a central scorer capability.

The review therefore strengthens P01–P03, P05–P06, P09, L01, L03, L04 and L06.
It also confirms that the same evidence and classification problems occur in
hair, body, lip, eye and baby products, not only facial skincare.

## Result: what changed

### Strong verbs are not automatically off-brand

`Reduces`, `repairs`, `prevents`, `treats`, `combats`, `protects` and similar
verbs recur across both cohorts. L02 must therefore evaluate whether the verb is
an exact approved, substantiated construction—not penalise every strong verb as
uncharacteristic. Calibrated verbs remain the safe generation default when an
approved claim is unavailable. Absolute constructions such as `eliminates`,
`guaranteed`, universal results, or categorical no-side-effect claims still
route through P04.

### Official product copy is evidence, not automatic ad approval

Several pages include useful study detail, but others combine ingredient
studies, supplier studies, product studies, consumer agreement, testimonials
and categorical claims without keeping their scopes visually adjacent. A claim
being published on an official product page does not prove that it is approved
for every channel, geography, audience or shortened ad construction. This adds
P11: **source-context transfer**.

### Product identity needs a canonical record

The site uses variants such as `2%`/`02%`, `5%`/`05%`, and
`Moisturizer`/`Moisturiser`. Compound names can also encode the sum of several
actives. L01/P01 must compare with a canonical SKU-and-channel record and allow
registered aliases; the scorer must not choose a global formatting convention
from frequency.

### Mechanistic science can itself create policy risk

The ingredient → function → benefit pattern is characteristic, but some pages
describe cellular repair, bacterial action, blood vessels, lymphatic flow,
melanin pathways, inflammation, eczema, melasma or healing. T05/L03 should
reward understandable explanation only after P05 checks whether the proposed
mechanism exceeds the product's approved cosmetic or product classification.

### The tone evidence remains mixed

The pages are generally direct and concern-led rather than customer-shaming,
so T01 and T02 remain consistent with the evidence. However, `powerful`,
`potent`, `dramatically`, `flawless`, `perfect`, and other promotional language
is common. T03 should target sensational promises and pressure, not ban a word
solely because it is promotional.

## Amendments carried into the scoring rules

1. Add P11 for product-page, ingredient-study, supplier-study, testimonial and
   packaging claims transferred into ads without an approved mapping.
2. Amend L01 to compare exact identity against a canonical product record with
   approved aliases, geography and channel—not a universal notation rule.
3. Amend L02 so claim strength and evidence determine acceptability; a strong
   verb is not automatically a language failure.
4. Amend T05/L03 so mechanistic explanation is rewarded only after policy and
   product-classification checks.
5. Keep the layered brand standard: declared intent sets the direction,
   current pages/ads show real usage, and policy plus approved internal records
   determine whether a claim can proceed.

## Limitations

- Product pages were reviewed as rendered text; this pass did not independently
  authenticate the linked studies or inspect every report image.
- `Best Seller` is a mutable merchandising label, not verified sales data.
- Product pages and paid ads serve different contexts and space constraints.
- No Minimalist internal approved-claims registry, SKU master, evidence files or
  legal decisions were available.
- The sample validates rule usefulness; it does not establish legal compliance
  of the pages themselves.

