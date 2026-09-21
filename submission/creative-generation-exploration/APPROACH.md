# Minimalist Ad Studio: creative-generation approach

**Supplement to the Nudge.new PM assignment · 20 September 2026**  
**Status:** documented exploration and local prototypes. The deployed generator still uses its original HTML/CSS composition.  
**Latest prototype objective:** product introduction / awareness for Vitamin B5 10% Moisturizer.

## 1. The problem and the feedback

The first app already turns a Minimalist product URL into an editable 1080 × 1080 ad using the actual product photograph, page-derived copy and PNG export. It connects to an independent scorer. This was a reliable way to preserve the pack and label, but it reused one visual layout across products.

The follow-up feedback asked for four changes:

1. Produce a variety of ads using image generation, rather than repeating the same HTML/CSS template.
2. Select or seed design inspirations from existing Minimalist creatives.
3. Explore Claude guiding Nano Banana Pro to generate ads.
4. Adapt both the image and copy to an ad objective such as awareness, retargeting or sales.

I did not have Nano Banana Pro API access for this exploration, so I used Cloudflare FLUX.2 models to test the image-generation and reference-guidance questions. The Cloudflare results do not establish how Nano Banana Pro would perform.

## 2. The product decision I am testing

Minimalist puts ingredient identity and concentration on the front of the pack. If a model redraws that pack, a small text error becomes a product-truth error. The same applies to claims, prices and offers. I therefore separated **creative direction** from **product truth**: image generation can propose a scene and composition, while the final ad should use the original product photograph and exact, page-supported words. Page support is not legal approval; the scorer and a human claims owner still have separate roles.

The approach under test is a hybrid: generate a visual scene, inspect it for invented products or writing, and then compose the real pack and editable copy on top. This is the strongest accuracy-preserving approach among those tested so far. The scene-rejection and cross-product steps are not yet reliable enough to put it into the app.

## 3. How I chose source design inspirations

I reviewed a 20-execution static Meta sample alongside Minimalist product pages. I selected five existing creative structures as directions rather than templates:

- **Product splash:** bright studio space and restrained water movement; preserve an empty area for the real product.
- **Editorial detail:** an uneven product-and-copy balance with explanatory whitespace.
- **Ingredient grouping:** airy elements and texture around one supported ingredient or benefit.
- **Routine grid:** modular areas and fine connectors for verified facts, without inventing extra products.
- **Commerce stage:** a clear product stage, factual purchase hierarchy and CTA, without copying an unverified promotion.

Each direction has a written design card describing what to borrow, where the real product and copy belong, and what must not be copied. A design card may influence spacing, hierarchy or atmosphere; it does not authorize the source ad's pack, claims, price or offer. I stopped passing complete source ads to Cloudflare after the first test showed that it copied their content.

## 4. What I tested and learned

### 4.1 Original composed layout

The deployed app uses HTML/CSS and the product photo fetched from the submitted URL. It produces a real, editable, downloadable ad and avoids synthetic packaging. It gives little visual variety because the layout is shared across products. This remains the dependable fallback while generated outputs are unreliable.

### 4.2 Product photo plus full source ad: FLUX.2 Klein 4B

I provided the product photo and a full reference ad, asking Cloudflare to borrow only the design and leave an empty scene. Five images were returned across moisturiser and sunscreen directions; one additional request was rejected before an image was returned. The outputs copied or fabricated product packaging and source-ad text or claims despite the prompt. **Decision:** do not put a complete source ad into the proposed generation flow.

### 4.3 Neutral design-seed tests: FLUX.2 Klein 4B

I replaced the source ad with an abstract seed and compared three inputs: product plus seed, seed alone, and an empty-scene version. The product-plus-seed output still fabricated packaging. The abstract empty-scene output avoided a product and text, but stayed close to a simple seed and did not yet demonstrate enough variety. **Decision:** a neutral seed gives more control, but needs stronger visual validation before it can support three good ads.

### 4.4 Complete generated ads: FLUX.2 Klein 9B

I supplied the real Vitamin B5 photo as an image reference and described three source-derived directions in text: water motion, editorial, and commerce. Cloudflare generated three visibly different complete-ad concepts with mostly readable large headlines and CTAs. However, it redrew the pack and distorted its small label text; one concept duplicated the brand word and omitted part of the requested product line. Supplying the URL's real image as a reference was not enough to keep its pixels intact. **Decision:** treat these as layout concepts, not publishable product ads.

### 4.5 Hybrid Vitamin B5 compositions: FLUX.2 Klein 9B

For the next test I requested three scenes without passing a product photo to Cloudflare. I then placed a cutout from the original Vitamin B5 photograph and exact SVG text into three different 1080 × 1080 layouts. The objective was **product introduction / awareness** in all three; the commerce-styled third image was not a separate sales or retargeting test.

The final compositions preserve the original label pixels. Yet every Cloudflare scene still contained a fabricated blank tube, and two contained invented lettering. I covered those defects with opaque layout areas after inspecting each image. A hand-traced cutout mask was made for this one saved product photograph. **Decision:** the composition step works for this SKU, but prompting alone did not produce reliably empty scenes. The three outputs are review drafts, not an automated arbitrary-URL feature or approved ads.

## 5. Proposed marketer flow

This is the intended product behavior, not the current app behavior:

1. The marketer pastes a supported Minimalist product URL and describes the goal, audience, tone or visual idea in plain language. The description is the creative input; the app infers the objective rather than requiring a dropdown.
2. The app reads the current product photograph, title, variant, price and supported facts from that URL. Missing facts are left out or requested from the marketer rather than invented.
3. It creates three briefs with different source-derived design directions and message angles appropriate to the product and objective.
4. An image model creates scenes with reserved areas for product and copy. Scenes with stray writing, fabricated packaging or unsupported visual implications must be rejected or replaced with a safe fallback.
5. The app places the original product photograph and exact editable copy into each selected composition, then shows three finished square ads.
6. The marketer selects a draft, edits it, downloads the PNG or sends it to the existing scorer. A score helps review; it does not authorize publication.

The current prototype proves only parts of steps 4 and 5 for Vitamin B5. General scene screening, product extraction, three-choice UI and objective inference are not implemented.

## 6. How objective-specific output should differ

- **Awareness:** introduce the real product and one supported benefit in a calm, clear composition. The Vitamin B5 hybrid trial uses this objective and an “Explore product” CTA.
- **Education:** explain a verified ingredient or formulation fact, its function and a carefully scoped benefit. Do not promote a supplier or ingredient study into an approved finished-product claim.
- **Sales:** make the product, current price and factual CTA prominent. Include an offer only when its terms and availability can be verified.
- **Retargeting:** remind the viewer of the product or a supported feature without claiming to know their browsing behavior or inventing urgency.

The objective should alter the message angle, hierarchy and appropriate design directions, while the product image and factual boundaries remain the same. Only awareness has been prototyped; the other cases are a specification for further work.

## 7. Validation before app integration

The first gate is visual integrity: no generated product, stray text, misleading before/after implication or source-ad claim may remain in the final scene. The second is product integrity: the final pack photograph and exact copy must survive export. The third is variety: three outputs must differ meaningfully in scene, composition and message, not just color. The fourth is URL and objective coverage: test representative cleanser, sunscreen, serum, haircare and kit products, then awareness, education, sales and retargeting briefs.

A production-minded flow needs a dependable scene-rejection check, retry or fallback strategy, and a general way to place product photographs, including a photo panel when a clean cutout is unavailable. It also needs prompt/output logging and human review of a holdout set weighted toward wrong-product and false-claim failures. The existing scorer should remain an advisory review surface rather than an automatic approval gate.

## 8. Current state and evidence

**Completed:** one deployed composed generator; five documented design directions; Cloudflare reference, seed, complete-ad and hybrid experiments; three Vitamin B5 hybrid concept PNGs; exact prompts and visual galleries. **Not completed:** Nano Banana Pro or Claude-guided generation, objective-specific generation, automatic scene rejection, general product cutouts, integration of three choices into the app, or validation across product categories. The supplemental experiments are local and are not represented as live app features.

## 9. Vitamin B5 images in this folder

The first three PNGs are the **final hybrid review drafts**. They contain the original product photograph and exact rendered copy:

- [Water motion hybrid](01-water-motion-hybrid.png)
- [Editorial hybrid](02-editorial-hybrid.png)
- [Product-stage hybrid](03-product-stage-hybrid.png)

The next three PNGs are the **earlier direct-generation concepts**. They show the layout variety Cloudflare produced and the label inaccuracies that led to the hybrid test:

- [Water motion direct generation](04-water-motion-direct-generation.png)
- [Editorial direct generation](05-editorial-direct-generation.png)
- [Commerce direct generation](06-commerce-direct-generation.png)

More detailed trial evidence, including the raw generated scenes and exact prompts, remains in the repository under `docs/prototypes/cloudflare-trial/`, `docs/prototypes/cloudflare-full-ad-trial/`, and `docs/prototypes/cloudflare-hybrid-b5/`.
