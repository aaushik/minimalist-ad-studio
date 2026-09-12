"use client";

import { ChangeEvent, useId, useState } from "react";

import { REVIEW_DIMENSIONS } from "@/lib/scoring/types";
import type { BrandAssessment, ReviewDimension, ReviewInput, ReviewResult } from "@/lib/scoring/types";

type AdReviewerProps = {
  input: ReviewInput;
  result: ReviewResult | null;
  isReviewing: boolean;
  error: string;
  onInputChange: (input: ReviewInput) => void;
  onReview: (input: ReviewInput) => Promise<void>;
};

const DIMENSION_META: Record<ReviewDimension, { label: string; question: string }> = {
  policy: { label: "Policy & claims", question: "Is the ad substantiated, compliant and legally safe?" },
  tone: { label: "Brand tone", question: "Does it sound like Minimalist rather than a generic skincare ad?" },
  language: { label: "Brand language", question: "Are its vocabulary, naming and claim structure on-brand?" },
};

export function AdReviewer({
  input,
  result,
  isReviewing,
  error,
  onInputChange,
  onReview,
}: AdReviewerProps) {
  const uploadId = useId();
  const [fileName, setFileName] = useState("");
  const [imageError, setImageError] = useState("");

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImageError("");

    try {
      const imageDataUrl = await prepareImageForReview(file);
      setFileName(file.name);
      onInputChange({ source: "upload", imageDataUrl });
    } catch (uploadError) {
      setImageError(uploadError instanceof Error ? uploadError.message : "That image could not be prepared.");
    }
  };

  return (
    <section className="review-shell" aria-labelledby="scorer-title">
      <aside className="review-input-panel">
        <div className="step-heading">
          <span>01</span>
          <div>
            <h2 id="scorer-title">Add a creative</h2>
            <p>Upload a static ad, or send the current generated ad here.</p>
          </div>
        </div>

        <label className={`review-dropzone ${input.imageDataUrl ? "has-image" : ""}`} htmlFor={uploadId}>
          <input id={uploadId} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleUpload} />
          {input.imageDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={input.imageDataUrl} alt="Creative selected for scoring" />
          ) : (
            <div>
              <UploadIcon />
              <strong>Upload PNG, JPEG or WebP</strong>
              <span>Images are resized before scoring</span>
            </div>
          )}
        </label>
        {fileName ? <p className="selected-file">Selected: {fileName}</p> : null}
        {input.source === "generator" ? <p className="selected-file">Generated creative received and queued for scoring.</p> : null}
        {imageError ? <p className="input-error">{imageError}</p> : null}

        <button
          className="primary-button"
          type="button"
          onClick={() => onReview(input)}
          disabled={isReviewing || !input.imageDataUrl}
        >
          {isReviewing ? "Scoring creative…" : "Score this creative"}
          <span aria-hidden="true">→</span>
        </button>
        <p className="review-privacy-note">
          With Gemini configured, the image is sent securely from the server for analysis. Free-tier usage may be used by Google to improve its products.
        </p>
        {error ? <div className="status-message error"><span className="status-dot" />{error}</div> : null}
      </aside>

      <section className="review-output-panel" aria-live="polite" aria-label="Scorer output">
        {!result && !isReviewing ? <ReviewEmptyState /> : null}
        {isReviewing ? <ReviewLoading /> : null}
        {result && !isReviewing ? <ReviewOutput result={result} /> : null}
      </section>
    </section>
  );
}

function ReviewOutput({ result }: { result: ReviewResult }) {
  if (!result.scoringApplicable) {
    return (
      <div className="review-results">
        <BrandAssessmentNotice assessment={result.brandAssessment} />
        <section className="scoring-not-applicable">
          <p>Scoring not applicable</p>
          <h2>Minimalist scores are not shown.</h2>
          <span>{result.summary}</span>
        </section>
        <p className="scorer-disclaimer">This scorer is calibrated specifically for Minimalist advertising.</p>
      </div>
    );
  }

  return (
    <div className="review-results">
      <BrandAssessmentNotice assessment={result.brandAssessment} />
      <section className="scorecard-heading">
        <div>
          <p>Creative scorecard</p>
          <h2>Three dimensions. Three clear actions.</h2>
        </div>
        <span>{result.engine === "gemini+rules" ? "Gemini vision + documented rules" : "Documented rules only"}</span>
      </section>

      <section className="dimension-score-list" aria-label="Scores by dimension">
        {REVIEW_DIMENSIONS.map((dimension, index) => {
          const dimensionScore = result.dimensionScores[dimension];
          const metadata = DIMENSION_META[dimension];
          return (
            <article className={`dimension-score-card score-${dimensionScore.score}`} key={dimension}>
              <header>
                <div className="dimension-title">
                  <span>0{index + 1}</span>
                  <div>
                    <h3>{metadata.label}</h3>
                    <p>{metadata.question}</p>
                  </div>
                </div>
                <div className="score-value" aria-label={`${dimensionScore.score} out of 5`}>
                  <strong>{dimensionScore.score}</strong><span>/5</span>
                </div>
              </header>
              <div className="score-explanation">
                <span>Why this score</span>
                <p>{dimensionScore.explanation}</p>
              </div>
              <div className="score-action">
                <span>Action</span>
                <p>{dimensionScore.action}</p>
              </div>
              {dimensionScore.ruleIds.length ? (
                <small>Triggered rules: {dimensionScore.ruleIds.join(", ")}</small>
              ) : null}
            </article>
          );
        })}
      </section>

      {result.limitations.length ? (
        <p className="scorer-note"><b>Note:</b> {result.limitations.join(" ")}</p>
      ) : null}
      <p className="scorer-disclaimer">First-pass assistance only. Final claims, legal and brand approval stays with the reviewer.</p>
    </div>
  );
}

function BrandAssessmentNotice({ assessment }: { assessment: BrandAssessment }) {
  const title = assessment.status === "minimalist"
    ? "Looks like a Minimalist ad."
    : assessment.status === "unclear"
      ? "Brand identity is unclear."
      : assessment.detectedBrand
        ? `This appears to be an ad for ${assessment.detectedBrand}.`
        : "This appears to be an ad for another brand.";
  const message = assessment.status === "unclear"
    ? `The scores below assess this creative as if it were for Minimalist. ${assessment.explanation}`
    : assessment.explanation;

  return (
    <section className={`brand-assessment brand-${assessment.status}`} aria-label="Brand check">
      <div>
        <p>Brand check</p>
        <h2>{title}</h2>
      </div>
      <span>{message}</span>
      <small>{assessment.confidence} confidence</small>
    </section>
  );
}

function ReviewEmptyState() {
  return (
    <div className="review-empty">
      <span>02</span>
      <h2>Brand check first. Scores second.</h2>
      <p>Minimalist and unclear creatives receive three scores. Clearly different brands do not.</p>
      <div><b>Policy & claims</b><b>Brand tone</b><b>Brand language</b></div>
    </div>
  );
}

function ReviewLoading() {
  return (
    <div className="review-loading">
      <span />
      <h2>Checking the creative…</h2>
      <p>Identifying the brand first, then checking claims, tone, language, hierarchy and qualifications.</p>
    </div>
  );
}

async function prepareImageForReview(file: File) {
  if (!/^image\/(png|jpeg|webp)$/.test(file.type)) throw new Error("Use a PNG, JPEG, or WebP image.");
  if (file.size > 15 * 1024 * 1024) throw new Error("Use an image smaller than 15 MB.");

  const original = await readFileAsDataUrl(file);
  const image = await loadImage(original);
  const maxDimension = 1600;
  const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("This browser could not prepare the image.");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.86);
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("The image could not be read."));
    reader.readAsDataURL(file);
  });
}

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("The image format could not be opened."));
    image.src = source;
  });
}

function UploadIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M4 15.5V20h16v-4.5" />
    </svg>
  );
}
