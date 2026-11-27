// NOAH BLACK — people.js: a cast of DIFFERENT black-skinned characters for Noah's world (passers-by, friends, family).
// Same cartoon language as Noah (big round head, dot eyes, thick ink) but every person has their own height, build,
// head size, hairstyle, face, clothes and accessories. Noah himself is drawn with noah.js, never with this file.
//
//   drawPerson(c, P, { x, y, k: .25, s: 1|-1, ink: 1.8, arms, expr, sit, seatH, bob })   front view (also seated)
//   drawPersonSide(c, P, { x, y, k: .25, s: 1|-1, ink: 1.8, walk: phase|null, sit, seatH: 420, expr, bob })   side profile, walk cycle or seated
//   CAST.<name>  ready-made characters;  makePerson({...})  for new ones
//
// P (all optional): T height units (adult 1450–1650, Noah 1527; child 900–1150), head (1 = Noah-like), bw build (.8 slim … 1.35 heavy),
//   hips (1, women ~1.15), legs (hip height / T, .35), hair: bald|buzz|grey|fade|afro|puffs|bun|ponytail|long|braids|locs|cap|beanie|headwrap,
//   hairCol, hatCol, beard: 0|'short'|'full'|'goatee', beardCol, glasses, earrings, lashes,
//   top: tshirt|shirt|jacket|hoodie|sweater|tank|dress|coat, topCol, top2 (inner shirt / trim), pattern: 'stripes'|'dots'|null, patCol,
//   bottom: pants|jeans|skirt|shorts, botCol, shoe, bag (colour), backpack (colour), cane, watch
const PPL = { skin: '#1b1716', shade: '#110e0d', far: '#151211', out: '#0e0b0a', eye: '#f4efe8', brow: '#8a7d74', mouth: '#cfc6bd', mouthIn: '#3a1216', tongue: '#c9585e', gold: '#d9b45a', W: 13 };
const pF = (c, fill, w = PPL.W) => { if (fill) { c.fillStyle = fill; c.fill(); } if (w) { c.lineWidth = w; c.strokeStyle = PPL.out; c.lineJoin = 'round'; c.stroke(); } };
const pL = (c, pts, w, col) => { c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.lineWidth = w; c.strokeStyle = col; c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke(); };
const pLimb = (c, pts, w, col) => { pL(c, pts, w + PPL.W * 2, PPL.out); pL(c, pts, w, col); };
const pDk = (hex, k = -.25) => shadeHex(hex, k);

function makePerson(o) { return Object.assign({ T: 1527, head: 1, bw: 1, hips: 1, legs: .35, hair: 'buzz', hairCol: '#14100f', top: 'tshirt', topCol: '#7a8a9a', bottom: 'pants', botCol: '#3a3d48', shoe: '#2e2724' }, o); }
function pGeo(P) {
  const T = P.T, sz = Math.max(.62, Math.min(1.1, T / 1527)), R = 250 * P.head;
  const hcy = -T + R, shY = hcy + R + 55 * sz, hipY = -P.legs * T, tl = hipY - shY;
  const sw = 140 * P.bw * sz, hw = 118 * P.bw * P.hips * sz;
  return { T, sz, R, hcy, shY, hipY, tl, sw, hw, up: tl * .5, fo: tl * .48, aw: 62 * sz * Math.sqrt(P.bw), lw: 84 * sz * Math.sqrt(P.bw) * (P.hips > 1.05 ? 1.05 : 1) };
}
const SLEEVE = { tshirt: 'short', dress: 'short', tank: 'none', shirt: 'long', jacket: 'long', hoodie: 'long', sweater: 'long', coat: 'long' };

// ---------------- hands ----------------
function pHand(c, x, y, ang, sz) {
  c.save(); c.translate(x, y); c.rotate(ang); c.scale(sz * .92, sz * .92);
  c.beginPath(); c.moveTo(-32, -6); c.quadraticCurveTo(-42, 50, -24, 88); c.quadraticCurveTo(0, 104, 24, 88); c.quadraticCurveTo(42, 50, 32, -6); c.closePath(); pF(c, PPL.skin, PPL.W * .8);
  c.beginPath(); c.moveTo(-30, 20); c.quadraticCurveTo(-58, 44, -48, 64); c.quadraticCurveTo(-36, 70, -26, 50); pF(c, PPL.skin, PPL.W * .7);
  c.restore();
}

// ---------------- hair (front) ----------------
function hairCap(c, g, col, o = {}) {
  const { R, hcy } = g, e = o.ext ?? 1.04, hl = o.hl ?? -.34, sd = o.side ?? .12, dip = o.dip ?? 0;
  c.beginPath(); c.moveTo(-R * e * .985, hcy + R * sd);
  c.bezierCurveTo(-R * e * 1.08, hcy - R * .9, -R * .62, hcy - R * e * 1.1, 0, hcy - R * e * 1.08);
  c.bezierCurveTo(R * .62, hcy - R * e * 1.1, R * e * 1.08, hcy - R * .9, R * e * .985, hcy + R * sd);
  c.bezierCurveTo(R * .86, hcy + R * (sd - .28), R * .72, hcy + R * hl, R * .36, hcy + R * hl);
  c.quadraticCurveTo(0, hcy + R * (hl + dip), -R * .36, hcy + R * hl);
  c.bezierCurveTo(-R * .72, hcy + R * hl, -R * .86, hcy + R * (sd - .28), -R * e * .985, hcy + R * sd);
  c.closePath(); pF(c, col, PPL.W * .8);
  if (o.tex) { c.save(); c.clip(); curlTex(c, -R, hcy - R * 1.2, R, hcy + R * .2, col, o.seed || 1, R * .07); c.restore(); }
}
function curlTex(c, x0, y0, x1, y1, col, seed, r) {
  c.strokeStyle = shadeHex(col, .3); c.lineWidth = r * .34; c.lineCap = 'round';
  for (let i = 0; i < 70; i++) { const x = x0 + rnd(seed + i) * (x1 - x0), y = y0 + rnd(seed + i + 90) * (y1 - y0); c.beginPath(); c.arc(x, y, r, rnd(i + seed) * 6, rnd(i + seed) * 6 + 2.6); c.stroke(); }
}
function puffBall(c, x, y, r, col, seed) {
  // scalloped round hair mass (afro, puffs, bun)
  c.beginPath(); const n = Math.max(10, Math.round(r / 18));
  for (let i = 0; i <= n; i++) { const a = i / n * Math.PI * 2, rr = r * (1 + (i % 2 ? .035 : -.02)); i ? c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr) : c.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  c.closePath(); pF(c, col, PPL.W * .8); c.save(); c.clip(); curlTex(c, x - r, y - r, x + r, y + r, col, seed, r * .09); c.restore();
}
function hairBack(c, P, g) {
  const { R, hcy } = g, h = P.hair, col = P.hairCol;
  if (h === 'afro') puffBall(c, 0, hcy - R * .28, R * 1.4, col, 3);
  else if (h === 'puffs') { puffBall(c, -R * .98, hcy - R * .82, R * .52, col, 5); puffBall(c, R * .98, hcy - R * .82, R * .52, col, 7); }
  else if (h === 'bun') puffBall(c, 0, hcy - R * 1.18, R * .4, col, 9);
  else if (h === 'ponytail') { c.beginPath(); c.moveTo(R * .7, hcy - R * .6); c.quadraticCurveTo(R * 1.45, hcy - R * .3, R * 1.2, hcy + R * 1.1); c.quadraticCurveTo(R * 1.0, hcy + R * .3, R * .6, hcy - R * .2); c.closePath(); pF(c, col, PPL.W * .8); }
  else if (h === 'long') { c.beginPath(); c.moveTo(-R * 1.05, hcy - R * .3); c.quadraticCurveTo(-R * 1.25, hcy + R * 1.0, -R * 1.0, hcy + R * 1.55); c.lineTo(R * 1.0, hcy + R * 1.55); c.quadraticCurveTo(R * 1.25, hcy + R * 1.0, R * 1.05, hcy - R * .3); c.closePath(); pF(c, col, PPL.W * .8); }
  else if (h === 'braids' || h === 'locs') {
    const n = h === 'braids' ? 7 : 6, len = h === 'braids' ? 1.65 : 1.35;
    for (const s of [-1, 1]) for (let i = 0; i < n; i++) {
      const x0 = s * R * (.55 + i * .07), x1 = s * R * (.85 + i * .07), y1 = hcy + R * (len - i * .03);
      pLimb(c, [x0, hcy - R * .2, x1, hcy + R * .5, x1 - s * 8, y1], R * (h === 'braids' ? .1 : .13), col);
      if (h === 'braids') { c.beginPath(); c.arc(x1 - s * 8, y1 + 10, R * .06, 0, Math.PI * 2); pF(c, PPL.gold, 4); }
    }
  }
  else if (h === 'headwrap') { c.beginPath(); c.moveTo(-R * .95, hcy - R * .3); c.bezierCurveTo(-R * 1.25, hcy - R * 1.5, -R * .2, hcy - R * 2.0, R * .5, hcy - R * 1.65); c.bezierCurveTo(R * 1.25, hcy - R * 1.35, R * 1.15, hcy - R * .6, R * .95, hcy - R * .3); c.closePath(); pF(c, P.hatCol, PPL.W * .8); }
}
function hairFront(c, P, g) {
  const { R, hcy } = g, h = P.hair, col = P.hairCol;
  if (h === 'buzz') hairCap(c, g, col, { ext: 1.0, hl: -.46, side: -.02, tex: 1, seed: 11 });
  else if (h === 'grey') hairCap(c, g, col, { ext: 1.01, hl: -.62, side: .02, dip: -.12, tex: 1, seed: 13 });
  else if (h === 'fade') { hairCap(c, g, pDk(col, .12), { ext: 1.0, hl: -.48, side: -.08 }); c.beginPath(); c.moveTo(-R * .72, hcy - R * .5); c.lineTo(-R * .8, hcy - R * 1.22); c.quadraticCurveTo(0, hcy - R * 1.36, R * .8, hcy - R * 1.22); c.lineTo(R * .72, hcy - R * .5); c.quadraticCurveTo(0, hcy - R * .6, -R * .72, hcy - R * .5); pF(c, col, PPL.W * .8); c.save(); c.clip(); curlTex(c, -R, hcy - R * 1.5, R, hcy - R * .4, col, 15, R * .07); c.restore(); }
  else if (h === 'afro') hairCap(c, g, col, { ext: 1.05, hl: -.42, side: .1, tex: 1, seed: 17 });
  else if (h === 'puffs') { hairCap(c, g, col, { ext: 1.02, hl: -.44, side: -.05, dip: -.06, tex: 1, seed: 19 }); pL(c, [0, hcy - R * 1.04, 0, hcy - R * .46], 5, pDk(col, .3)); }
  else if (h === 'bun' || h === 'ponytail') { hairCap(c, g, col, { ext: 1.03, hl: -.4, side: .05, dip: -.1 }); c.save(); c.strokeStyle = shadeHex(col, .2); c.lineWidth = 5; for (let i = -3; i <= 3; i++) { c.beginPath(); c.moveTo(i * R * .15, hcy - R * .42); c.quadraticCurveTo(i * R * .2, hcy - R * .9, i * R * .08, hcy - R * 1.05); c.stroke(); } c.restore(); }
  else if (h === 'long') { hairCap(c, g, col, { ext: 1.06, hl: -.3, side: .35, dip: .15 }); pL(c, [-R * .15, hcy - R * 1.08, -R * .1, hcy - R * .55], 5, shadeHex(col, .25)); }
  else if (h === 'braids' || h === 'locs') { hairCap(c, g, col, { ext: 1.04, hl: -.4, side: .2 }); c.save(); c.strokeStyle = shadeHex(col, .22); c.lineWidth = 6; for (let i = -4; i <= 4; i++) { c.beginPath(); c.moveTo(i * R * .2, hcy - R * .42); c.quadraticCurveTo(i * R * .26, hcy - R * .9, i * R * .12, hcy - R * 1.06); c.stroke(); } c.restore(); }
  else if (h === 'cap') {
    hairCap(c, g, col, { ext: 1.0, hl: -.4, side: .0 });
    const hc = P.hatCol; c.beginPath(); c.moveTo(-R * 1.02, hcy - R * .32); c.bezierCurveTo(-R * 1.05, hcy - R * 1.2, R * 1.05, hcy - R * 1.2, R * 1.02, hcy - R * .32); c.closePath(); pF(c, hc);
    c.beginPath(); c.moveTo(-R * 1.0, hcy - R * .34); c.quadraticCurveTo(0, hcy - R * .18, R * 1.0, hcy - R * .34); c.quadraticCurveTo(R * 1.12, hcy - R * .14, R * .8, hcy - R * .06); c.quadraticCurveTo(0, hcy + R * .04, -R * .8, hcy - R * .06); c.quadraticCurveTo(-R * 1.12, hcy - R * .14, -R * 1.0, hcy - R * .34); pF(c, pDk(hc, -.2));
    c.beginPath(); c.arc(0, hcy - R * .72, R * .14, 0, Math.PI * 2); pF(c, '#f2ede4', 5); c.beginPath(); c.arc(0, hcy - R * 1.08, R * .06, 0, Math.PI * 2); pF(c, hc, 5);
  }
  else if (h === 'beanie') {
    const hc = P.hatCol; c.beginPath(); c.moveTo(-R * 1.03, hcy - R * .3); c.bezierCurveTo(-R * 1.08, hcy - R * 1.35, R * 1.08, hcy - R * 1.35, R * 1.03, hcy - R * .3); c.closePath(); pF(c, hc);
    c.save(); c.clip(); c.strokeStyle = pDk(hc, -.15); c.lineWidth = 6; for (let i = -6; i <= 6; i++) { c.beginPath(); c.moveTo(i * R * .17, hcy - R * .3); c.lineTo(i * R * .12, hcy - R * 1.3); c.stroke(); } c.restore();
    c.beginPath(); c.roundRect(-R * 1.06, hcy - R * .52, R * 2.12, R * .3, R * .12); pF(c, pDk(hc, .15));
    puffBall(c, 0, hcy - R * 1.08, R * .2, pDk(hc, .3), 21);
  }
  else if (h === 'headwrap') {
    const hc = P.hatCol; c.beginPath(); c.moveTo(-R * 1.02, hcy - R * .25); c.quadraticCurveTo(-R * 1.1, hcy - R * 1.0, -R * .3, hcy - R * 1.15); c.quadraticCurveTo(R * .9, hcy - R * 1.2, R * 1.02, hcy - R * .25); c.quadraticCurveTo(0, hcy - R * .5, -R * 1.02, hcy - R * .25); pF(c, hc);
    c.save(); c.clip(); c.strokeStyle = pDk(hc, -.25); c.lineWidth = 7; for (const [a, b] of [[-.8, -.5], [-.3, -.75], [.3, -.8]]) { c.beginPath(); c.moveTo(R * a, hcy + R * b); c.quadraticCurveTo(R * (a + .4), hcy + R * (b - .5), R * (a + .9), hcy + R * (b - .35)); c.stroke(); } c.restore();
    if (P.pattern) { c.fillStyle = P.patCol || '#f2d35a'; for (let i = 0; i < 9; i++) { c.beginPath(); c.arc(-R * .8 + i * R * .2, hcy - R * (.62 + (i % 3) * .12), R * .045, 0, Math.PI * 2); c.fill(); } }
  }
  else if (h === 'bald') { c.beginPath(); c.ellipse(-R * .35, hcy - R * .72, R * .22, R * .09, -.5, 0, Math.PI * 2); c.fillStyle = 'rgba(255,255,255,.14)'; c.fill(); }
}

// ---------------- face (front) ----------------
function pFace(c, P, g, e) {
  const { R, hcy } = g;
  for (const s of [-1, 1]) {
    const ex = s * R * .34 + (e.look || 0) * R * .03, ey = hcy + R * .12;
    if (e.eyes === 'closed') { c.beginPath(); c.moveTo(ex - R * .1, ey); c.quadraticCurveTo(ex, ey + R * .08, ex + R * .1, ey); c.lineWidth = 8; c.strokeStyle = PPL.eye; c.lineCap = 'round'; c.stroke(); }
    else { c.beginPath(); c.ellipse(ex, ey, R * .085, R * .125, 0, 0, Math.PI * 2); c.fillStyle = PPL.eye; c.fill(); }
    if (P.lashes) pL(c, [s * R * .42, hcy + R * .02, s * R * .5, hcy - R * .04], 6, PPL.eye);
    const bu = (e.browUp || 0) * R * .07;
    c.beginPath(); c.moveTo(s * R * .52, hcy - R * .06 - bu); c.quadraticCurveTo(s * R * .36, hcy - R * .17 - bu, s * R * .2, hcy - R * .12 - bu); c.lineWidth = 12; c.strokeStyle = P.hair === 'grey' ? '#c9c2b9' : PPL.brow; c.lineCap = 'round'; c.stroke();
  }
  if (P.beard) pBeardFront(c, P, g);
  const my = hcy + R * .55, m = e.mouth || 'smile', mw = R * (P.T < 1200 ? .2 : .24);
  if (m === 'smile') { c.beginPath(); c.moveTo(-mw, my - 6); c.quadraticCurveTo(0, my + R * .09, mw, my - 6); c.lineWidth = 9; c.strokeStyle = PPL.mouth; c.lineCap = 'round'; c.stroke(); }
  else if (m === 'grin') { c.beginPath(); c.moveTo(-mw, my - 8); c.quadraticCurveTo(0, my + R * .2, mw, my - 8); c.closePath(); pF(c, PPL.mouthIn, 0); c.lineWidth = 8; c.strokeStyle = PPL.mouth; c.stroke(); }
  else if (m === 'flat') pL(c, [-mw * .6, my, mw * .6, my], 8, PPL.mouth);
  else { c.beginPath(); c.ellipse(0, my + 6, R * .1, R * .13, 0, 0, Math.PI * 2); c.fillStyle = PPL.mouthIn; c.fill(); c.lineWidth = 7; c.strokeStyle = PPL.mouth; c.stroke(); }
  if (P.glasses) { c.lineWidth = 9; c.strokeStyle = P.glasses === true ? '#d8c9a0' : P.glasses; for (const s of [-1, 1]) { c.beginPath(); c.arc(s * R * .34, hcy + R * .12, R * .2, 0, Math.PI * 2); c.stroke(); } pL(c, [-R * .14, hcy + R * .08, R * .14, hcy + R * .08], 8, c.strokeStyle); }
  if (P.earrings) for (const s of [-1, 1]) { c.beginPath(); c.arc(s * R * .99, hcy + R * .32, R * .07, 0, Math.PI * 2); c.lineWidth = 7; c.strokeStyle = PPL.gold; c.stroke(); }
}
function pBeardFront(c, P, g) {
  const { R, hcy } = g, col = P.beardCol || P.hairCol, b = P.beard;
  if (b === 'goatee') { c.beginPath(); c.moveTo(-R * .2, hcy + R * .66); c.quadraticCurveTo(0, hcy + R * 1.0, R * .2, hcy + R * .66); c.quadraticCurveTo(0, hcy + R * .74, -R * .2, hcy + R * .66); pF(c, col, PPL.W * .6); }
  else {
    const low = b === 'full' ? 1.22 : 1.06;
    c.beginPath(); c.moveTo(-R * .97, hcy + R * .1); c.quadraticCurveTo(-R * .9, hcy + R * low, 0, hcy + R * low); c.quadraticCurveTo(R * .9, hcy + R * low, R * .97, hcy + R * .1);
    c.quadraticCurveTo(R * .7, hcy + R * .5, R * .3, hcy + R * .5); c.quadraticCurveTo(0, hcy + R * .76, -R * .3, hcy + R * .5); c.quadraticCurveTo(-R * .7, hcy + R * .5, -R * .97, hcy + R * .1);
    pF(c, col, PPL.W * .6); c.save(); c.clip(); curlTex(c, -R, hcy, R, hcy + R * 1.3, col, 23, R * .05); c.restore();
  }
  // moustache
  c.beginPath(); c.moveTo(-R * .3, hcy + R * .5); c.quadraticCurveTo(0, hcy + R * .36, R * .3, hcy + R * .5); c.quadraticCurveTo(0, hcy + R * .45, -R * .3, hcy + R * .5); pF(c, col, PPL.W * .5);
}
function pHeadFront(c, P, g, e) {
  const { R, hcy } = g;
  c.save(); c.beginPath(); c.arc(0, hcy, R, 0, Math.PI * 2); c.fillStyle = PPL.shade; c.fill(); c.clip();
  c.beginPath(); c.arc(-4, hcy - R * .13, R - 4, 0, Math.PI * 2); c.fillStyle = PPL.skin; c.fill(); c.restore();
  c.beginPath(); c.arc(0, hcy, R, 0, Math.PI * 2); pF(c, null);
  hairFront(c, P, g); pFace(c, P, g, e);
}

// ---------------- body (front) ----------------
function pTorsoPath(c, g, sw, hem) {
  const { shY, hw, sz } = g, nw = 50 * sz, mid = (shY + hem) / 2;
  c.beginPath(); c.moveTo(-nw, shY - 30); c.quadraticCurveTo(-sw * .8, shY - 32, -sw, shY - 6);
  c.quadraticCurveTo(-sw * .9, mid, -hw, hem); c.lineTo(hw, hem); c.quadraticCurveTo(sw * .9, mid, sw, shY - 6);
  c.quadraticCurveTo(sw * .8, shY - 32, nw, shY - 30); c.quadraticCurveTo(0, shY + 6, -nw, shY - 30); c.closePath();
}
function pPattern(c, P, x0, y0, x1, y1) {
  if (!P.pattern) return; c.save(); c.clip(); c.fillStyle = P.patCol || '#f2ede4';
  if (P.pattern === 'stripes') for (let y = y0 + 30; y < y1; y += 70) c.fillRect(x0, y, x1 - x0, 26);
  else for (let i = 0; i < 40; i++) { c.beginPath(); c.arc(x0 + rnd(i + 3) * (x1 - x0), y0 + rnd(i + 40) * (y1 - y0), 13, 0, Math.PI * 2); c.fill(); }
  c.restore(); c.stroke();
}
function pTorsoFront(c, P, g) {
  const { shY, hipY, sw, hw, sz, tl } = g, t = P.top, col = P.topCol, hem = t === 'coat' ? hipY * .42 : hipY + 6;
  if (t === 'tank') { pTorsoPath(c, g, sw, hipY + 6); pF(c, PPL.skin); pTorsoPath(c, g, sw * .72, hipY + 6); pF(c, col); pPattern(c, P, -sw, shY, sw, hipY); return; }
  if (t === 'hoodie') { c.beginPath(); c.ellipse(0, shY - 22, sw * .62, 62 * sz, 0, 0, Math.PI * 2); pF(c, pDk(col, -.15)); }
  pTorsoPath(c, g, sw, hem); pF(c, col); pPattern(c, P, -sw, shY - 40, sw, hem);
  if (t === 'shirt') { for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 6, shY - 4); c.lineTo(s * 70 * sz, shY - 36); c.lineTo(s * 56 * sz, shY + 26); c.closePath(); pF(c, P.top2 || pDk(col, .2), PPL.W * .6); } pL(c, [0, shY, 0, hipY], 5, pDk(col, -.3)); for (let i = 1; i < 5; i++) { c.beginPath(); c.arc(4, shY + i * tl / 5, 8, 0, Math.PI * 2); c.fillStyle = pDk(col, .4); c.fill(); } }
  if (t === 'jacket' || t === 'coat') {
    c.beginPath(); c.moveTo(-50 * sz, shY - 30); c.lineTo(0, shY + tl * .5); c.lineTo(50 * sz, shY - 30); c.quadraticCurveTo(0, shY + 6, -50 * sz, shY - 30); pF(c, P.top2 || '#ece6da', PPL.W * .6);
    for (const s of [-1, 1]) pL(c, [s * 54 * sz, shY - 28, s * 92 * sz, shY + 40, s * 4, shY + tl * .52], 7, pDk(col, -.35));
    pL(c, [0, shY + tl * .5, 0, hem - 4], 6, pDk(col, -.35)); for (let i = 0; i < 2; i++) { c.beginPath(); c.arc(18, shY + tl * (.62 + i * .17), 9, 0, Math.PI * 2); pF(c, pDk(col, .3), 4); }
    if (t === 'coat') for (const s of [-1, 1]) { c.beginPath(); c.roundRect(s * hw * .55 - 40, hipY - 40, 80, 70, 10); pF(c, null, 6); }
  }
  if (t === 'hoodie') { c.beginPath(); c.roundRect(-hw * .6, hipY - tl * .35, hw * 1.2, tl * .28, 30); pF(c, pDk(col, -.08), PPL.W * .6); for (const s of [-1, 1]) pL(c, [s * 30 * sz, shY - 10, s * 34 * sz, shY + tl * .3], 6, P.top2 || '#f2ede4'); }
  if (t === 'sweater') { c.beginPath(); c.rect(-hw * 1.0, hipY - 34, hw * 2.0, 40); pF(c, pDk(col, -.12), PPL.W * .6); c.save(); c.strokeStyle = pDk(col, -.3); c.lineWidth = 4; for (let x = -hw; x < hw; x += 22) { c.beginPath(); c.moveTo(x, hipY - 30); c.lineTo(x, hipY + 2); c.stroke(); } c.restore(); }
  if (t === 'dress') { c.beginPath(); c.moveTo(-hw * .98, hipY - 40); c.lineTo(-hw * 1.42, hipY * .42); c.quadraticCurveTo(0, hipY * .36, hw * 1.42, hipY * .42); c.lineTo(hw * .98, hipY - 40); c.closePath(); pF(c, col); pPattern(c, P, -hw * 1.5, hipY - 40, hw * 1.5, hipY * .36); if (P.top2) pL(c, [-hw * .95, hipY - 40, hw * .95, hipY - 40], 18, P.top2); }
  if (P.bag) { pL(c, [-sw * .7, shY - 10, hw * 1.05, hipY + 20], 12, pDk(P.bag, -.3)); c.beginPath(); c.roundRect(hw * .8, hipY - 10, 130 * sz, 110 * sz, 18); pF(c, P.bag); }
  if (P.backpack) for (const s of [-1, 1]) pL(c, [s * sw * .55, shY - 20, s * sw * .62, shY + tl * .7], 18, P.backpack);
}
function pArm(c, P, g, side, spec, far) {
  const sx = side * (g.sw - g.aw * .38), sy = g.shY + 18, a = spec.a, b = spec.b ?? 0, a2 = a + b;
  const ex = sx + side * Math.sin(a) * g.up, ey = sy + Math.cos(a) * g.up, wx = ex + side * Math.sin(a2) * g.fo, wy = ey + Math.cos(a2) * g.fo;
  const sl = SLEEVE[P.top] || 'short', col = P.topCol, sk = far ? PPL.far : PPL.skin;
  pLimb(c, [sx, sy, ex, ey, wx, wy], g.aw, sl === 'long' ? col : sk);
  if (sl === 'short') pLimb(c, [sx, sy, sx + (ex - sx) * .5, sy + (ey - sy) * .5], g.aw + 22, col);
  if (sl === 'long') pL(c, [ex + (wx - ex) * .86, ey + (wy - ey) * .86, wx - (wx - ex) * .02, wy - (wy - ey) * .02], g.aw + 4, pDk(col, -.18));
  if (P.watch && side > 0) pL(c, [ex + (wx - ex) * .84, ey + (wy - ey) * .84, ex + (wx - ex) * .9, ey + (wy - ey) * .9], g.aw + 8, PPL.gold);
  pHand(c, wx, wy, -side * a2, g.sz);
  return [wx, wy];
}
function pLegsFront(c, P, g) {
  const { hipY, hw, lw, sz } = g, b = P.bottom, top = hipY - 10, bare = b !== 'pants' && b !== 'jeans';
  for (const s of [-1, 1]) {
    const lx = s * hw * .5;
    pLimb(c, [lx, top, lx, -80], lw, bare ? PPL.skin : P.botCol);
    if (b === 'jeans') pL(c, [lx + s * lw * .3, top + 20, lx + s * lw * .3, -90], 4, shadeHex(P.botCol, .25));
    if (b === 'shorts') pLimb(c, [lx, top, lx + s * 6, hipY * .55], lw + 18, P.botCol);
    c.beginPath(); c.ellipse(lx + s * 22 * sz, -38 * sz, lw * .78, 46 * sz, 0, 0, Math.PI * 2); pF(c, P.shoe);
  }
  if (b === 'skirt') { c.beginPath(); c.moveTo(-hw * 1.0, hipY - 30); c.lineTo(-hw * 1.35, hipY * .5); c.quadraticCurveTo(0, hipY * .44, hw * 1.35, hipY * .5); c.lineTo(hw * 1.0, hipY - 30); c.closePath(); pF(c, P.botCol); }
  else if (b !== 'shorts') { c.beginPath(); c.rect(-hw, hipY - 30, hw * 2, 40); c.fillStyle = P.botCol; c.fill(); }
}
function pLegsSit(c, P, g, seat) {
  const { hw, lw, sz } = g, kneeY = seat - 30, bare = P.bottom !== 'pants' && P.bottom !== 'jeans';
  for (const s of [-1, 1]) {
    const kx = s * hw * .7, fx = s * hw * .6;
    pLimb(c, [kx, kneeY, fx, -70], lw, bare ? PPL.skin : P.botCol);
    c.beginPath(); c.ellipse(kx, kneeY + 5, lw * .7, lw * .58, 0, 0, Math.PI * 2); pF(c, bare ? PPL.skin : P.botCol);
    c.beginPath(); c.ellipse(fx, -34 * sz, lw * .8, 42 * sz, 0, 0, Math.PI * 2); pF(c, P.shoe);
  }
  if (P.bottom === 'skirt' || P.top === 'dress') { c.beginPath(); c.ellipse(0, kneeY - 10, hw * 1.45, lw * .75, 0, 0, Math.PI * 2); pF(c, P.top === 'dress' ? P.topCol : P.botCol); }
}
function drawPerson(c, P, o = {}) {
  const g = pGeo(P), k = o.k ?? .25, e = Object.assign({}, P.expr, o.expr), W0 = PPL.W; PPL.W = 13 * (o.ink ?? 1.8);
  const arms = { l: { a: .14, b: -.08 }, r: { a: .14, b: -.08 }, ...(o.arms || {}) };
  c.save(); c.translate(o.x || 0, o.y || 0); c.scale(k * (o.s || 1), k);
  let dy = 0; if (o.sit) { const seat = -(o.seatH ?? 380) * g.sz; pLegsSit(c, P, g, seat); dy = seat - g.hipY - 30; }
  c.save(); c.translate(0, dy + (o.bob || 0));
  if (!o.sit) pLegsFront(c, P, g);
  hairBack(c, P, g);
  c.beginPath(); c.rect(-40 * g.sz, g.hcy + g.R * .6, 80 * g.sz, g.shY - (g.hcy + g.R * .6)); pF(c, PPL.skin, 0); pL(c, [-40 * g.sz, g.hcy + g.R * .8, -40 * g.sz, g.shY - 26], PPL.W * .7, PPL.out); pL(c, [40 * g.sz, g.hcy + g.R * .8, 40 * g.sz, g.shY - 26], PPL.W * .7, PPL.out);
  pTorsoFront(c, P, g);
  const up = arms.l.a > 1.6 || arms.r.a > 1.6, dA = () => { pArm(c, P, g, -1, arms.l); const w = pArm(c, P, g, 1, arms.r); if (P.cane) pL(c, [w[0] + 10, w[1] + 20, w[0] + 30, -dy], 14, '#6a4a30'); };
  if (!up) dA();
  c.save(); c.translate(0, g.hcy + g.R); c.rotate(o.tilt || 0); c.translate(0, -(g.hcy + g.R)); pHeadFront(c, P, g, e); c.restore();
  if (up) dA();
  c.restore(); c.restore(); PPL.W = W0;
}

// ---------------- side profile (facing +x before the s flip) ----------------
function hairSide(c, P, g, hx, front) {
  const { R, hcy } = g, h = P.hair, col = P.hairCol;
  if (!front) {
    if (h === 'afro') puffBall(c, hx - R * .25, hcy - R * .3, R * 1.38, col, 31);
    else if (h === 'puffs') puffBall(c, hx - R * .55, hcy - R * .9, R * .55, col, 33);
    else if (h === 'bun') puffBall(c, hx - R * .7, hcy - R * .85, R * .4, col, 35);
    else if (h === 'ponytail') { c.beginPath(); c.moveTo(hx - R * .7, hcy - R * .7); c.quadraticCurveTo(hx - R * 1.6, hcy - R * .5, hx - R * 1.3, hcy + R * 1.0); c.quadraticCurveTo(hx - R * 1.1, hcy + R * .1, hx - R * .8, hcy - R * .2); c.closePath(); pF(c, col, PPL.W * .8); }
    else if (h === 'long') { c.beginPath(); c.moveTo(hx - R * .2, hcy - R); c.quadraticCurveTo(hx - R * 1.3, hcy - R * .8, hx - R * 1.1, hcy + R * 1.5); c.lineTo(hx - R * .2, hcy + R * 1.5); c.lineTo(hx + R * .1, hcy); c.closePath(); pF(c, col, PPL.W * .8); }
    else if (h === 'braids' || h === 'locs') for (let i = 0; i < 6; i++) { const x0 = hx - R * (.2 + i * .13), y1 = hcy + R * (h === 'braids' ? 1.6 : 1.3) - i * 10; pLimb(c, [x0, hcy - R * .5, x0 - R * .35, hcy + R * .5, x0 - R * .3, y1], R * .11, col); if (h === 'braids') { c.beginPath(); c.arc(x0 - R * .3, y1 + 10, R * .06, 0, Math.PI * 2); pF(c, PPL.gold, 4); } }
    else if (h === 'headwrap') { c.beginPath(); c.moveTo(hx + R * .7, hcy - R * .55); c.bezierCurveTo(hx + R * .6, hcy - R * 1.7, hx - R * 1.2, hcy - R * 1.8, hx - R * 1.0, hcy - R * .2); c.closePath(); pF(c, P.hatCol, PPL.W * .8); }
    return;
  }
  // front pass: the part of the hair that covers the skull (back half + top)
  const cap = (hl, ext = 1.04, tex) => {
    c.beginPath(); c.moveTo(hx + R * .55, hcy - R * (hl + .55)); c.quadraticCurveTo(hx + R * .2, hcy - R * ext * 1.08, hx - R * .3, hcy - R * ext * 1.0);
    c.bezierCurveTo(hx - R * ext * 1.15, hcy - R * .7, hx - R * ext * 1.1, hcy + R * .2, hx - R * .75, hcy + R * .55);
    c.quadraticCurveTo(hx - R * .3, hcy + R * .1, hx - R * .2, hcy - R * .25); c.quadraticCurveTo(hx + R * .1, hcy - R * (hl + .3), hx + R * .55, hcy - R * (hl + .55)); c.closePath(); pF(c, col, PPL.W * .8);
    if (tex) { c.save(); c.clip(); curlTex(c, hx - R * 1.2, hcy - R * 1.2, hx + R * .6, hcy + R * .6, col, 37, R * .07); c.restore(); }
  };
  if (h === 'buzz') cap(.05, 1.0, 1); else if (h === 'grey') cap(-.1, 1.01, 1); else if (h === 'afro' || h === 'puffs') cap(.1, 1.05, 1);
  else if (h === 'fade') { cap(0, 1.0); c.beginPath(); c.moveTo(hx + R * .5, hcy - R * .6); c.quadraticCurveTo(hx + R * .55, hcy - R * 1.28, hx + R * .2, hcy - R * 1.3); c.quadraticCurveTo(hx - R * .5, hcy - R * 1.32, hx - R * .66, hcy - R * 1.15); c.lineTo(hx - R * .7, hcy - R * .6); c.closePath(); pF(c, col, PPL.W * .8); }
  else if (['bun', 'ponytail', 'long', 'braids', 'locs'].includes(h)) cap(.1, 1.04);
  else if (h === 'cap') { cap(0, 1.0); const hc = P.hatCol; c.beginPath(); c.moveTo(hx - R * 1.02, hcy - R * .3); c.bezierCurveTo(hx - R * 1.05, hcy - R * 1.25, hx + R * 1.0, hcy - R * 1.2, hx + R * .95, hcy - R * .38); c.closePath(); pF(c, hc); c.beginPath(); c.moveTo(hx + R * .7, hcy - R * .42); c.quadraticCurveTo(hx + R * 1.4, hcy - R * .46, hx + R * 1.55, hcy - R * .28); c.lineTo(hx + R * .8, hcy - R * .26); c.closePath(); pF(c, pDk(hc, -.2)); }
  else if (h === 'beanie') { const hc = P.hatCol; c.beginPath(); c.moveTo(hx - R * 1.03, hcy - R * .2); c.bezierCurveTo(hx - R * 1.1, hcy - R * 1.4, hx + R * 1.0, hcy - R * 1.35, hx + R * .98, hcy - R * .35); c.closePath(); pF(c, hc); c.beginPath(); c.roundRect(hx - R * 1.07, hcy - R * .5, R * 2.04, R * .3, R * .12); pF(c, pDk(hc, .15)); puffBall(c, hx - R * .1, hcy - R * 1.1, R * .2, pDk(hc, .3), 39); }
  else if (h === 'headwrap') { const hc = P.hatCol; c.beginPath(); c.moveTo(hx - R * 1.02, hcy - R * .1); c.quadraticCurveTo(hx - R * 1.1, hcy - R * 1.1, hx, hcy - R * 1.12); c.quadraticCurveTo(hx + R * .95, hcy - R * 1.0, hx + R * .9, hcy - R * .4); c.quadraticCurveTo(hx, hcy - R * .45, hx - R * 1.02, hcy - R * .1); pF(c, hc); }
}
function pHeadSide(c, P, g, hx, e) {
  const { R, hcy } = g;
  hairSide(c, P, g, hx, false);
  c.save(); c.beginPath(); c.arc(hx, hcy, R, 0, Math.PI * 2); c.fillStyle = PPL.shade; c.fill(); c.clip(); c.beginPath(); c.arc(hx + 6, hcy - R * .13, R - 4, 0, Math.PI * 2); c.fillStyle = PPL.skin; c.fill(); c.restore();
  c.beginPath(); c.arc(hx, hcy, R, 0, Math.PI * 2); pF(c, null);
  // ear
  c.beginPath(); c.ellipse(hx - R * .12, hcy + R * .18, R * .12, R * .17, 0, 0, Math.PI * 2); pF(c, PPL.skin, PPL.W * .6);
  hairSide(c, P, g, hx, true);
  if (P.earrings) { c.beginPath(); c.arc(hx - R * .12, hcy + R * .42, R * .07, 0, Math.PI * 2); c.lineWidth = 7; c.strokeStyle = PPL.gold; c.stroke(); }
  const ex = hx + R * .55, ey = hcy + R * .1;
  if (e.eyes === 'closed') pL(c, [ex - R * .08, ey, ex + R * .08, ey + 4], 8, PPL.eye); else { c.beginPath(); c.ellipse(ex, ey, R * .075, R * .12, 0, 0, Math.PI * 2); c.fillStyle = PPL.eye; c.fill(); }
  c.beginPath(); c.moveTo(ex - R * .16, hcy - R * .12); c.quadraticCurveTo(ex, hcy - R * .19, ex + R * .14, hcy - R * .13); c.lineWidth = 11; c.strokeStyle = P.hair === 'grey' ? '#c9c2b9' : PPL.brow; c.lineCap = 'round'; c.stroke();
  if (P.beard) { const col = P.beardCol || P.hairCol; c.beginPath(); c.moveTo(hx - R * .05, hcy + R * .2); c.quadraticCurveTo(hx + R * .05, hcy + R * (P.beard === 'full' ? 1.2 : 1.02), hx + R * .62, hcy + R * (P.beard === 'full' ? 1.0 : .85)); c.quadraticCurveTo(hx + R * .9, hcy + R * .7, hx + R * .9, hcy + R * .48); c.quadraticCurveTo(hx + R * .5, hcy + R * .55, hx + R * .35, hcy + R * .3); c.closePath(); if (P.beard !== 'goatee') pF(c, col, PPL.W * .6); }
  const m = e.mouth || 'smile', mx = hx + R * .74, my = hcy + R * .55;
  if (m === 'o') { c.beginPath(); c.ellipse(mx, my, R * .06, R * .09, 0, 0, Math.PI * 2); c.fillStyle = PPL.mouthIn; c.fill(); }
  else { c.beginPath(); c.moveTo(mx - R * .14, my); c.quadraticCurveTo(mx, my + (m === 'flat' ? 0 : R * .07), mx + R * .1, my - R * .04); c.lineWidth = 8; c.strokeStyle = PPL.mouth; c.lineCap = 'round'; c.stroke(); }
  if (P.glasses) { c.lineWidth = 9; c.strokeStyle = P.glasses === true ? '#d8c9a0' : P.glasses; c.beginPath(); c.arc(ex, ey, R * .19, 0, Math.PI * 2); c.stroke(); pL(c, [ex - R * .19, ey - 4, hx - R * .05, hcy + R * .05], 8, c.strokeStyle); }
}
function pLegSide(c, P, g, ph, far, seat) {
  const L = (-g.hipY - 40 * g.sz) / 2, th = Math.sin(ph) * .42, kb = Math.max(0, Math.sin(ph - 1.3)) * .7;
  let hx = 0, hy = g.hipY, kx = hx + Math.sin(th) * L, ky = hy + Math.cos(th) * L, ax = kx + Math.sin(th - kb) * L, ay = ky + Math.cos(th - kb) * L;
  if (seat !== undefined) { hy = g.hipY; kx = L * (far ? .95 : 1); ky = hy - 6; ax = kx + (far ? -10 : 0); ay = hy + seat - 40 * g.sz; }
  const b = P.bottom, bare = b !== 'pants' && b !== 'jeans', dim = far ? -.2 : 0;
  const col = bare ? (far ? PPL.far : PPL.skin) : pDk(P.botCol, dim);
  pLimb(c, [hx, hy, kx, ky, ax, ay], g.lw * .92, col);
  if (b === 'shorts') pLimb(c, [hx, hy, hx + (kx - hx) * .6, hy + (ky - hy) * .6], g.lw + 14, pDk(P.botCol, dim));
  c.beginPath(); c.ellipse(ax + 34 * g.sz, ay + 8, g.lw * .85, 40 * g.sz, 0, 0, Math.PI * 2); pF(c, pDk(P.shoe, dim));
  return ay;
}
function pArmSide(c, P, g, ph, far, sit) {
  const sx = 0, sy = g.shY + 26, a = sit ? .05 : -Math.sin(ph) * .5, b = sit ? 1.45 : .25 + Math.max(0, -Math.sin(ph)) * .35;
  const ex = sx + Math.sin(a) * g.up, ey = sy + Math.cos(a) * g.up, wx = ex + Math.sin(a + b) * g.fo, wy = ey + Math.cos(a + b) * g.fo;
  const sl = SLEEVE[P.top] || 'short', col = pDk(P.topCol, far ? -.2 : 0), sk = far ? PPL.far : PPL.skin;
  pLimb(c, [sx, sy, ex, ey, wx, wy], g.aw, sl === 'long' ? col : sk);
  if (sl === 'short') pLimb(c, [sx, sy, sx + (ex - sx) * .5, sy + (ey - sy) * .5], g.aw + 22, col);
  pHand(c, wx, wy, -(a + b), g.sz);
  return [wx, wy];
}
function drawPersonSide(c, P, o = {}) {
  const g = pGeo(P), k = o.k ?? .25, e = Object.assign({}, P.expr, o.expr), W0 = PPL.W; PPL.W = 13 * (o.ink ?? 1.8);
  const sit = !!o.sit, ph = sit ? null : (o.walk ?? null), w = ph ?? 0, moving = ph !== null, bob = moving ? -Math.abs(Math.cos(w)) * 14 * g.sz : 0;
  // seated: the seat is seatH units above the ground (same units as the figure, before k); hips sit on it
  const seat = sit ? (o.seatH ?? 420) : undefined, sdy = sit ? (-seat - g.hipY) : 0;
  const { shY, hipY, sw, hw, sz, tl } = g, d = Math.max(sw, hw) * .78, t = P.top, col = P.topCol;
  c.save(); c.translate(o.x || 0, o.y || 0); c.scale(k * (o.s || 1), k); c.translate(0, bob + (o.bob || 0) + sdy);
  if (P.backpack) { c.beginPath(); c.roundRect(-d - 120 * sz, shY + 10, 150 * sz, tl * .75, 30); pF(c, P.backpack); }
  pArmSide(c, P, g, moving ? w + Math.PI : 0.0001, true, sit);
  pLegSide(c, P, g, moving ? w + Math.PI : 0, true, seat);
  pLegSide(c, P, g, moving ? w : 0, false, seat);
  // torso (depth view): back on the left, chest on the right
  const hem = t === 'coat' ? hipY * .42 : (t === 'dress' ? hipY * .42 : hipY + 6), fem = P.hips > 1.05;
  c.beginPath(); c.roundRect(-30 * sz, g.hcy + g.R * .6, 70 * sz, shY - (g.hcy + g.R * .6) + 10, 10); pF(c, PPL.skin, PPL.W * .7);
  if (t === 'hoodie') { c.beginPath(); c.ellipse(-d * .55, shY - 10, d * .55, 70 * sz, -.3, 0, Math.PI * 2); pF(c, pDk(col, -.15)); }
  c.beginPath(); c.moveTo(-d * .75, shY - 14); c.quadraticCurveTo(-d * 1.05, (shY + hipY) / 2, -d * .85, hipY);
  if (t === 'dress' || t === 'coat') { c.lineTo(-d * 1.15, hem); c.quadraticCurveTo(0, hem + 20, d * 1.2, hem); c.lineTo(d * .9, hipY); }
  else c.lineTo(d * .9, hem);
  c.quadraticCurveTo(d * (fem ? 1.15 : 1.05), shY + tl * .3, d * .7, shY - 14); c.quadraticCurveTo(0, shY - 40, -d * .75, shY - 14); c.closePath();
  if (t === 'tank') { pF(c, col); } else pF(c, col);
  pPattern(c, P, -d * 1.2, shY - 30, d * 1.3, hem);
  if (t === 'jacket' || t === 'coat') { pL(c, [d * .72, shY - 10, d * .55, shY + tl * .45, d * .92, hem - 6], 7, pDk(col, -.35)); }
  if (t === 'shirt') { c.beginPath(); c.moveTo(d * .2, shY - 30); c.lineTo(d * .65, shY - 18); c.lineTo(d * .4, shY + 26); c.closePath(); pF(c, P.top2 || pDk(col, .2), PPL.W * .6); }
  if (t === 'sweater') pL(c, [-d * .85, hipY - 14, d * .9, hipY - 14], 28, pDk(col, -.12));
  if (P.bottom === 'skirt') { c.beginPath(); c.moveTo(-d * .88, hipY - 30); c.lineTo(-d * 1.2, hipY * .5); c.quadraticCurveTo(0, hipY * .46, d * 1.25, hipY * .5); c.lineTo(d * .92, hipY - 30); c.closePath(); pF(c, P.botCol); }
  if (P.bag) { pL(c, [d * .3, shY - 10, -d * .9, hipY + 10], 12, pDk(P.bag, -.3)); c.beginPath(); c.roundRect(-d * 1.25, hipY - 20, 120 * sz, 110 * sz, 18); pF(c, P.bag); }
  pHeadSide(c, P, g, g.R * .12, e);
  const wr = pArmSide(c, P, g, moving ? w : 0.0001, false, sit);
  if (P.cane) pL(c, [wr[0] + 6, wr[1] + 10, wr[0] + 40, -bob - sdy], 14, '#6a4a30');
  c.restore(); PPL.W = W0;
}

// ---------------- the cast: everybody different ----------------
const CAST = {
  amara: makePerson({ T: 1480, head: .95, bw: .9, hips: 1.18, hair: 'puffs', hairCol: '#1a1210', top: 'dress', topCol: '#f2b632', pattern: 'dots', patCol: '#c8462e', earrings: 1, lashes: 1, shoe: '#c8462e' }),
  kofi: makePerson({ T: 1590, head: 1.0, bw: 1.12, hair: 'cap', hairCol: '#120e0d', hatCol: '#c8323a', beard: 'short', beardCol: '#2a211d', top: 'hoodie', topCol: '#8d939c', bottom: 'jeans', botCol: '#3f5a86', shoe: '#ece8e0' }),
  zara: makePerson({ T: 1520, head: .95, bw: .88, hips: 1.15, hair: 'braids', hairCol: '#1d1513', top: 'jacket', topCol: '#5f86b8', top2: '#f2ede4', bottom: 'skirt', botCol: '#2c2c36', earrings: 1, lashes: 1, bag: '#b5643a', shoe: '#b5643a' }),
  baba: makePerson({ T: 1440, head: 1.02, bw: 1.05, hair: 'bald', beard: 'full', beardCol: '#cfc8bf', glasses: true, top: 'sweater', topCol: '#8a5a3a', bottom: 'pants', botCol: '#5a5a4a', cane: 1, shoe: '#3a2a20' }),
  nia: makePerson({ T: 980, head: .86, bw: .78, legs: .33, hair: 'puffs', hairCol: '#1d1412', top: 'tshirt', topCol: '#f08cb4', bottom: 'shorts', botCol: '#5fb0c8', shoe: '#ffffff', backpack: '#7a5ac8' }),
  tunde: makePerson({ T: 1660, head: .98, bw: 1.02, hair: 'fade', hairCol: '#120e0d', beard: 'goatee', top: 'jacket', topCol: '#2c3a5c', top2: '#f2f0ea', bottom: 'pants', botCol: '#22283a', watch: 1, bag: '#5a3a24', shoe: '#1a1412' }),
  grace: makePerson({ T: 1460, head: 1.0, bw: 1.15, hips: 1.25, hair: 'headwrap', hatCol: '#e07a2a', pattern: 'dots', patCol: '#2f7f5a', top: 'dress', topCol: '#2f7f5a', top2: '#e07a2a', earrings: 1, glasses: '#c9b48a', bag: '#c8a050', shoe: '#5a3a24' }),
  malik: makePerson({ T: 1120, head: .88, bw: .82, legs: .34, hair: 'buzz', hairCol: '#120e0d', top: 'tshirt', topCol: '#3f8a63', pattern: 'stripes', patCol: '#f2ede4', bottom: 'shorts', botCol: '#3a3d48', shoe: '#d9473a' }),
  imani: makePerson({ T: 1540, head: .96, bw: .9, hips: 1.12, hair: 'bun', hairCol: '#1a1210', glasses: '#e0d0a8', top: 'shirt', topCol: '#f2ede4', top2: '#ffffff', bottom: 'pants', botCol: '#8a4a5a', earrings: 1, lashes: 1, shoe: '#2a2020' }),
  jamal: makePerson({ T: 1600, head: 1.04, bw: 1.35, hair: 'beanie', hairCol: '#120e0d', hatCol: '#2f6f8a', beard: 'full', beardCol: '#1f1815', top: 'sweater', topCol: '#c8783a', bottom: 'jeans', botCol: '#34466a', shoe: '#4a3a2a' }),
  ayo: makePerson({ T: 1500, head: .94, bw: .85, hair: 'locs', hairCol: '#2a1d16', top: 'tank', topCol: '#e8d23a', bottom: 'shorts', botCol: '#2a6a4a', watch: 1, shoe: '#ffffff' }),
  sade: makePerson({ T: 1560, head: .95, bw: .9, hips: 1.12, hair: 'long', hairCol: '#1a1210', top: 'coat', topCol: '#b0413e', top2: '#2a2626', bottom: 'pants', botCol: '#2a2626', earrings: 1, lashes: 1, bag: '#1f1b1b', shoe: '#1f1b1b' }),
};
