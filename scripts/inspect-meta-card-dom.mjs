const endpoint = "http://127.0.0.1:9222";
const sourceUrl =
  process.argv[2] ?? "file:///C:/Windows/Temp/minimalist-meta-scrolled.html";
const target = await fetch(
  `${endpoint}/json/new?${encodeURIComponent(sourceUrl)}`,
  { method: "PUT" },
).then((response) => response.json());

const socket = new WebSocket(target.webSocketDebuggerUrl);
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

await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

await new Promise((resolve) => setTimeout(resolve, 2_000));

function send(method, params = {}) {
  const id = nextId++;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}

const expression = String.raw`(() => {
  const idElement = [...document.querySelectorAll("body *")]
    .filter((element) => /^Library ID: \d+$/.test(element.textContent.trim()))
    .sort((a, b) => a.children.length - b.children.length)[0];

  if (!idElement) return { error: "No Library ID element found" };

  const chain = [];
  let element = idElement;
  for (let depth = 0; element && depth < 12; depth += 1, element = element.parentElement) {
    const text = element.innerText || "";
    chain.push({
      depth,
      tag: element.tagName,
      className: element.className,
      role: element.getAttribute("role"),
      textLength: text.length,
      idCount: (text.match(/Library ID: \d+/g) || []).length,
      imageCount: element.querySelectorAll("img").length,
      linkCount: element.querySelectorAll("a").length,
      text: text.slice(0, 800),
    });
  }
  return chain;
})()`;

const result = await send("Runtime.evaluate", {
  expression,
  returnByValue: true,
  awaitPromise: true,
});

console.log(JSON.stringify(result.result.value, null, 2));
await fetch(`${endpoint}/json/close/${target.id}`);
socket.close();
