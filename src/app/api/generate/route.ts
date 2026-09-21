import { NextResponse } from "next/server";
import { z } from "zod";

import { createCloudflareServices } from "@/lib/generation/cloudflare";
import { generateCreativeSet } from "@/lib/generation/generate";
import { fetchProductCreative } from "@/lib/product";

export const runtime = "nodejs";
export const maxDuration = 60;

const requestSchema = z.object({
  url: z.string().trim().min(1, "A product URL is required."),
  brief: z.string().trim().min(1, "Add a short creative brief.").max(600),
});

export async function POST(request: Request) {
  try {
    const parsed = requestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Check the product URL and brief." },
        { status: 400 },
      );
    }

    const product = await fetchProductCreative(parsed.data.url);
    const result = await generateCreativeSet({
      product,
      brief: parsed.data.brief,
      services: createCloudflareServices(),
    });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to generate creatives.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

