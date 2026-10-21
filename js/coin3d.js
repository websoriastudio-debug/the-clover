// Moneda 3D de The Clover: anverso neón, reverso de oro y canto estriado.
// Las texturas se dibujan en canvas a partir del logo limpio (assets/clover-mark.png).
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

const TEX = 2048;
const C = TEX / 2;
const NEON = "#39ff6a";
const DISPLAY = '"Big Shoulders Display", "Arial Narrow", sans-serif';

function loadImage(src) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}

function canvas(size = TEX) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  return [c, c.getContext("2d")];
}

// Pseudoaleatorio con semilla para que los circuitos sean siempre iguales.
function rng(seed) {
  return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
}

function goldGradient(ctx, r0, r1) {
  const g = ctx.createRadialGradient(C - r1 * 0.3, C - r1 * 0.35, r0 * 0.1, C, C, r1);
  g.addColorStop(0, "#fff1b8");
  g.addColorStop(0.35, "#e9c35c");
  g.addColorStop(0.7, "#b8862b");
  g.addColorStop(1, "#6e4a12");
  return g;
}

function ring(ctx, r0, r1, fill) {
  ctx.beginPath();
  ctx.arc(C, C, r1, 0, Math.PI * 2);
  ctx.arc(C, C, r0, 0, Math.PI * 2, true);
  ctx.fillStyle = fill;
  ctx.fill();
}

// Texto curvo centrado en un ángulo. bottom=true lo escribe legible en la parte inferior.
function arcText(ctx, text, r, angle, { size = 120, bottom = false, spacing = 0.06 } = {}) {
  ctx.save();
  ctx.font = `800 ${size}px ${DISPLAY}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const chars = [...text];
  const widths = chars.map((ch) => ctx.measureText(ch).width + size * spacing);
  const total = widths.reduce((a, b) => a + b, 0) / r;
  let a = angle + (bottom ? total / 2 : -total / 2);
  chars.forEach((ch, i) => {
    const step = widths[i] / r;
    a += bottom ? -step / 2 : step / 2;
    ctx.save();
    ctx.translate(C + Math.cos(a) * r, C + Math.sin(a) * r);
    ctx.rotate(a + (bottom ? -Math.PI / 2 : Math.PI / 2));
    ctx.fillText(ch, 0, 0);
    ctx.restore();
    a += bottom ? -step / 2 : step / 2;
  });
  ctx.restore();
}

function circuits(ctx, color, width, seed, rMin, rMax, count) {
  const rand = rng(seed);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;
  ctx.lineJoin = "round";
  for (let i = 0; i < count; i++) {
    const a = rand() * Math.PI * 2;
    const r = rMin + rand() * (rMax - rMin) * 0.35;
    let x = C + Math.cos(a) * r;
    let y = C + Math.sin(a) * r;
    ctx.beginPath();
    ctx.moveTo(x, y);
    const segs = 2 + Math.floor(rand() * 3);
    for (let s = 0; s < segs; s++) {
      const len = 40 + rand() * 120;
      const dir = Math.round((Math.atan2(y - C, x - C) + (rand() - 0.5) * 1.6) / (Math.PI / 4)) * (Math.PI / 4);
      const nx = x + Math.cos(dir) * len;
      const ny = y + Math.sin(dir) * len;
      if (Math.hypot(nx - C, ny - C) > rMax) break;
      x = nx; y = ny;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, width * 2.4, 0, Math.PI * 2);
    rand() > 0.5 ? ctx.fill() : ctx.stroke();
  }
  ctx.restore();
}

function tinted(img, color, w, h) {
  const [c, ctx] = canvas();
  c.width = w; c.height = h;
  ctx.drawImage(img, 0, 0, w, h);
  ctx.globalCompositeOperation = "source-in";
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, w, h);
  return c;
}

function drawMark(ctx, mark, cx, cy, h) {
  const w = h * (mark.width / mark.height);
  ctx.drawImage(mark, cx - w / 2, cy - h / 2, w, h);
}

function smallClover(ctx, mark, angle, r, size) {
  const x = C + Math.cos(angle) * r;
  const y = C + Math.sin(angle) * r;
  const w = size * (mark.width / mark.height);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle + Math.PI / 2);
  ctx.drawImage(mark, -w / 2, -size / 2, w, size);
  ctx.restore();
}

// Anverso: anillo de oro con leyendas, núcleo negro con circuito y trébol de neón.
function drawFront(mark) {
  const [c, ctx] = canvas();
  const [e, ectx] = canvas(); // mapa emisivo: solo lo que brilla
  ectx.fillStyle = "#000";
  ectx.fillRect(0, 0, TEX, TEX);

  const goldMark = tinted(mark, "#e9c35c", mark.width, mark.height);
  ring(ctx, 0, C, goldGradient(ctx, 0, C));
  ring(ctx, C * 0.79, C * 0.955, "#050806");
  ring(ctx, C * 0.77, C * 0.79, goldGradient(ctx, 0, C));

  ctx.fillStyle = "#e9c35c";
  arcText(ctx, "THE CLOVER", C * 0.872, -Math.PI / 2, { size: 132 });
  arcText(ctx, "DECENTRALIZED", C * 0.872, Math.PI, { size: 84, spacing: 0.12 });
  arcText(ctx, "BLOCKCHAIN", C * 0.872, 0, { size: 84, spacing: 0.12 });
  arcText(ctx, "FAST  •  SECURE  •  GLOBAL", C * 0.872, Math.PI / 2, { size: 86, bottom: true });
  [-0.75, -0.25, 0.2, 0.8].forEach((t) => smallClover(ctx, goldMark, Math.PI * t, C * 0.872, 92));

  // Núcleo
  const core = ctx.createRadialGradient(C, C * 0.9, 0, C, C, C * 0.77);
  core.addColorStop(0, "#0b2414");
  core.addColorStop(1, "#020604");
  ring(ctx, 0, C * 0.77, core);
  circuits(ctx, "rgba(57,255,106,.38)", 5, 7, C * 0.15, C * 0.74, 70);
  circuits(ectx, "rgba(57,255,106,.22)", 5, 7, C * 0.15, C * 0.74, 70);

  // Trébol (logo original) y nombre en neón
  drawMark(ctx, mark, C, C * 0.86, C * 0.86);
  drawMark(ectx, mark, C, C * 0.86, C * 0.86);
  for (const g of [ctx, ectx]) {
    g.save();
    g.font = `900 ${C * 0.2}px ${DISPLAY}`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.lineWidth = 10;
    g.strokeStyle = NEON;
    g.shadowColor = NEON;
    g.shadowBlur = 30;
    g.strokeText("THE CLOVER", C, C * 1.42);
    g.lineWidth = 3;
    g.strokeStyle = "#d9ffe3";
    g.shadowBlur = 0;
    g.strokeText("THE CLOVER", C, C * 1.42);
    g.restore();
  }
  // Fino aro neón interior
  for (const g of [ctx, ectx]) {
    g.save();
    g.strokeStyle = NEON;
    g.lineWidth = 8;
    g.shadowColor = NEON;
    g.shadowBlur = 24;
    g.beginPath();
    g.arc(C, C, C * 0.755, 0, Math.PI * 2);
    g.stroke();
    g.restore();
  }
  return { map: c, emissive: e };
}

// Reverso: oro macizo con circuito grabado y trébol en relieve.
function drawBack(mark) {
  const [c, ctx] = canvas();
  const [b, bctx] = canvas(); // mapa de relieve
  ring(ctx, 0, C, goldGradient(ctx, 0, C));
  bctx.fillStyle = "#808080";
  bctx.fillRect(0, 0, TEX, TEX);

  const deep = "rgba(110,74,18,.85)";
  ring(ctx, C * 0.79, C * 0.8, deep);
  ring(ctx, C * 0.94, C * 0.955, deep);
  ctx.fillStyle = deep;
  bctx.fillStyle = "#3a3a3a";
  const darkMark = tinted(mark, "#6e4a12", mark.width, mark.height);
  const bumpMark = tinted(mark, "#ffffff", mark.width, mark.height);
  for (let i = 0; i < 4; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 2;
    arcText(ctx, "THE CLOVER", C * 0.872, a, { size: 104 });
    arcText(bctx, "THE CLOVER", C * 0.872, a, { size: 104 });
    smallClover(ctx, darkMark, a + Math.PI / 4, C * 0.872, 80);
  }
  circuits(ctx, "rgba(110,74,18,.7)", 7, 11, C * 0.2, C * 0.76, 90);
  circuits(bctx, "#3a3a3a", 7, 11, C * 0.2, C * 0.76, 90);
  drawMark(ctx, darkMark, C, C, C * 1.0);
  drawMark(bctx, bumpMark, C, C, C * 1.0);
  return { map: c, bump: b };
}

function drawEdge() {
  const [c, ctx] = canvas(512);
  c.height = 64;
  for (let x = 0; x < 512; x += 8) {
    const g = ctx.createLinearGradient(x, 0, x + 8, 0);
    g.addColorStop(0, "#7a5416");
    g.addColorStop(0.5, "#f4d27a");
    g.addColorStop(1, "#7a5416");
    ctx.fillStyle = g;
    ctx.fillRect(x, 0, 8, 64);
  }
  return c;
}

function tex(c, renderer, srgb = true) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return t;
}

export async function createCoinScene(canvasEl, { mobile = false } = {}) {
  await document.fonts.load(`800 100px "Big Shoulders Display"`).catch(() => {});
  const mark = await loadImage("assets/clover-mark.png");

  const renderer = new THREE.WebGLRenderer({ canvas: canvasEl, antialias: true, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#030806");
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 9);

  scene.add(new THREE.AmbientLight("#1a3a26", 0.6));
  const key = new THREE.DirectionalLight("#fff0c8", 2.2);
  key.position.set(3, 4, 6);
  scene.add(key);
  const rim = new THREE.PointLight(NEON, 10, 20);
  rim.position.set(-3, -1.5, 3);
  scene.add(rim);

  const front = drawFront(mark);
  const back = drawBack(mark);
  const edgeTex = tex(drawEdge(), renderer);
  edgeTex.wrapS = THREE.RepeatWrapping;
  edgeTex.repeat.set(10, 1);

  const materials = [
    new THREE.MeshStandardMaterial({ map: edgeTex, metalness: 1, roughness: 0.28, bumpMap: edgeTex, bumpScale: 2 }),
    new THREE.MeshStandardMaterial({
      map: tex(front.map, renderer), emissiveMap: tex(front.emissive, renderer), emissive: new THREE.Color("#ffffff"),
      emissiveIntensity: 0.85, metalness: 0.75, roughness: 0.32,
    }),
    new THREE.MeshStandardMaterial({ map: tex(back.map, renderer), bumpMap: tex(back.bump, renderer, false), bumpScale: 6, metalness: 1, roughness: 0.3 }),
  ];
  // Las tapas del cilindro quedan mirando a +Z (anverso) y -Z (reverso).
  const geometry = new THREE.CylinderGeometry(1, 1, 0.13, 160, 1);
  geometry.rotateX(Math.PI / 2);
  for (const m of [materials[1].map, materials[1].emissiveMap, materials[2].map, materials[2].bumpMap]) {
    m.center.set(0.5, 0.5);
    m.rotation = Math.PI / 2;
  }

  const coin = new THREE.Group();
  const hero = new THREE.Mesh(geometry, materials);
  coin.add(hero);
  scene.add(coin);

  // Pila de monedas para la escena de blockchain.
  const STACK = mobile ? 7 : 9;
  const stack = [];
  for (let i = 0; i < STACK; i++) {
    const m = new THREE.Mesh(geometry, materials);
    m.visible = false;
    m.userData.seed = Math.random() * Math.PI * 2;
    scene.add(m);
    stack.push(m);
  }

  let composer = null;
  let bloom = null;
  if (!mobile) {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.42, 0.4, 0.85);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
  }

  // Estado objetivo (lo controla el scroll) y estado actual (suavizado).
  const target = { x: 1.7, y: 0, scale: 1, turn: 0, tilt: 0, stack: 0, stackY: 0, spin: 1 };
  const cur = { ...target };

  function resize() {
    const w = canvasEl.clientWidth;
    const h = canvasEl.clientHeight;
    renderer.setSize(w, h, false);
    composer?.setSize(w, h);
    bloom?.resolution.set(w, h);
    camera.aspect = w / h;
    camera.fov = w / h < 0.8 ? 46 : 32;
    camera.updateProjectionMatrix();
  }
  resize();
  addEventListener("resize", resize);

  const pointer = { x: 0, y: 0 };
  addEventListener("pointermove", (e) => {
    pointer.x = e.clientX / innerWidth - 0.5;
    pointer.y = e.clientY / innerHeight - 0.5;
  }, { passive: true });

  const clock = new THREE.Clock();
  let running = true;
  let idle = 0;

  function frame() {
    if (!running) return;
    requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    const k = 1 - Math.pow(0.0015, dt);
    for (const key of Object.keys(cur)) cur[key] += (target[key] - cur[key]) * k;

    idle += dt * 0.6 * cur.spin;
    coin.position.set(cur.x, cur.y + Math.sin(t * 1.2) * 0.06 * cur.spin, 0);
    coin.scale.setScalar(cur.scale);
    coin.rotation.y = cur.turn + Math.sin(idle) * 0.55 * cur.spin + pointer.x * 0.35;
    coin.rotation.x = cur.tilt + pointer.y * 0.25 + Math.sin(t * 0.8) * 0.05;

    // Pila: cada moneda cae a su lugar según el avance (stack 0→1).
    stack.forEach((m, i) => {
      const local = THREE.MathUtils.clamp(cur.stack * (STACK + 2) - i, 0, 1);
      m.visible = cur.stack > 0.01 && local > 0;
      const e = 1 - Math.pow(1 - local, 3);
      const baseY = -1.95 + cur.stackY + i * 0.3;
      m.position.set(cur.x + Math.sin(m.userData.seed) * 0.05, THREE.MathUtils.lerp(baseY + 6, baseY, e), 0);
      m.rotation.set(-(Math.PI / 2 - 0.42), 0, m.userData.seed * 0.1 + (1 - e) * 6);
      m.scale.setScalar(0.62);
    });

    composer ? composer.render(dt) : renderer.render(scene, camera);
  }
  frame();

  return {
    target,
    stackCount: STACK,
    pause() { running = false; },
    resume() { if (!running) { running = true; clock.getDelta(); frame(); } },
  };
}
