#!/usr/bin/env node

import { writeFileSync } from "node:fs";

const [, , url, outputPath] = process.argv;
if (!url || !outputPath) {
  console.error("Usage: capture-scrolled-dom.mjs URL OUTPUT_HTML");
  process.exit(1);
}

const sleep = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

const target = await fetch(
  `http://127.0.0.1:9222/json/new?${encodeURIComponent(url)}`,
  { method: "PUT" },
).then((response) => response.json());

const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

let nextId = 1;
const pending = new Map();

socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
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
  return result.result.value;
}

await command("Page.enable");
await command("Runtime.enable");
await command("Emulation.setDeviceMetricsOverride", {
  width: 1400,
  height: 1000,
  deviceScaleFactor: 1,
  mobile: false,
});
await command("Page.navigate", { url });
await sleep(10_000);

const capturedPayloads = new Map();
const discoveredHrefs = new Set();

async function captureVisiblePayloads() {
  const visible = await evaluate(`
    [...document.querySelectorAll('creative-preview')]
      .map((preview) => ({
        href: preview.querySelector('a[href*="/creative/"]')?.getAttribute('href'),
        source: preview.querySelector('script[src*="overlay="]')?.getAttribute('src'),
      }))
      .filter((item) => item.href && item.source)
  `);

  for (const item of visible) {
    const creativeId = item.href.match(/CR\d{20}/)?.[0];
    if (creativeId) capturedPayloads.set(creativeId, item);
  }
}

await captureVisiblePayloads();

let stableDiscoveryRounds = 0;
for (let round = 0; round < 20; round += 1) {
  const hrefs = await evaluate(`
    [...new Set(
      [...document.querySelectorAll('creative-preview a[href*="/creative/"]')]
        .map((link) => link.getAttribute('href'))
        .filter(Boolean)
    )]
  `);

  const previousCount = discoveredHrefs.size;
  hrefs.forEach((href) => discoveredHrefs.add(href));

  for (const href of hrefs) {
    const creativeId = href.match(/CR\d{20}/)?.[0];
    if (!creativeId || capturedPayloads.has(creativeId)) continue;

    await evaluate(`
      (() => {
        const href = ${JSON.stringify(href)};
        const preview = [...document.querySelectorAll('creative-preview')]
          .find((item) => item.querySelector('a[href*="/creative/"]')?.getAttribute('href') === href);
        preview?.scrollIntoView({ block: 'center' });
        return Boolean(preview);
      })()
    `);
    await sleep(650);
    await captureVisiblePayloads();
  }

  await evaluate("window.scrollTo(0, document.body.scrollHeight); true");
  await sleep(2_000);
  await captureVisiblePayloads();

  stableDiscoveryRounds =
    discoveredHrefs.size === previousCount ? stableDiscoveryRounds + 1 : 0;
  if (stableDiscoveryRounds >= 2) break;
}

await evaluate("window.scrollTo(0, 0); true");
await sleep(1_000);
await captureVisiblePayloads();

let html = await evaluate("document.documentElement.outerHTML");
html += "\n<!-- Accumulated lazy-loaded creative payloads -->\n";
for (const item of capturedPayloads.values()) {
  html += `<a href="${item.href}" aria-label="Advertisement"><script src="${item.source}"></script></a>\n`;
}
writeFileSync(outputPath, html);

const creativeIds = new Set(html.match(/CR\d{20}/g) ?? []);
const overlays = html.match(/overlay=/g) ?? [];
console.log(
  `Discovered ${discoveredHrefs.size} card links; captured ${creativeIds.size} creative IDs, ${capturedPayloads.size} accumulated creative payloads, and ${overlays.length} payload occurrences.`,
);

await fetch(`http://127.0.0.1:9222/json/close/${target.id}`);
socket.close();
