// ===================================================================== TEIL 8 · Der Schatz (mystery → emotional)
// 47 · Möwenholm: bare, windy, the broken lighthouse on the hill
const ISLE_DAY = K.set((g) => {
  K.sky2(g, 0, 0, W(), 640, { time: 'golden', seed: 23 }); K.sea(g, 0, 600, W(), 480, { time: 'golden', seed: 4 });
  K.cutter(g, 260, 700, 0.22, { sail: false });
  K.hill(g, 300, 2200, 900, 520, { color: '#8a9a5a', seed: 7 }); K.lighthouseRuin(g, 1300, 420, 0.5, { time: 'golden' });
  g.strokeStyle = 'rgba(220,200,150,.7)'; g.lineWidth = 16; g.lineCap = 'round'; g.beginPath(); g.moveTo(700, 1080); g.bezierCurveTo(800, 900, 1100, 700, 1260, 430); g.stroke();
  K.rock(g, 200, 1100, 500, 180, { color: '#7a7a74', seed: 2, guano: 0.3 });
});
scene(47, { set: ISLE_DAY, in: 'black', inDur: 1.6, light: 1, music: 'mystery',
  cam: kb({ x: 960, y: 560, z: 1.04 }, { x: 1120, y: 500, z: 1.14 }, PLAN[46].dur),
  grade: { warm: 0.2, vignette: 0.42 },
  sfx: [[0, 'wind', 0.4, { dur: 12.5 }], [1, 'gulls', 0.25, { dur: 4 }], [6, 'gulls', 0.15, { dur: 3 }]],
  draw(g, t) {
    K.waves(g, 0, 604, 900, 300, t, { time: 'golden', n: 60 });
    gulls(g, t, [[500, 220, 18, 1.1], [900, 160, 12, 0.9, 2], [1600, 260, -16, 1, 1], [1300, 120, -10, 0.8, 4]]);
    const x = 840 + t * 26, y = 980 - t * 30; K.noah(g, { x, y, s: 0.34, view: 'side', pose: 'walk', step: t * 0.5, outfit: JAKOB_FISH2, armL: 'swing', armR: 'swing', t });
    K.grassFront(g, 0, 1920, 1090, t, { n: 220, h: 90, wind: 1.4 });
  } });

// night on the island: the lighthouse door, the Pole Star, forty steps
const ISLE_NIGHT = K.set((g) => {
  K.sky2(g, 0, 0, W(), 760, { time: 'night', moon: [300, 150, 38], stars: 600, seed: 51 });
  K.hill(g, -200, 2200, 1080, 380, { color: '#7a8a5a', seed: 9, time: 'night' }); K.lighthouseRuin(g, 420, 830, 0.95, { time: 'night' });
});
const starGuide = (g, t, a = 1) => { const dip = K.bigDipper(1180, 120, 0.85), pol = K.polaris(dip, 3.6); for (const p of dip) K.star(g, p[0], p[1], 7, 0, `rgba(255,251,232,${a})`); K.glow(g, pol[0], pol[1], 70, '255,250,220', 0.7 * a); K.star(g, pol[0], pol[1], 13, 0, '#fff8d8'); return pol; };
// 48 · waiting for dark; at the door; forty steps toward the Pole Star
scene(48, { set: ISLE_NIGHT, light: -1,
  cam: (t) => { const u = sm(clamp((t - 4) / 7)); return { x: lerp(620, 1100, u), y: lerp(560, 620, u), z: 1.2 }; },
  grade: { tint: '#4a58a0', tintA: 0.24, vignette: 0.48 },
  sfx: [[0, 'wind', 0.3, { dur: 11.2 }], ...K.steps(4.4, 11, 0.5, 'step-grass', 0.35)],
  draw(g, t) {
    starGuide(g, t);
    const walk = t > 4.2, x = walk ? 520 + (t - 4.2) * 64 : 520;
    K.noah(g, { x, y: 900, s: 0.52, view: walk ? 'side' : 'front', pose: walk ? 'walk' : 'stand', step: (t - 4.2) * 0.5, outfit: JAKOB_FISH2, armL: walk ? 'swing' : 'hang', armR: walk ? 'swing' : 'hang', look: walk ? [1, -0.3] : [0.7, -1], blink: blink(t, 2), t });
    K.grassFront(g, 0, 1920, 1090, t, { n: 200, h: 80, color: '#4a5a3a', wind: 1.2 });
  } });

// 49 · there it was: a rock half hidden in the grass, and a weathered cross
const ROCK_CLOSE = K.set((g) => { K.sky2(g, 0, 0, W(), 600, { time: 'night', stars: 400, seed: 61 }); K.hill(g, -300, 2300, 1100, 560, { color: '#6a7a4e', seed: 12, time: 'night' }); K.crossRock(g, 980, 860, 1.5, { time: 'night' }); });
scene(49, { set: ROCK_CLOSE, light: -1,
  cam: kb({ x: 960, y: 560, z: 1.05 }, { x: 980, y: 640, z: 1.25 }, PLAN[48].dur),
  grade: { tint: '#4a58a0', tintA: 0.22, vignette: 0.5 },
  sfx: [[0, 'wind', 0.25, { dur: 8.5 }], [3.6, 'rustle', 0.25, { dur: 1.4 }]],
  draw(g, t) {
    K.beam(g, [[200, -50], [420, -50], [1200, 1080], [700, 1080]], { color: '180,200,255', a: 0.1 });
    K.noah(g, { x: 540, y: 980, s: 0.62, view: 'side', pose: 'kneel', hunch: 0.4, outfit: JAKOB_FISH2, armR: t > 3.4 && t < 6 ? { E: [120, -180], H: [240 + Math.sin(t * 6) * 20, -120] } : 'rest', eyes: t > 2 ? 'wide' : 'open', look: [1, 0.4], blink: blink(t, 2), t });
    K.grassFront(g, 600, 1400, 900, t, { n: 70 * (1 - dis(t, 3.6, 2) * 0.6), h: 110, color: '#4a5a3a', seed: 8 });
    K.grassFront(g, 0, 1920, 1090, t, { n: 160, h: 80, color: '#3e4e30' });
  } });

// 50 · digging: bare hands, driftwood, fingernails — then wood: an iron-bound chest sealed with tar
const DIG = K.set((g) => { K.sky2(g, 0, 0, W(), 560, { time: 'night', stars: 300, seed: 71 }); K.hill(g, -300, 2300, 1100, 600, { color: '#6a7a4e', seed: 14, time: 'night' }); K.crossRock(g, 1500, 760, 0.9, { time: 'night' }); });
scene(50, { set: DIG, light: -1,
  cam: kb({ x: 960, y: 620, z: 1.15 }, { x: 960, y: 680, z: 1.28 }, PLAN[49].dur),
  grade: { tint: '#4a58a0', tintA: 0.22, vignette: 0.52 },
  sfx: [[0.3, 'dig', 0.3, { dur: 6.5 }], [6.9, 'thud', 0.25], [7.4, 'scrape', 0.2, { dur: 3 }]],
  draw(g, t) {
    const d = clamp(t / 7); K.earthHeap(g, 640, 940, 300 + d * 200, 40 + d * 90, { color: '#3e3226' });
    g.fillStyle = '#1a140e'; g.beginPath(); g.ellipse(1000, 920, 260, 60 + d * 30, 0, 0, 7); g.fill(); K.inkStroke(g, 4);
    if (t > 6.6) { g.save(); g.beginPath(); g.ellipse(1000, 920, 260, 90, 0, 0, 7); g.clip(); K.chest(g, 1000, 1010, 0.9, { dirt: 1 - clamp((t - 6.6) / 4) }); g.restore(); }
    const dig = Math.sin(t * 5), hold = t < 2.4 ? null : t < 4.6 ? { item: 'driftwood', tilt: 0.9 } : null;
    K.noah(g, { x: 760, y: 990, s: 0.62, view: 'side', pose: 'kneel', hunch: 0.9, outfit: JAKOB_FISH2, armR: { E: [120, -150], H: [240 + dig * 30, -40 + Math.abs(dig) * 40] }, holdR: hold, armL: { E: [100, -150], H: [200 - dig * 20, -30] }, eyes: t > 6.8 ? 'wide' : 'tired', look: [1, 0.8], t });
    for (let i = 0; i < 8; i++) { const ph = (t * 1.2 + i * 0.13) % 1; g.fillStyle = `rgba(90,70,50,${1 - ph})`; g.beginPath(); g.arc(900 - ph * 220, 900 - Math.sin(ph * Math.PI) * 120, 5, 0, 7); g.fill(); }
  } });

// 51 · the lid opens: moonlight; gold coins, hundreds; rubies, emeralds, pearls — and a letter on top
scene(51, { set: DIG, light: -1,
  cam: kb({ x: 1000, y: 700, z: 1.3 }, { x: 1000, y: 760, z: 1.5 }, PLAN[50].dur),
  grade: { tint: '#4a58a0', tintA: 0.16, warm: 0.08, vignette: 0.55 },
  sfx: [[0.6, 'creak', 0.3, { dur: 2 }], [2.4, 'sparkle', 0.15], [5, 'coins', 0.2], [9.8, 'rustle', 0.2, { dur: 1 }]],
  draw(g, t) {
    K.earthHeap(g, 640, 940, 500, 130, { color: '#3e3226' });
    g.fillStyle = '#1a140e'; g.beginPath(); g.ellipse(1000, 920, 260, 90, 0, 0, 7); g.fill(); K.inkStroke(g, 4);
    K.beam(g, [[200, -50], [460, -50], [1200, 1000], [800, 1000]], { color: '190,210,255', a: 0.14 });
    const open = clamp((t - 0.6) / 2.4);
    g.save(); g.beginPath(); g.rect(600, 500, 800, 500); g.clip(); K.chest(g, 1000, 1000, 0.9, { open, glow: open * 0.8, t }); if (t < 10) K.waxBundle(g, 1010, 828 - open * 6, 0.45, { open: 0 }); g.restore();
    const take = t > 10;
    const j = K.noah(g, { x: 720, y: 1000, s: 0.64, view: 'side', pose: 'kneel', outfit: JAKOB_FISH2, eyes: open > 0.5 ? 'wide' : 'open', look: [1, 0.6], armR: take ? 'hold' : 'rest', blink: blink(t, 2), t });
    if (take) K.waxBundle(g, j.hands[1][0] + 10, j.hands[1][1] - 20, 0.45, { open: 0 });
  } });

// 52 · "For the one who finishes my road. Make something good of it. Your Anselm." — he sat in the earth and wept
scene(52, { set: DIG, light: -1, music: 'sad',
  cam: (t) => { const u = sm(clamp((t - 6) / 2.5)); return { x: lerp(1000, 900, u), y: lerp(560, 640, u), z: lerp(1.9, 1.2, u) }; },
  grade: { tint: '#4a58a0', tintA: 0.12, warm: 0.12, vignette: 0.55 },
  sfx: [[0.4, 'page', 0.25], [6.2, 'wind', 0.2, { dur: 6 }]],
  draw(g, t) {
    K.earthHeap(g, 640, 940, 500, 130, { color: '#3e3226' }); g.fillStyle = '#1a140e'; g.beginPath(); g.ellipse(1000, 920, 260, 90, 0, 0, 7); g.fill();
    g.save(); g.beginPath(); g.rect(600, 500, 800, 500); g.clip(); K.chest(g, 1000, 1000, 0.9, { open: 1, glow: 0.7, t }); g.restore();
    const wide = dis(t, 6, 1.6);
    withA(g, 1 - wide * 0.85, () => { K.glow(g, 1000, 560, 500, '255,235,190', 0.2); K.waxBundle(g, 1000, 560, 0.62, { open: clamp((t - 0.3) / 1.2), text: 'Für den, der meinen Weg\nzu Ende geht.\nMach etwas Gutes daraus.\nDein Anselm.' }); });
    withA(g, wide, () => { const j = K.noah(g, { x: 720, y: 1000, s: 0.64, pose: 'kneel', outfit: JAKOB_FISH2, eyes: 'sad', headTilt: 0.18, armR: 'face', armL: 'hold', t }); K.sweat(g, j.head[0] - 30, j.head[1] + 40, 0.7, t); K.sweat(g, j.head[0] + 30, j.head[1] + 40, 0.7, t + 0.4); });
  } });

// ===================================================================== TEIL 9 · Die Wahrheit (light tension)
const HARBOR_1912 = K.set((g) => {
  K.harbor(g, { time: 'day', year: 1912, sign: 'Werft Lindqvist', seed: 44 });
  K.gasLamp(g, 300, 1000, { on: false }); K.gasLamp(g, 1500, 1000, { on: false }); K.barrel(g, 1700, 1040, 1); K.crate(g, 120, 1050, 160, 100); K.bollard(g, 900, 870, 1.1);
});
const handcart = (g, x, y, s = 1) => { g.save(); g.translate(x, y); g.scale(s, s); K.rrect(g, -140, -150, 280, 70, 4, '#8a6a44', 4); g.strokeStyle = K.INK; g.lineWidth = 8; g.beginPath(); g.moveTo(140, -120); g.lineTo(260, -60); g.stroke(); K.ell(g, -40, -60, 60, 60, '#6a4a2e', 5); K.ell(g, -40, -60, 10, 10, '#3a2a1e', 3); K.crate(g, -120, -150, 110, 70); K.barrel(g, 60, -150, 0.6); g.restore(); };
// 53 · half a year later a gentleman came to Lübeck: beard, hat, a cane with a silver knob
scene(53, { set: HARBOR_1912, in: 'black', inDur: 1.6, light: 1, music: 'tense',
  cam: kb({ x: 800, y: 600, z: 1.2 }, { x: 1080, y: 600, z: 1.24 }, PLAN[52].dur),
  grade: { warm: 0.12, vignette: 0.32 },
  sfx: [[0, 'harbor', 0.3, { dur: 8.8 }], ...K.steps(0.2, 8.6, 0.45, 'step-street', 0.3), [1, 'gulls', 0.15, { dur: 3 }]],
  draw(g, t) {
    K.waves(g, 0, 546, W(), 254, t, { time: 'day', n: 80, speed: 0.5 }); K.smoke(g, 1240, 470, t, { s: 0.6, a: 0.3 });
    handcart(g, 1420, 1010, 0.8); K.noah(g, { x: 1660, y: 1010, s: 0.5, view: 'side', flip: true, outfit: WORKER_B, armR: 'forward', t });
    const x = 620 + t * 60, j = K.noah(g, { x, y: 1020, s: 0.62, view: 'side', pose: 'walk', step: t * 0.42, outfit: JAKOB_GENT, armL: 'swing', armR: 'hold', holdR: { item: 'cane', len: 230, tilt: -0.25 + Math.sin(t * 0.42 * Math.PI * 2) * 0.12 }, blink: blink(t, 2), t });
    gulls(g, t, [[300, 220, 18, 1], [1500, 180, -12, 0.9, 2]]);
  } });

// 54 · a house by the water, the best lawyer in town. "I didn't want revenge. I wanted the truth."
const PARLOR = K.set((g) => {
  K.wall(g, { y1: 760, color: '#d8c8a4', seed: 9, wainscot: { y: 560, color: '#5a4a6a' } });
  K.window(g, 1120, 110, 560, 420, { outside: (g2, x, y, w, h) => { K.sky2(g2, x, y, w, h, { time: 'day', seed: 3 }); K.sea(g2, x, y + h * 0.55, w, h * 0.45, { time: 'day' }); K.sailship(g2, x + w * 0.4, y + h * 0.82, 0.16, { sails: 'set' }); }, cols: 3, rows: 2, curtains: '#7a2a34' });
  K.F.frame(g, 380, 220, 220, 160, {}); K.floor(g, { y0: 760, type: 'planks', color: '#7a5032', seed: 3 }); K.rug(g, [[300, 820], [1500, 820], [1700, 1060], [100, 1060]], { color: '#7a2a34', color2: '#c8a04a' });
});
scene(54, { set: PARLOR, light: -1,
  cam: kb({ x: 960, y: 540, z: 1.06 }, { x: 1040, y: 520, z: 1.14 }, PLAN[53].dur),
  grade: { warm: 0.14, vignette: 0.38 },
  sfx: [[0, 'clock', 0.12, { dur: 8.5 }], [1.2, 'writing', 0.15, { dur: 2 }]],
  draw(g, t) {
    K.beam(g, [[1120, 110], [1680, 110], [1500, 1080], [700, 1080]], { color: '255,245,220', a: 0.12 });
    K.noah(g, { x: 560, y: 990, s: 0.64, pose: 'sit', outfit: LAWYER, armL: 'type', armR: 'type', look: [0.6, 0.4], blink: blink(t, 4), t });
    K.F.desk(g, 320, 820, 1000, { h: 200 }); K.item(g, 'book', 520, 770, 0.8, {}); K.inkwell(g, 760, 790, 0.7);
    const turn = dis(t, 4.6, 1);
    K.noah(g, { x: 1330, y: 1000, s: 0.7, view: turn > 0.5 ? 'front' : 'side', outfit: { ...JAKOB_GENT, hat: { type: 'none' } }, armR: 'hold', holdR: { item: 'cane', len: 250 }, armL: 'hang', eyes: turn > 0.5 ? 'open' : 'tired', look: turn > 0.5 ? [-0.6, 0] : [1, -0.3], blink: blink(t, 2), t });
  } });

// 55 · the old court file, the forged letters — and beside them, Konrad Haller's letters to suppliers
const DESKTOP = K.set((g) => { g.fillStyle = '#5a3a24'; g.fillRect(0, 0, W(), 1080); K.paint(g, 0, 0, W(), 1080, ['#4a2a18', '#7a5434', '#3a2214'], 700, 6, 10, 90, 0.16); for (let i = 0; i < 30; i++) { g.strokeStyle = 'rgba(30,16,8,.25)'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, i * 38); g.bezierCurveTo(600, i * 38 + 8, 1300, i * 38 - 8, 1920, i * 38 + 4); g.stroke(); } });
const letterBig = (g, x, y, rot, txt, sig, tremble) => { g.save(); g.translate(x, y); g.rotate(rot); K.rrect(g, -200, -260, 400, 520, 4, '#f0e4c4', 4); K.text(g, txt, 0, -110, { size: 26, font: 'hand', weight: 'normal', color: '#1e2048', lineH: 1.4, maxW: 360 }); signature(g, -60, 140, 0.8, tremble, 1); g.restore(); };
scene(55, { set: DESKTOP, light: 1,
  cam: kb({ x: 960, y: 540, z: 1.0 }, { x: 980, y: 520, z: 1.1 }, PLAN[54].dur),
  grade: { warm: 0.14, vignette: 0.5 },
  sfx: [[0.6, 'page', 0.25], [3.6, 'page', 0.25], [6.2, 'slide', 0.0]],
  draw(g, t) {
    K.akte(g, 330, 300, 1.0, { rot: -0.1, label: 'Brenner, Jakob\n1903' });
    letterBig(g, 760, 600, -0.05, 'An Kapt. Sörensen –\nWare kommt Freitag\nnachts an Kai 4.', 0, 1);
    const sl = key(t, [[3.2, 1900], [5.2, 1250]]); letterBig(g, sl, 600, 0.04, 'An Firma Petersen –\nLieferung bitte bis\nMontag an das Kontor.', 0, 1);
    K.inkwell(g, 1700, 300, 1.0);
  } });

// 56 · in court: the same tremble in the arc of the "J", the same pressure on the stroke of the "t"
const COURT2 = K.set((g) => { K.courtroom(g, { bench: false, seed: 82 }); });
const easel = (g, x, y, t) => { g.strokeStyle = K.INK; g.lineWidth = 10; g.beginPath(); g.moveTo(x - 120, y); g.lineTo(x, y - 520); g.lineTo(x + 120, y); g.stroke(); K.rrect(g, x - 220, y - 520, 440, 320, 6, '#f0e4c4', 5); signature(g, x - 100, y - 360, 0.9, 1, 1); signature(g, x + 90, y - 360, 0.9, 1, 1); g.strokeStyle = 'rgba(200,60,40,.85)'; g.lineWidth = 5; for (const sx of [x - 100, x + 90]) { g.beginPath(); g.arc(sx, y - 420, 46, 0, 7); g.stroke(); } };
scene(56, { set: COURT2, light: 1,
  cam: kb({ x: 960, y: 560, z: 1.06 }, { x: 1040, y: 540, z: 1.16 }, PLAN[55].dur),
  grade: { warm: 0.08, vignette: 0.4 },
  sfx: [[0, 'room', 0.15, { dur: 9.4 }]],
  draw(g, t) {
    for (const wx of [200, 620, 1300, 1720]) K.beam(g, [[wx - 85, 140], [wx + 85, 140], [wx + 260, 760], [wx - 40, 760]], { color: '255,240,210', a: 0.08 });
    K.noah(g, { x: 960, y: 520, s: 0.5, outfit: { ...JUDGE, hair: { type: 'short', color: '#c8c4bc' } }, hunch: 0.4, look: [0.6, 0.6], eyes: t > 5 ? 'wide' : 'open', blink: blink(t, 4), t });
    K.judgeBench(g);
    easel(g, 1450, 1000, t);
    K.noah(g, { x: 1070, y: 1010, s: 0.64, view: 'side', outfit: { ...JAKOB_GENT, hat: { type: 'none' } }, armR: t > 1.5 ? 'point' : 'hang', armL: 'hang', look: [1, -0.2], blink: blink(t, 2), t });
    K.noah(g, { x: 300, y: 1060, s: 0.64, pose: 'sit', outfit: KONRAD_OLD, eyes: t > 5 ? 'worried' : 'open', look: [1, -0.2], armL: 'rest', armR: 'rest', blink: blink(t, 6), t }); K.pew(g, 60, 620, 1060);
  } });

// 57 · the same cheap ink, used only in the shipowner's counting house; an old warehouse hand takes the stand
const inkBottle = (g, x, y, s = 1) => { g.save(); g.translate(x, y); g.scale(s, s); const P = new Path2D(); P.moveTo(-40, 0); P.lineTo(-40, -90); P.quadraticCurveTo(-40, -120, -14, -126); P.lineTo(-14, -160); P.lineTo(14, -160); P.lineTo(14, -126); P.quadraticCurveTo(40, -120, 40, -90); P.lineTo(40, 0); P.closePath(); K.shape(g, P, '#2a3448', [-40, -160, 40, 0], { ink: 4, hi: 0.4 }); K.rrect(g, -30, -80, 60, 46, 3, '#e8dcc0', 2.5); K.text(g, 'Tinte', 0, -57, { size: 14, font: 'serif', color: '#2a2a2a' }); K.rrect(g, -18, -176, 36, 18, 3, '#6a4a2a', 2.5); g.restore(); };
scene(57, { set: COURT2, light: 1,
  cam: kb({ x: 960, y: 560, z: 1.08 }, { x: 1200, y: 580, z: 1.12 }, PLAN[56].dur),
  grade: { warm: 0.08, vignette: 0.4 },
  sfx: [[0, 'room', 0.15, { dur: 10 }], [7.8, 'door', 0.15], ...K.steps(8.2, 10, 0.4, 'step', 0.25)],
  draw(g, t) {
    K.noah(g, { x: 960, y: 520, s: 0.5, outfit: { ...JUDGE, hair: { type: 'short', color: '#c8c4bc' } }, look: [0.6, 0.5], blink: blink(t, 4), t }); K.judgeBench(g);
    K.rrect(g, 640, 860, 520, 30, 4, '#5e3c24', 4); K.rrect(g, 660, 890, 480, 150, 4, '#4a3020', 4); inkBottle(g, 900, 860, 1.1);
    K.noah(g, { x: 560, y: 1020, s: 0.64, outfit: LAWYER, armR: t < 6 ? 'point' : 'hang', look: [1, -0.2], blink: blink(t, 3), t });
    // witness stand on the right; the old worker walks in, cap in hand
    K.rrect(g, 1460, 720, 320, 28, 4, '#5e3c24', 4);
    const wx = key(t, [[7.6, 1950], [10, 1620]], (v) => v), walk = t > 7.6 && t < 10;
    if (t > 7.4) K.noah(g, { x: wx, y: 1010, s: 0.6, view: 'side', flip: true, pose: walk ? 'walk' : 'stand', step: t * 0.4, hunch: 0.5, outfit: OLDWORKER, eyes: 'worried', armL: 'swing', armR: 'swing', t });
    K.rrect(g, 1480, 748, 280, 300, 4, '#5e3c24', 4);
  } });

// 58 · he saw Haller on the night of the fire; Konrad Haller turns pale … and confesses everything
scene(58, { set: COURT2, light: 1,
  cam: (t) => { const u = sm(clamp((t - 4.5) / 3)); return { x: lerp(1400, 520, u), y: lerp(560, 700, u), z: lerp(1.25, 1.45, u) }; },
  grade: { warm: 0.06, vignette: 0.45 },
  sfx: [[0, 'room', 0.15, { dur: 12.5 }], [5.6, 'heartbeat', 0.2, { n: 3 }]],
  draw(g, t) {
    K.noah(g, { x: 960, y: 520, s: 0.5, outfit: { ...JUDGE, hair: { type: 'short', color: '#c8c4bc' } }, look: [0.5, 0.5], blink: blink(t, 4), t }); K.judgeBench(g);
    K.rrect(g, 1460, 720, 320, 28, 4, '#5e3c24', 4);
    K.noah(g, { x: 1620, y: 1010, s: 0.6, outfit: OLDWORKER, hunch: 0.4, eyes: 'worried', armR: t > 1 && t < 4 ? 'point' : 'hang', look: [-1, 0], headTilt: Math.sin(t * 2) * 0.03, blink: blink(t, 7), t });
    K.rrect(g, 1480, 748, 280, 300, 4, '#5e3c24', 4);
    const pale = dis(t, 5.2, 1.5), conf = dis(t, 9.4, 1.2);
    const k = K.noah(g, { x: 520, y: 1060, s: 0.66, pose: 'sit', outfit: KONRAD_OLD, eyes: conf > 0.5 ? 'closed' : pale > 0.3 ? 'wide' : 'open', look: [1, 0], headTilt: conf * 0.22, hunch: conf, armL: 'rest', armR: conf > 0.5 ? 'face' : 'rest', blink: blink(t, 6), t });
    if (pale > 0) { K.glow(g, k.head[0], k.head[1], 120, '210,225,255', 0.35 * pale); K.sweat(g, k.head[0] + 60, k.head[1] - 40, 0.8, t); }
    K.pew(g, 220, 820, 1060);
  } });

// ===================================================================== TEIL 10 · Nach Hause (warm)
const ALLEY = K.set((g) => {
  K.sky2(g, 0, 0, W(), 700, { time: 'dusk', seed: 19, stars: 60 });
  K.townhouse(g, -40, 860, 360, 520, { color: '#c8a888', shutters: '#5a4a3a', seed: 2, lit: 0.6 }); K.townhouse(g, 320, 860, 300, 560, { color: '#9a4a32', brick: true, seed: 4, lit: 0.5 });
  K.townhouse(g, 620, 860, 320, 480, { color: '#d8c49a', shutters: '#3a5a3a', seed: 6, lit: 0.4 }); K.townhouse(g, 940, 860, 340, 540, { color: '#a85a3a', brick: true, seed: 8, lit: 0.5 });
  K.townhouse(g, 1280, 860, 380, 420, { color: '#efe4cc', shutters: '#3a6ab0', seed: 10, lit: 0.8, door: '#3a5a8a' }); K.townhouse(g, 1660, 860, 320, 560, { color: '#8a5a44', brick: true, seed: 12, lit: 0.4 });
  K.cobbles(g, 860, 1080, { color: '#7a7480', seed: 7, wet: 0.5 });
});
// 59 · that same evening, through the old lane by the harbour, to the little house with the blue shutters
scene(59, { set: ALLEY, in: 'black', inDur: 1.8, light: 1, music: 'happy',
  cam: kb({ x: 700, y: 600, z: 1.2 }, { x: 1230, y: 600, z: 1.24 }, PLAN[58].dur),
  grade: { tint: '#7a6aa8', tintA: 0.14, warm: 0.16, vignette: 0.42 },
  sfx: [...K.steps(0.4, 9.6, 0.42, 'step-street', 0.3), [0, 'evening', 0.15, { dur: 9.8 }]],
  draw(g, t) {
    for (const x of [300, 1000, 1640]) K.gasLamp(g, x, 980, { on: true, s: 0.9 });
    const x = 360 + t * 70; K.noah(g, { x, y: 1000, s: 0.58, view: 'side', pose: 'walk', step: t * 0.42, outfit: JAKOB_GENT, armL: 'swing', armR: 'hold', holdR: { item: 'cane', len: 220, tilt: -0.2 }, blink: blink(t, 2), t });
  } });

// Greta's door
const GDOOR = K.set((g) => { K.sky2(g, 0, 0, W(), 200, { time: 'dusk', seed: 4 });
  g.fillStyle = '#efe4cc'; g.fillRect(0, 0, W(), 900); K.paint(g, 0, 0, W(), 900, ['#d8c8a8', '#fff6e4', '#c8b494'], 500, 21, 10, 70, 0.1);
  K.bricks(g, 0, 0, 120, 900, { color: '#9a4a32', seed: 3 }); K.bricks(g, 1800, 0, 1920, 900, { color: '#8a5038', seed: 5 }); g.strokeStyle = K.INK; g.lineWidth = 5; g.strokeRect(120, -10, 1680, 920);
  for (const wx of [300, 1340]) { const ww = 260, wy = 180, wh = 380; for (const sd of [-1, 1]) { K.rrect(g, sd < 0 ? wx - ww * 0.48 : wx + ww, wy, ww * 0.46, wh, 3, '#3a6ab0', 3); g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 2; for (let k = 1; k < 9; k++) { g.beginPath(); g.moveTo(sd < 0 ? wx - ww * 0.45 : wx + ww + 4, wy + k * wh / 9); g.lineTo(sd < 0 ? wx - 6 : wx + ww * 1.43, wy + k * wh / 9); g.stroke(); } }
    K.rrect(g, wx, wy, ww, wh, 3, '#ffd28a', 4); g.strokeStyle = '#f2ead8'; g.lineWidth = 6; g.beginPath(); g.moveTo(wx + ww / 2, wy); g.lineTo(wx + ww / 2, wy + wh); g.moveTo(wx, wy + wh * 0.45); g.lineTo(wx + ww, wy + wh * 0.45); g.stroke(); K.glow(g, wx + ww / 2, wy + wh / 2, 300, '255,200,120', 0.3); K.rrect(g, wx - 14, wy + wh, ww + 28, 18, 3, '#d8c8a8', 3); }
  K.rrect(g, 790, 250, 340, 660, 6, '#d8c8a8', 5); K.cobbles(g, 900, 1080, { color: '#7a7480', seed: 3, wet: 0.4 }); K.rrect(g, 780, 896, 360, 18, 3, '#8a8478', 3);
  K.F.plant(g, 1560, 900, { s: 1.2 }); K.F.plant(g, 640, 900, { s: 1.0 }); K.gasLamp(g, 1700, 1000, { on: true, s: 0.9 }); });
const doorAt = { x: 960, w: 280, h: 616 };
const doorPanel = (g, u) => { const { x, w, h } = doorAt, y = 900; g.fillStyle = '#ffcf8a'; g.fillRect(x - w / 2, y - h, w, h); K.glow(g, x, y - h / 2, 400, '255,200,120', 0.4 * u);
  g.save(); g.translate(x - w / 2, 0); g.scale(1 - u * 0.85, 1); g.translate(-(x - w / 2), 0); K.rrect(g, x - w / 2, y - h, w, h, 4, '#3a5a8a', 4); g.strokeStyle = 'rgba(0,0,0,.4)'; g.lineWidth = 3; g.strokeRect(x - w / 2 + 30, y - h + 40, w - 60, h * 0.4); g.strokeRect(x - w / 2 + 30, y - h * 0.5, w - 60, h * 0.4); g.restore(); };
// 60 · Greta opened the door. Older, like me. A few grey strands. She looked at me and said nothing for a long time
scene(60, { set: GDOOR, light: 1,
  cam: kb({ x: 960, y: 560, z: 1.0 }, { x: 980, y: 560, z: 1.08 }, PLAN[59].dur),
  grade: { tint: '#7a6aa8', tintA: 0.12, warm: 0.2, vignette: 0.42 },
  sfx: [[0.2, 'door', 0.3], [0, 'evening', 0.12, { dur: 10.7 }]],
  draw(g, t) {
    // the townhouse door is under our panel: draw it big over the set's door
    const u = key(t, [[0.2, 0], [1.4, 1]]); doorPanel(g, u);
    if (u > 0.3) K.noah(g, { x: 960, y: 900, s: 0.78, outfit: GRETA_OLD, eyes: t > 3 ? 'wide' : 'open', look: [0.7, 0], blink: t > 3 && t < 9 ? 0 : blink(t, 8), t });
    K.noah(g, { x: 1400, y: 1010, s: 0.8, view: 'side', flip: true, outfit: { ...JAKOB_GENT, hat: { type: 'none' } }, armR: 'hold', holdR: { item: 'cane', len: 260 }, eyes: 'open', look: [1, -0.1], blink: blink(t, 2), t });
  } });

// 61 · her hand on my cheek: "I always knew. I never believed it was you."
scene(61, { set: GDOOR, light: 1,
  cam: kb({ x: 1120, y: 520, z: 1.5 }, { x: 1140, y: 520, z: 1.6 }, PLAN[60].dur),
  grade: { tint: '#7a6aa8', tintA: 0.1, warm: 0.24, vignette: 0.45 },
  draw(g, t) {
    doorPanel(g, 1);
    const reach = dis(t, 0.4, 1.4);
    K.noah(g, { x: 1000, y: 900, s: 0.78, outfit: GRETA_OLD, turn: 0.4, armR: K.mixv(K.ARMS.hang, [[90, 30], [250, -120]], reach), eyes: t > 4.2 ? 'happy' : 'sad', look: [0.8, -0.1], blush: 0.3, blink: blink(t, 8), t });
    K.noah(g, { x: 1340, y: 960, s: 0.8, outfit: { ...JAKOB_GENT, hat: { type: 'none' } }, turn: -0.5, headTilt: -0.08 * reach, eyes: t > 5 ? 'happy' : 'closed', look: [-0.8, 0], t });
  } });

// 62 · autumn 1912: the wedding — and across the harbour, a school going up, built with Anselm's gold
const WEDDING = K.set((g) => { K.sky2(g, 0, 0, W(), 640, { time: 'golden', seed: 33 });
  K.schoolhouse(g, 1180, 760, 620, 380, { time: 'day' }); K.scaffold(g, 1150, 1830, 760, 520);
  K.tree(g, 230, 800, 1.6, { type: 'autumn', seed: 4 }); K.tree(g, 960, 790, 1.1, { type: 'autumn', seed: 6 });
  K.cobbles(g, 760, 1080, { color: '#9a9084', seed: 9 }); });
scene(62, { set: WEDDING, light: 1,
  cam: kb({ x: 820, y: 580, z: 1.12 }, { x: 1000, y: 560, z: 1.08 }, PLAN[61].dur),
  grade: { warm: 0.24, vignette: 0.36 },
  sfx: [[0, 'bell', 0.25], [2.4, 'bell', 0.18], [0, 'crowd', 0.12, { dur: 6 }], [5, 'knock', 0.08, { n: 3 }]],
  draw(g, t) {
    const r = rng(5); for (let i = 0; i < 26; i++) { const ph = (t * 0.12 + r()) % 1, x = r() * 1920 + Math.sin(t + i) * 40, y = -40 + ph * 1120; K.ell(g, x, y, 9, 5, ['#d8742a', '#e8a83a', '#a8402a'][i % 3], 1.5, t * 2 + i); }
    for (const [x, o] of [[180, HINNERK], [330, FISHER_A], [1100, GRETA], [1240, WORKER_A]]) K.noah(g, { x, y: 960, s: 0.5, outfit: o === GRETA ? { ...GRETA, top: { type: 'dress', color: '#7a5a8a', color2: '#f4f0e6' }, bottom: { type: 'skirt', color: '#7a5a8a' } } : o, eyes: 'happy', armL: o === HINNERK ? 'wave' : 'hang', t });
    K.noah(g, { x: 620, y: 1010, s: 0.72, outfit: { ...JAKOB_GENT, hat: { type: 'none' } }, turn: 0.4, eyes: 'happy', armR: [[60, 110], [118, 176]], t });
    K.noah(g, { x: 860, y: 1010, s: 0.68, outfit: GRETA_BRIDE, turn: -0.4, eyes: 'happy', blush: 0.5, armL: [[60, 110], [118, 176]], t });
    // a few workers on the scaffold
    K.noah(g, { x: 1400, y: 640, s: 0.24, outfit: WORKER_B, armR: K.key((t * 1.6) % 1, [[0, 'up'], [0.5, 'forward'], [1, 'up']]), t });
  } });

// 63 · the Weidner School: arithmetic, astronomy, chemistry, languages; golden letters over the door
const SCHOOL = K.set((g) => { K.sky2(g, 0, 0, W(), 640, { time: 'day', seed: 7 });
  K.schoolhouse(g, 260, 900, 1400, 720, { sign: 'Weidner-Schule', sub: 'Ein Kopf ist das Einzige, was sie dir nicht wegnehmen können.', time: 'day' });
  K.cobbles(g, 900, 1080, { color: '#9a9084', seed: 5 }); K.tree(g, 120, 920, 1.4, { type: 'autumn', seed: 2 }); K.tree(g, 1800, 920, 1.3, { type: 'autumn', seed: 3 }); });
scene(63, { set: SCHOOL, light: 1,
  cam: (t) => { const u = sm(clamp(t / 7.6)); return { x: lerp(560, 960, u), y: lerp(420, 470, u), z: lerp(1.5, 1.32, u) }; },
  grade: { warm: 0.18, vignette: 0.34 },
  sfx: [[0, 'children', 0.15, { dur: 11.5 }], [0.6, 'chalk', 0.12, { dur: 2 }], [8.0, 'chime', 0.12]],
  draw(g, t) {
    // inside the first classroom window: a teacher at the board with stars and sums, children's heads
    g.save(); const wx = 260 + 1400 * 0.125 - 1400 / 12.8 / 2; g.beginPath(); g.rect(338, 290, 220, 300); g.clip(); g.fillStyle = '#f2e6c8'; g.fillRect(330, 280, 240, 320);
    K.rrect(g, 360, 330, 180, 110, 4, '#2e3a32', 3); K.text(g, '3 + 4 = 7', 450, 360, { size: 22, font: 'hand', color: '#f0f0e6', weight: 'normal' }); const dp = K.bigDipper(400, 395, 0.4); for (const p of dp) K.star(g, p[0], p[1], 4, 0, '#f0f0e6');
    for (const [x, c] of [[380, '#7a3a2e'], [450, '#3a5a8a'], [520, '#5a7a3a']]) K.noah(g, { x, y: 720, s: 0.3, outfit: KID(c, 'short'), look: [0, -0.6], t }); g.restore();
    for (const [x, o, st] of [[640, KID('#7a3a2e', 'short'), 0], [760, KID_GIRL('#5a6a9a'), 0.3], [1260, KID('#3a5a8a', 'curly', '#2a1c14'), 0.6]]) K.noah(g, { x: x + t * 14, y: 1010, s: 0.42, view: 'side', pose: 'walk', step: t * 0.5 + st, outfit: o, armL: 'swing', armR: 'swing', t });
  } });

// 64 · on clear nights, on the roof with the children: the Pole Star
const ROOF = K.set((g) => { K.sky2(g, 0, 0, W(), 900, { time: 'night', moon: [1700, 160, 34], stars: 800, seed: 77 }); K.skyline(g, 0, W(), 820, { color: '#1e2444', time: 'night', seed: 4 });
  K.sea(g, 0, 820, W(), 60, { time: 'night' }); g.fillStyle = '#4a3a34'; g.fillRect(0, 880, W(), 200); K.bricks(g, 0, 880, W(), 960, { color: '#6a3a2a', seed: 4 }); g.strokeStyle = K.INK; g.lineWidth = 4; g.strokeRect(-10, 880, W() + 20, 80);
  K.floor(g, { y0: 960, type: 'planks', color: '#5a4636', seed: 2, base: false }); });
scene(64, { set: ROOF, light: 1,
  cam: (t) => { const u = sm(clamp(t / 9)); return { x: lerp(900, 980, u), y: lerp(640, 500, u), z: lerp(1.2, 1.12, u) }; },
  grade: { tint: '#4a58a0', tintA: 0.18, warm: 0.08, vignette: 0.45 },
  sfx: [[0, 'evening', 0.1, { dur: 10 }], [3, 'chime', 0.1]],
  draw(g, t) {
    const dip = K.bigDipper(860, 110, 1.0), pol = K.polaris(dip, 3.4); const la = dis(t, 1.2, 2.5);
    K.dustDraw(g, [dip], la, { color: 'rgba(200,215,255,.45)', w: 3, shadow: false }); for (const p of dip) K.star(g, p[0], p[1], 8, 0, '#fffbe8');
    K.glow(g, pol[0], pol[1], 90, '255,250,220', 0.8); K.star(g, pol[0], pol[1], 15, t * 0.05, '#fff8d8');
    K.noah(g, { x: 760, y: 1040, s: 0.66, view: 'side', outfit: { ...JAKOB_GENT, hat: { type: 'none' }, hair: { type: 'short', color: '#5a3a22', grey: 0.6 } }, armR: { E: [80, -300], H: [190, -470] }, look: [1, -1], eyes: 'happy', t });
    for (const [x, o, s] of [[960, KID('#7a3a2e', 'short'), 0.44], [1110, KID_GIRL('#5a6a9a'), 0.42], [1250, KID('#3a5a8a', 'curly', '#2a1c14'), 0.45]]) K.noah(g, { x, y: 1040, s, outfit: o, look: [-0.3, -1], eyes: t > 4 ? 'happy' : 'wide', blink: blink(t, x), t });
    K.rrect(g, 0, 1000, 1920, 22, 4, '#3a2e28', 4); for (let x = 30; x < 1920; x += 90) K.rrect(g, x, 1000, 14, 90, 3, '#3a2e28', 3);
  } });
