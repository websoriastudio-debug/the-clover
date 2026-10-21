// Clover AI: chat con Claude vía /api/chat; si no hay servidor o credenciales,
// responde en modo básico con la base de conocimiento local.
import { KB, localAnswer } from "./kb.js";

const SUGGESTIONS = [
  "¿Qué es The Clover?",
  "¿Qué significan las cuatro hojas?",
  "¿Cómo funciona una blockchain?",
  "¿Cómo compro cuando salga?",
  "¿Cómo evito estafas?",
  "¿Cuál es el contrato?",
];

export function initChat() {
  const panel = document.getElementById("chat");
  const log = document.getElementById("chat-log");
  const form = document.getElementById("chat-form");
  const input = document.getElementById("chat-input");
  const chips = document.getElementById("chat-chips");
  const status = document.getElementById("chat-status");
  const fab = document.querySelector(".chat-fab");

  const history = [];
  let mode = "unknown"; // "ai" | "basic"
  let busy = false;
  let greeted = false;

  function setMode(m) {
    mode = m;
    status.textContent = m === "ai" ? "IA conectada · responde al momento" : "Modo básico · respuestas de la guía";
    status.classList.toggle("is-ai", m === "ai");
  }
  setMode("basic");
  status.textContent = "Lista para ayudarte";

  function add(role, text) {
    const el = document.createElement("div");
    el.className = `msg msg--${role === "user" ? "user" : "bot"}`;
    el.textContent = text;
    log.append(el);
    log.scrollTop = log.scrollHeight;
    return el;
  }

  function typing() {
    const el = document.createElement("div");
    el.className = "msg msg--bot msg--typing";
    el.setAttribute("aria-label", "Clover AI está escribiendo");
    el.innerHTML = "<i></i><i></i><i></i>";
    log.append(el);
    log.scrollTop = log.scrollHeight;
    return el;
  }

  SUGGESTIONS.forEach((q) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = q;
    b.addEventListener("click", () => send(q));
    chips.append(b);
  });

  async function ask(text) {
    if (mode !== "basic-forced") {
      try {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 45_000);
        const r = await fetch("api/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ messages: history }),
          signal: ctrl.signal,
        });
        clearTimeout(timer);
        if (r.ok) {
          const data = await r.json();
          setMode("ai");
          return data.reply;
        }
        if (r.status === 429) return "Vas muy rápido 🍀 Espera un momento y vuelve a preguntar.";
        if (r.status === 404 || r.status === 405 || r.status === 503) mode = "basic-forced";
      } catch {
        mode = "basic-forced";
      }
    }
    setMode("basic");
    mode = "basic-forced";
    return localAnswer(text);
  }

  async function send(text) {
    text = text.trim();
    if (!text || busy) return;
    busy = true;
    input.value = "";
    add("user", text);
    history.push({ role: "user", content: text });
    const dots = typing();
    const delay = new Promise((r) => setTimeout(r, 450));
    const reply = await ask(text);
    await delay;
    dots.remove();
    add("bot", reply);
    history.push({ role: "assistant", content: reply });
    busy = false;
    input.focus();
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    send(input.value);
  });

  function open() {
    panel.hidden = false;
    fab.setAttribute("aria-expanded", "true");
    if (!greeted) {
      greeted = true;
      add("bot", "¡Hola! Soy Clover AI 🍀 Pregúntame sobre The Clover, sus cuatro pilares, cómo funciona una blockchain o cómo protegerte de estafas.");
    }
    input.focus();
  }
  function close() {
    panel.hidden = true;
    fab.setAttribute("aria-expanded", "false");
    fab.focus();
  }

  document.querySelectorAll("[data-open-chat]").forEach((b) => b.addEventListener("click", open));
  panel.querySelector("[data-close-chat]").addEventListener("click", close);
  addEventListener("keydown", (e) => { if (e.key === "Escape" && !panel.hidden) close(); });

  // FAQ en la página a partir de la misma base.
  const list = document.getElementById("faq-list");
  KB.forEach((item) => {
    const d = document.createElement("details");
    const s = document.createElement("summary");
    s.textContent = item.q;
    const p = document.createElement("p");
    p.textContent = item.a;
    d.append(s, p);
    list.append(d);
  });
}
