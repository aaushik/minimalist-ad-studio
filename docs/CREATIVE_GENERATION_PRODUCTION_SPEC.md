# Creative generation production specification

## User flow

1. The user pastes a supported Minimalist product URL.
2. The user writes one free-form creative brief. There is no objective selector.
3. Five clickable examples help the user describe a product splash, editorial detail, ingredient story, routine grid, or commerce-focused ad.
4. Cloudflare interprets the likely objective, audience, tone, and visual intent from the brief.
5. The app returns exactly three drafts. Every draft has a different copy angle and design direction.
6. The user selects a draft, edits its exact copy, downloads a 1080 × 1080 PNG, or sends it to the existing scorer.

## Generation boundaries

- Product facts and the source product photograph come from the product page.
- Cloudflare Workers AI writes the three copy variants and plans their visual directions.
- The image model generates background plates only. It never receives or redraws the product photograph.
- The app overlays the original source photograph and exact editable text after image generation, preventing label and packaging distortion.
- A Cloudflare vision model rejects scenes containing text, logos, packaging, cosmetic containers, or people. A rejected scene is retried once and then replaced by a designed CSS background.
- Copy is checked against source facts. Unsupported numbers, risky claims, unknown fact citations, duplicate copy, or duplicate directions replace the whole model plan with factual deterministic variants.
- Missing credentials or model failures still return three usable drafts through the same safe fallbacks.

## Cloudflare models

- Copy and brief interpretation: `@cf/meta/llama-3.3-70b-instruct-fp8-fast`
- Background generation: `@cf/black-forest-labs/flux-2-klein-4b` (the lower-cost model is sufficient because it creates abstract scenes rather than products or typography)
- Background safety review: `@cf/meta/llama-3.2-11b-vision-instruct`

## Output contract

- Exactly three variants.
- Three unique design directions.
- Three unique headlines and supporting lines.
- One unchanged source product image shared across all variants.
- Each generated background records whether it came from Cloudflare or the safe fallback.
- All outputs remain marked as drafts that require review.
