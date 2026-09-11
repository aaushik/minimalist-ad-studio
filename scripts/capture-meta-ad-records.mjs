#!/usr/bin/env node

import { writeFileSync } from "node:fs";

const [, , url, outputPath] = process.argv;
if (!url || !outputPath) {
  console.error("Usage: capture-meta-ad-records.mjs URL OUTPUT_JSON");
  process.exit(1);
}

const endpoint = "http://127.0.0.1:9222";
const sleep = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

const target = await fetch(
  `${endpoint}/json/new?${encodeURIComponent(url)}`,
  { method: "PUT" },
).then((response) => response.json());

const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

let nextId = 1;
const pending = new Map();
socket.addEventListener("message", ({ data }) => {
  const message = JSON.parse(data);
  if (!message.id || !pending.has(message.id)) return;
  const { resolve, reject } = pending.get(message.id);
  pending.delete(message.id);
  if (message.error) reject(new Error(message.error.message));
  else resolve(message.result);
});

function command(method, params = {}) {
  const id = nextId++;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
}

async function evaluate(expression) {
  const result = await command("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text);
  }
  return result.result.value;
}

try {
  await command("Page.enable");
  await command("Runtime.enable");
  await command("Emulation.setDeviceMetricsOverride", {
    width: 1400,
    height: 1000,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await command("Page.navigate", { url });
  await sleep(12_000);

  let stableRounds = 0;
  let previousIds = 0;
  let previousHeight = 0;

  for (let round = 1; round <= 30; round += 1) {
    const status = await evaluate(String.raw`({
      height: Math.max(document.body.scrollHeight, document.documentElement.scrollHeight),
      ids: new Set(document.documentElement.innerText.match(/Library ID: \d+/g) || []).size,
    })`);
    console.log(`Round ${round}: ${status.ids} unique Library IDs`);

    await evaluate("window.scrollTo(0, document.body.scrollHeight); true");
    await sleep(2_500);

    if (status.ids === previousIds && status.height === previousHeight) {
      stableRounds += 1;
    } else {
      stableRounds = 0;
    }
    previousIds = status.ids;
    previousHeight = status.height;
    if (stableRounds >= 3) break;
  }

  const resultCountLabel = await evaluate(String.raw`(() => {
    const match = document.body.innerText.match(/~[\d,]+ results/i);
    return match ? match[0] : null;
  })()`);

  const records = await evaluate(String.raw`(() => {
    const cleanLines = (text) => text
      .split(/\n+/)
      .map((line) => line.replace(/[\u200B-\u200D\uFEFF]/g, "").trim())
      .filter(Boolean);

    const idElements = [...document.querySelectorAll("span")]
      .filter((element) => /^Library ID: \d+$/.test(element.textContent.trim()));

    return idElements.map((idElement) => {
      let card = idElement;
      while (card.parentElement) {
        const candidate = card.parentElement;
        const idCount = (candidate.innerText.match(/Library ID: \d+/g) || []).length;
        if (idCount > 1) break;
        card = candidate;
        if (card.querySelector("img")) break;
      }

      const rawText = cleanLines(card.innerText || "").join("\n");
      const id = rawText.match(/Library ID: (\d+)/)?.[1] ?? null;
      const startedRunning = rawText.match(/Started running on ([^\n]+)/)?.[1] ?? null;

      const images = [...card.querySelectorAll("img")].map((image) => ({
        src: image.currentSrc || image.src || null,
        alt: image.alt || null,
        renderedWidth: image.clientWidth,
        renderedHeight: image.clientHeight,
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight,
      }));

      const links = [...card.querySelectorAll("a[href]")].map((link) => ({
        href: link.href,
        text: cleanLines(link.innerText || "").join(" ") || null,
      }));

      return {
        libraryId: id,
        status: rawText.startsWith("Active") ? "Active" : null,
        startedRunning,
        hasMultipleVersions: rawText.includes("This ad has multiple versions"),
        rawText,
        images,
        links,
      };
    });
  })()`);

  const uniqueRecords = [...new Map(records.map((record) => [record.libraryId, record])).values()];
  const payload = {
    capturedAt: new Date().toISOString(),
    sourceUrl: url,
    displayedResultCount: resultCountLabel,
    extractedRecordCount: uniqueRecords.length,
    records: uniqueRecords,
  };

  writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`Saved ${uniqueRecords.length} structured ad records.`);
} finally {
  await fetch(`${endpoint}/json/close/${target.id}`).catch(() => {});
  socket.close();
}
