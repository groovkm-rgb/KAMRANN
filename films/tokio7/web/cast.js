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
  sad: { eye: 'dot', brow: 'worry', mouth: 'frown' },
  proud: { eye: 'arc', brow: 'up', mouth: 'smile' },
  focus: { eye: 'dot', brow: 'angry', mouth: 'flat' },
  bowing: { eye: 'closed', brow: 'up', mouth: 'flat' },
  calm: { eye: 'lid', brow: 'flat', mouth: 'smile' },
  determined: { eye: 'lid', brow: 'angry', mouth: 'flat' },
  scared: { eye: 'round', pupil: 0.6, brow: 'worry', mouth: 'grit' },
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
  if (o.lashes && !blink && E.eye !== 'closed' && E.eye !== 'arc') for (const e of eyes) { const sx = e.s; ln(g, [[e.x + sx * 14 * u * e.k, eyeY - 12 * u], [e.x + sx * 26 * u * e.k, eyeY - 22 * u]], 4.5 * u); }
  if (o.glasses) { for (const e of eyes) ln(g, ellP(e.x, eyeY - 3 * u, 30 * u * e.k, 26 * u, 0, 360, 28), 6 * u, o.glasses === true ? CK : o.glasses); ln(g, [[eyes[0].x + 30 * u * eyes[0].k, eyeY - 6 * u], [eyes[1].x - 30 * u * eyes[1].k, eyeY - 6 * u]], 5 * u); }
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
  } else if (st === 'short') {
    const pts = []; for (let i = 0; i <= 24; i++) { const a = dg(200 + 140 * i / 24); pts.push([cx + rx * 1.02 * Math.cos(a), cy + ry * 1.02 * Math.sin(a)]); }
    for (let i = 0; i <= 6; i++) pts.push([cx + rx * 0.9 * (1 - 2 * i / 6), cy - ry * 0.55 + (i % 2) * 8 * u]);
    shaded(g, pts, c, shadeC(c, 0.72), 7 * u);
  } else if (st === 'sides') { // bald top, hair at the sides (under hats)
    for (const s of [-1, 1]) inkFill(g, [[cx + s * rx * 0.98, cy - 40 * u], [cx + s * rx * 1.04, cy + 10 * u], [cx + s * rx * 0.86, cy + 20 * u], [cx + s * rx * 0.82, cy - 30 * u]], c, 6 * u);
  } else if (st === 'bob') {
    const pts = []; for (let i = 0; i <= 30; i++) { const a = dg(170 + 200 * i / 30); pts.push([cx + rx * 1.08 * Math.cos(a), cy + ry * 1.06 * Math.sin(a) - 2 * u]); }
    pts.push([cx + rx * 1.1, cy + 40 * u], [cx + rx * 0.84, cy + 44 * u], [cx + rx * 0.8, cy - 30 * u]);
    for (let i = 0; i <= 8; i++) { const t = i / 8; pts.push([cx + rx * (0.78 - 1.56 * t), cy - 42 * u + Math.abs(t - 0.5) * 30 * u + (i % 2 ? 6 : 0) * u - turn * 6 * u]); }
    pts.push([cx - rx * 0.8, cy - 30 * u], [cx - rx * 0.84, cy + 44 * u], [cx - rx * 1.1, cy + 40 * u]);
    shaded(g, pts, c, shadeC(c, 0.72), 8 * u, [-0.1, -0.12]);
    for (let k = 0; k < 3; k++) ln(g, ellP(cx - 14 * u + k * 22 * u, cy - 40 * u, 60 * u, 50 * u, 232 + k * 6, 292 + k * 6, 10), 3 * u, mix(c, '#ffffff', 0.35));
  } else if (st === 'back') { // seen from behind: hair covers most of the head
    const pts = wob(cx, cy - 6 * u, rx * 1.03, ry * 0.98, 5, 0.02).filter(([x, y]) => y < cy + 46 * u);
    shaded(g, pts, c, shadeC(c, 0.72), 8 * u, [-0.1, -0.12]);
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
      const dome = ellP(cx, top + 40 * u, rx * 1.02, ry * 0.7, 180, 360, 30);
      shaded(g, [...dome, [cx + rx * 1.02, top + 52 * u], [cx - rx * 1.02, top + 52 * u]], c, shadeC(c, 0.74), 8 * u);
      inkFill(g, [[cx - rx * 1.02, top + 34 * u], [cx + rx * 1.02, top + 34 * u], [cx + rx * 1.02, top + 54 * u], [cx - rx * 1.02, top + 54 * u]], b, 5 * u);
      if (!o.back) { inkFill(g, [...ellP(cx + (o.turn || 0) * 30 * u, top + 54 * u, rx * 0.78, 30 * u, 0, 180, 20)], shadeC(c, 0.8), 7 * u);
        inkFill(g, ellP(cx + (o.turn || 0) * 24 * u, top - 4 * u, 17 * u, 15 * u, 0, 360, 16), h.badge || '#ffffff', 4 * u); }
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
function drawProp(g, kind, x, y, side) {
  if (!kind) return;
  if (typeof kind === 'object') { const k = kind;
    if (k.t === 'clipboard') { inkFill(g, [[x - 50, y - 120], [x + 50, y - 120], [x + 50, y + 10], [x - 50, y + 10]], '#a8743e', 6); inkFill(g, [[x - 40, y - 108], [x + 40, y - 108], [x + 40, y], [x - 40, y]], '#ffffff', 3);
      inkFill(g, [[x - 16, y - 130], [x + 16, y - 130], [x + 16, y - 112], [x - 16, y - 112]], '#8a8a96', 3);
      for (let i = 0; i < 4; i++) { const by = y - 96 + i * 24; inkFill(g, [[x - 30, by], [x - 14, by], [x - 14, by + 16], [x - 30, by + 16]], '#ffffff', 3); ln(g, [[x - 6, by + 8], [x + 30, by + 8]], 3, '#b8b8c0'); if (i < (k.n || 0)) ln(g, [[x - 28, by + 6], [x - 22, by + 14], [x - 10, by - 4]], 4.5, '#2a9a4a'); } }
    if (k.t === 'trashbag') { const r = 26 + 40 * (k.fill ?? 0.5); inkFill(g, [...ellP(x, y + 20 + r, r * 0.9, r, 0, 360, 24)], '#eef0f2', 5); inkFill(g, [[x - 10, y - 6], [x + 10, y - 6], [x + 14, y + 24], [x - 14, y + 24]], '#dfe2e6', 4); ln(g, ellP(x, y + 20 + r, r * 0.55, r * 0.7, 200, 300, 8), 3, '#c4c8ce'); }
    if (k.t === 'pointer') { const a = dg(k.a ?? -40), L = k.L || 260; ln(g, [[x, y], [x + side * L * Math.cos(a), y + L * Math.sin(a)]], 7, '#6a4426'); dt(g, x + side * L * Math.cos(a), y + L * Math.sin(a), 6, '#e8e0d0'); }
    return; }
  if (kind === 'flashlight') { const sd = side; inkFill(g, [[x - 14, y - 10], [x + sd * 70, y - 16], [x + sd * 70, y + 14], [x - 14, y + 10]], '#3a3a44', 5); inkFill(g, [[x + sd * 70, y - 22], [x + sd * 86, y - 24], [x + sd * 86, y + 24], [x + sd * 70, y + 20]], '#ffe680', 5); }
  else if (kind === 'phone') { inkFill(g, pill(x - 26, y - 90, x + 26, y, 10), '#22222a', 5); inkFill(g, pill(x - 18, y - 80, x + 18, y - 10, 5), '#7fc8f0', 0); dt(g, x, y - 66, 6, '#ffffff'); }
  else if (kind === 'umbrella') { ln(g, [[x, y + 10], [x, y - 150]], 6); inkFill(g, [[x - 16, y - 40], [x, y - 190], [x + 16, y - 40]], '#2f9aa6', 5); ln(g, ellP(x + side * 14, y + 14, 14, 16, 0, 180, 10), 7); }
  else if (kind === 'suitcase') { ln(g, [[x, y], [x, y + 120]], 7, '#555'); inkFill(g, pill(x - 60, y + 110, x + 60, y + 270, 14), '#b0473e', 7); ln(g, [[x - 60, y + 160], [x + 60, y + 160]], 4); dt(g, x - 40, y + 278, 10); dt(g, x + 40, y + 278, 10); }
  else if (kind === 'briefcase') inkFill(g, pill(x - 56, y + 10, x + 56, y + 90, 10), '#4a3226', 6);
  else if (kind === 'rag') inkFill(g, [[x - 34, y - 20], [x + 30, y - 26], [x + 36, y + 30], [x - 30, y + 36]], '#8ac8e8', 5);
  else if (kind === 'cover') { inkFill(g, [[x - 60, y - 50], [x + 60, y - 50], [x + 64, y + 40], [x - 64, y + 40]], '#ffffff', 5); ln(g, [[x - 50, y + 26], [x + 50, y + 26]], 3, '#d8dce4'); }
  else if (kind === 'mop') { ln(g, [[x, y - 60], [x - side * 40, y + 300]], 8, '#8a6a44'); inkFill(g, [[x - side * 40 - 60, y + 290], [x - side * 40 + 60, y + 290], [x - side * 40 + 70, y + 330], [x - side * 40 - 70, y + 330]], '#8ac8e8', 5); }
  else if (kind === 'pen') ln(g, [[x, y], [x + side * 30, y - 46]], 7, '#3a5acf');
  else if (kind === 'chalk') ln(g, [[x, y], [x + side * 18, y - 22]], 9, '#ffffff');
  else if (kind === 'bag') { inkFill(g, [...ellP(x, y + 52, 40, 44, 0, 360, 24)], '#c99a52', 6); inkFill(g, [[x - 14, y], [x + 14, y], [x + 18, y + 14], [x - 18, y + 14]], '#a87a3a', 5); g.fillStyle = '#3d8f4a'; g.font = 'bold 44px sans-serif'; g.textAlign = 'center'; g.fillText('€', x, y + 70); }
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
    if (t === 'tweed') { for (let x = x0 - 20; x < x1 + 20; x += 16) ln(g, [[x, y0], [x + 4, y1]], 2, 'rgba(40,24,10,.35)'); for (let y = y0; y < y1; y += 16) ln(g, [[x0, y], [x1, y + 3]], 2, 'rgba(255,240,210,.25)');
      for (const sd of [-1, 1]) inkFill(g, [[300 + sd * 10, y0 - 10], [300 + sd * 74, y0 - 10], [300 + sd * 40, y0 + 160]], shadeC(col, 0.85), 5); }
    if (t === 'shirt') inkFill(g, [[300 - 40, y0 - 6], [300 + 40, y0 - 6], [300 + 22, y0 + 150], [300 - 22, y0 + 150]], dc || '#ffffff', 5);
    if (t === 'lapel') for (const sd of [-1, 1]) inkFill(g, [[300 + sd * 8, y0 - 8], [300 + sd * 66, y0 - 8], [300 + sd * 26, y0 + 170]], shadeC(col, 0.82), 5);
    if (t === 'name') inkFill(g, pill(300 + bw * 0.06, y0 + 64, 300 + bw * 0.34, y0 + 92, 6), dc || '#ffffff', 3.5);
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
  if (o.back) { o.expr = 'neutral'; }
  g.save();
  const bob = (o.bob || 0) * 1000; g.translate(0, -bob);
  if (o.tilt) { g.translate(300, 975); g.rotate(dg(o.tilt)); g.translate(-300, -975); }
  const bow = o.bow || 0;
  drawLegs(g, s, o, { y1: s.robe ? 925 : 705 });
  // backpack behind the body
  if (s.backpack && !o.back) inkFill(g, pill(300 - (s.bw || 200) / 2 - 34, 400, 300 + (s.bw || 200) / 2 + 34, 660, 50), shadeC(s.backpack, 0.8), 8);
  g.save(); if (bow) { g.translate(300, 705); g.scale(1, 1 - 0.2 * bow); g.translate(-300, -705); }
  const B = drawBody(g, s, o);
  if (s.backpack && o.back) { inkFill(g, pill(300 - 70, 390, 300 + 70, 640, 40), s.backpack, 8); ln(g, [[240, 470], [360, 470]], 5); }
  if (s.beltbag) { inkFill(g, [...ellP(B.x0 + 4, 690, 34, 40, 0, 360, 20)], '#eef0f2', 5); inkFill(g, [[B.x0 - 8, 646], [B.x0 + 16, 646], [B.x0 + 12, 660], [B.x0 - 4, 660]], '#d4d8de', 3);
    inkFill(g, [[B.x1 - 18, 640], [B.x1 + 14, 636], [B.x1 + 20, 720], [B.x1 - 10, 724]], s.rag || '#8ac8e8', 4.5); }
  g.restore();
  const sY = B.y0 + 48 + bow * 70, shoulders = { '-1': [B.x0 + 16, sY], '1': [B.x1 - 16, sY] };
  const hr = 140 * (s.headScale || 1), H = { cx: 300 + (o.turn || 0) * 8, cy: 276, rx: hr, ry: hr * 0.9, seed: o.seed ?? 3 };
  const armsFront = () => { for (const side of [-1, 1]) {
    const pose = bow > 0.3 && !(side < 0 ? o.L : o.R) ? { x: 300 + side * 30, y: 640, b: 0.8 } : (side < 0 ? o.L : o.R), [sx, sy] = shoulders[side], pts = armPts(sx, sy, side, pose);
    ln(g, pts, 7.5);
    if (s.gloves) inkFill(g, ellP(pts[2][0], pts[2][1], 15, 15, 0, 360, 16), s.gloves, 5); else dt(g, pts[2][0], pts[2][1], 10.5);
    drawProp(g, side < 0 ? o.holdL : o.holdR, pts[2][0], pts[2][1], side);
  } };
  if (o.back) armsFront();
  g.save(); g.translate(0, bow * 120); g.translate(300, 380); g.rotate(dg(o.headTilt || 0)); g.translate(-300, -380);
  if (bow) { g.translate(300, 380); g.scale(1, 1 - 0.12 * bow); g.translate(-300, -380); }
  const hp = wob(H.cx, H.cy, H.rx, H.ry, H.seed);
  shaded(g, hp, HEAD, HEAD_SH, 9.5, [-0.1, -0.06]);
  if (o.back) { if (o.hair) drawHair(g, H, { ...o, hairStyle: 'back' }); }
  else { drawHair(g, H, o); drawFace(g, H, bow > 0.45 ? { ...o, expr: 'bowing' } : o); }
  drawHat(g, H, o);
  g.restore();
  if (!o.back) armsFront();
  g.restore();
};

const CORAL = '#ef5f55', CORAL_D = '#c8463e';
const crew = (x) => ({ body: CORAL, detail: [{ t: 'collar', c: '#ffffff' }, { t: 'buttons', c: '#ffffff' }, 'pocket', { t: 'name' }], hat: { type: 'cap', color: CORAL, band: '#ffffff', badge: '#ffffff' }, gloves: '#ffffff', beltbag: true, legs: '#2b2733', ...x });
export const CREW = {
  leader: crew({ hair: '#2a2228', hairStyle: 'bob', lashes: true, headScale: 1.04, seed: 11 }),
  c1: crew({ hair: '#6a6a72', hairStyle: 'sides', mous: '#6a6a72', seed: 4, bw: 214 }),
  c2: crew({ hair: '#3a2a22', hairStyle: 'bob', lashes: true, seed: 6, bw: 186 }),
  c3: crew({ hair: '#1e1a1e', hairStyle: 'short', seed: 9, bw: 200 }),
  c4: crew({ hair: '#d0d0d4', hairStyle: 'bun', lashes: true, seed: 2, bw: 196 }),
  c5: crew({ hair: '#4a3020', hairStyle: 'mop', seed: 13, bw: 190, headScale: 0.98 }),
  c6: crew({ hair: '#2a2228', hairStyle: 'side', glasses: true, seed: 7, bw: 206 }),
  c7: crew({ hair: '#5a4434', hairStyle: 'bob', lashes: true, seed: 15, bw: 182 }),
};
export const CHIEF = { body: '#2e3f66', detail: ['buttons', 'badge', { t: 'belt', c: '#1e1a24' }, { t: 'collar', c: '#ffffff' }], hat: { type: 'cap', color: '#2e3f66', band: CORAL, badge: '#e8b84a' }, glasses: true, hair: '#8a8a92', hairStyle: 'sides', gloves: '#ffffff', legs: '#22202a', seed: 8 };
export const PAX = {
  suit1: { body: '#3a3f4c', detail: ['shirt', 'lapel', { t: 'tie', c: '#8a2a3a' }], hair: '#1e1a1e', hairStyle: 'short', legs: '#2a2a34', seed: 3 },
  suit2: { body: '#5a6074', detail: ['shirt', 'lapel'], hair: '#5a3a24', hairStyle: 'bob', lashes: true, legs: '#2a2a34', seed: 5, bw: 186 },
  suit3: { body: '#2c3446', detail: ['shirt', 'lapel', { t: 'tie', c: '#3a6ab0' }], hair: '#7a7a82', hairStyle: 'sides', glasses: true, legs: '#22222c', seed: 12 },
  tour1: { body: '#f2b63a', detail: ['straps', 'pocket'], backpack: '#3a7bd5', hair: '#e0b860', hairStyle: 'mop', legs: '#4a6a9a', seed: 1, hat: { type: 'beanie', color: '#d84a4a', band: '#f2f2f2' } },
  tour2: { body: '#46b0a0', detail: ['straps'], backpack: '#e06a3a', hair: '#b84a2a', hairStyle: 'bun', lashes: true, legs: '#3a3a4a', seed: 14, bw: 184 },
  tour3: { body: '#9a5ac8', detail: ['straps'], backpack: '#4a4a54', hair: '#3a2a22', hairStyle: 'side', legs: '#5a6a3a', seed: 10, hat: { type: 'wide', color: '#e0c890', band: '#8a5a2e' } },
  dad: { body: '#5a8ad8', detail: ['collar', 'pocket'], hair: '#2a2228', hairStyle: 'short', legs: '#3a3a48', seed: 16 },
  mom: { body: '#e88a6a', detail: [{ t: 'scarf', c: '#f4e0b0' }], hair: '#4a2a1e', hairStyle: 'bob', lashes: true, legs: '#3a3a48', seed: 17, bw: 184 },
  kid: { body: '#f2d23a', detail: ['pocket'], hair: '#2a2228', hairStyle: 'mop', headScale: 1.08, bw: 170, legs: '#3a6ab0', seed: 18, backpack: '#e0503a' },
  kid2: { body: '#7ac85a', detail: ['stripes'], hair: '#3a2a22', hairStyle: 'bob', lashes: true, headScale: 1.08, bw: 166, legs: '#4a4a5a', seed: 19 },
  opa: { body: '#8a7a5a', detail: ['vest', 'buttons'], hair: '#e8e8ec', hairStyle: 'sides', mous: '#f0f0f2', glasses: true, hat: { type: 'bowler', color: '#5a4a3a' }, legs: '#4a4038', seed: 20 },
  oma: { body: '#9a6ab0', robe: true, detail: [{ t: 'scarf', c: '#f0e0ea' }], hair: '#e4e4ea', hairStyle: 'bun', lashes: true, glasses: true, seed: 21 },
};
export const PROF = { body: '#8a6a44', detail: ['tweed', 'shirt', { t: 'tie', c: '#7a2a2a' }], glasses: true, hair: '#b8b8c0', hairStyle: 'side', goatee: '#b8b8c0', legs: '#3a3228', seed: 22 };
export const STUD = [
  { body: '#4a7ad0', hair: '#2a2228', hairStyle: 'mop', seed: 30 }, { body: '#e0705a', hair: '#6a3a22', hairStyle: 'bob', lashes: true, seed: 31 },
  { body: '#5ab08a', hair: '#e0c070', hairStyle: 'short', seed: 32, glasses: true }, { body: '#c8a040', hair: '#1e1a1e', hairStyle: 'bun', lashes: true, seed: 33 },
  { body: '#8a5ac0', hair: '#4a3020', hairStyle: 'side', seed: 34 }, { body: '#d05a8a', hair: '#2a2228', hairStyle: 'bob', lashes: true, seed: 35 },
  { body: '#3a9ab0', hair: '#9a5a2a', hairStyle: 'mop', seed: 36 }, { body: '#e0a050', hair: '#2a2228', hairStyle: 'short', seed: 37, glasses: true },
];

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
