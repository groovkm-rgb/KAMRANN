// SNOWY MOUNTAINS backdrop (needs light.js). Two far ranges with snow caps, lit/shadow facets, light ink only on the nearer range.
//   snowyMountains(c, cam, t, B, tod)  — pass as forest(..., { backdrop: snowyMountains }) so it sits between sky and far hills.
//   B = p => layerBase(cam, HZ, p) (forest passes its own). tod: 'day' | 'dusk' | 'night'.
const MTN = {
  day:   { far: '#9fb4cc', farS: '#8299b6', near: '#7f93ad', nearS: '#5f7391', snow: '#f6f8fb', snowS: '#c4d2e6', fog: '205,228,240' },
  dusk:  { far: '#b493a0', farS: '#94788c', near: '#8f7486', nearS: '#6c5670', snow: '#ffe6d6', snowS: '#c9a8b8', fog: '250,190,150' },
  night: { far: '#2f4366', farS: '#22324f', near: '#283a59', nearS: '#1a2840', snow: '#cfdcf2', snowS: '#7f93ba', fog: '40,60,100' },
};
// one range: list of peaks [x, height, width]; light from the left (moon / sun), shadow facet on the right
function mtnRange(c, b, peaks, P, near, seed) {
  peaks = peaks.map(([x, h, w]) => [x, h * .62, w * .7]);
  const col = near ? P.near : P.far, colS = near ? P.nearS : P.farS;
  c.beginPath(); c.moveTo(-6000, b + 20);
  for (const [x, h, w] of peaks) { c.lineTo(x - w, b); c.lineTo(x - w * .35, b - h * .62); c.lineTo(x, b - h); c.lineTo(x + w * .4, b - h * .58); c.lineTo(x + w, b); }
  c.lineTo(6000, b + 20); c.closePath(); c.fillStyle = col; c.fill();
  peaks.forEach(([x, h, w], i) => {
    const s = seed + i * 7;
    // shadow face (right of the ridge line)
    c.beginPath(); c.moveTo(x, b - h); c.lineTo(x + w * .4, b - h * .58); c.lineTo(x + w, b); c.lineTo(x + w * .05, b); c.lineTo(x + w * .12, b - h * .45); c.closePath(); c.fillStyle = colS; c.fill();
    // snow cap with a jagged lower edge; shaded half
    const sn = h * (.32 + rnd(s) * .12), pts = [];
    for (let k = 0; k <= 8; k++) { const u = k / 8, yy = b - h + sn * (1 + (k % 2 ? .28 : -.05) * (1 - Math.abs(u - .5))); const xl = x - w * .35 * (sn / (h * .38)) * 1.05, xr = x + w * .4 * (sn / (h * .42)); pts.push([xl + (xr - xl) * u, yy]); }
    c.beginPath(); c.moveTo(x, b - h); for (const [px, py] of pts) c.lineTo(px, py); c.closePath(); c.fillStyle = P.snow; c.fill();
    c.save(); c.clip(); c.beginPath(); c.moveTo(x, b - h); c.lineTo(x + w, b); c.lineTo(x + w * .1, b); c.lineTo(x + w * .08, b - h * .5); c.closePath(); c.fillStyle = P.snowS; c.fill(); c.restore();
    // snow streaks in gullies below the cap
    for (let k = 0; k < 5; k++) { const u = rnd(s + k + 3), gx = x - w * .3 + u * w * .7, gy = b - h + sn * (1.05 + rnd(s + k + 9) * .2), L = h * (.12 + rnd(s + k + 13) * .18);
      c.beginPath(); c.moveTo(gx - 6, gy); c.lineTo(gx + (gx < x ? -1 : 1) * L * .25, gy + L); c.lineTo(gx + 6, gy); c.closePath(); c.fillStyle = gx < x ? P.snow : P.snowS; c.globalAlpha = .8; c.fill(); c.globalAlpha = 1; }
    if (near) { c.beginPath(); c.moveTo(x - w * .35, b - h * .62); c.lineTo(x, b - h); c.lineTo(x + w * .4, b - h * .58); c.lineWidth = 2.5; c.strokeStyle = shade(colS, -.35); c.stroke(); }
  });
}
function snowyMountains(c, cam, t, B, tod = 'day') {
  const P = MTN[tod] || MTN.day;
  layer(c, cam, .05, c => {
    const b = B(.05) + 40;
    mtnRange(c, b, [[-2600, 1250, 700], [-1700, 1500, 820], [-700, 1180, 640], [200, 1650, 900], [1200, 1300, 700], [2100, 1550, 820], [3000, 1200, 640]], P, false, 11);
  });
  haze(c, P.fog, tod === 'night' ? .16 : .22);
  layer(c, cam, .08, c => {
    const b = B(.08) + 40;
    mtnRange(c, b, [[-2200, 900, 600], [-1200, 1050, 640], [-250, 820, 520], [700, 1000, 620], [1700, 880, 560], [2600, 1020, 640]], P, true, 51);
    mist(c, b - 60, P.fog, .5, 160);
  });
  haze(c, P.fog, .12);
}
