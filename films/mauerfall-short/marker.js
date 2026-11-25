// BIG GERMAN WORDS + RED MARKER drawings (screen space, 1080x1920). Safe area: x 60..940, y 280..1500
// (bottom 20 % and right 12 % are left free for the YouTube Shorts UI).
//   word(c, t, { t0, t1, text, x, y, size, col, rot, mark: 'circle'|'underline'|'strike'|'box'|'double'|null, markCol })
const MK = { red: '#e3261f', ink: '#1d1618', paper: '#fffaf0', safe: { x0: 60, x1: 940, y0: 280, y1: 1500 } };
const mkFont = (s) => `${s}px ${NOAH_FONT}, Arial Black, sans-serif`;
// hand-drawn marker stroke along pts, revealed with k (0..1); jitter makes it look drawn
function markerStroke(c, pts, k, w = 14, col = MK.red, seed = 0) {
  if (k <= 0) return;
  let L = 0; const seglen = []; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seglen.push(d); L += d; }
  let left = L * clamp(k);
  c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
  for (const pass of [0, 1]) {
    c.beginPath(); c.moveTo(pts[0][0] + (rnd(seed) - .5) * 3, pts[0][1]); let rem = left;
    for (let i = 1; i < pts.length && rem > 0; i++) { const f = Math.min(1, rem / seglen[i - 1]); const [ax, ay] = pts[i - 1], [bx, by] = pts[i]; c.lineTo(ax + (bx - ax) * f + (rnd(seed + i) - .5) * 4, ay + (by - ay) * f + (rnd(seed + i + 40) - .5) * 4); rem -= seglen[i - 1]; }
    c.lineWidth = pass ? w : w + 6; c.strokeStyle = pass ? col : 'rgba(120,10,10,.35)'; c.stroke();
  }
  c.restore();
}
function ellipsePts(cx, cy, rx, ry, turns = 1.12, a0 = -2.4, seed = 0) {
  const pts = [], n = 60; for (let i = 0; i <= n; i++) { const a = a0 + i / n * Math.PI * 2 * turns, wob = 1 + (rnd(seed + i * .37) - .5) * .06 + (i / n) * .05; pts.push([cx + Math.cos(a) * rx * wob, cy + Math.sin(a) * ry * wob]); } return pts;
}
function word(c, t, o) {
  const t0 = o.t0, t1 = o.t1 ?? t0 + 1.6; if (t < t0 || t > t1) return;
  const lt = t - t0, kIn = easeBack(clamp(lt / .22)), kOut = 1 - seg(t, t1 - .16, t1), size = o.size || 130;
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
  c.translate(o.x ?? 500, o.y ?? 520); c.rotate(o.rot ?? -.04); const sc = (.6 + .4 * kIn) * (1 + .03 * Math.sin(lt * 5)); c.scale(sc, sc); c.globalAlpha = clamp(kIn * 2) * kOut;
  c.font = mkFont(size); c.textAlign = 'center'; c.textBaseline = 'middle';
  const lines = o.text.split('\n'), lh = size * 1.02, tw = Math.max(...lines.map(l => c.measureText(l).width)), th = lh * lines.length;
  // write-on reveal from the left
  c.save(); c.beginPath(); c.rect(-tw / 2 - 40, -th, (tw + 80) * clamp(lt / .2), th * 2); c.clip();
  lines.forEach((l, i) => { const ly = (i - (lines.length - 1) / 2) * lh;
    c.shadowColor = 'rgba(0,0,0,.45)'; c.shadowBlur = 18; c.shadowOffsetY = 10;
    c.lineWidth = size * .2; c.strokeStyle = MK.ink; c.lineJoin = 'round'; c.strokeText(l, 0, ly);
    c.shadowColor = 'transparent'; c.fillStyle = o.col || MK.paper; c.fillText(l, 0, ly); });
  c.restore();
  const hh = th / 2 + size * .1;
  // marker drawing
  const mk = clamp((lt - .12) / .38), mc = o.markCol || MK.red, sd = (o.seed || 1) * 13;
  if (o.mark === 'circle') markerStroke(c, ellipsePts(0, 4, tw / 2 + 50, hh + size * .3, 1.1, -2.6, sd), mk, 15, mc, sd);
  if (o.mark === 'underline') markerStroke(c, [[-tw / 2 - 10, hh + size * .1], [0, hh + size * .18], [tw / 2 + 20, hh + size * .06]], mk, 16, mc, sd);
  if (o.mark === 'double') { markerStroke(c, [[-tw / 2 - 10, hh + size * .08], [tw / 2 + 20, hh + size * .04]], mk * 2, 14, mc, sd); markerStroke(c, [[-tw / 2 + 20, hh + size * .3], [tw / 2 + 10, hh + size * .26]], mk * 2 - 1, 14, mc, sd + 5); }
  if (o.mark === 'strike') markerStroke(c, [[-tw / 2 - 30, 10], [tw / 2 + 30, -14]], mk, 18, mc, sd);
  if (o.mark === 'box') markerStroke(c, [[-tw / 2 - 40, -hh], [tw / 2 + 40, -hh - 4], [tw / 2 + 36, hh], [-tw / 2 - 36, hh - 2], [-tw / 2 - 42, -hh + 4]], mk, 14, mc, sd);
  c.restore();
}
// marker start times for the pen sound (exported for the audio mix)
