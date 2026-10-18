/**
 * ANUx-WRT — "Network Pulse" canvas background
 * Vanilla canvas: drifting nodes + glowing packets traveling along links.
 * Cyan/orange on deep space. Pauses when tab hidden; honors reduced-motion.
 */
(() => {
  const canvas = document.getElementById("netCanvas");
  if (!canvas) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const ctx = canvas.getContext("2d");
  let W = 0, H = 0, DPR = 1;
  let nodes = [];
  let packets = [];
  let running = true;
  let rafId = null;

  const LINK_DIST = 170;
  const PACKET_COLORS = ["0,210,255", "0,210,255", "255,107,53"];

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    buildScene();
  }

  function buildScene() {
    const area = W * H;
    const count = Math.max(28, Math.min(90, Math.floor(area / 22000)));
    nodes = [];
    for (let i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: 1.2 + Math.random() * 1.8,
        hub: Math.random() < 0.14
      });
    }
    packets = [];
    const pCount = Math.floor(count * 0.55);
    for (let i = 0; i < pCount; i++) spawnPacket(true);
  }

  function spawnPacket(anywhere) {
    if (nodes.length < 2) return;
    const a = nodes[(Math.random() * nodes.length) | 0];
    // nearest-ish neighbor as destination
    let b = nodes[(Math.random() * nodes.length) | 0];
    let guard = 0;
    while ((b === a || dist(a, b) > LINK_DIST * 1.6) && guard++ < 12) {
      b = nodes[(Math.random() * nodes.length) | 0];
    }
    if (b === a) return;
    packets.push({
      a, b,
      t: anywhere ? Math.random() : 0,
      speed: 0.004 + Math.random() * 0.007,
      color: PACKET_COLORS[(Math.random() * PACKET_COLORS.length) | 0],
      size: 1.6 + Math.random() * 1.6
    });
  }

  function dist(a, b) {
    const dx = a.x - b.x, dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function step() {
    ctx.clearRect(0, 0, W, H);

    // drift nodes
    for (const n of nodes) {
      n.x += n.vx; n.y += n.vy;
      if (n.x < -20) n.x = W + 20; if (n.x > W + 20) n.x = -20;
      if (n.y < -20) n.y = H + 20; if (n.y > H + 20) n.y = -20;
    }

    // links
    ctx.lineWidth = 1;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const d = dist(a, b);
        if (d < LINK_DIST) {
          const alpha = (1 - d / LINK_DIST) * 0.14;
          ctx.strokeStyle = `rgba(0,210,255,${alpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // nodes
    for (const n of nodes) {
      if (n.hub) {
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 7);
        g.addColorStop(0, "rgba(0,210,255,0.5)");
        g.addColorStop(1, "rgba(0,210,255,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * 7, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = n.hub ? "rgba(0,210,255,0.9)" : "rgba(160,190,220,0.5)";
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // packets
    for (let i = packets.length - 1; i >= 0; i--) {
      const p = packets[i];
      p.t += p.speed;
      if (p.t >= 1) {
        packets.splice(i, 1);
        spawnPacket(false);
        continue;
      }
      const x = p.a.x + (p.b.x - p.a.x) * p.t;
      const y = p.a.y + (p.b.y - p.a.y) * p.t;
      const g = ctx.createRadialGradient(x, y, 0, x, y, p.size * 5);
      g.addColorStop(0, `rgba(${p.color},0.95)`);
      g.addColorStop(0.4, `rgba(${p.color},0.35)`);
      g.addColorStop(1, `rgba(${p.color},0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, p.size * 5, 0, Math.PI * 2);
      ctx.fill();
    }

    if (running) rafId = requestAnimationFrame(step);
  }

  function start() {
    if (!running || rafId) return;
    running = true;
    rafId = requestAnimationFrame(step);
  }
  function stop() {
    running = false;
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else { running = true; start(); }
  });

  let resizeT = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(resize, 180);
  });

  resize();
  start();
})();
