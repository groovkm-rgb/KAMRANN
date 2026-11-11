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
  sad: { eye: 'dot', brow: 'worry', mouth: 'frown' },
  sing: { eye: 'closed', brow: 'up', mouth: 'o' },
  sick: { eye: 'round', pupil: 0.5, brow: 'worry', mouth: 'wavy' },
  zombie: { eye: 'zomb', brow: 'worry', mouth: 'open' },
  zgrin: { eye: 'zomb', brow: 'flat', mouth: 'grit' },
  tired: { eye: 'half', brow: 'flat', mouth: 'flat' },
  proud: { eye: 'arc', brow: 'up', mouth: 'smile' },
  cry: { eye: 'arc', brow: 'worry', mouth: 'wavy' },
  chew: { eye: 'closed', brow: 'up', mouth: 'wavy' },
};
function drawFace(g, H, o) {
  const { cx, cy, rx } = H, u = rx / 100, turn = o.turn || 0, look = o.look || 0, E = EXPR[o.expr || 'neutral'] || EXPR.neutral;
  const fx = cx + turn * 26 * u, eyeY = cy - 6 * u;
  const blink = (o.blink || 0) > 0.5, eyes = [-1, 1].map((s) => ({ s, x: fx + s * 37 * u * (1 - 0.18 * Math.abs(turn) * (s * turn < 0 ? 1 : 0)), k: 1 - 0.22 * Math.max(0, -s * turn) }));
  // eyes
  for (const e of eyes) {
    if (Math.abs(turn) > 0.85 && e.s * turn < 0) continue;
    const x = e.x, k = e.k, typ = blink ? 'closed' : E.eye;
    if (typ === 'round') {
      inkFill(g, ellP(x, eyeY - 4 * u, 21 * u * k, 24 * u, 0, 360, 32), '#ffffff', 6 * u);
      dt(g, x + look * 9 * u * k, eyeY - 2 * u, 7.5 * u * (E.pupil || 1));
    } else if (typ === 'lid') {
      g.save(); pth(g, ellP(x + look * 4 * u, eyeY + 3 * u, 13 * u * k, 11 * u, 0, 180, 16)); g.fillStyle = CK; g.fill(); g.restore();
      ln(g, [[x - 18 * u * k, eyeY + 1 * u], [x + 18 * u * k, eyeY - 1 * u]], 7 * u);
    } else if (typ === 'zomb') {
      const big = e.s < 0 ? 1.15 : 0.8;
      inkFill(g, ellP(x, eyeY - 4 * u, 21 * u * k * big, 24 * u * big, 0, 360, 32), '#fffbe0', 6 * u);
      dt(g, x + (e.s < 0 ? -5 : 6) * u, eyeY + (e.s < 0 ? 4 : -6) * u, 5 * u);
    } else if (typ === 'half') {
      inkFill(g, ellP(x, eyeY, 17 * u * k, 13 * u, 0, 180, 16), '#ffffff', 5 * u); dt(g, x + look * 5 * u, eyeY + 6 * u, 6 * u);
      ln(g, [[x - 19 * u * k, eyeY], [x + 19 * u * k, eyeY]], 6.5 * u);
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
  if (o.stubble > 0.02 && !(o.beardLen > 0)) {
    const pts = []; for (let i = 0; i <= 24; i++) { const a = dg(8 + 164 * i / 24); pts.push([cx + rx * 0.9 * Math.cos(a), cy + 14 * u + rx * 0.8 * Math.sin(a)]); }
    pts.push([fx - 44 * u, my - 14 * u], [fx, my - 20 * u], [fx + 44 * u, my - 14 * u]);
    pth(g, pts); g.fillStyle = `rgba(110,72,44,${0.28 * o.stubble})`; g.fill();
    for (let i = 0; i < 70; i++) { const a = dg(15 + (i * 37) % 150), r = 0.55 + ((i * 53) % 40) / 100; dt(g, fx + rx * 0.82 * r * Math.cos(a), cy + 22 * u + rx * 0.75 * r * Math.sin(a), 2.2 * u, `rgba(80,50,30,${0.7 * o.stubble})`); }
  }
  if (o.beard && o.beardLen > 0) {
    const L = o.beardLen * u, pts = [];
    for (let i = 0; i <= 30; i++) { const a = dg(5 + 170 * i / 30), sn = Math.sin(a); const j = i % 2 ? 0.92 : 1.05;
      const taper = 1 - 0.45 * Math.min(1, L / (200 * u)) * sn * sn;
      pts.push([cx + rx * 0.92 * Math.cos(a) * j * taper, cy + 10 * u + (rx * 0.82 + L * sn * sn) * sn * (i % 2 ? 0.96 : 1)]); }
    pts.push([fx - 40 * u, my - 12 * u], [fx, my - 18 * u], [fx + 40 * u, my - 12 * u]);
    shaded(g, pts, o.beard, shadeC(o.beard, 0.72), 6 * u, [-0.08, -0.05]);
    for (let k = 0; k < 6; k++) { const x0 = fx - 50 * u + k * 20 * u; ln(g, [[x0, my + 30 * u], [x0 + 4 * u, my + 30 * u + L * 0.5], [x0 - 2 * u, my + 30 * u + L * 0.8]], 3 * u, shadeC(o.beard, 1.35)); }
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
  if (o.tear) { for (const sd of [-1, 1]) { const tx = fx + sd * 37 * u, ty = eyeY + 18 * u + o.tear * 50 * u; inkFill(g, [[tx, ty - 14 * u], [tx + 9 * u, ty + 4 * u], [tx, ty + 12 * u], [tx - 9 * u, ty + 4 * u]], '#8fd0ff', 3.5 * u); } }
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
  const bw = s.bw || 200, y0 = 352, y1 = s.robe ? 925 : 705, x0 = 300 - bw / 2, x1 = 300 + bw / 2, col = s.body || '#d8483a', sh = coolShade(col);
  const flare = s.robe ? 26 : 0, pts = pill(x0, y0, x1, y1, Math.min(90, bw * 0.46), flare);
  if ((s.detail || []).includes('hoodie')) inkFill(g, ellP(300, y0 + 18, bw * 0.46, 46, 180, 360, 20).concat([[300 + bw * 0.46, y0 + 30], [300 - bw * 0.46, y0 + 30]]), shadeC(col, 0.82), 8);
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
    if (t === 'hoodie') { inkFill(g, pill(300 - bw * 0.3, y1 - 150, 300 + bw * 0.3, y1 - 50, 26), shadeC(col, 0.9), 5); ln(g, [[300 - bw * 0.3 + 12, y1 - 140], [300 - bw * 0.3 + 12, y1 - 60]], 3, 'rgba(26,20,22,.5)');
      for (const sd of [-1, 1]) { ln(g, [[300 + sd * 22, y0 + 20], [300 + sd * 26, y0 + 110]], 5, '#f2f0ea'); dt(g, 300 + sd * 26, y0 + 114, 6, '#f2f0ea'); }
      ln(g, [[x0 - 4, y1 - 22], [x1 + 4, y1 - 22]], 5, 'rgba(26,20,22,.55)'); }
    if (t === 'cardigan') { ln(g, [[300, y0 + 10], [300, y1 + 10]], 5); for (let k = 0; k < 4; k++) inkFill(g, ellP(312, y0 + 80 + k * 60, 7, 7, 0, 360, 12), '#e8d8f0', 3); for (const sd of [-1, 1]) inkFill(g, pill(300 + sd * 40 - 30, y0 + 230, 300 + sd * 40 + 30, y0 + 290, 10), shadeC(col, 0.86), 4); }
    if (t === 'raincoat') { for (const sd of [-1, 1]) inkFill(g, [[300 + sd * 4, y0 - 6], [300 + sd * 80, y0 - 6], [300 + sd * 30, y0 + 120]], shadeC(col, 0.9), 6); ln(g, [[300, y0 + 110], [300, y1 + 200]], 5); const y = y0 + 300; inkFill(g, [[x0 - 30, y], [x1 + 30, y], [x1 + 30, y + 26], [x0 - 30, y + 26]], shadeC(col, 0.8), 5); for (let k = 0; k < 3; k++) for (const sd of [-1, 1]) inkFill(g, ellP(300 + sd * 30, y0 + 160 + k * 70, 7, 7, 0, 360, 10), '#4a3a2a', 2); }
    if (t === 'torn') { ln(g, [[x0, y1 - 8], [x0 + 30, y1 - 40], [x0 + 60, y1 - 4], [x0 + 92, y1 - 46], [x0 + 130, y1 - 6], [x0 + 160, y1 - 36], [x1, y1 - 10]], 6); inkFill(g, ellP(340, y0 + 160, 24, 16), 'rgba(80,60,40,.5)', 0); }
    if (t === 'trim') { ln(g, [[x0 - 30, y1 - 12], [x1 + 30, y1 - 12]], 14, dc || '#e8c048'); }
  }
  g.restore(); inkFill(g, pts, null, 0);
  return { y0, y1, x0, x1 };
}
function drawShoe(g, a, b, sh) {
  const cx = (a[0] * 0.4 + b[0] * 0.6), cy = Math.max(a[1], b[1]) - 4, dir = Math.sign(b[0] - a[0]) || 1, pts = ellP(cx + dir * 6, cy, 40, 17, 0, 360, 24);
  g.save(); pth(g, pts); g.fillStyle = sh.c || '#b8343a'; g.fill(); g.clip();
  for (let x = cx - 60; x < cx + 60; x += 13) { g.fillStyle = 'rgba(30,20,40,.35)'; g.fillRect(x, cy - 30, 5, 60); }
  for (let y = cy - 20; y < cy + 20; y += 11) { g.fillStyle = 'rgba(30,20,40,.3)'; g.fillRect(cx - 60, y, 120, 4); }
  for (let x = cx - 60; x < cx + 60; x += 26) { g.fillStyle = 'rgba(255,240,220,.35)'; g.fillRect(x + 8, cy - 30, 2.5, 60); }
  g.restore(); inkFill(g, pts, null, 6); ln(g, [[cx - 30 + dir * 6, cy - 2], [cx + 34 + dir * 6, cy - 6]], 3, 'rgba(26,20,22,.6)');
}
function drawLegs(g, s, o, B) {
  const legs = o.legs || 'stand', st = o.step || 0, hipY = B.y1 - 14, c = s.legs || null;
  const lw = s.legW || 9;
  const L = (pts) => { if (c) { ln(g, pts, lw + 9); ln(g, pts, lw, c); if (s.cuff) { const q = pts[pts.length - 2]; dt(g, q[0], q[1] - 8, lw * 0.62, CK); dt(g, q[0], q[1] - 8, lw * 0.5 - 2, shadeC(c, 0.8)); } } else ln(g, pts, 8);
    if (s.shoes) drawShoe(g, pts[pts.length - 2], pts[pts.length - 1], s.shoes); };
  if (s.robe) { for (const sd of [-1, 1]) ln(g, [[300 + sd * 40, 925], [300 + sd * 44, 968], [300 + sd * 64, 968]], 8); return; }
  for (const sd of [-1, 1]) {
    const hx = 300 + sd * 36;
    if (legs === 'sit') L([[hx, hipY], [hx + sd * 26, hipY + 70], [hx + sd * 30, hipY + 200], [hx + sd * 52, hipY + 200]]);
    else if (legs === 'crouch') L([[hx, hipY], [hx + sd * 90, hipY + 100], [hx + sd * 60, 968], [hx + sd * 82, 968]]);
    else { const sw = legs === 'walk' ? Math.sin(st * Math.PI * 2 + (sd > 0 ? 0 : Math.PI)) * 34 : 0, lift = legs === 'walk' ? Math.max(0, Math.sin(st * Math.PI * 2 + (sd > 0 ? 0 : Math.PI))) * 18 : 0;
      L([[hx, hipY], [hx + sd * 8 + sw * 0.5, (hipY + 968) / 2 - lift * 0.3], [hx + sd * 10 + sw, 968 - lift], [hx + sd * 32 + sw, 968 - lift]]); }
  }
}

// ---------- story props (Zombie-Jahr) ----------
const tx = (g, str, x, y, size, col = '#1a1416', font = 'bold', align = 'center') => { g.font = `${font} ${size}px "DejaVu Sans", Arial, sans-serif`; g.textAlign = align; g.textBaseline = 'middle'; g.fillStyle = col; g.fillText(str, x, y); };
export const drawGisela = (g, x, y, k = 1, sway = 0) => { // red pot, five big leaves. (x,y) = pot bottom centre
  g.save(); g.translate(x, y); g.scale(k, k);
  const leaf = (a, L, w, col) => { g.save(); g.translate(0, -88); g.rotate(dg(a + sway * 6)); const pts = [[0, 0], ...ellP(0, -L / 2, w, L / 2, 90, 450, 24).map(([px, py]) => [px, py])];
    inkFill(g, pts, col, 5); ln(g, [[0, 0], [0, -L * 0.85]], 3, shadeC(col, 0.7)); g.restore(); };
  leaf(-58, 120, 28, '#3f9a4a'); leaf(56, 125, 28, '#3f9a4a'); leaf(-26, 150, 30, '#58b65a'); leaf(24, 145, 30, '#58b65a'); leaf(0, 170, 32, '#6cc864');
  inkFill(g, [[-58, -92], [58, -92], [44, 0], [-44, 0]], '#d2452e', 7);
  inkFill(g, [[-66, -104], [66, -104], [66, -84], [-66, -84]], '#e8573a', 7);
  ln(g, [[-36, -60], [-30, -14]], 4, 'rgba(255,220,200,.6)');
  g.restore();
};
export const drawPan = (g, x, y, ang = 0, k = 1) => { g.save(); g.translate(x, y); g.rotate(dg(ang)); g.scale(k, k);
  ln(g, [[0, 0], [0, -110]], 20); ln(g, [[0, 0], [0, -110]], 11, '#4a2e1e');
  inkFill(g, ellP(0, -190, 82, 82, 0, 360, 32), '#2c2c34', 8); inkFill(g, ellP(-6, -194, 62, 62, 0, 360, 32), '#46464f', 0); ln(g, ellP(-10, -198, 50, 50, 200, 260, 8), 6, 'rgba(255,255,255,.35)');
  g.restore(); };
export const drawBroom = (g, x, y, ang = 0) => { g.save(); g.translate(x, y); g.rotate(dg(ang));
  ln(g, [[0, 120], [0, -230]], 16); ln(g, [[0, 120], [0, -230]], 8, '#c8964e');
  inkFill(g, [[-50, -230], [50, -230], [56, -270], [-56, -270]], '#c43a34', 6);
  inkFill(g, [[-56, -270], [56, -270], [70, -380], [-70, -380]], '#e8c060', 7); for (let k = -50; k <= 50; k += 14) ln(g, [[k * 0.8, -276], [k, -372]], 3, '#a8802e');
  g.restore(); };
export const drawPhone = (g, x, y, k = 1, ang = 0) => { g.save(); g.translate(x, y); g.rotate(dg(ang)); g.scale(k, k);
  inkFill(g, [[-30, -56], [30, -56], [30, 56], [-30, 56]], '#22222c', 6); g.fillStyle = '#8fd0ff'; g.fillRect(-22, -46, 44, 86); g.restore(); };
export const drawCan = (g, x, y, label = 'Ravioli', col = '#d84a2a', k = 1) => { g.save(); g.translate(x, y); g.scale(k, k);
  inkFill(g, [[-40, -110], [40, -110], [40, 0], [-40, 0]], '#c8ccd4', 6); inkFill(g, [[-40, -92], [40, -92], [40, -18], [-40, -18]], col, 4);
  inkFill(g, ellP(0, -110, 40, 10), '#e0e4ea', 5); tx(g, label, 0, -55, label.length > 7 ? 14 : 19, '#fff8e8');
  g.restore(); };
export const drawBackpackStraps = (g) => { for (const sd of [-1, 1]) ln(g, [[300 + sd * 58, 356], [300 + sd * 66, 560]], 16, '#2e6a3a'); };
const PROPS2 = {
  pan: (g, x, y, side) => drawPan(g, x, y + 30, side * 10), panUp: (g, x, y, side) => drawPan(g, x, y + 20, side * 30, 1.05),
  broom: (g, x, y, side) => drawBroom(g, x, y + 40, -side * 8),
  phone: (g, x, y) => drawPhone(g, x, y - 20),
  gisela: (g, x, y) => drawGisela(g, x, y + 70, 0.8),
  can: (g, x, y) => drawCan(g, x, y + 60), cakecan: (g, x, y) => { drawCan(g, x, y + 60); ln(g, [[x, y - 50], [x, y - 110]], 9, '#f4f0e0'); inkFill(g, [[x, y - 150], [x + 10, y - 120], [x, y - 108], [x - 10, y - 120]], '#ffc040', 3); },
  cans: (g, x, y) => { for (let k = 0; k < 3; k++) drawCan(g, x - 20 + k * 6, y + 70 - k * 110, ['Ravioli', 'Pfirsiche', 'Linsen'][k], ['#d84a2a', '#e8a030', '#6a8a3a'][k], 0.9); },
  gummy: (g, x, y) => { inkFill(g, [[x - 46, y - 80], [x + 46, y - 80], [x + 52, y + 50], [x - 52, y + 50]], '#f2d23a', 6); tx(g, 'Gummi', x, y - 40, 26, '#d0302a'); tx(g, 'bärchen', x, y - 10, 24, '#d0302a'); for (const [dx, c] of [[-22, '#e0303a'], [0, '#3ab04a'], [22, '#f08a2a']]) inkFill(g, ellP(x + dx, y + 26, 10, 14), c, 3); },
  bread: (g, x, y) => { inkFill(g, ellP(x, y + 10, 64, 36), '#d89a4a', 6); for (const [dx, dy] of [[-20, 0], [14, 14], [30, -4]]) inkFill(g, ellP(x + dx, y + dy, 14, 10), '#7ab040', 0); },
  marker: (g, x, y) => { ln(g, [[x, y + 10], [x + 6, y - 50]], 16); ln(g, [[x, y + 10], [x + 6, y - 50]], 9, '#2a2a30'); },
  seeds: (g, x, y) => { inkFill(g, [[x - 40, y - 100], [x + 40, y - 100], [x + 40, y + 10], [x - 40, y + 10]], '#f4ead2', 5); inkFill(g, ellP(x, y - 50, 22, 22), '#e0402a', 4); tx(g, 'Tomaten', x, y - 8, 16, '#3a2a20'); },
  tomato: (g, x, y) => { inkFill(g, ellP(x, y - 6, 16, 13), '#e0402a', 4); ln(g, [[x - 6, y - 18], [x + 6, y - 18]], 4, '#3a8a3a'); },
  hoe: (g, x, y, side) => { ln(g, [[x, y + 140], [x, y - 220]], 14); ln(g, [[x, y + 140], [x, y - 220]], 7, '#b08048'); inkFill(g, [[x - 4, y - 220], [x + 60 * side, y - 210], [x + 60 * side, y - 180], [x - 4, y - 196]], '#8a8a96', 5); },
  spoon: (g, x, y) => { ln(g, [[x, y + 30], [x, y - 70]], 12); ln(g, [[x, y + 30], [x, y - 70]], 6, '#c8964e'); inkFill(g, ellP(x, y - 90, 18, 26), '#c8964e', 5); },
  shopbag: (g, x, y) => { ln(g, ellP(x, y + 10, 26, 30, 180, 360, 12), 5); inkFill(g, [[x - 54, y + 12], [x + 54, y + 12], [x + 46, y + 140], [x - 46, y + 140]], '#e8dcc0', 6);
    for (const [dx, c] of [[-26, '#58a848'], [6, '#e0b030'], [30, '#d04040']]) inkFill(g, ellP(x + dx, y + 6, 18, 22), c, 4); ln(g, [[x - 8, y + 6], [x - 4, y - 40]], 10, '#f0d890'); },
  breadbag: (g, x, y) => { inkFill(g, [[x - 34, y + 4], [x + 34, y + 4], [x + 30, y + 110], [x - 30, y + 110]], '#e8d0a0', 5); inkFill(g, ellP(x + 6, y - 2, 24, 30), '#d89a4a', 4); },
  plank: (g, x, y) => { inkFill(g, [[x - 110, y - 22], [x + 110, y - 30], [x + 112, y + 2], [x - 108, y + 10]], '#f2efe6', 6); tx(g, 'BILLY', x, y - 10, 22, '#555'); },
};

/** draw a character. spec: { body, bw, robe, cape, legs, legW, shoes, detail[], hair, hairStyle, hairLong, mous, mousStyle, beard, beardLen, stubble, goatee, hat, helm, headCol }
 *  opts: { expr, look, blink, turn, L, R, holdL, holdR, legs, step, tilt, headTilt, bob, seed, hunch, blanket, wear, phones, bandana, backpack, armW, tear } */
export const toonChar = (p, spec, opts = {}) => {
  const g = p.g, s0 = typeof spec === 'string' ? CAST[spec] : spec, o = { ...s0, ...opts }, s = o;
  g.save();
  const bob = (o.bob || 0) * 1000; g.translate(0, -bob);
  if (o.tilt) { g.translate(300, 975); g.rotate(dg(o.tilt)); g.translate(-300, -975); }
  if (o.backpack) { inkFill(g, pill(300 - 120, 380, 300 + 120, 690, 50), '#3a7a46', 8); }
  drawLegs(g, s, o, { y1: s.robe ? 925 : 705 });
  // hunch: everything above the hips leans forward (to screen right)
  if (o.hunch) { const py = s.robe ? 930 : 690, ang = s.robe ? 9 : 24; g.translate(300, py); g.rotate(dg(o.hunch * ang)); g.translate(-300, -py); }
  const B = drawBody(g, s, o);
  if (o.wear > 0.05) { // stains and patches
    g.save(); pth(g, pill(B.x0, B.y0, B.x1, B.y1, Math.min(90, (s.bw || 200) * 0.46))); g.clip();
    const st = [[250, 470, 22, 16], [340, 560, 30, 20], [280, 640, 18, 14], [356, 430, 14, 12], [230, 590, 16, 22]];
    st.forEach(([x, y, a, b], i) => { if (o.wear > i * 0.18) inkFill(g, ellP(x, y, a, b, 0, 360, 16).map(([px, py], k) => [px + (k % 3) * 2, py]), `rgba(92,70,40,${0.35 + 0.1 * (i % 2)})`, 0); });
    if (o.wear > 0.5) { inkFill(g, [[318, 600], [366, 596], [362, 640], [322, 646]], '#5a7ab8', 4); ln(g, [[322, 604], [360, 640]], 2, '#e8e0d0'); ln(g, [[360, 602], [326, 642]], 2, '#e8e0d0'); }
    if (o.wear > 0.7) ln(g, [[B.x0 + 4, 690], [B.x0 + 20, 668], [B.x0 + 34, 694], [B.x0 + 50, 670], [B.x0 + 64, 696]], 5);
    g.restore();
  }
  if (o.backpack) drawBackpackStraps(g);
  if (o.blanket) { // plaid blanket wrapped over the shoulders
    const bl = [[300 - 150, 380], [300 + 150, 380], [300 + 176, 820], [300 + 60, 850], [300 - 70, 846], [300 - 176, 826]];
    g.save(); pth(g, bl); g.fillStyle = '#b8743a'; g.fill(); g.clip();
    for (let x = 100; x < 520; x += 46) { g.fillStyle = 'rgba(80,40,30,.35)'; g.fillRect(x, 360, 16, 520); }
    for (let y = 380; y < 880; y += 46) { g.fillStyle = 'rgba(80,40,30,.3)'; g.fillRect(100, y, 420, 14); }
    for (let x = 120; x < 520; x += 92) { g.fillStyle = 'rgba(240,220,150,.45)'; g.fillRect(x, 360, 4, 520); }
    g.restore(); shaded(g, bl, null || 'rgba(0,0,0,0)', 'rgba(40,30,60,.25)', 8);
    ln(g, [[300, 390], [296, 600]], 5, 'rgba(26,20,22,.7)');
  }
  const sY = B.y0 + 48, shoulders = { '-1': [B.x0 + 16, sY], '1': [B.x1 - 16, sY] };
  const hr = 140 * (s.headScale || 1), H = { cx: 300 + (o.turn || 0) * 8, cy: 276, rx: hr, ry: hr * 0.9, seed: o.seed ?? 3 };
  g.save(); if (o.hunch) g.translate(o.hunch * 70, o.hunch * 70); g.translate(300, 380); g.rotate(dg((o.headTilt || 0) + (o.hunch || 0) * 18)); g.translate(-300, -380);
  if (o.hairLong > 0.12 && o.hair) { // long messy hair behind the head
    const Lh = 60 + 230 * o.hairLong, pts = [];
    for (let i = 0; i <= 36; i++) { const a = dg(160 + 220 * i / 36), r = (i % 2 ? 1.07 : 1.13); pts.push([H.cx + H.rx * r * Math.cos(a) * 1.05, H.cy - 10 + H.ry * r * Math.sin(a)]); }
    const back = [[H.cx + H.rx * 1.15, H.cy], ...Array.from({ length: 9 }, (_, k) => [H.cx + H.rx * (1.12 - 0.04 * (k % 2)) * (1 - k / 8 * 2) * 1.0, H.cy + Lh * (k % 2 ? 0.86 : 1) - Math.abs(k - 4) * 4]), [H.cx - H.rx * 1.15, H.cy]];
    shaded(g, [...pts, ...back.slice(0, 1), ...back.slice(1, -1), ...back.slice(-1)].filter(Boolean), shadeC(o.hair, 0.95), shadeC(o.hair, 0.7), 8);
  }
  if (s.helm) { shaded(g, wob(H.cx, H.cy + 6, H.rx * 1.16, H.ry * 1.2, 7, 0.01), s.helm, shadeC(s.helm, 0.66), 9); }
  const hp = s.helm ? wob(H.cx + (o.turn || 0) * 18, H.cy + 16, H.rx * 0.8, H.ry * 0.82, H.seed, 0.02) : wob(H.cx, H.cy, H.rx, H.ry, H.seed);
  shaded(g, hp, s.headCol || HEAD, s.headCol ? shadeC(s.headCol, 0.84) : HEAD_SH, 9.5, [-0.1, -0.06]);
  if (s.headCol) { inkFill(g, [[H.cx - 70, H.cy + 30], [H.cx - 52, H.cy + 44], [H.cx - 60, H.cy + 56]], null, 4); ln(g, [[H.cx + 60, H.cy - 70], [H.cx + 80, H.cy - 50]], 4); }
  if (s.helm) { inkFill(g, [[H.cx - 70, H.cy - 92], [H.cx + 96, H.cy - 104], [H.cx + 110, H.cy - 70], [H.cx - 60, H.cy - 64]], shadeC(s.helm, 1.08), 7); }
  const HH = s.helm ? { ...H, cy: H.cy + 16, rx: H.rx * 0.82, ry: H.ry * 0.82 } : H;
  if (o.back) { // back view: hair cap over the whole back of the head, no face
    const hc = o.hair || '#6a4024', cover = 0.35 + 0.5 * Math.min(1, (o.hairLong || 0) * 2), pts = [];
    for (let i = 0; i <= 40; i++) { const a = dg(180 + 180 * i / 40); pts.push([H.cx + H.rx * 1.04 * Math.cos(a), H.cy + H.ry * 1.04 * Math.sin(a)]); }
    for (let i = 0; i <= 10; i++) { const t = i / 10; pts.push([H.cx + H.rx * 1.02 * (1 - 2 * t), H.cy + H.ry * cover + (i % 2 ? -10 : 8)]); }
    shaded(g, pts, hc, shadeC(hc, 0.72), 8, [0.1, -0.1]);
    for (let k = 0; k < 4; k++) ln(g, [[H.cx - 60 + k * 40, H.cy - H.ry * 0.8], [H.cx - 70 + k * 44, H.cy + H.ry * cover * 0.7]], 3, mix(hc, '#ffffff', 0.3));
    if (o.phones) ln(g, ellP(H.cx, H.cy - 6, H.rx * 1.02, H.ry * 1.06, 190, 350, 24), 18, '#e04a3a');
    g.restore();
    for (const side of [-1, 1]) { const pose = side < 0 ? o.L : o.R, [sx, sy] = shoulders[side], pts2 = armPts(sx, sy, side, pose); if (o.sleeve) { ln(g, [pts2[0], pts2[1]], 33.5); ln(g, [pts2[0], pts2[1]], 24.5, o.sleeve); } ln(g, pts2, o.armW || 7.5); dt(g, pts2[2][0], pts2[2][1], 10.5);
      const kind = side < 0 ? o.holdL : o.holdR; if (PROPS2[kind]) PROPS2[kind](g, pts2[2][0], pts2[2][1], side); }
    g.restore(); return;
  }
  if (!s.helm) drawHair(g, H, o);
  if (o.hairLong > 0.35 && o.hair) for (let k = 0; k < 7; k++) { const x0 = H.cx - H.rx * 0.9 + k * H.rx * 0.3; ln(g, [[x0, H.cy - H.ry * 0.95], [x0 + 18 - (k % 2) * 30, H.cy - H.ry * 0.5 + (k % 3) * 8]], 6, shadeC(o.hair, 0.8)); }
  if (o.bandana) { const y = H.cy - H.ry * 0.62; inkFill(g, [[H.cx - H.rx * 0.98, y - 14], [H.cx + H.rx * 0.98, y - 18], [H.cx + H.rx * 1.0, y + 14], [H.cx - H.rx * 1.0, y + 18]], '#d22a2a', 6);
    inkFill(g, [[H.cx + H.rx * 0.95, y], [H.cx + H.rx * 1.5, y + 40], [H.cx + H.rx * 1.42, y + 60], [H.cx + H.rx * 0.95, y + 16]], '#d22a2a', 5); }
  drawFace(g, HH, o);
  drawHat(g, H, o);
  if (o.phones) { ln(g, ellP(H.cx, H.cy - 6, H.rx * 1.02, H.ry * 1.06, 190, 350, 24), 22); ln(g, ellP(H.cx, H.cy - 6, H.rx * 1.02, H.ry * 1.06, 190, 350, 24), 11, '#e04a3a');
    for (const sd of [-1, 1]) inkFill(g, pill(H.cx + sd * H.rx * 1.02 - 26, H.cy - 30, H.cx + sd * H.rx * 1.02 + 26, H.cy + 50, 22), '#e04a3a', 7); }
  g.restore();
  for (const side of [-1, 1]) {
    const pose = side < 0 ? o.L : o.R, [sx, sy] = shoulders[side], pts = armPts(sx, sy, side, pose);
    const aw = o.armW || 7.5;
    if (o.sleeve) { ln(g, [pts[0], pts[1]], aw + 26); ln(g, [pts[0], pts[1]], aw + 17, o.sleeve); }
    ln(g, pts, aw); if (aw > 9) { const m = pts[1]; dt(g, (pts[0][0] + m[0]) / 2, (pts[0][1] + m[1]) / 2, aw * 0.9); }
    dt(g, pts[2][0], pts[2][1], 10.5 + (aw - 7.5) * 0.4);
    const kind = side < 0 ? o.holdL : o.holdR;
    if (PROPS2[kind]) PROPS2[kind](g, pts[2][0], pts[2][1], side); else drawProp(g, kind, pts[2][0], pts[2][1], side);
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
