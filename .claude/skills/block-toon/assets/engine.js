// Block-toon engine — flat ink-and-fill 2D cartoon look for life around post-Soviet panel blocks,
// any season: clean black outlines, flat colours with one cel-shade tone, sleepy long-necked people.
// Environment colours come from a THEME (winterNight, summerDay, summerEvening, …) so the same sets
// work in snow at night or in a hot summer courtyard.
// Everything is a pure function of time t (seconds). No Math.random, no clocks.
'use strict';
const W = 1080, H = 1920, FPS = 24;

// Shared character / prop palette (season independent).
const PAL = {
  ink: '#16151b',
  skin: '#c8a468', skinShade: '#a9874f', lip: '#b98b5a',
  hair: '#d98a2b', hairHi: '#e9a548', hairShade: '#b26a1b',
  hoodie: '#1c1d25', hoodieHi: '#2a2c38', piping: '#3f4fa6', zip: '#e9e6da',
  pants: '#8a95d8', pantsShade: '#6b75b8', stripe: '#f1f2fb',
  tank: '#eeeadd', tankShade: '#cfc9b6', tee: '#5a6fa8', teeShade: '#46598c',
  shoe: '#1d1f2e', sole: '#ecebf1', shades: '#1f2230',
  eyeW: '#f2ecd8', breath: '#f1f3fb',
  shelter: '#8a5233', shelterShade: '#653a24', poster: '#d9d2bb', poster2: '#9fb0a0',
  lamp: '#d8843a', lampLight: '#ffd27d', lampOff: '#e8d9a8',
  trunk: '#6e5a44', birch: '#ece8dc', bench: '#7c5a3c', benchShade: '#5e432c', metal: '#4d5a52',
};

// Environment themes. Set with theme('summerDay') at the top of a shot's draw().
const THEMES = {
  winterNight: { day: false, skyTop: '#151d3a', skyBot: '#2a3563',
    block: '#5e716e', blockShade: '#475856', blockFar: '#4b5a66', blockFarShade: '#3d4a57',
    winOn: '#f1c860', winOn2: '#d79f3d', winOff: '#28344a', winFarOff: '#27324a', winFrame: '#2c3532', balcony: '#53625f',
    ground: '#c9cde6', groundShade: '#99a0c7', bank: '#e3e5f1', speck: 'rgba(22,21,27,.55)',
    foliage: null, lampOn: true, tint: [150, 165, 230, .08, 'multiply'] },
  summerDay: { day: true, skyTop: '#4e9ad3', skyBot: '#cfe6ec',
    block: '#d9c8a4', blockShade: '#b8a57f', blockFar: '#b7c3c6', blockFarShade: '#9aa8ae',
    winOn: '#8fb3cc', winOn2: '#6f93ad', winOff: '#44596c', winFarOff: '#7f95a4', winFrame: '#efeadb', balcony: '#cbb894',
    ground: '#93b65a', groundShade: '#6f9440', bank: '#a3c466', speck: 'rgba(40,60,20,.45)',
    asphalt: '#8e8d93', asphaltShade: '#75747b',
    foliage: ['#5f913f', '#7cad4f', '#47702f'], lampOn: false, sun: '#ffe27a', cloud: '#fbfaf2', cloudShade: '#d3e1ea',
    tint: [255, 236, 190, .10, 'multiply'] },
  summerEvening: { day: true, skyTop: '#41588f', skyBot: '#f2a76a',
    block: '#c99b7d', blockShade: '#9c7465', blockFar: '#9a8494', blockFarShade: '#7e6b80',
    winOn: '#f6c46a', winOn2: '#e0a24c', winOff: '#4a4560', winFarOff: '#6f6380', winFrame: '#e6cdb2', balcony: '#b48a72',
    ground: '#7f9a4c', groundShade: '#5d763a', bank: '#8eaa57', speck: 'rgba(40,40,20,.45)',
    asphalt: '#7d7378', asphaltShade: '#675e65',
    foliage: ['#4f7a3a', '#6b9447', '#3a5a2c'], lampOn: true, sun: '#ffcf6e', cloud: '#f7d7c0', cloudShade: '#d9a99a',
    tint: [255, 170, 120, .14, 'multiply'] },
};
let TH = THEMES.winterNight;
function theme(name) { TH = typeof name === 'string' ? THEMES[name] : name; return TH; }

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
let LW = 6; // base line width (set per shot via shot.lw)
function ink(ctx, build, fill, lw = LW, stroke = PAL.ink) {
  ctx.beginPath(); build(ctx);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (lw) { ctx.lineWidth = lw; ctx.strokeStyle = stroke; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); }
}
function poly(pts, close = true) { return c => { c.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]); if (close) c.closePath(); }; }
// Smooth curve through points (Catmull-Rom → Bezier).
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
function rect(x, y, w, h) { return poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]]); }
// Lumpy blob (foliage, clouds, bushes): n lobes around (x,y).
function blob(x, y, rx, ry, n, seed, wob = .18, t = 0) {
  const pts = [];
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, r = 1 - wob + wob * 2 * hash(seed, i, 5) + Math.sin(t * 1.3 + i) * .015; pts.push([x + Math.cos(a) * rx * r, y + Math.sin(a) * ry * r]); }
  return smooth(pts, true, 1.25);
}

// ---------- camera ----------
// cam = {x, y, zoom}: world point (x,y) is placed at the frame centre. depth<1 = farther (moves less).
function withCam(ctx, cam, depth, fn) {
  ctx.save();
  const z = 1 + (cam.zoom - 1) * depth;
  ctx.translate(W / 2, H / 2); ctx.scale(z, z);
  ctx.translate(-(W / 2 + (cam.x - W / 2) * depth), -(H / 2 + (cam.y - H / 2) * depth));
  fn(); ctx.restore();
}

// ---------- sky / light ----------
function sky(ctx, top = TH.skyTop, bot = TH.skyBot, y0 = 0, y1 = H) {
  const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, top); g.addColorStop(1, bot);
  ctx.fillStyle = g; ctx.fillRect(-W, -H, W * 3, H * 3);
}
function glow(ctx, x, y, r, col = '255,196,120', a = .35) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(.35, `rgba(${col},${a * .4})`); g.addColorStop(1, `rgba(${col},0)`);
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore();
}
function sun(ctx, x, y, r, lw = LW) {
  glow(ctx, x, y, r * 5, '255,236,170', .45);
  ink(ctx, ellipse(x, y, r, r), TH.sun || '#ffe27a', lw * .7);
}
function cloud(ctx, x, y, s = 1, seed = 1, lw = LW) {
  const sh = c => { c.moveTo(x - 160 * s, y + 30 * s);
    c.bezierCurveTo(x - 200 * s, y - 20 * s, x - 120 * s, y - 60 * s, x - 80 * s, y - 40 * s);
    c.bezierCurveTo(x - 60 * s, y - 110 * s, x + 40 * s, y - 120 * s, x + 60 * s, y - 50 * s);
    c.bezierCurveTo(x + 120 * s, y - 80 * s, x + 200 * s, y - 20 * s, x + 170 * s, y + 30 * s); c.closePath(); };
  ink(ctx, sh, TH.cloud, lw * .7);
  ctx.save(); ctx.beginPath(); sh(ctx); ctx.clip();
  ink(ctx, rect(x - 220 * s, y + 6 * s, 440 * s, 40 * s), TH.cloudShade, 0); ctx.restore();
  ink(ctx, sh, null, lw * .7);
}

// ---------- panel apartment block ----------
// o: {x, y(top), w, h, floors, cols, seed, side (+/- depth px), far, lit (0..1 share of lit / bright windows),
//     t, onAt:[[col,floor,time]], balconies (0..1 share), dishes (0..1), laundry (bool), lw}
function panelBlock(ctx, o) {
  const { x, y, w, h, floors, cols, seed = 1, side = 0, far = false, lit = .35, t = 0 } = o;
  const lw = o.lw ?? (far ? LW * .55 : LW * .8);
  const face = far ? TH.blockFar : TH.block, shade = far ? TH.blockFarShade : TH.blockShade;
  if (side) {
    const sx = side > 0 ? x + w : x, d = side;
    ink(ctx, poly([[sx, y], [sx + d, y + Math.abs(d) * .25], [sx + d, y + h], [sx, y + h]]), shade, lw);
  }
  ink(ctx, rect(x, y, w, h), face, lw);
  ink(ctx, poly([[x - 4, y - h * .012], [x + w + 4, y - h * .012], [x + w + 4, y + h * .008], [x - 4, y + h * .008]]), shade, lw * .8);
  for (let i = 0; i < 3; i++) {
    const ax = x + w * (.15 + .3 * i + hash(seed, i, 7) * .12), ah = 18 + hash(seed, i, 8) * 26;
    stroke(ctx, c => { c.moveTo(ax, y - h * .012); c.lineTo(ax, y - h * .012 - ah); c.moveTo(ax - 10, y - h * .012 - ah * .8); c.lineTo(ax + 10, y - h * .012 - ah * .8); }, lw * .6);
  }
  const fh = h / floors, cw = w / cols;
  ctx.globalAlpha = .55;
  for (let f = 1; f < floors; f++) stroke(ctx, c => { c.moveTo(x, y + f * fh); c.lineTo(x + w, y + f * fh); }, lw * .45);
  ctx.globalAlpha = 1;
  const ww = cw * .46, wh = fh * .52;
  for (let f = 0; f < floors; f++) for (let cI = 0; cI < cols; cI++) {
    const wx = x + cI * cw + (cw - ww) / 2, wy = y + f * fh + fh * .22;
    let on = hash(seed, f * 97 + cI, 3) < lit;
    for (const [cc, ff, tt] of o.onAt || []) if (cc === cI && ff === f) on = t >= tt;
    const col = on ? (hash(seed, cI, f) < .3 ? TH.winOn2 : TH.winOn) : (far ? TH.winFarOff : TH.winOff);
    ink(ctx, rect(wx, wy, ww, wh), col, lw * .55);
    if (!far && ww > 22) {
      stroke(ctx, c => { c.moveTo(wx + ww * .55, wy); c.lineTo(wx + ww * .55, wy + wh); c.moveTo(wx + ww * .55, wy + wh * .38); c.lineTo(wx + ww, wy + wh * .38); }, lw * .4, TH.winFrame);
      if (TH.day) { ctx.globalAlpha = .55; stroke(ctx, c => { c.moveTo(wx + ww * .12, wy + wh * .55); c.lineTo(wx + ww * .4, wy + wh * .15); }, lw * .5, '#ffffff'); ctx.globalAlpha = 1; }
      if (on && hash(seed, f, cI + 40) < .4) { ctx.fillStyle = TH.day ? 'rgba(230,220,200,.55)' : 'rgba(120,60,30,.35)'; ctx.fillRect(wx + 2, wy + 2, ww * .3, wh - 4); }
    }
    // glazed balconies (protruding boxes under some windows), with laundry in summer
    if (!far && o.balconies && f > 0 && hash(seed, cI, f + 70) < o.balconies) {
      const bx = x + cI * cw + cw * .1, bw = cw * .8, by = wy + wh * .55, bh = fh * .42;
      ink(ctx, rect(bx, by, bw, bh), TH.balcony, lw * .55);
      for (let k = 1; k < 4; k++) stroke(ctx, c => { c.moveTo(bx + bw * k / 4, by); c.lineTo(bx + bw * k / 4, by + bh); }, lw * .3);
      if (o.laundry && hash(seed, cI, f + 90) < .45) {
        stroke(ctx, c => { c.moveTo(bx, by - 2); c.lineTo(bx + bw, by - 2); }, lw * .3);
        const cols3 = ['#e86f5a', '#f2f0e6', '#6c8fd1', '#f0c85a'];
        for (let k = 0; k < 3; k++) { const lx = bx + bw * (.12 + k * .3), sw = Math.sin(t * 2 + k + cI) * 2; ink(ctx, poly([[lx, by - 2], [lx + bw * .2, by - 2], [lx + bw * .2 + sw, by + bh * .55], [lx + sw, by + bh * .55]]), cols3[(k + f + cI) % 4], lw * .35); }
      }
    }
    if (!far && o.dishes && hash(seed, cI, f + 120) < o.dishes) {
      const dx = wx + ww + cw * .08, dy = wy + wh * .3, r = cw * .14;
      ink(ctx, ellipse(dx, dy, r * .8, r, -.4), '#e7e4dc', lw * .45);
      stroke(ctx, c => { c.moveTo(dx, dy); c.lineTo(dx - r * .9, dy - r * .2); }, lw * .35);
    }
  }
}

// ---------- street lamp (Soviet "hooked" lamp) ----------
function streetLamp(ctx, x, y, h, dir = 1, lw = LW) {
  const top = y - h, hx = x + dir * h * .16;
  ink(ctx, c => { c.moveTo(x - lw, y); c.lineTo(x - lw * .9, top + h * .1); c.quadraticCurveTo(x, top - h * .02, hx - dir * h * .03, top); c.lineTo(hx - dir * h * .03, top + lw * 1.7); c.quadraticCurveTo(x + lw * 1.6 * dir, top + h * .03, x + lw * .9, top + h * .12); c.lineTo(x + lw, y); c.closePath(); }, PAL.lamp, lw * .8);
  ink(ctx, c => { c.ellipse(hx, top + h * .012, h * .07, h * .028, 0, Math.PI, 0); c.closePath(); }, PAL.lamp, lw * .8);
  ink(ctx, ellipse(hx, top + h * .014, h * .055, h * .011), TH.lampOn ? PAL.lampLight : PAL.lampOff, lw * .5);
  return [hx, top + h * .02];
}

// ---------- ground ----------
// Bank / mound (snow drift in winter, grass mound in summer).
function bank(ctx, pts, lw = LW, fill = TH.bank) { ink(ctx, smooth(pts, true, .9), fill, lw); }
const snowBank = bank; // backwards-compatible name
function specks(ctx, x0, y0, x1, y1, n, seed, lw = LW) {
  for (let i = 0; i < n; i++) {
    const px = lerp(x0, x1, hash(seed, i, 1)), py = lerp(y0, y1, hash(seed, i, 2)), r = 3 + hash(seed, i, 3) * 4;
    if (TH.day) stroke(ctx, c => { c.moveTo(px - r, py); c.lineTo(px - r * .3, py - r * 2.2); c.moveTo(px, py); c.lineTo(px + r * .4, py - r * 2.6); c.moveTo(px + r, py); c.lineTo(px + r * 1.3, py - r * 1.8); }, lw * .35, TH.speck);
    else stroke(ctx, ellipse(px, py, r * .7, r), lw * .35, TH.speck);
  }
}
const snowSpecks = specks;
// Cracked asphalt strip between y0..y1 (perspective-free, flat cartoon road / courtyard path).
function asphalt(ctx, x0, y0, x1, y1, seed = 1, lw = LW) {
  ink(ctx, rect(x0, y0, x1 - x0, y1 - y0), TH.asphalt, lw * .7);
  ctx.globalAlpha = .6;
  for (let i = 0; i < 7; i++) {
    let px = lerp(x0, x1, hash(seed, i, 1)), py = lerp(y0, y1, hash(seed, i, 2));
    stroke(ctx, c => { c.moveTo(px, py); for (let k = 0; k < 4; k++) { px += (hash(seed, i, k + 3) - .5) * 70; py += (hash(seed, i, k + 9) - .3) * 30; c.lineTo(px, py); } }, lw * .35);
  }
  for (let i = 0; i < 3; i++) { const px = lerp(x0, x1, hash(seed, i, 20)), py = lerp(y0, y1, hash(seed, i, 21)); ink(ctx, blob(px, py, 50, 14, 8, seed + i), TH.asphaltShade, 0); }
  ctx.globalAlpha = 1;
}

// ---------- trees ----------
// kind 'poplar' (tall), 'round' (lime / maple), 'birch' (white trunk). Gentle sway with t.
function tree(ctx, x, y, h, o = {}) {
  const { kind = 'round', seed = 1, t = 0, lw = LW } = o;
  const F = TH.foliage || ['#3b4a45', '#4d5d57', '#2d3935']; // bare-ish dark crowns if a theme has none
  const sway = Math.sin(t * 1.2 + seed) * h * .006;
  const tw = h * (kind === 'poplar' ? .045 : .055);
  const trunkCol = kind === 'birch' ? PAL.birch : PAL.trunk;
  ink(ctx, poly([[x - tw, y], [x - tw * .6, y - h * .55], [x + tw * .6, y - h * .55], [x + tw, y]]), trunkCol, lw * .8);
  if (kind === 'birch') for (let i = 0; i < 6; i++) { const yy = y - h * (.05 + i * .08); ink(ctx, rect(x - tw * (.7 - i * .04) + (i % 2) * tw * .5, yy, tw * .6, h * .012), PAL.ink, 0); }
  const crowns = kind === 'poplar'
    ? [[0, -.62, .2, .36], [-.04, -.42, .16, .2], [.05, -.85, .13, .18]]
    : [[0, -.66, .36, .26], [-.22, -.52, .2, .16], [.22, -.5, .22, .17], [.05, -.85, .24, .17]];
  crowns.forEach(([cx, cy, rx, ry], i) => {
    const X = x + cx * h + sway * (1 + i * .3), Y = y + cy * h;
    ink(ctx, blob(X, Y, rx * h, ry * h, 11, seed * 10 + i, .14, t), F[0], lw * .8);
    ctx.save(); ctx.beginPath(); blob(X, Y, rx * h, ry * h, 11, seed * 10 + i, .14, t)(ctx); ctx.clip();
    ink(ctx, blob(X - rx * h * .25, Y - ry * h * .3, rx * h * .6, ry * h * .5, 9, seed * 10 + i + 50, .18, t), F[1], 0);
    ink(ctx, blob(X + rx * h * .45, Y + ry * h * .55, rx * h * .8, ry * h * .55, 9, seed * 10 + i + 80, .18, t), F[2], 0);
    ctx.restore();
    ink(ctx, blob(X, Y, rx * h, ry * h, 11, seed * 10 + i, .14, t), null, lw * .8);
    // leaf flicks
    for (let k = 0; k < 4; k++) { const a = hash(seed, i, k) * 6.28, r = .55 + hash(seed, k, i) * .3; stroke(ctx, c => { const px = X + Math.cos(a) * rx * h * r, py = Y + Math.sin(a) * ry * h * r; c.moveTo(px, py); c.quadraticCurveTo(px + 8, py - 10, px + 16, py - 4); }, lw * .4); }
  });
}
function bush(ctx, x, y, w, h, seed = 1, t = 0, lw = LW) {
  const F = TH.foliage || ['#3b4a45', '#4d5d57', '#2d3935'];
  ink(ctx, blob(x, y - h / 2, w / 2, h / 2, 12, seed, .15, t), F[0], lw * .8);
  ctx.save(); ctx.beginPath(); blob(x, y - h / 2, w / 2, h / 2, 12, seed, .15, t)(ctx); ctx.clip();
  ink(ctx, blob(x - w * .15, y - h * .7, w * .3, h * .25, 9, seed + 5), F[1], 0); ctx.restore();
}

// ---------- courtyard props ----------
function bench(ctx, x, y, w, lw = LW) {
  const legs = [x + w * .1, x + w * .9];
  for (const lx of legs) ink(ctx, rect(lx - 7, y - 90, 14, 90), PAL.metal, lw * .6);
  for (const k of [0, 1, 2]) ink(ctx, rect(x, y - 96 - k * 20, w, 14), k ? PAL.bench : PAL.benchShade, lw * .6); // seat slats
  for (const lx of legs) ink(ctx, rect(lx - 6, y - 230, 12, 140), PAL.metal, lw * .6);
  for (const k of [0, 1]) ink(ctx, rect(x - 6, y - 220 + k * 34, w + 12, 22), PAL.bench, lw * .6); // back slats
}
function busShelter(ctx, x, y, w, h, lw = LW, snow = !TH.day) {
  ink(ctx, rect(x, y - h, 14, h), PAL.shelter, lw * .7);
  ink(ctx, rect(x + w - 14, y - h, 14, h), PAL.shelter, lw * .7);
  ink(ctx, poly([[x + 14, y - h * .86], [x + w - 14, y - h * .86], [x + w - 14, y - h * .2], [x + 14, y - h * .2]]), PAL.shelterShade, lw * .6);
  const posters = [[.08, .78, .3, .28, PAL.poster, -.04], [.42, .74, .28, .34, PAL.poster2, .03], [.18, .44, .34, .2, PAL.poster, .05], [.62, .38, .26, .16, PAL.poster, -.06]];
  for (const [px, py, pw, ph, col, rot] of posters) {
    ctx.save(); ctx.translate(x + w * (px + pw / 2), y - h * py + h * ph / 2); ctx.rotate(rot);
    ink(ctx, poly([[-w * pw / 2, -h * ph / 2], [w * pw / 2, -h * ph / 2], [w * pw / 2 - 6, h * ph / 2], [-w * pw / 2 + 8, h * ph / 2 - 6]]), col, lw * .45);
    ctx.globalAlpha = .5; for (let i = 0; i < 3; i++) stroke(ctx, c => { c.moveTo(-w * pw * .35, -h * ph * .25 + i * h * ph * .2); c.lineTo(w * pw * (.1 + .2 * (i % 2)), -h * ph * .25 + i * h * ph * .2); }, lw * .5); ctx.globalAlpha = 1;
    ctx.restore();
  }
  ink(ctx, rect(x - 20, y - h - 6, w + 40, 20), PAL.shelter, lw * .7);
  if (snow) bank(ctx, [[x - 34, y - h - 2], [x - 20, y - h - 30], [x + w * .3, y - h - 44], [x + w * .7, y - h - 40], [x + w + 30, y - h - 26], [x + w + 40, y - h + 4], [x + w + 26, y - h + 26], [x + w + 12, y - h + 6], [x + w * .5, y - h + 2], [x - 10, y - h + 10]], lw * .8, '#e3e5f1');
}

// ---------- particles ----------
// Falling snow: hollow tear-shaped flakes with thin rims.
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
// One poplar-fluff tuft (summer "snow"): fuzzy white puff with a tiny seed dot.
function fluffTuft(ctx, x, y, r, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.fillStyle = 'rgba(255,255,250,.92)'; ctx.strokeStyle = 'rgba(80,80,90,.35)'; ctx.lineWidth = Math.max(1, r * .12);
  ctx.beginPath(); for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, r * .55, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#6b5a44'; ctx.beginPath(); ctx.arc(0, 0, r * .14, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
// Drifting poplar fluff: slow, meandering, sometimes rising.
function fluff(ctx, t, o = {}) {
  const { n = 40, seed = 5, speed = 40, size = 9, wind = 30, alpha = 1 } = o;
  ctx.save(); ctx.globalAlpha = alpha;
  for (let i = 0; i < n; i++) {
    const r = size * (.6 + hash(seed, i, 1) * .8), sp = speed * (.4 + hash(seed, i, 2));
    const py = ((hash(seed, i, 3) * (H + 200) + t * sp) % (H + 200)) - 100 + Math.sin(t * .9 + i * 1.7) * 40;
    const px = (((hash(seed, i, 4) * (W + 200) + t * wind + Math.sin(t * .7 + i) * 60) % (W + 200)) + W + 200) % (W + 200) - 100;
    fluffTuft(ctx, px, py, r, t * .5 + i);
  }
  ctx.restore();
}
// Breath cloud (cold weather): union of soft round lobes drifting from the mouth.
function breath(ctx, t, t0, x, y, o = {}) {
  const { dir = -1, dur = 1.5, size = 60, lw = LW * .7, rise = -.18 } = o;
  const k = (t - t0) / dur; if (k < 0 || k > 1) return;
  const g = E.out(k), a = k < .12 ? k / .12 : 1 - E.in(inv(.3, 1, k));
  const lobes = [];
  for (let i = 0; i < 6; i++) {
    const f = i / 5, d = g * size * 2.6 * (.25 + f * .9);
    const tail = clamp(1 - (k - .08) * 3 + f * 1.4); if (tail <= 0) continue;
    lobes.push([x + dir * d, y + size * rise * (d / size) + Math.sin(i * 2.1 + k * 4) * size * .08, size * (.18 + f * .32 + g * .4) * Math.min(1, tail)]);
  }
  const shape = c => { for (const [cx, cy, r] of lobes) { c.moveTo(cx + r * 1.2, cy); c.ellipse(cx, cy, r * 1.2, r * .85, 0, 0, Math.PI * 2); } };
  ctx.save(); ctx.globalAlpha = a * .5; ink(ctx, shape, null, lw * 1.2, '#99a0c7');
  ctx.globalAlpha = a * .9; ink(ctx, shape, PAL.breath, 0); ctx.restore();
}
// Heat shimmer lines (summer): wavy faint strokes rising over asphalt.
function heatLines(ctx, t, x0, x1, y, o = {}) {
  const { n = 6, seed = 2, alpha = .35, lw = LW * .5 } = o;
  ctx.save(); ctx.globalAlpha = alpha;
  for (let i = 0; i < n; i++) {
    const x = lerp(x0, x1, hash(seed, i, 1)), k = (t * .6 + hash(seed, i, 2)) % 1;
    ctx.globalAlpha = alpha * Math.sin(k * Math.PI);
    stroke(ctx, c => { c.moveTo(x, y - k * 120); for (let j = 1; j <= 6; j++) c.lineTo(x + Math.sin(j * 1.6 + t * 4) * 6, y - k * 120 - j * 14); }, lw, '#ffffff');
  }
  ctx.restore();
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
function vignette(ctx, a = .45, col = '10,12,30') {
  const g = ctx.createRadialGradient(W / 2, H * .48, H * .28, W / 2, H * .5, H * .78);
  g.addColorStop(0, `rgba(${col},0)`); g.addColorStop(1, `rgba(${col},${a})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
// Theme colour grade (cold blue at night, warm in summer).
function tint(ctx) { const [r, g, b, a, mode] = TH.tint; ctx.save(); ctx.globalCompositeOperation = mode; ctx.globalAlpha = a; ctx.fillStyle = `rgb(${r},${g},${b})`; ctx.fillRect(0, 0, W, H); ctx.restore(); }
const coldTint = tint;
function fade(ctx, a, col = '8,9,18') { if (a <= 0) return; ctx.fillStyle = `rgba(${col},${clamp(a)})`; ctx.fillRect(0, 0, W, H); }
