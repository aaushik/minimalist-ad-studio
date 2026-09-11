#!/usr/bin/env node

import { writeFileSync } from "node:fs";

const [, , url, outputPath] = process.argv;
if (!url || !outputPath) {
  console.error("Usage: capture-infinite-scroll-dom.mjs URL OUTPUT_HTML");
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
await sleep(12_000);

let stableRounds = 0;
let previousHeight = 0;
let previousIds = 0;

for (let round = 1; round <= 30; round += 1) {
  const status = await evaluate(`
    ({
      height: Math.max(document.body.scrollHeight, document.documentElement.scrollHeight),
      ids: new Set(document.documentElement.outerHTML.match(/Library ID: \\d+/g) || []).size,
    })
  `);

  console.log(`Round ${round}: ${status.ids} unique Library IDs`);
  await evaluate("window.scrollTo(0, document.body.scrollHeight); true");
  await sleep(2_500);

  if (status.height === previousHeight && status.ids === previousIds) {
    stableRounds += 1;
  } else {
    stableRounds = 0;
  }
  previousHeight = status.height;
  previousIds = status.ids;
  if (stableRounds >= 3) break;
}

const html = await evaluate("document.documentElement.outerHTML");
writeFileSync(outputPath, html);

const ids = new Set(html.match(/Library ID: \d+/g) ?? []);
console.log(`Saved ${ids.size} unique Library IDs.`);

await fetch(`http://127.0.0.1:9222/json/close/${target.id}`);
socket.close();
