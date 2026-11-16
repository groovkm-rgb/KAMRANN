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
  proud: { eye: 'closed', brow: 'up', mouth: 'smile' },
  sad: { eye: 'dot', brow: 'worry', mouth: 'frown' },
  tongue: { eye: 'lid', brow: 'angry', mouth: 'tongue' },
};
function drawFace(g, H, o) {
  const { cx, cy, rx } = H, u = rx / 100, turn = o.turn || 0, look = o.look || 0, E = EXPR[o.expr || 'neutral'] || EXPR.neutral;
  const fx = cx + turn * 26 * u, eyeY = cy - 6 * u;
  const blink = (o.blink || 0) > 0.5, eyes = [-1, 1].map((s) => ({ s, x: fx + s * 37 * u * (1 - 0.18 * Math.abs(turn) * (s * turn < 0 ? 1 : 0)), k: 1 - 0.22 * Math.max(0, -s * turn) }));
  // eyes
  for (const e of eyes) {
    const x = e.x, k = e.k, typ = blink || (o.wink && e.s > 0) ? 'closed' : E.eye;
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
  else if (M === 'tongue') { ln(g, [[mx - 18 * u, my + 4 * u], [mx + 18 * u, my + 4 * u]], 7 * u); inkFill(g, [...ellP(mx + 12 * u, my + 10 * u, 10 * u, 14 * u, 0, 180, 12)], '#e8707a', 5 * u); }
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
  if (o.glasses) for (const e of eyes) { g.save(); g.globalAlpha = 0.25; inkFill(g, ellP(e.x, eyeY - 2 * u, 26 * u * e.k, 24 * u, 0, 360, 24), '#cfe6f2', 0); g.restore(); inkFill(g, ellP(e.x, eyeY - 2 * u, 26 * u * e.k, 24 * u, 0, 360, 24), null, 5 * u); }
  if (o.glasses) ln(g, [[eyes[0].x + 24 * u, eyeY - 4 * u], [eyes[1].x - 24 * u, eyeY - 4 * u]], 5 * u);
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
    case 'beanie': {
      shaded(g, [...ellP(cx, top + 34 * u, rx * 1.04, 96 * u, 180, 360, 24)], c, shadeC(c, 0.72), 8 * u);
      inkFill(g, [[cx - rx * 1.06, top + 20 * u], [cx + rx * 1.06, top + 20 * u], [cx + rx * 1.06, top + 46 * u], [cx - rx * 1.06, top + 46 * u]], b, 6 * u);
      inkFill(g, ellP(cx, top - 66 * u, 16 * u, 16 * u), b, 5 * u);
      break;
    }
    case 'bicorne': { // the Kaiser's plumed bicorne (crooked via tilt); plume colours flutter with h.wind
      const w = h.wind || 0;
      // plume: rainbow feathers, drawn behind the hat
      const cols = ['#e8343a', '#f2a93a', '#f4dc4a', '#4ab06a', '#3a8ae0', '#9a5ad8'];
      cols.forEach((pc, i) => { const a = dg(-120 + i * 13 + w * 10), L = (120 + (i % 2) * 18) * u, bx = cx - 28 * u + i * 4 * u, by = top - 58 * u;
        const tx = bx + Math.cos(a) * L, ty = by + Math.sin(a) * L, mx = (bx + tx) / 2 + w * 14 * u, my = (by + ty) / 2;
        inkFill(g, [[bx, by], [mx - 16 * u, my - 4 * u], [tx, ty], [mx + 16 * u, my + 8 * u]], pc, 5 * u); });
      // body of the bicorne: wide crescent
      const pts = [...ellP(cx, top + 18 * u, 150 * u, 86 * u, 180, 360, 30), [cx + 150 * u, top + 18 * u], [cx + 120 * u, top + 30 * u], [cx - 120 * u, top + 30 * u]];
      shaded(g, pts, c, shadeC(c, 0.62), 8 * u);
      ln(g, ellP(cx, top + 22 * u, 140 * u, 76 * u, 196, 344, 26), 7 * u, '#e8b84a');
      // cockade
      inkFill(g, ellP(cx + 40 * u, top - 22 * u, 20 * u, 20 * u, 0, 360, 20), '#e8343a', 4 * u);
      inkFill(g, ellP(cx + 40 * u, top - 22 * u, 9 * u, 9 * u, 0, 360, 14), '#f4f0e6', 3 * u);
      // patch on the hat
      inkFill(g, [[cx - 92 * u, top - 4 * u], [cx - 60 * u, top - 8 * u], [cx - 58 * u, top + 16 * u], [cx - 92 * u, top + 18 * u]], '#4a5a8a', 3 * u);
      for (let k = 0; k < 4; k++) ln(g, [[cx - 88 * u + k * 8 * u, top - 8 * u], [cx - 84 * u + k * 8 * u, top - 1 * u]], 2 * u, '#e8d6a0');
      break;
    }
  }
  g.restore();
}

// ---------- body, arms, legs ----------
const ARM = { // hand target relative to the shoulder (screen x positive = outward on that side)
  hang: [34, 190, 1], hip: [-6, 150, 2.2], wave: [80, -170, 1], point: [200, 0, 0.3], reach: [140, 70, 0.6], up: [60, -210, 0.6],
  cross: [-70, 120, -0.5], belly: [-40, 130, 1.4], chin: [-60, -60, 1.6], thumb: [90, 30, 1], wheel: [120, 50, 0.8], forward: [60, 110, 0.4],
  salute: [-10, -170, 1.8], cane: [90, 170, 0.6], hat: [-20, -230, 1.2], hold: [-40, 70, 1.2],
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
  if (kind === 'bag') { inkFill(g, [...ellP(x, y + 52, 40, 44, 0, 360, 24)], '#c99a52', 6); inkFill(g, [[x - 14, y], [x + 14, y], [x + 18, y + 14], [x - 18, y + 14]], '#a87a3a', 5); g.fillStyle = '#3d8f4a'; g.font = 'bold 44px sans-serif'; g.textAlign = 'center'; g.fillText('$', x, y + 70); }
  else if (kind === 'paper') { inkFill(g, [[x - 10, y - 70], [x + 70 * side, y - 80], [x + 76 * side, y + 20], [x - 4, y + 30]], '#f4ead2', 5); for (let k = 0; k < 4; k++) ln(g, [[x + 6 * side, y - 50 + k * 18], [x + 58 * side, y - 56 + k * 18]], 3, '#9a8a70'); }
  else if (kind === 'book') { inkFill(g, [[x - 50, y - 30], [x + 50, y - 30], [x + 50, y + 40], [x - 50, y + 40]], '#8a2f3a', 6); ln(g, [[x, y - 30], [x, y + 40]], 4); }
  else if (kind === 'mug') { inkFill(g, [[x - 22, y - 40], [x + 22, y - 40], [x + 20, y + 14], [x - 20, y + 14]], '#e8d6a0', 6); inkFill(g, ellP(x, y - 40, 22, 8), '#ffffff', 4); }
  else if (kind === 'hammer') { ln(g, [[x, y + 50], [x, y - 70]], 12, '#8a5a34'); ln(g, [[x, y + 50], [x, y - 70]], 3); inkFill(g, [[x - 34, y - 90], [x + 30, y - 90], [x + 30, y - 60], [x - 34, y - 60]], '#7a7a86', 6); }
  else if (kind === 'key') { inkFill(g, ellP(x, y - 24, 16, 16), '#e0b040', 5); ln(g, [[x, y - 8], [x, y + 50], [x + 14 * side, y + 50], [x, y + 36], [x + 12 * side, y + 36]], 7, '#e0b040'); }
  else if (kind === 'cane') { ln(g, [[x + 6 * side, y - 40], [x - 2 * side, y + 300]], 14); ln(g, [[x + 6 * side, y - 40], [x - 2 * side, y + 300]], 8, '#5a3420'); inkFill(g, ellP(x + 6 * side, y - 46, 16, 14, 0, 360, 16), '#e8b84a', 4); inkFill(g, ellP(x - 2 * side, y + 300, 8, 6, 0, 360, 10), '#e8b84a', 3); }
  else if (kind === 'caneUp') { ln(g, [[x, y + 40], [x + 220 * side, y - 140]], 14); ln(g, [[x, y + 40], [x + 220 * side, y - 140]], 8, '#5a3420'); inkFill(g, ellP(x + 220 * side, y - 140, 14, 14, 0, 360, 14), '#e8b84a', 4); }
  else if (kind === 'quill') { inkFill(g, [[x, y + 10], [x + 30 * side, y - 90], [x + 60 * side, y - 140], [x + 46 * side, y - 70], [x + 8 * side, y + 6]], '#f4f0e6', 4); ln(g, [[x, y + 10], [x - 6 * side, y + 34]], 5); }
  else if (kind === 'whistle') { inkFill(g, [[x - 18, y - 12], [x + 18, y - 12], [x + 22, y + 10], [x - 18, y + 10]], '#c8c8d0', 4); }
  else if (kind === 'flowers') { ln(g, [[x, y + 10], [x + 10 * side, y - 70]], 6, '#3f8a4e'); for (let k = 0; k < 5; k++) inkFill(g, ellP(x + 10 * side + Math.cos(k * 1.3) * 26, y - 80 + Math.sin(k * 1.3) * 22, 14, 14, 0, 360, 12), ['#e8343a', '#f4dc4a', '#e86aa0', '#f4f0e6', '#e8343a'][k], 3); }
  else if (kind === 'umbrella') { ln(g, [[x, y + 20], [x + 30 * side, y - 200]], 7); inkFill(g, [...ellP(x + 30 * side, y - 200, 110, 70, 180, 360, 20)], '#8a3a6a', 6); }
  else if (kind === 'newspaper') { inkFill(g, [[x - 50, y - 90], [x + 60, y - 100], [x + 66, y + 20], [x - 46, y + 30]], '#f2ead2', 5); for (let k = 0; k < 4; k++) ln(g, [[x - 36, y - 60 + k * 22], [x + 50, y - 68 + k * 22]], 4, '#6a6050'); ln(g, [[x - 36, y - 76], [x + 50, y - 84]], 9, '#2a2420'); }
  else if (kind === 'bill') { inkFill(g, [[x - 10, y - 50], [x + 100 * side, y - 56], [x + 102 * side, y], [x - 8, y + 6]], '#cfe2b8', 5); inkFill(g, ellP(x + 46 * side, y - 24, 16, 16, 0, 360, 14), '#e8b84a', 3); }
  else if (kind === 'jar') { inkFill(g, [[x - 34, y - 70], [x + 34, y - 70], [x + 38, y + 30], [x - 38, y + 30]], 'rgba(220,240,255,0.7)', 5); for (let k = 0; k < 8; k++) dt(g, x - 22 + (k % 4) * 15, y - 30 + Math.floor(k / 4) * 28, 9, ['#e8343a', '#f4dc4a', '#4ab06a', '#e86aa0'][k % 4]); inkFill(g, [[x - 38, y - 86], [x + 38, y - 86], [x + 38, y - 68], [x - 38, y - 68]], '#c8873e', 4); }
}
const PANT = '#2b2733';
/** rim light: a warm/cool light edge inside the outline on one side (o.rim colour, o.rimSide -1|1) */
const rimLight = (g, pts, o, w = 30) => { if (!o.rim) return; const xs = pts.map((p) => p[0]), x0 = Math.min(...xs), x1 = Math.max(...xs), sd = o.rimSide || 1;
  const gr = g.createLinearGradient(sd > 0 ? x0 + (x1 - x0) * 0.45 : x1 - (x1 - x0) * 0.45, 0, sd > 0 ? x1 : x0, 0); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(0.55, o.rim + '00'); gr.addColorStop(1, o.rim);
  g.save(); pth(g, pts); g.clip(); g.globalAlpha = o.rimK ?? 0.9; pth(g, pts); g.lineWidth = w; g.strokeStyle = gr; g.stroke(); g.restore(); inkFill(g, pts, null, 9); };
function drawBody(g, s, o) {
  const bw = s.bw || 200, y0 = 352, y1 = s.robe ? 925 : 705, x0 = 300 - bw / 2, x1 = 300 + bw / 2, col = s.body || '#d8483a', sh = coolShade(col);
  const flare = s.robe ? 26 : 0, pts = pill(x0, y0, x1, y1, Math.min(90, bw * 0.46), flare);
  if (s.cape) inkFill(g, [[x0 - 6, y0 + 30], [x1 + 6, y0 + 30], [x1 + 46, 930], [x1 + 30, 960], [x0 - 30, 960], [x0 - 46, 930]], s.cape, 8);
  // scabbard behind the body (sword is ALWAYS sheathed)
  // scabbard behind the body (sword is ALWAYS sheathed)
  if (s.sabre) { const sw = o.sway || 0, hx = x0 + 6, hy = y1 - 64, tx = x0 - 64 + sw * 14, ty = 900;
    inkFill(g, [[hx + 8, hy - 6], [hx - 8, hy + 10], [tx - 8, ty + 4], [tx + 6, ty + 16]], '#2a2230', 7);
    inkFill(g, [[tx - 8, ty + 4], [tx + 6, ty + 16], [tx - 6, ty + 30]], '#e8b84a', 4);
    for (const k of [0.25, 0.6]) { const x = hx + (tx - hx) * k, y = hy + (ty - hy) * k; ln(g, [[x - 12, y - 2], [x + 10, y + 8]], 7, '#e8b84a'); } }
  shaded(g, pts, col, sh, 9);
  g.save(); pth(g, pts); g.clip();
  for (const d of s.detail || []) {
    const t = typeof d === 'string' ? d : d.t, dc = (typeof d === 'object' && d.c) || null;
    if (t === 'belt') { const y = y1 - 70; inkFill(g, [[x0 - 5, y], [x1 + 5, y], [x1 + 5, y + 26], [x0 - 5, y + 26]], dc || '#3a2a24', 5); inkFill(g, [[286, y - 3], [314, y - 3], [314, y + 29], [286, y + 29]], '#e2b84c', 4); }
    if (t === 'ammo') { const y = y1 - 72; inkFill(g, [[x0 - 5, y], [x1 + 5, y], [x1 + 5, y + 28], [x0 - 5, y + 28]], '#3a2a24', 5); for (let x = x0 + 14; x < 300; x += 15) inkFill(g, [[x, y - 14], [x + 9, y - 14], [x + 9, y + 10], [x, y + 10]], '#e2b84c', 2.5); }
    if (t === 'buttons') for (let k = 0; k < 3; k++) inkFill(g, ellP(300, y0 + 90 + k * 60, 8, 8, 0, 360, 12), dc || '#f2e6c8', 3);
    if (t === 'gbuttons') for (let k = 0; k < 4; k++) for (const sd of [-1, 1]) inkFill(g, ellP(300 + sd * 30, y0 + 70 + k * 58, 9, 9, 0, 360, 12), '#f2c84a', 3);
    if (t === 'collar') { inkFill(g, [[300 - 46, y0 - 4], [300, y0 + 46], [300 + 46, y0 - 4]], dc || '#ffffff', 6); }
    if (t === 'tie') inkFill(g, [[292, y0 + 10], [308, y0 + 10], [316, y0 + 150], [300, y0 + 172], [284, y0 + 150]], dc || '#2b2a50', 5);
    if (t === 'vest') for (const sd of [-1, 1]) inkFill(g, [[300 + sd * 12, y0 - 10], [300 + sd * (bw / 2 + 10), y0 - 10], [300 + sd * (bw / 2 + 10), y1 + 10], [300 + sd * 20, y1 + 10], [300 + sd * 20, y0 + 120]], dc || '#3c8a8c', 6);
    if (t === 'lapels') for (const sd of [-1, 1]) inkFill(g, [[300 + sd * 6, y0 - 10], [300 + sd * 70, y0 - 10], [300 + sd * 24, y0 + 190], [300 + sd * 6, y0 + 190]], dc || '#14121a', 5);
    if (t === 'apron') { inkFill(g, pill(300 - bw * 0.36, y0 + 110, 300 + bw * 0.36, y1 + 20, 30), dc || '#c8873e', 6); ln(g, [[300 - bw * 0.2, y0 + 210], [300 + bw * 0.2, y0 + 210]], 4); ln(g, [[300 - bw * 0.36, y0 + 110], [300 - bw * 0.5, y0 + 20]], 5); ln(g, [[300 + bw * 0.36, y0 + 110], [300 + bw * 0.5, y0 + 20]], 5); }
    if (t === 'stripes') for (const sd of [-1, 1]) { inkFill(g, [[300 + sd * 30, y0 - 10], [300 + sd * 54, y0 - 10], [300 + sd * 54, y1 + 10], [300 + sd * 30, y1 + 10]], dc || '#e8c048', 4); }
    if (t === 'fringe') for (let x = x0 + 20; x < x1 - 14; x += 18) ln(g, [[x, y0 + 52], [x + 2, y0 + 82]], 6, dc || '#f6efe0');
    if (t === 'seatbelt') { ln(g, [[x1 + 10, y0 + 10], [x0 + 30, y1 - 40]], 22, '#3c3c46'); ln(g, [[x1 + 10, y0 + 10], [x0 + 30, y1 - 40]], 3, '#9a9aa8'); }
    if (t === 'straps') for (const sd of [-1, 1]) ln(g, [[300 + sd * 50, y0 - 10], [300 + sd * 40, y1]], 12, dc || '#2c2a38');
    if (t === 'badge') inkFill(g, Array.from({ length: 10 }, (_, i) => { const a = dg(-90 + i * 36), r = i % 2 ? 9 : 22; return [300 - bw * 0.22 + r * Math.cos(a), y0 + 80 + r * Math.sin(a)]; }), '#e8b84a', 3);
    if (t === 'scarf') inkFill(g, [[300 - 54, y0 - 6], [300 + 54, y0 - 6], [300 + 10, y0 + 70]], dc || '#d03a34', 6);
    if (t === 'pocket') inkFill(g, pill(300 + bw * 0.08, y0 + 70, 300 + bw * 0.34, y0 + 120, 8), shadeC(col, 0.9), 4);
    if (t === 'trim') { ln(g, [[x0 - 30, y1 - 12], [x1 + 30, y1 - 12]], 14, dc || '#e8c048'); }
    if (t === 'patch') { const px = 300 + (d.x || 50), py = y0 + (d.y || 230); inkFill(g, [[px - 24, py - 20], [px + 22, py - 24], [px + 26, py + 20], [px - 22, py + 22]], dc || '#5a6a9a', 4); ln(g, [[px - 20, py - 14], [px - 14, py - 20]], 3, '#e8d6a0'); ln(g, [[px + 16, py + 18], [px + 22, py + 12]], 3, '#e8d6a0'); }
    if (t === 'sash') { ln(g, [[x0 + 10, y0 + 6], [x1 - 6, y1 - 90]], 26, '#c8343a'); ln(g, [[x0 + 10, y0 + 6], [x1 - 6, y1 - 90]], 4, '#e8b84a'); }
    if (t === 'chain') ln(g, [[300 + 20, y0 + 150], [300 + 60, y0 + 175], [300 + 90, y0 + 150]], 5, '#e8b84a');
  }
  g.restore(); inkFill(g, pts, null, 0); rimLight(g, pts, o, 40);
  if (s.sabre) { const hx = x0 + 6, hy = y1 - 64; ln(g, [[hx + 14, hy - 10], [hx + 30, hy - 60]], 12); ln(g, [[hx + 14, hy - 10], [hx + 30, hy - 60]], 6, '#3a2a24');
    ln(g, [[hx - 6, hy + 2], [hx + 26, hy - 18], [hx + 36, hy - 56]], 7, '#e8b84a'); inkFill(g, ellP(hx + 32, hy - 64, 9, 9, 0, 360, 12), '#e8b84a', 3);
    const ch = o.chain || 0; ln(g, [[hx + 10, hy - 4], [hx + 40 + ch * 6, hy + 22], [x0 + 70, y1 - 58]], 4, '#f2d070'); }
  // epaulettes ride on top of the shoulder outline
  if (s.epaulettes) for (const sd of [-1, 1]) {
    const ex = sd < 0 ? x0 + 22 : x1 - 22, ey = y0 + 26;
    inkFill(g, ellP(ex, ey, 56, 24, 0, 360, 24), '#f2c43a', 6);
    for (let k = 0; k < 7; k++) ln(g, [[ex - 46 + k * 15, ey + 18], [ex - 48 + k * 15 + sd * 2, ey + 52]], 6, '#e2a82a');
    ln(g, ellP(ex - 8, ey - 6, 30, 10, 200, 330, 10), 4, '#fff2b0');
  }
  return { y0, y1, x0, x1 };
}
function drawLegs(g, s, o, B) {
  const legs = o.legs || 'stand', st = o.step || 0, hipY = B.y1 - 14, c = s.legs || null;
  const L = (pts) => { if (c) { ln(g, pts, 18); ln(g, pts, 9, c); } else ln(g, pts, 8); };
  const boot = (pts) => { if (!s.boots) return; const [x, y] = pts[pts.length - 2], [x2, y2] = pts[pts.length - 1]; inkFill(g, [[x - 14, y - 50], [x + 14, y - 50], [x2 + 12, y2 - 14], [x2 + 12, y2 + 6], [x - 16, y2 + 6]], s.boots, 5); if (s.bootHole && x2 > x) dt(g, x2 + 4, y2 - 4, 5, '#fbfaf7'); };
  if (s.robe) { for (const sd of [-1, 1]) ln(g, [[300 + sd * 40, 925], [300 + sd * 44, 968], [300 + sd * 64, 968]], 8); return; }
  for (const sd of [-1, 1]) {
    const hx = 300 + sd * 36; let pts;
    if (legs === 'sit') pts = [[hx, hipY], [hx + sd * 26, hipY + 70], [hx + sd * 30, hipY + 200], [hx + sd * 52, hipY + 200]];
    else if (legs === 'crouch') pts = [[hx, hipY], [hx + sd * 90, hipY + 100], [hx + sd * 60, 968], [hx + sd * 82, 968]];
    else { const sw = legs === 'walk' ? Math.sin(st * Math.PI * 2 + (sd > 0 ? 0 : Math.PI)) * 34 : 0, lift = legs === 'walk' ? Math.max(0, Math.sin(st * Math.PI * 2 + (sd > 0 ? 0 : Math.PI))) * 18 : 0;
      pts = [[hx, hipY], [hx + sd * 8 + sw * 0.5, (hipY + 968) / 2 - lift * 0.3], [hx + sd * 10 + sw, 968 - lift], [hx + sd * 32 + sw, 968 - lift]]; }
    L(pts); boot(pts);
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
  const noHat = o.hatOff;
  g.save(); g.translate(300, 380); g.rotate(dg(o.headTilt || 0)); g.translate(-300, -380);
  if (s.helm) { shaded(g, wob(H.cx, H.cy + 6, H.rx * 1.16, H.ry * 1.2, 7, 0.01), s.helm, shadeC(s.helm, 0.66), 9); }
  const hp = s.helm ? wob(H.cx + (o.turn || 0) * 18, H.cy + 16, H.rx * 0.8, H.ry * 0.82, H.seed, 0.02) : wob(H.cx, H.cy, H.rx, H.ry, H.seed);
  shaded(g, hp, HEAD, HEAD_SH, 9.5, [-0.1, -0.06]); rimLight(g, hp, o, 34);
  if (s.helm) { inkFill(g, [[H.cx - 70, H.cy - 92], [H.cx + 96, H.cy - 104], [H.cx + 110, H.cy - 70], [H.cx - 60, H.cy - 64]], shadeC(s.helm, 1.08), 7); }
  const HH = s.helm ? { ...H, cy: H.cy + 16, rx: H.rx * 0.82, ry: H.ry * 0.82 } : H;
  if (!s.helm) drawHair(g, H, o);
  drawFace(g, HH, o);
  if (!noHat) drawHat(g, H, o);
  g.restore();
  for (const side of [-1, 1]) {
    const pose = side < 0 ? o.L : o.R, [sx, sy] = shoulders[side], pts = armPts(sx, sy, side, pose);
    ln(g, pts, 7.5); dt(g, pts[2][0], pts[2][1], 10.5);
    if (o.hatInHand === side) { const [hx, hy] = pts[2]; g.save(); g.translate(hx, hy + 40); g.scale(0.55, 0.55); g.translate(-300, -150); drawHat(g, { cx: 300, cy: 276, rx: 140, ry: 126 }, { hat: s.hat }); g.restore(); }
    drawProp(g, side < 0 ? o.holdL : o.holdR, pts[2][0], pts[2][1], side);
  }
  g.restore();
};

/** cast for "Der Kaiser von Amerika" (invented cartoon characters) */
const KAISER_HAT = { type: 'bicorne', color: '#1e2a5a', tilt: -12 };
export const CAST = {
  kaiser: { body: '#24346e', bw: 232, detail: ['gbuttons', 'belt', { t: 'patch', x: 54, y: 250, c: '#3a4a86' }, { t: 'patch', x: -60, y: 120, c: '#2e3e7a' }, 'sash'], epaulettes: true, sabre: true,
    legs: '#1a2248', boots: '#1a1416', bootHole: true, hair: '#6a6a72', hairStyle: 'sides', beard: '#7a7680', mous: '#5e5a64', mousStyle: 'handle', hat: KAISER_HAT },
  rich: { body: '#16141c', bw: 214, detail: ['collar', { t: 'tie', c: '#a8283a' }, 'lapels', 'chain'], legs: '#16141c', boots: '#0e0c10',
    hair: '#4a3a32', hairStyle: 'sides', mous: '#4a3a32', mousStyle: 'handle', hat: { type: 'top', color: '#121016', band: '#5a2a3a' } },
  editor: { body: '#f2ecd8', detail: [{ t: 'vest', c: '#5a6a4a' }, 'collar', { t: 'tie', c: '#3a2a2a' }, { t: 'patch', x: -40, y: 260, c: '#2a2a40' }], legs: '#3a3440', hair: '#3a2a22', hairStyle: 'side', glasses: true },
  grocer: { body: '#e8a85a', bw: 250, detail: [{ t: 'apron', c: '#f4f0e6' }, 'belt'], legs: '#3a3440', hair: '#3a2a22', hairStyle: 'sides', mous: '#3a2a22', mousStyle: 'brush', hat: { type: 'bowler', color: '#5a3a2a' } },
  copGruff: { body: '#26325e', bw: 226, detail: ['buttons', 'badge', 'belt'], legs: '#1a2240', hair: '#2a2228', hairStyle: 'sides', mous: '#2a2228', mousStyle: 'brush', hat: { type: 'bowler', color: '#1c2244' } },
  copYoung: { body: '#2e3c70', bw: 180, detail: ['buttons', 'badge', 'belt'], legs: '#1a2240', hair: '#c88a3a', hairStyle: 'mop', hat: { type: 'bowler', color: '#1c2244' } },
  lady: { body: '#b0407a', robe: true, detail: [{ t: 'trim', c: '#f4e0ea' }, { t: 'scarf', c: '#f4e0ea' }], hair: '#7a3a22', hairStyle: 'bun', hat: { type: 'bowler', color: '#6a2a5a' } },
  boy: { body: '#e8c43a', bw: 160, detail: [{ t: 'straps', c: '#5a3a24' }], hair: '#a85a2a', hairStyle: 'mop', headScale: 1.05, hat: { type: 'flatcap', color: '#6a5a4a', stripes: '#8a7a6a' } },
  girl: { body: '#e86a6a', robe: true, bw: 160, detail: [{ t: 'apron', c: '#f4f0e6' }], hair: '#e8b84a', hairStyle: 'bun', headScale: 1.05 },
  worker: { body: '#3f8fd0', detail: ['straps', 'pocket'], hair: '#6a4024', hairStyle: 'mop', hat: { type: 'flatcap', color: '#4a5a8a', stripes: '#c8d4ee' } },
  miner: { body: '#c8783a', detail: [{ t: 'straps', c: '#3a2a24' }, 'scarf'], hair: '#3a2a22', hairStyle: 'sides', beard: '#5a3a24', hat: { type: 'wide', color: '#8a6a4a', band: '#3a2a22' } },
  sailor: { body: '#f4f0e6', detail: [{ t: 'stripes', c: '#2e4a9a' }, { t: 'scarf', c: '#2e4a9a' }], hair: '#3a2a22', hairStyle: 'short', hat: { type: 'beanie', color: '#2e4a9a', band: '#f4f0e6' } },
  driver: { body: '#5a8a4a', detail: ['vest', 'scarf'], hair: '#6a4024', hairStyle: 'sides', mous: '#6a4024', hat: { type: 'top', color: '#3a2a22', band: '#8a6a4a' } },
  gent: { body: '#6a4a3a', detail: ['collar', 'tie', 'vest'], hair: '#9a9aa4', hairStyle: 'sides', mous: '#9a9aa4', mousStyle: 'handle', hat: { type: 'top', color: '#2a2228' } },
  pol1: { body: '#2a2a32', detail: ['collar', { t: 'tie', c: '#6a2a2a' }, 'lapels'], hair: '#8a8a92', hairStyle: 'sides', mous: '#8a8a92' },
  pol2: { body: '#3a3428', detail: ['collar', { t: 'tie', c: '#2a3a6a' }, 'lapels'], hair: '#3a2a22', hairStyle: 'short', beard: '#3a2a22' },
  pol3: { body: '#2a3040', detail: ['collar', 'tie', 'lapels', 'chain'], hair: '#c8c8cc', hairStyle: 'bald', mous: '#c8c8cc', mousStyle: 'handle' },
};

// ---------- extra fx ----------
/** soft floating dust / sparkle mote (use many, small) */
export const fxMote = (p, t, col = '255,250,230') => { const g = p.g, a = Math.sin(t * Math.PI); const r = g.createRadialGradient(300, 500, 0, 300, 500, 60); r.addColorStop(0, `rgba(${col},${0.95 * a})`); r.addColorStop(1, `rgba(${col},0)`); g.fillStyle = r; g.fillRect(200, 400, 200, 200); };
/** glow halo for lamps, buttons, headlights (draw as additive-looking card) */
export const fxGlow = (p, col = '255,214,140', k = 1) => { const g = p.g, r = g.createRadialGradient(300, 500, 0, 300, 500, 290); r.addColorStop(0, `rgba(${col},${0.9 * k})`); r.addColorStop(0.25, `rgba(${col},${0.45 * k})`); r.addColorStop(1, `rgba(${col},0)`); g.fillStyle = r; g.fillRect(0, 200, 600, 600); };
/** a confetti flake */
export const fxConfetti = (p, i, t) => { const g = p.g, cols = ['#e8343a', '#f4dc4a', '#3a8ae0', '#4ab06a', '#e86aa0', '#f4f0e6']; g.save(); g.translate(300, 500); g.rotate(t * 9 + i); g.scale(1, Math.abs(Math.cos(t * 7 + i))); g.fillStyle = cols[i % 6]; g.fillRect(-70, -40, 140, 80); g.restore(); };
/** a single drifting feather (the Kaiser's plume) */
export const fxFeather = (p, col = '#e8343a', sway = 0) => { const g = p.g; g.save(); g.translate(300, 500); g.rotate(sway); inkFill(g, [[0, 260], [-70, 60], [-40, -160], [0, -260], [40, -160], [70, 60]], col, 10); ln(g, [[0, 280], [0, -240]], 8); for (let k = 0; k < 6; k++) { ln(g, [[0, 180 - k * 70], [-50, 140 - k * 70]], 4, '#ffffff'); ln(g, [[0, 180 - k * 70], [50, 140 - k * 70]], 4, '#ffffff'); } g.restore(); };
/** a cartoon seagull, wings flapping with t (0..1) */
export const fxGull = (p, t) => { const g = p.g, w = Math.sin(t * Math.PI * 2) * 60; inkFill(g, ellP(300, 500, 70, 34, 0, 360, 20), '#f8f8f4', 10); ln(g, [[300, 500], [180, 470 - w], [60, 500 - w * 1.4]], 22); ln(g, [[300, 500], [420, 470 - w], [540, 500 - w * 1.4]], 22); ln(g, [[300, 500], [180, 470 - w], [60, 500 - w * 1.4]], 12, '#f8f8f4'); ln(g, [[300, 500], [420, 470 - w], [540, 500 - w * 1.4]], 12, '#f8f8f4'); inkFill(g, [[362, 492], [400, 500], [362, 508]], '#f2a93a', 5); dt(g, 340, 492, 6); };
export const fxDust = (p, k, col = "#e8dcc4") => {
  const g = p.g; g.save(); g.globalAlpha = Math.max(0, 1 - k * k);
  for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2, r = 90 + 150 * k; p.ell(300 + Math.cos(a) * r, 520 + Math.sin(a) * r * 0.6, 120 + 60 * k, 100 + 50 * k, col, 12); }
  p.ell(300, 520, 170 + 110 * k, 140 + 80 * k, col, 0);
  g.restore();
};
/** draw only a hat (lying on the ground or on a coffin cart); centre of the canvas */
export const toonHat = (p, spec, o = {}) => { const g = p.g; g.save(); g.translate(300, 820); g.rotate(dg(o.rot || 0)); g.translate(-300, -820); drawHat(g, { cx: 300, cy: 900, rx: 140, ry: 126 }, { hat: { ...(typeof spec === 'string' ? CAST[spec] : spec).hat, ...(o.hat || {}) } }); g.restore(); };
/** a held paper / decree with a German heading (title), lines below */
export const toonDecree = (p, title, o = {}) => { const g = p.g, w = o.w || 380, h = o.h || 300, x = 300 - w / 2, y = 500 - h / 2; g.save(); g.translate(300, 500); g.rotate(dg(o.rot || 0)); g.translate(-300, -500);
  inkFill(g, [[x, y], [x + w, y - 8], [x + w + 6, y + h], [x - 4, y + h + 6]], '#f4ead2', 7); ln(g, [[x + 6, y + 18], [x + w - 6, y + 12]], 3, '#c8a46a');
  g.fillStyle = '#2a1a14'; g.textAlign = 'center'; g.textBaseline = 'middle'; const lines = title.split('\n'); const fs = o.fs || 62; g.font = `bold ${fs}px "DejaVu Serif", Georgia, serif`;
  lines.forEach((t, i) => g.fillText(t, 300, y + 30 + fs * 0.6 + i * fs * 1.1));
  const ly = y + 40 + lines.length * fs * 1.1; for (let k = 0; k < 3; k++) ln(g, [[x + 40, ly + k * 34], [x + w - 40 - (k === 2 ? 90 : 0), ly + k * 34 - 2]], 5, '#8a7a60');
  if (o.seal) { inkFill(g, ellP(x + w - 50, y + h - 40, 26, 26, 0, 360, 20), '#b8202a', 4); } g.restore(); };
/** a banknote "Kaiserliches Geld" */
export const toonBill = (p, o = {}) => { const g = p.g, w = 420, h = 200, x = 300 - w / 2, y = 500 - h / 2; g.save(); g.translate(300, 500); g.rotate(dg(o.rot || 0)); g.translate(-300, -500);
  inkFill(g, [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], '#cfe2b8', 6); g.strokeStyle = '#2e5a3a'; g.lineWidth = 4; g.strokeRect(x + 12, y + 12, w - 24, h - 24);
  inkFill(g, ellP(x + 70, y + h / 2, 42, 52, 0, 360, 20), '#e8d8a0', 4); inkFill(g, ellP(x + 70, y + h / 2 - 12, 44, 18, 180, 360, 14), '#2e5a3a', 3);
  g.fillStyle = '#2e5a3a'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = 'bold 34px "DejaVu Serif", Georgia, serif'; g.fillText('Kaiserliches', x + 260, y + 70); g.fillText('Geld', x + 260, y + 112);
  g.font = 'bold 40px "DejaVu Serif", serif'; g.fillText('50', x + w - 44, y + h - 34); if (o.glow) { g.globalAlpha = 0.35; g.fillStyle = '#fff6c8'; g.fillRect(x, y, w, h); } g.restore(); };
/** a small scruffy dog (barking when bark=1) */
export const toonDog = (p, o = {}) => { const g = p.g, b = o.bark ? 1 : 0; g.save(); g.translate(0, 300);
  inkFill(g, ellP(300, 520, 110, 60, 0, 360, 24), '#c8925a', 8); for (const x of [220, 260, 340, 380]) ln(g, [[x, 560], [x + (o.step || 0) * 10, 650]], 10);
  ln(g, [[400, 500], [430 + Math.sin(o.wag || 0) * 20, 430]], 10); inkFill(g, ellP(200, 450, 64, 56, 0, 360, 20), '#c8925a', 8); inkFill(g, [[160, 420], [140, 360], [190, 400]], '#8a5a3a', 6);
  dt(g, 185, 440, 8); inkFill(g, ellP(145, 470, 22, 16, 0, 360, 12), '#c8925a', 6); dt(g, 125, 465, 8);
  if (b) { inkFill(g, [[130, 485], [170, 485], [150, 520]], '#4a1c24', 5); for (let k = 0; k < 3; k++) ln(g, [[90 - k * 10, 440 + k * 30], [60 - k * 20, 430 + k * 34]], 6); } g.restore(); };
/** stamp hand: a stick arm holding a brass seal stamp (for close inserts) */
export const toonWave = (p, k = 1, col = '255,255,255') => { const g = p.g; g.save(); g.globalAlpha = k; for (let i = 0; i < 3; i++) { g.strokeStyle = `rgba(${col},${0.8 - i * 0.2})`; g.lineWidth = 14 - i * 3; g.beginPath(); g.arc(300, 500, 120 + i * 60, -0.6, 0.6); g.stroke(); } g.restore(); };
/** 4-point glint star at the card centre (t: 0..1 pops and fades) */
export const fxSpark = (p, t, col = '#fff6c8') => { const g = p.g, k = Math.sin(Math.min(1, t) * Math.PI), r = 40 + 180 * k; g.save(); g.translate(300, 500); g.rotate(t * 0.8);
  g.fillStyle = col; g.globalAlpha = k; g.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, rr = i % 2 ? r * 0.16 : r; g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } g.fill();
  const gr = g.createRadialGradient(0, 0, 0, 0, 0, r * 0.8); gr.addColorStop(0, 'rgba(255,255,230,0.9)'); gr.addColorStop(1, 'rgba(255,255,230,0)'); g.fillStyle = gr; g.fillRect(-r, -r, 2 * r, 2 * r); g.restore(); };
/** soft cloud puff (dust / poof / ink steam), centred */
export const fxPoof = (p, t, col = '238,225,205') => { const g = p.g; for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2 + 0.3, d = 40 + 170 * t, r = (70 + 30 * (i % 2)) * (1 - 0.45 * t); g.fillStyle = `rgba(${col},${(0.85 * (1 - t)).toFixed(3)})`; g.beginPath(); g.ellipse(300 + d * Math.cos(a), 500 + d * 0.7 * Math.sin(a), r, r * 0.85, 0, 0, 7); g.fill(); } };
