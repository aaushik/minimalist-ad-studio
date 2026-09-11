"use client";

import { forwardRef, useEffect, useRef, useState } from "react";

import type { ProductCreative } from "@/lib/product";

type CreativePreviewProps = {
  product: ProductCreative;
};

function imageSource(imageUrl: string) {
  if (!imageUrl || imageUrl.startsWith("blob:") || imageUrl.startsWith("data:")) {
    return imageUrl;
  }
  return `/api/image?url=${encodeURIComponent(imageUrl)}`;
}

export const CreativePreview = forwardRef<HTMLDivElement, CreativePreviewProps>(
  function CreativePreview({ product }, forwardedRef) {
    const viewportRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(0.5);

    useEffect(() => {
      const viewport = viewportRef.current;
      if (!viewport) return;

      const updateScale = () => setScale(viewport.clientWidth / 1080);
      updateScale();
      const observer = new ResizeObserver(updateScale);
      observer.observe(viewport);
      return () => observer.disconnect();
    }, []);

    const headlineLines = product.headline.split("\n");

    return (
      <div className="creative-viewport" ref={viewportRef}>
        <div className="creative-scaler" style={{ transform: `scale(${scale})` }}>
          <div className="creative" ref={forwardedRef}>
            <div className="orb orb-blue" />
            <div className="orb orb-green" />

            <div className="creative-brand">Minimalist.</div>
            <section className="creative-copy">
              <p className="creative-eyebrow">{product.eyebrow || "INGREDIENT-LED CARE"}</p>
              <h2>
                {headlineLines.map((line, index) => (
                  <span key={`${line}-${index}`}>{line || "\u00a0"}</span>
                ))}
              </h2>
              <div className="short-rule" />
              <p className="creative-supporting">{product.supportingCopy}</p>
              {product.badges ? <p className="creative-badges">{product.badges}</p> : null}
            </section>

            <section className="creative-commerce">
              <div className="creative-price-row">
                <strong>{product.size}</strong>
                <span>{product.price}</span>
                {product.compareAtPrice && product.compareAtPrice !== product.price ? (
                  <s>{product.compareAtPrice}</s>
                ) : null}
              </div>
              <div className="creative-cta">{product.cta} <span>→</span></div>
            </section>

            <section className="creative-product">
              <div className="creative-product-image">
                {product.imageUrl ? (
                  // A regular img is intentional: it can render same-origin proxied images into the PNG export.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imageSource(product.imageUrl)} alt={product.title} />
                ) : (
                  <div className="image-placeholder">Upload a product image</div>
                )}
              </div>
              <div className="creative-detail">
                <b>PRODUCT PAGE CREATIVE</b>
                <span>{product.detailLine || product.title}</span>
              </div>
            </section>

            <div className="creative-format">DRAFT · REVIEW REQUIRED · 1080 × 1080</div>
          </div>
        </div>
      </div>
    );
  },
);
