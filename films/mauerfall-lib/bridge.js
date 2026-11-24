// BORNHOLMER STRASSE checkpoint + steel truss bridge over the railway cut (side-on). Needs light.js, tex.js, folk.js.
//   bornholmer(c, cam, t, o)  o: { tod: 'day' | 'night' }   road level y = 0 (Noah stands on it)
//   Layout x: checkpoint area -5200..600 (canopy, booths, barriers, tower, floodlight masts) | bridge from 900 eastwards → west.
//   bornProps(c, t, o): booths, barriers, signs, guards area props in world space. bornLight(c, cam, t, o) in `screen`.
const BH_P = {
  today: { sky: ['#8ab8e0', '#e4ecf0'], fog: '215,225,235', far: '#a8b8c4', steel: '#4c5a56', steelLt: '#6c7a76', ground: '#8a8680', lamp: 0 },
  day: { sky: ['#aeb4b6', '#dcdbd3'], fog: '200,204,202', far: '#9aa1a4', steel: '#4c5552', steelLt: '#6c7672', ground: '#7d7a74', lamp: 0 },
  night: { sky: ['#0e1322', '#2a3048'], fog: '30,36,60', far: '#2a2f44', steel: '#2a302e', steelLt: '#3e4644', ground: '#3a3a40', lamp: 1 },
};
const BH_BRIDGE_X = 900, BH_DECK = -60;
function trussBridge(c, x0, len, P, t) {
  // deck girder + two curved-top lattice trusses (we see the near one; the far one shows through, offset up)
  const H = 1700, deck = BH_DECK, S = [90, -150];
  const chord = k => deck - 260 - Math.sin(Math.PI * k) * (H - 260);
  const truss = (dx, dy, col, w) => {
    c.save(); c.translate(dx, dy);
    const n = 16, xs = k => x0 + k * len;
    c.beginPath(); for (let i = 0; i <= 60; i++) { const k = i / 60; i ? c.lineTo(xs(k), chord(k)) : c.moveTo(xs(k), chord(k)); } c.lineWidth = w * 2.2 + 6; c.strokeStyle = OUT; c.stroke(); c.lineWidth = w * 2.2; c.strokeStyle = col; c.stroke();
    line(c, [x0, deck - 60, x0 + len, deck - 60], w * 2 + 6); line(c, [x0, deck - 60, x0 + len, deck - 60], w * 2, col);
    for (let i = 0; i <= n; i++) { const k = i / n, x = xs(k); line(c, [x, deck - 60, x, chord(k)], w + 4); line(c, [x, deck - 60, x, chord(k)], w, col); if (i < n) { const k2 = (i + 1) / n, x2 = xs(k2); const d = i < n / 2 ? [x, deck - 60, x2, chord(k2)] : [x, chord(k), x2, deck - 60]; line(c, d, w * .8 + 4); line(c, d, w * .8, col); } }
    // rivet plates
    for (let i = 0; i <= n; i++) { const k = i / n; c.beginPath(); c.rect(xs(k) - 18, chord(k) - 14, 36, 28); fs(c, shade(col, .1), 2); }
    c.restore();
  };
  truss(S[0], S[1], dk(P.steel, .25), 16);
  // deck slab + sidewalk railings
  c.beginPath(); c.moveTo(x0 - 40, deck); c.lineTo(x0 + len, deck); c.lineTo(x0 + len, deck + 160); c.lineTo(x0 - 40, deck + 160); c.closePath(); fs(c, P.steel, 3);
  c.save(); c.beginPath(); c.rect(x0 - 40, deck, len + 40, 160); c.clip(); for (let x = x0; x < x0 + len; x += 120) { line(c, [x, deck, x, deck + 160], 3, 'rgba(0,0,0,.3)'); for (let y = deck + 20; y < deck + 160; y += 40) { circle(c, x + 20, y, 4); c.fillStyle = 'rgba(255,255,255,.2)'; c.fill(); } } streaks(c, x0, deck + 10, len, 150, 3, { a: .25, n: 80, col: '#3a2010' }); c.restore();
  c.beginPath(); c.moveTo(x0, deck); c.lineTo(x0 + len, deck); c.lineTo(x0 + len + S[0], deck + S[1]); c.lineTo(x0 + S[0], deck + S[1]); c.closePath(); fs(c, P.ground, 2);
  truss(0, 0, P.steel, 20);
  // rust bleeding + dirt on the near truss
  c.save(); c.globalAlpha = .35; for (let i = 0; i < 40; i++) { const k = rnd(i + 7), x = x0 + k * len; streaks(c, x - 10, chord(k), 20, 300, i, { a: .4, col: '#6a3a1a', n: 2 }); } c.restore();
}
function railCut(c, x0, x1, y0, y1, P, t) {
  // floor of the railway cut under the bridge; tracks run into the depth (vertical on the oblique ground)
  c.fillStyle = '#4e4a44'; c.fillRect(x0, y0, x1 - x0, y1 - y0); grain(c, x0, y0, x1 - x0, y1 - y0, .7, 1.4);
  for (let i = 0; i < 9; i++) { const tx = x0 + 500 + i * 640; if (tx > x1) break;
    c.fillStyle = '#5e5448'; c.fillRect(tx - 120, y0, 240, y1 - y0);
    for (let y = y0; y < y1; y += 46) { c.fillStyle = '#3a2e24'; c.fillRect(tx - 100, y, 200, 18); }
    for (const rx of [tx - 50, tx + 50]) { c.fillStyle = '#a6a8ac'; c.fillRect(rx - 5, y0, 10, y1 - y0); c.fillStyle = 'rgba(255,255,255,.5)'; c.fillRect(rx - 2, y0, 3, y1 - y0); }
    if (i % 2 === 0) { line(c, [tx + 260, y1, tx + 260, y0 - 1100], 18); line(c, [tx + 260, y1, tx + 260, y0 - 1100], 12, '#5a5e5c'); line(c, [tx + 260, y0 - 1000, tx - 200, y0 - 1000], 6, '#3a3e3c'); }
    line(c, [tx, y0 - 900, tx, y1], 2, 'rgba(30,30,30,.7)');
  }
  // retaining wall at the cut's edge (brick) + shadow
  c.save(); c.beginPath(); c.rect(x0, y0, 260, y1 - y0); c.clip(); brickFill(c, x0, y0, 260, y1 - y0, 5, { base: '#7a4636', soot: .3 }); c.restore();
  const g = c.createLinearGradient(x0 + 260, 0, x0 + 700, 0); g.addColorStop(0, 'rgba(10,10,10,.45)'); g.addColorStop(1, 'rgba(10,10,10,0)'); c.fillStyle = g; c.fillRect(x0 + 260, y0, 440, y1 - y0);
  leaves(c, x0, x1, y0, y1, 41, 50, { s: 1.4 });
  // depth: haze towards the far end of the cut, shadow under the bridge deck
  let hz = c.createLinearGradient(0, y0, 0, y0 + 600); hz.addColorStop(0, 'rgba(190,195,195,.45)'); hz.addColorStop(1, 'rgba(190,195,195,0)'); c.fillStyle = hz; c.fillRect(x0, y0, x1 - x0, 600);
  hz = c.createLinearGradient(0, BH_DECK + 160, 0, BH_DECK + 700); hz.addColorStop(0, 'rgba(10,10,12,.55)'); hz.addColorStop(1, 'rgba(10,10,12,0)'); c.fillStyle = hz; c.fillRect(x0 + 260, BH_DECK + 160, x1 - x0, 540);
}
function borderTower(c, x, y) {
  // concrete observation tower: square shaft, octagonal cab with windows, searchlight on the roof
  c.beginPath(); c.rect(x - 90, y - 1800, 180, 1800); fs(c, '#b7b3a8', 3); c.save(); c.beginPath(); c.rect(x - 90, y - 1800, 180, 1800); c.clip(); for (let k = 0; k < 9; k++) line(c, [x - 90, y - 200 * k, x + 90, y - 200 * k], 2, 'rgba(60,55,45,.4)'); grain(c, x - 90, y - 1800, 180, 1800, .6, 1); streaks(c, x - 90, y - 1800, 180, 1200, 3, { a: .2 }); c.fillStyle = 'rgba(0,0,0,.15)'; c.fillRect(x + 30, y - 1800, 60, 1800); c.restore();
  c.beginPath(); c.moveTo(x - 200, y - 1800); c.lineTo(x + 200, y - 1800); c.lineTo(x + 180, y - 2200); c.lineTo(x - 180, y - 2200); c.closePath(); fs(c, '#c9c5ba', 3);
  for (let k = 0; k < 4; k++) { glassPane(c, x - 170 + k * 88, y - 2140, 70, 160, { sky: ['#9aa6ac', '#3a4448'] }); c.beginPath(); c.rect(x - 170 + k * 88, y - 2140, 70, 160); fs(c, null, 2); }
  c.beginPath(); c.rect(x - 220, y - 2240, 440, 40); fs(c, '#8a8780', 3);
  c.beginPath(); c.rect(x - 40, y - 2310, 80, 70); fs(c, '#4a4e4c', 2.5); circle(c, x + 40, y - 2275, 30); fs(c, '#d8dad0', 2.5);
  line(c, [x + 140, y - 2240, x + 140, y - 2500], 5, '#3a3a3a');
}
function floodMast(c, x, y, on, h = 3300) {
  line(c, [x, y, x, y - h], 26, OUT); line(c, [x, y, x, y - h], 18, '#6a6e6c');
  c.beginPath(); c.rect(x - 200, y - h - 40, 400, 30); fs(c, '#4a4e4c', 2.5);
  for (let k = 0; k < 4; k++) { const lx = x - 160 + k * 106; c.beginPath(); c.rect(lx - 38, y - h - 120, 76, 70); fs(c, '#3a3e3c', 2.5); c.beginPath(); c.rect(lx - 30, y - h - 70, 60, 16); fs(c, on ? '#fff4c8' : '#d8d6c8', 2); if (on) bloom(c, lx, y - h - 60, 500, '255,230,160', .55); }
  if (on) { c.save(); c.globalCompositeOperation = 'screen'; const g = c.createLinearGradient(0, y - h, 0, y); g.addColorStop(0, 'rgba(255,225,160,.3)'); g.addColorStop(1, 'rgba(255,225,160,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(x - 160, y - h - 60); c.lineTo(x + 160, y - h - 60); c.lineTo(x + 1400, y + 80); c.lineTo(x - 1400, y + 80); c.closePath(); c.fill(); c.restore(); }
}
function controlBooth(c, x, y, o = {}) {
  // prefab control hut ~2,6 m high: grey-white panels, sliding window, roof overhang, a phone through the window
  const w = 440, h = 570;
  c.beginPath(); c.rect(x - w / 2, y - h, w, h); fs(c, '#d6d3c8', 3); c.save(); c.beginPath(); c.rect(x - w / 2, y - h, w, h); c.clip(); for (let k = 1; k < 5; k++) line(c, [x - w / 2 + k * w / 5, y - h, x - w / 2 + k * w / 5, y], 2, 'rgba(60,60,50,.35)'); grain(c, x - w / 2, y - h, w, h, .5, 1); streaks(c, x - w / 2, y - h + 30, w, 300, x, { a: .16 }); c.fillStyle = '#8a8a7e'; c.fillRect(x - w / 2, y - 120, w, 120); c.restore();
  glassPane(c, x - w / 2 + 50, y - h + 110, w - 100, 200, { sky: ['#9eaab0', '#3e484c'], lit: o.lit ? 'rgba(255,220,150,.6)' : null }); c.beginPath(); c.rect(x - w / 2 + 50, y - h + 110, w - 100, 200); fs(c, null, 3); line(c, [x, y - h + 110, x, y - h + 310], 6, '#cfcabe');
  c.beginPath(); c.rect(x - w / 2 - 40, y - h - 50, w + 80, 50); fs(c, '#6a6a64', 3);
  if (o.phone) { c.fillStyle = '#2a2a2a'; c.fillRect(x - 110, y - h + 250, 70, 40); }
}
function schlagbaum(c, x, y, open = 0, len = 1500) {
  // red-white barrier pole on a post with counterweight; open 0..1 lifts it
  c.beginPath(); c.rect(x - 50, y - 260, 100, 260); fs(c, '#5a5e5c', 3); c.beginPath(); c.rect(x - 70, y - 40, 140, 40); fs(c, '#4a4e4c', 2.5);
  c.save(); c.translate(x, y - 220); c.rotate(-open * 1.35);
  c.beginPath(); c.rect(-260, -28, 260, 56); fs(c, '#3a3e3c', 3);
  c.beginPath(); c.rect(0, -20, len, 40); fs(c, '#efeae0', 3); c.save(); c.beginPath(); c.rect(0, -20, len, 40); c.clip(); for (let k = 0; k < len / 120; k++) { c.fillStyle = '#c8322a'; c.fillRect(k * 240, -20, 120, 40); } c.restore();
  circle(c, len - 10, 0, 16); fs(c, '#c8322a', 2.5); c.restore();
  circle(c, x, y - 220, 22); fs(c, '#2a2a2a', 2);
}
function warnSign(c, x, y, lines, o = {}) {
  const w = o.w || 620, h = o.h || 60 + lines.length * 74;
  line(c, [x - w * .3, y, x - w * .3, y - h - 340], 12); line(c, [x + w * .3, y, x + w * .3, y - h - 340], 12);
  line(c, [x - w * .3, y, x - w * .3, y - h - 340], 7, '#6a6e6c'); line(c, [x + w * .3, y, x + w * .3, y - h - 340], 7, '#6a6e6c');
  c.beginPath(); c.rect(x - w / 2, y - h - 340, w, h); fs(c, o.bg || '#f0ece0', 4); c.beginPath(); c.rect(x - w / 2 + 12, y - h - 328, w - 24, h - 24); fs(c, null, 3, o.edge || '#b8322a');
  lines.forEach((s, i) => signText(c, s, x, y - h - 340 + 50 + i * 74 + (lines.length === 1 ? 6 : 0), i === 0 ? 54 : 44, i === 0 ? (o.head || '#b8322a') : '#1e1e1e'));
  c.save(); c.beginPath(); c.rect(x - w / 2, y - h - 340, w, h); c.clip(); streaks(c, x - w / 2, y - h - 300, w, h, x, { a: .14 }); c.restore();
}
function hinterlandWall(c, x0, x1, y) {
  // 3,6 m concrete slabs with the round pipe on top (grey, east side plain)
  const h = 790; c.fillStyle = '#b9b5aa'; c.fillRect(x0, y - h, x1 - x0, h);
  c.save(); c.beginPath(); c.rect(x0, y - h, x1 - x0, h); c.clip(); grain(c, x0, y - h, x1 - x0, h, .6, 1.3); for (let x = Math.floor(x0 / 264) * 264; x < x1; x += 264) { line(c, [x, y - h, x, y], 3, 'rgba(60,55,45,.5)'); streaks(c, x + 10, y - h + 40, 240, 500, x, { a: .14, n: 5 }); } soot(c, x0, y - h, x1 - x0, h, { top: .1, bottom: .3 }); c.restore();
  c.beginPath(); c.rect(x0, y - h, x1 - x0, h); fs(c, null, 3);
  c.beginPath(); c.rect(x0 - 10, y - h - 90, x1 - x0 + 20, 90); c.fillStyle = '#c9c5ba'; c.fill(); c.lineWidth = 3; c.strokeStyle = OUT; c.stroke(); c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(x0, y - h - 80, x1 - x0, 18); c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(x0, y - h - 24, x1 - x0, 20);
}
function signalFence(c, x0, x1, y, h = 550) {
  for (let x = Math.floor(x0 / 500) * 500; x < x1; x += 500) { line(c, [x, y, x, y - h - 40], 12); line(c, [x, y, x, y - h - 40], 7, '#6a6a66'); line(c, [x, y - h - 40, x + 60, y - h - 90], 6, '#4a4a46'); }
  c.save(); c.strokeStyle = 'rgba(50,52,50,.65)'; c.lineWidth = 1.6; for (let x = Math.floor(x0 / 40) * 40; x < x1; x += 40) { c.beginPath(); c.moveTo(x, y - h); c.lineTo(x + 40, y); c.moveTo(x + 40, y - h); c.lineTo(x, y); c.stroke(); } c.restore();
  for (let k = 0; k < 3; k++) line(c, [x0, y - h - 40 - k * 20, x1, y - h - 40 - k * 20], 2, '#3a3a38');
}
function bornholmer(c, cam, t, o = {}) {
  const P = BH_P[o.today ? 'today' : (o.tod || 'day')], HZ = -520, night = (o.tod || 'day') === 'night';
  c.setTransform(1, 0, 0, 1, 0, 0); let g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, P.sky[0]); g.addColorStop(1, P.sky[1]); c.fillStyle = g; c.fillRect(0, 0, W, H);
  // far skyline: east (left) grey roofs, west (right) brighter, taller, an advertising board; chimney smoke
  layerZ(c, cam, .12, c => {
    const b = baseZ(cam, HZ, .12), [x0, x1] = visXZ(cam, .12, 800);
    for (let i = Math.floor(x0 / 130); i * 130 < x1; i++) { const x = i * 130, west = x > 1500, slab = west && rnd(i + 9) > .9, h = slab ? 420 + rnd(i) * 140 : 170 + rnd(i + 3) * 150; c.fillStyle = west ? mixHex(P.far, '#c8b8a0', .25) : P.far; c.fillRect(x, b - h, 122, h); c.beginPath(); c.moveTo(x - 4, b - h); c.lineTo(x + 61, b - h - 40); c.lineTo(x + 126, b - h); c.fill(); if (rnd(i + 2) > .6) c.fillRect(x + 30, b - h - 60, 12, 40); for (let r = 0; r < h / 34 - 1; r++) for (let k = 0; k < 4; k++) { const lit = night && rnd(i * 31 + r * 7 + k) > (west ? .5 : .75); c.fillStyle = lit ? (west ? '#ffe0a0' : '#d8b070') : 'rgba(255,255,255,.12)'; if (lit || (!night && rnd(i * 31 + r * 7 + k) > .5)) c.fillRect(x + 10 + k * 28, b - h + 14 + r * 34, 11, 16); } }
    if (!night) for (let i = 0; i < 6; i++) { const sx = -6000 + i * 2600; for (let k = 0; k < 4; k++) { c.fillStyle = `rgba(200,200,196,${.22 - k * .04})`; circle(c, sx + k * 120, b - 1500 - k * 200, 120 + k * 60); c.fill(); } }
    c.save(); c.translate(5200, b - 640); c.beginPath(); c.rect(0, 0, 380, 110); fs(c, night ? '#3a5aa0' : '#d8b04a', 3); signText(c, 'Kaufhaus', 190, 55, 64, night ? '#fff4c8' : '#2a2a2a'); if (night) bloom(c, 190, 55, 400, '120,160,255', .4); c.restore();
  });
  haze(c, P.fog, .2);
  layerZ(c, cam, 1, c => {
    const [x0, x1] = visXZ(cam, 1, 600), BX = BH_BRIDGE_X;
    railCut(c, BX - 260, x1 + 600, HZ, 2400, P, t);
    const gx1 = Math.min(x1, BX - 260);
    // concrete apron with expansion joints, stains, kerbed traffic island, lane markings
    c.fillStyle = P.ground; c.fillRect(x0, HZ, gx1 - x0, 2900);
    for (let r = 0, y = HZ; y < 2400; r++) { const h = 120 + r * 14; line(c, [x0, y, gx1, y], 3, 'rgba(40,38,36,.45)'); for (let x = Math.floor(x0 / 700) * 700 + (r % 2) * 350; x < gx1; x += 700) line(c, [x, y, x, y + h], 3, 'rgba(40,38,36,.45)'); y += h; }
    mottle(c, x0, HZ, gx1 - x0, 2900, 77, { r: 160, a: .06 }); grain(c, x0, HZ, gx1 - x0, 2900, .6, 2);
    perChunk(x0, gx1, 700, (a, b, i) => { c.fillStyle = 'rgba(25,22,24,.22)'; ell(c, a + rnd(i + 40) * 700, HZ + 200 + rnd(i + 41) * 1500, 90 + rnd(i) * 70, 20); c.fill(); });
    perChunk(x0, gx1, 1400, (a, b, i) => puddle(c, a + rnd(i + 60) * 1400, HZ + 150 + rnd(i + 61) * 1500, 130, 24, i, {}));
    // island (raised kerb) for the booths
    c.fillStyle = '#8f8b82'; c.fillRect(-3300, -150, 2600, 260); c.fillStyle = '#b4b0a6'; c.fillRect(-3300, -170, 2600, 24); c.fillStyle = '#5f5c56'; c.fillRect(-3300, 110, 2600, 30); for (let x = -3300; x < -700; x += 200) line(c, [x, 110, x, 140], 2, '#3a3a38');
    for (const ly of [-330, 470, 1250]) for (let x = Math.floor(x0 / 600) * 600; x < gx1 - 300; x += 600) { c.fillStyle = 'rgba(240,238,228,.78)'; c.fillRect(x, ly, 300, 16); }
    c.fillStyle = 'rgba(245,242,232,.9)'; c.fillRect(-240, HZ + 20, 40, 2400);
    c.fillStyle = 'rgba(245,242,232,.85)'; c.beginPath(); c.moveTo(-1800, 820); c.lineTo(-1500, 820); c.lineTo(-1500, 790); c.lineTo(-1400, 840); c.lineTo(-1500, 890); c.lineTo(-1500, 860); c.lineTo(-1800, 860); c.closePath(); c.fill();
    leaves(c, x0, gx1, HZ, 2300, 31, 90, { s: 1.6 });
    // back: hinterland wall, signal fence, tower, floodlight masts
    if (o.today) { for (let x = Math.floor(x0 / 900) * 900; x < BX - 400; x += 900) { c.save(); bareTree(c, x, HZ + 40, { seed: x * .3, t, h: 900, trunk: 50, leaves: .9, bark: '#5a4a3a' }); c.restore(); } c.beginPath(); c.rect(-900, 140, 900, 60); fs(c, '#6a6a6a', 2); signText(c, '9. November 1989', -450, 170, 34, '#e8e4d8'); trussBridge(c, BX, 9000, P, t); return; }
    hinterlandWall(c, x0, -1300, HZ);
    signalFence(c, -1300, BX - 300, HZ + 20);
    borderTower(c, -2750, HZ + 10);
    floodMast(c, -1700, HZ + 20, night); floodMast(c, 450, HZ + 20, night);
    // control canopy over the lanes (back columns here, front columns in bornFront)
    const cx0 = -3200, cx1 = -500, ry = HZ - 1050;
    for (const px of [cx0 + 240, (cx0 + cx1) / 2 + 140, cx1 + 40]) { line(c, [px, HZ + 40, px, ry - 190], 26, OUT); line(c, [px, HZ + 40, px, ry - 190], 18, '#7a7e7c'); }
    c.beginPath(); c.moveTo(cx0, ry); c.lineTo(cx1, ry); c.lineTo(cx1 + 140, ry - 200); c.lineTo(cx0 + 140, ry - 200); c.closePath(); fs(c, '#9a9c98', 3); c.beginPath(); c.rect(cx0, ry, cx1 - cx0, 110); fs(c, '#d8d6ce', 3); streaks(c, cx0, ry + 110, cx1 - cx0, 160, 9, { a: .2, n: 40 });
    for (let x = cx0 + 200; x < cx1 - 100; x += 400) { c.beginPath(); c.rect(x, ry + 110, 160, 22); fs(c, night ? '#fff2c8' : '#e8e6dc', 2); if (night) bloom(c, x + 80, ry + 140, 380, '255,236,190', .45); }
    signText(c, 'Grenzübergangsstelle', (cx0 + cx1) / 2, ry + 56, 64, '#2a2a2a', { spacing: 4 });
    // bridge (far truss, deck, near truss)
    trussBridge(c, BX, 9000, P, t);
  });
}
function bornFront(c, t, o = {}) {
  // canopy front columns (drawn after the people standing behind them)
  const cx0 = -3200, cx1 = -500, ry = -520 - 1050;
  for (const px of [cx0 + 100, (cx0 + cx1) / 2, cx1 - 100]) { line(c, [px, 640, px, ry + 100], 30, OUT); line(c, [px, 640, px, ry + 100], 22, '#8a8e8c'); c.beginPath(); c.rect(px - 40, 600, 80, 50); fs(c, '#6a6e6c', 2.5); }
}
function bornProps(c, t, o = {}) {
  const night = (o.tod || 'day') === 'night';
  controlBooth(c, -2500, -10, { phone: true, lit: night });
  controlBooth(c, -1400, 30, { lit: night });
  warnSign(c, 650, -380, ['Halt!', 'Grenzübergang'], { w: 560 });
  warnSign(c, -400, -420, ['Halt!', 'Passkontrolle'], { w: 560 });
  warnSign(c, -3700, -380, ['Fahrzeuge', 'Schritt fahren'], { w: 560, head: '#1e1e1e', edge: '#1e1e1e' });
  schlagbaum(c, -120, 250, o.barrier || 0, 1300);
  // steel lane barriers on the bridge approach
  for (let k = 0; k < 3; k++) { const bx = 1300 + k * 520, by = 160; c.beginPath(); c.rect(bx - 200, by - 120, 400, 120); fs(c, '#c8322a', 3); c.save(); c.beginPath(); c.rect(bx - 200, by - 120, 400, 120); c.clip(); for (let i = -2; i < 6; i++) { c.fillStyle = '#efeae0'; c.beginPath(); c.moveTo(bx - 200 + i * 100, by - 120); c.lineTo(bx - 150 + i * 100, by - 120); c.lineTo(bx - 170 + i * 100, by); c.lineTo(bx - 220 + i * 100, by); c.closePath(); c.fill(); } c.restore(); c.beginPath(); c.rect(bx - 200, by - 120, 400, 120); fs(c, null, 3); for (const s of [-1, 1]) line(c, [bx + s * 170, by, bx + s * 170, by + 50], 10); }
  if (o.cars !== false) { trabi(c, -2950, { y: 560, col: '#b3cdb6', s: 1, idle: true, t, driver: true }); }
}
function bornLight(c, cam, t, o = {}) {
  const night = (o.tod || 'day') === 'night';
  if (night) grade(c, { sx: .3, sy: .1, warm: '255,210,140', warmA: .3, cool: '10,15,50', coolA: .45 });
  else { grade(c, { sx: .2, sy: 0, warm: '255,245,225', warmA: .12, cool: '40,50,60', coolA: .22 }); c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'saturation'; c.fillStyle = 'rgba(128,128,128,.22)'; c.fillRect(0, 0, W, H); c.restore(); }
}
