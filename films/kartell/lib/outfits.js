// KARTELL film: Noah's four outfits as clothing layers over the UNCHANGED rig (noah.js).
// Head, hair, face, hands and all proportions come from noah.js; only clothes are drawn here.
//   drawNoahK(c, { x, y, k: .25, ink: 1.8, outfit: 'lager'|'aufstieg'|'boss'|'haft', arms, expr, tilt, bob, hold })
//   hold(c) is drawn after the sleeves and before the hands (a box, a cup ...), rig units, origin between the feet.
// Expression presets (KX) include add-ons drawn on top of the unchanged face: bags (tired eyes), sweat.
const KX = {
  tired:    { lid: .5, bags: 1, mouth: 'flat', look: 0 },
  thrill:   { lid: .05, mouth: 'smile', look: .2 },
  arrogant: { lid: .3, mouth: 'soft', browUp: .1 },
  paranoid: { lid: .1, look: -.9, mouth: 'flat', browUp: .35 },
  fear:     { lid: 0, browUp: 1, mouth: 'o' },
  guilt:    { lid: .62, look: 0, mouth: 'flat', down: 1 },
  empty:    { lid: .6, look: 0, mouth: 'flat', bags: .6 },
  serious:  { lid: .15, mouth: 'flat' },
};
const OUTFIT = {
  lager:    { pants: '#4b4f45', pantsDark: '#3a3d35', seam: '#62675b', shoe: '#5a3e28', sole: '#2a2420', top: '#8d9096', topDark: '#6f7277', sleeve: '#8d9096', vest: '#f07a1e', vestDark: '#c85f12', refl: '#dfe3e6' },
  aufstieg: { pants: '#3e5878', pantsDark: '#2f4560', seam: '#c9a45a', shoe: '#f4f2ee', sole: '#d8d4cc', top: '#ece9e3', jacket: '#1f1c1d', jacketHi: '#4a4446', sleeve: '#1f1c1d' },
  boss:     { pants: '#1e2840', pantsDark: '#161d31', seam: '#2c3858', shoe: '#141214', sole: '#0a0a0a', top: '#dde7f1', jacket: '#1f2a46', jacketHi: '#33416a', coat: '#2b2a2e', coatHi: '#45434a', sleeve: '#2b2a2e' },
  haft:     { pants: '#8f9398', pantsDark: '#7a7e83', seam: '#a5a9ad', shoe: '#1e1e22', sole: '#111', top: '#9a9ea3', topDark: '#83878c', sleeve: '#9a9ea3', sock: '#d9d6cf' },
};
const kFill = (c, fill, w = NOAH.W) => nFill(c, fill, w);
function kPoly(c, pts) { c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.closePath(); }

// ---------- legs + shoes ----------
function kLegs(c, o, outfit) {
  const top = NOAH.HEM - 10, jeans = outfit === 'aufstieg', track = outfit === 'haft';
  for (const s of [-1, 1]) {
    const bottom = outfit === 'lager' ? -150 : -95;
    kPoly(c, [s * 4, top, s * 118, top, s * (track ? 112 : 108), bottom, s * 14, bottom]); kFill(c, o.pants);
    c.save(); c.clip();
    // shading on the inner leg + fabric detail
    c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(s > 0 ? 4 : -40, top, 36, 600);
    if (jeans) { // outer seam, fading at the knee, small rip-free wear
      nLine(c, [s * 100, top, s * 96, bottom], 4, o.seam);
      c.fillStyle = 'rgba(255,255,255,.13)'; c.beginPath(); c.ellipse(s * 62, -330, 34, 70, 0, 0, Math.PI * 2); c.fill();
      for (let i = 0; i < 4; i++) nLine(c, [s * 30, -170 + i * 14, s * 92, -176 + i * 14], 2, 'rgba(20,30,50,.35)');
    } else if (outfit === 'lager') { // knee pad pockets + cargo pocket
      c.beginPath(); c.roundRect(s > 0 ? 30 : -100, -380, 70, 90, 10); kFill(c, o.pantsDark, 6);
      c.beginPath(); c.roundRect(s > 0 ? 70 : -112, -500, 42, 110, 6); kFill(c, o.pantsDark, 5);
      nLine(c, [s * 20, -455, s * 108, -455], 3, o.seam);
    } else if (track) { // side stripe + knee bagging
      nLine(c, [s * 104, top, s * 100, bottom], 9, '#b9bcc0'); for (let i = 0; i < 3; i++) nLine(c, [s * 30, -300 + i * 18, s * 84, -306 + i * 18], 3, 'rgba(60,60,70,.25)');
    } else { // suit trousers: crease
      nLine(c, [s * 62, top, s * 60, bottom], 3, o.seam);
    }
    c.restore();
    if (outfit === 'lager') { // work boots: tall, chunky, laces, thick sole
      kPoly(c, [s * 10, -175, s * 112, -175, s * 120, -95, s * 200, -70, s * 206, -18, s * 26, -18]); kFill(c, o.shoe);
      c.beginPath(); c.rect(s > 0 ? 18 : -210, -24, 192, 26); kFill(c, o.sole, NOAH.W * .7);
      for (let i = 0; i < 4; i++) nLine(c, [s * 40, -160 + i * 20, s * 90, -152 + i * 20], 4, '#c9a46a');
      nLine(c, [s * 140, -76, s * 196, -60], 4, 'rgba(255,255,255,.25)');
    } else if (outfit === 'aufstieg') { // white sneakers with an invented logo (zig-zag "V" tab)
      c.beginPath(); c.moveTo(s * 18, -100); c.lineTo(s * 108, -100); c.quadraticCurveTo(s * 196, -70, s * 204, -26); c.lineTo(s * 200, -4); c.lineTo(s * 22, -4); c.quadraticCurveTo(s * 8, -50, s * 18, -100); kFill(c, o.shoe);
      c.beginPath(); c.rect(s > 0 ? 16 : -206, -26, 190, 26); kFill(c, o.sole, NOAH.W * .6);
      nLine(c, [s * 70, -66, s * 96, -44, s * 118, -70, s * 146, -46], 7, '#2a6fd6');
      for (let i = 0; i < 3; i++) nLine(c, [s * 44, -92 + i * 14, s * 84, -88 + i * 14], 3, '#b8b4ac');
    } else if (outfit === 'boss') { // polished oxford
      c.beginPath(); c.moveTo(s * 20, -98); c.lineTo(s * 108, -98); c.quadraticCurveTo(s * 196, -70, s * 202, -20); c.quadraticCurveTo(s * 196, 2, s * 140, 2); c.lineTo(s * 30, 2); c.quadraticCurveTo(s * 10, -40, s * 20, -98); kFill(c, o.shoe);
      nLine(c, [s * 120, -70, s * 176, -48], 6, 'rgba(255,255,255,.35)'); nLine(c, [s * 30, -12, s * 190, -12], 3, '#3a3438');
    } else { // haft: socks + black slides
      c.beginPath(); c.moveTo(s * 20, -98); c.lineTo(s * 108, -98); c.quadraticCurveTo(s * 186, -72, s * 196, -26); c.lineTo(s * 26, -26); c.quadraticCurveTo(s * 10, -60, s * 20, -98); kFill(c, o.sock, NOAH.W * .8);
      c.beginPath(); c.moveTo(s * 34, -74); c.quadraticCurveTo(s * 90, -92, s * 138, -66); c.lineTo(s * 142, -26); c.lineTo(s * 34, -28); c.closePath(); kFill(c, o.shoe, NOAH.W * .8);
      c.beginPath(); c.rect(s > 0 ? 18 : -206, -24, 188, 22); kFill(c, o.sole, NOAH.W * .6);
    }
  }
}

// ---------- torso garments ----------
const SHOULDER_PATH = (c, hem, wide = 0) => {
  c.beginPath(); c.moveTo(-58, -952); c.lineTo(-150 - wide, -942); c.quadraticCurveTo(-140 - wide, -820, -128 - wide, -760); c.lineTo(-124 - wide, hem); c.lineTo(128 + wide, hem);
  c.lineTo(132 + wide, -760); c.quadraticCurveTo(144 + wide, -820, 155 + wide, -942); c.lineTo(58, -952); c.quadraticCurveTo(0, -915, -58, -952); c.closePath();
};
function kTorso(c, o, outfit) {
  if (outfit === 'lager') {
    // hood bunched behind the neck
    c.beginPath(); c.moveTo(-130, -930); c.quadraticCurveTo(-150, -1030, -60, -1045); c.lineTo(60, -1045); c.quadraticCurveTo(150, -1030, 130, -930); c.closePath(); kFill(c, o.topDark);
    SHOULDER_PATH(c, -470, 8); kFill(c, o.top);
    c.save(); SHOULDER_PATH(c, -470, 8); c.clip();
    c.beginPath(); c.rect(-140, -510, 290, 40); kFill(c, o.topDark, 6); for (let i = 0; i < 14; i++) nLine(c, [-130 + i * 20, -508, -130 + i * 20, -472], 2, 'rgba(0,0,0,.18)');
    c.restore();
    nLine(c, [-26, -935, -30, -820], 5, '#e9e6df'); nLine(c, [26, -935, 30, -830], 5, '#e9e6df');
    return;
  }
  if (outfit === 'haft') {
    SHOULDER_PATH(c, -470, 6); kFill(c, o.top);
    c.save(); SHOULDER_PATH(c, -470, 6); c.clip();
    c.beginPath(); c.rect(-140, -510, 290, 40); kFill(c, o.topDark, 6);
    c.fillStyle = 'rgba(0,0,0,.08)'; c.beginPath(); c.ellipse(60, -640, 60, 120, .2, 0, Math.PI * 2); c.fill();
    for (let i = 0; i < 3; i++) nLine(c, [-90 + i * 30, -600, -60 + i * 30, -540], 3, 'rgba(0,0,0,.12)');
    c.restore();
    c.beginPath(); c.moveTo(-66, -950); c.quadraticCurveTo(0, -900, 66, -950); c.lineWidth = 22; c.strokeStyle = NOAH.out; c.stroke(); c.lineWidth = 12; c.strokeStyle = o.topDark; c.stroke();
    return;
  }
  if (outfit === 'aufstieg') {
    SHOULDER_PATH(c, -500); kFill(c, o.top); // white crew tee underneath (no lettering)
    c.beginPath(); c.moveTo(-58, -952); c.quadraticCurveTo(0, -915, 58, -952); c.lineWidth = 12; c.strokeStyle = NOAH.out; c.stroke(); c.lineWidth = 6; c.strokeStyle = '#d9d5cc'; c.stroke();
    // leather jacket: two front panels, open, wide collar, zip, waistband
    for (const s of [-1, 1]) {
      kPoly(c, [s * 50, -960, s * 160, -946, s * 168, -760, s * 162, -470, s * 60, -470, s * 66, -700, s * 30, -900]); kFill(c, o.jacket);
      c.save(); c.clip();
      c.fillStyle = o.jacketHi; c.beginPath(); c.ellipse(s * 120, -820, 18, 90, s * .1, 0, Math.PI * 2); c.fill();
      c.globalAlpha = .7; nLine(c, [s * 80, -620, s * 150, -600], 4, o.jacketHi); nLine(c, [s * 84, -580, s * 140, -570], 3, o.jacketHi); c.globalAlpha = 1;
      c.beginPath(); c.rect(s > 0 ? 55 : -175, -510, 120, 40); kFill(c, '#141213', 5);
      nLine(c, [s * 82, -720, s * 140, -730], 5, '#8d8a86'); // pocket zip
      c.restore();
      // collar / lapel
      kPoly(c, [s * 46, -965, s * 120, -960, s * 112, -880, s * 66, -790, s * 40, -900]); kFill(c, '#2a2627', NOAH.W * .8);
      nLine(c, [s * 64, -900, s * 64, -480], 4, '#8d8a86');
    }
    return;
  }
  // boss: shirt, navy suit jacket with lapels, open dark coat on top
  SHOULDER_PATH(c, -500); kFill(c, o.top);
  for (const s of [-1, 1]) { kPoly(c, [s * 10, -930, s * 60, -955, s * 86, -900, s * 40, -860]); kFill(c, '#f2f6fa', NOAH.W * .7); } // open collar
  for (const s of [-1, 1]) {
    kPoly(c, [s * 40, -950, s * 150, -944, s * 156, -760, s * 150, -460, s * 8, -470, s * 6, -620, s * 22, -760]); kFill(c, o.jacket);
    c.save(); c.clip(); c.fillStyle = o.jacketHi; c.globalAlpha = .5; c.beginPath(); c.ellipse(s * 110, -840, 16, 80, 0, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
    nLine(c, [s * 70, -560, s * 140, -560], 5, '#141b2e'); c.restore();
    kPoly(c, [s * 38, -952, s * 96, -946, s * 92, -880, s * 52, -840, s * 74, -820, s * 24, -700]); kFill(c, '#18213a', NOAH.W * .7); // lapel
  }
  circle(c, 0, -600, 11); c.fillStyle = '#0e1320'; c.fill();
  // coat: long, open, broad collar
  for (const s of [-1, 1]) {
    kPoly(c, [s * 60, -965, s * 172, -950, s * 186, -760, s * 196, -300, s * 118, -300, s * 120, -600, s * 132, -860]); kFill(c, o.coat);
    c.save(); c.clip(); c.fillStyle = o.coatHi; c.globalAlpha = .55; c.beginPath(); c.ellipse(s * 170, -720, 10, 220, 0, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
    nLine(c, [s * 130, -470, s * 186, -470], 5, '#1c1b1e'); c.restore();
    kPoly(c, [s * 56, -972, s * 150, -966, s * 152, -880, s * 130, -840, s * 128, -760]); kFill(c, '#232226', NOAH.W * .7);
  }
}
function kVest(c, o) {
    // hi-vis vest, open at the front
    for (const s of [-1, 1]) {
      kPoly(c, [s * 48, -950, s * 112, -950, s * 160, -900, s * 150, -760, s * 140, -540, s * 44, -540, s * 40, -820]); kFill(c, o.vest);
      c.save(); c.clip();
      c.fillStyle = o.refl; c.fillRect(s > 0 ? 40 : -170, -770, 130, 30); c.fillRect(s > 0 ? 40 : -170, -650, 130, 30);
      c.fillStyle = 'rgba(255,255,255,.55)'; c.fillRect(s > 0 ? 40 : -170, -766, 130, 7); c.fillRect(s > 0 ? 40 : -170, -646, 130, 7);
      c.fillStyle = o.vestDark; c.fillRect(s > 0 ? 40 : -170, -560, 130, 20);
      c.fillStyle = 'rgba(0,0,0,.08)'; for (let i = 0; i < 30; i++) c.fillRect(s * (50 + (i * 37) % 100), -940 + (i * 53) % 400, 6, 6); // mesh dots
      c.restore();
      kPoly(c, [s * 48, -950, s * 112, -950, s * 160, -900, s * 150, -760, s * 140, -540, s * 44, -540, s * 40, -820]); c.lineWidth = NOAH.W * .8; c.strokeStyle = NOAH.out; c.stroke();
    }
    // dust on the vest, a pen in the pocket
    nLine(c, [-110, -700, -110, -640], 8, '#2a5ab0'); nLine(c, [-110, -700, -110, -690], 8, '#e8e4dc');
}
// ---------- arms with long sleeves ----------
function kArmGeo(side, spec) {
  const S = NOAH.SHOULDER, sx = side * S.x, sy = S.y, a = spec.a, b = spec.b ?? 0, a2 = a + b;
  const ex = sx + side * Math.sin(a) * NOAH.UPPER, ey = sy + Math.cos(a) * NOAH.UPPER;
  const wx = ex + side * Math.sin(a2) * NOAH.FORE, wy = ey + Math.cos(a2) * NOAH.FORE;
  return { sx, sy, ex, ey, wx, wy, a, a2 };
}
function kSleeve(c, side, spec, o, outfit) {
  const g = kArmGeo(side, spec), cuff = outfit === 'boss' ? .7 : .84;
  const cx = g.ex + (g.wx - g.ex) * cuff, cy = g.ey + (g.wy - g.ey) * cuff;
  const wdt = NOAH.ARM_W + (outfit === 'boss' ? 22 : outfit === 'lager' ? 18 : 14);
  // skin wrist under the cuff
  nLine(c, [cx, cy, g.wx, g.wy], NOAH.ARM_W + NOAH.W * 2, NOAH.out); nLine(c, [cx, cy, g.wx, g.wy], NOAH.ARM_W, NOAH.skin);
  if (outfit === 'boss' && side === 1) { // Noah's gold watch peeks out under the cuff
    const k = .93, wx = g.ex + (g.wx - g.ex) * k, wy = g.ey + (g.wy - g.ey) * k, fx = side * Math.sin(g.a2), fy = Math.cos(g.a2);
    nLine(c, [wx - fy * 40, wy + fx * 40, wx + fy * 40, wy - fx * 40], 22, NOAH.out); nLine(c, [wx - fy * 36, wy + fx * 36, wx + fy * 36, wy - fx * 36], 13, NOAH.watch);
    c.beginPath(); c.arc(wx + fy * 30 * side, wy - fx * 30 * side, 18, 0, Math.PI * 2); nFill(c, NOAH.watch, 8);
  }
  nLine(c, [g.sx, g.sy, g.ex, g.ey, cx, cy], wdt + NOAH.W * 2, NOAH.out); nLine(c, [g.sx, g.sy, g.ex, g.ey, cx, cy], wdt, o.sleeve);
  // fabric folds at the elbow and cuff
  nLine(c, [g.ex - 14, g.ey - 6, g.ex + 14, g.ey + 6], 4, 'rgba(0,0,0,.25)');
  const nx = -(g.wy - g.ey), ny = (g.wx - g.ex), nl = Math.hypot(nx, ny) || 1;
  const cw = wdt / 2 + 4; nLine(c, [cx + nx / nl * cw, cy + ny / nl * cw, cx - nx / nl * cw, cy - ny / nl * cw], outfit === 'boss' ? 10 : 18, outfit === 'boss' ? '#e8eef5' : (o.topDark || '#141213'));
  return g;
}
function drawNoahK(c, p = {}) {
  if (p.ink && !p._inked) { const W0 = NOAH.W; NOAH.W = W0 * p.ink; try { return drawNoahK(c, Object.assign({}, p, { _inked: 1 })); } finally { NOAH.W = W0; } }
  const outfit = p.outfit || 'boss', o = OUTFIT[outfit], k = p.k ?? .25, e = Object.assign({}, p.expr || {});
  const arms = Object.assign({}, NOAH.ARMS, p.arms || {});
  c.save(); c.translate(p.x || 0, p.y || 0); c.scale(k * (p.s || 1), k);
  kLegs(c, o, outfit);
  c.save(); c.translate(0, p.bob || 0);
  // neck
  c.beginPath(); c.rect(-46, -1000, 92, 62); c.fillStyle = NOAH.skin; c.fill(); nLine(c, [-46, -1000, -46, -948], 10, NOAH.out); nLine(c, [46, -1000, 46, -948], 10, NOAH.out);
  kTorso(c, o, outfit);
  const gl = kSleeve(c, -1, arms.l, o, outfit), gr = kSleeve(c, 1, arms.r, o, outfit);
  if (outfit === 'lager') kVest(c, o);
  if (p.hold) p.hold(c, gl, gr);
  for (const g of [gl, gr]) { c.save(); c.translate(g.wx, g.wy); noahHandLocal(c, -(g.sx > 0 ? 1 : -1) * g.a2 + ((g.sx > 0 ? arms.r : arms.l).hand || 0)); c.restore(); }
  if (p.holdFront) p.holdFront(c, gl, gr);
  c.save(); c.translate(0, NOAH.HEAD.y + 260); c.rotate(p.tilt || 0); c.translate(0, -(NOAH.HEAD.y + 260));
  noahHairBack(c); noahHeadLocal(c, e); kFaceAddons(c, e);
  c.restore();
  c.restore(); c.restore();
}
function kFaceAddons(c, e) {
  const cy = NOAH.HEAD.y;
  if (e.bags) for (const s of [-1, 1]) { c.save(); c.globalAlpha = .55 * e.bags; c.beginPath(); c.moveTo(s * 92 - 30, cy + 66); c.quadraticCurveTo(s * 92, cy + 84, s * 92 + 30, cy + 64); c.lineWidth = 6; c.strokeStyle = '#8a7f86'; c.lineCap = 'round'; c.stroke(); c.restore(); }
  if (e.sweat) { c.beginPath(); c.moveTo(205, cy - 60); c.quadraticCurveTo(225, cy - 20, 205, cy - 6); c.quadraticCurveTo(188, cy - 20, 205, cy - 60); c.fillStyle = '#bfe3f5'; c.fill(); c.lineWidth = 5; c.strokeStyle = NOAH.out; c.stroke(); }
}
// a coffee cup held in the right hand (rig units, call from hold/holdFront with the right-arm geometry)
function kCup(c, g, steam = 0, t = 0) {
  c.save(); c.translate(g.wx - 30, g.wy + 30);
  c.beginPath(); c.moveTo(-50, -70); c.lineTo(50, -70); c.lineTo(40, 40); c.quadraticCurveTo(0, 52, -40, 40); c.closePath(); nFill(c, '#f3f0ea', NOAH.W * .8);
  c.beginPath(); c.ellipse(0, -70, 50, 12, 0, 0, Math.PI * 2); nFill(c, '#4a2c1c', NOAH.W * .6);
  nLine(c, [-44, -20, 44, -20], 10, '#22303f');
  if (steam) for (let i = 0; i < 3; i++) { c.save(); c.globalAlpha = .35 * steam; c.beginPath(); const x0 = -20 + i * 20; c.moveTo(x0, -90); c.bezierCurveTo(x0 - 20, -130 - Math.sin(t * 2 + i) * 10, x0 + 20, -160, x0, -210); c.lineWidth = 8; c.strokeStyle = '#fff'; c.stroke(); c.restore(); }
  c.restore();
}
