"use client";

import { toJpeg, toPng } from "html-to-image";
import { useEffect, useRef, useState } from "react";

import { AdReviewer } from "@/components/ad-reviewer";
import { CreativePreview } from "@/components/creative-preview";
import type { CreativeVariant, GenerationResult } from "@/lib/generation/types";
import type { ProductCreative } from "@/lib/product";
import type { ReviewInput, ReviewResult } from "@/lib/scoring/types";

const EXAMPLE_URL =
  "https://beminimalist.co/collections/best-sellers/products/vitamin-b5-10-moisturizer";

const EXAMPLE_PRODUCT: ProductCreative = {
  sourceUrl: EXAMPLE_URL,
  title: "Vitamin B5 10% Moisturizer",
  eyebrow: "VITAMIN B5 10%",
  headline: "Lightweight hydration.\nBarrier care.",
  supportingCopy:
    "An everyday, oil-free moisturiser formulated for oily and combination skin.",
  badges: "Fragrance Free · Non-comedogenic",
  detailLine: "With Panthenol + Hyaluronic Acid",
  price: "₹332",
  compareAtPrice: "₹349",
  size: "50g",
  cta: "Explore moisturiser",
  imageUrl:
    "https://cdn.shopify.com/s/files/1/0410/9608/5665/products/B5Moisturizer1200-2-min.png?v=1756800645&width=1000",
};

const INITIAL_VARIANT: CreativeVariant = {
  id: "example-variant",
  direction: "editorial-detail",
  directionLabel: "Editorial detail",
  messageAngle: "Everyday barrier care",
  eyebrow: EXAMPLE_PRODUCT.eyebrow,
  headline: EXAMPLE_PRODUCT.headline,
  supportingCopy: EXAMPLE_PRODUCT.supportingCopy,
  cta: EXAMPLE_PRODUCT.cta,
  scenePrompt: "",
  factsUsed: [],
  creative: EXAMPLE_PRODUCT,
  backgroundSource: "fallback",
};

const BRIEF_HELPERS = [
  {
    label: "Product splash",
    text: "Build awareness with a bold product splash, fluid movement and a calm premium tone.",
  },
  {
    label: "Editorial detail",
    text: "Explain the product through a refined editorial layout with generous whitespace and close-up detail.",
  },
  {
    label: "Ingredient story",
    text: "Educate ingredient-aware shoppers with a clear formula story and translucent ingredient-inspired textures.",
  },
  {
    label: "Routine grid",
    text: "Show where the product fits in an everyday skincare routine using an orderly modular grid.",
  },
  {
    label: "Commerce focus",
    text: "Drive sales from comparison shoppers with strong product hierarchy, visible price and a direct CTA.",
  },
] as const;

type Status =
  | { kind: "idle"; message: string }
  | { kind: "loading"; message: string }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string };

export function AdGenerator() {
  const [activeSurface, setActiveSurface] = useState<"generate" | "scorer">("generate");
  const [url, setUrl] = useState(EXAMPLE_URL);
  const [brief, setBrief] = useState("");
  const [variants, setVariants] = useState<CreativeVariant[]>([INITIAL_VARIANT]);
  const [selectedId, setSelectedId] = useState(INITIAL_VARIANT.id);
  const [interpretation, setInterpretation] = useState<GenerationResult["interpretation"] | null>(null);
  const [status, setStatus] = useState<Status>({
    kind: "idle",
    message: "Describe what the ad should achieve, or start with one of the examples.",
  });
  const [showEditor, setShowEditor] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [reviewInput, setReviewInput] = useState<ReviewInput>({ source: "upload" });
  const [reviewResult, setReviewResult] = useState<ReviewResult | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const creativeRef = useRef<HTMLDivElement>(null);
  const selectedVariant = variants.find((variant) => variant.id === selectedId) ?? variants[0]!;
  const product = selectedVariant.creative;
  const canExport = Boolean(
    product.title && product.headline && product.supportingCopy && product.imageUrl,
  );

  useEffect(() => {
    if (window.location.hash === "#scorer") setActiveSurface("scorer");
  }, []);

  const showSurface = (surface: "generate" | "scorer") => {
    setActiveSurface(surface);
    window.history.replaceState(
      null,
      "",
      surface === "scorer" ? "#scorer" : window.location.pathname,
    );
  };

  const updateProduct = (field: keyof ProductCreative, value: string) => {
    setVariants((current) =>
      current.map((variant) =>
        variant.id === selectedVariant.id
          ? { ...variant, creative: { ...variant.creative, [field]: value } }
          : variant,
      ),
    );
  };

  const generateVariants = async () => {
    if (!brief.trim()) {
      setStatus({ kind: "error", message: "Add a creative brief or choose a starting point." });
      return;
    }

    setStatus({
      kind: "loading",
      message: "Reading the product, writing three copy routes and creating their scenes…",
    });

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, brief }),
      });
      const payload = (await response.json()) as GenerationResult & { error?: string };
      if (!response.ok || !payload.variants?.length) {
        throw new Error(payload.error || "Unable to generate the creative set.");
      }

      setVariants(payload.variants);
      setSelectedId(payload.variants[0]!.id);
      setInterpretation(payload.interpretation);
      setShowEditor(true);
      setStatus({
        kind: "success",
        message: payload.warnings.length
          ? `Three drafts created. ${payload.warnings.join(" ")}`
          : "Three Cloudflare-assisted drafts created from verified product facts.",
      });
    } catch (error) {
      setStatus({
        kind: "error",
        message: error instanceof Error ? error.message : "Unable to generate the creative set.",
      });
    }
  };

  const downloadCreative = async () => {
    if (!creativeRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(creativeRef.current, {
        cacheBust: true,
        canvasWidth: 1080,
        canvasHeight: 1080,
        pixelRatio: 1,
      });
      const link = document.createElement("a");
      const name = product.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      link.download = `${name}-${selectedVariant.direction}-meta-square.png`;
      link.href = dataUrl;
      link.click();
      setStatus({ kind: "success", message: "Your selected 1080 × 1080 PNG has been downloaded." });
    } catch {
      setStatus({ kind: "error", message: "The preview could not be exported. Try again." });
    } finally {
      setIsExporting(false);
    }
  };

  const scoreCreative = async (input: ReviewInput) => {
    showSurface("scorer");
    setReviewInput(input);
    setReviewError("");
    setIsReviewing(true);
    try {
      const response = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const payload = (await response.json()) as ReviewResult & { error?: string };
      if (!response.ok) throw new Error(payload.error || "The creative could not be reviewed.");
      setReviewResult(payload);
    } catch (error) {
      setReviewError(error instanceof Error ? error.message : "The creative could not be reviewed.");
    } finally {
      setIsReviewing(false);
    }
  };

  const sendToScorer = async () => {
    if (!creativeRef.current) return;
    setIsExporting(true);
    try {
      const imageDataUrl = await toJpeg(creativeRef.current, {
        cacheBust: true,
        canvasWidth: 1080,
        canvasHeight: 1080,
        pixelRatio: 1,
        quality: 0.9,
      });
      await scoreCreative({
        source: "generator",
        imageDataUrl,
        knownText: [
          "Minimalist.",
          product.eyebrow,
          product.headline,
          product.supportingCopy,
          product.badges,
          product.detailLine,
          product.size,
          product.price,
          product.compareAtPrice,
          product.cta,
        ]
          .filter(Boolean)
          .join("\n"),
        productContext: { title: product.title, url: product.sourceUrl || url },
      });
    } catch {
      setStatus({ kind: "error", message: "The preview could not be sent to the scorer. Try again." });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <main>
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Minimalist Ad Studio home">
          M<span>·</span>AD STUDIO
        </a>
        <div className="surface-tabs" aria-label="Product surfaces">
          <button className={`surface-tab ${activeSurface === "generate" ? "active" : ""}`} type="button" onClick={() => showSurface("generate")}>Generate</button>
          <button className={`surface-tab ${activeSurface === "scorer" ? "active" : ""}`} type="button" onClick={() => showSurface("scorer")}>Scorer</button>
        </div>
        <span className="prototype-label">Internal prototype</span>
      </header>

      <section className="hero" id="top">
        <p className="kicker">{activeSurface === "generate" ? "Brief-led creative generation" : "Actionable creative scoring"}</p>
        <h1>{activeSurface === "generate" ? "One brief. Three distinct ad routes." : "See what’s off—and exactly how to fix it."}</h1>
        <p className="hero-copy">
          {activeSurface === "generate"
            ? "Cloudflare writes and art-directs each route. The original product image and verified page facts stay intact."
            : "Upload a static ad for a first-pass check across policy, brand tone and brand language."}
        </p>
      </section>

      {activeSurface === "generate" ? (
        <section className="studio-grid">
          <aside className="control-panel">
            <div className="step-heading">
              <span>01</span>
              <div>
                <h2>Set the creative brief</h2>
                <p>Paste a product URL and describe the outcome, audience, tone or visual idea.</p>
              </div>
            </div>

            <label className="field url-field">
              <span>Product URL</span>
              <input type="url" value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://beminimalist.co/products/…" />
            </label>

            <label className="field brief-field">
              <span>Creative brief <small>{brief.length}/600</small></span>
              <textarea
                value={brief}
                maxLength={600}
                rows={5}
                onChange={(event) => setBrief(event.target.value)}
                placeholder="Example: Build awareness among oily-skin shoppers. Keep it calm, ingredient-led and premium."
              />
            </label>

            <div className="brief-helper-block">
              <span>Try a starting point</span>
              <div className="brief-helpers">
                {BRIEF_HELPERS.map((helper) => (
                  <button key={helper.label} type="button" onClick={() => setBrief(helper.text)}>{helper.label}</button>
                ))}
              </div>
            </div>

            <button className="primary-button" type="button" onClick={generateVariants} disabled={status.kind === "loading"}>
              {status.kind === "loading" ? "Creating three routes…" : "Generate 3 variants"}
              <span aria-hidden="true">→</span>
            </button>

            <div className={`status-message ${status.kind}`} role="status"><span className="status-dot" />{status.message}</div>

            {interpretation ? (
              <div className="brief-interpretation">
                <span>Brief interpretation</span>
                <dl>
                  <div><dt>Objective</dt><dd>{interpretation.objective}</dd></div>
                  <div><dt>Audience</dt><dd>{interpretation.audience}</dd></div>
                  <div><dt>Tone</dt><dd>{interpretation.tone}</dd></div>
                </dl>
              </div>
            ) : null}

            <div className="divider" />

            <button className="editor-toggle" type="button" onClick={() => setShowEditor((current) => !current)} aria-expanded={showEditor}>
              <span><b>02</b> Edit selected variant</span><span aria-hidden="true">{showEditor ? "−" : "+"}</span>
            </button>

            {showEditor ? (
              <div className="editor-fields">
                <p className="editor-note">Edits apply only to the exact ad copy in <b>{selectedVariant.directionLabel}</b>. Product facts and the source image remain fixed across all routes.</p>
                <TextField label="Eyebrow" value={product.eyebrow} maxLength={38} onChange={(value) => updateProduct("eyebrow", value)} />
                <TextArea label="Headline" value={product.headline} maxLength={72} hint="Use a line break to control wrapping." onChange={(value) => updateProduct("headline", value)} />
                <TextArea label="Supporting copy" value={product.supportingCopy} maxLength={165} onChange={(value) => updateProduct("supportingCopy", value)} />
                <TextField label="Call to action" value={product.cta} maxLength={28} onChange={(value) => updateProduct("cta", value)} />
              </div>
            ) : null}
          </aside>

          <section className="preview-panel">
            <div className="preview-heading">
              <div><span className="placement-label">META · SQUARE · 3 ROUTES</span><h2>Choose a direction</h2></div>
              <span className="dimensions">1080 × 1080</span>
            </div>

            <div className={`variant-picker ${variants.length === 1 ? "single" : ""}`}>
              {variants.map((variant) => (
                <article key={variant.id} className={`variant-card ${variant.id === selectedVariant.id ? "active" : ""}`}>
                  <CreativePreview variant={variant} />
                  <span>{variant.directionLabel}</span>
                  <small>{variant.messageAngle}</small>
                  <button
                    className="variant-card-selector"
                    type="button"
                    aria-label={`Select ${variant.directionLabel}: ${variant.messageAngle}`}
                    aria-pressed={variant.id === selectedVariant.id}
                    onClick={() => setSelectedId(variant.id)}
                  />
                </article>
              ))}
            </div>

            <div className="selected-preview-heading">
              <div><span>{selectedVariant.directionLabel}</span><strong>{selectedVariant.messageAngle}</strong></div>
              <span className={`scene-source ${selectedVariant.backgroundSource}`}>
                {selectedVariant.backgroundSource === "cloudflare" ? "Cloudflare scene" : "Designed fallback"}
              </span>
            </div>

            <CreativePreview variant={selectedVariant} ref={creativeRef} />

            <div className="preview-actions">
              <div className="draft-note"><span>DRAFT</span><p>Original product image plus exact editable copy. Final review is required.</p></div>
              <div className="creative-action-buttons">
                <button className="score-button" type="button" onClick={sendToScorer} disabled={isExporting || !canExport} title={canExport ? "Send this draft to Scorer" : "Complete the creative first"}>
                  {isExporting ? "Preparing…" : "Send to scorer"}<span aria-hidden="true">→</span>
                </button>
                <button className="download-button" type="button" onClick={downloadCreative} disabled={isExporting || !canExport} title={canExport ? "Download this draft" : "Complete the creative first"}>
                  {isExporting ? "Preparing PNG…" : "Download PNG"}<DownloadIcon />
                </button>
              </div>
            </div>
          </section>
        </section>
      ) : (
        <AdReviewer input={reviewInput} result={reviewResult} isReviewing={isReviewing} error={reviewError} onInputChange={setReviewInput} onReview={scoreCreative} />
      )}

      <footer><span>Minimalist Ad Studio · v0.3</span><span>First-pass assistance only. Final claims, legal and brand approval stays with the reviewer.</span></footer>
    </main>
  );
}

function TextField({ label, value, maxLength, onChange }: { label: string; value: string; maxLength: number; onChange: (value: string) => void }) {
  return <label className="field"><span>{label} <small>{value.length}/{maxLength}</small></span><input value={value} maxLength={maxLength} onChange={(event) => onChange(event.target.value)} /></label>;
}

function TextArea({ label, value, maxLength, hint, onChange }: { label: string; value: string; maxLength: number; hint?: string; onChange: (value: string) => void }) {
  return <label className="field"><span>{label} <small>{value.length}/{maxLength}</small></span><textarea value={value} maxLength={maxLength} rows={3} onChange={(event) => onChange(event.target.value)} />{hint ? <em>{hint}</em> : null}</label>;
}

function DownloadIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v3h16v-3" /></svg>;
}
