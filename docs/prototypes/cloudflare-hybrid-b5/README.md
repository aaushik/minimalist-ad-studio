# Vitamin B5 hybrid Cloudflare trial

**Objective:** product introduction / awareness. The three drafts use different
visual directions and factual copy angles, but they all introduce the same
product and use an `Explore product` CTA. The commerce-styled third draft does
not test a separate conversion objective, price, or offer.

Review the [three final ads](three-final-ads.png), the [individual ads and source
scenes](index.html), and the [exact prompts](prompts.json). Each final PNG is
1080 × 1080. The source photo is the original Vitamin B5 product image saved
from the Minimalist product URL in the earlier prototype, and the final ads
composite its unchanged label pixels after image generation. A hand-traced mask
removes only the photo's background for this one-product test. The headline,
product details, and CTA are rendered as exact SVG text outside Cloudflare.

## Result

Cloudflare FLUX.2 Klein 9B generated three visually different scenes, but **all
three included a fabricated blank tube** despite explicit instructions to leave
the scene empty. The water and product-stage scenes also included invented
lettering. The final drafts cover that content with opaque layout areas and
place the real pack shot on top. This demonstrates that exact product and copy
can be preserved in a composed final image. It does **not** establish a fully
automatic, reliable background-generation flow: the masking was inspected and
adjusted for these three outputs.

The editorial direction needed the least repair. The other two required large
opaque regions to hide generated material. Before using this approach for
arbitrary product URLs, the pipeline would need a dependable way to reject
scenes containing products or stray text, a general product cutout or photo
panel, and a fallback background/layout. These remain review drafts, not
approved advertising.

## Reproduce

From the repository root, with `CLOUDFLARE_ACCOUNT_ID` and
`CLOUDFLARE_API_TOKEN` in `.env.local`:

```bash
node --import tsx scripts/prototype-cloudflare-hybrid-b5.ts
```

To reuse the three saved scenes and regenerate only the compositions without
calling Cloudflare:

```bash
node --import tsx scripts/prototype-cloudflare-hybrid-b5.ts --compose-only
```

The hand-traced mask applies only to the saved Vitamin B5 source photo. The
script writes its artifacts into this directory and does not alter the app.
