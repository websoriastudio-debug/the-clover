// Lluvia de monedas: cada vez que el visitante baja con la rueda o el dedo,
// caen monedas pequeñas de The Clover que giran sobre su eje.
export async function startCoinRain(canvas, { max = 140 } = {}) {
  const ctx = canvas.getContext("2d");
  const mark = await new Promise((res) => {
    const img = new Image();
    img.onload = () => res(img);
    img.src = "assets/clover-mark.png";
  });

  const S = 96; // tamaño del sprite
  const sprite = (draw) => {
    const c = document.createElement("canvas");
    c.width = c.height = S;
    draw(c.getContext("2d"));
    return c;
  };
  const gold = (g) => {
    const gr = g.createRadialGradient(S * 0.35, S * 0.3, 2, S / 2, S / 2, S / 2);
    gr.addColorStop(0, "#fff1b8");
    gr.addColorStop(0.45, "#e9c35c");
    gr.addColorStop(1, "#7a5416");
    return gr;
  };
  const front = sprite((g) => {
    g.fillStyle = gold(g);
    g.beginPath(); g.arc(S / 2, S / 2, S / 2 - 1, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#04100a";
    g.beginPath(); g.arc(S / 2, S / 2, S * 0.38, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "#39ff6a"; g.lineWidth = 2;
    g.beginPath(); g.arc(S / 2, S / 2, S * 0.36, 0, Math.PI * 2); g.stroke();
    const h = S * 0.56, w = h * (mark.width / mark.height);
    g.drawImage(mark, S / 2 - w / 2, S / 2 - h / 2, w, h);
  });
  const back = sprite((g) => {
    g.fillStyle = gold(g);
    g.beginPath(); g.arc(S / 2, S / 2, S / 2 - 1, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "rgba(110,74,18,.8)"; g.lineWidth = 3;
    g.beginPath(); g.arc(S / 2, S / 2, S * 0.4, 0, Math.PI * 2); g.stroke();
    const tmp = document.createElement("canvas");
    tmp.width = mark.width; tmp.height = mark.height;
    const t = tmp.getContext("2d");
    t.drawImage(mark, 0, 0);
    t.globalCompositeOperation = "source-in";
    t.fillStyle = "#6e4a12"; t.fillRect(0, 0, tmp.width, tmp.height);
    const h = S * 0.6, w = h * (mark.width / mark.height);
    g.drawImage(tmp, S / 2 - w / 2, S / 2 - h / 2, w, h);
  });

  let w = 0, h = 0, dpr = 1;
  function resize() {
    dpr = Math.min(devicePixelRatio, 2);
    w = innerWidth; h = innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
  }
  resize();
  addEventListener("resize", resize);

  const coins = [];
  let pointerX = null;
  addEventListener("pointermove", (e) => { pointerX = e.clientX; }, { passive: true });

  function spawn(n) {
    for (let i = 0; i < n && coins.length < max; i++) {
      const size = 12 + Math.random() * 16;
      const nearCursor = pointerX !== null && Math.random() < 0.45;
      coins.push({
        x: nearCursor ? pointerX + (Math.random() - 0.5) * 220 : Math.random() * w,
        y: -size - Math.random() * 60,
        vx: (Math.random() - 0.5) * 60,
        vy: 40 + Math.random() * 120,
        size,
        flip: Math.random() * Math.PI * 2,
        flipSpeed: 5 + Math.random() * 9,
        rot: (Math.random() - 0.5) * 0.8,
        vr: (Math.random() - 0.5) * 2,
        life: 1,
      });
    }
  }

  // Monedas según cuánto se desplaza hacia abajo.
  let lastY = scrollY;
  let budget = 0;
  addEventListener("scroll", () => {
    const dy = scrollY - lastY;
    lastY = scrollY;
    if (dy > 0) budget += dy / 38;
  }, { passive: true });
  addEventListener("wheel", (e) => { if (e.deltaY > 0) budget += 0.6; }, { passive: true });

  let last = performance.now();
  let raf = 0;
  function tick(now) {
    raf = requestAnimationFrame(tick);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (budget >= 1) {
      const n = Math.min(Math.floor(budget), 6);
      spawn(n);
      budget -= n;
    }
    budget = Math.min(budget, 12);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    for (let i = coins.length - 1; i >= 0; i--) {
      const c = coins[i];
      c.vy += 900 * dt;
      c.vx *= 0.995;
      c.x += c.vx * dt;
      c.y += c.vy * dt;
      c.flip += c.flipSpeed * dt;
      c.rot += c.vr * dt;
      if (c.y > h - 40) c.life -= dt * 2.2;
      if (c.y > h + 40 || c.life <= 0) { coins.splice(i, 1); continue; }

      const sx = Math.cos(c.flip);
      ctx.save();
      ctx.globalAlpha = Math.max(0, c.life);
      ctx.translate(c.x, c.y);
      ctx.rotate(c.rot);
      ctx.scale(Math.max(Math.abs(sx), 0.08), 1);
      // canto visible cuando está de perfil
      if (Math.abs(sx) < 0.2) {
        ctx.fillStyle = "#b8862b";
        ctx.fillRect(-c.size * 0.5, -c.size / 2, c.size, c.size);
      }
      ctx.drawImage(sx >= 0 ? front : back, -c.size / 2, -c.size / 2, c.size, c.size);
      ctx.restore();
    }
  }
  raf = requestAnimationFrame(tick);

  return { spawn, stop() { cancelAnimationFrame(raf); ctx.clearRect(0, 0, canvas.width, canvas.height); } };
}
