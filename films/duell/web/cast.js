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
  const _pale = o.pale || 0; if (_pale) { /* drained colours */ }
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
  const g = p.g, s0 = typeof spec === 'string' ? CAST[spec] : spec, s = { ...s0, ...(opts.specOver || {}) }, o = { ...s, ...opts };
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
  shaded(g, hp, o.headCol || HEAD, o.headSh || HEAD_SH, 9.5, [-0.1, -0.06]);
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

// ======================= story additions: duel on the river island =======================
/** cavalry sabre drawn from the hand point (x,y), angle in degrees (0 = blade straight up, 90 = to the right) */
export const drawSabre = (g, x, y, ang = 0, len = 340, glint = 0) => {
  g.save(); g.translate(x, y); g.rotate(dg(ang));
  // blade: slight curve
  const bl = [[-11, -18], [-14, -len * 0.5], [-7, -len * 0.93], [8, -len], [14, -len * 0.55], [12, -18]];
  inkFill(g, bl, '#e4ecf6', 6);
  ln(g, [[-2, -26], [-3, -len * 0.55], [1, -len * 0.92]], 3, '#ffffff');
  ln(g, [[4, -26], [5, -len * 0.5]], 2, '#8a96a8');
  // guard (brass D-guard) + grip + pommel
  inkFill(g, [[-26, -14], [26, -14], [26, -4], [-26, -4]], '#e2b84c', 4);
  ln(g, [[24, -10], [34, 20], [24, 58]], 6, '#e2b84c'); ln(g, [[24, -10], [34, 20], [24, 58]], 2, CK);
  inkFill(g, [[-8, -4], [8, -4], [9, 52], [-9, 52]], '#3a2418', 4);
  for (let k = 0; k < 4; k++) ln(g, [[-8, 6 + k * 12], [8, 12 + k * 12]], 2, '#c8a050');
  inkFill(g, ellP(0, 58, 11, 9), '#e2b84c', 4);
  if (glint > 0) { // 4-point star at the tip
    const r = 70 * glint, cx = 4, cy = -len * 0.82;
    g.globalAlpha = Math.min(1, glint * 1.4);
    inkFill(g, [[cx, cy - r], [cx + r * 0.16, cy - r * 0.16], [cx + r, cy], [cx + r * 0.16, cy + r * 0.16], [cx, cy + r], [cx - r * 0.16, cy + r * 0.16], [cx - r, cy], [cx - r * 0.16, cy - r * 0.16]], '#fffbe0', 0);
    const rg = g.createRadialGradient(cx, cy, 0, cx, cy, r * 0.9); rg.addColorStop(0, 'rgba(255,250,210,.9)'); rg.addColorStop(1, 'rgba(255,240,180,0)'); g.fillStyle = rg; g.fillRect(cx - r, cy - r, r * 2, r * 2);
    g.globalAlpha = 1;
  }
  g.restore();
};
const tallTopHat = (g, cx, top, u, tilt = 0) => {
  g.save(); g.translate(cx, top + 20 * u); g.rotate(dg(tilt)); g.translate(-cx, -(top + 20 * u));
  const pts = [[cx - 58 * u, top + 14 * u], [cx - 54 * u, top - 150 * u], [cx - 50 * u, top - 156 * u], [cx + 50 * u, top - 156 * u], [cx + 54 * u, top - 150 * u], [cx + 58 * u, top + 14 * u]];
  shaded(g, pts, '#1f1c24', '#0e0c12', 8 * u, [-0.18, 0]);
  ln(g, [[cx - 40 * u, top - 140 * u], [cx - 38 * u, top - 20 * u]], 5 * u, '#4a4658');
  inkFill(g, [[cx - 58 * u, top - 18 * u], [cx + 58 * u, top - 18 * u], [cx + 58 * u, top + 6 * u], [cx - 58 * u, top + 6 * u]], '#3a3444', 5 * u);
  inkFill(g, ellP(cx, top + 16 * u, 104 * u, 15 * u), '#1f1c24', 7 * u);
  g.restore();
};
/** The tall man. Design 600x1000, soles at 968. Long legs, long arms, short coat sleeves.
 * o: expr, turn, look, blink, L, R ({x,y} or pose name), legs ('stand'|'walk'|'sit'), step, old (0..2: 1 suit, 2 suit+beard), hat (0..1 pop scale),
 *    sabre {x,y,ang,len,glint} (drawn behind the hands), fit (scale about the feet), bob, tilt, headTilt, quill */
export const lanky = (p, o = {}) => {
  const g = p.g; g.save();
  const fit = o.fit || 1; g.translate(300, 968); g.scale(fit, fit); g.translate(-300, -968);
  g.translate(0, -(o.bob || 0) * 1000);
  if (o.tilt) { g.translate(300, 968); g.rotate(dg(o.tilt)); g.translate(-300, -968); }
  const old = o.old || 0, coat = old ? '#1d1a22' : '#5a3a24', pants = old ? '#1d1a22' : '#2a2226', boot = '#1a120e';
  const y0 = 236, y1 = 548, bw = 148, x0 = 300 - bw / 2, x1 = 300 + bw / 2, hipY = 540;
  const legs = o.legs || 'stand', st = o.step || 0;
  // legs
  for (const sd of [-1, 1]) {
    const hx = 300 + sd * 30;
    let pts;
    if (legs === 'sit') pts = [[hx, hipY], [hx + sd * 10 + 150, hipY + 30], [hx + sd * 10 + 140, 760], [hx + sd * 10 + 175, 768]];
    else { const ph = st * Math.PI * 2 + (sd > 0 ? 0 : Math.PI), sw = legs === 'walk' ? Math.sin(ph) * 46 : 0, lift = legs === 'walk' ? Math.max(0, Math.sin(ph)) * 24 : 0;
      pts = [[hx, hipY], [hx + sd * 10 + sw * 0.5, 760 - lift * 0.4], [hx + sd * 12 + sw, 962 - lift], [hx + sd * 44 + sw, 962 - lift]]; }
    ln(g, pts.slice(0, 3), 30); ln(g, pts.slice(0, 3), 20, pants);
    // knee-high boots
    const k = pts[1], a = pts[2], b = pts[3], bt = [k[0] + (a[0] - k[0]) * 0.35, k[1] + (a[1] - k[1]) * 0.35];
    ln(g, [bt, a, b], 34); ln(g, [bt, a, b], 24, old ? '#141216' : boot);
    if (!old) ln(g, [[bt[0] - 13, bt[1]], [bt[0] + 13, bt[1]]], 8, '#6a4a30');
  }
  // coat tails behind
  { const fl = o.flap || 0; inkFill(g, [[x0 + 4, 420], [x1 - 4, 420], [x1 + 18 + fl * 60, 640 - fl * 30], [300 + 6 + fl * 30, 612 - fl * 10], [300 - 6 + fl * 24, 612 - fl * 6], [x0 - 18 + fl * 40, 640 - fl * 14]], shadeC(coat, 0.85), 8); }
  // torso
  const tp = pill(x0, y0, x1, y1, 62);
  shaded(g, tp, coat, coolShade(coat), 9);
  g.save(); pth(g, tp); g.clip();
  if (o.back) { ln(g, [[300, y0 + 20], [300, y1 + 10]], 4, shadeC(coat, 0.7)); ln(g, [[x0 + 20, y1 - 70], [x1 - 20, y1 - 70]], 6, shadeC(coat, 0.7)); } else {
  // shirt + vest
  inkFill(g, [[300 - 40, y0 - 10], [300 + 40, y0 - 10], [300 + 30, y1 + 10], [300 - 30, y1 + 10]], old ? '#f4f2ec' : '#f6f2e6', 5);
  inkFill(g, [[300 - 34, y0 + 70], [300, y0 + 40], [300 + 34, y0 + 70], [300 + 30, y1 + 10], [300 - 30, y1 + 10]], old ? '#2a2632' : '#141216', 5);
  for (let k = 0; k < 4; k++) dt(g, 300, y0 + 90 + k * 50, 5, '#c8a050');
  // lapels
  for (const sd of [-1, 1]) inkFill(g, [[300 + sd * 40, y0 - 10], [300 + sd * 66, y0 + 10], [300 + sd * 36, y0 + 150]], shadeC(coat, 1.25), 6);
  }
  g.restore();
  if (o.back) {} else if (old) inkFill(g, [[300 - 26, y0 + 4], [300, y0 + 16], [300 + 26, y0 + 4], [300 + 26, y0 + 30], [300, y0 + 18], [300 - 26, y0 + 30]], '#141216', 4); // bow tie
  else inkFill(g, [[300 - 30, y0 - 6], [300, y0 + 22], [300 + 30, y0 - 6]], '#ffffff', 5); // open collar
  // sabre (behind hands)
  if (o.sabre) drawSabre(g, o.sabre.x, o.sabre.y, o.sabre.ang || 0, o.sabre.len || 340, o.sabre.glint || 0);
  const drawArms = () => {
  // arms: coat sleeve (too short) + bare wrist stick
  const sh = { '-1': [x0 + 18, y0 + 34], '1': [x1 - 18, y0 + 34] };
  for (const side of [-1, 1]) {
    const pose = side < 0 ? (o.L || 'hang') : (o.R || 'hang'); const [sx, sy] = sh[side];
    let hx, hy, bul = 0.8;
    if (typeof pose === 'object') { hx = pose.x; hy = pose.y; bul = pose.b ?? 0.8; }
    else { const A = { hang: [30, 400, 0.6], hip: [10, 290, 2.2], up: [70, -330, 0.5], point: [330, -40, 0.3], wave: [120, -260, 0.9], chin: [-80, -60, 1.6], cross: [-90, 200, -0.5], finger: [70, -220, 0.9] }[pose] || [30, 400, 0.6]; hx = sx + side * A[0]; hy = sy + A[1]; bul = A[2]; }
    const mx = (sx + hx) / 2, my = (sy + hy) / 2, dx = hx - sx, dy = hy - sy, L = Math.hypot(dx, dy) || 1;
    const ex = mx + side * Math.abs(dy / L) * 30 * bul, ey = my + Math.abs(dx / L) * 22 * bul;
    // sleeve covers shoulder->elbow->60% of forearm
    const cx_ = ex + (hx - ex) * 0.45, cy_ = ey + (hy - ey) * 0.45;
    ln(g, [[sx, sy], [ex, ey], [cx_, cy_]], 34); ln(g, [[sx, sy], [ex, ey], [cx_, cy_]], 24, coat);
    ln(g, [[cx_, cy_], [hx, hy]], 8);
    const c2 = [cx_ + (hx - ex) * 0.06, cy_ + (hy - ey) * 0.06]; ln(g, [[cx_, cy_], c2], 12, '#f6f2e6'); // shirt cuff peeking
    dt(g, hx, hy, 12);
    if (side > 0 && o.finger) ln(g, [[hx, hy], [hx + 4, hy - 34]], 7);
    if (side > 0 && o.quill) { ln(g, [[hx, hy + 6], [hx + 40, hy - 90]], 4); inkFill(g, [[hx + 40, hy - 90], [hx + 70, hy - 150], [hx + 52, hy - 70]], '#f2efe6', 3); }
  }
  };
  const armsUp = [o.L, o.R].some((a) => a && typeof a === 'object' && a.y < 200) || o.L === 'up' || o.R === 'up';
  if (armsUp) drawArms();
  // head
  const H = { cx: 300 + (o.turn || 0) * 6, cy: 146, rx: 100, ry: 90, seed: 5 };
  g.save(); g.translate(300, 236); g.rotate(dg(o.headTilt || 0)); g.translate(-300, -236);
  shaded(g, wob(H.cx, H.cy, H.rx, H.ry, H.seed), o.headCol || HEAD, o.headSh || HEAD_SH, 9, [-0.1, -0.06]);
  if (o.back) { inkFill(g, wob(H.cx, H.cy - 4, H.rx * 1.04, H.ry * 1.02, 2, 0.05), '#1c181c', 9); for (let k = 0; k < 5; k++) ln(g, [[H.cx - 60 + k * 30, H.cy - 70], [H.cx - 70 + k * 34, H.cy + 50]], 3, '#3a343a'); }
  else drawHair(g, H, { hair: '#1c181c', hairStyle: 'mop', turn: o.turn });
  // messy extra tufts
  for (const [dx, dy, a] of [[-70, -78, -30], [-20, -96, -8], [40, -92, 14], [84, -66, 40]]) ln(g, [[H.cx + dx, H.cy + dy + 10], [H.cx + dx + Math.sin(dg(a)) * 26, H.cy + dy - 14]], 9);
  if (!o.back) drawFace(g, H, { ...o, beard: old >= 2 ? '#1c181c' : null });
  if (o.hat) { const sc = o.hat; g.save(); const top = H.cy - H.ry; g.translate(H.cx, top + 10); g.scale(sc, sc); g.translate(-H.cx, -(top + 10)); tallTopHat(g, H.cx, top + 8, 0.95, o.hatTilt || 0); g.restore(); }
  g.restore();
  if (!armsUp) drawArms();
  g.restore();
};

/** the short, proud rival */
export const RIVAL = { body: '#26346a', bw: 210, detail: [{ t: 'collar', c: '#ffffff' }, { t: 'buttons', c: '#f4cc4a' }, { t: 'belt', c: '#1a1e3a' }], hair: '#3a2214', hairStyle: 'side', mous: '#3a2214', mousStyle: 'brush', legs: '#20243a', hat: { type: 'bowler', color: '#1c2240' } };
export const SECOND_A = { body: '#7a7468', detail: ['buttons', { t: 'scarf', c: '#3a3040' }], hair: '#5a3a24', hairStyle: 'sides', mous: '#5a3a24', hat: { type: 'wide', color: '#4a3a2c', band: '#2a2018' } };
export const SECOND_B = { body: '#2f5a44', detail: ['buttons', 'collar'], hair: '#2a2228', hairStyle: 'sides', goatee: '#2a2228', hat: { type: 'bowler', color: '#2a2a30' } };
export const CROWD = [
  { body: '#b84a4a', robe: true, detail: [{ t: 'trim', c: '#f2e6c8' }], hair: '#6a4024', hairStyle: 'bun', bw: 180 },
  { body: '#4a6aa8', detail: ['buttons'], hair: '#2a2228', hairStyle: 'sides', mous: '#2a2228', hat: { type: 'top', color: '#2a2430' } },
  { body: '#d0a040', robe: true, detail: [{ t: 'scarf', c: '#ffffff' }], hair: '#c8a060', hairStyle: 'bun', bw: 180 },
  { body: '#6a4a7a', detail: ['vest'], hair: '#3a2a22', hairStyle: 'sides', hat: { type: 'bowler', color: '#3a2e2a' } },
  { body: '#4a8a6a', detail: ['straps'], hair: '#8a5a2e', hairStyle: 'mop', hat: { type: 'wide', color: '#d8b06a', band: '#8a5a2e' } },
  { body: '#a85a8a', robe: true, detail: [{ t: 'trim', c: '#f2d0e0' }], hair: '#2a1a14', hairStyle: 'bun', bw: 180 },
  { body: '#8a6a4a', detail: ['buttons', 'pocket'], hair: '#9a9aa4', hairStyle: 'sides', beard: '#9a9aa4', hat: { type: 'top', color: '#3a3040' } },
  { body: '#3a5a8a', detail: ['collar', 'tie'], hair: '#5a3a24', hairStyle: 'short', hat: { type: 'flatcap', color: '#5a4a3a', stripes: '#8a7a6a' } },
];
/** umbrella / parasol held up by a hand at (x,y) */
export const drawUmbrella = (g, x, y, col = '#e8d0a0') => {
  ln(g, [[x, y + 30], [x, y - 240]], 6);
  const cy = y - 240, pts = ellP(x, cy + 10, 170, 110, 180, 360, 24);
  for (let i = 0; i < 6; i++) pts.push(...ellP(x + 170 - 28.3 * (i + 0.5) * 2 + 28.3 * 0, cy + 10, 28.3, 18, 0, 180, 6).reverse().slice(0, 1));
  const sc = []; for (let i = 0; i <= 6; i++) sc.push([x + 170 - i * 56.7, cy + 10 + (i % 2 ? 16 : 0)]);
  inkFill(g, [...ellP(x, cy + 10, 170, 110, 180, 360, 24), ...sc], col, 7);
  for (let i = 1; i < 6; i++) ln(g, [[x, cy - 100], [x + 170 - i * 56.7, cy + 10 + (i % 2 ? 16 : 0)]], 3, shadeC(col, 0.7));
  dt(g, x, cy - 104, 8);
};
/** binoculars held in front of the eyes */
export const drawBinoc = (g, x, y) => { for (const s of [-1, 1]) inkFill(g, [[x + s * 8, y - 26], [x + s * 50, y - 26], [x + s * 50, y + 26], [x + s * 8, y + 26]], '#3a3230', 6); inkFill(g, [[x - 14, y - 10], [x + 14, y - 10], [x + 14, y + 10], [x - 14, y + 10]], '#e2b84c', 4); };

/** rim light: draw fn, then paint a soft warm crescent on one side of the silhouette (sx: -1 left, 1 right; sy: -1 top) */
let _rimC = null;
export const withRim = (p, fn, rim) => {
  fn(p); if (!rim) return;
  const g = p.g, cv = g.canvas, W = cv.width, H = cv.height, k = W / 600;
  if (!_rimC || _rimC.width !== W) { _rimC = document.createElement('canvas'); _rimC.width = W; _rimC.height = H; }
  const m = _rimC.getContext('2d'); m.setTransform(1, 0, 0, 1, 0, 0); m.globalCompositeOperation = 'source-over'; m.globalAlpha = 1; m.filter = 'none'; m.clearRect(0, 0, W, H);
  m.drawImage(cv, 0, 0); m.globalCompositeOperation = 'source-in'; m.fillStyle = rim.col || '#ffd890'; m.fillRect(0, 0, W, H);
  m.globalCompositeOperation = 'destination-out'; const d = (rim.d || 16) * k; m.drawImage(cv, -(rim.sx ?? -1) * d, -(rim.sy ?? -0.4) * d);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-atop'; g.globalAlpha = rim.a ?? 0.7; g.filter = 'blur(' + (1.2 * k) + 'px)'; g.drawImage(_rimC, 0, 0); g.restore();
};
const paleC = (c, k) => k ? mix(c, '#e8ecf2', k) : c;
/** the rival: puff (chest out, tiptoe), red (0..1 red face), steam (0..1), pale (0..1 drained), paper ('read'|'crumple' + crumple 0..1), sabre {x,y,ang,len,shake}, hatLeaves n, mousDroop */
export const rivalChar = (p, o = {}) => {
  const g = p.g, pale = o.pale || 0, sp = { ...RIVAL };
  sp.body = paleC(RIVAL.body, pale * 0.75); sp.legs = paleC(RIVAL.legs, pale * 0.6); sp.hat = { ...RIVAL.hat, color: paleC(RIVAL.hat.color, pale * 0.5) };
  if (o.puff) sp.bw = 210 + 40 * o.puff;
  const red = o.red || 0;
  const opts = { ...o, specOver: sp, headCol: red ? mix('#fbfaf7', '#e8323a', red) : (pale ? '#f4f8ff' : undefined), headSh: red ? mix('#e6e2dc', '#b81e2a', red) : (pale ? '#d4dcea' : undefined), mous: o.mousOff ? null : (pale ? '#5a4232' : RIVAL.mous) };
  if (o.mousDroop) opts.mousStyle = 'brush';
  g.save(); if (o.shake) g.translate(o.shake, 0);
  toonChar(p, sp, opts);
  g.restore();
  const hx = 300, hy = 276, rx = 140;
  if (o.mousDroop) { // drooping moustache ends + sweat
    for (const s of [-1, 1]) ln(g, [[hx + s * 30 + (o.turn || 0) * 30, hy + 30], [hx + s * 48 + (o.turn || 0) * 30, hy + 74]], 12, pale ? '#5a4232' : '#3a2214');
  }
  if (o.sweat) for (const [dx, dy, s] of [[-150, -40, 1], [150, -70, 0.8], [130, 10, 0.7]]) inkFill(g, [[hx + dx, hy + dy - 26 * s], [hx + dx + 13 * s, hy + dy + 4 * s], ...ellP(hx + dx, hy + dy + 6 * s, 13 * s, 13 * s, 0, 180, 8), [hx + dx - 13 * s, hy + dy + 4 * s]], '#a8d8ff', 4);
  if (o.steam) { const t = o.steam, ph = o.steamPh || 0;
    for (const s of [-1, 1]) for (let k = 0; k < 3; k++) { const u = ((k / 3) + ph) % 1, r = (16 + u * 30) * t; const a = (1 - u) * t; g.globalAlpha = Math.min(1, a * 1.3);
      inkFill(g, ellP(hx + s * (rx + 14 + u * 40), hy - 10 - u * 120, r, r * 0.85, 0, 360, 18), '#f4f4f4', 4); }
    g.globalAlpha = 1; }
  if (o.hatLeaves) { const r = (i) => { const x = Math.sin(i * 91.7) * 43758.5; return x - Math.floor(x); };
    for (let i = 0; i < o.hatLeaves; i++) { const x = hx - 90 + r(i) * 180, y = 120 - r(i + 50) * 60 - (i > 10 ? 30 : 0); g.save(); g.translate(x, y); g.rotate(r(i + 9) * 6);
      inkFill(g, [[0, -22], [12, -4], [0, 22], [-12, -4]], ['#6aa046', '#9ab040', '#d8a040', '#4f8a3c'][i % 4], 3.5); g.restore(); } }
  if (o.paper) { // the newspaper "Zeitung" held up with both hands, crumple 0..1
    const c = o.crumple || 0, cx = 300, cy = 520 + c * 40, w = 330 * (1 - c * 0.75), h = 250 * (1 - c * 0.7);
    if (c < 0.6) { const pts = [[cx - w / 2, cy - h / 2], [cx + w / 2, cy - h / 2 - 6], [cx + w / 2 + 4, cy + h / 2], [cx - w / 2 - 4, cy + h / 2 + 4]];
      inkFill(g, pts, '#f2ead6', 6); g.save(); g.fillStyle = CK; g.font = 'bold ' + Math.round(54 * (1 - c)) + 'px Georgia, "DejaVu Serif", serif'; g.textAlign = 'center'; g.fillText('Zeitung', cx, cy - h / 2 + 62 * (1 - c));
      g.fillRect(cx - w / 2 + 16, cy - h / 2 + 76 * (1 - c), w - 32, 4); g.fillStyle = 'rgba(30,24,22,.7)'; for (let k = 0; k < 6; k++) g.fillRect(cx - w / 2 + 20, cy - h / 2 + (94 + k * 22) * (1 - c), (w - 40) * (0.5 + 0.4 * ((k * 7) % 3) / 2), 6); g.restore();
      if (c > 0.05) for (let k = 0; k < 6; k++) ln(g, [[cx - w / 2 + k * w / 6, cy - h / 2], [cx - w / 2 + k * w / 6 + 20, cy + h / 2]], 3, 'rgba(26,20,22,.6)'); }
    else inkFill(g, wob(cx, cy, 70, 60, 4, 0.18), '#f2ead6', 6);
    for (const s of [-1, 1]) dt(g, cx + s * (w / 2 - 6), cy, 12);
  }
  if (o.sabre) { const sb = o.sabre; drawSabre(g, sb.x, sb.y, sb.ang || 0, sb.len || 300, sb.glint || 0); dt(g, sb.x, sb.y, 12); }
};
/** a generic extra with optional umbrella / binoculars / case */
export const extraChar = (p, spec, o = {}) => {
  toonChar(p, spec, o);
  if (o.umbrella) drawUmbrella(p.g, o.umbrella.x, o.umbrella.y, o.umbrella.col);
  if (o.binoc) drawBinoc(p.g, 300 + (o.turn || 0) * 26 * 1.4, 266);
  if (o.box) { const g = p.g, b = o.box; inkFill(g, [[b.x - b.w / 2, b.y - 40], [b.x + b.w / 2, b.y - 40], [b.x + b.w / 2, b.y + 40], [b.x - b.w / 2, b.y + 40]], '#4a2818', 7); inkFill(g, [[b.x - 20, b.y - 10], [b.x + 20, b.y - 10], [b.x + 20, b.y + 10], [b.x - 20, b.y + 10]], '#e2b84c', 4); }
};
