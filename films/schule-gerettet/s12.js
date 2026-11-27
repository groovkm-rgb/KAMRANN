// ======================= Bölüm 12: Kapanış (638.96 – 694.75) =======================
function noahOnBalcony(c, t, o = {}) {
  balconyFrame(c, t, o);
  drawLit(c, cc => drawNoah34(cc, { x: o.nx ?? 1180, y: 1020, k: o.k ?? .5, ink: 1.8, turn: 1, sit: true, seatH: 380, expr: o.expr || { mouth: 'soft', look: .5 }, arms: { l: { a: .35, b: -1.2 }, r: { a: .35, b: -1.2 } } }), { light: [1, -.2], bounds: [700, 100, 1700, 1080], rim: '255,190,120', rimA: .8, rimInset: 14, rimW: 10, shadeA: .4 });
  c.save(); c.translate((o.nx ?? 1180) - 20, 1020); c.fillStyle = '#7a5a40'; c.fillRect(-150, -12, 300, 24); line(c, [-130, 0, -140, 70], 10, '#5a4030'); line(c, [130, 0, 140, 70], 10, '#5a4030'); c.restore();
  gradeScreen(c, { sx: .75, sy: .5, warm: '255,170,90', warmA: .45, coolA: .2 }); vignette(c, .45);
}
// small framed memory card (re-renders an earlier shot into a polaroid)
const MEMBUF = {};
function memoryCard(c, t, t0, x, y, w, rot, shotT0, at, label) {
  const a = clamp((t - t0) / .4); if (a <= 0) return;
  const B = MEMBUF.b || (MEMBUF.b = (() => { const cv = document.createElement('canvas'); cv.width = W; cv.height = H; return cv; })()), bc = B.getContext('2d');
  bc.setTransform(1, 0, 0, 1, 0, 0); bc.clearRect(0, 0, W, H); const s = SHOTS.find(s => s.t0 === shotT0); if (s) { bc.save(); s.draw(bc, at - s.t0, at, s); bc.restore(); }
  const h = w * .5625; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.translate(x, y); c.rotate(rot); c.scale(.7 + .3 * easeBack(a), .7 + .3 * easeBack(a)); c.globalAlpha = Math.min(1, a * 2);
  c.shadowColor = 'rgba(0,0,0,.45)'; c.shadowBlur = 24; c.shadowOffsetY = 12; c.fillStyle = '#fbf8f0'; c.fillRect(-w / 2 - 18, -h / 2 - 18, w + 36, h + 90); c.shadowColor = 'transparent';
  c.drawImage(B, -w / 2, -h / 2, w, h); c.font = FONT(30); c.fillStyle = '#3a332c'; c.textAlign = 'center'; c.fillText(label, 0, h / 2 + 50);
  c.restore();
}
// puzzle piece icon
function puzzlePiece(c, x, y, s, col, rot = 0) { c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s); c.beginPath(); c.moveTo(-50, -50); c.lineTo(-12, -50); c.arc(0, -58, 16, Math.PI * .8, Math.PI * .2, false); c.lineTo(50, -50); c.lineTo(50, -12); c.arc(58, 0, 16, Math.PI * 1.3, Math.PI * .7, false); c.lineTo(50, 50); c.lineTo(-50, 50); c.closePath(); c.fillStyle = col; c.fill(); c.lineWidth = 6; c.strokeStyle = OUT; c.stroke(); c.restore(); }
// 638.96–647.22 "Am Abend sitzt du auf dem Balkon. Die Sonne geht unter, alles ist golden und ruhig. Und zum ersten Mal kannst du richtig nachdenken."
shot(638.96, 643.23, (c, lt, t) => { c.save(); const z = 1.15 - easeIO(seg(lt, 0, 4.3)) * .15; c.translate(W / 2, H / 2); c.scale(z, z); c.translate(-W / 2, -H / 2); noahOnBalcony(c, t, { pan: lt * .3, sink: lt * 6 }); c.restore(); hudTag(c, t, 639.2, 360, 150, 'Am Abend', { size: 48, bar: '#f2a53a' }); });
shot(643.23, 647.22, (c, lt, t) => { c.save(); c.translate(W / 2 - 200, H / 2); c.scale(1.5, 1.5); c.translate(-W / 2 + 0, -H / 2 + 120); noahOnBalcony(c, t, { sink: 26 + lt * 6, expr: { mouth: 'soft', look: .6, lookY: -.4, brow: 'worried', browUp: .3 } }); c.restore(); });
// 647.22–651.27 "Alle nennen dich einen Helden. Aber so ganz stimmt das nicht."
shot(647.22, 651.27, (c, lt, t) => {
  noahOnBalcony(c, t, { sink: 50 + lt * 6, expr: { mouth: 'flat', look: .4, brow: 'worried', browUp: .2 } });
  hudTag(c, t, 647.6, 520, 220, 'Held?', { size: 70, bar: '#f2c230' }); if (t > 649.06) { c.save(); c.translate(520, 220); c.rotate(-.1); line(c, [-110, 0, 110, 0], 10, '#d02a22'); c.restore(); }
});
// 651.27–664.13 the others — memory polaroids land around Noah, each a puzzle piece
shot(651.27, 664.13, (c, lt, t) => {
  balconyFrame(c, t, { sink: 70 + lt * 4 }); c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = 'rgba(80,40,60,.35)'; c.fillRect(0, 0, W, H); c.restore();
  memoryCard(c, t, 651.3, 470, 300, 640, -.06, 132.57, 134.5, 'Frau Becker: ruhig, trotz Angst');
  memoryCard(c, t, 654.66, 1450, 300, 640, .05, 391.05, 392.5, 'Die Lehrer: sind sitzen geblieben');
  memoryCard(c, t, 658.89, 470, 790, 640, .04, 224.36, 226.5, 'Herr Krüger: der Technikraum');
  memoryCard(c, t, 661.68, 1450, 790, 640, -.05, 483.13, 484.5, 'Die Polizei: in Minuten da');
  const pcs = [[651.3, 830, 470], [654.66, 1090, 470], [658.89, 830, 650], [661.68, 1090, 650]]; pcs.forEach(([ts, x, y], i) => { if (t > ts) puzzlePiece(c, x, y, .9 * easeBack(seg(t, ts, ts + .4)), ['#e04a3a', '#3a7ad2', '#3aa05a', '#f2c230'][i], i * .3); });
  vignette(c, .45);
});
// 664.13–667.88 "Du warst nicht allein. Du warst nur das letzte Stück vom Puzzle." — the last piece (Noah) clicks in
shot(664.13, 667.88, (c, lt, t) => {
  const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#5a4a7a'); g.addColorStop(1, '#e0905a'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  const cx = W / 2, cy = H / 2 + 20, s = 2.2; puzzlePiece(c, cx - 110 * s / 1.1, cy - 110 * s / 1.1, s, '#e04a3a'); puzzlePiece(c, cx + 110 * s / 1.1, cy - 110 * s / 1.1, s, '#3a7ad2', Math.PI / 2); puzzlePiece(c, cx - 110 * s / 1.1, cy + 110 * s / 1.1, s, '#3aa05a', -Math.PI / 2);
  const u = easeOut(seg(t, 665.5, 666.7)); c.save(); c.translate(lerp(W + 200, cx + 110 * s / 1.1, u), lerp(H + 200, cy + 110 * s / 1.1, u)); puzzlePiece(c, 0, 0, s, '#2a2624', Math.PI); noahLetters(c, 0, 30, .5); c.restore();
  if (u >= 1) { glow(c, cx, cy, 500, '255,220,150', .5 * bump(t, 666.7, 667.8)); }
  hudTag(c, t, 664.3, W / 2, 120, 'nicht allein', { size: 54, bar: '#3d8a4f' }); if (t > 666.2) hudTag(c, t, 666.3, W / 2, H - 110, 'das letzte Stück', { size: 50 });
});
// 667.88–677.23 "Mut heißt nicht, dass man keine Angst hat… Mut heißt, trotzdem einen klaren Kopf zu behalten."
function quoteCard(c, t, t0, lines, o = {}) {
  balconyFrame(c, t, { sink: 110 }); c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = 'rgba(20,14,30,.55)'; c.fillRect(0, 0, W, H);
  lines.forEach(([s2, ts, col], i) => { const a = clamp((t - ts) / .5); if (a <= 0) return; c.globalAlpha = a; c.font = FONT(o.size || 70); c.textAlign = 'center'; c.fillStyle = col || '#fff6e8'; c.shadowColor = 'rgba(255,160,80,.6)'; c.shadowBlur = 24; c.fillText(s2, W / 2, H / 2 - (lines.length - 1) * 55 + i * 110 + (1 - easeOut(a)) * 20); });
  c.restore();
}
shot(667.88, 671.78, (c, lt, t) => { quoteCard(c, t, 667.9, [['Mut heißt nicht,', 669.42], ['dass man keine Angst hat.', 669.9]]); });
shot(671.78, 674.16, (c, lt, t) => { noahOnBalcony(c, t, { sink: 100, expr: { brow: 'worried', mouth: 'flat', look: .3 } }); hudTag(c, t, 672.5, 420, 160, 'riesige Angst', { size: 52, bar: '#5ab0ff' }); });
shot(674.16, 677.23, (c, lt, t) => { quoteCard(c, t, 674.2, [['Mut heißt,', 674.16], ['trotzdem einen', 674.73], ['klaren Kopf zu behalten.', 675.23, '#ffd38a']]); });
// 677.23–683.55 "Im echten Leben bleib im Raum, hör auf deine Lehrer und ruf die 110." — the 110 card
shot(677.23, 683.55, (c, lt, t) => {
  const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1f2a4a'); g.addColorStop(1, '#2f4f86'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  for (let i = 0; i < 40; i++) { c.fillStyle = `rgba(255,255,255,${.04 + rnd(i) * .05})`; c.beginPath(); c.arc(rnd(i + 3) * W, rnd(i + 7) * H, 2 + rnd(i) * 3, 0, TAU); c.fill(); }
  txt(c, 'Im echten Leben:', W / 2, 190, 56, '#cfe0ef', 'center');
  [['Bleib im Raum.', 679.94], ['Hör auf deine Lehrer.', 680.71], ['Ruf die', 682.08]].forEach(([s2, ts], i) => { const a = clamp((t - ts) / .3); if (a <= 0) return; c.save(); c.globalAlpha = a; c.translate(W / 2 - 380, 330 + i * 110); c.fillStyle = '#3d8a4f'; c.beginPath(); c.arc(0, -20, 30, 0, TAU); c.fill(); line(c, [-14, -20, -4, -8, 16, -34], 8, '#fff'); txt(c, s2, 60, 0, 60, '#fff'); c.restore(); });
  const a = clamp((t - 682.53) / .35); if (a > 0) { c.save(); c.translate(W / 2 + 250, 560); c.scale(easeBack(a), easeBack(a)); c.shadowColor = 'rgba(255,60,50,.8)'; c.shadowBlur = 50; c.fillStyle = '#d02a22'; rrect(c, -230, -110, 460, 220, 40); c.fill(); c.shadowColor = 'transparent'; c.lineWidth = 10; c.strokeStyle = '#fff'; c.stroke(); txt(c, '110', 0, 60, 170, '#fff', 'center'); c.restore(); txt(c, 'Polizei-Notruf', W / 2 + 250, 740, 40, '#ffd8d0', 'center'); }
});
// 683.55–691.41 "Noah hatte einen Plan, eine Feuertreppe, eine Lehrerin mit der Polizei am Telefon. Und ziemlich viel Glück. Und eine Taube."
shot(683.55, 691.41, (c, lt, t) => {
  balconyFrame(c, t, { sink: 130 }); c.save(); c.fillStyle = 'rgba(20,14,30,.4)'; c.fillRect(0, 0, W, H); c.restore();
  const items = [['Plan', 684.51, '#3a7ad2'], ['Feuertreppe', 685.37, '#1f9a52'], ['Lehrerin + Polizei', 686.21, '#2f8a8a'], ['viel Glück', 688.66, '#f2c230'], ['… und eine Taube', 690.48, '#9aa3ae']];
  items.forEach(([s2, ts, col], i) => hudTag(c, t, ts, 330 + (i % 3) * 630, 300 + Math.floor(i / 3) * 300 + (i === 4 ? 100 : 0), s2, { size: 56, bar: col, tilt: (i % 2 ? .05 : -.05) }));
  if (t > 690.48) pigeon(c, 1300 + Math.sin(t * 3) * 20, 720, 1.6, t, true);
});
// 691.41–694.75 "Und jetzt du. Was hättest du gemacht? Schreib's in die Kommentare."
shot(691.41, 694.75, (c, lt, t) => {
  const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2a1f3a'); g.addColorStop(1, '#e0785a'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  drawLit(c, cc => drawNoah(cc, { x: 360, y: 1180, k: .55, ink: 1.8, expr: { mouth: 'smile', look: .6, browUp: .3 }, arms: { r: { a: 2.25, b: .15 } } }), { light: [1, -.4], bounds: [0, 0, 760, 1080], rimInset: 14, rimW: 10, rimA: .5, rim: '255,190,120' });
  const a = clamp((t - 692.3) / .4); c.save(); c.globalAlpha = a; c.translate(W / 2 + 230, H / 2 - 60); c.scale(.9 + .1 * easeBack(a), .9 + .1 * easeBack(a));
  c.font = FONT(92); c.textAlign = 'center'; c.shadowColor = 'rgba(255,140,80,.8)'; c.shadowBlur = 40; c.fillStyle = '#fff8ee'; c.fillText('Was hättest', 0, -40); c.fillText('du gemacht?', 0, 70); c.restore();
  if (t > 693.56) { const b = clamp((t - 693.56) / .3); c.save(); c.globalAlpha = b; c.translate(W / 2 + 230, H / 2 + 230); c.fillStyle = '#fff'; rrect(c, -330, -50, 660, 100, 50); c.fill(); c.lineWidth = 5; c.strokeStyle = OUT; c.stroke(); c.fillStyle = '#3a7ad2'; c.beginPath(); c.moveTo(-280, -20); c.lineTo(-230, -20); c.lineTo(-230, 20); c.lineTo(-262, 20); c.lineTo(-280, 34); c.closePath(); c.fill(); txt(c, 'Schreib’s in die Kommentare', 20, 14, 38, OUT, 'center'); c.restore(); }
  if (t > 691.9) hudTag(c, t, 691.95, 360, 140, 'Und jetzt du.', { size: 56, bar: '#f2a53a' });
  fadeBlack(c, seg(t, 694.45, 694.75));
});
