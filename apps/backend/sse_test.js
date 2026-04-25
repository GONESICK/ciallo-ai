const http = require("http");
const data = JSON.stringify({ messages: [{ role: "user", content: "builtin sse test" }] });
const opts = { hostname: "127.0.0.1", port: 7001, path: "/chat/stream-sse", method: "POST", headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(data) } };
const req = http.request(opts, (res) => {
  console.log("=== STATUS:", res.statusCode);
  console.log("=== HEADERS:", JSON.stringify(res.headers));
  let chunks = 0;
  res.on("data", (chunk) => { chunks++; console.log("BUILTIN CHUNK", chunks, chunk.toString().slice(0,200)); });
  res.on("end", () => { console.log("=== END, chunks:", chunks); process.exit(0); });
});
req.on("error", (e) => { console.error("REQUEST ERROR:", e.message); process.exit(2); });
req.write(data);
req.end();
setTimeout(()=>{ console.error("TIMEOUT"); process.exit(3); },60000);
