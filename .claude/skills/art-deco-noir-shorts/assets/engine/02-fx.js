/* =====================================================================
   02 · ATMOSPHERE & FX — textures, rain, rain-on-glass, smoke, dust,
   lightning, searchlights, procedural Art-Deco skylines, film post FX.
   Everything animated is a pure function of time => seekable.
   ===================================================================== */
const TEX = {};

const PAL = {
  ink: '#07060a', char0: '#0d0b11', char1: '#16131b', char2: '#211c27', char3: '#2c2533',
  plum0: '#1a1022', plum1: '#2a1838', plum2: '#3b2350', plum3: '#4c2e66', plum4: '#6a4a8c',
  bur0: '#2a0c14', bur1: '#4a1420', bur2: '#6b1e2c', bur3: '#8a2a36',
  amb0: '#5a3214', amb1: '#b9772e', amb2: '#e0a24a', amb3: '#f2c46d', amb4: '#ffe2a8',
  cream: '#e8dcc0', cool: '#b9a8e6', coolHi: '#dcd2ff', sky0: '#08060d', sky1: '#1c1029', sky2: '#3a1a35', sky3: '#6a2a32',
  gem: '#d0142a', gold: '#d4a64a', wood0: '#1c0d0b', wood1: '#2f1712', wood2: '#4a2418', wood3: '#6b3a22',
};

function buildTextures() {
  // film grain tiles: signed noise baked as black/white alpha (cheap source-over compositing)
  TEX.grain = [];
  for (let k = 0; k < 4; k++) {
    const c = makeCanvas(256, 256), g = c.getContext('2d'), id = g.createImageData(256, 256), R = mulberry32(900 + k);
    for (let i = 0; i < id.data.length; i += 4) {
      const v = (R() + R() + R() - 1.5) / 1.5;
      const w = v > 0 ? 255 : 0;
      id.data[i] = id.data[i + 1] = id.data[i + 2] = w; id.data[i + 3] = Math.min(255, Math.abs(v) * 95);
    }
    g.putImageData(id, 0, 0); TEX.grain.push(c);
  }
  // painterly mottling (soft blobs + dry-brush strokes)
  {
    const c = makeCanvas(540, 960), g = c.getContext('2d'), R = mulberry32(77);
    g.fillStyle = '#808080'; g.fillRect(0, 0, 540, 960);
    for (let i = 0; i < 260; i++) {
      const x = R() * 540, y = R() * 960, r = 20 + R() * 110, v = R() < 0.5 ? 0 : 255;
      const gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, `rgba(${v},${v},${v},${0.05 + R() * 0.07})`); gr.addColorStop(1, `rgba(${v},${v},${v},0)`);
      g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
    }
    g.lineCap = 'round';
    for (let i = 0; i < 900; i++) {
      const x = R() * 540, y = R() * 960, a = (R() - 0.5) * 0.6 + (R() < 0.5 ? 0 : PI / 2), l = 10 + R() * 60, v = R() < 0.5 ? 40 : 220;
      g.strokeStyle = `rgba(${v},${v},${v},${0.03 + R() * 0.05})`; g.lineWidth = 1 + R() * 5;
      g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * l * 0.5 + (R() - 0.5) * 10, y + Math.sin(a) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
    }
    // convert grey mottling to signed black/white alpha so it can be laid with source-over
    const id = g.getImageData(0, 0, 540, 960), d = id.data;
    for (let i = 0; i < d.length; i += 4) { const v = (d[i] - 128) / 128, w = v > 0 ? 255 : 0; d[i] = d[i + 1] = d[i + 2] = w; d[i + 3] = Math.min(255, Math.abs(v) * 255 * 1.4); }
    g.putImageData(id, 0, 0);
    TEX.paint = c;
  }
  // vignette
  {
    const c = makeCanvas(540, 960), g = c.getContext('2d');
    const gr = g.createRadialGradient(270, 450, 120, 270, 480, 620);
    gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(0.55, 'rgba(0,0,0,0.18)'); gr.addColorStop(0.85, 'rgba(0,0,0,0.6)'); gr.addColorStop(1, 'rgba(0,0,0,0.85)');
    g.fillStyle = gr; g.fillRect(0, 0, 540, 960);
    TEX.vignette = c;
  }
  // rain beads on glass (static layer, 1080x1920)
  {
    const c = makeCanvas(1080, 1920), g = c.getContext('2d'), R = mulberry32(31);
    for (let i = 0; i < 2300; i++) {
      const x = R() * 1080, y = R() * 1920, r = 0.8 + Math.pow(R(), 3) * 6.5;
      g.fillStyle = 'rgba(190,180,230,0.10)'; g.beginPath(); g.ellipse(x, y, r, r * 1.12, 0, 0, TAU); g.fill();
      g.strokeStyle = 'rgba(0,0,0,0.45)'; g.lineWidth = Math.max(0.7, r * 0.35);
      g.beginPath(); g.arc(x, y + r * 0.1, r * 0.9, 0.15 * PI, 0.85 * PI); g.stroke();
      g.fillStyle = 'rgba(255,245,255,0.55)'; g.beginPath(); g.arc(x - r * 0.35, y - r * 0.4, Math.max(0.6, r * 0.28), 0, TAU); g.fill();
    }
    TEX.drops = c;
  }
  // smoke puff
  {
    const c = makeCanvas(128, 128), g = c.getContext('2d'), R = mulberry32(5);
    for (let i = 0; i < 9; i++) {
      const x = 64 + (R() - 0.5) * 40, y = 64 + (R() - 0.5) * 40, r = 22 + R() * 30;
      const gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, 'rgba(255,255,255,0.22)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
    }
    TEX.puff = c;
    TEX.puffTint = {};
  }
  buildSkylines();
}
function puffTinted(color) {
  if (TEX.puffTint[color]) return TEX.puffTint[color];
  const c = makeCanvas(128, 128), g = c.getContext('2d');
  g.drawImage(TEX.puff, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = color; g.fillRect(0, 0, 128, 128);
  return (TEX.puffTint[color] = c);
}
/** painterly overlay inside current transform over rect */
function paintOverlay(ctx, x, y, w, h, alpha = 0.35, op = 'source-over') {
  ctx.save(); ctx.globalAlpha *= alpha * 0.55; ctx.globalCompositeOperation = op;
  ctx.drawImage(TEX.paint, x, y, w, h); ctx.restore();
}

/* ---------- RAIN ---------- */
/** falling streaks. o:{x,y,w,h,n,len,speed,slant,width,color,alpha,seed} */
function drawRain(ctx, t, o) {
  const n = o.n, total = o.h + o.len * 2, sl = o.slant || 0;
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const hx = hash(i * 3 + o.seed), hy = hash(i * 3 + 1 + o.seed), hs = hash(i * 3 + 2 + o.seed);
    const sp = o.speed * (0.7 + hs * 0.6), l = o.len * (0.6 + hs * 0.8);
    const yy = ((hy * total + t * sp) % total) - o.len;
    const x = o.x + hx * (o.w + Math.abs(sl) * o.h) - (sl > 0 ? sl * o.h : 0) + yy * sl, y = o.y + yy;
    ctx.moveTo(x, y); ctx.lineTo(x + sl * l, y + l);
  }
  ctx.strokeStyle = o.color; ctx.lineWidth = o.width; ctx.lineCap = 'butt';
  const pa = ctx.globalAlpha; ctx.globalAlpha = pa * o.alpha; ctx.stroke(); ctx.globalAlpha = pa;
}
/** splashes on a horizontal surface line */
function drawSplashes(ctx, t, x, y, w, n, seed, color, alpha, scale = 1) {
  ctx.strokeStyle = color; ctx.lineWidth = 1.2 * scale;
  for (let i = 0; i < n; i++) {
    const per = 0.35 + hash(i + seed) * 0.4, ph = hash(i * 7 + seed) * per;
    const k = Math.floor((t + ph) / per), lt = ((t + ph) % per) / per;
    const xx = x + hash2(i + seed, k) * w;
    const a = (1 - lt) * alpha;
    if (a <= 0.01) continue;
    ctx.globalAlpha = a;
    ctx.beginPath(); ctx.ellipse(xx, y, (3 + lt * 10) * scale, (0.8 + lt * 2) * scale, 0, PI, TAU); ctx.stroke();
  }
  ctx.globalAlpha = 1;
}
/** rain on a pane of glass inside rect (caller clips). beads + running rivulets */
function drawGlassRain(ctx, t, x, y, w, h, o = {}) {
  const a = o.alpha ?? 1, sc = o.scale || 1;
  withAlpha(ctx, 0.75 * a, () => ctx.drawImage(TEX.drops, (o.sx || 0) % 400, (o.sy || 0) % 400, w / sc, h / sc, x, y, w, h));
  const n = o.n || 26;
  ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const seed = (o.seed || 1) * 131 + i;
    const per = 2.2 + hash(seed) * 3.5, ph = hash(seed + 3) * per;
    const cyc = Math.floor((t + ph) / per), lt = ((t + ph) % per) / per;
    const xx = x + hash2(seed, cyc) * w;
    // stick-slip descent
    const pp = lt + Math.sin(lt * 22 + seed) * 0.012;
    const head = y - 20 + pp * (h + 60);
    const len = (60 + hash(seed + 9) * 200) * sc * Math.min(1, lt * 4);
    const wob = s => Math.sin((s / sc) * 0.045 + seed) * 4 * sc + Math.sin((s / sc) * 0.13 + seed * 2) * 1.6 * sc;
    ctx.beginPath();
    for (let k = 0; k <= 10; k++) { const yy = head - len * (k / 10); ctx[k ? 'lineTo' : 'moveTo'](xx + wob(yy), yy); }
    ctx.strokeStyle = rgba(o.color || '#cfc4ff', 0.16 * a); ctx.lineWidth = 2.2 * sc; ctx.stroke();
    ctx.strokeStyle = rgba('#000000', 0.25 * a); ctx.lineWidth = 1.1 * sc; ctx.stroke();
    ctx.fillStyle = rgba('#efeaff', 0.5 * a);
    ctx.beginPath(); ctx.ellipse(xx + wob(head), head, 2.6 * sc, 3.4 * sc, 0, 0, TAU); ctx.fill();
  }
}
/** moving shadows of rain running down a window, projected onto a surface */
function drawRainShadows(ctx, t, x, y, w, h, o = {}) {
  const n = o.n || 40, sc = o.scale || 1, a = o.alpha ?? 0.35;
  ctx.fillStyle = o.color || '#000000';
  for (let i = 0; i < n; i++) {
    const seed = (o.seed || 5) * 71 + i;
    const per = 1.6 + hash(seed) * 3, ph = hash(seed + 1) * per;
    const cyc = Math.floor((t + ph) / per), lt = ((t + ph) % per) / per;
    const xx = x + hash2(seed, cyc) * w, yy = y - 40 * sc + lt * (h + 80 * sc);
    const len = (14 + hash(seed + 2) * 46) * sc;
    ctx.globalAlpha = a * (0.4 + hash(seed + 5) * 0.6);
    ctx.beginPath(); ctx.ellipse(xx + Math.sin(yy * 0.05 + i) * 3 * sc, yy, (1.5 + hash(seed + 4) * 2.5) * sc, len, 0, 0, TAU); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/* ---------- SMOKE ---------- */
/** stylised cigar smoke: tapering ribbons + soft puffs, rising from (x,y). k = scale */
function drawSmoke(ctx, t, x, y, k = 1, o = {}) {
  const col = o.color || '#c9bde0', alpha = o.alpha ?? 0.5, hgt = (o.height || 420) * k, n = o.ribbons || 3;
  const wind = o.wind || 0;
  ctx.save();
  for (let r = 0; r < n; r++) {
    const seed = r * 17 + (o.seed || 0);
    const L = [], R = [];
    const N = 26;
    for (let i = 0; i <= N; i++) {
      const s = i / N;
      const sway = (Math.sin(s * 7.5 - t * 1.25 + seed) * 26 * s + Math.sin(s * 15 - t * 0.7 + seed * 1.7) * 9 * s * s + fbm(s * 3 - t * 0.35, seed) * 30 * s + wind * s * s * 160) * k;
      const cx = x + sway, cy = y - s * hgt;
      const wd = (1.4 + s * 16 + Math.sin(s * 9 + t + seed) * 3 * s) * k;
      // derivative for normal
      L.push([cx - wd, cy]); R.push([cx + wd, cy]);
    }
    const pts = L.concat(R.reverse());
    const gr = ctx.createLinearGradient(0, y, 0, y - hgt);
    gr.addColorStop(0, rgba(col, alpha * 0.9)); gr.addColorStop(0.35, rgba(col, alpha * 0.45)); gr.addColorStop(1, rgba(col, 0));
    ctx.fillStyle = gr;
    ctx.fill(smoothPathOf(pts, true));
  }
  // puffs higher up
  const sp = puffTinted(col);
  const np = o.puffs ?? 7;
  for (let i = 0; i < np; i++) {
    const per = 5.5, ph = (i / np) * per, age = ((t + ph) % per) / per;
    const px = x + (fbm(i * 3.1 + Math.floor((t + ph) / per), 3) * 70 + Math.sin(age * 5 + i) * 30 + wind * age * 220) * k;
    const py = y - (0.35 + age * 0.9) * hgt;
    const pr = (30 + age * 120) * k;
    ctx.globalAlpha = alpha * 0.55 * Math.sin(age * PI);
    ctx.drawImage(sp, px - pr, py - pr, pr * 2, pr * 2);
  }
  ctx.restore();
}
/** layered room haze: slow drifting soft clouds over a rect */
function drawHaze(ctx, t, x, y, w, h, color, alpha, n = 6, seed = 0) {
  const sp = puffTinted(color);
  for (let i = 0; i < n; i++) {
    const px = x + ((hash(i + seed) * w + t * (8 + hash(i + 50 + seed) * 14)) % (w + 400)) - 200;
    const py = y + hash(i + 20 + seed) * h;
    const r = 220 + hash(i + 40 + seed) * 320;
    ctx.globalAlpha = alpha * (0.5 + 0.5 * Math.sin(t * 0.3 + i));
    ctx.drawImage(sp, px - r, py - r * 0.6, r * 2, r * 1.2);
  }
  ctx.globalAlpha = 1;
}
/** dust motes drifting in a light beam (additive) */
function drawDust(ctx, t, x, y, w, h, n, color, alpha, seed = 0, k = 1) {
  ctx.fillStyle = color;
  for (let i = 0; i < n; i++) {
    const s = seed * 97 + i;
    const px = x + ((hash(s) * w + fbm(t * 0.08 + i, s) * 80) % w + w) % w;
    const py = y + ((hash(s + 1) * h - t * (4 + hash(s + 2) * 8) + fbm(t * 0.1 + i * 2, s + 1) * 60) % h + h) % h;
    const tw = 0.5 + 0.5 * Math.sin(t * (1 + hash(s + 3) * 2) + i);
    ctx.globalAlpha = alpha * tw;
    const r = (0.8 + hash(s + 4) * 1.8) * k;
    ctx.fillRect(px - r / 2, py - r / 2, r, r);
  }
  ctx.globalAlpha = 1;
}

/* ---------- LIGHTNING ---------- */
/** flash envelope for a list of strikes [{t, peak}] — classic double/triple flicker */
function flashAt(t, events) {
  let v = 0;
  for (const e of events) {
    const d = t - e.t;
    if (d < 0 || d > 1.6) continue;
    const f = Math.exp(-d * 16) + (d > 0.11 ? Math.exp(-(d - 0.11) * 11) * 0.85 : 0) + (d > 0.32 ? Math.exp(-(d - 0.32) * 5) * 0.45 : 0);
    v = Math.max(v, (e.peak ?? 1) * Math.min(1, f));
  }
  return v;
}
const _bolts = {};
function boltPts(seed, x0, y0, x1, y1, depth = 7) {
  const key = seed + ':' + x0 + ':' + y0 + ':' + x1 + ':' + y1;
  if (_bolts[key]) return _bolts[key];
  const R = mulberry32(seed);
  let pts = [[x0, y0], [x1, y1]];
  let disp = Math.hypot(x1 - x0, y1 - y0) * 0.22;
  for (let d = 0; d < depth; d++) {
    const np = [pts[0]];
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i];
      np.push([(a[0] + b[0]) / 2 + (R() - 0.5) * disp, (a[1] + b[1]) / 2 + (R() - 0.5) * disp * 0.3], b);
    }
    pts = np; disp *= 0.55;
  }
  const branches = [];
  for (let b = 0; b < 4; b++) {
    const i = Math.floor(pts.length * (0.2 + R() * 0.55)), s = pts[i];
    const ang = (R() < 0.5 ? -1 : 1) * (0.4 + R() * 0.6), len = Math.hypot(x1 - x0, y1 - y0) * (0.15 + R() * 0.2);
    const br = [s]; let cx = s[0], cy = s[1];
    for (let k = 0; k < 9; k++) { cx += Math.sin(ang) * len / 9 + (R() - 0.5) * len * 0.15; cy += Math.cos(ang) * len / 9 * 0.9; br.push([cx, cy]); }
    branches.push(br);
  }
  return (_bolts[key] = { main: pts, branches });
}
function drawBolt(ctx, seed, x0, y0, x1, y1, a, k = 1) {
  if (a <= 0.02) return;
  const b = boltPts(seed, x0, y0, x1, y1);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const strokeAll = (w, col, al) => {
    ctx.strokeStyle = rgba(col, al * a); ctx.lineWidth = w * k;
    ctx.stroke(pathOf(b.main, false));
    ctx.lineWidth = w * k * 0.5;
    for (const br of b.branches) ctx.stroke(pathOf(br, false));
  };
  strokeAll(26, '#6a4fc0', 0.18); strokeAll(10, '#a995ff', 0.4); strokeAll(3.2, '#f4f0ff', 0.95);
  ctx.restore();
}

/* ---------- SEARCHLIGHT ---------- */
function drawBeam(ctx, x, y, ang, len, w0, w1, color, a) {
  if (a <= 0.003) return;
  const dx = Math.sin(ang), dy = -Math.cos(ang), nx = -dy, ny = dx;
  const ex = x + dx * len, ey = y + dy * len;
  const gr = ctx.createLinearGradient(x, y, ex, ey);
  gr.addColorStop(0, rgba(color, a)); gr.addColorStop(0.6, rgba(color, a * 0.35)); gr.addColorStop(1, rgba(color, 0));
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = gr;
  ctx.beginPath(); ctx.moveTo(x + nx * w0, y + ny * w0); ctx.lineTo(ex + nx * w1, ey + ny * w1); ctx.lineTo(ex - nx * w1, ey - ny * w1); ctx.lineTo(x - nx * w0, y - ny * w0); ctx.closePath(); ctx.fill();
  ctx.restore();
}
/** light cone from a lamp: apex (x,y) pointing down, spreading */
function drawCone(ctx, x, y, topW, botW, len, color, a, dir = 0) {
  if (a <= 0.003) return;
  const gr = ctx.createLinearGradient(x, y, x, y + len);
  gr.addColorStop(0, rgba(color, a)); gr.addColorStop(0.7, rgba(color, a * 0.35)); gr.addColorStop(1, rgba(color, 0));
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = gr;
  ctx.beginPath(); ctx.moveTo(x - topW / 2, y); ctx.lineTo(x + topW / 2, y); ctx.lineTo(x + botW / 2 + dir, y + len); ctx.lineTo(x - botW / 2 + dir, y + len); ctx.closePath(); ctx.fill();
  ctx.restore();
}

/* ---------- ART-DECO SKYLINES (pre-rendered) ---------- */
const SKY = {};
function buildSkylines() {
  SKY.far = buildSkyline({ w: 1700, h: 1100, seed: 11, minW: 50, maxW: 130, minH: 250, maxH: 720, color: '#3a2442', edge: '#7a4a6e', dark: '#2a1a32', litP: 0.10, lit: ['#b06a48', '#c98a58', '#8a5a6a'], scale: 0.7 });
  SKY.mid = buildSkyline({ w: 1800, h: 1400, seed: 23, minW: 80, maxW: 210, minH: 360, maxH: 1060, color: '#22152b', edge: '#8e5f9c', dark: '#160d1c', litP: 0.13, lit: ['#e0a24a', '#f2c46d', '#c47a3a', '#e8d2a0'], scale: 1, tall: 0.22 });
  SKY.near = buildSkyline({ w: 1900, h: 1700, seed: 37, minW: 130, maxW: 300, minH: 520, maxH: 1450, color: '#110a15', edge: '#b48ad0', dark: '#0a060c', litP: 0.16, lit: ['#f2c46d', '#ffd98a', '#e0a24a', '#f4e4c0'], scale: 1.4, tall: 0.3 });
}
function buildSkyline(o) {
  const c = makeCanvas(o.w, o.h), g = c.getContext('2d');
  const rc = makeCanvas(o.w, o.h), r = rc.getContext('2d');
  const R = mulberry32(o.seed), flick = [];
  let x = -o.maxW * 0.4;
  while (x < o.w + o.maxW * 0.2) {
    const bw = lerp(o.minW, o.maxW, R());
    let bh = lerp(o.minH, o.maxH, Math.pow(R(), 1.25));
    if (o.tall && R() < o.tall) bh = Math.min(o.h * 0.95, bh * 1.4);
    decoBuilding(g, r, x, o.h, bw, bh, R, o, flick);
    x += bw * lerp(0.45, 0.9, R());
  }
  return { img: c, rim: rc, w: o.w, h: o.h, flick };
}
function decoBuilding(g, r, x, base, bw, bh, R, o, flick) {
  const S = o.scale, tiers = 1 + Math.floor(R() * 3.3), rects = [];
  let w = bw, y = base, rem = bh;
  const cx = x + bw / 2;
  for (let i = 0; i < tiers; i++) {
    const th = i === tiers - 1 ? rem : rem * lerp(0.5, 0.72, R());
    rects.push({ x: cx - w / 2, y: y - th, w, h: th });
    y -= th; rem -= th; w *= lerp(0.6, 0.84, R());
  }
  g.fillStyle = o.color;
  for (const q of rects) g.fillRect(q.x, q.y, q.w, q.h + 1);
  // corner setbacks / wings with vertical fluting
  const top = rects[rects.length - 1];
  g.beginPath();
  const type = R();
  if (type < 0.24) {                       // needle spire
    const sh = bh * lerp(0.16, 0.32, R());
    g.moveTo(top.x + top.w * 0.22, top.y); g.lineTo(cx - 2 * S, top.y - sh); g.lineTo(cx, top.y - sh * 1.25); g.lineTo(cx + 2 * S, top.y - sh); g.lineTo(top.x + top.w * 0.78, top.y);
  } else if (type < 0.44) {                // ziggurat steps + mast
    let sw = top.w * 0.82, sy = top.y;
    for (let k = 0; k < 4; k++) { const sh = Math.max(4 * S, top.w * 0.1); g.rect(cx - sw / 2, sy - sh, sw, sh + 1); sy -= sh; sw *= 0.72; }
    g.rect(cx - 1.4 * S, sy - top.w * 0.6, 2.8 * S, top.w * 0.6);
  } else if (type < 0.62) {                // scalloped arch crown
    let aw = top.w * 0.92, ay = top.y;
    for (let k = 0; k < 4; k++) { g.moveTo(cx - aw / 2, ay); g.arc(cx, ay, aw / 2, PI, 0); g.closePath(); ay -= aw * 0.3; aw *= 0.72; }
    g.moveTo(cx - 1.6 * S, ay); g.lineTo(cx, ay - top.w * 0.95); g.lineTo(cx + 1.6 * S, ay); g.closePath();
  } else if (type < 0.76) {                // water tower
    const tw = Math.min(top.w * 0.3, 26 * S), tx = top.x + top.w * lerp(0.15, 0.6, R());
    g.rect(tx, top.y - tw * 1.15, tw, tw * 0.85); g.moveTo(tx - 2 * S, top.y - tw * 1.15); g.lineTo(tx + tw / 2, top.y - tw * 1.65); g.lineTo(tx + tw + 2 * S, top.y - tw * 1.15); g.closePath();
    g.rect(tx + 2 * S, top.y - tw * 0.32, 2 * S, tw * 0.32); g.rect(tx + tw - 4 * S, top.y - tw * 0.32, 2 * S, tw * 0.32);
  } else if (type < 0.88) {                // stepped pyramid cap
    g.moveTo(top.x, top.y); g.lineTo(cx - top.w * 0.12, top.y - top.w * 0.5); g.lineTo(cx, top.y - top.w * 0.62); g.lineTo(cx + top.w * 0.12, top.y - top.w * 0.5); g.lineTo(top.x + top.w, top.y); g.closePath();
  } else {                                 // flat with radio mast
    g.rect(cx - 1 * S, top.y - bh * 0.14, 2 * S, bh * 0.14);
    g.rect(cx - 8 * S, top.y - bh * 0.05, 16 * S, 1.5 * S);
  }
  g.fill();
  // fluting (thin lighter verticals)
  const fl = R() < 0.55;
  for (const q of rects) {
    if (fl) {
      g.fillStyle = rgba(o.edge, 0.09);
      const step = Math.max(6, 9 * S);
      for (let fx = q.x + step; fx < q.x + q.w - 2; fx += step) g.fillRect(fx, q.y + 3 * S, 1.2 * S, q.h - 3 * S);
    }
    decoWindows(g, q, R, o, flick);
    // ledge lines
    g.fillStyle = rgba(o.edge, 0.22); g.fillRect(q.x - 2 * S, q.y, q.w + 4 * S, 2 * S);
  }
  // rim light layer (edges facing the glowing sky)
  const side = R() < 0.5 ? 0 : 1;
  r.fillStyle = o.edge;
  for (const q of rects) {
    r.fillRect(side ? q.x + q.w - 2.2 * S : q.x, q.y, 2.2 * S, q.h);
    r.fillRect(q.x, q.y, q.w, 1.6 * S);
  }
  // aircraft warning light on tall ones
  if (bh > o.maxH * 0.75) flick.push({ x: cx, y: top.y - (type < 0.24 ? bh * 0.22 : top.w * 0.6), w: 0, h: 0, beacon: true, ph: R() * 3 });
}
function decoWindows(g, q, R, o, flick) {
  const S = o.scale, ww = 3 * S, wh = 4.4 * S, gx = 7 * S, gy = 9.5 * S;
  const cols = Math.floor((q.w - 6 * S) / gx), rows = Math.floor((q.h - 8 * S) / gy);
  if (cols < 1 || rows < 1) return;
  const ox = q.x + (q.w - cols * gx) / 2 + (gx - ww) / 2;
  const litP = o.litP * lerp(0.2, 1.9, R());
  const strip = R() < 0.25;              // deco light strips
  for (let i = 0; i < cols; i++) {
    const colLit = strip && i % 3 === 1;
    for (let j = 0; j < rows; j++) {
      const v = R();
      const wx = ox + i * gx, wy = q.y + 6 * S + j * gy;
      if (colLit ? v < 0.7 : v < litP) {
        g.fillStyle = o.lit[Math.floor(R() * o.lit.length)];
        g.globalAlpha = lerp(0.45, 1, R());
        g.fillRect(wx, wy, ww, wh);
        if (R() < 0.015) flick.push({ x: wx, y: wy, w: ww, h: wh, ph: R() * 20, per: 4 + R() * 9 });
      } else if (v < litP + 0.3) { g.fillStyle = o.dark; g.globalAlpha = 0.6; g.fillRect(wx, wy, ww, wh); }
    }
  }
  g.globalAlpha = 1;
}
/** draw a skyline layer with flicker + optional lightning rim, at (x,y) scaled by k */
function drawSkyline(ctx, sky, t, x, y, k, flash, o = {}) {
  ctx.drawImage(sky.img, x, y, sky.w * k, sky.h * k);
  if (flash > 0.01) withAlpha(ctx, clamp(flash * 1.4), () => withOp(ctx, 'lighter', () => ctx.drawImage(sky.rim, x, y, sky.w * k, sky.h * k)));
  else if (o.rim) withAlpha(ctx, o.rim, () => ctx.drawImage(sky.rim, x, y, sky.w * k, sky.h * k));
  // window flicker + beacons
  for (const f of sky.flick) {
    if (f.beacon) {
      const on = (Math.sin((t + f.ph) * 2.6) > 0.55) ? 1 : 0;
      if (on) glow(ctx, x + f.x * k, y + f.y * k, 14 * k, '#ff3a3a', 0.9);
      continue;
    }
    const on = Math.floor((t + f.ph) / f.per) % 2;
    if (!on) { ctx.fillStyle = '#120a14'; ctx.fillRect(x + f.x * k, y + f.y * k, f.w * k, f.h * k); }
  }
}
/** night sky gradient with burgundy horizon glow */
function drawNightSky(ctx, x, y, w, h, flash = 0, hz = 0.75) {
  const gr = ctx.createLinearGradient(0, y, 0, y + h);
  gr.addColorStop(0, mixc('#07050c', '#3a3060', flash * 0.7));
  gr.addColorStop(0.45, mixc('#1a0f26', '#5a4a8a', flash * 0.7));
  gr.addColorStop(hz, mixc('#4a1a30', '#8a6aa0', flash * 0.6));
  gr.addColorStop(1, mixc('#7a3a2c', '#b08aa0', flash * 0.5));
  ctx.fillStyle = gr; ctx.fillRect(x, y, w, h);
}
/** soft cloud bands (painted) */
function drawClouds(ctx, t, x, y, w, h, flash, seed = 0) {
  const sp = puffTinted('#5a3a5e');
  for (let i = 0; i < 14; i++) {
    const px = x + ((hash(i + seed) * (w + 600) + t * (6 + hash(i + seed + 30) * 8)) % (w + 600)) - 300;
    const py = y + hash(i + seed + 10) * h;
    const r = 260 + hash(i + seed + 20) * 360;
    ctx.globalAlpha = 0.55 + flash * 0.4;
    ctx.drawImage(sp, px - r, py - r * 0.3, r * 2, r * 0.6);
  }
  ctx.globalAlpha = 1;
}

/* ---------- POST FX ---------- */
function postFX(ctx, t, o = {}) {
  setScreen(ctx);
  const f = G.frame;
  // split-tone grade: plum shadows, amber highlights
  if (o.grade !== false) {
    ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = 0.32;
    const gr = ctx.createLinearGradient(0, 0, W, H);
    gr.addColorStop(0, '#4a2c6a'); gr.addColorStop(0.55, '#2a1838'); gr.addColorStop(1, '#7a3a2a');
    ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H); ctx.restore();
  }
  // vignette
  ctx.drawImage(TEX.vignette, 0, 0, W, H);
  // grain
  ctx.save(); ctx.globalAlpha = 0.55;
  const tile = TEX.grain[f % 4];
  const ox = Math.floor(hash(f * 3) * 256), oy = Math.floor(hash(f * 3 + 1) * 256);
  ctx.translate(-ox, -oy);
  const pat = ctx.createPattern(tile, 'repeat');
  ctx.fillStyle = pat; ctx.fillRect(0, 0, W + 256, H + 256);
  ctx.restore();
  // dust specks & occasional scratch
  for (let i = 0; i < 5; i++) {
    const h0 = hash2(f, i);
    if (h0 > 0.55) continue;
    const x = hash2(f, i + 10) * W, y = hash2(f, i + 20) * H, r = 0.8 + hash2(f, i + 30) * 2.4;
    ctx.fillStyle = h0 < 0.3 ? 'rgba(0,0,0,0.5)' : 'rgba(255,240,220,0.22)';
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  }
  if (hash(f * 13) < 0.08) {
    const x = hash(f * 17) * W;
    ctx.fillStyle = 'rgba(255,240,220,0.06)'; ctx.fillRect(x, 0, 1.2, H);
  }
  // projector flicker
  const fl = 0.025 + 0.025 * snz(t * 9, 4) + (hash(f * 7) < 0.04 ? 0.03 : 0);
  ctx.fillStyle = 'rgba(0,0,0,' + clamp(fl, 0, 0.1).toFixed(3) + ')'; ctx.fillRect(0, 0, W, H);
}
