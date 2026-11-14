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
const wob = (cx, cy, rx, ry, seed, k = 0.035, n = 90, jawK = 0.08) => {
  const o = []; for (let i = 0; i < n; i++) {
    const a = i / n * Math.PI * 2, w = 1 + k * (Math.sin(3 * a + seed * 1.7) + 0.6 * Math.sin(5 * a + seed * 2.9) + 0.4 * Math.sin(2 * a + seed));
    const s = Math.sin(a), flat = s > 0 ? 1 - 0.07 * s * s : 1, jaw = s > 0 ? 1 - jawK * s * s : 1; o.push([cx + rx * w * Math.cos(a) * jaw, cy + ry * w * s * flat]);
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
  scared: { eye: 'round', pupil: 0.6, brow: 'worry', mouth: 'o' },
  bored: { eye: 'lid', brow: 'flat', mouth: 'flat' },
  jawdrop: { eye: 'round', pupil: 0.5, brow: 'high', mouth: 'drop' },
  sigh: { eye: 'closed', brow: 'worry', mouth: 'o' },
  glum: { eye: 'lid', brow: 'worry', mouth: 'frown' },
  panic: { eye: 'round', pupil: 0.45, brow: 'worry', mouth: 'wavy' },
  charm: { eye: 'lid', brow: 'up', mouth: 'smirk' },
  shy: { eye: 'arc', brow: 'worry', mouth: 'smile' },
  focus: { eye: 'lid', brow: 'angry', mouth: 'grit' },
  alert: { eye: 'round', pupil: 0.8, brow: 'flat', mouth: 'flat' },
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
    const by = eyeY - (o.glasses ? 42 : 30) * u - (E.brow === 'high' ? 4 * u : 0), bw = 19 * u * k, bt = 8.5 * u, s = e.s;
    const B = { smug: s < 0 ? [[-bw, 4], [bw, -6]] : [[-bw, -10], [bw, -2]], up: [[-bw, 2], [bw, -4 * s]], high: [[-bw, -10], [bw, -12]], flat: [[-bw, 0], [bw, 0]],
      worry: [[-bw, s > 0 ? -10 : 6], [bw, s > 0 ? 6 : -10]], angry: [[-bw, s > 0 ? 10 : -6], [bw, s > 0 ? -6 : 10]] }[E.brow] || [[-bw, 0], [bw, 0]];
    ln(g, B.map(([dx, dy]) => [x + dx, by + dy * u]), bt);
  }
  // glasses (thick frames), optional fog on the lenses
  if (o.glasses) {
    const G = o.glasses, fc = G.c || '#4a2618';
    for (const e of eyes) { const x = e.x, k = e.k, w = 33 * u * k, h = 27 * u, y = eyeY - 3 * u;
      const pts = []; for (let i = 0; i <= 28; i++) { const a = i / 28 * Math.PI * 2; const c = Math.cos(a), sn = Math.sin(a); pts.push([x + w * Math.sign(c) * Math.pow(Math.abs(c), 0.6), y + h * Math.sign(sn) * Math.pow(Math.abs(sn), 0.6)]); }
      g.save(); pth(g, pts); g.fillStyle = 'rgba(190,225,255,0.18)'; g.fill(); g.clip();
      ln(g, [[x - w * 0.6, y - h * 0.2], [x - w * 0.1, y - h * 0.8]], 5 * u, 'rgba(255,255,255,0.75)');
      if (G.fog) { g.fillStyle = `rgba(236,240,244,${Math.min(0.92, G.fog)})`; g.fillRect(x - w, y - h, 2 * w, 2 * h); for (let d = 0; d < 6; d++) dt(g, x - w * 0.6 + d * w * 0.24, y + h * 0.3 * Math.sin(d * 2.1), 3 * u, `rgba(255,255,255,${G.fog * 0.8})`); }
      g.restore(); inkFill(g, pts, null, 9 * u); ln(g, pts.slice(10, 20), 4 * u, fc);
    }
    ln(g, [[eyes[0].x + 31 * u * eyes[0].k, eyeY - 8 * u], [eyes[1].x - 31 * u * eyes[1].k, eyeY - 8 * u]], 7 * u);
  }
  if (o.goggles === 'down') {
    const lit = o.gogLit ?? 1;
    ln(g, [[cx - rx * 0.98, eyeY - 6 * u], [cx + rx * 0.98, eyeY - 6 * u]], 16 * u, '#2a2a30');
    for (const e of eyes) { const x = e.x;
      inkFill(g, ellP(x, eyeY - 4 * u, 30 * u * e.k, 28 * u, 0, 360, 30), '#3a3c44', 7 * u);
      const r = g.createRadialGradient(x, eyeY - 4 * u, 2, x, eyeY - 4 * u, 24 * u);
      r.addColorStop(0, `rgba(235,255,255,${0.6 + 0.4 * lit})`); r.addColorStop(0.6, `rgba(120,240,255,${0.35 + 0.6 * lit})`); r.addColorStop(1, `rgba(40,120,150,${0.9})`);
      g.fillStyle = r; g.beginPath(); g.ellipse(x, eyeY - 4 * u, 22 * u * e.k, 21 * u, 0, 0, 7); g.fill();
      ln(g, [[x - 10 * u, eyeY - 14 * u], [x - 2 * u, eyeY - 20 * u]], 4 * u, 'rgba(255,255,255,0.9)');
    }
  }
  if (o.blush) for (const e of eyes) {
    g.fillStyle = `rgba(240,96,120,${0.6 * o.blush})`; g.beginPath(); g.ellipse(e.x + (e.s > 0 ? 8 : -8) * u, eyeY + 30 * u, 22 * u * e.k, 11 * u, 0, 0, 7); g.fill();
    for (let d = -1; d <= 1; d++) ln(g, [[e.x + d * 10 * u - 3 * u, eyeY + 36 * u], [e.x + d * 10 * u + 4 * u, eyeY + 24 * u]], 3 * u, `rgba(200,50,80,${0.8 * o.blush})`);
  }
  if (o.sharp) { // cheekbones, smile creases and chin dimple
    for (const sd of [-1, 1]) ln(g, [[fx + sd * 46 * u, cy + 34 * u], [fx + sd * 50 * u, cy + 48 * u]], 3.5 * u);
    ln(g, [[fx - 4 * u, cy + 76 * u], [fx + 4 * u, cy + 76 * u]], 3.5 * u);
  }
  if (o.sweat) for (let d = 0; d < o.sweat; d++) { const x = cx + (d % 2 ? 1 : -1) * (70 + d * 9) * u, y = cy - 40 * u + d * 14 * u; inkFill(g, [[x, y - 14 * u], [x + 8 * u, y + 2 * u], [x, y + 9 * u], [x - 8 * u, y + 2 * u]], '#bfe8ff', 3.5 * u); }
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
  else if (M === 'drop') { inkFill(g, ellP(mx, my + 18 * u, 22 * u, 34 * u, 0, 360, 24), '#4a1c24', 6 * u); inkFill(g, ellP(mx, my + 38 * u, 14 * u, 9 * u), '#e8707a', 0); }
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
  } else if (st === 'curly') { // front curls (the big puff behind the head is drawn by backHair)
    const curls = []; for (let i = 0; i <= 9; i++) { const a = dg(196 + 148 * i / 9); curls.push([cx + rx * 0.92 * Math.cos(a), cy + ry * 0.9 * Math.sin(a) + 4 * u, (24 + (i % 3) * 5) * u]); }
    for (let i = 0; i < 5; i++) curls.push([cx - 56 * u + i * 28 * u, cy - 58 * u + (i % 2) * 8 * u, 22 * u]);
    for (const [x, y, r] of curls) inkFill(g, ellP(x, y, r, r * 0.92, 0, 360, 18), null, 13 * u);
    for (const [x, y, r] of curls) inkFill(g, ellP(x, y, r, r * 0.92, 0, 360, 18), c, 0);
    for (const [x, y, r] of curls) ln(g, ellP(x - r * 0.1, y - r * 0.05, r * 0.5, r * 0.45, 200, 470, 12), 3.5 * u, mix(c, '#ffffff', 0.38));
  } else if (st === 'slick') { // combed-back, high hairline, shine
    const pts = []; for (let i = 0; i <= 26; i++) { const a = dg(186 + 168 * i / 26); pts.push([cx + rx * 1.03 * Math.cos(a), cy + ry * 1.03 * Math.sin(a)]); }
    pts.push([cx + rx * 0.9, cy - 46 * u], [cx + 40 * u, cy - 66 * u], [cx + 8 * u, cy - 62 * u], [cx - 2 * u, cy - 52 * u], [cx - 14 * u, cy - 64 * u], [cx - 50 * u, cy - 66 * u], [cx - rx * 0.9, cy - 44 * u]);
    shaded(g, pts, c, shadeC(c, 0.6), 8 * u, [-0.08, -0.1]);
    g.save(); pth(g, pts); g.clip(); for (let k = 0; k < 4; k++) ln(g, ellP(cx + 70 * u, cy + 10 * u, (110 + k * 14) * u, (100 + k * 8) * u, 205 + k * 3, 250 + k * 3, 10), 3.5 * u, mix(c, '#c8d0ff', 0.45)); g.restore();
    for (const sd of [-1, 1]) inkFill(g, [[cx + sd * rx * 0.97, cy - 44 * u], [cx + sd * rx * 1.02, cy + 6 * u], [cx + sd * rx * 0.88, cy + 6 * u], [cx + sd * rx * 0.86, cy - 40 * u]], c, 5 * u);
  } else if (st === 'buzz') {
    const pts = []; for (let i = 0; i <= 24; i++) { const a = dg(196 + 148 * i / 24); pts.push([cx + rx * 1.01 * Math.cos(a), cy + ry * 1.01 * Math.sin(a)]); }
    pts.push([cx + rx * 0.9, cy - 50 * u], [cx, cy - 60 * u], [cx - rx * 0.9, cy - 50 * u]);
    shaded(g, pts, c, shadeC(c, 0.7), 6 * u);
    const r = (() => { let s_ = 7; return () => ((s_ = (s_ * 16807) % 2147483647) / 2147483647); })();
    for (let i = 0; i < 60; i++) { const a = dg(200 + 140 * r()), d = 0.62 + 0.36 * r(); dt(g, cx + rx * d * Math.cos(a), cy + ry * d * Math.sin(a), 2.6 * u, shadeC(c, 0.62)); }
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
      if (h.badge !== false) inkFill(g, [[cx, top - 34 * u], [cx + 12 * u, top - 20 * u], [cx, top - 6 * u], [cx - 12 * u, top - 20 * u]], '#e8b84a', 4 * u);
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
  else if (kind === 'drawing') { const w = 140, h = 104; g.save(); g.translate(x + side * 30, y - 40); g.rotate(dg(side * 6));
    inkFill(g, [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]], '#fbf4e2', 5);
    const pc = '#5a5a66'; ln(g, ellP(-8, 6, 30, 22, 0, 360, 20), 3.5, pc); ln(g, ellP(32, -14, 20, 18, 0, 360, 16), 3.5, pc); ln(g, [[44, -6], [56, -2], [46, 4]], 3.5, pc);
    ln(g, [[20, -28], [16, -44], [28, -32]], 3.5, pc); ln(g, [[38, -30], [44, -46], [46, -30]], 3.5, pc); dt(g, 34, -16, 3, pc);
    for (const lx of [-28, -14, 6, 16]) ln(g, [[lx, 24], [lx, 38]], 3.5, pc); ln(g, [[-38, 0], [-54, -16]], 3.5, pc);
    ln(g, [[-60, 46], [60, 44]], 2.5, '#9aa0a8'); g.restore(); }
  else if (kind === 'cooler') { ln(g, [[x - 40, y + 50], [x, y], [x + 40, y + 50]], 7, '#2a3a5a'); inkFill(g, pill(x - 62, y + 46, x + 62, y + 150, 16), '#3a7ac8', 6); inkFill(g, pill(x - 64, y + 42, x + 64, y + 66, 10), '#f2f4f6', 5); ln(g, [[x - 50, y + 100], [x + 50, y + 100]], 4, '#2a5a98'); }
  else if (kind === 'package') { g.save(); g.translate(x, y + 26); g.rotate(dg(-side * 5)); inkFill(g, [[-62, -34], [62, -34], [62, 34], [-62, 34]], '#d8b48a', 6); ln(g, [[-62, 0], [62, 0]], 9, '#e8dcc0'); ln(g, [[0, -34], [0, 34]], 9, '#e8dcc0');
    inkFill(g, [[-48, -26], [-6, -26], [-6, -6], [-48, -6]], '#ffffff', 3); g.fillStyle = '#b8202a'; g.font = 'bold 9px "DejaVu Sans", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('Hackfleisch', -27, -16); g.restore(); }
  else if (kind === 'flashlight') { g.save(); g.translate(x, y); g.rotate(dg(side > 0 ? -12 : 192)); inkFill(g, [[-14, -12], [56, -16], [56, 16], [-14, 12]], '#2c2e36', 5); inkFill(g, [[56, -20], [70, -22], [70, 22], [56, 20]], '#4a4e58', 5); inkFill(g, ellP(71, 0, 5, 19, 0, 360, 14), '#fffbe0', 3); g.restore(); }
  else if (kind === 'saw') { g.save(); g.translate(x, y); g.rotate(dg(side > 0 ? 8 : 172)); inkFill(g, [[-18, -16], [20, -16], [20, 18], [-18, 18]], '#c43a30', 5);
    ln(g, [[20, -10], [40, -60], [190, -60], [200, 0]], 9, '#8a9098'); ln(g, [[20, 2], [200, 2]], 7, '#e8eef4'); for (let k = 26; k < 198; k += 9) ln(g, [[k, 6], [k + 4, 12]], 2.5); g.restore(); }
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
    if (t === 'zip') { ln(g, [[300, y0 + 4], [300, y1 - 30]], 6, shadeC(col, 0.55)); for (let y = y0 + 20; y < y1 - 34; y += 14) ln(g, [[296, y], [304, y]], 2.5, shadeC(col, 0.45)); inkFill(g, [[294, y0 + 60], [306, y0 + 60], [308, y0 + 84], [292, y0 + 84]], '#c8ccd2', 3); }
    if (t === 'jcollar') for (const sd of [-1, 1]) inkFill(g, [[300 + sd * 4, y0 - 8], [300 + sd * 66, y0 - 8], [300 + sd * 54, y0 + 40], [300 + sd * 10, y0 + 16]], dc || shadeC(col, 0.85), 5);
    if (t === 'patch') { inkFill(g, [[300 + bw * 0.12, y0 + 64], [300 + bw * 0.4, y0 + 64], [300 + bw * 0.4, y0 + 96], [300 + bw * 0.12, y0 + 96]], '#f2f2ea', 4); for (let k = 0; k < 5; k++) ln(g, [[300 + bw * 0.16 + k * bw * 0.05, y0 + 72], [300 + bw * 0.16 + k * bw * 0.05, y0 + 88]], k % 2 ? 2.5 : 4.5); }
    if (t === 'cardigan') { const bc = dc || '#f3e6d2'; inkFill(g, [[300 - 34, y0 - 10], [300 + 34, y0 - 10], [300 + 30, y1 + 10], [300 - 30, y1 + 10]], bc, 5);
      for (let y = y0 + 6; y < y0 + 40; y += 10) ln(g, [[300 - 30, y], [300, y + 8], [300 + 30, y]], 3, shadeC(bc, 0.8));
      for (const sd of [-1, 1]) ln(g, [[300 + sd * 34, y0 - 10], [300 + sd * 32, y1 + 10]], 6, shadeC(col, 0.6));
      for (let k = 0; k < 4; k++) inkFill(g, ellP(300 - 46, y0 + 70 + k * 62, 9, 9, 0, 360, 12), '#f6d9a0', 3);
      for (const sd of [-1, 1]) inkFill(g, pill(300 + sd * 58 - 30, y1 - 120, 300 + sd * 58 + 30, y1 - 70, 8), shadeC(col, 0.9), 4);
      for (let y = y1 - 30; y < y1 + 10; y += 9) ln(g, [[x0, y], [x1, y]], 2.5, shadeC(col, 0.75)); }
    if (t === 'tape') for (const sd of [-1, 1]) { const ax = 300 + sd * 48, bx = 300 + sd * 64, ay = y0 - 4, by = y0 + 210;
      ln(g, [[ax, ay], [bx, by]], 22); ln(g, [[ax, ay], [bx, by]], 15, '#f4c838');
      for (let k = 1; k < 20; k++) { const tt = k / 20, x = ax + (bx - ax) * tt, y = ay + (by - ay) * tt; ln(g, [[x - 6, y], [x - (k % 5 ? 1 : -3), y]], 2.2); }
      inkFill(g, [[bx - 9, by], [bx + 9, by], [bx + 9, by + 16], [bx - 9, by + 16]], '#c8ccd4', 3); }
    if (t === 'polvest') { inkFill(g, [[x0 - 5, y0 + 30], [x1 + 5, y0 + 30], [x1 + 5, y1 - 40], [x0 - 5, y1 - 40]], '#1c2438', 6);
      for (const yy of [y0 + 156, y0 + 196]) { inkFill(g, [[x0 - 5, yy], [x1 + 5, yy], [x1 + 5, yy + 14], [x0 - 5, yy + 14]], '#d6dde8', 3); }
      g.fillStyle = '#f4f6fa'; g.font = 'bold 33px "DejaVu Sans", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('POLIZEI', 300, y0 + 104); }
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
  if (s.hairStyle === 'curly' && s.hair) backHair(g, H, s.hair);
  const hp = s.helm ? wob(H.cx + (o.turn || 0) * 18, H.cy + 16, H.rx * 0.8, H.ry * 0.82, H.seed, 0.02) : wob(H.cx, H.cy, H.rx, H.ry, H.seed, 0.035, 90, s.jawK ?? 0.08);
  shaded(g, hp, HEAD, HEAD_SH, 9.5, [-0.1, -0.06]);
  if (s.helm) { inkFill(g, [[H.cx - 70, H.cy - 92], [H.cx + 96, H.cy - 104], [H.cx + 110, H.cy - 70], [H.cx - 60, H.cy - 64]], shadeC(s.helm, 1.08), 7); }
  const HH = s.helm ? { ...H, cy: H.cy + 16, rx: H.rx * 0.82, ry: H.ry * 0.82 } : H;
  if (!s.helm) drawHair(g, H, o);
  drawFace(g, HH, o);
  if (o.goggles === 'up') { const u = H.rx / 100, gy = H.cy - 70 * u, lit = o.gogLit ?? 0;
    ln(g, ellP(H.cx, H.cy + 30 * u, H.rx * 1.0, 100 * u, 200, 340, 20), 15 * u, '#2a2a30');
    for (const sd of [-1, 1]) { const x = H.cx + sd * 38 * u + (o.turn || 0) * 20 * u;
      inkFill(g, ellP(x, gy, 27 * u, 24 * u, 0, 360, 24), '#3a3c44', 7 * u); inkFill(g, ellP(x, gy, 18 * u, 16 * u, 0, 360, 24), lit ? '#c8fbff' : '#6aa8b8', 0); ln(g, [[x - 8 * u, gy - 8 * u], [x - 2 * u, gy - 12 * u]], 3.5 * u, '#ffffff'); }
    inkFill(g, ellP(H.cx + (o.turn || 0) * 20 * u, gy - 34 * u, 13 * u, 11 * u, 0, 360, 18), lit ? '#f4ffff' : '#9ab0b8', 5 * u); }
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


// ===================== story additions =====================
function backHair(g, H, c) { // big puffy curly cloud behind the head
  const { cx, cy, rx, ry } = H, u = rx / 100, cs = [];
  for (let i = 0; i < 16; i++) { const a = dg(150 + 240 * i / 15); cs.push([cx + rx * 1.12 * Math.cos(a), cy - 8 * u + ry * 1.08 * Math.sin(a), (40 + (i % 3) * 8) * u]); }
  for (const sd of [-1, 1]) for (let k = 0; k < 3; k++) cs.push([cx + sd * rx * (1.08 - k * 0.04), cy + (24 + k * 30) * u, (36 - k * 4) * u]);
  for (const [x, y, r] of cs) inkFill(g, ellP(x, y, r, r * 0.95, 0, 360, 20), null, 14 * u);
  for (const [x, y, r] of cs) inkFill(g, ellP(x, y, r, r * 0.95, 0, 360, 20), shadeC(c, 0.86), 0);
  for (const [x, y, r] of cs) ln(g, ellP(x - r * 0.15, y - r * 0.1, r * 0.5, r * 0.45, 190, 460, 12), 4 * u, mix(c, '#ffffff', 0.3));
}

const _off = [];
const offC = (i, w, h) => { let c = _off[i]; if (!c) { c = document.createElement('canvas'); _off[i] = c; } if (c.width !== w || c.height !== h) { c.width = w; c.height = h; } const g = c.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.filter = 'none'; g.clearRect(0, 0, w, h); return [c, g]; };
/** draw any card drawing fn with scene lighting baked in.
 *  lit = { shade: 'rgba(..)' (colour wash over the whole figure), rims: [{ c, dir: [dx,dy] toward the light (screen), w: px, a }] , glow: [{c, x, y, r, a}] } */
export const lit = (p, fn, L = {}) => {
  const tgt = p.g, W = tgt.canvas.width, H = tgt.canvas.height, T = tgt.getTransform();
  const [A, a] = offC(0, W, H); a.setTransform(T); fn({ g: a });
  a.setTransform(1, 0, 0, 1, 0, 0);
  if (L.shade) { a.globalCompositeOperation = 'source-atop'; a.fillStyle = L.shade; a.fillRect(0, 0, W, H); }
  if (L.grad) { a.globalCompositeOperation = 'source-atop'; const gr = a.createLinearGradient(L.grad.x0 * W, L.grad.y0 * H, L.grad.x1 * W, L.grad.y1 * H); gr.addColorStop(0, L.grad.c0); gr.addColorStop(1, L.grad.c1); a.fillStyle = gr; a.fillRect(0, 0, W, H); }
  a.globalCompositeOperation = 'source-over';
  tgt.save(); tgt.setTransform(1, 0, 0, 1, 0, 0); tgt.drawImage(A, 0, 0);
  for (const R of L.rims || []) {
    const [B, b] = offC(1, W, H), d = R.w || 40, e = R.e ?? 18, n = Math.hypot(R.dir[0], R.dir[1]) || 1, dx = R.dir[0] / n, dy = R.dir[1] / n;
    b.drawImage(A, 0, 0); b.globalCompositeOperation = 'destination-out'; b.drawImage(A, -dx * d, -dy * d);
    b.globalCompositeOperation = 'destination-in'; b.drawImage(A, -dx * e, -dy * e);
    b.globalCompositeOperation = 'source-in'; b.fillStyle = R.c; b.fillRect(0, 0, W, H);
    if (R.fade !== false) { const y0 = (R.y0 ?? 0.66) * H, y1 = (R.y1 ?? 0.78) * H, gr = b.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); b.globalCompositeOperation = 'destination-in'; b.fillStyle = gr; b.fillRect(0, 0, W, H); }
    tgt.globalAlpha = R.a ?? 0.95; tgt.globalCompositeOperation = R.add ? 'lighter' : 'source-over'; tgt.filter = `blur(${R.blur ?? 2}px)`; tgt.drawImage(B, 0, 0);
    tgt.filter = 'none'; tgt.globalAlpha = 1; tgt.globalCompositeOperation = 'source-over';
  }
  tgt.restore();
};
export const litChar = (p, spec, o, L) => lit(p, (q) => toonChar(q, spec, o), L);

/** tracking dog (side view, facing right). o: { step, sniff, tongue } */
export const dogChar = (p, o = {}) => {
  const g = p.g, st = o.step || 0, body = '#9a6434', saddle = '#2a2220', tan = '#d8a868';
  g.save(); if (o.bob) g.translate(0, -o.bob * 1000);
  for (const [lx, ph] of [[220, 0], [250, 0.5], [380, 0.5], [410, 0]]) { const sw = Math.sin((st + ph) * Math.PI * 2) * 22; ln(g, [[lx, 770], [lx + sw * 0.4, 870], [lx + sw, 968]], 20); ln(g, [[lx, 770], [lx + sw * 0.4, 870], [lx + sw, 968]], 11, ph ? tan : body); }
  ln(g, [[170, 740], [110, 700], [80, 640]], 22); ln(g, [[170, 740], [110, 700], [80, 640]], 13, body);
  shaded(g, ellP(300, 750, 150, 66, 0, 360, 40), body, shadeC(body, 0.75), 9);
  g.save(); pth(g, ellP(300, 750, 150, 66, 0, 360, 40)); g.clip(); inkFill(g, ellP(280, 700, 130, 50, 0, 360, 30), saddle, 0); inkFill(g, ellP(330, 805, 110, 30, 0, 360, 30), tan, 0); g.restore();
  ln(g, [[372, 708], [380, 790]], 12, '#c4302a');
  const hy = o.sniff ? 740 : 660, hx = 450;
  inkFill(g, [[hx - 40, hy - 50], [hx - 34, hy - 120], [hx - 6, hy - 60]], saddle, 7); inkFill(g, [[hx + 6, hy - 60], [hx + 20, hy - 126], [hx + 40, hy - 52]], saddle, 7);
  shaded(g, ellP(hx, hy, 62, 54, 0, 360, 30), body, shadeC(body, 0.75), 9);
  shaded(g, ellP(hx + 66, hy + 22, 50, 26, 0, 360, 24), tan, shadeC(tan, 0.8), 8);
  dt(g, hx + 112, hy + 14, 12); dt(g, hx + 10, hy - 12, 9);
  if (o.tongue) inkFill(g, [[hx + 70, hy + 44], [hx + 92, hy + 44], [hx + 90, hy + 76], [hx + 76, hy + 78]], '#e8707a', 5);
  g.restore();
};
/** two pairs of eyes peeking out of the dark (manhole). o: { look, blink, open } */
export const eyesCard = (p, o = {}) => {
  const g = p.g, lk = o.look || 0;
  if (o.bg) { const r = g.createRadialGradient(300, 525, 20, 300, 525, 260); r.addColorStop(0, 'rgba(4,4,8,0.95)'); r.addColorStop(0.7, 'rgba(4,4,8,0.85)'); r.addColorStop(1, 'rgba(4,4,8,0)'); g.fillStyle = r; g.beginPath(); g.ellipse(300, 525, 290, 120, 0, 0, 7); g.fill(); }
  for (const [x, lid, seed] of [[205, 1, 0], [395, 0, 1]]) for (const sd of [-1, 1]) {
    const ex = x + sd * 40, ey = 520, bl = o.blink && seed === (o.blinkWho ?? 0);
    g.fillStyle = 'rgba(255,240,200,0.18)'; g.beginPath(); g.ellipse(ex, ey, 40, 34, 0, 0, 7); g.fill();
    if (bl) { ln(g, [[ex - 20, ey], [ex + 20, ey]], 7, '#f4f0e6'); continue; }
    inkFill(g, ellP(ex, ey, 21, lid ? 14 : 23, 0, 360, 24), '#fbf8f0', 6); dt(g, ex + lk * 9, ey + (lid ? 3 : 0), 8);
    if (lid) ln(g, [[ex - 22, ey - 8], [ex + 22, ey - 10]], 7);
    ln(g, [[ex - 20, ey - (lid ? 30 : 36)], [ex + 20, ey - (lid ? (sd < 0 ? 26 : 36) : 40)]], 8, '#efe6d6');
  }
};
/** insert: her raised finger with the thread wrapping around it. t 0..1 */
export const handThread = (p, t, o = {}) => {
  const g = p.g, sl = o.sleeve || '#b8607a';
  inkFill(g, pill(190, 760, 410, 1000, 40), sl, 10); for (let y = 790; y < 840; y += 12) ln(g, [[196, y], [404, y]], 3, shadeC(sl, 0.7));
  const palm = [[214, 760], [212, 610], [236, 560], [300, 548], [372, 560], [396, 610], [392, 760]];
  shaded(g, palm, HEAD, HEAD_SH, 10);
  const fing = pill(262, 330, 330, 600, 34); shaded(g, fing, HEAD, HEAD_SH, 10);
  for (const [xx, yy] of [[232, 600], [300, 612], [362, 604]]) ln(g, ellP(xx, yy, 26, 14, 200, 340, 10), 6);
  inkFill(g, pill(372, 640, 470, 690, 25), HEAD, 10);
  ln(g, ellP(296, 352, 18, 10, 200, 340, 10), 4, '#d8d2c8');
  const n = Math.floor(1 + t * 7), tc = '#d8303a';
  const path = [[0, 470 - t * 30], [140, 450 - t * 20], [262, 520 - n * 18]];
  ln(g, path, 9); ln(g, path, 5, tc);
  for (let k = 0; k < n; k++) { const y = 520 - k * 18; ln(g, [[256, y + 6], [296, y - 4], [336, y - 12]], 9); ln(g, [[256, y + 6], [296, y - 4], [336, y - 12]], 5.5, tc); }
};
/** Gesucht poster portrait helper: draws the two inmate heads into ctx g at (x,y,scale) */
export const drawHead = (g, spec, o, x, y, sc) => { g.save(); g.translate(x, y); g.scale(sc, sc); g.translate(-300, -300); toonChar({ g }, spec, o); g.restore(); };
