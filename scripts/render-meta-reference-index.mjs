#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";

const [, , groupsPath, imageManifestPath, outputPath] = process.argv;
if (!groupsPath || !imageManifestPath || !outputPath) {
  console.error(
    "Usage: render-meta-reference-index.mjs GROUPS_JSON IMAGE_MANIFEST_JSON OUTPUT_MD",
  );
  process.exit(1);
}

const data = JSON.parse(readFileSync(groupsPath, "utf8"));
const imageManifest = JSON.parse(readFileSync(imageManifestPath, "utf8"));
const imagesByFilename = new Map(
  imageManifest.images.map((image) => [image.filename, image]),
);

const lines = [
  "# Meta current-ad reference review",
  "",
  `Raw accessible Library records: **${data.rawRecordCount}** (Meta displayed \`~88 results\`)`,
  "",
  `Automated candidate groups: **${data.candidateGroupCount}**`,
  "",
  "These are candidates, not final semantic deduplication. Records are grouped only when they share exact normalized copy or an exact image file hash. Review crops, resizes, and materially different messages manually before calling them unique creative concepts.",
  "",
];

for (const group of data.groups) {
  const uniqueImages = [];
  const seenHashes = new Set();
  for (const filename of group.imageFiles) {
    const image = imagesByFilename.get(filename);
    if (!image || seenHashes.has(image.sha256)) continue;
    seenHashes.add(image.sha256);
    uniqueImages.push(filename);
  }

  lines.push(`## ${group.candidateGroupId}`);
  lines.push("");
  lines.push(`- Library IDs: ${group.libraryIds.map((id) => `\`${id}\``).join(", ")}`);
  lines.push(`- Raw records: ${group.recordCount}`);
  lines.push(`- Distinct exact image files: ${group.uniqueImageHashes}`);
  lines.push(`- Automated grouping reason: ${group.automatedReasons.join(", ") || "none; singleton"}`);
  lines.push(`- Human decision: **${group.humanDecision}**`);
  lines.push("");

  for (const filename of uniqueImages) {
    lines.push(`![${group.candidateGroupId} — ${filename}](meta-images/${filename})`);
    lines.push("");
  }

  lines.push("<details>");
  lines.push("<summary>Associated ad copy</summary>");
  lines.push("");
  lines.push(group.canonicalAdCopy);
  lines.push("");
  lines.push("</details>");
  lines.push("");
}

writeFileSync(outputPath, `${lines.join("\n")}\n`, "utf8");
console.log(`Rendered ${data.groups.length} candidate groups to ${outputPath}`);
