// ===================== cast.js: white-head cartoon cast =====================
// Look: big white wobbly heads (no skin colour, no ears, no neck), thick near-black hand-drawn outline that is
// heavier on the shadow side, minimal faces (smug lidded eyes, big round goofy eyes, toothy grid grins, moustaches),
// pill/bean bodies where the clothes ARE the body, stick-line limbs with dot hands, big detailed hats.
// Design canvas 600x1000, soles at y = 975. Draw with T.toonChar(p, spec, opts). spec = a CAST preset or your own object.
// Great-Stink additions: headCol, browK, blush, sideburns, monocle, glasses/glassY, tears, expressions dizzy/yawn/teary/proud,
// props hanky/fan/curtain/docbag/shovel/torch/stamp, details chain/vest2/reflect, and the non-human cards at the end
// (stink cloud mascot, germs, cat, dog, flies, smell waves, carriage, thermometer, papers, flowers ...). NO text anywhere.
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
  // added
  dizzy: { eye: 'spiral', brow: 'worry', mouth: 'wavy' },
  yawn: { eye: 'closed', brow: 'up', mouth: 'yawn' },
  teary: { eye: 'round', pupil: 0.8, brow: 'worry', mouth: 'wavy', tears: true },
  squint: { eye: 'closed', brow: 'worry', mouth: 'grit', tears: true },
  proud: { eye: 'lid', brow: 'up', mouth: 'smile' },
  serious: { eye: 'dot', brow: 'angry', mouth: 'flat' },
  grumpy: { eye: 'lid', brow: 'angry', mouth: 'frown' },
  shrug: { eye: 'round', pupil: 0.8, brow: 'worry', mouth: 'smirk' },
  cheer: { eye: 'arc', brow: 'up', mouth: 'open' },
};
function drawFace(g, H, o) {
  const { cx, cy, rx } = H, u = rx / 100, turn = o.turn || 0, look = o.look || 0, E = EXPR[o.expr || 'neutral'] || EXPR.neutral;
  const fx = cx + turn * 26 * u, eyeY = cy - 6 * u, bk = o.browK || 1;
  const blink = (o.blink || 0) > 0.5, eyes = [-1, 1].map((s) => ({ s, x: fx + s * 37 * u * (1 - 0.18 * Math.abs(turn) * (s * turn < 0 ? 1 : 0)), k: 1 - 0.22 * Math.max(0, -s * turn) }));
  if (o.blush) for (const s of [-1, 1]) { g.save(); g.globalAlpha = 0.55; inkFill(g, ellP(fx + s * 58 * u, cy + 24 * u, 22 * u, 13 * u, 0, 360, 20), o.blush, 0); g.restore(); }
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
    else if (typ === 'spiral') { const pts = []; for (let i = 0; i <= 30; i++) { const a = i / 30 * Math.PI * 4.2 * e.s, r = (2 + i * 0.6) * u; pts.push([x + r * Math.cos(a), eyeY + r * Math.sin(a)]); } ln(g, pts, 4.5 * u); }
    else ln(g, [[x - 15 * u * k, eyeY + 2 * u], [x + 15 * u * k, eyeY + 2 * u]], 6.5 * u);
    if (E.tears) { inkFill(g, [[x + 6 * u, eyeY + 18 * u], [x + 14 * u, eyeY + 38 * u], [x + 6 * u, eyeY + 46 * u], [x - 2 * u, eyeY + 38 * u]], '#9ad4ff', 3.5 * u); }
    // brows
    const by = eyeY - 30 * u, bw = 19 * u * k, bt = 8.5 * u * bk, s = e.s;
    const B = { smug: s < 0 ? [[-bw, 4], [bw, -6]] : [[-bw, -10], [bw, -2]], up: [[-bw, 2], [bw, -4 * s]], high: [[-bw, -10], [bw, -12]], flat: [[-bw, 0], [bw, 0]],
      worry: [[-bw, s > 0 ? -10 : 6], [bw, s > 0 ? 6 : -10]], angry: [[-bw, s > 0 ? 10 : -6], [bw, s > 0 ? -6 : 10]] }[E.brow] || [[-bw, 0], [bw, 0]];
    ln(g, B.map(([dx, dy]) => [x + dx, by + dy * u]), bt);
  }
  // nose hint for 3/4 turns
  if (Math.abs(turn) > 0.35) ln(g, [[fx + turn * 8 * u, cy + 10 * u], [fx + turn * 16 * u, cy + 20 * u], [fx + turn * 6 * u, cy + 22 * u]], 5 * u);
  // glasses (round), can slide down the face with glassY
  if (o.glasses) { const gy = eyeY - 2 * u + (o.glassY || 0) * u; for (const e of eyes) { g.save(); g.globalAlpha = 0.25; inkFill(g, ellP(e.x, gy, 27 * u * e.k, 25 * u, 0, 360, 28), '#cfe8ff', 0); g.restore(); inkFill(g, ellP(e.x, gy, 27 * u * e.k, 25 * u, 0, 360, 28), null, 5 * u); }
    ln(g, [[eyes[0].x + 26 * u, gy - 4 * u], [eyes[1].x - 26 * u, gy - 4 * u]], 5 * u); }
  if (o.monocle) { const e = eyes[1]; inkFill(g, ellP(e.x, eyeY - 3 * u, 28 * u, 28 * u, 0, 360, 28), null, 5.5 * u); ln(g, [[e.x + 22 * u, eyeY + 18 * u], [e.x + 34 * u, eyeY + 80 * u], [e.x + 20 * u, eyeY + 120 * u]], 2.5 * u, '#c8a040'); }
  // moustache / beard under the mouth layer where they sit
  const my = cy + 40 * u;
  if (o.sideburns) for (const s of [-1, 1]) inkFill(g, [[cx + s * rx * 0.97, cy - 46 * u], [cx + s * rx * 1.0, cy + 30 * u], [cx + s * rx * 0.72, cy + 66 * u], [cx + s * rx * 0.66, cy + 30 * u], [cx + s * rx * 0.82, cy - 40 * u]], o.sideburns, 6 * u);
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
  else if (M === 'yawn') inkFill(g, ellP(mx, my + 8 * u, 20 * u, 28 * u, 0, 360, 24), '#4a1c24', 5.5 * u);
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
  if (o.mous) {
    const t = o.mousStyle || 'brush', y = my - 9 * u, c = o.mous;
    const pts = t === 'handle'
      ? [[mx, y - 6 * u], [mx + 18 * u, y - 10 * u], [mx + 34 * u, y - 2 * u], [mx + 44 * u, y - 14 * u], [mx + 40 * u, y + 4 * u], [mx + 20 * u, y + 6 * u], [mx, y + 2 * u], [mx - 20 * u, y + 6 * u], [mx - 40 * u, y + 4 * u], [mx - 44 * u, y - 14 * u], [mx - 34 * u, y - 2 * u], [mx - 18 * u, y - 10 * u]]
      : t === 'thin'
        ? [[mx, y - 4 * u], [mx + 26 * u, y - 6 * u], [mx + 46 * u, y - 16 * u], [mx + 30 * u, y], [mx, y + 1 * u], [mx - 30 * u, y], [mx - 46 * u, y - 16 * u], [mx - 26 * u, y - 6 * u]]
        : [[mx - 34 * u, y + 6 * u], [mx - 30 * u, y - 8 * u], [mx - 10 * u, y - 12 * u], [mx, y - 6 * u], [mx + 10 * u, y - 12 * u], [mx + 30 * u, y - 8 * u], [mx + 34 * u, y + 6 * u], [mx, y + 2 * u]];
    inkFill(g, pts, c, (t === 'thin' ? 3.5 : 5) * u);
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
  } else if (st === 'pigtails') {
    for (const s of [-1, 1]) inkFill(g, ellP(cx + s * rx * 1.08, cy - 10 * u, 26 * u, 34 * u), c, 6 * u);
    drawHair(g, H, { ...o, hairStyle: 'short' });
  }
}
function drawHat(g, H, o) {
  const h = o.hat; if (!h) return;
  const { cx, cy, rx, ry } = H, u = rx / 100, top = cy - ry, c = h.color || '#2a2438', b = h.band || shadeC(c, 1.5), tilt = dg(h.tilt || 0);
  g.save(); g.translate(cx, top + 30 * u); g.rotate(tilt); g.translate(-cx, -(top + 30 * u));
  if (h.lift) g.translate(0, -h.lift * u);
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
      ln(g, [[cx - 40 * u, top - 90 * u], [cx - 38 * u, top - 20 * u]], 5 * u, mix(c, '#ffffff', 0.22));
      break;
    }
    case 'bowler': {
      shaded(g, [...ellP(cx, top + 16 * u, 74 * u, 74 * u, 180, 360, 24)], c, shadeC(c, 0.7), 8 * u);
      inkFill(g, ellP(cx, top + 18 * u, 112 * u, 13 * u), c, 7 * u);
      break;
    }
    case 'bonnet': {
      inkFill(g, [...ellP(cx, top + 40 * u, rx * 1.18, ry * 0.95, 175, 365, 30)], c, 8 * u);
      inkFill(g, ellP(cx + 50 * u, top - 20 * u, 24 * u, 18 * u), h.band || '#e85a8a', 5 * u);
      ln(g, [[cx - rx * 1.1, top + 50 * u], [cx - rx * 0.7, cy + 70 * u]], 7 * u, h.band || '#e85a8a');
      break;
    }
    case 'hard': {
      shaded(g, [...ellP(cx, top + 24 * u, 92 * u, 80 * u, 180, 360, 24)], c, shadeC(c, 0.75), 8 * u);
      inkFill(g, ellP(cx, top + 26 * u, 122 * u, 12 * u), shadeC(c, 0.9), 7 * u);
      ln(g, [[cx, top - 54 * u], [cx, top + 20 * u]], 9 * u, shadeC(c, 0.8));
      if (h.lamp) { inkFill(g, ellP(cx, top - 12 * u, 20 * u, 16 * u), '#fff6c0', 5 * u); }
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

// ---------- body, arms, legs ----------
const ARM = { // hand target relative to the shoulder (screen x positive = outward on that side)
  hang: [34, 190, 1], hip: [-6, 150, 2.2], wave: [80, -170, 1], point: [200, 0, 0.3], reach: [140, 70, 0.6], up: [60, -210, 0.6],
  cross: [-70, 120, -0.5], belly: [-40, 130, 1.4], chin: [-60, -60, 1.6], thumb: [90, 30, 1], wheel: [120, 50, 0.8], forward: [60, 110, 0.4],
  pointUp: [70, -200, 0.4], shrug: [110, -40, 1.2], hero: [150, -120, 0.5],
};
function armPts(sx, sy, side, pose) {
  let hx, hy, bulge;
  if (pose === 'nose') { hx = 300 + side * 6; hy = 318; bulge = 1.4; }
  else if (pose && typeof pose === 'object') { hx = pose.x; hy = pose.y; bulge = pose.b ?? 0.8; }
  else { const a = ARM[pose || 'hang'] || ARM.hang; hx = sx + side * a[0]; hy = sy + a[1]; bulge = a[2]; }
  const mx = (sx + hx) / 2, my = (sy + hy) / 2, dx = hx - sx, dy = hy - sy, L = Math.hypot(dx, dy) || 1;
  const ex = mx + side * Math.abs(dy / L) * 22 * bulge + (dy < 0 ? side * 10 : 0), ey = my + (Math.abs(dx / L)) * 16 * bulge;
  return [[sx, sy], [ex, ey], [hx, hy]];
}
function drawProp(g, kind, x, y, side, o = {}) {
  if (!kind) return;
  if (kind === 'bag' || kind === 'docbag') { // doctor's bag (no text)
    inkFill(g, [[x - 18, y + 4], [x - 16, y - 22], [x + 16, y - 22], [x + 18, y + 4]], null, 7);
    inkFill(g, pill(x - 62, y + 2, x + 62, y + 92, 22), '#5a3424', 7); ln(g, [[x - 62, y + 34], [x + 62, y + 34]], 5); inkFill(g, [[x - 8, y + 26], [x + 8, y + 26], [x + 8, y + 44], [x - 8, y + 44]], '#e2b84c', 3);
  }
  else if (kind === 'paper') { inkFill(g, [[x - 10, y - 70], [x + 70 * side, y - 80], [x + 76 * side, y + 20], [x - 4, y + 30]], '#f4ead2', 5); for (let k = 0; k < 4; k++) ln(g, [[x + 6 * side, y - 50 + k * 18], [x + 58 * side, y - 56 + k * 18]], 3, '#9a8a70'); }
  else if (kind === 'book') { inkFill(g, [[x - 50, y - 30], [x + 50, y - 30], [x + 50, y + 40], [x - 50, y + 40]], '#8a2f3a', 6); ln(g, [[x, y - 30], [x, y + 40]], 4); }
  else if (kind === 'mug') { inkFill(g, [[x - 22, y - 40], [x + 22, y - 40], [x + 20, y + 14], [x - 20, y + 14]], '#e8d6a0', 6); inkFill(g, ellP(x, y - 40, 22, 8), '#ffffff', 4); }
  else if (kind === 'hammer') { ln(g, [[x, y + 50], [x, y - 70]], 12, '#8a5a34'); ln(g, [[x, y + 50], [x, y - 70]], 3); inkFill(g, [[x - 34, y - 90], [x + 30, y - 90], [x + 30, y - 60], [x - 34, y - 60]], '#7a7a86', 6); }
  else if (kind === 'key') { inkFill(g, ellP(x, y - 24, 16, 16), '#e0b040', 5); ln(g, [[x, y - 8], [x, y + 50], [x + 14 * side, y + 50], [x, y + 36], [x + 12 * side, y + 36]], 7, '#e0b040'); }
  else if (kind === 'hanky') { inkFill(g, [[x - 34, y - 26], [x + 30, y - 30], [x + 38, y + 18], [x + 10, y + 54], [x - 20, y + 40], [x - 40, y + 14]], '#ffffff', 5); ln(g, [[x - 24, y - 12], [x + 22, y - 16]], 2.5, '#9ab8d8'); }
  else if (kind === 'fan') { // folding hand fan, angle wiggles with o.fanA
    const a0 = (o.fanA || 0); g.save(); g.translate(x, y); g.rotate(a0 * side);
    inkFill(g, [[0, 0], ...ellP(0, 0, 110, 110, -150, -30, 16)], '#e86a5a', 6);
    for (let k = 0; k <= 6; k++) { const a = dg(-150 + k * 20); ln(g, [[0, 0], [110 * Math.cos(a), 110 * Math.sin(a)]], 3, '#8a2a28'); }
    g.restore();
  }
  else if (kind === 'curtain') { // dripping wet curtain held from the top
    const w = o.cw || 1; inkFill(g, [[x - 60 * w, y - 6], [x + 60 * w, y - 6], [x + 70 * w, y + 260], [x + 30 * w, y + 250], [x, y + 266], [x - 34 * w, y + 252], [x - 70 * w, y + 262]], '#b83a3e', 7);
    for (let k = 0; k < 4; k++) ln(g, [[x - 40 * w + k * 27 * w, y + 10], [x - 46 * w + k * 30 * w, y + 240]], 3, '#8a2228');
    g.save(); g.globalAlpha = 0.85; inkFill(g, [[x - 70 * w, y + 160], [x + 70 * w, y + 150], [x + 70 * w, y + 262], [x - 70 * w, y + 262]], '#f4f4ee', 0); g.restore();
    for (let k = 0; k < 4; k++) { const dy = ((o.drip || 0) * 120 + k * 37) % 110; inkFill(g, ellP(x - 50 * w + k * 34 * w, y + 278 + dy, 6, 9, 0, 360, 12), '#ffffff', 3); }
  }
  else if (kind === 'shovel') { ln(g, [[x, y - 120], [x + 10 * side, y + 150]], 12, '#9a6a3a'); ln(g, [[x, y - 120], [x + 10 * side, y + 150]], 3); inkFill(g, [[x - 26 + 10 * side, y + 150], [x + 34 + 10 * side, y + 150], [x + 30 + 10 * side, y + 220], [x + 4 + 10 * side, y + 240], [x - 22 + 10 * side, y + 220]], '#8a8e98', 6); }
  else if (kind === 'torch') { inkFill(g, pill(x - 14, y - 64, x + 14, y + 20, 10), '#3a3a44', 5); inkFill(g, [[x - 22, y - 92], [x + 22, y - 92], [x + 14, y - 62], [x - 14, y - 62]], '#d8d8e0', 5); inkFill(g, ellP(x, y - 92, 22, 7), '#fffbd0', 4); }
  else if (kind === 'brick') { inkFill(g, [[x - 40, y - 22], [x + 40, y - 22], [x + 40, y + 20], [x - 40, y + 20]], '#c0583a', 6); }
}
const PANT = '#2b2733';
function drawBody(g, s, o) {
  const bw = s.bw || 200, y0 = 352, y1 = s.robe ? 925 : 705, x0 = 300 - bw / 2, x1 = 300 + bw / 2, col = s.body || '#d8483a', sh = coolShade(col);
  const flare = s.robe ? (s.flare ?? 26) : 0, pts = pill(x0, y0, x1, y1, Math.min(90, bw * 0.46), flare);
  if (s.cape) inkFill(g, [[x0 - 6, y0 + 30], [x1 + 6, y0 + 30], [x1 + 46, 930], [x1 + 30, 960], [x0 - 30, 960], [x0 - 46, 930]], s.cape, 8);
  if (s.tails) inkFill(g, [[x0 + 6, y1 - 60], [x1 - 6, y1 - 60], [x1 + 4, y1 + 120], [300 + 8, y1 + 96], [300 - 8, y1 + 96], [x0 - 4, y1 + 120]], shadeC(col, 0.85), 8);
  shaded(g, pts, col, sh, 9);
  g.save(); pth(g, pts); g.clip();
  for (const d of s.detail || []) {
    const t = typeof d === 'string' ? d : d.t, dc = (typeof d === 'object' && d.c) || null;
    if (t === 'belt') { const y = y1 - 70; inkFill(g, [[x0 - 5, y], [x1 + 5, y], [x1 + 5, y + 26], [x0 - 5, y + 26]], dc || '#3a2a24', 5); inkFill(g, [[286, y - 3], [314, y - 3], [314, y + 29], [286, y + 29]], '#e2b84c', 4); }
    if (t === 'buttons') for (let k = 0; k < 3; k++) inkFill(g, ellP(300, y0 + 90 + k * 60, 8, 8, 0, 360, 12), dc || '#f2e6c8', 3);
    if (t === 'collar') { inkFill(g, [[300 - 46, y0 - 4], [300, y0 + 46], [300 + 46, y0 - 4]], dc || '#ffffff', 6); }
    if (t === 'shirt') { inkFill(g, [[300 - 50, y0 - 10], [300 + 50, y0 - 10], [300 + 22, y0 + 190], [300 - 22, y0 + 190]], dc || '#f6f2ea', 6); }
    if (t === 'cravat') { inkFill(g, [[300 - 30, y0 + 4], [300 + 30, y0 + 4], [300 + 12, y0 + 40], [300 + 18, y0 + 90], [300, y0 + 100], [300 - 18, y0 + 90], [300 - 12, y0 + 40]], dc || '#f4f0e6', 5); }
    if (t === 'lapels') for (const sd of [-1, 1]) inkFill(g, [[300 + sd * 50, y0 - 10], [300 + sd * 26, y0 + 190], [300 + sd * 76, y0 + 70]], dc || shadeC(col, 0.7), 6);
    if (t === 'tie') inkFill(g, [[292, y0 + 10], [308, y0 + 10], [316, y0 + 150], [300, y0 + 172], [284, y0 + 150]], dc || '#2b2a50', 5);
    if (t === 'vest') for (const sd of [-1, 1]) inkFill(g, [[300 + sd * 12, y0 - 10], [300 + sd * (bw / 2 + 10), y0 - 10], [300 + sd * (bw / 2 + 10), y1 + 10], [300 + sd * 20, y1 + 10], [300 + sd * 20, y0 + 120]], dc || '#3c8a8c', 6);
    if (t === 'apron') { inkFill(g, pill(300 - bw * 0.36, y0 + 110, 300 + bw * 0.36, y1 + 20, 30), dc || '#c8873e', 6); ln(g, [[300 - bw * 0.2, y0 + 210], [300 + bw * 0.2, y0 + 210]], 4); ln(g, [[300 - bw * 0.36, y0 + 110], [300 - bw * 0.5, y0 + 20]], 5); ln(g, [[300 + bw * 0.36, y0 + 110], [300 + bw * 0.5, y0 + 20]], 5); }
    if (t === 'stripes') for (const sd of [-1, 1]) { inkFill(g, [[300 + sd * 30, y0 - 10], [300 + sd * 54, y0 - 10], [300 + sd * 54, y1 + 10], [300 + sd * 30, y1 + 10]], dc || '#e8c048', 4); }
    if (t === 'reflect') { for (const yy of [y0 + 150, y0 + 250]) inkFill(g, [[x0 - 5, yy], [x1 + 5, yy], [x1 + 5, yy + 24], [x0 - 5, yy + 24]], dc || '#e8eef4', 4); for (const sd of [-1, 1]) inkFill(g, [[300 + sd * 36, y0 - 10], [300 + sd * 58, y0 - 10], [300 + sd * 58, y0 + 150], [300 + sd * 36, y0 + 150]], dc || '#e8eef4', 4); }
    if (t === 'chain') { ln(g, ellP(300 + bw * 0.12, y0 + 200, bw * 0.24, 40, 10, 170, 16), 5, '#e2b84c'); inkFill(g, ellP(300 + bw * 0.34, y0 + 214, 16, 16, 0, 360, 16), '#f0c850', 4); }
    if (t === 'seatbelt') { ln(g, [[x1 + 10, y0 + 10], [x0 + 30, y1 - 40]], 22, '#3c3c46'); ln(g, [[x1 + 10, y0 + 10], [x0 + 30, y1 - 40]], 3, '#9a9aa8'); }
    if (t === 'straps') for (const sd of [-1, 1]) ln(g, [[300 + sd * 50, y0 - 10], [300 + sd * 40, y1]], 12, dc || '#2c2a38');
    if (t === 'scarf') inkFill(g, [[300 - 54, y0 - 6], [300 + 54, y0 - 6], [300 + 10, y0 + 70]], dc || '#d03a34', 6);
    if (t === 'pocket') inkFill(g, pill(300 + bw * 0.08, y0 + 70, 300 + bw * 0.34, y0 + 120, 8), shadeC(col, 0.9), 4);
    if (t === 'trim') { ln(g, [[x0 - 30, y1 - 12], [x1 + 30, y1 - 12]], 14, dc || '#e8c048'); }
    if (t === 'frills') for (let k = 0; k < 3; k++) ln(g, ellP(300, y1 - 60 - k * 70, bw * 0.62, 26, 10, 170, 18), 5, dc || '#f6e6ee');
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
    else if (legs === 'jump') L([[hx, hipY], [hx + sd * 60, hipY + 90], [hx + sd * 30, hipY + 170], [hx + sd * 54, hipY + 176]]);
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
  const hr = 140 * (s.headScale || 1), H = { cx: 300 + (o.turn || 0) * 8, cy: 276, rx: hr, ry: hr * 0.9, seed: o.seed ?? 3 };
  // head (tilted about the neck)
  g.save(); g.translate(300, 380); g.rotate(dg(o.headTilt || 0)); g.translate(-300, -380);
  if (s.helm) { shaded(g, wob(H.cx, H.cy + 6, H.rx * 1.16, H.ry * 1.2, 7, 0.01), s.helm, shadeC(s.helm, 0.66), 9); }
  const hp = s.helm ? wob(H.cx + (o.turn || 0) * 18, H.cy + 16, H.rx * 0.8, H.ry * 0.82, H.seed, 0.02) : wob(H.cx, H.cy, H.rx, H.ry, H.seed);
  const hc = o.headCol || HEAD; shaded(g, hp, hc, o.headCol ? shadeC(hc, 0.88) : HEAD_SH, 9.5, [-0.1, -0.06]);
  if (s.helm) { inkFill(g, [[H.cx - 70, H.cy - 92], [H.cx + 96, H.cy - 104], [H.cx + 110, H.cy - 70], [H.cx - 60, H.cy - 64]], shadeC(s.helm, 1.08), 7); }
  const HH = s.helm ? { ...H, cy: H.cy + 16, rx: H.rx * 0.82, ry: H.ry * 0.82 } : H;
  if (!s.helm) drawHair(g, H, o);
  drawFace(g, HH, o);
  if (!o.noHat) drawHat(g, H, o);
  g.restore();
  for (const side of [-1, 1]) {
    const pose = side < 0 ? o.L : o.R, [sx, sy] = shoulders[side], pts = armPts(sx, sy, side, pose);
    ln(g, pts, 7.5); dt(g, pts[2][0], pts[2][1], 10.5);
    drawProp(g, side < 0 ? o.holdL : o.holdR, pts[2][0], pts[2][1], side, o);
  }
  g.restore();
};

/** generic starter cast (make your own per story; never copy another channel's characters) */
export const CAST = {
  worker: { body: '#3f8fd0', detail: ['straps', 'pocket'], hair: '#6a4024', hairStyle: 'mop', hat: { type: 'flatcap', color: '#4a5a8a', stripes: '#c8d4ee' } },
  officer: { body: '#2e4a8a', detail: ['buttons', 'belt'], hair: '#2a2228', hairStyle: 'sides', hat: { type: 'police', color: '#25335e', band: '#1c1a24' } },
  kid: { body: '#e85a8a', detail: ['pocket'], hair: '#3a2a22', hairStyle: 'side', headScale: 1.05, bw: 170 },
  // ---- Great Stink cast (invented cartoon people) ----
  mp1: { body: '#25222c', bw: 262, tails: true, detail: ['shirt', 'cravat', 'lapels', 'chain', { t: 'buttons', c: '#3a3644' }], hair: '#7a5a3a', hairStyle: 'sides', sideburns: '#7a5a3a', blush: '#ff7a7a', hat: { type: 'top', color: '#1e1c24', band: '#4a2e3a' }, seed: 5 },
  mp2: { body: '#8a8c98', bw: 150, headScale: 0.94, tails: true, detail: ['shirt', { t: 'tie', c: '#3a3a5a' }, 'lapels'], hair: '#2a2228', hairStyle: 'sides', mous: '#2a2228', mousStyle: 'thin', monocle: true, hat: { type: 'top', color: '#3a3a44', band: '#22222a' }, seed: 9 },
  doctor: { body: '#232028', bw: 205, tails: true, detail: ['shirt', { t: 'cravat', c: '#e8e4dc' }, 'lapels', 'buttons'], hair: '#b8b8c0', hairStyle: 'sides', beard: '#b4b4bc', glasses: true, seed: 12 },
  mum: { body: '#d86a8a', robe: true, flare: 70, bw: 210, detail: [{ t: 'frills', c: '#f6dce6' }, { t: 'collar', c: '#ffffff' }], hair: '#8a4a2a', hairStyle: 'bun', hat: { type: 'bonnet', color: '#f4e4c8', band: '#e85a8a' }, seed: 4 },
  dad: { body: '#5a3a2a', bw: 210, tails: true, detail: ['shirt', 'cravat', 'lapels'], hair: '#3a2a22', hairStyle: 'sides', mous: '#3a2a22', mousStyle: 'handle', hat: { type: 'top', color: '#26222a', band: '#6a4a3a' }, seed: 6 },
  girl: { body: '#7ab0e0', robe: true, flare: 40, bw: 160, headScale: 1.05, detail: [{ t: 'collar', c: '#ffffff' }, { t: 'frills', c: '#e0eef8' }], hair: '#e0a040', hairStyle: 'pigtails', seed: 2 },
  boy: { body: '#3a6a4a', bw: 165, headScale: 1.05, detail: [{ t: 'collar', c: '#ffffff' }, 'buttons'], hair: '#5a3a22', hairStyle: 'mop', hat: { type: 'flatcap', color: '#6a5a4a' }, seed: 8 },
  digger: { body: '#e8dcc0', bw: 200, detail: [{ t: 'vest', c: '#6a5040' }, { t: 'scarf', c: '#c8402a' }], hair: '#5a3a22', hairStyle: 'sides', mous: '#5a3a22', hat: { type: 'flatcap', color: '#5a5048', stripes: '#7a6e64' }, seed: 10 },
  digger2: { body: '#d8c8a8', bw: 220, detail: [{ t: 'vest', c: '#3a4a5a' }, 'pocket'], hair: '#9a5a2a', hairStyle: 'sides', beard: '#9a5a2a', hat: { type: 'flatcap', color: '#4a4a52' }, seed: 11 },
  modern: { body: '#f07a1a', bw: 210, detail: [{ t: 'reflect', c: '#e4ecf2' }], hair: '#3a2a22', hairStyle: 'sides', hat: { type: 'hard', color: '#f4f4f0', lamp: true }, seed: 13 },
};
/** parliament crowd variants (frock coats + top hats) */
const CROWD_BODY = ['#25222c', '#3a3640', '#4a3a30', '#2a3040', '#383a3e', '#5a4a3a'];
const CROWD_HAIR = ['#3a2a22', '#8a8a92', '#6a4a2a', '#2a2228', '#b0b0b8'];
export const crowdMP = (i) => {
  const b = CROWD_BODY[i % 6], h = CROWD_HAIR[(i * 3) % 5];
  return { body: b, bw: 190 + (i * 37) % 70, tails: true, detail: ['shirt', 'cravat', 'lapels'], hair: h, hairStyle: 'sides',
    ...(i % 3 === 0 ? { mous: h, mousStyle: i % 2 ? 'handle' : 'brush' } : {}), ...(i % 4 === 1 ? { sideburns: h } : {}), ...(i % 5 === 2 ? { beard: h } : {}),
    hat: { type: i % 5 === 3 ? 'bowler' : 'top', color: ['#1e1c24', '#2e2a30', '#3a3036'][i % 3] }, seed: 20 + i };
};

// ---------- extra fx ----------
/** soft floating dust / sparkle mote (use many, small) */
export const fxMote = (p, t, col = '#fff6dc') => { const g = p.g, a = Math.sin(t * Math.PI); const r = g.createRadialGradient(300, 500, 0, 300, 500, 60); r.addColorStop(0, `rgba(255,250,230,${0.95 * a})`); r.addColorStop(1, 'rgba(255,250,230,0)'); g.fillStyle = r; g.fillRect(200, 400, 200, 200); };
/** glow halo for lamps, buttons, headlights (draw as additive-looking card) */
export const fxGlow = (p, col = '255,214,140', k = 1) => { const g = p.g, r = g.createRadialGradient(300, 500, 0, 300, 500, 290); r.addColorStop(0, `rgba(${col},${0.9 * k})`); r.addColorStop(0.25, `rgba(${col},${0.45 * k})`); r.addColorStop(1, `rgba(${col},0)`); g.fillStyle = r; g.fillRect(0, 200, 600, 600); };

// =================== non-human cards (Great Stink) ===================
/** flies: n little flies buzzing around (cx,cy) with radius r, phase t (seconds) */
export const flies = (p, t, n = 6, cx = 300, cy = 500, r = 220, seed = 1) => {
  const g = p.g;
  for (let k = 0; k < n; k++) {
    const a = t * (3.2 + (k % 3) * 0.9) + k * 2.1 + seed, b = t * 2.3 + k * 1.3;
    const x = cx + r * Math.cos(a) * (0.7 + 0.3 * Math.sin(b)), y = cy + r * 0.55 * Math.sin(a * 1.3 + k);
    const wf = Math.sin(t * 60 + k) > 0 ? 1 : 0.6;
    g.save(); g.globalAlpha = 0.75; inkFill(g, ellP(x - 8, y - 12, 10, 14 * wf, 0, 360, 12), '#e8f4ff', 2.5); inkFill(g, ellP(x + 8, y - 12, 10, 14 * wf, 0, 360, 12), '#e8f4ff', 2.5); g.restore();
    inkFill(g, ellP(x, y, 10, 8, 0, 360, 14), '#1e1a22', 0);
    ln(g, [[x - 28 * Math.cos(a + 1.6), y - 28 * Math.sin(a + 1.6)], [x - 44 * Math.cos(a + 1.6), y - 44 * Math.sin(a + 1.6)]], 2.5, 'rgba(30,26,34,.4)');
  }
};
const CLOUD_G = '#93c84e', CLOUD_SH = '#5f9a34';
/** the stink-cloud mascot. o: { t, expr, cape, arms: 'none'|'hero'|'shrug'|'hand'|'point'|'fist', squash, flies, alpha, look } */
export const stinkCloud = (p, o = {}) => {
  const g = p.g, t = o.t || 0, cx = 300, cy = 540, R = 205, sq = o.squash || 0;
  if (o.cape) { // red cape flowing behind
    const w = Math.sin(t * 9), w2 = Math.sin(t * 9 + 1.3);
    inkFill(g, [[205, 600], [395, 600], [470 + w * 26, 860], [430 + w2 * 18, 900], [360, 870 + w * 14], [300, 905], [235, 872 - w * 14], [170 - w2 * 18, 902], [128 - w * 26, 862]], '#d8323a', 9);
    ln(g, [[260, 640], [230 - w * 10, 860]], 4, '#9a1e26'); ln(g, [[340, 640], [372 + w * 10, 860]], 4, '#9a1e26');
  }
  // stubby arms behind/beside
  const arm = (side, pose) => {
    const sx = cx + side * 170, sy = cy + 40; let hx, hy;
    if (pose === 'hero') { hx = sx + side * 70; hy = sy - (side > 0 ? 210 : -30); }
    else if (pose === 'fist') { hx = sx + side * 40; hy = sy + 40; }
    else if (pose === 'shrug') { hx = sx + side * 96; hy = sy - 70; }
    else if (pose === 'hand') { hx = side > 0 ? sx + 110 : sx - 40; hy = side > 0 ? sy + 30 : sy + 70; }
    else if (pose === 'point') { hx = side > 0 ? sx + 120 : sx - 30; hy = side > 0 ? sy - 40 : sy + 80; }
    else if (pose === 'wave') { hx = sx + side * 70; hy = sy - 150 + Math.sin(t * 14) * 30 * side; }
    else { hx = sx + side * 30; hy = sy + 90; }
    ln(g, [[sx, sy], [(sx + hx) / 2 + side * 14, (sy + hy) / 2 + 12], [hx, hy]], 9); dt(g, hx, hy, 15);
    if (pose === 'shrug') { ln(g, [[hx - 10, hy - 4], [hx + side * 18, hy - 24]], 7); }
  };
  const aL = o.armsL || o.arms || 'none', aR = o.armsR || o.arms || 'none';
  if (aL !== 'none') arm(-1, aL); if (aR !== 'none') arm(1, aR);
  // puffy scalloped body
  const pts = []; const N = 140;
  for (let i = 0; i < N; i++) {
    const a = i / N * Math.PI * 2, bump = Math.abs(Math.sin(a * 5.5 + 0.4 + Math.sin(t * 2) * 0.05));
    const r = R * (0.9 + 0.12 * Math.pow(bump, 0.5)) * (1 + 0.025 * Math.sin(t * 5 + a * 3));
    pts.push([cx + r * Math.cos(a) * (1 + sq * 0.15), cy + r * Math.sin(a) * 0.8 * (1 - sq * 0.2)]);
  }
  shaded(g, pts, o.col || CLOUD_G, o.sh || CLOUD_SH, 11, [-0.12, -0.1]);
  // inner curl highlights
  for (const [x, y, rr, a0, a1] of [[220, 440, 50, 200, 320], [350, 430, 40, 210, 330], [400, 520, 34, 260, 380]]) ln(g, ellP(x, y, rr, rr * 0.8, a0, a1, 12), 6, '#c4e690');
  drawFace(g, { cx: cx - 4 + (o.turn || 0) * 30, cy: cy + 10, rx: 118 }, { expr: o.expr || 'grumpy', browK: 1.6, look: o.look || 0, blink: o.blink, turn: o.turn || 0 });
  if (o.flies !== false) flies(p, t, o.nflies || 5, cx, cy - 30, 270, 3);
};
/** small one-eyed germ. o: { t, wave, expr ('grin'|'giggle'|'shock'), col, look, flip } */
export const germ = (p, o = {}) => {
  const g = p.g, t = o.t || 0, cx = 300, cy = 600 + Math.sin(t * 6 + (o.seed || 0)) * 14, R = 120, col = o.col || '#62c44a';
  // curly tail
  const tp = []; for (let i = 0; i <= 30; i++) { const k = i / 30, a = k * Math.PI * 3 + Math.sin(t * 7) * 0.6; tp.push([cx + 100 + k * 120 + 40 * k * Math.cos(a), cy + 60 + 40 * k * Math.sin(a)]); }
  ln(g, tp, 22); ln(g, tp, 11, col);
  // nubs
  for (let k = 0; k < 9; k++) { const a = dg(-160 + k * 30); const x = cx + (R + 14) * Math.cos(a), y = cy + (R + 10) * Math.sin(a) * 0.9; ln(g, [[cx + R * 0.9 * Math.cos(a), cy + R * 0.8 * Math.sin(a)], [x, y]], 9); dt(g, x, y, 12); dt(g, x, y, 7, col); }
  // arms
  const wv = o.wave ? Math.sin(t * 16) * 40 : 0;
  ln(g, [[cx - 100, cy + 30], [cx - 160, cy - 10], [cx - 190, cy - (o.wave ? 110 + wv : -30)]], 8); dt(g, cx - 190, cy - (o.wave ? 110 + wv : -30), 12);
  ln(g, [[cx + 90, cy + 50], [cx + 140, cy + 100], [cx + 150, cy + 140]], 8); dt(g, cx + 150, cy + 140, 12);
  shaded(g, wob(cx, cy, R, R * 0.92, (o.seed || 1) * 1.3, 0.05), col, shadeC(col, 0.7), 10);
  // spots
  for (const [x, y, r] of [[cx - 60, cy + 50, 14], [cx + 50, cy + 70, 10], [cx - 20, cy + 88, 8]]) inkFill(g, ellP(x, y, r, r * 0.8, 0, 360, 14), shadeC(col, 0.82), 0);
  // one big eye
  const ex = cx + (o.look || 0) * 6, ey = cy - 26;
  inkFill(g, ellP(ex, ey, 46, 50, 0, 360, 32), '#ffffff', 7);
  dt(g, ex + (o.look || 0) * 16, ey + 4, o.expr === 'shock' ? 12 : 18); dt(g, ex + (o.look || 0) * 16 + 6, ey - 4, 5, '#ffffff');
  ln(g, [[ex - 46, ey - 64], [ex + 4, ey - 52], [ex + 44, ey - 70]], 9); // mischievous brow
  // grin
  const my = cy + 42;
  if (o.expr === 'shock') inkFill(g, ellP(cx, my + 4, 14, 16, 0, 360, 16), '#3a1a20', 6);
  else {
    const op = o.expr === 'giggle' ? 22 + Math.abs(Math.sin(t * 20)) * 10 : 20;
    const pts = [[cx - 50, my - 6], [cx + 54, my - 14], ...ellP(cx + 2, my - 8, 52, op, 0, 180, 16).slice(1)];
    inkFill(g, pts, '#ffffff', 6); for (let x = cx - 30; x < cx + 46; x += 20) ln(g, [[x, my - 10], [x, my + op - 8]], 3.5);
    inkFill(g, pts, null, 6);
  }
};
/** orange cat; o.faint 0..1 tips it over onto its side */
export const cat = (p, o = {}) => {
  const g = p.g, k = Math.min(1, o.faint || 0), col = '#e8943a';
  g.save(); g.translate(300, 960); g.rotate(-dg(90) * (k * k * (3 - 2 * k))); g.translate(-300, -960);
  // tail
  ln(g, [[380, 930], [470, 900], [500, 820], [470, 780]], 26); ln(g, [[380, 930], [470, 900], [500, 820], [470, 780]], 14, col);
  shaded(g, [...ellP(300, 840, 120, 130, 0, 360, 40)], col, shadeC(col, 0.75), 9);
  for (const sd of [-1, 1]) inkFill(g, ellP(300 + sd * 60, 955, 34, 20), col, 7);
  // head
  const hx = 300, hy = 650;
  for (const sd of [-1, 1]) inkFill(g, [[hx + sd * 50, hy - 60], [hx + sd * 96, hy - 140], [hx + sd * 108, hy - 40]], col, 8);
  shaded(g, wob(hx, hy, 120, 100, 4, 0.02), col, shadeC(col, 0.78), 9);
  for (const sd of [-1, 1]) { ln(g, [[hx + sd * 30, hy - 96], [hx + sd * 36, hy - 70]], 5, '#b86a20'); }
  if (k > 0.5) { for (const sd of [-1, 1]) ln(g, ellP(hx + sd * 42, hy - 10, 18, 12, 200, 340, 10), 6); inkFill(g, [[hx + 6, hy + 40], [hx + 26, hy + 40], [hx + 22, hy + 70], [hx + 10, hy + 70]], '#f07a8a', 4); }
  else { for (const sd of [-1, 1]) { inkFill(g, ellP(hx + sd * 42, hy - 12, 22, 26, 0, 360, 24), '#ffffff', 5); dt(g, hx + sd * 42, hy - 8, 9); } }
  inkFill(g, [[hx - 10, hy + 18], [hx + 10, hy + 18], [hx, hy + 30]], '#f07a8a', 3);
  ln(g, [[hx - 22, hy + 42], [hx, hy + 32], [hx + 22, hy + 42]], 5);
  for (const sd of [-1, 1]) for (const dy of [-6, 8]) ln(g, [[hx + sd * 60, hy + 26 + dy], [hx + sd * 130, hy + 18 + dy * 2]], 3);
  g.restore();
};
/** panting dog, tongue out (t = time) */
export const dog = (p, o = {}) => {
  const g = p.g, t = o.t || 0, col = '#c8945a', pant = Math.abs(Math.sin(t * 9));
  ln(g, [[390, 900], [460, 860], [480, 820]], 22); ln(g, [[390, 900], [460, 860], [480, 820]], 11, col);
  shaded(g, [...ellP(320, 860, 140, 100, 0, 360, 40)], col, shadeC(col, 0.75), 9);
  for (const x of [230, 280, 360, 410]) { ln(g, [[x, 900], [x, 965]], 20); ln(g, [[x, 900], [x, 965]], 10, col); }
  const hx = 230, hy = 700 + pant * 6;
  shaded(g, wob(hx, hy, 105, 92, 6, 0.02), col, shadeC(col, 0.78), 9);
  for (const sd of [-1, 1]) inkFill(g, [[hx + sd * 70, hy - 60], [hx + sd * 118, hy - 10], [hx + sd * 100, hy + 70], [hx + sd * 76, hy + 10]], '#7a5030', 7);
  for (const sd of [-1, 1]) { inkFill(g, ellP(hx + sd * 34, hy - 20, 18, 20, 0, 360, 20), '#ffffff', 5); dt(g, hx + sd * 34, hy - 16, 8); ln(g, [[hx + sd * 50, hy - 52], [hx + sd * 18, hy - 46]], 6); }
  inkFill(g, ellP(hx, hy + 30, 50, 34), shadeC(col, 1.12), 6); inkFill(g, ellP(hx, hy + 16, 16, 11), CK, 0);
  inkFill(g, [[hx - 16, hy + 50], [hx + 16, hy + 50], [hx + 18, hy + 90 + pant * 40], [hx, hy + 104 + pant * 40], [hx - 18, hy + 90 + pant * 40]], '#f07a8a', 5);
  for (let k = 0; k < 2; k++) { const dy = ((t * 2 + k * 0.5) % 1); inkFill(g, ellP(hx + 40 + k * 30, hy - 100 - dy * 60, 7, 10, 0, 360, 12), '#9ad4ff', 3); }
};
/** green smell wave: curly rising ribbons. t time, k strength 0..1 */
export const smell = (p, t, k = 1, seed = 0) => {
  const g = p.g; g.save(); g.globalAlpha = Math.min(1, k) * 0.9;
  for (let j = 0; j < 3; j++) {
    const pts = [], x0 = 170 + j * 130, ph = t * 3 + j * 1.7 + seed;
    for (let i = 0; i <= 26; i++) { const y = 960 - i * 30, a = i * 0.42 - ph; pts.push([x0 + Math.sin(a) * (30 + i * 2.2), y]); }
    const end = pts[pts.length - 1]; for (let i = 1; i <= 8; i++) { const a = i / 8 * Math.PI * 1.6; pts.push([end[0] + 34 - 34 * Math.cos(a), end[1] - 30 * Math.sin(a)]); }
    ln(g, pts, 30, '#3c6a24'); ln(g, pts, 18, '#9ad25a'); ln(g, pts.slice(0, 18), 5, '#d6f0a0');
  }
  g.restore();
};
/** bubbles popping on the water (t time) */
export const bubbles = (p, t, seed = 0) => {
  const g = p.g;
  for (let k = 0; k < 6; k++) {
    const ph = (t * 0.8 + k * 0.17 + seed * 0.31) % 1, x = 100 + ((k * 137 + seed * 61) % 400), r = 18 + ((k * 29) % 26);
    const s = ph < 0.85 ? Math.min(1, ph * 4) : 0;
    if (s > 0) { inkFill(g, ellP(x, 940 - r * s, r * s, r * s * 0.85, 180, 360, 20), '#8a9a52', 5); ln(g, ellP(x - r * 0.3, 940 - r * s * 1.1, r * 0.3 * s, r * 0.25 * s, 200, 300, 8), 4, '#d8e4a8'); }
    else { for (let i = 0; i < 5; i++) { const a = dg(200 + i * 35); dt(g, x + Math.cos(a) * r * 1.4, 930 + Math.sin(a) * r, 5, '#a8b868'); } }
  }
};
/** murky stream pouring (for pipes / carts), length L px; t time */
export const pour = (p, t, col = '#7a7a3a', L = 700, w = 1) => {
  const g = p.g, top = 975 - L, h = 40 * w;
  const pts = [[300 - h, top], [300 + h, top], [300 + h * 1.3, top + L * 0.5], [300 + h * 1.65, 975], [300 - h * 1.65, 975], [300 - h * 1.3, top + L * 0.5]];
  inkFill(g, pts, col, 8);
  g.save(); pth(g, pts); g.clip(); for (let k = 0; k < 8; k++) { const y = top + ((t * 900 + k * 120) % L); ln(g, [[300 - h * 0.5, y], [300 - h * 0.45, y + 60]], 6, shadeC(col, 1.25)); ln(g, [[300 + h * 0.5, y + 40], [300 + h * 0.55, y + 90]], 5, shadeC(col, 0.8)); } g.restore();
  for (let k = 0; k < 6; k++) { const a = dg(200 + k * 28), d = 60 + ((t * 300 + k * 37) % 70); inkFill(g, ellP(300 + Math.cos(a) * d * 1.6 * w, 965 + Math.sin(a) * d * 0.6, 12 * w, 14 * w, 0, 360, 10), col, 4); }
};
/** wilting flower; w 0 fresh .. 1 wilted */
export const flower = (p, w = 0, col = '#e8506a', seed = 0) => {
  const g = p.g, bend = w * 1.4;
  const stem = []; for (let i = 0; i <= 10; i++) { const k = i / 10, a = bend * k * k; stem.push([300 + Math.sin(a) * 300 * k * 0.6, 975 - Math.cos(a) * 520 * k]); }
  ln(g, stem, 16); ln(g, stem, 8, mix('#4aa040', '#8a7a3a', w));
  for (const sd of [-1, 1]) inkFill(g, [[300, 860], [300 + sd * 90, 800 + w * 60], [300 + sd * 30, 880]], mix('#5ab04a', '#9a8a4a', w), 6);
  const [hx, hy] = stem[10], pc = mix(col, '#8a6a5a', w * 0.7);
  for (let k = 0; k < 6; k++) { const a = dg(k * 60 + seed * 20) + bend, d = 52; inkFill(g, ellP(hx + Math.cos(a) * d, hy + Math.sin(a) * d + w * 30 * (Math.sin(a) > 0 ? 1 : 0.4), 38, 30 + w * 10, 0, 360, 18), pc, 6); }
  inkFill(g, ellP(hx, hy, 34, 34), mix('#f2c43a', '#8a7a4a', w), 6);
};
/** thermometer plaque: lvl 0..1 (1 = top), crack 0..1 */
export const thermo = (p, lvl = 0.5, crack = 0) => {
  const g = p.g;
  inkFill(g, pill(200, 120, 400, 960, 90), '#9a6a3e', 9); inkFill(g, pill(220, 140, 380, 940, 76), '#b88250', 0);
  for (let k = 0; k < 12; k++) { const y = 240 + k * 52; ln(g, [[k % 2 ? 340 : 330, y], [362, y]], 5, '#6a4426'); ln(g, [[238, y], [k % 2 ? 260 : 270, y]], 5, '#6a4426'); }
  inkFill(g, pill(272, 180, 328, 830, 28), '#eef6fa', 7);
  inkFill(g, ellP(300, 840, 52, 52), '#e0282e', 8);
  const top = 820 - Math.min(1, lvl) * 620; inkFill(g, [[286, 830], [286, top], [314, top], [314, 830]], '#e0282e', 0);
  ln(g, [[290, 820], [290, top + 10]], 4, '#ff8a8a');
  if (crack > 0) { ln(g, [[300, 180], [288, 210], [310, 230], [292, 262]], 5); inkFill(g, ellP(300, 170, 40 * crack, 30 * crack), '#e0282e', 5); }
};
/** stack of documents (grey lines only), with dust and cobwebs */
export const papers = (p, dust = 1, t = 0) => {
  const g = p.g;
  for (let k = 0; k < 9; k++) { const y = 940 - k * 44, dx = Math.sin(k * 2.3) * 20; inkFill(g, [[140 + dx, y], [460 + dx, y - 6], [466 + dx, y + 34], [134 + dx, y + 40]], k % 2 ? '#efe4c8' : '#e6d8b4', 6); }
  const ty = 940 - 8 * 44; for (let k = 0; k < 4; k++) ln(g, [[180, ty + 4 - k * 1], [420, ty - 2]], 0.1);
  if (dust > 0) { g.save(); g.globalAlpha = 0.7 * dust; inkFill(g, [[150, ty + 6], [450, ty], [460, ty - 20], [140, ty - 14]], '#b8a888', 0); g.restore();
    // cobweb in the corner
    const cx = 460, cy = ty - 300; g.save(); g.globalAlpha = 0.8 * dust; for (let a = 0; a < 5; a++) ln(g, [[cx, cy], [cx - 200 * Math.cos(dg(a * 22)), cy + 200 * Math.sin(dg(a * 22))]], 3, '#e8e8f0');
    for (let r = 50; r <= 200; r += 50) { const pts = []; for (let a = 0; a <= 4; a++) pts.push([cx - r * Math.cos(dg(a * 22)), cy + r * Math.sin(dg(a * 22))]); ln(g, pts, 2.5, '#e8e8f0'); } g.restore();
    dt(g, cx - 120, cy + 120 + Math.sin(t * 3) * 20, 12); ln(g, [[cx - 120, cy + 40], [cx - 120, cy + 112 + Math.sin(t * 3) * 20]], 2, '#e8e8f0');
  }
};
/** a single sheet (grey lines or calendar grid) */
export const sheet = (p, kind = 'lines', rot = 0) => {
  const g = p.g; g.save(); g.translate(300, 500); g.rotate(rot); g.translate(-300, -500);
  inkFill(g, [[160, 320], [440, 310], [450, 690], [150, 700]], '#f6efdc', 7);
  if (kind === 'cal') { inkFill(g, [[160, 320], [440, 310], [443, 400], [157, 410]], '#c8403a', 0); inkFill(g, [[160, 320], [440, 310], [450, 690], [150, 700]], null, 7);
    for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) inkFill(g, [[180 + c * 52, 440 + r * 60], [214 + c * 52, 440 + r * 60], [214 + c * 52, 474 + r * 60], [180 + c * 52, 474 + r * 60]], '#d8d0c0', 0); }
  else for (let k = 0; k < 7; k++) ln(g, [[190, 370 + k * 44], [410 - (k === 6 ? 90 : 0), 366 + k * 44]], 6, '#a8a090');
  g.restore();
};
/** seal stamp coming down (d: 0 up .. 1 down), mark shows when hit */
export const stamp = (p, d = 0, hit = false) => {
  const g = p.g;
  inkFill(g, [[140, 860], [460, 852], [470, 960], [130, 968]], '#f6efdc', 7);
  for (let k = 0; k < 2; k++) ln(g, [[170, 885 + k * 22], [300, 882 + k * 22]], 5, '#a8a090');
  if (hit) { inkFill(g, ellP(370, 915, 62, 30, 0, 360, 30), '#c8282e', 6); inkFill(g, ellP(370, 915, 36, 16, 0, 360, 20), null, 4); }
  const y = 560 + d * 300; inkFill(g, pill(270, y - 300, 330, y - 110, 28), '#8a5a34', 8); inkFill(g, ellP(300, y - 300, 50, 40), '#6a4024', 8);
  inkFill(g, pill(220, y - 120, 380, y - 20, 20), '#c0a060', 8); inkFill(g, [[230, y - 30], [370, y - 30], [370, y], [230, y]], '#c8282e', 6);
};
/** a lone top hat (flying) */
export const hatCard = (p, rot = 0, col = '#1e1c24') => { const g = p.g; g.save(); g.translate(300, 600); g.rotate(rot); g.translate(-300, -600);
  inkFill(g, [[220, 640], [226, 470], [374, 470], [380, 640]], col, 9); inkFill(g, [[220, 600], [380, 600], [380, 630], [220, 630]], '#5a3a44', 6); inkFill(g, ellP(300, 642, 140, 22), col, 9); g.restore(); };
/** open landau carriage with a galloping horse; heads of the family are separate cards behind its side panel */
export const carriage = (p, t = 0, col = '#6a2a2a') => {
  const g = p.g, gal = Math.sin(t * 22);
  // horse (right)
  const hc = '#8a5a3a';
  for (let k = 0; k < 4; k++) { const x = 420 + (k % 2) * 40 + (k > 1 ? 70 : 0), sw = Math.sin(t * 22 + k * 1.6) * 30; ln(g, [[x, 780], [x + sw * 0.6, 860], [x + sw, 930]], 20); ln(g, [[x, 780], [x + sw * 0.6, 860], [x + sw, 930]], 11, hc); dt(g, x + sw, 936, 12); }
  shaded(g, [...ellP(480, 760, 110, 62, 0, 360, 30)], hc, shadeC(hc, 0.75), 8);
  inkFill(g, [[540, 740], [575, 630 + gal * 6], [600, 600], [598, 690], [570, 760]], hc, 8);
  shaded(g, wob(570, 600 + gal * 6, 44, 34, 2, 0.02), hc, shadeC(hc, 0.75), 7); inkFill(g, [[548, 570], [560, 540], [572, 572]], hc, 5); dt(g, 580, 594 + gal * 6, 6);
  ln(g, [[530, 660], [560, 600], [520, 700]], 8, '#3a2418'); ln(g, [[372, 760], [480, 740]], 6, '#3a2418');
  ln(g, [[384, 704], [430, 760]], 7, '#3a2418');
  // carriage body
  for (const x of [120, 320]) { const r = x === 120 ? 90 : 70; inkFill(g, ellP(x, 975 - r, r, r, 0, 360, 30), '#c8a050', 8); inkFill(g, ellP(x, 975 - r, r * 0.25, r * 0.25), '#6a4a2a', 5);
    for (let k = 0; k < 6; k++) { const a = dg(k * 30 + t * 700); ln(g, [[x - Math.cos(a) * r * 0.86, 975 - r - Math.sin(a) * r * 0.86], [x + Math.cos(a) * r * 0.86, 975 - r + Math.sin(a) * r * 0.86]], 5, '#6a4a2a'); } }
  shaded(g, [[30, 700], [400, 700], [380, 860], [60, 870]], col, shadeC(col, 0.7), 9);
  ln(g, [[50, 730], [390, 730]], 6, '#e2b84c'); inkFill(g, [[24, 692], [408, 692], [404, 706], [28, 708]], '#3a1a1a', 6);
};
/** wheelbarrow with bricks */
export const barrow = (p, t = 0) => {
  const g = p.g, r = 70; inkFill(g, ellP(450, 975 - r, r, r, 0, 360, 24), '#6a4a2a', 8); for (let k = 0; k < 4; k++) { const a = dg(k * 45 + t * 400); ln(g, [[450 - Math.cos(a) * 60, 905 - Math.sin(a) * 60], [450 + Math.cos(a) * 60, 905 + Math.sin(a) * 60]], 5); }
  ln(g, [[60, 760], [430, 840]], 12, '#7a5434'); ln(g, [[150, 870], [170, 960]], 10, '#7a5434');
  inkFill(g, [[140, 720], [470, 760], [430, 870], [180, 860]], '#8a8e98', 8);
  for (let k = 0; k < 5; k++) inkFill(g, [[170 + k * 52, 700 - (k % 2) * 16], [216 + k * 52, 704 - (k % 2) * 16], [216 + k * 52, 740], [170 + k * 52, 736]], '#c0583a', 5);
};
/** microscope eyepiece mask: black frame with a soft round hole, draw on a full-screen card */
export const scopeMask = (p, open = 0) => {
  const g = p.g; g.save(); g.fillStyle = '#0c0a10'; g.beginPath(); g.rect(-50, -50, 700, 1100); const r = 175 + open * 700; g.arc(300, 500, r, 0, Math.PI * 2, true); g.fill();
  g.lineWidth = 18; g.strokeStyle = '#3a3640'; g.beginPath(); g.arc(300, 500, r, 0, Math.PI * 2); g.stroke(); g.restore();
};
