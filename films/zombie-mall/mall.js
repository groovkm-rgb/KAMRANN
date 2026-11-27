// Props and sets for "30 Tage im Einkaufszentrum" (night mall, parking lot, roof, day atrium). World units, ground y = 0.
// All signs German. No blur: glow is drawn with radial gradients (bloom) and shadowBlur on neon tubes only.
const NIGHT = { sky0: '#04060f', sky1: '#0b1430', sky2: '#1c2a52', moon: '#e8eef8', fog: '120,140,180', asphalt: '#151a24', line: '#5a6274', warm: '255,160,60', haz: '255,150,30' };
const mono = px => `700 ${px}px ${MONO_FONT}, monospace`, sans = px => `700 ${px}px ${NOAH_FONT}, sans-serif`;
// ---------- sky ----------
function nightSky(c, t, o = {}) {
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
  const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, o.top || NIGHT.sky0); g.addColorStop(.55, o.mid || NIGHT.sky1); g.addColorStop(1, o.bot || NIGHT.sky2);
  c.fillStyle = g; c.fillRect(0, 0, W, H); c.restore();
}
function stars(c, x0, x1, y0, y1, t, n = 140, seed = 1) {
  for (let i = 0; i < n; i++) { const x = x0 + rnd(seed + i) * (x1 - x0), y = y0 + rnd(seed + i + 300) * (y1 - y0), a = .35 + .55 * Math.abs(Math.sin(t * (.5 + rnd(i) * 2) + i)), r = 1 + rnd(i + 600) * 2.2; c.fillStyle = `rgba(220,230,255,${a})`; c.fillRect(x - r / 2, y - r / 2, r, r); }
}
function moon(c, x, y, r) {
  bloom(c, x, y, r * 6, '170,195,255', .28); bloom(c, x, y, r * 2.2, '210,225,255', .45);
  circle(c, x, y, r); c.fillStyle = NIGHT.moon; c.fill();
  c.save(); circle(c, x, y, r); c.clip(); c.fillStyle = 'rgba(150,165,195,.45)';
  for (const [dx, dy, rr] of [[-.3, -.2, .22], [.25, .1, .16], [-.05, .38, .12], [.35, -.35, .09], [-.45, .25, .08]]) { circle(c, x + dx * r, y + dy * r, rr * r); c.fill(); }
  c.restore();
}
function cloud(c, x, y, w, col = '#1a2444', rim = 'rgba(150,170,220,.35)', seed = 1) {
  const n = 7, pts = []; for (let i = 0; i < n; i++) pts.push([x - w / 2 + (i + .5) * w / n + (rnd(seed + i) - .5) * w * .08, y - rnd(seed + i + 9) * w * .07, w * (.09 + rnd(seed + i + 20) * .07)]);
  c.fillStyle = rim; for (const [px, py, r] of pts) { circle(c, px, py - 5, r); c.fill(); }
  c.fillStyle = col; for (const [px, py, r] of pts) { circle(c, px, py + 4, r); c.fill(); }
  c.beginPath(); c.roundRect(x - w / 2, y - w * .02, w, w * .09, w * .04); c.fill();
}
// distant city with a few fires and smoke columns (base = ground line of the layer)
function skyline(c, x0, x1, base, t, o = {}) {
  let x = x0, i = 0; const col = o.col || '#0c1224', lit = o.lit ?? .12;
  while (x < x1) {
    const w = 90 + rnd(i + 11) * 170, h = 160 + rnd(i + 31) * 480 * (o.tall || 1);
    c.fillStyle = col; c.fillRect(x, base - h, w, h + 4);
    if (rnd(i + 51) > .7) { c.fillRect(x + w * .4, base - h - 60, 6, 60); }
    for (let yy = base - h + 24; yy < base - 20; yy += 36) for (let xx = x + 14; xx < x + w - 14; xx += 28) if (rnd(i * 97 + xx * .3 + yy * .7) < lit) { c.fillStyle = 'rgba(255,200,120,.75)'; c.fillRect(xx, yy, 10, 14); c.fillStyle = col; }
    x += w + 6; i++;
  }
  for (const f of o.fires || []) fireGlow2(c, f[0], base - f[1], t, f[2] || 1);
}
function fireGlow2(c, x, y, t, s = 1) {
  // a far rooftop fire: flickering orange glow + smoke column (no gore, just light)
  for (let i = 0; i < 9; i++) { const ph = (t * .08 + i / 9) % 1, sx = x + Math.sin(ph * 5 + i) * 30 * s + ph * 160 * s, sy = y - ph * 700 * s; c.fillStyle = `rgba(40,40,52,${.55 * (1 - ph)})`; circle(c, sx, sy, (40 + ph * 120) * s); c.fill(); }
  const f = .8 + .2 * Math.sin(t * 9 + x) * Math.sin(t * 5.3 + x * .1);
  bloom(c, x, y, 170 * s * f, '255,120,40', .55); bloom(c, x, y, 60 * s, '255,210,120', .7);
  for (let i = 0; i < 5; i++) { c.beginPath(); const fx = x + (i - 2) * 14 * s, fh = (40 + 30 * Math.abs(Math.sin(t * 7 + i * 2))) * s; c.moveTo(fx - 12 * s, y); c.quadraticCurveTo(fx, y - fh * 1.2, fx + 12 * s, y); c.fillStyle = i % 2 ? '#ffb040' : '#ff6a20'; c.fill(); }
}
// ---------- parking lot ----------
function asphalt(c, x0, x1, y0, y1, t, o = {}) {
  const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, o.far || '#0d121c'); g.addColorStop(1, o.near || NIGHT.asphalt); c.fillStyle = g; c.fillRect(x0, y0, x1 - x0, y1 - y0);
  c.fillStyle = 'rgba(255,255,255,.035)'; for (let i = 0; i < 260; i++) c.fillRect(x0 + rnd(i + 5) * (x1 - x0), y0 + rnd(i + 77) * (y1 - y0), 6, 3);
}
function parkLines(c, x0, x1, y, n, len, skew = .25) { c.strokeStyle = 'rgba(170,180,200,.28)'; c.lineWidth = 8; for (let i = 0; i < n; i++) { const x = x0 + i * (x1 - x0) / (n - 1); c.beginPath(); c.moveTo(x, y); c.lineTo(x + len * skew, y + len); c.stroke(); } }
function lampPost(c, x, base, h, on = 0, t = 0) {
  c.fillStyle = '#0a0d14'; c.fillRect(x - 12, base - h, 24, h); c.fillRect(x - 12, base - h, 150, 16); c.beginPath(); c.moveTo(x + 90, base - h + 16); c.lineTo(x + 160, base - h + 16); c.lineTo(x + 150, base - h + 40); c.lineTo(x + 100, base - h + 40); c.closePath(); c.fill();
  if (on > 0) { bloom(c, x + 125, base - h + 40, 260 * on, '200,215,255', .4 * on); c.save(); c.globalCompositeOperation = 'screen'; const g = c.createLinearGradient(0, base - h + 40, 0, base); g.addColorStop(0, `rgba(190,205,255,${.16 * on})`); g.addColorStop(1, 'rgba(190,205,255,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(x + 100, base - h + 40); c.lineTo(x + 150, base - h + 40); c.lineTo(x + 400, base); c.lineTo(x - 150, base); c.closePath(); c.fill(); c.restore(); }
}
function nightCar(c, x, y, o = {}) {
  // city.js car, darkened for night, + optional hazard blinkers and headlights
  c.save(); c.translate(x, y); c.scale(o.sc || 1, o.sc || 1);
  car(c, 0, { color: o.color || '#4a5262', s: o.s || 1 });
  c.fillStyle = `rgba(8,12,24,${o.dark ?? .55})`; c.beginPath(); c.rect(-370, -320, 740, 330); c.fill();
  const s = o.s || 1;
  if (o.haz) { for (const hx of [-348, 346]) { c.fillStyle = '#ffb040'; c.beginPath(); c.ellipse(hx * s, -128, 12, 16, 0, 0, Math.PI * 2); c.fill(); bloom(c, hx * s, -128, 190, NIGHT.haz, .75); bloom(c, hx * s, -128, 60, '255,230,170', .9); } }
  if (o.lights) { const hx = 345 * s; bloom(c, hx, -160, 260, '255,235,190', .7); bloom(c, hx, -160, 70, '255,255,240', 1); }
  c.restore();
}
function hazOn(t) { return (t % TIMING.hazard_period) < TIMING.hazard_period * .5; }
// ---------- litter ----------
function shopCart(c, x, y, s = 1, o = {}) {
  c.save(); c.translate(x, y); c.scale(s * (o.flip ? -1 : 1), s); if (o.rot) c.rotate(o.rot);
  const col = o.col || '#8a94a6', dk = '#2a3040';
  line(c, [-150, -330, -190, -400, -230, -400], 14, dk); line(c, [-150, -330, -190, -400, -230, -400], 7, col);
  c.beginPath(); c.moveTo(-160, -330); c.lineTo(170, -340); c.lineTo(130, -130); c.lineTo(-120, -130); c.closePath(); c.lineWidth = 12; c.strokeStyle = dk; c.stroke(); c.lineWidth = 6; c.strokeStyle = col; c.stroke();
  c.save(); c.clip(); c.lineWidth = 3; c.strokeStyle = col; for (let i = -160; i < 180; i += 34) { c.beginPath(); c.moveTo(i, -345); c.lineTo(i - 20, -120); c.stroke(); } for (let j = -320; j < -130; j += 34) { c.beginPath(); c.moveTo(-170, j); c.lineTo(180, j - 6); c.stroke(); } c.restore();
  line(c, [-120, -130, -110, -50, 120, -50, 130, -130], 10, dk); line(c, [-120, -130, -110, -50, 120, -50, 130, -130], 5, col);
  for (const wx of [-100, 110]) { circle(c, wx, -26, 26); c.fillStyle = '#14161c'; c.fill(); circle(c, wx, -26, 9); c.fillStyle = '#6a7080'; c.fill(); }
  c.fillStyle = '#c8323a'; c.fillRect(-210, -412, 40, 18);
  c.restore();
}
function paper(c, x, y, r, s = 1, col = '#c9cdd6') { c.save(); c.translate(x, y); c.rotate(r); c.scale(s, s); c.beginPath(); c.moveTo(-40, -6); c.lineTo(36, -14); c.lineTo(44, 10); c.lineTo(-34, 16); c.closePath(); c.fillStyle = col; c.fill(); c.strokeStyle = 'rgba(0,0,0,.4)'; c.lineWidth = 2; c.stroke(); c.fillStyle = 'rgba(60,60,70,.4)'; for (let i = 0; i < 3; i++) c.fillRect(-26, -4 + i * 7, 50, 2); c.restore(); }
function litter(c, x0, x1, y, t, seed, n = 14, o = {}) {
  for (let i = 0; i < n; i++) {
    const x = x0 + rnd(seed + i) * (x1 - x0), yy = y + rnd(seed + i + 40) * (o.depth || 40), k = rnd(seed + i + 80), s = o.s || 1;
    if (k < .5) paper(c, x, yy, rnd(i) * 3, s * (.7 + rnd(i + 1) * .6), k < .25 ? '#b8bcc6' : '#a89a80');
    else if (k < .72) { c.save(); c.translate(x, yy); c.rotate(rnd(i) * 3); c.scale(s, s); c.beginPath(); c.roundRect(-30, -12, 60, 24, 10); c.fillStyle = ['#a83a3a', '#3a7aa8', '#c8b040'][i % 3]; c.fill(); c.fillStyle = 'rgba(255,255,255,.4)'; c.fillRect(-20, -12, 6, 24); c.restore(); }
    else if (k < .86) { c.save(); c.translate(x, yy); c.scale(s, s); c.beginPath(); c.moveTo(-60, 0); c.quadraticCurveTo(-70, -70, -10, -90); c.quadraticCurveTo(50, -80, 60, 0); c.closePath(); c.fillStyle = '#16181e'; c.fill(); c.fillStyle = 'rgba(160,180,220,.25)'; c.beginPath(); c.ellipse(-20, -60, 18, 10, -.5, 0, Math.PI * 2); c.fill(); c.restore(); }
    else { c.save(); c.translate(x, yy); c.rotate(rnd(i) * 2); c.scale(s, s); c.fillStyle = '#d8d0c0'; c.beginPath(); c.moveTo(-26, -20); c.lineTo(26, -20); c.lineTo(20, 18); c.lineTo(-20, 18); c.closePath(); c.fill(); c.restore(); }
  }
}
function plasticBag(c, x, y, t, s = 1, col = 'rgba(225,230,240,.75)') {
  c.save(); c.translate(x, y); c.rotate(Math.sin(t * 3) * .5); c.scale(s, s * (1 + Math.sin(t * 9) * .15));
  c.beginPath(); c.moveTo(-40, -30); c.quadraticCurveTo(-60 + Math.sin(t * 11) * 12, 20, -20, 46); c.quadraticCurveTo(0, 30 + Math.sin(t * 7) * 10, 24, 50); c.quadraticCurveTo(60, 10, 38, -30); c.quadraticCurveTo(26, -60, 18, -34); c.lineTo(-16, -34); c.quadraticCurveTo(-28, -60, -40, -30); c.closePath();
  c.fillStyle = col; c.fill(); c.strokeStyle = 'rgba(90,100,120,.6)'; c.lineWidth = 3; c.stroke(); c.restore();
}
function puddle(c, x, y, w, h, drawRefl, o = {}) {
  c.save(); c.beginPath(); c.ellipse(x, y, w, h, 0, 0, Math.PI * 2); c.fillStyle = o.base || 'rgba(10,14,26,.85)'; c.fill(); c.clip();
  if (drawRefl) { c.save(); c.translate(x, y); c.scale(1, -.9); c.translate(-x, -y); c.globalAlpha = o.a ?? .7; drawRefl(c); c.restore(); }
  c.strokeStyle = 'rgba(170,190,230,.18)'; c.lineWidth = 3; for (let i = 0; i < 5; i++) { c.beginPath(); c.ellipse(x + (i - 2) * w * .2, y + (i % 2 - .5) * h * .5, w * .25, h * .12, 0, 0, Math.PI * 2); c.stroke(); }
  c.restore(); c.beginPath(); c.ellipse(x, y, w, h, 0, 0, Math.PI * 2); c.strokeStyle = 'rgba(150,170,210,.2)'; c.lineWidth = 3; c.stroke();
}
// ---------- mall exterior + neon ----------
function neonState(i, t) {
  // letters 0..14 of EINKAUFSZENTRUM. 4..7 (AUFS) are dead. 8..14 (ZENTRUM) flicker on the shared glitch list; others buzz rarely.
  if (i >= 4 && i <= 7) return 0;
  const gl = TIMING.neon_glitch.some(([a, b]) => t >= a && t < b);
  if (i >= 8) return gl ? (Math.floor(t * 30) % 2 ? .15 : .9) : 1;
  if (i === 2 && gl && Math.floor(t * 30) % 3 === 0) return .3;
  return 1;
}
function neonSign(c, x, y, size, t, o = {}) {
  const txt = 'EINKAUFSZENTRUM'; c.save(); c.font = sans(size); c.textBaseline = 'alphabetic';
  const ws = [...txt].map(ch => c.measureText(ch).width), tw = ws.reduce((a, b) => a + b, 0) + (txt.length - 1) * size * .08;
  // backing board + brackets
  c.fillStyle = '#0c0f18'; c.fillRect(x - tw / 2 - 60, y - size * 1.05, tw + 120, size * 1.35); c.strokeStyle = '#262c3a'; c.lineWidth = 8; c.strokeRect(x - tw / 2 - 60, y - size * 1.05, tw + 120, size * 1.35);
  for (const bx of [-tw / 3, 0, tw / 3]) { c.fillStyle = '#10131c'; c.fillRect(x + bx - 8, y + size * .3, 16, 120); }
  let cx = x - tw / 2;
  for (let i = 0; i < txt.length; i++) {
    const on = neonState(i, t), ch = txt[i];
    if (on > .05) { c.save(); c.shadowColor = `rgba(255,60,110,${.9 * on})`; c.shadowBlur = size * .45 * on; c.fillStyle = `rgba(255,${120 + 100 * on},${170 + 50 * on},${.35 + .65 * on})`; c.fillText(ch, cx, y); c.restore(); c.lineWidth = size * .035; c.strokeStyle = `rgba(255,90,140,${on})`; c.strokeText(ch, cx, y); }
    else { c.fillStyle = '#2a2230'; c.fillText(ch, cx, y); c.lineWidth = size * .03; c.strokeStyle = '#3a3040'; c.strokeText(ch, cx, y); }
    cx += ws[i] + size * .08;
  }
  // overall glow on the facade
  const lvl = [...txt].reduce((a, _, i) => a + neonState(i, t), 0) / txt.length;
  bloom(c, x, y - size * .4, tw * .7, '255,60,120', .22 * lvl);
  c.restore();
  return lvl;
}
function mallFacade(c, x0, x1, base, h, t, o = {}) {
  const w = x1 - x0;
  c.fillStyle = '#121725'; c.fillRect(x0, base - h, w, h);
  c.fillStyle = '#0d111c'; c.fillRect(x0, base - h, w, 40); c.fillRect(x0, base - h * .62, w, 24);
  for (let i = 0; i <= 10; i++) { const px = x0 + i * w / 10; c.fillStyle = '#0f1422'; c.fillRect(px - 18, base - h, 36, h); c.fillStyle = 'rgba(120,140,190,.08)'; c.fillRect(px - 18, base - h, 6, h); }
  // dark upper windows (some broken)
  for (let i = 0; i < 10; i++) for (let j = 0; j < 2; j++) { const wx = x0 + i * w / 10 + 40, wy = base - h + 80 + j * 120; c.fillStyle = rnd(i * 7 + j) > .85 ? '#1e2638' : '#0a0d16'; c.fillRect(wx, wy, w / 10 - 80, 80); c.fillStyle = 'rgba(140,160,210,.12)'; c.beginPath(); c.moveTo(wx, wy + 80); c.lineTo(wx + 30, wy); c.lineTo(wx + 50, wy); c.lineTo(wx + 20, wy + 80); c.fill(); }
  // entrance: big glass front, dim emergency light inside
  const ex0 = x0 + w * .3, ex1 = x0 + w * .7, eh = h * .5;
  const g = c.createLinearGradient(0, base - eh, 0, base); g.addColorStop(0, '#0e1a22'); g.addColorStop(1, '#12302a'); c.fillStyle = g; c.fillRect(ex0, base - eh, ex1 - ex0, eh);
  bloom(c, (ex0 + ex1) / 2, base - eh * .7, 260, '60,220,140', .25); // green emergency-exit light deep inside
  c.fillStyle = '#0a0d14'; for (let i = 0; i <= 8; i++) c.fillRect(ex0 + i * (ex1 - ex0) / 8 - 6, base - eh, 12, eh); c.fillRect(ex0, base - eh, ex1 - ex0, 14);
  c.fillStyle = '#1a2030'; c.fillRect(ex0 - 40, base - eh - 50, ex1 - ex0 + 80, 50);
}
// ---------- interior: glass doors seen from inside ----------
function glassFront(c, x0, x1, top, base, t, o = {}) {
  // frames only (the glass itself is drawn as reflections over whatever is behind)
  const n = o.n || 6, w = (x1 - x0) / n;
  c.save(); c.globalCompositeOperation = 'screen';
  for (let i = 0; i < n; i++) { const gx = x0 + i * w; const g = c.createLinearGradient(gx, top, gx + w, base); g.addColorStop(0, 'rgba(120,150,200,.10)'); g.addColorStop(.5, 'rgba(120,150,200,.02)'); g.addColorStop(1, 'rgba(120,150,200,.08)'); c.fillStyle = g; c.fillRect(gx, top, w, base - top);
    c.fillStyle = 'rgba(200,220,255,.07)'; c.beginPath(); c.moveTo(gx + w * .15, top); c.lineTo(gx + w * .32, top); c.lineTo(gx + w * .05, base); c.lineTo(gx - w * .12, base); c.closePath(); c.fill(); }
  c.restore();
  // smudges / handprints on the glass
  c.fillStyle = 'rgba(190,200,220,.08)'; for (let i = 0; i < 30; i++) { const hx = x0 + rnd(i + 3) * (x1 - x0), hy = top + (base - top) * (.3 + rnd(i + 9) * .5); c.beginPath(); c.ellipse(hx, hy, 22, 28, rnd(i) * 2, 0, Math.PI * 2); c.fill(); }
  // mullions
  for (let i = 0; i <= n; i++) { const mx = x0 + i * w; c.fillStyle = '#05070c'; c.fillRect(mx - 22, top, 44, base - top); c.fillStyle = 'rgba(150,170,210,.18)'; c.fillRect(mx - 22, top, 5, base - top); }
  c.fillStyle = '#05070c'; c.fillRect(x0 - 40, top - 60, x1 - x0 + 80, 70); c.fillRect(x0 - 40, base - 40, x1 - x0 + 80, 50);
  c.fillStyle = 'rgba(150,170,210,.15)'; c.fillRect(x0 - 40, base - 40, x1 - x0 + 80, 5);
  // door push bars on the middle panes + sticker
  for (const i of o.doors || []) { const dx = x0 + i * w; c.fillStyle = '#1a1e28'; c.fillRect(dx + w * .15, top + (base - top) * .52, w * .7, 22); c.fillStyle = 'rgba(180,190,210,.35)'; c.fillRect(dx + w * .15, top + (base - top) * .52, w * .7, 5); }
  if (o.sticker) { const sx = x0 + w * o.sticker, sy = top + (base - top) * .3; c.save(); c.translate(sx + w * .5, sy); c.scale(-1, 1); c.font = sans(30); c.textAlign = 'center'; c.fillStyle = 'rgba(220,220,230,.45)'; c.fillText('Mo–Sa  9–20 Uhr', 0, 0); c.font = sans(24); c.fillText('Bitte Türen freihalten', 0, 40); c.restore(); }
}
function notausgang(c, x, y, s = 1, on = 1) {
  c.save(); c.translate(x, y); c.scale(s, s);
  bloom(c, 0, 0, 340, '40,230,120', .35 * on);
  c.beginPath(); c.roundRect(-210, -60, 420, 120, 10); c.fillStyle = on ? '#16a85a' : '#0e5a32'; c.fill(); c.lineWidth = 8; c.strokeStyle = '#e8f6ea'; c.stroke();
  // running man pictogram + door
  c.fillStyle = '#eafaf0'; c.fillRect(-190, -42, 70, 84); c.fillStyle = '#16a85a'; c.fillRect(-180, -32, 50, 74);
  c.fillStyle = '#eafaf0'; circle(c, -98, -30, 10); c.fill(); line(c, [-100, -18, -108, 10, -94, 34], 9, '#eafaf0'); line(c, [-108, 10, -124, 30], 9, '#eafaf0'); line(c, [-102, -10, -84, 2], 8, '#eafaf0'); line(c, [-102, -10, -118, -2], 8, '#eafaf0');
  c.font = sans(46); c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillStyle = '#f2fff6'; c.fillText('Notausgang', -64, 2);
  c.restore();
}
function adBoardFallen(c, x, y, s = 1, rot = -.18) {
  // toppled sale board (A-frame) lying on the floor
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  c.beginPath(); c.moveTo(-330, 0); c.lineTo(310, -40); c.lineTo(340, -230); c.lineTo(-300, -200); c.closePath(); c.fillStyle = '#20242e'; c.fill(); c.lineWidth = 10; c.strokeStyle = '#0a0c12'; c.stroke();
  c.beginPath(); c.moveTo(-290, -20); c.lineTo(290, -54); c.lineTo(312, -212); c.lineTo(-268, -186); c.closePath(); c.fillStyle = '#c23b3b'; c.fill();
  c.save(); c.clip(); c.translate(10, -110); c.rotate(-.06); c.font = sans(76); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#ffe9d8'; c.fillText('SALE −50 %', 0, -20); c.font = sans(34); c.fillText('NUR DIESE WOCHE', 0, 44); c.restore();
  c.fillStyle = 'rgba(0,10,30,.45)'; c.beginPath(); c.moveTo(-330, 0); c.lineTo(310, -40); c.lineTo(340, -230); c.lineTo(-300, -200); c.closePath(); c.fill();
  line(c, [-300, -200, -380, 30], 14, '#3a3f4c'); line(c, [340, -230, 400, -20], 14, '#3a3f4c');
  c.restore();
}
function shelfUnit(c, x, base, w, h, o = {}) {
  c.save(); c.translate(x, base); if (o.rot) c.rotate(o.rot);
  c.fillStyle = '#1a1f2a'; c.fillRect(-w / 2, -h, w, h); c.strokeStyle = '#090b10'; c.lineWidth = 10; c.strokeRect(-w / 2, -h, w, h);
  for (let i = 1; i < 5; i++) { c.fillStyle = '#2a3040'; c.fillRect(-w / 2, -h + i * h / 5, w, 14); for (let j = 0; j < 6; j++) if (rnd(i * 9 + j + (o.seed || 0)) > .35) { c.fillStyle = ['#5a3030', '#30405a', '#5a5030', '#3a5a40'][(i + j) % 4]; c.fillRect(-w / 2 + 14 + j * (w - 28) / 6, -h + i * h / 5 - 60, (w - 28) / 6 - 10, 60); } }
  c.restore();
}
// ---------- roof ----------
function hvacUnit(c, x, base, s = 1, t = 0) {
  c.save(); c.translate(x, base); c.scale(s, s);
  c.fillStyle = '#2a303c'; c.fillRect(-420, -520, 840, 520); c.lineWidth = 12; c.strokeStyle = '#0a0c12'; c.strokeRect(-420, -520, 840, 520);
  c.fillStyle = '#353c4a'; c.fillRect(-420, -520, 840, 50);
  for (let i = 0; i < 12; i++) { c.fillStyle = '#1c212b'; c.fillRect(-380, -440 + i * 30, 360, 12); }
  circle(c, 200, -260, 170); c.fillStyle = '#12161e'; c.fill(); c.lineWidth = 12; c.strokeStyle = '#0a0c12'; c.stroke();
  c.save(); c.translate(200, -260); c.rotate(t * .6); for (let i = 0; i < 5; i++) { c.rotate(Math.PI * 2 / 5); c.beginPath(); c.ellipse(0, -80, 34, 80, .3, 0, Math.PI * 2); c.fillStyle = '#3a4252'; c.fill(); } c.restore();
  c.strokeStyle = '#4a5262'; c.lineWidth = 5; for (let i = -150; i <= 150; i += 30) { c.beginPath(); c.moveTo(200 + i, -260 - Math.sqrt(170 * 170 - i * i)); c.lineTo(200 + i, -260 + Math.sqrt(170 * 170 - i * i)); c.stroke(); }
  c.fillStyle = 'rgba(160,180,230,.18)'; c.fillRect(-420, -520, 840, 10); c.fillRect(380, -520, 40, 520);
  line(c, [-420, -120, -560, -120, -560, 0], 40, '#0a0c12'); line(c, [-420, -120, -560, -120, -560, 0], 26, '#3a4252');
  c.restore();
}
function rainBarrel(c, x, base, s = 1, col = '#2f6fa8') {
  c.save(); c.translate(x, base); c.scale(s, s);
  c.beginPath(); c.moveTo(-90, -300); c.quadraticCurveTo(-110, -150, -90, 0); c.lineTo(90, 0); c.quadraticCurveTo(110, -150, 90, -300); c.closePath(); c.fillStyle = col; c.fill(); c.lineWidth = 10; c.strokeStyle = '#0a0c12'; c.stroke();
  for (const y of [-240, -70]) { c.fillStyle = shadeHex(col, -.3); c.fillRect(-104, y, 208, 18); }
  c.beginPath(); c.ellipse(0, -300, 90, 22, 0, 0, Math.PI * 2); c.fillStyle = '#0e1828'; c.fill(); c.stroke();
  c.beginPath(); c.ellipse(0, -298, 70, 14, 0, 0, Math.PI * 2); c.fillStyle = 'rgba(160,190,240,.35)'; c.fill(); // rain water catching moonlight
  // funnel tarp above
  c.beginPath(); c.moveTo(-170, -420); c.lineTo(170, -420); c.lineTo(20, -310); c.lineTo(-20, -310); c.closePath(); c.fillStyle = '#3c5a7a'; c.fill(); c.lineWidth = 6; c.stroke();
  line(c, [-170, -420, -180, -300], 6, '#5a5040'); line(c, [170, -420, 180, -300], 6, '#5a5040');
  c.restore();
}
function tarpTent(c, x, base, s = 1, col = '#3a6a8a') {
  c.save(); c.translate(x, base); c.scale(s, s);
  c.beginPath(); c.moveTo(-300, 0); c.lineTo(-20, -330); c.lineTo(320, 0); c.closePath(); c.fillStyle = col; c.fill(); c.lineWidth = 10; c.strokeStyle = '#0a0c12'; c.stroke();
  c.beginPath(); c.moveTo(-20, -330); c.lineTo(-60, 0); c.lineTo(80, 0); c.closePath(); c.fillStyle = '#0c1018'; c.fill();
  c.strokeStyle = shadeHex(col, -.3); c.lineWidth = 5; for (let i = 1; i < 4; i++) { c.beginPath(); c.moveTo(-20 - i * 60, -330 + i * 70); c.lineTo(-20 + i * 70, -330 + i * 74); c.stroke(); }
  line(c, [-20, -330, -20, -380], 10, '#6a5a40'); line(c, [-300, 0, -380, 20], 3, '#8a8070'); line(c, [320, 0, 400, 20], 3, '#8a8070');
  c.restore();
}
function planter(c, x, base, w = 320, t = 0) {
  c.beginPath(); c.rect(x - w / 2, base - 110, w, 110); c.fillStyle = '#6a4a30'; c.fill(); c.lineWidth = 9; c.strokeStyle = '#0a0c12'; c.stroke();
  c.fillStyle = '#4a3220'; c.fillRect(x - w / 2, base - 110, w, 24);
  for (let i = 0; i < 8; i++) { const px = x - w / 2 + 25 + i * (w - 50) / 7, sw = Math.sin(t * 2 + i) * .06; // radish sprouts
    c.save(); c.translate(px, base - 108); c.rotate(sw); for (const s of [-1, 1]) { c.beginPath(); c.ellipse(s * 16, -38, 20, 10, s * -.6, 0, Math.PI * 2); c.fillStyle = '#5aa04a'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#0a0c12'; c.stroke(); } line(c, [0, 0, 0, -30], 5, '#4a8a3a'); c.restore();
    if (i % 3 === 1) { circle(c, px, base - 104, 10); c.fillStyle = '#d84a6a'; c.fill(); } }
}
function antennaMast(c, x, base, h) { line(c, [x, base, x, base - h], 12, '#0a0c12'); line(c, [x, base, x, base - h], 6, '#5a6272'); for (let i = 1; i < 4; i++) line(c, [x - 60 / i, base - h + i * 60, x + 60 / i, base - h + i * 60], 6, '#5a6272'); line(c, [x, base - h + 40, x - 160, base], 3, '#3a4252'); line(c, [x, base - h + 40, x + 160, base], 3, '#3a4252'); c.fillStyle = '#ff3030'; circle(c, x, base - h, 8); c.fill(); }
function roofHILFE(c, x, y, w, sy = .2, a = .85) {
  // giant white painted letters on the roof floor, foreshortened (seen at a low angle)
  c.save(); c.translate(x, y); c.scale(1, sy); c.font = sans(w / 3.1); c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillStyle = `rgba(232,236,240,${a})`; c.fillText('HILFE', 0, 0);
  c.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 60; i++) { c.beginPath(); c.arc((rnd(i + 3) - .5) * w, (rnd(i + 7) - .5) * w / 3.4, 6 + rnd(i) * 14, 0, Math.PI * 2); c.fill(); } // worn paint
  c.restore();
}
function flashlightProp(c, x, y, ang, s = 1, on = 1) {
  c.save(); c.translate(x, y); c.rotate(ang); c.scale(s, s);
  c.beginPath(); c.roundRect(-110, -22, 150, 44, 10); c.fillStyle = '#2a2e38'; c.fill(); c.lineWidth = 8; c.strokeStyle = '#0a0c12'; c.stroke();
  c.beginPath(); c.moveTo(40, -26); c.lineTo(90, -38); c.lineTo(90, 38); c.lineTo(40, 26); c.closePath(); c.fillStyle = '#3a3f4c'; c.fill(); c.stroke();
  c.fillStyle = on > .05 ? `rgba(255,235,180,${.4 + .6 * on})` : '#555a66'; c.fillRect(86, -34, 8, 68);
  c.fillStyle = '#c84a2a'; c.fillRect(-60, -24, 22, 6);
  c.restore();
}
function torchBeam(c, x, y, ang, len, spread, on, col = '255,214,150') {
  // volumetric cone through fog: layered translucent wedges (screen), no blur
  if (on <= 0) return; c.save(); c.translate(x, y); c.rotate(ang); c.globalCompositeOperation = 'screen';
  for (let i = 0; i < 4; i++) { const sp = spread * (1 - i * .22), g = c.createLinearGradient(0, 0, len, 0); g.addColorStop(0, `rgba(${col},${.22 * on})`); g.addColorStop(.7, `rgba(${col},${.07 * on})`); g.addColorStop(1, `rgba(${col},0)`);
    c.fillStyle = g; c.beginPath(); c.moveTo(0, -12); c.lineTo(len, -len * sp); c.lineTo(len, len * sp); c.lineTo(0, 12); c.closePath(); c.fill(); }
  c.restore(); bloom(c, x, y, 120, col, .6 * on);
}
function fogBand(c, x0, x1, y, h, a, t, col = NIGHT.fog, sp = 20) {
  for (let i = 0; i < 9; i++) { const cx = x0 + ((rnd(i + 17) * (x1 - x0) + t * sp * (1 + rnd(i) * .6)) % (x1 - x0)), r = h * (.8 + rnd(i + 4) * .9);
    const g = c.createRadialGradient(cx, y, 0, cx, y, r); g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(1, `rgba(${col},0)`); c.fillStyle = g; c.beginPath(); c.ellipse(cx, y, r * 2.2, r * .6, 0, 0, Math.PI * 2); c.fill(); }
}
function dust(c, x0, x1, y0, y1, t, n = 40, col = '200,215,255', a = .5) { motes(c, x0, x1, y0, y1, t, { n, color: col, alpha: a, speed: .02 }); }
