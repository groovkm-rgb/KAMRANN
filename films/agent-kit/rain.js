// RAIN + WET LOOK (screen space unless noted). Deterministic (rnd), no blur.
//   rainSheet(c, t, { amount: 0..1.5, angle, color, alpha, speed, layers })  falling streaks, 3 depth layers
//   rainSplashes(c, cam, t, { x0, x1, y, n })    world space: little crowns on the ground / puddles
//   windowRain(c, x, y, w, h, t, { n, col })     world space: drops + rivulets on a window pane (clip to pane yourself)
//   wetReflect(c, x, y, w, col, a, t)            world space: vertical shimmering light streak in a wet floor under a light
//   puddle(c, x, y, rx, ry, t, o)                world space: dark puddle with a ripple ring and a light glint
function rainSheet(c, t, o = {}) {
  const amt = o.amount ?? 1, ang = o.angle ?? .16, col = o.color || '200,215,240', A = o.alpha ?? .35, sp = o.speed ?? 1;
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.lineCap = 'round';
  const layers = o.layers || [[.45, 1.0, 1.2], [.8, 1.6, 2.2], [1.25, 2.6, 3.4]]; // [scale, speed, width]
  layers.forEach(([s, v, w], li) => {
    const n = Math.round(110 * amt * (li === 2 ? .35 : 1)), len = 40 * s + 30;
    for (let i = 0; i < n; i++) {
      const r1 = rnd(i * 7 + li * 1000), r2 = rnd(i * 13 + li * 1000 + 3), period = 1 / (v * sp * .9 + r2 * .3);
      const ph = ((t + r1 * 9) / period) % 1, y = -100 + ph * (H + 200), x = (r2 * (W + 400) - 200 + y * Math.tan(ang)) % (W + 200);
      c.strokeStyle = `rgba(${col},${A * (.35 + li * .3) * (.6 + rnd(i + 51) * .4)})`; c.lineWidth = w;
      c.beginPath(); c.moveTo(x, y); c.lineTo(x - Math.sin(ang) * len, y - Math.cos(ang) * len); c.stroke();
    }
  });
  c.restore();
}
function rainSplashes(c, t, o = {}) {
  const n = o.n || 40, x0 = o.x0 ?? -1500, x1 = o.x1 ?? 1500, y = o.y ?? 0, d = o.depth ?? 300;
  c.save(); c.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const per = .45 + rnd(i + 90) * .5, ph = ((t + rnd(i + 70) * 5) % per) / per; if (ph > .5) continue;
    const k = ph / .5, x = x0 + rnd(i + 30 + Math.floor((t + rnd(i + 70) * 5) / per) * 17) * (x1 - x0), yy = y + rnd(i + 31) * d;
    c.strokeStyle = `rgba(${o.color || '210,225,255'},${.55 * (1 - k)})`; c.lineWidth = 2.5;
    c.beginPath(); c.ellipse(x, yy, 6 + k * 26, 2 + k * 7, 0, 0, Math.PI * 2); c.stroke();
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(x + s * 4, yy - 2); c.lineTo(x + s * (8 + k * 16), yy - 6 - Math.sin(k * Math.PI) * 22); c.stroke(); }
  }
  c.restore();
}
function windowRain(c, x, y, w, h, t, o = {}) {
  const n = o.n || 60, col = o.col || '200,220,255';
  c.save();
  for (let i = 0; i < n; i++) { // static beads
    const bx = x + rnd(i + 400) * w, by = y + rnd(i + 430) * h, r = 3 + rnd(i + 460) * 7;
    c.beginPath(); c.ellipse(bx, by, r * .8, r, 0, 0, Math.PI * 2); c.fillStyle = `rgba(${col},.18)`; c.fill();
    c.beginPath(); c.arc(bx - r * .3, by - r * .3, r * .3, 0, Math.PI * 2); c.fillStyle = `rgba(255,255,255,.45)`; c.fill();
  }
  for (let i = 0; i < (o.rivulets || 9); i++) { // running drops with a trail
    const per = 2.5 + rnd(i + 500) * 3, ph = ((t + rnd(i + 510) * 7) % per) / per, rx = x + rnd(i + 520 + Math.floor((t + rnd(i + 510) * 7) / per)) * w, ry = y + ph * ph * h;
    c.beginPath(); c.moveTo(rx, y + Math.max(0, ry - y - 240)); c.quadraticCurveTo(rx + Math.sin(i) * 8, (ry + y) / 2, rx, ry); c.lineWidth = 3; c.strokeStyle = `rgba(${col},.22)`; c.stroke();
    c.beginPath(); c.ellipse(rx, ry, 6, 8, 0, 0, Math.PI * 2); c.fillStyle = `rgba(${col},.4)`; c.fill(); c.beginPath(); c.arc(rx - 2, ry - 3, 2.4, 0, Math.PI * 2); c.fillStyle = 'rgba(255,255,255,.7)'; c.fill();
  }
  c.restore();
}
function wetReflect(c, x, y, w, col, a = .5, t = 0, len = 520) {
  c.save(); c.globalCompositeOperation = 'screen';
  for (let i = 0; i < 14; i++) {
    const yy = y + i * len / 14, ww = w * (1 - i / 16) * (.7 + .3 * Math.sin(t * 3 + i * 1.7)), dx = Math.sin(t * 2.2 + i * .9) * w * .12;
    c.fillStyle = `rgba(${col},${a * (1 - i / 14) * (.6 + .4 * rnd(i + Math.floor(t * 6)))})`; c.fillRect(x - ww / 2 + dx, yy, ww, len / 14 * .55);
  }
  c.restore();
}
function puddle(c, x, y, rx, ry, t, o = {}) {
  c.save(); c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); c.fillStyle = o.fill || 'rgba(10,14,28,.55)'; c.fill(); c.clip();
  if (o.glow) { const g = c.createRadialGradient(x + (o.gx || 0), y, 0, x + (o.gx || 0), y, rx); g.addColorStop(0, `rgba(${o.glow},.45)`); g.addColorStop(1, `rgba(${o.glow},0)`); c.fillStyle = g; c.fillRect(x - rx, y - ry, rx * 2, ry * 2); }
  for (let i = 0; i < 3; i++) { const ph = ((t * .9 + i / 3 + rnd(x | 0)) % 1); c.beginPath(); c.ellipse(x + (rnd(i + (x | 0)) - .5) * rx, y + (rnd(i + 7) - .5) * ry * .6, ph * rx * .5, ph * ry * .5, 0, 0, Math.PI * 2); c.lineWidth = 2; c.strokeStyle = `rgba(220,230,255,${.35 * (1 - ph)})`; c.stroke(); }
  c.restore();
  c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); c.lineWidth = 2; c.strokeStyle = 'rgba(180,200,240,.18)'; c.stroke();
}
