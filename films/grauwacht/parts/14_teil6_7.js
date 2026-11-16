// ===================================================================== TEIL 6 · Der Sack (soft tension)
const bunkL = (g) => { K.rrect(g, 150, 700, 420, 30, 4, '#6a5038', 4); for (const lx of [170, 520]) K.rrect(g, lx, 728, 26, 140, 3, '#5a4230', 3); K.ell(g, 360, 696, 210, 22, '#b8a070', 3); };
const sackFloor = (g, x, y, t, o = {}) => K.sack(g, x, y, 0.62, { rot: 0, ball: true, len: 540, t, ...o });
// 32 · the warders sew him into the sack, then go to supper
scene(32, { set: ANSELM_CELL, in: 'black', inDur: 1.6, light: -1, music: 'tense',
  cam: kb({ x: 1100, y: 640, z: 1.2 }, { x: 1180, y: 600, z: 1.28 }, PLAN[31].dur),
  grade: { tint: '#5a62a0', tintA: 0.18, warm: 0.12, vignette: 0.55 },
  sfx: [[0.6, 'sew', 0.18, { dur: 5 }], [7.6, 'keys', 0.2], ...K.steps(7.8, 9.8, 0.5, 'step-stone', 0.3), [9.4, 'door', 0.3]],
  draw(g, t) {
    sackFloor(g, 960, 900, t);
    const leave = t > 7.4, gx = leave ? key(t, [[7.4, 1300], [9.8, 1760]], (v) => v) : 1300;
    const a1 = 1 - dis(t, 9.3, 0.6);
    withA(g, a1, () => {
      const lan = K.noah(g, { x: gx, y: 930, s: 0.6, view: leave ? 'side' : 'front', pose: leave ? 'walk' : 'stand', step: t * 0.5, outfit: GUARD, armR: 'hold', holdR: 'lantern', armL: leave ? 'swing' : 'hang', look: [-0.8, 0.5], blink: blink(t, 4), t });
      K.glow(g, lan.hands[1][0], lan.hands[1][1] + 70, 420, '255,195,115', 0.42 * K.flicker(t, 3));
      const sw = Math.sin(t * 3) * 20;
      if (!leave) K.noah(g, { x: 820, y: 930, s: 0.6, view: 'side', pose: 'kneel', hunch: 0.6, outfit: GUARD2, armR: { E: [100, -170], H: [190 + sw, -160 - Math.abs(sw)] }, holdR: { item: 'needle', t }, armL: 'forward', eyes: 'tired', t });
      else K.noah(g, { x: gx - 150, y: 935, s: 0.6, view: 'side', pose: 'walk', step: t * 0.5 + 0.5, outfit: GUARD2, armL: 'swing', armR: 'swing', t });
    });
  } });

// 33 · through the hole: the spoon opens the seam, Anselm goes into Jakob's bed
scene(33, { set: XSEC, light: -1,
  cam: (t) => { const u = sm(clamp((t - 6.8) / 3)); return { x: lerp(1240, 640, u), y: 640, z: 1.3 }; },
  grade: { tint: '#5a62a0', tintA: 0.22, warm: 0.06, vignette: 0.6 },
  sfx: [[0.3, 'scrape', 0.2, { dur: 2.5 }], [3.6, 'rip', 0.25, { dur: 2.6 }], [7.2, 'drag', 0.2, { dur: 2.4 }], [10.6, 'rustle', 0.2, { dur: 1.2 }]],
  draw(g, t) {
    moonBeam(g, { x: 340, y: 140, w: 110, h: 80 }, [[700, 1080], [240, 1080]], 0.16, '160,185,255'); moonBeam(g, { x: 1560, y: 140, w: 110, h: 80 }, [[1900, 1080], [1400, 1080]], 0.14, '160,185,255');
    bunkL(g);
    const open = clamp((t - 3.6) / 2.6), bodyAway = t > 6.8;
    if (!bodyAway) sackFloor(g, 1540, 930, t, { tear: open * 0.9 }); else sackFloor(g, 1540, 940, t, { tear: 1, bulge: 0.45 });
    if (t < 6.8) { const jx = key(t, [[0.2, 1000], [3, 1330]]); K.noah(g, { x: jx, y: 935, s: 0.6, view: 'side', pose: 'kneel', hunch: 0.5, outfit: JAKOB_PR(8), armR: t > 3.5 ? { E: [100, -170], H: [200 + Math.sin(t * 8) * 18, -130] } : 'forward', holdR: t > 3.5 ? { item: 'spoon', tilt: 1.2 } : null, eyes: 'worried', look: [1, 0.5], blink: blink(t, 2), t }); }
    const bA = dis(t, 9.4, 0.8);
    withA(g, bA, () => { K.blanketBody(g, 360, 690, 0.8, { color: '#5a5a4e', hair: '#e8e4da' }); });
    if (t > 9.4) K.noah(g, { x: 640, y: 930, s: 0.62, view: 'side', flip: true, outfit: JAKOB_PR(8), armR: t < 12 ? 'forward' : 'hang', eyes: 'sad', look: [1, 0.5], blink: blink(t, 3), t });
  } });

// 34 · "Thank you, my friend." Then into the sack, the seam pulled shut from inside
scene(34, { set: XSEC, light: -1,
  cam: (t) => { const u = sm(clamp((t - 3.2) / 2.4)); return { x: lerp(640, 1340, u), y: 660, z: 1.32 }; },
  grade: { tint: '#5a62a0', tintA: 0.24, warm: 0.04, vignette: 0.62 },
  sfx: [[4.0, 'rustle', 0.2, { dur: 2 }], [6.5, 'sew', 0.15, { dur: 2.5 }]],
  draw(g, t) {
    moonBeam(g, { x: 340, y: 140, w: 110, h: 80 }, [[700, 1080], [240, 1080]], 0.16, '160,185,255');
    bunkL(g); K.blanketBody(g, 360, 690, 0.8, { color: '#5a5a4e', hair: '#e8e4da' });
    withA(g, 1 - dis(t, 2.8, 0.8), () => K.noah(g, { x: 640, y: 930, s: 0.62, view: 'side', flip: true, pose: 'kneel', outfit: JAKOB_PR(8), armR: { E: [80, -260], H: [170, -330] }, eyes: 'closed', headTilt: 0.12, t }));
    // in the other cell: Jakob lies in the open sack, only his head out; then it closes
    const c = clamp((t - 6) / 2.6), sx = 1400;
    withA(g, dis(t, 3.4, 0.8), () => {
      sackFloor(g, sx + 100, 940, t, { tear: 0.9 * (1 - c), bulge: 0.9 });
      if (c < 0.95) { g.save(); g.beginPath(); g.rect(sx - 300, 700, 340, 260); g.clip(); K.noah(g, { x: sx - 150, y: 930 + c * 120, s: 0.5, pose: 'lie', outfit: JAKOB_PR(8), blanket: '#c8b48a', blanketPattern: 'tweed', eyes: c > 0.4 ? 'closed' : 'open', look: [1, -0.6], headTilt: -0.3, t }); g.restore(); }
      if (t > 7) { const gl = 0.5 + 0.5 * Math.sin(t * 3); K.star(g, sx + 40, 905, 10 * gl, t, `rgba(230,240,255,${gl})`); }
    });
  } });

// 35 · midnight: the west wall, the wind, the throw
scene(35, { set: WALLTOP, light: -1,
  cam: kb({ x: 760, y: 560, z: 1.18 }, { x: 860, y: 560, z: 1.12 }, PLAN[34].dur),
  grade: { tint: '#4a5a98', tintA: 0.26, warm: 0.02, vignette: 0.58 },
  sfx: [[0, 'wind', 0.4, { dur: 9.8 }], ...K.steps(0.6, 4.4, 0.55, 'step-stone', 0.3), [6.8, 'sea', 0.35, { dur: 3 }], [8.6, 'whoosh', 0.25, { dur: 0.9 }]],
  draw(g, t) {
    const r = rng(3); for (let i = 0; i < 6; i++) { const y = 80 + r() * 380, w = 300 + r() * 400, x = ((r() * 2400 + t * 90 * (0.6 + r())) % 2600) - 400; g.fillStyle = 'rgba(80,92,140,.35)'; g.beginPath(); g.ellipse(x, y, w / 2, 26 + r() * 20, 0, 0, 7); g.fill(); }
    K.waves(g, 760, 820, 1300, 260, t, { time: 'night', n: 60 });
    const s = 0.5, walk = t < 4.4, off = walk ? key(t, [[0.4, -420], [4.4, 0]], (v) => v) : 0, rel = 8.6, swing = !walk && t < rel ? Math.sin((t - 4.4) * 2.2) * 26 * ramp(t, 5, 6.5) : 0;
    const gA = K.noah(g, { x: 430 + off, y: 566, s, view: 'side', pose: walk ? 'walk' : 'stand', step: t * 0.55, outfit: GUARD2, armL: 'forward', armR: 'forward', t });
    const gB = K.noah(g, { x: 600 + off, y: 566, s, view: 'side', pose: walk ? 'walk' : 'stand', step: t * 0.55 + 0.5, outfit: GUARD, armL: 'forward', armR: 'hold', holdR: 'lantern', t });
    K.glow(g, gB.hands[1][0], gB.hands[1][1] + 60, 300, '255,195,115', 0.4 * K.flicker(t, 2));
    const hx = (gA.hands[1][0] + gB.hands[0][0]) / 2 + 20, hy = gA.hands[1][1];
    if (t < rel) K.sack(g, hx + 30, hy + 36 + swing * 0.3, s * 0.8, { rot: swing * 0.004, len: 420, t });
    else { const u = t - rel, x = hx + 30 + u * 210, y = hy + 36 + 160 * u * u; K.sack(g, x, y, s * 0.8, { rot: 0.4 + u * 0.9, len: 420, t }); }
    g.save(); g.strokeStyle = 'rgba(200,210,240,.18)'; g.lineWidth = 2; for (let i = 0; i < 14; i++) { const y = 80 + (i * 73) % 900, x = ((i * 397 + t * 900) % 2400) - 300; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 90, y - 8, x + 180, y); g.stroke(); } g.restore();
  } });

// underwater
const UNDER = K.set((g) => { K.underwater(g, { seed: 5 }); const r = rng(8); for (let i = 0; i < 12; i++) { const x = r() * W(); K.rock(g, x, 1100, 200 + r() * 260, 80 + r() * 120, { color: '#12243a', seed: i, wet: 0 }); } });
// 36 · ice-cold, like a thousand knives; the ball pulls him down; the spoon, again and again
scene(36, { set: UNDER, in: 'fade', inDur: 0.9, light: 1,
  cam: kb({ x: 960, y: 480, z: 1.15 }, { x: 960, y: 620, z: 1.2 }, PLAN[35].dur),
  grade: { warm: -0.0, vignette: 0.6 },
  sfx: [[0, 'splash', 0.45], [0.2, 'underwater', 0.4, { dur: 12.3 }], [1.0, 'bubbles', 0.25, { dur: 3 }], [8.3, 'rip', 0.2, { dur: 3.5 }]],
  draw(g, t) {
    const y = key(t, [[0, 120], [12.5, 640]], K.eout), sx = 960 + Math.sin(t * 0.7) * 20;
    K.bubbles(g, sx, y - 40, t, { n: 22, spread: 120, rise: 600, s: 1.2 });
    const tear = clamp((t - 8.3) / 3.6);
    K.sack(g, sx, y, 0.75, { rot: Math.PI / 2 - 0.15 + Math.sin(t * 1.4) * 0.05, len: 520, tear: tear * 0.8, wet: 0.6, t });
    for (const k of [8.4, 9.3, 10.1, 10.9, 11.6]) { const d = t - k; if (d > 0 && d < 0.6) { const p = Math.sin(d / 0.6 * Math.PI); g.save(); g.translate(sx - 40, y - 40); g.rotate(-0.4); K.rrect(g, -4, -20 - p * 40, 8, 50, 3, '#c8ccd4', 2.5); g.restore(); K.bubbles(g, sx - 50, y - 60, t * 3, { n: 6, spread: 30, rise: 160, seed: k * 10 }); } }
  } });

// 37 · the knot at the feet, burning lungs … free; up toward the air
scene(37, { set: UNDER, light: 1,
  cam: kb({ x: 960, y: 560, z: 1.2 }, { x: 960, y: 520, z: 1.2 }, PLAN[36].dur),
  grade: { vignette: 0.6 },
  sfx: [[0, 'underwater', 0.35, { dur: 11 }], [3.0, 'heartbeat', 0.25, { n: 4 }], [6.7, 'bubbles', 0.3, { dur: 2 }], [11.4, 'surface', 0.4]],
  draw(g, t) {
    const free = t > 6.7, jy = free ? key(t, [[6.7, 860], [12.8, 480]], K.eio) : 860 + Math.sin(t * 2) * 6, surf = key(t, [[7.5, -200], [12.2, 320]], K.eio);
    // the surface sliding into view from above, night sky beyond it
    if (surf > 0) { g.save(); g.beginPath(); g.rect(0, -200, W(), surf + 200); g.clip(); K.sky2(g, 0, -200, W(), surf + 220, { time: 'night', stars: 120, seed: 4, moon: [1500, surf - 140, 34] }); g.restore();
      g.fillStyle = 'rgba(160,200,235,.5)'; g.fillRect(0, surf - 3, W(), 10); K.waves(g, 0, surf - 6, W(), 30, t, { time: 'night', n: 40 }); }
    // the torn sack drifting away
    K.sack(g, 760 - t * 20, 760 + t * 30, 0.7, { rot: 1.2, ball: false, tear: 1, wet: 0.7, bulge: 0.4, t });
    const by = free ? 960 + (t - 6.7) * (t - 6.7) * 120 : 980; K.ell(g, 1040, by, 34, 34, '#1e1c1e', 4);
    const j = K.noah(g, { x: 1000, y: jy, s: 0.5, view: 'side', pose: free ? 'walk' : 'stand', step: free ? t * 0.8 : 0, hunch: free ? 0 : 1, outfit: JAKOB_SEA, armR: free ? 'up' : 'hang', armL: free ? 'up' : 'hang', eyes: t < 3 ? 'worried' : t < 6.7 ? 'closed' : 'wide', look: [0, -1], t });
    if (!free) { g.strokeStyle = '#8a7a5a'; g.lineWidth = 5; g.beginPath(); g.moveTo(1010, jy - 10); g.lineTo(1040, by - 30); g.stroke(); }
    K.bubbles(g, j.head[0], j.head[1] - 60, t, { n: 10, spread: 50, rise: 400, s: 0.9 });
  } });

// 38 · the whole sky, for the first time in eight years; lying on his back, calm, as Anselm taught
const SKY_FULL = K.set((g) => {
  K.sky2(g, 0, 0, W(), 900, { time: 'night', moon: [1580, 160, 40], stars: 900, seed: 31 });
  g.save(); g.globalCompositeOperation = 'screen'; const r = rng(9); for (let i = 0; i < 500; i++) { const u = r(), x = lerp(-100, 2000, u), y = 640 - u * 520 + (r() - 0.5) * 140; g.fillStyle = `rgba(200,210,255,${0.03 + r() * 0.06})`; g.beginPath(); g.arc(x, y, 6 + r() * 26, 0, 7); g.fill(); } g.restore();
  K.sea(g, 0, 860, W(), 220, { time: 'night', seed: 6 });
});
const floater = (g, x, y, s, t, o = {}) => rotNoah(g, { x, y, s, view: 'side', outfit: JAKOB_SEA, armL: 'hang', armR: 'hang', eyes: 'open', look: [0, -1], t, ...o }, -Math.PI / 2 + Math.sin(t * 0.8) * 0.02, x, y);
scene(38, { set: SKY_FULL, light: 1,
  cam: (t) => { const u = sm(clamp((t - 1) / 7)); return { x: lerp(1100, 960, u), y: lerp(380, 720, u), z: lerp(1.25, 1.3, u) }; },
  grade: { tint: '#4a58a0', tintA: 0.18, warm: 0.0, vignette: 0.45 },
  sfx: [[0, 'sea', 0.35, { dur: 10 }]],
  draw(g, t) {
    K.waves(g, 0, 864, W(), 216, t, { time: 'night', n: 80, speed: 0.4 });
    const dip = K.bigDipper(520, 160, 1.0), pol = K.polaris(dip, 4.2); for (const p of dip) K.star(g, p[0], p[1], 8, 0, '#fffbe8'); K.glow(g, pol[0], pol[1], 50, '255,250,220', 0.6); K.star(g, pol[0], pol[1], 13, 0, '#fff8d8');
    floater(g, 1000 - 60, 930 + Math.sin(t * 1.2) * 4, 0.42, t, { eyes: t > 6 ? 'closed' : 'open' });
    g.fillStyle = 'rgba(20,40,80,.45)'; g.fillRect(0, 940 + Math.sin(t) * 3, W(), 140); K.waves(g, 0, 940, W(), 140, t, { time: 'night', n: 50, seed: 9 });
  } });

// ===================================================================== TEIL 7 · Die Fischer (folk, calm)
// 39 · the tide runs east; the Pole Star to steer by; the fortress shrinks behind
const WIDE_NIGHT = K.set((g) => { K.sky2(g, 0, 0, W(), 660, { time: 'night', stars: 700, seed: 41 }); K.sea(g, 0, 640, W(), 440, { time: 'night', seed: 3 }); K.fortress(g, 230, 652, 0.17, { time: 'night', lit: 0.3 }); });
scene(39, { set: WIDE_NIGHT, light: 1, music: 'folk',
  cam: kb({ x: 900, y: 540, z: 1.08 }, { x: 1040, y: 540, z: 1.08 }, PLAN[38].dur),
  grade: { tint: '#4a58a0', tintA: 0.2, vignette: 0.45 },
  sfx: [[0, 'sea', 0.3, { dur: 8.2 }]],
  draw(g, t) {
    K.waves(g, 0, 644, W(), 436, t, { time: 'night', n: 120, speed: 0.8 });
    const dip = K.bigDipper(900, 120, 0.9), pol = K.polaris(dip, 4.2); for (const p of dip) K.star(g, p[0], p[1], 7, 0, '#fffbe8'); K.glow(g, pol[0], pol[1], 60, '255,250,220', 0.7); K.star(g, pol[0], pol[1], 12, 0, '#fff8d8');
    g.save(); g.setLineDash([4, 12]); g.strokeStyle = 'rgba(255,245,200,.25)'; g.lineWidth = 2; g.beginPath(); g.moveTo(pol[0], pol[1] + 20); g.lineTo(1000 + t * 20, 760); g.stroke(); g.restore();
    floater(g, 960 + t * 22, 780, 0.18, t, { eyes: 'open' });
    for (let i = 0; i < 10; i++) { const x = ((i * 211 + t * 40) % 2000) - 40, y = 700 + (i * 53) % 360; g.strokeStyle = 'rgba(200,215,255,.25)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 40, y); g.stroke(); }
  } });

// 40 · toward morning: a small rock full of gull droppings; shivering till the sun came up
const DAWN_ROCK = K.set((g) => { K.sky2(g, 0, 0, W(), 640, { time: 'dawn', seed: 6 }); K.glow(g, 1500, 640, 700, '255,200,140', 0.6); K.ell(g, 1500, 640, 60, 60, '#ffe8b0', 0);
  K.sea(g, 0, 620, W(), 460, { time: 'dawn', seed: 5 }); for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(255,210,150,${0.2 + i * 0.01})`; g.fillRect(1500 - 20 - i * 3, 630 + i * 11, 40 + i * 6, 3); }
  K.rock(g, 760, 900, 820, 230, { color: '#7a7672', guano: 1, seed: 14 }); });
scene(40, { set: DAWN_ROCK, light: -1,
  cam: kb({ x: 860, y: 600, z: 1.12 }, { x: 960, y: 560, z: 1.08 }, PLAN[39].dur),
  grade: { warm: 0.14, vignette: 0.42 },
  sfx: [[0, 'sea', 0.3, { dur: 9.3 }], [2, 'gulls', 0.3, { dur: 3 }]],
  draw(g, t) {
    K.waves(g, 0, 624, W(), 456, t, { time: 'dawn', n: 100, speed: 0.5 });
    gullSit(g, 520, 760, 1.1); gullSit(g, 1040, 742, 1.0, true); gullSit(g, 1110, 760, 0.9);
    const shiver = Math.sin(t * 40) * 1.6 * (1 - dis(t, 6, 3));
    rotNoah(g, { x: 840, y: 700 + shiver, s: 0.42, view: 'side', outfit: JAKOB_SEA, hunch: 0.5, armL: 'cross', armR: 'cross', eyes: t > 5 ? 'tired' : 'closed', look: [1, 0], t }, -Math.PI / 2 + 0.06, 840, 700);
    gulls(g, t, [[200, 180, 20, 1.1], [600, 260, 14, 0.9, 2]]);
  } });

// 41 · noon: a fishing cutter; waving until the arms could do no more
const NOON_ROCK = K.set((g) => { K.sky2(g, 0, 0, W(), 600, { time: 'day', seed: 9 }); K.sea(g, 0, 580, W(), 500, { time: 'day', seed: 8 }); K.rock(g, 420, 1120, 960, 330, { color: '#8a8682', guano: 1, seed: 21 }); });
scene(41, { set: NOON_ROCK, light: 1,
  cam: kb({ x: 900, y: 540, z: 1.05 }, { x: 960, y: 520, z: 1.1 }, PLAN[40].dur),
  grade: { warm: 0.1, vignette: 0.32 },
  sfx: [[0, 'sea', 0.3, { dur: 11.3 }], [1, 'gulls', 0.2, { dur: 3 }]],
  draw(g, t) {
    K.waves(g, 0, 584, W(), 496, t, { time: 'day', n: 120, speed: 0.6 });
    const cx = key(t, [[0, 1900], [11.3, 1360]], (v) => v), rk = Math.sin(t * 1.2) * 0.02;
    K.cutter(g, cx, 700, 0.42, { flip: true, rock: rk });
    for (const [dx, o] of [[-60, HINNERK], [40, FISHER_A], [120, FISHER_B]]) K.noah(g, { x: cx + dx, y: 640, s: 0.2, outfit: o, armR: o === FISHER_A ? 'wave' : 'hang', t });
    const tired = clamp((t - 7.5) / 3);
    K.noah(g, { x: 430, y: 840, s: 0.6, outfit: JAKOB_SEA, armL: tired > 0.7 ? 'hang' : 'wave', armR: tired > 0.5 ? 'hang' : 'wave', eyes: tired > 0.5 ? 'tired' : 'wide', look: [1, -0.2], t: t * (1 - tired * 0.6) });
    gullSit(g, 250, 880, 0.9);
  } });

// the cutter's deck
const DECK_DAY = K.set((g) => { K.deck(g, { time: 'day' }); K.netPile(g, 1620, 820, 1.1); K.fishCrate(g, 260, 860, 1.0); K.ropeCoil(g, 1420, 1000, 1); K.barrel(g, 120, 760, 0.8); });
// 42 · "Shipwrecked. Our schooner went down. I'm the only one." Captain Hinnerk looks at him for a long time
scene(42, { set: DECK_DAY, light: 1,
  cam: kb({ x: 960, y: 540, z: 1.05 }, { x: 900, y: 560, z: 1.14 }, PLAN[41].dur),
  grade: { warm: 0.1, vignette: 0.35 },
  sfx: [[0, 'sea', 0.25, { dur: 10 }], [0, 'creak', 0.15, { dur: 10 }]],
  draw(g, t) {
    K.waves(g, 0, 504, W(), 136, t, { time: 'day', n: 50 });
    K.noah(g, { x: 1500, y: 760, s: 0.5, view: 'side', flip: true, outfit: FISHER_A, armR: 'type', t });
    K.noah(g, { x: 400, y: 770, s: 0.5, view: 'side', outfit: FISHER_B, armR: 'hold', look: [1, 0], t });
    K.crate(g, 610, 990, 200, 120, { color: '#8a6a44' });
    K.noah(g, { x: 710, y: 1050, s: 0.68, pose: 'sit', outfit: JAKOB_SEA, eyes: 'worried', look: [0.6, -0.2], armL: 'rest', armR: 'rest', blink: blink(t, 2), t });
    K.noah(g, { x: 1170, y: 1040, s: 0.72, outfit: HINNERK, eyes: t > 4 ? 'tired' : 'open', look: [-0.8, 0.2], headTilt: t > 4 ? -0.08 : 0, armL: 'hip', armR: 'hip', blink: blink(t, 9), t });
  } });

// 43 · a blanket and a mug of hot tea with rum
scene(43, { set: DECK_DAY, light: 1,
  cam: kb({ x: 900, y: 600, z: 1.3 }, { x: 900, y: 640, z: 1.42 }, PLAN[42].dur),
  grade: { warm: 0.14, vignette: 0.4 },
  sfx: [[0, 'sea', 0.2, { dur: 14 }], [3.0, 'rustle', 0.25, { dur: 1.2 }], [7.6, 'sip', 0.25], [10.2, 'sip', 0.2]],
  draw(g, t) {
    K.crate(g, 610, 990, 200, 120, { color: '#8a6a44' });
    const blanket = t > 3.2, drinkA = t > 6.6 ? K.key(t, [[6.6, K.ARMS.hold], [7.4, K.ARMS.drink], [8.6, K.ARMS.drink], [9.4, K.ARMS.hold], [9.9, K.ARMS.drink], [11, K.ARMS.drink], [11.8, K.ARMS.hold]]) : K.ARMS.rest;
    const sip = t > 7.4 && t < 8.6 || t > 9.9 && t < 11;
    const j = K.noah(g, { x: 710, y: 1050, s: 0.68, pose: 'sit', outfit: blanket ? { ...JAKOB_SEA, shawl: '#6a6a5a' } : JAKOB_SEA, eyes: sip ? 'closed' : t > 3.2 ? 'tired' : 'worried', look: [0.6, -0.2], armR: drinkA, holdR: t > 6.6 ? { item: 'mug', color: '#5a6a8a', tilt: sip ? -0.5 : 0 } : null, armL: 'rest', blink: blink(t, 2), t });
    if (t > 6.6 && !sip) K.steam(g, j.hands[1][0] - 4, j.hands[1][1] - 40, t, { s: 0.6 });
    const give = t < 3.2 ? 'forward' : t > 5.4 && t < 6.6 ? 'forward' : 'hip';
    K.noah(g, { x: 1060, y: 1040, s: 0.72, outfit: HINNERK, view: 'side', flip: true, armR: give, holdR: t > 5.4 && t < 6.6 ? { item: 'mug', color: '#5a6a8a' } : null, armL: 'hang', eyes: t > 11 ? 'happy' : 'open', look: [1, 0.2], blink: blink(t, 9), t });
    if (t < 3.2) { g.save(); g.translate(910, 760); K.rrect(g, -60, -40, 120, 80, 14, K.pattern(g, 'tweed', '#6a6a5a'), 3); g.restore(); }
  } });

// 44 · three months on the cutter: nets mended, the deck repaired, fish gutted
const hammer = (g, x, y, a) => { g.save(); g.translate(x, y); g.rotate(a); K.rrect(g, -5, -10, 10, 70, 3, '#7a5434', 2.5); K.rrect(g, -18, -24, 36, 18, 3, '#4a4a50', 2.5); g.restore(); };
scene(44, { set: DECK_DAY, light: 1,
  cam: kb({ x: 960, y: 560, z: 1.12 }, { x: 960, y: 580, z: 1.18 }, PLAN[43].dur),
  grade: { warm: 0.16, vignette: 0.35 },
  sfx: [[0, 'sea', 0.22, { dur: 12.6 }], [0.4, 'rustle', 0.15, { dur: 3 }], ...[5.2, 5.8, 6.4, 7.0, 7.6].map((k) => [k, 'knock', 0.14, { n: 1 }]), [9.4, 'squelch', 0.0]],
  draw(g, t) {
    K.waves(g, 0, 504, W(), 136, t, { time: 'day', n: 50 });
    K.noah(g, { x: 1640, y: 760, s: 0.48, view: 'side', flip: true, outfit: HINNERK, armR: 'forward', armL: 'forward', t }); K.rrect(g, 1500, 700, 120, 14, 4, '#7a5434', 3);
    const a1 = 1 - dis(t, 4.2, 0.8), a2 = dis(t, 4.2, 0.8) * (1 - dis(t, 8.4, 0.8)), a3 = dis(t, 8.4, 0.8);
    withA(g, a1, () => { K.crate(g, 680, 1000, 180, 110); K.noah(g, { x: 770, y: 1060, s: 0.66, pose: 'sit', outfit: JAKOB_FISH, armR: { E: [70, -330], H: [20 + Math.sin(t * 5) * 20, -300] }, holdR: { item: 'needle', t }, armL: 'rest', eyes: 'open', look: [0, 0.8], t }); K.netPile(g, 780, 1000, 0.9, { seed: 9 }); });
    withA(g, a2, () => { const hs = Math.abs(Math.sin(t * 5)); const j = K.noah(g, { x: 820, y: 1000, s: 0.66, view: 'side', pose: 'kneel', hunch: 0.6, outfit: JAKOB_FISH, armR: { E: [100, -230 + hs * 40], H: [180, -300 + hs * 140] }, armL: 'forward', eyes: 'open', look: [1, 0.8], t }); hammer(g, j.hands[1][0], j.hands[1][1] - 10, 0.3 - hs * 0.6); K.rrect(g, 940, 990, 220, 16, 3, '#c8a06a', 3); });
    withA(g, a3, () => { K.crate(g, 820, 1000, 260, 120, { color: '#8a6a44' }); K.noah(g, { x: 900, y: 1040, s: 0.66, outfit: JAKOB_FISH, armR: { E: [60, -260], H: [10 + Math.sin(t * 4) * 20, -200] }, holdR: { item: 'knife', tilt: -1 }, armL: 'front', holdL: { item: 'fish', tilt: 1.5 }, eyes: 'open', look: [0, 0.8], t }); K.fishCrate(g, 1180, 1060, 0.9, { seed: 4 }); });
  } });

// 45 · first wages: a haircut, a beard. Nobody would have known him. In June: "Let's sail to Möwenholm"
const DECK_GOLD = K.set((g) => { K.deck(g, { time: 'golden', seed: 17 }); K.netPile(g, 300, 860, 1.0); K.fishCrate(g, 1680, 900, 1.0); K.glow(g, 300, 400, 800, '255,200,140', 0.4); });
scene(45, { set: DECK_GOLD, light: 1,
  cam: kb({ x: 960, y: 560, z: 1.12 }, { x: 1000, y: 560, z: 1.2 }, PLAN[44].dur),
  grade: { warm: 0.24, vignette: 0.38 },
  sfx: [[0, 'sea', 0.22, { dur: 11.5 }], [0, 'creak', 0.12, { dur: 11.5 }]],
  draw(g, t) {
    K.waves(g, 0, 504, W(), 136, t, { time: 'golden', n: 50 });
    K.rrect(g, 1250, 830, 160, 16, 4, '#7a5434', 3);
    K.noah(g, { x: 1370, y: 1020, s: 0.7, view: 'side', flip: true, outfit: HINNERK, armR: 'forward', armL: 'forward', eyes: t > 9 ? 'happy' : 'open', look: [1, 0], blink: blink(t, 9), t });
    K.noah(g, { x: 840, y: 1030, s: 0.72, outfit: JAKOB_FISH2, turn: 0.4, look: t > 8 ? [1, 0] : [0, 0], eyes: t < 4 ? 'happy' : 'open', armL: 'hip', armR: t > 8.4 && t < 10.5 ? 'point' : 'hang', blink: blink(t, 2), t });
  } });

// 46 · "Only gulls and stones there." He sailed anyway
const SUNSET_SEA = K.set((g) => { K.sky2(g, 0, 0, W(), 600, { time: 'golden', seed: 15 }); K.glow(g, 1500, 560, 800, '255,190,120', 0.6); K.ell(g, 1500, 570, 70, 70, '#ffe0a0', 0); K.sea(g, 0, 580, W(), 500, { time: 'golden', seed: 12 });
  K.hill(g, 1250, 1800, 590, 120, { color: '#7a7a5a', seed: 3 }); K.lighthouseRuin(g, 1540, 482, 0.16, { time: 'golden' }); });
scene(46, { set: SUNSET_SEA, light: -1,
  cam: kb({ x: 900, y: 560, z: 1.1 }, { x: 1040, y: 560, z: 1.12 }, PLAN[45].dur),
  grade: { warm: 0.24, vignette: 0.4 },
  sfx: [[0, 'sea', 0.25, { dur: 9 }], [3, 'gulls', 0.15, { dur: 3 }]],
  draw(g, t) {
    K.waves(g, 0, 584, W(), 496, t, { time: 'golden', n: 120, speed: 0.6 });
    const cx = 540 + t * 26; K.cutter(g, cx, 800, 0.46, { rock: Math.sin(t * 1.1) * 0.02 });
    for (const [dx, o] of [[-200, FISHER_B], [-60, HINNERK], [120, JAKOB_FISH2]]) K.noah(g, { x: cx + dx, y: 728, s: 0.21, outfit: o, eyes: o === HINNERK && t > 3 ? 'happy' : 'open', t });
    gulls(g, t, [[300, 260, 20, 1], [1300, 300, -15, 0.8, 1], [1700, 420, -10, 0.7, 3]]);
  } });
