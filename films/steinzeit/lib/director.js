// DIRECTOR: scenes on the absolute voice-over timeline, soft cross-dissolves between scenes (xf seconds), hard cuts (xf 0).
// scene(a, f, xf): f(t) -> toon-shorts frame (t = absolute seconds). Scenes may be evaluated slightly before `a` during a dissolve.
const SC = [];
function scene(a, f, xf = .45, name = '') { SC.push({ a, f, xf, name }); }
const S = i => TM_S[i][0], SE = i => TM_S[i][1];
const FILM_END = VO_END + 1.25;
const _buf = document.createElement('canvas'); _buf.width = 1920; _buf.height = 1080;
let _engineRender = null;
function drawScene(sc, t) {
  _film.shots = [{ name: sc.name, a: 0, b: 1e6, f: () => sc.f(t) }]; _film.duration = 1e6; _film.fadeIn = 0; _film.fadeOut = 0;
  _engineRender(t);
}
function renderDirector(t) {
  SC.sort((p, q) => p.a - q.a);
  let i = 0; for (let k = 0; k < SC.length; k++) if (SC[k].a <= t) i = k;
  const cur = SC[i], nxt = SC[i + 1], ctx = document.getElementById('film').getContext('2d');
  const k = nxt && nxt.xf > 0 && t > nxt.a - nxt.xf ? ease(clamp((t - (nxt.a - nxt.xf)) / nxt.xf)) : 0;
  if (k > 0) {
    drawScene(cur, t); const b = _buf.getContext('2d'); b.setTransform(1, 0, 0, 1, 0, 0); b.globalAlpha = 1; b.drawImage(ctx.canvas, 0, 0);
    drawScene(nxt, t); ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1 - k; ctx.drawImage(_buf, 0, 0); ctx.restore();
  } else drawScene(cur, t);
  // final fade to black after the last words
  const fo = seg(t, FILM_END - .6, FILM_END); if (fo > 0) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = `rgba(0,0,0,${fo})`; ctx.fillRect(0, 0, W, H); }
}
function startDirector() {
  defineFilm({ shots: [{ name: 'all', dur: FILM_END, f: () => ({}) }] });
  _engineRender = window.__film.renderAt;
  window.__film = { FPS, DURATION: FILM_END, renderAt: renderDirector, scenes: SC.slice().sort((p, q) => p.a - q.a).map(s => ({ name: s.name, start: s.a, end: s.a + 1 })), sheet: () => {} };
}

// ---------- shared helpers ----------
const K = .25, INK = 1.8;
// Noah's outfit by time: classic until the old woman gives him the cape, full era kit after the clothing scene, classic again at home
const ERA_CAPE = 140.2, ERA_FULL = 172.5, HOME = 758.74;
const eraAt = t => t >= HOME ? 0 : t >= ERA_FULL ? 2 : t >= ERA_CAPE ? 1 : 0;
function N(c, t, p) { drawNoahE(c, Object.assign({ k: K, ink: INK, era: eraAt(t), cut: t > 272.6 && t < HOME + 100 }, p)); }
function NS(c, t, p) { drawNoahSideE(c, Object.assign({ k: K, ink: INK, era: eraAt(t) }, p)); }
// Noah's head centre (world) for a front-view Noah at (x, y) — standing or seated
function noahHeadAt(x, y, sit, seatH = 300) { return [x, y + ((sit ? (-seatH - (NOAH.HEM + 40) - 60) : 0) + NOAH.HEAD.y) * K]; }
function polish(c, t, x, y, e, o = {}) { noahHeadPolish(c, x, y, K, e, o.tilt || 0, Object.assign({ shadow: .3, glint: 0 }, o)); }
function polishLit(c, cam, t, x, y, e, o = {}) { withWorld(c, cam, c => noahHeadPolish(c, x, y, K, e, o.tilt || 0, Object.assign({ shadow: 0, rim: .45, rimCol: '255,170,90', glintCol: '255,236,210' }, o))); }
const blinkAt = (t, seed = 0) => { const p = (t + seed * 1.7) % 3.7; return p < .13 ? Math.sin(p / .13 * Math.PI) : 0; };
const EX = (t, e = {}) => Object.assign({ eyes: 'open', lid: Math.max(e.lid || 0, blinkAt(t, e.seed || 0) * .95) }, e);
function breathVapor(c, x, y, t, k = 1, dir = 1) { for (let i = 0; i < 3; i++) { const ph = (t * .55 + i / 3) % 1, a = .38 * k * Math.sin(ph * Math.PI); const px = x + dir * ph * 70, py = y - ph * 30, r = 10 + ph * 34; const g = c.createRadialGradient(px, py, 0, px, py, r); g.addColorStop(0, `rgba(240,246,252,${a})`); g.addColorStop(1, 'rgba(240,246,252,0)'); c.fillStyle = g; c.fillRect(px - r, py - r, r * 2, r * 2); } }
// outdoor grade per time of day
function outGrade(c, tod) { const G = { morning: ['230,240,255', .2, '40,60,110', .22, .8, .1], day: ['255,236,190', .22, '40,50,90', .16, .8, .05], dusk: ['255,160,90', .34, '60,30,80', .3, .85, .45], night: ['120,150,220', .12, '5,10,30', .4, .5, .2] }[tod];
  grade(c, { warm: G[0], warmA: G[1], cool: G[2], coolA: G[3], sx: G[4], sy: G[5] }); }
function snowfall(c, t, n = 60, a = .8, wind = 1) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); for (let i = 0; i < n; i++) { const ph = (t * (.08 + rnd(i) * .06) + rnd(i + 7)) % 1, x = ((rnd(i + 3) * W + t * 120 * wind + Math.sin(t + i) * 30) % (W + 100)) - 50, y = ph * (H + 40) - 20, r = 1.5 + rnd(i + 9) * 3.5; circle(c, x, y, r); c.fillStyle = `rgba(255,255,255,${a * (.5 + rnd(i + 2) * .5)})`; c.fill(); } c.restore(); }
// cave shot base: set + lights in screen; extras: { mouth, fires: [{x, k}], ambient, outside, after: fn(c) (after lighting), noLight }
function caveFrame(t, cam, o = {}) {
  return {
    set: caveSet2, setOpts: { mouthX: o.mouth ?? 700, outside: o.outside || 'dawn' }, cam, blur: 0, vignette: 0,
    behind: o.behind || [], front: o.front || [], fx: o.fx || [],
    screen: [c => {
      if (!o.noLight) caveLights(c, cam, t, { fires: (o.fires || []).map(f => ({ x: f.x, y: f.y ?? -80, k: f.k ?? 1, r: f.r })), mouth: o.mouth ?? 700, ambient: o.ambient || '78,68,78', mouthA: o.mouthA, mouthCol: o.mouthCol });
      for (const f of o.after || []) f(c);
      for (const f of o.fires || []) { if ((f.k ?? 1) > .05) { const [fx, fy] = w2s(cam, f.x, -100); sparks(c, fx, fy, t, { n: 10, h: 380 * cam.z, size: 2.5 * Math.min(2, cam.z), w: 60 * cam.z, a: f.k ?? 1 }); } }
      if (o.snowIn) snowfall(c, t, 30, .5);
    }, c => finish(c, t, { vig: o.vig ?? .5 })],
  };
}
function outFrame(t, cam, o = {}) {
  const tod = o.tod || 'day';
  return {
    set: o.set || steppeSet, setOpts: Object.assign({ tod }, o.setOpts || {}), cam, blur: 0, vignette: 0,
    behind: o.behind || [], front: o.front || [], fx: o.fx || [],
    screen: [c => {
      if (o.grass !== false) steppeFront(c, cam, t, { tod });
      outGrade(c, tod);
      for (const f of o.after || []) f(c);
      if (o.snow) snowfall(c, t, o.snow, .7, o.wind ?? 1);
    }, c => finish(c, t, { vig: o.vig ?? .45 })],
  };
}
// a shot list inside one scene: shots([[t0, fn], [t1, fn] ...], t) picks the last whose t0 <= t
function shots(list, t) { let f = list[0][1], a = list[0][0]; for (const [t0, fn] of list) if (t >= t0) { f = fn; a = t0; } return f(t - a, t); }
