import { NextResponse } from "next/server";

import { fetchProductCreative } from "@/lib/product";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { url?: unknown };
    if (typeof body.url !== "string") {
      return NextResponse.json({ error: "A product URL is required." }, { status: 400 });
    }

    const product = await fetchProductCreative(body.url);
    return NextResponse.json({ product });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load this product.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
