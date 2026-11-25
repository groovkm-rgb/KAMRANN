// KARTELL film: screen-space insert shots, evidence board, title, stairs diagram, Gewinn tag. All text German.
function deskBG(c, col = '#3a2a20', seed = 1, lamp = [1500, 120]) { c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = col; c.fillRect(0, 0, W, H); for (let i = 0; i < 40; i++) { c.fillStyle = i % 2 ? 'rgba(0,0,0,.1)' : 'rgba(255,220,180,.04)'; c.fillRect(0, i * 28 + Math.sin(i + seed) * 6, W, 14); } if (lamp) bloom(c, lamp[0], lamp[1], 1000, '255,214,150', .35); }
function vign(c, a = .55) { const v = c.createRadialGradient(W / 2, H / 2, 300, W / 2, H / 2, 1150); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(5,5,10,${a})`); c.fillStyle = v; c.fillRect(0, 0, W, H); }
function push(c, lt, k = .03, cx = W / 2, cy = H / 2) { const z = 1 + lt * k; c.translate(cx, cy); c.scale(z, z); c.translate(-cx, -cy); }
// ---------- the first carton of cigarettes (plain, no brand) on a car bonnet / table ----------
function cartonShot(c, lt, t, o = {}) {
  if (o.sepia) c.filter = 'sepia(.8) contrast(1.05)';
  c.setTransform(1, 0, 0, 1, 0, 0); const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, o.night ? '#2a3050' : '#e8a070'); g.addColorStop(.6, o.night ? '#4a4a60' : '#f4d0a0'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  for (let i = 0; i < 6; i++) { const bx = i * 340 - 60, bh = 300 + rnd(i) * 200; c.fillStyle = 'rgba(120,100,110,.55)'; c.fillRect(bx, 560 - bh, 300, bh); for (let r = 0; r < 6; r++) for (let q = 0; q < 4; q++) if (rnd(i * 40 + r * 4 + q) > .5) { c.fillStyle = 'rgba(255,220,150,.6)'; c.fillRect(bx + 20 + q * 70, 580 - bh + r * 50, 30, 24); } }
  c.save(); push(c, lt, .04); const cg = c.createLinearGradient(0, 560, 0, H); cg.addColorStop(0, '#9a3a30'); cg.addColorStop(1, '#5a1a16'); c.fillStyle = cg; c.fillRect(-100, 560, W + 200, 600); c.fillStyle = 'rgba(255,230,200,.35)'; c.fillRect(-100, 560, W + 200, 20); kStain(c, 300, 800, 160, 60, 'rgba(120,60,20,.6)', 2); // rusty bonnet
  c.save(); c.translate(960, 760); c.rotate(-.06); c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(-380, -40, 780, 120);
  c.beginPath(); c.moveTo(-400, -150); c.lineTo(400, -150); c.lineTo(400, 60); c.lineTo(-400, 60); c.closePath(); fs(c, '#ece8e0', 5); c.beginPath(); c.moveTo(-400, -150); c.lineTo(-340, -210); c.lineTo(460, -210); c.lineTo(400, -150); c.closePath(); fs(c, '#f8f6f0', 5); c.beginPath(); c.moveTo(400, -150); c.lineTo(460, -210); c.lineTo(460, 0); c.lineTo(400, 60); c.closePath(); fs(c, '#c8c4bc', 5);
  kRect(c, -360, -120, 360, 150, '#1e1e22', 3); c.font = '800 26px Inter'; c.fillStyle = '#fff'; c.textAlign = 'center'; c.fillText('Rauchen', -180, -60); c.fillText('ist tödlich', -180, -24); kRect(c, 60, -120, 300, 40, '#c8c4bc', 0); for (let i = 0; i < 9; i++) line(c, [-400 + i * 100, -150, -400 + i * 100, 60], 2, 'rgba(0,0,0,.08)');
  c.restore(); c.restore(); c.filter = 'none'; vign(c, .5);
}
// ---------- macro product shots of fakes (invented logos only) ----------
function fakeMacro(c, lt, t, kind) {
  deskBG(c, ['#2a2a30', '#3a2a20', '#20262e', '#3a3040'][['shoe', 'bag', 'watch', 'perfume'].indexOf(kind)] || '#2a2a30', 3, [960, 200]);
  c.fillStyle = 'rgba(255,255,255,.06)'; c.beginPath(); c.ellipse(960, 860, 700, 120, 0, 0, Math.PI * 2); c.fill();
  c.save(); push(c, lt, .05); const r = Math.sin(lt * 1.5) * .03;
  if (kind === 'shoe') { c.translate(960, 820); c.rotate(r); fakeShoe(c, 0, 0, 5.5); c.font = '900 64px Inter'; c.fillStyle = '#2a6fd6'; c.textAlign = 'center'; c.fillText('VOLTA', -30, -180); }
  if (kind === 'bag') { c.translate(960, 900); c.rotate(r); fakeBag(c, 0, 0, 4); }
  if (kind === 'watch') { c.translate(960, 560); c.rotate(r + .3); fakeWatch(c, 0, 0, 4.2); }
  if (kind === 'perfume') { c.translate(960, 900); fakePerfume(c, 0, 0, 4.5); }
  c.restore(); bloom(c, 760, 300, 260, '255,255,255', .25); vign(c);
}
function hazardShot(c, lt, t, kind) { // broken toy / brake part / pills, with a red marker warning
  deskBG(c, '#d8d4cc', 7, [600, 200]); for (let i = 0; i < 20; i++) line(c, [0, i * 56, W, i * 56], 1, 'rgba(0,0,0,.05)');
  c.save(); push(c, lt, .04);
  if (kind === 'toy') { c.save(); c.translate(860, 640); c.rotate(-.2); kRect(c, -160, -120, 320, 240, '#e05a4a', 5); kRect(c, -120, -200, 240, 90, '#f2c531', 5); for (const d of [-110, 110]) { circle(c, d, 140, 60); fs(c, '#2a2a2e', 5); } c.restore(); c.save(); c.translate(1260, 760); c.rotate(.9); circle(c, 0, 0, 60); fs(c, '#2a2a2e', 5); c.restore(); line(c, [940, 520, 990, 600, 950, 680], 6, '#1a1a1a'); for (let i = 0; i < 5; i++) { circle(c, 700 + i * 30, 840, 8); c.fillStyle = '#9a3ad0'; c.fill(); } }
  if (kind === 'brake') { c.save(); c.translate(960, 560); circle(c, 0, 0, 300); fs(c, '#8a8e94', 6); circle(c, 0, 0, 230); fs(c, '#a8acb2', 3); circle(c, 0, 0, 110); fs(c, '#6a6e74', 4); for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; circle(c, Math.cos(a) * 70, Math.sin(a) * 70, 14); fs(c, '#2a2a2e', 2); } line(c, [120, -200, 160, -60, 140, 40, 190, 170], 7, '#1a1a1a'); kStain(c, -150, 120, 90, 50, 'rgba(150,70,20,.6)', 3); c.restore(); }
  if (kind === 'pills') { for (let k = 0; k < 2; k++) { c.save(); c.translate(760 + k * 420, 560); c.rotate(-.15 + k * .3); c.beginPath(); c.roundRect(-180, -300, 360, 600, 30); c.fillStyle = 'rgba(220,228,236,.85)'; c.fill(); c.lineWidth = 5; c.strokeStyle = OUT; c.stroke(); for (let r = 0; r < 5; r++) for (let q = 0; q < 2; q++) { c.beginPath(); c.ellipse(-70 + q * 140, -220 + r * 110, 50, 34, 0, 0, Math.PI * 2); fs(c, k ? '#e8e0d0' : '#f4f2ee', 3); } c.restore(); } }
  c.restore();
  markerEllipse(c, 960, 600, 420, 330, clamp((lt - .3) / .8)); markerText(c, kind === 'toy' ? 'Giftig' : kind === 'brake' ? 'Lebensgefahr' : 'Gefälscht', 1220, 1000, 80, clamp((lt - .9) / .6), { rot: -.06 });
  c.beginPath(); c.moveTo(1640, 150); c.lineTo(1760, 360); c.lineTo(1520, 360); c.closePath(); fs(c, '#ffd42a', 6); c.font = '900 120px Inter'; c.fillStyle = '#1a1a1a'; c.textAlign = 'center'; c.fillText('!', 1640, 345);
}
// ---------- evidence board: photos, red strings, cards; o.cross = indices crossed; o.note = marker note ----------
function polaroid(c, x, y, rot, draw, cap) { c.save(); c.translate(x, y); c.rotate(rot); c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(-92, -102, 196, 240); kRect(c, -100, -110, 200, 240, '#f8f6f0', 2); c.save(); c.beginPath(); c.rect(-86, -96, 172, 160); c.clip(); c.fillStyle = '#8a8c90'; c.fillRect(-86, -96, 172, 160); draw(c); c.restore(); if (cap) { c.font = "700 20px 'Courier 10 Pitch', monospace"; c.fillStyle = '#2a2a2e'; c.textAlign = 'center'; c.fillText(cap, 0, 108); } circle(c, 0, -100, 10); c.fillStyle = '#c8302a'; c.fill(); c.restore(); }
const PHOTO = {
  lager: c => { c.fillStyle = '#a8b0b8'; c.fillRect(-86, -96, 172, 160); for (let k = 0; k < 6; k++) line(c, [-86, -60 + k * 20, 86, -60 + k * 20], 2, '#7a848e'); kRect(c, -40, -10, 80, 74, '#5a646e', 1); },
  noah: c => { c.fillStyle = '#d8d4cc'; c.fillRect(-86, -96, 172, 160); drawNoahHead(c, 0, -10, .22, { lid: .2, mouth: 'flat' }); },
  kumpel: c => { c.fillStyle = '#c8c0b0'; c.fillRect(-86, -96, 172, 160); c.save(); c.translate(0, 300 * .22 - 30); person(c, { who: 'kumpel', x: 0, y: 270, k: .22 }); c.restore(); },
  rival: c => { c.fillStyle = '#b8c0c8'; c.fillRect(-86, -96, 172, 160); person(c, { who: 'rival', x: 0, y: 240, k: .22, expr: { mouth: 'smile', lid: .3 } }); },
  hafen: c => { const g = c.createLinearGradient(0, -96, 0, 64); g.addColorStop(0, '#8ab0cc'); g.addColorStop(1, '#e4e8e4'); c.fillStyle = g; c.fillRect(-86, -96, 172, 160); for (let i = 0; i < 6; i++) container(c, -86 + i * 30, 64, 28, 40 + (i % 2) * 30, ['#c8302a', '#2f6fb0', '#e8a030'][i % 3]); },
  kiosk: c => { c.fillStyle = '#d8c8a8'; c.fillRect(-86, -96, 172, 160); kRect(c, -70, -80, 140, 30, '#2f6fb0', 1); kRect(c, -60, -40, 80, 70, '#ffd98a', 1); },
  sil: c => { c.fillStyle = '#9a9aa0'; c.fillRect(-86, -96, 172, 160); person(c, { who: 'guard', x: 0, y: 260, k: .22 }); },
  fahrer: c => { c.fillStyle = '#a0a8b0'; c.fillRect(-86, -96, 172, 160); c.save(); c.translate(0, 40); c.scale(.12, .12); suv(c, 0, {}); c.restore(); },
};
function boardShot(c, lt, t, o = {}) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#8a6a48'; c.fillRect(0, 0, W, H); for (let i = 0; i < 900; i++) { c.fillStyle = `rgba(${rnd(i) > .5 ? '60,40,20' : '200,170,120'},.25)`; c.fillRect(rnd(i + 3) * W, rnd(i + 7) * H, 3, 3); }
  kRect(c, 0, 0, W, 30, '#5a4028', 0); kRect(c, 0, H - 30, W, 30, '#5a4028', 0);
  c.save(); const pan = o.pan ?? 0; c.translate(-pan * lt * 40, 0); push(c, lt, o.zoom ?? .03, o.cx ?? W / 2, o.cy ?? H / 2);
  if (o.items && o.items.length <= 3) { const s0 = o.items.length === 1 ? 2.1 : 1.35; c.translate(W / 2, H / 2 - 40); c.scale(s0, s0); c.translate(-W / 2, -H / 2 + 60); }
  const items = o.items || [['noah', 420, 330, -.05, '?'], ['kumpel', 820, 300, .04, 'Kumpel'], ['lager', 1220, 340, -.03, 'Lager'], ['kiosk', 1600, 320, .05, 'Kiosk'], ['hafen', 620, 720, .03, 'Hafen'], ['rival', 1040, 740, -.04, '?'], ['sil', 1440, 720, .02, 'Bande']];
  const pos = items.map(i => [i[1], i[2] - 100]);
  c.lineWidth = 4; c.strokeStyle = '#c8202a'; for (const [a, b] of o.strings || [[0, 1], [1, 2], [1, 4], [4, 6], [5, 6], [2, 3]]) { c.beginPath(); c.moveTo(pos[a][0], pos[a][1]); c.quadraticCurveTo((pos[a][0] + pos[b][0]) / 2, (pos[a][1] + pos[b][1]) / 2 + 40, pos[b][0], pos[b][1]); c.stroke(); }
  items.forEach(([k, x, y, r, cap], i) => polaroid(c, x, y, r, PHOTO[k], (o.caps && o.caps[i]) || cap));
  for (const [x, y, s, rot] of o.cards || [[180, 900, 'BEWEISMITTEL', -.04], [1720, 900, 'AKTE', .05]]) { c.save(); c.translate(x, y); c.rotate(rot); kRect(c, -130, -50, 260, 100, '#f4f0e6', 2); c.font = "700 24px 'Courier 10 Pitch', monospace"; c.fillStyle = '#2a2a2e'; c.textAlign = 'center'; c.fillText(s, 0, 8); c.restore(); }
  (o.cross || []).forEach(([i, word], j) => { const [x, y] = [items[i][1], items[i][2]], k = clamp((lt - .3 - j * .5) / .4); markerLine(c, [x - 90, y - 100, x + 90, y + 110], k, { w: 12 }); markerLine(c, [x + 90, y - 100, x - 90, y + 110], clamp(k * 2 - 1), { w: 12 }); markerText(c, word, x - 90, y + 170, 46, clamp((lt - .5 - j * .5) / .4)); });
  if (o.note) markerText(c, o.note[0], o.note[1], o.note[2], o.note[3] || 70, clamp((lt - (o.noteT ?? .4)) / .8), { rot: -.05 });
  if (o.link) { const k = clamp((lt - .2) / .8); markerLine(c, [pos[o.link[0]][0], pos[o.link[0]][1] + 260, pos[o.link[1]][0], pos[o.link[1]][1] + 260], k, { w: 8 }); }
  c.restore(); vign(c, .45); bloom(c, 600, 0, 900, '255,220,170', .2);
}
// ---------- title page ----------
function titleShot(c, lt, t) {
  dossierDesk(c, t); paperSheet(c, 420, 140, 1080, 800, -.01, 9);
  c.save(); c.translate(960, 540); c.rotate(-.01);
  c.font = "700 30px 'Courier 10 Pitch', monospace"; c.fillStyle = '#3a3634'; c.textAlign = 'center'; c.fillText('ERMITTLUNGSAKTE · FIKTION', 0, -280);
  c.fillStyle = 'rgba(40,36,34,.6)'; c.fillRect(-420, -250, 840, 3);
  const k = clamp(lt / 1.6); const ttl = ['Was wäre, wenn du', 'ein Kartell aufgebaut', 'hättest?']; ttl.forEach((s, i) => { const kk = clamp(k * 3 - i); c.globalAlpha = kk; c.font = '800 78px Inter'; c.fillStyle = '#1e1c1e'; c.fillText(s, 0, -120 + i * 100 + (1 - kk) * 10); }); c.globalAlpha = 1;
  c.restore(); markerEllipse(c, 1180, 650, 230, 90, clamp((lt - 2) / .8)); markerText(c, 'Kein Zurück', 1180, 830, 64, clamp((lt - 2.6) / .8), { rot: -.06 }); vign(c, .4);
}
// ---------- T4 Die Treppe (no numbers): steps with labels, small Noah figure on step `step` ----------
const TREPPE = ['Zigaretten', 'Fälschungen', 'Gebiet', 'Gewalt', 'Drogen', 'Flucht', 'Gefängnis'];
function treppeShot(c, lt, t, o = {}) {
  dossierDesk(c, t); paperSheet(c, 220, 90, 1480, 900, -.008, 11);
  c.save(); c.translate(220, 90); typeText(c, 'ERMITTLUNGSAKTE', 80, 90, 28, 1, { bold: true, seed: 1 }); typeText(c, 'Die Treppe', 80, 160, 44, 1, { bold: true, seed: 4 });
  const n = TREPPE.length, sw = 180, sh = 90, x0 = 150, y0 = 260;
  for (let i = 0; i < n; i++) { const x = x0 + i * sw, y = y0 + i * sh; c.fillStyle = i <= (o.upto ?? 6) ? 'rgba(40,36,34,.9)' : 'rgba(40,36,34,.25)'; c.fillRect(x, y, sw, 6); c.fillRect(x + sw - 6, y, 6, sh); typeText(c, TREPPE[i], x + 8, y - 16, 26, 1, { seed: 20 + i, col: i === n - 1 ? '160,30,30' : '28,26,30' }); }
  const st = o.step ?? 0, from = o.from ?? st, k = ease(clamp((lt - .4) / 1.2)), sx = lerp(from, st, k), px = x0 + sx * sw + sw * .55, py = y0 + sx * sh - Math.sin(k * Math.PI) * 30 * (st !== from);
  drawNoahK(c, { x: px, y: py, k: .09, ink: 1.6, outfit: o.outfit || 'aufstieg', expr: o.expr || KX.serious });
  if (o.final) { markerEllipse(c, x0 + 6 * sw + 90, y0 + 6 * sh - 30, 160, 60, clamp((lt - .5) / .8)); markerText(c, 'Kleine Schritte', 760, 820, 64, clamp((lt - 1.2) / .8), { rot: -.05 }); }
  c.restore(); vign(c, .4);
}
// ---------- three options written by marker; third circled ----------
function optionsShot(c, lt, t) {
  dossierDesk(c, t); paperSheet(c, 460, 140, 1000, 800, .01, 13);
  c.save(); c.translate(460, 140); typeText(c, 'Entscheidung', 90, 110, 40, 1, { bold: true, seed: 2 });
  ['Aufhören', 'Zahlen', 'Wehren'].forEach((s, i) => markerText(c, (i + 1 > 0 ? '' : '') + s, 180, 300 + i * 170, 92, clamp((lt - .2 - i * .6) / .5), { col: '#1e2a4a', rot: -.03 }));
  markerEllipse(c, 390, 610, 260, 90, clamp((lt - 2.2) / .6)); c.restore(); vign(c, .4);
}
// ---------- team grows: split screen with crew silhouettes (no digits) ----------
function teamShot(c, lt, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#1a1c20'; c.fillRect(0, 0, W, H);
  const n = lt < .8 ? 5 : lt < 1.6 ? 10 : 20, cols = 3;
  for (let pnl = 0; pnl < cols; pnl++) { const x0 = pnl * 640 + 8, on = pnl <= (lt < .8 ? 0 : lt < 1.6 ? 1 : 2); c.save(); c.beginPath(); c.rect(x0, 8, 624, H - 16); c.clip(); c.fillStyle = on ? ['#3a4048', '#40464e', '#464c54'][pnl] : '#202226'; c.fillRect(x0, 0, 640, H);
    if (on) { const m = [5, 10, 20][pnl]; for (let i = 0; i < m; i++) { const r = Math.floor(i / 7), q = i % 7; person(c, { who: ['worker', 'friend1', 'friend2', 'kumpel'][i % 4], x: x0 + 70 + q * 82 + (r % 2) * 40, y: 1000 - r * 90, k: .14 + r * -.02, sil: 1, top: ['#0e1014', '#16181c', '#1e2024'][r % 3] }); } }
    c.restore(); }
  vign(c, .4);
}
// ---------- Gewinn tag (fiction) in a corner; level 0..1 or 'haft' ----------
function gewinnTag(c, level, mode = 'gewinn', a = 1) {
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = a; c.translate(1560, 60); c.rotate(.02);
  c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(6, 8, 310, 150); kRect(c, 0, 0, 310, 150, '#f4f0e6', 2.5); c.font = "700 24px 'Courier 10 Pitch', monospace"; c.fillStyle = '#2a2a2e'; c.textAlign = 'left';
  if (mode === 'haft') { c.fillText('ERGEBNIS', 20, 40); c.font = '800 46px Inter'; c.fillStyle = '#c8202a'; c.fillText('Haft: ? Jahre', 20, 110); }
  else { c.fillText('GEWINN  €', 20, 40); kRect(c, 20, 66, 270, 34, '#e4dccb', 1.5); c.fillStyle = '#3a8a4a'; c.fillRect(22, 68, 266 * clamp(level), 30); c.font = "700 18px 'Courier 10 Pitch', monospace"; c.fillStyle = '#c8202a'; c.fillText('Fiktion', 20, 130); }
  c.restore();
}
// ---------- quick symbolic violence (off-screen): glass breaks, door slams, empty chair, phone falls ----------
function glassShot(c, lt, t) { c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#10141c'; c.fillRect(0, 0, W, H); for (let i = 0; i < 6; i++) { c.fillStyle = ['rgba(255,60,160,.25)', 'rgba(60,200,255,.2)'][i % 2]; c.beginPath(); c.arc(300 + i * 300, 300, 200, 0, Math.PI * 2); c.fill(); }
  const k = clamp(lt / .15); kRect(c, 360, 120, 1200, 840, null, 12, '#2a2c30'); c.fillStyle = 'rgba(180,210,230,.15)'; c.fillRect(360, 120, 1200, 840);
  if (k > 0) { c.strokeStyle = 'rgba(230,240,255,.9)'; c.lineWidth = 4; for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2 + rnd(i); c.beginPath(); c.moveTo(960, 540); let x = 960, y = 540; for (let s = 0; s < 5; s++) { x += Math.cos(a + (rnd(i * 9 + s) - .5) * .5) * 120 * k; y += Math.sin(a + (rnd(i * 9 + s) - .5) * .5) * 120 * k; c.lineTo(x, y); } c.stroke(); } for (let i = 0; i < 30; i++) { const a = rnd(i + 50) * Math.PI * 2, d = lt * 900 * rnd(i); c.save(); c.translate(960 + Math.cos(a) * d, 540 + Math.sin(a) * d + lt * lt * 600); c.rotate(i + lt * 8); c.fillStyle = 'rgba(200,225,240,.8)'; c.beginPath(); c.moveTo(0, -14); c.lineTo(12, 10); c.lineTo(-10, 8); c.fill(); c.restore(); } }
  vign(c, .6); }
function doorSlamShot(c, lt, t) { c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#16181c'; c.fillRect(0, 0, W, H); const k = ease(clamp(lt / .5)), gap = 700 * (1 - k);
  c.fillStyle = '#f4e0b0'; c.fillRect(960 - gap / 2, 100, gap, 880); bloom(c, 960, 540, 500 * (1 - k) + 50, '255,210,150', .5); person(c, { who: 'guard', x: 960, y: 980, k: .5, alpha: .9 });
  kRect(c, 960 + gap / 2, 100, 900, 880, '#2a2420', 4); kRect(c, 960 - gap / 2 - 900, 100, 900, 880, '#2a2420', 4); kRect(c, 960 + gap / 2 + 40, 520, 30, 120, '#b8954a', 2); vign(c, .6); }
function emptyChairShot(c, lt, t) { c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#20242a'; c.fillRect(0, 0, W, H); c.fillStyle = '#2c3038'; c.fillRect(0, 700, W, 380);
  c.save(); c.globalCompositeOperation = 'screen'; const g = c.createLinearGradient(0, 0, 0, 900); g.addColorStop(0, 'rgba(220,230,255,.35)'); g.addColorStop(1, 'rgba(220,230,255,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(860, 0); c.lineTo(1060, 0); c.lineTo(1300, 900); c.lineTo(620, 900); c.fill(); c.restore();
  c.save(); c.translate(960, 900); c.rotate(.05); kRect(c, -150, -300, 300, 30, '#6a5040', 4); kRect(c, -150, -620, 30, 340, '#6a5040', 4); kRect(c, 120, -620, 30, 340, '#6a5040', 4); for (let k = 0; k < 3; k++) kRect(c, -150, -600 + k * 90, 300, 26, '#7a6050', 3); for (const d of [-140, 120]) kRect(c, d, -270, 24, 270, '#6a5040', 3); c.restore();
  c.save(); c.translate(1300, 980); c.rotate(.4); c.beginPath(); c.roundRect(-60, -110, 120, 220, 20); fs(c, '#1e2026', 4); c.restore(); vign(c, .6); }
function phoneFallShot(c, lt, t) { c.setTransform(1, 0, 0, 1, 0, 0); marbleBG(c, 0, 0, W, H, '#2e2f34', 29); const y = Math.min(640, -200 + lt * lt * 2600), rot = lt * 4; c.save(); c.translate(960, y); c.rotate(rot); c.beginPath(); c.roundRect(-110, -220, 220, 440, 34); fs(c, '#16181c', 5); c.beginPath(); c.roundRect(-96, -206, 192, 412, 26); c.fillStyle = '#3a6a9a'; c.fill(); c.restore(); if (y >= 640) { line(c, [900, 600, 980, 660, 1020, 610], 4, 'rgba(255,255,255,.7)'); } vign(c, .5); }
// ---------- deal symbols: car drives away at dusk (no faces, no goods visible) ----------
function carAwayShot(c, lt, t) { c.setTransform(1, 0, 0, 1, 0, 0); const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#3a4a7a'); g.addColorStop(1, '#e8906a'); c.fillStyle = g; c.fillRect(0, 0, W, H); for (let i = 0; i < 12; i++) { c.fillStyle = '#2a2a3a'; c.fillRect(i * 170, 600 - rnd(i) * 300, 160, 600); }
  c.fillStyle = '#3a3a40'; c.fillRect(0, 760, W, 320); const x = 700 + lt * 900, s = .3 - lt * .05; c.save(); c.translate(x, 900); c.scale(s, s); suv(c, 0, { color: '#16171a' }); c.restore(); for (const d of [-1, 1]) { circle(c, x - 230 * s * 5 * .1 + d * 0, 870, 0); } c.fillStyle = 'rgba(255,40,40,.8)'; c.fillRect(x - 330 * s, 870 - 260 * s, 16, 16); bloom(c, x - 330 * s, 870 - 250 * s, 80, '255,40,40', .6); vign(c, .5); }
// ---------- boots on wet asphalt at dawn ----------
function bootsShot(c, lt, t) { c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#3a4250'; c.fillRect(0, 0, W, H); c.fillStyle = '#2a3038'; c.fillRect(0, 640, W, 440); for (let i = 0; i < 20; i++) { c.fillStyle = `rgba(${Math.sin(t * 9 + i) > 0 ? '80,120,255' : '140,160,200'},.15)`; c.beginPath(); c.ellipse(rnd(i) * W, 700 + rnd(i + 3) * 340, 140, 20, 0, 0, Math.PI * 2); c.fill(); }
  for (let i = 0; i < 4; i++) { const x = ((lt * 900 + i * 480) % 2400) - 300, up = Math.max(0, Math.sin(lt * 14 + i * 1.6)) * 60; c.save(); c.translate(x, 780 - up); kRect(c, -60, -500, 120, 420, '#1a1e24', 4); c.beginPath(); c.moveTo(-70, -80); c.lineTo(80, -80); c.quadraticCurveTo(200, -60, 210, 0); c.lineTo(-70, 0); c.closePath(); fs(c, '#0e1014', 4); kRect(c, -74, -10, 290, 20, '#22262c', 2); c.restore(); }
  vign(c, .55); c.fillStyle = 'rgba(60,80,140,.15)'; c.fillRect(0, 0, W, H); }
// ---------- handcuffs closing (on Noah's suit sleeves, no detailed hands) ----------
function cuffsShot(c, lt, t) { c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#4a5260'; c.fillRect(0, 0, W, H); c.fillStyle = 'rgba(60,80,140,.25)'; c.fillRect(0, 0, W, H);
  for (const s of [-1, 1]) { nLine(c, [960 + s * 900, 700 + s * 60, 960 + s * 160, 560], 220, NOAH.out); nLine(c, [960 + s * 900, 700 + s * 60, 960 + s * 160, 560], 196, OUTFIT.boss.coat); nLine(c, [960 + s * 170, 560, 960 + s * 120, 555], 150, NOAH.skin); }
  const k = ease(clamp((lt - .2) / .3)); for (const s of [-1, 1]) { c.save(); c.translate(960 + s * 120, 555); c.beginPath(); c.arc(0, 0, 95, Math.PI * (s < 0 ? .1 : 1.1), Math.PI * (s < 0 ? .1 : 1.1) + Math.PI * (1.2 + .8 * k)); c.lineWidth = 34; c.strokeStyle = OUT; c.stroke(); c.lineWidth = 22; c.strokeStyle = '#b8bcc4'; c.stroke(); c.restore(); }
  for (let i = 0; i < 4; i++) { ell(c, 930 + i * 20, 555, 14, 22); c.lineWidth = 10; c.strokeStyle = '#9aa0a8'; c.stroke(); } vign(c, .55); }
// ---------- cell door closes ----------
function cellDoorShot(c, lt, t) { c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#c8c6bc'; c.fillRect(0, 0, W, H); c.fillStyle = '#9aa294'; c.fillRect(0, 760, W, 320); const k = easeIn(clamp(lt / .6)), x = lerp(1500, 520, k);
  c.fillStyle = '#5a5e62'; c.fillRect(520, 80, 880, 1000); kRect(c, x, 80, 880, 1000, '#6a6e72', 5); kRect(c, x + 300, 380, 280, 100, '#3a3c40', 3); for (let i = 0; i < 6; i++) { circle(c, x + 40, 140 + i * 160, 12); c.fillStyle = '#4a4e52'; c.fill(); } kRect(c, x + 760, 540, 60, 120, '#9aa0a6', 3); vign(c, .5); }
