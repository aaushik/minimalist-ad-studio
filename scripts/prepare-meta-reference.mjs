#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

const [, , inputPath, outputPath] = process.argv;
if (!inputPath || !outputPath) {
  console.error("Usage: prepare-meta-reference.mjs INPUT_JSON OUTPUT_JSON");
  process.exit(1);
}

const input = JSON.parse(readFileSync(inputPath, "utf8"));

const normalize = (text) =>
  text
    .normalize("NFKC")
    .toLocaleLowerCase("en-IN")
    .replace(/\s+/g, " ")
    .trim();

const fingerprint = (text) =>
  createHash("sha256").update(normalize(text)).digest("hex");

function extractAdCopy(rawText) {
  const lines = rawText.split("\n").map((line) => line.trim()).filter(Boolean);
  const sponsoredIndex = lines.indexOf("Sponsored");
  return sponsoredIndex >= 0 ? lines.slice(sponsoredIndex + 1).join("\n") : "";
}

const records = input.records.map((record) => {
  const adCopy = extractAdCopy(record.rawText);
  const creativeImages = record.images.filter(
    (image) => image.naturalWidth >= 300 && image.naturalHeight >= 200,
  );

  return {
    libraryId: record.libraryId,
    status: record.status,
    startedRunning: record.startedRunning,
    hasMultipleVersions: record.hasMultipleVersions,
    adCopy,
    copyFingerprint: fingerprint(adCopy),
    creativeImages,
    links: record.links,
    rawText: record.rawText,
  };
});

const copyGroups = new Map();
for (const record of records) {
  const group = copyGroups.get(record.copyFingerprint) ?? [];
  group.push(record.libraryId);
  copyGroups.set(record.copyFingerprint, group);
}

const output = {
  preparedAt: new Date().toISOString(),
  source: {
    url: input.sourceUrl,
    capturedAt: input.capturedAt,
    displayedResultCount: input.displayedResultCount,
    extractedRecordCount: records.length,
  },
  summary: {
    records: records.length,
    creativeImages: records.reduce(
      (total, record) => total + record.creativeImages.length,
      0,
    ),
    exactUniqueCopyExecutions: copyGroups.size,
    exactCopyDuplicateGroups: [...copyGroups.values()].filter(
      (libraryIds) => libraryIds.length > 1,
    ).length,
  },
  exactCopyGroups: [...copyGroups.entries()].map(
    ([copyFingerprint, libraryIds], index) => ({
      groupId: `MC${String(index + 1).padStart(3, "0")}`,
      copyFingerprint,
      libraryIds,
    }),
  ),
  records,
};

writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(JSON.stringify(output.summary, null, 2));
