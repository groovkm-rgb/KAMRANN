// T1–T12 + extra charts, all "old parchment and brush" (screen space). lt = time since the shot start.
function parchmentBG(c, seed = 5, z = 1) { fill(c, '#3a2a1c'); c.save(); c.translate(960, 540); c.scale(z, z); c.translate(-960, -540); washi(c, 40, 40, W - 80, H - 80, { shadow: 0, seed }); }
function tableTitle(c, s, lt, ch = 'S', t0 = .15) { const w = brushText(c, s, 120, 170, 72, seg(lt, t0, t0 + .5)); hanko(c, 120 + (w || 400) + 60, 142, 70, seg(lt, t0 + .55, t0 + .8), ch); }
function rowIn(lt, t0, d = .4) { return seg(lt, t0, t0 + d); }
// T1 — timeline (focus: 'war' marks 1467–1600 red, 'peace' lights up 1603–1868)
function tZeitleiste(c, lt, o = {}) {
  parchmentBG(c, 5, 1 + lt * .01);
  const fast = o.fast ? .4 : 1;
  tableTitle(c, 'Zeitleiste', lt, 'Z');
  const X = y => lerp(200, 1720, (y - 1440) / (1900 - 1440)), Y = 560;
  brushPath(c, [150, Y, 960, Y + 6, 1790, Y - 4], seg(lt, .3 * fast, 1.1 * fast), { w: 14 });
  const ev = [[1467, 'um 1467', 'Beginn der\nKriegszeit', .9, -1], [1543, '1543', 'erste\nGewehre', 1.05, 1], [1600, 'um 1600', 'Ende der\ngroßen Kriege', 1.2, -1], [1603, '1603–1868', 'Frieden', 1.35, 1, 1735], [1876, '1876', 'Schwert-\nverbot', 1.5, -1]];
  for (const [y, lab, txt, t0a, side, lx] of ev) {
    const t0 = t0a * fast, k = seg(lt, t0, t0 + .35), xt = X(y), x = lx ? X(lx) : xt;
    brushPath(c, [xt, Y - 30, xt, Y + 30], k, { w: 10 });
    brushText(c, lab, x, Y + side * 100 + (side > 0 ? 20 : 0), 46, k, { align: 'center' });
    txt.split('\n').forEach((s, i) => brushText(c, s, x, Y + side * 100 + (side > 0 ? 80 : -150) + i * 52, 44, seg(lt, t0 + .1, t0 + .5), { align: 'center', font: UI.fontBody, col: '#3a2a20' }));
  }
  if (o.focus === 'peace') {
    const k = seg(lt, 1.0, 1.8); brushPath(c, [X(1603), Y - 8, X(1868), Y - 4], k, { w: 34, col: '#c9a24a', alpha: .85 });
    c.save(); c.globalAlpha = .5 * bump(lt, 1.6, 4); bloom(c, X(1735), Y, 380, '255,220,120', .6); c.restore();
    brushEllipse(c, X(1735), Y + 140, 190, 70, seg(lt, 1.8, 2.3), { w: 9, col: UI.red });
    hanko(c, X(1868) + 60, Y + 250, 64, seg(lt, 2.5, 2.8), 'F');
  } else {
    brushPath(c, [X(1600), Y + 40, X(1868), Y + 40], seg(lt, 1.35, 1.8), { w: 8, col: '#6f6457' });
    brushEllipse(c, X(1600), Y - 112, 130, 54, seg(lt, .62, 1.05), { w: 9, col: UI.red });
    brushPath(c, [X(1467), Y - 10, X(1600), Y - 6], seg(lt, 1.98, 2.7), { w: 34, col: UI.red, alpha: .8 });
    brushNote(c, 'Zeit der Kriege', (X(1467) + X(1600)) / 2, Y + 290, 54, seg(lt, 2.3, 2.9), { align: 'center', col: UI.red });
    hanko(c, X(1600) + 40, Y + 270, 64, seg(lt, 3.7, 4.0), 'K');
  }
  c.restore(); vignette(c, .35);
}
// T2 — estates pyramid
function tStaende(c, lt, o = {}) {
  parchmentBG(c, 7, 1 + lt * .012);
  tableTitle(c, 'Stände', lt, 'S');
  const layers = [['Fürst (Daimyō)', 1, '#7a1f24'], ['Samurai', 6, SAM.indigo], ['Bauern', 22, '#5c6b3a'], ['Handwerker', 12, '#6b4a30'], ['Händler', 10, '#7a6a4a']];
  const top = 230, hgt = 150, cx = 860;
  layers.forEach(([name, n, col], i) => {
    const k = rowIn(lt, .4 + i * .3), y = top + i * hgt, w0 = 180 + i * 260, w1 = 180 + (i + 1) * 260;
    if (k <= 0) return;
    c.save(); c.globalAlpha = k; poly(c, [cx - w0 / 2, y, cx + w0 / 2, y, cx + w1 / 2, y + hgt - 10, cx - w1 / 2, y + hgt - 10]); c.fillStyle = shadeHex(col, .55); c.fill(); c.lineWidth = 5; c.strokeStyle = UI.ink; c.stroke();
    // little figures
    const m = Math.min(n, 3 + i * 7), sp = (w0 + w1) / 2 * .8 / Math.max(1, m);
    for (let j = 0; j < m; j++) { const fx = cx - (m - 1) * sp / 2 + j * sp, fy = y + hgt - 22; c.fillStyle = shadeHex(col, -.1); circ(c, fx, fy - 70, 15); c.fill(); c.beginPath(); c.moveTo(fx - 16, fy); c.lineTo(fx - 10, fy - 52); c.lineTo(fx + 10, fy - 52); c.lineTo(fx + 16, fy); c.fill(); if (i === 0) { c.fillStyle = '#c9a24a'; c.fillRect(fx - 14, fy - 96, 28, 8); } }
    c.restore();
    brushText(c, name, cx + w1 / 2 + 40, y + hgt * .6, 50, rowIn(lt, .5 + i * .3), { font: UI.fontBody });
  });
  if (o.seal !== false) { const k = seg(lt, o.sealAt ?? 1.6, (o.sealAt ?? 1.6) + .5); brushNote(c, '~6–7 von 100', 1440, top + hgt * 1.62, 58, k, { col: UI.red }); hanko(c, 1730, top + hgt * 1.45, 70, seg(lt, (o.sealAt ?? 1.6) + .4, (o.sealAt ?? 1.6) + .7), '6'); }
  if (o.lower) brushEllipse(c, cx + 40, top + hgt * 3.5, 620, 250, seg(lt, o.lower, o.lower + .6), { w: 9, col: UI.red });
  c.restore(); vignette(c, .35);
}
// T3 — training: two columns
function tAusbildung(c, lt) {
  parchmentBG(c, 9, 1 + lt * .01);
  brushText(c, 'Schwert und Pinsel', 960, 190, 78, seg(lt, .1, .7), { align: 'center' }); hanko(c, 1500, 160, 66, seg(lt, .7, 1), 'A');
  brushPath(c, [960, 260, 960, 980], seg(lt, .4, 1), { w: 10 });
  brushText(c, 'Kampf', 520, 330, 66, seg(lt, .6, 1)); brushText(c, 'Geist', 1300, 330, 66, seg(lt, .7, 1.1));
  ['Schwert', 'Bogen', 'Reiten', 'Speer'].forEach((s, i) => brushText(c, '· ' + s, 480, 450 + i * 120, 60, rowIn(lt, 1 + i * .25), { font: UI.fontBody }));
  ['Schreiben', 'Gedichte', 'Teezeremonie'].forEach((s, i) => brushText(c, '· ' + s, 1260, 450 + i * 120, 60, rowIn(lt, 1.1 + i * .25), { font: UI.fontBody }));
  c.save(); c.globalAlpha = .9; c.translate(400, 340); c.rotate(-.6); c.scale(.55, .55); drawSword(c, { kind: 'waki', sheath: false, naked: true }); c.restore();
  brush(c, 1180, 400, .5, .5, { wet: true });
  c.restore(); vignette(c, .35);
}
// T4 — the sword, labelled (scene of the still sheet)
function tSchwert(c, lt) {
  parchmentBG(c, 2, 1 + lt * .01);
  tableTitle(c, 'Das Schwert', lt, 'S');
  c.save(); c.translate(150, 360); c.scale(1.62, 1.62); drawSword(c, { kind: 'katana', naked: true, sheath: false, gleam: seg(lt, .2, 1.4) }); c.restore();
  c.save(); c.translate(541, 560); c.scale(1.62, 1.62); drawSword(c, { kind: 'katana', sayaOnly: true }); c.restore();
  const L = [['Griff', 250, 250, 250, 342, .5], ['Griffwicklung', 430, 500, 400, 384, .7], ['Stichblatt', 560, 220, 527, 322, .9], ['Klinge', 1450, 250, 1420, 324, 1.1], ['Härtelinie', 1150, 230, 1080, 330, 1.3], ['Scheide', 1300, 680, 1220, 560, 1.5], ['Kordel', 900, 720, 800, 690, 1.7]];
  for (const [s, x, y, ax, ay, t0] of L) { const k = seg(lt, t0, t0 + .4); if (k <= 0) continue; brushArrow(c, x, y - 14, ax, ay, k, { w: 6, bend: .2 }); brushText(c, s, x, y, 46, k, { font: UI.fontBody, align: 'center' }); }
  c.restore(); vignette(c, .35);
}
// T5 — the armour, labelled, Noah in armour in the middle
function tRuestung(c, lt, t) {
  parchmentBG(c, 4, 1 + lt * .01);
  tableTitle(c, 'Die Rüstung', lt, 'R');
  const x = 960, y = 1030, k = .4;
  drawSam(c, { x, y, k, ink: 1.5, outfit: 'armor', expr: withBlink({ lid: .25, mouth: 'flat' }, lt, 4), t: lt, sway: Math.sin(lt * 1.5) * .5 });
  const P = (ux, uy) => [x + ux * k, y + uy * k];
  const L = [['Helm', 520, 300, -200, -1450, 'right', .5], ['Brustpanzer', 520, 600, -60, -800, 'right', .8], ['Seidenschnüre', 520, 760, -100, -690, 'right', 1.1], ['Rückenfahne', 1500, 220, 60, -1900, 'left', 1.4], ['Schulterschutz', 1460, 520, 230, -900, 'left', 1.7], ['Armschutz', 1460, 680, 240, -700, 'left', 2.0], ['Beinschutz', 1460, 940, 110, -170, 'left', 2.3]];
  for (const [s, tx, ty, ux, uy, al, t0] of L) { const kk = seg(lt, t0, t0 + .4); if (kk <= 0) continue; const [ax, ay] = P(ux, uy); brushArrow(c, tx + (al === 'right' ? -20 : 20), ty - 14, ax, ay, kk, { w: 6, bend: .2 }); brushText(c, s, tx, ty, 46, kk, { font: UI.fontBody, align: al }); }
  c.restore(); vignette(c, .35);
}
// T6 — pay in rice
function tLohnReis(c, lt) {
  parchmentBG(c, 3, 1 + lt * .012);
  tableTitle(c, 'Lohn in Reis', lt, 'L');
  brushText(c, '1 Koku ≈ Reis für 1 Person für 1 Jahr', 960, 330, 56, seg(lt, .5, 1.2), { align: 'center', font: UI.fontBody });
  brushUnderline(c, 520, 1400, 352, seg(lt, 1.2, 1.5), { w: 8, col: UI.red });
  brushText(c, 'armer Samurai', 480, 960, 54, seg(lt, 1.3, 1.7), { align: 'center', font: UI.fontBody });
  brushText(c, 'reicher Samurai', 1400, 960, 54, seg(lt, 1.6, 2), { align: 'center', font: UI.fontBody });
  for (let i = 0; i < 3; i++) if (lt > 1.4 + i * .15) tawara(c, 400 + i * 80, 860 - (i === 2 ? 70 : 0) + (i === 2 ? 0 : 0), .7);
  const n = Math.floor(clamp((lt - 1.8) / 1.6) * 21);
  let idx = 0; for (let row = 0; row < 6; row++) for (let j = 0; j < 6 - row; j++) { if (idx++ >= n) break; tawara(c, 1400 - (5 - row) * 70 + j * 140, 860 - row * 70, .7); }
  brushArrow(c, 700, 700, 1100, 600, seg(lt, 2.2, 2.8), { w: 8, bend: -.3, col: UI.red });
  c.restore(); vignette(c, .35);
}
// T7 — battle map (brushed): two armies, arrows, gun line, mist
function tSchlachtkarte(c, lt) {
  parchmentBG(c, 6, 1 + lt * .01);
  tableTitle(c, 'Schlachtkarte', lt, 'K');
  // terrain
  brushPath(c, [200, 820, 500, 760, 760, 800, 1000, 740, 1300, 790, 1700, 760], seg(lt, .2, .8), { w: 6, col: '#6f6457' });
  for (let i = 0; i < 3; i++) { const k = seg(lt, .3 + i * .1, .7 + i * .1); brushPath(c, [1500 + i * 60, 360, 1560 + i * 60, 290, 1620 + i * 60, 360], k, { w: 6, col: '#6f6457' }); }
  c.save(); c.globalAlpha = .45; for (let i = 0; i < 5; i++) { brushPath(c, [300 + i * 260, 540 + Math.sin(i) * 20, 480 + i * 260, 530 + Math.cos(i) * 20], seg(lt, .4, .9), { w: 26, col: '#a9a39a' }); } c.restore();
  brushText(c, 'Nebel', 960, 500, 40, seg(lt, .7, 1), { align: 'center', font: UI.fontBody, col: '#6f6457' });
  // armies as blocks
  const adv = ease(seg(lt, 1.2, 3.2)) * 220;
  for (let i = 0; i < 4; i++) { c.save(); c.globalAlpha = seg(lt, .5 + i * .1, .8 + i * .1); c.fillStyle = SAM.indigo; c.fillRect(260 + adv, 360 + i * 110, 160, 80); c.fillStyle = '#2f4a2c'; c.fillRect(1500 - adv * .6, 360 + i * 110, 160, 80); c.restore(); }
  for (let i = 0; i < 3; i++) brushArrow(c, 440 + adv, 400 + i * 130, 820 + adv * .6, 420 + i * 110, seg(lt, 1.2 + i * .15, 2.0 + i * .15), { w: 12, col: SAM.indigo, bend: .15 });
  // gun line (red dashes)
  for (let i = 0; i < 9; i++) { const k = seg(lt, 2.3 + i * .05, 2.4 + i * .05); if (k > 0) { brushPath(c, [1320 - adv * .6, 330 + i * 52, 1360 - adv * .6, 330 + i * 52], k, { w: 14, col: UI.red }); } }
  brushNote(c, 'Gewehre', 1260 - adv * .6, 900, 52, seg(lt, 2.6, 3), { col: UI.red, align: 'center' });
  c.restore(); vignette(c, .35);
}
// T8 — bow vs. gun
function tBogenGewehr(c, lt) {
  parchmentBG(c, 8, 1 + lt * .01);
  brushText(c, 'Bogen', 560, 200, 80, seg(lt, .1, .6), { align: 'center' }); brushText(c, 'Gewehr', 1360, 200, 80, seg(lt, .3, .8), { align: 'center', col: UI.red });
  c.save(); c.translate(560, 420); c.rotate(-.1); c.scale(.4, .4); bowYumi(c, 0, 0, 1); arrow(c, 200, -100, 0, 1); c.restore();
  tanegashima(c, 1140, 420, -.08, .75, { fuse: true, t: lt });
  brushPath(c, [960, 150, 960, 980], seg(lt, .3, .9), { w: 10 });
  const rows = [['Ausbildung', 'jahrelang', 'kurz', 1.0], ['Wer kann es?', 'Samurai', 'jeder Bauer', 1.6]];
  rows.forEach(([h, a, b, t0], i) => {
    const y = 640 + i * 170; brushText(c, h, 960, y - 70, 40, seg(lt, t0, t0 + .3), { align: 'center', font: UI.fontBody, col: '#6f6457' });
    brushText(c, a, 560, y, 64, seg(lt, t0 + .1, t0 + .5), { align: 'center', font: UI.fontBody });
    brushText(c, b, 1360, y, 64, seg(lt, t0 + .3, t0 + .7), { align: 'center', font: UI.fontBody, col: UI.red });
  });
  c.save(); c.globalAlpha = .9; c.beginPath(); c.roundRect(1060, 520, 600, 420, 30); c.lineWidth = 10; c.strokeStyle = `rgba(179,38,30,${seg(lt, 2.2, 2.6)})`; c.stroke(); c.restore();
  hanko(c, 1660, 520, 70, seg(lt, 2.6, 2.9), 'G');
  c.restore(); vignette(c, .35);
}
// T9 — ronin status: crosses stamped one by one
function tRonin(c, lt, o = {}) {
  parchmentBG(c, 10, 1 + lt * .012);
  tableTitle(c, 'Rōnin', lt, 'R');
  const rows = [['Herr', 0], ['Lohn', 0], ['Reis', 0], ['Zuhause', 0], ['Schwerter', 1]], at = o.at || [.6, 1.1, 1.6, 2.1, 2.9];
  rows.forEach(([s, ok], i) => {
    const y = 340 + i * 140, k = rowIn(lt, at[i] - .4);
    brushText(c, s, 640, y, 70, k, { font: UI.fontBody });
    const kk = seg(lt, at[i], at[i] + .25);
    if (kk > 0) { if (ok) brushPath(c, [1180, y - 20, 1220, y + 10, 1300, y - 60], kk, { w: 18, col: '#2f5a34' }); else { brushPath(c, [1180, y - 60, 1280, y + 10], kk, { w: 18, col: UI.red }); brushPath(c, [1280, y - 60, 1180, y + 10], seg(kk, .5, 1), { w: 18, col: UI.red }); } }
  });
  c.restore(); vignette(c, .35);
}
// T10 — peace counter
function tFrieden(c, lt) {
  parchmentBG(c, 11, 1 + lt * .01);
  brushText(c, 'Frieden', 960, 230, 96, seg(lt, .1, .7), { align: 'center' });
  const n = Math.floor(easeOut(seg(lt, .5, 2.6)) * 250);
  c.save(); c.font = `220px ${UI.fontHead}`; c.textAlign = 'center'; c.fillStyle = UI.ink; c.fillText(`${lt > 2.6 ? 'über ' : ''}${n}`, 960, 560); c.restore();
  brushText(c, 'Jahre ohne große Kriege', 960, 690, 64, seg(lt, 1.2, 1.8), { align: 'center', font: UI.fontBody });
  hanko(c, 1500, 470, 90, seg(lt, 2.7, 3.0), 'F');
  // armour into a box, brush onto a desk (small icons)
  c.save(); c.translate(560, 960); c.scale(.32, .32); woodChest(c, 0, 0, 1, 1 - seg(lt, 1.6, 2.4)); c.restore();
  c.save(); c.translate(1380, 960); c.scale(.5, .5); lowTable(c, 0, 0, 1); brush(c, 0, -150, 1.5, .7, { wet: true }); c.restore();
  c.restore(); vignette(c, .35);
}
// T12 — final, empty check boxes
function tFinale(c, lt) {
  parchmentBG(c, 12, 1 + lt * .008);
  const rows = ['Dein Leben einem Herrn schenken', 'Jeden Tag bereit sein', 'Alles für die Ehre'];
  rows.forEach((s, i) => { const y = 360 + i * 200, k = rowIn(lt, .3 + i * .8, .5);
    if (k > 0) { brushPath(c, [300, y - 70, 380, y - 72, 382, y + 6, 302, y + 8, 300, y - 70], k, { w: 9 }); brushText(c, s, 450, y, 70, seg(lt, .4 + i * .8, 1 + i * .8), { font: UI.fontBody }); }
  });
  c.restore(); vignette(c, .35);
}
// priorities chart: 1. Herr, 2. … (Familie appears late)
function tPrioritaet(c, lt, o = {}) {
  parchmentBG(c, 13, 1 + lt * .01);
  brushText(c, '1.', 520, 420, 120, seg(lt, .1, .4)); brushText(c, 'Herr', 680, 420, 140, seg(lt, .2, .8));
  hanko(c, 1200, 370, 90, seg(lt, .8, 1.1), 'H');
  brushText(c, '2.', 520, 680, 90, seg(lt, 1.0, 1.3), { col: '#6f6457' }); brushText(c, '…', 660, 680, 90, seg(lt, 1.1, 1.4), { col: '#6f6457' });
  brushText(c, 'Familie', 820, 840, 70, seg(lt, o.famAt ?? 2.2, (o.famAt ?? 2.2) + .5), { font: UI.fontBody, col: '#6f6457' });
  brushArrow(c, 1060, 830, 760, 700, seg(lt, (o.famAt ?? 2.2) + .4, (o.famAt ?? 2.2) + .9), { w: 8, bend: -.3, col: UI.red });
  c.restore(); vignette(c, .35);
}
// BUSHIDO calligraphy
function tBushido(c, lt) {
  parchmentBG(c, 14, 1 + lt * .015);
  const k = seg(lt, .2, 1.6);
  c.save(); c.font = `230px ${UI.fontHead}`; c.textAlign = 'center'; c.fillStyle = UI.ink;
  c.beginPath(); c.rect(0, 0, 360 + k * 1500, H); c.clip(); c.fillText('BUSHIDO', 960, 560); c.restore();
  brushUnderline(c, 420, 1500, 620, seg(lt, 1.6, 2.1), { w: 16 });
  brushText(c, 'Der Weg des Kriegers', 960, 780, 76, seg(lt, 2.0, 2.8), { align: 'center', font: UI.fontBody });
  hanko(c, 1560, 380, 110, seg(lt, 2.8, 3.1), 'B');
  c.restore(); vignette(c, .35);
}
// pay vs prices
function tLohnPreise(c, lt) {
  parchmentBG(c, 15, 1 + lt * .01);
  brushText(c, 'Reislohn', 560, 330, 72, seg(lt, .1, .5), { align: 'center' }); brushText(c, 'Preise', 1360, 330, 72, seg(lt, .4, .8), { align: 'center' });
  brushArrow(c, 360, 640, 760, 640, seg(lt, .5, 1.1), { w: 20 });
  brushArrow(c, 1200, 860, 1520, 480, seg(lt, .9, 1.5), { w: 20, col: UI.red });
  brushNote(c, 'bleibt gleich', 560, 780, 50, seg(lt, 1.0, 1.4), { align: 'center' }); brushNote(c, 'steigen', 1440, 900, 50, seg(lt, 1.4, 1.8), { align: 'center', col: UI.red });
  c.restore(); vignette(c, .35);
}
