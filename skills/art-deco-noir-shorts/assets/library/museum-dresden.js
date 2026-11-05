/* =====================================================================
   GREEN VAULT · film-specific sets, props & cast
   Built on the shared Art-Deco noir system (src/01–05): same palette,
   head rig, bodies, lighting, rim lights, FX and camera.
   ===================================================================== */

/* ---------- cast (reuses the shared head rig & body system) ---------- */
HEAD.staff = { lv: makeLevels(LV_BOSS, { sx: 0.93, sy: 1.02, jaw: 0.95, chin: 0.92 }), skin: '#c49a7c', hair: '#5a5258', hairHi: '#9a929a', gray: '#a8a2aa', grayAmt: 0.6, hl: HL_FULL, browCol: '#4a4248', browGray: '#9a949c', browThick: 0.95, frown: 0.1, eyeOpen: 0.95, iris: '#5a6a7a', nose: 1.0, stubble: 0.08, mouthDown: 0.5, ear: 1.05, comb: true };
HEAD.det1 = { lv: makeLevels(LV_BOSS, { sx: 1.02, jaw: 1.06 }), skin: '#b8906e', hair: '#1a1416', hairHi: '#3a3036', gray: '#666', grayAmt: 0, hl: HL_FULL, browCol: '#1a1416', browThick: 1.15, frown: 0.55, eyeOpen: 0.85, iris: '#3a3028', nose: 1.08, stubble: 0.18, mouthDown: 0.8, ear: 1, comb: false, hat: { color: '#2a2228', band: '#120c10' } };
HEAD.det2 = { lv: makeLevels(LV_BOSS, { sx: 0.94, sy: 1.03, jaw: 0.94 }), skin: '#c9a080', hair: '#3a2a1e', hairHi: '#6a5040', gray: '#8a8088', grayAmt: 0.4, hl: HL_SLICK, browCol: '#2a1e18', browGray: '#7a7078', browThick: 1, frown: 0.4, eyeOpen: 0.95, iris: '#4a5a6a', nose: 1.02, stubble: 0.1, mouthDown: 0.6, ear: 1, comb: true, hat: { color: '#3a3036', band: '#1a1218' } };
HEAD.shade = { lv: makeLevels(LV_BOSS, { sx: 0.96 }), skin: '#2a2028', hair: '#0a080a', hairHi: '#1a161a', gray: '#222', grayAmt: 0, hl: HL_FULL, browCol: '#0a080a', browThick: 1, frown: 0.3, eyeOpen: 0.8, iris: '#111', nose: 1, stubble: 0, mouthDown: 0.5, ear: 1, comb: false, hat: { type: 'cap', color: '#0c0a0e' } };
OUTFIT.staff = { suit: '#232236', lapel: '#1a1a2a', shirt: '#9a9cb0', tie: '#141420', cuff: '#9a9cb0', shoe: '#0b0a0c', pocket: '#c8a04a' };
OUTFIT.det1 = { suit: '#4a3e34', lapel: '#3a3028', shirt: '#c8bfae', tie: '#4a1420', cuff: '#c8bfae', shoe: '#0b0a0c', coat: true };
OUTFIT.det2 = { suit: '#3a3238', lapel: '#2a242a', shirt: '#cfc6b4', tie: '#2a2a4a', cuff: '#cfc6b4', shoe: '#0b0a0c', coat: true };
OUTFIT.shade = { suit: '#0e0c10', lapel: '#0e0c10', shirt: '#0e0c10', tie: '#0e0c10', cuff: '#0e0c10', shoe: '#050405', plain: true };

/* ---------- jewels ---------- */
const VELVET = '#2c1630';
const FACETS = ['#f6f2ff', '#9a90c8', '#dcd4ff', '#5a5080', '#fff4dc', '#7a70a8', '#cac2f2', '#3a3458'];
/** a brilliant-cut diamond in its setting. k = detail (0 cheap .. 1 full), lit = sparkle strength */
function brilliant(ctx, x, y, r, seed, t, lit = 1, k = 1, metal = '#cfc6d8') {
  ctx.fillStyle = metal; ctx.beginPath(); ctx.arc(x, y, r * 1.16, 0, TAU); ctx.fill();
  if (k < 0.5 || r < 2.2) {
    ctx.fillStyle = FACETS[seed % 8 < 4 ? 2 : 6]; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.35, 0, TAU); ctx.fill();
  } else {
    ctx.fillStyle = '#2a2638'; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    const rot = (seed % 7) * 0.2, n = 8;
    for (let i = 0; i < n; i++) {
      const a0 = rot + (i / n) * TAU, a1 = rot + ((i + 1) / n) * TAU, am = (a0 + a1) / 2;
      ctx.fillStyle = FACETS[(i + seed) % 8];
      ctx.beginPath(); ctx.moveTo(x + Math.cos(a0) * r, y + Math.sin(a0) * r); ctx.lineTo(x + Math.cos(a1) * r, y + Math.sin(a1) * r);
      ctx.lineTo(x + Math.cos(am) * r * 0.5, y + Math.sin(am) * r * 0.5); ctx.closePath(); ctx.fill();
      ctx.fillStyle = FACETS[(i + seed + 3) % 8];
      ctx.beginPath(); ctx.moveTo(x + Math.cos(a1) * r * 0.5 * 1.08, y + Math.sin(a1) * r * 0.5 * 1.08); ctx.lineTo(x + Math.cos(am) * r * 0.5, y + Math.sin(am) * r * 0.5); ctx.lineTo(x + Math.cos(a1) * r, y + Math.sin(a1) * r); ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = 'rgba(236,232,255,0.85)'; ctx.beginPath();
    for (let i = 0; i < 8; i++) { const a = rot + (i / 8) * TAU + PI / 8; ctx.lineTo(x + Math.cos(a) * r * 0.5, y + Math.sin(a) * r * 0.5); }
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.beginPath(); ctx.ellipse(x - r * 0.25, y - r * 0.28, r * 0.18, r * 0.1, -0.6, 0, TAU); ctx.fill();
  }
  // twinkle
  const tw = Math.pow(Math.max(0, Math.sin(t * (1.6 + (seed % 5) * 0.37) + seed * 2.3)), 14) * lit;
  if (tw > 0.04) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rgba('#fffaf0', tw);
    const s = r * (1.4 + tw * 3), cx = x - r * 0.2, cy = y - r * 0.2, w = Math.max(0.6, r * 0.09);
    ctx.beginPath(); ctx.moveTo(cx - s, cy); ctx.lineTo(cx, cy - w); ctx.lineTo(cx + s, cy); ctx.lineTo(cx, cy + w); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(cx, cy - s); ctx.lineTo(cx + w, cy); ctx.lineTo(cx, cy + s); ctx.lineTo(cx - w, cy); ctx.closePath(); ctx.fill();
    ctx.restore();
    glow(ctx, cx, cy, r * 2.5, '#fff0dc', tw * 0.5);
  }
}
/** velvet imprint where a jewel used to be (the "missing" state) */
function ghostFill(ctx, path) {
  ctx.fillStyle = darken(VELVET, 0.42); ctx.fill(path);
  ctx.strokeStyle = rgba('#7a5a7a', 0.35); ctx.lineWidth = 2; ctx.stroke(path);
}
// each piece: (ctx, x, y, s, t, ghost, lit, k)
function pieceStar(ctx, x, y, s, t, ghost, lit, k) {
  const R = 100 * s, p = new Path2D();
  for (let i = 0; i < 16; i++) { const a = (i / 16) * TAU - PI / 2, rr = i % 2 ? R * 0.34 : (i % 4 ? R * 0.72 : R); p.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  p.closePath();
  if (ghost) return ghostFill(ctx, p);
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.save(); ctx.translate(6 * s, 9 * s); ctx.fill(p); ctx.restore();
  ctx.fillStyle = '#a8a0b8'; ctx.fill(p);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU - PI / 2, len = i % 2 ? 0.72 : 1;
    for (let j = 0; j < 4; j++) { const d = R * (0.38 + j * 0.17) * len, rr = R * (0.085 - j * 0.013) * (i % 2 ? 0.85 : 1); brilliant(ctx, x + Math.cos(a) * d, y + Math.sin(a) * d, rr, i * 9 + j, t, lit, k); }
  }
  for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU; brilliant(ctx, x + Math.cos(a) * R * 0.24, y + Math.sin(a) * R * 0.24, R * 0.06, 50 + i, t, lit, k); }
  brilliant(ctx, x, y, R * 0.15, 77, t, lit, k);
}
function pieceNecklace(ctx, x, y, s, t, ghost, lit, k) {
  const w = 430 * s, h = 80 * s, N = 19, pts = [];
  for (let i = 0; i < N; i++) { const f = i / (N - 1), px = x - w / 2 + f * w, py = y + Math.sin(f * PI) * h; pts.push([px, py, (6 + Math.sin(f * PI) * 7) * s]); }
  if (ghost) { const p = new Path2D(); pts.forEach((q, i) => p[i ? 'lineTo' : 'moveTo'](q[0], q[1])); ctx.strokeStyle = darken(VELVET, 0.42); ctx.lineWidth = 22 * s; ctx.lineCap = 'round'; ctx.stroke(p); const d = new Path2D(); d.ellipse(x, y + h + 34 * s, 16 * s, 24 * s, 0, 0, TAU); ghostFill(ctx, d); return; }
  ctx.strokeStyle = '#8a8298'; ctx.lineWidth = 3 * s; ctx.beginPath(); pts.forEach((q, i) => ctx[i ? 'lineTo' : 'moveTo'](q[0], q[1])); ctx.stroke();
  pts.forEach((q, i) => brilliant(ctx, q[0], q[1], q[2], 100 + i, t, lit, k));
  // pear drop
  ctx.fillStyle = '#cfc6d8'; ctx.beginPath(); ctx.moveTo(x, y + h + 8 * s); ctx.quadraticCurveTo(x + 18 * s, y + h + 40 * s, x, y + h + 58 * s); ctx.quadraticCurveTo(x - 18 * s, y + h + 40 * s, x, y + h + 8 * s); ctx.fill();
  brilliant(ctx, x, y + h + 38 * s, 14 * s, 140, t, lit, k);
}
function pieceEpaulette(ctx, x, y, s, t, ghost, lit, k) {
  const p = new Path2D(); p.ellipse(x, y, 70 * s, 34 * s, 0, 0, TAU);
  const fr = new Path2D(); fr.rect(x - 64 * s, y + 20 * s, 128 * s, 92 * s);
  if (ghost) { ghostFill(ctx, fr); ghostFill(ctx, p); return; }
  ctx.fillStyle = '#a8a0b8'; ctx.fill(p);
  for (let i = 0; i < 9; i++) { const sx = x - 56 * s + i * 14 * s; ctx.strokeStyle = '#8a8298'; ctx.lineWidth = 1.5 * s; ctx.beginPath(); ctx.moveTo(sx, y + 24 * s); ctx.lineTo(sx, y + 108 * s); ctx.stroke(); for (let j = 0; j < 6; j++) brilliant(ctx, sx, y + (32 + j * 15) * s, 4.4 * s, 200 + i * 7 + j, t, lit, k * 0.6); }
  for (let i = 0; i < 3; i++) for (let j = -4 + i; j <= 4 - i; j++) brilliant(ctx, x + j * 14 * s, y + (i - 1) * 13 * s, 6 * s, 260 + i * 9 + j, t, lit, k);
}
function pieceSword(ctx, x, y, s, t, ghost, lit, k) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.42);
  const body = new Path2D(); body.rect(-150 * s, -11 * s, 300 * s, 22 * s); body.rect(-20 * s, -40 * s, 18 * s, 80 * s);
  if (ghost) { ghostFill(ctx, body); ctx.restore(); return; }
  ctx.fillStyle = '#1a1018'; ctx.fillRect(10 * s, -9 * s, 140 * s, 18 * s);
  ctx.fillStyle = PAL.gold; ctx.fillRect(40 * s, -10 * s, 14 * s, 20 * s); ctx.fillRect(120 * s, -10 * s, 14 * s, 20 * s);
  ctx.fillStyle = '#a8a0b8'; ctx.fillRect(-150 * s, -10 * s, 140 * s, 20 * s); ctx.fillRect(-20 * s, -38 * s, 16 * s, 76 * s);
  for (let i = 0; i < 9; i++) brilliant(ctx, (-138 + i * 15) * s, 0, 6.5 * s, 300 + i, t, lit, k);
  for (let i = 0; i < 5; i++) brilliant(ctx, -12 * s, (-30 + i * 15) * s, 6 * s, 320 + i, t, lit, k);
  brilliant(ctx, -158 * s, 0, 13 * s, 330, t, lit, k);
  ctx.restore();
}
function pieceBow(ctx, x, y, s, t, ghost, lit, k) {
  const p = new Path2D();
  p.ellipse(x - 40 * s, y, 42 * s, 26 * s, 0.25, 0, TAU); p.ellipse(x + 40 * s, y, 42 * s, 26 * s, -0.25, 0, TAU);
  p.moveTo(x - 10 * s, y); p.lineTo(x - 40 * s, y + 70 * s); p.lineTo(x - 22 * s, y + 74 * s); p.lineTo(x, y + 10 * s); p.lineTo(x + 22 * s, y + 74 * s); p.lineTo(x + 40 * s, y + 70 * s); p.lineTo(x + 10 * s, y); p.closePath();
  if (ghost) return ghostFill(ctx, p);
  ctx.fillStyle = '#a8a0b8'; ctx.fill(p);
  for (const sd of [-1, 1]) for (let i = 0; i < 10; i++) { const a = (i / 10) * TAU; brilliant(ctx, x + sd * 40 * s + Math.cos(a) * 30 * s, y + Math.sin(a) * 16 * s, 5 * s, 400 + i + (sd > 0 ? 20 : 0), t, lit, k); }
  for (const sd of [-1, 1]) for (let i = 0; i < 4; i++) brilliant(ctx, x + sd * (10 + i * 7) * s, y + (16 + i * 14) * s, 5 * s, 440 + i + (sd > 0 ? 9 : 0), t, lit, k);
  brilliant(ctx, x, y, 12 * s, 460, t, lit, k);
}
function pieceClasp(ctx, x, y, s, t, ghost, lit, k) {
  const p = new Path2D(); p.ellipse(x, y, 54 * s, 70 * s, 0, 0, TAU);
  if (ghost) return ghostFill(ctx, p);
  ctx.fillStyle = '#a8a0b8'; ctx.fill(p);
  for (let i = 0; i < 14; i++) { const a = (i / 14) * TAU; brilliant(ctx, x + Math.cos(a) * 42 * s, y + Math.sin(a) * 56 * s, 7 * s, 500 + i, t, lit, k); }
  brilliant(ctx, x, y, 26 * s, 530, t, lit, k);
}
function pieceButtons(ctx, x, y, s, t, ghost, lit, k) {
  for (let i = 0; i < 7; i++) {
    const bx = x + (i - 3) * 56 * s;
    if (ghost) { const p = new Path2D(); p.arc(bx, y, 17 * s, 0, TAU); ghostFill(ctx, p); }
    else brilliant(ctx, bx, y, 15 * s, 600 + i, t, lit, k, PAL.gold);
  }
}
/* tray layout (vitrine interior, 640 × 460): [name, fn, x, y, scale] */
const TRAY = [
  ['sword', pieceSword, 175, 92, 0.78], ['epaulette', pieceEpaulette, 500, 70, 0.85],
  ['bow', pieceBow, 115, 228, 0.9], ['star', pieceStar, 320, 225, 0.95], ['clasp', pieceClasp, 525, 225, 0.85],
  ['necklace', pieceNecklace, 320, 318, 0.95], ['buttons', pieceButtons, 320, 430, 0.82],
];
/** state: { missing: Set(names), lit, k(detail) } */
function drawTray(ctx, t, st) {
  // stepped velvet tiers
  const vg = ctx.createLinearGradient(0, 0, 0, 460); vg.addColorStop(0, darken(VELVET, 0.25)); vg.addColorStop(1, VELVET);
  ctx.fillStyle = vg; ctx.fillRect(0, 0, 640, 460);
  for (const ty of [150, 300]) { ctx.fillStyle = rgba('#000000', 0.35); ctx.fillRect(0, ty, 640, 10); ctx.fillStyle = rgba('#b07ab0', 0.18); ctx.fillRect(0, ty + 10, 640, 2); }
  paintOverlay(ctx, 0, 0, 640, 460, 0.5);
  for (const [name, fn, x, y, s] of TRAY) fn(ctx, x, y, s, t, st.missing && st.missing.has(name), st.lit ?? 1, st.k ?? 1);
}

/* ---------- vitrine (glass display case) ----------
   world rect: glass x 200–880, y 840–1360; tray inside at (220, 880) */
const VIT = { x: 200, y: 840, w: 680, h: 520, tx: 220, ty: 880 };
function drawVitrine(ctx, t, o) {
  const L = o.light || 1;
  // cabinet base
  const bg = ctx.createLinearGradient(0, 1360, 0, 1650); bg.addColorStop(0, '#2a1410'); bg.addColorStop(1, '#0c0506');
  ctx.fillStyle = bg; ctx.fillRect(180, 1360, 720, 290);
  ctx.strokeStyle = rgba(PAL.gold, 0.55 * L + 0.15); ctx.lineWidth = 4;
  ctx.strokeRect(205, 1390, 670, 220);
  // baroque scroll ornaments on the base
  ctx.lineWidth = 3;
  for (const sx of [-1, 1]) for (let i = 0; i < 2; i++) {
    const cx = 540 + sx * (110 + i * 170), cy = 1500;
    ctx.beginPath(); ctx.arc(cx, cy, 34, sx > 0 ? PI * 0.6 : PI * 1.6, sx > 0 ? PI * 2.3 : PI * 3.3); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx + sx * 18, cy - 4, 14, 0, PI * 1.6); ctx.stroke();
  }
  ctx.beginPath(); ctx.moveTo(500, 1450); ctx.quadraticCurveTo(540, 1405, 580, 1450); ctx.quadraticCurveTo(540, 1495, 500, 1450); ctx.stroke();
  ctx.fillStyle = mixc(PAL.gold, '#000', 0.3 - L * 0.1); ctx.fillRect(170, 1352, 740, 16); ctx.fillRect(176, 1640, 728, 14);
  // tray interior
  ctx.save(); ctx.translate(VIT.tx, VIT.ty);
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 640, 460); ctx.clip();
  drawTray(ctx, t, o.tray);
  if (o.inside) o.inside(ctx);
  ctx.restore(); ctx.restore();
  // inner glow from case lighting
  if (o.caseLight > 0) { glow(ctx, 540, 900, 520, '#ffcf8a', 0.22 * o.caseLight, 'lighter', 0.6); }
  // glass: back edge, sheen streaks, frame
  ctx.save(); ctx.beginPath(); ctx.rect(VIT.x, VIT.y, VIT.w, VIT.h); ctx.clip();
  ctx.globalCompositeOperation = 'lighter';
  const sh = (o.sheen ?? 0.5);
  for (const [x0, w] of [[260, 70], [380, 26], [660, 90]]) {
    const xx = x0 + (o.sheenShift || 0);
    ctx.fillStyle = rgba('#d8ccff', 0.06 * sh); ctx.beginPath(); ctx.moveTo(xx, 840); ctx.lineTo(xx + w, 840); ctx.lineTo(xx + w - 180, 1360); ctx.lineTo(xx - 180, 1360); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
  if (o.broken) drawBrokenGlass(ctx, t, o.broken);
  ctx.strokeStyle = mixc('#8a6428', '#e8c070', L * 0.5); ctx.lineWidth = 10; ctx.strokeRect(VIT.x, VIT.y, VIT.w, VIT.h);
  ctx.fillStyle = mixc('#5a3a14', '#c89040', L * 0.5); ctx.fillRect(VIT.x - 16, VIT.y - 28, VIT.w + 32, 30);
  ctx.fillStyle = rgba('#ffe0a0', 0.35 * L); ctx.fillRect(VIT.x - 16, VIT.y - 28, VIT.w + 32, 3);
}
/* shattered front pane. b = { cx, cy, r, prog(0..1 crack growth), fall(0..1 shards falling) } */
const _cracks = {};
function crackGeo(seed) {
  if (_cracks[seed]) return _cracks[seed];
  const R = mulberry32(seed), rays = [], rings = [];
  for (let i = 0; i < 15; i++) { const a = (i / 15) * TAU + R() * 0.3, pts = [[0, 0]]; let d = 0, aa = a; while (d < 1) { d += 0.12 + R() * 0.12; aa += (R() - 0.5) * 0.35; pts.push([Math.cos(aa) * d, Math.sin(aa) * d]); } rays.push(pts); }
  for (const rr of [0.2, 0.36, 0.55]) { const ring = []; for (let i = 0; i <= 15; i++) { const a = (i / 15) * TAU; ring.push([Math.cos(a) * rr * (0.85 + R() * 0.3), Math.sin(a) * rr * (0.85 + R() * 0.3)]); } rings.push(ring); }
  const shards = [];
  for (let i = 0; i < 26; i++) { const a = R() * TAU, d = R() * 0.3, sz = 0.03 + R() * 0.06; shards.push({ x: Math.cos(a) * d, y: Math.sin(a) * d, sz, rot: R() * TAU, spin: (R() - 0.5) * 6, vx: (R() - 0.5) * 0.6, land: 0.25 + R() * 0.5 }); }
  return (_cracks[seed] = { rays, rings, shards });
}
function drawBrokenGlass(ctx, t, b) {
  const g = crackGeo(b.seed || 3), p = b.prog ?? 1;
  ctx.save(); ctx.translate(b.cx, b.cy); ctx.scale(b.r, b.r);
  // hole
  if (p > 0.15) {
    const hole = new Path2D(); g.rings[0].forEach((q, i) => hole[i ? 'lineTo' : 'moveTo'](q[0] * 1.15, q[1] * 1.15)); hole.closePath();
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fill(hole);
    ctx.strokeStyle = rgba('#f0ecff', 0.8); ctx.lineWidth = 2.6 / b.r; ctx.stroke(hole);
  }
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const ray of g.rays) {
    const n = Math.max(2, Math.round(ray.length * p));
    ctx.beginPath(); for (let i = 0; i < n; i++) ctx[i ? 'lineTo' : 'moveTo'](ray[i][0], ray[i][1]);
    ctx.strokeStyle = rgba('#000000', 0.6); ctx.lineWidth = 3 / b.r; ctx.stroke();
    ctx.strokeStyle = rgba('#e8e2ff', 0.75); ctx.lineWidth = 1.5 / b.r; ctx.stroke();
  }
  if (p > 0.5) for (const ring of g.rings.slice(1)) { ctx.beginPath(); ring.forEach((q, i) => ctx[i ? 'lineTo' : 'moveTo'](q[0], q[1])); ctx.strokeStyle = rgba('#e8e2ff', 0.45 * (p - 0.5) * 2); ctx.lineWidth = 1.2 / b.r; ctx.stroke(); }
  ctx.restore();
  // falling / fallen shards
  if (b.fall != null) for (const s of g.shards) {
    const f = clamp(b.fall / s.land), fy = Ease.inQuad(f);
    const x = b.cx + (s.x + s.vx * f * (b.spread ?? 0.4)) * b.r, y = b.cy + s.y * b.r + fy * (b.floor - b.cy) * (0.7 + s.sz * 3);
    ctx.save(); ctx.translate(x, y); ctx.rotate(s.rot + s.spin * f * (1 - f * 0.5));
    const sz = s.sz * b.r;
    ctx.fillStyle = rgba('#d8d0ff', 0.28); ctx.beginPath(); ctx.moveTo(-sz, -sz * 0.4); ctx.lineTo(sz * 0.8, -sz * 0.7); ctx.lineTo(sz * 0.3, sz * 0.9); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = rgba('#ffffff', 0.7); ctx.lineWidth = 1.4; ctx.stroke();
    ctx.restore();
    if (hash(s.rot * 1000) < 0.3) glow(ctx, x, y, sz * 1.4, '#ffffff', 0.25 * (b.lit ?? 1));
  }
}

/* ---------- the Jewel Room (baroque mirror cabinet) ---------- */
function drawMirrorPanel(ctx, x, y, w, h, t, mode, seed) {
  const warm = mode === 'lit' || mode === 'warm', dark = mode === 'night';
  const gold = dark ? '#3a2a1a' : mode === 'dawn' ? '#8a6a3a' : '#b88a3a';
  const arch = w * 0.42;
  const p = archPath(x, y, w, h, arch);
  const mg = ctx.createLinearGradient(x, y, x + w, y + h);
  mg.addColorStop(0, dark ? '#0a0810' : '#1e1626'); mg.addColorStop(0.5, dark ? '#120e18' : '#2c2034'); mg.addColorStop(1, dark ? '#06050a' : '#140e18');
  ctx.fillStyle = mg; ctx.fill(p);
  ctx.save(); ctx.clip(p);
  // reflected light points (the room's lights seen in the mirror)
  if (!dark) for (let i = 0; i < 9; i++) { const lx = x + hash(seed + i) * w, ly = y + arch * 0.5 + hash(seed + i + 9) * h * 0.8; glow(ctx, lx, ly, 26 + hash(seed + i + 4) * 30, warm ? '#ffcf7a' : '#c8b8ff', 0.25 + 0.15 * Math.sin(t * 0.8 + i)); }
  ctx.fillStyle = rgba('#ffffff', dark ? 0.02 : 0.05); ctx.beginPath(); ctx.moveTo(x + w * 0.15, y); ctx.lineTo(x + w * 0.35, y); ctx.lineTo(x + w * 0.05, y + h); ctx.lineTo(x - w * 0.15, y + h); ctx.closePath(); ctx.fill();
  ctx.restore();
  // gilded frame + scroll crest
  ctx.lineWidth = 16; ctx.strokeStyle = darken(gold, 0.35); ctx.stroke(p);
  ctx.lineWidth = 6; ctx.strokeStyle = gold; ctx.stroke(p);
  ctx.lineWidth = 3; ctx.strokeStyle = rgba(lighten(gold, 0.35), dark ? 0.2 : 0.6);
  const cx = x + w / 2;
  ctx.beginPath(); ctx.arc(cx - 30, y - 18, 22, PI * 0.2, PI * 1.6); ctx.stroke();
  ctx.beginPath(); ctx.arc(cx + 30, y - 18, 22, -PI * 0.6, PI * 0.8); ctx.stroke();
  ctx.fillStyle = gold; ctx.beginPath(); ctx.moveTo(cx - 14, y - 6); ctx.lineTo(cx, y - 56); ctx.lineTo(cx + 14, y - 6); ctx.closePath(); ctx.fill();
  // gilded console brackets carrying small treasures
  for (const fy of [0.45, 0.72]) {
    const by = y + h * fy, bx = cx + (hash(seed + fy * 10) - 0.5) * w * 0.3;
    ctx.fillStyle = gold; ctx.beginPath(); ctx.moveTo(bx - 34, by); ctx.lineTo(bx + 34, by); ctx.quadraticCurveTo(bx + 20, by + 30, bx, by + 40); ctx.quadraticCurveTo(bx - 20, by + 30, bx - 34, by); ctx.fill();
    // a little gilt cup / figurine silhouette
    ctx.fillStyle = darken(gold, 0.15);
    if (fy < 0.6) { ctx.beginPath(); ctx.moveTo(bx - 18, by); ctx.lineTo(bx + 18, by); ctx.lineTo(bx + 8, by - 14); ctx.lineTo(bx + 4, by - 30); ctx.quadraticCurveTo(bx + 22, by - 44, bx + 18, by - 62); ctx.lineTo(bx - 18, by - 62); ctx.quadraticCurveTo(bx - 22, by - 44, bx - 4, by - 30); ctx.lineTo(bx - 8, by - 14); ctx.closePath(); ctx.fill(); }
    else { ctx.beginPath(); ctx.ellipse(bx, by - 30, 14, 30, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(bx, by - 66, 9, 0, TAU); ctx.fill(); }
    if (!dark) glow(ctx, bx + 6, by - 40, 30, '#ffe0a0', 0.25);
  }
}
const ROOM_LIGHT = {
  lit: { wall: '#1c1220', glow: '#ffcf7a', a: 1 },
  night: { wall: '#09070c', glow: '#8a7ad0', a: 0.15 },
  dawn: { wall: '#16121c', glow: '#d8c8ff', a: 0.55 },
  warm: { wall: '#22161e', glow: '#ffcf7a', a: 1.15 },
};
function drawJewelRoom(ctx, t, cam, mode, dWall = 0.86) {
  const M = ROOM_LIGHT[mode];
  setCam(ctx, cam, dWall);
  const wg = ctx.createLinearGradient(0, -200, 0, 1600); wg.addColorStop(0, darken(M.wall, 0.5)); wg.addColorStop(1, M.wall);
  ctx.fillStyle = wg; ctx.fillRect(-700, -700, 2480, 3000);
  // gilded cornice & ceiling cove
  const gold = mode === 'night' ? '#3a2a1a' : '#a87a34';
  ctx.fillStyle = darken(M.wall, 0.4); ctx.fillRect(-700, -700, 2480, 830);
  ctx.strokeStyle = rgba(gold, 0.7); ctx.lineWidth = 4;
  for (let x = -300; x < 1400; x += 90) { ctx.beginPath(); ctx.arc(x, 150, 34, PI, TAU); ctx.stroke(); ctx.beginPath(); ctx.arc(x + 45, 150, 12, 0, PI); ctx.stroke(); }
  ctx.fillStyle = gold; ctx.fillRect(-700, 120, 2480, 8); ctx.fillRect(-700, 190, 2480, 10);
  for (const [i, x] of [[1, -250], [2, 40], [3, 400], [4, 760], [5, 1050]]) drawMirrorPanel(ctx, x, 290, 280, 1060, t, mode, i * 17);
  // dado
  ctx.fillStyle = darken(M.wall, 0.3); ctx.fillRect(-700, 1350, 2480, 200);
  ctx.strokeStyle = rgba(gold, 0.5); ctx.lineWidth = 3; for (let x = -280; x < 1400; x += 190) ctx.strokeRect(x, 1380, 160, 120);
  paintOverlay(ctx, -400, -100, 1880, 1700, 0.45);
  if (mode !== 'night') drawSconceRow(ctx, t, M);
  // floor (parquet)
  drawCheckerFloor(ctx, cam, { vx: 540, yFar: 1550, yNear: 2300, xw0: 2200, xw1: 5200, rows: 9, cols: 16, ca: mode === 'night' ? '#0a0608' : '#2a1610', cb: mode === 'night' ? '#060405' : '#1a0c0a', dFar: dWall, dNear: 1.2 });
}
function drawSconceRow(ctx, t, M) {
  for (const x of [-110, 330, 750, 1190]) {
    ctx.fillStyle = '#8a6428'; ctx.fillRect(x - 4, 640, 8, 60);
    for (const dx of [-26, 0, 26]) { ctx.fillStyle = '#f4e4c0'; ctx.fillRect(x + dx - 4, 610, 8, 30); glow(ctx, x + dx, 604, 30, M.glow, 0.7 * M.a); }
    glow(ctx, x, 620, 200, M.glow, 0.22 * M.a);
  }
}

/* ---------- Dresden exterior ---------- */
function drawBaroqueSkyline(ctx, fl) {
  const c = mixc('#1c1226', '#4a3a6a', fl * 0.5);
  ctx.fillStyle = c;
  // distant roofs
  ctx.beginPath(); ctx.moveTo(-400, 760);
  for (let x = -400; x <= 1500; x += 70) ctx.lineTo(x, 640 + hash(x) * 60), ctx.lineTo(x + 35, 600 + hash(x + 3) * 70);
  ctx.lineTo(1500, 760); ctx.closePath(); ctx.fill();
  // Frauenkirche-like bell dome (left)
  const fx = 40;
  ctx.fillRect(fx - 140, 560, 280, 200);
  ctx.beginPath(); ctx.moveTo(fx - 140, 560); ctx.bezierCurveTo(fx - 150, 420, fx - 60, 380, fx - 34, 330); ctx.lineTo(fx + 34, 330); ctx.bezierCurveTo(fx + 60, 380, fx + 150, 420, fx + 140, 560); ctx.closePath(); ctx.fill();
  ctx.fillRect(fx - 30, 250, 60, 85); ctx.beginPath(); ctx.moveTo(fx - 34, 252); ctx.quadraticCurveTo(fx, 200, fx + 34, 252); ctx.fill(); ctx.fillRect(fx - 3, 160, 6, 60);
  for (const s of [-1, 1]) { ctx.fillRect(fx + s * 160 - 18, 470, 36, 120); ctx.beginPath(); ctx.moveTo(fx + s * 160 - 20, 472); ctx.quadraticCurveTo(fx + s * 160, 430, fx + s * 160 + 20, 472); ctx.fill(); }
  // Hofkirche-like openwork tower (right)
  const hx = 1010;
  const tiers = [[660, 120], [520, 104], [400, 86], [300, 68], [220, 50], [160, 30]];
  for (let i = 0; i < tiers.length - 1; i++) { const [y0, w0] = tiers[i], [y1, w1] = tiers[i + 1]; ctx.fill(pathOf([[hx - w0 / 2, y0], [hx + w0 / 2, y0], [hx + w1 / 2, y1], [hx - w1 / 2, y1]])); }
  ctx.fillRect(hx - 3, 70, 6, 100);
  // lit openings in the tower
  ctx.fillStyle = rgba('#e0a24a', 0.35); for (const [y, w] of [[600, 30], [470, 24], [360, 18]]) { ctx.fillRect(hx - w / 2, y - 40, w * 0.4, 40); ctx.fillRect(hx + w * 0.1, y - 40, w * 0.4, 40); }
  ctx.fillStyle = rgba('#b48ad0', 0.25 + fl * 0.6); ctx.fillRect(-400, 598, 1900, 2);
}
/** the Royal Palace façade with the Hausmannsturm tower */
function drawPalace(ctx, t, fl) {
  const stone = '#251c26', stoneHi = '#3a2e3a', rim = mixc('#b48ad0', '#e8e0ff', fl);
  // roof
  ctx.fillStyle = '#120c14'; ctx.fill(pathOf([[-300, 770], [-260, 650], [1340, 650], [1380, 770]]));
  for (let x = -220; x < 1340; x += 150) { if (x > 440 && x < 680) continue; ctx.fillStyle = '#1c1420'; ctx.fill(pathOf([[x, 760], [x, 700], [x + 22, 678], [x + 44, 700], [x + 44, 760]])); const lit = hash(x * 3) < 0.3; ctx.fillStyle = lit ? '#e0a24a' : '#0c0810'; ctx.fillRect(x + 12, 704, 20, 30); if (lit) glow(ctx, x + 22, 718, 40, '#e0a24a', 0.35); }
  ctx.fillStyle = rgba(rim, 0.5); ctx.fillRect(-260, 650, 1600, 2.5);
  // Renaissance gables
  for (const gx of [210, 880]) {
    const tiers = [[760, 250], [700, 190], [640, 130], [588, 74]];
    ctx.fillStyle = stone;
    for (let i = 0; i < tiers.length; i++) { const [y0, w] = tiers[i], y1 = i < tiers.length - 1 ? tiers[i + 1][0] : 548; ctx.fillRect(gx - w / 2, y1, w, y0 - y1 + 1); if (i < tiers.length - 1) { const nw = tiers[i + 1][1]; for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(gx + s * (nw / 2 + (w - nw) / 4), y1, (w - nw) / 4, PI, TAU); ctx.fill(); } } }
    ctx.fill(pathOf([[gx - 20, 548], [gx, 500], [gx + 20, 548]]));
    for (const s of [-1, 0, 1]) { ctx.fillRect(gx + s * 60 - 3, 616 - Math.abs(s) * 50, 6, 26); ctx.beginPath(); ctx.arc(gx + s * 60, 612 - Math.abs(s) * 50, 6, 0, TAU); ctx.fill(); }
    ctx.fillStyle = rgba(rim, 0.6); for (const [y, w] of tiers) ctx.fillRect(gx - w / 2, y - 61, w, 2);
    for (let i = 0; i < 3; i++) { const lit = i === 1 && gx < 500; ctx.fillStyle = lit ? '#e0a24a' : '#0c0810'; ctx.fillRect(gx - 12, 600 + i * 56, 24, 34); }
  }
  // façade
  const fg = ctx.createLinearGradient(0, 760, 0, 1260); fg.addColorStop(0, '#2a2030'); fg.addColorStop(1, '#1a1420');
  ctx.fillStyle = fg; ctx.fillRect(-300, 760, 1680, 500);
  ctx.fillStyle = stoneHi; for (const y of [770, 890, 995, 1100, 1240]) ctx.fillRect(-300, y, 1680, 6);
  const rows = [[800, 70], [905, 70], [1010, 72]];
  for (const [ry, wh] of rows) for (let x = -260; x < 1360; x += 82) {
    if (x > 455 && x < 650) continue;
    const lit = hash(x * 7 + ry) < 0.18, flick = lit && hash(x + ry) < 0.3 && Math.sin(t * 0.7 + x) > 0.85;
    ctx.fillStyle = stoneHi; ctx.fillRect(x - 6, ry - 6, 52, wh + 12);
    ctx.fill(pathOf(ry === 905 ? [[x - 10, ry - 8], [x + 20, ry - 26], [x + 50, ry - 8]] : [[x - 10, ry - 8], [x + 50, ry - 8], [x + 50, ry - 16], [x - 10, ry - 16]]));
    ctx.fillStyle = lit && !flick ? '#e8a84a' : '#0e0a12'; ctx.fillRect(x, ry, 40, wh);
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(x + 18, ry, 4, wh); ctx.fillRect(x, ry + wh * 0.4, 40, 3);
    if (lit && !flick) glow(ctx, x + 20, ry + wh / 2, 70, '#e0a24a', 0.3);
  }
  // ground-floor arcade
  for (let x = -250; x < 1360; x += 120) { if (x > 430 && x < 650) continue; ctx.fillStyle = stoneHi; ctx.beginPath(); ctx.moveTo(x - 6, 1240); ctx.lineTo(x - 6, 1150); ctx.arc(x + 40, 1150, 46, PI, TAU); ctx.lineTo(x + 86, 1240); ctx.fill(); ctx.fillStyle = '#0a070c'; ctx.beginPath(); ctx.moveTo(x, 1240); ctx.lineTo(x, 1150); ctx.arc(x + 40, 1150, 40, PI, TAU); ctx.lineTo(x + 80, 1240); ctx.fill(); }
  // the tower
  const tx = 560;
  ctx.fillStyle = stone; ctx.fillRect(tx - 80, 400, 160, 860);
  ctx.fillStyle = stoneHi; ctx.fillRect(tx - 92, 392, 184, 14); ctx.fillRect(tx - 86, 640, 172, 10);
  for (const y of [690, 820, 940]) { ctx.fillStyle = stoneHi; ctx.fillRect(tx - 26, y - 4, 52, 84); ctx.fillStyle = hash(y) < 0.4 ? '#e8a84a' : '#0e0a12'; ctx.fillRect(tx - 20, y, 40, 76); }
  // clock (face & hands only)
  ctx.fillStyle = '#3a2410'; ctx.beginPath(); ctx.arc(tx, 520, 52, 0, TAU); ctx.fill();
  ctx.fillStyle = '#c89a4a'; ctx.beginPath(); ctx.arc(tx, 520, 46, 0, TAU); ctx.fill();
  ctx.fillStyle = '#1a120c'; ctx.beginPath(); ctx.arc(tx, 520, 38, 0, TAU); ctx.fill();
  ctx.fillStyle = '#c89a4a'; for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU; ctx.fillRect(tx + Math.cos(a) * 32 - 2, 520 + Math.sin(a) * 32 - 2, 4, 4); }
  ctx.strokeStyle = '#e8c070'; ctx.lineCap = 'round'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(tx, 520); ctx.lineTo(tx + Math.cos(-PI / 2 + (5 / 12) * TAU) * 20, 520 + Math.sin(-PI / 2 + (5 / 12) * TAU) * 20); ctx.stroke();
  ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(tx, 520); const ma = -PI / 2 + ((t * 0.01 + 0.7) % 1) * TAU; ctx.lineTo(tx + Math.cos(ma) * 30, 520 + Math.sin(ma) * 30); ctx.stroke();
  // gallery, octagonal lantern stage, bell-shaped baroque helmet, lantern, spire
  ctx.fillStyle = stone; ctx.fillRect(tx - 100, 362, 200, 32);
  ctx.fillStyle = '#0a070c'; for (let i = 0; i < 9; i++) ctx.fillRect(tx - 92 + i * 21, 368, 10, 22);
  ctx.fillStyle = stone; ctx.fillRect(tx - 68, 286, 136, 80);
  for (const dx of [-40, 0, 40]) { ctx.fillStyle = '#0a070c'; ctx.beginPath(); ctx.moveTo(tx + dx - 12, 356); ctx.lineTo(tx + dx - 12, 312); ctx.arc(tx + dx, 312, 12, PI, TAU); ctx.lineTo(tx + dx + 12, 356); ctx.fill(); }
  ctx.fillStyle = '#16101a';
  ctx.beginPath(); ctx.moveTo(tx - 80, 290); ctx.bezierCurveTo(tx - 86, 240, tx - 20, 250, tx - 22, 214); ctx.lineTo(tx + 22, 214); ctx.bezierCurveTo(tx + 20, 250, tx + 86, 240, tx + 80, 290); ctx.closePath(); ctx.fill();
  ctx.fillRect(tx - 22, 168, 44, 48); ctx.fillStyle = '#0a070c'; ctx.fillRect(tx - 12, 176, 8, 30); ctx.fillRect(tx + 4, 176, 8, 30);
  ctx.fillStyle = '#16101a'; ctx.beginPath(); ctx.moveTo(tx - 26, 170); ctx.quadraticCurveTo(tx, 128, tx + 26, 170); ctx.fill();
  ctx.fillRect(tx - 3, 70, 6, 80); ctx.beginPath(); ctx.arc(tx, 120, 9, 0, TAU); ctx.fill();
  ctx.fillStyle = '#c89a4a'; ctx.beginPath(); ctx.arc(tx, 74, 5, 0, TAU); ctx.fill();
  ctx.strokeStyle = rgba(rim, 0.55); ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(tx - 80, 290); ctx.bezierCurveTo(tx - 86, 240, tx - 20, 250, tx - 22, 214); ctx.stroke(); ctx.strokeRect(tx - 80, 400, 0.1, 240);
  // gate under the tower, warmly lit
  ctx.fillStyle = stoneHi; ctx.beginPath(); ctx.moveTo(tx - 74, 1250); ctx.lineTo(tx - 74, 1120); ctx.arc(tx, 1120, 74, PI, TAU); ctx.lineTo(tx + 74, 1250); ctx.fill();
  const gg = ctx.createLinearGradient(0, 1060, 0, 1250); gg.addColorStop(0, '#5a3214'); gg.addColorStop(1, '#e0a24a');
  ctx.fillStyle = gg; ctx.beginPath(); ctx.moveTo(tx - 62, 1250); ctx.lineTo(tx - 62, 1120); ctx.arc(tx, 1120, 62, PI, TAU); ctx.lineTo(tx + 62, 1250); ctx.fill();
  glow(ctx, tx, 1200, 220, '#e0a24a', 0.5);
  paintOverlay(ctx, -300, 300, 1680, 1000, 0.5);
}
/** wet cobblestones (pre-rendered once, perspective rows) */
let _cobbles = null;
function cobbleCanvas() {
  if (_cobbles) return _cobbles;
  const c = makeCanvas(1700, 760), g = c.getContext('2d'), R = mulberry32(88);
  g.fillStyle = '#0c080e'; g.fillRect(0, 0, 1700, 760);
  let y = 0, row = 0;
  while (y < 760) {
    const f = y / 760, sh = lerp(7, 42, f * f * 0.7 + f * 0.3), sw = sh * 1.6;
    for (let x = -(row % 2) * sw / 2; x < 1700; x += sw) {
      const v = R();
      g.fillStyle = mixc('#1c1420', '#2e2432', v);
      g.beginPath(); g.ellipse(x + sw / 2, y + sh / 2, sw * 0.46, sh * 0.42, 0, 0, TAU); g.fill();
      g.fillStyle = rgba('#a898d0', 0.08 + v * 0.06); g.beginPath(); g.ellipse(x + sw / 2 - sw * 0.1, y + sh * 0.35, sw * 0.22, sh * 0.12, 0, 0, TAU); g.fill();
    }
    y += sh; row++;
  }
  return (_cobbles = c);
}
function drawStreetLantern(ctx, x, y, k, t, a = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  ctx.fillStyle = '#08060a';
  ctx.fillRect(-14, -900, 28, 900); ctx.fillRect(-34, -40, 68, 40); ctx.fillRect(-26, -120, 52, 20);
  ctx.beginPath(); ctx.moveTo(-50, -1050); ctx.lineTo(50, -1050); ctx.lineTo(36, -900); ctx.lineTo(-36, -900); ctx.closePath(); ctx.fill();
  const fl = 0.92 + 0.08 * snz(t * 3, x);
  ctx.fillStyle = rgba('#ffd890', 0.95 * a * fl); ctx.fill(pathOf([[-38, -1040], [38, -1040], [28, -912], [-28, -912]]));
  ctx.fillStyle = '#08060a'; ctx.fillRect(-3, -1040, 6, 128); ctx.fillRect(-38, -980, 76, 5);
  ctx.beginPath(); ctx.moveTo(-60, -1050); ctx.lineTo(0, -1110); ctx.lineTo(60, -1050); ctx.closePath(); ctx.fill(); ctx.fillRect(-4, -1150, 8, 50);
  glow(ctx, 0, -976, 380, '#ffb04a', 0.45 * a * fl); glow(ctx, 0, -976, 120, '#fff0c0', 0.5 * a * fl);
  ctx.restore();
}

/* ---------- investigation office props ---------- */
function bwPhoto(ctx, x, y, w, h, rot, draw, light = 1) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(-w / 2 + 6, -h / 2 + 8, w, h);
  ctx.fillStyle = mixc('#e8e0cc', '#ffcf8a', 0.15 * light); ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.save(); ctx.beginPath(); ctx.rect(-w / 2 + 8, -h / 2 + 8, w - 16, h - 22); ctx.clip();
  ctx.fillStyle = '#3a3640'; ctx.fillRect(-w / 2, -h / 2, w, h);
  draw(ctx, w - 16, h - 22);
  ctx.globalCompositeOperation = 'saturation'; ctx.fillStyle = '#808080'; ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.globalCompositeOperation = 'source-over';
  ctx.restore(); ctx.restore();
}
function drawPin(ctx, x, y) { ctx.fillStyle = '#8a1a24'; ctx.beginPath(); ctx.arc(x, y, 7, 0, TAU); ctx.fill(); ctx.fillStyle = '#ff8a8a'; ctx.beginPath(); ctx.arc(x - 2, y - 2, 2.2, 0, TAU); ctx.fill(); }
const PHOTOS = {
  palace: (c, w, h) => { c.save(); c.translate(-w / 2, -h / 2); c.scale(w / 1080, w / 1080); c.translate(0, -360); drawNightSky(c, -300, 0, 1700, 1400, 0.4); drawPalace(c, 0, 0.3); c.restore(); },
  star: (c, w, h) => { c.fillStyle = '#2a2a30'; c.fillRect(-w / 2, -h / 2, w, h); pieceStar(c, 0, 0, Math.min(w, h) / 230, 1.2, false, 0.6, 1); },
  necklace: (c, w, h) => { c.fillStyle = '#2a2a30'; c.fillRect(-w / 2, -h / 2, w, h); pieceNecklace(c, 0, -h * 0.2, w / 520, 2.1, false, 0.6, 1); },
  vitrine: (c, w, h) => { c.save(); c.scale(w / 760, w / 760); c.translate(-540, -1100); c.fillStyle = '#1a1420'; c.fillRect(0, 700, 1080, 1000); drawVitrine(c, 1, { tray: { missing: new Set(['star', 'necklace', 'sword', 'epaulette', 'bow']), lit: 0.4, k: 0.4 }, broken: { cx: 520, cy: 1080, r: 150, prog: 1, seed: 3 }, light: 0.6 }); c.restore(); },
  glass: (c, w, h) => { c.fillStyle = '#1a1820'; c.fillRect(-w / 2, -h / 2, w, h); drawBrokenGlass(c, 0, { cx: 0, cy: 0, r: Math.min(w, h) * 0.6, prog: 1, seed: 5 }); },
  sword: (c, w, h) => { c.fillStyle = '#2a2a30'; c.fillRect(-w / 2, -h / 2, w, h); pieceSword(c, 0, 0, w / 380, 0.4, false, 0.6, 1); },
};
function drawScales(ctx, x, y, r, col, lw) {
  ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x, y - r * 0.7); ctx.lineTo(x, y + r * 0.6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x - r * 0.62, y - r * 0.45); ctx.lineTo(x + r * 0.62, y - r * 0.45); ctx.stroke();
  for (const s of [-1, 1]) { const px = x + s * r * 0.58; ctx.beginPath(); ctx.moveTo(px, y - r * 0.45); ctx.lineTo(px - r * 0.2, y + r * 0.05); ctx.moveTo(px, y - r * 0.45); ctx.lineTo(px + r * 0.2, y + r * 0.05); ctx.stroke(); ctx.beginPath(); ctx.arc(px, y + r * 0.05, r * 0.22, 0, PI); ctx.fill(); }
  ctx.beginPath(); ctx.moveTo(x - r * 0.3, y + r * 0.6); ctx.lineTo(x + r * 0.3, y + r * 0.6); ctx.stroke();
  ctx.beginPath(); ctx.arc(x, y - r * 0.72, r * 0.07, 0, TAU); ctx.fill();
  ctx.restore();
}
