import { NextResponse } from "next/server";
import { z } from "zod";

import { reviewAd } from "@/lib/scoring/review";

export const runtime = "nodejs";

const requestSchema = z.object({
  source: z.enum(["upload", "generator"]),
  imageDataUrl: z.string().max(7_000_000).optional(),
  postCopy: z.string().max(3_000).optional(),
  knownText: z.string().max(5_000).optional(),
  productContext: z.object({
    title: z.string().max(200).optional(),
    url: z.string().url().max(2_000).optional(),
    description: z.string().max(2_000).optional(),
  }).optional(),
}).refine((value) => value.imageDataUrl || value.postCopy || value.knownText, {
  message: "Upload an image or provide ad copy to review.",
});

export async function POST(request: Request) {
  try {
    const input = requestSchema.parse(await request.json());
    return NextResponse.json(await reviewAd(input));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Invalid review input." }, { status: 400 });
    }
    return NextResponse.json({ error: "The creative could not be reviewed." }, { status: 500 });
  }
}

