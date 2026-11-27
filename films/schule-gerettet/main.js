// Film entry: shot list lookup, stills registry, window.__film API.
const CV = document.getElementById('film'), CTX = CV.getContext('2d');
function renderAt(t) {
  const c = CTX; c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.filter = 'none';
  c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
  const s = SHOTS.find(s => t >= s.t0 && t < s.t1) || SHOTS[SHOTS.length - 1];
  c.save(); s.draw(c, t - s.t0, t, s); c.restore();
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.filter = 'none';
  if (typeof OVERLAY === 'function') OVERLAY(c, t);
}
window.__film = { FPS, DURATION, ready: false, render(w) { if (typeof w === 'string') { const c = CTX; c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, W, H); c.save(); STILLS[w](c); c.restore(); } else renderAt(w); } };
NOAH_FONTS_READY.then(() => { window.__film.ready = true; });
