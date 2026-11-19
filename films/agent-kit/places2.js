// MORE PLACES for the agent film (side-on, people stand on y = 0). All signage German, no country/city hints.
//   station(c, cam, t, o)   iron + glass hall, morning fog, big clock (o.clock '8:00'), platform, train (o.train 0..1 arrival), lockers
//   park(c, cam, t, o)      o.mood: 'fog' (dusk, mist, lamp on) | 'autumn' (low sun, golden leaves) ; bench at x 0, lamp at x -60
//   kaufhaus(c, cam, t, o)  department store: escalators, suit racks, tills, 'Ausgang' sign
//   tramInside(c, cam, t)   tram interior, rainy windows passing lights
//   alley(c, cam, t)        empty wet back street with the store's back door
//   board(c, cam, t, o)     evidence board with strings and silhouette faces (o.k = how many strings drawn 0..1)
//   gymSil(c, cam, t)       training hall in silhouette (backlit windows)
//   beach(c, cam, t)        holiday beach at noon (umbrellas, sea)
//   lockers(c, x, y, o)     Schließfächer wall (o.open index, o.doorK 0..1)
//   ceremonyHall(c, cam, t, o)  empty hall, rows of chairs, podium; o.light 0..1
//   houseFront(c, cam, t, o)    residential facade by day: front door at x 0, first-floor window at x 420 (o.noahAtWindow)
function sign(c, x, y, text, o = {}) {
  const size = o.size || 46; c.font = hudFont(size); const w = c.measureText(text).width + size * .9, h = size * 1.5;
  c.beginPath(); rrect(c, x - w / 2, y - h / 2, w, h, 8); fs(c, o.bg || '#1f3f7a', 3); hudText(c, text, x, y + size * .36, size, o.col || '#fff', 'center');
  if (o.glow) bloom(c, x, y, w, o.glow, .3);
}
function bigClock(c, x, y, r, hh, mm) {
  circle(c, x, y, r + 16); fs(c, '#2a2e34', 5); circle(c, x, y, r); fs(c, '#f2eee4', 3);
  for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; line(c, [x + Math.cos(a) * r * .8, y + Math.sin(a) * r * .8, x + Math.cos(a) * r * .93, y + Math.sin(a) * r * .93], k % 3 ? 4 : 9, '#222'); }
  const ah = ((hh % 12) + mm / 60) / 12 * Math.PI * 2 - Math.PI / 2, am = mm / 60 * Math.PI * 2 - Math.PI / 2;
  line(c, [x, y, x + Math.cos(ah) * r * .5, y + Math.sin(ah) * r * .5], 12, '#111'); line(c, [x, y, x + Math.cos(am) * r * .78, y + Math.sin(am) * r * .78], 7, '#111'); circle(c, x, y, 10); fs(c, '#b8202a');
}
function crowd(c, x0, x1, t, o = {}) {
  // walking silhouettes (back/mid layer), deterministic
  const n = o.n || 12, col = o.col || 'rgba(30,34,44,.85)';
  for (let i = 0; i < n; i++) {
    const sp = (rnd(i + 40) - .5) * 240, span = x1 - x0, x = x0 + (((rnd(i + 3) * span + sp * t) % span) + span) % span, s = sp > 0 ? 1 : -1;
    silhouette(c, cc => drawPal(cc, { look: ['follower', 'informant', 'colleague', 'wife'][i % 4], side: true, x, k: (o.k || .4) * (.9 + rnd(i) * .2), s, walk: t * 7 + i, outfit: i % 3 ? 'old' : 'agent', coat: true, hat: i % 4 === 0 }), col);
  }
}
function station(c, cam, t, o = {}) {
  const HZ = -200, B = p => layerBase(cam, HZ, p);
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#9aa2aa'; c.fillRect(0, 0, W, H);
  layer(c, cam, .25, c => { const b = B(.25); const g = c.createLinearGradient(0, b - 2000, 0, b); g.addColorStop(0, '#b8c0c8'); g.addColorStop(1, '#dfe2e2'); c.fillStyle = g; c.fillRect(-6000, b - 3000, 12000, 3000); for (let i = 0; i < 30; i++) { c.fillStyle = 'rgba(120,128,138,.5)'; const h = 300 + rnd(i) * 500; c.fillRect(-5000 + i * 340, b - h, 200, h); } });
  haze(c, '220,224,228', .45);
  layer(c, cam, .6, c => {
    const b = B(.6);
    // iron + glass roof: arches and ribs
    for (let i = -8; i <= 8; i++) { const x = i * 520; c.beginPath(); c.moveTo(x, b - 300); c.lineTo(x, b - 1500); c.lineWidth = 26; c.strokeStyle = '#3a4048'; c.stroke(); }
    for (const yy of [1500, 1650]) { c.beginPath(); for (let x = -4200; x <= 4200; x += 40) c.lineTo(x, b - yy - Math.abs(Math.sin(x / 520 * Math.PI)) * 220); c.lineWidth = 16; c.strokeStyle = '#3a4048'; c.stroke(); }
    for (let i = -8; i < 8; i++) for (let k = 0; k < 4; k++) { c.fillStyle = 'rgba(230,236,240,.25)'; c.fillRect(i * 520 + 20, b - 2100 + k * 140, 480, 110); }
    if (o.clock) { const [hh, mm] = o.clock.split(':').map(Number); line(c, [o.clockX ?? 0, b - 1500, o.clockX ?? 0, b - 1250], 10, '#2a2e34'); bigClock(c, o.clockX ?? 0, b - 1120, 140, hh, mm); }
    sign(c, -1100, b - 980, 'Bahnhof', { size: 64, bg: '#1f3f7a' }); sign(c, 1150, b - 980, 'Gleis 3', { size: 58, bg: '#1f3f7a' }); sign(c, 2300, b - 980, 'Ausgang', { size: 52, bg: '#1a6a3a' });
    // platform edge + far track
    c.fillStyle = '#5a5e64'; c.fillRect(-6000, b - 260, 12000, 60); c.fillStyle = '#2a2a2e'; c.fillRect(-6000, b - 200, 12000, 220);
    for (let k = -80; k < 80; k++) { c.fillStyle = '#4a4036'; c.fillRect(k * 80, b - 110, 50, 16); } line(c, [-6000, b - 120, 6000, b - 120], 8, '#8a8e96'); line(c, [-6000, b - 60, 6000, b - 60], 8, '#8a8e96');
    if (o.train != null) train(c, lerp(-5200, 0, easeOut(clamp(o.train, 0, 1))), b - 60, t);
  });
  haze(c, '225,228,232', o.fog ?? .3);
  if (o.crowd !== false) layer(c, cam, .8, c => crowd(c, -2600, 2600, t, { n: 14, k: .36, col: 'rgba(40,44,54,.7)' }));
  layer(c, cam, 1, c => {
    c.fillStyle = '#7a7e84'; c.fillRect(-6000, HZ, 12000, 3000); for (let k = -40; k < 40; k++) { c.fillStyle = 'rgba(0,0,0,.1)'; c.fillRect(k * 160, HZ, 4, 3000); }
    c.fillStyle = '#e8d070'; c.fillRect(-6000, HZ + 10, 12000, 14);
    if (o.lockers) lockers(c, o.lockers.x ?? 600, 0, o.lockers);
    for (const bx of [-1600, 1700]) { c.beginPath(); c.rect(bx - 200, -200, 400, 30); fs(c, '#6a4a34', 3); line(c, [bx - 160, -170, bx - 160, 0], 10); line(c, [bx + 160, -170, bx + 160, 0], 10); }
  });
  return { base: '#7a7e84' };
}
function train(c, x, y, t) {
  for (let i = 0; i < 4; i++) {
    const cx = x - i * 1500; c.beginPath(); rrect(c, cx - 720, y - 600, 1440, 560, 40); fs(c, i ? '#8a2a2a' : '#9a3030', 4);
    c.fillStyle = '#e8e2d6'; c.fillRect(cx - 720, y - 260, 1440, 40);
    for (let w = 0; w < 6; w++) { c.beginPath(); rrect(c, cx - 640 + w * 220, y - 520, 170, 180, 14); fs(c, '#3a4a5a', 3); c.fillStyle = 'rgba(255,230,180,.35)'; c.fillRect(cx - 630 + w * 220, y - 510, 150, 160); }
    for (const wx of [-500, 500]) { circle(c, cx + wx, y - 30, 60); fs(c, '#1a1a1e', 3); }
    if (!i) { ell(c, cx + 700, y - 380, 24, 30); fs(c, '#fff3c0', 3); bloom(c, cx + 700, y - 380, 260, '255,240,190', .6); }
  }
}
function lockers(c, x, y, o = {}) {
  const cols = 6, rows = 5, w = 140, h = 130;
  c.beginPath(); c.rect(x - 20, y - rows * h - 40, cols * w + 40, rows * h + 40); fs(c, '#4a5058', 3);
  for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) {
    const bx = x + k * w, by = y - (r + 1) * h - 10, idx = r * cols + k;
    c.beginPath(); c.rect(bx + 4, by + 4, w - 8, h - 8); fs(c, '#8a929c', 2.5);
    if (idx === o.open) { c.fillStyle = '#1a1c20'; c.fillRect(bx + 8, by + 8, w - 16, h - 16); if (o.inside) o.inside(c, bx + w / 2, by + h - 14); const dk = o.doorK || 0; c.save(); c.translate(bx + w - 4, by + 4); c.scale(Math.cos(dk * 1.4), 1); c.beginPath(); c.rect(-(w - 8), 0, w - 8, h - 8); fs(c, '#9aa2ac', 2.5); c.restore(); }
    else { c.beginPath(); c.rect(bx + w - 40, by + 20, 20, 28); fs(c, '#d8c060', 1.5); hudText(c, String(100 + idx), bx + 22, by + 34, 20, '#2a2e34'); }
  }
  hudText(c, 'Schließfächer', x + cols * w / 2, y - rows * h - 60, 34, '#e8ecf0', 'center');
}
function park(c, cam, t, o = {}) {
  const HZ = -230, B = p => layerBase(cam, HZ, p), fog = o.mood !== 'autumn';
  c.setTransform(1, 0, 0, 1, 0, 0); let g = c.createLinearGradient(0, 0, 0, H);
  if (fog) { g.addColorStop(0, '#3a4258'); g.addColorStop(1, '#8a8a98'); } else { g.addColorStop(0, '#7aa0c8'); g.addColorStop(1, '#f2c890'); }
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  layer(c, cam, .1, c => { const b = B(.1); if (!fog) { bloom(c, -1400, b - 300, 1100, '255,200,120', .9); circle(c, -1400, b - 300, 90); c.fillStyle = '#fff2cf'; c.fill(); } for (let i = 0; i < 40; i++) { const x = -5000 + i * 250, h = 200 + rnd(i + 11) * 400; c.fillStyle = fog ? 'rgba(70,76,92,.6)' : 'rgba(150,120,110,.55)'; c.fillRect(x, b - h, 140, h); } });
  haze(c, fog ? '150,155,170' : '255,220,170', fog ? .45 : .25);
  layer(c, cam, .35, c => { const b = B(.35); for (let i = 0; i < 16; i++) bareTree(c, -4200 + i * 560 + rnd(i) * 200, b, .8 + rnd(i + 3) * .4, fog ? '#3a3a44' : '#5a4030', !fog && i % 2 ? '#d9902a' : null, i); });
  haze(c, fog ? '150,155,170' : '255,220,170', fog ? .35 : .15);
  layer(c, cam, .7, c => { const b = B(.7); for (let i = 0; i < 9; i++) bareTree(c, -3800 + i * 900 + rnd(i + 30) * 300, b, 1.5, fog ? '#2a2a32' : '#4a3020', !fog ? '#e0a030' : null, i + 50); if (fog) for (let i = 0; i < 3; i++) { const lx = -2400 + i * 2200; parkLamp(c, lx, b, true); } });
  if (fog) haze(c, '160,165,180', .2);
  layer(c, cam, 1, c => {
    c.fillStyle = fog ? '#3a4038' : '#7a6a3a'; c.fillRect(-6000, HZ, 12000, 3000);
    c.fillStyle = fog ? '#5a5a5e' : '#b8a888'; c.beginPath(); c.moveTo(-6000, HZ + 60); c.lineTo(6000, HZ + 60); c.lineTo(6000, HZ + 260); c.lineTo(-6000, HZ + 260); c.fill();
    if (!fog) for (let i = 0; i < 260; i++) { const x = -3000 + rnd(i) * 6000, y = HZ + rnd(i + 7) * 500; c.save(); c.translate(x, y); c.rotate(rnd(i + 9) * 6); c.fillStyle = ['#d9902a', '#c0602a', '#e8b040', '#a04a20'][i % 4]; c.beginPath(); c.ellipse(0, 0, 18, 9, 0, 0, Math.PI * 2); c.fill(); c.restore(); }
    parkLamp(c, o.lampX ?? -330, 0, fog);
    bench(c, o.benchX ?? 0); if (o.bench2 != null) bench(c, o.bench2);
  });
  return { base: fog ? '#3a4038' : '#7a6a3a' };
}
function parkLamp(c, x, y, on) {
  line(c, [x, y, x, y - 820], 18); line(c, [x, y, x, y - 820], 10, '#2a2e34'); c.beginPath(); c.rect(x - 30, y - 40, 60, 40); fs(c, '#2a2e34', 3);
  c.beginPath(); c.moveTo(x - 60, y - 820); c.lineTo(x + 60, y - 820); c.lineTo(x + 40, y - 940); c.lineTo(x - 40, y - 940); c.closePath(); fs(c, on ? '#ffe8b0' : '#c8c4b8', 3); c.beginPath(); c.moveTo(x - 70, y - 940); c.lineTo(x + 70, y - 940); c.lineTo(x, y - 1000); c.closePath(); fs(c, '#2a2e34', 3);
  if (on) { bloom(c, x, y - 880, 420, '255,220,150', .7); c.save(); c.globalCompositeOperation = 'screen'; const g = c.createLinearGradient(0, y - 880, 0, y); g.addColorStop(0, 'rgba(255,220,150,.3)'); g.addColorStop(1, 'rgba(255,220,150,.04)'); c.fillStyle = g; c.beginPath(); c.moveTo(x - 50, y - 860); c.lineTo(x + 50, y - 860); c.lineTo(x + 460, y + 40); c.lineTo(x - 460, y + 40); c.closePath(); c.fill(); c.restore(); }
}
function bareTree(c, x, b, s, col, leaves, seed) {
  c.save(); c.translate(x, b); c.scale(s, s);
  const br = (x0, y0, a, l, d) => { const x1 = x0 + Math.cos(a) * l, y1 = y0 + Math.sin(a) * l; line(c, [x0, y0, x1, y1], Math.max(2, d * 5), col); if (d > 0) { br(x1, y1, a - .35 - rnd(seed + d * 7 + x0) * .2, l * .72, d - 1); br(x1, y1, a + .35 + rnd(seed + d * 3 + y0) * .2, l * .72, d - 1); } else if (leaves) { circle(c, x1, y1, 26); c.fillStyle = leaves; c.fill(); } };
  br(0, 0, -Math.PI / 2, 260, 5); c.restore();
}
function pigeonFlock(c, x0, x1, t, n = 7, o = {}) { for (let i = 0; i < n; i++) { const x = x0 + rnd(i + 5) * (x1 - x0) + Math.sin(t * .8 + i) * 20; if (o.fly && t > o.fly + i * .05) { const k = t - o.fly - i * .05; flyingBird(c, x + k * 300 * (i % 2 ? 1 : -1), -60 - k * 500, t); } else pigeon(c, x, t + i, 0); } }
function flyingBird(c, x, y, t) { const f = Math.sin(t * 30) * 30; c.beginPath(); c.moveTo(x - 50, y - f); c.quadraticCurveTo(x - 20, y - 20, x, y); c.quadraticCurveTo(x + 20, y - 20, x + 50, y - f); c.lineWidth = 8; c.strokeStyle = '#6a6e80'; c.stroke(); ell(c, x, y, 18, 10); fs(c, '#8a8e9e', 2); }
function kaufhaus(c, cam, t, o = {}) {
  const r = room(c, cam, t, { wall: '#c8c0b0', floor: '#d8d4cc', floorType: 'tile', light: 'day', wallpaper: false, lampsCeil: [-1800, -600, 600, 1800], back: (c, b) => {
    // escalator (diagonal) + stairs + racks + 'Ausgang'
    c.save(); c.fillStyle = '#9aa0a8'; c.beginPath(); c.moveTo(-1500, b); c.lineTo(-700, b - 900); c.lineTo(-560, b - 900); c.lineTo(-1360, b); c.closePath(); c.fill(); c.lineWidth = 4; c.strokeStyle = OUT; c.stroke(); for (let i = 0; i < 18; i++) { const k = ((i / 18 + t * .15) % 1); line(c, [-1500 + 800 * k + 10, b - 900 * k, -1360 + 800 * k - 10, b - 900 * k], 3, '#5a6068'); } line(c, [-1520, b - 120, -720, b - 1020], 14, '#2a2e34'); c.restore();
    c.fillStyle = '#b0a898'; c.fillRect(-5000, b - 1000, 10000, 40);
    for (let i = 0; i < 4; i++) suitRack(c, 200 + i * 420, b);
    sign(c, 1900, b - 760, 'Ausgang', { size: 50, bg: '#1a6a3a', glow: '120,255,160' }); sign(c, 300, b - 860, 'Herren', { size: 44, bg: '#3a3a44' });
    for (let i = 0; i < 6; i++) silhouette(c, cc => drawPal(cc, { look: ['wife', 'colleague', 'informant'][i % 3], side: true, x: -400 + i * 480 + Math.sin(t * .5 + i) * 60, y: b, k: .34, s: i % 2 ? 1 : -1, walk: t * 6 + i, outfit: 'home' }), 'rgba(70,64,60,.55)');
  } });
  return r;
}
function suitRack(c, x, b) { line(c, [x - 170, b - 640, x + 170, b - 640], 8, '#444'); line(c, [x, b - 640, x, b], 8, '#444'); for (let i = 0; i < 7; i++) { const sx = x - 150 + i * 50; c.beginPath(); c.moveTo(sx - 30, b - 620); c.lineTo(sx + 30, b - 620); c.lineTo(sx + 34, b - 330); c.lineTo(sx - 34, b - 330); c.closePath(); fs(c, ['#1f2a45', '#3a3a3e', '#4a3a2e', '#2a3a2a'][i % 4], 2); } }
function tramInside(c, cam, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#1a1c24'; c.fillRect(0, 0, W, H);
  layer(c, cam, .9, c => {
    c.fillStyle = '#c8b890'; c.fillRect(-4000, -1600, 8000, 1500);
    for (let i = -4; i <= 4; i++) { const wx = i * 700 - 280; viewRect(c, wx, -1250, 560, 520, 'rain', t); c.save(); c.beginPath(); c.rect(wx, -1250, 560, 520); c.clip(); for (let k = 0; k < 6; k++) { const lx = ((wx + k * 220 - t * 900) % 2000 + 2000) % 2000 - 1000 + wx; bloom(c, lx, -900, 70, ['255,200,120', '255,90,90', '120,170,255'][k % 3], .6); } c.restore(); c.beginPath(); rrect(c, wx - 12, -1262, 584, 544, 30); c.lineWidth = 16; c.strokeStyle = '#9a9a9e'; c.stroke(); }
    line(c, [-4000, -1450, 4000, -1450], 12, '#b8b8bc'); for (let i = -12; i < 12; i++) { line(c, [i * 320, -1450, i * 320, -1330], 4, '#888'); circle(c, i * 320, -1310, 22); c.lineWidth = 6; c.strokeStyle = '#d0c040'; c.stroke(); }
  });
  layer(c, cam, 1, c => { c.fillStyle = '#4a4a50'; c.fillRect(-4000, -100, 8000, 2000); for (let i = -6; i < 6; i++) { c.beginPath(); rrect(c, i * 700 - 250, -560, 500, 220, 30); fs(c, '#7a2a30', 3); c.beginPath(); rrect(c, i * 700 - 250, -360, 500, 120, 20); fs(c, '#8a3238', 3); line(c, [i * 700 - 200, -240, i * 700 - 200, -100], 12, '#555'); line(c, [i * 700 + 200, -240, i * 700 + 200, -100], 12, '#555'); } line(c, [-4000, -100, 4000, -100], 8, '#2a2a2e'); });
  return { base: '#4a4a50' };
}
function alley(c, cam, t) {
  const r = city(c, cam, t, { tod: 'night', seed: 9 });
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'multiply'; c.fillStyle = 'rgb(55,60,95)'; c.fillRect(0, 0, W, H); c.restore();
  layer(c, cam, 1, c => {
    c.fillStyle = '#2a2a34'; c.fillRect(-1400, -1300, 2800, 1040); for (let r2 = 0; r2 < 40; r2++) for (let k = 0; k < 30; k++) if (rnd(r2 * 30 + k) > .6) { c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(-1400 + k * 96 - (r2 % 2) * 48, -1300 + r2 * 26, 90, 22); }
    door(c, 0, -260, { col: '#5a5e66', frame: '#3a3e46', sign: 'Ausgang' }); c.fillStyle = '#5a5a60'; c.fillRect(-300, -270, 600, 14);
    for (const x of [-900, 800]) { c.beginPath(); c.rect(x - 110, -440, 220, 180); fs(c, '#2f4a3a', 3); }
    wetReflect(c, 0, -240, 200, '120,255,160', .35, t, 400); for (let i = 0; i < 4; i++) puddle(c, -800 + i * 520, 40 + rnd(i) * 80, 180, 26, t, { glow: '200,210,255' });
  });
  return r;
}
function board(c, cam, t, o = {}) {
  const r = room(c, cam, t, { wall: '#5a5e62', floor: '#4a4e52', floorType: 'carpet', light: 'grey', lampsCeil: [0], back: (c, b) => {
    const bx = -900, by = b - 1250, bw = 1800, bh = 900; c.beginPath(); c.rect(bx, by, bw, bh); fs(c, '#b8945a', 6); for (let i = 0; i < 300; i++) { c.fillStyle = 'rgba(80,50,20,.25)'; c.fillRect(bx + rnd(i) * bw, by + rnd(i + 3) * bh, 4, 4); }
    const pts = []; for (let i = 0; i < 9; i++) pts.push([bx + 150 + (i % 3) * 600 + rnd(i) * 200, by + 140 + Math.floor(i / 3) * 280 + rnd(i + 5) * 60]);
    const K = o.k ?? 1, pairs = [[0, 4], [4, 8], [1, 4], [2, 5], [3, 7], [4, 6], [5, 7], [0, 3], [6, 8]];
    pairs.forEach(([a, b2], i) => { const kk = clamp(K * pairs.length - i, 0, 1); if (kk <= 0) return; const [x1, y1] = pts[a], [x2, y2] = pts[b2]; line(c, [x1, y1, lerp(x1, x2, kk), lerp(y1, y2, kk)], 5, '#c02020'); });
    pts.forEach(([px, py], i) => { c.save(); c.translate(px, py); c.rotate((rnd(i + 9) - .5) * .12); c.fillStyle = '#efe8d8'; c.fillRect(-80, -100, 160, 200); c.fillStyle = '#9aa0a8'; c.fillRect(-64, -86, 128, 130); silhouette(c, cc => { circle(cc, 0, -40, 34); cc.fill(); cc.beginPath(); cc.ellipse(0, 30, 52, 34, 0, Math.PI, 0); cc.fill(); }, '#2a2e36'); c.fillStyle = '#c02020'; circle(c, 0, -96, 9); c.fill(); for (let k = 0; k < 2; k++) line(c, [-54, 64 + k * 16, 40 - k * 30, 64 + k * 16], 3, 'rgba(0,0,0,.4)'); c.restore(); });
  } });
  return r;
}
function gymSil(c, cam, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#d8dce0'; c.fillRect(0, 0, W, H);
  layer(c, cam, .9, c => { c.fillStyle = '#e8ecee'; c.fillRect(-4000, -2000, 8000, 2000); for (let i = -5; i < 5; i++) { c.fillStyle = '#fbfdff'; c.fillRect(i * 600 + 60, -1500, 420, 900); bloom(c, i * 600 + 270, -1000, 500, '255,255,255', .4); } });
  layer(c, cam, 1, c => { c.fillStyle = '#c0c4c8'; c.fillRect(-4000, -170, 8000, 1000); });
  return { base: '#c0c4c8' };
}
function beach(c, cam, t) {
  const HZ = -200, B = p => layerBase(cam, HZ, p);
  c.setTransform(1, 0, 0, 1, 0, 0); const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#4a9ad8'); g.addColorStop(1, '#bfe2f2'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  layer(c, cam, .2, c => { const b = B(.2); c.fillStyle = '#2a7ab0'; c.fillRect(-6000, b - 300, 12000, 300); for (let i = 0; i < 40; i++) line(c, [-4000 + i * 200 + Math.sin(t + i) * 30, b - 200 + (i % 5) * 40, -3900 + i * 200 + Math.sin(t + i) * 30, b - 200 + (i % 5) * 40], 4, 'rgba(255,255,255,.5)'); bloom(c, 900, b - 1300, 600, '255,250,220', .8); });
  layer(c, cam, 1, c => { c.fillStyle = '#e8d4a0'; c.fillRect(-6000, HZ, 12000, 3000); for (let i = 0; i < 300; i++) { c.fillStyle = 'rgba(160,130,80,.25)'; c.fillRect(-3000 + rnd(i) * 6000, HZ + rnd(i + 1) * 500, 6, 4); }
    for (const [x, col] of [[-1200, '#e05a4a'], [1300, '#3a8ad0']]) { line(c, [x, 0, x, -800], 12); c.beginPath(); c.moveTo(x - 420, -760); c.quadraticCurveTo(x, -980, x + 420, -760); c.closePath(); fs(c, col, 4); } });
  return { base: '#e8d4a0' };
}
function ceremonyHall(c, cam, t, o = {}) {
  const lite = o.light ?? 1;
  const r = room(c, cam, t, { wall: '#3a3440', floor: '#4a2a2a', floorType: 'carpet', light: 'cold', lampsCeil: [-1400, 0, 1400], lampOn: lite > .5, wainscot: true, back: (c, b) => { c.beginPath(); c.rect(-260, b - 360, 520, 360); fs(c, '#5a3a28', 4); c.fillStyle = '#7a1a22'; c.fillRect(-1200, b - 1400, 300, 1000); c.fillRect(900, b - 1400, 300, 1000); } });
  layer(c, cam, 1, c => { for (let row = 0; row < 3; row++) for (let i = -7; i <= 7; i++) chairBack(c, i * 300 + (row % 2) * 150, { col: '#5a2a2a' }); });
  if (lite < 1) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = `rgba(0,0,0,${(1 - lite) * .9})`; c.fillRect(0, 0, W, H); c.restore(); }
  return r;
}
function houseFront(c, cam, t, o = {}) {
  const r = city(c, cam, t, { tod: 'day', seed: 21 });
  layer(c, cam, 1, c => {
    c.beginPath(); c.rect(-700, -1500, 1500, 1240); fs(c, '#d8c8a8', 3);
    door(c, 0, -260, { col: '#2a4a6a' }); c.beginPath(); c.rect(-260, -280, 520, 24); fs(c, '#b8b0a0', 2);
    for (const wx of [-560, 420]) { viewRect(c, wx - 110, -1400, 220, 300, 'none', t); c.fillStyle = '#5a6a7a'; c.fillRect(wx - 110, -1400, 220, 300); c.beginPath(); c.rect(wx - 120, -1410, 240, 320); c.lineWidth = 14; c.strokeStyle = '#f2eee4'; c.stroke(); }
    if (o.noahAtWindow) { c.save(); c.beginPath(); c.rect(310, -1400, 220, 300); c.clip(); drawNoah(c, { x: 420, y: -800, k: .35, ink: 1.8, outfit: 'home', expr: o.noahExpr || EX.alert }); c.restore(); c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(310, -1400, 220, 300); }
    plantPot(c, -420, .7, -260); plantPot(c, 420, .7, -260);
  });
  return r;
}
