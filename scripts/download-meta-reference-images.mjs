#!/usr/bin/env node

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { extname, join } from "node:path";

const [, , inputPath, outputDirectory, manifestPath] = process.argv;
if (!inputPath || !outputDirectory || !manifestPath) {
  console.error(
    "Usage: download-meta-reference-images.mjs INPUT_JSON OUTPUT_DIR MANIFEST_JSON",
  );
  process.exit(1);
}

const input = JSON.parse(readFileSync(inputPath, "utf8"));
mkdirSync(outputDirectory, { recursive: true });

const downloaded = [];
const failures = [];

for (const record of input.records) {
  for (const [index, image] of record.creativeImages.entries()) {
    const response = await fetch(image.src);
    if (!response.ok) {
      failures.push({
        libraryId: record.libraryId,
        imageIndex: index + 1,
        status: response.status,
      });
      continue;
    }

    const bytes = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get("content-type") ?? "";
    const sourceExtension = extname(new URL(image.src).pathname);
    const extension = contentType.includes("png")
      ? ".png"
      : sourceExtension || ".jpg";
    const filename = `${record.libraryId}-${String(index + 1).padStart(2, "0")}${extension}`;
    writeFileSync(join(outputDirectory, filename), bytes);

    downloaded.push({
      libraryId: record.libraryId,
      imageIndex: index + 1,
      filename,
      sha256: createHash("sha256").update(bytes).digest("hex"),
      bytes: bytes.length,
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
      sourceUrl: image.src,
    });
    console.log(`Downloaded ${downloaded.length}: ${filename}`);
  }
}

const exactHashGroups = new Map();
for (const image of downloaded) {
  const group = exactHashGroups.get(image.sha256) ?? [];
  group.push(image.filename);
  exactHashGroups.set(image.sha256, group);
}

const manifest = {
  downloadedAt: new Date().toISOString(),
  downloadedCount: downloaded.length,
  failureCount: failures.length,
  exactUniqueFiles: exactHashGroups.size,
  exactDuplicateGroups: [...exactHashGroups.values()].filter(
    (filenames) => filenames.length > 1,
  ),
  failures,
  images: downloaded,
};

writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(
  JSON.stringify(
    {
      downloaded: manifest.downloadedCount,
      failures: manifest.failureCount,
      exactUniqueFiles: manifest.exactUniqueFiles,
    },
    null,
    2,
  ),
);
