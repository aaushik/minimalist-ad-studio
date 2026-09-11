import "server-only";

import { GoogleGenAI } from "@google/genai";

import { buildReviewPrompt } from "./prompt";
import { MODEL_REVIEW_JSON_SCHEMA, modelReviewSchema, type ModelReview } from "./schema";
import type { ReviewInput } from "./types";

function parseImageDataUrl(dataUrl: string) {
  const match = dataUrl.match(/^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/);
  if (!match) throw new Error("Use a PNG, JPEG, or WebP image.");
  return { mimeType: match[1], data: match[2] };
}

export async function reviewWithGemini(input: ReviewInput): Promise<ModelReview | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !input.imageDataUrl) return null;

  const image = parseImageDataUrl(input.imageDataUrl);
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-3.5-flash-lite",
    contents: [
      { text: buildReviewPrompt(input) },
      { inlineData: { mimeType: image.mimeType, data: image.data } },
    ],
    config: {
      temperature: 0.1,
      responseMimeType: "application/json",
      responseJsonSchema: MODEL_REVIEW_JSON_SCHEMA,
    },
  });

  if (!response.text) throw new Error("Gemini returned no review output.");
  return modelReviewSchema.parse(JSON.parse(response.text));
}

