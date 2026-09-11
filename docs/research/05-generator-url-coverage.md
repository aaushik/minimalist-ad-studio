# Generator URL coverage check

Date checked: 2026-09-11

The deployed `/api/product` endpoint was exercised against all 20 product URLs
listed in `04-product-page-validation.md`. Requests were made in four concurrent
workers and checked for a successful response, non-empty supporting copy, and a
usable product image URL.

Result: **20/20 loaded; 20/20 were export-ready.**

The cohort covered face, sun, eye, lip, hair, body/kit, and baby products. This
is evidence of broad compatibility with the current storefront, not a guarantee
for every future product page.

## Known unsupported URL shapes

- malformed or incomplete URLs;
- non-HTTPS URLs;
- hosts other than `beminimalist.co` and `www.beminimalist.co`;
- URLs without a `/products/{handle}` path, including collection-only, search,
  and homepage URLs;
- removed or unpublished product handles;
- products without public Shopify product JSON or a product image hosted on the
  expected Shopify CDN.

If the optional full-page metadata read fails while core Shopify product data
still succeeds, the app loads the available product facts but requires the
marketer to enter supporting copy before export.
