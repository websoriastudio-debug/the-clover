// Servidor de The Clover: archivos estáticos + /api/chat (Clover AI con Claude).
// Sin credenciales de Anthropic, /api/chat responde 503 y la web usa el modo básico.
import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "./js/kb.js";

const root = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 4230);
const MODEL = process.env.CLOVER_MODEL || "claude-opus-5-5";

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".md": "text/markdown; charset=utf-8",
};

let client = null;
try {
  client = new Anthropic();
} catch {
  console.warn("[clover] Sin credenciales de Anthropic: Clover AI funcionará en modo básico.");
}

// Límite sencillo por IP: 20 mensajes cada 10 minutos.
const hits = new Map();
function limited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < 600_000);
  list.push(now);
  hits.set(ip, list);
  return list.length > 20;
}

function readBody(req, max = 32_000) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (c) => {
      data += c;
      if (data.length > max) reject(new Error("too_large"));
    });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

function json(res, status, body) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

async function chat(req, res) {
  if (!client) return json(res, 503, { error: "offline" });
  if (limited(req.socket.remoteAddress)) return json(res, 429, { error: "rate_limited" });

  let messages;
  try {
    const body = JSON.parse(await readBody(req));
    messages = (Array.isArray(body.messages) ? body.messages : [])
      .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
      .slice(-12)
      .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));
    while (messages.length && messages[0].role !== "user") messages.shift();
  } catch {
    return json(res, 400, { error: "bad_request" });
  }
  if (!messages.length || messages.at(-1).role !== "user") return json(res, 400, { error: "bad_request" });

  try {
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 2048,
      output_config: { effort: "low" },
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
      messages,
    });
    if (response.stop_reason === "refusal") {
      return json(res, 200, { reply: "Prefiero no responder a eso. Puedo ayudarte con dudas sobre The Clover o sobre criptomonedas en general." });
    }
    const reply = response.content.filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
    return json(res, 200, { reply: reply || "No tengo una respuesta para eso ahora mismo." });
  } catch (err) {
    const noCreds = err?.status === undefined && /authentication method/i.test(err?.message ?? "");
    if (err instanceof Anthropic.AuthenticationError || noCreds) {
      console.warn("[clover] Sin credenciales válidas de Anthropic: Clover AI pasa a modo básico.");
      client = null;
      return json(res, 503, { error: "offline" });
    }
    if (err instanceof Anthropic.RateLimitError) return json(res, 429, { error: "rate_limited" });
    console.error("[clover] Error de la API:", err?.status ?? "", err?.message ?? err);
    return json(res, 502, { error: "upstream" });
  }
}

async function serveStatic(req, res) {
  const url = new URL(req.url, "http://x");
  let rel = decodeURIComponent(url.pathname);
  if (rel.endsWith("/")) rel += "index.html";
  const file = path.normalize(path.join(root, rel));
  if (!file.startsWith(root) || /node_modules|server\.mjs|package/.test(path.relative(root, file))) {
    res.writeHead(404).end("Not found");
    return;
  }
  try {
    if (!(await stat(file)).isFile()) throw new Error();
    const data = await readFile(file);
    res.writeHead(200, { "content-type": TYPES[path.extname(file).toLowerCase()] || "application/octet-stream" });
    res.end(data);
  } catch {
    res.writeHead(404).end("Not found");
  }
}

http
  .createServer((req, res) => {
    if (req.url === "/api/chat" && req.method === "POST") return chat(req, res);
    if (req.method !== "GET" && req.method !== "HEAD") return res.writeHead(405).end();
    return serveStatic(req, res);
  })
  .listen(PORT, () => console.log(`[clover] http://localhost:${PORT}  ·  modelo ${MODEL}  ·  IA ${client ? "lista (se confirma con la primera pregunta)" : "modo básico"}`));
