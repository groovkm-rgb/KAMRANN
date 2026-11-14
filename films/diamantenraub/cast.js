// ===================== cast.js: white-head cartoon cast =====================
// Look: big white wobbly heads (no skin colour, no ears, no neck), thick near-black hand-drawn outline that is
// heavier on the shadow side, minimal faces (smug lidded eyes, big round goofy eyes, toothy grid grins, moustaches),
// pill/bean bodies where the clothes ARE the body, stick-line limbs with dot hands, big detailed hats.
// Design canvas 600x1000, soles at y = 975. Draw with T.toonChar(p, spec, opts). spec = a CAST preset or your own object.
// Diamond-heist additions: chew / yawn / sad faces, big nose, glasses, jeweller's loupe, headlamp, gloves,
// heist props (sandwich, pen camera, tweezers, briefcase, tool bag, trash bag, diamond bag), dog, hero prop cards.
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
  chew: { eye: 'round', pupil: 0.8, brow: 'up', mouth: 'chew' },
  bite: { eye: 'lid', brow: 'up', mouth: 'open' },
  yawn: { eye: 'closed', brow: 'up', mouth: 'yawn' },
  sad: { eye: 'dot', brow: 'worry', mouth: 'frown' },
  curious: { eye: 'round', brow: 'up', mouth: 'o' },
  serious: { eye: 'dot', brow: 'angry', mouth: 'flat' },
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
      dt(g, x + look * 9 * u * k, eyeY - 2 * u, 7.5 * u * (E.pupil || 1));
    } else if (typ === 'lid') {
      g.save(); pth(g, ellP(x + look * 4 * u, eyeY + 3 * u, 13 * u * k, 11 * u, 0, 180, 16)); g.fillStyle = CK; g.fill(); g.restore();
      ln(g, [[x - 18 * u * k, eyeY + 1 * u], [x + 18 * u * k, eyeY - 1 * u]], 7 * u);
    } else if (typ === 'dot') dt(g, x + look * 6 * u, eyeY, 8 * u);
    else if (typ === 'arc') ln(g, ellP(x, eyeY + 6 * u, 15 * u * k, 12 * u, 200, 340, 12), 6.5 * u);
    else ln(g, [[x - 15 * u * k, eyeY + 2 * u], [x + 15 * u * k, eyeY + 2 * u]], 6.5 * u);
    // brows
    const by = eyeY - 30 * u, bw = 19 * u * k, bt = 8.5 * u, s = e.s;
    const B = { smug: s < 0 ? [[-bw, 4], [bw, -6]] : [[-bw, -10], [bw, -2]], up: [[-bw, 2], [bw, -4 * s]], high: [[-bw, -10], [bw, -12]], flat: [[-bw, 0], [bw, 0]],
      worry: [[-bw, s > 0 ? -10 : 6], [bw, s > 0 ? 6 : -10]], angry: [[-bw, s > 0 ? 10 : -6], [bw, s > 0 ? -6 : 10]] }[E.brow] || [[-bw, 0], [bw, 0]];
    ln(g, B.map(([dx, dy]) => [x + dx, by + dy * u]), bt);
  }
  // glasses (round rims) and jeweller's loupe
  if (o.glasses) {
    for (const e of eyes) inkFill(g, ellP(e.x, eyeY - 2 * u, 30 * u * e.k, 27 * u, 0, 360, 30), 'rgba(200,230,255,0.25)', 6 * u);
    ln(g, [[eyes[0].x + 30 * u * eyes[0].k, eyeY - 6 * u], [eyes[1].x - 30 * u * eyes[1].k, eyeY - 6 * u]], 5 * u);
  }
  if (o.loupe) {
    const e = eyes[1], x = e.x + 2 * u, y = eyeY - 2 * u;
    inkFill(g, [[x - 30 * u, y - 26 * u], [x + 30 * u, y - 26 * u], [x + 40 * u, y + 30 * u], [x - 40 * u, y + 30 * u]], '#2a2a30', 6 * u);
    inkFill(g, ellP(x, y + 30 * u, 40 * u, 12 * u), '#bfe4ff', 5 * u);
    ln(g, [[x - 22 * u, y - 14 * u], [x - 26 * u, y + 20 * u]], 4 * u, '#6a6a78');
    dt(g, x - 14 * u, y + 28 * u, 5 * u, '#ffffff');
  }
  // nose: hint for 3/4 turns, or a big cartoon nose
  if (o.nose === 'big') {
    const nx = fx + turn * 16 * u, ny = cy + 8 * u;
    shaded(g, [[nx - 8 * u, ny - 26 * u], [nx + 10 * u, ny - 20 * u], [nx + 30 * u + turn * 14 * u, ny + 22 * u], [nx + 22 * u + turn * 12 * u, ny + 40 * u], [nx - 4 * u, ny + 42 * u], [nx - 20 * u, ny + 30 * u], [nx - 16 * u, ny]], HEAD, HEAD_SH, 6 * u);
  } else if (Math.abs(turn) > 0.35) ln(g, [[fx + turn * 8 * u, cy + 10 * u], [fx + turn * 16 * u, cy + 20 * u], [fx + turn * 6 * u, cy + 22 * u]], 5 * u);
  // moustache / beard under the mouth layer where they sit
  const my = cy + 40 * u + (o.nose === 'big' ? 14 * u : 0);
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
  else if (M === 'chew') { // stuffed cheeks + crumbs
    const ph = o.chew || 0;
    for (const s of [-1, 1]) { const r = (30 + 6 * Math.sin(ph * 6.28 + (s > 0 ? 0 : 3))) * u; inkFill(g, ellP(mx + s * 46 * u, my + 4 * u, r, r * 0.86, s > 0 ? -70 : 110, s > 0 ? 70 : 250, 14), null, 6 * u, false); }
    ln(g, [[mx - 22 * u, my + 8 * u], [mx - 8 * u, my + 2 * u + 4 * u * Math.sin(ph * 6.28)], [mx + 8 * u, my + 10 * u], [mx + 22 * u, my + 4 * u]], 7 * u);
    inkFill(g, ellP(mx + 30 * u, my + 30 * u, 5 * u, 4 * u), '#d8a050', 2.5 * u); inkFill(g, ellP(mx - 18 * u, my + 36 * u, 4 * u, 3 * u), '#d8a050', 2.5 * u);
  } else if (M === 'yawn') {
    inkFill(g, ellP(mx, my + 12 * u, 26 * u, 38 * u, 0, 360, 24), '#4a1c24', 6.5 * u);
    g.save(); pth(g, ellP(mx, my + 12 * u, 26 * u, 38 * u, 0, 360, 24)); g.clip(); inkFill(g, ellP(mx, my + 44 * u, 20 * u, 14 * u), '#e8707a', 0); g.restore();
  } else if (M === 'grin' || M === 'grit') {
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
  if (o.mous) {
    const t = o.mousStyle || 'brush', y = my - 9 * u, c = o.mous;
    const pts = t === 'handle'
      ? [[mx, y - 6 * u], [mx + 18 * u, y - 10 * u], [mx + 34 * u, y - 2 * u], [mx + 44 * u, y - 14 * u], [mx + 40 * u, y + 4 * u], [mx + 20 * u, y + 6 * u], [mx, y + 2 * u], [mx - 20 * u, y + 6 * u], [mx - 40 * u, y + 4 * u], [mx - 44 * u, y - 14 * u], [mx - 34 * u, y - 2 * u], [mx - 18 * u, y - 10 * u]]
      : t === 'thin'
        ? [[mx - 36 * u, y + 2 * u], [mx - 20 * u, y - 6 * u], [mx, y - 4 * u], [mx + 20 * u, y - 6 * u], [mx + 36 * u, y + 2 * u], [mx + 18 * u, y], [mx, y + 2 * u], [mx - 18 * u, y]]
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
  } else if (st === 'messy') { // spiky untidy mop
    const pts = []; for (let i = 0; i <= 26; i++) { const a = dg(175 + 190 * i / 26), j = i % 2 ? 1.0 : 1.2; pts.push([cx + rx * 1.06 * j * Math.cos(a), cy - 6 * u + ry * 1.06 * j * Math.sin(a)]); }
    for (let i = 0; i <= 7; i++) pts.push([cx + rx * (0.98 - 1.96 * i / 7), cy - 30 * u + (i % 2 ? 18 : -4) * u]);
    shaded(g, pts, c, shadeC(c, 0.7), 8 * u, [-0.1, -0.12]);
  } else if (st === 'slick') { // combed back, smooth with comb lines
    const pts = []; for (let i = 0; i <= 30; i++) { const a = dg(185 + 170 * i / 30); pts.push([cx + rx * 1.04 * Math.cos(a), cy + ry * 1.05 * Math.sin(a)]); }
    pts.push([cx + rx * 0.9, cy - 48 * u], [cx, cy - 62 * u], [cx - rx * 0.9, cy - 48 * u]);
    shaded(g, pts, c, shadeC(c, 0.72), 8 * u, [-0.1, -0.12]);
    for (let k = -2; k <= 2; k++) ln(g, [[cx + k * 26 * u, cy - 66 * u], [cx + k * 30 * u, cy - ry * 0.98]], 3 * u, mix(c, '#ffffff', 0.45));
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
      if (!h.plain) inkFill(g, [[cx, top - 34 * u], [cx + 12 * u, top - 20 * u], [cx, top - 6 * u], [cx - 12 * u, top - 20 * u]], '#e8b84a', 4 * u);
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
    case 'beanie': {
      shaded(g, [...ellP(cx, top + 34 * u, rx * 1.04, 96 * u, 180, 360, 24)], c, shadeC(c, 0.72), 8 * u);
      inkFill(g, [[cx - rx * 1.06, top + 20 * u], [cx + rx * 1.06, top + 20 * u], [cx + rx * 1.06, top + 46 * u], [cx - rx * 1.06, top + 46 * u]], b, 6 * u);
      inkFill(g, ellP(cx, top - 66 * u, 16 * u, 16 * u), b, 5 * u);
      break;
    }
  }
  g.restore();
}
/** headlamp: elastic strap around the head + lamp on the forehead (glow is added as a separate fx card) */
function drawHeadlamp(g, H, o) {
  const { cx, cy, rx } = H, u = rx / 100, y = cy - 52 * u, turn = o.turn || 0, lx = cx + turn * 30 * u;
  ln(g, ellP(cx, y + 30 * u, rx * 1.02, 34 * u, 190, 350, 24), 16 * u);
  ln(g, ellP(cx, y + 30 * u, rx * 1.02, 34 * u, 190, 350, 24), 8 * u, '#3a3a46');
  inkFill(g, pill(lx - 34 * u, y - 24 * u, lx + 34 * u, y + 20 * u, 14 * u), '#4a4a58', 6 * u);
  inkFill(g, ellP(lx, y - 2 * u, 20 * u, 16 * u), o.lampOn === false ? '#8a8a70' : '#fffbe0', 5 * u);
  if (o.lampOn !== false) dt(g, lx - 6 * u, y - 6 * u, 6 * u, '#ffffff');
}

// ---------- body, arms, legs ----------
const ARM = { // hand target relative to the shoulder (screen x positive = outward on that side)
  hang: [34, 190, 1], hip: [-6, 150, 2.2], wave: [80, -170, 1], point: [200, 0, 0.3], reach: [140, 70, 0.6], up: [60, -210, 0.6],
  cross: [-70, 120, -0.5], belly: [-40, 130, 1.4], chin: [-60, -60, 1.6], thumb: [90, 30, 1], wheel: [120, 50, 0.8], forward: [60, 110, 0.4],
  mouth: [-90, -110, 1.2], eye: [-60, -150, 1.2], pull: [150, 40, 0.5],
};
function armPts(sx, sy, side, pose) {
  let hx, hy, bulge;
  if (pose && typeof pose === 'object') { hx = pose.x; hy = pose.y; bulge = pose.b ?? 0.8; }
  else { const a = ARM[pose || 'hang'] || ARM.hang; hx = sx + side * a[0]; hy = sy + a[1]; bulge = a[2]; }
  const mx = (sx + hx) / 2, my = (sy + hy) / 2, dx = hx - sx, dy = hy - sy, L = Math.hypot(dx, dy) || 1;
  const ex = mx + side * Math.abs(dy / L) * 22 * bulge + (dy < 0 ? side * 10 : 0), ey = my + (Math.abs(dx / L)) * 16 * bulge;
  return [[sx, sy], [ex, ey], [hx, hy]];
}
/** half salami baguette, bitten end on the right. (x,y) = centre, k = scale (1 = 300 px long). bite = 0..1 */
export function drawSandwich(g, x, y, k = 1, bite = 1, rot = 0) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
  const L = 150, Hh = 52;
  // bite: three scallops cut from the right end
  const end = [];
  const bx = L - 10 - 38 * bite;
  if (bite > 0) { for (let i = 0; i <= 18; i++) { const t = i / 18, yy = -Hh + t * 2 * Hh; end.push([bx + 26 * bite * Math.abs(Math.sin(t * Math.PI * 3)), yy]); } }
  else end.push([L, -Hh * 0.7], [L + 6, 0], [L, Hh * 0.7]);
  const bot = [...ellP(-L + 50, 0, 50, Hh, 90, 270, 14), ...end];
  // lower bread
  inkFill(g, [[-L + 50, -6], ...end.filter((p) => p[1] > -6), [-L + 50, Hh], ...ellP(-L + 50, 0, 50, Hh, 90, 180, 8).reverse()], '#d99a4c', 7);
  // salami slices sticking out + lettuce
  for (let i = 0; i < 5; i++) { const sx = -L + 50 + i * 52; if (sx > bx + 10) break; inkFill(g, ellP(sx, -8, 30, 13), i % 2 ? '#c8323a' : '#b02a34', 5); dt(g, sx - 8, -10, 4, '#f0c0b0'); dt(g, sx + 10, -6, 3, '#f0c0b0'); }
  ln(g, Array.from({ length: 12 }, (_, i) => [-L + 20 + i * ((bx - (-L + 20)) / 11), 4 + (i % 2 ? 8 : 0)]), 9, '#6ab048');
  // upper bread
  const topPts = [...ellP(-L + 50, -10, 50, Hh - 6, 180, 270, 10), ...ellP(0, -10, L - 4, Hh * 0.9, 270, 330, 14).map(([px, py]) => [Math.min(px, bx + 20), py]), ...end.filter((p) => p[1] < -4).reverse().map(([px, py]) => [px, py - 6]).reverse(), [-L + 50, -14]];
  shaded(g, topPts, '#e6a858', '#b8783a', 7);
  for (let i = 0; i < 4; i++) ln(g, [[-L + 50 + i * 40, -Hh + 6], [-L + 70 + i * 40, -Hh + 20]], 5, '#f6d08a');
  // tooth marks on the bitten end
  if (bite > 0) for (let i = 0; i < 6; i++) { const t = (i + 0.5) / 6, yy = -Hh + 6 + t * (2 * Hh - 12); ln(g, [[bx + 26 * bite * Math.abs(Math.sin(t * Math.PI * 3)) - 2, yy], [bx + 26 * bite * Math.abs(Math.sin(t * Math.PI * 3)) - 14, yy]], 4, '#7a4a20'); }
  g.restore();
}
function drawProp(g, kind, x, y, side) {
  if (!kind) return;
  if (kind === 'bag') { inkFill(g, [...ellP(x, y + 52, 40, 44, 0, 360, 24)], '#c99a52', 6); inkFill(g, [[x - 14, y], [x + 14, y], [x + 18, y + 14], [x - 18, y + 14]], '#a87a3a', 5); g.fillStyle = '#3d8f4a'; g.font = 'bold 44px sans-serif'; g.textAlign = 'center'; g.fillText('€', x, y + 70); }
  else if (kind === 'paper') { inkFill(g, [[x - 10, y - 70], [x + 70 * side, y - 80], [x + 76 * side, y + 20], [x - 4, y + 30]], '#f4ead2', 5); for (let k = 0; k < 4; k++) ln(g, [[x + 6 * side, y - 50 + k * 18], [x + 58 * side, y - 56 + k * 18]], 3, '#9a8a70'); }
  else if (kind === 'book') { inkFill(g, [[x - 50, y - 30], [x + 50, y - 30], [x + 50, y + 40], [x - 50, y + 40]], '#8a2f3a', 6); ln(g, [[x, y - 30], [x, y + 40]], 4); }
  else if (kind === 'mug') { inkFill(g, [[x - 22, y - 40], [x + 22, y - 40], [x + 20, y + 14], [x - 20, y + 14]], '#e8d6a0', 6); inkFill(g, ellP(x, y - 40, 22, 8), '#ffffff', 4); }
  else if (kind === 'hammer') { ln(g, [[x, y + 50], [x, y - 70]], 12, '#8a5a34'); ln(g, [[x, y + 50], [x, y - 70]], 3); inkFill(g, [[x - 34, y - 90], [x + 30, y - 90], [x + 30, y - 60], [x - 34, y - 60]], '#7a7a86', 6); }
  else if (kind === 'key') { inkFill(g, ellP(x, y - 24, 16, 16), '#e0b040', 5); ln(g, [[x, y - 8], [x, y + 50], [x + 14 * side, y + 50], [x, y + 36], [x + 12 * side, y + 36]], 7, '#e0b040'); }
  else if (kind === 'sandwich') drawSandwich(g, x + side * 40, y - 10, 0.55, 1, side > 0 ? -0.2 : 0.2);
  else if (kind === 'sandwichFull') drawSandwich(g, x + side * 40, y - 10, 0.55, 0, side > 0 ? -0.2 : 0.2);
  else if (kind === 'pen') { g.save(); g.translate(x, y); g.rotate(-0.5 * side); inkFill(g, pill(-8, -70, 8, 30, 8), '#2a2a3a', 5); inkFill(g, [[-8, -40], [8, -40], [8, -30], [-8, -30]], '#d8b040', 3); dt(g, 0, -58, 4, '#9fe0ff'); g.restore(); }
  else if (kind === 'tweezers') { ln(g, [[x, y], [x + side * 70, y - 90]], 6, '#b8c0cc'); ln(g, [[x + 8, y + 4], [x + side * 80, y - 82]], 6, '#9aa2b0'); }
  else if (kind === 'briefcase') { inkFill(g, pill(x - 60, y + 10, x + 60, y + 100, 10), '#5a3a26', 6); inkFill(g, pill(x - 18, y - 8, x + 18, y + 14, 6), null, 6); dt(g, x, y + 40, 6, '#e2b84c'); }
  else if (kind === 'toolbag') { inkFill(g, pill(x - 80, y + 10, x + 80, y + 110, 30), '#3a3a46', 7); ln(g, ellP(x, y + 14, 50, 36, 180, 360, 14), 9); ln(g, [[x - 60, y + 40], [x + 60, y + 40]], 4, '#9a9aa8'); inkFill(g, [[x + 30, y], [x + 40, y - 50], [x + 52, y - 50], [x + 46, y + 4]], '#c8c8d0', 4); }
  else if (kind === 'trashbag') { inkFill(g, [[x - 20, y], [x + 20, y], [x + 70, y + 60], [x + 76, y + 150], [x, y + 176], [x - 76, y + 150], [x - 70, y + 60]], '#22232a', 7); ln(g, [[x - 30, y + 80], [x - 10, y + 140]], 4, '#5a5c6a'); ln(g, [[x + 34, y + 70], [x + 30, y + 120]], 4, '#5a5c6a'); inkFill(g, [[x - 12, y - 20], [x + 12, y - 20], [x + 20, y + 4], [x - 20, y + 4]], '#22232a', 5); }
  else if (kind === 'diamondbag') { inkFill(g, [...ellP(x, y + 60, 56, 54, 0, 360, 24)], '#2c2c38', 6); inkFill(g, [[x - 18, y], [x + 18, y], [x + 22, y + 14], [x - 22, y + 14]], '#2c2c38', 5); for (let k = 0; k < 5; k++) drawGem(g, x - 30 + k * 15, y + 6 - (k % 2) * 10, 10); }
  else if (kind === 'photo') { inkFill(g, [[x - 40, y - 60], [x + 40, y - 60], [x + 40, y + 20], [x - 40, y + 20]], '#f4f2ea', 5); inkFill(g, [[x - 30, y - 50], [x + 30, y - 50], [x + 30, y + 2], [x - 30, y + 2]], '#6a7a9a', 3); }
  else if (kind === 'diamond') drawGem(g, x, y - 18, 26);
}
/** brilliant-cut diamond icon (top view-ish), r = radius */
export function drawGem(g, x, y, r, glint = 1) {
  const pts = [[x - r, y - r * 0.25], [x - r * 0.55, y - r * 0.7], [x + r * 0.55, y - r * 0.7], [x + r, y - r * 0.25], [x, y + r]];
  inkFill(g, pts, '#dff4ff', Math.max(2, r * 0.16));
  g.save(); pth(g, pts); g.clip();
  inkFill(g, [[x - r, y - r * 0.25], [x + r, y - r * 0.25], [x, y + r]], '#9fd4f4', 0);
  inkFill(g, [[x - r * 0.3, y - r * 0.25], [x + r * 0.3, y - r * 0.25], [x, y + r]], '#c8ecff', 0);
  inkFill(g, [[x - r * 0.55, y - r * 0.7], [x - r * 0.15, y - r * 0.25], [x - r * 0.3, y - r * 0.7]], '#ffffff', 0);
  g.restore();
  ln(g, [[x - r, y - r * 0.25], [x + r, y - r * 0.25]], Math.max(1.5, r * 0.08));
  if (glint > 0) { const s = r * 0.7 * glint, gx = x + r * 0.45, gy = y - r * 0.55; g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(gx, gy - s); g.lineTo(gx + s * 0.18, gy - s * 0.18); g.lineTo(gx + s, gy); g.lineTo(gx + s * 0.18, gy + s * 0.18); g.lineTo(gx, gy + s); g.lineTo(gx - s * 0.18, gy + s * 0.18); g.lineTo(gx - s, gy); g.lineTo(gx - s * 0.18, gy - s * 0.18); g.closePath(); g.fill(); }
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
    if (t === 'lapels') for (const sd of [-1, 1]) inkFill(g, [[300 + sd * 8, y0 - 10], [300 + sd * 60, y0 - 10], [300 + sd * 62, y0 + 60], [300 + sd * 36, y0 + 90], [300 + sd * 14, y0 + 190]], dc || shadeC(col, 0.8), 5);
    if (t === 'apron') { inkFill(g, pill(300 - bw * 0.36, y0 + 110, 300 + bw * 0.36, y1 + 20, 30), dc || '#c8873e', 6); ln(g, [[300 - bw * 0.2, y0 + 210], [300 + bw * 0.2, y0 + 210]], 4); ln(g, [[300 - bw * 0.36, y0 + 110], [300 - bw * 0.5, y0 + 20]], 5); ln(g, [[300 + bw * 0.36, y0 + 110], [300 + bw * 0.5, y0 + 20]], 5); }
    if (t === 'stripes') for (const sd of [-1, 1]) { inkFill(g, [[300 + sd * 30, y0 - 10], [300 + sd * 54, y0 - 10], [300 + sd * 54, y1 + 10], [300 + sd * 30, y1 + 10]], dc || '#e8c048', 4); }
    if (t === 'knit') for (let y = y0 + 60; y < y1; y += 44) ln(g, [[x0, y], [x1, y]], 3, dc || shadeC(col, 1.5));
    if (t === 'fringe') for (let x = x0 + 20; x < x1 - 14; x += 18) ln(g, [[x, y0 + 52], [x + 2, y0 + 82]], 6, dc || '#f6efe0');
    if (t === 'seatbelt') { ln(g, [[x1 + 10, y0 + 10], [x0 + 30, y1 - 40]], 22, '#3c3c46'); ln(g, [[x1 + 10, y0 + 10], [x0 + 30, y1 - 40]], 3, '#9a9aa8'); }
    if (t === 'straps') for (const sd of [-1, 1]) ln(g, [[300 + sd * 50, y0 - 10], [300 + sd * 40, y1]], 12, dc || '#2c2a38');
    if (t === 'badge') inkFill(g, Array.from({ length: 10 }, (_, i) => { const a = dg(-90 + i * 36), r = i % 2 ? 9 : 22; return [300 - bw * 0.22 + r * Math.cos(a), y0 + 80 + r * Math.sin(a)]; }), '#e8b84a', 3);
    if (t === 'scarf') inkFill(g, [[300 - 54, y0 - 6], [300 + 54, y0 - 6], [300 + 10, y0 + 70]], dc || '#d03a34', 6);
    if (t === 'pocket') inkFill(g, pill(300 + bw * 0.08, y0 + 70, 300 + bw * 0.34, y0 + 120, 8), shadeC(col, 0.9), 4);
    if (t === 'hanky') inkFill(g, [[300 - bw * 0.36, y0 + 84], [300 - bw * 0.3, y0 + 64], [300 - bw * 0.24, y0 + 80], [300 - bw * 0.18, y0 + 66], [300 - bw * 0.14, y0 + 88]], dc || '#f2f0ea', 3);
    if (t === 'trim') { ln(g, [[x0 - 30, y1 - 12], [x1 + 30, y1 - 12]], 14, dc || '#e8c048'); }
    if (t === 'number') { inkFill(g, [[300 + bw * 0.06, y0 + 70], [300 + bw * 0.38, y0 + 70], [300 + bw * 0.38, y0 + 110], [300 + bw * 0.06, y0 + 110]], '#f2f0ea', 4); for (let k = 0; k < 4; k++) ln(g, [[300 + bw * 0.1 + k * bw * 0.07, y0 + 80], [300 + bw * 0.1 + k * bw * 0.07, y0 + 100]], 4); }
    if (t === 'trench') { for (const sd of [-1, 1]) inkFill(g, [[300 + sd * 6, y0 - 10], [300 + sd * 70, y0 - 10], [300 + sd * 74, y0 + 80], [300 + sd * 30, y0 + 120]], dc || shadeC(col, 0.85), 5); for (const sd of [-1, 1]) for (let k = 0; k < 2; k++) dt(g, 300 + sd * 36, y0 + 150 + k * 60, 7, '#5a4028'); }
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
    if (s.boots) { const fx = hx + sd * 10 + (legs === 'walk' ? Math.sin(st * Math.PI * 2 + (sd > 0 ? 0 : Math.PI)) * 34 : 0); if (legs !== 'sit' && legs !== 'crouch') inkFill(g, pill(fx - 22, 920, fx + 30 + sd * 6, 975, 14), s.boots, 5); }
  }
}

/** draw a character. spec: { body, bw, robe, cape, legs, boots, detail[], hair, hairStyle, mous, mousStyle, beard, goatee, hat{type,color,band,stripes,tilt,plain}, helm, nose, glasses, gloves, headlamp }
 *  opts: { expr, look, blink, turn (-1..1, 3/4 view), L, R (arm pose name or {x,y,b}), holdL, holdR (prop), legs ('stand'|'walk'|'sit'|'crouch'), step, tilt, headTilt, bob, seed, loupe, chew, lampOn } */
export const toonChar = (p, spec, opts = {}) => {
  const g = p.g, s = typeof spec === 'string' ? CAST[spec] : spec, o = { ...s, ...opts };
  g.save();
  const bob = (o.bob || 0) * 1000; g.translate(0, -bob);
  if (o.tilt) { g.translate(300, 975); g.rotate(dg(o.tilt)); g.translate(-300, -975); }
  if (!o.noLegs) drawLegs(g, s, o, { y1: s.robe ? 925 : 705 });
  const B = drawBody(g, s, o);
  const sY = B.y0 + 48, shoulders = { '-1': [B.x0 + 16, sY], '1': [B.x1 - 16, sY] };
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
  if (o.headlamp) drawHeadlamp(g, H, o);
  g.restore();
  for (const side of [-1, 1]) {
    const pose = side < 0 ? o.L : o.R, [sx, sy] = shoulders[side], pts = armPts(sx, sy, side, pose);
    if (o.sleeves) { ln(g, pts, 22); ln(g, pts, 13, o.sleeves); } else ln(g, pts, 7.5);
    if (o.gloves) { dt(g, pts[2][0], pts[2][1], 17); dt(g, pts[2][0], pts[2][1], 12, o.gloves); dt(g, pts[2][0] - 4, pts[2][1] - 5, 3.5, '#6a6a7a'); }
    else dt(g, pts[2][0], pts[2][1], 10.5);
    drawProp(g, side < 0 ? o.holdL : o.holdR, pts[2][0], pts[2][1], side);
  }
  g.restore();
};

/** hunting dog (side view, faces right; flip the card to face left). o: { sniff, wag, look, expr: 'happy'|'want' } */
export const toonDog = (p, o = {}) => {
  const g = p.g, BR = '#a8683a', WH = '#fbfaf7', sn = o.sniff || 0, wag = o.wag || 0;
  g.save(); g.translate(0, 560);
  // tail
  ln(g, [[150, 210], [100, 150 + 30 * Math.sin(wag * 6.28)], [70, 110 + 40 * Math.sin(wag * 6.28)]], 16); ln(g, [[150, 210], [100, 150 + 30 * Math.sin(wag * 6.28)], [70, 110 + 40 * Math.sin(wag * 6.28)]], 9, BR);
  // legs
  for (const x of [190, 230, 370, 410]) ln(g, [[x, 260], [x + 4, 400], [x + 20, 400]], 9);
  // body
  shaded(g, pill(140, 160, 440, 290, 60), BR, coolShade(BR), 9);
  g.save(); pth(g, pill(140, 160, 440, 290, 60)); g.clip(); inkFill(g, ellP(250, 290, 90, 50), WH, 0); inkFill(g, ellP(330, 170, 50, 36), '#7a4a26', 0); g.restore();
  inkFill(g, pill(140, 160, 440, 290, 60), null, 9);
  // head (white with brown ears), lowered when sniffing
  const hx = 455 + sn * 15, hy = 150 + sn * 110;
  shaded(g, wob(hx, hy, 82, 70, 5), WH, HEAD_SH, 9);
  inkFill(g, [...ellP(hx + 70, hy + 22, 48, 34, 0, 360, 20)], WH, 8); dt(g, hx + 116, hy + 10, 16);
  shaded(g, [[hx - 50, hy - 50], [hx - 14, hy - 60], [hx - 10, hy + 40], [hx - 40, hy + 80], [hx - 70, hy + 30]], BR, shadeC(BR, 0.7), 7);
  if (o.expr === 'want') { inkFill(g, ellP(hx + 18, hy - 14, 18, 20), '#ffffff', 5); dt(g, hx + 24 + (o.look || 0) * 6, hy - 10, 8); ln(g, [[hx + 60, hy + 50], [hx + 64, hy + 80]], 12, '#e8707a'); ln(g, [[hx + 60, hy + 50], [hx + 64, hy + 80]], 4); }
  else ln(g, [[hx + 4, hy - 12], [hx + 34, hy - 16]], 7);
  g.restore();
};
/** hero prop card: big bitten salami sandwich (centred in the design canvas) */
export const sandwichCard = (p, o = {}) => drawSandwich(p.g, 300, 500, o.k || 1.8, o.bite ?? 1, o.rot || 0);
/** bunch of diamonds for cards; n gems scattered around (300,500) */
export const gemsCard = (p, o = {}) => { const r = (o.seed || 1) * 9301; for (let i = 0; i < (o.n || 1); i++) { const a = i * 2.39 + r, d = (o.n > 1 ? 120 : 0) * Math.sqrt((i + 0.5) / o.n); drawGem(p.g, 300 + d * Math.cos(a), 500 + d * Math.sin(a) * 0.7, (o.r || 60) * (0.75 + 0.25 * ((i * 7) % 3) / 2), o.glint ?? 1); } };

/** generic starter cast (make your own per story; never copy another channel's characters) */
export const CAST = {
  worker: { body: '#3f8fd0', detail: ['straps', 'pocket'], hair: '#6a4024', hairStyle: 'mop', hat: { type: 'flatcap', color: '#4a5a8a', stripes: '#c8d4ee' } },
  merchant: { body: '#e0a33a', detail: ['apron', 'belt'], hair: '#3a2a22', hairStyle: 'sides', mous: '#3a2a22', mousStyle: 'handle', hat: { type: 'bowler', color: '#3a2e2a' } },
  officer: { body: '#2e4a8a', detail: ['buttons', 'badge', 'belt'], hair: '#2a2228', hairStyle: 'sides', hat: { type: 'police', color: '#25335e', band: '#1c1a24' } },
  scientist: { body: '#f4f4f0', detail: ['collar', 'tie', 'pocket'], hair: '#9a9aa4', hairStyle: 'side' },
  // ---- diamond heist cast (invented characters) ----
  kopfSuit: { body: '#2c3040', detail: [{ t: 'collar', c: '#f4f2ee' }, { t: 'tie', c: '#8a2a3a' }, 'lapels', { t: 'hanky', c: '#e8d0d8' }, 'buttons'], hair: '#a8a8b0', hairStyle: 'slick', mous: '#8e8e98', mousStyle: 'thin', legs: '#2c3040', sleeves: '#2c3040' },
  kopfHeist: { body: '#1c1c24', detail: [{ t: 'knit', c: '#2c2c38' }], hair: '#a8a8b0', hairStyle: 'slick', mous: '#8e8e98', mousStyle: 'thin', gloves: '#16161c', headlamp: true, legs: '#1c1c24', sleeves: '#1c1c24' },
  kopfPrison: { body: '#8a8c94', detail: ['number', { t: 'knit', c: '#9a9ca4' }], hair: '#a8a8b0', hairStyle: 'slick', mous: '#8e8e98', mousStyle: 'thin', legs: '#8a8c94', sleeves: '#8a8c94' },
  koca: { body: '#1e1e26', bw: 300, detail: [{ t: 'knit', c: '#2e2e3a' }], hairStyle: 'bald', gloves: '#16161c', headlamp: true, legs: '#1e1e26', sleeves: '#1e1e26', seed: 9 },
  siska: { body: '#22222c', bw: 140, detail: [{ t: 'knit', c: '#30303c' }], hair: '#5a3a24', hairStyle: 'messy', nose: 'big', gloves: '#16161c', legs: '#22222c', sleeves: '#22222c', headScale: 0.95, seed: 5 },
  guard: { body: '#4a5a7a', bw: 250, detail: ['buttons', 'pocket', { t: 'belt', c: '#22202a' }], hair: '#4a3a30', hairStyle: 'sides', hat: { type: 'police', color: '#33405e', band: '#22202a', plain: true }, legs: '#3a4866', seed: 11 },
  anwohner: { body: '#3f7a46', detail: ['buttons', 'pocket', { t: 'collar', c: '#2c5a32' }], hair: '#d8d8dc', hairStyle: 'sides', mous: '#e0e0e4', mousStyle: 'brush', hat: { type: 'flatcap', color: '#6a5a46', stripes: '#7e6c56' }, boots: '#2a3a2a', legs: '#4a4a40', seed: 2 },
  detective: { body: '#c8a46a', detail: ['trench', { t: 'belt', c: '#8a6a3a' }], hair: '#3a2a2a', hairStyle: 'bun', gloves: '#3a2a22', legs: '#3a3440', seed: 6 },
  labExpert: { body: '#f6f6f2', detail: [{ t: 'collar', c: '#d8e8f4' }, 'lapels', 'pocket', 'buttons'], hair: '#3a3438', hairStyle: 'short', glasses: true, legs: '#4a5068', seed: 8 },
  merchA: { body: '#3a3f52', detail: [{ t: 'collar', c: '#ffffff' }, { t: 'tie', c: '#2a5a8a' }, 'lapels'], hair: '#5a4030', hairStyle: 'sides', mous: '#5a4030', hat: { type: 'bowler', color: '#2a2a30' }, legs: '#3a3f52', sleeves: '#3a3f52', seed: 4 },
  merchB: { body: '#5a4a3e', detail: [{ t: 'collar', c: '#ffffff' }, { t: 'tie', c: '#8a6a2a' }, 'lapels'], hair: '#2a2228', hairStyle: 'side', beard: '#2a2228', legs: '#5a4a3e', sleeves: '#5a4a3e', seed: 12 },
};

// ---------- extra fx ----------
/** soft floating dust / sparkle mote (use many, small) */
export const fxMote = (p, t, col = '255,250,230') => { const g = p.g, a = Math.sin(t * Math.PI); const r = g.createRadialGradient(300, 500, 0, 300, 500, 60); r.addColorStop(0, `rgba(${col},${0.95 * a})`); r.addColorStop(1, `rgba(${col},0)`); g.fillStyle = r; g.fillRect(200, 400, 200, 200); };
/** glow halo for lamps, buttons, headlights (draw as additive-looking card) */
export const fxGlow = (p, col = '255,214,140', k = 1) => { const g = p.g, r = g.createRadialGradient(300, 500, 0, 300, 500, 290); r.addColorStop(0, `rgba(${col},${0.9 * k})`); r.addColorStop(0.25, `rgba(${col},${0.45 * k})`); r.addColorStop(1, `rgba(${col},0)`); g.fillStyle = r; g.fillRect(0, 200, 600, 600); };
/** 4-point diamond twinkle star, t = 0..1 (size/opacity pulse) */
export const fxTwinkle = (p, t, col = '#ffffff') => { const g = p.g, k = Math.sin(t * Math.PI), s = 260 * k; if (k <= 0.01) return;
  const r = g.createRadialGradient(300, 500, 0, 300, 500, 120 * k); r.addColorStop(0, `rgba(200,235,255,${0.8 * k})`); r.addColorStop(1, 'rgba(200,235,255,0)'); g.fillStyle = r; g.fillRect(150, 350, 300, 300);
  g.fillStyle = col; g.beginPath(); g.moveTo(300, 500 - s); g.lineTo(312, 488); g.lineTo(300 + s, 500); g.lineTo(312, 512); g.lineTo(300, 500 + s); g.lineTo(288, 512); g.lineTo(300 - s, 500); g.lineTo(288, 488); g.closePath(); g.fill(); };
/** magnetic force lines (arcs), t = phase */
export const fxForce = (p, t) => { const g = p.g; for (let i = 0; i < 4; i++) { const ph = (t + i / 4) % 1; ln(g, ellP(300, 500, 60 + ph * 220, 30 + ph * 300, 200, 340, 20), 10 * (1 - ph), `rgba(140,220,255,${(1 - ph).toFixed(3)})`); ln(g, ellP(300, 500, 60 + ph * 220, 30 + ph * 300, 20, 160, 20), 10 * (1 - ph), `rgba(140,220,255,${(1 - ph).toFixed(3)})`); } };
/** radar ping rings, t = phase */
export const fxPing = (p, t, col = '120,255,160') => { const g = p.g; for (let i = 0; i < 3; i++) { const ph = (t + i / 3) % 1; ln(g, ellP(300, 500, 40 + ph * 250, 40 + ph * 250, 0, 360, 40), 12 * (1 - ph), `rgba(${col},${(1 - ph).toFixed(3)})`); } };
/** heat shimmer: wavy red-orange lines rising, t = phase */
export const fxHeat = (p, t) => { const g = p.g; for (let i = 0; i < 5; i++) { const x = 160 + i * 70, pts = []; for (let k = 0; k <= 12; k++) { const y = 760 - k * 40; pts.push([x + 18 * Math.sin(k * 0.9 + t * 6.28 + i), y]); } ln(g, pts, 9, `rgba(255,${120 + i * 20},60,0.55)`); } };
/** camera flash pop (white star burst), t = 0..1 */
export const fxFlash = (p, t) => { const g = p.g, k = 1 - t; const r = g.createRadialGradient(300, 500, 0, 300, 500, 260); r.addColorStop(0, `rgba(255,255,255,${k})`); r.addColorStop(0.3, `rgba(220,240,255,${0.6 * k})`); r.addColorStop(1, 'rgba(220,240,255,0)'); g.fillStyle = r; g.fillRect(0, 200, 600, 600); };
/** comic speed lines radiating from centre (for whip / impact frames), t = seed */
export const fxSpeed = (p, t, col = 'rgba(255,255,255,0.7)') => { const g = p.g; for (let i = 0; i < 22; i++) { const a = i * 0.2856 + t * 3, r0 = 150 + ((i * 37) % 60); ln(g, [[300 + r0 * Math.cos(a), 500 + r0 * Math.sin(a)], [300 + 330 * Math.cos(a), 500 + 330 * Math.sin(a)]], 5 + (i % 3) * 3, col); } };
