# Research log and corrections

This log distinguishes what was actually inspected from conclusions or
third-party interpretation. It should be updated whenever new evidence is
added.

## 2026-09-11 — Initial discovery

### Directly inspected

- 2 official brand-positioning pages: `About` and `Our values`.
- 2 official product pages: `Niacinamide 10% Face Serum` and `Retinol 0.3%
  Face Serum`.
- 2 official editorial articles: `Clean Beauty Means Safe and Sustainable
  Beauty` and `How to minimize open pores on your face`.
- 1 third-party paid-social index page from Motion.
- 0 underlying paid-ad videos watched directly.
- 0 high-resolution paid-ad images inspected directly.

### Third-party ad coverage

The Motion index labels its section “The 20 Most Recent Minimalistinc Ads on
Meta,” but this research pass did **not** inspect all 20 underlying ads. It read
descriptions of 6 distinct creative concepts visible in the index:

1. Manufacturing / behind-the-scenes video.
2. Offer-first product banner.
3. Sensitive-skin product-group image.
4. Hydrating shampoo feature-benefit image.
5. Creator-style sunscreen video.
6. Salicylic Acid demonstration / before-and-after video.

Only items 2–4 are static-image concepts relevant to the agreed prototype
scope. These are third-party descriptions, not yet primary visual evidence.
They cannot support final visual-brand rules until the images are inspected.

### Correction made after user challenge

An earlier discussion implied that Minimalist's own ads contained
fearmongering. The evidence collected did not support that statement.

What the evidence actually shows:

- Minimalist says the **beauty industry** contains inaccurate advice and
  fearmongering, and positions itself in opposition to that practice.
- An older Minimalist editorial article contains potentially anxiety- or
  shame-coded phrases. It is a blog article, not a paid ad.
- A third-party index describes one Minimalist ad opening with a close-up of
  acne. A problem visual is not sufficient, by itself, to classify an ad as
  fearmongering.

No claim that Minimalist's paid ads use fearmongering should be made from the
current sample.

### Current limitation

The paid-ad sample is not yet defensible for deriving brand-tone rules. Before
rules are proposed, the next research pass should directly inspect and record a
small, current, first-party or Meta Ad Library sample of static Minimalist ads.

### User-set evidence threshold

No brand rule will be proposed until 15–20 unique ads have been directly
reviewed for each agreed category. Recolours, crops, and copy variants of the
same underlying concept will not be counted as independent ads.

The sampling frame was resolved with the user as all verifiable unique current
creatives that can reasonably be discovered, with 20 unique static image ads
and 20 unique text ads as minimum coverage checks. Both sets should be spread
across different product types. The detailed counting rules are in
`02-ad-sampling-protocol.md`.

The current-ad files and manifests are stored separately under `current-ads/`.
They will later be compared with declared brand principles; publication by the
brand is evidence of current practice, not automatic proof that an execution
matches the declared standard or policy requirements.

### 2026-09-11 — Meta population observed in human browser

The user reported approximately 88 Meta Ad Library results using:

- Active status: `Active ads`
- Impressions by date: on or after `11 Jan 2026`
- Media type: `Images and memes`

The exact filtered URL was subsequently reproduced by the agent. The page also
displayed approximately 88 results. Infinite scrolling exposed 80 distinct
Library IDs before three consecutive stable rounds. Meta's displayed count is
approximate, so the difference must be investigated rather than silently
inventing eight records.

The user decided to retain the complete filtered Meta population and then
deduplicate it into unique creative concepts. No 50-ID Meta sample will be
drawn. Raw records, media, and associated copy will remain intact so every
deduplication decision can be audited.

### 2026-09-11 — Meta reference extraction and first review

- Captured 80 accessible Library records with associated card copy, links,
  dates/status, and image metadata.
- Downloaded 94 creative-sized images with zero failures before the CDN URLs
  expired.
- Exact SHA-256 hashing produced 75 distinct files.
- Exact-normalized copy produced 54 distinct executions.
- Joining records by shared exact copy or exact image hash produced 51
  automated candidate groups. This is not final semantic deduplication.
- Directly inspected 20 product-diverse static executions.
- Found both restrained ingredient-led executions and aggressive promotional
  or efficacy language. Current publication is therefore not being treated as
  automatic proof of brand fit or policy compliance.

### Available-ad count check

- Motion's public Minimalistinc index reported **166 active Meta ads** when
  checked on 2026-09-11.
- This is a third-party count of active ad records, not a verified count of
  unique creative concepts. A concept may appear as several placement, aspect
  ratio, or copy variants.
- The exact Meta Ad Library result page later loaded successfully and its
  approximate count was independently reproduced. Eighty distinct Library IDs
  were captured from the dynamically loaded result cards.
- Google Ads Transparency Center loaded, but its results are rendered
  dynamically and did not expose a Minimalist advertiser count in the retrieved
  HTML.
- Therefore, no combined Meta + Google total is currently verified. The
  official counts need to be recorded manually from each transparency UI with
  region, status, format, and observation date attached.

### 2026-09-11 — Expanded product-page validation

- Reviewed 20 additional official India product pages: ten selected in order
  from the Best Sellers collection after excluding the two previously reviewed
  pages, and ten additional pages without an inspected `Best Seller` badge
  across facial care, sun care, hair, body/routine, eye, lip and baby care.
- The website collection taxonomy and badges are not perfectly aligned, so the
  second cohort is described as unbadged rather than as a verified low-sales
  cohort.
- The ingredient/formulation → function → benefit structure held across
  categories, as did product-specific naming and scannable product hierarchy.
- Strong verbs such as `reduces`, `repairs`, `prevents` and `treats` were common
  in both cohorts. L02 was amended so those verbs are not automatically treated
  as off-brand; evidence and approved wording control their acceptability.
- Numeric, comparative, authority, physiological and therapeutic-style claims
  remained common. This strengthened P02/P03/P05 and added P11: official
  product-page publication is not automatic approval to transfer a claim into
  an ad.
- Full findings are in `04-product-page-validation.md`; the rule-by-rule source
  of truth is `docs/scorer/RULE_PROVENANCE.md`.
