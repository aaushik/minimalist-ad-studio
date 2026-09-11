# Ad sampling protocol

Status: Approved sampling frame

Date: 2026-09-11

## Coverage target

- Google text: take a seeded random sample of 50 creative IDs from the
  discoverable verified-advertiser inventory, then keep every unique message in
  that sample.
- Meta static images: retain the complete result set returned by the agreed
  official Ad Library filters (displayed by Meta as approximately 88 results),
  then deduplicate the full set into unique creative concepts. Do not subsample
  the Meta population before deduplication.
- Both retained sets should be spread across different product types; report
  the actual spread rather than forcing post-sampling substitutions.
- Additional independently discovered unique current creatives may be retained
  in a clearly labeled supplemental set, but must not be mixed into the official
  filtered population when reporting its results.

## Counting rules

- The unit of evidence is a **unique creative concept**, not an ad-library row.
- A crop, resize, recolour, placement variant, or recompression of the same
  concept counts once.
- A variant counts separately only when its claim, headline, offer, audience,
  product story, or creative argument materially changes.
- Product-page copy is not counted as an ad.
- Organic editorial content is not counted as an ad unless the source clearly
  identifies it as paid or sponsored creative.
- Third-party summaries are discovery leads. The underlying creative or ad copy
  must be directly inspected before it enters the 40-ad evidence set.

## Deduplication procedure

### Static image ads from Meta or Google Display

1. Group exact duplicate files using a cryptographic file hash.
2. Group resized, cropped, or lightly edited versions using perceptual image
   similarity plus extracted visible text.
3. Compare product, headline, supporting claim, offer, layout, and visual
   argument within each group.
4. Keep one canonical image when the differences are only mechanical.
5. Keep more than one only when a difference changes what the ad communicates.

Examples:

- Square and portrait versions of `Grab Your Freebie` are one concept.
- The same product photograph with a translated headline is one visual concept
  but may be separate language evidence; the distinction must be recorded.
- The same product with a testimonial in one ad and an ingredient mechanism in
  another is two concepts.

### Google text ads

Google responsive search ads can assemble multiple supplied headlines and
descriptions into different visible combinations. Counting every combination
would inflate the sample.

1. Normalize whitespace, capitalization-only differences, punctuation-only
   differences, and tracking parameters.
2. Deduplicate identical headline and description assets.
3. Group combinations that make the same product claim and use the same call to
   action.
4. Keep one canonical text ad per distinct message or claim structure.
5. Preserve materially different claims, offers, audiences, and calls to action
   as separate concepts.

### Human review boundary

Automated similarity only proposes duplicate groups. It does not make the final
semantic decision. Borderline groups are marked `review` and shown to the user
side by side before either example is removed from the evidence count.

## Evidence-set fields for deduplication

Each record will include:

- platform ad/library ID;
- media file hash, when available;
- perceptual image fingerprint, for static images;
- normalized visible text;
- duplicate-group ID;
- canonical/variant status;
- reason for keeping or excluding it; and
- human-review status for ambiguous groups.

## Product spread

The sample should cover as many of the following as are available without
forcing an artificial quota:

- acne and oil control;
- pigmentation and uneven tone;
- sunscreen and UV protection;
- moisturising and barrier support;
- anti-ageing and retinoids;
- cleansers and exfoliation;
- haircare;
- body care; and
- baby or sensitive-skin products.

## Record for each ad

- Stable sample ID.
- Static image or text.
- Source and direct link.
- Date observed and, when available, ad start date.
- Product and product type.
- Exact visible copy, preserving capitalization and concentration notation.
- Creative strategy, recorded descriptively rather than inferred as a rule.
- Evidence quality and any limitations.

## Holdout discipline

The collected current-ad corpus is for evidence collection and human review.
Once candidate rules are approved, a separate set of unseen ads will be
collected for scorer evaluation. The scorer will not be evaluated only on the
examples used to derive its standard.

## Current access status

- Google: verified advertiser identified as Uprising Science Private Limited;
  308 text creative IDs were discovered in the captured inventory and 50 were
  sampled without replacement using seed `20260911`.
- Meta: the exact official Ad Library URL was reproduced in an automated browser
  and displayed approximately 88 results with these filters: `Active ads`;
  impressions on or after `2026-01-11`; media type `Images and memes`. Infinite
  scrolling yielded 80 distinct Library IDs before the result set stabilised.
  The protocol is to retain the complete filtered population and deduplicate it,
  not draw a random sample. The gap between the approximate UI count and the 80
  loaded IDs remains an explicit reconciliation item.
