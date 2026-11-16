// ===================================================================== TEIL 2 · Die Festung (sad)
// 11 · two hours by boat through grey fog to the rock
const FOGSEA = K.set((g) => {
  K.sky2(g, 0, 0, W(), 620, { time: 'fog', seed: 4 }); K.sea(g, 0, 600, W(), 480, { time: 'fog', seed: 7 });
  K.fortress(g, 1380, 690, 0.52, { time: 'overcast', lit: 0, seed: 21, color: '#8a8c8e' });
  g.fillStyle = 'rgba(205,212,216,.5)'; g.fillRect(0, 0, W(), 690);
  K.rock(g, 1820, 640, 200, 40, { color: '#7a7e80', seed: 9 }); K.rock(g, 200, 1120, 500, 150, { color: '#5a5e62', seed: 12, wet: 0.6 });
});
scene(11, { set: FOGSEA, in: 'black', inDur: 2.2, music: 'sad', light: 1,
  cam: kb({ x: 900, y: 560, z: 1.12 }, { x: 1040, y: 540, z: 1.18 }, PLAN[10].dur),
  grade: { tint: '#7a8aa4', tintA: 0.12, warm: 0.04, vignette: 0.42 },
  sfx: [[0, 'sea', 0.35, { dur: 12 }], [0, 'oars', 0.3, { dur: 12 }], [3, 'gulls', 0.12, { dur: 3 }]],
  draw(g, t) {
    K.waves(g, 0, 604, W(), 476, t, { time: 'fog', n: 80, speed: 0.4, a: 0.7 });
    const bx = 380 + t * 34, by = 800 + Math.sin(t * 1.3) * 5, rk = Math.sin(t * 1.1) * 0.015, row = (t * 0.55) % 1, oar = Math.sin(row * Math.PI * 2);
    g.save(); g.translate(bx, by); g.rotate(rk); g.translate(-bx, -by);
    const s = 0.42;
    K.noah(g, { x: bx - 110, y: by + 10, s, view: 'side', pose: 'sit', outfit: GUARD, armR: { E: [40, -170], H: [110 + oar * 40, -150] }, armL: { E: [40, -170], H: [100 + oar * 40, -150] }, t });
    K.noah(g, { x: bx + 30, y: by + 10, s, view: 'side', pose: 'sit', outfit: GUARD2, armR: { E: [40, -170], H: [110 + oar * 40, -150] }, armL: { E: [40, -170], H: [100 + oar * 40, -150] }, t });
    K.noah(g, { x: bx + 150, y: by + 10, s, view: 'side', pose: 'sit', outfit: JAKOB_PR(0), eyes: 'sad', headTilt: 0.12, look: [1, -0.3], armR: 'rest', armL: 'rest', blink: blink(t, 2), t });
    K.rowboat(g, bx + 20, by + 8, 0.9);
    g.strokeStyle = K.INK; g.lineWidth = 9; for (const ox of [-110, 30]) { const hx = bx + ox + (105 + oar * 40) * s, hy = by + 10 - 150 * s; g.beginPath(); g.moveTo(hx, hy); g.lineTo(hx - 150 - oar * 40, by + 40); g.stroke(); }
    g.strokeStyle = '#a07a50'; g.lineWidth = 5; for (const ox of [-110, 30]) { const hx = bx + ox + (105 + oar * 40) * s, hy = by + 10 - 150 * s; g.beginPath(); g.moveTo(hx, hy); g.lineTo(hx - 150 - oar * 40, by + 40); g.stroke(); }
    g.restore();
    K.fog(g, [0, 380, W(), 500], t, { a: 0.38, n: 12, speed: 9, color: '214,220,224' });
    gulls(g, t, [[600, 260, 18, 0.8], [1100, 300, -12, 0.7, 2]]);
  } });

// the cell (Jakob's): small high window, straw bunk, bucket, cracked ceiling
const CELLW = { x: 1180, y: 150, w: 120, h: 90 };
const CELL_DAY = K.set((g) => { K.cell(g, { win: CELLW, door: null, time: 'day', cracks: 60 }); cellDoor(g, 300, 800, 0); K.stoneBlocks(g, 140, 300, 460, 332, { color: '#7a7672', bw: 60, bh: 32, seed: 4, damp: 0 }); });
const CELL_NIGHT = K.set((g) => { K.cell(g, { win: CELLW, door: null, time: 'night', cracks: 60 }); cellDoor(g, 300, 800, 0); K.stoneBlocks(g, 140, 300, 460, 332, { color: '#7a7672', bw: 60, bh: 32, seed: 4, damp: 0 }); });
const cellDoorDraw = (g, u) => cellDoor(g, 300, 800, u);
const winBeam = (g, a = 0.14, night = false) => moonBeam(g, CELLW, [[1180, 1080], [760, 1080]], a, night ? '160,185,255' : '235,240,250');
// 12 · day one: the warder, the keys, three steps by four
scene(12, { set: CELL_DAY, light: -1,
  cam: kb({ x: 900, y: 560, z: 1.05 }, { x: 980, y: 520, z: 1.12 }, PLAN[11].dur),
  grade: { tint: '#8a90a4', tintA: 0.16, warm: 0.04, vignette: 0.5 },
  sfx: [[0.2, 'keys', 0.3], [0.4, 'door', 0.3], ...K.steps(1.0, 6.5, 0.45, 'step-stone', 0.35), [9.3, 'door', 0.35], [9.9, 'thud', 0.3]],
  draw(g, t) {
    const u = key(t, [[0, 0.2], [0.9, 1], [8.8, 1], [10, 0]]);
    if (u > 0.3) K.glow(g, 300, 600, 400, '255,190,110', 0.4 * u);
    cellDoorDraw(g, u); winBeam(g, 0.14);
    if (t < 9.6) K.noah(g, { x: 300, y: 810, s: 0.6, outfit: GUARD, armR: 'hold', holdR: 'lantern', armL: 'hang', holdL: { item: 'keys', t }, look: [1, 0], eyes: t > 7 ? 'tired' : 'open', blink: blink(t, 5), t });
    const jx = key(t, [[0.8, 420], [6.8, 840]], (v) => v), walking = t > 0.8 && t < 6.8;
    K.noah(g, { x: jx, y: 880, s: 0.66, view: walking ? 'side' : 'front', pose: walking ? 'walk' : 'stand', step: t * 0.45, outfit: JAKOB_PR(0), armL: 'swing', armR: 'swing', eyes: t > 7 ? 'sad' : 'worried', look: t > 7 ? [0.6, -1] : [1, 0], blink: blink(t, 2), t });
  } });

// 13 · the years: screaming, weeping, lying and counting the cracks; the tally grows
scene(13, { set: CELL_DAY, light: -1,
  cam: (t) => { const u = sm(clamp((t - 7.4) / 3.6)); return { x: lerp(1080, 1180, u), y: lerp(560, 360, u), z: lerp(1.15, 1.45, u) }; },
  grade: { tint: '#8890a8', tintA: 0.18, warm: 0.03, vignette: 0.55 },
  sfx: [[0, 'drip', 0.25], [2.8, 'drip', 0.2], [6.1, 'drip', 0.22], [9.4, 'drip', 0.2]],
  draw(g, t) {
    winBeam(g, 0.13); tally(g, Math.round(lerp(40, 190, clamp(t / 10))), 1260, 420);
    const aA = 1 - dis(t, 3.2), aB = dis(t, 3.2) * (1 - dis(t, 6.8)), aC = dis(t, 6.8);
    withA(g, aA, () => K.noah(g, { x: 1180, y: 880, s: 0.64, outfit: JAKOB_PR(1), eyes: 'wide', armL: 'up', armR: 'up', look: [0, -1], headTilt: Math.sin(t * 5) * 0.03, t }));
    withA(g, aB, () => { const j = K.noah(g, { x: 1470, y: 800, s: 0.62, pose: 'sit', outfit: JAKOB_PR(2), eyes: 'sad', headTilt: 0.2, look: [0, 0.8], armL: 'rest', armR: 'face', t }); K.sweat(g, j.head[0] - 30, j.head[1] + 30, 0.7, t); });
    withA(g, aC, () => K.noah(g, { x: 1310, y: 576, s: 0.5, pose: 'lie', outfit: JAKOB_PR(3), eyes: 'open', look: [0.3, -1], blanket: '#6a6a5a', blanketPattern: 'tweed', blink: blink(t, 4), headTilt: -0.1, t }));
  } });

// 14 · one night, a knock low in the wall
const HOLE = { x: 560, y: 735 };
scene(14, { set: CELL_NIGHT, light: 1,
  cam: kb({ x: 1000, y: 560, z: 1.08 }, { x: 760, y: 640, z: 1.3 }, PLAN[13].dur),
  grade: { tint: '#4a5aa0', tintA: 0.32, warm: 0.02, vignette: 0.55 },
  sfx: [[3.8, 'knock', 0.22, { n: 1 }], [6.6, 'knock', 0.18, { n: 2 }]],
  draw(g, t) {
    winBeam(g, 0.2, true); tally(g, 190, 1260, 420, { a: 0.5 });
    K.noah(g, { x: 1310, y: 576, s: 0.5, pose: 'lie', outfit: JAKOB_PR(3), eyes: t > 3.6 ? 'wide' : 'open', look: t > 3.6 ? [-1, 0.6] : [0.3, -1], blanket: '#5a5a50', blanketPattern: 'tweed', blink: blink(t, 4), t });
    // dust trickling from the loose stone at each knock
    K.looseStone(g, HOLE.x, HOLE.y, 0, { color: '#7c7874' });
    for (const k of [3.8, 6.6, 6.9]) { const d = t - k; if (d > 0 && d < 1.5) for (let i = 0; i < 6; i++) { g.fillStyle = `rgba(200,190,170,${0.8 * (1 - d / 1.5)})`; g.fillRect(HOLE.x - 60 + i * 22, HOLE.y + 50 + d * d * 60 + i * 3, 3, 3); } }
  } });

// ===================================================================== TEIL 3 · Der Alte (sad → dreamy)
// 15 · behind the wall: eleven years of tunnel, with a spoon handle
const TUNNEL = K.set((g) => {
  g.fillStyle = '#2a2420'; g.fillRect(0, 0, W(), 1080); K.stoneBlocks(g, 0, 0, W(), 1080, { color: '#4a4440', bw: 140, bh: 70, seed: 15, damp: 0.6 });
  // the bored passage: a long uneven hollow
  const P = new Path2D(); P.moveTo(-40, 520); P.bezierCurveTo(400, 420, 900, 470, 1460, 520); P.quadraticCurveTo(1560, 560, 1540, 720); P.quadraticCurveTo(1480, 860, 1300, 870); P.bezierCurveTo(900, 900, 400, 880, -40, 880); P.closePath();
  g.fillStyle = '#5a4a3a'; g.fill(P); g.save(); g.clip(P); K.paint(g, 0, 400, 1600, 500, ['#3a2e24', '#7a6248', '#4a3a2c'], 300, 4, 10, 60, 0.3); const r = rng(5); for (let i = 0; i < 90; i++) K.ell(g, r() * 1560, 820 + r() * 60, 6 + r() * 14, 4 + r() * 6, r() > 0.5 ? '#6a5844' : '#4a3c2e', 1.5); g.restore(); K.inkP(g, P, 5);
  for (let i = 0; i < 14; i++) { const r2 = rng(i + 40); g.strokeStyle = 'rgba(30,20,14,.5)'; g.lineWidth = 3; g.beginPath(); const x = 200 + i * 90; g.moveTo(x, 470 + r2() * 30); g.lineTo(x + 30, 520 + r2() * 30); g.stroke(); }
  K.earthHeap(g, 260, 880, 360, 90, { color: '#5a4836', seed: 6 });
});
scene(15, { set: TUNNEL, in: 'fade', inDur: 1.4, light: -1, music: 'dreamy',
  cam: kb({ x: 1060, y: 640, z: 1.25 }, { x: 1180, y: 660, z: 1.4 }, PLAN[14].dur),
  grade: { warm: 0.16, vignette: 0.62 },
  sfx: [[0.0, 'knock', 0.22, { n: 1 }], [0.55, 'knock', 0.2, { n: 2 }], [1.15, 'knock', 0.22, { n: 1 }], [1.6, 'scrape', 0.25, { dur: 6 }]],
  draw(g, t) {
    K.item(g, 'candle', 1020, 868, 0.9, { t }); candleGlow(g, 1020, 810, t, 1.3);
    const sc = Math.sin(t * 4.2), a = K.noah(g, { x: 1240, y: 878, s: 0.56, view: 'side', pose: 'kneel', hunch: 0.9, outfit: ANSELM, armR: { E: [110, -170 + sc * 10], H: [210 + sc * 20, -150 + sc * 16] }, holdR: { item: 'spoon', handleOnly: true, tilt: 0.9 }, armL: { E: [100, -150], H: [190, -110] }, eyes: 'tired', look: [1, 0], blink: blink(t, 6), t });
    for (let i = 0; i < 5; i++) { const ph = (t * 1.3 + i * 0.2) % 1; g.fillStyle = `rgba(170,140,100,${1 - ph})`; g.fillRect(1380 + i * 6, 700 + ph * 160, 4, 4); }
  } });

// 16 · the stone falls: first an eye, then a white beard — and a laugh
scene(16, { set: CELL_NIGHT, light: 1,
  cam: kb({ x: 640, y: 640, z: 1.45 }, { x: 600, y: 680, z: 1.62 }, PLAN[15].dur),
  grade: { tint: '#4a5aa0', tintA: 0.28, warm: 0.05, vignette: 0.55 },
  sfx: [[3.2, 'scrape', 0.2, { dur: 1.4 }], [4.8, 'thud', 0.35], [10.4, 'chuckle', 0.0]],
  draw(g, t) {
    winBeam(g, 0.18, true);
    const u = key(t, [[3.4, 0], [4.7, 0.25], [5.0, 1]]), out = t > 4.9;
    if (out) { g.save(); g.beginPath(); g.ellipse(HOLE.x, HOLE.y, 69, 51, 0, 0, 7); g.fillStyle = '#0c0908'; g.fill(); g.clip();
      K.glow(g, HOLE.x + 40, HOLE.y + 20, 160, '255,190,110', 0.5);
      const ea = dis(t, 5.3, 0.8), hy = key(t, [[5.3, HOLE.y + 40], [8.4, HOLE.y + 40], [9.4, HOLE.y - 30]]), hx = key(t, [[5.3, HOLE.x + 50], [8.4, HOLE.x + 50], [9.4, HOLE.x + 10]]);
      withA(g, ea, () => K.noah(g, { x: hx, y: headToY(hy, 0.42), s: 0.42, outfit: ANSELM, eyes: t > 10.2 ? 'happy' : 'wide', look: [-0.8, 0], bob: t > 10.2 ? Math.sin(t * 12) * 4 : 0, blink: blink(t, 3), t }));
      g.restore(); K.ell(g, HOLE.x, HOLE.y, 69, 51, null, 5); }
    const sx = HOLE.x + u * 120, sy = HOLE.y + u * 70; if (!out) K.looseStone(g, HOLE.x + Math.sin(t * 20) * (t > 3.4 && t < 4.7 ? 2 : 0), HOLE.y, 0, { color: '#7c7874' }); else K.looseStone(g, sx + 20, sy + 30, 1, { color: '#7c7874' });
    K.noah(g, { x: 300, y: 840, s: 0.6, view: 'side', pose: 'kneel', outfit: JAKOB_PR(3), eyes: t > 4.8 ? 'wide' : 'worried', look: [1, 0.5], hunch: 0.4, armR: t > 4.9 && t < 6 ? 'forward' : 'hang', blink: blink(t, 2), t });
  } });

// cross-section: Jakob's cell | thick wall with the tunnel | Anselm's cell
const XSEC = K.set((g) => {
  K.stoneBlocks(g, 0, 0, W(), 860, { color: '#7a7672', bw: 120, bh: 64, seed: 81, damp: 0.8 });
  g.fillStyle = 'rgba(40,50,90,.25)'; g.fillRect(0, 0, 900, 860); g.fillStyle = 'rgba(120,80,30,.12)'; g.fillRect(1040, 0, 880, 860);
  K.floor(g, { y0: 860, type: 'stone', color: '#5e5a56', seed: 3, base: false });
  // the dividing wall seen in section: darker, rough, with the tunnel at the bottom
  K.stoneBlocks(g, 880, 0, 1040, 860, { color: '#5a5652', bw: 80, bh: 50, seed: 7, damp: 0.3 }); g.strokeStyle = K.INK; g.lineWidth = 6; g.strokeRect(880, -10, 160, 880);
  g.fillStyle = '#120e0c'; g.beginPath(); g.moveTo(880, 860); g.lineTo(880, 760); g.quadraticCurveTo(960, 720, 1040, 760); g.lineTo(1040, 860); g.closePath(); g.fill(); K.inkStroke(g, 4);
  for (const [wx] of [[340], [1560]]) { g.save(); g.beginPath(); g.rect(wx, 140, 110, 80); g.clip(); K.sky2(g, wx, 140, 110, 80, { time: 'night', seed: wx }); g.restore(); g.strokeStyle = K.INK; g.lineWidth = 5; g.strokeRect(wx, 140, 110, 80); g.strokeStyle = '#2a2826'; g.lineWidth = 8; for (let k = 1; k < 3; k++) { g.beginPath(); g.moveTo(wx + k * 37, 136); g.lineTo(wx + k * 37, 224); g.stroke(); } }
  // straw on both floors
  const r = rng(2); for (let i = 0; i < 60; i++) { const x = r() < 0.5 ? r() * 800 : 1100 + r() * 800, y = 870 + r() * 180; g.strokeStyle = 'rgba(200,170,100,.6)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 40, y + (r() - 0.5) * 8); g.stroke(); }
});
const xsecLight = (g, t, cand = 1) => { moonBeam(g, { x: 340, y: 140, w: 110, h: 80 }, [[700, 1080], [240, 1080]], 0.16, '160,185,255'); if (cand) { K.item(g, 'candle', 1180, 900, 0.8, { t }); candleGlow(g, 1180, 850, t, 1.2, cand); } };
// 17 · "Na sowas" — a neighbour instead of freedom
scene(17, { set: XSEC, light: -1,
  cam: kb({ x: 960, y: 600, z: 1.1 }, { x: 960, y: 640, z: 1.22 }, PLAN[16].dur),
  grade: { tint: '#6a70a0', tintA: 0.12, warm: 0.12, vignette: 0.5 },
  sfx: [],
  draw(g, t) {
    xsecLight(g, t);
    K.noah(g, { x: 640, y: 920, s: 0.6, view: 'side', pose: 'kneel', outfit: JAKOB_PR(3), eyes: t < 4 ? 'wide' : 'open', look: [1, 0.2], blink: blink(t, 2), t });
    K.noah(g, { x: 1290, y: 920, s: 0.6, view: 'side', flip: true, pose: 'kneel', hunch: 0.6, outfit: ANSELM, eyes: t < 6.5 ? 'happy' : 'open', bob: t < 3 ? Math.sin(t * 11) * 4 : 0, look: [1, 0.1], armR: t > 1.5 && t < 6 ? 'shrug' : 'rest', armL: 'rest', blink: blink(t, 5), t });
  } });

// 18 · memory: Professor Weidner in Heidelberg — and the powerful men he contradicted
const HALL = K.set((g) => { K.lectureHall(g); K.lectern(g, 1460, 880, 1); });
scene(18, { set: HALL, light: 1,
  cam: kb({ x: 1000, y: 560, z: 1.08 }, { x: 1060, y: 520, z: 1.16 }, PLAN[17].dur),
  grade: { warm: 0.22, vignette: 0.5 },
  sfx: [[0.6, 'chalk', 0.2, { dur: 1.6 }], [8.6, 'door', 0.2], ...K.steps(8.8, 11, 1.1, 'step', 0.25)],
  post(g, t) { const d = dis(t, 11.6, 3); if (d > 0) { const v = g.createRadialGradient(960, 540, 200, 960, 540, 1100); v.addColorStop(0, 'rgba(10,8,8,0)'); v.addColorStop(1, `rgba(10,8,8,${0.85 * d})`); g.fillStyle = v; g.fillRect(0, 0, 1920, 1080); } },
  draw(g, t) {
    K.beam(g, [[60, 80], [230, 80], [700, 1080], [300, 1080]], { color: '255,230,180', a: 0.12 });
    const turn = dis(t, 9.6, 1);
    K.noah(g, { x: 1300, y: 900, s: 0.62, view: turn > 0.5 ? 'side' : 'front', flip: true, outfit: ANSELM_YOUNG, armR: turn > 0.5 ? 'point' : 'up', armL: turn > 0.5 ? 'hang' : 'hip', eyes: turn > 0.5 ? 'angry' : 'happy', look: turn > 0.5 ? [1, 0] : [-0.8, -0.3], blink: blink(t, 3), t });
    // students (profile, seated on a bench, facing the board)
    for (const [x, o] of [[160, WORKER_A], [400, KID('#5a6a8a', 'short')], [640, WORKER_B]]) K.noah(g, { x, y: 1080, s: 0.6, view: 'side', pose: 'sit', outfit: { ...o, hat: { type: 'none' }, beard: null }, armR: 'rest', armL: 'rest', look: [1, -0.4], t });
    K.rrect(g, 40, 940, 860, 40, 6, '#5a3c26', 4);
    // the powerful men arrive from the left (top hat, uniform)
    const mx = key(t, [[8.4, -200], [11.2, 820]], (v) => v), walking = t > 8.4 && t < 11.2;
    if (t > 8.4) { K.noah(g, { x: mx + 160, y: 900, s: 0.62, view: 'side', pose: walking ? 'walk' : 'stand', step: t * 0.55, outfit: LINDQVIST, eyes: 'angry', armL: 'swing', armR: 'swing', t });
      K.noah(g, { x: mx, y: 905, s: 0.62, view: 'side', pose: walking ? 'walk' : 'stand', step: t * 0.55 + 0.5, outfit: POLICE, eyes: 'angry', armL: 'swing', armR: 'swing', t }); }
  } });

// 19 · from then on, every night, the stone came out
scene(19, { set: XSEC, light: -1, music: 'dreamy',
  cam: kb({ x: 960, y: 640, z: 1.25 }, { x: 960, y: 700, z: 1.4 }, PLAN[18].dur),
  grade: { tint: '#6a70a0', tintA: 0.1, warm: 0.16, vignette: 0.55 },
  sfx: [[0.5, 'scrape', 0.2, { dur: 1.2 }]],
  draw(g, t) {
    xsecLight(g, t, dis(t, 1.0, 1.2));
    const u = key(t, [[0.4, 0], [1.8, 1]]); K.looseStone(g, 860 - u * 100, 812 + u * 30, 0, { color: '#6a6662', r: 44 });
    K.noah(g, { x: 660, y: 920, s: 0.62, view: 'side', pose: 'kneel', outfit: JAKOB_PR(4), eyes: t > 6.5 ? 'happy' : 'open', look: [1, 0.1], armR: t < 2 ? 'forward' : 'rest', blink: blink(t, 2), t });
    K.noah(g, { x: 1270, y: 920, s: 0.62, view: 'side', flip: true, pose: 'kneel', hunch: 0.6, outfit: ANSELM, eyes: t > 6 ? 'happy' : 'open', armR: t > 6 && t < 9 ? 'point' : 'rest', armL: 'rest', look: [1, 0], blink: blink(t, 5), t });
  } });
