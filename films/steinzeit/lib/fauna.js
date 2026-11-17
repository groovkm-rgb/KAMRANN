// ICE-AGE FAUNA, side view, true proportions (1 m ≈ 220 world units), feet on y = 0, facing right (o.s = -1 faces left).
// fn(c, x, { s, sc, t, walk: phase|null, run: 0|1, graze: 0..1, y, a (alpha), dark (silhouette 0..1) })
// rentier, wildpferd, bison, mammut (o.calf for a calf), wollnashorn, riesenhirsch, loewe, wolf; vogel(c, x, y, o) flying; hase
const FINK = 6, FOUT = '#231a16';
function fStart(c, x, o) { c.save(); c.translate(x, o.y || 0); c.scale((o.s || 1) * (o.sc || 1), o.sc || 1); if (o.a != null) c.globalAlpha *= o.a; }
function fFill(c, top, bot, y0, y1, lw = FINK) { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, top); g.addColorStop(1, bot); c.fillStyle = g; c.fill(); if (lw) { c.lineWidth = lw; c.strokeStyle = FOUT; c.lineJoin = 'round'; c.stroke(); } }
function fLeg(c, hx, hy, L1, L2, ang, bend, w, col, foot = 'hoof', fcol = '#2a2018') {
  // tapered limb: wide at the body, slimmer at the ankle; small hoof / paw / pad foot
  const kx = hx + Math.sin(ang) * L1, ky = hy + Math.cos(ang) * L1, a2 = ang - bend, ax = kx + Math.sin(a2) * L2, ay = Math.min(0, ky + Math.cos(a2) * L2);
  const pad = foot === 'pad', w0 = w * (pad ? 1.15 : 1.5), w1 = w * (pad ? 1 : .78), w2 = w * (pad ? .95 : .5);
  const n1 = [Math.cos(ang), -Math.sin(ang)], n2 = [Math.cos(a2), -Math.sin(a2)];
  c.beginPath(); c.moveTo(hx - n1[0] * w0 / 2, hy - n1[1] * w0 / 2 - w); c.lineTo(kx - n1[0] * w1 / 2, ky - n1[1] * w1 / 2); c.lineTo(ax - n2[0] * w2 / 2, ay - n2[1] * w2 / 2);
  c.lineTo(ax + n2[0] * w2 / 2, ay + n2[1] * w2 / 2); c.lineTo(kx + n1[0] * w1 / 2, ky + n1[1] * w1 / 2); c.lineTo(hx + n1[0] * w0 / 2, hy + n1[1] * w0 / 2 - w); c.closePath();
  const g = c.createLinearGradient(0, hy - w, 0, ay); g.addColorStop(0, col); g.addColorStop(1, shade(col, -.25)); c.fillStyle = g; c.fill(); c.lineWidth = FINK; c.strokeStyle = FOUT; c.lineJoin = 'round'; c.stroke();
  if (foot === 'hoof') { const hw = w2 * .75; c.beginPath(); c.moveTo(ax - hw, ay - hw * 1.1); c.lineTo(ax + hw, ay - hw * 1.1); c.lineTo(ax + hw * 1.25, ay + 2); c.lineTo(ax - hw * 1.05, ay + 2); c.closePath(); c.fillStyle = fcol; c.fill(); c.lineWidth = 3; c.strokeStyle = FOUT; c.stroke(); }
  else if (foot === 'paw') { ell(c, ax + w2 * .45, ay - w2 * .35, w2 * .95, w2 * .45); c.fillStyle = col; c.fill(); c.lineWidth = FINK * .8; c.strokeStyle = FOUT; c.stroke(); }
  else if (pad) { c.beginPath(); c.moveTo(ax - w2 * .55, ay - w2 * .3); c.lineTo(ax + w2 * .6, ay - w2 * .3); c.lineTo(ax + w2 * .62, ay + 2); c.lineTo(ax - w2 * .58, ay + 2); c.closePath(); c.fillStyle = fcol; c.fill(); c.lineWidth = 4; c.strokeStyle = FOUT; c.stroke(); for (const tx of [-.3, 0, .3]) { ell(c, ax + w2 * tx, ay - 3, w2 * .1, w2 * .06); c.fillStyle = '#d8ccb4'; c.fill(); } }
}
// gait: returns [ang, bend] for leg i (0 = near front, 1 = far front, 2 = near hind, 3 = far hind)
function gait(o, i, amp = .38) {
  if (o.walk == null) return [[.04, 0], [-.04, 0], [-.04, 0], [.04, 0]][i];
  const off = o.run ? [0, .15, .55, .7][i] : [0, .5, .25, .75][i], ph = o.walk + off * Math.PI * 2;
  const A = amp * (o.run ? 1.5 : 1);
  return [Math.sin(ph) * A, Math.max(0, Math.cos(ph)) * (o.run ? 1.1 : .7)];
}
function furStrokes(c, x0, y0, x1, y1, n, seed, col, len = 20, lw = 3, dir = 1.4) { c.save(); c.clip(); c.lineCap = 'round'; for (let i = 0; i < n; i++) { const x = x0 + rnd(seed + i) * (x1 - x0), y = y0 + rnd(seed + i + 99) * (y1 - y0), a = dir + (rnd(seed + i + 7) - .5) * .5; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len); c.lineWidth = lw; c.strokeStyle = col[i % col.length]; c.stroke(); } c.restore(); }
function fEye(c, x, y, r) { circle(c, x, y, r); c.fillStyle = '#120c0a'; c.fill(); circle(c, x + r * .35, y - r * .35, r * .35); c.fillStyle = 'rgba(255,255,255,.85)'; c.fill(); }
function breathPuff(c, x, y, t, o = {}) { if (!o.cold) return; for (let i = 0; i < 3; i++) { const ph = (t * .5 + i / 3) % 1; const g = c.createRadialGradient(x + ph * 60, y - ph * 20, 0, x + ph * 60, y - ph * 20, 20 + ph * 40); g.addColorStop(0, `rgba(240,245,250,${.35 * (1 - ph)})`); g.addColorStop(1, 'rgba(240,245,250,0)'); c.fillStyle = g; c.fillRect(x - 80, y - 120, 300, 200); } }
function silhouette(c, o) { if (o.dark) { c.globalCompositeOperation = 'source-atop'; c.fillStyle = `rgba(${o.darkCol || '30,26,34'},${o.dark})`; c.fillRect(-3000, -3000, 6000, 3200); c.globalCompositeOperation = 'source-over'; } }
function fLayer(c, o, fn) { if (!o.dark) return fn(c); const L = _fl(); L.c.setTransform(1, 0, 0, 1, 0, 0); L.c.clearRect(0, 0, W, H); L.c.setTransform(c.getTransform()); fn(L.c); silhouette(L.c, o); c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = o.a ?? 1; c.drawImage(L.cv, 0, 0); c.restore(); }
let _flc = null; function _fl() { if (!_flc) { const cv = document.createElement('canvas'); cv.width = 1920; cv.height = 1080; _flc = { cv, c: cv.getContext('2d') }; } return _flc; }

// ---------------- REINDEER (shoulder ≈ 1,1 m) ----------------
function rentier(c, x, o = {}) { fLayer(c, o, c => { fStart(c, x, o); const t = o.t || 0, gz = o.graze || 0, male = o.male ?? 1;
  const by = -250 + (o.walk != null ? Math.abs(Math.sin(o.walk)) * -6 : 0);
  const G = i => gait(o, i);
  fLeg(c, 120, by + 20, 120, 130, G(1)[0], G(1)[1], 26, '#6a5a4a'); fLeg(c, -140, by + 20, 120, 130, G(3)[0], G(3)[1] * -1, 28, '#6a5a4a');
  fLeg(c, 110, by + 20, 120, 130, G(0)[0], G(0)[1], 28, '#7a6a58'); fLeg(c, -150, by + 20, 125, 130, G(2)[0], G(2)[1] * -1, 30, '#7a6a58');
  // body
  c.beginPath(); c.moveTo(-200, by - 10); c.bezierCurveTo(-210, by - 80, -60, by - 90, 100, by - 80); c.bezierCurveTo(170, by - 80, 200, by - 40, 190, by + 20); c.bezierCurveTo(170, by + 70, -120, by + 75, -185, by + 40); c.closePath();
  fFill(c, '#8e7c68', '#5e5044', by - 90, by + 70); furStrokes(c, -210, by - 90, 200, by + 70, 60, 3, ['#a8987e', '#4e4238'], 18, 3);
  // pale belly + rump patch
  c.save(); c.beginPath(); c.ellipse(-20, by + 52, 150, 22, 0, 0, Math.PI * 2); c.fillStyle = 'rgba(230,222,205,.7)'; c.fill(); c.beginPath(); c.ellipse(-190, by + 5, 30, 40, 0, 0, Math.PI * 2); c.fill(); c.restore();
  // neck + pale mane + head
  const hx = 270, hy = by - 150 + gz * 230, na = gz * .9;
  c.beginPath(); c.moveTo(120, by - 70); c.quadraticCurveTo(200, by - 140 + gz * 120, hx - 20, hy - 10); c.lineTo(hx + 10, hy + 40); c.quadraticCurveTo(220, by - 20 + gz * 60, 170, by + 30); c.closePath(); fFill(c, '#8e7c68', '#6a5a4a', by - 160, by + 30);
  c.beginPath(); c.moveTo(150, by - 30 + gz * 20); c.quadraticCurveTo(230, by - 30 + gz * 100, hx - 10, hy + 40); c.quadraticCurveTo(215, by + 60 + gz * 40, 150, by + 40); c.closePath(); fFill(c, '#efe6d4', '#cfc2a8', by - 40, by + 60, 4);
  c.save(); c.translate(hx, hy); c.rotate(.25 + na); c.scale(1.2, 1.2);
  c.beginPath(); c.moveTo(-30, -25); c.quadraticCurveTo(30, -40, 90, -10); c.quadraticCurveTo(110, 10, 92, 26); c.quadraticCurveTo(30, 34, -30, 28); c.closePath(); fFill(c, '#8a7864', '#5e5044', -40, 30);
  ell(c, 98, 10, 14, 12); c.fillStyle = '#3a2e28'; c.fill(); fEye(c, 18, -8, 7);
  c.beginPath(); c.ellipse(-20, -32, 22, 10, -.6, 0, Math.PI * 2); fFill(c, '#8a7864', '#6a5a4a', -40, -22, 4);
  // antlers (both sexes; males bigger), velvet brown with pale tips
  const A = male ? 1 : .62, ant = (sx, col) => {
    const bm = (u) => [(-10 + sx) + (-120 * u + 160 * u * u) * A, -30 - 270 * u * A];
    c.beginPath(); for (let i = 0; i <= 12; i++) { const [px, py] = bm(i / 12); i ? c.lineTo(px, py) : c.moveTo(px, py); } c.lineWidth = 20 * A + 6; c.strokeStyle = FOUT; c.lineCap = 'round'; c.stroke(); c.lineWidth = 14 * A; c.strokeStyle = col; c.stroke();
    for (const [u, dx, dy] of [[.45, -50, -40], [.7, -40, -50], [.88, 30, -40], [1, 50, -10]]) { const [px, py] = bm(u); c.beginPath(); c.moveTo(px, py); c.lineTo(px + dx * A, py + dy * A); c.lineWidth = 14 * A + 6; c.strokeStyle = FOUT; c.stroke(); c.lineWidth = 9 * A; c.strokeStyle = col; c.stroke(); }
    // palmate brow tine reaching forward over the face
    const [bx, by2] = bm(.12); c.beginPath(); c.moveTo(bx, by2); c.quadraticCurveTo(bx + 50, by2 - 40, bx + 80 * A, by2 + 10); c.lineWidth = 16 * A + 6; c.strokeStyle = FOUT; c.stroke(); c.lineWidth = 11 * A; c.strokeStyle = col; c.stroke(); };
  ant(16, '#bfae8c'); ant(0, '#ddd0b0');
  c.restore();
  breathPuff(c, hx + 90, hy + 20, t, o);
  // short tail
  c.beginPath(); c.ellipse(-205, by - 20, 18, 26, .4, 0, Math.PI * 2); fFill(c, '#efe6d4', '#cfc2a8', by - 45, by + 5, 4);
  c.restore(); }); }

// ---------------- WILD HORSE (shoulder ≈ 1,35 m, stocky, dun, dorsal stripe, upright mane, dark legs) ----------------
function wildpferd(c, x, o = {}) { fLayer(c, o, c => { fStart(c, x, o); const t = o.t || 0, gz = o.graze || 0, G = i => gait(o, i, .42);
  const by = -300 + (o.walk != null ? Math.abs(Math.sin(o.walk)) * -8 : 0);
  fLeg(c, 150, by + 30, 140, 150, G(1)[0], G(1)[1], 30, '#3a2c22'); fLeg(c, -150, by + 30, 140, 150, G(3)[0], -G(3)[1], 34, '#3a2c22');
  fLeg(c, 140, by + 30, 140, 150, G(0)[0], G(0)[1], 32, '#4a382a'); fLeg(c, -160, by + 30, 140, 150, G(2)[0], -G(2)[1], 36, '#4a382a');
  c.beginPath(); c.moveTo(-230, by - 20); c.bezierCurveTo(-240, by - 110, -60, by - 110, 120, by - 100); c.bezierCurveTo(210, by - 95, 240, by - 40, 220, by + 30); c.bezierCurveTo(190, by + 90, -150, by + 95, -220, by + 50); c.closePath();
  fFill(c, '#c9a06a', '#9a7448', by - 110, by + 90); furStrokes(c, -240, by - 110, 240, by + 90, 50, 21, ['#dcb680', '#8a6440'], 16, 3);
  c.save(); c.beginPath(); c.moveTo(-230, by - 80); c.quadraticCurveTo(0, by - 118, 140, by - 102); c.lineWidth = 12; c.strokeStyle = '#3a2a1e'; c.stroke(); c.restore();
  c.beginPath(); c.ellipse(-10, by + 60, 160, 24, 0, 0, Math.PI * 2); c.fillStyle = 'rgba(240,226,196,.55)'; c.fill();
  // neck + head
  const hx = 320, hy = by - 190 + gz * 290;
  c.beginPath(); c.moveTo(130, by - 90); c.quadraticCurveTo(230, by - 200 + gz * 160, hx - 30, hy - 20); c.lineTo(hx + 10, hy + 50); c.quadraticCurveTo(250, by + gz * 80, 200, by + 40); c.closePath(); fFill(c, '#c9a06a', '#a07a4c', by - 200, by + 40);
  // upright mane (short, dark)
  c.beginPath(); for (let i = 0; i <= 10; i++) { const u = i / 10, mx = 130 + (hx - 40 - 130) * u, my = by - 92 + (hy - 30 - (by - 92)) * u - 4; c.lineTo(mx - 10, my - 34 - (i % 2) * 10); } c.lineTo(hx - 20, hy - 10); c.lineTo(140, by - 70); c.closePath(); fFill(c, '#3a2a1e', '#2a1e16', by - 220, by - 60, 4);
  c.save(); c.translate(hx, hy); c.rotate(.55 + gz * .7);
  c.beginPath(); c.moveTo(-40, -30); c.quadraticCurveTo(40, -45, 120, -8); c.quadraticCurveTo(140, 20, 120, 40); c.quadraticCurveTo(40, 46, -40, 34); c.closePath(); fFill(c, '#c9a06a', '#9a7448', -40, 40);
  c.beginPath(); c.ellipse(112, 20, 30, 24, 0, 0, Math.PI * 2); c.fillStyle = '#efe0c0'; c.fill(); ell(c, 124, 16, 6, 5); c.fillStyle = '#2a1e16'; c.fill(); fEye(c, 14, -10, 8);
  c.beginPath(); c.moveTo(-26, -30); c.lineTo(-18, -70); c.lineTo(0, -32); c.closePath(); fFill(c, '#b89060', '#8a6440', -70, -30, 4);
  c.restore();
  breathPuff(c, hx + 120, hy + 40, t, o);
  // tail
  c.beginPath(); c.moveTo(-225, by - 40); c.quadraticCurveTo(-290 - Math.sin(t * 2) * 10, by + 40, -260 + Math.sin(t * 2.3) * 14, by + 160); c.quadraticCurveTo(-240, by + 60, -215, by - 10); c.closePath(); fFill(c, '#3a2a1e', '#1e1610', by - 40, by + 160, 4);
  c.restore(); }); }

// ---------------- STEPPE BISON (shoulder ≈ 2 m, long wide horns, hump, dark thick coat) ----------------
function bison(c, x, o = {}) { fLayer(c, o, c => { fStart(c, x, o); const t = o.t || 0, gz = o.graze || 0, G = i => gait(o, i, .3);
  const by = -330;
  fLeg(c, 190, by + 60, 140, 150, G(1)[0], G(1)[1], 44, '#2e2018'); fLeg(c, -230, by + 50, 150, 150, G(3)[0], -G(3)[1], 46, '#2e2018');
  fLeg(c, 170, by + 70, 140, 150, G(0)[0], G(0)[1], 48, '#3a281c'); fLeg(c, -250, by + 60, 150, 150, G(2)[0], -G(2)[1], 50, '#3a281c');
  c.beginPath(); c.moveTo(-320, by + 10); c.bezierCurveTo(-330, by - 100, -150, by - 120, 40, by - 150); c.bezierCurveTo(140, by - 260, 280, by - 230, 320, by - 80); c.bezierCurveTo(340, by + 20, 300, by + 120, 200, by + 120); c.lineTo(-250, by + 110); c.quadraticCurveTo(-320, by + 90, -320, by + 10); c.closePath();
  fFill(c, '#5a3e2a', '#2e1e14', by - 260, by + 120); furStrokes(c, -330, by - 260, 340, by + 120, 110, 33, ['#6e4e36', '#24160e'], 24, 4);
  // shaggy front (beard / mane)
  c.beginPath(); c.moveTo(150, by - 210); c.quadraticCurveTo(330, by - 200, 340, by - 20); c.quadraticCurveTo(350, by + 120, 300, by + 170); for (let i = 0; i < 6; i++) c.lineTo(300 - i * 22, by + 150 + (i % 2) * 26); c.quadraticCurveTo(160, by + 40, 150, by - 210); c.closePath(); fFill(c, '#3e2a1c', '#22160e', by - 210, by + 170, 4);
  // head low
  const hx = 380, hy = by + 40 + gz * 140;
  c.save(); c.translate(hx, hy); c.rotate(gz * .3);
  c.beginPath(); c.moveTo(-70, -90); c.quadraticCurveTo(40, -110, 80, -30); c.quadraticCurveTo(100, 40, 60, 90); c.quadraticCurveTo(0, 110, -60, 70); c.closePath(); fFill(c, '#3e2a1c', '#1e140c', -110, 110);
  ell(c, 66, 70, 22, 16); c.fillStyle = '#2a1e18'; c.fill(); fEye(c, 30, -10, 8);
  // long, wide upswept horns
  for (const [dx, col] of [[-10, '#8a8278'], [10, '#d6cdb8']]) { c.beginPath(); c.moveTo(-10 + dx, -70); c.bezierCurveTo(-90 + dx, -110, -150 + dx * 2, -150, -140 + dx * 3, -230); c.lineWidth = 26; c.strokeStyle = FOUT; c.stroke(); c.lineWidth = 16; c.strokeStyle = col; c.stroke(); }
  c.restore();
  breathPuff(c, hx + 80, hy + 80, t, o);
  line(c, [-320, by - 10, -360 + Math.sin(t * 2) * 8, by + 120], 14, FOUT); line(c, [-320, by - 10, -360 + Math.sin(t * 2) * 8, by + 120], 8, '#3a281c');
  c.restore(); }); }

// ---------------- WOOLLY MAMMOTH (shoulder ≈ 3,2 m: high domed head, sloping back, small ears, long curved tusks) ----------------
function mammut(c, x, o = {}) { fLayer(c, o, c => { fStart(c, x, o); const t = o.t || 0, G = i => gait(o, i, .2), gz = o.graze || 0, trunk = o.trunk ?? (Math.sin(t * .8) * .5 + .5);
  const by = -520 + (o.walk != null ? Math.abs(Math.sin(o.walk)) * -10 : 0);
  const legC = '#5a3218';
  fLeg(c, 260, by + 120, 230, 230, G(1)[0], G(1)[1] * .5, 96, '#4a2a14', 'pad', '#3a2a22'); fLeg(c, -300, by + 120, 230, 230, G(3)[0], -G(3)[1] * .5, 96, '#4a2a14', 'pad', '#3a2a22');
  fLeg(c, 230, by + 140, 230, 230, G(0)[0], G(0)[1] * .5, 104, legC, 'pad', '#3a2a22'); fLeg(c, -330, by + 140, 230, 230, G(2)[0], -G(2)[1] * .5, 104, legC, 'pad', '#3a2a22');
  // body: highest at the shoulders, sloping to a low rump
  c.beginPath(); c.moveTo(-420, by + 40); c.bezierCurveTo(-440, by - 120, -300, by - 180, -40, by - 240); c.bezierCurveTo(150, by - 300, 300, by - 300, 380, by - 200); c.bezierCurveTo(440, by - 100, 430, by + 150, 330, by + 200); c.lineTo(-320, by + 200); c.quadraticCurveTo(-420, by + 170, -420, by + 40); c.closePath();
  fFill(c, '#8a4e26', '#4a2610', by - 300, by + 200); furStrokes(c, -440, by - 300, 440, by + 200, 220, 51, ['#a8622e', '#5a2e14', '#c47a3a'], 34, 5, 1.55);
  // long hair hanging from the belly (strands, not a solid skirt)
  c.save(); c.lineCap = 'round'; for (let i = 0; i < 46; i++) { const xx = -380 + i * 16, L = 60 + rnd(i + 70) * 70, sw = Math.sin(t * 2 + i * .7) * 6; line(c, [xx, by + 150, xx + sw, by + 150 + L], 10, '#2a1408'); line(c, [xx, by + 150, xx + sw, by + 150 + L], 6, i % 3 ? '#6e3a1a' : '#8a4a22'); } c.restore();
  // head dome + trunk
  const hx = 400, hy = by - 160;
  c.beginPath(); c.moveTo(300, by - 260); c.bezierCurveTo(360, by - 420, 520, by - 400, 540, by - 250); c.bezierCurveTo(560, by - 150, 540, by - 40, 500, by); c.lineTo(380, by + 40); c.quadraticCurveTo(320, by - 100, 300, by - 260); c.closePath();
  fFill(c, '#94562a', '#5a2e14', by - 420, by + 40); furStrokes(c, 300, by - 420, 560, by + 40, 70, 61, ['#b06a34', '#5a2e14'], 26, 4, 1.7);
  // trunk (curls with trunk param)
  const tk = trunk, tx1 = 600 + 40 * tk, ty1 = by + 160, tx2 = 600 + 90 * tk + gz * 20, ty2 = by + 330 - 90 * tk * (1 - gz) + gz * 150;
  c.beginPath(); c.moveTo(500, by - 60); c.bezierCurveTo(600, by + 20, tx1, ty1, tx2, ty2); c.lineWidth = 86; c.strokeStyle = FOUT; c.lineCap = 'round'; c.stroke(); c.lineWidth = 74; c.strokeStyle = '#7a4420'; c.stroke();
  if (!gz) { c.beginPath(); c.arc(tx2 - 26, ty2, 30, 0, Math.PI * 1.2); c.lineWidth = 50; c.strokeStyle = FOUT; c.stroke(); c.lineWidth = 38; c.strokeStyle = '#7a4420'; c.stroke(); }
  for (let i = 0; i < 9; i++) { const u = i / 9; const px = (1 - u) ** 3 * 500 + 3 * (1 - u) ** 2 * u * 580 + 3 * (1 - u) * u * u * tx1 + u ** 3 * tx2, py = (1 - u) ** 3 * (by - 60) + 3 * (1 - u) ** 2 * u * (by + 40) + 3 * (1 - u) * u * u * ty1 + u ** 3 * ty2; line(c, [px - 30, py, px + 30, py + 6], 3, '#4a2410'); }
  // grass tuft in the trunk when grazing
  if (gz > .3) for (let i = 0; i < 7; i++) line(c, [tx2, ty2, tx2 - 30 + i * 10, ty2 + 40 + rnd(i) * 30], 6, '#b8a050');
  // small ear
  c.beginPath(); c.ellipse(390, by - 200, 46, 60, -.2, 0, Math.PI * 2); fFill(c, '#7a4420', '#4a2410', by - 260, by - 140, 5);
  fEye(c, 470, by - 170, 10);
  // tusks: long, curving out, forward and up
  for (const [dx, a] of [[0, 1], [-30, .75]]) { c.beginPath(); c.moveTo(480 + dx, by - 40); c.bezierCurveTo(640 + dx, by + 140, 820 + dx, by + 60, 760 + dx * 2, by - 160); c.lineWidth = 38 * a + 12; c.strokeStyle = FOUT; c.lineCap = 'round'; c.stroke(); c.lineWidth = 38 * a; c.strokeStyle = a === 1 ? '#efe4c8' : '#c8bc9e'; c.stroke(); }
  breathPuff(c, tx2 + 20, ty2 - 20, t, o);
  // short tail
  c.beginPath(); c.moveTo(-415, by); c.quadraticCurveTo(-460, by + 80, -450, by + 140); c.lineWidth = 22; c.strokeStyle = FOUT; c.stroke(); c.lineWidth = 12; c.strokeStyle = '#6e3a1a'; c.stroke();
  c.restore(); }); }

// ---------------- WOOLLY RHINO (shoulder ≈ 1,7 m, head held low, long flat front horn up to 1 m, small 2nd horn, hump) ----------------
function wollnashorn(c, x, o = {}) { fLayer(c, o, c => { fStart(c, x, o); const t = o.t || 0, G = i => gait(o, i, .25), push = o.push || 0;
  const by = -270;
  fLeg(c, 240, by + 80, 120, 110, G(1)[0], G(1)[1] * .5, 70, '#3e2614', 'pad', '#2a1e18'); fLeg(c, -250, by + 80, 120, 110, G(3)[0], -G(3)[1] * .5, 74, '#3e2614', 'pad', '#2a1e18');
  fLeg(c, 220, by + 90, 120, 110, G(0)[0], G(0)[1] * .5, 76, '#4a2e18', 'pad', '#2a1e18'); fLeg(c, -270, by + 90, 120, 110, G(2)[0], -G(2)[1] * .5, 80, '#4a2e18', 'pad', '#2a1e18');
  c.beginPath(); c.moveTo(-380, by + 60); c.bezierCurveTo(-400, by - 80, -200, by - 120, 40, by - 110); c.bezierCurveTo(160, by - 170, 300, by - 150, 340, by - 40); c.bezierCurveTo(380, by + 60, 330, by + 160, 250, by + 170); c.lineTo(-300, by + 170); c.quadraticCurveTo(-390, by + 150, -380, by + 60); c.closePath();
  fFill(c, '#9a6234', '#4e2c14', by - 170, by + 170); furStrokes(c, -400, by - 170, 380, by + 170, 150, 71, ['#b87a40', '#5a3218', '#c88a4a'], 30, 5, 1.6);
  c.beginPath(); c.moveTo(-340, by + 140); for (let i = 0; i <= 14; i++) c.lineTo(-340 + i * 46, by + 200 + (i % 2) * 30 + Math.sin(t * 2 + i) * 5); c.lineTo(320, by + 120); c.closePath(); fFill(c, '#7a4420', '#3e2210', by + 120, by + 230, 4);
  // head, low and long
  const hy = by + 60 + push * 60, hx = 360;
  c.save(); c.translate(hx, hy); c.rotate(.25 + push * .2);
  c.beginPath(); c.moveTo(-60, -110); c.quadraticCurveTo(80, -120, 210, -40); c.quadraticCurveTo(240, 0, 220, 40); c.quadraticCurveTo(90, 70, -50, 80); c.closePath(); fFill(c, '#8a5a30', '#4a2a12', -120, 80);
  c.beginPath(); c.ellipse(-30, -110, 26, 44, -.4, 0, Math.PI * 2); fFill(c, '#8a5a30', '#5a3a1c', -150, -70, 5);
  fEye(c, 70, -50, 8);
  // front horn: long, flattened, swept forward-up (≈ 1 m = 220)
  c.beginPath(); c.moveTo(150, -40); c.bezierCurveTo(230, -120, 330, -200, 400, -250); c.quadraticCurveTo(320, -160, 210, -10); c.closePath(); fFill(c, '#5a4a3c', '#2e241c', -250, 0, 5);
  c.beginPath(); c.moveTo(60, -95); c.quadraticCurveTo(90, -170, 110, -175); c.quadraticCurveTo(110, -120, 100, -95); c.closePath(); fFill(c, '#5a4a3c', '#2e241c', -175, -95, 4);
  c.restore();
  breathPuff(c, hx + 230, hy + 30, t, o);
  c.restore(); }); }

// ---------------- GIANT DEER / Megaloceros (shoulder ≈ 2 m, palmate antlers up to 3,5 m wide) ----------------
function riesenhirsch(c, x, o = {}) { fLayer(c, o, c => { fStart(c, x, o); const t = o.t || 0, G = i => gait(o, i, .36);
  const by = -460;
  fLeg(c, 170, by + 40, 210, 220, G(1)[0], G(1)[1], 34, '#4a3628'); fLeg(c, -180, by + 40, 210, 220, G(3)[0], -G(3)[1], 38, '#4a3628');
  fLeg(c, 150, by + 50, 210, 220, G(0)[0], G(0)[1], 36, '#5a4232'); fLeg(c, -200, by + 50, 210, 220, G(2)[0], -G(2)[1], 40, '#5a4232');
  c.beginPath(); c.moveTo(-250, by); c.bezierCurveTo(-260, by - 100, -60, by - 120, 140, by - 120); c.bezierCurveTo(240, by - 110, 280, by - 40, 260, by + 40); c.bezierCurveTo(220, by + 100, -160, by + 100, -240, by + 60); c.closePath();
  fFill(c, '#9a7048', '#5e4228', by - 120, by + 100);
  // shoulder hump, neck, head
  c.beginPath(); c.moveTo(110, by - 100); c.bezierCurveTo(150, by - 200, 250, by - 300, 330, by - 345); c.lineTo(395, by - 290); c.bezierCurveTo(330, by - 220, 280, by - 120, 270, by + 10); c.quadraticCurveTo(200, by - 30, 110, by - 100); c.closePath(); fFill(c, '#8a6040', '#5e4228', by - 340, by + 10);
  c.beginPath(); c.moveTo(150, by - 150); c.bezierCurveTo(210, by - 130, 250, by - 60, 262, by - 10); c.quadraticCurveTo(200, by - 70, 150, by - 150); c.fillStyle = 'rgba(60,40,24,.5)'; c.fill();
  c.save(); c.translate(370, by - 310); c.rotate(.6);
  c.beginPath(); c.moveTo(-30, -30); c.quadraticCurveTo(60, -40, 120, -8); c.quadraticCurveTo(136, 16, 116, 30); c.quadraticCurveTo(40, 36, -30, 30); c.closePath(); fFill(c, '#9a7048', '#5e4228', -40, 36); fEye(c, 20, -8, 7);
  c.restore();
  // palmate antlers (span ≈ 770 = 3,5 m), drawn as the spread seen side-on
  c.save(); c.translate(360, by - 360);
  for (const s of [-1, 1]) { c.save(); c.scale(s * 1, 1);
    c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(120, -40, 200, -60); c.bezierCurveTo(300, -80, 360, -160, 385, -220);
    for (let i = 0; i < 7; i++) c.lineTo(385 - i * 34, -220 - (i % 2 ? 0 : 50) + i * 6);
    c.quadraticCurveTo(200, -150, 160, -100); c.quadraticCurveTo(80, -60, 0, -20); c.closePath(); fFill(c, '#d8c6a0', '#a8946e', -270, 0, 7); c.restore(); }
  c.restore();
  c.restore(); }); }

// ---------------- CAVE LION (bigger than today's lions, pale grey-beige, no or tiny mane) ----------------
function loewe(c, x, o = {}) { fLayer(c, o, c => { fStart(c, x, o); const t = o.t || 0, G = i => gait(o, i, .45), crouch = o.crouch || 0, snarl = o.snarl || 0;
  const by = -230 + crouch * 50;
  fLeg(c, 150, by + 20, 110, 120, G(1)[0], G(1)[1], 38, '#a89a80', 'paw'); fLeg(c, -180, by + 10, 120, 120, G(3)[0], -G(3)[1], 42, '#a89a80', 'paw');
  fLeg(c, 130, by + 30, 110, 120, G(0)[0], G(0)[1], 42, '#c4b496', 'paw'); fLeg(c, -200, by + 20, 120, 120, G(2)[0], -G(2)[1], 46, '#c4b496', 'paw');
  c.beginPath(); c.moveTo(-250, by - 10); c.bezierCurveTo(-250, by - 90, -60, by - 100, 120, by - 90); c.bezierCurveTo(220, by - 90, 240, by - 20, 210, by + 50); c.bezierCurveTo(100, by + 70, -160, by + 70, -240, by + 40); c.closePath();
  fFill(c, '#d6c8aa', '#9a8c72', by - 100, by + 70); furStrokes(c, -250, by - 100, 240, by + 70, 40, 81, ['#e6dac0', '#8a7c64'], 12, 2);
  // head (low when stalking)
  const hx = 260, hy = by - 60 + crouch * 40;
  c.save(); c.translate(hx, hy);
  c.beginPath(); c.moveTo(-60, -40); c.quadraticCurveTo(0, -90, 70, -60); c.quadraticCurveTo(130, -30, 120, 20); c.quadraticCurveTo(100, 60, 30, 60); c.quadraticCurveTo(-50, 50, -60, -40); c.closePath(); fFill(c, '#d6c8aa', '#a89a80', -90, 60);
  c.beginPath(); c.ellipse(-30, -70, 18, 22, -.3, 0, Math.PI * 2); fFill(c, '#c8b898', '#8a7c64', -92, -48, 4);
  // eye: sharp, amber
  c.beginPath(); c.ellipse(50, -30, 13, 7, -.2, 0, Math.PI * 2); c.fillStyle = '#e8b040'; c.fill(); c.lineWidth = 3; c.strokeStyle = FOUT; c.stroke(); ell(c, 52, -30, 3, 6); c.fillStyle = '#120c0a'; c.fill();
  line(c, [30, -44, 70, -48], 5, FOUT);
  ell(c, 118, 6, 12, 9); c.fillStyle = '#5a3a32'; c.fill();
  if (snarl) { c.beginPath(); c.moveTo(70, 30); c.quadraticCurveTo(100, 30 + 30 * snarl, 120, 26); c.lineTo(70, 30); c.fillStyle = '#4a1a1a'; c.fill(); for (const tx of [84, 106]) { c.beginPath(); c.moveTo(tx, 28); c.lineTo(tx + 4, 28 + 14 * snarl); c.lineTo(tx + 8, 28); c.fillStyle = '#f2ead8'; c.fill(); } }
  c.restore();
  // tail with dark tuft
  const tw = Math.sin(t * 1.6) * .3; c.beginPath(); c.moveTo(-245, by - 20); c.quadraticCurveTo(-340, by + 20 + tw * 60, -360 + tw * 40, by + 140); c.lineWidth = 22; c.strokeStyle = FOUT; c.stroke(); c.lineWidth = 12; c.strokeStyle = '#c4b496'; c.stroke(); ell(c, -360 + tw * 40, by + 150, 14, 22); c.fillStyle = '#4a3a2a'; c.fill();
  c.restore(); }); }

// ---------------- WOLF / early dog ----------------
function wolf(c, x, o = {}) { fLayer(c, o, c => { fStart(c, x, o); const t = o.t || 0, G = i => gait(o, i, .45), lie = o.lie || 0, howl = o.howl || 0;
  const by = -160 + lie * 100;
  if (!lie) { fLeg(c, 100, by + 10, 70, 80, G(1)[0], G(1)[1], 20, '#6a6660', 'paw'); fLeg(c, -110, by + 10, 75, 80, G(3)[0], -G(3)[1], 22, '#6a6660', 'paw'); }
  if (!lie) { fLeg(c, 90, by + 15, 70, 80, G(0)[0], G(0)[1], 22, '#7a766e', 'paw'); fLeg(c, -120, by + 15, 75, 80, G(2)[0], -G(2)[1], 24, '#7a766e', 'paw'); }
  c.beginPath(); c.moveTo(-150, by); c.bezierCurveTo(-150, by - 60, -40, by - 60, 80, by - 55); c.bezierCurveTo(140, by - 50, 150, by - 10, 140, by + 30); c.bezierCurveTo(60, by + 50, -100, by + 50, -145, by + 30); c.closePath();
  fFill(c, '#9a948a', '#5e5a54', by - 60, by + 50); furStrokes(c, -150, by - 60, 150, by + 50, 30, 91, ['#b8b2a8', '#4a4640'], 12, 2.5);
  c.beginPath(); c.ellipse(0, by + 34, 100, 14, 0, 0, Math.PI * 2); c.fillStyle = 'rgba(230,226,216,.6)'; c.fill();
  const hx = 160, hy = by - 50 + lie * 30 - howl * 40;
  c.save(); c.translate(hx, hy); c.rotate(-howl * .9 + (o.tilt || 0));
  c.beginPath(); c.moveTo(-30, -30); c.quadraticCurveTo(20, -50, 50, -26); c.lineTo(110, -6); c.quadraticCurveTo(116, 10, 104, 16); c.lineTo(40, 26); c.quadraticCurveTo(-20, 34, -30, -30); c.closePath(); fFill(c, '#a8a298', '#6a665e', -50, 34);
  c.beginPath(); c.moveTo(-14, -34); c.lineTo(-4, -76); c.lineTo(16, -38); c.closePath(); fFill(c, '#8a847a', '#5e5a54', -76, -34, 4);
  ell(c, 108, 4, 8, 6); c.fillStyle = '#1a1614'; c.fill(); fEye(c, 32, -14, 5);
  if (howl) { c.beginPath(); c.ellipse(96, 20, 10, 8 * howl, 0, 0, Math.PI * 2); c.fillStyle = '#3a1a1a'; c.fill(); }
  c.restore();
  if (lie) { for (const fx of [120, 170]) { ell(c, fx, -14, 40, 13); c.fillStyle = '#8a847a'; c.fill(); c.lineWidth = 4; c.strokeStyle = FOUT; c.stroke(); } }
  // tail (wag)
  const wg = (o.wag || 0) * Math.sin(t * 9) * .4; c.save(); c.translate(-148, by - 10); c.rotate(.9 + wg);
  c.beginPath(); c.moveTo(0, -10); c.quadraticCurveTo(30, 70, 10, 140); c.quadraticCurveTo(-14, 80, -10, 10); c.closePath(); fFill(c, '#9a948a', '#4e4a44', 0, 140, 4); c.restore();
  c.restore(); }); }

// ---------------- birds / hare ----------------
function vogel(c, x, y, o = {}) { // raven (default) or eagle (o.eagle), flying
  const t = o.t || 0, f = Math.sin(t * (o.eagle ? 3 : 9) + x * .01), s = (o.sc || 1) * (o.eagle ? 1.8 : 1);
  c.save(); c.translate(x, y); c.scale((o.s || 1) * s, s); const col = o.eagle ? '#5a3e26' : '#1a1820';
  c.beginPath(); c.ellipse(0, 0, 30, 10, 0, 0, Math.PI * 2); c.fillStyle = col; c.fill();
  c.beginPath(); c.moveTo(-10, 0); c.quadraticCurveTo(-20, -40 * f, -70, -30 * f - 10); c.quadraticCurveTo(-30, -5, 10, 0); c.fill();
  c.beginPath(); c.moveTo(-10, 0); c.quadraticCurveTo(10, -46 * f, -30, -46 * f - 6); c.quadraticCurveTo(0, -5, 14, 0); c.fill();
  c.beginPath(); c.moveTo(28, -2); c.lineTo(46, 2); c.lineTo(28, 5); c.fill(); c.beginPath(); c.moveTo(-28, 0); c.lineTo(-48, -6); c.lineTo(-48, 8); c.closePath(); c.fill();
  c.restore();
}
function hase(c, x, o = {}) { fStart(c, x, o); const hop = o.hop != null ? Math.abs(Math.sin(o.hop)) * 40 : 0; c.translate(0, -hop);
  c.beginPath(); c.ellipse(0, -40, 50, 34, 0, 0, Math.PI * 2); fFill(c, '#c8bca8', '#8a7e6a', -74, -6, 4);
  c.beginPath(); c.ellipse(46, -70, 22, 18, 0, 0, Math.PI * 2); fFill(c, '#c8bca8', '#8a7e6a', -88, -52, 4);
  for (const dx of [36, 48]) { c.beginPath(); c.ellipse(dx, -112, 8, 30, .2, 0, Math.PI * 2); fFill(c, '#c8bca8', '#8a7e6a', -142, -82, 3); }
  fEye(c, 54, -74, 4); ell(c, -46, -40, 12, 12); c.fillStyle = '#f2ece2'; c.fill(); c.restore(); }
