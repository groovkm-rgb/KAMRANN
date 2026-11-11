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
  wink: { eye: 'lid', brow: 'smug', mouth: 'grin', wink: true },
  skeptic: { eye: 'dot', brow: 'skeptic', mouth: 'wavy' },
  proud: { eye: 'arc', brow: 'up', mouth: 'grin' },
  admire: { eye: 'lid', brow: 'up', mouth: 'smile' },
  tired: { eye: 'lid', brow: 'worry', mouth: 'smile' },
  hush: { eye: 'round', pupil: 0.8, brow: 'worry', mouth: 'o' },
};
function drawFace(g, H, o) {
  const { cx, cy, rx } = H, u = rx / 100, turn = o.turn || 0, look = o.look || 0, E = EXPR[o.expr || 'neutral'] || EXPR.neutral;
  const fx = cx + turn * 26 * u, eyeY = cy - 6 * u;
  const blink = (o.blink || 0) > 0.5, eyes = [-1, 1].map((s) => ({ s, x: fx + s * 37 * u * (1 - 0.18 * Math.abs(turn) * (s * turn < 0 ? 1 : 0)), k: 1 - 0.22 * Math.max(0, -s * turn) }));
  // eyes
  for (const e of eyes) {
    const x = e.x, k = e.k, typ = blink ? 'closed' : (E.wink && e.s < 0) ? 'arc' : E.eye;
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
      worry: [[-bw, s > 0 ? -10 : 6], [bw, s > 0 ? 6 : -10]], skeptic: s < 0 ? [[-bw, 2], [bw, 2]] : [[-bw, -16], [bw, -24]], angry: [[-bw, s > 0 ? 10 : -6], [bw, s > 0 ? -6 : 10]] }[E.brow] || [[-bw, 0], [bw, 0]];
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
  const mx = fx + turn * 6 * u, M = o.mouth || E.mouth;
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
  cross: [-70, 120, -0.5], belly: [-40, 130, 1.4], chin: [-60, -60, 1.6], thumb: [90, 30, 1], wheel: [120, 50, 0.8], forward: [60, 110, 0.4], shrug: [110, -40, 1.3], ear: [44, -96, 1.6], cover: [40, -110, 1.8], raise: [70, -150, 0.7], clap: [-50, 20, 1.2], flail: [150, -150, 0.5], table: [70, 150, 0.6],
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
  if (propX(g, kind, x, y, side, o)) return;
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
  if (s.cape) { const cp = [[x0 - 6, y0 + 30], [x1 + 6, y0 + 30], [x1 + 46, s.capeY || 930], [x1 + 30, (s.capeY || 930) + 30], [x0 - 30, (s.capeY || 930) + 30], [x0 - 46, s.capeY || 930]];
    inkFill(g, cp, s.cape, 8);
    if (s.capeNet) { g.save(); pth(g, cp); g.clip(); for (let k = -20; k < 30; k++) { ln(g, [[k * 30, y0], [k * 30 + 600, y0 + 700]], 4, s.capeNet); ln(g, [[k * 30, y0], [k * 30 - 600, y0 + 700]], 4, s.capeNet); } for (let k = 0; k < 6; k++) inkFill(g, ellP(x0 - 20 + k * 52, 950, 9, 9, 0, 360, 10), '#e8d080', 3); g.restore(); inkFill(g, cp, null, 8); } }
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
    if (t === 'knit') { for (let x = x0 + 22; x < x1 - 10; x += 30) { for (let y = y0 + 20; y < y1 - 40; y += 26) ln(g, [[x - 7, y], [x, y + 12], [x + 7, y]], 3.2, shadeC(col, 0.7)); }
      inkFill(g, [[x0 - 5, y1 - 48], [x1 + 5, y1 - 48], [x1 + 5, y1 + 6], [x0 - 5, y1 + 6]], shadeC(col, 0.85), 4); for (let x = x0 + 8; x < x1; x += 12) ln(g, [[x, y1 - 44], [x, y1 + 2]], 3, shadeC(col, 0.65));
      inkFill(g, pill(300 - 70, y0 - 16, 300 + 70, y0 + 30, 20), shadeC(col, 0.85), 5); }
    if (t === 'hstripes') for (let y = y0 + 34; y < y1; y += 52) inkFill(g, [[x0 - 10, y], [x1 + 10, y], [x1 + 10, y + 24], [x0 - 10, y + 24]], dc || '#ffffff', 0);
    if (t === 'bowtie') { inkFill(g, [[300, y0 + 18], [254, y0 - 4], [254, y0 + 44]], dc || '#b8282b', 5); inkFill(g, [[300, y0 + 18], [346, y0 - 4], [346, y0 + 44]], dc || '#b8282b', 5); inkFill(g, ellP(300, y0 + 18, 11, 11, 0, 360, 12), shadeC(dc || '#b8282b', 0.8), 4); }
    if (t === 'net') { g.save(); g.globalAlpha = 0.9; for (let k = -12; k < 16; k++) { ln(g, [[x0 - 40 + k * 34, y0 - 20], [x0 - 40 + k * 34 + 300, y1 + 260]], 3.5, dc || '#d8c89a'); ln(g, [[x1 + 40 - k * 34, y0 - 20], [x1 + 40 - k * 34 - 300, y1 + 260]], 3.5, dc || '#d8c89a'); } g.restore(); }
    if (t === 'shells') { for (const [xx, yy] of [[-40, 120], [36, 190], [-20, 260]]) { inkFill(g, ellP(300 + xx, y0 + yy, 16, 13, 180, 360, 10), '#f2d4c0', 3); } }
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
  if (o.beardBig) drawBeardBig(g, HH, o);
  drawFace(g, HH, o);
  faceExtras(g, HH, o);
  drawHat(g, H, o);
  drawEarrings(g, HH, o);
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

// ===================== story additions: sailors' earring short =====================
const GOLD = '#f2c040', GOLD_D = '#b8862a';
const hoop = (g, x, y, r, u, glow = 0) => {
  if (glow > 0) { const gr = g.createRadialGradient(x, y, 0, x, y, r * 6); gr.addColorStop(0, `rgba(255,232,150,${0.85 * glow})`); gr.addColorStop(0.4, `rgba(255,214,100,${0.35 * glow})`); gr.addColorStop(1, 'rgba(255,214,100,0)'); g.fillStyle = gr; g.fillRect(x - r * 6, y - r * 6, r * 12, r * 12); }
  g.beginPath(); g.ellipse(x, y, r, r * 1.12, 0, 0, Math.PI * 2); g.lineWidth = 13 * u; g.strokeStyle = CK; g.stroke();
  g.lineWidth = 7.5 * u; g.strokeStyle = GOLD; g.stroke();
  g.beginPath(); g.ellipse(x, y, r, r * 1.12, 0, dg(200), dg(260)); g.lineWidth = 3 * u; g.strokeStyle = '#fff6c8'; g.stroke();
};
function drawEarrings(g, H, o) {
  const { cx, cy, rx } = H, u = rx / 100;
  const at = (side, n) => {
    for (let i = 0; i < n; i++) {
      const x = cx + side * rx * (0.95 - i * 0.04), y = cy + (26 - i * 34) * u;
      hoop(g, x, y + 14 * u, (i ? 11 : 15) * u, u, i ? 0 : (o.earGlow || 0));
      if (o.wax && i === 0) { ln(g, [[x, y + 30 * u], [x, y + 46 * u]], 3 * u); inkFill(g, wob(x, y + 58 * u, 14 * u, 13 * u, 4, 0.06, 20), '#f2d040', 4 * u); dt(g, x - 4 * u, y + 54 * u, 3 * u, '#fff6b0'); }
    }
  };
  if (o.earR) at(1, o.earR === true ? 1 : o.earR);
  if (o.earL) at(-1, o.earL === true ? 1 : o.earL);
}
function drawBeardBig(g, H, o) {
  const { cx, cy, rx } = H, u = rx / 100, c = o.beardBig, fx = cx + (o.turn || 0) * 26 * u;
  const pts = [];
  for (let i = 0; i <= 28; i++) { const a = dg(-8 + 196 * i / 28), j = i % 2 ? 0.9 : 1.06; pts.push([cx + rx * 0.98 * Math.cos(a) * j, cy + 8 * u + rx * (o.beardLen || 1.25) * Math.sin(a) * j]); }
  pts.push([fx - 44 * u, cy + 30 * u], [fx, cy + 22 * u], [fx + 44 * u, cy + 30 * u]);
  shaded(g, pts, c, shadeC(c, o.beardSh || 0.86), 8 * u);
  const hl = o.beardLine || shadeC(c, 0.7);
  for (let k = 0; k < 7; k++) { const x = cx - 70 * u + k * 23 * u; ln(g, [[x, cy + 66 * u + (k % 2) * 14 * u], [x + 4 * u, cy + 104 * u + (k % 3) * 16 * u]], 3.4 * u, hl); }
  if (o.seaweed) for (let k = 0; k < 5; k++) { const x = cx - 80 * u + k * 40 * u; ln(g, [[x, cy + 60 * u], [x - 10 * u, cy + 110 * u], [x + 6 * u, cy + 150 * u], [x - 4 * u, cy + 176 * u]], 6 * u, shadeC(c, 0.75)); }
  // moustache on top
  const my = cy + 31 * u, mx = fx + (o.turn || 0) * 6 * u;
  inkFill(g, [[mx - 62 * u, my + 14 * u], [mx - 50 * u, my - 6 * u], [mx - 16 * u, my - 10 * u], [mx, my - 2 * u], [mx + 16 * u, my - 10 * u], [mx + 50 * u, my - 6 * u], [mx + 62 * u, my + 14 * u], [mx + 30 * u, my + 8 * u], [mx, my + 10 * u], [mx - 30 * u, my + 8 * u]], shadeC(c, 0.95), 5.5 * u);
}
function faceExtras(g, H, o) {
  const { cx, cy, rx } = H, u = rx / 100, turn = o.turn || 0, fx = cx + turn * 26 * u, eyeY = cy - 6 * u;
  if (o.wrinkles) {
    for (const s of [-1, 1]) { const x = fx + s * 37 * u + s * 30 * u; for (let k = -1; k <= 1; k++) ln(g, [[x, eyeY + k * 9 * u], [x + s * 14 * u, eyeY + k * 13 * u]], 3 * u); }
    for (let k = 0; k < 2; k++) ln(g, ellP(fx, cy - 50 * u + k * 14 * u, 38 * u, 10 * u, 200, 340, 10), 3 * u);
    ln(g, ellP(fx - 40 * u, cy + 26 * u, 14 * u, 16 * u, 100, 200, 6), 3 * u); ln(g, ellP(fx + 40 * u, cy + 26 * u, 14 * u, 16 * u, -20, 80, 6), 3 * u);
  }
  if (o.twinkle) for (const s of [-1, 1]) { const x = fx + s * 37 * u + 6 * u, y = eyeY - 2 * u; dt(g, x, y, 3.2 * u, '#ffffff'); }
  if (o.cheeks) for (const s of [-1, 1]) { g.save(); g.globalAlpha = 0.75; inkFill(g, ellP(fx + s * 58 * u, cy + 24 * u, 22 * u, 13 * u, 0, 360, 20), o.cheeks, 0); g.restore(); }
  if (o.freckles) { const r = [[-62, 18], [-50, 30], [-70, 32], [-56, 8], [52, 20], [64, 32], [48, 10], [70, 14]]; for (const [x, y] of r) dt(g, fx + x * u, cy + y * u, 3.3 * u, '#b8743e'); }
  if (o.glasses) for (const s of [-1, 1]) { g.beginPath(); g.arc(fx + s * 37 * u, eyeY, 26 * u, 0, Math.PI * 2); g.lineWidth = 6 * u; g.strokeStyle = CK; g.stroke(); g.fillStyle = 'rgba(200,230,255,0.18)'; g.fill(); if (s < 0) ln(g, [[fx - 11 * u, eyeY - 4 * u], [fx + 11 * u, eyeY - 4 * u]], 5 * u); dt(g, fx + s * 37 * u - 9 * u, eyeY - 10 * u, 4 * u, 'rgba(255,255,255,0.8)'); }
  if (o.pipe) {
    const mx = fx + turn * 6 * u + 22 * u, my = cy + 44 * u;
    ln(g, [[mx, my], [mx + 56 * u, my + 18 * u]], 13 * u); ln(g, [[mx, my], [mx + 56 * u, my + 18 * u]], 6 * u, '#6a3c1e');
    const bx = mx + 66 * u, by = my + 4 * u; inkFill(g, [[bx - 18 * u, by - 26 * u], [bx + 18 * u, by - 26 * u], [bx + 15 * u, by + 14 * u], [bx, by + 22 * u], [bx - 15 * u, by + 14 * u]], '#7a4322', 5.5 * u);
    inkFill(g, ellP(bx, by - 26 * u, 18 * u, 6 * u, 0, 360, 16), '#2a1410', 4 * u);
    if (o.ember) dt(g, bx, by - 27 * u, 6 * u, `rgba(255,${140 + 80 * o.ember | 0},60,${0.6 + 0.4 * o.ember})`);
  }
  if (o.tele) { // magic telescope eyes, growing sideways towards the horizon
    const L = o.tele * 230 * u;
    for (const s of [-1, 1]) { const x = fx + s * 37 * u, y = eyeY - 4 * u + s * 0;
      const pts = [[x, y - 18 * u], [x + L, y - 22 * u - s * 4 * u], [x + L, y + 22 * u + s * 4 * u], [x, y + 18 * u]];
      inkFill(g, pts, '#d8a840', 6 * u); for (let k = 1; k < 4; k++) ln(g, [[x + L * k / 4, y - 20 * u], [x + L * k / 4, y + 20 * u]], 4 * u, '#8a6420');
      inkFill(g, ellP(x + L, y, 10 * u, 25 * u, 0, 360, 16), '#bfe4ff', 5 * u); dt(g, x + L, y, 6 * u); }
  }
  if (o.sweat) { inkFill(g, [[cx + rx * 0.7, cy - 60 * u], [cx + rx * 0.78, cy - 30 * u], [cx + rx * 0.62, cy - 30 * u]], '#bfe4ff', 4 * u); }
}
function propX(g, kind, x, y, side, o) {
  if (kind === 'mugFoam') { inkFill(g, [[x - 34, y - 70], [x + 34, y - 70], [x + 30, y + 18], [x - 30, y + 18]], '#9a6234', 6); for (const yy of [-50, -4]) ln(g, [[x - 33, y + yy], [x + 32, y + yy]], 5); ln(g, [[x + 32 * side, y - 50], [x + 56 * side, y - 40], [x + 54 * side, y - 4], [x + 30 * side, y]], 8);
    inkFill(g, [...ellP(x - 18, y - 72, 22, 16, 180, 360, 8), ...ellP(x + 8, y - 80, 24, 18, 180, 360, 8), ...ellP(x + 26, y - 70, 16, 14, 200, 380, 8)], '#fff8ec', 5); return true; }
  if (kind === 'pewter') { // shiny mug; o.reflect draws a tiny face of the holder on it
    inkFill(g, [[x - 40, y - 86], [x + 40, y - 86], [x + 36, y + 20], [x - 36, y + 20]], '#c4ccd4', 6);
    g.save(); pth(g, [[x - 40, y - 86], [x + 40, y - 86], [x + 36, y + 20], [x - 36, y + 20]]); g.clip();
    g.fillStyle = '#e8eef4'; g.fillRect(x - 30, y - 86, 14, 110); g.fillStyle = '#8a96a2'; g.fillRect(x + 22, y - 86, 18, 110);
    if (o.reflect) { const fx = x - 2, fy = y - 34; inkFill(g, ellP(fx, fy, 22, 20, 0, 360, 18), '#fbfaf7', 3); dt(g, fx - 8, fy - 3, 2.6); dt(g, fx + 8, fy - 3, 2.6); ln(g, ellP(fx, fy + 4, 9, 6, 20, 160, 8), 2.4);
      inkFill(g, [...ellP(fx, fy + 6, 20, 22, -10, 190, 10)], '#eeeae2', 2.5); hoop(g, fx + 21, fy + 6, 4, 0.35, 0); }
    g.restore(); ln(g, [[x + 38 * side, y - 66], [x + 64 * side, y - 56], [x + 62 * side, y - 10], [x + 34 * side, y - 4]], 9); inkFill(g, ellP(x, y - 86, 40, 10), '#dfe6ec', 5); return true; }
  if (kind === 'trident') { ln(g, [[x, y + 240], [x, y - 330]], 16); ln(g, [[x, y + 240], [x, y - 330]], 9, '#a8743e');
    inkFill(g, [[x - 60, y - 330], [x + 60, y - 330], [x + 60, y - 312], [x - 60, y - 312]], '#a8743e', 5);
    for (const dx of [-54, 0, 54]) inkFill(g, [[dx + x - 9, y - 322], [dx + x + 9, y - 322], [dx + x + 7, y - 400], [dx + x, y - 420], [dx + x - 7, y - 400]], '#c08a4c', 5); return true; }
  if (kind === 'magnifier') { ln(g, [[x, y], [x + 40 * side, y - 70]], 16); ln(g, [[x, y], [x + 40 * side, y - 70]], 8, '#6a3c1e');
    const cx = x + 66 * side, cy = y - 118; g.beginPath(); g.arc(cx, cy, 52, 0, Math.PI * 2); g.fillStyle = 'rgba(210,236,255,0.55)'; g.fill(); g.lineWidth = 18; g.strokeStyle = CK; g.stroke(); g.lineWidth = 10; g.strokeStyle = '#c8a050'; g.stroke();
    ln(g, ellP(cx, cy, 34, 34, 200, 250, 8), 6, 'rgba(255,255,255,0.9)'); return true; }
  if (kind === 'basket') { inkFill(g, [[x - 70, y + 20], [x + 70, y + 20], [x + 56, y + 110], [x - 56, y + 110]], '#c8964a', 6); for (let k = 0; k < 4; k++) ln(g, [[x - 64 + k * 3, y + 40 + k * 20], [x + 64 - k * 3, y + 40 + k * 20]], 3.5, '#8a5a24');
    ln(g, ellP(x, y + 20, 64, 70, 180, 360, 16), 7); inkFill(g, ellP(x - 20, y + 14, 22, 14), '#e0506a', 4); inkFill(g, ellP(x + 22, y + 12, 20, 13), '#f2d040', 4); return true; }
  if (kind === 'flowers') { for (const [dx, c] of [[-30, '#e0506a'], [0, '#f6f0e0'], [30, '#f2d040'], [-12, '#8ab0e8']]) { ln(g, [[x, y + 10], [x + dx, y - 70]], 5, '#3f7a3a'); inkFill(g, ellP(x + dx, y - 78, 16, 14, 0, 360, 12), c, 4); dt(g, x + dx, y - 78, 5, '#e8a030'); } return true; }
  if (kind === 'earring') { hoop(g, x, y - 26, 20, 1.3, o.earGlow || 0); return true; }
  if (kind === 'pipe') { ln(g, [[x - 40 * side, y - 20], [x + 10 * side, y]], 12); ln(g, [[x - 40 * side, y - 20], [x + 10 * side, y]], 6, '#6a3c1e'); inkFill(g, [[x + 4 * side, y - 30], [x + 34 * side, y - 30], [x + 30 * side, y + 6], [x + 8 * side, y + 6]], '#7a4322', 5); return true; }
  if (kind === 'wax') { inkFill(g, wob(x, y - 6, 16, 15, 4, 0.06, 20), '#f2d040', 5); return true; }
  if (kind === 'torch') { ln(g, [[x, y + 60], [x, y - 40]], 12); ln(g, [[x, y + 60], [x, y - 40]], 6, '#7a5434'); inkFill(g, [[x - 10, y - 40], [x + 10, y - 40], [x + 4, y - 74], [x, y - 90], [x - 6, y - 70]], '#ffb040', 4); return true; }
  return false;
}
/** big round head portrait for picture frames (canvas 2D), drawn as a toon character bust */
export const portrait = (g, spec, opts, w, h) => { g.save(); g.scale(w / 600, h / 760); g.translate(0, -40); toonChar({ g }, spec, opts); g.restore(); };
