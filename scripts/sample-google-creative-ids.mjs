#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";

const [, , inputPath, outputPath, requestedSize = "50", seedText = "20260911"] =
  process.argv;

if (!inputPath || !outputPath) {
  console.error(
    "Usage: sample-google-creative-ids.mjs INPUT_HTML OUTPUT_JSON [SIZE] [SEED]",
  );
  process.exit(1);
}

function mulberry32(seed) {
  return () => {
    let value = (seed += 0x6d2b79f5);
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

const html = readFileSync(inputPath, "utf8");
const population = [...new Set(html.match(/CR\d{20}/g) ?? [])].sort();
const sampleSize = Math.min(Number(requestedSize), population.length);
const seed = Number(seedText);
const random = mulberry32(seed);
const shuffled = [...population];

for (let index = shuffled.length - 1; index > 0; index -= 1) {
  const swapIndex = Math.floor(random() * (index + 1));
  [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
}

const selectedCreativeIds = shuffled.slice(0, sampleSize);
const output = {
  selectedAt: new Date().toISOString(),
  sourceFile: inputPath,
  populationSize: population.length,
  requestedSampleSize: Number(requestedSize),
  actualSampleSize: sampleSize,
  samplingMethod: "seeded simple random sample without replacement",
  seed,
  advertiserId: "AR03970684002292989953",
  selectedCreativeIds,
};

writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(
  `Selected ${sampleSize} of ${population.length} creative IDs with seed ${seed}.`,
);
