
// ===================== cast_extra.js: story cast (disguise, wig, glasses, silicone mask, muscle arms, donut tee) =====================
Object.assign(EXPR, {
  sus: { eye: 'lid', brow: 'smug', mouth: 'flat' }, nervous: { eye: 'round', pupil: 0.6, brow: 'worry', mouth: 'wavy' },
  sigh: { eye: 'closed', brow: 'worry', mouth: 'o' }, grump: { eye: 'lid', brow: 'angry', mouth: 'wavy' }, wide: { eye: 'round', pupil: 0.55, brow: 'high', mouth: 'flat' },
  guilty: { eye: 'round', pupil: 0.8, brow: 'worry', mouth: 'flat' }, sip: { eye: 'closed', brow: 'flat', mouth: 'flat' },
});
const MASKC = '#f8e6da', MASKSH = '#dcc4ba', PINK = '#ff4f9a', JEANS = '#3d62a8';
const lerpN = (a, b, t) => a + (b - a) * t;
const ell = (g, x, y, rx, ry, col, rot = 0) => { g.beginPath(); g.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, Math.PI * 2); g.fillStyle = col; g.fill(); };
const drop = (g, x, y, r, a = 1) => { const pts = [[x, y - r * 1.9], ...ellP(x, y, r, r, -20, 200, 14)]; g.save(); g.globalAlpha = a; inkFill(g, pts, '#a8e2ff', Math.max(2, r * 0.3)); ell(g, x - r * 0.3, y - r * 0.1, r * 0.25, r * 0.38, '#ffffff'); g.restore(); };

function drawGlasses(g, H, o) {
  const { cx, cy, rx } = H, u = rx / 100, turn = o.turn || 0, fx = cx + turn * 26 * u, eyeY = cy - 6 * u, fog = o.fog || 0, gl = o.glint ?? 0.45;
  for (const s of [-1, 1]) {
    const k = 1 - 0.22 * Math.max(0, -s * turn), x = fx + s * 40 * u, w = 35 * u * k, h = 31 * u, pts = pill(x - w, eyeY - h, x + w, eyeY + h, 13 * u);
    g.save(); pth(g, pts); g.fillStyle = fog > 0.02 ? `rgba(236,246,250,${Math.min(0.97, 0.2 + 0.8 * fog)})` : 'rgba(170,215,240,0.2)'; g.fill(); g.clip();
    g.globalAlpha = Math.min(1, gl * 1.6); g.fillStyle = '#ffffff'; const gx = x - w * 1.6 + (o.glintX ?? 0.5) * w * 3.2;
    pth(g, [[gx - 9 * u, eyeY + h], [gx + 3 * u, eyeY + h], [gx + 23 * u, eyeY - h], [gx + 11 * u, eyeY - h]]); g.fill();
    pth(g, [[gx + 12 * u, eyeY + h], [gx + 17 * u, eyeY + h], [gx + 37 * u, eyeY - h], [gx + 32 * u, eyeY - h]]); g.fill();
    g.restore(); inkFill(g, pts, null, 11 * u);
  }
  ln(g, [[fx - 7 * u, eyeY - 6 * u], [fx, eyeY - 10 * u], [fx + 7 * u, eyeY - 6 * u]], 9 * u);
  for (const s of [-1, 1]) ln(g, [[fx + s * 74 * u, eyeY - 10 * u], [cx + s * rx * 0.99, eyeY - 4 * u]], 8 * u);
}
function longBack(g, H, o) {
  const { cx, cy, rx, ry } = H, c = o.hair, sw = (o.hairSway || 0) * rx, L = cy + ry * (o.hairLen || 2.35), pts = [];
  for (let i = 0; i <= 24; i++) { const a = dg(180 + 180 * i / 24); pts.push([cx + rx * 1.16 * Math.cos(a), cy + ry * 1.14 * Math.sin(a)]); }
  pts.push([cx + rx * 1.24 + sw * 0.4, cy + ry * 1.0]);
  for (let i = 0; i <= 8; i++) pts.push([cx + rx * 1.26 - i * rx * 2.52 / 8 + sw, L + (i % 2 ? -16 : 12) - Math.abs(i - 4) * 5]);
  pts.push([cx - rx * 1.24 + sw * 0.4, cy + ry * 1.0]);
  shaded(g, pts, c, mix(c, '#4a4a8a', 0.35), 9, [-0.08, -0.04]);
  for (let k = 0; k < 5; k++) ln(g, [[cx - rx * 0.9 + k * rx * 0.45 + sw * 0.3, cy + ry * 1.05], [cx - rx * 0.95 + k * rx * 0.47 + sw * 0.9, L - 34]], 3, mix(c, '#8a90d8', 0.4));
}
function longFront(g, H, o) {
  const { cx, cy, rx, ry } = H, c = o.hair, sw = (o.hairSway || 0) * rx, u = rx / 100, pts = [];
  for (let i = 0; i <= 28; i++) { const a = dg(172 + 196 * i / 28); pts.push([cx + rx * 1.1 * Math.cos(a), cy + ry * 1.1 * Math.sin(a) - 2 * u]); }
  pts.push([cx + rx * 1.02 + sw * 0.25, cy + ry * 0.75], [cx + rx * 0.8, cy + ry * 0.15], [cx + rx * 0.62, cy - ry * 0.42], [cx + rx * 0.08, cy - ry * 0.72],
    [cx - rx * 0.5, cy - ry * 0.46], [cx - rx * 0.8, cy + ry * 0.1], [cx - rx * 1.02 + sw * 0.25, cy + ry * 0.75]);
  shaded(g, pts, c, mix(c, '#4a4a8a', 0.3), 8.5 * u, [-0.06, -0.08]);
  for (const s of [-1, 1]) { // locks falling in front of the shoulders
    const x = cx + s * rx * 1.02, lk = [[x - 20 * u, cy + ry * 0.3], [x + 22 * u, cy + ry * 0.3], [x + 26 * u + sw * 0.7, cy + ry * 1.75], [x + sw * 0.9, cy + ry * 1.95], [x - 24 * u + sw * 0.7, cy + ry * 1.7]];
    inkFill(g, lk, c, 8 * u); ln(g, [[x + 4 * u, cy + ry * 0.4], [x + 6 * u + sw * 0.6, cy + ry * 1.6]], 3 * u, mix(c, '#8a90d8', 0.45));
  }
  for (let k = 0; k < 3; k++) ln(g, ellP(cx - 30 * u + k * 30 * u, cy - 50 * u, 60 * u, 50 * u, 225 + k * 12, 285 + k * 12, 10), 3.5 * u, mix(c, '#8a90d8', 0.45));
}
function maskFace(g, H, o) {
  const { cx, cy, rx } = H, u = rx / 100, turn = o.turn || 0, look = o.look || 0, fx = cx + turn * 26 * u, eyeY = cy - 6 * u;
  for (const s of [-1, 1]) ell(g, fx + s * 62 * u, cy + 30 * u, 21 * u, 13 * u, 'rgba(255,120,140,0.38)');
  for (const s of [-1, 1]) {
    const x = fx + s * 38 * u;
    if (!o.glasses) ln(g, ellP(x, eyeY - 26 * u, 21 * u, 9 * u, 205, 335, 10), 4.5 * u, '#8a6258');
    if (o.maskHollow) { g.save(); g.globalCompositeOperation = 'destination-out'; pth(g, ellP(x, eyeY, 19 * u, 14 * u, 0, 360, 24)); g.fill(); g.restore(); inkFill(g, ellP(x, eyeY, 19 * u, 14 * u, 0, 360, 24), null, 4.5 * u); continue; }
    inkFill(g, ellP(x, eyeY, 20 * u, 15 * u, 0, 360, 24), '#1c1216', 4.5 * u);
    const open = (o.blink || 0) > 0.5 ? 0.12 : (o.eyeOpen ?? 1), ex = x + look * 8 * u;
    ell(g, ex, eyeY + 1 * u, 10 * u, 8.5 * u * open, '#ffffff'); if (open > 0.3) dt(g, ex + look * 3.5 * u, eyeY + 1 * u, 4.4 * u);
    for (let k = 0; k < 3; k++) ln(g, [[x + s * (9 + k * 6) * u, eyeY - 13 * u + k * 3 * u], [x + s * (15 + k * 7) * u, eyeY - 21 * u + k * 5 * u]], 3 * u);
  }
  ln(g, [[fx - 3 * u, cy + 20 * u], [fx + 5 * u, cy + 23 * u]], 3 * u, '#c9a096');
  const my = cy + 46 * u;
  inkFill(g, [[fx - 21 * u, my], [fx - 8 * u, my - 6 * u], [fx, my - 3 * u], [fx + 8 * u, my - 6 * u], [fx + 21 * u, my], ...ellP(fx, my, 21 * u, 11 * u, 0, 180, 10)], '#ee5f7c', 3.5 * u);
  ln(g, [[fx - 19 * u, my], [fx - 8 * u, my + 2 * u], [fx + 8 * u, my + 2 * u], [fx + 19 * u, my]], 2.5 * u);
  const gs = o.gloss ?? 1, gx = (o.glossX || 0) * rx;
  g.save(); g.globalAlpha = Math.min(1, 0.9 * gs); ell(g, cx - 48 * u + gx, cy - 66 * u, 30 * u, 10 * u, '#ffffff', -0.5); ell(g, cx - 82 * u + gx * 0.5, cy - 30 * u, 7 * u, 12 * u, '#ffffff', 0.3); ell(g, cx + 66 * u, cy + 6 * u, 5 * u, 9 * u, '#ffffff', -0.3); g.restore();
}
function drawSweat(g, H, o) {
  const n = o.sweat || 0; if (!n) return; const u = H.rx / 100, t = o.sweatT || 0;
  for (let i = 0; i < n; i++) {
    const side = n === 1 ? 1 : (i % 2 ? -1 : 1), ph = (t * (0.8 + 0.17 * (i % 3)) + i * 0.377) % 1, y = H.cy - H.ry * 0.62 + ph * H.ry * 1.75;
    const yy = Math.min(0.98, Math.abs((y - H.cy) / H.ry)), xm = H.rx * Math.sqrt(1 - yy * yy) * 0.97;
    const x = H.cx + side * Math.min(H.rx * (0.5 + 0.45 * ((i * 0.618) % 1)), Math.max(xm, H.rx * 0.3));
    drop(g, x, y, (8 + (i % 3) * 3) * u * (n === 1 ? 1.25 : 1), Math.min(1, ph * 8) * Math.min(1, (1 - ph) * 5));
  }
}
function donut(g, x, y, r, ic, body) { inkFill(g, ellP(x, y, r, r, 0, 360, 22), '#eab676', 3.5); inkFill(g, wob(x, y, r * 0.8, r * 0.8, x * 0.1, 0.06, 26), ic, 0);
  inkFill(g, ellP(x, y, r * 0.32, r * 0.32, 0, 360, 14), body, 3);
  const sc = ['#ffe14a', '#5ad2ff', '#ffffff', '#ff7a3a']; for (let k = 0; k < 6; k++) { const a = k * 1.05 + x * 0.05, rr = r * 0.56; ln(g, [[x + rr * Math.cos(a) - 3, y + rr * Math.sin(a) - 2], [x + rr * Math.cos(a) + 3, y + rr * Math.sin(a) + 2]], 3.2, sc[(k + (ic === '#ffffff' ? 1 : 0)) % 4]); } }
function extraBody(g, s, o) {
  const D = s.detail || [], has = (t) => D.find((d) => (typeof d === 'string' ? d : d.t) === t); if (!D.length) return;
  const bw = s.bw || 200, y0 = 352, y1 = s.robe ? 925 : 705, x0 = 300 - bw / 2, x1 = 300 + bw / 2, pts = pill(x0, y0, x1, y1, Math.min(90, bw * 0.46), s.robe ? 26 : 0), col = s.body;
  g.save(); pth(g, pts); g.clip();
  if (has('hstripes')) for (let y = y0 + 58; y < y1; y += 84) { g.fillStyle = '#f6f2ea'; g.fillRect(x0 - 10, y, bw + 20, 30); g.fillStyle = 'rgba(60,60,120,0.18)'; g.fillRect(300 + bw * 0.18, y, bw, 30); }
  if (has('donuts')) { const ic = ['#ffffff', '#7a4426', '#8fe6d2'];
    [[-52, 78], [42, 62], [-8, 160], [86, 150], [-96, 168], [60, 236], [-58, 246], [128, 70], [-136, 82], [140, 232], [-140, 250], [8, 30]].forEach(([dx, dy], i) => donut(g, 300 + dx, y0 + dy, 27, ic[i % 3], col));
    g.fillStyle = 'rgba(58,63,122,0.16)'; g.fillRect(300 + bw * 0.2, y0, bw, y1 - y0); }
  if (has('stretch')) { for (const sd of [-1, 1]) for (let k = 0; k < 3; k++) ln(g, [[300 + sd * (bw / 2 - 6), y0 + 66 + k * 5], [300 + sd * (bw / 2 - 70 - k * 12), y0 + 84 + k * 26]], 4, shadeC(col, 0.62)); 
    for (let k = 0; k < 2; k++) ln(g, [[300 - 40, y0 + 22 + k * 16], [300, y0 + 16 + k * 16], [300 + 40, y0 + 22 + k * 16]], 3.5, shadeC(col, 0.62)); }
  if (has('jeans')) { const y = y1 - 96; g.fillStyle = JEANS; g.fillRect(x0 - 10, y, bw + 20, 120); g.fillStyle = 'rgba(30,30,90,0.25)'; g.fillRect(300 + bw * 0.18, y, bw, 120);
    ln(g, [[x0 - 10, y], [x1 + 10, y]], 5); ln(g, [[x0, y + 16], [x1, y + 16]], 2.5, '#9db4e6'); inkFill(g, ellP(300, y + 9, 6, 6, 0, 360, 10), '#e2b84c', 2.5); ln(g, [[300, y + 22], [300, y1]], 3, '#27407a'); }
  if (has('mud')) { [[-60, 120, 46, 30], [50, 220, 54, 34], [-20, 300, 60, 30], [80, 80, 30, 22], [-100, 250, 34, 26]].forEach(([dx, dy, a, b], i) => inkFill(g, wob(300 + dx, y0 + dy, a, b, i * 3.1, 0.12, 24), i % 2 ? '#5a4326' : '#6e5430', 3)); }
  g.restore(); inkFill(g, pts, null, 9);
  const kk = has('keys'); if (kk) { const kx = x0 + 26, ky = y1 - 44, a = (o.keySwing || 0) * 0.5; g.save(); g.translate(kx, ky); g.rotate(a);
    inkFill(g, ellP(0, 16, 14, 14, 0, 360, 14), null, 5); for (let k = -1; k <= 1; k++) { g.save(); g.rotate(k * 0.35); ln(g, [[0, 30], [0, 74]], 9); ln(g, [[0, 30], [0, 74], [10, 74], [0, 64], [9, 62]], 5, '#e8c04a'); g.restore(); } g.restore(); }
}
function drawArm(g, s, pts, side) {
  const A = s.arm; if (!A) { ln(g, pts, 7.5); dt(g, pts[2][0], pts[2][1], 10.5); return; }
  const w = A.w, col = A.col || HEAD, [a, b, c] = pts, mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, r = w * 0.74;
  ln(g, pts, w + 14); if (A.bicep) dt(g, mx + side * 5, my, r + 7);
  ln(g, pts, w, col); if (A.bicep) { dt(g, mx + side * 5, my, r, col); ln(g, ellP(mx + side * 5, my, r * 0.75, r * 0.75, side > 0 ? -50 : 130, side > 0 ? 50 : 230, 8), 3.5, '#c9c4bc'); }
  if (A.sleeve) { const q = A.sleeveLen || 0.42, e = [a[0] + (b[0] - a[0]) * q, a[1] + (b[1] - a[1]) * q]; ln(g, [a, e], w + 30); ln(g, [a, e], w + 17, A.sleeve); }
  if (A.cuff) { const e = [c[0] + (b[0] - c[0]) * 0.16, c[1] + (b[1] - c[1]) * 0.16]; ln(g, [e, c], w + 2, A.cuff); }
  dt(g, c[0], c[1], w * 0.66 + 6); dt(g, c[0], c[1], w * 0.66, HEAD);
}
function drawLegs2(g, s, o) {
  const legs = o.legs || 'stand', st = o.step || 0, y1 = s.robe ? 925 : 705, hipY = y1 - 14, c = s.legs || null, lw = s.legW || 9;
  const L = (pts) => { if (c) { ln(g, pts, lw + 10); ln(g, pts, lw, c); } else ln(g, pts, 8);
    if (s.feet) { const n = pts.length, a = pts[n - 2], b = pts[n - 1], fx = (a[0] + b[0]) / 2 + (b[0] - a[0]) * 0.35, fy = b[1]; inkFill(g, ellP(fx, fy - 2, 27, 11, 0, 360, 16), s.feet, 5); ln(g, [[fx - 12, fy - 9], [fx + 6, fy - 12]], 5, shadeC(s.feet, 0.7)); } };
  if (s.robe) { for (const sd of [-1, 1]) ln(g, [[300 + sd * 40, 925], [300 + sd * 44, 968], [300 + sd * 64, 968]], 8); return; }
  const stiff = o.stiff || 0, gap = s.legGap || 36;
  for (const sd of [-1, 1]) {
    const hx = 300 + sd * gap;
    if (legs === 'sit') L([[hx, hipY], [hx + sd * 26, hipY + 70], [hx + sd * 30, hipY + 200], [hx + sd * 52, hipY + 200]]);
    else if (legs === 'crouch') L([[hx, hipY], [hx + sd * 90, hipY + 100], [hx + sd * 60, 968], [hx + sd * 82, 968]]);
    else { const ph = st * Math.PI * 2 + (sd > 0 ? 0 : Math.PI), sw = legs === 'walk' ? Math.sin(ph) * 34 : 0, lift = legs === 'walk' ? Math.max(0, Math.sin(ph)) * (18 + 26 * stiff) : 0;
      L([[hx, hipY], [hx + sd * 8 * (1 - stiff) + sw * 0.5 * (1 - stiff), (hipY + 968) / 2 - lift * (0.3 + 0.7 * stiff)], [hx + sd * 10 + sw, 968 - lift], [hx + sd * 32 + sw, 968 - lift]]); }
  }
}
const headGroup = (g, s, o, H) => {
  const mk = !!o.mask, u = H.rx / 100;
  const hp = wob(H.cx, H.cy, H.rx, H.ry, H.seed, mk ? 0.012 : 0.035);
  shaded(g, hp, mk ? MASKC : HEAD, mk ? MASKSH : HEAD_SH, 9.5, [-0.1, -0.06]);
  if (o.stubble) { g.save(); pth(g, hp); g.clip(); for (let i = 0; i < 60; i++) { const a = dg(20 + 140 * ((i * 0.618) % 1)), rr = 0.62 + 0.36 * ((i * 0.377) % 1); dt(g, H.cx + H.rx * rr * Math.cos(a), H.cy + H.ry * rr * Math.sin(a), 2.2 * u, '#9a9aa2'); } g.restore(); }
  if (o.mudHead) { g.save(); pth(g, hp); g.clip(); [[-0.5, -0.5, 30, 20], [0.55, 0.3, 26, 18], [-0.2, 0.7, 34, 16]].forEach(([dx, dy, a, b], i) => inkFill(g, wob(H.cx + dx * H.rx, H.cy + dy * H.ry, a * u, b * u, i * 2.3, 0.12, 20), '#6e5430', 3)); g.restore(); }
  if (o.hair && o.hairStyle === 'long') { if (mk) { maskFace(g, H, o); } else drawFace(g, H, o); longFront(g, H, o); }
  else { if (!mk) drawHair(g, H, o); if (mk) maskFace(g, H, o); else drawFace(g, H, o); }
  if (o.glasses) drawGlasses(g, H, o);
  drawHat(g, H, o); drawSweat(g, H, o);
};
function drawNeck(g, s, o, H) {
  const nw = s.neck, yb = 372, yt = H.cy + H.ry * 0.72, mk = !!o.mask;
  const pts = [[300 - nw / 2, yt], [300 + nw / 2, yt], [300 + nw / 2 + 16, yb], [300 - nw / 2 - 16, yb]];
  shaded(g, pts, HEAD, HEAD_SH, 9, [-0.12, 0]);
  if (s.neckBody) { const c2 = [[300 - nw / 2 - 12, yb - 14], [300 + nw / 2 + 12, yb - 14], [300 + nw / 2 + 18, yb + 4], [300 - nw / 2 - 18, yb + 4]]; inkFill(g, c2, s.neckBody, 6); }
  if (mk) { const e = o.maskEdge || 0, ys = H.cy + H.ry * 0.9 + 8, w = nw / 2 + 4; // mask skirt over the top of the neck, with a seam that lifts
    const sk = [[300 - w, yt - 6], [300 + w, yt - 6], [300 + w + 5 + e * 10, ys - e * 6], [300 + w * 0.5, ys + 4], [300, ys + 1], [300 - w * 0.5, ys + 5], [300 - w - 5, ys]];
    inkFill(g, sk, MASKC, 6); g.save(); pth(g, sk); g.clip(); g.fillStyle = MASKSH; g.fillRect(300 + w * 0.3, yt - 10, w, 80); g.restore(); inkFill(g, sk, null, 6);
    if (e > 0.05) { const fx = 300 + w + 2, fl = [[fx - 16, ys - 4], [fx + 6 + e * 30, ys - 10 - e * 26], [fx + 2 + e * 34, ys + 2 - e * 10], [fx - 4, ys + 6]]; inkFill(g, fl, MASKC, 5.5); ln(g, [[fx - 8, ys + 9], [fx + e * 16, ys + 12]], 3, '#b9a79e'); }
  }
}
/** main character draw (see cast.js for the base fields). Extra spec fields: glasses, hairStyle 'long', mask, neck, headUp, arm{w,col,bicep,sleeve,cuff}, legW, feet, stubble, browT.
 *  Extra opts: fog, glint, glintX, hairSway, maskEdge, sweat, sweatT, browLift, gloss, glossX, keySwing, stiff, peel (0..1 mask being pulled up), wigTilt, wigUp */
export const toonChar = (p, spec, opts = {}) => {
  const g = p.g, s = typeof spec === 'string' ? CAST[spec] : spec, o = { ...s, ...opts };
  g.save(); g.translate(0, -(o.bob || 0) * 1000);
  if (o.tilt) { g.translate(300, 975); g.rotate(dg(o.tilt)); g.translate(-300, -975); }
  const hr = 140 * (s.headScale || 1), H = { cx: 300 + (o.turn || 0) * 8, cy: 276 - (s.headUp || 0), rx: hr, ry: hr * 0.9, seed: o.seed ?? 3 };
  const long = o.hair && o.hairStyle === 'long';
  const wigX = (fn) => { g.save(); g.translate(300, 380); g.rotate(dg(o.headTilt || 0)); g.translate(-300, -380); if (o.wigTilt || o.wigUp) { g.translate(H.cx, H.cy); g.rotate(dg(o.wigTilt || 0)); g.translate(-H.cx, -H.cy - (o.wigUp || 0)); } fn(); g.restore(); };
  if (long) wigX(() => longBack(g, H, o));
  if (s.cape) { const bw = s.bw || 200; inkFill(g, [[300 - bw / 2 - 6, 382], [300 + bw / 2 + 6, 382], [300 + bw / 2 + 46, 930], [300 + bw / 2 + 30, 960], [300 - bw / 2 - 30, 960], [300 - bw / 2 - 46, 930]], s.cape, 8); }
  drawLegs2(g, s, o);
  const B = drawBody(g, { ...s, cape: null }, o); extraBody(g, s, o);
  if (s.neck) drawNeck(g, s, o, H);
  g.save(); g.translate(300, 380); g.rotate(dg(o.headTilt || 0)); g.translate(-300, -380);
  if (o.peel != null) { // real face underneath, rubbery mask being pulled up and off
    const t = o.peel, real = { ...o, mask: false, glasses: false, hair: s.realHair || '#2a2228', hairStyle: 'short', expr: o.realExpr || 'grump', stubble: true, browT: 14, sweat: 0 };
    headGroup(g, s, real, H); drawSweat(g, H, { sweat: 5, sweatT: o.sweatT || 0 });
    const lift = t * H.ry * 1.5, st = 1 + 0.75 * Math.sin(Math.min(1, t * 1.15) * Math.PI) ;
    g.save(); g.beginPath(); g.rect(0, -400, 600, H.cy + H.ry * 1.2 - lift * 1.25 + 400); g.clip();
    g.translate(H.cx, H.cy - H.ry - lift * 0.55); g.scale(1 - 0.12 * Math.sin(t * Math.PI), st); g.translate(-H.cx, -(H.cy - H.ry));
    headGroup(g, s, { ...o, mask: true, hair: null, glasses: false, sweat: 0, gloss: 1.2 }, H); g.restore();
    const ey = H.cy + H.ry * 1.2 - lift * 1.25; ln(g, [[H.cx - H.rx * 0.9, ey - 2], [H.cx - H.rx * 0.3, ey + 7], [H.cx + H.rx * 0.3, ey - 3], [H.cx + H.rx * 0.92, ey + 5]], 8, CK); ln(g, [[H.cx - H.rx * 0.9, ey - 2], [H.cx - H.rx * 0.3, ey + 7], [H.cx + H.rx * 0.3, ey - 3], [H.cx + H.rx * 0.92, ey + 5]], 3.5, MASKSH);
  } else if (o.back) { // seen from behind: no face, hair covers the head
    shaded(g, wob(H.cx, H.cy, H.rx, H.ry, H.seed, 0.03), o.mask ? MASKC : HEAD, o.mask ? MASKSH : HEAD_SH, 9.5, [-0.1, -0.06]);
    if (o.hair && o.hairStyle !== 'bald') { g.restore(); wigX(() => { if (long) longBack(g, H, o); shaded(g, wob(H.cx, H.cy - (long ? 0 : H.ry * 0.2), H.rx * (long ? 1.14 : 1.03), H.ry * (long ? 1.12 : 0.86), 5, 0.02), o.hair, mix(o.hair, '#4a4a8a', 0.3), 9, [-0.08, -0.06]);
      for (let k = 0; k < 5; k++) ln(g, [[H.cx - H.rx * 0.7 + k * H.rx * 0.35, H.cy - H.ry * 0.7], [H.cx - H.rx * 0.8 + k * H.rx * 0.4 + (o.hairSway || 0) * H.rx, H.cy + H.ry * (long ? 1.9 : 0.4)]], 3.5, mix(o.hair, '#8a90d8', 0.4)); }); g.save(); g.translate(300, 380); g.rotate(dg(o.headTilt || 0)); g.translate(-300, -380); }
    drawHat(g, H, o);
  } else if (long) { // head, face, then the wig front (wig can sit crooked)
    const hp = wob(H.cx, H.cy, H.rx, H.ry, H.seed, o.mask ? 0.012 : 0.035);
    shaded(g, hp, o.mask ? MASKC : HEAD, o.mask ? MASKSH : HEAD_SH, 9.5, [-0.1, -0.06]);
    if (o.mask) maskFace(g, H, o); else drawFace(g, H, o);
    g.restore(); wigX(() => longFront(g, H, o)); g.save(); g.translate(300, 380); g.rotate(dg(o.headTilt || 0)); g.translate(-300, -380);
    if (o.glasses) drawGlasses(g, H, o); drawSweat(g, H, o);
  } else headGroup(g, s, o, H);
  g.restore();
  const sY = B.y0 + 48, sh = { '-1': [B.x0 + 16, sY], '1': [B.x1 - 16, sY] };
  for (const side of [-1, 1]) {
    const pose = side < 0 ? o.L : o.R, [sx, sy] = sh[side], pts = armPts(sx, sy, side, pose);
    drawArm(g, s, pts, side); drawProp2(g, side < 0 ? o.holdL : o.holdR, pts[2][0], pts[2][1], side, o);
  }
  g.restore();
};
function drawProp2(g, kind, x, y, side, o) {
  if (!kind) return;
  if (kind === 'phone') { const pts = pill(x - 24, y - 78, x + 24, y + 8, 8); inkFill(g, pts, '#23232c', 5); inkFill(g, pill(x - 17, y - 68, x + 17, y - 4, 4), o.phoneOn === false ? '#3a4050' : '#bfe6ff', 0); dt(g, x, y - 72, 3, '#e04040'); dt(g, x + side * 2, y - 6, 12, HEAD); ln(g, ellP(x + side * 2, y - 6, 12, 12, 0, 360, 14), 4); }
  else if (kind === 'mug') { inkFill(g, [[x - 24, y - 46], [x + 24, y - 46], [x + 21, y + 12], [x - 21, y + 12]], '#f2f0ea', 6); inkFill(g, ellP(x, y - 46, 24, 8), '#5a3a22', 4); ln(g, ellP(x + side * 26, y - 16, 12, 16, side > 0 ? -90 : 90, side > 0 ? 90 : 270, 10), 6);
    const t = o.steamT || 0; for (let k = 0; k < 2; k++) ln(g, [[x - 8 + k * 16, y - 60], [x - 12 + k * 16 + 6 * Math.sin(t * 6 + k), y - 76], [x - 6 + k * 16, y - 92]], 3.5, 'rgba(255,255,255,0.75)'); }
  else if (kind === 'chalk') { ln(g, [[x, y], [x + side * 16, y - 26]], 9); ln(g, [[x, y], [x + side * 16, y - 26]], 5, '#ffffff'); }
  else drawProp(g, kind, x, y, side);
}
// ---------- standalone props (design canvas 600x1000, centred near 300,500) ----------
export const propWig = (p, o = {}) => { const g = p.g, H = { cx: 300, cy: 400, rx: 140, ry: 126 }, c = o.hair || '#17131c'; longBack(g, H, { hair: c, hairSway: o.sway || 0, hairLen: o.len || 2.35 });
  inkFill(g, ellP(300, 418, 118, 96, 0, 360, 30), '#0c0a10', 0); longFront(g, H, { hair: c, hairSway: o.sway || 0 }); };
export const propGlasses = (p, o = {}) => { const g = p.g; g.save(); g.translate(300, 500); g.scale(2.3, 2.3); g.translate(-300, -270); drawGlasses(g, { cx: 300, cy: 276, rx: 140, ry: 126 }, { glint: o.glint ?? 0.6, glintX: o.glintX ?? 0.5 }); 
  for (const s of [-1, 1]) ln(g, [[300 + s * 138, 262], [300 + s * 150, 300], [300 + s * 132, 330]], 11); g.restore(); };
/** the empty silicone mask: t 0 = crumpled, 1 = fully unfolded and staring */
export const propMask = (p, t = 1, o = {}) => { const g = p.g, H = { cx: 300, cy: 470, rx: 150, ry: 138, seed: 3 }, e = 1 - (1 - t) ** 2;
  g.save(); g.translate(300, 620); g.rotate(dg((1 - e) * 24 + (o.wob || 0) * 5)); g.scale(lerpN(0.5, 1, e) * (1 + 0.05 * (o.wob || 0)), lerpN(0.42, 1, e) * (1 - 0.05 * (o.wob || 0))); g.translate(-300, -620);
  const sk = [[300 - 86, 560], [300 + 86, 560], [300 + 110, 660], [300 + 60, 648], [300 + 20, 668], [300 - 30, 650], [300 - 70, 670], [300 - 112, 652]];
  inkFill(g, sk, MASKSH, 8); shaded(g, wob(H.cx, H.cy, H.rx, H.ry, 3, 0.02 + 0.06 * (1 - e)), MASKC, MASKSH, 10, [-0.1, -0.06]);
  maskFace(g, H, { maskHollow: true, gloss: 1.2 }); g.restore(); };
export const propBag = (p, o = {}) => { const g = p.g, c = o.col || '#f4efe6'; ln(g, ellP(300, 400, 70, 80, 180, 360, 20), 12); ln(g, ellP(300, 400, 70, 80, 180, 360, 20), 5, '#c8a878');
  const pts = [[150, 400], [450, 400], [470, 800], [130, 800]]; shaded(g, pts, c, shadeC(c, 0.8), 10, [-0.12, 0]); g.save(); pth(g, pts); g.clip(); g.fillStyle = PINK; g.fillRect(100, 560, 400, 70); g.fillStyle = '#ffd0e4'; g.fillRect(100, 640, 400, 14); g.restore(); inkFill(g, pts, null, 10);
  ln(g, [[150, 400], [200, 440], [400, 440], [450, 400]], 6); };
/** hand-drawn escape plan: German title "Plan", stick figures only */
export const propPlan = (p, o = {}) => { const g = p.g, pts = [[70, 210], [520, 190], [540, 800], [86, 818]]; shaded(g, pts, '#fbf6e4', '#e2d9bc', 9, [-0.05, -0.03]);
  g.save(); g.fillStyle = '#1d2a6a'; g.font = 'bold 120px "DejaVu Sans", Arial, sans-serif'; g.textAlign = 'center'; g.translate(305, 330); g.rotate(-0.04); g.fillText('Plan', 0, 0); g.restore();
  ln(g, [[150, 356], [460, 344]], 7, '#d83a3a');
  const C = '#1d2a6a', stick = (x, y, hair, big) => { const k = big ? 1.25 : 1; ln(g, ellP(x, y, 24 * k, 24 * k, 0, 360, 16), 6, C); ln(g, [[x, y + 24 * k], [x, y + 96]], 6 + (big ? 5 : 0), C); ln(g, [[x - 34 * k, y + 50], [x + 34 * k, y + 50]], 6 + (big ? 5 : 0), C); ln(g, [[x - 26, y + 146], [x, y + 96], [x + 26, y + 146]], 6, C);
    if (hair) { ln(g, [[x - 26 * k, y - 8], [x - 32 * k, y + 52]], 8, '#17131c'); ln(g, [[x + 26 * k, y - 8], [x + 32 * k, y + 52]], 8, '#17131c'); ln(g, ellP(x, y, 26 * k, 26 * k, 190, 350, 10), 8, '#17131c'); ln(g, [[x - 18 * k, y], [x - 4, y]], 4, C); ln(g, [[x + 4, y], [x + 18 * k, y]], 4, C); } };
  stick(160, 430, true); stick(300, 430, false, true); ln(g, [[204, 480], [246, 480]], 6, '#d83a3a'); ln(g, [[234, 468], [248, 480], [234, 492]], 6, '#d83a3a'); // girl -> him
  ln(g, [[350, 480], [392, 480]], 6, '#d83a3a'); ln(g, [[380, 468], [394, 480], [380, 492]], 6, '#d83a3a'); stick(446, 430, true, true); // him as her
  stick(170, 640, true, true); ln(g, [[226, 700], [330, 700]], 6, '#d83a3a'); ln(g, [[316, 686], [332, 700], [316, 714]], 6, '#d83a3a');
  inkFill(g, [[370, 610], [470, 606], [472, 790], [372, 792]], null, 7); dt(g, 452, 704, 7, C); for (let k = 0; k < 5; k++) ln(g, [[484, 640 + k * 26], [510 + (k % 2) * 8, 632 + k * 26]], 5, '#e8a020'); // door with sun rays
};
/** phone / TV screen: breaking news, German band "EILMELDUNG" */
export const propScreen = (p, o = {}) => { const g = p.g, ph = o.tv ? pill(40, 250, 560, 700, 18) : pill(130, 150, 470, 850, 40), scr = o.tv ? [58, 268, 542, 660] : [148, 200, 452, 800];
  shaded(g, ph, '#22222c', '#14141c', 10); const [a, b, c, d] = scr; g.save(); g.beginPath(); g.rect(a, b, c - a, d - b); g.clip();
  const gr = g.createLinearGradient(0, b, 0, d); gr.addColorStop(0, '#9fb8a8'); gr.addColorStop(1, '#5d7868'); g.fillStyle = gr; g.fillRect(a, b, c - a, d - b);
  const cx = (a + c) / 2, cy = b + (d - b) * (o.tv ? 0.52 : 0.4), k = o.tv ? 0.9 : 1; // tiny bald man in the donut shirt
  inkFill(g, pill(cx - 95 * k, cy + 50 * k, cx + 95 * k, cy + 400 * k, 50 * k), PINK, 7); for (const [dx, dy] of [[-40, 110], [36, 100], [0, 170], [-60, 190], [60, 200]]) donut(g, cx + dx * k, cy + dy * k, 17 * k, '#ffffff', PINK);
  inkFill(g, pill(cx - 38 * k, cy + 20 * k, cx + 38 * k, cy + 70 * k, 6), HEAD, 6); shaded(g, wob(cx, cy - 26 * k, 78 * k, 70 * k, 3, 0.03), HEAD, HEAD_SH, 7);
  ln(g, [[cx - 48 * k, cy - 52 * k], [cx - 14 * k, cy - 40 * k]], 9 * k); ln(g, [[cx + 48 * k, cy - 52 * k], [cx + 14 * k, cy - 40 * k]], 9 * k); dt(g, cx - 28 * k, cy - 26 * k, 6 * k); dt(g, cx + 28 * k, cy - 26 * k, 6 * k); ln(g, ellP(cx, cy + 22 * k, 22 * k, 12 * k, 200, 340, 8), 5 * k);
  const by = o.tv ? d - 120 : d - 190, bh = o.tv ? 78 : 86; g.fillStyle = '#d8202a'; g.fillRect(a, by, c - a, bh); g.fillStyle = '#ffffff'; g.fillRect(a, by + bh, c - a, 26); g.fillStyle = '#16161c'; for (let i = 0; i < 6; i++) g.fillRect(a + 16 + i * 48 - ((o.t || 0) * 60) % 48, by + bh + 9, 30, 8);
  g.fillStyle = '#ffffff'; g.font = `bold ${o.tv ? 60 : 39}px "DejaVu Sans", Arial, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('EILMELDUNG', cx, by + bh / 2 + 2);
  g.fillStyle = 'rgba(255,255,255,0.16)'; pth(g, [[a, b], [a + 120, b], [a + 30, d], [a, d]]); g.fill(); g.restore(); g.lineWidth = 5; g.strokeStyle = CK; g.strokeRect(a, b, c - a, d - b);
  if (!o.tv) dt(g, 300, 176, 7, '#3a3a48'); else { ln(g, [[300, 700], [300, 760]], 16); ln(g, [[210, 764], [390, 764]], 14); } };
/** wordless notification bubble: kind 0 heart, 1 thumb, 2 bell, 3 play, 4 share */
export const propBubble = (p, kind = 0, t = 1) => { const g = p.g, s = t < 0.25 ? t * 4.6 : 1 + 0.15 * Math.max(0, 0.5 - t), cols = ['#ff4f6e', '#3a8cf0', '#f0a82a', '#e03a3a', '#35b86a']; g.save(); g.translate(300, 500); g.scale(s, s); g.translate(-300, -500);
  const pts = [...pill(170, 380, 430, 600, 50)]; inkFill(g, [[250, 596], [300, 660], [330, 596]], cols[kind], 9); shaded(g, pts, cols[kind], shadeC(cols[kind], 0.75), 9, [-0.08, -0.08]); const W = '#ffffff';
  if (kind === 0) { ell(g, 276, 474, 30, 30, W); ell(g, 324, 474, 30, 30, W); pth(g, [[249, 488], [351, 488], [300, 552]]); g.fillStyle = W; g.fill(); }
  else if (kind === 1) { pth(g, pill(240, 480, 272, 550, 6)); g.fillStyle = W; g.fill(); pth(g, [[282, 550], [282, 482], [310, 430], [330, 440], [322, 478], [362, 478], [352, 550]]); g.fill(); }
  else if (kind === 2) { pth(g, [[250, 540], [262, 520], [262, 480], ...ellP(300, 480, 38, 42, 180, 360, 12), [338, 520], [350, 540]]); g.fillStyle = W; g.fill(); ell(g, 300, 552, 12, 10, W); }
  else if (kind === 3) { pth(g, [[272, 440], [348, 490], [272, 540]]); g.fillStyle = W; g.fill(); }
  else { for (const [x, y] of [[262, 490], [338, 452], [338, 530]]) ell(g, x, y, 18, 18, W); ln(g, [[338, 452], [262, 490], [338, 530]], 9, W); }
  g.restore(); };
export const propRat = (p, step = 0) => { const g = p.g, b = Math.sin(step * Math.PI * 2) * 6; ln(g, [[180, 520], [110, 500 + b], [60, 530 - b]], 9); ln(g, [[180, 520], [110, 500 + b], [60, 530 - b]], 4, '#e8a0a8');
  shaded(g, ellP(290, 500 - Math.abs(b) * 0.5, 120, 68, 0, 360, 30), '#9a8f94', '#77707a', 9); inkFill(g, ellP(380, 440, 26, 28), '#e8a0a8', 7); inkFill(g, ellP(340, 436, 22, 24), '#e8a0a8', 7);
  dt(g, 372, 490, 8); dt(g, 372 - 3, 487, 2.5, '#fff'); inkFill(g, ellP(412, 512, 9, 8), '#e8707a', 4); for (let k = -1; k <= 1; k++) ln(g, [[404, 518], [440, 512 + k * 12]], 2.5);
  for (const [x, ph] of [[230, 0], [270, 0.5], [320, 0.25], [350, 0.75]]) { const s = Math.sin((step + ph) * Math.PI * 2) * 14; ln(g, [[x, 556], [x + s, 584]], 7); } };
/** flying clothes: 0 orange shirt, 1 orange trousers, 2 pink donut tee, 3 sock */
export const propCloth = (p, kind = 0) => { const g = p.g, O = '#f08a24';
  if (kind === 0) { const pts = [[200, 380], [260, 360], [300, 384], [340, 360], [400, 380], [470, 470], [420, 510], [390, 470], [394, 640], [206, 640], [210, 470], [180, 510], [130, 470]]; shaded(g, pts, O, shadeC(O, 0.75), 9); g.save(); pth(g, pts); g.clip(); g.fillStyle = '#f6f2ea'; for (let y = 430; y < 640; y += 70) g.fillRect(100, y, 400, 24); g.restore(); inkFill(g, pts, null, 9); }
  else if (kind === 1) { const pts = [[220, 360], [380, 360], [400, 660], [320, 664], [300, 470], [280, 664], [200, 660]]; shaded(g, pts, O, shadeC(O, 0.75), 9); }
  else if (kind === 2) { const pts = [[200, 380], [260, 360], [300, 384], [340, 360], [400, 380], [470, 450], [420, 500], [390, 470], [394, 640], [206, 640], [210, 470], [180, 500], [130, 450]]; shaded(g, pts, PINK, shadeC(PINK, 0.75), 9); g.save(); pth(g, pts); g.clip(); [[260, 470], [340, 450], [300, 550], [240, 590], [360, 580]].forEach(([x, y], i) => donut(g, x, y, 26, ['#ffffff', '#7a4426', '#8fe6d2'][i % 3], PINK)); g.restore(); inkFill(g, pts, null, 9); }
  else { inkFill(g, [[270, 400], [330, 400], [334, 540], [400, 560], [404, 600], [270, 600]], '#f6f2ea', 9); ln(g, [[270, 430], [330, 430]], 6, '#d83a3a'); } };
export const K2 = { inkFill, ln, dt, ellP, pth, pill, shaded, wob, ell, drop, donut, drawArm, shadeC, HEAD, HEAD_SH, CK, MASKC, MASKSH, PINK, JEANS };
/** wordless reaction mark: 'q' = ?, 'excl' = !, 'heart' */
export const propMark = (p, kind, col = '#17131c') => { const g = p.g;
  if (kind === 'heart') { g.save(); g.translate(300, 500); g.scale(2.4, 2.4); g.translate(-300, -490); const pts = [[300, 552], [249, 488], ...ellP(276, 474, 30, 30, 150, 330, 10), ...ellP(324, 474, 30, 30, 210, 390, 10), [351, 488]]; inkFill(g, pts, col, 6); g.restore(); return; }
  g.font = 'bold 420px "DejaVu Sans", Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 34; g.strokeStyle = CK; g.lineJoin = 'round'; const s = kind === 'q' ? '?' : '!'; g.strokeText(s, 300, 500); g.fillStyle = kind === 'q' ? '#ffe14a' : col; g.fillText(s, 300, 500); };
