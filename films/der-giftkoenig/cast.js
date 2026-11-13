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
};
function drawFace(g, H, o) {
  const { cx, cy, rx } = H, u = rx / 100, turn = o.turn || 0, look = o.look || 0, E = EXPR[o.expr || 'neutral'] || EXPR.neutral;
  const fx = cx + turn * 26 * u, eyeY = cy - 6 * u;
  const blink = (o.blink || 0) > 0.5, eyes = [-1, 1].map((s) => ({ s, x: fx + s * 37 * u * (1 - 0.18 * Math.abs(turn) * (s * turn < 0 ? 1 : 0)), k: 1 - 0.22 * Math.max(0, -s * turn) }));
  // eyes
  for (const e of eyes) {
    const x = e.x, k = e.k, typ = blink ? 'closed' : (o.wink && e.s > 0 ? 'wink' : E.eye);
    if (typ === 'round') {
      inkFill(g, ellP(x, eyeY - 4 * u, 21 * u * k, 24 * u, 0, 360, 32), '#ffffff', 6 * u);
      dt(g, x + look * 9 * u * k, eyeY - 2 * u, 7.5 * u * (E.pupil || 1));
    } else if (typ === 'lid') {
      g.save(); pth(g, ellP(x + look * 4 * u, eyeY + 3 * u, 13 * u * k, 11 * u, 0, 180, 16)); g.fillStyle = CK; g.fill(); g.restore();
      ln(g, [[x - 18 * u * k, eyeY + 1 * u], [x + 18 * u * k, eyeY - 1 * u]], 7 * u);
    } else if (typ === 'dot') dt(g, x + look * 6 * u, eyeY, 8 * u);
    else if (typ === 'arc') ln(g, ellP(x, eyeY + 6 * u, 15 * u * k, 12 * u, 200, 340, 12), 6.5 * u);
    else if (typ === 'wink') ln(g, [[x - 17 * u * k, eyeY - 2 * u], [x, eyeY + 8 * u], [x + 17 * u * k, eyeY - 2 * u]], 7 * u);
    else ln(g, [[x - 15 * u * k, eyeY + 2 * u], [x + 15 * u * k, eyeY + 2 * u]], 6.5 * u);
    if (o.glasses) { g.save(); pth(g, ellP(x, eyeY - 2 * u, 30 * u * k, 27 * u, 0, 360, 28)); g.fillStyle = 'rgba(200,230,255,0.25)'; g.fill(); g.lineWidth = 6 * u; g.strokeStyle = o.glasses; g.stroke(); g.restore(); }
    // brows
    const by = eyeY - 30 * u, bw = 19 * u * k, bt = 8.5 * u, s = e.s;
    const B = { smug: s < 0 ? [[-bw, 4], [bw, -6]] : [[-bw, -10], [bw, -2]], up: [[-bw, 2], [bw, -4 * s]], high: [[-bw, -10], [bw, -12]], flat: [[-bw, 0], [bw, 0]],
      worry: [[-bw, s > 0 ? -10 : 6], [bw, s > 0 ? 6 : -10]], angry: [[-bw, s > 0 ? 10 : -6], [bw, s > 0 ? -6 : 10]] }[E.brow] || [[-bw, 0], [bw, 0]];
    ln(g, B.map(([dx, dy]) => [x + dx, by + dy * u]), bt);
  }
  if (o.glasses) ln(g, [[eyes[0].x + 28 * u, eyeY - 6 * u], [eyes[1].x - 28 * u, eyeY - 6 * u]], 5 * u, o.glasses);
  for (let i = 0; i < (o.sweat || 0); i++) { const sx = cx + (i % 2 ? 1 : -1) * rx * (0.78 + 0.08 * i), sy = cy - 40 * u + i * 34 * u + ((o.sweatT || 0) * 40 * u) % (30 * u);
    inkFill(g, [[sx, sy - 22 * u], [sx + 11 * u, sy], ...ellP(sx, sy, 11 * u, 11 * u, 0, 180, 10), [sx - 11 * u, sy]], '#bfe6ff', 4 * u); }
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
  } else if (st === 'wavy') {
    const pts = []; for (let i = 0; i <= 40; i++) { const a = dg(150 + 240 * i / 40), w = 1.1 + 0.06 * Math.sin(i * 1.9); pts.push([cx + rx * w * Math.cos(a), cy - 6 * u + ry * w * Math.sin(a)]); }
    for (let i = 0; i <= 10; i++) { const t = i / 10, x = cx + rx * (0.98 - 1.96 * t); pts.push([x, cy - 28 * u - Math.abs(t - 0.35) * 46 * u + (i % 2 ? 16 : -4) * u - turn * 6 * u]); }
    // side locks down to the jaw
    shaded(g, pts, c, shadeC(c, 0.7), 8 * u, [-0.1, -0.12]);
    for (const sd of [-1, 1]) inkFill(g, [[cx + sd * rx * 1.08, cy - 30 * u], [cx + sd * rx * 1.14, cy + 18 * u], [cx + sd * rx * 1.02, cy + 46 * u], [cx + sd * rx * 0.9, cy + 20 * u], [cx + sd * rx * 0.9, cy - 20 * u]], c, 7 * u);
    for (let k = 0; k < 4; k++) ln(g, ellP(cx - 40 * u + k * 30 * u, cy - 44 * u, 40 * u, 44 * u, 220 + k * 8, 290 + k * 8, 10), 3.5 * u, mix(c, '#ffffff', 0.32));
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
    case 'circlet': {
      const y = top + 34 * u, pts = [[cx - 96 * u, y + 10 * u], [cx - 98 * u, y - 10 * u]];
      for (let i = 0; i <= 8; i++) { const x = cx - 90 * u + i * 22.5 * u; pts.push([x, y - (i % 2 ? 10 : (i === 4 ? 46 : 28)) * u]); }
      pts.push([cx + 98 * u, y - 10 * u], [cx + 96 * u, y + 10 * u]);
      shaded(g, pts, c, shadeC(c, 0.72), 6 * u); inkFill(g, ellP(cx, y - 6 * u, 9 * u, 9 * u, 0, 360, 14), h.gem || '#8a3ad0', 3 * u);
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
function drawProp(g, kind, x, y, side, o = {}) {
  if (!kind) return;
  if (kind === 'goblet' || kind === 'goblet_empty' || kind === 'bigcup') { const k = kind === 'bigcup' ? 1.6 : 1, liq = kind === 'goblet_empty' ? null : (o.liquid || '#4dff6a');
    g.save(); g.translate(x, y); g.rotate(dg(o.gobletTilt || 0)); g.scale(k, k);
    if (liq) { const r = g.createRadialGradient(0, -40, 0, 0, -40, 90); r.addColorStop(0, 'rgba(120,255,140,0.55)'); r.addColorStop(1, 'rgba(120,255,140,0)'); if (!o.liquid) { g.fillStyle = r; g.fillRect(-90, -130, 180, 180); } }
    inkFill(g, [[-34, -64], [34, -64], [26, -20], [8, -6], [6, 22], [22, 34], [-22, 34], [-6, 22], [-8, -6], [-26, -20]], o.metal || '#e2b84c', 6);
    if (liq) inkFill(g, ellP(0, -62, 32, 9, 0, 360, 20), liq, 4); else inkFill(g, ellP(0, -62, 32, 9, 0, 360, 20), '#5a4020', 4);
    ln(g, [[-24, -50], [-18, -26]], 4, 'rgba(255,255,255,0.7)'); g.restore(); return; }
  if (kind === 'tray') { inkFill(g, ellP(x + side * 40, y + 6, 96, 18, 0, 360, 30), '#d8d8e0', 6); for (const dx of [-40, 10, 56]) drawProp(g, 'goblet', x + side * 40 + dx, y - 8, side, { ...o, gobletTilt: 0 }); return; }
  if (kind === 'tray_empty') { inkFill(g, ellP(x + side * 40, y + 6, 96, 18, 0, 360, 30), '#d8d8e0', 6); return; }
  if (kind === 'vial' || kind === 'vial_empty') { const r = g.createRadialGradient(x, y - 30, 0, x, y - 30, 70); r.addColorStop(0, kind === 'vial' ? 'rgba(110,255,130,0.6)' : 'rgba(255,255,255,0.15)'); r.addColorStop(1, 'rgba(110,255,130,0)'); g.fillStyle = r; g.fillRect(x - 70, y - 100, 140, 140);
    inkFill(g, [[x - 16, y - 50], [x + 16, y - 50], [x + 18, y + 10], [x - 18, y + 10]], kind === 'vial' ? '#4dff6a' : 'rgba(220,240,255,0.6)', 5); inkFill(g, [[x - 9, y - 70], [x + 9, y - 70], [x + 9, y - 50], [x - 9, y - 50]], '#8a5a34', 4); ln(g, [[x - 8, y - 40], [x - 8, y]], 3, 'rgba(255,255,255,0.8)'); return; }
  if (kind === 'drumstick') { inkFill(g, ellP(x + side * 26, y - 30, 34, 26, 0, 360, 20), '#c8763a', 6); ln(g, [[x, y], [x - side * 20, y + 30]], 12, '#f4ead8'); ln(g, [[x, y], [x - side * 20, y + 30]], 3); dt(g, x + side * 20, y - 40, 7, 'rgba(120,255,140,0.8)'); return; }
  if (kind === 'dropper') { inkFill(g, [[x - 7, y - 10], [x + 7, y - 10], [x + 3, y + 70], [x - 3, y + 70]], 'rgba(220,240,255,0.8)', 4); inkFill(g, ellP(x, y - 22, 14, 18, 0, 360, 16), '#3a3040', 4); return; }
  if (kind === 'ladle') { ln(g, [[x - side * 30, y - 90], [x + side * 50, y + 150]], 14, '#8a5a34'); ln(g, [[x - side * 30, y - 90], [x + side * 50, y + 150]], 3); return; }

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
  if (s.backpack) inkFill(g, pill(x0 - 40, y0 + 10, x1 + 40, y1 - 40, 60), s.backpack, 8);
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
    if (t === 'trim') { ln(g, [[x0 - 30, y1 - 12], [x1 + 30, y1 - 12]], 14, dc || '#e8c048'); }
  }
  g.restore(); inkFill(g, pts, null, 0);
  if ((s.detail || []).includes('sword')) { // ornate hilt at the left hip, blade down along the robe
    const hx = x0 + 34, hy = y1 - (s.robe ? 300 : 80);
    inkFill(g, [[hx - 14, hy + 20], [hx + 14, hy + 20], [hx + 10, hy + 250], [hx, hy + 278], [hx - 10, hy + 250]], '#b8c0cc', 6);
    inkFill(g, [[hx - 44, hy + 6], [hx + 44, hy + 6], [hx + 40, hy + 26], [hx - 40, hy + 26]], '#e2b84c', 6);
    inkFill(g, [[hx - 12, hy - 56], [hx + 12, hy - 56], [hx + 12, hy + 8], [hx - 12, hy + 8]], '#6a2a7a', 5);
    inkFill(g, ellP(hx, hy - 70, 20, 20, 0, 360, 18), '#e2b84c', 5); inkFill(g, ellP(hx, hy - 70, 8, 8, 0, 360, 12), '#3ad06a', 3);
  }
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
export const PRE = {}; // named pre/post draw hooks (key-safe)
export const toonChar = (p, spec, opts = {}) => {
  const g = p.g, s = typeof spec === 'string' ? CAST[spec] : spec, o = { ...s, ...opts };
  g.save();
  const bob = (o.bob || 0) * 1000; g.translate(0, -bob);
  if (o.tilt) { g.translate(300, 975); g.rotate(dg(o.tilt)); g.translate(-300, -975); }
  if (o.pre && PRE[o.pre]) PRE[o.pre](g, o);
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
    drawProp(g, side < 0 ? o.holdL : o.holdR, pts[2][0], pts[2][1], side, o);
  }
  if (o.post && PRE[o.post]) PRE[o.post](g, o);
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

// ===================== "Der Giftkönig" cast (invented characters, no real portraits) =====================
export const ZK = {
  // Zehir Kralı: 30-40, clean-shaven, thick wavy brown hair, sharp sly eyes, purple robe + gold trim, long purple/gold cape,
  // thin gold circlet, ornate sword at the hip (the hilt hides a tiny vial)
  king: { body: '#6a2a8a', robe: true, bw: 210, cape: '#4a1a66', detail: [{ t: 'trim', c: '#e8c048' }, { t: 'collar', c: '#e8c048' }, { t: 'belt', c: '#e8c048' }, 'sword'],
    hair: '#7a4a26', hairStyle: 'wavy', hat: { type: 'circlet', color: '#f0c43a', gem: '#3ad06a' }, seed: 5 },
  // young version for the corridor (same face, plainer robe)
  young: { body: '#3a3a8a', robe: true, bw: 190, cape: '#26265a', detail: [{ t: 'trim', c: '#c8a040' }, 'belt'], hair: '#7a4a26', hairStyle: 'wavy', headScale: 1.04, seed: 5 },
  // old king (flashback): white beard, kind face, heavy crown
  old: { body: '#7a3a9a', robe: true, bw: 220, cape: '#5a2470', detail: [{ t: 'trim', c: '#f2e6c8' }], hair: '#f2f2f0', hairStyle: 'sides', beard: '#f4f4f2', mous: '#f4f4f2', hat: { type: 'crown', color: '#e8b43a' }, seed: 9 },
  servantA: { body: '#f4f0e6', robe: true, bw: 180, detail: [{ t: 'belt', c: '#8a6a3a' }], hair: '#3a2a22', hairStyle: 'short', seed: 2 },
  servantB: { body: '#f0ece0', robe: true, bw: 175, detail: [{ t: 'scarf', c: '#6a9ad0' }], hair: '#a0602a', hairStyle: 'bun', seed: 11 },
  courtA: { body: '#2a3a6a', robe: true, bw: 190, detail: [{ t: 'trim', c: '#a08040' }], hair: '#2a2228', hairStyle: 'sides', goatee: '#2a2228', seed: 4 },
  courtB: { body: '#5a2a3a', robe: true, bw: 200, detail: [{ t: 'scarf', c: '#8a6a3a' }], hair: '#4a3a2a', hairStyle: 'short', mous: '#4a3a2a', mousStyle: 'handle', seed: 7 },
  courtC: { body: '#2a4a3a', robe: true, bw: 185, detail: ['collar'], hair: '#1a1a20', hairStyle: 'bun', seed: 13 },
  guestA: { body: '#e0703a', robe: true, bw: 200, detail: [{ t: 'trim', c: '#f4e0a0' }], hair: '#3a2a22', hairStyle: 'short', mous: '#3a2a22', seed: 1 },
  guestB: { body: '#3aa0a0', robe: true, bw: 190, detail: [{ t: 'scarf', c: '#f4d040' }], hair: '#c08040', hairStyle: 'bun', seed: 6 },
  guestC: { body: '#d04a7a', robe: true, bw: 210, detail: [{ t: 'belt', c: '#f4d040' }], hair: '#888890', hairStyle: 'sides', goatee: '#888890', seed: 8 },
  guestD: { body: '#7ab040', robe: true, bw: 195, detail: [{ t: 'collar', c: '#f4f0e0' }], hair: '#5a3020', hairStyle: 'mop', seed: 12 },
  guestE: { body: '#4a6ad0', robe: true, bw: 205, detail: [{ t: 'trim', c: '#f4d040' }], hair: '#2a2228', hairStyle: 'short', beard: '#2a2228', seed: 14 },
  teen: { body: '#e85a4a', bw: 180, backpack: '#2e6ab0', detail: [{ t: 'straps', c: '#1e4a80' }, 'pocket'], legs: '#2b3a5a', hair: '#2a2228', hairStyle: 'side', headScale: 1.03, seed: 3 },
  guide: { body: '#2e5a4a', bw: 205, detail: ['collar', { t: 'tie', c: '#c8a040' }, 'badge'], legs: '#2b2733', hair: '#9a9aa4', hairStyle: 'short', glasses: '#1a1416', seed: 10 },
};

// ---------- story fx (all drawn around the card centre 300,500) ----------
/** green smoke puff ("puf") */
export const fxGreenPuff = (p, t, col = '120,230,120') => { const g = p.g; for (let i = 0; i < 7; i++) { const a = dg(i * 51 + 20), d = 30 + 150 * t, r = (60 + 24 * (i % 3)) * (0.6 + 0.6 * t);
  inkFill(g, ellP(300 + d * Math.cos(a), 500 + d * 0.7 * Math.sin(a), r, r * 0.86, 0, 360, 24), `rgba(${col},${(0.9 * (1 - t)).toFixed(3)})`, 6 * (1 - t)); } };
/** thin rising smoke wisp (candle) */
export const fxWisp = (p, t, k = 1) => { const g = p.g, pts = []; for (let i = 0; i <= 30; i++) { const y = 980 - i * 30, x = 300 + Math.sin(i * 0.35 + t * 6) * (10 + i * 2.2); pts.push([x, y]); }
  pth(g, pts, false); g.lineWidth = 14; g.lineCap = 'round'; g.strokeStyle = `rgba(220,220,230,${(0.55 * k).toFixed(3)})`; g.stroke(); g.lineWidth = 5; g.strokeStyle = `rgba(255,255,255,${(0.5 * k).toFixed(3)})`; g.stroke(); };
/** sparkle star ("ting") */
export const fxTing = (p, t) => { const g = p.g, s = Math.sin(Math.min(1, t) * Math.PI); const pts = []; for (let k = 0; k < 8; k++) { const r = k % 2 ? 22 * s : 110 * s, b = dg(k * 45 - 90); pts.push([300 + r * Math.cos(b), 500 + r * Math.sin(b)]); }
  if (s > 0.02) inkFill(g, pts, '#fff6b0', 5); };
/** a single drop (green or amber) */
export const fxDrop = (p, col = '#4dff6a') => { const g = p.g; const r = g.createRadialGradient(300, 520, 0, 300, 520, 120); r.addColorStop(0, 'rgba(120,255,140,0.55)'); r.addColorStop(1, 'rgba(120,255,140,0)'); g.fillStyle = r; g.fillRect(150, 380, 300, 300);
  inkFill(g, [[300, 420], [336, 500], ...ellP(300, 520, 40, 44, 0, 180, 16), [264, 500]], col, 7); ln(g, [[286, 480], [282, 520]], 6, 'rgba(255,255,255,0.8)'); };
/** shock lines around a head */
export const fxShockLines = (p, t) => { const g = p.g; for (let i = 0; i < 7; i++) { const a = dg(-160 + i * 23), r0 = 150 + 20 * Math.sin(t * 20 + i), r1 = r0 + 60; ln(g, [[300 + r0 * Math.cos(a), 420 + r0 * Math.sin(a)], [300 + r1 * Math.cos(a), 420 + r1 * Math.sin(a)]], 10); } };
/** whisper squiggles (no letters) */
export const fxWhisper = (p, t) => { const g = p.g; for (let k = 0; k < 3; k++) { const pts = []; for (let i = 0; i <= 16; i++) pts.push([200 + i * 12, 450 + k * 40 + Math.sin(i * 1.3 + t * 9 + k) * 9]); ln(g, pts, 6, 'rgba(255,240,200,0.75)'); } };
/** body-glow overlay for the stylised "inner view": green wave -> gold shield */
export const fxInner = (p, t) => { const g = p.g, gr = Math.min(1, t * 2), sh = Math.max(0, t * 2 - 1);
  if (gr > 0 && sh < 1) { const r = g.createRadialGradient(300, 600, 0, 300, 600, 60 + 360 * gr); r.addColorStop(0, `rgba(80,255,110,${0.85 * (1 - sh)})`); r.addColorStop(0.7, `rgba(80,255,110,${0.35 * (1 - sh)})`); r.addColorStop(1, 'rgba(80,255,110,0)'); g.fillStyle = r; g.fillRect(0, 100, 600, 900);
    for (let i = 0; i < 9; i++) { const a = dg(i * 40 + t * 200), d = 200 * gr; dt(g, 300 + d * Math.cos(a), 600 + d * 1.3 * Math.sin(a), 10, `rgba(170,255,170,${0.8 * (1 - sh)})`); } }
  if (sh > 0) { const pts = [[300, 300], [470, 360], [450, 640], [300, 820], [150, 640], [130, 360]], k = 0.5 + 0.5 * sh;
    g.save(); g.translate(300, 560); g.scale(k * 1.15, k * 1.15); g.translate(-300, -560);
    const r = g.createRadialGradient(300, 560, 0, 300, 560, 340); r.addColorStop(0, `rgba(255,220,110,${0.55 * sh})`); r.addColorStop(1, 'rgba(255,220,110,0)'); g.fillStyle = r; g.fillRect(-100, 100, 800, 900);
    inkFill(g, pts, `rgba(255,214,90,${0.35 * sh})`, 0); pth(g, pts); g.lineWidth = 16; g.strokeStyle = `rgba(255,236,150,${sh})`; g.stroke(); g.restore(); } };
/** soft smoke wipe blob (big, light) */
export const fxWipe = (p, t, col = '235,230,220') => { const g = p.g; for (let i = 0; i < 9; i++) { const x = 60 + i * 60, y = 500 + Math.sin(i * 2.1) * 160, r = 180 + (i % 3) * 50;
  const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${col},${0.95 * t})`); gr.addColorStop(1, `rgba(${col},0)`); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); } };
/** flame (candle / torch / oil lamp), w = flicker 0..1, k = size */
export const fxFlame = (p, w = 0.5, k = 1) => { const g = p.g; const r = g.createRadialGradient(300, 520, 0, 300, 520, 260); r.addColorStop(0, `rgba(255,200,110,${0.7 * k})`); r.addColorStop(1, 'rgba(255,170,80,0)'); g.fillStyle = r; g.fillRect(0, 240, 600, 560);
  if (k <= 0.02) return; const h = 150 * k * (0.9 + 0.2 * w), sw = 10 * (w - 0.5);
  inkFill(g, [[300 + sw, 560 - h], [300 + 44 * k, 540], ...ellP(300, 560, 44 * k, 36 * k, 0, 180, 14), [300 - 44 * k, 540]], '#ffb030', 5);
  inkFill(g, [[300 + sw * 0.6, 560 - h * 0.6], [300 + 20 * k, 548], ...ellP(300, 560, 20 * k, 18 * k, 0, 180, 10), [300 - 20 * k, 548]], '#fff4c0', 0); };
