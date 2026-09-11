import { NextResponse } from "next/server";

const ALLOWED_IMAGE_HOSTS = new Set(["cdn.shopify.com"]);

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const source = new URL(request.url).searchParams.get("url");
    if (!source) throw new Error("Missing image URL.");

    const sourceUrl = new URL(source);
    if (sourceUrl.protocol !== "https:" || !ALLOWED_IMAGE_HOSTS.has(sourceUrl.hostname)) {
      throw new Error("Unsupported image source.");
    }

    const response = await fetch(sourceUrl, {
      headers: { "User-Agent": "MinimalistAdStudio/0.1" },
      next: { revalidate: 86400 },
    });
    if (!response.ok) throw new Error("Unable to load the product image.");

    return new NextResponse(await response.arrayBuffer(), {
      headers: {
        "Content-Type": response.headers.get("content-type") ?? "image/jpeg",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load image.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
