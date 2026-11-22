// Shot list helpers. Every shot: SH(t0, name, { ang, tr, sfx, amb, mus }, draw(c, lt, T, t)). Duration = next t0 − t0.
const SHOTS = [];
function SH(t0, name, o, draw) { SHOTS.push(Object.assign({ t0, name, draw }, o)); }
const EX = {
  focus: { lid: .25, mouth: 'flat' }, alert: { lid: .1, mouth: 'flat' }, bow: { lid: .6, down: 1, mouth: 'flat' }, tense: { lid: .15, mouth: 'flat' },
  shock: { lid: 0, browUp: 1, mouth: 'o' }, sad: { lid: .5, mouth: 'flat', down: 1 }, calm: { lid: .55, mouth: 'soft' }, shame: { lid: .35, look: -.9, mouth: 'flat', down: 1 },
  smile: { lid: .3, mouth: 'smile' }, closed: { eyes: 'closed', mouth: 'soft' }, bored: { lid: .55, look: .6, mouth: 'flat' }, wonder: { lid: .05, browUp: .6, mouth: 'flat' },
};
// expression with natural blinking (every 3–5 s; slower when calm)
function ex(name, lt, seed = 1, extra = {}) { const e = Object.assign({}, EX[name] || EX.focus, extra); if (e.eyes === 'closed') return e; return withBlink(e, lt, seed, name === 'calm' || name === 'tense' ? 6.5 : 4); }
function NF(c, x, y, k, o = {}) { drawSam(c, Object.assign({ x, y, k, ink: 1.6, outfit: 'samurai' }, o)); }
function NS(c, x, y, k, o = {}) { drawSamSide(c, Object.assign({ x, y, k, ink: 1.6, outfit: 'samurai' }, o)); }
function PF(c, who, x, y, k, o = {}) { drawPerson(c, Object.assign({ who, x, y, k, ink: 1.6 }, o)); }
function PS(c, who, x, y, k, o = {}) { drawPersonSide(c, Object.assign({ who, x, y, k, ink: 1.6 }, o)); }
// brush note on paper (screen), visible t0..t0+dur with a fade
function NOTE(c, lt, s, x, y, t0, o = {}) { const d = o.dur ?? 4.5, a = clamp((lt - t0) / .2) * clamp((t0 + d - lt) / .35); if (a <= 0) return; brushNote(c, s, x, y, o.size || 60, seg(lt, t0, t0 + .6), { paper: true, under: o.under !== false, align: o.align || 'center', alpha: a, col: o.col, seed: o.seed || 2 }); }
// hand-drawn marker (circle / arrow / strike) over a scene
function MARK(c, lt, kind, a, t0, o = {}) { const d = o.dur ?? 4.5, al = clamp((t0 + d - lt) / .35); if (lt < t0 || al <= 0) return; c.save(); c.globalAlpha = al; const k = seg(lt, t0, t0 + .5), col = o.col || UI.red;
  if (kind === 'circle') brushEllipse(c, a[0], a[1], a[2], a[3], k, { w: o.w || 10, col });
  if (kind === 'arrow') brushArrow(c, a[0], a[1], a[2], a[3], k, { w: o.w || 10, col, bend: o.bend || .2 });
  if (kind === 'under') brushUnderline(c, a[0], a[1], a[2], k, { w: o.w || 10, col });
  if (kind === 'strike') brushPath(c, [a[0], a[1], a[2], a[3]], k, { w: o.w || 16, col });
  c.restore(); }
function cam(x, y, z) { return { x, y, z }; }
function push(lt, T, z0, z1) { return lerp(z0, z1, ease(clamp(lt / Math.max(T, .1)))); }
function grade2(c, warm = .2, cool = .15, sx = .2, sy = 0) { grade(c, { sx, sy, warmA: warm, coolA: cool }); }
function letterDark(c, a) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = `rgba(0,0,0,${a})`; c.fillRect(0, 0, W, H); c.restore(); }
function freeze(lt, at) { return lt > at ? at : lt; } // freeze-frame helper
function splitV(c, x0, x1, fnA, fnB) { c.save(); c.beginPath(); c.moveTo(0, 0); c.lineTo(x0, 0); c.lineTo(x1, H); c.lineTo(0, H); c.closePath(); c.clip(); fnA(c); c.restore(); c.save(); c.beginPath(); c.moveTo(x0, 0); c.lineTo(W, 0); c.lineTo(W, H); c.lineTo(x1, H); c.closePath(); c.clip(); fnB(c); c.restore(); stroke(c, [x0, -10, x1, H + 10], 14, '#141210'); }
// shadow over the lord's face (daimyō is always half in shadow)
function lordShade(c, x, y, r) { c.save(); const g = c.createLinearGradient(x - r, y - r, x + r * .4, y + r); g.addColorStop(0, 'rgba(10,8,12,.82)'); g.addColorStop(1, 'rgba(10,8,12,.35)'); c.fillStyle = g; c.beginPath(); c.arc(x, y, r * 1.05, 0, Math.PI * 2); c.fill(); c.restore(); }
// fire, smoke, embers (world/screen)
function flames(c, x, y, w, h, lt, seed = 0) {
  c.save(); c.globalCompositeOperation = 'screen'; bloom(c, x, y - h * .4, Math.max(w, h) * 1.4, '255,120,40', .55);
  for (let i = 0; i < 9; i++) { const fx = x + (rnd(seed + i) - .5) * w, fh = h * (.5 + rnd(seed + i + 3) * .6) * (1 + .25 * Math.sin(lt * 9 + i * 2)), fw = w * .22;
    c.beginPath(); c.moveTo(fx - fw, y); c.quadraticCurveTo(fx - fw * .6 + Math.sin(lt * 7 + i) * fw * .4, y - fh * .6, fx + Math.sin(lt * 5 + i) * fw * .5, y - fh); c.quadraticCurveTo(fx + fw * .6, y - fh * .5, fx + fw, y); c.closePath();
    c.fillStyle = i % 3 ? 'rgba(255,150,50,.75)' : 'rgba(255,220,120,.8)'; c.fill(); }
  c.restore();
}
function smokeCloud(c, x0, x1, y, lt, o = {}) { const n = o.n || 12, col = o.col || '60,50,50'; for (let i = 0; i < n; i++) { const x = x0 + ((rnd(i + 7) * (x1 - x0) + lt * (o.speed || 30)) % (x1 - x0)), yy = y - ((lt * (o.rise || 40) + rnd(i) * 400) % 500), r = (o.r || 200) * (.6 + rnd(i + 2) * .7);
  const g = c.createRadialGradient(x, yy, 0, x, yy, r); g.addColorStop(0, rgba(col, o.a || .45)); g.addColorStop(1, rgba(col, 0)); c.fillStyle = g; c.fillRect(x - r, yy - r, r * 2, r * 2); } }
function embers(c, lt, n = 40, col = '255,170,80') { for (let i = 0; i < n; i++) { const ph = (lt * (.2 + rnd(i) * .3) + rnd(i + 1)) % 1, x = rnd(i + 2) * W + Math.sin(lt * 2 + i) * 30, y = H - ph * H * 1.1; circ(c, x, y, 2 + rnd(i + 3) * 3); c.fillStyle = rgba(col, .8 * (1 - ph)); c.fill(); } }
function rainFx(c, lt, n = 260, a = .45, slant = -8) { for (let i = 0; i < n; i++) { const x = (rnd(i) * 2200 + lt * 300) % 2100 - 100, y = (rnd(i + 5) * 1200 + lt * 1500 * (.8 + rnd(i) * .4)) % 1200 - 60; stroke(c, [x, y, x + slant, y + 42], 2, `rgba(210,220,235,${a})`); } }
function snowFx(c, lt, n = 120) { for (let i = 0; i < n; i++) { const x = (rnd(i) * 2100 + Math.sin(lt + i) * 40) % 2000, y = (rnd(i + 3) * 1100 + lt * 90 * (.6 + rnd(i))) % 1100; circ(c, x, y, 2 + rnd(i) * 3); c.fillStyle = 'rgba(255,255,255,.85)'; c.fill(); } }
function breath(c, x, y, lt, s = 1) { for (let i = 0; i < 4; i++) { const ph = (lt * .8 + i / 4) % 1; circ(c, x + ph * 80 * s, y - ph * 30, (10 + ph * 40) * Math.abs(s)); c.fillStyle = `rgba(255,255,255,${.35 * Math.sin(ph * Math.PI)})`; c.fill(); } }
// close-up with shoulders (no floating heads): (x, y) = head centre
function HEADCU(c, x, y, k, e, tilt = 0, hair, o = {}) { NF(c, x, y + 1240 * k, k, Object.assign({ expr: e, tilt, hair, swords: false }, o)); }
