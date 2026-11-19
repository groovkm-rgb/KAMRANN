// "GEHEIME AKTE" TEXT SYSTEM — one look for every card and table: dark navy paper with fibre texture,
// cream type in Inter Bold set like a typewriter (chars appear one by one, tiny baseline jitter),
// a red VERTRAULICH stamp, paper clip. Needs fonts.js (Inter Bold) + overlays.js (hudFont, fmtNum).
//   dosCard(c, t, { t0, t1, corner: 'tl'|'tr'|'bl'|'br', w, h, title, lines: [{ s, at, col, size }], draw(c, lt, w, h) })
//   dosTag(c, t, { t0, t1, corner, text, sub })          small file-tab label (e.g. "TAG 1 · 03:00 Uhr")
//   dosType(c, s, x, y, size, k, o)                      typewriter text, k = 0..1 revealed (or o.chars)
//   dosStamp(c, text, x, y, size, rot, k)                red rubber stamp, k = 0..1 slam-in
//   dosPaper(c, x, y, w, h, o)                           a sheet of the dossier paper
// Sound cues: every card / row / stamp registers a cue (CUE(kind, time)) for the audio mix.
const DOS = { paper: '#1a2234', paper2: '#212b40', edge: '#0d121e', cream: '#ece3cc', muted: '#9198a8', red: '#c8352c', redDark: '#8f2018', line: 'rgba(236,227,204,.18)', manila: '#c9a96e' };
const CUES = []; function CUE(kind, at, o = {}) { CUES.push(Object.assign({ kind, at: +at.toFixed(3) }, o)); }
window.__cues = CUES;
let _dosTex = null;
function dosTexture(c) {
  if (_dosTex) return _dosTex;
  const cv = document.createElement('canvas'); cv.width = cv.height = 512; const o = cv.getContext('2d');
  for (let i = 0; i < 9000; i++) { const x = rnd(i * 3 + 1) * 512, y = rnd(i * 3 + 2) * 512, a = rnd(i * 3 + 3); o.fillStyle = a > .5 ? `rgba(255,250,235,${.035 * a})` : `rgba(0,0,0,${.08 * a})`; o.fillRect(x, y, 1.5, 1.5); }
  for (let i = 0; i < 260; i++) { const x = rnd(i + 7000) * 512, y = rnd(i + 7100) * 512, a = rnd(i + 7200) * 6.28, l = 6 + rnd(i + 7300) * 22; o.strokeStyle = `rgba(255,248,230,${.04 + rnd(i + 7400) * .05})`; o.lineWidth = 1; o.beginPath(); o.moveTo(x, y); o.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); o.stroke(); }
  _dosTex = c.createPattern(cv, 'repeat'); return _dosTex;
}
function dosPaper(c, x, y, w, h, o = {}) {
  c.save();
  if (o.shadow !== false) { c.shadowColor = 'rgba(0,0,0,.55)'; c.shadowBlur = o.shadowBlur ?? 26; c.shadowOffsetY = o.shadowY ?? 12; }
  c.fillStyle = o.fill || DOS.paper; c.fillRect(x, y, w, h); c.restore();
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip(); c.fillStyle = dosTexture(c); c.globalAlpha = 1; c.translate(x, y); c.fillRect(0, 0, w, h); c.restore();
  // worn edge + thin cream frame
  c.save(); c.strokeStyle = DOS.edge; c.lineWidth = 3; c.strokeRect(x, y, w, h);
  if (o.frame !== false) { c.strokeStyle = 'rgba(236,227,204,.28)'; c.lineWidth = 1.5; c.strokeRect(x + 12, y + 12, w - 24, h - 24); }
  c.restore();
}
function dosType(c, s, x, y, size, k, o = {}) {
  const n = o.chars ?? Math.floor(s.length * clamp(k, 0, 1) + 1e-6); c.font = hudFont(size); c.textBaseline = 'alphabetic';
  const al = o.align || 'left', full = c.measureText(s).width, sp = o.spacing ?? size * .04;
  let cx = al === 'center' ? x - (full + sp * s.length) / 2 : al === 'right' ? x - full - sp * s.length : x;
  for (let i = 0; i < Math.min(n, s.length); i++) {
    const ch = s[i], j = (rnd(i * 17 + s.length) - .5) * size * .05, fade = o.ink !== false ? .82 + rnd(i * 5 + 9) * .18 : 1;
    c.globalAlpha = (o.alpha ?? 1) * fade; c.fillStyle = o.col || DOS.cream; c.textAlign = 'left'; c.fillText(ch, cx, y + j);
    cx += c.measureText(ch).width + sp;
  }
  c.globalAlpha = 1;
  if (n < s.length && n > 0 && o.caret !== false) { c.fillStyle = o.col || DOS.cream; c.fillRect(cx + 2, y - size * .78, size * .08, size * .9); }
  return cx - x;
}
function dosStamp(c, text, x, y, size, rot = -.12, k = 1, o = {}) {
  if (k <= 0) return; const kk = clamp(k, 0, 1), sc = 1 + (1 - easeOut(kk)) * .9, a = Math.min(1, kk * 2.5);
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(sc, sc); c.globalAlpha = a * (o.alpha ?? .92);
  c.font = hudFont(size); const w = c.measureText(text).width + size * 1.1, h = size * 1.55, col = o.col || DOS.red;
  c.strokeStyle = col; c.lineWidth = size * .11; c.strokeRect(-w / 2, -h / 2, w, h); c.lineWidth = size * .04; c.strokeRect(-w / 2 + size * .16, -h / 2 + size * .16, w - size * .32, h - size * .32);
  c.fillStyle = col; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(text, 0, size * .06);
  // worn ink: knock out speckles
  c.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 70; i++) { c.globalAlpha = .5 + rnd(i + 3) * .5; c.beginPath(); c.arc((rnd(i + 11) - .5) * w, (rnd(i + 23) - .5) * h, size * (.015 + rnd(i + 41) * .04), 0, Math.PI * 2); c.fill(); }
  c.restore();
}
function dosClip(c, x, y, s = 1) {
  c.save(); c.translate(x, y); c.scale(s, s); c.lineCap = 'round';
  c.strokeStyle = '#1b1e24'; c.lineWidth = 9; c.beginPath(); c.moveTo(0, 40); c.lineTo(0, -38); c.arc(12, -38, 12, Math.PI, 0); c.lineTo(24, 30); c.arc(12, 30, 12, 0, Math.PI, false); c.lineTo(0 + 0, -20); c.stroke();
  c.strokeStyle = '#b9bcc4'; c.lineWidth = 4.5; c.stroke(); c.restore();
}
// envelope for a card that is laid down from the corner and pulled out again
function dosEnv(t, t0, t1) { const a = clamp((t - t0) / .38, 0, 1), b = t1 == null ? 1 : clamp((t1 - t) / .32, 0, 1); return { a, b, k: Math.min(easeOut(a), ease(b)) }; }
function dosCard(c, t, o) {
  const e = dosEnv(t, o.t0, o.t1); if (e.k <= 0) return;
  const w = o.w || 520, h = o.h || 240, m = o.margin ?? 48, corner = o.corner || 'tr', lt = t - o.t0;
  const x = corner[1] === 'r' ? W - m - w : m, y = corner[0] === 'b' ? H - m - h : m, sx = corner[1] === 'r' ? 1 : -1;
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
  c.translate(x + w / 2 + sx * (1 - e.k) * (w + 120), y + h / 2 + (1 - e.k) * 30); c.rotate((o.tilt ?? -.012 * sx) + (1 - e.k) * .12 * sx); c.translate(-w / 2, -h / 2);
  dosPaper(c, 0, 0, w, h);
  if (o.clip !== false) dosClip(c, 34, 6, .9);
  let yy = 70;
  if (o.title) { dosType(c, o.title, 64, 62, o.titleSize || 30, (lt - .15) / Math.max(.25, o.title.length * .028)); yy = 92; c.fillStyle = DOS.line; c.fillRect(36, 82, w - 72, 2); }
  if (o.stamp !== false) dosStamp(c, o.stampText || 'VERTRAULICH', w - 110, 38, 15, .1, (lt - (o.stampAt ?? .5)) / .14);
  for (const ln of o.lines || []) dosType(c, ln.s, ln.x ?? 40, ln.y, ln.size || 30, (lt - (ln.at ?? .5)) / Math.max(.2, ln.s.length * .03), { col: ln.col, align: ln.align });
  if (o.draw) { c.save(); o.draw(c, lt, w, h); c.restore(); }
  c.restore();
}
function dosTag(c, t, o) {
  const e = dosEnv(t, o.t0, o.t1); if (e.k <= 0) return; const lt = t - o.t0;
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.font = hudFont(o.size || 34);
  const w = Math.max(c.measureText(o.text).width + o.text.length * 1.4, o.sub ? c.measureText(o.sub).width * .6 : 0) + 96, h = o.sub ? 112 : 78, m = 48, corner = o.corner || 'tl';
  const x = corner[1] === 'r' ? W - m - w : m, y = corner[0] === 'b' ? H - m - h : m, sx = corner[1] === 'r' ? 1 : -1;
  c.translate(x + sx * (1 - e.k) * (w + 80), y); c.rotate(-.01 * sx);
  dosPaper(c, 0, 0, w, h, { frame: false, shadowBlur: 18 });
  c.fillStyle = DOS.red; c.fillRect(0, 0, 12, h);
  dosType(c, o.text, 40, 52, o.size || 34, (lt - .12) / Math.max(.25, o.text.length * .035));
  if (o.sub) dosType(c, o.sub, 40, 92, 20, (lt - .6) / .4, { col: DOS.muted });
  c.restore();
}
// register the standard sounds of a card: whoosh in/out, a tak per typed line, a stamp
function dosCardCues(o, nLines = 1) { CUE('whoosh', o.t0); if (o.t1) CUE('whooshOut', o.t1 - .3); for (let i = 0; i < nLines; i++) CUE('typeRun', o.t0 + .15 + i * .35, { dur: .4 }); if (o.stamp !== false) CUE('stamp', o.t0 + (o.stampAt ?? .5)); }
