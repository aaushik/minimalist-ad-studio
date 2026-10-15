# 1. Working app

**Open the deployed app:** <https://nudge-new-assignment.vercel.app>

The app has two connected but independently usable surfaces:

- **Ad Generator** accepts a public Minimalist product URL, reads the product
  data, composes a 1080 × 1080 static Meta ad with the real product photograph,
  and exports a PNG.
- **Scorer** accepts the generated creative or an arbitrary uploaded static ad.
  It checks supplied copy against Policy & Claims, Brand Tone and Brand Language,
  with a short reason and action for each score. Generator handoffs carry
  Minimalist product context; uploaded images need a human brand and visual check.

## Evaluator flow

1. Leave the example Vitamin B5 URL in place and select **Generate ad**.
2. Edit the draft if desired, then use **Download PNG** or **Send to scorer**.
3. In Scorer, inspect the three dimension cards. The generated image is passed
   in memory; it is not uploaded to a public asset host.
4. To test independence, open **Scorer**, upload any JPG, PNG or WebP static ad,
   paste its visible copy, and select **Score this creative**. Text is checked
   against the Minimalist standard; visual review is explicitly assigned to a
   human.

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
npm run dev
```

Open <http://localhost:3000>. No Gemini or Cloudflare credentials are needed.
The scorer routes visual checks to human review rather than issuing a false
pass on image content it cannot read.

## Known URL boundary

The happy path is a live `beminimalist.co` product detail URL that exposes the
store's public Shopify product JSON. Collection pages, search pages, bundles
without a standard product record, other domains, removed/draft products, and
pages blocked by bot protection are not guaranteed. If fetching fails, the
existing draft remains editable and a product image can be uploaded manually.

## Stack and visual-production choice

The app is Next.js and TypeScript, hosted on Vercel. The generator uses
HTML/CSS composition and the actual product photograph. The scorer applies
deterministic rules to supplied copy; image content needs manual review.
