# Minimalist ad scorer — rules v0

Status: **Decision draft for review before implementation**

Rule sources, evidence boundaries and revision history are maintained in
[RULE_PROVENANCE.md](RULE_PROVENANCE.md). The expanded product-page validation
is recorded in
[04-product-page-validation.md](../research/04-product-page-validation.md).

The scorer evaluates only Minimalist ads. It accepts either pasted ad text or a
static image plus optional post copy. It always evaluates the ad against the
same Minimalist standard; it does not infer a different brand from the input.

Its primary output is an actionable edit brief, not a scorecard. A marketer
should be able to see what is off, where it is off, and the shortest path to a
reviewable correction without having to interpret the rules themselves.

## Scoring model

Use three required dimensions and no opaque weighted average:

1. **Policy and claims** — can this communication safely proceed, and what
   evidence or approval is missing?
2. **Brand tone** — does the ad take Minimalist's intended attitude toward the
   customer?
3. **Brand language** — does it use Minimalist's characteristic vocabulary,
   product naming, and claim construction?

Each dimension receives one status:

- `Pass`: no material issue found within the scorer's evidence boundary.
- `Revise`: the problem is actionable by the marketer without new evidence.
- `Evidence required`: an objective claim cannot be approved from the ad alone.
- `Human review`: interpretation, product classification, or legal judgement is
  required.
- `Block`: a known contradiction, prohibited claim, or high-risk misleading
  message must be fixed before publication.

The overall verdict is the most restrictive dimension status. Scores do not
cancel each other out: excellent tone cannot compensate for a risky claim.

## Finding format

Every finding must contain:

- exact text span or described visual region so the marketer can locate it;
- dimension and rule ID;
- status and severity (`low`, `medium`, `high`, `critical`);
- observed fact versus inference;
- rule source;
- **what is off**, in plain language;
- **why it matters**, tied to policy risk or the Minimalist standard;
- **how to fix it**, as a concrete edit or dependency rather than generic advice;
- **suggested replacement**, whenever a wording-only correction can be made
  without inventing product facts or substantiation;
- **done when**, describing the condition that will clear the finding; and
- confidence plus any missing input.

Each finding must offer the shortest applicable resolution path:

1. **Edit now** — give replacement copy or a specific visual/layout change when
   the issue can be fixed from the supplied ad and approved product facts.
2. **Verify or attach** — name the exact product fact, claim record, permission,
   offer term, or source needed. Do not say only `add evidence`.
3. **Escalate** — identify the decision and appropriate reviewer when legal,
   regulatory, or brand judgement is genuinely required.

Where an objective claim lacks evidence, give two useful paths when possible:
attach the precisely described substantiation, or remove the unsupported claim
and replace it with an approved, non-quantified product benefit. The scorer must
not fabricate the replacement benefit; if the approved claim set is unavailable,
it should identify the copy slot to replace and request an approved alternative.

Do not produce vague findings such as `make this more on-brand`, `tone this
down`, or `check compliance`. Translate every diagnosis into an edit, an exact
input request, or a named review decision.

## Reviewer-facing response

Present the result in this order:

1. **Verdict and one-sentence summary** — whether the ad can proceed and the
   most important reason.
2. **Fix first** — a severity-ordered checklist of blocking and high-impact
   changes.
3. **Detailed findings** — the full finding format above, grouped by policy and
   claims, brand tone, and brand language.
4. **Revised copy** — a consolidated version incorporating every safe
   wording-only fix. Clearly mark unresolved evidence or human-review slots
   instead of silently rewriting them.
5. **Resubmission checklist** — the smallest set of changes or attachments
   needed for the next review.

If no material problem is found, say what was checked and return `No changes
required`; do not manufacture suggestions merely to fill the response.

### Example actionable finding

**Flagged text:** `Erase Dark Circles & Puffiness – Fast!`

- **What is off:** `Erase` promises an absolute result, while `Fast` is an
  undefined time-bound claim (P04, P02, L02, and L04).
- **Why it matters:** the headline implies a certain and rapid outcome that the
  supplied ad does not substantiate; an eight-week footnote would not repair
  the stronger headline message.
- **Fix now:** remove the absolute verb and undefined speed claim.
- **Suggested replacement:** use an approved calibrated construction such as
  `Helps visibly reduce the appearance of dark circles and puffiness` only if
  that wording exists in the product's approved claim set.
- **Evidence path:** if a timeframe is retained, attach the matching study and
  verify its exact outcome, population, method, and timeframe.
- **Done when:** the headline matches an approved claim and any necessary study
  qualification is readable and proximate.

## Dimension 1 — Policy and claims

Objective: minimise false passes. The tool is a triage system, not automated
legal approval.

| ID | Trigger | Default result | Required action |
| --- | --- | --- | --- |
| P01 | Product name, concentration, use, warning, or depicted pack conflicts with the approved product record | Block / critical | Correct the ad or product selection |
| P02 | Numeric, percentage, time-bound, `clinically proven/tested`, or measurable efficacy claim | Evidence required / high | Match the exact wording, population, method, and timeframe to an approved substantiation record |
| P03 | `Dermatologist-approved/recommended/tested` or other expert/authority endorsement | Evidence required / high | Attach the relevant test, survey, approval scope, and date |
| P04 | Absolute result, cure, guarantee, `erase`, `eliminate`, `100%`, or inevitable transformation | Human review or Block / critical | Remove or replace with an approved calibrated claim; do not merely add a footnote |
| P05 | Wording may imply treatment of disease, physiological alteration, or a drug-like effect beyond approved cosmetic use | Human review / critical | Regulatory/legal review against the product classification and approved claim set |
| P06 | Before/after image, consumer result, or testimonial | Evidence required / high | Verify permission, source, timeframe, typicality, image alterations, and matching product use |
| P07 | A disclaimer is absent, unreadable, detached, or contradicts the main claim | Revise or Block / high | Make the qualification legible and consistent; weaken the headline if necessary |
| P08 | `Free`, cashback, discount, or limited-time promotion omits material eligibility or conditions | Revise / medium | Add clear terms or a proximate route to them |
| P09 | Claim is factual but no matching approved claim record exists | Evidence required / high | Route to claims owner; the scorer must not invent substantiation |
| P10 | Fabricated or materially altered product depiction, packaging, result image, or ingredient label | Block / critical | Replace with an approved asset or obtain explicit review |
| P11 | Claim is copied or adapted from a product page, packaging, testimonial, ingredient study, or supplier study without an approved ad-channel mapping | Evidence required / high | Match the exact ad wording, scope, qualifiers, geography and channel to an approved claim and substantiation record |

Policy sources:

- [ASCI Code, Chapter I](https://www.ascionline.in/the-asci-code/) requires
  objectively ascertainable claims to be capable of substantiation and rejects
  misleading implication, omission, ambiguity, or exaggeration.
- [Cosmetics Rules, 2020, Rule 36](https://cdsco.gov.in/opencms/resources/UploadCDSCOWeb/2022/cos_rules/Cosmetics%20Rules%202020.pdf)
  prohibits a cosmetic from purporting or conveying an idea that is false or
  misleading to the intended user.
- [ASCI disclaimer guidance](https://www.ascionline.in/the-asci-code-guidelines/)
  says a disclaimer can qualify or explain a claim but should not contradict
  its material message.

Required product-side dependency: an approved claim registry containing exact
claim wording, product/SKU, evidence owner, evidence reference, permitted
qualifiers, geography, channel, and expiry/review date. Without this registry,
the scorer can flag evidence-dependent claims but cannot honestly pass them as
substantiated.

## Dimension 2 — Brand tone

Objective: operationalise Minimalist's declared simple, honest,
science-supported, anti-fearmongering position without pretending every
published execution already meets it.

| ID | Test | Pass anchor | Revise/Block anchor |
| --- | --- | --- | --- |
| T01 | Respect rather than shame | Names a concern neutrally and preserves customer agency | Frames normal skin/hair as ugly, unacceptable, or the customer's fault |
| T02 | Inform rather than frighten | Explains the concern, product, or trade-off proportionately | Escalates anxiety, danger, or urgency beyond the evidence |
| T03 | Calm confidence | Specific, direct benefit communication | Miracle language, transformation theatre, excessive exclamation/emoji pressure |
| T04 | Transparent expectations | States what the product helps do and qualifies limits/timeframes | Implies certainty, universality, or instant success |
| T05 | Science as explanation | Names an ingredient, test, mechanism, or evidence basis that helps a decision | Uses `science-backed` or expert language only as an authority badge |
| T06 | Promotion without manipulation | Offer is clear and factual | Artificial scarcity, hidden conditions, or emotional pressure dominates |

Tone does not require every ad to be educational. A concise product hero or
offer can pass. A tone issue becomes `Block` only when it also creates a policy
problem; otherwise it is normally `Revise`.

Sources: Minimalist's official `About` and `Our values` pages establish the
declared intent. The 78-execution reference set supplies current examples and
counterexamples but does not overrule the declared boundary.

## Dimension 3 — Brand language

Objective: evaluate word choice and claim structure separately from emotional
tone.

| ID | Test | Pass anchor | Revise anchor |
| --- | --- | --- | --- |
| L01 | Exact product identity | Canonical product name or registered channel/geography alias, including product-specific concentration notation | Generic or incorrect name; concentration reformatted or inferred without an approved alias |
| L02 | Evidence-matched efficacy verbs | Exact approved benefit verb calibrated to its evidence; `helps`, `supports`, `targets`, and `visibly reduces` are safe defaults when permitted | Absolute or transformation construction such as `erases`, `eliminates`, `guarantees`, or `turns back time`; any strong verb without an approved claim match routes to policy review |
| L03 | Explanatory structure | Ingredient/formulation → relevant function → expected benefit, after P02/P05 checks | Ingredient list, mechanism, or `science` vocabulary with no understandable connection, or one that exceeds approved product classification |
| L04 | Claim completeness | Outcome plus relevant basis, timeframe, population/qualification, and source marker | Headline number or timeframe detached from its conditions |
| L05 | Specificity over filler | Concrete concern, formulation fact, use, or evidence | Generic `glow-up`, `maximum results`, `powerful solution`, or beauty cliché |
| L06 | Scannable hierarchy | Product/concern, supporting reason, qualification, CTA | Repetitive, internally inconsistent, or overloaded blocks |
| L07 | CTA fit | Direct, factual action such as `Shop now` or `Build your routine` | CTA implies an unproved result or adds pressure unsupported by the offer |

Language matching is not phrase-frequency matching. `Say goodbye` appears
frequently in the current corpus; frequency alone does not make it a preferred
construction when it overstates efficacy or creates fear/shame.

Strong verbs are not automatically off-brand. The expanded product-page review
found that `reduces`, `repairs`, `prevents`, `treats`, and similar verbs are part
of current Minimalist language across categories. They pass only when they match
an approved, substantiated claim for the selected product and context. When no
approved claim is available, calibrated language is the safe generation
default; the scorer must not invent a weaker benefit that is also unverified.

## Overall verdict logic

1. If any finding is `Block`, overall verdict is `Do not publish`.
2. Else if any finding is `Human review`, overall verdict is `Human review`.
3. Else if any finding is `Evidence required`, overall verdict is `Evidence
   required`.
4. Else if any finding is `Revise`, overall verdict is `Revise and rescore`.
5. Only otherwise return `Ready for reviewer approval`.

The last label is deliberately not `Legally approved`. The tool cannot replace
the accountable reviewer.

## Examples from the reference corpus

- `Up to 100% reduction in visible flakes & itching` → P02; evidence required.
  The visible independent-lab disclaimer should be checked for legibility and
  exact support under P07.
- `Erase Dark Circles & Puffiness – Fast!` → P04 and L02; likely human review
  plus rewrite even though the same ad contains an eight-week qualifier.
- `93% subjects agree firmness ... improved after 8 weeks` → P02 and L04;
  evidence record and complete study basis required.
- `Free bottle on purchase of 2 products` → P08; verify value, dates,
  eligibility, stock, and checkout conditions.
- Ingredient-led product hero with exact product name and a calibrated benefit
  → likely tone/language pass, while `clinically tested` still triggers P02.

## Decisions to approve before coding

1. **Brand-fit source:** use the layered standard—declared intent sets the
   boundaries; repeated current patterns provide examples inside them; conflicts
   are labelled `brand drift`.
2. **Release gate:** policy `Block`, `Human review`, and `Evidence required`
   prevent automatic approval. Tone/language-only issues request revision but
   do not claim legal risk.
3. **No fake certainty:** when product facts, image text, or evidence records are
   missing, the scorer returns the missing dependency rather than a confident
   pass.
