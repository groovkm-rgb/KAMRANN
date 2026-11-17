// DIRECTOR: scenes on the absolute voice-over timeline, soft cross-dissolves between scenes (xf seconds), hard cuts (xf 0).
// scene(a, f, xf): f(t) -> toon-shorts frame (t = absolute seconds). Scenes may be evaluated slightly before `a` during a dissolve.
const SC = [];
// style: 'dissolve' | 'leak' (warm light leak) | 'whip' (fast pan) | 'dip' (through black) | 'flash'
function scene(a, f, xf = .45, name = '', style = 'dissolve') { SC.push({ a, f, xf, name, style }); }
const S = i => TM_S[i][0], SE = i => TM_S[i][1];
const FILM_END = VO_END + 1.25;
const _bufs = [0, 1, 2, 3].map(() => { const b = document.createElement('canvas'); b.width = 1920; b.height = 1080; return b; });
let _engineRender = null, _cur = { a: 0, b: 1 };
function applyDrift(fr, t) {
  // slow "Ken Burns" push-in + gentle handheld sway on every world shot, so nothing ever sits completely still
  if (!fr || !fr.cam || fr.set === 'blank' || fr.noDrift) return fr;
  const k = clamp((t - _cur.a) / Math.max(1, _cur.b - _cur.a)), c = fr.cam;
  fr.cam = Object.assign({}, c, { z: c.z * (1 + .045 * ease(k)), x: c.x + Math.sin(t * .21 + _cur.a) * 6 / c.z, y: c.y + Math.sin(t * .17 + 1 + _cur.a) * 4 / c.z, rot: (c.rot || 0) + Math.sin(t * .13 + _cur.a) * .004 });
  return fr;
}
function renderFrameObj(fr, t, depth = 0) {
  const ctx = document.getElementById('film').getContext('2d');
  if (fr && fr.__blend) {
    const [A, B, k, style] = fr.__blend, buf = _bufs[depth], bc = buf.getContext('2d');
    renderFrameObj(A, t, depth + 1); bc.setTransform(1, 0, 0, 1, 0, 0); bc.globalAlpha = 1; bc.drawImage(ctx.canvas, 0, 0);
    renderFrameObj(B, t, depth + 1); composite(ctx, buf, k, style, depth); return;
  }
  const f2 = applyDrift(fr, t);
  _film.shots = [{ name: 'x', a: 0, b: 1e6, f: () => f2 }]; _film.duration = 1e6; _film.fadeIn = 0; _film.fadeOut = 0;
  _engineRender(t);
}
function composite(ctx, A, k, style, depth) {
  // canvas holds B (incoming), A is the outgoing image
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (style === 'whip') {
    const tmp = _bufs[(depth + 2) % 4], tc = tmp.getContext('2d'); tc.setTransform(1, 0, 0, 1, 0, 0); tc.globalAlpha = 1; tc.drawImage(ctx.canvas, 0, 0);
    const e = ease(k); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 6; i++) { const o = i * 26 * Math.sin(k * Math.PI); ctx.globalAlpha = i ? .16 : 1; ctx.drawImage(A, -e * W - o, 0); ctx.drawImage(tmp, (1 - e) * W - o, 0); }
  } else if (style === 'dip') {
    if (k < .5) { ctx.drawImage(A, 0, 0); ctx.fillStyle = `rgba(0,0,0,${k * 2})`; ctx.fillRect(0, 0, W, H); } else { ctx.fillStyle = `rgba(0,0,0,${(1 - k) * 2})`; ctx.fillRect(0, 0, W, H); }
  } else {
    ctx.globalAlpha = 1 - k; ctx.drawImage(A, 0, 0); ctx.globalAlpha = 1;
    const b = Math.sin(k * Math.PI);
    if (style === 'leak' && b > 0) { ctx.globalCompositeOperation = 'screen'; let g = ctx.createRadialGradient(W * (.15 + .7 * k), H * .3, 0, W * (.15 + .7 * k), H * .3, W * .7); g.addColorStop(0, `rgba(255,190,110,${.55 * b})`); g.addColorStop(.5, `rgba(255,120,60,${.25 * b})`); g.addColorStop(1, 'rgba(255,120,60,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      g = ctx.createLinearGradient(0, 0, W, 0); g.addColorStop(0, `rgba(255,230,180,${.2 * b})`); g.addColorStop(1, 'rgba(255,230,180,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
    if (style === 'flash' && b > 0) { ctx.fillStyle = `rgba(255,248,235,${.8 * b})`; ctx.fillRect(0, 0, W, H); }
  }
  ctx.restore();
}
function renderDirector(t) {
  SC.sort((p, q) => p.a - q.a);
  let i = 0; for (let k = 0; k < SC.length; k++) if (SC[k].a <= t) i = k;
  const cur = SC[i], nxt = SC[i + 1], ctx = document.getElementById('film').getContext('2d');
  const k = nxt && nxt.xf > 0 && t > nxt.a - nxt.xf ? clamp((t - (nxt.a - nxt.xf)) / nxt.xf) : 0;
  _cur = { a: cur.a, b: nxt ? nxt.a : FILM_END };
  if (k > 0) {
    const A = cur.f(t); _cur = { a: nxt.a, b: SC[i + 2] ? SC[i + 2].a : FILM_END }; const B = nxt.f(t);
    renderFrameObj({ __blend: [A, B, k, nxt.style] }, t);
  } else renderFrameObj(cur.f(t), t);
  const fo = seg(t, FILM_END - .6, FILM_END); if (fo > 0) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = `rgba(0,0,0,${fo})`; ctx.fillRect(0, 0, W, H); }
}
function startDirector() {
  defineFilm({ shots: [{ name: 'all', dur: FILM_END, f: () => ({}) }] });
  _engineRender = window.__film.renderAt;
  window.__film = { FPS, DURATION: FILM_END, renderAt: renderDirector, scenes: SC.slice().sort((p, q) => p.a - q.a).map(s => ({ name: s.name, start: s.a, end: s.a + 1 })), sheet: () => {}, transitions: SC.slice().sort((p, q) => p.a - q.a).map(s => [s.a, s.xf, s.style, s.name]) };
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
// a shot list inside one scene: shots([[t0, fn, style?, xf?], ...], t) — soft transitions between sub-shots too
function shots(list, t) {
  let i = 0; for (let k = 0; k < list.length; k++) if (t >= list[k][0]) i = k;
  const run = j => list[j][1](t - list[j][0], t);
  const nx = list[i + 1];
  if (nx) { const xf = nx[3] ?? .4, st = nx[2] || 'dissolve'; if (st !== 'cut' && xf > 0 && t > nx[0] - xf) return { __blend: [run(i), run(i + 1), clamp((t - (nx[0] - xf)) / xf), st] }; }
  return run(i);
}
