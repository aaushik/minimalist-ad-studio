# Creative generation plan

## What the marketer does

1. Paste a Minimalist product URL.
2. Describe the ad in plain language: its goal, audience, tone, or any visual idea. For example: “Introduce this moisturiser to people with oily skin. Keep it calm and educational.”
3. Click **Generate** to get three visually different, finished square ads. Pick one to edit, download, or send to the existing scorer.

The description is the only creative input. The app infers the objective and
tone from it; there is no objective or tone dropdown. If the description is
vague, use a restrained product-introduction default.

## How source design inspirations work

Keep a small, curated library of five existing ad images from the
[static ad corpus](research/current-ads/static/MANIFEST.md). Each reference
has a design card that tells the generator what visual structure to borrow.
These are **creative directions**, not rigid HTML templates.

| Direction and source image | Borrow from it | Reserve space for | Do not copy |
| --- | --- | --- | --- |
| [Product splash](research/current-ads/static/S005-hydrating-shampoo-splash.jpg) | Clean white scene with restrained water motion. | Product in the centre; short headline above. | Shampoo pack, launch badge, or shampoo claims. |
| [Editorial detail](research/current-ads/static/S004-hydrating-shampoo-detail.jpg) | Uneven balance of product and explanatory whitespace. | Product on the right; factual copy on the left. | Shampoo pack, ingredient percentages, or source wording. |
| [Ingredient grouping](research/current-ads/static/S002-sensitive-skin.jpg) | Airy grouping and light texture. | Product below; one supported ingredient or benefit above. | Extra products or sensitive-skin claim unless this product supports it. |
| [Routine grid](research/current-ads/static/S006-oil-control-kit.jpg) | Modular areas and fine connector lines. | Product in one area; supported facts in others. | A multi-product routine unless the URL actually represents a kit. |
| [Commerce stage](research/current-ads/static/S001-freebie-square.jpg) | Simple product stage with strong purchase hierarchy. | Product below; price and CTA in open space. | Hand, other products, freebie badge, or promotion unless verified. |

The app chooses three different directions suited to the product category
and the marketer's description. The marketer does not have to select or
understand the source references. If the description names a visual idea,
favor one matching direction and make the other two visibly different.

The source images inform the five written design cards. Do not pass a complete
source ad to the tested Cloudflare model: the trial copied its product and
claims into new scenes even when the prompt explicitly forbade that. A neutral
design seed made from the card can guide a generated background, while the app
places the real product photograph and factual copy afterward. The visual
quality and variety of this approach still need validation.

Every prompt also carries the same short guardrails: square ad, restrained
Minimalist-style palette, clear space for the real product photo and readable
copy, one message, no invented product or offer, no source-ad text or logo, no
before/after result, and no visual claim unsupported by the page. Product name,
price, ingredient percentages, and factual copy come from the current URL,
not from the inspiration image. The app uses the design card to place the
original product photo and copy after scene generation.

## How each ad is made

1. Read the product page for its real photograph, title, price, and supported product facts.
2. Read the marketer's description for goal, tone, audience, and visual requests. Build three briefs with different visual directions and message angles. An awareness request introduces the product; an educational request explains a verified fact; a sales request emphasizes the product, current price, and CTA. A retargeting request makes no claim about a shopper's actual behavior, and no brief invents an offer.
3. Give Cloudflare a source-derived neutral design seed and a visual brief to create an **empty scene** with space for product and copy. Reject scenes with stray text or fabricated packaging.
4. Place the unmodified product photograph and editable, page-supported copy in the finished ad. Each direction defines different placement and hierarchy, so the finished ads do not share one layout.
5. Show all three drafts side by side. The existing editor, PNG export, and scorer operate on the selected draft.

This is one pipeline for every supported Minimalist product URL. Product name,
photo, price, category, and copy facts come from the URL entered for that run;
none are hardcoded to a particular product. A design reference supplies visual
structure only, so a shampoo reference can inspire the spacing of a serum ad
without bringing shampoo packaging or claims into it. If a page lacks a fact
needed for a copy angle, choose another supported angle or leave it for the
marketer to complete.

Claude can help curate the five references and write their visual briefs once;
the first app version only needs one image service at runtime.
Nano Banana Pro remains an alternative if a short Cloudflare trial produces
poor scenes. There is no need to build both image services into the app.

## Cloudflare trial result (2026-09-20)

The trial produced **eight images**: five with a product photo plus a full
source ad, two with a neutral design seed, and one empty background. One
additional full-reference request was rejected by Cloudflare before it
returned an image. The five full-reference scenes copied or fabricated product
packaging and text. Supplying the product photo with a neutral seed still
fabricated packaging. An abstract seed with a prompt for an empty scene
produced a clean background, but it closely followed the seed and has not yet
shown enough variety for three distinct ads. These outputs are a feasibility
test, not finished ads. Do not implement the full-reference approach as the
production flow.

A second trial asked Cloudflare FLUX.2 Klein 9B for **complete ads**, using the
real product photo as its only image reference and the source design direction
as text. It produced three different layouts with headlines and CTAs, shown in
the [complete-ad trial gallery](prototypes/cloudflare-full-ad-trial/index.html).
The model distorted the small text on the product packaging; one output also
duplicated the brand word. These are layout concepts, not publishable product
ads. The app's output still needs to be a complete ad image: generate the
visual scene and layout direction, then render the exact product photo and
verified wording into that image before showing the three final choices.

A [three-ad hybrid Vitamin B5 trial](prototypes/cloudflare-hybrid-b5/README.md)
then generated scenes without passing the product photo to Cloudflare and
composited the original pack shot and exact text afterward. The final images
preserve the label. However, all three generated scenes still contained a
fabricated blank tube, and two contained stray lettering. Opaque layout regions
masked those defects after visual inspection. That proves the product-photo
compositing step for this SKU, but the scene-only prompting step is not reliable
enough for an automatic URL-driven flow yet.

## First validation

Build the URL-driven flow once. Use Vitamin B5 only as an initial smoke test,
then generate three ads each for representative cleanser, sunscreen, serum,
haircare, and kit URLs from the existing
[20-product validation set](research/04-product-page-validation.md). Inspect
that each run uses its own product photograph and facts, and that the visual
directions suit the product and description.

## Done when

For any supported product URL, the app returns three ads that differ visibly
in scene, composition, and message. Changing the product URL changes the
product image and facts; changing the description changes the message and
suitable inspiration choices. The real product photo, claims, price, editing,
download, and scorer handoff remain accurate for every draft.
