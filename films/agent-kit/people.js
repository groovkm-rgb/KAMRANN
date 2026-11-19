// OTHER CHARACTERS in Noah's drawing language: same round white head (R 262), dot eyes, thick ink,
// but each with their own hair, clothes and size so they never read as Noah.
//   palHead(c, look, e)                    head in Noah head-local coords (centre 0, -1240)
//   drawPalHead(c, x, y, k, look, e, tilt) head only (x,y = head centre)
//   drawPal(c, { look, outfit, coat, hat, k, x, y, ... same keys as drawNoah / drawNoahSide, side: true })
//   silhouette(c, fn, col, rim)           draw fn() as a flat dark shape (+ optional rim light colour)
const PALS = {
  wife:      { hair: 'long', col: '#6a3a2c', dark: '#4a261c', light: '#8d5442', top: '#b06a6a' },
  son:       { hair: 'messy', col: '#5a4a40', dark: '#3a2e28', light: '#7d6a5e' },
  daughter:  { hair: 'pigtails', col: '#7a4630', dark: '#55301f', light: '#a0644a', bow: '#e06a7a' },
  mother:    { hair: 'bun', col: '#c9c4bd', dark: '#9d978f', light: '#e6e2dc', glasses: true },
  follower:  { hair: 'short', col: '#2e2a28', dark: '#1a1716', light: '#4a4440' },
  informant: { hair: 'bob', col: '#8a7a6a', dark: '#64574a', light: '#ab9c8a' },
  colleague: { hair: 'short', col: '#4a3f38', dark: '#2e2622', light: '#6a5d54', glasses: true },
  recruiter: { hair: 'short', col: '#1e1a18', dark: '#0e0c0b', light: '#3a3430', shades: true },
  inspector: { hair: 'short', col: '#6a6460', dark: '#4a4440', light: '#8a847e', glasses: true },
  neighbor:  { hair: 'bob', col: '#b07a4a', dark: '#8a5a32', light: '#d09a6a' },
  agentF:    { hair: 'bun', col: '#3a2a22', dark: '#22160f', light: '#5a4232' },
  kidA:      { hair: 'messy', col: '#6a4a38', dark: '#4a2e22', light: '#8a6a58' },
};
function palHairBack(c, L, cy) {
  if (L.hair === 'long') {
    c.beginPath(); c.moveTo(-250, cy - 120); c.bezierCurveTo(-330, cy + 40, -340, cy + 260, -300, cy + 380); c.lineTo(-220, cy + 350); c.lineTo(-150, cy + 400); c.lineTo(-100, cy + 250);
    c.lineTo(100, cy + 250); c.lineTo(150, cy + 400); c.lineTo(220, cy + 350); c.lineTo(300, cy + 380); c.bezierCurveTo(340, cy + 260, 330, cy + 40, 250, cy - 120); c.closePath(); nFill(c, L.col, NOAH.W * .7);
    c.save(); c.clip(); for (let i = -6; i <= 6; i++) { if (!i) continue; c.beginPath(); c.moveTo(i * 44, cy - 60); c.quadraticCurveTo(i * 54, cy + 160, i * 46, cy + 380); c.lineWidth = 4; c.strokeStyle = i % 2 ? L.dark : L.light; c.stroke(); } c.restore();
  } else if (L.hair === 'bob') {
    c.beginPath(); c.moveTo(-262, cy - 60); c.bezierCurveTo(-300, cy + 60, -290, cy + 150, -250, cy + 170); c.lineTo(250, cy + 170); c.bezierCurveTo(290, cy + 150, 300, cy + 60, 262, cy - 60); c.closePath(); nFill(c, L.col, NOAH.W * .7);
  } else if (L.hair === 'pigtails') {
    for (const s of [-1, 1]) { c.beginPath(); c.ellipse(s * 300, cy + 40, 70, 120, s * .4, 0, Math.PI * 2); nFill(c, L.col, NOAH.W * .7); c.beginPath(); c.arc(s * 262, cy - 40, 32, 0, Math.PI * 2); nFill(c, L.bow, NOAH.W * .5); }
  } else if (L.hair === 'bun') {
    c.beginPath(); c.arc(0, cy - 300, 92, 0, Math.PI * 2); nFill(c, L.col, NOAH.W * .7); nLine(c, [-50, -1540 + 0, 40, -1520], 4, L.dark);
  }
}
function palHairFront(c, L, cy, R) {
  const cap = (pts) => { c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 6) c.bezierCurveTo(pts[i], pts[i + 1], pts[i + 2], pts[i + 3], pts[i + 4], pts[i + 5]); c.closePath(); };
  if (L.hair === 'long' || L.hair === 'bob') {
    // side-swept fringe: hairline sweeps from low on the left to high on the right
    cap([-R + 4, cy + (L.hair === 'bob' ? 60 : 10), -R - 20, cy - 190, -170, cy - 300, 0, cy - 292, 180, cy - 300, R + 20, cy - 190, R - 4, cy + 20,
      R - 40, cy - 90, 200, cy - 150, 120, cy - 150, 20, cy - 150, -110, cy - 60, -180, cy - 30, -230, cy - 10, -R + 4, cy + (L.hair === 'bob' ? 60 : 10)]);
    nFill(c, L.col, NOAH.W * .8);
    c.save(); c.clip(); for (let i = 0; i < 7; i++) { c.beginPath(); c.moveTo(-200 + i * 70, cy - 290); c.quadraticCurveTo(-120 + i * 60, cy - 170, -230 + i * 40, cy - 40); c.lineWidth = 4; c.strokeStyle = i % 2 ? L.dark : L.light; c.stroke(); } c.restore();
  } else if (L.hair === 'messy') {
    c.beginPath(); c.moveTo(-R + 6, cy - 40);
    const n = 9; for (let i = 0; i <= n; i++) { const a = Math.PI + i / n * Math.PI, r = R + 30 + (i % 2) * 34; c.lineTo(Math.cos(a) * r, cy - 30 + Math.sin(a) * r * 1.05); }
    c.lineTo(R - 6, cy - 40); c.quadraticCurveTo(160, cy - 170, 60, cy - 130); c.lineTo(20, cy - 170); c.lineTo(-30, cy - 125); c.lineTo(-90, cy - 165); c.quadraticCurveTo(-190, cy - 130, -R + 6, cy - 40); c.closePath(); nFill(c, L.col, NOAH.W * .8);
  } else if (L.hair === 'pigtails') {
    cap([-R + 6, cy - 20, -R - 10, cy - 200, -150, cy - 300, 0, cy - 290, 150, cy - 300, R + 10, cy - 200, R - 6, cy - 20, 200, cy - 120, 120, cy - 120, 0, cy - 140, -120, cy - 120, -200, cy - 120, -R + 6, cy - 20]);
    nFill(c, L.col, NOAH.W * .8); nLine(c, [0, cy - 288, 0, cy - 145], 5, L.dark);
  } else if (L.hair === 'bun') {
    cap([-R + 6, cy - 10, -R - 14, cy - 200, -160, cy - 296, 0, cy - 292, 160, cy - 296, R + 14, cy - 200, R - 6, cy - 10, R - 40, cy - 150, 140, cy - 190, 0, cy - 180, -140, cy - 190, -R + 40, cy - 150, -R + 6, cy - 10]);
    nFill(c, L.col, NOAH.W * .8); c.save(); c.clip(); for (let i = -4; i <= 4; i++) { c.beginPath(); c.moveTo(i * 50, cy - 185); c.quadraticCurveTo(i * 60, cy - 250, i * 30, cy - 292); c.lineWidth = 4; c.strokeStyle = L.dark; c.stroke(); } c.restore();
  } else { // short, side part (men)
    cap([-R + 6, cy - 30, -R - 12, cy - 200, -160, cy - 296, 0, cy - 290, 160, cy - 296, R + 12, cy - 200, R - 6, cy - 30, R - 30, cy - 130, 170, cy - 180, 60, cy - 170, -60, cy - 165, -170, cy - 170, -R + 30, cy - 120, -R + 6, cy - 30]);
    nFill(c, L.col, NOAH.W * .8); nLine(c, [-90, cy - 170, -60, cy - 280], 5, L.dark);
  }
}
function palHead(c, look, e = {}) {
  const L = typeof look === 'string' ? PALS[look] : look, cy = NOAH.HEAD.y, R = NOAH.HEAD.r;
  palHairBack(c, L, cy);
  c.save(); c.beginPath(); c.arc(0, cy, R, 0, Math.PI * 2); c.fillStyle = NOAH.shade; c.fill(); c.clip();
  c.beginPath(); c.arc(-4, cy - 34, R - 4, 0, Math.PI * 2); c.fillStyle = NOAH.skin; c.fill(); c.restore();
  c.beginPath(); c.arc(0, cy, R, 0, Math.PI * 2); nFill(c, null);
  palHairFront(c, L, cy, R);
  _nx.noahFace(c, Object.assign({ mouth: 'soft' }, e));
  if (L.glasses) for (const s of [-1, 1]) { c.beginPath(); c.arc(s * 92, cy + 25, 58, 0, Math.PI * 2); c.lineWidth = 9; c.strokeStyle = '#3a3230'; c.stroke(); }
  if (L.glasses) nLine(c, [-34, cy + 18, 34, cy + 18], 8, '#3a3230');
  if (L.shades) { for (const s of [-1, 1]) { c.beginPath(); c.ellipse(s * 92, cy + 28, 70, 50, 0, 0, Math.PI * 2); c.fillStyle = '#111'; c.fill(); c.fillStyle = 'rgba(255,255,255,.3)'; c.beginPath(); c.ellipse(s * 92 - 22, cy + 12, 16, 8, -.4, 0, Math.PI * 2); c.fill(); } nLine(c, [-26, cy + 20, 26, cy + 20], 10, '#111'); }
  if (L.hair === 'long' || L.hair === 'pigtails' || L.hair === 'bob') for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 92 + s * 18, cy - 12); c.lineTo(s * 92 + s * 36, cy - 26); c.lineWidth = 6; c.strokeStyle = NOAH.eye; c.stroke(); } // lashes
}
function drawPalHead(c, x, y, k, look, e = {}, tilt = 0) { c.save(); c.translate(x, y); c.rotate(tilt); c.scale(k, k); c.translate(0, -NOAH.HEAD.y); palHead(c, look, e); c.restore(); }
// full body: reuse the rig's body geometry with the pal's head
NX.pal = null;
{ const hl = noahHeadLocal, hb = noahHairBack, sh = noahSideHead;
  noahHeadLocal = function (c, e = {}) { if (NX.pal) { palHead(c, NX.pal, e); if (NX.p && NX.p.hat) nxHatFront(c, NOAH.HEAD.y); return; } hl(c, e); };
  noahHairBack = function (c) { if (!NX.pal) hb(c); };
  noahSideHead = function (c, e = {}) {
    if (!NX.pal) return sh(c, e);
    // pal side head: round head, hair cap toward the back, one eye in front
    const L = typeof NX.pal === 'string' ? PALS[NX.pal] : NX.pal, S = NOAH_SIDE;
    c.save(); c.beginPath(); c.arc(S.HX, S.HY, S.R, 0, Math.PI * 2); c.fillStyle = NOAH.shade; c.fill(); c.clip(); c.beginPath(); c.arc(S.HX - 4, S.HY - 34, S.R - 4, 0, Math.PI * 2); c.fillStyle = NOAH.skin; c.fill(); c.restore();
    c.beginPath(); c.arc(S.HX, S.HY, S.R, 0, Math.PI * 2); nFill(c, null);
    c.beginPath(); c.moveTo(180, -1420); c.bezierCurveTo(100, -1540, -200, -1540, -262, -1330); c.bezierCurveTo(-280, -1200, -250, -1080, -200, -1010); c.lineTo(-100, -1060); c.bezierCurveTo(-60, -1160, 20, -1300, 180, -1420); c.closePath(); nFill(c, L.col, NOAH.W * .8);
    if (e.eyes === 'closed') { c.beginPath(); c.moveTo(128, -1214); c.quadraticCurveTo(150, -1196, 172, -1214); c.lineWidth = 9; c.strokeStyle = NOAH.eye; c.lineCap = 'round'; c.stroke(); }
    else { c.beginPath(); c.ellipse(150 + (e.look || 0) * 5, -1212, 20, 31, 0, 0, Math.PI * 2); c.fillStyle = NOAH.eye; c.fill(); }
    nLine(c, [118, -1092, 168, -1092], 8, NOAH.out);
    if (NX.p && NX.p.hat) nxHatSide(c);
  };
}
function drawPal(c, p) {
  const prev = NX.pal; NX.pal = p.look || 'follower';
  try { return p.side ? drawNoahSide(c, p) : drawNoah(c, p); } finally { NX.pal = prev; }
}
// flat silhouette of anything drawn by fn(ctx) in the current transform
let _silCv = null, _silCv2 = null;
function silhouette(c, fn, col = '#0c0f18', rim = null) {
  if (!_silCv) { for (const k of [0, 1]) { const cv = document.createElement('canvas'); cv.width = W; cv.height = H; if (k) _silCv2 = cv; else _silCv = cv; } }
  const o = _silCv.getContext('2d'); o.setTransform(1, 0, 0, 1, 0, 0); o.globalCompositeOperation = 'source-over'; o.clearRect(0, 0, W, H); o.setTransform(c.getTransform()); fn(o);
  o.setTransform(1, 0, 0, 1, 0, 0);
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
  if (rim) { const r = _silCv2.getContext('2d'); r.setTransform(1, 0, 0, 1, 0, 0); r.globalCompositeOperation = 'source-over'; r.clearRect(0, 0, W, H); r.drawImage(_silCv, 0, 0); r.globalCompositeOperation = 'source-in'; r.fillStyle = rim.col; r.fillRect(0, 0, W, H); for (const [dx, dy] of rim.off || [[-4, -2]]) c.drawImage(_silCv2, dx, dy); }
  o.globalCompositeOperation = 'source-in'; o.fillStyle = col; o.fillRect(0, 0, W, H); o.globalCompositeOperation = 'source-over';
  c.drawImage(_silCv, 0, 0); c.restore();
}
