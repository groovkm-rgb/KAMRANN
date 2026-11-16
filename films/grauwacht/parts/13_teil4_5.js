// ===================================================================== TEIL 4 · Die Schule im Dunkeln (dreamy)
const strokeText = (x, y, w, h, n = 1) => { const out = []; for (let i = 0; i < n; i++) out.push([[x + i * 18, y], [x + i * 18 + 2, y + h]]); return out; };
const circ = (cx, cy, rx, ry, a0 = 0, a1 = Math.PI * 2, n = 28) => { const p = []; for (let i = 0; i <= n; i++) { const a = lerp(a0, a1, i / n); p.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return p; };
const arrow = (x0, y0, x1, y1) => { const a = Math.atan2(y1 - y0, x1 - x0), L = 22; return [[[x0, y0], [x1, y1]], [[x1 - Math.cos(a - 0.5) * L, y1 - Math.sin(a - 0.5) * L], [x1, y1], [x1 - Math.cos(a + 0.5) * L, y1 - Math.sin(a + 0.5) * L]]]; };
// the floor between them, seen in perspective (drawing area centred at 970, 975)
const floorDraw = (g, strokes, u, opt) => { g.save(); g.translate(970, 975); g.scale(1, 0.42); g.translate(-970, -975); K.dustDraw(g, strokes, u, { w: 7, ...opt }); g.restore(); };
const NUMBERS = [...strokeText(620, 880, 0, 120, 3), [[700, 940], [760, 940]], [[730, 910], [730, 970]], ...strokeText(800, 880, 0, 120, 4), [[900, 925], [960, 925]], [[900, 955], [960, 955]], ...strokeText(1000, 880, 0, 120, 7)];
const TIDE = [circ(960, 980, 90, 90), circ(960, 980, 170, 120), circ(1330, 980, 40, 40), ...arrow(1150, 980, 1270, 980), ...arrow(800, 980, 690, 980)];
const lesson = (g, t, jo = {}, ao = {}) => {
  K.item(g, 'candle', 970, 905, 0.8, { t }); candleGlow(g, 970, 860, t, 1.2);
  K.noah(g, { x: 680, y: 920, s: 0.62, view: 'side', pose: 'kneel', outfit: JAKOB_PR(5), look: [1, 0.5], blink: blink(t, 2), t, ...jo });
  K.noah(g, { x: 1270, y: 920, s: 0.62, view: 'side', flip: true, pose: 'kneel', hunch: 0.7, outfit: ANSELM, look: [1, 0.4], blink: blink(t, 5), t, ...ao });
};
// 20 · counting with strokes in the dust; the moon pulls the sea
scene(20, { set: CELL_NIGHT, light: 1,
  cam: (t) => { const u = sm(clamp(t / 14)); return { x: 970, y: lerp(720, 800, u), z: lerp(1.3, 1.5, u) }; },
  grade: { tint: '#5a62a0', tintA: 0.2, warm: 0.16, vignette: 0.55 },
  sfx: [[1.0, 'scrape', 0.12, { dur: 4 }], [9.8, 'scrape', 0.12, { dur: 3.5 }]],
  draw(g, t) {
    winBeam(g, 0.14, true); K.looseStone(g, 470, 830, 1, { color: '#7c7874' });
    const a1 = 1 - dis(t, 9.0, 0.8); withA(g, a1, () => floorDraw(g, NUMBERS, clamp((t - 0.8) / 6)));
    withA(g, dis(t, 9.0, 0.8), () => floorDraw(g, TIDE, clamp((t - 9.6) / 4)));
    lesson(g, t, { eyes: t > 7 && t < 9 ? 'happy' : 'open' }, { armR: t > 1 && t < 7 || t > 9.6 && t < 13.5 ? { E: [110, -160], H: [200, -40 + Math.sin(t * 3) * 10] } : 'rest', eyes: 'open' });
  } });

// 21 · through the little window: the Pole Star and the Great Bear
const WIN_BIG = { x: 610, y: 120, w: 700, h: 430 };
const STARWALL = K.set((g) => {
  K.stoneBlocks(g, 0, 0, W(), 1080, { color: '#6a6a70', bw: 150, bh: 80, seed: 51, damp: 0.6 });
  const { x, y, w, h } = WIN_BIG; g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); K.sky2(g, x, y, w, h, { time: 'night', seed: 12, stars: 220 }); g.restore();
  g.strokeStyle = K.INK; g.lineWidth = 10; g.strokeRect(x, y, w, h); K.poly(g, [[x - 40, y + h], [x + w + 40, y + h], [x + w + 20, y + h + 50], [x - 20, y + h + 50]]); K.fillInk(g, '#5a5a62', 4);
});
scene(21, { set: STARWALL, light: 1,
  cam: kb({ x: 960, y: 520, z: 1.05 }, { x: 960, y: 420, z: 1.18 }, PLAN[20].dur),
  grade: { tint: '#4a58a0', tintA: 0.25, warm: 0.04, vignette: 0.5 },
  sfx: [[2.0, 'chime', 0.12], [5.5, 'chime', 0.1]],
  draw(g, t) {
    const { x, y, w, h } = WIN_BIG; g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
    const dip = K.bigDipper(x + 360, y + 230, 0.95), pol = K.polaris(dip, 4.2);
    K.dustDraw(g, [dip], clamp((t - 1.0) / 3), { color: 'rgba(200,215,255,.55)', w: 3, shadow: false });
    for (const p of dip) K.star(g, p[0], p[1], 9, 0, '#fffbe8');
    const pa = dis(t, 4.6, 1); if (pa > 0) { g.setLineDash([6, 10]); K.dustDraw(g, [[dip[5], dip[6], pol]], clamp((t - 4.6) / 2), { color: 'rgba(255,240,180,.6)', w: 3, shadow: false }); g.setLineDash([]); K.glow(g, pol[0], pol[1], 60 * pa, '255,250,220', 0.6); K.star(g, pol[0], pol[1], 15, t * 0.1, '#fff8d8'); }
    g.restore();
    // bars in front of the sky
    g.strokeStyle = '#2a2826'; g.lineWidth = 14; for (let k = 1; k < 5; k++) { g.beginPath(); g.moveTo(x + k * w / 5, y - 6); g.lineTo(x + k * w / 5, y + h + 6); g.stroke(); }
    moonBeam(g, WIN_BIG, [[1500, 1080], [500, 1080]], 0.12, '170,195,255');
    K.noah(g, { x: 430, y: 1170, s: 0.9, view: 'side', outfit: ANSELM, hunch: 0.3, armR: t > 4 ? { E: [70, -250], H: [150, -420] } : 'hang', look: [1, -1], eyes: 'open', blink: blink(t, 5), t });
    K.noah(g, { x: 1520, y: 1180, s: 0.9, view: 'side', flip: true, outfit: JAKOB_PR(5), look: [1, -1], eyes: t > 6 ? 'wide' : 'open', blink: blink(t, 2), t });
  } });

// close-up of the floor (lessons with the hands)
const FLOOR_CLOSE = K.set((g) => { g.fillStyle = '#6a5e50'; g.fillRect(0, 0, W(), 1080); K.paint(g, 0, 0, W(), 1080, ['#5a4e42', '#8a7a64', '#4a4036', '#7a6a58'], 900, 71, 10, 90, 0.18);
  const r = rng(4); g.strokeStyle = 'rgba(30,22,16,.55)'; g.lineWidth = 4; for (const [x0, y0, x1, y1] of [[0, 240, 1920, 300], [0, 820, 1920, 760], [620, 0, 560, 300], [1300, 300, 1380, 760], [400, 790, 360, 1080], [1500, 0, 1460, 260]]) { g.beginPath(); g.moveTo(x0, y0); g.lineTo((x0 + x1) / 2 + 12, (y0 + y1) / 2 - 8); g.lineTo(x1, y1); g.stroke(); }
  for (let i = 0; i < 700; i++) { g.fillStyle = `rgba(${r() > 0.5 ? '230,215,180' : '40,30,20'},${0.08 + r() * 0.12})`; g.fillRect(r() * W(), r() * 1080, 2 + r() * 3, 2 + r() * 3); }
  for (let i = 0; i < 80; i++) { const x = r() * W(), y = r() * 1080; g.strokeStyle = 'rgba(210,180,110,.55)'; g.lineWidth = 3; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 70, y + (r() - 0.5) * 20); g.stroke(); } });
const arm = (g, x0, y0, x1, y1, kind = 'open', color = '#5a5a66', ang = null) => { g.save(); g.lineCap = 'round'; g.strokeStyle = K.INK; g.lineWidth = 64; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); g.strokeStyle = K.pattern(g, 'tweed', color); g.lineWidth = 56; g.stroke(); g.restore();
  K.glove(g, x1, y1, ang ?? Math.atan2(y1 - y0, x1 - x0) - Math.PI / 2, kind, 1); };
// 22 · ink from soot and water; cleaning a wound; why salt water carries a calm body
scene(22, { set: FLOOR_CLOSE, light: 1,
  cam: kb({ x: 960, y: 540, z: 1.0 }, { x: 960, y: 560, z: 1.08 }, PLAN[21].dur),
  grade: { warm: 0.2, vignette: 0.6 },
  sfx: [[1.0, 'fire', 0.12, { dur: 3.5 }], [2.8, 'stir', 0.2, { dur: 1.6 }], [5.0, 'water', 0.25, { dur: 1.5 }], [7.0, 'scrape', 0.12, { dur: 4 }]],
  draw(g, t) {
    const a1 = 1 - dis(t, 6.0, 0.8), a2 = dis(t, 6.0, 0.8);
    withA(g, a1, () => {
      K.item(g, 'candle', 640, 640, 2.0, { t }); candleGlow(g, 640, 520, t, 1.6);
      const soot = clamp(t / 3); g.save(); g.translate(640, 420); K.ell(g, 0, 0, 120, 26, '#9a9aa2', 4); K.ell(g, 0, 6, 70 * soot + 10, 12 * soot + 3, `rgba(20,18,18,${0.4 + soot * 0.5})`, 0); g.restore(); arm(g, 160, 260, 520, 410, 'grip');
      K.ell(g, 1240, 640, 130, 40, '#8a7a5a', 4); g.fillStyle = '#7a6a4a'; g.fillRect(1110, 640, 260, 90); K.ell(g, 1240, 730, 130, 40, '#6a5a3a', 4); K.ell(g, 1240, 640, 112, 32, `rgb(${lerp(120, 20, soot) | 0},${lerp(140, 20, soot) | 0},${lerp(160, 30, soot) | 0})`, 2);
      const st = Math.sin(t * 6) * 30; g.strokeStyle = K.INK; g.lineWidth = 12; g.beginPath(); g.moveTo(1240 + st, 640); g.lineTo(1340 + st, 400); g.stroke(); g.strokeStyle = '#a07a4a'; g.lineWidth = 7; g.stroke(); arm(g, 1800, 260, 1340 + st, 410, 'grip');
      if (t > 4.3) { const w = dis(t, 4.3, 0.6); withA(g, w, () => { K.ell(g, 960, 900, 150, 40, '#c8c0b0', 4); K.ell(g, 960, 895, 128, 30, '#9ab0c0', 2); for (let i = 0; i < 4; i++) { const ph = (t * 1.5 + i * 0.25) % 1; g.fillStyle = `rgba(200,220,240,${1 - ph})`; g.beginPath(); g.arc(940 + i * 12, 760 + ph * 120, 5, 0, 7); g.fill(); } K.rrect(g, 900, 700, 90, 60, 10, '#e8e0cc', 3); }); }
    });
    withA(g, a2, () => {
      const WAVE = [[...Array(30)].map((_, i) => [360 + i * 40, 560 + Math.sin(i * 0.7) * 22])];
      const BODY = [circ(700, 520, 34, 34), [[734, 520], [1160, 520]], [[820, 520], [880, 470]], [[820, 520], [880, 570]], [[1160, 520], [1240, 490]], [[1160, 520], [1240, 550]]];
      const UP = [...arrow(760, 720, 760, 600), ...arrow(960, 720, 960, 600), ...arrow(1160, 720, 1160, 600)];
      K.dustDraw(g, [...WAVE, ...BODY, ...UP], clamp((t - 6.4) / 4.4), { w: 9 });
      const tip = t < 10.8 ? [lerp(360, 1160, clamp((t - 6.4) / 4.4)), 560 + Math.sin(t * 3) * 30] : [1240, 760]; arm(g, 1700, 1100, tip[0] + 20, tip[1] + 30, 'point', '#5a5a66');
    });
  } });

// 23 · reading handwriting: how the pen is held, where the pressure lies
const paperSheet = (g, x, y, w, h, rot = 0) => { g.save(); g.translate(x, y); g.rotate(rot); const P = new Path2D(); P.roundRect(-w / 2, -h / 2, w, h, 4); K.shape(g, P, '#efe2c2', [-w / 2, -h / 2, w / 2, h / 2], { ink: 4, shade: 0.2, hi: 0.2 }); g.restore(); };
const signature = (g, x, y, s, tremble = 0, u = 1, t = 0) => { // "J. Brenner" as a pen line with pressure; tremble 0..1 makes the forger's shake
  g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = '#1e2048'; g.lineCap = 'round'; g.lineJoin = 'round';
  const path = []; for (let i = 0; i <= 40; i++) { const v = i / 40; path.push([-50 + v * 70 + (tremble ? Math.sin(i * 2.7) * 3.4 * tremble : 0), -90 - Math.sin(v * Math.PI) * 14]); }
  for (let i = 0; i <= 60; i++) { const v = i / 60, a = v * Math.PI; const x = v < 0.65 ? 0 : -Math.sin((v - 0.65) / 0.35 * Math.PI * 0.9) * 60, y = v < 0.65 ? -88 + v / 0.65 * 150 : 62 + Math.sin((v - 0.65) / 0.35 * Math.PI) * 26 - (v - 0.65) * 60;
    path.push([x + (tremble ? Math.sin(i * 3.1) * 3 * tremble : 0), y]); }
  const n = Math.max(2, Math.floor(path.length * u)); for (let i = 1; i < n; i++) { g.lineWidth = 3 + 7 * Math.sin(i / path.length * Math.PI); g.beginPath(); g.moveTo(...path[i - 1]); g.lineTo(...path[i]); g.stroke(); }
  if (u > 0.9) K.text(g, '. Brenner', 90, 30, { size: 52, font: 'hand', weight: 'normal', color: '#1e2048', align: 'left' });
  g.restore(); };
scene(23, { set: FLOOR_CLOSE, light: 1,
  cam: kb({ x: 960, y: 560, z: 1.02 }, { x: 960, y: 520, z: 1.1 }, PLAN[22].dur),
  grade: { warm: 0.2, vignette: 0.6 },
  sfx: [[4.0, 'writing', 0.25, { dur: 2.5 }], [8.0, 'page', 0.2]],
  draw(g, t) {
    K.item(g, 'candle', 1760, 300, 1.4, { t }); candleGlow(g, 1760, 220, t, 1.4);
    paperSheet(g, 560, 560, 560, 380, -0.05); paperSheet(g, 1300, 580, 560, 380, 0.04);
    signature(g, 480, 560, 1.2, 0, 1); signature(g, 1220, 580, 1.2, 0, clamp((t - 3.6) / 3));
    if (t > 3.4 && t < 7) { const pr = clamp((t - 3.6) / 3); arm(g, 1800, 1100, 1180 + pr * 200, 640 - Math.sin(pr * 9) * 20, 'grip', '#5a5a66'); }
    if (t > 7.4) { const u = dis(t, 7.4, 1); withA(g, u, () => { g.strokeStyle = 'rgba(200,60,40,.8)'; g.lineWidth = 5; for (const [x, y] of [[420, 520], [1160, 540]]) { g.beginPath(); g.arc(x, y, 60, 0, 7); g.stroke(); } }); }
  } });

// 24 · a forged signature is like a lie: it looks right, but it trembles
scene(24, { set: FLOOR_CLOSE, light: 1,
  cam: kb({ x: 960, y: 540, z: 1.06 }, { x: 980, y: 540, z: 1.16 }, PLAN[23].dur),
  grade: { warm: 0.2, vignette: 0.6 },
  sfx: [[1.5, 'slide', 0.0]],
  draw(g, t) {
    paperSheet(g, 960, 560, 900, 520, 0.02); signature(g, 860, 560, 1.7, 1, 1);
    const mx = key(t, [[0.6, 1500], [2.6, 830], [8, 860]]), my = key(t, [[0.6, 900], [2.6, 470], [8, 480]]);
    g.save(); g.beginPath(); g.arc(mx, my, 150, 0, 7); g.clip(); g.fillStyle = '#efe2c2'; g.fillRect(mx - 160, my - 160, 320, 320); g.translate(mx, my); g.scale(2.1, 2.1); g.translate(-mx, -my); signature(g, 860, 560, 1.7, 1, 1); g.restore();
    K.item(g, 'magnifier', mx, my + 46 * 3.4, 3.4, { tilt: 0 });
    arm(g, 1900, 1180, mx + 60, my + 330, 'grip', '#5a5a66', 0.2);
  } });

// 25 · "Hate is heavy baggage, Jakob. Whoever swims with it goes under."
scene(25, { set: CELL_NIGHT, light: 1,
  cam: kb({ x: 1000, y: 600, z: 1.3 }, { x: 990, y: 600, z: 1.42 }, PLAN[24].dur),
  grade: { tint: '#5a62a0', tintA: 0.2, warm: 0.14, vignette: 0.55 },
  sfx: [[1.0, 'water', 0.12, { dur: 3 }]],
  draw(g, t) {
    winBeam(g, 0.18, true); K.item(g, 'candle', 1000, 905, 0.8, { t }); candleGlow(g, 1000, 860, t, 1.1);
    const a = K.noah(g, { x: 1180, y: 920, s: 0.66, view: 'side', flip: true, pose: 'kneel', hunch: 0.6, outfit: ANSELM, armR: t > 4 ? { E: [80, -260], H: [160, -300] } : 'rest', look: [1, 0], eyes: t > 6 ? 'happy' : 'open', blink: blink(t, 5), t });
    K.noah(g, { x: 820, y: 920, s: 0.66, view: 'side', pose: 'kneel', outfit: JAKOB_PR(5), eyes: t > 7 ? 'closed' : 'open', look: [1, 0], headTilt: t > 7 ? 0.08 : 0, t, blink: blink(t, 2) });
    const ba = dis(t, 0.8, 1) * (1 - dis(t, 7.5, 1)); if (ba > 0) K.thought(g, 1180, 300, 420, 260, (g2, cx, cy, w, h) => {
      g2.fillStyle = '#5a7ab0'; g2.fillRect(cx - w / 2, cy - 10, w, h); g2.strokeStyle = '#e8f0ff'; g2.lineWidth = 4; g2.beginPath(); for (let i = 0; i <= 20; i++) g2.lineTo(cx - w / 2 + i * w / 20, cy - 10 + Math.sin(i + t * 2) * 6); g2.stroke();
      const sink = clamp((t - 2) / 4) * 60; K.ell(g2, cx - 30, cy + sink - 10, 22, 22, '#fbfaf6', 3); K.ell(g2, cx - 36, cy + sink - 12, 3, 5, '#1a1210', 0); K.ell(g2, cx - 22, cy + sink - 12, 3, 5, '#1a1210', 0);
      K.rrect(g2, cx + 10, cy + sink + 10, 80, 56, 6, '#6a3a24', 3); K.rrect(g2, cx + 34, cy + sink, 32, 14, 4, '#3a2a1a', 2); g2.strokeStyle = K.INK; g2.lineWidth = 4; g2.beginPath(); g2.moveTo(cx - 10, cy + sink + 10); g2.lineTo(cx + 20, cy + sink + 20); g2.stroke();
    }, { from: [a.head[0] - 40, a.head[1] - 120], a: ba });
  } });

// 26 · five years later: winter 1911, long hair; Anselm's cough, then fever
const CELL_WINTER = K.set((g) => { K.cell(g, { win: CELLW, door: null, time: 'day', cracks: 60, color: '#868890' }); cellDoor(g, 300, 800, 0);
  g.fillStyle = 'rgba(230,240,255,.6)'; g.fillRect(CELLW.x, CELLW.y + CELLW.h - 14, CELLW.w, 14); for (let i = 0; i < 10; i++) { g.fillStyle = 'rgba(235,242,255,.5)'; g.beginPath(); g.arc(CELLW.x + i * 13, CELLW.y + 6, 7, 0, 7); g.fill(); } });
scene(26, { set: CELL_WINTER, light: -1,
  cam: kb({ x: 1150, y: 520, z: 1.25 }, { x: 1150, y: 560, z: 1.35 }, PLAN[25].dur),
  grade: { tint: '#8a98c0', tintA: 0.2, warm: 0.02, vignette: 0.52 },
  sfx: [[0, 'wind', 0.25, { dur: 11.7 }], [7.4, 'cough', 0.0]],
  draw(g, t) {
    K.snow(g, [CELLW.x, CELLW.y, CELLW.w, CELLW.h], t, { n: 30, size: 0.6 }); winBeam(g, 0.12);
    tally(g, 260, 1260, 420, { a: 0.55 });
    const cough = t > 6.6 ? Math.max(0, Math.sin(t * 14)) * 6 * (Math.sin(t * 1.3) > 0 ? 1 : 0) : 0;
    K.noah(g, { x: 1480, y: 800, s: 0.6, pose: 'sit', outfit: { ...ANSELM, shawl: '#6a6a5e' }, hunch: 0.7, bob: cough, eyes: t > 6.6 ? 'closed' : 'tired', bags: 0.6, armL: 'rest', armR: 'rest', headTilt: 0.1, blink: blink(t, 5), t });
    K.noah(g, { x: 1120, y: 880, s: 0.62, view: 'side', pose: 'kneel', outfit: JAKOB_PR(7), armR: 'hold', holdR: { item: 'mug', color: '#8a8a7a' }, eyes: t > 6.6 ? 'worried' : 'open', look: [1, -0.3], blink: blink(t, 2), t });
  } });

// ===================================================================== TEIL 5 · Das Geheimnis (sad)
const ANSELM_CELL = K.set((g) => { K.cell(g, { win: { x: 560, y: 150, w: 120, h: 90 }, door: 1720, time: 'night', cracks: 50, bed: [1050, 1500], bucket: 420, seed: 77 }); K.looseStone(g, 250, 760, 0, { color: '#141010', r: 50 }); });
const lyingAnselm = (g, t, o = {}) => K.noah(g, { x: 1110, y: 590, s: 0.5, pose: 'lie', outfit: ANSELM, blanket: '#5a5a4e', blanketPattern: 'tweed', handsOut: true, eyes: 'tired', look: [0.6, 0.3], bags: 0.8, headTilt: -0.15, blink: blink(t, 5), t, ...o });
// 27 · the last night: his hand cold as a stone
scene(27, { set: ANSELM_CELL, in: 'fade', inDur: 1.4, light: -1, music: 'sad',
  cam: kb({ x: 1180, y: 620, z: 1.3 }, { x: 1180, y: 640, z: 1.45 }, PLAN[26].dur),
  grade: { tint: '#5a62a0', tintA: 0.22, warm: 0.12, vignette: 0.6 },
  sfx: [[0, 'fire', 0.1, { dur: 9 }]],
  draw(g, t) {
    K.item(g, 'candle', 900, 900, 0.7, { t }); candleGlow(g, 900, 860, t, 1.0, 0.8);
    lyingAnselm(g, t, { eyes: t > 5 ? 'sad' : 'tired' });
    K.noah(g, { x: 1330, y: 950, s: 0.6, pose: 'kneel', outfit: JAKOB_PR(8), armL: { E: [-110, -320], H: [-310, -520] }, armR: 'hang', eyes: t > 6 ? 'worried' : 'sad', look: [-0.8, -0.6], blink: blink(t, 2), t });
  } });

// 28 · "My family was rich… gold, gems, papers"
scene(28, { set: ANSELM_CELL, light: -1,
  cam: kb({ x: 1180, y: 520, z: 1.55 }, { x: 1170, y: 520, z: 1.65 }, PLAN[27].dur),
  grade: { tint: '#5a62a0', tintA: 0.2, warm: 0.14, vignette: 0.6 },
  sfx: [[4.5, 'sparkle', 0.12]],
  draw(g, t) {
    K.item(g, 'candle', 900, 900, 0.7, { t }); candleGlow(g, 900, 860, t, 1.0, 0.8);
    const a = lyingAnselm(g, t, { eyes: 'open', look: [1, -0.4] });
    K.noah(g, { x: 1330, y: 950, s: 0.6, pose: 'kneel', outfit: JAKOB_PR(8), hunch: 0.3, eyes: t > 5 ? 'wide' : 'open', look: [-0.8, -0.4], blink: blink(t, 2), t });
    const ba = dis(t, 3.6, 1); if (ba > 0) K.thought(g, 960, 300, 440, 270, (g2, cx, cy) => { K.chest(g2, cx, cy + 90, 0.55, { open: 1, glow: 1, t }); }, { from: [a.head[0] - 30, a.head[1] - 80], a: ba });
  } });

// 29 · the map in the dust: Möwenholm, the broken lighthouse, forty steps toward the Pole Star, the cross
const ISLAND = [circ(860, 560, 420, 250, 0, Math.PI * 2, 40).map(([x, y], i) => [x + Math.sin(i * 1.7) * 26, y + Math.cos(i * 1.3) * 18])];
const LIGHTHOUSE = [[[600, 640], [620, 420], [680, 420], [700, 640]], [[600, 640], [700, 640]], [[610, 420], [650, 380], [690, 420]]];
const STEPS = [...Array(10)].map((_, i) => [[740 + i * 50, 600 - i * 24], [760 + i * 50, 590 - i * 24]]);
const CROSS = [[[1250, 300], [1250, 420]], [[1200, 350], [1300, 350]]];
const NSTAR = [[[1500, 150], [1540, 230]], [[1470, 200], [1570, 180]], [[1490, 240], [1550, 160]]];
scene(29, { set: FLOOR_CLOSE, light: 1,
  cam: kb({ x: 960, y: 540, z: 1.0 }, { x: 1000, y: 480, z: 1.08 }, PLAN[28].dur),
  grade: { warm: 0.18, tint: '#7a80b0', tintA: 0.1, vignette: 0.6 },
  sfx: [[0.3, 'scrape', 0.14, { dur: 12 }]],
  draw(g, t) {
    K.item(g, 'candle', 260, 920, 1.4, { t }); candleGlow(g, 260, 840, t, 1.3);
    const all = [...ISLAND, ...LIGHTHOUSE, ...STEPS, ...CROSS, ...NSTAR], u = clamp((t - 0.4) / 11);
    K.dustDraw(g, all, u, { w: 9 });
    if (u > 0.55) K.text(g, '40', 1000, 640, { size: 60, font: 'hand', color: `rgba(235,225,200,${clamp((u - 0.55) * 6)})`, weight: 'normal' });
    // the finger follows the drawing front
    const pts = all.flat(), tip = pts[Math.min(pts.length - 1, Math.floor(u * pts.length))]; if (t < 12) arm(g, 1900, 1150, tip[0] + 10, tip[1] + 40, 'point', '#5a5a66');
  } });

// 30 · "I'll never get out of here." — "Yes. You will. With me."
scene(30, { set: ANSELM_CELL, light: -1,
  cam: kb({ x: 1180, y: 560, z: 1.45 }, { x: 1180, y: 560, z: 1.5 }, PLAN[29].dur),
  grade: { tint: '#5a62a0', tintA: 0.2, warm: 0.14, vignette: 0.6 },
  draw(g, t) {
    K.item(g, 'candle', 900, 900, 0.7, { t }); candleGlow(g, 900, 860, t, 0.9, 0.7);
    lyingAnselm(g, t, { eyes: t > 5.6 ? 'happy' : 'open', look: [1, -0.3] });
    const shake = t > 0.4 && t < 2.6 ? Math.sin(t * 9) * 0.12 : 0;
    K.noah(g, { x: 1330, y: 950, s: 0.6, pose: 'kneel', outfit: JAKOB_PR(8), headTilt: shake, eyes: t < 5.6 ? 'sad' : 'wide', look: [-0.8, -0.4], blink: blink(t, 2), t });
  } });

// 31 · by morning he was dead (and the dead of Grauwacht are not buried)
scene(31, { set: ANSELM_CELL, light: -1,
  cam: kb({ x: 1150, y: 600, z: 1.3 }, { x: 780, y: 380, z: 1.25 }, PLAN[30].dur),
  grade: { tint: '#7a88b8', tintA: 0.22, warm: 0.0, vignette: 0.55 },
  sfx: [[0, 'sea', 0.15, { dur: 14 }], [3, 'gulls', 0.08, { dur: 3 }]],
  draw(g, t) {
    moonBeam(g, { x: 560, y: 150, w: 120, h: 90 }, [[1300, 1080], [700, 1080]], 0.2, '220,228,245');
    K.blanketBody(g, 1290, 616, 0.8, { color: '#5a5a4e', hair: '#e8e4da' });
    K.noah(g, { x: 1000, y: 930, s: 0.6, view: 'side', pose: 'kneel', hunch: 1, outfit: JAKOB_PR(8), eyes: 'closed', headTilt: 0.18, t });
  } });
