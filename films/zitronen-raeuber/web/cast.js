// ===================== cast.js: white-head cartoon cast =====================
// Look: big white wobbly heads (no skin colour, no ears, no neck), thick near-black hand-drawn outline that is
// heavier on the shadow side, minimal faces (smug lidded eyes, big round goofy eyes, toothy grid grins, moustaches),
// pill/bean bodies where the clothes ARE the body, stick-line limbs with dot hands, big detailed hats.
// Design canvas 600x1000, soles at y = 975. Draw with T.toonChar(p, spec, opts). spec = a CAST preset or your own object.
const CK = '#1a1416', HEAD = '#fbfaf7', HEAD_SH = '#e6e2dc';
const dg = (a) => a * Math.PI / 180;
const pth = (g, pts, close = true) => { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); if (close) g.closePath(); };
const inkFill = (g, pts, fill, w = 9, close = true) => {
  pth(g, pts, close); if (fill) { g.fillStyle = fill; g.fill(); }
  if (w) { g.lineWidth = w; g.strokeStyle = CK; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(); }
};
const ln = (g, pts, w = 8, col = CK) => { pth(g, pts, false); g.lineWidth = w; g.strokeStyle = col; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(); };
const dt = (g, x, y, r, col = CK) => { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = col; g.fill(); };
const ellP = (cx, cy, rx, ry, a0 = 0, a1 = 360, n = 40) => { const o = []; for (let i = 0; i <= n; i++) { const a = dg(a0 + (a1 - a0) * i / n); o.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]); } return o; };
const wob = (cx, cy, rx, ry, seed, k = 0.035, n = 90) => {
  const o = []; for (let i = 0; i < n; i++) {
    const a = i / n * Math.PI * 2, w = 1 + k * (Math.sin(3 * a + seed * 1.7) + 0.6 * Math.sin(5 * a + seed * 2.9) + 0.4 * Math.sin(2 * a + seed));
    const s = Math.sin(a), flat = s > 0 ? 1 - 0.07 * s * s : 1, jaw = s > 0 ? 1 - 0.08 * s * s : 1; o.push([cx + rx * w * Math.cos(a) * jaw, cy + ry * w * s * flat]);
  } return o;
};
const pill = (x0, y0, x1, y1, r, flare = 0) => {
  const o = [], n = 10, rb = Math.min(r, (x1 - x0) / 2 + flare);
  for (let i = 0; i <= n; i++) { const a = dg(180 + 90 * i / n); o.push([x0 + r + r * Math.cos(a), y0 + r + r * Math.sin(a)]); }
  for (let i = 0; i <= n; i++) { const a = dg(270 + 90 * i / n); o.push([x1 - r + r * Math.cos(a), y0 + r + r * Math.sin(a)]); }
  for (let i = 0; i <= n; i++) { const a = dg(0 + 90 * i / n); o.push([x1 + flare - rb + rb * Math.cos(a), y1 - rb + rb * Math.sin(a)]); }
  for (let i = 0; i <= n; i++) { const a = dg(90 + 90 * i / n); o.push([x0 - flare + rb + rb * Math.cos(a), y1 - rb + rb * Math.sin(a)]); }
  return o;
};
const shadeC = (c, k) => { const n = parseInt(c.slice(1), 16); const f = (v) => Math.max(0, Math.min(255, Math.round(v * k))).toString(16).padStart(2, '0'); return '#' + f(n >> 16 & 255) + f(n >> 8 & 255) + f(n & 255); };
const coolShade = (c) => mix(shadeC(c, 0.78), '#3a3f7a', 0.12); // shadow side leans blue/purple
/** shape filled with a shadow crescent on the lower right, then inked (heavier ink on the shadow side) */
const shaded = (g, pts, col, sh, w = 9, off = [-0.16, -0.08]) => {
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const W = Math.max(...xs) - Math.min(...xs), H = Math.max(...ys) - Math.min(...ys);
  g.save(); pth(g, pts); g.clip(); g.fillStyle = sh; g.fill();
  g.translate(off[0] * W, off[1] * H); pth(g, pts); g.fillStyle = col; g.fill(); g.restore();
  inkFill(g, pts, null, w);
  // heavier ink on the shadow side
  const cx = (Math.max(...xs) + Math.min(...xs)) / 2, cy = (Math.max(...ys) + Math.min(...ys)) / 2;
  const on = pts.map(([x, y]) => (x - cx) / W + (y - cy) / H * 0.6 > 0.12), n = pts.length;
  const st = on.findIndex((v, i) => v && !on[(i - 1 + n) % n]);
  if (st >= 0) { let run = []; for (let k = 0; k <= n; k++) { const i = (st + k) % n; if (on[i]) run.push(pts[i]); else { if (run.length > 2) ln(g, run, w * 1.55); run = []; } } if (run.length > 2) ln(g, run, w * 1.55); }
};

// ---------- faces ----------
const EXPR = {
  smug: { eye: 'lid', brow: 'smug', mouth: 'smirk' },
  sly: { eye: 'lid', brow: 'smug', mouth: 'grin' },
  goofy: { eye: 'round', brow: 'up', mouth: 'grin' },
  shock: { eye: 'round', pupil: 0.7, brow: 'high', mouth: 'o' },
  neutral: { eye: 'dot', brow: 'flat', mouth: 'flat' },
  happy: { eye: 'dot', brow: 'up', mouth: 'smile' },
  laugh: { eye: 'arc', brow: 'up', mouth: 'open' },
  worried: { eye: 'round', brow: 'worry', mouth: 'wavy' },
  angry: { eye: 'lid', brow: 'angry', mouth: 'frown' },
  sleep: { eye: 'closed', brow: 'flat', mouth: 'flat' },
  determined: { eye: 'lid', brow: 'angry', mouth: 'flat' },
  scared: { eye: 'round', pupil: 0.6, brow: 'worry', mouth: 'grit' },
  sour: { eye: 'squint', brow: 'angry', mouth: 'pucker' },
  proud: { eye: 'arc', brow: 'up', mouth: 'grin' },
  shy: { eye: 'dot', brow: 'worry', mouth: 'smile' },
  stunned: { eye: 'round', pupil: 0.5, brow: 'high', mouth: 'flat' },
  yell: { eye: 'round', pupil: 0.8, brow: 'worry', mouth: 'open' },
  stern: { eye: 'dot', brow: 'angry', mouth: 'flat' },
  hero: { eye: 'lid', brow: 'angry', mouth: 'grin' },
  bliss: { eye: 'closed', brow: 'up', mouth: 'grin' },
};
function drawFace(g, H, o) {
  const { cx, cy, rx } = H, u = rx / 100, turn = o.turn || 0, look = o.look || 0, E = EXPR[o.expr || 'neutral'] || EXPR.neutral;
  const fx = cx + turn * 26 * u, eyeY = cy - 6 * u;
  const blink = (o.blink || 0) > 0.5, eyes = [-1, 1].map((s) => ({ s, x: fx + s * 37 * u * (1 - 0.18 * Math.abs(turn) * (s * turn < 0 ? 1 : 0)), k: 1 - 0.22 * Math.max(0, -s * turn) }));
  // eyes
  for (const e of eyes) {
    const x = e.x, k = e.k, typ = blink ? 'closed' : E.eye;
    if (typ === 'round') {
      inkFill(g, ellP(x, eyeY - 4 * u, 21 * u * k, 24 * u, 0, 360, 32), '#ffffff', 6 * u);
      dt(g, x + look * 9 * u * k, eyeY - 2 * u + (o.lookY || 0) * 10 * u, 7.5 * u * (E.pupil || 1));
    } else if (typ === 'lid') {
      g.save(); pth(g, ellP(x + look * 4 * u, eyeY + 3 * u, 13 * u * k, 11 * u, 0, 180, 16)); g.fillStyle = CK; g.fill(); g.restore();
      ln(g, [[x - 18 * u * k, eyeY + 1 * u], [x + 18 * u * k, eyeY - 1 * u]], 7 * u);
    } else if (typ === 'dot') dt(g, x + look * 6 * u, eyeY + (o.lookY || 0) * 6 * u, 8 * u);
    else if (typ === 'squint') { const sx = e.s; ln(g, [[x - sx * 16 * u * k, eyeY - 12 * u], [x + sx * 12 * u * k, eyeY], [x - sx * 16 * u * k, eyeY + 12 * u]], 7 * u); }
    else if (typ === 'arc') ln(g, ellP(x, eyeY + 6 * u, 15 * u * k, 12 * u, 200, 340, 12), 6.5 * u);
    else ln(g, [[x - 15 * u * k, eyeY + 2 * u], [x + 15 * u * k, eyeY + 2 * u]], 6.5 * u);
    // brows
    const by = eyeY - 30 * u, bw = 19 * u * k, bt = 8.5 * u, s = e.s;
    const B = { smug: s < 0 ? [[-bw, 4], [bw, -6]] : [[-bw, -10], [bw, -2]], up: [[-bw, 2], [bw, -4 * s]], high: [[-bw, -10], [bw, -12]], flat: [[-bw, 0], [bw, 0]],
      worry: [[-bw, s > 0 ? -10 : 6], [bw, s > 0 ? 6 : -10]], angry: [[-bw, s > 0 ? 10 : -6], [bw, s > 0 ? -6 : 10]] }[E.brow] || [[-bw, 0], [bw, 0]];
    ln(g, B.map(([dx, dy]) => [x + dx, by + dy * u]), bt);
  }
  // nose hint for 3/4 turns
  if (Math.abs(turn) > 0.35) ln(g, [[fx + turn * 8 * u, cy + 10 * u], [fx + turn * 16 * u, cy + 20 * u], [fx + turn * 6 * u, cy + 22 * u]], 5 * u);
  // moustache / beard under the mouth layer where they sit
  const my = cy + 40 * u;
  if (o.beard) {
    const pts = []; for (let i = 0; i <= 24; i++) { const a = dg(10 + 160 * i / 24); const j = i % 2 ? 0.93 : 1.04; pts.push([cx + rx * 0.9 * Math.cos(a) * j, cy + 18 * u + rx * 0.82 * Math.sin(a) * j]); }
    pts.push([fx - 40 * u, my + 2 * u], [fx + 40 * u, my + 2 * u]); inkFill(g, pts, o.beard, 6 * u);
  }
  // mouth
  const mx = fx + turn * 6 * u, M = E.mouth;
  if (M === 'smirk') ln(g, [[mx - 26 * u, my + 6 * u], [mx, my + 9 * u], [mx + 24 * u, my + 3 * u], [mx + 32 * u, my - 6 * u]], 7 * u);
  else if (M === 'smile') ln(g, ellP(mx, my - 12 * u, 26 * u, 20 * u, 25, 155, 14), 7 * u);
  else if (M === 'flat') ln(g, [[mx - 18 * u, my + 4 * u], [mx + 18 * u, my + 4 * u]], 7 * u);
  else if (M === 'frown') ln(g, ellP(mx, my + 22 * u, 24 * u, 16 * u, 205, 335, 14), 7 * u);
  else if (M === 'wavy') ln(g, [[mx - 24 * u, my + 6 * u], [mx - 12 * u, my], [mx, my + 6 * u], [mx + 12 * u, my], [mx + 24 * u, my + 6 * u]], 6 * u);
  else if (M === 'o') inkFill(g, ellP(mx, my + 6 * u, 8 * u, 10 * u, 0, 360, 20), '#3a1a20', 5 * u);
  else if (M === 'grin' || M === 'grit') {
    const w = (M === 'grit' ? 34 : 46) * u, h = (M === 'grit' ? 18 : 30) * u, top = my - 6 * u;
    const pts = [[mx - w, top], [mx + w, top - 4 * u], ...ellP(mx, top, w, h, 0, 180, 18).map(([x, y]) => [x, Math.max(y, top)])];
    pts.splice(2, 1);
    g.save(); pth(g, pts); g.fillStyle = '#ffffff'; g.fill(); g.clip();
    for (let x = mx - w + 13 * u; x < mx + w; x += 13 * u) ln(g, [[x, top - 6 * u], [x, top + h + 4 * u]], 3.5 * u);
    ln(g, [[mx - w, top + h * 0.45], [mx + w, top + h * 0.45 - 2 * u]], 3.5 * u); g.restore();
    inkFill(g, pts, null, 6.5 * u);
  } else if (M === 'open') {
    const pts = [[mx - 34 * u, my - 4 * u], [mx + 34 * u, my - 4 * u], ...ellP(mx, my - 4 * u, 34 * u, 34 * u, 0, 180, 18).slice(1)];
    inkFill(g, pts, '#4a1c24', 6.5 * u);
    g.save(); pth(g, pts); g.clip(); inkFill(g, ellP(mx, my + 30 * u, 20 * u, 12 * u), '#e8707a', 0); g.restore();
    ln(g, [[mx - 30 * u, my], [mx + 30 * u, my]], 7 * u, '#ffffff');
  }
  if (M === 'pucker') { inkFill(g, ellP(mx, my + 4 * u, 13 * u, 10 * u, 0, 360, 18), '#5a2430', 5.5 * u); for (const a of [-60, -20, 20, 60]) { const r0 = 18 * u, r1 = 28 * u, c = Math.cos(dg(a + 90)), s_ = Math.sin(dg(a + 90)); ln(g, [[mx + c * r0, my + 4 * u + s_ * r0 * 0.8], [mx + c * r1, my + 4 * u + s_ * r1 * 0.8]], 3.5 * u); } }
  if (o.blush) for (const sd of [-1, 1]) { g.fillStyle = `rgba(240,120,140,${0.55 * o.blush})`; g.beginPath(); g.ellipse(fx + sd * 62 * u, cy + 26 * u, 20 * u, 11 * u, 0, 0, 7); g.fill(); }
  if (o.glasses) { const G = o.glasses === true ? {} : o.glasses, w = (G.thick ? 11 : 6.5) * u, r = (G.r || 30) * u;
    for (const e of eyes) { inkFill(g, ellP(e.x, eyeY - 3 * u, r * e.k, r * 0.9, 0, 360, 30), 'rgba(205,235,255,0.28)', w); ln(g, ellP(e.x - 8 * u, eyeY - 12 * u, r * 0.55 * e.k, r * 0.45, 200, 250, 6), 3 * u, 'rgba(255,255,255,0.9)'); }
    ln(g, [[eyes[0].x + r * eyes[0].k, eyeY - 6 * u], [eyes[1].x - r * eyes[1].k, eyeY - 6 * u]], w * 0.8);
    for (const e of eyes) ln(g, [[e.x + e.s * r * e.k, eyeY - 8 * u], [e.x + e.s * (rx * 0.9), eyeY - 16 * u]], w * 0.7); }
  if (o.wet) { const a = Math.min(1, o.wet);
    g.save(); g.globalAlpha = a;
    for (const [dx, dy, l] of [[-70, -60, 70], [-30, -90, 40], [40, -70, 90], [78, -20, 60], [-82, 10, 50], [10, 10, 34]]) {
      g.strokeStyle = 'rgba(250,215,50,0.42)'; g.lineWidth = 7 * u; g.lineCap = 'round'; g.beginPath(); g.moveTo(cx + dx * u, cy + dy * u); g.lineTo(cx + (dx + 3) * u, cy + (dy + l) * u); g.stroke();
      dt(g, cx + (dx + 3) * u, cy + (dy + l + 4) * u, 7 * u, 'rgba(250,215,50,0.75)'); dt(g, cx + (dx - 2) * u, cy + (dy + 4) * u, 3.2 * u, 'rgba(255,255,255,0.95)'); }
    for (const [dx, dy] of [[-56, -40], [60, 30], [-10, -110]]) { g.fillStyle = 'rgba(255,255,255,0.85)'; g.beginPath(); g.ellipse(cx + dx * u, cy + dy * u, 9 * u, 4 * u, -0.5, 0, 7); g.fill(); }
    g.restore(); }
  if (o.sweat) { const sx = cx + rx * 0.72, sy = cy - 60 * u; inkFill(g, [[sx, sy - 22 * u], [sx + 12 * u, sy + 4 * u], ...ellP(sx, sy + 6 * u, 12 * u, 12 * u, 0, 180, 10), [sx - 12 * u, sy + 4 * u]], '#9ad4f4', 4 * u); }
  if (o.mous) {
    const t = o.mousStyle || 'brush', y = my - 9 * u, c = o.mous;
    const pts = t === 'handle'
      ? [[mx, y - 6 * u], [mx + 18 * u, y - 10 * u], [mx + 34 * u, y - 2 * u], [mx + 44 * u, y - 14 * u], [mx + 40 * u, y + 4 * u], [mx + 20 * u, y + 6 * u], [mx, y + 2 * u], [mx - 20 * u, y + 6 * u], [mx - 40 * u, y + 4 * u], [mx - 44 * u, y - 14 * u], [mx - 34 * u, y - 2 * u], [mx - 18 * u, y - 10 * u]]
      : [[mx - 34 * u, y + 6 * u], [mx - 30 * u, y - 8 * u], [mx - 10 * u, y - 12 * u], [mx, y - 6 * u], [mx + 10 * u, y - 12 * u], [mx + 30 * u, y - 8 * u], [mx + 34 * u, y + 6 * u], [mx, y + 2 * u]];
    inkFill(g, pts, c, 5 * u);
  }
  if (o.goatee) inkFill(g, [[mx - 12 * u, my + 26 * u], [mx + 12 * u, my + 26 * u], [mx, my + 48 * u]], o.goatee, 5 * u);
}

// ---------- hair & hats ----------
function drawHair(g, H, o) {
  const { cx, cy, rx, ry } = H, u = rx / 100, c = o.hair, st = o.hairStyle || 'mop';
  if (!c || st === 'bald') return;
  const turn = o.turn || 0;
  if (st === 'mop' || st === 'side') {
    const top = []; for (let i = 0; i <= 30; i++) { const a = dg(178 + 184 * i / 30); top.push([cx + rx * 1.05 * Math.cos(a), cy + ry * 1.04 * Math.sin(a) - 2 * u]); }
    const fr = []; for (let i = 0; i <= 8; i++) { const t = i / 8, x = cx + rx * (1.0 - 2.0 * t); const sw = st === 'side' ? (t - 0.5) * 30 * u : 0; fr.push([x, cy - 34 * u + (i % 2 ? 10 : 0) * u + sw + Math.abs(t - 0.5) * 40 * u * (st === 'side' ? 0 : 1) - turn * 6 * u]); }
    const pts = [...top, ...fr]; shaded(g, pts, c, shadeC(c, 0.72), 8 * u, [-0.1, -0.12]);
    for (let k = 0; k < 3; k++) ln(g, ellP(cx - 10 * u + k * 22 * u, cy - 40 * u, 55 * u, 50 * u, 230 + k * 6, 290 + k * 6, 10), 3 * u, mix(c, '#ffffff', 0.35));
  } else if (st === 'short') {
    const pts = []; for (let i = 0; i <= 24; i++) { const a = dg(200 + 140 * i / 24); pts.push([cx + rx * 1.02 * Math.cos(a), cy + ry * 1.02 * Math.sin(a)]); }
    for (let i = 0; i <= 6; i++) pts.push([cx + rx * 0.9 * (1 - 2 * i / 6), cy - ry * 0.55 + (i % 2) * 8 * u]);
    shaded(g, pts, c, shadeC(c, 0.72), 7 * u);
  } else if (st === 'sides') { // bald top, hair at the sides (under hats)
    for (const s of [-1, 1]) inkFill(g, [[cx + s * rx * 0.98, cy - 40 * u], [cx + s * rx * 1.04, cy + 10 * u], [cx + s * rx * 0.86, cy + 20 * u], [cx + s * rx * 0.82, cy - 30 * u]], c, 6 * u);
  } else if (st === 'bun') {
    inkFill(g, ellP(cx, cy - ry * 1.12, 36 * u, 30 * u), c, 7 * u);
    drawHair(g, H, { ...o, hairStyle: 'short' });
  }
}
function drawHat(g, H, o) {
  const h = o.hat; if (!h) return;
  const { cx, cy, rx, ry } = H, u = rx / 100, top = cy - ry, c = h.color || '#2a2438', b = h.band || shadeC(c, 1.5), tilt = dg(h.tilt || 0);
  g.save(); g.translate(cx, top + 30 * u); g.rotate(tilt); g.translate(-cx, -(top + 30 * u));
  switch (h.type) {
    case 'wide': {
      inkFill(g, [[cx - 68 * u, top + 18 * u], [cx - 58 * u, top - 58 * u], [cx - 20 * u, top - 66 * u], [cx, top - 54 * u], [cx + 22 * u, top - 66 * u], [cx + 60 * u, top - 58 * u], [cx + 70 * u, top + 18 * u]], c, 8 * u);
      inkFill(g, [[cx - 66 * u, top + 2 * u], [cx + 68 * u, top + 2 * u], [cx + 68 * u, top + 16 * u], [cx - 66 * u, top + 16 * u]], b, 5 * u);
      inkFill(g, ellP(cx, top + 22 * u, 200 * u, 18 * u, 0, 360, 48), c, 8 * u);
      ln(g, ellP(cx, top + 20 * u, 196 * u, 12 * u, 200, 340, 30), 3 * u, mix(c, '#ffffff', 0.25));
      break;
    }
    case 'flatcap': {
      const dome = ellP(cx - 4 * u, top + 30 * u, rx * 1.1, ry * 0.62, 180, 360, 30);
      const pts = [...dome, [cx + rx * 1.06, top + 44 * u], [cx - rx * 1.1, top + 44 * u]];
      g.save(); pth(g, pts); g.fillStyle = c; g.fill(); g.clip();
      if (h.stripes) for (let x = cx - rx * 1.2; x < cx + rx * 1.2; x += 26 * u) inkFill(g, [[x, top - 60 * u], [x + 12 * u, top - 60 * u], [x + 12 * u + (x - cx) * 0.25, top + 50 * u], [x + (x - cx) * 0.25, top + 50 * u]], h.stripes, 0);
      g.restore(); inkFill(g, pts, null, 8 * u);
      inkFill(g, [[cx + 10 * u, top + 38 * u], [cx + rx * 1.2, top + 34 * u], [cx + rx * 1.32, top + 52 * u], [cx + 6 * u, top + 54 * u]], shadeC(c, 0.75), 7 * u);
      dt(g, cx - 4 * u, top - 30 * u + ry * 0.0, 7 * u, b);
      break;
    }
    case 'police': {
      inkFill(g, [[cx - 92 * u, top - 40 * u], [cx + 92 * u, top - 40 * u], [cx + 76 * u, top + 14 * u], [cx - 76 * u, top + 14 * u]], c, 8 * u);
      inkFill(g, [[cx - 78 * u, top - 4 * u], [cx + 78 * u, top - 4 * u], [cx + 76 * u, top + 16 * u], [cx - 76 * u, top + 16 * u]], b, 5 * u);
      inkFill(g, [[cx - 70 * u, top + 16 * u], [cx + 70 * u, top + 16 * u], [cx + 56 * u, top + 34 * u], [cx - 56 * u, top + 34 * u]], '#14121a', 6 * u);
      inkFill(g, [[cx, top - 34 * u], [cx + 12 * u, top - 20 * u], [cx, top - 6 * u], [cx - 12 * u, top - 20 * u]], '#e8b84a', 4 * u);
      break;
    }
    case 'crown': {
      const pts = [[cx - 80 * u, top + 26 * u], [cx - 84 * u, top - 50 * u], [cx - 56 * u, top - 18 * u], [cx - 34 * u, top - 64 * u], [cx - 12 * u, top - 20 * u], [cx + 8 * u, top - 70 * u], [cx + 26 * u, top - 20 * u], [cx + 48 * u, top - 64 * u], [cx + 64 * u, top - 18 * u], [cx + 86 * u, top - 50 * u], [cx + 82 * u, top + 26 * u]];
      shaded(g, pts, c, shadeC(c, 0.72), 7 * u);
      ['#e0383a', '#3a7be0', '#e0383a', '#3ab070'].forEach((gc, i) => inkFill(g, ellP(cx - 54 * u + i * 36 * u, top + 8 * u, 7 * u, 7 * u, 0, 360, 12), gc, 3 * u));
      for (const x of [-84, -34, 8, 48, 86]) inkFill(g, ellP(cx + x * u, top - (x === 8 ? 72 : x === -84 || x === 86 ? 52 : 66) * u, 7 * u, 7 * u, 0, 360, 12), '#ffffff', 3 * u);
      break;
    }
    case 'top': {
      inkFill(g, [[cx - 60 * u, top + 16 * u], [cx - 56 * u, top - 100 * u], [cx + 56 * u, top - 100 * u], [cx + 60 * u, top + 16 * u]], c, 8 * u);
      inkFill(g, [[cx - 60 * u, top - 10 * u], [cx + 60 * u, top - 10 * u], [cx + 60 * u, top + 10 * u], [cx - 60 * u, top + 10 * u]], b, 5 * u);
      inkFill(g, ellP(cx, top + 18 * u, 110 * u, 14 * u), c, 7 * u);
      break;
    }
    case 'bowler': {
      shaded(g, [...ellP(cx, top + 16 * u, 74 * u, 74 * u, 180, 360, 24)], c, shadeC(c, 0.7), 8 * u);
      inkFill(g, ellP(cx, top + 18 * u, 112 * u, 13 * u), c, 7 * u);
      break;
    }
    case 'hard': {
      shaded(g, [...ellP(cx, top + 24 * u, 92 * u, 80 * u, 180, 360, 24)], c, shadeC(c, 0.75), 8 * u);
      inkFill(g, ellP(cx, top + 26 * u, 122 * u, 12 * u), shadeC(c, 0.9), 7 * u);
      ln(g, [[cx, top - 54 * u], [cx, top + 20 * u]], 9 * u, shadeC(c, 0.8));
      break;
    }
    case 'chef': {
      inkFill(g, [[cx - 62 * u, top + 24 * u], [cx - 66 * u, top - 40 * u], ...ellP(cx - 40 * u, top - 60 * u, 40 * u, 38 * u, 150, 300, 8), ...ellP(cx + 4 * u, top - 84 * u, 44 * u, 40 * u, 200, 340, 8), ...ellP(cx + 46 * u, top - 58 * u, 38 * u, 36 * u, 240, 390, 8), [cx + 64 * u, top + 24 * u]], '#ffffff', 7 * u);
      ln(g, [[cx - 62 * u, top + 4 * u], [cx + 64 * u, top + 4 * u]], 4 * u);
      break;
    }
    case 'cap': {
      const T_ = o.turn || 0, bx = cx + T_ * 40 * u, cb = top + 40 * u;
      const dome = [...ellP(cx, cb, rx * 0.98, 74 * u, 180, 360, 30)];
      shaded(g, dome, c, shadeC(c, 0.7), 8 * u);
      ln(g, ellP(cx, cb, rx * 0.48, 74 * u, 230, 310, 12), 3.5 * u, shadeC(c, 0.6));
      dt(g, cx, top - 34 * u, 8 * u, shadeC(c, 0.8));
      if (h.patch) { inkFill(g, ellP(bx, top + 2 * u, 19 * u, 17 * u, 0, 360, 20), h.patch, 4 * u); ln(g, [[bx - 5 * u, top - 6 * u], [bx + 7 * u, top - 12 * u]], 3 * u, '#5a8a2a'); }
      shaded(g, [[bx - 104 * u, cb - 4 * u], [bx + 104 * u, cb - 4 * u], ...ellP(bx, cb - 2 * u, 104 * u, 22 * u, 0, 180, 24)], b, shadeC(b, 0.7), 7 * u);
      break;
    }
    case 'beanie': {
      shaded(g, [...ellP(cx, top + 34 * u, rx * 1.04, 96 * u, 180, 360, 24)], c, shadeC(c, 0.72), 8 * u);
      inkFill(g, [[cx - rx * 1.06, top + 20 * u], [cx + rx * 1.06, top + 20 * u], [cx + rx * 1.06, top + 46 * u], [cx - rx * 1.06, top + 46 * u]], b, 6 * u);
      inkFill(g, ellP(cx, top - 66 * u, 16 * u, 16 * u), b, 5 * u);
      break;
    }
  }
  g.restore();
}

// ---------- body, arms, legs ----------
const ARM = { // hand target relative to the shoulder (screen x positive = outward on that side)
  hang: [34, 190, 1], hip: [-6, 150, 2.2], wave: [80, -170, 1], point: [200, 0, 0.3], reach: [140, 70, 0.6], up: [60, -210, 0.6],
  cross: [-70, 120, -0.5], belly: [-40, 130, 1.4], chin: [-60, -60, 1.6], thumb: [90, 30, 1], wheel: [120, 50, 0.8], forward: [60, 110, 0.4],
};
function armPts(sx, sy, side, pose) {
  let hx, hy, bulge;
  if (pose && typeof pose === 'object') { hx = pose.x; hy = pose.y; bulge = pose.b ?? 0.8; }
  else { const a = ARM[pose || 'hang'] || ARM.hang; hx = sx + side * a[0]; hy = sy + a[1]; bulge = a[2]; }
  const mx = (sx + hx) / 2, my = (sy + hy) / 2, dx = hx - sx, dy = hy - sy, L = Math.hypot(dx, dy) || 1;
  const ex = mx + side * Math.abs(dy / L) * 22 * bulge + (dy < 0 ? side * 10 : 0), ey = my + (Math.abs(dx / L)) * 16 * bulge;
  return [[sx, sy], [ex, ey], [hx, hy]];
}
const LEMON = '#ffd81f', LEMON_SH = '#e8a80c';
export const drawLemon = (g, x, y, r = 30, rot = -0.4) => { g.save(); g.translate(x, y); g.rotate(rot);
  const pts = [...ellP(0, 0, r * 1.3, r, 0, 360, 36)]; pts.splice(0, 1, [r * 1.62, 0]); pts.splice(18, 1, [-r * 1.62, 0]);
  shaded(g, pts, LEMON, LEMON_SH, Math.max(4, r * 0.16)); for (let i = 0; i < 6; i++) dt(g, -r * 0.6 + i * r * 0.25, -r * 0.3 + (i % 2) * r * 0.25, r * 0.04, 'rgba(160,110,0,.5)');
  g.fillStyle = 'rgba(255,255,255,.85)'; g.beginPath(); g.ellipse(-r * 0.4, -r * 0.45, r * 0.35, r * 0.13, -0.2, 0, 7); g.fill();
  inkFill(g, [[r * 0.2, -r * 0.9], [r * 0.9, -r * 1.5], [r * 0.95, -r * 0.95]], '#5aa63a', Math.max(3, r * 0.1)); g.restore(); };
export const drawBottle = (g, x, y, k = 1) => { g.save(); g.translate(x, y); g.scale(k, k);
  inkFill(g, [[-14, -120], [14, -120], [14, -92], [34, -70], [34, 40], [-34, 40], [-34, -70], [-14, -92]], 'rgba(255,240,140,0.92)', 6);
  inkFill(g, [[-30, -10], [30, -10], [30, 40], [-30, 40]], 'rgba(250,210,40,0.95)', 0);
  inkFill(g, [[-16, -136], [16, -136], [16, -116], [-16, -116]], '#3a8a3a', 5);
  inkFill(g, [[-37, -62], [37, -62], [37, 6], [-37, 6]], '#fffbe8', 5);
  drawLemon(g, 0, -42, 9, -0.3);
  g.fillStyle = '#1a1416'; g.font = '800 11.5px Inter, "DejaVu Sans", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('Zitronensaft', 0, -16);
  g.fillStyle = 'rgba(255,255,255,.7)'; g.fillRect(20, -60, 6, 90); g.restore(); };
export const drawNote = (g, x, y, k = 1, rot = -0.08) => { g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
  inkFill(g, [[-78, -50], [78, -56], [82, 48], [-74, 52]], '#fffdf2', 6); for (let i = 0; i < 4; i++) ln(g, [[-66, -30 + i * 24], [70, -34 + i * 24]], 1.5, '#9ac4e8');
  g.fillStyle = '#c4161c'; g.font = 'italic 900 36px Inter, "DejaVu Sans", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('Geld her!', 2, 0); g.restore(); };
export const drawPhoto = (g, x, y, k = 1, dev = 1, rot = 0, img = 'ceiling') => { g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
  inkFill(g, [[-60, -70], [60, -70], [60, 80], [-60, 80]], '#fbfaf4', 5);
  g.save(); g.beginPath(); g.rect(-50, -60, 100, 100); g.clip(); g.fillStyle = '#1e2a26'; g.fillRect(-50, -60, 100, 100);
  g.globalAlpha = Math.max(0, Math.min(1, dev));
  if (img === 'ceiling') { const gr = g.createRadialGradient(0, -6, 2, 0, -6, 70); gr.addColorStop(0, '#fff6c8'); gr.addColorStop(0.3, '#e8cf98'); gr.addColorStop(1, '#a88a5e'); g.fillStyle = gr; g.fillRect(-50, -60, 100, 100);
    ln(g, [[0, -60], [0, -24]], 3); inkFill(g, [[-20, -24], [20, -24], [26, -8], [-26, -8]], '#3a7a6a', 3); dt(g, 0, -4, 9, '#fffbe0'); }
  else if (img === 'face') { g.fillStyle = '#8a8a8a'; g.fillRect(-50, -60, 100, 100); g.filter = 'grayscale(1)'; g.translate(-50, -66); g.scale(0.34, 0.34); toonChar({ g }, LEMONMAN, { expr: 'sly', wet: 0.6 }); }
  g.restore(); g.restore(); };
function drawProp(g, kind, x, y, side) {
  if (!kind) return;
  if (typeof kind === 'object') { if (kind.k === 'photo') drawPhoto(g, x + side * 20, y - 40, kind.s || 1, kind.dev ?? 1, kind.rot || 0, kind.img); if (kind.k === 'lemon') drawLemon(g, x, y - 6, kind.r || 30, kind.rot ?? -0.4); if (kind.k === 'note') drawNote(g, x + side * 40, y - 30, kind.s || 1, kind.rot); return; }
  if (kind === 'lemon') { drawLemon(g, x, y - 6, 30); return; }
  if (kind === 'bottle') { drawBottle(g, x, y + 20, 1); return; }
  if (kind === 'note') { drawNote(g, x + side * 50, y - 20, 1); return; }
  if (kind === 'sack') { inkFill(g, [[x - 10, y + 6], [x + 10, y + 6], [x + 44, y + 70], [x + 50, y + 140], [x - 50, y + 140], [x - 44, y + 70]], '#d8c49a', 6); ln(g, [[x - 14, y + 18], [x + 14, y + 18]], 6, '#8a6a3a'); for (const dx of [-24, 6, 30]) ln(g, [[x + dx, y + 70], [x + dx * 1.1, y + 128]], 2.5, '#a8946a'); return; }
  if (kind === 'brush') { ln(g, [[x - 40 * side, y + 40], [x + 30 * side, y - 40]], 9, '#c8862a'); ln(g, [[x + 30 * side, y - 40], [x + 46 * side, y - 60]], 13, '#3a2a20'); return; }
  if (kind === 'drink') { inkFill(g, [[x - 26, y - 60], [x + 26, y - 60], [x + 20, y + 20], [x - 20, y + 20]], '#e83a4a', 6); inkFill(g, [[x - 26, y - 44], [x + 26, y - 44], [x + 25, y - 30], [x - 25, y - 30]], '#ffffff', 0); ln(g, [[x + 6, y - 60], [x + 16, y - 100], [x + 30, y - 104]], 6, '#ffffff'); ln(g, [[x + 6, y - 60], [x + 16, y - 100], [x + 30, y - 104]], 1.5); return; }
  if (kind === 'skate') { g.save(); g.translate(x, y); g.rotate(side * 0.2); inkFill(g, pill(-26, -150, 26, 150, 26), '#2a8ad8', 6); for (const yy of [-110, 110]) { inkFill(g, ellP(-30, yy, 10, 14), '#f2e0a0', 4); inkFill(g, ellP(30, yy, 10, 14), '#f2e0a0', 4); } inkFill(g, [[-20, -40], [20, -60], [20, 40], [-20, 60]], '#ffd23a', 0); g.restore(); return; }
  if (kind === 'shopbag') { inkFill(g, [[x - 50, y + 10], [x + 50, y + 10], [x + 56, y + 150], [x - 56, y + 150]], '#c89a5a', 6); ln(g, [[x - 50, y + 30], [x + 50, y + 30]], 3, '#a87a3a'); ln(g, [[x - 20, y + 12], [x - 30, y - 50]], 14, '#e8c070'); ln(g, [[x - 20, y + 12], [x - 30, y - 50]], 3); for (const dx of [10, 26]) { ln(g, [[x + dx, y + 12], [x + dx + 8, y - 40]], 9, '#5aa040'); } return; }
  if (kind === 'chalk') { ln(g, [[x, y], [x + 18 * side, y - 18]], 9, '#ffffff'); return; }
  if (kind === 'bag') { inkFill(g, [...ellP(x, y + 52, 40, 44, 0, 360, 24)], '#c99a52', 6); inkFill(g, [[x - 14, y], [x + 14, y], [x + 18, y + 14], [x - 18, y + 14]], '#a87a3a', 5); g.fillStyle = '#3d8f4a'; g.font = 'bold 44px sans-serif'; g.textAlign = 'center'; g.fillText('€', x, y + 70); }
  else if (kind === 'paper') { inkFill(g, [[x - 10, y - 70], [x + 70 * side, y - 80], [x + 76 * side, y + 20], [x - 4, y + 30]], '#f4ead2', 5); for (let k = 0; k < 4; k++) ln(g, [[x + 6 * side, y - 50 + k * 18], [x + 58 * side, y - 56 + k * 18]], 3, '#9a8a70'); }
  else if (kind === 'book') { inkFill(g, [[x - 50, y - 30], [x + 50, y - 30], [x + 50, y + 40], [x - 50, y + 40]], '#8a2f3a', 6); ln(g, [[x, y - 30], [x, y + 40]], 4); }
  else if (kind === 'mug') { inkFill(g, [[x - 22, y - 40], [x + 22, y - 40], [x + 20, y + 14], [x - 20, y + 14]], '#e8d6a0', 6); inkFill(g, ellP(x, y - 40, 22, 8), '#ffffff', 4); }
  else if (kind === 'hammer') { ln(g, [[x, y + 50], [x, y - 70]], 12, '#8a5a34'); ln(g, [[x, y + 50], [x, y - 70]], 3); inkFill(g, [[x - 34, y - 90], [x + 30, y - 90], [x + 30, y - 60], [x - 34, y - 60]], '#7a7a86', 6); }
  else if (kind === 'key') { inkFill(g, ellP(x, y - 24, 16, 16), '#e0b040', 5); ln(g, [[x, y - 8], [x, y + 50], [x + 14 * side, y + 50], [x, y + 36], [x + 12 * side, y + 36]], 7, '#e0b040'); }
}
const PANT = '#2b2733';
function drawBody(g, s, o) {
  const bw = s.bw || 200, y0 = 352, y1 = s.robe ? 925 : 705, x0 = 300 - bw / 2, x1 = 300 + bw / 2, col = s.body || '#d8483a', sh = coolShade(col);
  const flare = s.robe ? 26 : 0, pts = pill(x0, y0, x1, y1, Math.min(90, bw * 0.46), flare);
  if (s.cape) inkFill(g, [[x0 - 6, y0 + 30], [x1 + 6, y0 + 30], [x1 + 46, 930], [x1 + 30, 960], [x0 - 30, 960], [x0 - 46, 930]], s.cape, 8);
  shaded(g, pts, col, sh, 9);
  g.save(); pth(g, pts); g.clip();
  for (const d of s.detail || []) {
    const t = typeof d === 'string' ? d : d.t, dc = (typeof d === 'object' && d.c) || null;
    if (t === 'belt') { const y = y1 - 70; inkFill(g, [[x0 - 5, y], [x1 + 5, y], [x1 + 5, y + 26], [x0 - 5, y + 26]], dc || '#3a2a24', 5); inkFill(g, [[286, y - 3], [314, y - 3], [314, y + 29], [286, y + 29]], '#e2b84c', 4); }
    if (t === 'ammo') { const y = y1 - 72; inkFill(g, [[x0 - 5, y], [x1 + 5, y], [x1 + 5, y + 28], [x0 - 5, y + 28]], '#3a2a24', 5); for (let x = x0 + 14; x < 300; x += 15) inkFill(g, [[x, y - 14], [x + 9, y - 14], [x + 9, y + 10], [x, y + 10]], '#e2b84c', 2.5); }
    if (t === 'buttons') for (let k = 0; k < 3; k++) inkFill(g, ellP(300, y0 + 90 + k * 60, 8, 8, 0, 360, 12), dc || '#f2e6c8', 3);
    if (t === 'collar') { inkFill(g, [[300 - 46, y0 - 4], [300, y0 + 46], [300 + 46, y0 - 4]], dc || '#ffffff', 6); }
    if (t === 'tie') inkFill(g, [[292, y0 + 10], [308, y0 + 10], [316, y0 + 150], [300, y0 + 172], [284, y0 + 150]], dc || '#2b2a50', 5);
    if (t === 'vest') for (const sd of [-1, 1]) inkFill(g, [[300 + sd * 12, y0 - 10], [300 + sd * (bw / 2 + 10), y0 - 10], [300 + sd * (bw / 2 + 10), y1 + 10], [300 + sd * 20, y1 + 10], [300 + sd * 20, y0 + 120]], dc || '#3c8a8c', 6);
    if (t === 'apron') { inkFill(g, pill(300 - bw * 0.36, y0 + 110, 300 + bw * 0.36, y1 + 20, 30), dc || '#c8873e', 6); ln(g, [[300 - bw * 0.2, y0 + 210], [300 + bw * 0.2, y0 + 210]], 4); ln(g, [[300 - bw * 0.36, y0 + 110], [300 - bw * 0.5, y0 + 20]], 5); ln(g, [[300 + bw * 0.36, y0 + 110], [300 + bw * 0.5, y0 + 20]], 5); }
    if (t === 'stripes') for (const sd of [-1, 1]) { inkFill(g, [[300 + sd * 30, y0 - 10], [300 + sd * 54, y0 - 10], [300 + sd * 54, y1 + 10], [300 + sd * 30, y1 + 10]], dc || '#e8c048', 4); }
    if (t === 'fringe') for (let x = x0 + 20; x < x1 - 14; x += 18) ln(g, [[x, y0 + 52], [x + 2, y0 + 82]], 6, dc || '#f6efe0');
    if (t === 'seatbelt') { ln(g, [[x1 + 10, y0 + 10], [x0 + 30, y1 - 40]], 22, '#3c3c46'); ln(g, [[x1 + 10, y0 + 10], [x0 + 30, y1 - 40]], 3, '#9a9aa8'); }
    if (t === 'straps') for (const sd of [-1, 1]) ln(g, [[300 + sd * 50, y0 - 10], [300 + sd * 40, y1]], 12, dc || '#2c2a38');
    if (t === 'badge') inkFill(g, Array.from({ length: 10 }, (_, i) => { const a = dg(-90 + i * 36), r = i % 2 ? 9 : 22; return [300 - bw * 0.22 + r * Math.cos(a), y0 + 80 + r * Math.sin(a)]; }), '#e8b84a', 3);
    if (t === 'scarf') inkFill(g, [[300 - 54, y0 - 6], [300 + 54, y0 - 6], [300 + 10, y0 + 70]], dc || '#d03a34', 6);
    if (t === 'pocket') inkFill(g, pill(300 + bw * 0.08, y0 + 70, 300 + bw * 0.34, y0 + 120, 8), shadeC(col, 0.9), 4);
    if (t === 'wb') { const A = (d.a || '#ff4fa0'), Bc = (d.b || '#ffd23a');
      inkFill(g, [[x0 - 10, y0 + 70], [x1 + 10, y0 + 150], [x1 + 10, y0 + 215], [x0 - 10, y0 + 135]], A, 6);
      inkFill(g, [[x0 - 10, y0 + 135], [x1 + 10, y0 + 215], [x1 + 10, y0 + 245], [x0 - 10, y0 + 165]], Bc, 6);
      inkFill(g, [[x0 - 10, y1 - 34], [x1 + 10, y1 - 34], [x1 + 10, y1 + 10], [x0 - 10, y1 + 10]], shadeC(col, 0.75), 6);
      ln(g, [[300, y0 - 4], [300, y1 - 34]], 5); for (let yy = y0 + 20; yy < y1 - 40; yy += 16) ln(g, [[294, yy], [306, yy]], 2.5, '#d8d8e0');
      inkFill(g, [[300 - 62, y0 - 8], [300 - 8, y0 + 40], [300 - 8, y0 - 8]], shadeC(col, 1.15), 5); inkFill(g, [[300 + 62, y0 - 8], [300 + 8, y0 + 40], [300 + 8, y0 - 8]], shadeC(col, 1.15), 5); }
    if (t === 'cardigan') { inkFill(g, [[300 - 30, y0 - 10], [300 + 30, y0 - 10], [300 + 22, y1 + 10], [300 - 22, y1 + 10]], d.shirt || '#f2efe6', 5); inkFill(g, [[292, y0 + 6], [308, y0 + 6], [314, y0 + 120], [300, y0 + 138], [286, y0 + 120]], d.tie || '#3a5a8a', 4); for (let k = 0; k < 4; k++) inkFill(g, ellP(300 + 38, y0 + 70 + k * 60, 7, 7, 0, 360, 10), '#e8d8b0', 3); for (let k = 0; k < 9; k++) ln(g, [[x0 + 10, y0 + 30 + k * 34], [x0 + 60, y0 + 30 + k * 34]], 2.5, shadeC(col, 0.8)); }
    if (t === 'hoodie') { inkFill(g, pill(300 - bw * 0.3, y1 - 150, 300 + bw * 0.3, y1 - 50, 30), shadeC(col, 0.85), 5); ln(g, [[280, y0 - 4], [276, y0 + 90]], 4, '#f6f0e2'); ln(g, [[320, y0 - 4], [324, y0 + 90]], 4, '#f6f0e2'); inkFill(g, ellP(300, y0 - 4, 70, 26, 0, 180, 16), shadeC(col, 0.8), 5); }
    if (t === 'emblem') { inkFill(g, [[300, y0 + 40], [370, y0 + 110], [300, y0 + 190], [230, y0 + 110]], '#ffd23a', 6); inkFill(g, ellP(300, y0 + 112, 34, 24, 0, 360, 20), '#ffe23a', 5); ln(g, [[330, y0 + 106], [342, y0 + 98]], 4, '#5a8a2a'); }
    if (t === 'jacket') { for (const sd of [-1, 1]) inkFill(g, [[300 + sd * 6, y0 - 10], [300 + sd * (bw / 2 + 10), y0 - 10], [300 + sd * (bw / 2 + 10), y1 + 10], [300 + sd * 6, y1 + 10]], null, 5); ln(g, [[300, y0], [300, y1]], 5); }
    if (t === 'blouse') { inkFill(g, [[300 - 50, y0 - 6], [300, y0 + 34], [300 - 10, y0 + 60], [300 - 56, y0 + 20]], '#ffffff', 5); inkFill(g, [[300 + 50, y0 - 6], [300, y0 + 34], [300 + 10, y0 + 60], [300 + 56, y0 + 20]], '#ffffff', 5); inkFill(g, ellP(300, y0 + 40, 9, 9, 0, 360, 12), d.c || '#e8b84a', 3); }
    if (t === 'trim') { ln(g, [[x0 - 30, y1 - 12], [x1 + 30, y1 - 12]], 14, dc || '#e8c048'); }
  }
  g.restore(); inkFill(g, pts, null, 0);
  return { y0, y1, x0, x1 };
}
function drawLegs(g, s, o, B) {
  const legs = o.legs || 'stand', st = o.step || 0, hipY = B.y1 - 14, c = s.legs || null;
  const L = (pts) => { if (c) { ln(g, pts, 18); ln(g, pts, 9, c); } else ln(g, pts, 8); };
  if (s.robe) { for (const sd of [-1, 1]) ln(g, [[300 + sd * 40, 925], [300 + sd * 44, 968], [300 + sd * 64, 968]], 8); return; }
  for (const sd of [-1, 1]) {
    const hx = 300 + sd * 36;
    if (legs === 'sit') L([[hx, hipY], [hx + sd * 26, hipY + 70], [hx + sd * 30, hipY + 200], [hx + sd * 52, hipY + 200]]);
    else if (legs === 'crouch') L([[hx, hipY], [hx + sd * 90, hipY + 100], [hx + sd * 60, 968], [hx + sd * 82, 968]]);
    else { const sw = legs === 'walk' ? Math.sin(st * Math.PI * 2 + (sd > 0 ? 0 : Math.PI)) * 34 : 0, lift = legs === 'walk' ? Math.max(0, Math.sin(st * Math.PI * 2 + (sd > 0 ? 0 : Math.PI))) * 18 : 0;
      L([[hx, hipY], [hx + sd * 8 + sw * 0.5, (hipY + 968) / 2 - lift * 0.3], [hx + sd * 10 + sw, 968 - lift], [hx + sd * 32 + sw, 968 - lift]]); }
  }
}

/** draw a character. spec: { body, bw, robe, cape, legs, detail[], hair, hairStyle, mous, mousStyle, beard, goatee, hat{type,color,band,stripes,tilt}, helm }
 *  opts: { expr, look, blink, turn (-1..1, 3/4 view), L, R (arm pose name or {x,y,b}), holdL, holdR (prop), legs ('stand'|'walk'|'sit'|'crouch'), step, tilt, headTilt, bob, seed } */
export const toonChar = (p, spec, opts = {}) => {
  const g = p.g, s = typeof spec === 'string' ? CAST[spec] : spec, o = { ...s, ...opts };
  g.save();
  const bob = (o.bob || 0) * 1000; g.translate(0, -bob);
  if (o.tilt) { g.translate(300, 975); g.rotate(dg(o.tilt)); g.translate(-300, -975); }
  drawLegs(g, s, o, { y1: s.robe ? 925 : 705 });
  const B = drawBody(g, s, o);
  const sY = B.y0 + 48, shoulders = { '-1': [B.x0 + 16, sY], '1': [B.x1 - 16, sY] };
  // arms behind head first? no: arms in front of the body, drawn after it
  const hr = 140 * (s.headScale || 1), H = { cx: 300 + (o.turn || 0) * 8, cy: 276, rx: hr, ry: hr * 0.9, seed: o.seed ?? 3 };
  // head (tilted about the neck)
  g.save(); g.translate(300, 380); g.rotate(dg(o.headTilt || 0)); g.translate(-300, -380);
  if (s.helm) { shaded(g, wob(H.cx, H.cy + 6, H.rx * 1.16, H.ry * 1.2, 7, 0.01), s.helm, shadeC(s.helm, 0.66), 9); }
  const hp = s.helm ? wob(H.cx + (o.turn || 0) * 18, H.cy + 16, H.rx * 0.8, H.ry * 0.82, H.seed, 0.02) : wob(H.cx, H.cy, H.rx, H.ry, H.seed);
  shaded(g, hp, HEAD, HEAD_SH, 9.5, [-0.1, -0.06]);
  if (s.helm) { inkFill(g, [[H.cx - 70, H.cy - 92], [H.cx + 96, H.cy - 104], [H.cx + 110, H.cy - 70], [H.cx - 60, H.cy - 64]], shadeC(s.helm, 1.08), 7); }
  const HH = s.helm ? { ...H, cy: H.cy + 16, rx: H.rx * 0.82, ry: H.ry * 0.82 } : H;
  if (!s.helm) drawHair(g, H, o);
  drawFace(g, HH, o);
  drawHat(g, H, o);
  g.restore();
  for (const side of [-1, 1]) {
    const pose = side < 0 ? o.L : o.R, [sx, sy] = shoulders[side], pts = armPts(sx, sy, side, pose);
    ln(g, pts, 7.5); dt(g, pts[2][0], pts[2][1], 10.5);
    drawProp(g, side < 0 ? o.holdL : o.holdR, pts[2][0], pts[2][1], side);
  }
  g.restore();
};

/** generic starter cast (make your own per story; never copy another channel's characters) */
export const CAST = {
  worker: { body: '#3f8fd0', detail: ['straps', 'pocket'], hair: '#6a4024', hairStyle: 'mop', hat: { type: 'flatcap', color: '#4a5a8a', stripes: '#c8d4ee' } },
  merchant: { body: '#e0a33a', detail: ['apron', 'belt'], hair: '#3a2a22', hairStyle: 'sides', mous: '#3a2a22', mousStyle: 'handle', hat: { type: 'bowler', color: '#3a2e2a' } },
  officer: { body: '#2e4a8a', detail: ['buttons', 'badge', 'belt'], hair: '#2a2228', hairStyle: 'sides', hat: { type: 'police', color: '#25335e', band: '#1c1a24' } },
  king: { body: '#c43a34', robe: true, cape: '#8a2228', detail: [{ t: 'trim', c: '#f2e6c8' }], hair: '#7a4a2a', hairStyle: 'sides', goatee: '#7a4a2a', hat: { type: 'crown', color: '#e8b43a' } },
  scientist: { body: '#f4f4f0', detail: ['collar', 'tie', 'pocket'], hair: '#9a9aa4', hairStyle: 'side' },
  farmer: { body: '#5aa04a', detail: ['straps', 'scarf'], hair: '#8a5a2e', hairStyle: 'mop', hat: { type: 'wide', color: '#d8b06a', band: '#8a5a2e' } },
  driver: { body: '#f0c43a', detail: ['seatbelt'], hair: '#6a4024', hairStyle: 'mop' },
  chef: { body: '#ffffff', detail: ['buttons', { t: 'scarf', c: '#d03a34' }], mous: '#2a2228', hat: { type: 'chef' } },
  kid: { body: '#e85a8a', detail: ['pocket'], hair: '#3a2a22', hairStyle: 'side', headScale: 1.05, bw: 170 },
  granny: { body: '#8a6ab0', robe: true, detail: [{ t: 'scarf', c: '#e8d0e0' }], hair: '#d8d8dc', hairStyle: 'bun' },
  builder: { body: '#e8702a', detail: [{ t: 'straps', c: '#c8c8c8' }, 'belt'], mous: '#5a3a24', hat: { type: 'hard', color: '#f2c43a' } },
  knight: { body: '#9aa2b0', helm: '#b8c0cc', detail: ['belt'], cape: '#2e4a9a' },
};

// ---------- extra fx ----------
/** soft floating dust / sparkle mote (use many, small) */
export const fxMote = (p, t, col = '#fff6dc') => { const g = p.g, a = Math.sin(t * Math.PI); const r = g.createRadialGradient(300, 500, 0, 300, 500, 60); r.addColorStop(0, `rgba(255,250,230,${0.95 * a})`); r.addColorStop(1, 'rgba(255,250,230,0)'); g.fillStyle = r; g.fillRect(200, 400, 200, 200); };
/** glow halo for lamps, buttons, headlights (draw as additive-looking card) */
export const fxGlow = (p, col = '255,214,140', k = 1) => { const g = p.g, r = g.createRadialGradient(300, 500, 0, 300, 500, 290); r.addColorStop(0, `rgba(${col},${0.9 * k})`); r.addColorStop(0.25, `rgba(${col},${0.45 * k})`); r.addColorStop(1, `rgba(${col},0)`); g.fillStyle = r; g.fillRect(0, 200, 600, 600); };

// ===================== Zitronen-Räuber cast (all invented cartoon characters) =====================
export const LEMONMAN = { body: '#1fa8b8', bw: 286, detail: [{ t: 'wb', a: '#ff4fa0', b: '#ffd23a' }], hair: '#5a3a24', hairStyle: 'short', headScale: 1.04,
  hat: { type: 'cap', color: '#e8343a', band: '#c42028', patch: '#ffd81f' }, legs: '#3a4a7a' };
export const TELLER = { body: '#7aa0c8', bw: 196, detail: [{ t: 'blouse', c: '#e8b84a' }], hair: '#7a4a2a', hairStyle: 'bun', glasses: { r: 31 } };
export const SUIT = { body: '#4a4e5c', detail: ['collar', { t: 'tie', c: '#b8283a' }, 'jacket', 'pocket'], hair: '#2a2228', hairStyle: 'side' };
export const GRANNY = { body: '#9a6ab8', robe: true, bw: 190, detail: [{ t: 'scarf', c: '#f2d0e0' }, 'buttons'], hair: '#e2e2e6', hairStyle: 'bun', glasses: { r: 26 } };
export const SKATER = { body: '#ff8a2a', bw: 180, detail: ['hoodie'], hair: '#e8c060', hairStyle: 'mop', hat: { type: 'beanie', color: '#3a8a5a', band: '#2a6a44' }, legs: '#3a5a9a' };
export const ANCHOR = { body: '#2c3450', detail: ['collar', { t: 'tie', c: '#c43a3a' }, 'jacket'], hair: '#1c1820', hairStyle: 'side' };
export const COP_TALL = { body: '#24305a', bw: 184, detail: ['buttons', 'badge', 'belt'], hair: '#3a2a22', hairStyle: 'sides', mous: '#3a2a22', mousStyle: 'handle', hat: { type: 'police', color: '#1e2a52', band: '#141826' }, legs: '#1e2440' };
export const COP_SHORT = { body: '#24305a', bw: 268, detail: ['buttons', 'badge', 'belt'], hair: '#8a5a2e', hairStyle: 'sides', hat: { type: 'police', color: '#1e2a52', band: '#141826' }, legs: '#1e2440' };
export const PROF = { body: '#8a5a3a', bw: 210, detail: [{ t: 'cardigan', shirt: '#f2efe6', tie: '#3a5a8a' }], hair: '#b8b8c0', hairStyle: 'sides', glasses: { thick: true, r: 33 } };
export const STUDENT = { body: '#f4f4f0', bw: 190, detail: ['collar', 'pocket'], hair: '#3a2a1c', hairStyle: 'mop' };
export const HERO = { body: '#2a5ae0', bw: 250, cape: '#e8343a', detail: ['emblem', { t: 'belt', c: '#ffd23a' }], hair: '#5a3a24', hairStyle: 'short', legs: '#2a5ae0' };

/** back view (no face): used for the two police officers at the door */
export const toonBack = (p, s, o = {}) => {
  const g = p.g; g.save();
  if (o.tilt) { g.translate(300, 975); g.rotate(dg(o.tilt)); g.translate(-300, -975); }
  drawLegs(g, s, { legs: o.legs || 'stand', step: o.step }, { y1: 705 });
  const B = drawBody(g, { ...s, detail: ['belt'] }, {});
  // big readable back print
  g.save(); g.fillStyle = '#ffe23a'; g.strokeStyle = CK; g.lineWidth = 7; g.textAlign = 'center'; g.textBaseline = 'middle';
  const fs = Math.min(64, (s.bw || 200) * 0.27); g.font = `900 ${fs}px Inter, "DejaVu Sans", sans-serif`;
  g.strokeText('Polizei', 300, B.y0 + 120); g.fillText('Polizei', 300, B.y0 + 120); g.restore();
  const hr = 140, H = { cx: 300, cy: 276, rx: hr, ry: hr * 0.9 }, hp = wob(H.cx, H.cy, H.rx, H.ry, 3);
  shaded(g, hp, HEAD, HEAD_SH, 9.5, [-0.1, -0.06]);
  if (s.hair && s.hairStyle !== 'bald') { g.save(); pth(g, hp); g.clip(); g.fillStyle = s.hair; g.fillRect(0, 0, 600, H.cy + 40); g.restore(); ln(g, ellP(300, H.cy + 30, H.rx * 0.98, 22, 10, 170, 20), 6); inkFill(g, hp, null, 9.5); }
  drawHat(g, H, { hat: s.hat ? { ...s.hat } : null });
  for (const side of [-1, 1]) { const pose = side < 0 ? o.L : o.R, sx = side < 0 ? B.x0 + 16 : B.x1 - 16, pts = armPts(sx, B.y0 + 48, side, pose); ln(g, pts, 7.5); dt(g, pts[2][0], pts[2][1], 10.5); }
  g.restore();
};

// ---------- story fx ----------
/** white cartoon mitten hand (close-ups only), centred at 300,500, pointing up; sleeve colour below */
export const mitten = (g, x, y, k = 1, rot = 0, sleeve = '#1fa8b8', grip = 0) => { g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
  inkFill(g, [[-70, 90], [70, 90], [80, 260], [-80, 260]], sleeve, 9); inkFill(g, [[-74, 80], [74, 80], [74, 112], [-74, 112]], shadeC(sleeve, 0.8), 7);
  shaded(g, [...ellP(0, 10, 82, 92, 0, 360, 40)], HEAD, HEAD_SH, 9);
  for (let i = 0; i < 3; i++) ln(g, [[-40 + i * 34, -70 + grip * 30], [-34 + i * 34, -20 + grip * 20]], 6);
  inkFill(g, [...ellP(-86, 18, 30, 50, 0, 360, 24)], HEAD, 8); g.restore(); };
/** big squeezed lemon half for the hook (centre 300,500). t 0..1 = squeeze */
export const fxLemonSqueeze = (p, t) => { const g = p.g, sq = Math.sin(Math.min(1, t) * Math.PI * 0.5);
  g.save(); g.translate(300, 470); g.scale(1 + sq * 0.12, 1 - sq * 0.22);
  shaded(g, ellP(0, 0, 230, 200, 0, 360, 60), LEMON, LEMON_SH, 12);
  inkFill(g, ellP(0, -10, 196, 166, 0, 360, 60), '#fff2a0', 8);
  for (let i = 0; i < 9; i++) { const a = dg(i * 40), a2 = dg(i * 40 + 34); inkFill(g, [[0, -10], [Math.cos(a) * 172, -10 + Math.sin(a) * 144], ...ellP(0, -10, 172, 144, i * 40, i * 40 + 34, 6), [0, -10]], '#ffe14a', 4); }
  inkFill(g, ellP(0, -10, 22, 18, 0, 360, 16), '#fff6c0', 4);
  for (let i = 0; i < 12; i++) { g.fillStyle = 'rgba(255,255,255,.75)'; g.beginPath(); g.ellipse(-120 + (i * 53) % 240, -90 + (i * 37) % 170, 7, 4, i, 0, 7); g.fill(); }
  g.restore();
  mitten(g, 120, 640 + sq * 10, 1.05, 0.5, '#1fa8b8', sq); mitten(g, 480, 640 + sq * 10, -1.05 * -1, -0.5, '#1fa8b8', sq);
};
/** juice droplets flying toward camera. t 0..1 */
export const fxJuice = (p, t, seed = 1, n = 18) => { const g = p.g; for (let i = 0; i < n; i++) { const a = (i * 137.5 + seed * 40) * Math.PI / 180, sp = 0.4 + ((i * 53) % 10) / 10, r = 30 + t * 420 * sp;
  const x = 300 + Math.cos(a) * r, y = 500 + Math.sin(a) * r * 1.2 + t * t * 120, s = (6 + ((i * 7) % 9)) * (0.6 + t * 2.4 * sp);
  g.fillStyle = 'rgba(255,226,60,0.9)'; g.strokeStyle = 'rgba(150,110,0,0.9)'; g.lineWidth = 3; g.beginPath(); g.ellipse(x, y, s, s * 1.15, a, 0, 7); g.fill(); g.stroke();
  g.fillStyle = 'rgba(255,255,255,0.95)'; g.beginPath(); g.ellipse(x - s * 0.3, y - s * 0.35, s * 0.3, s * 0.2, 0, 0, 7); g.fill(); } };
/** light bulb idea */
export const fxBulb = (p, t) => { const g = p.g, a = Math.min(1, t * 3), sc = 0.6 + 0.4 * Math.min(1, t * 4) + 0.08 * Math.sin(t * 20) * (1 - t);
  g.save(); g.translate(300, 500); g.scale(sc, sc); g.globalAlpha = a;
  const r = g.createRadialGradient(0, -20, 0, 0, -20, 240); r.addColorStop(0, 'rgba(255,240,140,0.9)'); r.addColorStop(1, 'rgba(255,240,140,0)'); g.fillStyle = r; g.fillRect(-260, -280, 520, 520);
  for (let i = 0; i < 10; i++) { const an = dg(i * 36 + 18); ln(g, [[Math.cos(an) * 120, -20 + Math.sin(an) * 120], [Math.cos(an) * 175, -20 + Math.sin(an) * 175]], 10, '#ffd23a'); }
  shaded(g, [...ellP(0, -40, 80, 86, 160, 380, 30), [40, 60], [-40, 60]], '#fff36a', '#f2c42a', 9);
  inkFill(g, [[-40, 60], [40, 60], [36, 110], [-36, 110]], '#a8acb8', 8); for (const yy of [76, 94]) ln(g, [[-38, yy], [38, yy]], 5);
  ln(g, [[-18, 40], [-10, -10], [0, 20], [10, -10], [18, 40]], 6, '#e8902a'); g.restore(); };
/** sparkle star */
export const fxSpark = (p, t, col = '#ffffff') => { const g = p.g, a = Math.sin(Math.min(1, t) * Math.PI), r = 160 * a;
  g.save(); g.translate(300, 500); g.globalAlpha = a; inkFill(g, [[0, -r], [r * 0.18, -r * 0.18], [r, 0], [r * 0.18, r * 0.18], [0, r], [-r * 0.18, r * 0.18], [-r, 0], [-r * 0.18, -r * 0.18]], col, 0);
  const rr = g.createRadialGradient(0, 0, 0, 0, 0, r * 0.8); rr.addColorStop(0, 'rgba(255,255,255,0.9)'); rr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = rr; g.fillRect(-r, -r, 2 * r, 2 * r); g.restore(); };
/** spit-take spray */
export const fxSpray = (p, t) => { const g = p.g; for (let i = 0; i < 26; i++) { const a = dg(-30 + (i * 23) % 60), sp = 0.5 + (i % 5) * 0.12, r = 40 + t * 520 * sp;
  const x = 120 + Math.cos(a) * r, y = 500 + Math.sin(a) * r + t * t * 160, s = 8 + (i % 4) * 5;
  g.fillStyle = `rgba(220,90,110,${0.9 * (1 - t * 0.6)})`; g.strokeStyle = CK; g.lineWidth = 3; g.beginPath(); g.ellipse(x, y, s, s * 0.8, a, 0, 7); g.fill(); g.stroke(); } };
/** cartoon flame for the candle */
export const fxFlame = (p, t) => { const g = p.g, w = 1 + 0.08 * Math.sin(t * 9), h = 1 + 0.12 * Math.sin(t * 13 + 1);
  const r = g.createRadialGradient(300, 520, 0, 300, 520, 240); r.addColorStop(0, 'rgba(255,200,90,0.75)'); r.addColorStop(1, 'rgba(255,170,60,0)'); g.fillStyle = r; g.fillRect(40, 260, 520, 520);
  inkFill(g, [[300, 300 - 120 * h], [360 * w - 300 * (w - 1), 520], ...ellP(300, 540, 60 * w, 60, 0, 180, 14), [240, 520]], '#ffb23a', 8);
  inkFill(g, [[300, 400 - 60 * h], [330, 540], ...ellP(300, 556, 30, 30, 0, 180, 10), [270, 540]], '#fff4b0', 0); };
