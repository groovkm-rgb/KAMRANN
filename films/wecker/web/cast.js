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
  snore: { eye: 'closed', brow: 'flat', mouth: 'open' },
  snoreO: { eye: 'closed', brow: 'flat', mouth: 'o' },
  aim: { eye: 'lid', brow: 'angry', mouth: 'flat' },
  sweet: { eye: 'arc', brow: 'up', mouth: 'smile' },
  raised: { eye: 'round', brow: 'high', mouth: 'flat' },
  scream: { eye: 'round', pupil: 0.45, brow: 'high', mouth: 'open' },
  sleepy: { eye: 'lid', brow: 'worry', mouth: 'o' },
  proud: { eye: 'arc', brow: 'up', mouth: 'grin' },
};
function drawFace(g, H, o) {
  const { cx, cy, rx } = H, u = rx / 100, turn = o.turn || 0, look = o.look || 0, E = EXPR[o.expr || 'neutral'] || EXPR.neutral;
  const fx = cx + turn * 26 * u, eyeY = cy - 6 * u;
  const blink = (o.blink || 0) > 0.5, eyes = [-1, 1].map((s) => ({ s, x: fx + s * 37 * u * (1 - 0.18 * Math.abs(turn) * (s * turn < 0 ? 1 : 0)), k: 1 - 0.22 * Math.max(0, -s * turn) }));
  // eyes
  for (const e of eyes) {
    const x = e.x, k = e.k, typ = blink ? 'closed' : ((e.s < 0 ? o.eyeL : o.eyeR) || E.eye);
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
  if (o.glasses) { for (const e of eyes) inkFill(g, ellP(e.x, eyeY - 2 * u, 25 * u * e.k, 25 * u, 0, 360, 28), 'rgba(220,240,255,0.25)', 5 * u);
    ln(g, [[eyes[0].x + 25 * u * eyes[0].k, eyeY - 6 * u], [eyes[1].x - 25 * u * eyes[1].k, eyeY - 6 * u]], 5 * u);
    for (const e of eyes) ln(g, ellP(e.x, eyeY - 2 * u, 17 * u * e.k, 17 * u, 200, 250, 6), 4 * u, '#ffffff'); }
  if (o.blush) for (const sd of [-1, 1]) dt(g, fx + sd * 62 * u, cy + 26 * u, 15 * u, 'rgba(240,120,130,0.45)');
  if (o.puff) for (const sd of [-1, 1]) { const r = 34 * u * o.puff; shaded(g, ellP(fx + sd * 58 * u, cy + 34 * u, r, r * 0.9, 0, 360, 24), '#ffffff', HEAD_SH, 6 * u); if (o.blush !== false) dt(g, fx + sd * 58 * u, cy + 38 * u, r * 0.45, 'rgba(240,120,130,0.5)'); }
  // nose hint for 3/4 turns
  if (Math.abs(turn) > 0.35) ln(g, [[fx + turn * 8 * u, cy + 10 * u], [fx + turn * 16 * u, cy + 20 * u], [fx + turn * 6 * u, cy + 22 * u]], 5 * u);
  // moustache / beard under the mouth layer where they sit
  const my = cy + 40 * u;
  if (o.beard) {
    const pts = []; for (let i = 0; i <= 24; i++) { const a = dg(10 + 160 * i / 24); const j = i % 2 ? 0.93 : 1.04; pts.push([cx + rx * 0.9 * Math.cos(a) * j, cy + 18 * u + rx * 0.82 * Math.sin(a) * j]); }
    pts.push([fx - 40 * u, my + 2 * u], [fx + 40 * u, my + 2 * u]); inkFill(g, pts, o.beard, 6 * u);
  }
  // mouth
  const mx = fx + turn * 6 * u, M = o.puff ? 'o' : (o.mouth || E.mouth);
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
  if (o.bubble > 0.05) { const r = 46 * u * o.bubble, bx = fx + (turn + 0.25) * 30 * u + r * 0.8, by = cy + 18 * u + r * 0.2;
    inkFill(g, ellP(bx, by, r, r * 0.95, 0, 360, 28), 'rgba(190,225,255,0.55)', 4 * u); ln(g, ellP(bx, by, r * 0.7, r * 0.66, 200, 250, 8), 4 * u, '#ffffff'); }
  if (o.sweat) for (const [dx, dy] of [[-1, -0.6], [1.05, -0.3]]) inkFill(g, [[cx + dx * rx * 1.02, cy + dy * rx - 26 * u], [cx + dx * rx * 1.02 + 12 * u, cy + dy * rx], [cx + dx * rx * 1.02, cy + dy * rx + 12 * u], [cx + dx * rx * 1.02 - 12 * u, cy + dy * rx]], '#bfe4ff', 4 * u);
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
    case 'bonnet': { // soft working-woman bonnet framing the face, frilled edge, ribbon under the chin
      const back = o.back, cr = h.frill || '#f2ead8';
      const pts = [...ellP(cx, cy - 4 * u, rx * 1.12, ry * 1.08, 158, 382, 30), [cx + rx * 0.98, cy + 46 * u], [cx + rx * 0.82, cy + 30 * u], ...ellP(cx, cy - 8 * u, rx * 0.84, ry * 0.86, 10, -190, 26).map(([x, y]) => [x, Math.min(y, cy + 30 * u)]), [cx - rx * 0.82, cy + 30 * u], [cx - rx * 0.98, cy + 46 * u]];
      if (back) { shaded(g, wob(cx, cy - 4 * u, rx * 1.1, ry * 1.06, 5, 0.02), c, shadeC(c, 0.7), 8 * u); for (let k = 0; k < 4; k++) ln(g, ellP(cx, cy + 60 * u, rx * (0.3 + k * 0.2), ry * 0.9, 220, 320, 10), 3 * u, shadeC(c, 0.7)); }
      else {
        shaded(g, pts, c, shadeC(c, 0.7), 8 * u);
        const fr = ellP(cx, cy - 8 * u, rx * 0.86, ry * 0.88, 175, 365, 22);
        for (let i = 0; i < fr.length; i++) inkFill(g, ellP(fr[i][0], fr[i][1], 13 * u, 13 * u, 0, 360, 10), cr, 3 * u);
        ln(g, ellP(cx, cy - 4 * u, rx * 1.0, ry * 0.98, 200, 340, 18), 3 * u, mix(c, '#ffffff', 0.3));
      }
      // ribbon bow under the chin
      const by = cy + ry * 0.92; inkFill(g, [[cx, by], [cx - 34 * u, by - 16 * u], [cx - 36 * u, by + 18 * u]], h.band || '#c8423a', 4 * u); inkFill(g, [[cx, by], [cx + 34 * u, by - 16 * u], [cx + 36 * u, by + 18 * u]], h.band || '#c8423a', 4 * u);
      ln(g, [[cx - 4 * u, by + 4 * u], [cx - 14 * u, by + 40 * u]], 6 * u, h.band || '#c8423a'); ln(g, [[cx + 4 * u, by + 4 * u], [cx + 16 * u, by + 38 * u]], 6 * u, h.band || '#c8423a');
      dt(g, cx, by, 9 * u, h.band || '#c8423a');
      break;
    }
    case 'nightcap': { // floppy striped cone flopping to one side, pompom at the tip
      const fl = h.flop ?? 1, tipX = cx + fl * 150 * u, tipY = top + 70 * u;
      const pts = [[cx - rx * 1.02, top + 52 * u], ...ellP(cx, top + 50 * u, rx * 1.02, 70 * u, 180, 250, 8), [cx + fl * 40 * u, top - 70 * u], [tipX + fl * 30 * u, top - 20 * u], [tipX, tipY], [cx + fl * 60 * u, top - 10 * u], [cx + rx * 1.02, top + 52 * u]];
      g.save(); pth(g, pts); g.fillStyle = c; g.fill(); g.clip(); if (h.stripes) for (let k = -6; k < 8; k++) ln(g, [[cx + k * 46 * u - 120 * u, top + 90 * u], [cx + k * 46 * u + 60 * u, top - 110 * u]], 16 * u, h.stripes); g.restore();
      inkFill(g, pts, null, 7 * u);
      inkFill(g, [[cx - rx * 1.06, top + 40 * u], [cx + rx * 1.06, top + 40 * u], [cx + rx * 1.06, top + 64 * u], [cx - rx * 1.06, top + 64 * u]], h.band || '#f4efe4', 5 * u);
      inkFill(g, ellP(tipX, tipY + 10 * u, 22 * u, 22 * u, 0, 360, 16), h.band || '#f4efe4', 5 * u);
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
  if (kind === 'bag') { inkFill(g, [...ellP(x, y + 52, 40, 44, 0, 360, 24)], '#c99a52', 6); inkFill(g, [[x - 14, y], [x + 14, y], [x + 18, y + 14], [x - 18, y + 14]], '#a87a3a', 5); g.fillStyle = '#3d8f4a'; g.font = 'bold 44px sans-serif'; g.textAlign = 'center'; g.fillText('€', x, y + 70); }
  else if (kind === 'paper') { inkFill(g, [[x - 10, y - 70], [x + 70 * side, y - 80], [x + 76 * side, y + 20], [x - 4, y + 30]], '#f4ead2', 5); for (let k = 0; k < 4; k++) ln(g, [[x + 6 * side, y - 50 + k * 18], [x + 58 * side, y - 56 + k * 18]], 3, '#9a8a70'); }
  else if (kind === 'book') { inkFill(g, [[x - 50, y - 30], [x + 50, y - 30], [x + 50, y + 40], [x - 50, y + 40]], '#8a2f3a', 6); ln(g, [[x, y - 30], [x, y + 40]], 4); }
  else if (kind === 'mug') { inkFill(g, [[x - 22, y - 40], [x + 22, y - 40], [x + 20, y + 14], [x - 20, y + 14]], '#e8d6a0', 6); inkFill(g, ellP(x, y - 40, 22, 8), '#ffffff', 4); }
  else if (kind === 'hammer') { ln(g, [[x, y + 50], [x, y - 70]], 12, '#8a5a34'); ln(g, [[x, y + 50], [x, y - 70]], 3); inkFill(g, [[x - 34, y - 90], [x + 30, y - 90], [x + 30, y - 60], [x - 34, y - 60]], '#7a7a86', 6); }
  else if (kind === 'key') { inkFill(g, ellP(x, y - 24, 16, 16), '#e0b040', 5); ln(g, [[x, y - 8], [x, y + 50], [x + 14 * side, y + 50], [x, y + 36], [x + 12 * side, y + 36]], 7, '#e0b040'); }
}
const PANT = '#2b2733';
function drawBody(g, s, o) {
  const bw = s.bw || 200, y0 = 352, y1 = s.robe ? (s.hem || 925) : 705, x0 = 300 - bw / 2, x1 = 300 + bw / 2, col = s.body || '#d8483a', sh = coolShade(col);
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
    if (t === 'trim') { ln(g, [[x0 - 30, y1 - 12], [x1 + 30, y1 - 12]], 14, dc || '#e8c048'); }
  }
  g.restore(); inkFill(g, pts, null, 0);
  return { y0, y1, x0, x1, pts };
}
function boot(g, x, y, sd, col, rot = 0) {
  g.save(); g.translate(x, y); g.rotate(dg(rot * sd));
  const pts = [[-22, -62], [20, -62], [22, -26], [60 * 1, -18], [70, -2], [66, 8], [-26, 8], [-28, -20]].map(([a, b]) => [a * sd, b]);
  shaded(g, pts, col, shadeC(col, 0.65), 7); ln(g, [[-26 * sd, 2], [66 * sd, 2]], 5); ln(g, [[-18 * sd, -44], [16 * sd, -44]], 3, mix(col, '#ffffff', 0.3));
  g.restore();
}
function drawLegs(g, s, o, B) {
  const legs = o.legs || 'stand', st = o.step || 0, hipY = B.y1 - 14, c = s.legs || null;
  const L = (pts) => { if (c) { ln(g, pts, 18); ln(g, pts, 9, c); } else ln(g, pts, 8); };
  if (s.robe) { const hy = s.hem || 925;
    for (const sd of [-1, 1]) {
      if (legs === 'sit') { L([[300 + sd * 40, hy - 10], [300 + sd * 50, 968]]); if (s.boots) boot(g, 300 + sd * 50, 968, sd, s.boots); continue; }
      const sw = legs === 'walk' ? Math.sin(st * Math.PI * 2 + (sd > 0 ? 0 : Math.PI)) * 30 : 0, lift = legs === 'walk' ? Math.max(0, Math.sin(st * Math.PI * 2 + (sd > 0 ? 0 : Math.PI))) * 16 : 0;
      const tap = (o.tap && sd > 0) ? o.tap * 26 : 0;
      L([[300 + sd * 40, hy - 10], [300 + sd * 44 + sw, 968 - lift - tap]]);
      if (s.boots) boot(g, 300 + sd * 44 + sw, 968 - lift - tap, sd, s.boots, tap ? -tap * 0.6 : 0); else ln(g, [[300 + sd * 44 + sw, 968 - lift], [300 + sd * 64 + sw, 968 - lift]], 8);
    } return; }
  for (const sd of [-1, 1]) {
    const hx = 300 + sd * 36;
    if (legs === 'sit') L([[hx, hipY], [hx + sd * 26, hipY + 70], [hx + sd * 30, hipY + 200], [hx + sd * 52, hipY + 200]]);
    else if (legs === 'crouch') L([[hx, hipY], [hx + sd * 90, hipY + 100], [hx + sd * 60, 968], [hx + sd * 82, 968]]);
    else { const sw = legs === 'walk' ? Math.sin(st * Math.PI * 2 + (sd > 0 ? 0 : Math.PI)) * 34 : 0, lift = legs === 'walk' ? Math.max(0, Math.sin(st * Math.PI * 2 + (sd > 0 ? 0 : Math.PI))) * 18 : 0;
      L([[hx, hipY], [hx + sd * 8 + sw * 0.5, (hipY + 968) / 2 - lift * 0.3], [hx + sd * 10 + sw, 968 - lift], [hx + sd * 32 + sw, 968 - lift]]); }
  }
}

/** rim light: a coloured crescent just inside the outline on one side */
const rim = (g, pts, side, col, w = 16) => { g.save(); pth(g, pts); g.clip(); g.translate(-side * w * 0.55, w * 0.25); ln(g, pts, w, col); g.restore(); };
function drawShawl(g, B, col, back) {
  const { x0, x1, y0 } = B, sh = shadeC(col, 0.7);
  const pts = back ? [[x0 - 26, y0 + 40], [x0 + 10, y0 - 6], [300, y0 - 16], [x1 - 10, y0 - 6], [x1 + 26, y0 + 40], [x1 + 10, y0 + 120], [300, y0 + 300], [x0 - 10, y0 + 120]]
    : [[x0 - 28, y0 + 44], [x0 + 6, y0 - 8], [300, y0 - 18], [x1 - 6, y0 - 8], [x1 + 28, y0 + 44], [x1 + 14, y0 + 170], [300 + 30, y0 + 120], [300, y0 + 236], [300 - 30, y0 + 120], [x0 - 14, y0 + 170]];
  shaded(g, pts, col, sh, 8, [-0.08, -0.1]);
  g.save(); pth(g, pts); g.clip();
  for (let y = y0 - 20; y < y0 + 320; y += 22) for (let x = x0 - 40; x < x1 + 40; x += 22) { ln(g, [[x, y], [x + 8, y + 9]], 2.5, sh); ln(g, [[x + 16, y], [x + 8, y + 9]], 2.5, sh); }
  g.restore();
  const fr = back ? [[x0 - 10, y0 + 120], [300, y0 + 300], [x1 + 10, y0 + 120]] : [[x0 - 14, y0 + 170], [300 - 30, y0 + 120], [300, y0 + 236], [300 + 30, y0 + 120], [x1 + 14, y0 + 170]];
  for (let k = 0; k < fr.length - 1; k++) { const [ax, ay] = fr[k], [bx, by] = fr[k + 1]; for (let t = 0.1; t < 1; t += 0.2) { const x = ax + (bx - ax) * t, y = ay + (by - ay) * t; ln(g, [[x, y], [x + 2, y + 22]], 5, col); ln(g, [[x, y + 2], [x + 2, y + 22]], 1.5); } }
  // pin
  if (!back) { dt(g, 300, y0 + 118, 10, '#e2b84c'); ln(g, ellP(300, y0 + 118, 10, 10), 3); }
}
function drawPouch(g, B, col = '#8a5a32') {
  const x = B.x1 - 22, y = (B.y1 > 800 ? 640 : B.y1 - 70);
  ln(g, [[x - 30, y - 50], [x, y - 22]], 5);
  inkFill(g, [[x - 26, y - 20], [x + 26, y - 20], [x + 36, y + 30], [x + 18, y + 52], [x - 18, y + 52], [x - 36, y + 30]], col, 6);
  ln(g, [[x - 26, y - 14], [x + 26, y - 14]], 4, '#e8d6a0');
  for (const [dx, dy] of [[-12, -26], [2, -30], [14, -25]]) inkFill(g, ellP(x + dx, y + dy, 8, 8, 0, 360, 10), '#7cc04a', 3);
}
function drawLantern(g, x, y, on = 1) {
  ln(g, ellP(x, y + 6, 22, 22, 180, 360, 10), 5);
  inkFill(g, [[x - 26, y + 10], [x + 26, y + 10], [x + 36, y + 32], [x - 36, y + 32]], '#2e2a30', 5);
  const gl = on > 0.5 ? '#ffd47a' : '#5a4a3a';
  inkFill(g, [[x - 30, y + 32], [x + 30, y + 32], [x + 30, y + 108], [x - 30, y + 108]], gl, 5);
  if (on > 0.5) { inkFill(g, [[x, y + 50], [x + 10, y + 78], [x, y + 92], [x - 10, y + 78]], '#fff6d0', 0); dt(g, x, y + 80, 6, '#ffffff'); }
  for (const dx of [-15, 15]) ln(g, [[x + dx, y + 32], [x + dx, y + 108]], 3, '#2e2a30');
  inkFill(g, [[x - 36, y + 108], [x + 36, y + 108], [x + 30, y + 124], [x - 30, y + 124]], '#2e2a30', 5);
}
function drawPipeV(g, x, y, side) { // blowpipe held upright like a staff
  ln(g, [[x - side * 4, y + 140], [x + side * 26, y - 330]], 13); ln(g, [[x - side * 4, y + 140], [x + side * 26, y - 330]], 6, '#a07a48');
  inkFill(g, ellP(x + side * 26, y - 334, 10, 10, 0, 360, 12), '#e2b84c', 3);
}
function drawProp2(g, kind, x, y, side, o) {
  if (kind === 'lantern') drawLantern(g, x, y, 1);
  else if (kind === 'lanternOff') drawLantern(g, x, y, 0);
  else if (kind === 'pipe') drawPipeV(g, x, y, side);
  else if (kind === 'pea') inkFill(g, ellP(x, y - 16, 11, 11, 0, 360, 12), '#7cc04a', 4);
  else if (kind === 'coins') { for (const [dx, dy] of [[-14, -6], [8, -14], [16, 2]]) { inkFill(g, ellP(x + dx, y + dy, 16, 10, 0, 360, 16), '#f0c040', 4); ln(g, ellP(x + dx, y + dy, 9, 5, 200, 330, 8), 3, '#fff3b0'); } }
  else if (kind === 'watch') { ln(g, [[x, y], [x - 60 * side, y + 50], [300, 560]], 3, '#e2b84c'); inkFill(g, ellP(x, y - 10, 30, 30, 0, 360, 24), '#f0c040', 5); inkFill(g, ellP(x, y - 10, 22, 22, 0, 360, 24), '#fffaf0', 3); ln(g, [[x, y - 10], [x, y - 26]], 3); ln(g, [[x, y - 10], [x + 12, y - 6]], 3); dt(g, x, y - 42, 6, '#f0c040'); }
  else if (kind === 'stick') { ln(g, [[x, y + 60], [x, y - 360]], 12); ln(g, [[x, y + 60], [x, y - 360]], 5, '#c8b070'); }
  else drawProp(g, kind, x, y, side);
}

/** draw a character. spec: { body, bw, robe, hem, cape, legs, boots, detail[], shawl, pouch, hair, hairStyle, mous, mousStyle, beard, goatee, hat{type,color,band,stripes,tilt,frill,flop}, helm, headScale }
 *  opts: { expr, look, blink, turn, eyeL, eyeR, mouth, puff, bubble, blush, sweat, glasses, back, rim:{side,col}, L, R, holdL, holdR,
 *          pipe:{x0,y0,ang,len} (blowpipe in canvas px; hands snap to it), pockets, legs, step, tap, tilt, headTilt, bob, seed } */
export const toonChar = (p, spec, opts = {}) => {
  const g = p.g, s = typeof spec === 'string' ? CAST[spec] : spec, o = { ...s, ...opts };
  const sB = o.back ? { ...s, detail: (s.detail || []).filter((d) => (typeof d === 'string' ? d : d.t) === 'belt') } : s;
  g.save();
  const bob = (o.bob || 0) * 1000; g.translate(0, -bob);
  if (o.tilt) { g.translate(300, 975); g.rotate(dg(o.tilt)); g.translate(-300, -975); }
  drawLegs(g, s, o, { y1: s.robe ? (s.hem || 925) : 705 });
  const B = drawBody(g, sB, o);
  if (o.rim) rim(g, B.pts, o.rim.side, o.rim.col, 18);
  if (o.pockets) for (const sd of [-1, 1]) inkFill(g, [[300 + sd * 70, B.y1 - 130], [300 + sd * 112, B.y1 - 130], [300 + sd * 118, B.y1 - 70], [300 + sd * 96, B.y1 - 56], [300 + sd * 74, B.y1 - 76]], '#f2ead8', 5);
  if (s.pouch && !o.back) drawPouch(g, B, s.pouch);
  if (s.shawl) drawShawl(g, B, s.shawl, o.back);
  if (o.lanternBelt) drawLantern(g, B.x0 + 34, 560, 1);
  if (o.tuck) { ln(g, [[150, 760], [470, 150]], 15); ln(g, [[150, 760], [470, 150]], 7, '#a07a48'); inkFill(g, ellP(470, 150, 10, 10, 0, 360, 12), '#e2b84c', 3); }
  const sY = B.y0 + 48, shoulders = { '-1': [B.x0 + 16, sY], '1': [B.x1 - 16, sY] };
  const hr = 140 * (s.headScale || 1), H = { cx: 300 + (o.turn || 0) * 8, cy: 276, rx: hr, ry: hr * 0.9, seed: o.seed ?? 3 };
  const ht = dg(o.headTilt || 0), rotP = ([x, y]) => [300 + (x - 300) * Math.cos(ht) - (y - 380) * Math.sin(ht), 380 + (x - 300) * Math.sin(ht) + (y - 380) * Math.cos(ht)];
  g.save(); g.translate(300, 380); g.rotate(ht); g.translate(-300, -380);
  if (s.helm) { shaded(g, wob(H.cx, H.cy + 6, H.rx * 1.16, H.ry * 1.2, 7, 0.01), s.helm, shadeC(s.helm, 0.66), 9); }
  const hp = s.helm ? wob(H.cx + (o.turn || 0) * 18, H.cy + 16, H.rx * 0.8, H.ry * 0.82, H.seed, 0.02) : wob(H.cx, H.cy, H.rx, H.ry, H.seed);
  shaded(g, hp, HEAD, HEAD_SH, 9.5, [-0.1, -0.06]);
  if (s.helm) { inkFill(g, [[H.cx - 70, H.cy - 92], [H.cx + 96, H.cy - 104], [H.cx + 110, H.cy - 70], [H.cx - 60, H.cy - 64]], shadeC(s.helm, 1.08), 7); }
  const HH = s.helm ? { ...H, cy: H.cy + 16, rx: H.rx * 0.82, ry: H.ry * 0.82 } : H;
  if (!s.helm) drawHair(g, H, o);
  if (!o.back) drawFace(g, HH, o);
  drawHat(g, H, o);
  if (o.rim) rim(g, hp, o.rim.side, o.rim.col, 20);
  g.restore();
  // blowpipe at the mouth (drawn over the face, hands snap onto it)
  let pipeHands = null;
  if (o.pipe) {
    const u = H.rx / 100, tn = o.turn || 0, a = dg(o.pipe.ang ?? -70), L = o.pipe.len ?? 340;
    const [mx0, my0] = o.pipe.x0 != null ? [o.pipe.x0, o.pipe.y0] : rotP([H.cx + tn * 32 * u, H.cy + 44 * u]);
    const ex = mx0 + Math.cos(a) * L, ey = my0 + Math.sin(a) * L;
    ln(g, [[mx0, my0], [ex, ey]], 15); ln(g, [[mx0, my0], [ex, ey]], 7, '#a07a48');
    inkFill(g, ellP(mx0 + Math.cos(a) * 6, my0 + Math.sin(a) * 6, 11, 11, 0, 360, 12), '#e2b84c', 3);
    pipeHands = [[mx0 + Math.cos(a) * L * 0.3, my0 + Math.sin(a) * L * 0.3], [mx0 + Math.cos(a) * L * 0.62, my0 + Math.sin(a) * L * 0.62]];
  }
  for (const side of [-1, 1]) {
    let pose = side < 0 ? o.L : o.R;
    if (pipeHands) { const hp_ = pipeHands[side < 0 ? 0 : 1]; pose = { x: hp_[0], y: hp_[1], b: 0.6 }; }
    const [sx, sy] = shoulders[side], pts = armPts(sx, sy, side, pose);
    ln(g, pts, 7.5); dt(g, pts[2][0], pts[2][1], 10.5);
    drawProp2(g, side < 0 ? o.holdL : o.holdR, pts[2][0], pts[2][1], side, o);
  }
  g.restore();
};

/** sleeper on a pillow: head (with nightcap) on a pillow, a quilt edge across the chest. Card stands upright behind a 3D quilt. */
export const sleeper = (p, spec, o = {}) => {
  const g = p.g;
  inkFill(g, pill(70, 330, 530, 560, 90), '#f4f2ec', 8);
  ln(g, [[120, 360], [480, 360]], 3, '#d8d4ca');
  g.save(); g.translate(0, o.lift ? -o.lift * 1000 : 0);
  toonChar(p, spec, { L: { x: 190, y: 600 }, R: { x: 410, y: 600 }, ...o });
  g.restore();
  // quilt edge
  const qc = o.quilt || '#c85a4a', pts = [[20, 580], ...Array.from({ length: 13 }, (_, i) => [20 + i * 47, 560 + (i % 2) * 14]), [580, 580], [600, 1000], [0, 1000]];
  inkFill(g, pts, qc, 8);
  g.save(); pth(g, pts); g.clip(); for (let x = 0; x < 600; x += 100) for (let y = 560; y < 1000; y += 100) inkFill(g, [[x + 8, y + 8], [x + 92, y + 8], [x + 92, y + 92], [x + 8, y + 92]], ((x + y) / 100) % 2 ? shadeC(qc, 0.82) : mix(qc, '#f4e0b0', 0.35), 0);
  for (let x = 0; x < 600; x += 100) ln(g, [[x, 560], [x, 1000]], 3, shadeC(qc, 0.6)); g.restore();
  if (o.hands) for (const x of [210, 390]) dt(g, x, 600, 13);
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

// ===================== story cast: "Der menschliche Wecker" =====================
export const WOMAN = { body: '#3b3552', robe: true, hem: 880, bw: 250, boots: '#3a2a22', shawl: '#a3432f', pouch: '#8a5a32',
  detail: [{ t: 'apron', c: '#f4f0e6' }], hair: '#6a5a50', hairStyle: 'short', hat: { type: 'bonnet', color: '#5b4636', frill: '#efe6d2', band: '#b8342c' }, seed: 5 };
export const KNOCKER = { body: '#4a5a46', robe: true, hem: 920, bw: 160, boots: '#2a2226', detail: ['buttons', { t: 'collar', c: '#c8c0a8' }], hair: '#3a2a22', hairStyle: 'sides', mous: '#3a2a22', hat: { type: 'flatcap', color: '#5a4a3a', stripes: '#7a6a52' }, headScale: 0.92, seed: 8 };
export const FATHER = { body: '#eef0f6', robe: true, hem: 930, bw: 210, detail: [{ t: 'buttons', c: '#9aa6c8' }, { t: 'stripes', c: '#b8c4e4' }], hair: '#7a4a2a', hairStyle: 'mop', hat: { type: 'nightcap', color: '#d84a4a', stripes: '#f4efe4', flop: 1 }, seed: 2 };
export const MOTHER = { body: '#f2dce6', robe: true, hem: 930, bw: 220, detail: [{ t: 'collar', c: '#ffffff' }], hair: '#a8582e', hairStyle: 'bun', hat: { type: 'nightcap', color: '#f4efe4', band: '#e88aa8', flop: -1 }, seed: 9 };
export const KID1 = { body: '#e8e2d0', robe: true, bw: 170, hair: '#d8a040', hairStyle: 'mop', headScale: 1.05, seed: 11 };
export const KID2 = { body: '#dfe8f0', robe: true, bw: 170, hair: '#6a4024', hairStyle: 'side', headScale: 1.05, hat: { type: 'nightcap', color: '#4a7ac8', stripes: '#f4efe4', flop: 1 }, seed: 13 };
export const KID3 = { body: '#f0e0e8', robe: true, bw: 160, hair: '#3a2a22', hairStyle: 'bun', headScale: 1.05, seed: 17 };
export const FOREMAN = { body: '#3a3a48', bw: 230, detail: [{ t: 'vest', c: '#6a2a2a' }, 'buttons', { t: 'collar', c: '#f2efe6' }], legs: '#2a2a32', hair: '#2a2228', hairStyle: 'sides', mous: '#2a2228', mousStyle: 'handle', hat: { type: 'bowler', color: '#26222a' }, seed: 4 };
export const CLOCKMAKER = { body: '#6a4a8a', bw: 200, detail: [{ t: 'apron', c: '#7a5232' }, { t: 'collar', c: '#f2efe6' }], hair: '#d8d8dc', hairStyle: 'sides', mous: '#d8d8dc', seed: 6 };
export const POORMAN = { body: '#6a6a7a', bw: 190, detail: ['straps', { t: 'pocket' }], legs: '#4a4a56', hair: '#8a5a2e', hairStyle: 'mop', hat: { type: 'flatcap', color: '#5a5a6a', stripes: '#7a7a8a' }, seed: 12 };
export const OLDMAN = { body: '#5a4a3a', bw: 210, detail: ['buttons', { t: 'scarf', c: '#7a8a5a' }], legs: '#3a3238', hair: '#e4e4e8', hairStyle: 'sides', beard: '#e4e4e8', hat: { type: 'flatcap', color: '#4a4a52', stripes: '#62626c' }, seed: 15 };
export const WORKERS = [
  { body: '#3f6fa0', detail: ['straps'], legs: '#3a3a46', hair: '#6a4024', hairStyle: 'mop', hat: { type: 'flatcap', color: '#4a5a8a', stripes: '#6a7aa8' }, seed: 21 },
  { body: '#8a5a3a', detail: ['buttons'], legs: '#3a3238', hair: '#2a2228', hairStyle: 'short', mous: '#2a2228', hat: { type: 'flatcap', color: '#3a3a40', stripes: '#55555c' }, seed: 22 },
  { body: '#5a7a4a', detail: [{ t: 'apron', c: '#d8d0c0' }], robe: true, hem: 900, hair: '#c87a3a', hairStyle: 'bun', seed: 23 },
  { body: '#7a3a4a', detail: ['straps', 'pocket'], legs: '#3a3a46', hair: '#b8a070', hairStyle: 'mop', hat: { type: 'flatcap', color: '#6a4a3a', stripes: '#8a6a52' }, seed: 24 },
  { body: '#4a4a6a', robe: true, hem: 900, detail: [{ t: 'scarf', c: '#c8a040' }], hair: '#3a2a22', hairStyle: 'short', seed: 25 },
];

// ---------- story fx ----------
const ink2 = (g, pts, fill, w = 6) => inkFill(g, pts, fill, w);
/** moth fluttering (t = wing phase 0..1) */
export const fxMoth = (p, t) => { const g = p.g, w = Math.sin(t * Math.PI * 2) * 0.8 + 0.2;
  for (const sd of [-1, 1]) ink2(g, [[300, 500], [300 + sd * 90, 500 - 70 * w], [300 + sd * 110, 500 + 10], [300 + sd * 40, 540]], '#d8c8a8', 5);
  ink2(g, ellP(300, 510, 14, 40, 0, 360, 16), '#8a7a60', 4); ln(g, [[296, 470], [280, 440]], 3); ln(g, [[304, 470], [320, 440]], 3); };
/** cat on a roof (side view). pose: 'walk' | 'sit' ; t = phase */
export const fxCat = (p, t, pose = 'walk', col = '#1c1824') => { const g = p.g, sw = Math.sin(t * Math.PI * 2);
  if (pose === 'sit') { ink2(g, [[230, 960], [250, 760], [300, 720], [350, 760], [370, 960]], col, 6); ink2(g, ellP(300, 690, 62, 56, 0, 360, 24), col, 6);
    for (const sd of [-1, 1]) ink2(g, [[300 + sd * 20, 650], [300 + sd * 50, 600], [300 + sd * 58, 668]], col, 5);
    for (const sd of [-1, 1]) { ink2(g, ellP(300 + sd * 24, 690, 13, 15, 0, 360, 12), '#e8f060', 3); dt(g, 300 + sd * 24, 690, 4); }
    ln(g, [[360, 950], [430, 940 + sw * 20], [450, 880 + sw * 30]], 14); ln(g, [[360, 950], [430, 940 + sw * 20], [450, 880 + sw * 30]], 7, col); return; }
  ink2(g, ellP(300, 860, 120, 46, 0, 360, 28), col, 6);
  for (const [x, ph] of [[210, 0], [250, 0.5], [350, 0.25], [390, 0.75]]) { const k = Math.sin((t + ph) * Math.PI * 2) * 20; ln(g, [[x, 880], [x + k, 960]], 14); ln(g, [[x, 880], [x + k, 960]], 7, col); }
  ink2(g, ellP(430, 800, 52, 46, 0, 360, 24), col, 6); for (const dx of [-26, 20]) ink2(g, [[430 + dx, 770], [430 + dx + 14, 718], [430 + dx + 30, 772]], col, 5);
  ink2(g, ellP(448, 796, 11, 13, 0, 360, 12), '#e8f060', 3); dt(g, 452, 797, 4);
  ln(g, [[190, 850], [140, 800 + sw * 20], [130, 720 + sw * 30]], 14); ln(g, [[190, 850], [140, 800 + sw * 20], [130, 720 + sw * 30]], 7, col); };
/** question mark curling out of lantern smoke */
export const fxQSmoke = (p, t) => { const g = p.g, k = Math.min(1, t * 1.8), a = Math.min(1, t * 4) * (t > 0.85 ? (1 - t) / 0.15 : 1);
  const wisp = [], q = [];
  for (let i = 0; i <= 10; i++) { const v = i / 10; wisp.push([300 + Math.sin(v * 7 + t * 6) * 18 * (1 - v), 980 - v * 300]); }
  for (let i = 0; i <= 6; i++) q.push([300, 530 - i * 20]);
  for (let i = 1; i <= 30; i++) { const ang = dg(90 - i / 30 * 270); q.push([300 + 120 * Math.cos(ang), 290 + 120 * Math.sin(ang)]); }
  const k1 = Math.min(1, k / 0.35), k2 = Math.max(0, (k - 0.4) / 0.6);
  const st = (path, w1, w2) => { if (path.length < 2) return; ln(g, path, w1, 'rgba(150,150,180,0.8)'); ln(g, path, w2, 'rgba(244,242,250,0.97)'); };
  g.save(); g.globalAlpha = a;
  st(wisp.slice(0, Math.max(2, Math.round(wisp.length * k1))), 30, 16);
  if (k > 0.35) { const r = 30 * Math.min(1, (k - 0.35) / 0.1); dt(g, 300, 640, r + 8, 'rgba(150,150,180,0.8)'); dt(g, 300, 640, r, 'rgba(244,242,250,0.97)'); }
  if (k2 > 0) st(q.slice(0, Math.max(2, Math.round(q.length * k2))), 50, 32);
  g.restore(); };
/** big smiling sun */
export const fxSun = (p, t = 0) => { const g = p.g;
  for (let i = 0; i < 14; i++) { const a = dg(i * 360 / 14 + t * 40), r0 = 190, r1 = 270 + (i % 2) * 30; ink2(g, [[300 + r0 * Math.cos(a - 0.12), 500 + r0 * Math.sin(a - 0.12)], [300 + r1 * Math.cos(a), 500 + r1 * Math.sin(a)], [300 + r0 * Math.cos(a + 0.12), 500 + r0 * Math.sin(a + 0.12)]], '#ffcf3a', 6); }
  shaded(g, ellP(300, 500, 190, 190, 0, 360, 48), '#ffe060', '#f6b030', 9);
  for (const sd of [-1, 1]) { ln(g, ellP(300 + sd * 62, 470, 30, 22, 200, 340, 12), 9); dt(g, 300 + sd * 100, 540, 26, 'rgba(255,120,80,0.45)'); }
  ln(g, ellP(300, 520, 80, 60, 20, 160, 18), 10); };
/** soft fog/smoke puff sprite (alpha a) */
export const fxFog = (p, a = 0.5, col = '200,205,230') => { const g = p.g; for (let i = 0; i < 6; i++) { const x = 120 + i * 72, y = 520 + Math.sin(i * 1.7) * 60, r = 150 + (i % 3) * 40;
  const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${col},${a * 0.55})`); gr.addColorStop(1, `rgba(${col},0)`); g.fillStyle = gr; g.fillRect(0, 0, 600, 1000); } };
/** spinning coin (t = spin phase) */
export const fxCoin = (p, t) => { const g = p.g, w = Math.abs(Math.cos(t * Math.PI * 2)); inkFill(g, ellP(300, 500, 8 + 110 * w, 110, 0, 360, 32), '#f0c040', 9); if (w > 0.3) { inkFill(g, ellP(300, 500, 80 * w, 80, 0, 360, 32), '#e0a830', 5); ln(g, ellP(300, 500, 60 * w, 60, 200, 300, 12), 8, '#fff3b0'); } };
/** speed / impact lines (for the pling) */
export const fxPling = (p, t) => { const g = p.g, e = 1 - (1 - t) ** 2;
  for (let i = 0; i < 9; i++) { const a = dg(i * 40 + 10), r0 = 50 + 120 * e, r1 = r0 + 90 * (1 - t); ln(g, [[300 + r0 * Math.cos(a), 500 + r0 * Math.sin(a)], [300 + r1 * Math.cos(a), 500 + r1 * Math.sin(a)]], 12 * (1 - t) + 4, '#f8fcff'); }
  g.save(); g.globalAlpha = 1 - t; ln(g, ellP(300, 500, 40 + 200 * e, 40 + 200 * e, 0, 360, 40), 10, '#dff4ff'); g.restore(); };
/** horse + cart side view (t = gait phase) */
export const fxHorseCart = (p, t, load = '#c8a050') => { const g = p.g, sw = Math.sin(t * Math.PI * 2);
  // cart
  ink2(g, [[40, 640], [300, 640], [300, 760], [40, 760]], '#8a5a34', 7); for (let x = 70; x < 300; x += 50) ln(g, [[x, 650], [x, 750]], 3, '#5a3a24');
  ink2(g, ellP(170, 600, 120, 60, 180, 360, 20), load, 6);
  inkFill(g, ellP(130, 800, 62, 62, 0, 360, 24), '#6a4a2a', 7); ln(g, ellP(130, 800, 44, 44, 0, 360, 24), 4); for (let i = 0; i < 6; i++) { const a = t * 6 + i * 1.05; ln(g, [[130, 800], [130 + 44 * Math.cos(a), 800 + 44 * Math.sin(a)]], 4); }
  ln(g, [[300, 700], [400, 700]], 8);
  // horse
  for (const [x, ph] of [[400, 0], [430, 0.5], [500, 0.25], [530, 0.75]]) { const k = Math.sin((t + ph) * Math.PI * 2) * 18; ln(g, [[x, 720], [x + k, 840]], 18); ln(g, [[x, 720], [x + k, 840]], 9, '#9a6a3a'); }
  ink2(g, ellP(465, 690, 95, 56, 0, 360, 28), '#9a6a3a', 7);
  ink2(g, [[530, 660], [570, 560 + sw * 4], [600, 570], [596, 610], [560, 690]], '#9a6a3a', 7);
  ink2(g, [[548, 600], [520, 560], [560, 556]], '#3a2a22', 4); dt(g, 580, 584, 6); ln(g, [[372, 676], [350, 720 + sw * 8]], 10, '#3a2a22'); };
/** street vendor pushing a barrow with a big open mouth (shouting, no words) */
export const fxBarrow = (p, t) => { const g = p.g; ink2(g, [[60, 700], [330, 700], [300, 800], [90, 800]], '#7a5a3a', 7);
  for (let i = 0; i < 9; i++) inkFill(g, ellP(100 + i * 26, 690 - (i % 3) * 14, 22, 20, 0, 360, 14), ['#e04a3a', '#f0a030', '#7cc04a'][i % 3], 4);
  inkFill(g, ellP(200, 840, 40, 40, 0, 360, 20), '#5a3a24', 6); ln(g, [[330, 720], [420, 680]], 8); };
