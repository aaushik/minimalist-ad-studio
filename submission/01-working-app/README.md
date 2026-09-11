# 1. Working app

**Open the deployed app:** <https://nudge-new-assignment.vercel.app>

The app has two connected but independently usable surfaces:

- **Ad Generator** accepts a public Minimalist product URL, reads the product
  data, composes a 1080 × 1080 static Meta ad with the real product photograph,
  and exports a PNG.
- **Scorer** accepts the generated creative or an arbitrary uploaded static ad.
  It returns separate scores out of 5 for Policy & Claims, Brand Tone and Brand
  Language. Every score has a short reason and one prominent action.

## Evaluator flow

1. Leave the example Vitamin B5 URL in place and select **Generate ad**.
2. Edit the draft if desired, then use **Download PNG** or **Send to scorer**.
3. In Scorer, inspect the three dimension cards. The generated image is passed
   in memory; it is not uploaded to a public asset host.
4. To test independence, open **Scorer**, upload any JPG, PNG or WebP static ad,
   and select **Score ad**.

The generator and scorer are deliberately decoupled. A marketer can iterate
without review, while the same scorer can inspect work made outside this tool.
Scoring does not block export in this prototype because there is no approved
claims registry or authorised reviewer workflow to support a trustworthy
automatic approval decision.

## Local setup (optional)

```bash
git clone https://github.com/aaushik/minimalist-ad-studio.git
cd minimalist-ad-studio
npm install
cp .env.example .env.local
# Add GEMINI_API_KEY to .env.local for image reading
npm run dev
```

Open <http://localhost:3000>. The generator works without a key. Without a
Gemini key, the scorer fails closed to human visual review rather than issuing
a false pass. The production key is stored server-side in Vercel and is never
exposed as a `NEXT_PUBLIC_*` variable.

## Known URL boundary

The happy path is a live `beminimalist.co` product detail URL that exposes the
store's public Shopify product JSON. Collection pages, search pages, bundles
without a standard product record, other domains, removed/draft products, and
pages blocked by bot protection are not guaranteed. If fetching fails, the
existing draft remains editable and a product image can be uploaded manually.

## Stack and visual-production choice

The app is Next.js and TypeScript, hosted on Vercel. The generator uses
HTML/CSS composition and the actual product photograph instead of fabricating
packaging with an image model. Gemini 3.5 Flash-Lite reads uploaded creatives;
deterministic application code validates rule IDs and computes the scores.

