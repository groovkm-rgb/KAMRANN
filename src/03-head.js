/* =====================================================================
   03 · HEAD RIG
   One reusable head model for every character. The skull is described
   as stacked super-elliptic cross-sections; yaw/pitch place features and
   the silhouette, but everything is painted as flat 2-D cel shapes:
   one lit tone, one multiply shadow, hard terminators and rim light.
   ===================================================================== */

// cross-section levels: [y, halfWidth, frontDepth, backDepth, squareness]
const LV_BOSS = [
  [-152, 8, 8, 10, 2], [-147, 38, 32, 48, 2.2], [-138, 58, 52, 68, 2.4], [-124, 71, 64, 82, 2.6],
  [-106, 79, 71, 91, 2.8], [-86, 82, 75, 95, 3], [-64, 83, 77, 96, 3], [-47, 83, 81, 95, 3],
  [-30, 82, 74, 92, 3], [-14, 83, 75, 87, 3], [0, 84, 77, 80, 3.1], [16, 83, 78, 72, 3.3],
  [32, 81, 80, 62, 3.5], [48, 80, 82, 52, 3.7], [62, 78, 83, 44, 3.9], [76, 73, 80, 38, 3.7],
  [90, 63, 80, 32, 3.3], [102, 51, 79, 28, 2.9], [111, 39, 75, 24, 2.6], [117, 23, 66, 18, 2.2], [121, 6, 48, 8, 2],
];
function makeLevels(base, m = {}) {
  const sx = m.sx ?? 1, sz = m.sz ?? 1, sy = m.sy ?? 1, jaw = m.jaw ?? 1, chin = m.chin ?? 1, crown = m.crown ?? 1;
  return base.map(([y, a, df, db, n]) => {
    let A = a * sx;
    if (y > 30) A *= lerp(1, jaw, clamp((y - 30) / 50));
    if (y > 88) A *= lerp(1, chin, clamp((y - 88) / 30));
    if (y < -100) A *= crown;
    return [y * sy, A, df * sz, db * sz, m.round ? Math.max(2, n - m.round) : n];
  });
}
// hairline as [angle-from-front, y]
const HL_SLICK = [[0, -79], [0.1, -84], [0.24, -91], [0.42, -96], [0.6, -84], [0.86, -66], [1.06, -54], [1.14, -16], [1.3, -16], [1.42, -36], [1.86, -36], [2.3, 14], [2.8, 54], [PI, 66]];
const HL_FULL = [[0, -88], [0.4, -88], [0.7, -80], [1.0, -64], [1.14, -20], [1.3, -20], [1.42, -38], [1.9, -38], [2.4, 14], [2.8, 54], [PI, 66]];
const HL_BALD = [[0, -64], [0.5, -60], [0.9, -50], [1.14, -20], [1.3, -20], [1.42, -36], [1.9, -36], [2.4, 2], [2.8, 30], [PI, 40]];
const HL_BALD_TOP = [[0, -62], [0.5, -66], [0.8, -84], [1.0, -96], [1.6, -100], [2.1, -112], [2.7, -124], [PI, -128]];

const HEAD = {
  boss: {
    lv: makeLevels(LV_BOSS, { jaw: 1.04 }), skin: '#bf8c6c', hair: '#131016', hairHi: '#5d5868', gray: '#a19cab', grayAmt: 1,
    hl: HL_SLICK, browCol: '#2a252f', browGray: '#8f8a98', browThick: 1.3, frown: 0.85, eyeOpen: 0.66, iris: '#a7b0bc',
    nose: 1, stubble: 0.55, cleft: true, mouthDown: 1, ear: 1, comb: true,
  },
  rival: {
    lv: makeLevels(LV_BOSS, { sx: 0.9, sy: 1.04, jaw: 0.86, chin: 0.72, round: 0.8 }), skin: '#b49a76', hair: '#24180f', hairHi: '#5a4430', gray: '#5a4a3a', grayAmt: 0,
    hl: HL_FULL, browCol: '#2a1c12', browThick: 0.8, frown: -0.35, eyeOpen: 1.05, iris: '#6a5030', nose: 1.12, stubble: 0.06,
    mustache: true, mouthDown: 0.4, ear: 1.05, comb: true,
  },
  accountant: {
    lv: makeLevels(LV_BOSS, { sx: 0.86, sy: 1.05, jaw: 0.8, chin: 0.8, round: 1 }), skin: '#c8ad90', hair: '#4a4448', hairHi: '#8a848a', gray: '#9a949a', grayAmt: 0.3,
    hl: HL_BALD, bald: HL_BALD_TOP, browCol: '#5a5258', browThick: 0.7, frown: -0.5, eyeOpen: 1.1, iris: '#5a4a3a', nose: 0.9, stubble: 0.05,
    glasses: true, mouthDown: 0.2, ear: 1.1, comb: false,
  },
  ltA: { lv: makeLevels(LV_BOSS, { sx: 0.95, jaw: 1.02 }), skin: '#b8865e', hair: '#1a1210', hairHi: '#4a3a30', gray: '#666', grayAmt: 0, hl: HL_FULL, browCol: '#1a1210', browThick: 1, frown: 0.3, eyeOpen: 0.95, iris: '#4a3a2a', nose: 1.05, stubble: 0.2, mouthDown: 0.6, ear: 1, comb: true },
  ltB: { lv: makeLevels(LV_BOSS, { sx: 0.9, sy: 1.03, jaw: 0.92, chin: 0.85 }), skin: '#c49a78', hair: '#3a2416', hairHi: '#7a5434', gray: '#666', grayAmt: 0, hl: HL_FULL, browCol: '#2a1810', browThick: 0.9, frown: 0.1, eyeOpen: 1, iris: '#5a4a3a', nose: 0.95, stubble: 0.2, mustache: true, mouthDown: 0.5, ear: 1, comb: true },
  ltC: { lv: makeLevels(LV_BOSS, { sx: 1.04, jaw: 1.08, round: 0.4 }), skin: '#a87a58', hair: '#0e0b0c', hairHi: '#3a3438', gray: '#777', grayAmt: 0.2, hl: HL_SLICK, browCol: '#121012', browThick: 1.2, frown: 0.5, eyeOpen: 0.9, iris: '#3a2a20', nose: 1.1, stubble: 0.25, mouthDown: 0.8, ear: 1.1, comb: true },
  ltD: { lv: makeLevels(LV_BOSS, { sx: 0.92, sy: 1.02, jaw: 0.95 }), skin: '#d0a888', hair: '#5a3a1e', hairHi: '#9a7044', gray: '#666', grayAmt: 0, hl: HL_FULL, browCol: '#4a2e18', browThick: 0.85, frown: 0.2, eyeOpen: 1, iris: '#4a5a6a', nose: 1, stubble: 0.1, mouthDown: 0.4, ear: 1, comb: true },
  guard: { lv: makeLevels(LV_BOSS, { sx: 1.08, jaw: 1.12, chin: 1.1, round: 0.3 }), skin: '#a07858', hair: '#0e0b0c', hairHi: '#2a2428', gray: '#555', grayAmt: 0, hl: HL_FULL, browCol: '#0e0b0c', browThick: 1.3, frown: 0.6, eyeOpen: 0.75, iris: '#2a2420', nose: 1.15, stubble: 0.12, mouthDown: 0.9, ear: 1, comb: false, hat: { color: '#141118', band: '#2a1830' } },
};

/* ---------- light presets: dir = direction TO the key light, camera space ---------- */
function mkLight(o) {
  const d = o.dir || [-0.6, 0.2, 0.7], m = Math.hypot(d[0], d[1], d[2]) || 1;
  return Object.assign({ key: '#ffb060', keyAmt: 0.35, mul: '#4a3048', rim: '#b9a8e6', rimDir: [0, -1], rimW: 4, rimA: 0.9, glint: 1, amb: '#1a1020' }, o, { dir: [d[0] / m, d[1] / m, d[2] / m] });
}

/* ---------- geometry helpers ---------- */
function lvAt(lv, y) {
  if (y <= lv[0][0]) return lv[0];
  for (let i = 1; i < lv.length; i++) {
    if (y <= lv[i][0]) {
      const a = lv[i - 1], b = lv[i], f = (y - a[0]) / (b[0] - a[0]);
      return [y, lerp(a[1], b[1], f), lerp(a[2], b[2], f), lerp(a[3], b[3], f), lerp(a[4], b[4], f)];
    }
  }
  return lv[lv.length - 1];
}
const spow = (v, e) => (v < 0 ? -Math.pow(-v, e) : Math.pow(v, e));
/** cross-section point at angle u (0=+x, π/2=front) → [x,z,nx,nz] */
function csPt(L, u) {
  const c = Math.cos(u), s = Math.sin(u), n = L[4], e = 2 / n;
  const a = L[1], d = s >= 0 ? L[2] : L[3];
  const x = a * spow(c, e), z = d * spow(s, e);
  let nx = spow(x / a, n - 1) / a, nz = spow(z / d, n - 1) / d;
  const m = Math.hypot(nx, nz) || 1;
  return [x, z, nx / m, nz / m];
}
function tabAt(tab, d) {
  for (let i = 1; i < tab.length; i++) if (d <= tab[i][0]) { const a = tab[i - 1], b = tab[i]; return lerp(a[1], b[1], (d - a[0]) / (b[0] - a[0])); }
  return tab[tab.length - 1][1];
}
const angFromFront = u => { let d = ((u - PI / 2) % TAU + TAU) % TAU; return d > PI ? TAU - d : d; };

function makeRot(yaw, pitch) {
  const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch), PV = 112, PZ = -12;
  return {
    p(x, y, z) {
      const X = x * cy + z * sy, Z = -x * sy + z * cy, yy = y - PV, zz = Z - PZ;
      return [X, yy * cp + zz * sp + PV, -yy * sp + zz * cp + PZ];
    },
    n(x, y, z) {
      const X = x * cy + z * sy, Z = -x * sy + z * cy;
      return [X, y * cp + Z * sp, -y * sp + Z * cp];
    },
  };
}
/** point on the FRONT surface at (x,y) pushed out by dz → [X,Y,Z,visibility] */
function surfPt(P, R, x, y, dz = 0) {
  const L = lvAt(P.lv, y), a = L[1], df = L[2], n = L[4];
  const ax = Math.min(0.999, Math.abs(x) / a);
  const z = df * Math.pow(1 - Math.pow(ax, n), 1 / n);
  let nx = spow(x / a, n - 1) / a, nz = Math.pow(Math.max(0.0001, z / df), n - 1) / df;
  const m = Math.hypot(nx, nz) || 1;
  const p = R.p(x, y, z + dz), nn = R.n(nx / m, 0, nz / m);
  return [p[0], p[1], p[2], nn[2]];
}

/* ---------- per-draw state ---------- */
function headState(P, o) {
  const R = makeRot(o.yaw || 0, o.pitch || 0);
  const rows = [], pts = [];
  const NU = 30;
  for (const L of P.lv) {
    const row = [];
    const ny0 = clamp((L[0] + 10) / 150, -1, 1) * 0.35;
    for (let k = 0; k < NU; k++) {
      const u = (k / NU) * TAU, c = csPt(L, u);
      const p = R.p(c[0], L[0], c[1]);
      const nm = Math.hypot(c[2], ny0, c[3]);
      const n = R.n(c[2] / nm, ny0 / nm, c[3] / nm);
      row.push([p[0], p[1], p[2], n[0], n[1], n[2]]);
      pts.push([p[0], p[1]]);
    }
    rows.push(row);
  }
  const outline = hull(pts);
  return { P, o, R, rows, outline, path: pathOf(outline), S: (x, y, dz) => surfPt(P, R, x, y, dz) };
}
function loopSamples(hs, tab, NH = 64, lift = 0) {
  const out = [];
  for (let k = 0; k < NH; k++) {
    const u = (k / NH) * TAU, d = angFromFront(u), y = tabAt(tab, d) + lift;
    const L = lvAt(hs.P.lv, y), c = csPt(L, u);
    const p = hs.R.p(c[0], y, c[1]), n = hs.R.n(c[2], 0, c[3]);
    out.push({ X: p[0], Y: p[1], vis: n[2] > 0.0 });
  }
  return out;
}
function visibleArc(s) {
  const n = s.length;
  let start = -1;
  for (let i = 0; i < n; i++) if (s[i].vis && !s[(i - 1 + n) % n].vis) { start = i; break; }
  if (start < 0) return s[0].vis ? s.slice() : null;
  const arc = [];
  for (let k = 0; k < n; k++) { const q = s[(start + k) % n]; if (!q.vis) break; arc.push(q); }
  return arc;
}
/** region of the head below (dir=1) or above (dir=-1) a loop drawn on the skull */
function regionPath(arc, dir = 1) {
  if (!arc || arc.length < 2) return null;
  const a0 = arc[0], a1 = arc[arc.length - 1], B = 900, lf = a0.X < a1.X ? -1 : 1;
  const p = new Path2D();
  p.moveTo(a0.X + lf * B, a0.Y);
  for (const q of arc) p.lineTo(q.X, q.Y);
  p.lineTo(a1.X - lf * B, a1.Y); p.lineTo(a1.X - lf * B, dir * B); p.lineTo(a0.X + lf * B, dir * B); p.closePath();
  return p;
}
function terminatorPath(hs, Ld) {
  const fromLeft = Ld[0] <= 0, pts = [];
  for (const row of hs.rows) {
    const vis = row.filter(s => s[5] > -0.02);
    if (!vis.length) continue;
    vis.sort((a, b) => (fromLeft ? a[0] - b[0] : b[0] - a[0]));
    let tx = null, ty = 0;
    for (let i = 0; i < vis.length; i++) {
      const s = vis[i], nl = s[3] * Ld[0] + s[4] * Ld[1] + s[5] * Ld[2];
      if (nl < 0) {
        if (i === 0) { tx = s[0]; ty = s[1]; }
        else { const q = vis[i - 1], nq = q[3] * Ld[0] + q[4] * Ld[1] + q[5] * Ld[2], f = nq / (nq - nl); tx = lerp(q[0], s[0], f); ty = lerp(q[1], s[1], f); }
        break;
      }
    }
    if (tx === null) { const s = vis[vis.length - 1]; tx = s[0] + (fromLeft ? 3 : -3); ty = s[1]; }
    pts.push([tx, ty]);
  }
  if (pts.length < 2) return null;
  const far = fromLeft ? 1000 : -1000;
  pts.unshift([pts[0][0], pts[0][1] - 80]);
  pts.push([pts[pts.length - 1][0], pts[pts.length - 1][1] + 80], [far, pts[pts.length - 1][1] + 80], [far, pts[0][1] - 80]);
  return pathOf(pts);
}
const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/* ---------- colours for a head under a light ---------- */
function headColors(P, L, flash = 0) {
  const f = flash * 0.4;
  return {
    skin: mixc(mixc(P.skin, L.key, L.keyAmt), '#e4dcff', f),
    skinDk: mixc(P.skin, '#2a1424', 0.55),
    hair: mixc(P.hair, L.key, L.keyAmt * 0.12),
    hairHi: mixc(P.hairHi, L.key, L.keyAmt * 0.3),
    gray: mixc(mixc(P.gray, L.key, L.keyAmt * 0.3), '#e4dcff', f),
    mul: L.mul, rim: L.rim,
    line: mixc(P.skin, '#1a0810', 0.78),
  };
}

/* ---------- NECK (drawn by bodies before collar) ---------- */
function drawNeck(ctx, P, o, L) {
  const R = makeRot(o.yaw || 0, (o.pitch || 0) * 0.3), pts = [];
  for (const [y, r, zc] of [[64, 50, -14], [o.neckBot ?? 175, 58, -18]]) for (let k = 0; k < 16; k++) { const u = (k / 16) * TAU; const p = R.p(Math.cos(u) * r * (P.neckW || 1), y, zc + Math.sin(u) * r); pts.push([p[0], p[1]]); }
  ctx.save(); ctx.translate(o.x, o.y); if (o.roll) ctx.rotate(o.roll); ctx.scale(o.s, o.s);
  const path = pathOf(hull(pts));
  const C = headColors(P, L, o.flash);
  const bk = clamp(-L.dir[2]);
  ctx.fillStyle = mixc(mixc(C.skin, L.mul, 0.45), '#06040a', bk * 0.75); ctx.fill(path);
  edgeFill(ctx, path, -L.dir[0] * 16, 0, mixc(C.skin, '#06040a', bk * 0.4), 0.85);
  edgeFill(ctx, path, -L.rimDir[0] * L.rimW, -L.rimDir[1] * L.rimW, L.rim, L.rimA);
  ctx.restore();
}

/* ---------- MAIN HEAD DRAW ----------
   o: {x,y,s, yaw,pitch,roll, light, flash, gaze:[gx,gy], squint, glint, cigar:bool, t, detail, sweat, out:{} } */
function drawHead(ctx, P, o) {
  const L = o.light, C = headColors(P, L, o.flash || 0);
  ctx.save();
  ctx.translate(o.x, o.y); if (o.roll) ctx.rotate(o.roll); ctx.scale(o.s, o.s);
  const hs = headState(P, o), S = hs.S, path = hs.path;
  const Ld = L.dir;
  const t = o.t || 0, det = o.detail || 0;
  const sq = o.squint || 0, gz = o.gaze || [0, 0];
  const visOf = (x, y) => S(x, y, 0)[3];

  // --- cigar side & visibility
  const cigSide = 1, cigVis = visOf(cigSide * 25, 60);
  if (o.cigar && cigVis < 0.18) drawCigar(ctx, hs, C, L, o, cigSide);

  // --- ears behind (far side) are skipped; near ears drawn after skin
  // --- base: hair mass
  ctx.fillStyle = C.hair; ctx.fill(path);
  ctx.save(); ctx.clip(path);
  // skin below hairline
  const hl = regionPath(visibleArc(loopSamples(hs, P.hl)), 1);
  ctx.fillStyle = C.skin; if (hl) ctx.fill(hl);
  if (P.bald) { const bt = regionPath(visibleArc(loopSamples(hs, P.bald)), -1); if (bt) ctx.fill(bt); }
  // grey temples / sides
  if (P.grayAmt > 0) drawGraySides(ctx, hs, C, P);
  if (P.comb) drawComb(ctx, hs, C, P);

  // ---------- features (painted before shading so shadows fall over them)
  const fr = P.frown + (o.frown || 0);
  const fv = visOf(0, 10);           // how much of the face is toward camera
  if (fv > -0.3) {
  // stubble / 5 o'clock shadow
  if (P.stubble > 0) {
    const st = [[-76, 34], [-74, 60], [-66, 86], [-50, 106], [-26, 117], [0, 120], [26, 117], [50, 106], [66, 86], [74, 60], [76, 34], [44, 44], [22, 40], [0, 44], [-22, 40], [-44, 44]].map(([x, y]) => S(x, y, 0));
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = rgba('#6a6a8c', P.stubble * 0.2);
    ctx.fill(smoothPathOf(st.map(p => [p[0], p[1]]), true)); ctx.restore();
  }
  // eyes
  for (const s of [-1, 1]) drawEye(ctx, hs, C, L, o, s, sq, gz, det);
  // brows
  for (const s of [-1, 1]) {
    if (visOf(s * 40, -44) < -0.15) continue;
    const th = P.browThick, f6 = fr * 6;
    const raw = [[s * 11, -34 + f6], [s * 12, -42 + f6 * 0.8 - 4 * th], [s * 36, -49 - 3 * th + f6 * 0.25], [s * 60, -50 - 2 * th], [s * 72, -44], [s * 60, -42.5], [s * 36, -40.5 + f6 * 0.15]];
    const q = raw.map(([x, y]) => { const p = S(x, y, 5); return [p[0], p[1]]; });
    ctx.fillStyle = mixc(P.browCol, L.key, L.keyAmt * 0.15); ctx.fill(pathOf(q));
    if (P.browGray) {
      ctx.strokeStyle = rgba(P.browGray, 0.7); ctx.lineWidth = 1.1;
      for (let i = 0; i < 6 + det * 14; i++) {
        const f = (i + 0.5) / (6 + det * 14), x0 = lerp(14, 66, f), y0 = lerp(-38 + f6 * 0.6, -45, f);
        const a = S(s * x0, y0, 5), b = S(s * (x0 + 7), y0 - 3.5, 5);
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
      }
    }
  }
  // nasolabial folds, mouth
  ctx.lineCap = 'round';
  for (const s of [-1, 1]) {
    if (visOf(s * 28, 44) < -0.1) continue;
    const q = [[s * 19, 25], [s * 28, 42], [s * 33, 63]].map(([x, y]) => { const p = S(x, y, 1); return [p[0], p[1]]; });
    strokePts(ctx, q, rgba(C.line, 0.55), 2.2, false, true);
  }
  drawMouth(ctx, hs, C, L, P, o);
  if (P.cleft) { const a = S(0, 99, 1), b = S(0, 108, 1); ctx.strokeStyle = rgba(C.line, 0.5); ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
  if (det > 0) drawFaceDetail(ctx, hs, C, L, o, det);
  }

  // ---------- shading pass (multiply)
  ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = L.mul;
  const term = terminatorPath(hs, Ld);
  if (term) ctx.fill(term);
  // eye sockets (noir: deep, always)
  for (const s of [-1, 1]) {
    if (fv < -0.3 || visOf(s * 40, -26) < -0.1) continue;
    const q = [[s * 10, -35], [s * 40, -40], [s * 68, -39], [s * 64, -27], [s * 40, -29], [s * 15, -26]].map(([x, y]) => { const p = S(x, y, 2); return [p[0], p[1]]; });
    ctx.fillStyle = rgba(L.mul, 0.62 + (o.socket || 0)); ctx.fill(smoothPathOf(q));
  }
  // under-lip & under-chin
  if (fv > -0.3) { const q = [[-13, 71], [13, 71], [7, 78], [-7, 78]].map(([x, y]) => { const p = S(x, y, 1); return [p[0], p[1]]; }); ctx.fillStyle = rgba(L.mul, 0.8); ctx.fill(smoothPathOf(q)); }
  // nose cast shadow on the shadow-side cheek
  if (fv > -0.2) {
    const sd = Ld[0] <= 0 ? 1 : -1, k = Math.abs(Ld[0]) * 26 + 6;
    const q = [[sd * 1, -28, 7], [sd * 3, 16, 24], [sd * (10 + k), 36, 0], [sd * 16, 28, 2], [sd * 6, -6, 6]].map(([x, y, dz]) => { const p = S(x, y, dz); return [p[0], p[1]]; });
    ctx.fillStyle = rgba(L.mul, 0.9); ctx.fill(pathOf(q));
  }
  // vertical fall-off (top-lit / under-lit)
  if (L.vgrad) {
    const b = hs.outline.reduce((m, p) => [Math.min(m[0], p[1]), Math.max(m[1], p[1])], [1e9, -1e9]);
    const gr = ctx.createLinearGradient(0, b[0], 0, b[1]);
    gr.addColorStop(0, L.vgrad[0]); gr.addColorStop(1, L.vgrad[1]);
    ctx.fillStyle = gr; ctx.fillRect(-300, b[0], 600, b[1] - b[0]);
  }
  ctx.globalCompositeOperation = 'source-over';
  ctx.restore(); // end clip

  // ---------- nose (may break the silhouette in profile)
  if (fv > -0.28) { drawProfileBumps(ctx, hs, C, L, o); drawNose(ctx, hs, C, L, P, o); }
  // ---------- ears (near side)
  for (const s of [-1, 1]) drawEar(ctx, hs, C, L, P, o, s);
  // ---------- glints
  if (fv > -0.2) for (const s of [-1, 1]) eyeGlint(ctx, hs, o, s, gz, sq, det);
  if (o.sweat) drawSweat(ctx, hs, o);
  // ---------- rim light
  edgeFill(ctx, path, -L.rimDir[0] * L.rimW * (1 + (o.flash || 0) * 1.4), -L.rimDir[1] * L.rimW * (1 + (o.flash || 0)), L.rim, clamp(L.rimA + (o.flash || 0)));
  if (P.glasses && fv > -0.25) drawGlasses(ctx, hs, o, L);
  if (P.mustache && fv > -0.25) drawMustache(ctx, hs, C, L);
  if (P.hat && !o.noHat) drawHat(ctx, hs, P, L, o);
  if (o.cigar && cigVis >= 0.18) drawCigar(ctx, hs, C, L, o, cigSide);
  if (o.out) { const e = S(0, -24, 0); const sc = toScreen(ctx, e[0], e[1]); o.out.eyes = sc; }
  ctx.restore();
  return hs;
}

function drawGraySides(ctx, hs, C, P) {
  for (const s of [-1, 1]) {
    const lo = [], hi = [];
    for (let i = 0; i <= 14; i++) {
      const d = lerp(0.8, 2.2, i / 14), u = PI / 2 - s * d;
      const y0 = tabAt(P.hl, d) - 1, y1 = Math.max(-104, y0 - 20 - Math.sin((i / 14) * PI) * 12);
      const L0 = lvAt(P.lv, y0), c0 = csPt(L0, u), L1 = lvAt(P.lv, y1), c1 = csPt(L1, u);
      const p0 = hs.R.p(c0[0] * 1.01, y0, c0[1] * 1.01), p1 = hs.R.p(c1[0] * 1.01, y1, c1[1] * 1.01);
      const v = hs.R.n(c0[2], 0, c0[3])[2] > 0.02;
      lo.push(v ? [p0[0], p0[1]] : null); hi.push(v ? [p1[0], p1[1]] : null);
    }
    // longest visible run
    let best = [0, -1], cs = -1;
    for (let i = 0; i <= lo.length; i++) {
      if (i < lo.length && lo[i]) { if (cs < 0) cs = i; }
      else if (cs >= 0) { if (i - 1 - cs > best[1] - best[0]) best = [cs, i - 1]; cs = -1; }
    }
    if (best[1] - best[0] < 1) continue;
    const poly = lo.slice(best[0], best[1] + 1).concat(hi.slice(best[0], best[1] + 1).reverse());
    ctx.fillStyle = rgba(C.gray, 0.72 * P.grayAmt); ctx.fill(smoothPathOf(poly));
    // dark streaks inside the grey
    ctx.strokeStyle = rgba(C.hair, 0.55); ctx.lineWidth = 1.4;
    for (let i = best[0]; i < best[1]; i += 1) {
      const a = lo[i], b = hi[i]; if (!a || !b) continue;
      ctx.beginPath(); ctx.moveTo(lerp(a[0], b[0], 0.1), lerp(a[1], b[1], 0.1)); ctx.lineTo(lerp(a[0], b[0], 0.9), lerp(a[1], b[1], 0.9)); ctx.stroke();
    }
  }
}
function drawComb(ctx, hs, C, P) {
  ctx.lineWidth = 1.5; ctx.lineCap = 'round';
  const N = 30;
  for (let i = 0; i < N; i++) {
    const u = (i / N) * TAU + 0.07, d = angFromFront(u), y0 = tabAt(P.hl, d) - 3;
    ctx.beginPath(); let open = false;
    for (let k = 0; k <= 7; k++) {
      const y = lerp(y0, -149, k / 7);
      const Lv = lvAt(P.lv, y), c = csPt(Lv, u + Math.sin(k * 0.6) * 0.04);
      const p = hs.R.p(c[0] * 1.005, y, c[1] * 1.005), n = hs.R.n(c[2], -0.3 * (k / 7), c[3]);
      if (n[2] > 0.05) { ctx[open ? 'lineTo' : 'moveTo'](p[0], p[1]); open = true; } else open = false;
    }
    const gray = P.grayAmt > 0 && d > 0.75 && d < 2.5;
    ctx.strokeStyle = rgba(gray ? '#d8d4e0' : C.hairHi, gray ? 0.35 : 0.6); ctx.stroke();
  }
}
function drawEye(ctx, hs, C, L, o, s, sq, gz, det) {
  const S = hs.S, P = hs.P, v = S(s * 40, -24, 0)[3];
  if (v < -0.08) return;
  const op = P.eyeOpen * (o.eyeOpen ?? 1) * (1 - (o.blink || 0));
  const up = 6.8 * op - sq * 4, lo = 4.4 * op - sq * 1.6;
  const raw = [[s * 16, -23.5], [s * 25, -24 - up * 0.8], [s * 39, -24 - up], [s * 53, -24.5 - up * 0.82], [s * 62, -24.8], [s * 53, -24 + lo * 0.85], [s * 39, -24 + lo], [s * 25, -23.5 + lo * 0.7]];
  const q = raw.map(([x, y]) => { const p = S(x, y, -2); return [p[0], p[1]]; });
  const white = smoothPathOf(q, true, 0.8);
  ctx.save();
  ctx.fillStyle = mixc('#b8aa9c', L.key, L.keyAmt * 0.3); ctx.fill(white);
  ctx.clip(white);
  // iris
  const ic = S(s * 39 + gz[0] * 9, -24 + gz[1] * 3, -1);
  const rx = 7.6 * Math.max(0.12, v), ry = 7.6;
  if (v < 0.22) { // profile eye: just a dark wedge between the lids
    ctx.fillStyle = 'rgba(20,10,20,0.85)'; ctx.fill(white); ctx.restore();
    strokePts(ctx, q.slice(0, 5), mixc('#120810', L.key, 0.05), 3.4, false, true);
    return;
  }
  if (det > 0) {
    const gr = ctx.createRadialGradient(ic[0], ic[1], 0, ic[0], ic[1], ry);
    gr.addColorStop(0, '#101014'); gr.addColorStop(0.32, '#1a1a22'); gr.addColorStop(0.38, mixc(P.iris, '#ffffff', 0.15)); gr.addColorStop(0.85, P.iris); gr.addColorStop(1, '#2a2a34');
    ctx.fillStyle = gr;
  } else ctx.fillStyle = P.iris;
  ctx.beginPath(); ctx.ellipse(ic[0], ic[1], rx, ry, 0, 0, TAU); ctx.fill();
  if (det > 0) {
    ctx.strokeStyle = 'rgba(20,20,30,0.35)'; ctx.lineWidth = 0.35;
    for (let i = 0; i < 40; i++) { const a = (i / 40) * TAU; ctx.beginPath(); ctx.moveTo(ic[0] + Math.cos(a) * rx * 0.38, ic[1] + Math.sin(a) * ry * 0.38); ctx.lineTo(ic[0] + Math.cos(a) * rx * 0.95, ic[1] + Math.sin(a) * ry * 0.95); ctx.stroke(); }
  } else { ctx.fillStyle = '#0c0b10'; ctx.beginPath(); ctx.ellipse(ic[0], ic[1], rx * 0.42, ry * 0.42, 0, 0, TAU); ctx.fill(); }
  // upper-lid shadow on the eyeball
  ctx.fillStyle = 'rgba(20,10,20,0.55)';
  const lid = [[s * 14, -30], [s * 64, -30], [s * 64, -24 - up * 0.45], [s * 39, -24 - up * 0.55], [s * 14, -24 - up * 0.2]].map(([x, y]) => { const p = S(x, y, -1); return [p[0], p[1]]; });
  ctx.fill(pathOf(lid));
  ctx.restore();
  // lids
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  strokePts(ctx, q.slice(0, 5), mixc('#120810', L.key, 0.05), 3.4 + det * 1.2, false, true);
  if (det > 0 || P.eyeOpen > 0.95) strokePts(ctx, [q[4], q[5], q[6], q[7], q[0]], rgba(C.line, 0.6), 1.3, false, true);
  // crease above
  const cr = [[s * 20, -31 - up * 0.4], [s * 39, -34 - up * 0.45], [s * 58, -31.5 - up * 0.3]].map(([x, y]) => { const p = S(x, y, 0); return [p[0], p[1]]; });
  strokePts(ctx, cr, rgba(C.line, 0.45), 1.5, false, true);
  // bag under eye
  const bg = [[s * 22, -15.5], [s * 39, -13], [s * 55, -16]].map(([x, y]) => { const p = S(x, y, 0); return [p[0], p[1]]; });
  strokePts(ctx, bg, rgba(C.line, 0.35), 1.3, false, true);
}
function eyeGlint(ctx, hs, o, s, gz, sq, det) {
  const g = (o.glint ?? 0.6) * hs.o.light.glint;
  if (g <= 0.02) return;
  const v = hs.S(s * 40, -24, 0)[3]; if (v < 0.15) return;
  const P = hs.P, op = P.eyeOpen * (o.eyeOpen ?? 1) * (1 - (o.blink || 0)); if (op < 0.35) return;
  const ic = hs.S(s * 39 + gz[0] * 9 - 2.6, -24 + gz[1] * 3 - 2.6, 0);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  if (det > 0) {
    // reflected window: little panes
    ctx.fillStyle = rgba('#e8e4ff', 0.55 * g);
    const w = 1.9, h = 2.5;
    ctx.fillRect(ic[0] - w, ic[1] - h, w * 0.9, h * 0.9); ctx.fillRect(ic[0] + 0.3, ic[1] - h, w * 0.9, h * 0.9);
    ctx.fillRect(ic[0] - w, ic[1] + 0.3, w * 0.9, h * 0.9); ctx.fillRect(ic[0] + 0.3, ic[1] + 0.3, w * 0.9, h * 0.9);
  } else {
    ctx.fillStyle = rgba('#fff4e8', 0.95 * g);
    ctx.beginPath(); ctx.arc(ic[0], ic[1], 1.9, 0, TAU); ctx.fill();
  }
  glow(ctx, ic[0], ic[1], 9, '#ffe8d0', 0.35 * g);
  ctx.restore();
}
function drawMouth(ctx, hs, C, L, P, o) {
  const S = hs.S, md = P.mouthDown, op = o.mouthOpen || 0;
  const pt = (x, y, dz = 2) => { const p = S(x, y, dz); return [p[0], p[1]]; };
  // upper lip in shade
  const ul = [[-26, 60 + md * 1.5], [-10, 54], [0, 55], [10, 54], [26, 60 + md * 1.5], [13, 58], [0, 58.6], [-13, 58]].map(([x, y]) => pt(x, y));
  ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = rgba(L.mul, 0.7); ctx.fill(smoothPathOf(ul, true, 0.6)); ctx.restore();
  // lower lip highlight
  const ll = [[-15, 62.5], [15, 62.5], [9, 68.5], [-9, 68.5]].map(([x, y]) => pt(x, y, 3));
  ctx.fillStyle = rgba(mixc(C.skin, '#ffffff', 0.15), 0.5); ctx.fill(smoothPathOf(ll));
  // mouth line
  const ml = [[-28, 61 + md * 2.5], [-13, 58.4], [0, 59.2 + op * 3], [13, 58.4], [28, 61 + md * 2.5]].map(([x, y]) => pt(x, y, 2));
  ctx.lineCap = 'round';
  strokePts(ctx, ml, mixc('#160810', L.key, 0.08), 2.6, false, true);
  if (op > 0.7) {   // open mouth (shock / surprise)
    const h = (op - 0.5) * 26;
    const om = [[-15, 59.2], [-7, 57.6], [0, 58], [7, 57.6], [15, 59.2], [9, 59 + h], [0, 60 + h * 1.1], [-9, 59 + h]].map(([x, y]) => pt(x, y, 2));
    ctx.fillStyle = '#12060c'; ctx.fill(smoothPathOf(om, true, 0.8));
    const teeth = [[-11, 59.4], [11, 59.4], [10, 62.5], [-10, 62.5]].map(([x, y]) => pt(x, y, 2.5));
    ctx.fillStyle = rgba('#e0d8c8', 0.8); ctx.fill(pathOf(teeth));
    const tongue = [[-8, 59 + h * 0.85], [8, 59 + h * 0.85], [0, 59 + h * 0.55]].map(([x, y]) => pt(x, y, 2));
    ctx.fillStyle = rgba('#6a2a30', 0.6); ctx.fill(smoothPathOf(tongue));
  }
}
function drawNose(ctx, hs, C, L, P, o) {
  const S = hs.S, k = P.nose;
  const pt = (x, y, dz) => S(x * (0.9 + k * 0.1), y, dz * k);
  const ridge = [[0, -36, 4], [0, -14, 11], [0, 6, 21], [0, 18, 29], [0, 26, 17], [0, 29.5, 5]].map(([x, y, d]) => pt(x, y, d));
  const sideA = (s) => [[s * 7, -31, 1.5], [s * 10, -7, 4], [s * 13, 11, 6], [s * 18, 20, 3], [s * 15, 27, 4], [s * 7, 29.5, 4]].map(([x, y, d]) => pt(x, y, d));
  const sL = sideA(-1), sR = sideA(1);
  const all = ridge.concat(sL, sR).map(p => [p[0], p[1]]);
  const np = pathOf(hull(all));
  ctx.fillStyle = C.skin; ctx.fill(np);
  // plane shading
  const R = hs.R, Ld = L.dir;
  const planes = [
    { n: R.n(-0.72, 0.1, 0.68), poly: ridge.slice(0, 5).concat(sL.slice(0, 5).reverse()) },
    { n: R.n(0.72, 0.1, 0.68), poly: ridge.slice(0, 5).concat(sR.slice(0, 5).reverse()) },
    { n: R.n(0, 0.85, 0.5), poly: [ridge[3], sL[3], sL[4], sL[5], ridge[5], sR[5], sR[4], sR[3]] },
  ];
  ctx.save(); ctx.globalCompositeOperation = 'multiply';
  for (const pl of planes) {
    const nl = dot3(pl.n, Ld);
    if (nl < 0.15) { ctx.fillStyle = rgba(L.mul, clamp(0.55 + (0.15 - nl) * 1.6)); ctx.fill(pathOf(pl.poly.map(p => [p[0], p[1]]))); }
  }
  ctx.restore();
  // nostrils
  ctx.fillStyle = mixc('#140810', L.key, 0.05);
  for (const s of [-1, 1]) {
    const v = S(s * 9, 26, 6)[3]; if (v < 0.05) continue;
    const c = pt(s * 9, 26.5, 6);
    ctx.beginPath(); ctx.ellipse(c[0], c[1], 4.2 * Math.max(0.3, v), 2.2, s * 0.25, 0, TAU); ctx.fill();
  }
  // ridge highlight on lit side
  const sd = Ld[0] <= 0 ? -1 : 1;
  const hlp = [pt(sd * 2.5, -26, 4), pt(sd * 3, -2, 9.5), pt(sd * 2.8, 15, 21)];
  ctx.lineCap = 'round';
  strokePts(ctx, hlp.map(p => [p[0], p[1]]), rgba(mixc(C.skin, '#fff2dc', 0.5), 0.65), 2, false, true);
  // rim on nose silhouette (only where the nose breaks the outline: near-profile views)
  const fvN = S(0, 10, 0)[3];
  if (fvN < 0.6) edgeFill(ctx, np, -L.rimDir[0] * L.rimW * 0.8, -L.rimDir[1] * L.rimW * 0.8, L.rim, clamp(L.rimA + (o.flash || 0)) * 0.9 * clamp((0.6 - fvN) / 0.3));
}
/** lips / chin / brow volumes so the profile silhouette reads */
function drawProfileBumps(ctx, hs, C, L, o) {
  const S = hs.S, fv = S(0, 10, 0)[3];
  if (fv > 0.75) return;                    // invisible in front views anyway
  const sets = [
    [[-12, -50, 4], [12, -50, 4], [-14, -40, 9], [14, -40, 9], [0, -44, 10]],
    [[-16, 54, 4], [16, 54, 4], [-12, 66, 6], [12, 66, 6], [0, 60, 8], [0, 72, 3]],
    [[-26, 96, 3], [26, 96, 3], [-20, 112, 4], [20, 112, 4], [0, 104, 7], [0, 116, 2]],
  ];
  // only the part that breaks the skull silhouette is painted
  const outside = new Path2D(); outside.rect(-1e4, -1e4, 2e4, 2e4); outside.addPath(hs.path);
  ctx.save(); ctx.clip(outside, 'evenodd');
  for (const set of sets) {
    const pts = set.map(([x, y, d]) => { const p = S(x, y, d); return [p[0], p[1]]; });
    const pa = pathOf(hull(pts));
    ctx.fillStyle = mixc(C.skin, L.mul, 0.55); ctx.fill(pa);
    edgeFill(ctx, pa, -L.rimDir[0] * L.rimW * 0.8, -L.rimDir[1] * L.rimW * 0.8, L.rim, clamp(L.rimA + (o.flash || 0)) * 0.9);
  }
  ctx.restore();
}
function drawEar(ctx, hs, C, L, P, o, s) {
  const R = hs.R, n = R.n(s, 0, -0.25);
  if (n[2] < -0.35) return;
  const k = P.ear;
  const raw = [[80, -33, -2], [91, -36, -9], [98, -24, -17], [97, -3, -21], [91, 15, -19], [83, 22, -11], [79, 6, -2]];
  const q = raw.map(([x, y, z]) => { const p = R.p(s * (80 + (x - 80) * k), y, z); return [p[0], p[1]]; });
  const path = smoothPathOf(q);
  const lit = dot3(R.n(s, 0, 0.2), L.dir) > 0;
  ctx.fillStyle = lit ? C.skin : mixc(C.skin, L.mul, 0.6); ctx.fill(path);
  const inner = [[84, -26, -6], [92, -24, -12], [92, -4, -16], [86, 10, -12]].map(([x, y, z]) => { const p = R.p(s * (80 + (x - 80) * k), y, z); return [p[0], p[1]]; });
  strokePts(ctx, inner, rgba(C.line, 0.6), 2.2, false, true);
  edgeFill(ctx, path, -L.rimDir[0] * L.rimW * 0.8, -L.rimDir[1] * L.rimW * 0.8, L.rim, L.rimA * 0.45);
}
function drawCigar(ctx, hs, C, L, o, s) {
  const S = hs.S;
  const a = S(s * 24, 61, 2), b = S(s * 74, 88, 62);
  const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1, nx = -dy / len, ny = dx / len, r = 6.6;
  const at = f => [a[0] + dx * f, a[1] + dy * f];
  const quad = (f0, f1, w0 = r, w1 = r) => { const p = at(f0), q = at(f1); return pathOf([[p[0] + nx * w0, p[1] + ny * w0], [q[0] + nx * w1, q[1] + ny * w1], [q[0] - nx * w1, q[1] - ny * w1], [p[0] - nx * w0, p[1] - ny * w0]]); };
  ctx.fillStyle = mixc('#4a2a18', L.key, L.keyAmt * 0.5); ctx.fill(quad(0, 0.9, r * 0.92, r));
  ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fill(quad(0, 0.9, -r * 0.1, -r));
  ctx.fillStyle = mixc('#8a1c22', L.key, 0.2); ctx.fill(quad(0.18, 0.27, r * 0.98, r));
  ctx.fillStyle = mixc('#c8a050', L.key, 0.2); ctx.fill(quad(0.2, 0.23, r, r));
  ctx.fillStyle = '#8a837c'; ctx.fill(quad(0.9, 1, r, r * 0.92));
  const e = at(1), fl = 0.75 + 0.25 * Math.sin((o.t || 0) * 7.3) * snz((o.t || 0) * 3, 9);
  ctx.fillStyle = mixc('#ff5a1a', '#ffd08a', 0.3 * fl);
  ctx.beginPath(); ctx.ellipse(e[0], e[1], r * 0.55, r * 0.95, Math.atan2(dy, dx), 0, TAU); ctx.fill();
  glow(ctx, e[0], e[1], 26, '#ff7a2a', 0.55 * fl);
  if (o.out) o.out.ember = toScreen(ctx, e[0], e[1] - 2);
}
function drawFaceDetail(ctx, hs, C, L, o, det) {
  const S = hs.S, pt = (x, y, dz = 1) => { const p = S(x, y, dz); return [p[0], p[1]]; };
  ctx.lineCap = 'round';
  for (const s of [-1, 1]) {
    if (S(s * 60, -24, 0)[3] < 0) continue;
    // crow's feet
    for (let i = 0; i < 3; i++) strokePts(ctx, [pt(s * 64, -26 + i * 5), pt(s * 74, -30 + i * 7)], rgba(C.line, 0.35 * det), 1, false);
    // under-eye second fold
    strokePts(ctx, [pt(s * 24, -9), pt(s * 40, -6), pt(s * 54, -10)], rgba(C.line, 0.25 * det), 1, false, true);
  }
  // forehead furrows & frown lines
  for (let i = 0; i < 3; i++) strokePts(ctx, [pt(-40, -64 - i * 8), pt(-12, -67 - i * 8), pt(12, -67 - i * 8), pt(40, -64 - i * 8)], rgba(C.line, 0.28 * det), 1.2, false, true);
  for (const s of [-1, 1]) strokePts(ctx, [pt(s * 7, -48), pt(s * 5, -36)], rgba(C.line, 0.5 * det), 1.6, false);
  // pores / stubble dots
  ctx.fillStyle = rgba('#2a2030', 0.18 * det);
  for (let i = 0; i < 160; i++) {
    const x = (hash(i * 3) - 0.5) * 140, y = 30 + hash(i * 3 + 1) * 85;
    if (Math.abs(x) < 26 && y > 52 && y < 72) continue;
    const p = S(x, y, 0.5); if (p[3] < 0.1) continue;
    ctx.fillRect(p[0], p[1], 0.45, 0.45);
  }
}
function drawSweat(ctx, hs, o) {
  const t = o.sweatT || 0;
  const p = hs.S(-64, -54 + t * 46, 3);
  if (p[3] < 0.05) return;
  ctx.fillStyle = 'rgba(210,220,240,0.55)';
  ctx.beginPath(); ctx.ellipse(p[0], p[1], 2.4, 3.6, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.beginPath(); ctx.arc(p[0] - 0.8, p[1] - 1.2, 0.9, 0, TAU); ctx.fill();
  // sheen on forehead
  ctx.strokeStyle = 'rgba(255,250,235,0.25)'; ctx.lineWidth = 1.4;
  for (let i = 0; i < 4; i++) { const a = hs.S(-30 + i * 18, -70 + (i % 2) * 6, 1), b = hs.S(-24 + i * 18, -71 + (i % 2) * 6, 1); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
}
function drawGlasses(ctx, hs, o, L) {
  const S = hs.S, c = [];
  for (const s of [-1, 1]) {
    const p = S(s * 39, -24, 13); c.push(p);
    if (p[3] < -0.05) continue;
    const rx = 18 * Math.max(0.15, p[3]);
    ctx.fillStyle = 'rgba(200,200,255,0.07)'; ctx.strokeStyle = '#1a1418'; ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.ellipse(p[0], p[1], rx, 17, 0, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = rgba('#fff0d8', 0.55 * (0.4 + (o.flash || 0) + (o.lensGlint || 0)));
    ctx.lineWidth = 2.2; ctx.beginPath(); ctx.ellipse(p[0], p[1], rx * 0.7, 12, 0, -2.4, -1.5); ctx.stroke(); ctx.restore();
  }
  const a = S(-21, -27, 14), b = S(21, -27, 14);
  ctx.strokeStyle = '#1a1418'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.quadraticCurveTo((a[0] + b[0]) / 2, a[1] - 4, b[0], b[1]); ctx.stroke();
}
function drawMustache(ctx, hs, C, L) {
  const S = hs.S, q = [[-24, 53.5], [-6, 50], [0, 51.2], [6, 50], [24, 53.5], [14, 55], [0, 54], [-14, 55]].map(([x, y]) => { const p = S(x, y, 3); return [p[0], p[1]]; });
  ctx.fillStyle = mixc(hs.P.hair, '#000000', 0.2); ctx.fill(smoothPathOf(q, true, 0.7));
}
function drawHat(ctx, hs, P, L, o) {
  const R = hs.R, hc = P.hat, pts = [], brim = [];
  if (hc.type === 'cap') {                      // knit watch cap: no brim
    for (const [y, r] of [[-62, 86], [-80, 90], [-104, 92], [-132, 86], [-152, 64], [-163, 30]]) for (let k = 0; k < 20; k++) {
      const u = (k / 20) * TAU; const p = R.p(Math.cos(u) * r, y, 4 + Math.sin(u) * r * 1.04); pts.push([p[0], p[1]]);
    }
    const cp = pathOf(hull(pts));
    ctx.fillStyle = mixc(hc.color, L.key, L.keyAmt * 0.12); ctx.fill(cp);
    ctx.save(); ctx.clip(cp); ctx.strokeStyle = rgba('#000000', 0.35); ctx.lineWidth = 2;
    for (let k = 0; k < 18; k++) { const u = PI / 2 + (k - 9) * 0.16; const a = R.p(Math.cos(u) * 90, -66, 4 + Math.sin(u) * 94), b = R.p(Math.cos(u) * 70, -150, 4 + Math.sin(u) * 70); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
    const c1 = [], c2 = []; for (let k = 0; k <= 16; k++) { const u = PI / 2 + (k - 8) * 0.19; const a = R.p(Math.cos(u) * 91, -84, 4 + Math.sin(u) * 95); c1.push([a[0], a[1]]); }
    strokePts(ctx, c1, rgba('#000000', 0.5), 3, false, true);
    ctx.restore();
    edgeFill(ctx, cp, -L.rimDir[0] * L.rimW, -L.rimDir[1] * L.rimW, L.rim, L.rimA);
    return;
  }
  for (let k = 0; k < 28; k++) {
    const u = (k / 28) * TAU, fr = Math.sin(u), dip = fr > 0 ? fr * fr * 14 : -fr * 4;
    for (const th of [0, 9]) { const p = R.p(Math.cos(u) * 158, -94 + dip + th, 8 + fr * 160); brim.push([p[0], p[1]]); }
  }
  for (const [y, r] of [[-96, 96], [-122, 94], [-150, 86], [-170, 70]]) for (let k = 0; k < 20; k++) {
    const u = (k / 20) * TAU, pinch = y < -130 && Math.sin(u) > 0.5 ? 0.8 : 1;
    const p = R.p(Math.cos(u) * r * pinch, y, 6 + Math.sin(u) * r * 1.02 * pinch); pts.push([p[0], p[1]]);
  }
  // brim shadow on the face
  ctx.save(); ctx.clip(hs.path); ctx.globalCompositeOperation = 'multiply';
  const bh = hull(brim), by = Math.max(...bh.map(p => p[1]));
  ctx.fillStyle = rgba('#120a14', 0.88); ctx.fillRect(-300, -300, 600, by + 34 + 300);
  ctx.restore();
  const bp = pathOf(bh), cp = pathOf(hull(pts));
  ctx.fillStyle = mixc(hc.color, L.key, L.keyAmt * 0.15); ctx.fill(bp); ctx.fill(cp);
  // band
  const band = [];
  for (let k = 0; k < 20; k++) { const u = (k / 20) * TAU; const p1 = R.p(Math.cos(u) * 91, -98, 6 + Math.sin(u) * 92), p2 = R.p(Math.cos(u) * 90, -114, 6 + Math.sin(u) * 91); if (R.n(Math.cos(u), 0, Math.sin(u))[2] > 0) band.push([p1, p2]); }
  if (band.length > 2) { ctx.fillStyle = hc.band; ctx.fill(pathOf(band.map(b => [b[0][0], b[0][1]]).concat(band.map(b => [b[1][0], b[1][1]]).reverse()))); }
  edgeFill(ctx, cp, -L.rimDir[0] * L.rimW, -L.rimDir[1] * L.rimW, L.rim, L.rimA);
  edgeFill(ctx, bp, -L.rimDir[0] * L.rimW * 0.7, -L.rimDir[1] * L.rimW * 0.7, L.rim, L.rimA * 0.8);
}
