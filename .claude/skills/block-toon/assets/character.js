// Character rig for the block-toon look (any season).
// Long-necked, sleepy-eyed, flat-coloured people with heavy upper lids and thin ink lines.
// Coordinates are authored at scale s=1: head ≈ 430 px tall, full figure ≈ 1790 px.
// drawFigure(ctx, o) — o.x,o.y = ground point between the feet.
// drawHead(ctx, o)   — o.x,o.y = chin point (used by drawFigure, usable alone for close-ups).
'use strict';

const CAST = {
  // Every cast can be dressed per shot: drawFigure(..., {top:'hoodie'|'tank'|'tee', bottom:'track'|'shorts', topCol, shades}).
  // The lanky lead from the reference look: orange flat-top buzz cut, black zip hoodie, blue track pants.
  lanky: { skin: PAL.skin, skinShade: PAL.skinShade, hair: PAL.hair, hairHi: PAL.hairHi, hairShade: PAL.hairShade, hairStyle: 'buzz',
    hoodie: PAL.hoodie, hoodieHi: PAL.hoodieHi, piping: PAL.piping, pants: PAL.pants, pantsShade: PAL.pantsShade, neck: 1, faceW: 1, faceL: 1 },
  // Stocky friend: blond buzz, moustache, green-and-lilac jacket.
  stocky: { skin: '#e2a98f', skinShade: '#c48a72', hair: '#e2b33a', hairHi: '#f0c95a', hairShade: '#b88a22', hairStyle: 'buzz', moustache: 'brush',
    hoodie: '#5f8a66', hoodieHi: '#9d8fd0', piping: '#3d5a40', pants: PAL.pants, pantsShade: PAL.pantsShade, neck: .35, faceW: 1.35, faceL: .85 },
  // Old man: navy beanie, droopy grey moustache.
  oldman: { skin: PAL.skin, skinShade: PAL.skinShade, hair: '#3a3f6e', hairHi: '#4a5090', hairShade: '#2a2e55', hairStyle: 'beanie', moustache: 'walrus', stubble: true,
    hoodie: '#20222e', hoodieHi: '#2c2f40', piping: '#20222e', pants: '#4a4d63', pantsShade: '#3a3c50', neck: .9, faceW: .9, faceL: 1 },
};
// Summer outfits of the same people.
CAST.lankySummer = { ...CAST.lanky, top: 'tank', bottom: 'track' };
CAST.stockySummer = { ...CAST.stocky, top: 'tee', topCol: '#e46f55', topShade: '#c4573f', bottom: 'shorts', shorts: '#3d4a7a', shades: true };
CAST.oldmanSummer = { ...CAST.oldman, top: 'tee', topCol: '#d9d3c0', topShade: '#b8b19b', bottom: 'track' };

// ---------- eyes ----------
// lid: 0 = open, 1 = closed. Default look is sleepy (lid ≈ .45). look = -1..1 horizontal pupil.
function drawEye(ctx, x, y, rx, ry, lid, look, lookY, skin, lw) {
  ink(ctx, ellipse(x, y, rx, ry), PAL.eyeW, 0);
  ctx.save(); ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.clip();
  // pupil
  ctx.fillStyle = PAL.ink; ctx.beginPath(); ctx.ellipse(x + look * rx * .5, y + ry * .25 + lookY * ry * .3, rx * .17, rx * .2, 0, 0, Math.PI * 2); ctx.fill();
  // heavy upper lid
  const ly = y - ry + lid * ry * 2.05;
  ctx.fillStyle = skin; ctx.fillRect(x - rx - 2, y - ry - 4, rx * 2 + 4, ly - (y - ry) + 4);
  ctx.restore();
  ctx.lineCap = 'round';
  // eye outline (thin), lid edge (thick, slightly curved), lashes flick at the outer corner
  stroke(ctx, ellipse(x, y, rx, ry), lw * .5);
  stroke(ctx, c => { c.moveTo(x - rx * 1.08, ly + ry * .1); c.quadraticCurveTo(x, ly - ry * .22, x + rx * 1.08, ly + ry * .05); }, lw * .95);
  // crease above and bag below
  stroke(ctx, c => { c.moveTo(x - rx * .9, y - ry * 1.25); c.quadraticCurveTo(x, y - ry * 1.75, x + rx * .95, y - ry * 1.2); }, lw * .45);
  stroke(ctx, c => { c.moveTo(x - rx * .7, y + ry * 1.3); c.quadraticCurveTo(x, y + ry * 1.65, x + rx * .75, y + ry * 1.25); }, lw * .4);
}

// ---------- head ----------
// o: {x, y, s, cast, lid, look, lookY, mouth (0 closed .. 1 'o'), smirk, turn (-1..1 small head yaw), tilt (rad)}
function drawHead(ctx, o) {
  const C = typeof o.cast === 'string' ? CAST[o.cast] : (o.cast || CAST.lanky);
  const s = o.s ?? 1, lw = (o.lw ?? LW) / s, fw = C.faceW ?? 1, fl = C.faceL ?? 1;
  ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(o.tilt || 0); ctx.scale(s, s);
  const X = v => v * fw, Y = v => v * fl, tu = (o.turn || 0) * 10;
  // ear (right side, behind face edge)
  ink(ctx, c => { c.moveTo(X(106), Y(-282)); c.bezierCurveTo(X(140), Y(-318), X(170), Y(-260), X(152), Y(-218)); c.bezierCurveTo(X(146), Y(-190), X(124), Y(-176), X(108), Y(-182)); }, C.skin, lw);
  stroke(ctx, c => { c.moveTo(X(118), Y(-262)); c.bezierCurveTo(X(140), Y(-276), X(150), Y(-240), X(134), Y(-216)); c.quadraticCurveTo(X(124), Y(-206), X(126), Y(-226)); }, lw * .55);
  // face
  const face = c => {
    c.moveTo(X(-34), Y(-6)); c.quadraticCurveTo(X(2), Y(8), X(36), Y(-6));
    c.quadraticCurveTo(X(88), Y(-36), X(102), Y(-118)); c.lineTo(X(112), Y(-236)); c.lineTo(X(114), Y(-350));
    c.lineTo(X(-94), Y(-352)); c.lineTo(X(-100), Y(-258));
    c.quadraticCurveTo(X(-104), Y(-182), X(-84), Y(-110)); c.quadraticCurveTo(X(-66), Y(-40), X(-34), Y(-6)); c.closePath();
  };
  ink(ctx, face, C.skin, lw);
  // cel shade on the far cheek (right) — clipped to face
  ctx.save(); ctx.beginPath(); face(ctx); ctx.clip();
  ink(ctx, c => { c.moveTo(X(70), Y(-360)); c.lineTo(X(130), Y(-360)); c.lineTo(X(130), Y(0)); c.lineTo(X(40), Y(0)); c.quadraticCurveTo(X(84), Y(-60), X(82), Y(-150)); c.lineTo(X(84), Y(-260)); c.closePath(); }, C.skinShade, 0);
  ctx.restore();
  ink(ctx, face, null, lw);
  // hair / hat
  if (C.hairStyle === 'buzz') {
    const hair = c => { c.moveTo(X(-98), Y(-348)); c.lineTo(X(-108), Y(-400)); c.quadraticCurveTo(X(-108), Y(-432), X(-76), Y(-436)); c.lineTo(X(96), Y(-440)); c.quadraticCurveTo(X(126), Y(-436), X(126), Y(-404)); c.lineTo(X(126), Y(-296)); c.lineTo(X(112), Y(-290)); c.lineTo(X(108), Y(-336)); c.lineTo(X(-20), Y(-356)); c.closePath(); };
    ink(ctx, hair, C.hair, lw);
    ctx.save(); ctx.beginPath(); hair(ctx); ctx.clip();
    ink(ctx, poly([[X(-112), Y(-460)], [X(40), Y(-460)], [X(-20), Y(-414)], [X(-112), Y(-404)]]), C.hairHi, 0);
    ink(ctx, poly([[X(90), Y(-460)], [X(130), Y(-460)], [X(130), Y(-280)], [X(100), Y(-300)]]), C.hairShade, 0);
    ctx.restore(); ink(ctx, hair, null, lw);
    stroke(ctx, c => { c.moveTo(X(106), Y(-338)); c.lineTo(X(70), Y(-380)); }, lw * .5);
  } else if (C.hairStyle === 'beanie') {
    const hat = c => { c.moveTo(X(-112), Y(-318)); c.lineTo(X(-112), Y(-420)); c.quadraticCurveTo(X(-100), Y(-520), X(10), Y(-524)); c.quadraticCurveTo(X(124), Y(-520), X(132), Y(-420)); c.lineTo(X(134), Y(-308)); c.closePath(); };
    ink(ctx, hat, C.hair, lw);
    ink(ctx, poly([[X(-118), Y(-388)], [X(138), Y(-388)], [X(140), Y(-300)], [X(-118), Y(-308)]]), C.hairHi, lw);
    for (let i = 0; i < 12; i++) stroke(ctx, c => { const xx = lerp(X(-104), X(128), i / 11); c.moveTo(xx, Y(-384)); c.lineTo(xx + 1, Y(-312)); }, lw * .45);
  }
  // features
  const ex = tu;
  drawEye(ctx, X(-44) + ex, Y(-234), 30 * fw, 21, o.lid ?? .45, (o.look ?? 0) + (o.cross || 0), o.lookY ?? 0, C.skin, lw);
  drawEye(ctx, X(42) + ex, Y(-238), 28 * fw, 20, o.lid ?? .45, (o.look ?? 0) - (o.cross || 0), o.lookY ?? 0, C.skin, lw);
  // faint brows
  ctx.globalAlpha = .7;
  stroke(ctx, c => { c.moveTo(X(-78) + ex, Y(-282)); c.quadraticCurveTo(X(-46) + ex, Y(-296), X(-16) + ex, Y(-284)); }, lw * .5);
  stroke(ctx, c => { c.moveTo(X(16) + ex, Y(-286)); c.quadraticCurveTo(X(46) + ex, Y(-300), X(74) + ex, Y(-286)); }, lw * .5);
  ctx.globalAlpha = 1;
  // long nose (3/4): bridge → tip → nostril hook
  stroke(ctx, c => { c.moveTo(X(-4) + ex, Y(-228)); c.quadraticCurveTo(X(-10) + ex, Y(-190), X(-26) + ex, Y(-152)); c.quadraticCurveTo(X(-30) + ex, Y(-138), X(-12) + ex, Y(-138)); c.moveTo(X(6) + ex, Y(-140)); c.quadraticCurveTo(X(20) + ex, Y(-136), X(24) + ex, Y(-150)); }, lw * .8);
  // nasolabial folds + cheek line (gives the tired, older look)
  stroke(ctx, c => { c.moveTo(X(32) + ex, Y(-150)); c.quadraticCurveTo(X(48) + ex, Y(-118), X(40) + ex, Y(-92)); }, lw * .5);
  stroke(ctx, c => { c.moveTo(X(-40) + ex, Y(-150)); c.quadraticCurveTo(X(-54) + ex, Y(-122), X(-48) + ex, Y(-96)); }, lw * .4);
  stroke(ctx, c => { c.moveTo(X(70), Y(-210)); c.quadraticCurveTo(X(80), Y(-160), X(72), Y(-120)); }, lw * .45);
  // mouth: full lips, pursed; opens to a small 'o' for exhaling
  const m = o.mouth || 0, sm = o.smirk || 0, mx = X(-4) + ex, my = Y(-96);
  if (C.moustache === 'brush') ink(ctx, smooth([[mx - 50, my - 18], [mx, my - 34], [mx + 50, my - 16], [mx + 40, my - 4], [mx, my - 12], [mx - 42, my - 4]]), C.hairShade, lw * .6);
  if (m > .05) {
    ink(ctx, ellipse(mx - 4, my, 7 + 4 * m, 5 + 7 * m), '#4a2a22', lw * .6);
    stroke(ctx, c => { c.moveTo(mx - 26, my - 4); c.quadraticCurveTo(mx, my - 18 - 4 * m, mx + 26, my - 4); }, lw * .55);
  } else {
    ink(ctx, c => { c.moveTo(mx - 30, my - 2); c.quadraticCurveTo(mx - 12, my - 14, mx, my - 8); c.quadraticCurveTo(mx + 14, my - 14, mx + 30, my - 2 - sm * 8); c.quadraticCurveTo(mx + 8, my + 18, mx - 30, my - 2); c.closePath(); }, PAL.lip, lw * .55);
    stroke(ctx, c => { c.moveTo(mx - 30, my - 2); c.quadraticCurveTo(mx, my + 2, mx + 30, my - 2 - sm * 8); }, lw * .75);
  }
  if (C.moustache === 'walrus') {
    ink(ctx, c => { c.moveTo(mx - 60, my + 40); c.quadraticCurveTo(mx - 50, my - 40, mx, my - 36); c.quadraticCurveTo(mx + 50, my - 40, mx + 60, my + 40); c.quadraticCurveTo(mx, my - 4, mx - 60, my + 40); }, C.hair, lw * .6);
    for (let i = 0; i < 9; i++) stroke(ctx, c => { const a = i / 8; c.moveTo(mx + lerp(-48, 48, a), my - 20); c.lineTo(mx + lerp(-62, 62, a), my + 30); }, lw * .35);
  }
  // chin crease
  stroke(ctx, c => { c.moveTo(mx - 14, my + 40); c.quadraticCurveTo(mx, my + 46, mx + 14, my + 40); }, lw * .4);
  // sunglasses (o.shades overrides the cast default)
  if (o.shades ?? C.shades) {
    for (const [lx, ly] of [[X(-46) + ex, Y(-232)], [X(42) + ex, Y(-236)]]) {
      ink(ctx, c => { c.moveTo(lx - 44, ly - 22); c.lineTo(lx + 42, ly - 24); c.quadraticCurveTo(lx + 40, ly + 26, lx, ly + 28); c.quadraticCurveTo(lx - 42, ly + 26, lx - 44, ly - 22); c.closePath(); }, PAL.shades, lw * .8);
      ctx.globalAlpha = .5; stroke(ctx, c => { c.moveTo(lx - 26, ly - 8); c.lineTo(lx - 10, ly - 16); }, lw * .7, '#9fb6e0'); ctx.globalAlpha = 1;
    }
    stroke(ctx, c => { c.moveTo(X(-2) + ex, Y(-254)); c.lineTo(X(0) + ex, Y(-254)); }, lw * .8);
    stroke(ctx, c => { c.moveTo(X(84) + ex, Y(-256)); c.lineTo(X(112), Y(-252)); }, lw * .8);
  }
  ctx.restore();
}

// ---------- full figure ----------
// Limb tube: ink outline + fill in two passes so joints stay seamless. pts in figure space.
function tube(ctx, segs, fill, lw) {
  for (const pass of [0, 1]) for (const [pts, wd] of segs) {
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = pass ? wd : wd + lw * 2; ctx.strokeStyle = pass ? fill : PAL.ink; ctx.stroke();
  }
}
// o: {x, y (ground point), s, cast, t, top, bottom, pose:'pockets'|'hips'|'down', topCol, topShade, sway, breathe,
//     + head opts (lid, look, cross, lookY, mouth, smirk, turn, headTilt, shades)}
function drawFigure(ctx, o) {
  const C = typeof o.cast === 'string' ? CAST[o.cast] : (o.cast || CAST.lanky);
  const s = o.s ?? 1, lw = (o.lw ?? LW) / s, t = o.t || 0;
  const br = Math.sin(t * 2.4) * (o.breathe ?? 1);
  const top = o.top || C.top || 'hoodie', bottom = o.bottom || C.bottom || 'track';
  const pose = o.pose || (top === 'hoodie' ? 'pockets' : 'hips');
  const topCol = o.topCol || C.topCol || (top === 'hoodie' ? C.hoodie : top === 'tank' ? PAL.tank : PAL.tee);
  const topShade = o.topShade || C.topShade || (top === 'hoodie' ? C.hoodieHi : top === 'tank' ? PAL.tankShade : PAL.teeShade);
  const nk = 220 * (C.neck ?? 1) + 40;
  ctx.save(); ctx.translate(o.x, o.y); ctx.rotate((o.sway || 0) * Math.sin(t * 1.1) * .012); ctx.scale(s, s);

  // --- legs ---
  if (bottom === 'shorts') {
    tube(ctx, [[[[-92, -480], [-96, -90]], 62]], C.skin, lw);
    tube(ctx, [[[[90, -480], [88, -90]], 62]], C.skin, lw);
    for (const x of [-96, 88]) ink(ctx, rect(x - 32, -170, 64, 100), '#f1f0ea', lw * .7); // socks
    const sh = C.shorts || C.pants;
    ink(ctx, poly([[-160, -790], [160, -790], [168, -470], [16, -450], [0, -560], [-16, -450], [-168, -470]]), sh, lw);
    stroke(ctx, c => { c.moveTo(-150, -760); c.lineTo(-156, -480); c.moveTo(150, -760); c.lineTo(156, -480); }, lw * 1.1, PAL.stripe);
  } else {
    const legL = [[-150, -770], [-24, -770], [-40, -420], [-58, -64], [-130, -64], [-150, -420]];
    const legR = [[18, -770], [152, -770], [146, -430], [124, -64], [52, -64], [40, -430]];
    ink(ctx, poly(legR), C.pants, lw);
    ink(ctx, poly([[118, -770], [152, -770], [146, -430], [124, -64], [96, -64], [118, -430]]), C.pantsShade, 0);
    ink(ctx, poly(legR), null, lw);
    ink(ctx, poly(legL), C.pants, lw);
    for (const [a, b] of [[[-138, -760], [-122, -70]], [[-126, -760], [-108, -70]], [[138, -760], [112, -70]], [[126, -760], [100, -70]]]) stroke(ctx, c => { c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); }, lw * 1.1, PAL.stripe);
    for (const [x0, y0, x1, y1] of [[-120, -430, -70, -410], [-110, -170, -66, -150], [-128, -120, -80, -96], [70, -440, 120, -420], [64, -170, 110, -150], [58, -118, 100, -98]]) stroke(ctx, c => { c.moveTo(x0, y0); c.quadraticCurveTo((x0 + x1) / 2, y0 - 14, x1, y1); }, lw * .5);
  }
  // --- sneakers ---
  const shoe = (x, dir) => {
    ink(ctx, c => { c.moveTo(x - 46 * dir, -70); c.quadraticCurveTo(x - 60 * dir, -20, x - 56 * dir, -4); c.lineTo(x + 70 * dir, -4); c.quadraticCurveTo(x + 96 * dir, -10, x + 84 * dir, -36); c.quadraticCurveTo(x + 50 * dir, -52, x + 26 * dir, -74); c.closePath(); }, PAL.shoe, lw);
    ink(ctx, c => { c.moveTo(x - 58 * dir, -18); c.lineTo(x + 92 * dir, -18); c.quadraticCurveTo(x + 96 * dir, -2, x + 70 * dir, 2); c.lineTo(x - 56 * dir, 2); c.closePath(); }, PAL.sole, lw * .8);
    stroke(ctx, c => { c.moveTo(x - 10 * dir, -64); c.lineTo(x + 30 * dir, -24); c.moveTo(x + 8 * dir, -66); c.lineTo(x + 46 * dir, -26); }, lw * .9, PAL.stripe);
  };
  shoe(-94, -1); shoe(88, 1);

  // arm joints for the open poses (figure space)
  const armPts = d => pose === 'down'
    ? [[d * 150, -1222], [d * 182, -1000], [d * 186, -800]]
    : [[d * 150, -1222], [d * 222, -1000], [d * 160, -770]]; // 'hips': hands in trouser pockets
  const hand = d => { // relaxed hanging hand (pose 'down')
    const [wx, wy] = armPts(d)[2];
    ink(ctx, c => { c.moveTo(wx - 26, wy - 6); c.quadraticCurveTo(wx - 34, wy + 60, wx - 6, wy + 84); c.quadraticCurveTo(wx + 20, wy + 92, wx + 28, wy + 50); c.lineTo(wx + 26, wy - 6); c.closePath(); }, C.skin, lw * .8);
    stroke(ctx, c => { c.moveTo(wx - d * 6, wy + 40); c.lineTo(wx - d * 4, wy + 76); c.moveTo(wx + d * 8, wy + 40); c.lineTo(wx + d * 10, wy + 72); }, lw * .4);
    ink(ctx, c => { c.moveTo(wx - d * 24, wy + 10); c.quadraticCurveTo(wx - d * 44, wy + 36, wx - d * 30, wy + 56); }, null, lw * .7); // thumb
  };
  const pocketPatch = d => { // trouser pocket mouth drawn over the wrist so the hand reads as tucked in
    const col = bottom === 'shorts' ? (C.shorts || C.pants) : C.pants;
    ink(ctx, poly([[d * 118, -762], [d * 206, -778], [d * 200, -690], [d * 124, -688]]), col, 0);
    stroke(ctx, c => { c.moveTo(d * 118, -762); c.quadraticCurveTo(d * 160, -752, d * 206, -778); }, lw * .8);
    stroke(ctx, c => { c.moveTo(d * 200, -690); c.lineTo(d * 206, -778); }, lw * .8);
  };

  ctx.save(); ctx.translate(0, -770); ctx.scale(1, 1 + br * .006); ctx.translate(0, 770);
  if (top === 'hoodie') {
    const torso = [[-206, -1226], [-130, -1270], [130, -1270], [206, -1224], [234, -1150], [240, -1000], [240, -760], [-240, -760], [-240, -1000], [-234, -1150]];
    ink(ctx, smooth([[-160, -1250], [-170, -1310], [-110, -1352], [0, -1362], [116, -1350], [172, -1306], [164, -1248]], false), topCol, lw);
    ink(ctx, poly(torso), topCol, lw);
    ink(ctx, poly([[110, -1260], [150, -1272], [218, -1236], [236, -1000], [238, -760], [170, -760], [190, -1000]]), topShade, 0);
    ink(ctx, poly(torso), null, lw);
    ink(ctx, rect(-238, -800, 476, 44), topCol, lw * .8);
    stroke(ctx, c => { c.moveTo(-200, -1210); c.quadraticCurveTo(-222, -1000, -214, -830); }, lw * .55, C.piping);
    stroke(ctx, c => { c.moveTo(196, -1206); c.quadraticCurveTo(220, -1000, 212, -830); }, lw * .55, C.piping);
    ink(ctx, rect(-6, -1222, 16, 462), PAL.zip, lw * .5);
    for (let y = -1210; y < -770; y += 15) stroke(ctx, c => { c.moveTo(-2, y); c.lineTo(8, y + 6); }, lw * .35);
    for (const [x0, x1, y1] of [[-46, -54, -1060], [52, 62, -1040]]) {
      stroke(ctx, c => { c.moveTo(x0, -1236); c.quadraticCurveTo(x0 - 4, -1150, x1, y1); }, lw * 1.6);
      stroke(ctx, c => { c.moveTo(x0, -1236); c.quadraticCurveTo(x0 - 4, -1150, x1, y1); }, lw * .7, C.piping);
      ink(ctx, rect(x1 - 5, y1, 10, 22), PAL.zip, lw * .5);
    }
    stroke(ctx, c => { c.moveTo(-150, -800); c.lineTo(-136, -936); c.quadraticCurveTo(0, -952, 138, -936); c.lineTo(152, -800); }, lw * .7);
    if (pose === 'pockets') {
      for (const d of [-1, 1]) {
        ink(ctx, c => { c.moveTo(d * 210, -1236); c.quadraticCurveTo(d * 262, -1150, d * 262, -1010); c.quadraticCurveTo(d * 256, -930, d * 200, -900); c.lineTo(d * 128, -906); c.lineTo(d * 134, -946); c.quadraticCurveTo(d * 190, -960, d * 196, -1020); c.quadraticCurveTo(d * 188, -1120, d * 170, -1170); c.closePath(); }, d > 0 ? topShade : topCol, lw);
        stroke(ctx, c => { c.moveTo(d * 236, -1100); c.quadraticCurveTo(d * 246, -1040, d * 236, -980); }, lw * .5, C.piping);
        stroke(ctx, c => { c.moveTo(d * 214, -1010); c.quadraticCurveTo(d * 230, -1000, d * 240, -1012); }, lw * .45);
        ink(ctx, poly([[d * 150, -946], [d * 128, -906], [d * 160, -902], [d * 176, -940]]), topCol, lw * .6);
      }
    } else {
      for (const d of [-1, 1]) {
        const P = armPts(d).map(([x, y], i) => [x + d * (i ? 30 : 50), y]);
        tube(ctx, [[[P[0], P[1]], 92], [[P[1], P[2]], 84]], d > 0 ? topShade : topCol, lw);
        if (pose === 'down') hand(d); else pocketPatch(d);
      }
    }
  } else {
    // bare arms first (behind the top), shoulders, then the top over them
    // shoulder bar + both arms in one tube pass → rounded shoulders, no seams
    const A = armPts(-1), B = armPts(1);
    tube(ctx, [[[[-140, -1236], [140, -1236]], 70], [[A[0], A[1]], 56], [[A[1], A[2]], 48], [[B[0], B[1]], 56], [[B[1], B[2]], 48]], C.skin, lw);
    ink(ctx, c => { c.moveTo(-44, -1236); c.quadraticCurveTo(-34, -1236 - nk * .5, -38, -1236 - nk - 20); c.lineTo(44, -1236 - nk - 20); c.quadraticCurveTo(40, -1236 - nk * .5, 50, -1236); c.lineTo(50, -1200); c.lineTo(-44, -1200); c.closePath(); }, C.skin, lw);
    const body = top === 'tank'
      ? c => { c.moveTo(-104, -1266); c.lineTo(-66, -1266); c.quadraticCurveTo(0, -1150, 66, -1266); c.lineTo(104, -1266); c.quadraticCurveTo(110, -1160, 172, -1120); c.lineTo(166, -1000); c.lineTo(176, -776); c.lineTo(-176, -776); c.lineTo(-166, -1000); c.lineTo(-172, -1120); c.quadraticCurveTo(-110, -1160, -104, -1266); c.closePath(); }
      : c => { c.moveTo(-176, -1240); c.lineTo(-56, -1272); c.quadraticCurveTo(0, -1226, 56, -1272); c.lineTo(176, -1240); c.lineTo(170, -1000); c.lineTo(180, -770); c.lineTo(-180, -770); c.lineTo(-170, -1000); c.closePath(); };
    ink(ctx, body, topCol, lw);
    ctx.save(); ctx.beginPath(); body(ctx); ctx.clip();
    ink(ctx, poly([[90, -1300], [200, -1300], [200, -760], [120, -760], [130, -1000]]), topShade, 0); ctx.restore();
    ink(ctx, body, null, lw);
    stroke(ctx, c => { c.moveTo(-80, -1000); c.quadraticCurveTo(-60, -960, -86, -900); c.moveTo(70, -860); c.quadraticCurveTo(96, -830, 80, -790); }, lw * .45); // fabric folds
    if (top === 'tee') for (const d of [-1, 1]) { const P = armPts(d); const m = [lerp(P[0][0], P[1][0], .45), lerp(P[0][1], P[1][1], .45)]; tube(ctx, [[[[d * 140, -1226], m], 84]], d > 0 ? topShade : topCol, lw); }
    for (const d of [-1, 1]) { if (pose === 'down') hand(d); else pocketPatch(d); }
  }
  ctx.restore();

  // --- long neck (hoodie: drawn over the hood, then the zipped collar over it) ---
  if (top === 'hoodie') {
    ink(ctx, c => { c.moveTo(-44, -1236); c.quadraticCurveTo(-34, -1236 - nk * .5, -38, -1236 - nk - 20); c.lineTo(44, -1236 - nk - 20); c.quadraticCurveTo(40, -1236 - nk * .5, 50, -1236); c.closePath(); }, C.skin, lw);
  }
  ink(ctx, c => { c.moveTo(18, -1236 - nk); c.lineTo(42, -1236 - nk); c.quadraticCurveTo(38, -1236 - nk * .5, 46, top === 'hoodie' ? -1240 : -1262); c.lineTo(22, top === 'hoodie' ? -1240 : -1262); c.closePath(); }, C.skinShade, 0);
  stroke(ctx, c => { c.moveTo(-6, -1236 - nk * .55); c.quadraticCurveTo(4, -1236 - nk * .62, 10, -1236 - nk * .5); }, lw * .45);
  if (top === 'hoodie') {
    ink(ctx, c => { c.moveTo(-92, -1300); c.quadraticCurveTo(0, -1250, 92, -1300); c.lineTo(84, -1236); c.quadraticCurveTo(0, -1200, -84, -1236); c.closePath(); }, topCol, lw);
    stroke(ctx, c => { c.moveTo(-80, -1280); c.quadraticCurveTo(0, -1238, 80, -1280); }, lw * .5, C.piping);
    ink(ctx, rect(-6, -1258, 16, 36), PAL.zip, lw * .5);
  }
  ctx.restore();
  const chinY = o.y + (-1236 - nk - 4) * s;
  drawHead(ctx, { ...o, x: o.x + 4 * s, y: chinY, s, lw: o.lw ?? LW, tilt: o.headTilt || 0 });
  return { chin: [o.x + 4 * s, chinY], mouth: [o.x + 0 * s, chinY - 96 * s * (C.faceL ?? 1)] };
}
