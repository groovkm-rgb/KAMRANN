// minimal stand-ins for the toon-shorts engine globals used by noah.js and places/*.js
const W = 1920, H = 1080, OUT = '#211c1a';
function rnd(i) { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
function circle(c, x, y, r) { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); }
function ell(c, x, y, rx, ry, rot = 0) { c.beginPath(); c.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); }
function rrect(c, x, y, w, h, r) { c.beginPath(); c.roundRect(x, y, w, h, r); }
function fs(c, fill, lw = 0) { if (fill) { c.fillStyle = fill; c.fill(); } if (lw) { c.lineWidth = lw; c.strokeStyle = OUT; c.lineJoin = 'round'; c.stroke(); } }
function line(c, pts, w, col = OUT) { c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.lineWidth = w; c.strokeStyle = col; c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke(); }
function shade(hex, k) { return shadeHex(hex, k); }
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), lerp = (a, b, t) => a + (b - a) * t;
const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
// parallax layer: p = 1 is the action plane, smaller p is further away
function layer(c, cam, p, fn) { const zp = 1 + (cam.z - 1) * p; c.save(); c.setTransform(zp, 0, 0, zp, W / 2 - cam.x * p * zp, H / 2 - cam.y * p * zp); fn(c); c.restore(); }
