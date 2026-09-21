# Cloudflare complete-ad trial

The earlier eight-image trial explicitly asked Cloudflare for empty scenes, not
complete ads. This follow-up used FLUX.2 Klein 9B and asked for the product,
headline, product line, and CTA in each finished square image. The three
prompts used design directions derived from the source ads as text, and the
real product photo as the single image reference. See `prompts.json` for the
exact prompts and `index.html` for the gallery.

Result: three distinct complete-ad images were generated. Large headlines and
CTAs are mostly readable. The model distorted fine print on the product pack;
the editorial version also duplicated the brand word and omitted part of the
requested product line. The results are useful layout concepts, but cannot be
published as accurate product ads. A production output still needs the exact
product photo and verified copy placed into the final image, or a stronger
image model that preserves both reliably.
