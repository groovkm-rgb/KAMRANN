// SCREEN INSERTS + CHARTS (screen space). All texts German.
function phone(c, x, y, w, h, rot, draw, o = {}) {
  c.save(); c.translate(x, y); c.rotate(rot || 0);
  c.save(); c.shadowColor = 'rgba(0,0,0,.5)'; c.shadowBlur = 40; c.shadowOffsetY = 20; c.fillStyle = '#16161a'; rrect(c, -w / 2 - 18, -h / 2 - 18, w + 36, h + 36, 54); c.fill(); c.restore();
  c.lineWidth = 4; c.strokeStyle = '#000'; rrect(c, -w / 2 - 18, -h / 2 - 18, w + 36, h + 36, 54); c.stroke(); c.strokeStyle = '#4a4a52'; c.lineWidth = 2; rrect(c, -w / 2 - 12, -h / 2 - 12, w + 24, h + 24, 48); c.stroke();
  c.save(); rrect(c, -w / 2, -h / 2, w, h, 38); c.clip(); c.translate(-w / 2, -h / 2); c.fillStyle = o.bg || '#fff'; c.fillRect(0, 0, w, h); draw(c, w, h);
  c.fillStyle = 'rgba(0,0,0,.85)'; rrect(c, w / 2 - 70, 12, 140, 30, 15); c.fill(); hudText(c, o.clock || '23:12', 34, 38, 22, o.dark ? '#fff' : '#111');
  c.restore(); c.fillStyle = 'rgba(255,255,255,.06)'; c.beginPath(); c.moveTo(-w / 2, -h / 2); c.lineTo(-w / 2 + w * .5, -h / 2); c.lineTo(-w / 2, -h / 2 + h * .4); c.fill();
  if (o.hand) { c.save(); c.translate(w * .1, h / 2 + 10); c.beginPath(); c.ellipse(0, 40, w * .42, 110, 0, 0, Math.PI * 2); c.fillStyle = '#fff'; c.fill(); c.lineWidth = 7; c.strokeStyle = NOAH.out; c.stroke(); for (let i = 0; i < 3; i++) { c.beginPath(); c.ellipse(-w / 2 - 6, -h * .1 - i * 70, 34, 26, 0, 0, Math.PI * 2); c.fillStyle = '#fff'; c.fill(); c.stroke(); } c.restore(); }
  c.restore();
}
function appBanking(c, w, h, o = {}) {
  const t = o.t || 0; c.fillStyle = '#f2f4f7'; c.fillRect(0, 0, w, h); c.fillStyle = '#1f3a6a'; c.fillRect(0, 0, w, 230);
  hudText(c, 'Mein Konto', 34, 108, 34, '#fff'); hudText(c, o.account || 'Geschäftskonto · HILDE', 34, 150, 22, 'rgba(255,255,255,.7)');
  hudText(c, 'Kontostand', 34, 290, 24, '#5a6070'); const v = o.balance ?? -38000; { const s2 = fmtNum(v, 2) + ' €'; let fz = 58; c.font = hudFont(fz); while (c.measureText(s2).width > w - 68 && fz > 20) { fz -= 2; c.font = hudFont(fz); } hudText(c, s2, 34, 360, fz, v < 0 ? '#d0302a' : '#1a7a3a'); }
  if (o.limit) hudText(c, o.limit, 34, 400, 20, '#8a8f99');
  (o.rows || [['Lieferant Fleisch', -1240.5], ['Stromversorger', -2480], ['Miete Juni', -6200], ['Kasse Abend', 312.4], ['Lohn Service', -7850]]).forEach((r, i) => { const y = 450 + i * 92; c.fillStyle = '#fff'; rrect(c, 20, y, w - 40, 80, 16); c.fill(); hudText(c, r[0], 44, y + 34, 19, '#222'); hudText(c, r[2] || 'heute', 44, y + 62, 15, '#8a8f99'); hudText(c, (r[1] > 0 ? '+' : '') + fmtNum(r[1], 2) + ' €', w - 40, y + 62, 19, r[1] < 0 ? '#d0302a' : '#1a7a3a', 'right'); });
}
function appReview(c, w, h, o = {}) {
  c.fillStyle = '#fff'; c.fillRect(0, 0, w, h); c.fillStyle = '#f1f3f4'; rrect(c, 20, 70, w - 40, 60, 30); c.fill(); hudText(c, 'HILDE – Restaurant', 50, 110, 22, '#555');
  hudText(c, 'HILDE – Restaurant', 30, 200, 32, '#202124'); hudText(c, 'Restaurant · €€€€', 30, 238, 20, '#70757a');
  const st = o.stars ?? 2; hudText(c, (o.avg || '2,0').toString(), 30, 300, 40, '#202124'); for (let i = 0; i < 5; i++) { star(c, 112 + i * 38, 288, 16, 5, .45); c.fillStyle = i < st ? '#fbbc04' : '#dadce0'; c.fill(); }
  hudText(c, 'Neueste Bewertung', 30, 380, 22, '#202124'); c.fillStyle = '#e8eaed'; c.fillRect(30, 396, w - 60, 2);
  circle(c, 62, 450, 30); c.fillStyle = '#8a5ad0'; c.fill(); hudText(c, 'M', 62, 460, 28, '#fff', 'center'); hudText(c, 'Markus B.', 106, 446, 22, '#202124'); hudText(c, 'vor 2 Stunden', 106, 474, 17, '#70757a');
  for (let i = 0; i < 5; i++) { star(c, 46 + i * 30, 520, 13, 5, .45); c.fillStyle = i < st ? '#fbbc04' : '#dadce0'; c.fill(); }
  const k = clamp(o.k ?? 1), quote = '„Teuer, kleine Portionen, der Kellner war nervös.“', n = Math.floor(quote.length * k), words = quote.slice(0, n).split(' '); let line2 = '', y = 572;
  c.font = hudFont(26); for (const wd of words) { if (c.measureText(line2 + wd).width > w - 70) { hudText(c, line2, 30, y, 26, '#202124'); y += 38; line2 = ''; } line2 += wd + ' '; } hudText(c, line2, 30, y, 26, '#202124');
  hudText(c, 'Hilfreich (3)', 30, y + 70, 19, '#1a73e8');
}
function appSearch(c, w, h, o = {}) {
  c.fillStyle = '#121418'; c.fillRect(0, 0, w, h); c.fillStyle = '#2a2d34'; rrect(c, 20, 70, w - 40, 64, 32); c.fill(); const q = 'Gastro Pleiten 2025', n = Math.floor(q.length * clamp(o.k ?? 1)); hudText(c, q.slice(0, n) + (o.k < 1 && Math.floor((o.t || 0) * 3) % 2 ? '|' : ''), 50, 112, 26, '#e8eaed');
  const res = [['Rekord: fast 3.000 Insolvenzen in der Gastronomie', 'Wirtschaft · vor 3 Tagen'], ['Höchster Stand seit 2011', 'Nachrichten · vor 1 Woche'], ['24.500 Betriebe geben auf', 'Gastro-Magazin · 2025'], ['Warum so viele Restaurants schließen', 'Ratgeber · vor 2 Wochen']];
  res.forEach((r, i) => { const kk = clamp(((o.k2 ?? 1) * 4) - i); if (kk <= 0) return; c.save(); c.globalAlpha = kk; const y = 180 + i * 170; c.fillStyle = '#1c1f25'; rrect(c, 20, y, w - 40, 150, 18); c.fill(); c.fillStyle = ['#c0392b', '#7a3a2a', '#3a4a6a', '#4a4a4a'][i]; rrect(c, 36, y + 18, 110, 110, 12); c.fill(); hudText(c, '!', 91, y + 92, 60, '#fff', 'center');
    c.font = hudFont(23); const words = r[0].split(' '); let ln = '', yy = y + 50; for (const wd of words) { if (c.measureText(ln + wd).width > w - 210) { hudText(c, ln, 166, yy, 23, '#8ab4f8'); yy += 32; ln = ''; } ln += wd + ' '; } hudText(c, ln, 166, yy, 23, '#8ab4f8'); hudText(c, r[1], 166, y + 134, 17, '#9aa0a6'); c.restore(); });
}
function appVideo(c, w, h, o = {}) {
  const t = o.t || 0; c.fillStyle = '#000'; c.fillRect(0, 0, w, h);
  c.save(); c.translate(w / 2, h * .46); c.scale(2.2, 2.2); c.fillStyle = '#3a2418'; c.fillRect(-w, -200, w * 2, 400); clayRoulade(c, 0, 40, 1.6, { steam: true, t }); const cut = clamp(o.cut ?? 1); if (cut > 0) { line(c, [-20, -40 - 60 * (1 - cut), -20, 30], 4, '#d8dde2'); } c.restore();
  const g = c.createLinearGradient(0, h * .6, 0, h); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.85)'); c.fillStyle = g; c.fillRect(0, h * .55, w, h * .45);
  c.font = hudFont(26); const cap = '„Das Rezept meiner Oma hat mein Restaurant gerettet.“', words = cap.split(' '); let ln = '', y = h - 230; const shown = Math.floor(words.length * clamp(o.capK ?? 1)); words.slice(0, shown).forEach(wd => { if (c.measureText(ln + wd).width > w - 140) { hudText(c, ln, 30, y, 26, '#fff'); y += 36; ln = ''; } ln += wd + ' '; }); hudText(c, ln, 30, y, 26, '#fff');
  hudText(c, '@lukas.spuelt', 30, h - 270, 22, '#fff');
  const views = o.views ?? 0; c.fillStyle = 'rgba(0,0,0,.55)'; rrect(c, 24, 70, 300, 56, 28); c.fill(); hudText(c, '▶ ' + (views >= 1e6 ? fmtNum(views / 1e6, 1) + ' Mio.' : fmtNum(Math.round(views))) + ' Aufrufe', 44, 108, 24, '#fff');
  for (const [i, ic] of [[0, '♥'], [1, '💬'], [2, '↗']].slice(0, 1)) { circle(c, w - 60, h * .55, 34); c.fillStyle = 'rgba(255,255,255,.15)'; c.fill(); hudText(c, '♥', w - 60, h * .55 + 12, 34, '#ff3a5a', 'center'); hudText(c, o.likes || '184.000', w - 60, h * .55 + 70, 18, '#fff', 'center'); }
}
function appCall(c, w, h, o = {}) {
  const t = o.t || 0; const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#1f2a3a'); g.addColorStop(1, '#0a0e16'); c.fillStyle = g; c.fillRect(0, 0, w, h);
  hudText(c, 'Eingehender Anruf', w / 2, 200, 26, '#9aa4b4', 'center'); hudText(c, o.name || 'Unbekannt', w / 2, 270, 40, '#fff', 'center'); hudText(c, 'Mobil · Reservierung?', w / 2, 310, 22, '#9aa4b4', 'center');
  for (let k = 0; k < 3; k++) { const r = 60 + ((t * 80 + k * 40) % 120); circle(c, w / 2, 520, r); c.lineWidth = 3; c.strokeStyle = `rgba(120,220,140,${1 - r / 180})`; c.stroke(); }
  circle(c, w / 2, 520, 60); c.fillStyle = '#3a4a5a'; c.fill(); hudText(c, 'R', w / 2, 540, 50, '#fff', 'center');
  circle(c, w * .28, h - 160, 48); c.fillStyle = '#e04a3a'; c.fill(); circle(c, w * .72, h - 160, 48); c.fillStyle = '#3ac25a'; c.fill(); hudText(c, 'Ablehnen', w * .28, h - 80, 18, '#fff', 'center'); hudText(c, 'Annehmen', w * .72, h - 80, 18, '#fff', 'center');
  if (o.missed) { c.fillStyle = '#d0302a'; rrect(c, w / 2 - 150, 360, 300, 54, 27); c.fill(); hudText(c, fmtNum(Math.round(o.missed)) + ' verpasste Anrufe', w / 2, 396, 22, '#fff', 'center'); }
}
// pie chart drawn in, k 0..1; slices [{ v, label, col }]
function pieChart(c, cx, cy, r, slices, k, o = {}) {
  const tot = slices.reduce((a, s) => a + s.v, 0); let a0 = -Math.PI / 2; const kk = clamp(k);
  c.save(); c.shadowColor = 'rgba(0,0,0,.3)'; c.shadowBlur = 20; c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.fillStyle = '#fff'; c.fill(); c.restore();
  slices.forEach((s, i) => { const span = s.v / tot * Math.PI * 2, show = clamp(kk * slices.length - i); if (show <= 0) { a0 += span; return; } const a1 = a0 + span * ease(show), mid = a0 + span / 2, pop = s.pop ? 18 : 0;
    c.beginPath(); c.moveTo(cx + Math.cos(mid) * pop, cy + Math.sin(mid) * pop); c.arc(cx + Math.cos(mid) * pop, cy + Math.sin(mid) * pop, r, a0, a1); c.closePath(); c.fillStyle = s.col; c.fill(); c.lineWidth = 4; c.strokeStyle = '#fff'; c.stroke();
    if (show >= 1 && s.label) { const lx = cx + Math.cos(mid) * (r + (o.lab || 70)), ly = cy + Math.sin(mid) * (r + (o.lab || 70)); line(c, [cx + Math.cos(mid) * r * .9, cy + Math.sin(mid) * r * .9, lx, ly], 3, '#211c1a'); const al = Math.cos(mid) > 0 ? 'left' : 'right', dx = Math.cos(mid) > 0 ? 12 : -12; hudText(c, s.label, lx + dx, ly - 4, o.size || 26, '#211c1a', al); if (s.sub) hudText(c, s.sub, lx + dx, ly + 26, (o.size || 26) * .8, s.col === '#e8e2d0' ? '#7d7064' : shade(s.col, -.3), al); }
    a0 += span; });
  c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.lineWidth = 5; c.strokeStyle = '#211c1a'; c.stroke();
}
function barChart(c, x, y, w, h, bars, k, o = {}) {
  const max = Math.max(...bars.map(b => b.v)) * 1.12, bw = w / bars.length * .62;
  line(c, [x, y + h, x + w, y + h], 4, '#211c1a'); for (let g = 1; g <= 4; g++) line(c, [x, y + h - h * g / 4, x + w, y + h - h * g / 4], 1.5, 'rgba(0,0,0,.1)');
  bars.forEach((b, i) => { const kk = ease(clamp(k * bars.length * .8 - i * .8)), bx = x + (i + .19) * w / bars.length, bh = h * b.v / max * kk; c.fillStyle = b.col || HUD.blue; rrect(c, bx, y + h - bh, bw, bh, 6); c.fill(); c.lineWidth = 3; c.strokeStyle = '#211c1a'; c.stroke(); hudText(c, b.label, bx + bw / 2, y + h + 34, o.size || 22, '#5a5048', 'center'); if (kk > .95) hudText(c, b.text || fmtNum(b.v), bx + bw / 2, y + h - bh - 14, (o.size || 22) * 1.05, b.col === '#d0302a' ? '#d0302a' : '#211c1a', 'center'); });
}
function chairGrid(c, x, y, cols, rows, filled, k, o = {}) {
  const n = cols * rows, s = o.s || 46, sh = Math.floor(clamp(k) * filled + 1e-6);
  for (let i = 0; i < n; i++) { const cx = x + (i % cols) * s * 1.25, cy = y + Math.floor(i / cols) * s * 1.4, on = i < sh;
    c.save(); c.translate(cx, cy); const pop = on && i === sh - 1 ? 1.2 : 1; c.scale(pop, pop); c.lineWidth = 4; c.strokeStyle = '#211c1a'; c.fillStyle = on ? (o.col || '#3d8a4f') : '#e4d9c6';
    c.beginPath(); c.rect(-s * .32, -s * .55, s * .64, s * .42); c.fill(); c.stroke(); c.beginPath(); c.rect(-s * .4, -s * .12, s * .8, s * .14); c.fill(); c.stroke(); line(c, [-s * .32, 0, -s * .32, s * .34], 4); line(c, [s * .32, 0, s * .32, s * .34], 4);
    if (on) { circle(c, 0, -s * .86, s * .2); c.fillStyle = '#fff'; c.fill(); c.stroke(); } c.restore(); }
}
// icons for info cards
function bigIcon(c, kind, x, y, s = 1, col = HUD.ink) {
  c.save(); c.translate(x, y); c.scale(s, s); c.lineWidth = 5; c.strokeStyle = col; c.fillStyle = col; c.lineCap = 'round'; c.lineJoin = 'round';
  if (kind === 'license') { c.fillStyle = '#fff'; c.beginPath(); c.rect(-30, -40, 60, 80); c.fill(); c.stroke(); for (let i = 0; i < 4; i++) line(c, [-18, -24 + i * 12, 18 - (i % 2) * 10, -24 + i * 12], 3, col); c.beginPath(); c.arc(14, 26, 14, 0, Math.PI * 2); c.fillStyle = '#d0302a'; c.fill(); }
  else if (kind === 'school') { c.beginPath(); c.moveTo(-40, -10); c.lineTo(0, -30); c.lineTo(40, -10); c.lineTo(0, 10); c.closePath(); c.fill(); line(c, [-24, 0, -24, 22], 5, col); c.beginPath(); c.arc(-24, 0, 0, 0, 1); c.stroke(); c.beginPath(); c.moveTo(-24, 22); c.quadraticCurveTo(0, 34, 24, 22); c.lineTo(24, 0); c.stroke(); }
  else if (kind === 'hygiene') { c.beginPath(); c.arc(0, 0, 24, 0, Math.PI * 2); c.stroke(); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; line(c, [Math.cos(a) * 24, Math.sin(a) * 24, Math.cos(a) * 36, Math.sin(a) * 36], 4, col); c.beginPath(); c.arc(Math.cos(a) * 38, Math.sin(a) * 38, 4, 0, 7); c.fill(); } }
  else if (kind === 'fire') { c.fillStyle = '#2a9a4a'; c.beginPath(); c.rect(-40, -26, 80, 52); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 4; c.beginPath(); c.arc(-10, -12, 5, 0, 7); c.stroke(); line(c, [-12, -4, -6, 10, -16, 18], 4, '#fff'); line(c, [-6, 2, 6, 6], 4, '#fff'); c.beginPath(); c.moveTo(12, -14); c.lineTo(28, 0); c.lineTo(12, 14); c.stroke(); }
  else if (kind === 'music') { c.beginPath(); c.ellipse(-16, 22, 12, 9, -.4, 0, 7); c.fill(); c.beginPath(); c.ellipse(20, 14, 12, 9, -.4, 0, 7); c.fill(); line(c, [-5, 20, -5, -28, 31, -36, 31, 12], 5, col); }
  else if (kind === 'stamp') { c.beginPath(); c.rect(-12, -40, 24, 30); c.fill(); c.beginPath(); c.rect(-30, -12, 60, 16); c.fill(); c.beginPath(); c.rect(-34, 8, 68, 10); c.stroke(); }
  else if (kind === 'euro') { c.beginPath(); c.arc(4, 0, 30, .7, Math.PI * 2 - .7); c.stroke(); line(c, [-32, -8, 10, -8], 5, col); line(c, [-32, 8, 10, 8], 5, col); }
  else if (kind === 'person') { c.beginPath(); c.arc(0, -16, 14, 0, 7); c.fill(); c.beginPath(); c.arc(0, 30, 28, Math.PI, 0); c.fill(); }
  else if (kind === 'star') { star(c, 0, 0, 34, 5, .45); c.fillStyle = '#e8b84a'; c.fill(); c.stroke(); }
  else if (kind === 'eye') { c.beginPath(); c.moveTo(-36, 0); c.quadraticCurveTo(0, -30, 36, 0); c.quadraticCurveTo(0, 30, -36, 0); c.stroke(); c.beginPath(); c.arc(0, 0, 11, 0, 7); c.fill(); }
  c.restore();
}
// a row of small icon cards that pop in one by one (screen space)
function iconRow(c, t, items, x, y, o = {}) {
  const cw = o.w || 330, ch = o.h || 150, gap = o.gap || 24;
  items.forEach((it, i) => { const e = hudEnv(t, it.t0, it.t1 ?? o.t1); if (e.k <= 0) return; const cx = x + (i % (o.cols || 9)) * (cw + gap), cy = y + Math.floor(i / (o.cols || 9)) * (ch + gap);
    c.save(); c.globalAlpha = e.a; c.translate(cx + cw / 2, cy + ch / 2); c.rotate((rnd(i + 3) - .5) * .05); c.scale(e.s, e.s); c.translate(-cw / 2, -ch / 2);
    c.save(); c.shadowColor = 'rgba(0,0,0,.35)'; c.shadowBlur = 20; c.shadowOffsetY = 8; c.fillStyle = '#fff'; rrect(c, -8, -8, cw + 16, ch + 16, 22); c.fill(); c.restore(); rrect(c, -8, -8, cw + 16, ch + 16, 22); c.lineWidth = 3.5; c.strokeStyle = HUD.ink; c.stroke(); c.fillStyle = HUD.paper; rrect(c, 0, 0, cw, ch, 16); c.fill();
    c.fillStyle = it.col || HUD.accent; rrect(c, 0, 0, 110, ch, 16); c.fill(); c.fillRect(90, 0, 20, ch); bigIcon(c, it.icon, 55, ch / 2, 1.05, '#fff');
    hudText(c, it.title, 130, 50, it.size || 26, HUD.ink); (it.lines || []).forEach((l, j) => hudText(c, l, 130, 88 + j * 32, 23, j === 0 && it.hi ? HUD.accent : HUD.muted)); c.restore(); });
}
// a paper sheet (menu card) with lines that can be crossed out (screen space)
function menuSheet(c, x, y, w, h, items, o = {}) {
  c.save(); c.translate(x, y); c.rotate(o.rot || -.02); c.save(); c.shadowColor = 'rgba(0,0,0,.4)'; c.shadowBlur = 30; c.fillStyle = '#fbf5e6'; c.fillRect(0, 0, w, h); c.restore(); c.lineWidth = 3; c.strokeStyle = '#8a6a4a'; c.strokeRect(14, 14, w - 28, h - 28);
  hudText(c, o.title || 'SPEISEKARTE', w / 2, 74, 40, '#5a3a24', 'center'); line(c, [w * .3, 96, w * .7, 96], 3, '#c9a24a');
  const lh = (h - 150) / items.length; items.forEach((it, i) => { const yy = 140 + i * lh, a = it.a ?? 1; c.save(); c.globalAlpha = a; hudText(c, it.name, 40, yy + lh * .5, Math.min(26, lh * .55), it.hi ? '#a0302a' : '#2a2420'); hudText(c, it.price, w - 40, yy + lh * .5, Math.min(26, lh * .55), '#5a3a24', 'right'); c.restore(); if (it.cross > 0) handCross(c, 30, yy + lh * .38, w - 30, yy + lh * .38, it.cross, { t: o.t, shadow: false, w: 6 }); });
  c.restore();
}
// big letter (envelope + invitation card)
function inviteLetter(c, x, y, s, k, t) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.save(); c.shadowColor = 'rgba(0,0,0,.4)'; c.shadowBlur = 30; c.fillStyle = '#efe6d2'; c.fillRect(-300, -60, 600, 360); c.restore(); c.lineWidth = 3; c.strokeStyle = '#8a7a5a'; c.strokeRect(-300, -60, 600, 360); line(c, [-300, -60, 0, 140, 300, -60], 3, '#8a7a5a');
  const up = ease(clamp(k)); c.save(); c.translate(0, -up * 300); c.fillStyle = '#fffdf6'; c.fillRect(-250, -40, 500, 300); c.strokeStyle = '#c9a24a'; c.lineWidth = 4; c.strokeRect(-236, -26, 472, 272);
  for (let i = 0; i < 3; i++) { star(c, -50 + i * 50, 20, 18, 5, .45); c.fillStyle = '#c0392b'; c.fill(); }
  hudText(c, 'EINLADUNG', 0, 86, 40, '#2a2420', 'center'); hudText(c, 'zur Verleihung der Sterne 2026', 0, 128, 24, '#5a5048', 'center'); hudText(c, 'Frankfurt am Main · Juni', 0, 166, 24, '#5a5048', 'center'); hudText(c, 'Restaurant HILDE', 0, 216, 28, '#a0302a', 'center'); c.restore();
  c.restore();
}
