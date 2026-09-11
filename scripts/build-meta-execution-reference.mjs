#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";

const [, , referencePath, imageManifestPath, groupsPath, outputPath] = process.argv;
if (!referencePath || !imageManifestPath || !groupsPath || !outputPath) {
  console.error(
    "Usage: build-meta-execution-reference.mjs REFERENCE_JSON IMAGE_MANIFEST_JSON GROUPS_JSON OUTPUT_JSON",
  );
  process.exit(1);
}

const reference = JSON.parse(readFileSync(referencePath, "utf8"));
const imageManifest = JSON.parse(readFileSync(imageManifestPath, "utf8"));
const groupData = JSON.parse(readFileSync(groupsPath, "utf8"));
const recordsById = new Map(reference.records.map((record) => [record.libraryId, record]));
const familyByLibraryId = new Map(
  groupData.groups.flatMap((group) =>
    group.libraryIds.map((libraryId) => [libraryId, group.candidateGroupId]),
  ),
);

const tagRules = {
  productCategories: [
    ["acne-oil-control", /acne|breakout|blackhead|salicylic|excess oil|oily skin|sebum|clogged pores/i],
    ["pigmentation-brightening", /pigmentation|dark spot|uneven (?:skin )?tone|dull|brighten|glow|radiance|vitamin c/i],
    ["sun-protection", /sunscreen|spf\s*\d|uv rays?|sun protection|white cast/i],
    ["barrier-sensitive", /skin barrier|barrier repair|sensitive|redness|irritation|oat extract|vitamin b12/i],
    ["hydration-moisturising", /hydrat|moisturi|dry skin|dryness|hyaluronic|aquaporin|water content|vitamin b5/i],
    ["anti-ageing-firming", /retinol|anti-aging|anti-ageing|fine lines?|wrinkles?|firm(?:er|ing|ness)?|elasticity|pdrn|copper peptide/i],
    ["eye-care", /dark circles?|puffiness|under-eye|eye cream/i],
    ["hair-growth-anti-grey", /hair growth|hairfall|hair fall|hair density|greying|grey hair|re-pigmentation/i],
    ["dandruff-scalp", /dandruff|flakes|itchy scalp|scalp buildup|malassezia|anti-dandruff/i],
    ["hair-repair-frizz", /frizz|bond repair|hair bonds?|hair breakage|damaged hair|hair strength/i],
    ["cleansing-exfoliation", /cleanser|cleanse|exfoliat|glycolic|pha\s*\d/i],
  ],
  creativeArchetypes: [
    ["offer-led", /\bfree(?:bie)?\b|coupon|discount|cost of two|three products,\s*at the cost of two/i],
    ["routine-kit", /\broutine\b|\bstep\s*\d|\bkit\b|cleanse[,.\s]+treat[,.\s]+(?:moisturi[sz]e|protect)/i],
    ["ingredient-mechanism", /powered by|formulated with|infused with|ingredient|actives?|complex|peptide|acid|niacinamide|retinol/i],
    ["quantified-proof", /\b\d+(?:\.\d+)?%\s+(?:reduction|increase|boost|users|subjects|saw|noticed|reported)|clinically (?:tested|proven|backed)|visible results? in/i],
    ["testimonial-social-proof", /real reviews?|verified .+ customer|thousands|users? (?:noticed|reported)|subjects? agree|[“\"]/i],
    ["before-after", /\bbefore\b[\s\S]*\bafter\b|before\/after/i],
    ["seasonal-problem-solution", /monsoon|winter|summer|rain|humidity|cloudy/i],
    ["new-launch", /new launch|introducing the new|meet the new/i],
    ["single-product-benefit", /meet the|minimalist .+(?:serum|cleanser|moisturizer|moisturiser|sunscreen|shampoo|toner|cream|lotion)/i],
  ],
  claimTags: [
    ["ingredient-concentration", /\b\d+(?:\.\d+)?\s*%/i],
    ["clinical-claim", /clinically (?:tested|proven|backed)|clinical study/i],
    ["dermatologist-authority", /dermatolog(?:ist|ically)/i],
    ["science-authority", /science-backed|backed by science|powered by science/i],
    ["numeric-outcome", /\b\d+(?:\.\d+)?%\s+(?:reduction|increase|boost|users|subjects|saw|noticed|reported)|[+-]\d+(?:\.\d+)?%/i],
    ["time-bound-result", /\b(?:in|within|after|just)\s+(?:\d+|one|two|three)\s+(?:day|days|week|weeks|wash|washes|month|months)\b/i],
    ["absolute-or-guarantee", /\bguaranteed\b|\berase\b|\beliminates?\b|\b100% reduction\b|\bnot anymore\b|\bturn back time\b|\bmaximum results\b/i],
    ["therapeutic-biological", /\bheals?\b|treats? the root cause|prevents? blood vessel breakage|activates? .+ cells|stimulates? .+ cells|fights? .+ fungus/i],
    ["before-after", /\bbefore\b[\s\S]*\bafter\b|before\/after/i],
    ["testimonial", /real reviews?|verified .+ customer|[“\"]/i],
    ["offer-conditions", /\bfree(?:bie)?\b|cashback|coupon|discount|limited time offer/i],
  ],
};

function applyRules(text, rules) {
  return rules.filter(([, expression]) => expression.test(text)).map(([tag]) => tag);
}

function splitCopy(adCopy) {
  const lines = adCopy.split("\n").map((line) => line.trim()).filter(Boolean);
  const cta = /^(?:shop|order)(?: now)?$/i.test(lines.at(-1) ?? "")
    ? lines.at(-1)
    : null;
  return {
    associatedCopy: adCopy,
    callToAction: cta,
    copyLines: lines,
  };
}

const executionMap = new Map();
for (const image of imageManifest.images) {
  const record = recordsById.get(image.libraryId);
  if (!record) continue;
  const key = `${image.sha256}:${record.copyFingerprint}`;
  const current = executionMap.get(key) ?? {
    imageHash: image.sha256,
    copyFingerprint: record.copyFingerprint,
    libraryIds: [],
    familyIds: [],
    imageFiles: [],
    sourceStartDates: [],
    ...splitCopy(record.adCopy),
  };
  current.libraryIds.push(image.libraryId);
  current.familyIds.push(familyByLibraryId.get(image.libraryId));
  current.imageFiles.push(image.filename);
  if (record.startedRunning) current.sourceStartDates.push(record.startedRunning);
  executionMap.set(key, current);
}

const executions = [...executionMap.values()]
  .sort((first, second) => first.libraryIds[0].localeCompare(second.libraryIds[0]))
  .map((execution, index) => {
    const text = execution.associatedCopy;
    const claimTags = applyRules(text, tagRules.claimTags);
    return {
      executionId: `META-E${String(index + 1).padStart(3, "0")}`,
      familyIds: [...new Set(execution.familyIds)].filter(Boolean),
      libraryIds: [...new Set(execution.libraryIds)],
      imageFiles: [...new Set(execution.imageFiles)],
      canonicalImage: execution.imageFiles[0],
      sourceStartDates: [...new Set(execution.sourceStartDates)],
      associatedCopy: execution.associatedCopy,
      callToAction: execution.callToAction,
      productCategories: applyRules(text, tagRules.productCategories),
      creativeArchetypes: applyRules(text, tagRules.creativeArchetypes),
      claimTags,
      evidenceReviewNeeded: claimTags.filter((tag) =>
        [
          "clinical-claim",
          "dermatologist-authority",
          "science-authority",
          "numeric-outcome",
          "time-bound-result",
          "absolute-or-guarantee",
          "therapeutic-biological",
          "before-after",
          "testimonial",
          "offer-conditions",
        ].includes(tag),
      ),
      tagStatus: "provisional-keyword-derived",
    };
  });

const output = {
  generatedAt: new Date().toISOString(),
  purpose:
    "Reference executions for scorer-rule derivation and ad-generation examples.",
  limitations: [
    "Tags are keyword-derived review aids, not approved brand or policy judgements.",
    "Image text has not yet been separately OCR-tagged; associated Meta card copy is included.",
    "Candidate family membership is based on exact copy/image matches and awaits semantic review.",
  ],
  executionCount: executions.length,
  executions,
};

writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");

const countTags = (field) => {
  const counts = new Map();
  for (const execution of executions) {
    for (const tag of execution[field]) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return Object.fromEntries([...counts.entries()].sort((a, b) => b[1] - a[1]));
};

console.log(
  JSON.stringify(
    {
      executions: executions.length,
      productCategories: countTags("productCategories"),
      creativeArchetypes: countTags("creativeArchetypes"),
      claimTags: countTags("claimTags"),
    },
    null,
    2,
  ),
);
