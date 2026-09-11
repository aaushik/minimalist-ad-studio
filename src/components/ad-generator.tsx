"use client";

import { toPng } from "html-to-image";
import { ChangeEvent, useRef, useState } from "react";

import { CreativePreview } from "@/components/creative-preview";
import type { ProductCreative } from "@/lib/product";

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

type Status =
  | { kind: "idle"; message: string }
  | { kind: "loading"; message: string }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string };

export function AdGenerator() {
  const [url, setUrl] = useState(EXAMPLE_URL);
  const [product, setProduct] = useState(EXAMPLE_PRODUCT);
  const [status, setStatus] = useState<Status>({
    kind: "idle",
    message: "Example loaded. Paste another Minimalist product URL whenever you’re ready.",
  });
  const [showEditor, setShowEditor] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const creativeRef = useRef<HTMLDivElement>(null);

  const updateProduct = (field: keyof ProductCreative, value: string) => {
    setProduct((current) => ({ ...current, [field]: value }));
  };

  const loadProduct = async () => {
    setStatus({ kind: "loading", message: "Reading the product page…" });

    try {
      const response = await fetch("/api/product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const payload = (await response.json()) as {
        product?: ProductCreative;
        error?: string;
      };
      if (!response.ok || !payload.product) {
        throw new Error(payload.error || "Unable to read that product page.");
      }

      setProduct(payload.product);
      setShowEditor(true);
      setStatus({
        kind: "success",
        message: "Product facts loaded from Minimalist. Review the copy before exporting.",
      });
    } catch (error) {
      setShowEditor(true);
      setStatus({
        kind: "error",
        message:
          error instanceof Error
            ? `${error.message} You can still edit the fields and upload a product image manually.`
            : "Unable to load the product. Continue with the manual fields below.",
      });
    }
  };

  const uploadProductImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    updateProduct("imageUrl", URL.createObjectURL(file));
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
      link.download = `${product.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-meta-square.png`;
      link.href = dataUrl;
      link.click();
      setStatus({ kind: "success", message: "Your 1080 × 1080 PNG has been downloaded." });
    } catch {
      setStatus({
        kind: "error",
        message: "The preview could not be exported. Try loading the product again.",
      });
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
          <span className="surface-tab active">Generate</span>
          <span className="surface-tab upcoming">Review <small>next</small></span>
        </div>
        <span className="prototype-label">Internal prototype</span>
      </header>

      <section className="hero" id="top">
        <p className="kicker">Evidence-led creative production</p>
        <h1>Turn a product page into a ready-to-review ad.</h1>
        <p className="hero-copy">
          Real product imagery. Page-supported copy. A reusable layout designed for Minimalist.
        </p>
      </section>

      <section className="studio-grid">
        <aside className="control-panel">
          <div className="step-heading">
            <span>01</span>
            <div>
              <h2>Choose a product</h2>
              <p>Paste any public product page from beminimalist.co.</p>
            </div>
          </div>

          <label className="field url-field">
            <span>Product URL</span>
            <input
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://beminimalist.co/products/…"
            />
          </label>
          <button className="primary-button" type="button" onClick={loadProduct} disabled={status.kind === "loading"}>
            {status.kind === "loading" ? "Reading product…" : "Build this ad"}
            <span aria-hidden="true">→</span>
          </button>

          <div className={`status-message ${status.kind}`} role="status">
            <span className="status-dot" />
            {status.message}
          </div>

          <div className="divider" />

          <button
            className="editor-toggle"
            type="button"
            onClick={() => setShowEditor((current) => !current)}
            aria-expanded={showEditor}
          >
            <span><b>02</b> Review and edit</span>
            <span aria-hidden="true">{showEditor ? "−" : "+"}</span>
          </button>

          {showEditor ? (
            <div className="editor-fields">
              <p className="editor-note">
                These fields are prefilled from the page. Treat edits as marketer-owned copy.
              </p>
              <TextField label="Eyebrow" value={product.eyebrow} maxLength={38} onChange={(value) => updateProduct("eyebrow", value)} />
              <TextArea label="Headline" value={product.headline} maxLength={72} hint="Use a line break to control wrapping." onChange={(value) => updateProduct("headline", value)} />
              <TextArea label="Supporting copy" value={product.supportingCopy} maxLength={165} onChange={(value) => updateProduct("supportingCopy", value)} />
              <TextField label="Proof points" value={product.badges} maxLength={56} onChange={(value) => updateProduct("badges", value)} />
              <TextField label="Formula line" value={product.detailLine} maxLength={54} onChange={(value) => updateProduct("detailLine", value)} />

              <div className="field-row">
                <TextField label="Size" value={product.size} maxLength={14} onChange={(value) => updateProduct("size", value)} />
                <TextField label="Price" value={product.price} maxLength={14} onChange={(value) => updateProduct("price", value)} />
              </div>
              <TextField label="Call to action" value={product.cta} maxLength={28} onChange={(value) => updateProduct("cta", value)} />
              <label className="upload-button">
                <input type="file" accept="image/png,image/jpeg,image/webp" onChange={uploadProductImage} />
                <span>Replace product image</span>
              </label>
            </div>
          ) : null}
        </aside>

        <section className="preview-panel">
          <div className="preview-heading">
            <div>
              <span className="placement-label">META · SQUARE</span>
              <h2>Creative preview</h2>
            </div>
            <span className="dimensions">1080 × 1080</span>
          </div>

          <CreativePreview product={product} ref={creativeRef} />

          <div className="preview-actions">
            <div className="draft-note">
              <span>DRAFT</span>
              <p>Generated from page facts. Final review is still required.</p>
            </div>
            <button className="download-button" type="button" onClick={downloadCreative} disabled={isExporting}>
              {isExporting ? "Preparing PNG…" : "Download PNG"}
              <DownloadIcon />
            </button>
          </div>
        </section>
      </section>

      <footer>
        <span>Minimalist Ad Studio · v0.1</span>
        <span>Next: score this creative against the documented review standard.</span>
      </footer>
    </main>
  );
}

function TextField({
  label,
  value,
  maxLength,
  onChange,
}: {
  label: string;
  value: string;
  maxLength: number;
  onChange: (value: string) => void;
}) {
  return (
    <label className="field">
      <span>{label} <small>{value.length}/{maxLength}</small></span>
      <input value={value} maxLength={maxLength} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function TextArea({
  label,
  value,
  maxLength,
  hint,
  onChange,
}: {
  label: string;
  value: string;
  maxLength: number;
  hint?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="field">
      <span>{label} <small>{value.length}/{maxLength}</small></span>
      <textarea value={value} maxLength={maxLength} rows={3} onChange={(event) => onChange(event.target.value)} />
      {hint ? <em>{hint}</em> : null}
    </label>
  );
}

function DownloadIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v3h16v-3" />
    </svg>
  );
}
