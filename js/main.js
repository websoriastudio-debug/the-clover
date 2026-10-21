import { initChat } from "./chat.js";
import { startCoinRain } from "./coin-rain.js";

const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const mobile = matchMedia("(max-width: 900px)").matches;
const { gsap, ScrollTrigger } = window;

initChat();
if (!reduce) startCoinRain(document.getElementById("coin-rain"), { max: mobile ? 60 : 140 });

// Hashes decorativos de la escena de blockchain.
const hashBox = document.querySelector(".chain__hashes");
const hex = () => Array.from({ length: 64 }, () => "0123456789abcdef"[(Math.random() * 16) | 0]).join("");
for (let i = 0; i < 6; i++) {
  const s = document.createElement("span");
  s.textContent = `#${String(1048 + i).padStart(6, "0")}  prev ${hex()}`;
  hashBox.append(s);
}

const stage = document.querySelector(".stage");

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch { return false; }
}

async function boot() {
  let coin = null;
  if (hasWebGL()) {
    try {
      const { createCoinScene } = await import("./coin3d.js");
      coin = await createCoinScene(document.getElementById("coin-canvas"), { mobile });
    } catch (err) {
      console.warn("Escena 3D no disponible:", err);
    }
  }
  if (!coin) document.documentElement.classList.add("no-webgl");

  if (reduce || !gsap) {
    if (coin) Object.assign(coin.target, { x: mobile ? 0.85 : 1.7, y: mobile ? 2.0 : 0, scale: mobile ? 0.6 : 1, spin: 0.3 });
    // Sin animación de scroll: todo visible y la moneda queda solo tras la portada.
    document.querySelectorAll(".callout, .leaf, .leaf-glow, .chain__steps li, .road li").forEach((el) => el.classList.add("is-on"));
    const hero = document.querySelector(".hero");
    new IntersectionObserver(([e]) => { stage.style.opacity = e.isIntersecting ? 1 : 0; }).observe(hero);
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  const T = coin?.target ?? {};
  const base = mobile
    ? { x: 0.85, y: 2.0, scale: 0.6 }
    : { x: 1.75, y: 0, scale: 1 };
  Object.assign(T, base);

  // Un solo recorrido de cámara para la moneda, de la portada a la pila de bloques.
  // Duraciones proporcionales al scroll: entrada 100vh · anatomía 320vh · paso a la cadena 100vh.
  gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: { trigger: ".anatomy", start: "top bottom", endTrigger: ".chain", end: "top top", scrub: 0.6 },
  })
    .to(T, { x: 0, y: mobile ? 0.55 : 0.1, scale: mobile ? 0.95 : 1.38, spin: 0.15, duration: 1 })
    .to(T, { tilt: -0.25, duration: 0.7, ease: "sine.inOut" })
    .to(T, { tilt: 0.2, duration: 0.7, ease: "sine.inOut" })
    .to(T, { tilt: 0, duration: 0.8, ease: "sine.inOut" })
    .to(T, { turn: Math.PI, scale: mobile ? 1 : 1.5, duration: 1, ease: "power2.inOut" })
    .to(T, {
      x: mobile ? 0 : -1.55, y: mobile ? 1.05 : 0.8, scale: 0.62, stackY: mobile ? 0.9 : 0,
      turn: Math.PI * 2, tilt: -1.1, duration: 1, ease: "power1.inOut",
    });

  // Anatomía fijada: aparecen las notas y la barra de progreso avanza.
  const callouts = [...document.querySelectorAll(".callout")];
  const bar = document.querySelector(".anatomy__bar");
  ScrollTrigger.create({
    trigger: ".anatomy", start: "top top", end: "bottom bottom", scrub: true,
    onUpdate(self) {
      const p = self.progress;
      bar.style.setProperty("--p", p.toFixed(3));
      const step = Math.min(callouts.length - 1, Math.floor(p * callouts.length * 1.02));
      callouts.forEach((c, i) => c.classList.toggle("is-on", i === step));
    },
  });

  // Cadena: las monedas caen y se apilan; la moneda principal corona la pila.
  const chainSteps = [...document.querySelectorAll(".chain__steps li")];
  ScrollTrigger.create({
    trigger: ".chain", start: "top top", end: "bottom bottom", scrub: true,
    onUpdate(self) {
      T.stack = self.progress;
      const idx = Math.min(chainSteps.length - 1, Math.floor(self.progress * chainSteps.length));
      chainSteps.forEach((li, i) => li.classList.toggle("is-on", i === idx || (!mobile && i < idx)));
    },
  });

  // Salida de la escena 3D cuando empiezan los pilares.
  ScrollTrigger.create({
    trigger: ".pillars", start: "top 85%", end: "top 20%", scrub: true,
    onUpdate(self) { stage.style.opacity = String(1 - self.progress); },
    onLeave: () => coin?.pause(),
    onEnterBack: () => coin?.resume(),
  });

  // Pilares: una hoja se enciende por tramo de scroll.
  const leaves = [...document.querySelectorAll(".leaf")];
  const glows = [...document.querySelectorAll(".leaf-glow")];
  const leafCoin = document.querySelector(".leaf-coin");
  let lit = 0;
  ScrollTrigger.create({
    trigger: ".pillars", start: "top top", end: "bottom bottom",
    onUpdate(self) {
      const n = Math.min(4, Math.floor(self.progress * 5));
      leaves.forEach((l, i) => l.classList.toggle("is-on", i < n));
      glows.forEach((g, i) => g.classList.toggle("is-on", i < n));
      // La moneda gira apenas con el scroll y destella cada vez que se enciende una hoja.
      leafCoin.style.setProperty("--tilt", ((self.progress - 0.5) * 24).toFixed(2));
      leafCoin.style.setProperty("--lit", n);
      leafCoin.classList.toggle("is-full", n === 4);
      if (n > lit) {
        leafCoin.classList.remove("is-shine");
        void leafCoin.offsetWidth;
        leafCoin.classList.add("is-shine");
      }
      lit = n;
    },
  });

  // Galería horizontal: el carrusel avanza y cada moneda tiene su propio movimiento.
  const track = document.querySelector(".reel__track");
  const reelTween = gsap.to(track, {
    x: () => -(track.scrollWidth - innerWidth),
    ease: "none",
    scrollTrigger: { trigger: ".reel", start: "top top", end: "bottom bottom", scrub: 0.5, invalidateOnRefresh: true },
  });
  const MOTION = {
    spin: { from: { rotate: -14, scale: 1.18 }, to: { rotate: 10, scale: 1.02 } },
    rise: { from: { yPercent: 14, scale: 1.12 }, to: { yPercent: -6, scale: 1 } },
    float: { from: { yPercent: -8, rotate: 6, scale: 1.1 }, to: { yPercent: 8, rotate: -6, scale: 1.1 } },
    zoom: { from: { scale: 1.45, xPercent: 8 }, to: { scale: 1.05, xPercent: -4 } },
    tilt: { from: { rotate: 12, xPercent: -10, scale: 1.15 }, to: { rotate: -8, xPercent: 6, scale: 1.02 } },
  };
  gsap.utils.toArray(".reel__item").forEach((item) => {
    const m = MOTION[item.dataset.motion] ?? MOTION.rise;
    gsap.fromTo(item.querySelector("img"), m.from, {
      ...m.to, ease: "none",
      scrollTrigger: { trigger: item, containerAnimation: reelTween, start: "left right", end: "right left", scrub: true },
    });
    gsap.from(item.querySelector("figcaption"), {
      y: 24, opacity: 0, duration: 0.6, ease: "power3.out",
      scrollTrigger: { trigger: item, containerAnimation: reelTween, start: "left 75%" },
    });
  });

  // Ruta: el tallo del trébol se dibuja y las fases se encienden.
  const stem = document.querySelector(".road__stem path");
  stem.setAttribute("pathLength", "1");
  const phases = [...document.querySelectorAll(".road li")];
  ScrollTrigger.create({
    trigger: ".road__line", start: "top 85%", end: "bottom 45%", scrub: true,
    onUpdate(self) {
      stem.style.setProperty("--draw", String(1 - self.progress));
      phases.forEach((li, i) => li.classList.toggle("is-on", self.progress > i / phases.length));
    },
  });

  // Entradas suaves de bloques de contenido.
  gsap.utils.toArray(".token__grid > *, .howto li, .faq__intro, .faq__list details").forEach((el) => {
    gsap.from(el, { y: 30, opacity: 0, duration: 0.7, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%" } });
  });

  addEventListener("load", () => ScrollTrigger.refresh());
}

boot();
