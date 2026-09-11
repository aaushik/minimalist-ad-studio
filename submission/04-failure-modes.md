# 4. Top production failure modes

These are harms a technically functioning product can cause, not software bugs.
They are ordered by potential cost.

## 1. A risky claim receives reassuring output and is published

**Bad outcome.** The model misses small copy, a qualifier, visual implication or
claim context; the score looks safe; spend scales an unsupported or misleading
ad. The result can be takedown, wasted media spend, regulatory exposure and
loss of trust.

**Before launch.** Do not let the score publish or approve an ad. Require a
human claims owner for new, high-spend, numeric, comparative, therapeutic,
vulnerable-audience and authority claims. Connect an approved claim registry
with exact wording, evidence, channel, geography and expiry. Build a labelled
holdout set weighted toward false passes, and set launch thresholds on that
failure—not average model accuracy.

**After launch.** Audit a sample of live ads and every high-risk override,
compare model output with legal decisions, and create an incident loop that can
disable a rule/model version and notify affected campaigns.

## 2. Stale or incomplete rules turn past usage into false approval

**Bad outcome.** Product pages, paid ads and merchandising copy are treated as
an approval database. Claims change, evidence expires, products are reformulated
and channel/geography rules differ. The system consistently recommends language
that was once published but is no longer valid—or never was approved for this
use.

**Before launch.** Give every claim and rule an owner, source, effective date,
review date, applicable SKU, audience, geography and channel. Keep law and
approved internal records above observed brand usage. When a mapping is absent
or stale, return `Evidence required`; never infer approval from a product page.

**After launch.** Schedule policy and brand-standard reviews, ingest formulation
and claim withdrawals, monitor repeated reviewer overrides, and re-score active
creative when a source record changes.

## 3. Teams optimise for the score instead of safe, effective advertising

**Bad outcome.** A precise-looking 1–5 score creates automation bias. Marketers
make superficial wording changes, accept a plausible but unapproved suggested
replacement, or flatten every ad into generic “safe” language. Review gets
faster while either policy risk or creative performance gets worse.

**Before launch.** Keep the three dimensions separate and avoid an overall
average or “approved” badge. Show the concrete reason, action and missing
evidence. Label suggestions as drafts, require claim-owner sign-off where
evidence is needed, and train users that a high score is triage—not approval.

**After launch.** Capture override reasons and whether actions were useful;
measure false passes, false blocks, review time and performance impact together.
Regularly review whether the scorer is driving repetitive copy or unsafe
workarounds, then recalibrate rules with brand, legal and performance teams.

