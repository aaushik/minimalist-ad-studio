#!/usr/bin/env node

import { gunzipSync } from "node:zlib";
import { readFileSync, writeFileSync } from "node:fs";

function readVarint(buffer, start) {
  let value = 0;
  let shift = 0;
  let offset = start;

  while (offset < buffer.length) {
    const byte = buffer[offset++];
    value += (byte & 0x7f) * 2 ** shift;
    if ((byte & 0x80) === 0) return { value, offset };
    shift += 7;
  }

  throw new Error("Unexpected end of protobuf varint");
}

function readFields(buffer) {
  const fields = [];
  let offset = 0;

  while (offset < buffer.length) {
    const tag = readVarint(buffer, offset);
    offset = tag.offset;
    const field = Math.floor(tag.value / 8);
    const wire = tag.value % 8;

    if (wire === 0) {
      const value = readVarint(buffer, offset);
      fields.push({ field, wire, value: value.value });
      offset = value.offset;
    } else if (wire === 1) {
      fields.push({ field, wire, value: buffer.subarray(offset, offset + 8) });
      offset += 8;
    } else if (wire === 2) {
      const length = readVarint(buffer, offset);
      offset = length.offset;
      fields.push({
        field,
        wire,
        value: buffer.subarray(offset, offset + length.value),
      });
      offset += length.value;
    } else if (wire === 5) {
      fields.push({ field, wire, value: buffer.subarray(offset, offset + 4) });
      offset += 4;
    } else {
      throw new Error(`Unsupported protobuf wire type ${wire}`);
    }
  }

  return fields;
}

function decodeOverlay(encoded) {
  let base64 = decodeURIComponent(encoded);
  if (base64.startsWith("=")) base64 = base64.slice(1);
  while (base64.length % 4 !== 0) base64 += "=";
  return gunzipSync(Buffer.from(base64, "base64"));
}

function extractNamedValues(buffer) {
  const result = {};

  for (const outer of readFields(buffer)) {
    if (outer.wire !== 2) continue;

    let entryFields;
    try {
      entryFields = readFields(outer.value);
    } catch {
      continue;
    }

    const keyField = entryFields.find((item) => item.field === 1 && item.wire === 2);
    const valueField = entryFields.find((item) => item.field === 2 && item.wire === 2);
    if (!keyField || !valueField) continue;

    const key = keyField.value.toString("utf8");
    let nested;
    try {
      nested = readFields(valueField.value);
    } catch {
      continue;
    }

    const text = nested.find((item) => item.field === 1 && item.wire === 2);
    if (text) result[key] = text.value.toString("utf8");
  }

  return result;
}

function normalize(text = "") {
  return text
    .normalize("NFKC")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("en");
}

const [, , inputPath, outputPath] = process.argv;
if (!inputPath || !outputPath) {
  console.error("Usage: extract-google-text-ads.mjs INPUT_DOM_HTML OUTPUT_JSON");
  process.exit(1);
}

const html = readFileSync(inputPath, "utf8");
const adPattern =
  /href="\/advertiser\/(AR\d+)\/creative\/(CR\d+)[^"]*" aria-label="Advertisement[^]*?overlay=([^&"]+)/g;

const byCreativeId = new Map();
for (const match of html.matchAll(adPattern)) {
  const [, advertiserId, creativeId, overlay] = match;
  if (byCreativeId.has(creativeId)) continue;

  const values = extractNamedValues(decodeOverlay(overlay));
  const headline = values.headline ?? "";
  const description = values.description ?? "";

  byCreativeId.set(creativeId, {
    advertiserId,
    creativeId,
    headline,
    description,
    visibleUrl: values.visurl ?? "",
    sourceUrl: `https://adstransparency.google.com/advertiser/${advertiserId}/creative/${creativeId}?region=anywhere&format=TEXT`,
    normalizedMessage: `${normalize(headline)} | ${normalize(description)}`,
  });
}

const records = [...byCreativeId.values()];
const groups = new Map();
for (const record of records) {
  const group = groups.get(record.normalizedMessage) ?? [];
  group.push(record.creativeId);
  groups.set(record.normalizedMessage, group);
}

const output = {
  extractedAt: new Date().toISOString(),
  sourceFile: inputPath,
  rawCreativeRecords: records.length,
  exactNormalizedMessages: groups.size,
  records,
  exactDuplicateGroups: [...groups.entries()]
    .filter(([, creativeIds]) => creativeIds.length > 1)
    .map(([normalizedMessage, creativeIds]) => ({ normalizedMessage, creativeIds })),
};

writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(
  `Extracted ${output.rawCreativeRecords} records and ${output.exactNormalizedMessages} exact normalized messages.`,
);
