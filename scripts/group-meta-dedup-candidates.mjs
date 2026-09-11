#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";

const [, , referencePath, imageManifestPath, outputPath] = process.argv;
if (!referencePath || !imageManifestPath || !outputPath) {
  console.error(
    "Usage: group-meta-dedup-candidates.mjs REFERENCE_JSON IMAGE_MANIFEST_JSON OUTPUT_JSON",
  );
  process.exit(1);
}

const reference = JSON.parse(readFileSync(referencePath, "utf8"));
const imageManifest = JSON.parse(readFileSync(imageManifestPath, "utf8"));
const recordsById = new Map(
  reference.records.map((record) => [record.libraryId, record]),
);

const parent = new Map(reference.records.map((record) => [record.libraryId, record.libraryId]));

function find(id) {
  const current = parent.get(id);
  if (current === id) return id;
  const root = find(current);
  parent.set(id, root);
  return root;
}

function union(first, second) {
  const firstRoot = find(first);
  const secondRoot = find(second);
  if (firstRoot !== secondRoot) parent.set(secondRoot, firstRoot);
}

function unionShared(items, getKey, getId) {
  const groups = new Map();
  for (const item of items) {
    const key = getKey(item);
    const ids = groups.get(key) ?? [];
    ids.push(getId(item));
    groups.set(key, ids);
  }
  for (const ids of groups.values()) {
    for (let index = 1; index < ids.length; index += 1) {
      union(ids[0], ids[index]);
    }
  }
}

unionShared(reference.records, (record) => record.copyFingerprint, (record) => record.libraryId);
unionShared(imageManifest.images, (image) => image.sha256, (image) => image.libraryId);

const components = new Map();
for (const record of reference.records) {
  const root = find(record.libraryId);
  const ids = components.get(root) ?? [];
  ids.push(record.libraryId);
  components.set(root, ids);
}

const groups = [...components.values()]
  .sort((first, second) => second.length - first.length || first[0].localeCompare(second[0]))
  .map((libraryIds, index) => {
    const records = libraryIds.map((id) => recordsById.get(id));
    const images = imageManifest.images.filter((image) => libraryIds.includes(image.libraryId));
    return {
      candidateGroupId: `META-C${String(index + 1).padStart(3, "0")}`,
      libraryIds,
      recordCount: libraryIds.length,
      imageFiles: images.map((image) => image.filename),
      uniqueImageHashes: [...new Set(images.map((image) => image.sha256))].length,
      uniqueCopyFingerprints: [...new Set(records.map((record) => record.copyFingerprint))].length,
      canonicalAdCopy: records[0].adCopy,
      automatedReasons: [
        ...(libraryIds.length > 1 &&
        new Set(records.map((record) => record.copyFingerprint)).size === 1
          ? ["exact-normalized-copy"]
          : []),
        ...(libraryIds.length > 1 &&
        new Set(images.map((image) => image.sha256)).size < images.length
          ? ["exact-image-hash"]
          : []),
      ],
      humanDecision: libraryIds.length === 1 ? "unreviewed-singleton" : "review-group",
    };
  });

const output = {
  generatedAt: new Date().toISOString(),
  method:
    "Transitive grouping by exact normalized copy or exact image SHA-256. Crops, resizes, and semantically equivalent executions still require human review.",
  rawRecordCount: reference.records.length,
  candidateGroupCount: groups.length,
  multiRecordGroupCount: groups.filter((group) => group.recordCount > 1).length,
  singletonCount: groups.filter((group) => group.recordCount === 1).length,
  groups,
};

writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(
  JSON.stringify(
    {
      rawRecords: output.rawRecordCount,
      candidateGroups: output.candidateGroupCount,
      multiRecordGroups: output.multiRecordGroupCount,
      singletons: output.singletonCount,
    },
    null,
    2,
  ),
);
