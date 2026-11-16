// ===================================================================== PROLOG (mystery) — the night of the fall
// 1 · night sea, Grauwacht on its grey rock in the fog
const FORT_NIGHT = K.set((g) => {
  K.sky2(g, 0, 0, W(), 640, { time: 'night', moon: [1500, 190, 44], seed: 11 });
  K.sea(g, 0, 600, W(), 480, { time: 'night', seed: 3 });
  // moon path on the water
  const r = rng(5); for (let i = 0; i < 160; i++) { const v = r(), y = 606 + v * v * 470, x = 1500 + (r() - 0.5) * (30 + v * 260); g.fillStyle = `rgba(220,230,255,${0.12 + 0.3 * (1 - v)})`; g.fillRect(x, y, 8 + v * 40, 2 + v * 3); }
  K.rock(g, 300, 612, 220, 40, { color: '#4a4e5a', seed: 4, wet: 0.3 }); K.rock(g, 1760, 610, 160, 26, { color: '#4a4e5a', seed: 6, wet: 0.3 });
  K.fortress(g, 860, 760, 0.66, { time: 'night', lit: 0.25, seed: 21 });
  // dark foreground boulders with wet highlights
  K.rock(g, 160, 1110, 620, 230, { color: '#2e323c', seed: 31, wet: 0.6 }); K.rock(g, 1830, 1110, 520, 170, { color: '#2e323c', seed: 33, wet: 0.6 });
}, {});
scene(1, { set: FORT_NIGHT, in: 'cut', music: 'mystery', light: -1,
  cam: kb({ x: 960, y: 540, z: 1.0 }, { x: 900, y: 500, z: 1.09 }, PLAN[0].dur),
  grade: { tint: '#56609a', tintA: 0.22, warm: 0.03, vignette: 0.5 },
  sfx: [[0, 'sea', 0.5, { dur: 10.5 }], [0.5, 'wind', 0.25, { dur: 9.5 }]],
  draw(g, t) {
    K.waves(g, 0, 606, W(), 474, t, { time: 'night', n: 110, speed: 0.6 });
    // a few warm slits breathing in the keep
    for (const [x, y, s] of [[760, 498, 1], [905, 470, 2], [1010, 560, 3]]) K.glow(g, x, y, 46, '255,190,110', 0.35 * K.flicker(t, s));
    K.fog(g, [0, 470, W(), 330], t, { a: 0.32, n: 10, speed: 7, color: '170,180,210' });
    K.fog(g, [0, 820, W(), 260], t, { a: 0.18, n: 6, speed: 4, color: '150,160,200', seed: 3 });
  } });

// 2 · a candle, a desk, a file with a name
const DESK = K.set((g) => {
  g.fillStyle = '#2e2018'; g.fillRect(0, 0, W(), 1080);
  // shelves of files behind
  for (let sy = 40; sy < 600; sy += 170) { K.rrect(g, -20, sy + 140, W() + 40, 22, 3, '#4a3020', 3); const r = rng(sy);
    for (let x = 0; x < W(); x += 22 + r() * 30) { const w = 18 + r() * 34, h = 90 + r() * 40, c = ['#7a5a3a', '#8a6a44', '#5a4a3a', '#9a7a50', '#6a3a2a'][(r() * 5) | 0]; K.rrect(g, x, sy + 140 - h, w, h, 2, c, 2); g.fillStyle = 'rgba(240,230,200,.5)'; g.fillRect(x + 4, sy + 140 - h + 14, w - 8, 10); } }
  g.fillStyle = 'rgba(10,6,4,.55)'; g.fillRect(0, 0, W(), 620);
  // desk top in perspective
  K.poly(g, [[-200, 1080], [2120, 1080], [1720, 560], [200, 560]]); g.fillStyle = '#6a4428'; g.fill(); g.save(); g.clip();
  for (let i = 0; i < 70; i++) { const y = 560 + i * 8 + (i * i) * 0.06; g.strokeStyle = `rgba(40,20,10,${0.12 + (i % 3) * 0.05})`; g.lineWidth = 1 + i * 0.03; g.beginPath(); g.moveTo(-200, y); g.bezierCurveTo(600, y + 6, 1300, y - 6, 2120, y + 3); g.stroke(); }
  K.paint(g, 0, 560, W(), 520, ['#4a2a18', '#8a5a34'], 260, 7, 10, 60, 0.12); g.restore();
  K.poly(g, [[200, 560], [1720, 560]], false); K.inkStroke(g, 4, 0.8);
  // papers, books, inkwell
  K.akte(g, 520, 760, 0.8, { rot: -0.12, color: '#a8885a' }); K.akte(g, 500, 720, 0.8, { rot: -0.05, color: '#b8986a' });
  for (let i = 0; i < 4; i++) K.rrect(g, 1380 + i * 4, 860 - i * 22, 300, 24, 3, ['#6a2a2a', '#3a4a5a', '#5a4a2a', '#2a3a2a'][i], 3);
  K.inkwell(g, 1250, 760, 1.1); K.coins(g, 1520, 940, 4, { s: 1.2 });
  K.akte(g, 960, 840, 1.25, { rot: 0.03, label: 'Brenner, Jakob' });
});
scene(2, { set: DESK, light: 1, music: 'mystery',
  cam: kb({ x: 960, y: 560, z: 1.0 }, { x: 960, y: 700, z: 1.28 }, PLAN[1].dur),
  grade: { warm: 0.16, vignette: 0.62 },
  sfx: [[0.6, 'page', 0.25], [0, 'fire', 0.12, { dur: 8.5 }]],
  draw(g, t) {
    K.item(g, 'candle', 1180, 700, 1.4, { t }); candleGlow(g, 1180, 610, t, 1.6);
    K.motes(g, [900, 380, 600, 400], t, { n: 22 });
  } });

// 3 · two warders carry the sack up the fortress stair
const STAIRS = K.set((g) => { K.stairwell(g, { time: 'night' }); });
const stairY = (x) => 996 - clamp((x - 120) / 70, 0, 23.5) * 35;
scene(3, { set: STAIRS, light: -1,
  cam: kb({ x: 820, y: 640, z: 1.22 }, { x: 1180, y: 430, z: 1.22 }, PLAN[2].dur),
  grade: { tint: '#5a6aa0', tintA: 0.18, warm: 0.08, vignette: 0.5 },
  sfx: [...K.steps(0, 14.5, 0.32, 'step-stone', 0.35), [0, 'wind', 0.18, { dur: 14.6 }], [9.2, 'keys', 0.25]],
  draw(g, t) {
    const sp = 38, xf = 760 + t * sp, xr = xf - 330, s = 0.6, step = t * 0.3;
    const yf = stairY(xf) + 8, yr = stairY(xr) + 8;
    // wall lantern bracket (warm pool on the stones)
    K.rrect(g, 1060, 470, 14, 60, 3, '#2a2624', 2.5); K.item(g, 'lantern', 1074, 520, 1.0, {}); K.glow(g, 1074, 590, 360, '255,190,110', 0.38 * K.flicker(t, 2));
    const rear = K.noah(g, { x: xr, y: yr, s, view: 'side', pose: 'walk', step, outfit: GUARD2, armL: 'forward', armR: 'forward', eyes: t > 9 ? 'tired' : 'open', look: t > 9 ? [1, -0.3] : [0.6, 0], blink: blink(t, 3), t });
    const front = K.noah(g, { x: xf, y: yf, s, view: 'side', pose: 'walk', step: step + 0.5, outfit: GUARD, armL: { E: [-70, -240], H: [-140, -196] }, armR: 'hold', holdR: 'lantern', blink: blink(t, 5), t });
    // the sack between the rear guard's hands and the front guard's back hand (iron ball hanging at the rear)
    const a = rear.hands[1], b = front.hands[0], cx = (a[0] + b[0]) / 2, cy = (a[1] + b[1]) / 2 + 30, ang = Math.atan2(b[1] - a[1], b[0] - a[0]), len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    g.save(); g.strokeStyle = '#8a7a5a'; g.lineWidth = 4; g.beginPath(); g.moveTo(a[0] - 10, a[1] + 20); g.quadraticCurveTo(a[0] - 30, a[1] + 90, a[0] - 20, a[1] + 120 + Math.sin(t * 2) * 4); g.stroke(); K.ell(g, a[0] - 20, a[1] + 140 + Math.sin(t * 2) * 4, 22, 22, '#2e2c2e', 3); g.restore();
    K.sack(g, cx, cy, s * 0.95, { rot: ang, ball: false, len: len / (s * 0.95) + 40, t });
    // redraw the gripping hands over the sack
    K.glove(g, a[0], a[1] + 6, ang, 'grip', -1); K.glove(g, b[0], b[1] + 6, ang + Math.PI, 'grip', 1);
    K.glow(g, front.hands[1][0], front.hands[1][1] + 70, 300, '255,200,120', 0.35 * K.flicker(t, 7));
    if (t > 9.4) K.sweat(g, rear.head[0] - 60, rear.head[1] - 40, 0.8, t);
  } });

// 4 · the west wall: wind, the rushing water far below, the fall
const WALLTOP = K.set((g) => {
  K.sky2(g, 0, 0, W(), 1080, { time: 'night', moon: [1380, 210, 40], seed: 23 });
  K.sea(g, 760, 820, 1300, 260, { time: 'night', seed: 9 });
  // cliff and wall face falling to the sea on the left, battlement platform on top
  K.poly(g, [[0, 1080], [0, 560], [760, 560], [800, 700], [860, 860], [880, 1080]]); g.save(); g.clip(); K.stoneBlocks(g, 0, 560, 900, 1080, { color: '#5a5e66', bw: 90, bh: 46, seed: 7, damp: 0.8, moss: 0.3 }); g.restore();
  K.poly(g, [[0, 1080], [0, 560], [760, 560], [800, 700], [860, 860], [880, 1080]]); K.inkStroke(g, 5);
  K.rock(g, 900, 1090, 420, 160, { color: '#3a3e48', seed: 2, wet: 0.7 });
  for (let x = 20; x < 740; x += 120) { K.stoneBlocks(g, x, 470, x + 70, 562, { color: '#626670', bw: 70, bh: 46, seed: x, damp: 0.3, moss: 0.2 }); g.strokeStyle = K.INK; g.lineWidth = 4; g.strokeRect(x, 470, 70, 92); }
  g.fillStyle = '#3e424c'; g.fillRect(0, 556, 770, 14);
});
scene(4, { set: WALLTOP, light: -1,
  cam: kb({ x: 820, y: 560, z: 1.12 }, { x: 960, y: 500, z: 1.0 }, PLAN[3].dur),
  grade: { tint: '#4a5a98', tintA: 0.26, warm: 0.02, vignette: 0.55 },
  sfx: [[0, 'wind', 0.45, { dur: 7.6 }], [0.3, 'sea', 0.4, { dur: 7.3 }], [3.0, 'whoosh', 0.25, { dur: 0.9 }], [4.5, 'splash', 0.35]],
  draw(g, t) {
    // clouds racing (wind)
    const r = rng(3); for (let i = 0; i < 6; i++) { const y = 80 + r() * 380, w = 300 + r() * 400, x = ((r() * 2400 + t * 90 * (0.6 + r())) % 2600) - 400; g.fillStyle = 'rgba(80,92,140,.35)'; g.beginPath(); g.ellipse(x, y, w / 2, 26 + r() * 20, 0, 0, 7); g.fill(); }
    K.waves(g, 760, 820, 1300, 260, t, { time: 'night', n: 60 });
    const s = 0.5, rel = 3.0, swing = t < rel ? Math.sin(t * 2.2) * 26 * ramp(t, 0.5, 2) : 0;
    const gA = K.noah(g, { x: 430, y: 566, s, view: 'side', outfit: GUARD2, armL: 'forward', armR: 'forward', blink: blink(t, 2), t });
    const gB = K.noah(g, { x: 600, y: 566, s, view: 'side', outfit: GUARD, armL: 'forward', armR: 'forward', blink: blink(t, 4), t });
    const hx = (gA.hands[1][0] + gB.hands[1][0]) / 2, hy = gA.hands[1][1];
    if (t < rel) { K.sack(g, hx + 40, hy + 36 + swing * 0.3, s * 0.8, { rot: swing * 0.004, len: 420, t }); }
    else { const u = t - rel, x = hx + 40 + u * 210, y = hy + 36 + 160 * u * u; if (y < 1200) K.sack(g, x, y, s * 0.8, { rot: 0.4 + u * 0.9, len: 420, t }); }
    if (t > 4.4 && t < 6.4) K.burst(g, 1080, 900, (t - 4.4) / 1.6, { r: 90, n: 12, color: 'rgba(220,235,255,.85)' });
    // wind streaks
    g.save(); g.strokeStyle = 'rgba(200,210,240,.18)'; g.lineWidth = 2; for (let i = 0; i < 14; i++) { const y = 80 + (i * 73) % 900, x = ((i * 397 + t * 900) % 2400) - 300; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 90, y - 8, x + 180, y); g.stroke(); } g.restore();
  } });
