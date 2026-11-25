// PRESS HALL, East Berlin, evening of 9 Nov (generic, no emblems, no logos). 1 m ≈ 220 units.
//   pressHallA: reverse view from the podium towards the journalists (Noah stands among them at x = 0).
//   pressHallB: view from the hall towards the podium table (spokesman seated at x = 0).
//   pressLightA / pressLightB: screen-space light (spots, glare, haze, grade).
const PH = { wall: '#ece3cf', wallShade: '#d8ccb2', wood: '#8a5a36', woodDark: '#5e3b22', woodLight: '#a8754a', carpet: '#7c4a3c', carpetDark: '#5e3530',
  curtain: '#c9b48c', curtainDark: '#a8946c', drape: '#5f7290', drapeDark: '#46566e', spot: '255,250,236', HZ: -330 };
const sDepth = (s) => PH.HZ + (0 - PH.HZ) * s; // feet y of a row at depth scale s (eye-level camera)

// ---------- props ----------
function tvLight(c, x, y, s, on = 1, ang = 0) {
  // TV spot on a tripod, facing the camera (lens = bright disc); y = floor, s = depth scale
  c.save(); c.translate(x, y); c.scale(s, s);
  const hy = -520;
  line(c, [0, 0, -70, 0], 6, '#2a2a2e'); line(c, [0, 0, 70, 0], 6, '#2a2a2e'); line(c, [0, -150, -80, 0], 7, '#3a3a40'); line(c, [0, -150, 80, 0], 7, '#3a3a40'); line(c, [0, -150, 0, 0], 7, '#3a3a40');
  line(c, [0, -150, 0, hy + 40], 10, '#4a4a52'); line(c, [-46, hy + 10, 46, hy + 10], 8, '#3a3a40');
  c.translate(0, hy); c.rotate(ang);
  c.beginPath(); c.rect(-64, -58, 128, 112); fs(c, '#2e2e34', 6);
  for (const sx of [-1, 1]) { c.beginPath(); c.moveTo(sx * 64, -58); c.lineTo(sx * 104, -86); c.lineTo(sx * 104, 80); c.lineTo(sx * 64, 54); c.closePath(); fs(c, '#3c3c44', 5); }
  c.beginPath(); c.moveTo(-64, -58); c.lineTo(-90, -96); c.lineTo(90, -96); c.lineTo(64, -58); c.closePath(); fs(c, '#36363e', 5);
  circle(c, 0, -2, 46); fs(c, on ? '#fffdf4' : '#9aa0a8', 5);
  if (on) { circle(c, 0, -2, 30); c.fillStyle = '#ffffff'; c.fill(); }
  c.restore();
  if (on) { bloom(c, x, y + (hy - 2) * s, 260 * s * on, PH.spot, .85 * on); bloom(c, x, y + (hy - 2) * s, 90 * s, '255,255,255', .9 * on); }
}
function engCamFront(c, x, y, s, t, seed = 0) {
  // shoulder TV camera seen from the front (lens towards us), centre (x, y) = lens
  c.save(); c.translate(x, y); c.scale(s, s);
  c.beginPath(); c.rect(-70, -64, 150, 120); fs(c, '#d8d4cc', 5); c.beginPath(); c.rect(-70, 30, 150, 26); fs(c, '#4a4a50', 4);
  line(c, [-50, -80, 60, -80], 12); line(c, [-50, -80, 60, -80], 6, '#555'); line(c, [-40, -64, -40, -80], 8); line(c, [50, -64, 50, -80], 8);
  circle(c, 0, 0, 56); fs(c, '#2a2a30', 6); circle(c, 0, 0, 40); fs(c, '#3a4a5e', 4); circle(c, 0, 0, 22); fs(c, '#1a2230', 3);
  c.beginPath(); c.arc(-8, -10, 14, Math.PI, Math.PI * 1.6); c.lineWidth = 5; c.strokeStyle = 'rgba(255,255,255,.7)'; c.stroke();
  circle(c, 62, -48, 8); fs(c, Math.sin(t * 4 + seed) > -.2 ? '#ff3a2a' : '#7a2a2a', 3); // tally light
  c.restore();
  bloom(c, x + 62 * s, y - 48 * s, 30 * s, '255,80,60', .5);
}
function flashBurst(c, x, y, s, k) {
  // camera flash bloom, k = life 0..1
  if (k <= 0 || k >= 1) return; const a = (1 - k) * (1 - k);
  bloom(c, x, y, 520 * s * (.6 + k), '255,255,250', .95 * a); bloom(c, x, y, 160 * s, '255,255,255', a);
  c.save(); c.globalCompositeOperation = 'screen'; c.globalAlpha = a; c.translate(x, y);
  for (let i = 0; i < 4; i++) { c.rotate(Math.PI / 4); c.beginPath(); c.moveTo(-260 * s, 0); c.lineTo(0, -8 * s); c.lineTo(260 * s, 0); c.lineTo(0, 8 * s); c.closePath(); c.fillStyle = '#fffef6'; c.fill(); }
  c.restore();
}
// flash schedule: [time, x, y, s]; returns active flashes
function flashesAt(t, list) { return list.filter(f => t >= f[0] && t < f[0] + .18); }
function standMic(c, x, y, s, col, h = 1, ang = 0) {
  // table microphone on a gooseneck stand, base at (x, y)
  c.save(); c.translate(x, y); c.scale(s, s);
  ell(c, 0, 0, 34, 10); fs(c, '#2a2a2e', 4);
  c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-10 * h, -90 * h, 16 * h * Math.sin(ang) + 6, -150 * h); c.lineWidth = 12; c.strokeStyle = OUT; c.stroke(); c.lineWidth = 6; c.strokeStyle = '#4a4a52'; c.stroke();
  c.translate(16 * h * Math.sin(ang) + 6, -150 * h); c.rotate(ang);
  c.beginPath(); c.roundRect(-20, -66, 40, 70, 18); fs(c, col, 5); c.globalAlpha = .25; for (let i = 0; i < 4; i++) line(c, [-14, -54 + i * 14, 14, -54 + i * 14], 2.5, '#fff'); c.globalAlpha = 1;
  c.restore();
}
function journalistBack(c, x, y, s, col, hair, o = {}) {
  // a journalist seen from behind (foreground silhouette): head, shoulders, optional raised hand
  c.save(); c.translate(x, y); c.scale(s, s);
  c.beginPath(); c.moveTo(-170, 80); c.quadraticCurveTo(-170, -150, -60, -180); c.lineTo(60, -180); c.quadraticCurveTo(170, -150, 170, 80); c.closePath(); fs(c, col, 7);
  line(c, [-10, -170, -6, 60], 4, shade(col, -.25));
  if (o.hand) { const hx = o.hand * 120, hy = -330 - (o.lift || 0) * 140; line(c, [o.hand * 110, -150, hx, hy], 70, OUT); line(c, [o.hand * 110, -150, hx, hy], 56, col); circle(c, hx, hy - 30, 30); fs(c, '#f4d8b4', 6); }
  circle(c, 0, -250, 106); fs(c, hair, 7);
  c.save(); circle(c, 0, -250, 106); c.clip(); for (let i = -4; i <= 4; i++) line(c, [i * 22, -360, i * 26, -150], 5, shade(hair, -.22)); c.restore();
  if (o.mic) { line(c, [130, -100, 210, -330], 24, OUT); line(c, [130, -100, 210, -330], 14, '#2a2a30'); ell(c, 216, -360, 34, 40); fs(c, o.mic, 6); }
  c.restore();
}

// ---------- set A: audience (reverse view) ----------
function pressHallA(c, cam, t, o = {}) {
  // back wall (p .45): only y -950..-180 is ever on screen, so the detail lives there
  layer(c, cam, .45, c => {
    const B = -180;
    c.fillStyle = PH.wall; c.fillRect(-4000, -4200, 8000, 4200 + B);
    // lighting truss with hanging fresnels across the top
    line(c, [-4000, -1010, 4000, -1010], 16, '#3a3a40'); line(c, [-4000, -960, 4000, -960], 10, '#4a4a52');
    for (let i = -40; i < 40; i++) line(c, [i * 100, -1010, i * 100 + 50, -960], 4, '#4a4a52');
    for (let i = -8; i <= 8; i++) { const lx = i * 420 + 90; c.save(); c.translate(lx, -950); c.rotate(.25 * Math.sin(i)); c.beginPath(); c.rect(-34, 0, 68, 80); fs(c, '#2e2e34', 4); circle(c, 0, 84, 26); fs(c, '#fff8e0', 3); c.restore(); bloom(c, lx, -866, 150, '255,245,220', .55); }
    // tall windows with heavy curtains (evening: deep blue glass); lower part visible
    for (let i = -6; i <= 6; i++) {
      const wx = i * 520 - 150;
      c.beginPath(); c.rect(wx, -900, 300, 520); fs(c, '#2c3a62', 4);
      for (let k = 1; k < 3; k++) line(c, [wx, -900 + k * 173, wx + 300, -900 + k * 173], 6, '#e8e0d0'); line(c, [wx + 150, -900, wx + 150, -380], 6, '#e8e0d0');
      for (let k = 0; k < 4; k++) { circle(c, wx + 40 + rnd(i * 9 + k) * 220, -860 + rnd(i * 5 + k) * 200, 4); c.fillStyle = '#ffd98a'; c.fill(); }
      for (const s of [-1, 1]) { const cx = s < 0 ? wx : wx + 300;
        c.beginPath(); c.moveTo(cx - 60, -940); c.lineTo(cx + 60, -940); c.quadraticCurveTo(cx + 30 * s, -650, cx + 50 * s, -360); c.lineTo(cx - 50 * s, -360); c.quadraticCurveTo(cx - 20 * s, -650, cx - 60, -940); c.closePath(); fs(c, PH.curtain, 3);
        for (let k = 0; k < 4; k++) line(c, [cx - 40 + k * 26, -930, cx - 40 + k * 26 + 12 * s, -370], 3, PH.curtainDark);
        line(c, [cx - 40 * s, -560, cx + 50 * s, -540], 6, '#b08a3a'); }
    }
    // wood wainscot
    c.fillStyle = PH.wood; c.fillRect(-4000, -330, 8000, 330 + B);
    for (let i = -40; i <= 40; i++) { line(c, [i * 100, -330, i * 100, B], 3, PH.woodDark); c.fillStyle = 'rgba(255,220,170,.14)'; c.fillRect(i * 100 + 8, -320, 20, 320 + B); }
    line(c, [-4000, -330, 4000, -330], 12, PH.woodDark); line(c, [-4000, -350, 4000, -350], 8, PH.woodLight);
    // radiators + a rack of coats
    for (let i = -5; i <= 5; i++) { const rx = i * 520 - 10; c.beginPath(); c.rect(rx, -300, 180, 100); fs(c, '#e4e0d6', 3); for (let k = 1; k < 9; k++) line(c, [rx + k * 20, -296, rx + k * 20, -204], 3, '#bcb6aa'); }
    c.fillStyle = PH.carpet; c.fillRect(-4000, B, 8000, 3000);
  });
  haze(c, '255,248,230', .18);
  // carpet floor in world space
  layer(c, cam, 1, c => {
    const g = c.createLinearGradient(0, PH.HZ, 0, 600); g.addColorStop(0, PH.carpetDark); g.addColorStop(1, PH.carpet);
    c.fillStyle = g; c.fillRect(-5000, sDepth(.3), 10000, 4000);
    for (let i = 0; i < 60; i++) { const s = .3 + rnd(i + 3) * .9, y = sDepth(s); c.fillStyle = 'rgba(40,20,20,.12)'; c.fillRect(-3000 + rnd(i) * 6000, y, 80 * s, 6 * s); }
    // cables on the floor
    for (let i = 0; i < 5; i++) { const y = sDepth(.5 + i * .12); c.beginPath(); c.moveTo(-3000, y); c.bezierCurveTo(-800 + i * 200, y + 30, 200 - i * 300, y - 20, 3000, y + 15); c.lineWidth = 6 * (.5 + i * .12); c.strokeStyle = '#1c1a1c'; c.stroke(); }
    // far rows: standing crowd + TV lights + cameras
    const rows = [[.42, 22], [.52, 16], [.64, 12]];
    rows.forEach(([s, n], r) => {
      const y = sDepth(s);
      if (r === 1) for (let i = -3; i <= 3; i++) tvLight(c, i * 620 + 160, y - 2, s * 1.05, o.lights ?? 1, Math.sin(i * 1.7) * .08);
      if (r === 2) for (const lx of [-1250, -470, 470, 1250]) tvLight(c, lx, sDepth(.72), .78, o.lights ?? 1, lx < 0 ? .12 : -.12);
      for (let i = 0; i < n; i++) {
        const x = (i - n / 2) * (2600 / n) * (1 + r * .2) + (rnd(i * 7 + r) - .5) * 70, who = (r + i) % 2 ? JOURN[(i + r) % 8] : CROWD[(i * 3 + r) % 8];
        const p = P(who, x, { y, sc: PSC * s, look: [0, 0], mouth: rnd(i + r * 9) > .6 ? 'o' : 'flat',
          main: rnd(i + r) > .7 ? { pose: 'up', item: (c2, oo, tt) => itemMic(c2, {}) } : (rnd(i + 2 * r) > .5 ? { pose: 'hold', item: (c2) => itemPad(c2) } : 'down'), off: 'front' });
        person(c, t, p);
        if (r === 2 && i % 4 === 1) engCamFront(c, x + 60 * s, y - 610 * PSC * s, s * .55, t, i);
        if (r === 1 && i % 5 === 2) { const fx = x + 40 * s, fy = y - 700 * PSC * s; c.save(); c.translate(fx, fy); c.scale(s * .5, s * .5); itemFlashCam(c, t, false); c.restore(); }
      }
    });
  });
  return { base: PH.wall };
}
function pressLightA(c, cam, t, o = {}) {
  // screen: warm/cool grade + floating dust in the spot beams + flashes
  c.setTransform(1, 0, 0, 1, 0, 0);
  grade(c, { sx: .5, sy: .32, warm: '255,236,200', warmA: .22, cool: '40,40,80', coolA: .18 });
  c.save(); c.translate(W / 2, H / 2); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y);
  motes(c, cam.x - 600, cam.x + 600, -900, 100, t, { n: 40, alpha: .5, speed: .02 });
  for (const f of flashesAt(t, o.flashes || [])) flashBurst(c, f[1], f[2], f[3], (t - f[0]) / .18);
  c.restore();
}

// ---------- set B: podium (hall view) ----------
function pressHallB(c, cam, t, o = {}) {
  layer(c, cam, .6, c => {
    const B = -60;
    c.fillStyle = PH.wall; c.fillRect(-5000, -4000, 10000, 4000);
    // pleated blue-grey backdrop curtain behind the table
    c.fillStyle = PH.drape; c.fillRect(-1300, -2600, 2600, 2600 + B);
    for (let i = 0; i < 40; i++) { const x = -1300 + i * 65; c.fillStyle = i % 2 ? PH.drapeDark : '#6c80a0'; c.globalAlpha = .55; c.fillRect(x, -2600, 26, 2600 + B); c.globalAlpha = 1; }
    c.beginPath(); c.rect(-1360, -2680, 2720, 90); fs(c, PH.woodDark, 4);
    // side wood panels with wall lamps
    for (const s of [-1, 1]) {
      c.fillStyle = PH.wood; c.fillRect(s > 0 ? 1300 : -5000, -2600, 3700, 2600 + B);
      for (let i = 0; i < 30; i++) line(c, [s * (1300 + i * 120), -2600, s * (1300 + i * 120), B], 3, PH.woodDark);
      for (const lx of [1600, 2300]) { c.beginPath(); c.rect(s * lx - 40, -1700, 80, 120); fs(c, '#f6ecd0', 4); bloom(c, s * lx, -1640, 260, '255,220,160', .5); }
    }
    // shadows of the officials cast on the curtain by the TV lights
    c.fillStyle = 'rgba(30,30,60,.22)'; for (const x of [-560, 40, 620]) { ell(c, x + 90, -760, 150, 170); c.fill(); c.fillRect(x - 40, -640, 260, 600); }
    c.fillStyle = PH.carpet; c.fillRect(-5000, B, 10000, 3000);
  });
  haze(c, '255,250,235', .12);
  layer(c, cam, 1, c => {
    // officials seated behind the table
    const sit = (who, x, o2) => person(c, t, P(who, x, Object.assign({ sit: 1, look: [0, .2], main: 'front', off: 'front' }, o2)));
    sit('off2', -560, { look: [.4, .3], mouth: 'flat', lid: .35 });
    sit('off1', 620, { s: -1, look: [.3, .4], mouth: 'flat' });
    if (o.spokes !== false) person(c, t, Object.assign(P('spokes', 0, { sit: 1, main: 'front', off: 'front', look: [0, .25] }), o.spokes || {}));
    // table with felt cloth
    const top = -150;
    c.beginPath(); c.rect(-1600, top, 3200, 220); fs(c, '#3e5a48', 5);
    c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(-1600, top + 10, 3200, 210);
    c.beginPath(); c.rect(-1620, top - 16, 3240, 22); fs(c, '#4e6e58', 4);
    for (let i = 0; i < 16; i++) line(c, [-1580 + i * 210, top + 20, -1560 + i * 210, top + 214], 3, '#34503e');
    // papers, glasses of water, ashtray, nameplate-less stands
    for (const x of [-700, 470]) { c.beginPath(); c.moveTo(x, top - 4); c.lineTo(x + 120, top - 8); c.lineTo(x + 130, top + 6); c.lineTo(x + 6, top + 8); c.closePath(); fs(c, '#f4f1e6', 2.5); }
    for (const x of [-420, 330]) { c.beginPath(); c.moveTo(x - 14, top - 64); c.lineTo(x + 14, top - 64); c.lineTo(x + 11, top - 6); c.lineTo(x - 11, top - 6); c.closePath(); fs(c, 'rgba(200,225,240,.7)', 3); c.fillStyle = 'rgba(150,190,220,.6)'; c.fillRect(x - 11, top - 40, 22, 32); }
    ell(c, 760, top - 6, 30, 9); fs(c, '#8a8a90', 3);
    // microphone cluster in front of the spokesman
    const mics = [['#3a3a40', -150, .95, -.25], ['#c23a2a', -95, 1.15, -.12], ['#2a4a8a', -40, 1.25, -.04], ['#e8e4d8', 20, 1.2, .05], ['#3a3a40', 80, 1.1, .14], ['#d8a020', 140, .95, .24], ['#2a2a2e', 190, .85, .3]];
    for (const [col, x, h, a] of mics) standMic(c, x, top - 4, .9, col, h * .9, a);
    line(c, [-170, top + 2, 220, top + 2], 8, '#1a1a1c');
    // TV lights' hot spot on the table front
    bloom(c, 0, top - 200, 700, '255,250,235', .25);
  });
  return { base: PH.wall };
}
function pressLightB(c, cam, t, o = {}) {
  c.setTransform(1, 0, 0, 1, 0, 0);
  grade(c, { sx: .5, sy: .1, warm: '255,240,210', warmA: .2, cool: '40,40,90', coolA: .2 });
  c.save(); c.translate(W / 2, H / 2); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y);
  motes(c, cam.x - 600, cam.x + 600, -900, 0, t, { n: 36, alpha: .45, speed: .02 });
  for (const f of flashesAt(t, o.flashes || [])) flashBurst(c, f[1], f[2], f[3], (t - f[0]) / .18);
  c.restore();
}
