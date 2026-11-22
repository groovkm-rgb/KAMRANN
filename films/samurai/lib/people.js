// Side profile samurai rig + the other characters (same drawing language as Noah, distinguishable by head, hair, colours).
// Side view is built on NOAH_SIDE numbers (head HX -10, HY -1240, R 255; shoulder [-45,-915]; hip [5,-520]); faces right (s: 1) or left (s: -1).
//   drawSamSide(c, { x, y, k, s, ink, outfit, hair, pose: 'stand'|'seiza'|'bow'|'standbow', walk, bow: 0..1, expr, arms: { near, far }, item, tilt, pal, head })
//     arms.near / arms.far: { hand: [x, y] } target in body space (feet at 0,0; +x = facing), or omitted (relaxed). item: { arm: 'near'|'far', fn(c), ang }
//   drawPerson(c, { who: 'father'|'teacher'|'wife'|'peasant'|'merchant'|'ashigaru'|'enemy'|'daimyo'|'helper', ...drawSam params })  — front view
//   drawPersonSide(c, { who, ...drawSamSide params })
//   drawHorse(c, x, y, s, { t, gallop, rider, col })

// ---------------------------------------------------------------- side head
function samSideSkull(c, e) {
  const S = NOAH_SIDE, cx = S.HX, cy = S.HY, R = S.R;
  c.save(); c.beginPath(); c.arc(cx, cy, R, 0, Math.PI * 2); c.fillStyle = NOAH.shade; c.fill(); c.clip();
  c.beginPath(); c.arc(cx - 4, cy - 34, R - 4, 0, Math.PI * 2); c.fillStyle = NOAH.skin; c.fill(); c.restore();
  c.beginPath(); c.arc(cx, cy, R, 0, Math.PI * 2); c.lineWidth = NOAH.W; c.strokeStyle = NOAH.out; c.stroke();
}
function samSideFace(c, e = {}) {
  for (const [ex, sc] of [[122, .95], [216, .78]]) {
    const ey = -1212;
    if (e.eyes === 'closed') { c.beginPath(); c.moveTo(ex - 22, ey - 4); c.quadraticCurveTo(ex, ey + 18, ex + 22, ey - 4); c.lineWidth = 9; c.strokeStyle = NOAH.eye; c.lineCap = 'round'; c.stroke(); }
    else {
      const lid = e.lid || 0;
      c.save(); c.beginPath(); c.rect(ex - 40, ey - 40 + lid * 70, 80, 90); c.clip();
      c.beginPath(); c.ellipse(ex + (e.look || 0) * 5, ey + (e.down || 0) * 10, 21 * sc, 32, 0, 0, Math.PI * 2); c.fillStyle = NOAH.eye; c.fill(); c.restore();
      if (lid > .05) stroke(c, [ex - 22, ey - 34 + lid * 68, ex + 22, ey - 34 + lid * 68], 7, NOAH.eye);
    }
  }
  const bu = (e.browUp || 0) * 16, bd = (e.browDown || 0) * 14;
  c.beginPath(); c.moveTo(88, -1272 - bu); c.quadraticCurveTo(122, -1290 - bu + bd, 155, -1276 - bu + bd * 1.4); c.lineWidth = 13; c.strokeStyle = e.browCol || NOAH.brow; c.lineCap = 'round'; c.stroke();
  c.beginPath(); c.moveTo(200, -1280 - bu + bd); c.quadraticCurveTo(222, -1292 - bu + bd, 238, -1278 - bu); c.stroke();
  const m = e.mouth || 'flat';
  if (m === 'smile') { c.beginPath(); c.moveTo(110, -1098); c.quadraticCurveTo(145, -1080, 180, -1100); c.lineWidth = 8; c.strokeStyle = NOAH.out; c.stroke(); }
  else if (m === 'soft' || m === 'flat') stroke(c, [112, -1092, 165, -1092], 8, NOAH.out);
  else { c.beginPath(); c.ellipse(145, -1088, 18, 26, 0, 0, Math.PI * 2); c.fillStyle = NOAH.mouthIn; c.fill(); c.lineWidth = 7; c.strokeStyle = NOAH.out; c.stroke(); }
}
// chonmage in profile: glossy side/back hair, shaved crown, folded topknot lying forward on the crown
function chonmageSide(c, o = {}) {
  const cx = NOAH_SIDE.HX, cy = NOAH_SIDE.HY, R = NOAH_SIDE.R, col = o.col || NOAH.hair;
  c.save(); c.beginPath(); c.arc(cx, cy, R - 2, 0, Math.PI * 2); c.clip();
  const g = c.createRadialGradient(cx + 20, cy - R, 10, cx + 20, cy - R * .7, R * .7); g.addColorStop(0, o.loose ? 'rgba(110,100,95,.55)' : 'rgba(170,185,200,.5)'); g.addColorStop(1, 'rgba(170,185,200,0)'); c.fillStyle = g; c.fillRect(cx - R, cy - R, R * 2, R);
  c.restore();
  // back/side hair mass (behind the ear) up to the crown
  c.beginPath(); c.moveTo(cx - 40, cy - 6); c.bezierCurveTo(cx - 30, cy - 150, cx - 120, cy - 230, cx - 170, cy - 190);
  c.bezierCurveTo(cx - R - 20, cy - 120, cx - R - 14, cy + 40, cx - 200, cy + 150);
  c.quadraticCurveTo(cx - 120, cy + 110, cx - 40, cy - 6); c.closePath(); fo(c, col, NOAH.W * .8);
  c.save(); c.clip(); for (let j = 0; j < 5; j++) { c.beginPath(); c.moveTo(cx - 50 - j * 30, cy + 20); c.quadraticCurveTo(cx - 100 - j * 26, cy - 120, cx - 160, cy - 196); c.lineWidth = j === 2 ? 7 : 3.5; c.strokeStyle = j === 2 ? 'rgba(210,200,190,.5)' : NOAH.hairDark; c.lineCap = 'round'; c.stroke(); } c.restore();
  // topknot
  c.save(); c.translate(cx - 150, cy - R + 50); c.rotate(o.loose ? -.25 : -.12);
  c.beginPath(); c.moveTo(-10, 14); c.lineTo(190, -8); c.quadraticCurveTo(222, -14, 214, -40); c.quadraticCurveTo(200, -58, 170, -52); c.lineTo(-20, -30); c.closePath(); fo(c, col, NOAH.W * .8);
  stroke(c, [20, -12, 180, -32], 4, 'rgba(210,200,190,.55)');
  c.beginPath(); c.rect(18, -34, 22, 44); fo(c, '#f2eee4', NOAH.W * .5);
  if (o.loose) { c.beginPath(); c.moveTo(-10, -10); c.quadraticCurveTo(-70, 40, -50, 140); c.lineWidth = 6; c.strokeStyle = col; c.stroke(); }
  c.restore();
}
function kabutoSide(c) {
  const cx = NOAH_SIDE.HX, cy = NOAH_SIDE.HY, R = NOAH_SIDE.R, lw = NOAH.W * .85;
  for (let i = 4; i >= 0; i--) { c.beginPath(); c.moveTo(cx + 40, cy - 110 + i * 40); c.lineTo(cx - R - 40 - i * 34, cy - 70 + i * 52); c.lineTo(cx - R - 30 - i * 34, cy - 30 + i * 52); c.lineTo(cx + 40, cy - 74 + i * 40); c.closePath(); fo(c, SAM.lacquer, lw);
    c.save(); c.clip(); for (let x = -400; x < 100; x += 20) stroke(c, [cx + x, cy - 140 + i * 40, cx + x, cy + i * 60], 6, SAM.lace); c.restore(); }
  c.beginPath(); c.moveTo(cx - R - 20, cy - 110); c.bezierCurveTo(cx - R - 20, cy - 330, cx + R + 20, cy - 330, cx + R + 26, cy - 110); c.closePath();
  fo(c, vgrad(c, cx - R, 0, cx + R, 0, [[0, '#1f1e20'], [.6, '#4a494d'], [1, '#19181a']]), lw);
  c.save(); c.clip(); for (let i = -6; i <= 6; i++) stroke(c, [cx + i * 40, cy - 110, cx + i * 10, cy - 320], 4, i % 2 ? '#111' : '#6a696e'); c.restore();
  c.beginPath(); c.moveTo(cx + R + 26, cy - 112); c.lineTo(cx + R + 90, cy - 96); c.lineTo(cx + R + 70, cy - 80); c.lineTo(cx + R - 10, cy - 92); c.closePath(); fo(c, SAM.lacquer, lw);
  c.beginPath(); c.moveTo(cx + 120, cy - 120); c.quadraticCurveTo(cx + 40, cy - 190, cx + 60, cy - 70); c.lineTo(cx + 140, cy - 90); c.closePath(); fo(c, SAM.lacquer, lw);
  // maedate (crescent, seen edge-on): rising forward
  c.beginPath(); c.moveTo(cx + R - 10, cy - 160); c.quadraticCurveTo(cx + R + 80, cy - 260, cx + R + 40, cy - 400); c.lineTo(cx + R + 60, cy - 400); c.quadraticCurveTo(cx + R + 110, cy - 250, cx + R + 10, cy - 140); c.closePath(); fo(c, SAM.goldL, lw * .7);
}
function samSideHeadLocal(c, e = {}, hair = 'chonmage', o = {}) {
  if (hair === 'noah') { noahSideHead(c, e); return; }
  samSideSkull(c, e);
  if (hair === 'helmet') { samSideFace(c, e); kabutoSide(c); return; }
  if (hair === 'chonmage' || hair === 'loose') chonmageSide(c, { loose: hair === 'loose', col: o.hairCol });
  if (o.extra) o.extra(c, e);
  samSideFace(c, e);
  if (o.extraFront) o.extraFront(c, e);
}

// ---------------------------------------------------------------- side body
const SIDE_DROP = 330; // seiza: hips this much lower
function ik2(sx, sy, tx, ty, L1, L2, bendSign = 1) {
  let dx = tx - sx, dy = ty - sy, d = Math.hypot(dx, dy); const md = L1 + L2 - 1; if (d > md) { dx *= md / d; dy *= md / d; d = md; }
  const a = Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1)), base = Math.atan2(dy, dx), ang = base + a * bendSign;
  const ex = sx + Math.cos(ang) * L1, ey = sy + Math.sin(ang) * L1; return [ex, ey, sx + dx, sy + dy];
}
function sidePal(p) {
  const of = p.outfit || 'samurai';
  const base = {
    samurai: { kos: SAM.indigo, kosD: SAM.indigoD, hak: SAM.hakama, hakD: SAM.hakamaD, stripe: SAM.hakamaStripe, haori: true, hao: SAM.haori, haoD: SAM.haoriD },
    nohaori: { kos: SAM.indigo, kosD: SAM.indigoD, hak: SAM.hakama, hakD: SAM.hakamaD, stripe: SAM.hakamaStripe, haori: false },
    ronin: { kos: SAM.ronin, kosD: SAM.roninD, hak: '#5b5048', hakD: '#463d36', haori: false, patches: true },
    edo: { kos: SAM.edo, kosD: SAM.edoD, hak: '#5f5e63', hakD: '#4a494e', stripe: '#77767b', haori: false, cover: SAM.sleeveCover },
    armor: { kos: SAM.indigoD, kosD: '#141a2c', hak: '#5a1c22', hakD: '#3f1318', haori: false, armor: true },
    white: { kos: '#f1eee6', kosD: '#d6d1c4', hak: '#ebe7dc', hakD: '#cfc9ba', haori: false },
    sleep: { kos: '#9aa2b4', kosD: '#7a8294', hak: null, haori: false, robe: true },
  }[of] || {};
  return Object.assign({}, base, p.pal || {});
}
function sideSwords(c) {
  // drawn as one composed piece: pommels at front (x≈+220), scabbard tails back (x≈-380)
  for (const [kind, yy, rot, sc] of [['waki', -616, .48, .78], ['katana', -596, .58, .8]]) {
    const S = SWORD[kind]; c.save(); c.translate(200, yy - 120); c.rotate(Math.PI - rot); c.scale(sc, -sc);
    drawSword(c, { kind, detail: 1 }); c.restore();
  }
}
function drawSamSide(c, p = {}) {
  if (p.ink && !p._inked) { const W0 = NOAH.W; NOAH.W = W0 * p.ink; try { return drawSamSide(c, Object.assign({}, p, { _inked: 1 })); } finally { NOAH.W = W0; } }
  const k = p.k ?? .5, e = p.expr || {}, P = sidePal(p), lw = NOAH.W, pose = p.pose || 'stand';
  const hair = p.hair || (p.outfit === 'armor' ? 'helmet' : p.outfit === 'ronin' ? 'loose' : 'chonmage');
  const seated = pose === 'seiza' || pose === 'bow', drop = seated ? SIDE_DROP : 0;
  const bowA = pose === 'bow' ? (p.bow ?? 1) * .95 : pose === 'standbow' ? (p.bow ?? 1) * .8 : (p.lean || 0);
  const ph = p.walk, walking = ph !== null && ph !== undefined && !seated;
  const sw = walking ? Math.sin(ph) : 0, lift = walking ? Math.max(0, Math.cos(ph)) : 0, lift2 = walking ? Math.max(0, -Math.cos(ph)) : 0;
  const bob = (walking ? -Math.abs(Math.cos(ph)) * 12 : 0) + (p.bob || 0);
  const swords = p.swords !== false && p.outfit !== 'sleep' && p.outfit !== 'white';
  c.save(); c.translate(p.x || 0, p.y || 0); c.scale(k * (p.s || 1), k);
  const hip = [5, -520 + drop + bob];
  // sashimono for armour
  if (P.armor && p.flag !== false) { c.save(); c.translate(hip[0], hip[1]); c.rotate(bowA); c.translate(-hip[0], -hip[1]); c.translate(-160, drop + bob); c.scale(1, 1); sashimono(c, p.t || 0, Object.assign({ x: 0 }, p.flagOpts || {})); c.restore(); }
  // ---- legs / lower body
  const legCol = P.hak || P.kos, legD = P.hakD || P.kosD;
  if (seated) {
    c.beginPath(); c.moveTo(-150, -300); c.lineTo(120, -300); c.quadraticCurveTo(290, -250, 300, -120); c.quadraticCurveTo(310, -10, 280, 0); c.lineTo(-200, 0); c.quadraticCurveTo(-210, -150, -150, -300); c.closePath(); fo(c, legCol, lw);
    c.save(); c.clip(); for (const x of [-60, 20, 100, 180]) stroke(c, [x, -280, x + 40, 0], 5, legD); if (P.stripe) for (let x = -200; x < 320; x += 18) stroke(c, [x, -300, x + 30, 0], 2, P.stripe); c.restore();
    c.beginPath(); c.ellipse(-190, -26, 60, 30, -.3, 0, Math.PI * 2); fo(c, SAM.tabi, lw * .8); // soles of the feet behind
  } else {
    const S = NOAH_SIDE;
    const leg = (th, bend, far) => {
      const kx = hip[0] + Math.sin(th) * S.THIGH, ky = hip[1] + Math.cos(th) * S.THIGH, t2 = th - bend, ax = kx + Math.sin(t2) * S.SHIN, ay = ky + Math.cos(t2) * S.SHIN;
      // foot (tabi + zori)
      c.save(); c.translate(ax, ay - 10); c.rotate(clamp(t2 * .5, -.35, .35));
      c.beginPath(); c.rect(-60, 56, 190, 18); fo(c, P.armor ? '#b49a6a' : SAM.zori, lw * .8);
      c.beginPath(); c.moveTo(-56, -10); c.lineTo(-58, 56); c.lineTo(118, 58); c.quadraticCurveTo(140, 44, 124, 24); c.quadraticCurveTo(90, 0, 30, -10); c.closePath(); fo(c, far ? '#dedad2' : SAM.tabi, lw * .8);
      stroke(c, [60, 6, 90, 50], 7, SAM.thong); c.restore();
      if (P.armor) { stroke(c, [kx, ky, ax, ay - 20], 110 + lw * 2, NOAH.out); stroke(c, [kx, ky, ax, ay - 20], 110, far ? '#100d0a' : SAM.lacquer); }
      // hakama leg: wide panel from the hip to the ankle
      const top = 120, bot = P.armor ? 150 : 210, nx = Math.cos(t2), ny = -Math.sin(t2), mx = Math.cos(th), my = -Math.sin(th);
      const endY = P.armor ? ky + 40 : ay - 40, endX = P.armor ? kx : ax;
      c.beginPath(); c.moveTo(hip[0] - mx * top, hip[1] - 80 - my * top); c.lineTo(hip[0] + mx * top, hip[1] - 80 + my * top);
      c.lineTo(endX + nx * bot * .6 + 30, endY); c.quadraticCurveTo(endX, endY + 18, endX - nx * bot * .6 - 20, endY); c.closePath();
      fo(c, far ? shadeHex(legCol, -.18) : legCol, lw);
      c.save(); c.clip(); stroke(c, [hip[0], hip[1] - 60, endX, endY], 5, legD); if (P.stripe) for (let o = -80; o <= 80; o += 20) stroke(c, [hip[0] + o * .6, hip[1] - 80, endX + o, endY], 2, P.stripe); c.restore();
    };
    leg(walking ? -.42 * sw : -.03, walking ? .7 * lift2 : 0, true);
    if (!walking && !P.armor) { /* standing: hakama reads as one wide skirt */ }
    leg(walking ? .42 * sw : .03, walking ? .7 * lift : 0, false);
  }
  // ---- torso group (rotates about the hip when bowing)
  c.save(); c.translate(hip[0], hip[1]); c.rotate(bowA); c.translate(-hip[0], -hip[1]); c.translate(0, drop + bob);
  if (swords && (p.s || 1) > 0) sideSwords(c);
  // kosode / armour torso
  if (P.armor) {
    c.beginPath(); c.moveTo(-120, -940); c.lineTo(110, -940); c.quadraticCurveTo(140, -760, 120, -560); c.lineTo(-130, -560); c.quadraticCurveTo(-140, -760, -120, -940); c.closePath(); fo(c, SAM.lacquer, lw);
    c.save(); c.clip(); for (let r = 0; r < 7; r++) { const y = -890 + r * 46; for (let x = -130; x <= 130; x += 13) stroke(c, [x, y + 6, x, y + 40], 7, SAM.lace); stroke(c, [-140, y + 44, 140, y + 44], 4, SAM.goldL); } c.restore();
    for (let l = 0; l < 5; l++) { c.beginPath(); c.roundRect(-150, -560 + l * 46, 280, 50, 6); fo(c, SAM.lacquer, lw * .6); c.save(); c.clip(); for (let x = -146; x <= 126; x += 12) stroke(c, [x, -556 + l * 46, x, -514 + l * 46], 6, SAM.lace); c.restore(); }
  } else {
    const hem = P.robe ? -40 : -560;
    c.beginPath(); c.moveTo(-62, -968); c.quadraticCurveTo(-110, -960, -118, -930); c.lineTo(-122, hem); c.lineTo(116, hem); c.lineTo(112, -925); c.quadraticCurveTo(90, -962, 44, -968); c.closePath(); fo(c, P.kos, lw);
    if (P.patches) { c.beginPath(); c.rect(-90, -840, 70, 80); fo(c, SAM.patch, 3); }
    // collar
    c.beginPath(); c.moveTo(40, -968); c.lineTo(70, -968); c.lineTo(110, -800); c.lineTo(84, -790); c.closePath(); fo(c, SAM.collar, lw * .5);
    c.beginPath(); c.rect(-124, -640, 244, 70); fo(c, SAM.obi, lw * .8);
    if (P.haori) { c.beginPath(); c.moveTo(-70, -972); c.quadraticCurveTo(-130, -960, -134, -920); c.lineTo(-150, -440); c.lineTo(60, -440); c.lineTo(96, -780); c.lineTo(48, -972); c.closePath(); fo(c, P.hao, lw); drawKamon(c, -60, -870, 26); stroke(c, [60, -950, 80, -780], 14, '#1d1d20'); }
  }
  if (P.armor) { c.save(); c.translate(-40, -930); c.rotate(-.05); for (let l = 0; l < 6; l++) { c.beginPath(); c.roundRect(-80, l * 48, 150, 52, 6); fo(c, SAM.lacquer, lw * .6); c.save(); c.clip(); for (let x = -76; x <= 66; x += 13) stroke(c, [x, l * 48 + 4, x, l * 48 + 48], 7, SAM.lace); c.restore(); } c.restore(); }
  // neck + head
  c.beginPath(); c.rect(-28, -1000, 72, 50); c.fillStyle = NOAH.skin; c.fill(); stroke(c, [-28, -1000, -28, -958], 9, NOAH.out); stroke(c, [44, -1000, 44, -958], 9, NOAH.out);
  c.save(); c.translate(0, -980); c.rotate(p.tilt || 0); c.translate(0, 980);
  if (p.head) p.head(c, e); else samSideHeadLocal(c, e, hair, p.headOpts || {});
  c.restore();
  if (swords && (p.s || 1) < 0) sideSwords(c);
  c.restore();
  // ---- arms (outside the torso transform; IK to hand targets in body space)
  const rot = (x, y) => { const dx = x - hip[0], dy = y + drop + bob - hip[1], ca = Math.cos(bowA), sa = Math.sin(bowA); return [hip[0] + dx * ca - dy * sa, hip[1] + dx * sa + dy * ca]; };
  const sh = rot(-45, -915);
  const arm = (which, far) => {
    const spec = (p.arms || {})[which];
    let tx, ty;
    if (spec && spec.hand) [tx, ty] = spec.hand;
    else if (walking) { const a = (far ? 1 : -1) * .38 * sw; tx = sh[0] + Math.sin(a) * 400; ty = sh[1] + Math.cos(a) * 400; }
    else { const r = rot(-30, -500); tx = r[0] + (far ? 20 : 0); ty = r[1]; }
    const [ex, ey, wx, wy] = ik2(sh[0] + (far ? 15 : 0), sh[1], tx, ty, NOAH.UPPER, NOAH.FORE, -1);
    const col = P.armor ? SAM.indigoD : (P.haori ? P.hao : P.kos), dark = P.armor ? '#141a2c' : (P.haori ? SAM.haoriD : P.kosD);
    const c1 = far ? shadeHex(col, -.15) : col;
    const cx = ex + (wx - ex) * .8, cy = ey + (wy - ey) * .8;
    if (!P.armor) { c.beginPath(); c.moveTo(sh[0] - 50, sh[1] + 40); c.lineTo(ex - 20, ey + 30); c.lineTo(cx - 10, cy + 30); c.lineTo(cx - 30, Math.max(cy, ey) + 230); c.quadraticCurveTo(ex - 60, Math.max(cy, ey) + 260, sh[0] - 70, sh[1] + 200); c.closePath(); fo(c, far ? shadeHex(dark, -.15) : dark, lw); }
    stroke(c, [sh[0], sh[1], ex, ey, cx, cy], 118 + lw * 2, NOAH.out); stroke(c, [sh[0], sh[1], ex, ey, cx, cy], 118, c1);
    if (P.cover) stroke(c, [lerp(ex, cx, .3), lerp(ey, cy, .3), cx, cy], 108, P.cover);
    const ang = Math.atan2(wy - cy, wx - cx) - Math.PI / 2;
    const it = p.item && p.item.arm === which ? p.item : null;
    c.save(); c.translate(wx, wy);
    if (spec && spec.fist) samFist(c, 0, 10, ang + Math.PI / 2, .92); else { c.scale(.92, 1); noahHandLocal(c, ang + (spec && spec.hang || 0)); }
    if (it) { c.rotate(it.ang || 0); it.fn(c); }
    c.restore();
    c.save(); c.translate(cx, cy); c.rotate(ang); c.beginPath(); c.ellipse(0, 0, 64, 20, 0, 0, Math.PI * 2); fo(c, P.armor ? SAM.lacquer : dark, lw * .7); c.restore();
  };
  arm('far', true); arm('near', false);
  c.restore();
}

// ---------------------------------------------------------------- other characters (front view via drawSam + custom heads/palettes)
const WHO = {
  father: { pal: { col: '#4a3a32', dark: '#33281f', light: '#6a574a', hak: '#3b3a40', hakD: '#2a292e', stripe: '#6b6a70', haori: true, haoriCol: '#2d2b2e', mon: true }, hairCol: '#9a948e', moustache: true, brows: 'thick' },
  grandfather: { pal: { col: '#3d3a46', dark: '#2a2830', light: '#5a5764', hak: '#4a4950', hakD: '#36353b', stripe: '#77767b', haori: true, haoriCol: '#2b2a2f', mon: true }, hairCol: '#d8d4cc', moustache: true, beard: 'short' },
  teacher: { pal: { col: '#5b5146', dark: '#40382f', light: '#7a6e60', hak: '#2d2c30', hakD: '#1f1e22', stripe: null, haori: false }, hairCol: '#eeeae2', beard: 'long', brows: 'white' },
  wife: { dress: 'kimonoF', pal: { col: '#7a4a5a', dark: '#5c3442', light: '#9a6a78', obi: '#d8c27a' }, female: true },
  peasant: { dress: 'peasant', pal: { col: '#7d6a4e', dark: '#5f4f39', light: '#9a8664' }, hat: 'kasa' },
  merchant: { dress: 'kimonoM', pal: { col: '#5d6b4a', dark: '#46523a', light: '#7c8a66', obi: '#3a2c20' }, hat: null, hairCol: '#3c3430', chubby: true },
  ashigaru: { dress: 'ashigaru', pal: { col: '#2f3550', dark: '#20253a', light: '#4a5274' }, hat: 'jingasa' },
  enemy: { outfit: 'armor', armorPal: 'enemy' },
  daimyo: { pal: { col: '#6b2430', dark: '#4a1820', light: '#8e3a44', hak: '#c9a24a', hakD: '#9c7a2c', stripe: '#e0c070', haori: true, haoriCol: '#2a2238', mon: true, brocade: true }, shadow: true, hairCol: '#2a2422', moustache: true },
  helper: { pal: { col: '#5a5a3c', dark: '#43432c', light: '#77775a', hak: '#4a4a3a', hakD: '#36362a', stripe: null, haori: false } },
  clerk: { pal: { col: '#6c6b70', dark: '#525156', light: '#8a898e', hak: '#58575c', hakD: '#444348', stripe: '#6f6e73', haori: false, cover: SAM.sleeveCover } },
  bandit: { pal: { col: '#4a3c30', dark: '#33291f', light: '#62503f', hak: '#3a332c', hakD: '#2a241f', stripe: null, haori: false, patches: [[-110, -820, 60, 70, '#3a2e24']] }, loose: true, stubble: true },
};
function personHeadFront(c, e, w) {
  // same white round head; hair/hat/beard distinguish the person
  const cy = NOAH.HEAD.y, R = NOAH.HEAD.r;
  samHeadBase(c); samHeadOutline(c);
  if (w.female) {
    // hair: smooth dark hair with a bun on top (no topknot), side wings
    c.beginPath(); c.moveTo(-R - 6, cy); c.bezierCurveTo(-R - 20, cy - 190, -150, cy - R - 20, 0, cy - R - 10); c.bezierCurveTo(150, cy - R - 20, R + 20, cy - 190, R + 6, cy);
    c.quadraticCurveTo(R - 30, cy - 120, 120, cy - 150); c.quadraticCurveTo(0, cy - 120, -120, cy - 150); c.quadraticCurveTo(-R + 30, cy - 120, -R - 6, cy); c.closePath(); fo(c, '#2a2220', NOAH.W * .8);
    c.beginPath(); c.ellipse(0, cy - R - 60, 110, 70, 0, 0, Math.PI * 2); fo(c, '#2a2220', NOAH.W * .8);
    stroke(c, [-120, cy - R - 60, 140, cy - R - 90], 10, '#c9a24a'); circ(c, 150, cy - R - 92, 14); fo(c, '#b3261e', 4);
    noahFace(c, Object.assign({ mouth: 'soft' }, e));
    for (const s of [-1, 1]) { circ(c, s * 150, cy + 90, 26); c.fillStyle = 'rgba(230,140,140,.25)'; c.fill(); }
    return;
  }
  if (w.hat === 'kasa') {
    c.save(); c.translate(0, cy - 150); c.beginPath(); c.moveTo(-R - 160, 40); c.lineTo(0, -170); c.lineTo(R + 160, 40); c.quadraticCurveTo(0, 70, -R - 160, 40); c.closePath(); fo(c, '#cfae68', NOAH.W);
    for (let i = -6; i <= 6; i++) stroke(c, [0, -165, i * 66, 50], 3, '#a2843f'); c.restore();
    noahFace(c, e); stroke(c, [-R + 40, cy - 70, -60, cy + R - 10], 6, '#7a6236'); stroke(c, [R - 40, cy - 70, 60, cy + R - 10], 6, '#7a6236');
    return;
  }
  if (w.hat === 'jingasa') {
    noahFace(c, e);
    c.save(); c.translate(0, cy - 140); c.beginPath(); c.moveTo(-R - 110, 30); c.lineTo(0, -110); c.lineTo(R + 110, 30); c.quadraticCurveTo(0, 54, -R - 110, 30); c.closePath(); fo(c, '#1c1a1c', NOAH.W);
    stroke(c, [-R - 90, 26, R + 90, 26], 5, '#4a4a50'); drawKamon(c, 0, -30, 30, '#d8c27a'); c.restore();
    return;
  }
  // samurai-type hair (chonmage) in a given colour
  const hc = w.hairCol || NOAH.hair, save = NOAH.hair; NOAH.hair = hc; chonmageFront(c, { loose: w.loose }); NOAH.hair = save;
  const ee = Object.assign({}, e, w.brows === 'white' ? { browCol: '#cfcac0' } : {});
  noahFace(c, ee);
  if (w.brows === 'thick' || w.brows === 'white') for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 150, cy - 26); c.quadraticCurveTo(s * 95, cy - 56, s * 48, cy - 40); c.lineWidth = 22; c.strokeStyle = w.brows === 'white' ? '#e9e5dc' : '#4a403a'; c.lineCap = 'round'; c.stroke(); }
  if (w.moustache) { c.beginPath(); c.moveTo(-80, cy + 150); c.quadraticCurveTo(-40, cy + 108, 0, cy + 124); c.quadraticCurveTo(40, cy + 108, 80, cy + 150); c.quadraticCurveTo(40, cy + 132, 0, cy + 138); c.quadraticCurveTo(-40, cy + 132, -80, cy + 150); c.closePath(); fo(c, hc, 5); }
  if (w.beard) { const L = w.beard === 'long' ? 260 : 120; c.beginPath(); c.moveTo(-150, cy + 150); c.quadraticCurveTo(-120, cy + R + L * .4, 0, cy + R + L * .6); c.quadraticCurveTo(120, cy + R + L * .4, 150, cy + 150); c.quadraticCurveTo(0, cy + 200, -150, cy + 150); c.closePath(); fo(c, hc, NOAH.W * .7);
    for (let i = -3; i <= 3; i++) stroke(c, [i * 30, cy + 190, i * 22, cy + R + L * .45], 3, 'rgba(160,150,140,.6)'); }
  if (w.stubble) { for (let i = 0; i < 60; i++) { circ(c, (rnd(i) - .5) * 300, cy + 120 + rnd(i + 1) * 120, 3); c.fillStyle = 'rgba(70,60,55,.5)'; c.fill(); } }
}
function drawPerson(c, p = {}) {
  const w = WHO[p.who] || {};
  if (w.outfit === 'armor') return drawArmorEnemy(c, p);
  if (w.dress) return drawDressed(c, p, w);
  const pal = w.pal;
  const head = (c, e) => personHeadFront(c, e, w);
  drawSam(c, Object.assign({}, p, { outfit: 'custom', custom: pal, headFn: head }));
  if (w.shadow && p.shadow !== false) { /* face in shadow handled by caller with shadeFace */ }
}
// enemy samurai: green + gold armour, different helmet crest (antlers)
function drawArmorEnemy(c, p) {
  const save = { lace: SAM.lace, laceL: SAM.laceL, lacquer: SAM.lacquer, goldL: SAM.goldL, indigoD: SAM.indigoD };
  Object.assign(SAM, { lace: '#2f5a34', laceL: '#4a7a4a', goldL: '#e6c86a', indigoD: '#26301f' });
  try { drawSam(c, Object.assign({ flagOpts: { col: '#2f4a2c', ink: '#d8b552' } }, p, { outfit: 'armor', enemyCrest: true })); }
  finally { Object.assign(SAM, save); }
}
// kimono for women (to the floor), merchants (long kimono), peasants (short kimono, bare shins), ashigaru (simple armour, gun)
function drawDressed(c, p, w) {
  if (p.ink && !p._inked) { const W0 = NOAH.W; NOAH.W = W0 * p.ink; try { return drawDressed(c, Object.assign({}, p, { _inked: 1 }), w); } finally { NOAH.W = W0; } }
  const k = p.k ?? .5, e = p.expr || {}, pal = Object.assign({}, w.pal, p.pal || {}), lw = NOAH.W, d = w.dress;
  const arms = { l: Object.assign({ a: .1, b: -.06 }, (p.arms || {}).l), r: Object.assign({ a: .1, b: -.06 }, (p.arms || {}).r) };
  c.save(); c.translate(p.x || 0, p.y || 0); c.scale(k * (p.s || 1), k);
  const bob = p.bob || 0;
  if (d === 'kimonoF' || d === 'kimonoM') {
    for (const s of [-1, 1]) { c.beginPath(); c.ellipse(s * 50, -18, 60, 22, 0, 0, Math.PI * 2); fo(c, SAM.tabi, lw * .8); }
    c.beginPath(); c.moveTo(-150, -950); c.lineTo(150, -950); c.lineTo(w.chubby ? 190 : 150, -600); c.lineTo(160, -40); c.quadraticCurveTo(0, -20, -160, -40); c.lineTo(w.chubby ? -190 : -150, -600); c.closePath(); fo(c, pal.col, lw);
    c.save(); c.clip(); if (d === 'kimonoF') for (let i = 0; i < 26; i++) { const x = -150 + rnd(i) * 300, y = -560 + rnd(i + 2) * 500; sakuraPetal(c, x, y, 16, i, .9); } stroke(c, [0, -600, -20, -40], 6, pal.dark); c.restore();
    c.beginPath(); c.moveTo(40, -950); c.lineTo(-130, -40); c.lineWidth = 8; c.strokeStyle = pal.dark; c.stroke();
    c.beginPath(); c.moveTo(-60, -955); c.lineTo(10, -800); c.lineTo(60, -955); c.lineWidth = 26; c.strokeStyle = SAM.collar; c.stroke();
    c.beginPath(); c.rect(w.chubby ? -190 : -152, -720, w.chubby ? 380 : 304, d === 'kimonoF' ? 150 : 70); fo(c, pal.obi, lw * .8);
    if (d === 'kimonoF') stroke(c, [-150, -650, 150, -650], 10, '#b3261e');
  } else if (d === 'peasant' || d === 'ashigaru') {
    for (const s of [-1, 1]) { stroke(c, [s * 70, -520, s * 72, -90], 90 + lw * 2, NOAH.out); stroke(c, [s * 70, -520, s * 72, -90], 90, d === 'ashigaru' ? '#2a2e40' : '#e9e2d4'); c.beginPath(); c.ellipse(s * 80, -30, 70, 30, 0, 0, Math.PI * 2); fo(c, '#b49a6a', lw * .8); stroke(c, [s * 40, -60, s * 110, -40], 6, '#7d6438'); }
    if (d === 'ashigaru') for (const s of [-1, 1]) { c.beginPath(); c.rect(s * 70 - 50, -330, 100, 220); fo(c, '#1e1d22', lw * .8); }
    c.beginPath(); c.moveTo(-150, -950); c.lineTo(150, -950); c.lineTo(160, -420); c.lineTo(-160, -420); c.closePath(); fo(c, pal.col, lw);
    c.beginPath(); c.moveTo(40, -950); c.lineTo(-110, -420); c.lineWidth = 8; c.strokeStyle = pal.dark; c.stroke();
    c.beginPath(); c.rect(-150, -640, 300, 50); fo(c, '#5a4a36', lw * .6);
    if (d === 'ashigaru') { c.beginPath(); c.moveTo(-140, -930); c.lineTo(140, -930); c.lineTo(150, -620); c.lineTo(-150, -620); c.closePath(); fo(c, '#1e1d22', lw); for (let r = 0; r < 6; r++) stroke(c, [-146, -900 + r * 46, 146, -900 + r * 46], 4, '#4a4a52'); drawKamon(c, 0, -780, 40, '#d8c27a'); }
  }
  c.beginPath(); c.rect(-46, -1000, 92, 62); c.fillStyle = NOAH.skin; c.fill(); stroke(c, [-46, -1000, -46, -955], 10, NOAH.out); stroke(c, [46, -1000, 46, -955], 10, NOAH.out);
  const armOpt = { col: pal.col, dark: pal.dark, light: pal.light, wide: d === 'kimonoF' ? 280 : d === 'peasant' || d === 'ashigaru' ? 0 : 220 };
  c.save(); c.translate(0, bob);
  samArm(c, -1, arms.l, armOpt); samArm(c, 1, arms.r, armOpt);
  if (p.hold) p.hold(c);
  c.save(); c.translate(0, NOAH.HEAD.y + 260); c.rotate(p.tilt || 0); c.translate(0, -(NOAH.HEAD.y + 260));
  personHeadFront(c, p.expr || {}, w);
  c.restore(); c.restore();
  c.restore();
}
// a person seen from the side (e.g. a bowing peasant, the wife pouring tea)
function drawPersonSide(c, p) {
  const w = WHO[p.who] || {};
  const head = (c, e) => {
    samSideSkull(c, e);
    if (w.hat === 'kasa') { samSideFace(c, e); c.save(); c.translate(-10, -1430); c.beginPath(); c.moveTo(-380, 60); c.lineTo(0, -140); c.lineTo(380, 60); c.quadraticCurveTo(0, 90, -380, 60); c.closePath(); fo(c, '#cfae68', NOAH.W); for (let i = -6; i <= 6; i++) stroke(c, [0, -136, i * 60, 70], 3, '#a2843f'); c.restore(); return; }
    if (w.hat === 'jingasa') { samSideFace(c, e); c.save(); c.translate(-10, -1380); c.beginPath(); c.moveTo(-360, 40); c.lineTo(0, -110); c.lineTo(360, 40); c.quadraticCurveTo(0, 64, -360, 40); c.closePath(); fo(c, '#1c1a1c', NOAH.W); c.restore(); return; }
    if (w.female) { c.beginPath(); c.moveTo(-20, -1230); c.bezierCurveTo(-60, -1450, -260, -1430, -262, -1240); c.bezierCurveTo(-262, -1120, -210, -1060, -150, -1040); c.quadraticCurveTo(-60, -1120, -20, -1230); c.closePath(); fo(c, '#2a2220', NOAH.W * .8); c.beginPath(); c.ellipse(-120, -1520, 120, 70, -.2, 0, Math.PI * 2); fo(c, '#2a2220', NOAH.W * .8); stroke(c, [-250, -1500, 40, -1560], 10, '#c9a24a'); samSideFace(c, Object.assign({ mouth: 'soft' }, e)); return; }
    const save = NOAH.hair; NOAH.hair = w.hairCol || NOAH.hair; chonmageSide(c, { col: w.hairCol, loose: w.loose }); NOAH.hair = save; samSideFace(c, e);
    if (w.moustache) { c.beginPath(); c.moveTo(100, -1104); c.quadraticCurveTo(150, -1130, 196, -1100); c.quadraticCurveTo(150, -1112, 100, -1104); fo(c, w.hairCol || NOAH.hair, 5); }
    if (w.beard) { c.beginPath(); c.moveTo(60, -1080); c.quadraticCurveTo(160, -1000, 150, -1060 + (w.beard === 'long' ? 230 : 90)); c.quadraticCurveTo(60, -1040, 0, -1060); c.closePath(); fo(c, w.hairCol, NOAH.W * .7); }
  };
  const pal = w.pal || {};
  return drawSamSide(c, Object.assign({}, p, { head, pal: { kos: pal.col, kosD: pal.dark, hak: w.dress === 'peasant' ? pal.col : (pal.hak || pal.col), hakD: pal.hakD || pal.dark, stripe: pal.stripe, haori: !!pal.haori, hao: pal.haoriCol || pal.col }, swords: w.dress ? false : p.swords }));
}

// ---------------------------------------------------------------- horse (small, stocky Japanese horse), side view facing right
function drawHorse(c, x, y, s = 1, o = {}) {
  const t = o.t || 0, g = o.gallop ? t * 11 : 0, col = o.col || '#6b4a32', dark = shadeHex(col, -.3), lw = (o.lw ?? 5);
  c.save(); c.translate(x, y); c.scale(s * (o.dir || 1), s);
  const bob = o.gallop ? Math.sin(g * 2) * 10 : 0;
  const leg = (hx, hy, ph, far) => { const a = o.gallop ? Math.sin(g + ph) * .7 : 0, b = o.gallop ? Math.max(0, Math.sin(g + ph + 1)) * 1.1 : 0;
    const kx = hx + Math.sin(a) * 90, ky = hy + Math.cos(a) * 90, fx = kx + Math.sin(a - b) * 100, fy = ky + Math.cos(a - b) * 100;
    stroke(c, [hx, hy, kx, ky, fx, fy], 30 + lw * 2, OUT); stroke(c, [hx, hy, kx, ky, fx, fy], 30, far ? dark : col); ell(c, fx + 6, fy + 6, 18, 10); fo(c, '#1d1715', 2); };
  c.translate(0, bob);
  leg(-120, -190, 0, true); leg(110, -190, 1.6, true);
  // body
  c.beginPath(); c.ellipse(0, -240, 190, 90, 0, 0, Math.PI * 2); fo(c, col, lw);
  // neck + head (group rotates a little with the gait)
  const na = o.gallop ? Math.sin(g * 2) * .07 : Math.sin(t * 1.3) * .03;
  c.save(); c.translate(150, -290); c.rotate(na); c.translate(-150, 290);
  c.beginPath(); c.moveTo(110, -320); c.lineTo(240, -500); c.lineTo(300, -470); c.lineTo(210, -220); c.closePath(); fo(c, col, lw);
  c.beginPath(); c.moveTo(230, -520); c.lineTo(300, -530); c.lineTo(410, -390); c.quadraticCurveTo(410, -340, 370, -345); c.lineTo(300, -400); c.closePath(); fo(c, col, lw);
  c.beginPath(); c.moveTo(245, -515); c.lineTo(240, -575); c.lineTo(275, -522); c.closePath(); fo(c, col, lw * .8);
  circ(c, 290, -470, 9); c.fillStyle = '#111'; c.fill(); circ(c, 390, -365, 6); c.fill();
  stroke(c, [300, -460, 380, -370], 5, '#3a2416'); stroke(c, [360, -380, 200, -320], 4, '#3a2416');
  for (let i = 0; i < 7; i++) stroke(c, [110 + i * 20, -330 - i * 26, 90 + i * 20 + Math.sin(t * 6 + i) * 8, -300 - i * 26], 14, '#2a1d14');
  c.restore();
  // tail
  c.beginPath(); c.moveTo(-180, -270); c.quadraticCurveTo(-280 - (o.gallop ? 40 : 0), -240 + Math.sin(t * 5) * 20, -250, -120); c.lineWidth = 26; c.strokeStyle = '#2a1d14'; c.lineCap = 'round'; c.stroke();
  // saddle
  if (o.saddle !== false) { c.beginPath(); c.moveTo(-70, -320); c.quadraticCurveTo(0, -300, 60, -330); c.lineTo(50, -270); c.lineTo(-60, -270); c.closePath(); fo(c, '#5a1c22', lw * .8); stroke(c, [-80, -270, 70, -270], 6, '#c9a24a'); }
  leg(-110, -190, 3.1, false); leg(120, -190, 4.7, false);
  if (o.rider) o.rider(c, bob);
  c.restore();
}
