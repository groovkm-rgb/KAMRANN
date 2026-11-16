// ===================================================================== TEIL 1 · Der Hafen (cozy → sad)
const HARBOR_DAY = K.set((g) => {
  K.harbor(g, { time: 'day', year: 1903 });
  // foreground quay clutter (gas lamps unlit in daylight)
  K.gasLamp(g, 380, 1000, { on: false, s: 0.95 }); K.gasLamp(g, 1330, 990, { on: false, s: 0.95 });
  K.barrel(g, 120, 1010, 1.0); K.barrel(g, 210, 1030, 1.05, { color: '#7a4a2a' }); K.crate(g, 520, 1040, 150, 110); K.crate(g, 560, 930, 110, 80, { color: '#9a6a3a' });
  K.ropeCoil(g, 980, 1050, 1.1); K.bollard(g, 760, 870, 1.1); K.bollard(g, 1180, 870, 1.1); K.timberStack(g, 1450, 1060, 360, 5);
});
const plank = (g, x, y, ang = 0) => { g.save(); g.translate(x, y); g.rotate(ang); K.rrect(g, -170, -12, 340, 24, 3, '#c8a06a', 3); g.strokeStyle = 'rgba(60,40,20,.4)'; g.lineWidth = 2; g.beginPath(); g.moveTo(-150, 0); g.lineTo(150, -2); g.stroke(); g.restore(); };
// 5 · Lübeck, spring 1903
scene(5, { set: HARBOR_DAY, in: 'black', inDur: 2.2, music: 'cozy', light: 1,
  cam: kb({ x: 720, y: 560, z: 1.22 }, { x: 1230, y: 590, z: 1.26 }, PLAN[4].dur),
  grade: { warm: 0.12, vignette: 0.3 },
  sfx: [[0, 'harbor', 0.35, { dur: 9.4 }], [0.8, 'gulls', 0.3, { dur: 4 }], [4.2, 'knock', 0.12, { n: 3 }], [6.5, 'knock', 0.1, { n: 2 }]],
  draw(g, t) {
    K.waves(g, 0, 546, W(), 254, t, { time: 'day', n: 90, speed: 0.5 });
    K.smoke(g, 1185, 530, t, { s: 0.5, a: 0.35 }); gulls(g, t, [[300, 200, 22, 1], [520, 150, 16, 0.8, 2], [1500, 230, -14, 0.9, 1]]);
    // shipyard hands at work on the hull (small, background)
    K.noah(g, { x: 1430, y: 760, s: 0.26, outfit: WORKER_A, armR: K.key((t * 1.6) % 1, [[0, 'up'], [0.5, 'forward'], [1, 'up']]), t });
    K.noah(g, { x: 1600, y: 770, s: 0.26, outfit: WORKER_B, view: 'side', flip: true, armR: 'hold', t });
    // Jakob crosses the quay with a plank under his arm
    const x = 980 + t * 52, s = 0.6, j = K.noah(g, { x, y: 1000, s, view: 'side', pose: 'walk', step: t * 0.38, outfit: JAKOB, armL: 'swing', armR: 'hold', blink: blink(t, 1), t });
    plank(g, j.hands[1][0] + 10, j.hands[1][1] - 6, -0.03); K.glove(g, j.hands[1][0], j.hands[1][1], 0, 'grip', -1);
  } });

// 6 · Jakob and Greta by the water; Konrad behind a counting-house window
const QUAY_GOLD = K.set((g) => {
  K.sky2(g, 0, 0, W(), 560, { time: 'golden', seed: 8 }); K.skyline(g, 0, 1300, 520, { color: '#a08aa0', seed: 5 });
  K.sea(g, 0, 520, 1400, 300, { time: 'golden', seed: 4 });
  K.sailship(g, 360, 690, 0.36, { sails: 'furled', time: 'golden' }); K.sailship(g, 1050, 640, 0.22, { sails: 'set', flip: true, time: 'golden' });
  K.glow(g, 220, 470, 700, '255,200,130', 0.45);
  // counting house (Kontor) on the right
  K.townhouse(g, 1300, 820, 620, 560, { color: '#c86a4a', brick: true, shutters: '#5a3a28', seed: 12 });
  K.quay(g, -20, 1320, 760, { h: 60 }); K.cobbles(g, 820, 1080, { color: '#a49686', seed: 4 }); g.fillStyle = '#8a7a6a'; g.fillRect(1300, 800, 640, 30);
  // iron railing along the quay edge
  g.strokeStyle = K.INK; g.lineWidth = 7; g.beginPath(); g.moveTo(0, 690); g.lineTo(1300, 690); g.stroke(); g.strokeStyle = '#3a3a3e'; g.lineWidth = 4; g.stroke();
  for (let x = 30; x < 1300; x += 90) { g.strokeStyle = K.INK; g.lineWidth = 6; g.beginPath(); g.moveTo(x, 690); g.lineTo(x, 770); g.stroke(); g.strokeStyle = '#3a3a3e'; g.lineWidth = 3; g.stroke(); }
  K.gasLamp(g, 1240, 900, { on: false }); K.bollard(g, 140, 860, 1.0); K.ropeCoil(g, 300, 1010, 0.9); K.barrel(g, 1760, 1060, 1.05); K.crate(g, 1530, 1060, 150, 100);
});
scene(6, { set: QUAY_GOLD, light: 1,
  cam: kb({ x: 900, y: 560, z: 1.1 }, { x: 1010, y: 520, z: 1.18 }, PLAN[5].dur),
  grade: { warm: 0.2, vignette: 0.35 },
  sfx: [[0, 'water', 0.3, { dur: 12 }], [2, 'gulls', 0.18, { dur: 3 }]],
  draw(g, t) {
    K.waves(g, 0, 524, 1300, 166, t, { time: 'golden', n: 70, speed: 0.5 });
    // Konrad appears behind the upper window (the second window from the left, upper row)
    const ka = dis(t, 7.0, 1.2); if (ka > 0) { g.save(); g.beginPath(); g.rect(1412, 352, 92, 138); g.clip(); withA(g, ka, () => K.noah(g, { x: 1458, y: 610, s: 0.42, outfit: KONRAD, look: [-1, 0.2], eyes: 'open', blink: blink(t, 6), t })); g.restore(); }
    const s = 0.74;
    const j = K.noah(g, { x: 700, y: 1000, s, outfit: JAKOB, turn: 0.45, look: [0.8, -0.1], eyes: t > 2 ? 'happy' : 'open', armR: [[60, 110], [118, 176]], blink: blink(t, 2), t });
    const gr = K.noah(g, { x: 960, y: 1000, s: s * 0.94, outfit: GRETA, turn: -0.45, look: [-0.8, -0.1], eyes: t > 2.4 ? 'happy' : 'open', blush: 0.5, armL: [[60, 110], [118, 176]], blink: blink(t, 8), t });
  } });

// 7 · the yard: Konrad's smile, Greta passing, Lindqvist makes Jakob foreman
const YARD = K.set((g) => {
  K.sky2(g, 0, 0, W(), 600, { time: 'day', seed: 21 }); K.skyline(g, 0, W(), 470, { color: '#8a96b4', seed: 9 });
  K.sea(g, 0, 470, W(), 120, { time: 'day', seed: 2 });
  K.hullFrame(g, 1180, 650, 0.78, { planked: 0.55 });
  K.shed(g, 160, 700, 420, 300, { sign: 'Werft Lindqvist' });
  K.floor(g, { y0: 660, type: 'planks', color: '#a88a62', vp: [W() / 2, 200], seed: 4, base: false });
  const r = rng(3); g.fillStyle = 'rgba(240,220,170,.6)'; for (let i = 0; i < 160; i++) { g.beginPath(); g.ellipse(r() * W(), 700 + r() * 380, 6 + r() * 10, 2, r() * 3, 0, 7); g.fill(); }
  K.timberStack(g, 1500, 860, 380, 7); K.barrel(g, 640, 760, 0.8); K.crate(g, 700, 770, 120, 80);
});
const sawhorse = (g, x, y, s = 1) => { g.save(); g.translate(x, y); g.scale(s, s); K.rrect(g, -140, -150, 280, 22, 3, '#8a6a44', 3); for (const sx of [-110, 110]) { g.strokeStyle = K.INK; g.lineWidth = 10; g.beginPath(); g.moveTo(sx - 30, 0); g.lineTo(sx, -140); g.lineTo(sx + 30, 0); g.stroke(); g.strokeStyle = '#7a5a3a'; g.lineWidth = 5; g.stroke(); } g.restore(); };
const basket = (g, x, y, s = 1) => { g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = K.INK; g.lineWidth = 6; g.beginPath(); g.arc(0, 0, 44, Math.PI, 0); g.stroke(); g.strokeStyle = '#a8804a'; g.lineWidth = 3; g.stroke(); const P = new Path2D(); P.moveTo(-56, 0); P.lineTo(56, 0); P.lineTo(44, 54); P.lineTo(-44, 54); P.closePath(); K.shape(g, P, K.pattern(g, 'check', '#b88a50', '#8a6030'), [-56, 0, 56, 54], { ink: 3 }); K.ell(g, -10, -2, 40, 9, '#f0e8d8', 2); g.restore(); };
scene(7, { set: YARD, light: 1,
  cam: kb({ x: 960, y: 560, z: 1.06 }, { x: 1010, y: 580, z: 1.13 }, PLAN[6].dur),
  grade: { warm: 0.14, vignette: 0.32 },
  sfx: [[0.4, 'knock', 0.12, { n: 3 }], [3.5, 'saw', 0.12, { dur: 2 }], [6.8, 'clap', 0.15]],
  draw(g, t) {
    // background carpenters
    K.noah(g, { x: 900, y: 690, s: 0.32, outfit: WORKER_B, view: 'side', armR: K.key((t * 1.5) % 1, [[0, 'up'], [0.5, 'forward'], [1, 'up']]), t });
    sawhorse(g, 1330, 860, 0.8); K.noah(g, { x: 1210, y: 870, s: 0.4, outfit: WORKER_A, view: 'side', armR: 'type', armL: 'forward', t });
    // Greta crosses with a lunch basket
    const gx = 520 + t * 40; const gr = K.noah(g, { x: gx, y: 900, s: 0.52, view: 'side', pose: 'walk', step: t * 0.4, outfit: GRETA, armL: 'swing', armR: 'hold', t });
    basket(g, gr.hands[1][0] + 6, gr.hands[1][1] + 10, 0.6); K.glove(g, gr.hands[1][0], gr.hands[1][1], 0, 'grip', -1);
    // Lindqvist and Jakob: the handshake (from 6.4 s)
    const hs = dis(t, 6.2, 0.8), shake = Math.sin(t * 9) * 8 * hs * (t < 8.4 ? 1 : 0);
    K.noah(g, { x: 1640, y: 960, s: 0.6, outfit: LINDQVIST, view: 'side', flip: true, armR: hs > 0.5 ? { E: [60, -250], H: [120, -210 + shake] } : 'hang', blink: blink(t, 9), t });
    K.noah(g, { x: 1430, y: 965, s: 0.6, outfit: JAKOB, view: 'side', armR: hs > 0.5 ? { E: [60, -250], H: [124, -212 + shake] } : 'hang', eyes: hs > 0.5 ? 'happy' : 'open', look: [1, 0], blink: blink(t, 3), t });
    // Konrad in the foreground, smiling eyes that follow Greta
    const lx = clamp((gx - 300) / 900, -0.2, 1);
    K.noah(g, { x: 330, y: 1150, s: 0.86, outfit: KONRAD, turn: 0.3, look: [lx, -0.15], eyes: t < 6 ? 'happy' : 'open', armL: 'hip', armR: 'hold', holdR: { item: 'book', color: '#3a3a3a' }, blink: blink(t, 4), t });
  } });

// 8 · that evening: the tavern … and three days later the warehouse burns across the water
const HARBOR_NIGHT = K.set((g) => {
  K.harbor(g, { time: 'night', year: 1903 });
  K.gasLamp(g, 980, 1000, { on: true }); K.gasLamp(g, 1700, 1010, { on: true });
  K.barrel(g, 1240, 1030, 1.0, { color: '#5a3a2a' }); K.ropeCoil(g, 1420, 1050, 1.0); K.bollard(g, 1560, 880, 1.0);
});
scene(8, { set: HARBOR_NIGHT, light: -1, music: 'cozy',
  cam: kb({ x: 560, y: 600, z: 1.38 }, { x: 1180, y: 520, z: 1.3 }, PLAN[7].dur),
  grade: { tint: '#5a66a8', tintA: 0.2, warm: 0.1, vignette: 0.45 },
  sfx: [[0, 'crowd', 0.12, { dur: 4 }], [0.5, 'clink', 0.15], [1.6, 'clink', 0.1], [3.8, 'fire', 0.28, { dur: 8.5 }], [0, 'water', 0.18, { dur: 12.6 }]],
  draw(g, t) {
    K.waves(g, 0, 546, W(), 254, t, { time: 'night', n: 80, speed: 0.4 });
    // the tavern on the near quay (left), windows full of warm light and the celebration inside
    const [wx, wy, ww, wh] = K.tavern(g, 140, 1000, 600, 640, { seed: 5 });
    g.save(); g.beginPath(); g.rect(wx, wy, ww, wh); g.clip(); const gr = g.createLinearGradient(0, wy, 0, wy + wh); gr.addColorStop(0, '#ffcf80'); gr.addColorStop(1, '#c87a3a'); g.fillStyle = gr; g.fillRect(wx, wy, ww, wh);
    const lift = (ph) => Math.max(0, Math.sin(t * 2.2 + ph)) ;
    K.noah(g, { x: wx + 120, y: wy + wh + 110, s: 0.36, outfit: WORKER_A, armR: K.mixv(K.ARMS.hold, K.ARMS.up, lift(1)), holdR: { item: 'mug', color: '#c8b890' }, eyes: 'happy', t });
    K.noah(g, { x: wx + ww / 2, y: wy + wh + 120, s: 0.4, outfit: JAKOB, armR: K.mixv(K.ARMS.hold, K.ARMS.up, lift(0)), holdR: { item: 'mug', color: '#c8b890' }, eyes: 'happy', t });
    K.noah(g, { x: wx + ww - 110, y: wy + wh + 110, s: 0.36, outfit: WORKER_B, armL: K.mixv(K.ARMS.hold, K.ARMS.up, lift(2)), holdL: { item: 'mug', color: '#c8b890' }, eyes: 'happy', t });
    g.restore(); g.strokeStyle = '#3a2a1a'; g.lineWidth = 8; for (let k = 1; k < 4; k++) { g.beginPath(); g.moveTo(wx + k * ww / 4, wy); g.lineTo(wx + k * ww / 4, wy + wh); g.stroke(); }
    K.glow(g, wx + ww / 2, wy + wh / 2, 520, '255,190,110', 0.4);
    // the warehouse fire on the far bank (grows from 3.6 s)
    const f = dis(t, 3.4, 2.5), fx = 1290, fy = 470;
    if (f > 0) { K.glow(g, fx, fy, 700 * f, '255,120,40', 0.45 * f * K.flicker(t, 1)); K.glow(g, fx, fy + 20, 260 * f, '255,200,90', 0.5 * f);
      for (let i = 0; i < 16; i++) { const ph = (t * 0.9 + i * 0.37) % 1, x = fx - 90 + (i * 53) % 180 + Math.sin(t * 3 + i) * 10, h = (60 + (i * 37) % 70) * f * (1 - ph * 0.5);
        g.fillStyle = `rgba(255,${150 + (i * 13) % 80},60,${0.75 * (1 - ph)})`; g.beginPath(); g.moveTo(x - 20, fy + 30); g.quadraticCurveTo(x - 10, fy - h * 0.5, x + Math.sin(t * 5 + i) * 8, fy - h - ph * 40); g.quadraticCurveTo(x + 10, fy - h * 0.5, x + 20, fy + 30); g.fill(); }
      K.smoke(g, fx, fy - 70, t, { s: 1.1 * f, a: 0.5 * f, color: '60,50,56', wind: 0.6, n: 16 });
      // its reflection, broken by the water
      g.save(); g.globalCompositeOperation = 'screen'; for (let k = 0; k < 18; k++) { const y = 560 + k * 13, w = (60 + k * 6) * f * (0.6 + 0.4 * Math.sin(t * 2 + k)); g.fillStyle = `rgba(255,140,60,${0.3 * f * (1 - k / 18)})`; g.fillRect(fx - w / 2 + Math.sin(t * 1.5 + k) * 10, y, w, 5); } g.restore();
      for (let i = 0; i < 10; i++) { const ph = (t * 0.5 + i * 0.29) % 1; g.fillStyle = `rgba(255,220,120,${(1 - ph) * f})`; g.fillRect(fx - 60 + (i * 31) % 120 + Math.sin(i + t) * 30, fy - 60 - ph * 220, 3, 3); } }
  } });

// 9 · in Jakob's tool chest: letters to smugglers, with his signature, and money
const WORKSHOP = K.set((g) => {
  K.wall(g, { y1: 720, color: '#8a6a4a', seed: 31 }); g.save(); g.beginPath(); g.rect(0, 0, W(), 720); g.clip(); for (let x = 0; x < W(); x += 64) { g.fillStyle = (x / 64) % 2 ? '#7a5a3c' : '#82603e'; g.fillRect(x, 0, 64, 720); g.strokeStyle = 'rgba(40,24,12,.5)'; g.lineWidth = 3; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 720); g.stroke(); } K.paint(g, 0, 0, W(), 720, ['#4a3020', '#a07a50'], 200, 4, 10, 50, 0.12); g.restore();
  K.window(g, 1500, 120, 300, 280, { outside: { season: 'spring', time: 'overcast', village: false }, cols: 3, rows: 3 });
  // tools on the wall: saws, a square, planes on a shelf
  const saw = (x, y, s) => { g.save(); g.translate(x, y); g.scale(s, s); K.poly(g, [[0, 0], [220, 30], [220, 70], [0, 60]]); K.fillInk(g, '#c8ccd4', 3); g.strokeStyle = K.INK; g.lineWidth = 1.5; g.beginPath(); for (let k = 0; k < 22; k++) { g.lineTo(k * 10, 60 + (k % 2) * 8); } g.stroke(); K.rrect(g, -60, -6, 70, 70, 14, '#8a5a34', 3); g.restore(); };
  saw(200, 200, 1); saw(260, 330, 0.85); g.strokeStyle = K.INK; g.lineWidth = 12; g.beginPath(); g.moveTo(640, 140); g.lineTo(640, 420); g.lineTo(780, 420); g.stroke(); g.strokeStyle = '#c8b070'; g.lineWidth = 7; g.stroke();
  K.rrect(g, 860, 300, 520, 20, 3, '#5a3a24', 3); for (let i = 0; i < 4; i++) { K.rrect(g, 890 + i * 120, 250, 90, 50, 8, '#a87a4a', 3); K.rrect(g, 920 + i * 120, 232, 20, 24, 4, '#5a3a24', 2); }
  K.floor(g, { y0: 720, type: 'planks', color: '#8a6440', seed: 7 });
});
const bench = (g) => { // workbench in front, with the opened chest, letters, money, ledger
  K.rrect(g, 120, 760, 1680, 50, 6, '#a07a4e', 5); g.fillStyle = '#7a5a3a'; g.fillRect(140, 810, 1640, 300); g.strokeStyle = K.INK; g.lineWidth = 5; g.strokeRect(140, 810, 1640, 300);
  const r = rng(4); g.strokeStyle = 'rgba(240,210,150,.8)'; g.lineWidth = 3; for (let i = 0; i < 30; i++) { const x = 160 + r() * 1600, y = 768 + r() * 16; g.beginPath(); g.arc(x, y, 8 + r() * 10, 0, 4); g.stroke(); }
};
scene(9, { set: WORKSHOP, light: 1, music: 'sad',
  cam: kb({ x: 960, y: 560, z: 1.04 }, { x: 900, y: 640, z: 1.22 }, PLAN[8].dur),
  grade: { tint: '#7a8098', tintA: 0.14, warm: 0.06, vignette: 0.45 },
  sfx: [[0.3, 'rustle', 0.25, { dur: 1 }], [2.6, 'page', 0.25], [5.5, 'page', 0.2]],
  draw(g, t) {
    K.beam(g, [[1500, 120], [1800, 120], [1300, 1080], [700, 1080]], { color: '220,230,240', a: 0.1 });
    K.noah(g, { x: 1500, y: 870, s: 0.66, outfit: POLICE, armR: 'hold', holdR: { item: 'letter', tilt: 0.1 }, look: [-0.6, 0], blink: blink(t, 3), t });
    K.noah(g, { x: 500, y: 870, s: 0.62, outfit: POLICE, armL: 'hip', look: [0.7, 0], blink: blink(t, 6), t });
    K.noah(g, { x: 1150, y: 890, s: 0.72, outfit: JAKOB, eyes: t < 4 ? 'wide' : 'worried', look: t < 6 ? [0.5, 0.6] : [0.2, 0.9], headTilt: t > 6 ? 0.08 : 0, blink: blink(t, 2), t });
    bench(g);
    // the chest (open), letters fanned out, banknotes and coins, the ledger
    K.rrect(g, 620, 640, 300, 130, 6, '#6a4a2e', 5); K.poly(g, [[620, 640], [920, 640], [940, 520], [600, 520]]); K.fillInk(g, '#5a3c24', 4);
    for (let i = 0; i < 5; i++) K.item(g, 'letter', 700 + i * 50, 690 - i * 4, 0.9, { tilt: -0.3 + i * 0.15 });
    for (let i = 0; i < 4; i++) { g.save(); g.translate(1010 + i * 26, 752 - i * 5); g.rotate(-0.1 + i * 0.07); K.rrect(g, -60, -30, 120, 60, 3, '#8aa07a', 2.5); K.text(g, '100', 0, 0, { size: 20, font: 'serif', color: '#2a3a2a' }); g.restore(); }
    K.coins(g, 1220, 770, 7, { s: 1 });
    // the forged letter, larger, lying on top: "his" signature
    g.save(); g.translate(820, 730); g.rotate(0.05); K.rrect(g, -130, -60, 260, 120, 4, '#f0e6cc', 3);
    K.text(g, 'An Kapt. Sörensen –\nWare kommt Freitag\nnachts an Kai 4.', -10, -14, { size: 17, font: 'hand', weight: 'normal', color: '#1e2048', lineH: 1.25 }); K.text(g, 'J. Brenner', 60, 38, { size: 22, font: 'hand', weight: 'normal', color: '#1e2048' }); g.restore();
    // the wage ledger on the right (Konrad's daily book)
    const la = dis(t, 5.6, 1.4); withA(g, 0.35 + 0.65 * la, () => { g.save(); g.translate(1600, 745); g.rotate(-0.06); K.rrect(g, -170, -70, 340, 130, 6, '#3a2a22', 4); K.rrect(g, -160, -66, 156, 118, 2, '#f2ead6', 2.5); K.rrect(g, 4, -66, 156, 118, 2, '#f2ead6', 2.5);
      K.text(g, 'Lohnbuch', -82, -48, { size: 18, font: 'serif', color: '#3a2a1a' }); g.strokeStyle = 'rgba(40,40,90,.55)'; g.lineWidth = 1.5; for (let k = 0; k < 6; k++) { g.beginPath(); g.moveTo(-150, -30 + k * 13); g.lineTo(-14, -30 + k * 13); g.moveTo(14, -54 + k * 16); g.lineTo(150, -54 + k * 16); g.stroke(); }
      K.text(g, 'J. Brenner', 82, 36, { size: 16, font: 'hand', weight: 'normal', color: '#1e2048' }); g.restore(); });
  } });

// 10 · the trial: Konrad in the gallery, twenty years, Fortress Grauwacht
const COURT = K.set((g) => { K.courtroom(g, { bench: false, seed: 81 }); });
scene(10, { set: COURT, light: 1,
  cam: kb({ x: 960, y: 560, z: 1.0 }, { x: 1080, y: 470, z: 1.32 }, PLAN[9].dur),
  grade: { warm: 0.06, vignette: 0.42, tint: '#8a90a8', tintA: 0.1 },
  sfx: [[2.0, 'gavel', 0.3], [0, 'room', 0.2, { dur: 9 }]],
  draw(g, t) {
    for (const wx of [200, 620, 1300, 1720]) K.beam(g, [[wx - 85, 140], [wx + 85, 140], [wx + 260, 760], [wx - 40, 760]], { color: '255,240,210', a: 0.08 });
    K.noah(g, { x: 960, y: 520, s: 0.5, outfit: JUDGE, armR: t > 1.5 && t < 3 ? 'up' : 'hold', holdR: t > 1.5 && t < 3 ? null : { item: 'letter' }, look: [-0.5, 0.2], blink: blink(t, 4), t });
    K.judgeBench(g, { verdict: 'Urteil:\n20 Jahre' });
    // the dock on the left: Jakob between two policemen
    K.noah(g, { x: 260, y: 990, s: 0.6, outfit: POLICE, look: [1, 0], t });
    K.noah(g, { x: 440, y: 1000, s: 0.62, outfit: JAKOB, eyes: t < 4 ? 'worried' : 'sad', headTilt: t > 4 ? 0.12 : 0, look: [0.6, -0.3], blink: blink(t, 2), t });
    K.railing(g, 120, 640, 1010, { h: 200 });
    // Konrad, seated in the gallery on the right, half-lidded satisfied eyes
    K.noah(g, { x: 1540, y: 1110, s: 0.66, pose: 'sit', outfit: KONRAD, eyes: 'tired', look: [-0.9, -0.2], armL: 'rest', armR: 'rest', blink: blink(t, 7), t });
    K.pew(g, 1300, 1920, 1110);
  } });
