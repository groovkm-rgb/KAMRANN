// NOIR helpers: colour grade + film grain, neon signs, rainy night street (on top of city.js 'night'),
// dark desk with a lamp pool and a dossier folder (top-down), expression presets, blinks.
const EX = {
  alert:     { lid: .15, look: .8, mouth: 'flat' },
  mask:      { mouth: 'soft', look: 0 },
  fear:      { lid: 0, browUp: 1, mouth: 'o', open: .4 },
  tired:     { lid: .5, mouth: 'flat' },
  fakeSmile: { mouth: 'smile', look: .45, lid: .25 },
  warm:      { mouth: 'smile', lid: .72 },
  sleepless: { bags: 1, lid: .4, mouth: 'flat' },
};
// eyes closed for ~0.13 s every `every` seconds (jittered); tense scenes pass a long `every`
function blinkAt(t, every = 4, seed = 0) { const per = every * (.8 + .4 * rnd(Math.floor(t / every) + seed)); const ph = (t + rnd(seed) * every) % per; return ph < .13; }
function withBlink(e, t, every, seed) { return blinkAt(t, every, seed) ? Object.assign({}, e, { eyes: 'closed' }) : e; }
// ---- grade + grain (screen space, call last in `screen`) ----
let _grain = null;
function noirGrade(c, t, o = {}) {
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
  // cool shadows, crushed blacks
  c.globalCompositeOperation = 'multiply'; c.fillStyle = o.mult || 'rgba(150,170,215,.32)'; c.fillRect(0, 0, W, H);
  c.globalCompositeOperation = 'soft-light'; c.fillStyle = o.soft || 'rgba(20,30,60,.35)'; c.fillRect(0, 0, W, H);
  if (o.warm) { const g = c.createRadialGradient(W * (o.wx ?? .5), H * (o.wy ?? .5), 0, W * (o.wx ?? .5), H * (o.wy ?? .5), W * .7); g.addColorStop(0, `rgba(255,190,120,${o.warm})`); g.addColorStop(1, 'rgba(255,190,120,0)'); c.globalCompositeOperation = 'soft-light'; c.fillStyle = g; c.fillRect(0, 0, W, H); }
  c.globalCompositeOperation = 'source-over';
  const vg = c.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, H * .95); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, `rgba(0,0,8,${o.vig ?? .55})`); c.fillStyle = vg; c.fillRect(0, 0, W, H);
  // grain
  if (!_grain) { _grain = []; for (let k = 0; k < 4; k++) { const cv = document.createElement('canvas'); cv.width = cv.height = 256; const g = cv.getContext('2d'); const id = g.createImageData(256, 256); for (let i = 0; i < id.data.length; i += 4) { const v = rnd(i * .25 + k * 99991) * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 22; } g.putImageData(id, 0, 0); _grain.push(c.createPattern(cv, 'repeat')); } }
  c.globalCompositeOperation = 'overlay'; c.fillStyle = _grain[Math.floor(t * 24) % 4]; c.globalAlpha = o.grain ?? .8; c.fillRect(0, 0, W, H);
  c.restore();
}
// ---- neon sign (world) ----
function neonSign(c, x, y, text, col, t, o = {}) {
  const size = o.size || 70, flick = o.flicker ? (rnd(Math.floor(t * 12) + x) > .93 ? .35 : 1) : 1;
  c.save(); c.font = hudFont(size); c.textAlign = 'center'; c.textBaseline = 'middle';
  const w = c.measureText(text).width + size * .8;
  c.fillStyle = '#12131a'; rrect(c, x - w / 2, y - size * .75, w, size * 1.5, 10); c.fill(); c.lineWidth = 4; c.strokeStyle = '#2a2c36'; c.stroke();
  bloom(c, x, y, w * .9, col, .45 * flick);
  c.lineWidth = size * .12; c.strokeStyle = `rgba(${col},${.55 * flick})`; c.strokeText(text, x, y);
  c.fillStyle = `rgba(${col},${flick})`; c.fillText(text, x, y); c.lineWidth = 2; c.strokeStyle = `rgba(255,250,240,${.8 * flick})`; c.strokeText(text, x, y);
  c.restore();
  return w;
}
// ---- rainy night street: city 'night' + wet ground, puddles, neon, lamp cones ----
function rainStreet(c, cam, t, o = {}) {
  const r = city(c, cam, t, { tod: 'night', seed: o.seed || 3 });
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'multiply'; c.fillStyle = 'rgb(62,70,112)'; c.fillRect(0, 0, W, H); c.fillStyle = 'rgba(40,50,90,.5)'; c.fillRect(0, 0, W, H); c.restore();
  layer(c, cam, 1, c => {
    // wet sheen over sidewalk + road, light streaks under lamps and windows
    c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = 'rgba(60,70,110,.55)'; c.fillRect(-6000, -260, 12000, 3000); c.restore();
    neonSign(c, 820, -700, 'Hotel', '255,80,90', t, { size: 74, flicker: true }); neonSign(c, -330, -640, 'Café', '255,190,90', t, { size: 58 });
    neonSign(c, 1700, -640, 'Apotheke', '90,230,140', t, { size: 50 }); neonSign(c, -1400, -640, 'Schuhe', '120,170,255', t, { size: 54 });
    for (const [x, col] of [[820, '255,80,90'], [-330, '255,190,90'], [1700, '90,230,140'], [-1400, '120,170,255']]) wetReflect(c, x, 80, 160, col, .35, t, 600);
    for (const lx of o.lamps || [-900, 260, 1400]) { streetLamp(c, lx, true); wetReflect(c, lx + 46, 20, 120, '255,220,150', .5, t, 700); }
    for (let i = 0; i < 6; i++) puddle(c, -1600 + i * 620 + rnd(i) * 200, 160 + rnd(i + 4) * 120, 160 + rnd(i + 8) * 120, 26, t, { glow: '255,210,150', gx: 30 });
    // tram rails in the road
    for (const y of [430, 470, 610, 650]) { line(c, [-6000, y, 6000, y], 6, 'rgba(150,160,190,.5)'); }
  });
  return r;
}
// ---- dark desk, top-down, single lamp ----
function deskTop(c, cam, t, o = {}) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#0d0b0a'; c.fillRect(0, 0, W, H);
  layer(c, cam, 1, c => {
    for (let i = -30; i < 30; i++) { c.fillStyle = i % 2 ? '#2a1d16' : '#2f2119'; c.fillRect(-5000, i * 120, 10000, 120); for (let k = 0; k < 40; k++) { c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(-5000 + rnd(i * 50 + k) * 10000, i * 120 + rnd(i * 50 + k + 7) * 120, 300 + rnd(k) * 400, 2); } }
    // objects around the folder: cold coffee, pen, glasses, ashtray-free (no brand), a notepad
    circle(c, 1250, -420, 120); fs(c, '#e8e2d6', 4); circle(c, 1250, -420, 92); fs(c, '#3a2418', 2); c.beginPath(); c.ellipse(1240, -430, 60, 20, .3, 0, Math.PI * 2); c.fillStyle = 'rgba(255,255,255,.08)'; c.fill(); c.beginPath(); c.arc(1380, -420, 40, -1.2, 1.2); c.lineWidth = 14; c.strokeStyle = OUT; c.stroke(); c.lineWidth = 8; c.strokeStyle = '#e8e2d6'; c.stroke();
    c.save(); c.translate(-1250, 420); c.rotate(.5); c.beginPath(); rrect(c, -14, -260, 28, 520, 10); fs(c, '#1a1a1e', 3); c.fillStyle = '#b8a060'; c.fillRect(-14, -260, 28, 30); c.restore();
    c.save(); c.translate(-1150, -380); c.rotate(-.3); c.fillStyle = '#d8d2c2'; c.fillRect(-180, -240, 360, 480); for (let i = 0; i < 12; i++) line(c, [-160, -200 + i * 38, 160, -200 + i * 38], 2, 'rgba(60,80,140,.35)'); c.restore();
    c.save(); c.translate(1150, 450); for (const s of [-1, 1]) { c.beginPath(); c.ellipse(s * 90, 0, 70, 52, 0, 0, Math.PI * 2); c.lineWidth = 10; c.strokeStyle = '#1a1a1e'; c.stroke(); c.fillStyle = 'rgba(160,190,230,.15)'; c.fill(); } line(c, [-20, -8, 20, -8], 10, '#1a1a1e'); c.restore();
  });
  return { base: '#0d0b0a' };
}
function lampPool(c, cam, x, y, r, a = .55) {
  layer(c, cam, 1, c => { c.save(); c.globalCompositeOperation = 'screen'; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(255,200,130,${a})`); g.addColorStop(.6, `rgba(255,170,90,${a * .3})`); g.addColorStop(1, 'rgba(255,170,90,0)'); c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); c.restore(); });
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'multiply'; const p = [W / 2 + (x - cam.x) * cam.z, H / 2 + (y - cam.y) * cam.z], g = c.createRadialGradient(p[0], p[1], r * cam.z * .4, p[0], p[1], r * cam.z * 1.3); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(20,20,30,1)'); c.fillStyle = g; c.fillRect(0, 0, W, H); c.restore();
}
// folder (closed / opening) in world coords, centred at x,y; size w×h; open 0..1 flips the cover to the left
function dossierFolder(c, x, y, w, h, open = 0, o = {}) {
  c.save(); c.translate(x, y);
  c.save(); c.shadowColor = 'rgba(0,0,0,.6)'; c.shadowBlur = 40 * (o.lift || 1); c.shadowOffsetY = 18 * (o.lift || 1); c.fillStyle = '#141a28'; c.fillRect(-w / 2 - 14, -h / 2 - 10, w + 28, h + 20); c.restore();
  if (o.page) { c.save(); c.translate(-w / 2, -h / 2); dosPaper(c, 0, 0, w, h, { shadow: false }); o.page(c, w, h); c.restore(); }
  if (open < 1) {
    const sx = Math.cos(open * Math.PI); // 1 → -1
    c.save(); c.translate(-w / 2 - 14, 0); c.scale(sx, 1); c.translate(w / 2 + 14, 0);
    c.fillStyle = sx > 0 ? '#1d2538' : '#151b2a'; c.fillRect(-w / 2 - 14, -h / 2 - 10, w + 28, h + 20); c.strokeStyle = '#0a0d16'; c.lineWidth = 4; c.strokeRect(-w / 2 - 14, -h / 2 - 10, w + 28, h + 20);
    c.save(); c.beginPath(); c.rect(-w / 2 - 14, -h / 2 - 10, w + 28, h + 20); c.clip(); c.fillStyle = dosTexture(c); c.fillRect(-w, -h, w * 2, h * 2); c.restore();
    if (sx > 0) { c.fillStyle = '#e8dfc6'; c.fillRect(-w * .3, -h * .3, w * .6, h * .18); dosType(c, 'AKTE · NR. ████', -w * .27, -h * .3 + h * .12, h * .07, 1, { col: '#1a2234', caret: false }); dosStamp(c, 'VERTRAULICH', w * .1, h * .18, h * .1, -.14, 1); }
    c.restore();
  }
  c.restore();
}
