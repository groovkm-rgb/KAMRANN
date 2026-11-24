// OFFICIAL-PAPER CARDS (T1–T6): yellowed DDR paper, typewriter letters, purple stamp, ink-drawn graphics, red felt-tip marks.
// docCard(c, t, { t0, t1, rot, draw(c, k, lt, w, h) })  paper slides in from below over a dimmed scene and leaves again.
// Typewriter text: typeText(c, s, x, y, size, k) reveals characters with k 0..1.
const TYPE = "'Liberation Mono', 'DejaVu Sans Mono', monospace";
function typeText(c, s, x, y, size, k = 1, col = '#2a2420', align = 'left') {
  const n = Math.floor(s.length * clamp(k)); if (n <= 0) return 0; c.save(); c.font = `700 ${size}px ${TYPE}`; c.textAlign = align; c.textBaseline = 'alphabetic';
  // slightly uneven inking per character
  const shown = s.slice(0, n); let cx = x; if (align !== 'left') { c.fillStyle = col; c.globalAlpha = .9; c.fillText(shown, x, y); c.restore(); return 0; }
  for (let i = 0; i < shown.length; i++) { c.globalAlpha = .72 + rnd(i * 3.1 + x) * .28; c.fillStyle = col; c.fillText(shown[i], cx, y + (rnd(i + y) - .5) * 1.5); cx += c.measureText(shown[i]).width; }
  c.restore(); return cx - x;
}
function stamp(c, x, y, r, text, k = 1) {
  if (k <= 0) return; c.save(); c.translate(x, y); c.rotate(-.18); const s = k < 1 ? 1.6 - .6 * easeOut(k) : 1; c.scale(s, s); c.globalAlpha = .78 * clamp(k * 2);
  c.strokeStyle = '#6a3a8a'; c.lineWidth = 7; c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.stroke(); c.lineWidth = 3; c.beginPath(); c.arc(0, 0, r - 14, 0, Math.PI * 2); c.stroke();
  c.font = `700 ${r * .28}px ${TYPE}`; c.fillStyle = '#6a3a8a'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(text, 0, 0);
  for (let i = 0; i < 40; i++) { c.fillStyle = 'rgba(239,230,206,.7)'; c.fillRect((rnd(i) - .5) * r * 2, (rnd(i + 5) - .5) * r * 2, 5, 3); }
  c.restore();
}
function paper(c, x, y, w, h, seed = 1) {
  c.save(); c.shadowColor = 'rgba(0,0,0,.45)'; c.shadowBlur = 40; c.shadowOffsetY = 18; c.fillStyle = '#e9dfc2'; c.fillRect(x, y, w, h); c.restore();
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
  const g = c.createRadialGradient(x + w / 2, y + h / 2, w * .2, x + w / 2, y + h / 2, w * .8); g.addColorStop(0, 'rgba(255,250,230,.25)'); g.addColorStop(1, 'rgba(150,110,50,.35)'); c.fillStyle = g; c.fillRect(x, y, w, h);
  mottle(c, x, y, w, h, seed, { r: 90, a: .08, dark: '#7a5a2a' }); grain(c, x, y, w, h, .35, 1);
  line(c, [x, y + h * .5, x + w, y + h * .5], 2, 'rgba(120,90,40,.25)'); // fold
  c.restore(); c.strokeStyle = 'rgba(90,70,40,.5)'; c.lineWidth = 2; c.strokeRect(x, y, w, h);
}
function docCard(c, t, o) {
  const a = clamp((t - o.t0) / .55), b = o.t1 == null ? 1 : clamp((o.t1 - t) / .45), k = Math.min(a, b); if (k <= 0) return;
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
  c.fillStyle = `rgba(15,12,10,${.55 * k})`; c.fillRect(0, 0, W, H);
  const w = o.w || 1300, h = o.h || 900, x = (W - w) / 2, y = (H - h) / 2 + (1 - easeOut(a)) * 900 + (1 - ease(b)) * 900;
  c.translate(W / 2, y + h / 2); c.rotate((o.rot ?? -.015) + (1 - a) * .08); c.translate(-W / 2, -(y + h / 2));
  paper(c, x, y, w, h, o.seed || 3);
  c.save(); c.translate(x, y); o.draw(c, clamp((t - o.t0 - .4) / Math.max(.5, (o.t1 ?? o.t0 + 6) - o.t0 - 1.2)), t - o.t0, w, h); c.restore();
  c.restore();
}
function docHeader(c, title, k, w) { typeText(c, title, 70, 110, 54, clamp(k * 4)); line(c, [70, 135, 70 + (w - 140) * clamp(k * 3), 135], 4, '#2a2420'); }
// ---- T1 DIE MAUER: schematic map, red line drawn round West Berlin ----
const WB_POLY = [[-.42, -.30], [-.20, -.42], [.02, -.36], [.10, -.20], [.22, -.12], [.18, .04], [.26, .20], [.10, .34], [-.04, .40], [-.22, .30], [-.34, .34], [-.46, .14], [-.40, -.04], [-.50, -.18]];
function drawT1(c, k, lt, w, h) {
  docHeader(c, 'DIE MAUER', k, w);
  const mx = 430, my = 520, s = 620;
  c.fillStyle = 'rgba(120,140,90,.18)'; c.fillRect(mx - s * .62, my - s * .56, s * 1.24, s * 1.1);
  c.beginPath(); WB_POLY.forEach(([px, py], i) => i ? c.lineTo(mx + px * s, my + py * s) : c.moveTo(mx + px * s, my + py * s)); c.closePath(); c.fillStyle = 'rgba(70,110,170,.18)'; c.fill(); c.lineWidth = 2; c.strokeStyle = 'rgba(40,40,40,.5)'; c.stroke();
  // East Berlin area to the right
  c.beginPath(); c.moveTo(mx + .10 * s, my - .20 * s); c.lineTo(mx + .5 * s, my - .3 * s); c.lineTo(mx + .55 * s, my + .25 * s); c.lineTo(mx + .26 * s, my + .20 * s); c.lineTo(mx + .18 * s, my + .04 * s); c.lineTo(mx + .22 * s, my - .12 * s); c.closePath(); c.fillStyle = 'rgba(170,90,60,.12)'; c.fill();
  // red line progressively around West Berlin
  const L = clamp(k * 1.6), pts = [...WB_POLY, WB_POLY[0]]; let tot = 0; const seg = []; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); tot += d; }
  c.beginPath(); c.moveTo(mx + pts[0][0] * s, my + pts[0][1] * s); let acc = 0; for (let i = 1; i < pts.length; i++) { const target = L * tot; if (acc + seg[i - 1] <= target) c.lineTo(mx + pts[i][0] * s, my + pts[i][1] * s); else { const f = (target - acc) / seg[i - 1]; c.lineTo(mx + lerp(pts[i - 1][0], pts[i][0], f) * s, my + lerp(pts[i - 1][1], pts[i][1], f) * s); break; } acc += seg[i - 1]; }
  c.lineWidth = 12; c.strokeStyle = RED; c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke();
  typeText(c, 'West-Berlin', mx - 150, my + 10, 34, clamp(k * 3)); typeText(c, 'Ost-Berlin', mx + 210, my - 40, 30, clamp(k * 3 - .3)); typeText(c, 'DDR', mx - 330, my - 300, 30, clamp(k * 3 - .5));
  const lines = ['Seit 13. August 1961', '≈ 155 km', 'mindestens 140 Tote', 'letzte Todesschüsse:', 'Februar 1989'];
  lines.forEach((s2, i) => typeText(c, s2, 800, 300 + i * 70, 40, clamp(k * 2.2 - .5 - i * .25)));
  if (k > .55) { c.font = `700 120px ${TYPE}`; const n = Math.round(28 * ease(clamp((k - .55) / .3))); typeText(c, `${n} Jahre`, 800, 760, 96, 1, RED); }
  stamp(c, w - 190, h - 170, 95, 'GEPRÜFT', clamp((k - .8) * 6));
}
// ---- T2 HERBST 1989: timeline ----
function drawT2(c, k, lt, w, h) {
  docHeader(c, 'HERBST 1989', k, w);
  const items = [['Sommer', 'Ungarn öffnet die Grenze'], ['9. Oktober', 'Leipzig: mindestens 70.000'], ['4. November', 'Alexanderplatz: mindestens 100.000'], ['9. November', '']];
  const x0 = 120, x1 = w - 120, y = 470; line(c, [x0, y, x0 + (x1 - x0) * clamp(k * 1.4), y], 8, '#2a2420');
  items.forEach(([d, s], i) => { const kk = clamp(k * 2 - i * .35), x = x0 + i * (x1 - x0) / 3; if (kk <= 0) return; circle(c, x, y, 18); fs(c, i === 3 ? RED : '#2a2420'); typeText(c, d, x, y - 60, 40, kk, i === 3 ? RED : '#2a2420', 'center'); if (s) { c.save(); c.translate(x, y + 70); c.font = `700 28px ${TYPE}`; const words = s.split(': '); words.forEach((ww, j) => typeText(c, ww + (j === 0 && words.length > 1 ? ':' : ''), 0, j * 40, 28, kk, '#2a2420', 'center')); c.restore(); } });
  if (k > .75) markerCircle(c, x1, y, 90, 70, (k - .75) * 4, 10);
}
// ---- T3 DER ZETTEL: the note, underlined, margin notes ----
function drawT3(c, k, lt, w, h) {
  docHeader(c, 'DER ZETTEL', k, w);
  const L = ['Privatreisen nach dem Ausland', 'können ohne Vorliegen von', 'Voraussetzungen beantragt werden.', 'Die Genehmigungen werden', 'kurzfristig erteilt.'];
  L.forEach((s, i) => typeText(c, s, 90, 230 + i * 72, 40, clamp(k * 2.5 - i * .25)));
  for (const [i, x1] of [[2, 860], [4, 560]]) if (k > .55) line(c, [90, 230 + i * 72 + 14, 90 + (x1 - 90) * clamp((k - .55) * 5), 230 + i * 72 + 18], 8, RED);
  if (k > .62) markerWrite(c, 'Sperrfrist: 10. November, 4 Uhr', clamp((k - .62) * 4), 120, 680, 46, { rot: -.03 });
  if (k > .78) markerWrite(c, 'eigentlich: nur auf Antrag', clamp((k - .78) * 5), 160, 770, 46, { rot: -.04 });
  stamp(c, w - 200, 220, 90, 'VERTRAULICH', clamp((k - .3) * 5));
}
// ---- T4 DIE NACHT: clock chart ----
function drawT4(c, k, lt, w, h) {
  docHeader(c, 'DIE NACHT', k, w);
  const items = [['18:53', 'Pressekonferenz'], ['19:30', 'Nachrichten'], ['20:15', 'nur wenige Dutzend an den Übergängen'], ['23:30', 'Bornholmer Straße offen']];
  items.forEach(([tm, s], i) => { const kk = clamp(k * 2.4 - i * .4), y = 260 + i * 150; if (kk <= 0) return; c.beginPath(); c.arc(140, y - 14, 44, 0, Math.PI * 2); c.lineWidth = 5; c.strokeStyle = '#2a2420'; c.stroke(); const hh = +tm.slice(0, 2), mm = +tm.slice(3); line(c, [140, y - 14, 140 + Math.sin((hh % 12 + mm / 60) / 12 * 6.283) * 24, y - 14 - Math.cos((hh % 12 + mm / 60) / 12 * 6.283) * 24], 5, '#2a2420'); line(c, [140, y - 14, 140 + Math.sin(mm / 60 * 6.283) * 36, y - 14 - Math.cos(mm / 60 * 6.283) * 36], 3, '#2a2420'); typeText(c, tm, 220, y, 46, kk, i === 3 ? RED : '#2a2420'); typeText(c, s, 420, y, 36, kk); if (i < 3) line(c, [140, y + 34, 140, y + 92], 4, 'rgba(42,36,32,.6)'); });
  if (k > .8) markerCircle(c, 300, 260 + 3 * 150 - 14, 110, 50, (k - .8) * 5, 9);
}
// ---- T5 DANACH: three numbers with icons ----
function drawT5(c, k, lt, w, h) {
  docHeader(c, 'DANACH', k, w);
  const rows = [['Erstes Wochenende:', '≈ 3 Mio. Besucher', 'people'], ['Begrüßungsgeld:', '100 DM', 'money'], ['November 1989:', '≈ 18 Mio. Besuche', 'people']];
  rows.forEach(([a, b2, ic], i) => { const kk = clamp(k * 2.2 - i * .4), y = 280 + i * 170; typeText(c, a, 100, y, 40, kk); typeText(c, b2, 640, y, 52, kk, i === 1 ? RED : '#2a2420'); });
  // ink icons: money note, banana, coffee bag
  const iy = 800, kk = clamp((k - .6) * 3); if (kk > 0) { c.save(); c.globalAlpha = kk; c.strokeStyle = '#2a2420'; c.lineWidth = 5; c.strokeRect(160, iy - 60, 200, 110); c.beginPath(); c.arc(260, iy - 5, 30, 0, 6.3); c.stroke(); bananas(c, 560, iy, .7); c.beginPath(); c.moveTo(860, iy + 50); c.lineTo(980, iy + 50); c.lineTo(960, iy - 80); c.lineTo(880, iy - 80); c.closePath(); c.fillStyle = '#7a4a2a'; c.fill(); c.stroke(); signText(c, 'Kaffee', 920, iy - 10, 26, '#f2e2a0'); c.restore(); }
  if (k > .7) markerCircle(c, 760, 280 + 170 - 16, 150, 55, (k - .7) * 4, 9);
}
// ---- T6 FINAL ----
function drawT6(c, k, lt, w, h) {
  docHeader(c, 'FINAL', k, w);
  typeText(c, '9. November 1989', w / 2, 360, 64, clamp(k * 2.5), '#2a2420', 'center');
  if (k > .3) { const a = clamp((k - .3) * 4); line(c, [w / 2, 410, w / 2, 410 + 140 * a], 8, '#2a2420'); if (a > .9) { c.beginPath(); c.moveTo(w / 2 - 26, 530); c.lineTo(w / 2 + 26, 530); c.lineTo(w / 2, 570); c.closePath(); c.fillStyle = '#2a2420'; c.fill(); } }
  typeText(c, '3. Oktober 1990', w / 2, 650, 64, clamp((k - .45) * 3), '#2a2420', 'center');
  typeText(c, 'Deutschland wiedervereint', w / 2, 760, 56, clamp((k - .6) * 3), RED, 'center');
  stamp(c, w - 190, h - 150, 90, '1990', clamp((k - .85) * 6));
}
