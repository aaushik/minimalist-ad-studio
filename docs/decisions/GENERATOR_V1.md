# Generator v1 decision record

## Decision

Generate one 1080 × 1080 Meta placement by composing HTML/CSS around the real
product photograph from the submitted Minimalist product page. Export the
composition as a PNG in the browser.

## Why

- The assignment requires one usable rendered placement; one polished size is
  a more honest v1 than shallow multi-format support.
- A real pack shot avoids fabricating packaging, concentration, size, or other
  product details for a brand built around transparency.
- Programmatic composition has no per-image model cost.
- Page-derived copy remains editable because source metadata can be incomplete
  and a marketer must remain responsible for deliberate changes.

## Product ingestion

The server validates the host and extracts the Shopify product handle. It uses
the store's public product JSON for title, variants, price, tags, and product
images, plus the canonical product page's Open Graph description and visible
proof-point labels. If the richer page fetch fails, core product JSON can still
produce a draft. The UI also supports manual copy edits and a replacement
product image.

## Explicit cuts

- No synthetic product or lifestyle imagery.
- No alternate placement sizes or layout selection yet.
- No generated claims beyond constrained phrases derived from product tags.
- No login, saved projects, or approval workflow.
- No automatic “approved” state before the scorer exists.

The output is labelled as a draft and says that final review is still required.
