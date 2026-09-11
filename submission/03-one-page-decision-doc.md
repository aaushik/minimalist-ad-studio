# Decision document — Minimalist Ad Studio

## What I built and the standard behind it

I built two connected surfaces: a product-URL generator that renders one
1080 × 1080 Meta creative with the real product image, and an independent image
scorer. The scorer reports only the brief's three dimensions—Policy & Claims,
Brand Tone and Brand Language—each out of 5, with a short reason and one action.
It advises rather than auto-approves or blocks export.

I derived the rules in layers, resolving conflicts in this order: applicable
law/guidance; approved internal SKU and claim records; Minimalist's declared
principles; current official product pages and paid ads; older editorial or
third-party material. Internal records were unavailable, which is a deliberate
`Evidence required` boundary rather than a guessed pass.

The evidence comprised Minimalist's About/Values pages; 22 product pages (the
initial two, ten displayed bestsellers, and ten additional unbadged products
across face, sun, eye, lip, hair, body and baby); 20 directly inspected static
Meta executions plus 54 exact-normalized Meta copy executions; and Indian
policy sources—ASCI Code Chapter I and disclaimer guidance, Cosmetics Rules
2020 Rule 36, and the CCPA misleading-advertisement/endorsement guidelines.

That produced three rule families:

- **Policy & Claims:** exact product/pack accuracy; substantiation for numeric,
  clinical, time-bound, comparative and authority claims; no absolute or
  drug-like promises; valid testimonials/result images; legible qualifications
  and complete offers; approved-claim and channel mapping; asset integrity.
- **Brand Tone:** respectful rather than shaming, informative rather than
  fear-based, calmly confident, transparent about expectations, science used
  to explain rather than impress, and factual promotion.
- **Brand Language:** exact product and concentration, evidence-matched efficacy
  verbs, ingredient/formulation → function → benefit, complete claim context,
  specificity over beauty filler, scannable hierarchy and a factual CTA.

The broader product sample changed the standard. Strong verbs such as
“repairs”, “prevents” and “treats” recur in official copy, so the scorer cannot
call them off-brand by vocabulary alone; their evidence and approved wording
matter. It also exposed `2%`/`02%` aliases, multi-active concentration totals,
and physiological mechanisms. Those require a canonical SKU record and policy
review, not frequency-based guesses. Official copy became evidence of actual
usage, not proof of paid-channel approval.

## What I cut and why

I cut synthetic product/lifestyle imagery, multiple placements and layout
selection, generated claim variants, accounts/saved projects, approval
workflow, and automatic publish/block decisions. The brief rewards defensible
judgment over breadth, and the expensive failure is a wrong ad going live.
One deterministic layout preserved product truth and created a usable PNG
quickly. Approval automation would be dishonest without Minimalist's claims
registry, SKU master, substantiation files and authorised policy owner.

## The decision I was least sure about

The hardest choice was whether official product-page language should pass the
scorer automatically. Doing so would make the demo smoother and reduce false
alarms. The 20-page validation showed why that was unsafe: pages mix product
studies, ingredient/supplier studies, testimonials and qualifications whose
scope can disappear when shortened for an ad; geography, audience and channel
approval are also unknown. I resolved it by adding a source-context-transfer
rule and failing to `Evidence required` when no approved ad mapping exists.
The prototype therefore helps a marketer fix visible problems but never
pretends to issue legal approval.

