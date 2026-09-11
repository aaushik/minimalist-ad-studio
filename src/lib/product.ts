export type ProductCreative = {
  sourceUrl: string;
  title: string;
  eyebrow: string;
  headline: string;
  supportingCopy: string;
  badges: string;
  detailLine: string;
  price: string;
  compareAtPrice?: string;
  size: string;
  cta: string;
  imageUrl: string;
};

type ShopifyImage = {
  src?: string;
};

type ShopifyVariant = {
  title: string;
  price: number;
  compare_at_price?: number | null;
  available: boolean;
  featured_image?: ShopifyImage | null;
};

type ShopifyProduct = {
  title: string;
  tags?: string[];
  price: number;
  compare_at_price?: number | null;
  featured_image?: string;
  images?: string[];
  variants?: ShopifyVariant[];
};

const ALLOWED_HOSTS = new Set(["beminimalist.co", "www.beminimalist.co"]);

export function parseMinimalistProductUrl(input: string) {
  let url: URL;

  try {
    url = new URL(input.trim());
  } catch {
    throw new Error("Enter a complete Minimalist product URL.");
  }

  if (url.protocol !== "https:" || !ALLOWED_HOSTS.has(url.hostname)) {
    throw new Error("For this prototype, use a beminimalist.co product URL.");
  }

  const match = url.pathname.match(/\/products\/([^/?#]+)/);
  if (!match?.[1]) {
    throw new Error("This does not look like a Minimalist product page.");
  }

  return {
    canonicalUrl: `https://beminimalist.co/products/${match[1]}`,
    handle: match[1],
  };
}

function decodeHtml(value: string) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function extractMetaDescription(html: string) {
  const match = html.match(
    /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["'][^>]*>/i,
  );
  return match?.[1] ? decodeHtml(match[1].trim()) : "";
}

function formatPrice(value: number | null | undefined) {
  if (typeof value !== "number") return undefined;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value / 100);
}

function deriveHeadline(title: string, tags: string[] = []) {
  const normalized = tags.map((tag) => tag.toLowerCase());
  const hasHydration = normalized.some((tag) =>
    ["hydration", "moisturization"].includes(tag),
  );
  const hasRepair = normalized.some((tag) => tag.includes("repair"));
  const hasSunCare = normalized.some((tag) => tag.includes("sun"));
  const hasOilBalance = normalized.some((tag) => tag.includes("oil"));

  if (hasHydration && hasRepair) return "Lightweight hydration.\nBarrier care.";
  if (hasSunCare) return "Everyday sun protection.";
  if (hasOilBalance) return "Targeted care for oily skin.";
  if (hasHydration) return "Hydration for every day.";
  return title;
}

function deriveEyebrow(title: string) {
  return title
    .replace(/\s+(face\s+)?(moisturizer|moisturiser|serum|cleanser|sunscreen)$/i, "")
    .toUpperCase();
}

function shortenCopy(description: string) {
  const firstSentence = description.split(/(?<=[.!?])\s/)[0] ?? description;
  if (firstSentence.length <= 145) return firstSentence;
  return `${firstSentence.slice(0, 141).trimEnd()}…`;
}

function normalizeImageUrl(value: string) {
  const url = new URL(value.startsWith("//") ? `https:${value}` : value);
  if (url.hostname !== "cdn.shopify.com") {
    throw new Error("The product image did not come from the expected store CDN.");
  }
  url.searchParams.set("width", "1000");
  return url.toString();
}

export async function fetchProductCreative(inputUrl: string): Promise<ProductCreative> {
  const { canonicalUrl, handle } = parseMinimalistProductUrl(inputUrl);
  const headers = { "User-Agent": "MinimalistAdStudio/0.1" };
  const [productResponse, pageResponse] = await Promise.all([
    fetch(`https://beminimalist.co/products/${handle}.js`, {
      headers,
      next: { revalidate: 3600 },
    }),
    fetch(canonicalUrl, { headers, next: { revalidate: 3600 } }).catch(() => null),
  ]);

  if (!productResponse.ok) {
    throw new Error("Minimalist did not return product data for this URL.");
  }

  const product = (await productResponse.json()) as ShopifyProduct;
  const pageHtml = pageResponse?.ok ? await pageResponse.text() : "";
  const selectedVariant =
    product.variants?.find((variant) => variant.available) ?? product.variants?.[0];
  const rawImage =
    selectedVariant?.featured_image?.src ?? product.featured_image ?? product.images?.[0];

  if (!rawImage) throw new Error("No usable product image was found.");

  const description = extractMetaDescription(pageHtml);

  return {
    sourceUrl: canonicalUrl,
    title: product.title,
    eyebrow: deriveEyebrow(product.title),
    headline: deriveHeadline(product.title, product.tags),
    supportingCopy: shortenCopy(description),
    badges: "",
    detailLine: product.title,
    price: formatPrice(selectedVariant?.price ?? product.price) ?? "",
    compareAtPrice: formatPrice(
      selectedVariant?.compare_at_price ?? product.compare_at_price,
    ),
    size: selectedVariant?.title ?? "",
    cta: "Explore product",
    imageUrl: normalizeImageUrl(rawImage),
  };
}
