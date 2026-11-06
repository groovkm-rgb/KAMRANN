// window.renderFrame(f): draws frame f from scratch (no state carried between frames).
import { TOTAL, camAt, actorsAt, lightAt, GEO, lerp, mix } from './story.js';
import * as D from './draw.js';

const cv = document.getElementById('c'), ctx = cv.getContext('2d');
const mk = () => { const k = document.createElement('canvas'); k.width = 1080; k.height = 1920; return k; };
const OFF = mk(), oc = OFF.getContext('2d'), TMP = mk(), tc = TMP.getContext('2d');

function xf(cam, p) {
  const s = 1 + (cam.s - 1) * p, cx = 540 + (cam.x - 540) * p, cy = 960 + (cam.y - 960) * p;
  return [s, 0, 0, s, 540 - cx * s + cam.dx, 960 - cy * s + cam.dy];
}
function apply(c, m) { c.setTransform(...m); D.setScale(m[0]); }
function layer(cam, p, blur, fn, clip) {
  oc.setTransform(1, 0, 0, 1, 0, 0); oc.clearRect(0, 0, 1080, 1920);
  apply(oc, xf(cam, p)); fn(oc);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (clip) { ctx.beginPath(); ctx.rect(...clip); ctx.clip(); }
  ctx.filter = blur ? `blur(${blur}px)` : 'none'; ctx.drawImage(OFF, 0, 0); ctx.filter = 'none'; ctx.restore();
}
const toScreen = (m, x, y) => [m[0] * x + m[4], m[3] * y + m[5]];

let CT = '#ffffff';
function exterior(f, cam, A, L) {
  CT = mix(L.tint, '#ffffff', 0.65 * (1 - L.night));
  layer(cam, 0.35, 14, c => { D.roofs(c, 'far'); if (A.flock) D.flockLayer(c, f, 'far'); });
  layer(cam, 0.6, 10, c => { D.roofs(c, 'near'); if (A.flock) D.flockLayer(c, f, 'near'); });
  layer(cam, 0.8, 6, c => { D.wires(c); if (A.flock) D.flockLayer(c, f, 'wire'); });
  const m = xf(cam, 1); apply(ctx, m);
  D.building(ctx, A);
  const Wn = GEO.win, a = toScreen(m, Wn.x0, Wn.y0), b = toScreen(m, Wn.x1, Wn.y1);
  layer(cam, 0.92, 6, c => D.room(c, A, f, L), [a[0], a[1], b[0] - a[0], b[1] - a[1]]);
  apply(ctx, m);
  const o = { ...A.otto, _f: f };
  D.setTint(CT);
  ctx.save(); ctx.beginPath(); ctx.rect(Wn.x0, Wn.y0, Wn.x1 - Wn.x0, Wn.y1 - Wn.y0); ctx.clip();
  D.ottoBody(ctx, o); ctx.restore();
  D.setTint(L.tint); D.sillAndPot(ctx, A, f);
  D.crumbs(ctx, A.crumbs);
  if (A.flock) D.flockLayer(ctx, f, 'sill');
  if (A.sprinkle != null) { const R = o.R; D.fallingCrumbs(ctx, f, A.sprinkle, [o.x + o.arms.R.hand[0] * R, o.y + o.arms.R.hand[1] * R]); }
  D.setTint(CT); D.ottoArms(ctx, o, f);
  D.setTint(L.tint); D.openShutters(ctx, A);
  D.setTint(CT);
  if (A.hero) {
    const h = A.hero;
    D.pigeon(ctx, h.x, h.y, { s: h.s || 1.4, dir: h.dir, spot: true, peck: h.peck, flap: h.flap, hop: h.hop || 0, nod: h.nod ? Math.sin(f / 30 * 1.7 * Math.PI * 2) : 0 });
  }
  D.setTint(L.tint);
  if (A.flock) D.flockLayer(ctx, f, 'bld');
  if (A.weather === 'rain') D.rain(ctx, f);
  if (A.weather === 'snow') D.snowfall(ctx, f);
}
function interior(f, cam, A) {
  layer(cam, 0.5, 10, c => D.interiorBack(c, f, A));
  const m = xf(cam, 1); apply(ctx, m);
  const R = 290, inner = lerp(0, 470, A.curtain) / R;
  const o = { ...A.otto, _f: f, x: 540, y: 930 + A.otto.y - 868, R, len: 4.5,
    arms: { L: { hand: [-Math.max(inner, 0.9), 1.6], elbow: [-1.6, 2.3] }, R: { hand: [Math.max(inner, 0.9), 1.6], elbow: [1.6, 2.3] } } };
  D.ottoBody(ctx, o); D.ottoArms(ctx, o, f);
  layer(cam, 1.05, 12, c => D.flockShadows(c, f, A, 0.2));
  layer(cam, 1.25, 4, c => D.curtains(c, A));
}

// Variant "#orig": original voice speed. Output frame g -> authored frame via web/warp_orig.json.
let WARP = null;
function authored(g) {
  if (!WARP) return g;
  const A = WARP.anchors;
  for (let i = 1; i < A.length; i++) if (g <= A[i][1]) {
    const [a0, b0] = A[i - 1], [a1, b1] = A[i];
    return Math.round(a0 + (a1 - a0) * (g - b0) / (b1 - b0));
  }
  return A[A.length - 1][0];
}
window.renderFrame = function (g) {
  g = Math.max(0, Math.min(window.TOTAL - 1, g | 0));
  D.setRealFrame(g);
  let f = authored(g);
  f = Math.max(0, Math.min(TOTAL - 1, f));
  const cam = camAt(f), A = actorsAt(f), L = lightAt(f);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
  D.setTint(L.tint);
  D.sky(ctx, A.set === 'int' ? '#ecd7a6' : L.sky);
  if (A.set === 'ext') exterior(f, cam, A, L); else interior(f, cam, A);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (cam.whip) {
    tc.setTransform(1, 0, 0, 1, 0, 0); tc.clearRect(0, 0, 1080, 1920); tc.drawImage(cv, 0, 0);
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 1080, 1920);
    const N = 16; ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 1 / N;
    for (let i = 0; i < N; i++) ctx.drawImage(TMP, (i / (N - 1) - 0.5) * cam.whip, 0);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  }
  D.post(ctx, f);
};
window.TOTAL = TOTAL;
if (location.hash === '#orig') {
  fetch('warp_orig.json').then(r => r.json()).then(w => { WARP = w; window.TOTAL = w.total; window.ready = true; })
    .catch(e => { window.err = String(e); });
} else window.ready = true;
