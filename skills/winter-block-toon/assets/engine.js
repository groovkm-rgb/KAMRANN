// Winter-block toon engine — flat ink-and-fill 2D cartoon look:
// clean black outlines, flat colours with one cel-shade tone, droopy-eyed long-necked characters,
// post-Soviet panel blocks at night, sodium street lamps, falling snow, breath clouds.
// Everything is a pure function of time t (seconds). No Math.random, no clocks.
'use strict';
const W = 1080, H = 1920, FPS = 24;

const PAL = {
  ink: '#16151b',
  skyTop: '#151d3a', skyBot: '#2a3563',
  snow: '#e3e5f1', snowShade: '#b9bedb', snowDeep: '#99a0c7', snowNight: '#c9cde6',
  block: '#5e716e', blockShade: '#475856', blockDark: '#36443f', blockFar: '#4b5a66', blockFarShade: '#3d4a57',
  winWarm: '#f1c860', winWarm2: '#d79f3d', winDark: '#28344a', winFarDark: '#27324a', winFrame: '#2c3532',
  lamp: '#d8843a', lampDark: '#a85f27', lampLight: '#ffd27d',
  skin: '#c8a468', skinShade: '#a9874f', skinLine: '#5f4a2c', lip: '#b98b5a',
  hair: '#d98a2b', hairHi: '#e9a548', hairShade: '#b26a1b',
  hoodie: '#1c1d25', hoodieHi: '#2a2c38', piping: '#3f4fa6', zip: '#e9e6da',
  pants: '#8a95d8', pantsShade: '#6b75b8', stripe: '#f1f2fb',
  shoe: '#1d1f2e', sole: '#ecebf1',
  eyeW: '#f2ecd8', breath: '#f1f3fb',
  shelter: '#8a5233', shelterShade: '#653a24', poster: '#d9d2bb', poster2: '#9fb0a0',
  wall: '#5d6f86', wallShade: '#4b5b72', wallDark: '#3b4860',
};

// ---------- math / determinism ----------
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
const inv = (a, b, v) => clamp((v - a) / (b - a));
const E = {
  inOut: k => k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2,
  out: k => 1 - Math.pow(1 - k, 3),
  in: k => k * k * k,
  sine: k => .5 - .5 * Math.cos(Math.PI * k),
};
function hash(a, b = 0, c = 0) {
  let h = (a * 374761393 + b * 668265263 + c * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
// "Animate on twos": character motion snaps to 12 drawings / second like TV animation.
const twos = t => Math.floor(t * 12) / 12;

// ---------- ink helpers ----------
let LW = 6; // current base line width (set per shot / per character scale)
function ink(ctx, build, fill, lw = LW, stroke = PAL.ink) {
  ctx.beginPath(); build(ctx);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (lw) { ctx.lineWidth = lw; ctx.strokeStyle = stroke; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); }
}
function poly(pts, close = true) { return c => { c.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]); if (close) c.closePath(); }; }
// Smooth closed/open curve through points (Catmull-Rom → Bezier).
function smooth(pts, close = true, k = 1) {
  return c => {
    const n = pts.length, P = i => close ? pts[(i + n) % n] : pts[clamp(i, 0, n - 1)];
    c.moveTo(pts[0][0], pts[0][1]);
    const m = close ? n : n - 1;
    for (let i = 0; i < m; i++) {
      const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
      c.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6 * k, p1[1] + (p2[1] - p0[1]) / 6 * k, p2[0] - (p3[0] - p1[0]) / 6 * k, p2[1] - (p3[1] - p1[1]) / 6 * k, p2[0], p2[1]);
    }
    if (close) c.closePath();
  };
}
function stroke(ctx, build, lw = LW, col = PAL.ink) { ink(ctx, build, null, lw, col); }
function ellipse(x, y, rx, ry, rot = 0) { return c => c.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); }

// ---------- camera ----------
// cam = {x, y, zoom}: world point (x,y) is placed at the frame centre. depth<1 = farther (moves less).
function withCam(ctx, cam, depth, fn) {
  ctx.save();
  const z = 1 + (cam.zoom - 1) * depth;
  ctx.translate(W / 2, H / 2); ctx.scale(z, z);
  ctx.translate(-(W / 2 + (cam.x - W / 2) * depth), -(H / 2 + (cam.y - H / 2) * depth));
  fn(); ctx.restore();
}

// ---------- sky / atmosphere ----------
function sky(ctx, top = PAL.skyTop, bot = PAL.skyBot, y0 = 0, y1 = H) {
  const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, top); g.addColorStop(1, bot);
  ctx.fillStyle = g; ctx.fillRect(-W, -H, W * 3, H * 3);
}
function glow(ctx, x, y, r, col = '255,196,120', a = .35) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(.35, `rgba(${col},${a * .4})`); g.addColorStop(1, `rgba(${col},0)`);
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore();
}

// ---------- panel apartment block ----------
// o: {x, y(top), w, h, floors, cols, seed, side (+px depth to the right / -left), far, lit (0..1), t, onAt:[[col,floor,time]]}
function panelBlock(ctx, o) {
  const { x, y, w, h, floors, cols, seed = 1, side = 0, far = false, lit = .35, t = 0 } = o;
  const lw = o.lw ?? (far ? LW * .55 : LW * .8);
  const face = far ? PAL.blockFar : PAL.block, shade = far ? PAL.blockFarShade : PAL.blockShade;
  // side wall (gives volume)
  if (side) {
    const sx = side > 0 ? x + w : x, d = side;
    ink(ctx, poly([[sx, y], [sx + d, y + Math.abs(d) * .25], [sx + d, y + h], [sx, y + h]]), shade, lw);
  }
  ink(ctx, poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]]), face, lw);
  // roof parapet + antennas
  ink(ctx, poly([[x - 4, y - h * .012], [x + w + 4, y - h * .012], [x + w + 4, y + h * .008], [x - 4, y + h * .008]]), shade, lw * .8);
  for (let i = 0; i < 3; i++) {
    const ax = x + w * (.15 + .3 * i + hash(seed, i, 7) * .12), ah = 18 + hash(seed, i, 8) * 26;
    stroke(ctx, c => { c.moveTo(ax, y - h * .012); c.lineTo(ax, y - h * .012 - ah); c.moveTo(ax - 10, y - h * .012 - ah * .8); c.lineTo(ax + 10, y - h * .012 - ah * .8); }, lw * .6);
  }
  const fh = h / floors, cw = w / cols;
  // panel seams
  ctx.globalAlpha = .55;
  for (let f = 1; f < floors; f++) stroke(ctx, c => { c.moveTo(x, y + f * fh); c.lineTo(x + w, y + f * fh); }, lw * .45);
  ctx.globalAlpha = 1;
  // windows
  const ww = cw * .46, wh = fh * .52;
  for (let f = 0; f < floors - (o.groundFloor ? 1 : 0); f++) for (let cI = 0; cI < cols; cI++) {
    const wx = x + cI * cw + (cw - ww) / 2, wy = y + f * fh + fh * .22;
    let on = hash(seed, f * 97 + cI, 3) < lit;
    for (const [cc, ff, tt] of o.onAt || []) if (cc === cI && ff === f) on = t >= tt;
    const col = on ? (hash(seed, cI, f) < .3 ? PAL.winWarm2 : PAL.winWarm) : (far ? PAL.winFarDark : PAL.winDark);
    ink(ctx, poly([[wx, wy], [wx + ww, wy], [wx + ww, wy + wh], [wx, wy + wh]]), col, lw * .55);
    if (!far && ww > 22) { // mullion
      stroke(ctx, c => { c.moveTo(wx + ww * .55, wy); c.lineTo(wx + ww * .55, wy + wh); c.moveTo(wx + ww * .55, wy + wh * .38); c.lineTo(wx + ww, wy + wh * .38); }, lw * .4, PAL.winFrame);
      if (on && hash(seed, f, cI + 40) < .4) { ctx.fillStyle = 'rgba(120,60,30,.35)'; ctx.fillRect(wx + 2, wy + 2, ww * .3, wh - 4); } // curtain
    }
  }
}

// ---------- street lamp (Soviet "hooked" lamp) ----------
// base (x, y), height h, dir = +1 hooks right / -1 left
function streetLamp(ctx, x, y, h, dir = 1, lw = LW) {
  const top = y - h, hx = x + dir * h * .16;
  ink(ctx, c => { c.moveTo(x - lw, y); c.lineTo(x - lw * .9, top + h * .1); c.quadraticCurveTo(x, top - h * .02, hx - dir * h * .03, top); c.lineTo(hx - dir * h * .03, top + lw * 1.7); c.quadraticCurveTo(x + lw * 1.6 * dir, top + h * .03, x + lw * .9, top + h * .12); c.lineTo(x + lw, y); c.closePath(); }, PAL.lamp, lw * .8);
  // hood
  ink(ctx, c => { c.ellipse(hx, top + h * .012, h * .07, h * .028, 0, Math.PI, 0); c.closePath(); }, PAL.lamp, lw * .8);
  ink(ctx, ellipse(hx, top + h * .014, h * .055, h * .011), PAL.lampLight, lw * .5);
  return [hx, top + h * .02];
}

// ---------- snow ground / banks ----------
function snowBank(ctx, pts, lw = LW, fill = PAL.snow) {
  ink(ctx, smooth(pts, true, .9), fill, lw);
}
function snowSpecks(ctx, x0, y0, x1, y1, n, seed, lw = LW) {
  // little ink "o" marks sprinkled on snow surfaces (hand-drawn texture)
  for (let i = 0; i < n; i++) {
    const px = lerp(x0, x1, hash(seed, i, 1)), py = lerp(y0, y1, hash(seed, i, 2)), r = 3 + hash(seed, i, 3) * 4;
    stroke(ctx, ellipse(px, py, r * .7, r), lw * .35, 'rgba(22,21,27,.55)');
  }
}

// ---------- bus shelter ----------
function busShelter(ctx, x, y, w, h, lw = LW) {
  // posts
  ink(ctx, poly([[x, y - h], [x + 14, y - h], [x + 14, y], [x, y]]), PAL.shelter, lw * .7);
  ink(ctx, poly([[x + w - 14, y - h], [x + w, y - h], [x + w, y], [x + w - 14, y]]), PAL.shelter, lw * .7);
  // back panel with torn posters (no text — shapes only)
  ink(ctx, poly([[x + 14, y - h * .86], [x + w - 14, y - h * .86], [x + w - 14, y - h * .2], [x + 14, y - h * .2]]), PAL.shelterShade, lw * .6);
  const posters = [[.08, .78, .3, .28, PAL.poster, -.04], [.42, .74, .28, .34, PAL.poster2, .03], [.18, .44, .34, .2, PAL.poster, .05], [.62, .38, .26, .16, PAL.poster, -.06]];
  for (const [px, py, pw, ph, col, rot] of posters) {
    ctx.save(); ctx.translate(x + w * (px + pw / 2), y - h * py + h * ph / 2); ctx.rotate(rot);
    ink(ctx, poly([[-w * pw / 2, -h * ph / 2], [w * pw / 2, -h * ph / 2], [w * pw / 2 - 6, h * ph / 2], [-w * pw / 2 + 8, h * ph / 2 - 6]]), col, lw * .45);
    ctx.globalAlpha = .5; for (let i = 0; i < 3; i++) stroke(ctx, c => { c.moveTo(-w * pw * .35, -h * ph * .25 + i * h * ph * .2); c.lineTo(w * pw * (.1 + .2 * (i % 2)), -h * ph * .25 + i * h * ph * .2); }, lw * .5); ctx.globalAlpha = 1;
    ctx.restore();
  }
  // roof with snow load
  ink(ctx, poly([[x - 20, y - h - 6], [x + w + 20, y - h - 6], [x + w + 20, y - h + 14], [x - 20, y - h + 14]]), PAL.shelter, lw * .7);
  snowBank(ctx, [[x - 34, y - h - 2], [x - 20, y - h - 30], [x + w * .3, y - h - 44], [x + w * .7, y - h - 40], [x + w + 30, y - h - 26], [x + w + 40, y - h + 4], [x + w + 26, y - h + 26], [x + w + 12, y - h + 6], [x + w * .5, y - h + 2], [x - 10, y - h + 10]], lw * .8);
}

// ---------- falling snow ----------
// Hollow, slightly tear-shaped flakes with thin ink rims (as in hand-inked winter scenes).
function snowfall(ctx, t, o = {}) {
  const { n = 120, seed = 3, speed = 120, size = 7, wind = 18, x0 = -60, x1 = W + 60, y0 = -60, y1 = H + 60, alpha = 1 } = o;
  const span = y1 - y0;
  ctx.save(); ctx.globalAlpha = alpha;
  for (let i = 0; i < n; i++) {
    const r = size * (.6 + hash(seed, i, 1) * .8), sp = speed * (.75 + hash(seed, i, 2) * .5);
    const y = y0 + ((hash(seed, i, 3) * span + t * sp) % span);
    const x = x0 + hash(seed, i, 4) * (x1 - x0) + Math.sin(t * (1 + hash(seed, i, 5)) + i) * wind + t * wind * .6;
    const xx = x0 + ((x - x0) % (x1 - x0) + (x1 - x0)) % (x1 - x0);
    ctx.beginPath(); ctx.ellipse(xx, y, r * .62, r, Math.sin(t + i) * .3, 0, Math.PI * 2);
    ctx.fillStyle = PAL.breath; ctx.fill();
    ctx.lineWidth = Math.max(1, r * .18); ctx.strokeStyle = 'rgba(40,44,80,.32)'; ctx.stroke();
  }
  ctx.restore();
}
// Blizzard streaks (wind-driven lines) for gusts.
function snowStreaks(ctx, t, o = {}) {
  const { n = 40, seed = 9, len = 120, speed = 900, ang = -.35, alpha = .5 } = o;
  ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = PAL.breath; ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const L = len * (.6 + hash(seed, i, 1) * .8), p = (hash(seed, i, 2) * 3000 + t * speed) % 3000;
    const x = W + 300 - p, y = hash(seed, i, 3) * H + p * Math.tan(ang) * -.4;
    ctx.lineWidth = 2 + hash(seed, i, 4) * 2.5;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + L * Math.cos(ang), y + L * Math.sin(ang)); ctx.stroke();
  }
  ctx.restore();
}

// ---------- breath cloud ----------
// Puff leaves (x,y) at t0, drifts along dir, grows and fades. Union of soft round lobes with a faint rim.
function breath(ctx, t, t0, x, y, o = {}) {
  const { dir = -1, dur = 1.5, size = 60, lw = LW * .7, rise = -.18 } = o;
  const k = (t - t0) / dur; if (k < 0 || k > 1) return;
  const g = E.out(k), a = k < .12 ? k / .12 : 1 - E.in(inv(.3, 1, k));
  const lobes = [];
  for (let i = 0; i < 6; i++) {
    const f = i / 5, d = g * size * 2.6 * (.25 + f * .9);
    const tail = clamp(1 - (k - .08) * 3 + f * 1.4); if (tail <= 0) continue; // lobes near the mouth dissolve first
    lobes.push([x + dir * d, y + size * rise * (d / size) + Math.sin(i * 2.1 + k * 4) * size * .08, size * (.18 + f * .32 + g * .4) * Math.min(1, tail)]);
  }
  const shape = c => { for (const [cx, cy, r] of lobes) { c.moveTo(cx + r * 1.2, cy); c.ellipse(cx, cy, r * 1.2, r * .85, 0, 0, Math.PI * 2); } };
  ctx.save(); ctx.globalAlpha = a * .5; ink(ctx, shape, null, lw * 1.2, PAL.snowDeep);
  ctx.globalAlpha = a * .9; ink(ctx, shape, PAL.breath, 0); ctx.restore();
}

// ---------- film finish ----------
let _grain = null;
function grain(ctx, t, a = .07) {
  if (!_grain) {
    _grain = [];
    for (let v = 0; v < 4; v++) {
      const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'), id = g.createImageData(256, 256);
      for (let i = 0; i < 256 * 256; i++) { const n = hash(i, v, 11) * 255; id.data[i * 4] = id.data[i * 4 + 1] = id.data[i * 4 + 2] = n; id.data[i * 4 + 3] = 255; }
      g.putImageData(id, 0, 0); _grain.push(c);
    }
  }
  ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = ctx.createPattern(_grain[Math.floor(t * FPS) % 4], 'repeat'); ctx.fillRect(0, 0, W, H); ctx.restore();
}
function vignette(ctx, a = .45) {
  const g = ctx.createRadialGradient(W / 2, H * .48, H * .28, W / 2, H * .5, H * .78);
  g.addColorStop(0, 'rgba(10,12,30,0)'); g.addColorStop(1, `rgba(10,12,30,${a})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
function coldTint(ctx, a = .08) { ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = `rgba(150,165,230,${a * 4})`; ctx.globalAlpha = .25; ctx.fillRect(0, 0, W, H); ctx.restore(); }
function fade(ctx, a) { if (a <= 0) return; ctx.fillStyle = `rgba(8,9,18,${clamp(a)})`; ctx.fillRect(0, 0, W, H); }
