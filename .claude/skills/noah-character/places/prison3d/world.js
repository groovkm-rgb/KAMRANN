// PRISON BLOCK world for the vertical (1080x1920) Noah short: a small 3D camera + painter's renderer on Canvas 2D.
// World: x across the hall (left facade x=-HW, right facade x=+HW), y up, z along the hall (0 -> L, exit gate at z=L).
const W = (typeof window !== "undefined" && window.FILM_W) || 1080, H = (typeof window !== "undefined" && window.FILM_H) || 1920, FPS = 30;
const OUT = '#1b1720';
const clamp = (v, a, b) => v < a ? a : v > b ? b : v, lerp = (a, b, t) => a + (b - a) * t;
const ease = t => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
const ease5 = t => { t = clamp(t, 0, 1); return t * t * t * (t * (t * 6 - 15) + 10); };
const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
const rnd = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const easeBack = t => { const s = 1.4; t -= 1; return t * t * ((s + 1) * t + s) + 1; };
function rrect(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }

// ---------- geometry ----------
const G = { CW: 440, PIL: 60, NL: 13, NR: 12, Z0: 300, FH: 760, HW: 1050, CD: 600, DW: 380, DH: 520, WW: 280, RAIL: 230, SLAB: 46 };
G.L = G.Z0 + G.NL * G.CW + 420;            // end wall (exit)
G.CEIL = 4 * G.FH + 560;                    // ceiling height
G.ZS = -2600;                               // entrance vestibule (no cells) behind the first cells
// cell n (1..100) -> { side, floor, slot, z0 (start of cell), zc, yf, open-door pocket dir }
function cellInfo(n) {
  const f = 3 - Math.floor((n - 1) / 25), i = (n - 1) % 25;
  const side = i < 13 ? -1 : 1, slot = i < 13 ? (f % 2 ? i : 12 - i) : 24 - i; // snake numbering (the guard's U-shaped walk)
  const z0 = G.Z0 + slot * G.CW;
  return { n, side, f, slot, z0, zc: z0 + G.CW / 2, yf: f * G.FH, x: side * G.HW };
}
const CELLS = []; for (let n = 1; n <= 100; n++) CELLS.push(cellInfo(n));
const cellAt = (side, f, slot) => CELLS.find(q => q.side === side && q.f === f && q.slot === slot);

// ---------- camera ----------
const CAM = { x: 0, y: 1000, z: 0, yaw: 0, pitch: 0, F: 1000 };
const NEAR = 12;
function toCam(x, y, z) {
  const dx = x - CAM.x, dy = y - CAM.y, dz = z - CAM.z, cy = Math.cos(CAM.yaw), sy = Math.sin(CAM.yaw);
  const xr = dx * cy - dz * sy, zr = dx * sy + dz * cy, cp = Math.cos(CAM.pitch), sp = Math.sin(CAM.pitch);
  return [xr, dy * cp - zr * sp, dy * sp + zr * cp];
}
const scr = q => [W / 2 + CAM.F * q[0] / q[2], H / 2 - CAM.F * q[1] / q[2]];
function P(x, y, z) { const q = toCam(x, y, z); if (q[2] < NEAR) return null; const s = scr(q); return [s[0], s[1], CAM.F / q[2], q[2]]; }
// project a 3D polygon with near-plane clipping -> [[sx,sy]...] or null
function PP(pts) {
  const cs = pts.map(p => toCam(p[0], p[1], p[2])), out = [];
  for (let i = 0; i < cs.length; i++) {
    const a = cs[i], b = cs[(i + 1) % cs.length], ai = a[2] >= NEAR, bi = b[2] >= NEAR;
    if (ai) out.push(a);
    if (ai !== bi) { const t = (NEAR - a[2]) / (b[2] - a[2]); out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, NEAR]); }
  }
  if (out.length < 3) return null;
  const r = out.map(scr); let mnx = 1e9, mxx = -1e9, mny = 1e9, mxy = -1e9;
  for (const p of r) { if (p[0] < mnx) mnx = p[0]; if (p[0] > mxx) mxx = p[0]; if (p[1] < mny) mny = p[1]; if (p[1] > mxy) mxy = p[1]; }
  if (mxx < -50 || mnx > W + 50 || mxy < -50 || mny > H + 50) return null;
  return r;
}
function PL(a, b) { // project a 3D segment with clipping
  let p = toCam(...a), q = toCam(...b);
  if (p[2] < NEAR && q[2] < NEAR) return null;
  if (p[2] < NEAR) { const t = (NEAR - p[2]) / (q[2] - p[2]); p = [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t, NEAR]; }
  if (q[2] < NEAR) { const t = (NEAR - q[2]) / (p[2] - q[2]); q = [q[0] + (p[0] - q[0]) * t, q[1] + (p[1] - q[1]) * t, NEAR]; }
  const s1 = scr(p), s2 = scr(q); return [s1[0], s1[1], s2[0], s2[1], CAM.F / p[2], CAM.F / q[2]];
}
const poly = (c, r) => { c.beginPath(); c.moveTo(r[0][0], r[0][1]); for (let i = 1; i < r.length; i++) c.lineTo(r[i][0], r[i][1]); c.closePath(); };
function fillPoly(c, pts, col) { const r = PP(pts); if (!r) return null; poly(c, r); c.fillStyle = col; c.fill(); return r; }
function line3(c, a, b, w, col) { const l = PL(a, b); if (!l) return; c.beginPath(); c.moveTo(l[0], l[1]); c.lineTo(l[2], l[3]); c.lineWidth = Math.max(.6, w * (l[4] + l[5]) / 2); c.strokeStyle = col; c.stroke(); }
// affine approximation of a small plane: draw fn(c) in local units (u right, v down) with origin o, unit axes u, v (world vectors)
function onPlane(c, o, u, v, fn, size = 100) {
  const p0 = P(...o), p1 = P(o[0] + u[0] * size, o[1] + u[1] * size, o[2] + u[2] * size), p2 = P(o[0] + v[0] * size, o[1] + v[1] * size, o[2] + v[2] * size);
  if (!p0 || !p1 || !p2) return false;
  c.save(); c.transform((p1[0] - p0[0]) / size, (p1[1] - p0[1]) / size, (p2[0] - p0[0]) / size, (p2[1] - p0[1]) / size, p0[0], p0[1]); fn(c, p0[2]); c.restore(); return true;
}
// billboard: draw fn in world units at feet (x,y,z), facing the camera
function billboard(c, x, y, z, fn) { const p = P(x, y, z); if (!p) return null; c.save(); c.translate(p[0], p[1]); c.scale(p[2], p[2]); fn(c, p[2]); c.restore(); return p; }

// ---------- light / colour ----------
const LT = { amb: [.1, .13, .19], lamps: [], fog: [18, 26, 38], fogNear: 1800, fogFar: 9000, fogMax: .55, warm: 0, dawn: 0, t: 0 };
function lightAt(x, y, z, nrm) {
  let r = LT.amb[0], g = LT.amb[1], b = LT.amb[2];
  for (const L of LT.lamps) {
    const dx = L.x - x, dy = L.y - y, dz = L.z - z, d2 = dx * dx + dy * dy + dz * dz, R = L.r * L.r;
    let k = L.i * R / (R + d2);
    if (nrm) { const d = Math.sqrt(d2) + 1e-3, dot = (dx * nrm[0] + dy * nrm[1] + dz * nrm[2]) / d; k *= clamp(.25 + dot, 0, 1.25); }
    r += L.c[0] * k; g += L.c[1] * k; b += L.c[2] * k;
  }
  return [r, g, b];
}
const tone = v => v / (1 + .55 * v);
function shade(base, x, y, z, nrm, extra) {
  const l = lightAt(x, y, z, nrm); if (extra) { l[0] += extra[0]; l[1] += extra[1]; l[2] += extra[2]; }
  l[0] = tone(l[0]); l[1] = tone(l[1]); l[2] = tone(l[2]);
  let r = base[0] * l[0], g = base[1] * l[1], b = base[2] * l[2];
  const q = toCam(x, y, z), f = clamp((q[2] - LT.fogNear) / (LT.fogFar - LT.fogNear), 0, 1) * LT.fogMax;
  r = lerp(r, LT.fog[0], f); g = lerp(g, LT.fog[1], f); b = lerp(b, LT.fog[2], f);
  return `rgb(${Math.min(255, r) | 0},${Math.min(255, g) | 0},${Math.min(255, b) | 0})`;
}
const fogF = (x, y, z) => { const q = toCam(x, y, z); return clamp((q[2] - LT.fogNear) / (LT.fogFar - LT.fogNear), 0, 1) * LT.fogMax; };
function glow(c, x, y, r, col, a, mode = 'lighter') {
  if (r < 1 || a <= 0) return; const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(.25, `rgba(${col},${a * .45})`); g.addColorStop(.6, `rgba(${col},${a * .12})`); g.addColorStop(1, `rgba(${col},0)`);
  c.save(); c.globalCompositeOperation = mode; c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); c.restore();
}
function glow3(c, x, y, z, r, col, a) { const p = P(x, y, z); if (p) glow(c, p[0], p[1], r * p[2], col, a * (1 - fogF(x, y, z) * .8)); return p; }

// ---------- materials ----------
const MAT = {
  stone: [128, 138, 150], stoneDark: [92, 100, 112], cellWall: [150, 150, 146], cellFloor: [110, 108, 104], ceilC: [70, 76, 90],
  iron: [58, 62, 70], slab: [96, 102, 112], floor: [120, 124, 130], endWall: [118, 122, 132], brick: [140, 120, 108],
};

// ---------- door state (set by the film) ----------
const DOOR = new Float32Array(101);       // 0 closed .. 1 open
const DOORGLOW = new Float32Array(101);   // golden light inside the cell 0..1
const DOORSHADE = new Float32Array(101);  // extra darkness on a door (S9 mystery) 0..1
let PLATE64 = 0, PLATEGLOW = 0;           // glow on 64 plate
let MARKS = { n: 0, hi: -1, a: 0 };       // divisor marks on door 64

// ---------- drawing of the block ----------
function drawCeiling(c, t) {
  const y = G.CEIL, hw = G.HW;
  fillPoly(c, [[-hw, y, G.ZS], [hw, y, G.ZS], [hw, y, G.L], [-hw, y, G.L]], shade(MAT.ceilC, 0, y, G.L * .4, [0, -1, 0]));
  // skylights between trusses
  for (let z = G.ZS + 260; z < G.L - 300; z += 880) {
    const r = fillPoly(c, [[-420, y - 2, z], [420, y - 2, z], [420, y - 2, z + 560], [-420, y - 2, z + 560]], LT.dawn > .5 ? `rgb(${lerp(70, 240, LT.dawn)},${lerp(90, 200, LT.dawn)},${lerp(130, 150, LT.dawn)})` : `rgb(${40 + LT.dawn * 180},${60 + LT.dawn * 130},${95 + LT.dawn * 50})`);
    if (r) for (let k = 1; k < 4; k++) { line3(c, [-420 + k * 210, y - 3, z], [-420 + k * 210, y - 3, z + 560], 10, 'rgba(30,34,44,.9)'); }
    if (r) line3(c, [-420, y - 3, z + 280], [420, y - 3, z + 280], 10, 'rgba(30,34,44,.9)');
  }
  // arched iron trusses
  for (let z = G.ZS + 160; z < G.L; z += 880) {
    const pts = []; for (let i = 0; i <= 16; i++) { const a = i / 16, x = -hw + a * 2 * hw; pts.push([x, y - 380 + Math.sin(a * Math.PI) * 340, z]); }
    for (let i = 0; i < 16; i++) line3(c, pts[i], pts[i + 1], 26, shade(MAT.iron, pts[i][0], pts[i][1], z));
    for (let i = 0; i < 16; i += 2) line3(c, pts[i], [pts[i][0], y, z], 10, shade(MAT.iron, pts[i][0], y, z));
    line3(c, [-hw, y - 380, z], [hw, y - 380, z], 14, shade(MAT.iron, 0, y - 380, z));
  }
}
function drawUpperWalls(c, t) {
  // clerestory band above the top floor with tall arched windows (moonlight / dawn source)
  for (const s of [-1, 1]) {
    const x = s * G.HW, y0 = 4 * G.FH, y1 = G.CEIL;
    fillPoly(c, [[x, y0, G.ZS], [x, y1, G.ZS], [x, y1, G.L], [x, y0, G.L]], shade(MAT.stoneDark, x, y0 + 200, 2000, [-s, 0, 0]));
    for (let z = G.ZS + 280; z < G.L - 200; z += 880) {
      const sky = `rgb(${lerp(70, 255, LT.dawn) | 0},${lerp(100, 214, LT.dawn) | 0},${lerp(150, 150, LT.dawn) | 0})`;
      const pts = [[x, y0 + 80, z], [x, y0 + 80, z + 300]]; for (let i = 0; i <= 8; i++) { const a = i / 8 * Math.PI; pts.push([x, y0 + 360 + Math.sin(a) * 150, z + 150 + Math.cos(a) * 150]); }
      const r = fillPoly(c, pts, sky);
      if (r) { line3(c, [x, y0 + 80, z + 150], [x, y0 + 510, z + 150], 12, '#232833'); line3(c, [x, y0 + 250, z], [x, y0 + 250, z + 300], 12, '#232833'); line3(c, [x, y0 + 400, z + 10], [x, y0 + 400, z + 290], 10, '#232833'); }
      glow3(c, x, y0 + 300, z + 150, 380, LT.dawn > .4 ? '255,200,120' : '150,190,255', .16 + LT.dawn * .2);
    }
  }
}
function drawPlainWalls(c, t) {
  for (const s of [-1, 1]) for (const [za, zb] of [[G.ZS, G.Z0], [G.Z0 + G.NL * G.CW, G.L]]) for (let f = 0; f < 4; f++) {
    const x = s * G.HW, y0 = f * G.FH, y1 = y0 + G.FH;
    for (let z = za; z < zb; z += 440) { const z2 = Math.min(zb, z + 440); fillPoly(c, [[x, y0, z], [x, y0, z2], [x, y1, z2], [x, y1, z]], shade(MAT.stoneDark, x, y0 + 400, (z + z2) / 2, [-s, 0, 0])); }
    // tall blind arches on the plain wall
    for (let z = za + 220; z < zb - 200; z += 880) { const pts = [[x - s * 2, y0 + 40, z - 150], [x - s * 2, y0 + 40, z + 150]]; for (let i = 0; i <= 8; i++) { const a = i / 8 * Math.PI; pts.push([x - s * 2, y0 + 460 + Math.sin(a) * 150, z + Math.cos(a) * 150]); } fillPoly(c, pts, shade([70, 76, 88], x, y0 + 300, z, [-s, 0, 0])); }
  }
}
function drawFloor(c, t) {
  const hw = G.HW;
  // big floor quad split along z for lighting
  for (let z = G.ZS; z < G.L; z += 440) for (let x = -hw; x < hw; x += 700) {
    fillPoly(c, [[x, 0, z], [x + 700, 0, z], [x + 700, 0, z + 440], [x, 0, z + 440]], shade(MAT.floor, x + 350, 0, z + 220, [0, 1, 0]));
  }
  // stone tiles (LOD)
  c.save(); c.globalAlpha = .55;
  for (let z = G.ZS; z <= G.L; z += 220) { const q = toCam(0, 0, z); if (q[2] > 5000) continue; line3(c, [-hw, 0, z], [hw, 0, z], 3, 'rgba(40,44,54,.8)'); }
  for (let x = -hw; x <= hw; x += 220) line3(c, [x, 0, G.ZS], [x, 0, G.L], 3, 'rgba(40,44,54,.8)');
  c.restore();
  // polished reflections of the hanging lamps + gate light on the floor
  for (const L of LT.lamps) if (L.refl) { const p = P(L.x, 0, L.z); if (p) { c.save(); c.translate(p[0], p[1]); c.scale(1, .32); glow(c, 0, 0, 320 * p[2], L.cs || '255,190,110', .22 * L.i); c.restore(); } }
}
function drawEndWall(c, t, o = {}) {
  const z = G.L, hw = G.HW, y1 = G.CEIL, gw = 300, gh = 720;
  const base = shade(MAT.endWall, 0, 1200, z - 200, [0, 0, -1]);
  // wall with gate hole
  const r = PP([[-hw, 0, z], [hw, 0, z], [hw, y1, z], [-hw, y1, z]]);
  if (r) {
    poly(c, r); const pts = [[-gw, 0, z], [-gw, gh - 300, z]]; for (let i = 0; i <= 10; i++) { const a = Math.PI - i / 10 * Math.PI; pts.push([Math.cos(a) * gw, gh - 300 + Math.sin(a) * 300, z]); } pts.push([gw, 0, z]);
    const g = PP(pts); if (g) { c.moveTo(g[0][0], g[0][1]); for (const p of g.slice(1)) c.lineTo(p[0], p[1]); c.closePath(); }
    c.fillStyle = base; c.fill('evenodd');
    // outside behind the gate: morning sky, green hill, sun
    if (g) {
      c.save(); poly(c, g); c.clip();
      const top = P(0, gh, z + 10), bot = P(0, 0, z + 10);
      if (top && bot) {
        const sky = c.createLinearGradient(0, top[1], 0, bot[1]);
        const d = LT.dawn; sky.addColorStop(0, `rgb(${lerp(40, 255, d)},${lerp(60, 214, d)},${lerp(110, 150, d)})`); sky.addColorStop(.6, `rgb(${lerp(70, 255, d)},${lerp(80, 236, d)},${lerp(120, 190, d)})`); sky.addColorStop(1, `rgb(${lerp(40, 120, d)},${lerp(70, 180, d)},${lerp(60, 90, d)})`);
        c.fillStyle = sky; c.fillRect(0, top[1] - 50, W, bot[1] - top[1] + 100);
        // hill + sun + birds
        const sc = bot[2]; c.save(); c.translate(bot[0], bot[1]); c.scale(sc, sc);
        c.fillStyle = `rgb(${lerp(30, 120, d)},${lerp(60, 170, d)},${lerp(40, 70, d)})`; c.beginPath(); c.moveTo(-400, 0); c.quadraticCurveTo(-100, -260, 120, -180); c.quadraticCurveTo(300, -120, 400, -150); c.lineTo(400, 20); c.lineTo(-400, 20); c.fill();
        c.fillStyle = `rgb(${lerp(20, 80, d)},${lerp(45, 140, d)},${lerp(30, 60, d)})`; c.beginPath(); c.moveTo(-400, 0); c.quadraticCurveTo(0, -120, 400, -40); c.lineTo(400, 20); c.lineTo(-400, 20); c.fill();
        if (d > 0) { glow(c, 120, -330, 300, '255,230,160', .9 * d); c.beginPath(); c.arc(120, -330, 46, 0, 7); c.fillStyle = `rgba(255,246,210,${d})`; c.fill();
          for (let i = 0; i < 4; i++) { const bx = -200 + i * 70 + Math.sin(t * 2 + i) * 20 + ((t * 40 + i * 50) % 160), by = -420 + i * 25 + Math.sin(t * 6 + i) * 6, w = 14 + 6 * Math.sin(t * 14 + i); c.beginPath(); c.moveTo(bx - 18, by - w * .5); c.quadraticCurveTo(bx - 8, by, bx, by); c.quadraticCurveTo(bx + 8, by, bx + 18, by - w * .5); c.lineWidth = 5; c.strokeStyle = 'rgba(60,50,60,.8)'; c.stroke(); } }
        c.restore();
      }
      c.restore();
    }
  }
  // gate doors (two leaves) opening outward
  const go = o.gateOpen || 0;
  for (const s of [-1, 1]) {
    const ang = go * 1.35, x0 = s * gw, ex = x0 - s * Math.cos(ang) * gw, ez = z + Math.sin(ang) * gw;
    const pts = [[x0, 0, z + 5], [ex, 0, ez + 5], [ex, gh - 300, ez + 5], [x0, gh - 300, z + 5]];
    const rr = fillPoly(c, pts, shade([60, 56, 58], 0, 300, z - 300));
    if (rr) for (let i = 1; i < 6; i++) { const a = i / 6; line3(c, [lerp(x0, ex, a), 0, lerp(z, ez, a) + 4], [lerp(x0, ex, a), gh - 300, lerp(z, ez, a) + 4], 12, '#2a2628'); }
    if (rr) for (const yy of [80, 260, 400]) line3(c, [x0, yy, z + 4], [ex, yy, ez + 4], 14, '#3a3432');
  }
  // light leaking from the gate (cracks when closed, flood when open)
  const leak = clamp(.25 + go * 1.2 + LT.dawn * .4, 0, 1.4);
  glow3(c, 0, 280, z - 20, 800, '255,196,110', .3 * leak);
  // arch frame + "Ausgang" sign
  const arch = []; for (let i = 0; i <= 12; i++) { const a = Math.PI - i / 12 * Math.PI; arch.push([Math.cos(a) * (gw + 40), gh - 300 + Math.sin(a) * 340, z - 2]); }
  for (let i = 0; i < 12; i++) line3(c, arch[i], arch[i + 1], 44, shade(MAT.stoneDark, 0, gh, z - 100));
  onPlane(c, [-210, gh + 150, z - 4], [1, 0, 0], [0, -1, 0], (c) => {
    c.fillStyle = '#2a2016'; rrect(c, -8, -8, 436, 116, 14); c.fill();
    const g = c.createLinearGradient(0, 0, 0, 100); g.addColorStop(0, '#f3d58a'); g.addColorStop(.5, '#c99a45'); g.addColorStop(1, '#8a6224'); c.fillStyle = g; rrect(c, 0, 0, 420, 100, 10); c.fill();
    c.fillStyle = '#2b1d0d'; c.font = `700 68px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('Ausgang', 210, 54);
  });
  glow3(c, 0, gh + 100, z - 30, 300, '255,210,140', .25 + .25 * leak);
  // big wall clock
  const cy = 2 * G.FH + 980;
  onPlane(c, [0, cy, z - 6], [1, 0, 0], [0, -1, 0], (c) => {
    c.beginPath(); c.arc(0, 0, 250, 0, 7); c.fillStyle = '#3a2c1c'; c.fill(); c.beginPath(); c.arc(0, 0, 224, 0, 7); c.fillStyle = '#e8dcc0'; c.fill(); c.lineWidth = 10; c.strokeStyle = '#7a5a2a'; c.stroke();
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; c.save(); c.rotate(a); c.fillStyle = '#2a2420'; c.fillRect(-5, -210, 10, i % 3 ? 26 : 44); c.restore(); }
    const hA = (o.clockH ?? 1.2), mA = (o.clockM ?? .3);
    c.save(); c.rotate(hA); c.fillStyle = '#211c1a'; c.fillRect(-9, -120, 18, 130); c.restore();
    c.save(); c.rotate(mA); c.fillStyle = '#211c1a'; c.fillRect(-6, -185, 12, 195); c.restore();
    c.beginPath(); c.arc(0, 0, 16, 0, 7); c.fillStyle = '#b8873a'; c.fill();
  });
  // big arched window high up
  const wy = 3 * G.FH + 520;
  const wpts = [[-520, wy, z - 3], [520, wy, z - 3]]; for (let i = 0; i <= 12; i++) { const a = i / 12 * Math.PI; wpts.push([Math.cos(a) * 520, wy + 420 + Math.sin(a) * 520, z - 3]); }
  const sky = `rgb(${lerp(64, 255, LT.dawn) | 0},${lerp(96, 205, LT.dawn) | 0},${lerp(146, 140, LT.dawn) | 0})`;
  if (fillPoly(c, wpts, sky)) {
    for (let i = -3; i <= 3; i++) line3(c, [i * 150, wy, z - 4], [i * 150, wy + 420 + Math.sqrt(Math.max(0, 520 * 520 - i * 150 * i * 150)), z - 4], 12, '#20242e');
    for (const yy of [wy + 160, wy + 340, wy + 520, wy + 700]) { const hx = yy > wy + 420 ? Math.sqrt(Math.max(0, 520 * 520 - (yy - wy - 420) ** 2)) : 520; line3(c, [-hx, yy, z - 4], [hx, yy, z - 4], 12, '#20242e'); }
    glow3(c, 0, wy + 400, z - 20, 900, LT.dawn > .4 ? '255,200,120' : '140,180,255', .15 + LT.dawn * .25);
  }
  // iron stairs zig-zagging up the end wall (left / right halves)
  const flights = [[-1, 0], [1, 1], [-1, 2]];
  for (const [s, f] of flights) {
    const y0 = f * G.FH, y1 = y0 + G.FH, xa = s * 330, xb = s * (G.HW - G.WW), zz = z - 130;
    const steps = 12;
    for (let i = 0; i < steps; i++) { const a = i / steps, b = (i + 1) / steps; fillPoly(c, [[lerp(xa, xb, a), lerp(y0, y1, b), zz - 110], [lerp(xa, xb, b), lerp(y0, y1, b), zz - 110], [lerp(xa, xb, b), lerp(y0, y1, b), zz + 110], [lerp(xa, xb, a), lerp(y0, y1, b), zz + 110]], shade(MAT.iron, xa, y0 + 300, zz)); }
    for (const dz of [-120, 120]) { line3(c, [xa, y0, zz + dz], [xb, y1, zz + dz], 16, '#2a2d35'); line3(c, [xa, y0 + 200, zz + dz], [xb, y1 + 200, zz + dz], 9, '#3a3e48'); for (let i = 0; i <= 6; i++) { const a = i / 6; line3(c, [lerp(xa, xb, a), lerp(y0, y1, a), zz + dz], [lerp(xa, xb, a), lerp(y0, y1, a) + 200, zz + dz], 6, '#3a3e48'); } }
  }
  // guard desk (right of the gate): desk, ledger, candle, coffee cup
  const dx = 640, dz = z - 420;
  const top = 200;
  fillPoly(c, [[dx - 180, top, dz - 110], [dx + 180, top, dz - 110], [dx + 180, top, dz + 110], [dx - 180, top, dz + 110]], shade([120, 82, 50], dx, top, dz, [0, 1, 0]));
  fillPoly(c, [[dx - 180, 0, dz - 110], [dx + 180, 0, dz - 110], [dx + 180, top, dz - 110], [dx - 180, top, dz - 110]], shade([90, 60, 36], dx, 100, dz - 110, [0, 0, -1]));
  fillPoly(c, [[dx - 180, 0, dz - 110], [dx - 180, top, dz - 110], [dx - 180, top, dz + 110], [dx - 180, 0, dz + 110]], shade([80, 52, 30], dx - 180, 100, dz, [-1, 0, 0]));
  fillPoly(c, [[dx - 80, top + 4, dz - 50], [dx + 40, top + 4, dz - 50], [dx + 40, top + 4, dz + 40], [dx - 80, top + 4, dz + 40]], '#a8322c');
  billboard(c, dx + 110, top, dz - 30, (c) => { c.fillStyle = '#efe6d2'; c.fillRect(-10, -60, 20, 60); c.fillStyle = '#ffd27a'; c.beginPath(); c.ellipse(0, -72, 6, 13 + Math.sin(t * 13) * 2, 0, 0, 7); c.fill(); });
  glow3(c, dx + 110, top + 72, dz - 30, 160, '255,190,100', .55);
  billboard(c, dx - 120, top, dz + 60, (c) => { c.fillStyle = '#e9e2d6'; c.beginPath(); c.moveTo(-22, -40); c.lineTo(22, -40); c.lineTo(18, 0); c.lineTo(-18, 0); c.fill(); c.lineWidth = 3; c.strokeStyle = '#4a3a30'; c.stroke(); c.beginPath(); c.arc(26, -22, 10, -1.4, 1.4); c.stroke(); });
}

// cell interiors: what every cell shows. type -> props + prisoner (chars.js)
function drawCell(c, q, t, detail) {
  const s = q.side, x0 = s * G.HW, x1 = s * (G.HW + G.CD), za = q.z0 + G.PIL / 2, zb = q.z0 + G.CW - G.PIL / 2, y0 = q.yf, y1 = q.yf + G.FH - 70;
  const gl = DOORGLOW[q.n], dark = DOORSHADE[q.n];
  // interior light: own lamp/candle + golden glow when freed
  const own = CELL_LIGHT(q, t), ex = [own[0] + gl * 1.3, own[1] + gl * .95, own[2] + gl * .45];
  const dk = 1 - dark * .8;
  const sh = (base, x, y, z, n) => { const l = lightAt(x, y, z, n); return mixShade(base, [(l[0] + ex[0]) * dk, (l[1] + ex[1]) * dk, (l[2] + ex[2]) * dk], x, y, z); };
  const zc = q.zc, xm = (x0 + x1) / 2, ym = (y0 + y1) / 2;
  // back wall, floor, ceiling, side walls
  fillPoly(c, [[x1, y0, za], [x1, y0, zb], [x1, y1, zb], [x1, y1, za]], sh(MAT.cellWall, x1, ym, zc, [-s, 0, 0]));
  if (CAM.y > y0) fillPoly(c, [[x0, y0, za], [x0, y0, zb], [x1, y0, zb], [x1, y0, za]], sh(MAT.cellFloor, xm, y0, zc, [0, 1, 0]));
  if (CAM.y < y1) fillPoly(c, [[x0, y1, za], [x0, y1, zb], [x1, y1, zb], [x1, y1, za]], sh([90, 90, 92], xm, y1, zc, [0, -1, 0]));
  if (CAM.z > za) fillPoly(c, [[x0, y0, za], [x1, y0, za], [x1, y1, za], [x0, y1, za]], sh([136, 136, 132], xm, ym, za, [0, 0, 1]));
  if (CAM.z < zb) fillPoly(c, [[x0, y0, zb], [x1, y0, zb], [x1, y1, zb], [x0, y1, zb]], sh([136, 136, 132], xm, ym, zb, [0, 0, -1]));
  if (detail > 0) CELL_PROPS(c, q, t, detail, sh);
}
let CELL_LIGHT = () => [0, 0, 0], CELL_PROPS = () => {};
function mixShade(base, l, x, y, z) {
  l = [tone(l[0]), tone(l[1]), tone(l[2])];
  let r = base[0] * l[0], g = base[1] * l[1], b = base[2] * l[2];
  const f = fogF(x, y, z); r = lerp(r, LT.fog[0], f); g = lerp(g, LT.fog[1], f); b = lerp(b, LT.fog[2], f);
  return `rgb(${Math.min(255, r) | 0},${Math.min(255, g) | 0},${Math.min(255, b) | 0})`;
}
// facade around a cell + its sliding barred door + number plate + wall lamp
function drawFacade(c, q, t, detail) {
  const s = q.side, x = s * G.HW, za = q.z0 + G.PIL / 2, zb = q.z0 + G.CW - G.PIL / 2, y0 = q.yf, y1 = q.yf + G.FH;
  const dk = 1 - DOORSHADE[q.n] * .55;
  const wallCol = (() => { const l = lightAt(x, y0 + 600, q.zc, [-s, 0, 0]); return mixShade(MAT.stone, [l[0] * dk, l[1] * dk, l[2] * dk], x, y0 + 600, q.zc); })();
  const r = PP([[x, y0, q.z0], [x, y0, q.z0 + G.CW], [x, y1, q.z0 + G.CW], [x, y1, q.z0]]);
  const hole = PP([[x, y0, za], [x, y0, zb], [x, y0 + G.DH, zb], [x, y0 + G.DH, za]]);
  if (r) { poly(c, r); if (hole) { c.moveTo(hole[0][0], hole[0][1]); for (const p of hole.slice(1)) c.lineTo(p[0], p[1]); c.closePath(); } c.fillStyle = wallCol; c.fill('evenodd'); }
  if (!r) return;
  // stone courses + pillar edges
  if (detail > 0) {
    c.save(); c.globalAlpha = .35;
    for (let yy = y0 + G.DH + 60; yy < y1; yy += 70) line3(c, [x, yy, q.z0], [x, yy, q.z0 + G.CW], 2.5, '#2c3340');
    line3(c, [x, y0, za - 4], [x, y0 + G.DH + 10, za - 4], 7, '#232a35'); line3(c, [x, y0, zb + 4], [x, y0 + G.DH + 10, zb + 4], 7, '#232a35');
    c.restore();
    // lintel
    line3(c, [x - s * 6, y0 + G.DH + 12, za - 20], [x - s * 6, y0 + G.DH + 12, zb + 20], 26, shade(MAT.iron, x, y0 + G.DH, q.zc));
  }
  // barred sliding door (slides towards +z into the wall pocket)
  const o = DOOR[q.n], off = o * (zb - za);
  if (hole) {
    c.save(); poly(c, hole); c.clip();
    const n = 10, sp = (zb - za) / n, bx = x - s * 8, iron = DOORGLOW[q.n] > .3 ? '#4a4030' : '#1f232b', hi = DOORGLOW[q.n] > .3 ? 'rgba(255,214,140,.9)' : 'rgba(170,190,220,.55)';
    for (let i = 0; i <= n; i++) {
      const zz = za + i * sp + off; if (zz > zb + 2) continue;
      line3(c, [bx, y0, zz], [bx, y0 + G.DH, zz], 13, iron);
      if (detail > 0) line3(c, [bx - s * 7, y0 + 10, zz - 3], [bx - s * 7, y0 + G.DH - 10, zz - 3], 3.2, hi);
    }
    const zE = Math.min(zb, zb + off), zS = za + off;
    for (const yy of [16, 150, G.DH - 140, G.DH - 16]) line3(c, [bx - s * 3, y0 + yy, zS], [bx - s * 3, y0 + yy, zE], yy === 16 || yy === G.DH - 16 ? 22 : 16, iron);
    // lock box on the leading edge
    if (detail > 0 && zS < zb) {
      const lz = zS + 10, ly = y0 + 250;
      fillPoly(c, [[bx - s * 14, ly - 40, lz - 6], [bx - s * 14, ly - 40, lz + 46], [bx - s * 14, ly + 40, lz + 46], [bx - s * 14, ly + 40, lz - 6]], shade([70, 66, 62], bx, ly, lz, [-s, 0, 0]));
      glow3(c, bx - s * 16, ly, lz + 20, 26, '255,200,120', .25);
      line3(c, [bx - s * 16, ly - 6, lz + 20], [bx - s * 16, ly + 8, lz + 20], 5, '#c39a4c');
    }
    c.restore();
  }
  // number plate (brass) above the door
  if (detail > -1) {
    const pz = q.zc, py = y0 + G.DH + 120, pw = 130, ph = 76, isN = q.n === 64;
    const pp = P(x - s * 10, py, pz);
    if (pp) {
      const g = isN ? PLATEGLOW : 0;
      onPlane(c, [x - s * 10, py + ph / 2, pz + s * pw / 2], [0, 0, -s], [0, -1, 0], (c, sc) => {
        c.fillStyle = '#21180e'; rrect(c, -6, -6, pw + 12, ph + 12, 10); c.fill();
        const gg = c.createLinearGradient(0, 0, 0, ph); gg.addColorStop(0, isN ? '#ffe6a0' : '#e4c27a'); gg.addColorStop(.5, isN ? '#d7a64c' : '#b88b40'); gg.addColorStop(1, '#7c5a22');
        c.fillStyle = gg; rrect(c, 0, 0, pw, ph, 8); c.fill();
        if (pp[2] * ph > 9) { c.fillStyle = '#2a1c0c'; c.font = `700 ${q.n === 100 ? 50 : 58}px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(q.n), pw / 2, ph / 2 + 3); }
        if (g > 0) { c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = g * .5; c.fillStyle = '#ffd890'; rrect(c, 0, 0, pw, ph, 8); c.fill(); c.restore(); }
      });
      if (isN && PLATEGLOW > 0) glow(c, pp[0], pp[1], 300 * pp[2], '255,210,120', .65 * PLATEGLOW);
    }
  }
  // divisor marks on door 64 (small glowing studs with the round numbers)
  if (q.n === 64 && MARKS.n > 0) {
    const vals = [1, 2, 4, 8, 16, 32, 64];
    for (let i = 0; i < MARKS.n; i++) {
      const zz = zb - 24 - i * ((zb - za - 48) / 6), yy = y0 + 150, p = P(x - s * 14, yy, zz); if (!p) continue;
      const hi = MARKS.hi === i ? 1 : 0, a = MARKS.a * (i < MARKS.n - 1 ? 1 : MARKS.last ?? 1);
      glow(c, p[0], p[1], (60 + hi * 70) * p[2], hi ? '255,220,140' : '255,190,110', (.6 + hi * .4) * a);
      c.save(); c.globalAlpha = a; c.beginPath(); c.arc(p[0], p[1], 13 * p[2], 0, 7); c.fillStyle = hi ? '#fff6d8' : '#ffd27e'; c.fill();
      c.font = `700 ${Math.round(18 * p[2])}px ${FONT}`; c.fillStyle = '#3a2408'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(vals[i]), p[0], p[1] + 1 * p[2]); c.restore();
    }
  }
}
function drawWalkway(c, s, f, zA, zB, t) {
  const y = f * G.FH, xo = s * G.HW, xi = s * (G.HW - G.WW), th = G.SLAB;
  if (CAM.y > y) fillPoly(c, [[xo, y, zA], [xi, y, zA], [xi, y, zB], [xo, y, zB]], shade(MAT.slab, (xo + xi) / 2, y, (zA + zB) / 2, [0, 1, 0]));
  if (CAM.y < y - th) fillPoly(c, [[xo, y - th, zA], [xi, y - th, zA], [xi, y - th, zB], [xo, y - th, zB]], shade([70, 74, 84], (xo + xi) / 2, y - th, (zA + zB) / 2, [0, -1, 0]));
  fillPoly(c, [[xi, y - th, zA], [xi, y, zA], [xi, y, zB], [xi, y - th, zB]], shade([84, 88, 98], xi, y, (zA + zB) / 2, [-s, 0, 0]));
  // grating lines
  const q = toCam(xi, y, (zA + zB) / 2);
  if (q[2] < 3000 && CAM.y > y) for (let z = zA; z < zB; z += 55) line3(c, [xo, y + 1, z], [xi, y + 1, z], 2.2, 'rgba(40,44,52,.6)');
}
function drawRailing(c, s, f, zA, zB, t) {
  const y = f * G.FH, xi = s * (G.HW - G.WW + 14), col = shade(MAT.iron, xi, y + 120, (zA + zB) / 2), hi = 'rgba(200,210,230,.35)';
  line3(c, [xi, y + G.RAIL, zA], [xi, y + G.RAIL, zB], 12, col);
  line3(c, [xi, y + G.RAIL + 4, zA], [xi, y + G.RAIL + 4, zB], 3, hi);
  line3(c, [xi, y + 120, zA], [xi, y + 120, zB], 7, col);
  const q = toCam(xi, y, (zA + zB) / 2);
  const step = q[2] < 2500 ? 55 : 110;
  for (let z = Math.ceil(zA / step) * step; z < zB; z += step) line3(c, [xi, y, z], [xi, y + G.RAIL, z], z % 220 === 0 ? 9 : 5, col);
}
function drawNet(c, f, t) {
  const y = f * G.FH - 60, xi = G.HW - G.WW, z0 = 1500, z1 = G.L - 500;
  c.save(); c.globalAlpha = .35;
  for (let z = z0; z <= z1; z += 120) { const sag = 0; line3(c, [-xi, y, z], [xi, y - sag, z], 1.6, 'rgba(160,170,190,.7)'); }
  for (let x = -xi; x <= xi; x += 120) line3(c, [x, y, z0], [x, y, z1], 1.6, 'rgba(160,170,190,.7)');
  line3(c, [-xi, y, z0], [xi, y, z0], 5, 'rgba(120,130,150,.8)');
  c.restore();
}
// hanging caged lamp (sprite at the bulb)
function lampSprite(c, x, y, z, t, swing, on = 1) {
  billboard(c, x, y, z, (c) => {
    c.lineWidth = 5; c.strokeStyle = '#1d1f26';
    c.beginPath(); c.moveTo(-34, -40); c.lineTo(34, -40); c.lineTo(28, 30); c.lineTo(-28, 30); c.closePath(); c.fillStyle = `rgba(255,${200 + on * 30},${120 + on * 40},${.55 + on * .4})`; c.fill(); c.stroke();
    for (const xx of [-14, 0, 14]) { c.beginPath(); c.moveTo(xx * 1.3, -40); c.lineTo(xx, 30); c.stroke(); }
    c.beginPath(); c.moveTo(-31, -5); c.lineTo(31, -5); c.stroke();
    c.fillStyle = '#2a2c34'; c.beginPath(); c.moveTo(-46, -40); c.lineTo(46, -40); c.lineTo(20, -64); c.lineTo(-20, -64); c.closePath(); c.fill();
  });
}
// volumetric beams (moon / dawn) from the clerestory windows of the right wall, slanting down-left
function drawBeams(c, t, o = {}) {
  const a = (o.a ?? .14) * .55, col = LT.dawn > .4 ? '255,214,150' : '170,200,255';
  c.save(); c.globalCompositeOperation = 'lighter';
  for (let z = G.ZS + 280; z < G.L - 200; z += 880) for (const side of (o.sides || [1])) {
    const x0 = side * G.HW, y0 = 4 * G.FH + 300, dx = -side * 2500, dy = -3300;
    const pts = [[x0, y0 + 150, z + 40], [x0, y0 + 150, z + 260], [x0 + dx, y0 + dy, z + 360], [x0 + dx, y0 + dy, z - 60]];
    const r = PP(pts); if (!r) continue;
    const pa = P(x0, y0, z + 150), pb = P(x0 + dx * .8, y0 + dy * .8, z + 150);
    let g; if (pa && pb) { g = c.createLinearGradient(pa[0], pa[1], pb[0], pb[1]); g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(.7, `rgba(${col},${a * .4})`); g.addColorStop(1, `rgba(${col},0)`); } else g = `rgba(${col},${a * .4})`;
    poly(c, r); c.fillStyle = g; c.fill();
  }
  c.restore();
}
// dust motes in 3D around a region
function motes3(c, t, cx, cy, cz, rx, ry, rz, n, col = '220,230,255', a = .7) {
  c.save(); c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const ph = (t * .03 + rnd(i * 3 + 1)) % 1;
    const x = cx + (rnd(i * 7 + 2) - .5) * rx + Math.sin(t * .5 + i) * 30, y = cy + (ph - .5) * ry, z = cz + (rnd(i * 5 + 3) - .5) * rz + Math.cos(t * .4 + i) * 30;
    const p = P(x, y, z); if (!p) continue; const r = clamp(2.2 * p[2], .8, 7);
    c.beginPath(); c.arc(p[0], p[1], r, 0, 7); c.fillStyle = `rgba(${col},${a * Math.sin(ph * Math.PI) * (.5 + .5 * rnd(i))})`; c.fill();
  }
  c.restore();
}

// ---------- lamp list (also light sources) ----------
function buildLamps(t, o = {}) {
  LT.lamps = [];
  const wi = (o.wall ?? 1.0) * .5, hi = (o.hang ?? 1.0) * .75;
  for (let z = -1900; z < G.L; z += 1400) {
    const sw = Math.sin(t * 1.1 + z) * 40;
    LT.lamps.push({ x: sw * .3, y: 2 * G.FH + 300 + (z % 2800 ? 0 : 400), z, i: hi, r: 1100, c: [1.0, .7, .42], hang: true, sw, refl: true });
  }
  for (const s of [-1, 1]) for (let f = 0; f < 4; f++) for (let j = 0; j <= 13; j += 2) {
    LT.lamps.push({ x: s * (G.HW - 60), y: f * G.FH + G.DH + 210, z: G.Z0 + j * G.CW, i: wi, r: 380, c: [1.0, .74, .46], wall: true, s });
  }
  if (o.extra) LT.lamps.push(...o.extra);
}
function drawHangingLamps(c, t) {
  for (const L of LT.lamps) {
    if (L.hang) {
      line3(c, [0, G.CEIL - 380, L.z], [L.x, L.y + 60, L.z], 3, '#1a1c22');
      lampSprite(c, L.x, L.y, L.z, t, 0, 1);
      glow3(c, L.x, L.y, L.z, 420, '255,180,100', .3 * L.i);
      glow3(c, L.x, L.y, L.z, 90, '255,230,170', .55);
    } else if (L.wall) {
      const p = P(L.x, L.y, L.z); if (!p) continue;
      // bracket + small caged bulb
      line3(c, [L.s * G.HW, L.y + 40, L.z], [L.x, L.y + 40, L.z], 5, '#1e2028');
      billboard(c, L.x, L.y, L.z, (c) => { c.fillStyle = '#ffd98e'; c.beginPath(); c.ellipse(0, -14, 11, 14, 0, 0, 7); c.fill(); c.lineWidth = 2.5; c.strokeStyle = '#1e2028'; c.beginPath(); c.ellipse(0, -14, 13, 16, 0, 0, 7); c.stroke(); c.beginPath(); c.moveTo(-9, -27); c.lineTo(-9, -1); c.moveTo(9, -27); c.lineTo(9, -1); c.stroke(); c.fillStyle = '#23252c'; c.beginPath(); c.moveTo(-22, -26); c.lineTo(22, -26); c.lineTo(10, -38); c.lineTo(-10, -38); c.closePath(); c.fill(); });
      glow(c, p[0], p[1] - 16 * p[2], 180 * p[2] * (1 - fogF(L.x, L.y, L.z) * .5), '255,170,90', .3 * L.i);
    }
  }
}
