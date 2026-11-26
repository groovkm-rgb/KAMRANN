// CLAY / PLASTICINE look for things that are hard to draw realistically (food, bread, flowers).
// Soft volume (radial light from upper-left), gentle dark rim, fingerprint texture, soft specular. World space.
function clayShape(c, pathFn, col, o = {}) {
  const b = o.bounds || [-50, -50, 100, 100], [bx, by, bw, bh] = b, cx = bx + bw * .35, cy = by + bh * .3, r = Math.max(bw, bh) * .9;
  c.save(); pathFn(); c.lineWidth = o.lw ?? 3; c.strokeStyle = shade(col, -.55); c.fillStyle = col; c.fill();
  c.clip();
  let g = c.createRadialGradient(cx, cy, r * .05, cx, cy, r); g.addColorStop(0, 'rgba(255,255,255,.38)'); g.addColorStop(.45, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(40,10,0,.32)');
  c.fillStyle = g; c.fillRect(bx - 10, by - 10, bw + 20, bh + 20);
  // fingerprint texture: faint concentric arcs
  const seed = o.seed || 1; c.lineWidth = 1.1; c.strokeStyle = 'rgba(60,30,10,.10)';
  for (let f = 0; f < 2; f++) {
    const fx = bx + bw * (.3 + rnd(seed + f) * .4), fy = by + bh * (.3 + rnd(seed + f + 9) * .4);
    for (let i = 1; i < 7; i++) { c.beginPath(); c.ellipse(fx, fy, i * bw * .035, i * bw * .026, rnd(seed + f * 3) * 3, .3, Math.PI * 1.6); c.stroke(); }
  }
  // tiny dents
  for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(bx + rnd(seed + i * 5) * bw, by + rnd(seed + i * 5 + 2) * bh, 1.5 + rnd(i + seed) * 2.5, 0, Math.PI * 2); c.fillStyle = 'rgba(50,20,0,.10)'; c.fill(); }
  // soft specular
  c.beginPath(); c.ellipse(bx + bw * .3, by + bh * .22, bw * .14, bh * .07, -.4, 0, Math.PI * 2); c.fillStyle = 'rgba(255,255,255,.35)'; c.fill();
  c.restore();
  c.save(); pathFn(); c.lineWidth = o.lw ?? 3; c.strokeStyle = shade(col, -.5); c.stroke(); c.restore();
}
function clayBlob(c, x, y, rx, ry, col, o = {}) { clayShape(c, () => { c.beginPath(); c.ellipse(x, y, rx, ry, o.rot || 0, 0, Math.PI * 2); }, col, Object.assign({ bounds: [x - rx, y - ry, rx * 2, ry * 2] }, o)); }
// plate (porcelain, drawn normally) — top surface y, radius
function platePorcelain(c, x, y, r) {
  c.beginPath(); c.ellipse(x, y + 4, r * 1.04, r * .26, 0, 0, Math.PI * 2); c.fillStyle = 'rgba(30,20,20,.25)'; c.fill();
  c.beginPath(); c.ellipse(x, y, r, r * .24, 0, 0, Math.PI * 2); fs(c, '#fbfaf6', 2.5);
  c.beginPath(); c.ellipse(x, y - 1, r * .66, r * .15, 0, 0, Math.PI * 2); c.lineWidth = 1.5; c.strokeStyle = '#d6d0c4'; c.stroke();
  c.beginPath(); c.ellipse(x, y, r * .93, r * .21, 0, 0, Math.PI * 2); c.lineWidth = 2; c.strokeStyle = '#c9a85a'; c.stroke();
}
// basket of bread rolls (clay), base at y
function clayBreadBasket(c, x, y, s = 1, t = 0) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.beginPath(); c.ellipse(0, 4, 74, 12, 0, 0, Math.PI * 2); c.fillStyle = 'rgba(30,15,10,.3)'; c.fill();
  // rolls behind the basket rim
  clayBlob(c, -30, -50, 34, 22, '#d99a4e', { seed: 3, rot: -.3 });
  clayBlob(c, 26, -54, 36, 22, '#e0a65a', { seed: 5, rot: .25 });
  clayBlob(c, 0, -62, 30, 20, '#cf8e44', { seed: 8 });
  for (const [bx, by, r] of [[-30, -50, -.3], [26, -54, .25], [0, -62, 0]]) { c.save(); c.translate(bx, by); c.rotate(r); for (const d of [-10, 4]) { c.beginPath(); c.moveTo(d - 6, -12); c.quadraticCurveTo(d, -4, d + 6, -14); c.lineWidth = 3; c.strokeStyle = 'rgba(120,60,20,.55)'; c.stroke(); } c.restore(); }
  // napkin corner
  clayShape(c, () => { c.beginPath(); c.moveTo(-70, -30); c.lineTo(-40, -70); c.lineTo(-12, -36); c.closePath(); }, '#f4f1ea', { bounds: [-70, -70, 58, 40], seed: 11 });
  // woven basket (clay)
  clayShape(c, () => { c.beginPath(); c.moveTo(-72, -36); c.quadraticCurveTo(0, -22, 72, -36); c.lineTo(56, 0); c.quadraticCurveTo(0, 8, -56, 0); c.closePath(); }, '#a8743c', { bounds: [-72, -40, 144, 48], seed: 13 });
  c.save(); c.beginPath(); c.moveTo(-72, -36); c.quadraticCurveTo(0, -22, 72, -36); c.lineTo(56, 0); c.quadraticCurveTo(0, 8, -56, 0); c.closePath(); c.clip();
  for (let r = 0; r < 3; r++) for (let i = -8; i < 9; i++) { c.beginPath(); c.ellipse(i * 9 + (r % 2) * 4.5, -26 + r * 11, 5, 4.2, .3, 0, Math.PI * 2); c.fillStyle = r % 2 ? 'rgba(80,40,10,.22)' : 'rgba(255,220,160,.16)'; c.fill(); }
  c.restore();
  c.beginPath(); c.moveTo(-72, -36); c.quadraticCurveTo(0, -22, 72, -36); c.lineWidth = 7; c.strokeStyle = '#8a5a2a'; c.stroke();
  c.restore();
}
// dessert plate: slice of cake with cream and a berry (clay) on porcelain
function clayDessert(c, x, y, s = 1) {
  c.save(); c.translate(x, y); c.scale(s, s);
  platePorcelain(c, 0, 0, 62);
  // sauce swoosh
  clayShape(c, () => { c.beginPath(); c.ellipse(-14, -2, 36, 6, -.08, 0, Math.PI * 2); }, '#9b2a3a', { bounds: [-50, -8, 72, 12], seed: 21, lw: 1.5 });
  // cake slice (wedge seen from the side)
  clayShape(c, () => { c.beginPath(); c.moveTo(-30, -4); c.lineTo(30, -6); c.lineTo(30, -40); c.lineTo(-30, -36); c.closePath(); }, '#e8c99a', { bounds: [-30, -40, 60, 36], seed: 23 });
  clayShape(c, () => { c.beginPath(); c.moveTo(-30, -20); c.lineTo(30, -22); c.lineTo(30, -28); c.lineTo(-30, -26); c.closePath(); }, '#6b3a2a', { bounds: [-30, -28, 60, 8], seed: 24, lw: 1.5 });
  clayShape(c, () => { c.beginPath(); c.moveTo(-32, -36); c.quadraticCurveTo(0, -46, 32, -40); c.quadraticCurveTo(30, -52, 0, -54); c.quadraticCurveTo(-30, -52, -32, -36); c.closePath(); }, '#5a2e22', { bounds: [-32, -54, 64, 18], seed: 25 });
  // cream dollop + berry + mint leaf
  clayBlob(c, 6, -60, 14, 10, '#fbf4e6', { seed: 26 });
  clayBlob(c, 8, -74, 9, 9, '#c4233a', { seed: 27 });
  clayShape(c, () => { c.beginPath(); c.ellipse(20, -78, 9, 4, -.6, 0, Math.PI * 2); }, '#4f9a4a', { bounds: [11, -82, 18, 8], seed: 28, lw: 1.5 });
  c.restore();
}
// main course plate (clay): roulade slices, red cabbage, dumplings, sauce
function clayRoulade(c, x, y, s = 1, o = {}) {
  c.save(); c.translate(x, y); c.scale(s, s);
  platePorcelain(c, 0, 0, 90);
  clayShape(c, () => { c.beginPath(); c.ellipse(4, -4, 66, 12, 0, 0, Math.PI * 2); }, '#6a3418', { bounds: [-62, -16, 132, 24], seed: 31, lw: 1.5 });
  clayShape(c, () => { c.beginPath(); c.ellipse(-46, -14, 30, 14, 0, 0, Math.PI * 2); }, '#7a2a5a', { bounds: [-76, -28, 60, 28], seed: 32 });
  for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(-70 + i * 9, -18); c.quadraticCurveTo(-60 + i * 9, -24, -52 + i * 9, -16); c.lineWidth = 2; c.strokeStyle = 'rgba(200,120,180,.5)'; c.stroke(); }
  clayBlob(c, 54, -22, 22, 20, '#efe2c2', { seed: 33 }); clayBlob(c, 30, -16, 16, 14, '#e8d8b4', { seed: 34 });
  // roulade: a log with a cut face showing the spiral
  clayShape(c, () => { c.beginPath(); c.roundRect(-20, -46, 56, 34, 16); }, '#7a3e1e', { bounds: [-20, -46, 56, 34], seed: 35 });
  clayBlob(c, -16, -30, 14, 17, '#9a5a32', { seed: 36 });
  c.beginPath(); c.arc(-16, -30, 9, 0, Math.PI * 1.7); c.lineWidth = 2.5; c.strokeStyle = '#5a2a12'; c.stroke(); c.beginPath(); c.arc(-16, -30, 4, 0, Math.PI * 1.6); c.stroke();
  clayShape(c, () => { c.beginPath(); c.moveTo(-24, -46); c.quadraticCurveTo(10, -58, 40, -44); c.quadraticCurveTo(30, -34, 10, -40); c.quadraticCurveTo(-10, -36, -24, -46); c.closePath(); }, '#5a2410', { bounds: [-24, -58, 64, 24], seed: 37 });
  if (o.steam) for (let k = 0; k < 3; k++) { const ph = (o.t || 0) * .6 + k * .33, a = Math.sin((ph % 1) * Math.PI) * .5; c.beginPath(); c.moveTo(-10 + k * 20, -60); c.bezierCurveTo(-24 + k * 20, -90, 4 + k * 20, -110, -8 + k * 20 + Math.sin((o.t || 0) * 2 + k) * 8, -150 - (ph % 1) * 40); c.lineWidth = 6; c.strokeStyle = `rgba(255,255,255,${a})`; c.lineCap = 'round'; c.stroke(); }
  c.restore();
}
// small vase with clay flowers
function clayFlowers(c, x, y, s = 1, cols = ['#e0506a', '#f2c94a', '#f4f1ea']) {
  c.save(); c.translate(x, y); c.scale(s, s);
  for (let i = 0; i < 3; i++) { const a = (i - 1) * .35; line(c, [0, -30, Math.sin(a) * 40, -30 - Math.cos(a) * 40], 3, '#3f7a3c'); }
  for (let i = 0; i < 3; i++) { const a = (i - 1) * .35, fx = Math.sin(a) * 40, fy = -30 - Math.cos(a) * 40; for (let p = 0; p < 5; p++) { const pa = p / 5 * Math.PI * 2; clayBlob(c, fx + Math.cos(pa) * 7, fy + Math.sin(pa) * 6, 6, 5, cols[i % cols.length], { seed: 40 + i * 5 + p, lw: 1.2 }); } clayBlob(c, fx, fy, 4, 4, '#e8a020', { seed: 50 + i, lw: 1 }); }
  c.beginPath(); c.moveTo(-10, -34); c.quadraticCurveTo(-16, -10, -9, 0); c.lineTo(9, 0); c.quadraticCurveTo(16, -10, 10, -34); c.closePath(); fs(c, 'rgba(200,230,240,.7)', 2);
  c.restore();
}
