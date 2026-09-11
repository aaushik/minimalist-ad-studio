"use client";

import { ChangeEvent, useId, useState } from "react";

import type { ReviewInput, ReviewResult, ReviewStatus } from "@/lib/scoring/types";

type AdReviewerProps = {
  input: ReviewInput;
  result: ReviewResult | null;
  isReviewing: boolean;
  error: string;
  onInputChange: (input: ReviewInput) => void;
  onReview: (input: ReviewInput) => Promise<void>;
};

const STATUS_LABELS: Record<ReviewStatus, string> = {
  pass: "Pass",
  revise: "Revise",
  evidence_required: "Evidence required",
  human_review: "Human review",
  block: "Block",
};

const VERDICT_LABELS: Record<ReviewResult["verdict"], string> = {
  ready_for_reviewer_approval: "Ready for reviewer approval",
  revise: "Revise and rescore",
  evidence_required: "Evidence required",
  human_review: "Human review required",
  do_not_publish: "Do not publish",
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
  return (
    <div className="review-results">
      <section className={`verdict-card status-${statusFromVerdict(result.verdict)}`}>
        <p>Overall decision</p>
        <h2>{VERDICT_LABELS[result.verdict]}</h2>
        <span>{result.summary}</span>
      </section>

      <div className="dimension-grid">
        {Object.entries(result.dimensions).map(([dimension, status]) => (
          <div className={`dimension-card status-${status}`} key={dimension}>
            <span>{dimension === "policy" ? "Policy & claims" : `Brand ${dimension}`}</span>
            <strong>{STATUS_LABELS[status]}</strong>
          </div>
        ))}
      </div>

      {result.findings.length ? (
        <section className="findings-section">
          <div className="result-heading">
            <div>
              <p>Fix first</p>
              <h3>{result.findings.length} actionable {result.findings.length === 1 ? "finding" : "findings"}</h3>
            </div>
            <span>{result.engine === "gemini+rules" ? "Vision + rules" : "Rules only"}</span>
          </div>
          <div className="finding-list">
            {result.findings.map((finding, index) => (
              <article className="finding-card" key={finding.id}>
                <header>
                  <div><span>{index + 1}</span><b>{finding.ruleId} · {finding.ruleName}</b></div>
                  <em className={`finding-status status-${finding.status}`}>{STATUS_LABELS[finding.status]}</em>
                </header>
                <dl>
                  <div><dt>Where</dt><dd>{finding.location}</dd></div>
                  <div><dt>Observed</dt><dd>“{finding.observed}”</dd></div>
                  {finding.inference ? <div><dt>Inference</dt><dd>{finding.inference}</dd></div> : null}
                  <div><dt>What’s off</dt><dd>{finding.whatIsOff}</dd></div>
                  <div><dt>Why it matters</dt><dd>{finding.whyItMatters}</dd></div>
                  <div className="fix-row"><dt>How to fix</dt><dd>{finding.howToFix}</dd></div>
                  {finding.suggestedReplacement ? <div className="replacement-row"><dt>Try</dt><dd>“{finding.suggestedReplacement}”</dd></div> : null}
                  <div><dt>Done when</dt><dd>{finding.doneWhen}</dd></div>
                </dl>
                <div className="finding-meta">
                  <span>{finding.severity} severity · {finding.confidence} confidence</span>
                  {finding.missingInput ? <span>Needs: {finding.missingInput}</span> : null}
                  <span>Basis: {finding.sourceBasis}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : (
        <section className="no-findings">
          <b>No rule violation was detected.</b>
          <p>This is a first-pass screen, not final legal or claims approval.</p>
        </section>
      )}

      {result.revisedCopy ? (
        <section className="revised-copy">
          <p>Suggested revision</p>
          <blockquote>{result.revisedCopy}</blockquote>
        </section>
      ) : null}

      {result.resubmissionChecklist.length ? (
        <section className="checklist-card">
          <h3>Ready to rescore when…</h3>
          <ul>{result.resubmissionChecklist.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>
      ) : null}

      {result.limitations.length ? (
        <details className="limitations">
          <summary>Scorer limitations</summary>
          <ul>{result.limitations.map((item) => <li key={item}>{item}</li>)}</ul>
        </details>
      ) : null}
    </div>
  );
}

function ReviewEmptyState() {
  return (
    <div className="review-empty">
      <span>02</span>
      <h2>Your scorer output will appear here.</h2>
      <p>It will identify the exact copy or visual area, explain the issue, and give a concrete fix and completion check.</p>
      <div><b>Policy & claims</b><b>Brand tone</b><b>Brand language</b></div>
    </div>
  );
}

function ReviewLoading() {
  return (
    <div className="review-loading">
      <span />
      <h2>Scoring the creative…</h2>
      <p>Checking visible copy, claims, tone, language, hierarchy and qualifications.</p>
    </div>
  );
}

function statusFromVerdict(verdict: ReviewResult["verdict"]): ReviewStatus {
  if (verdict === "do_not_publish") return "block";
  if (verdict === "ready_for_reviewer_approval") return "pass";
  return verdict;
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
