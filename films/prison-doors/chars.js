// CHARACTERS: Noah (the skill's rig + a prison jumpsuit costume layer), the guard, the other prisoners, cell props.
const FONT = "NoahInter, Inter, 'DejaVu Sans', sans-serif";
const INK = '#211c1a';
const lineU = (c, pts, w, col) => { c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.lineWidth = w; c.strokeStyle = col; c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke(); };
const fillU = (c, col, w = 13, ink = INK) => { if (col) { c.fillStyle = col; c.fill(); } if (w) { c.lineWidth = w; c.strokeStyle = ink; c.lineJoin = 'round'; c.stroke(); } };

// =========================== NOAH: jumpsuit costume over the rig ===========================
const JS = { base: '#8f969d', dark: '#6c737b', light: '#b3b9be', seam: '#7b828a', tag: '#f1ede2' };
function jsTorso(c) {
  // two open front panels of the jumpsuit (the black "Noah" tee shows in the middle), collar flaps, chest tag "64"
  const H = NOAH.HEM;
  for (const s of [-1, 1]) {
    c.beginPath(); c.moveTo(s * 58, -954); c.lineTo(s * 158, -944); c.quadraticCurveTo(s * 146, -820, s * 134, -760); c.lineTo(s * 128, H - 6);
    c.lineTo(s * 74, H - 6); c.quadraticCurveTo(s * 64, -600, s * 108, -700); c.lineTo(s * 112, -800); c.quadraticCurveTo(s * 102, -900, s * 58, -954); c.closePath();
    fillU(c, JS.base, NOAH.W);
    // fold shading + seam
    c.save(); c.clip(); lineU(c, [s * 122, -930, s * 116, H], 10, JS.dark); lineU(c, [s * 92, -700, s * 84, H], 4, JS.light); c.restore();
    // collar flap
    c.beginPath(); c.moveTo(s * 58, -954); c.lineTo(s * 150, -946); c.lineTo(s * 126, -880); c.lineTo(s * 100, -900); c.closePath(); fillU(c, JS.light, NOAH.W * .7);
  }
  // waist: jumpsuit belt line under the open front
  lineU(c, [-128, H - 20, -74, H - 20], 16, JS.dark); lineU(c, [74, H - 20, 128, H - 20], 16, JS.dark);
  // "64" tag on the left chest (viewer's right)
  c.save(); c.translate(103, -655); c.rotate(-.04);
  c.beginPath(); rrect(c, -30, -24, 60, 44, 6); fillU(c, JS.tag, NOAH.W * .5);
  c.fillStyle = '#1d1a18'; c.font = `700 34px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('64', 0, 0); c.restore();
}
function noahArmP(c, side, spec, watch) {
  // = noahArm from the rig, plus the rolled-up jumpsuit sleeve over the t-shirt sleeve
  const S = NOAH.SHOULDER, sx = side * S.x, sy = S.y, a = spec.a, b = spec.b ?? 0, a2 = a + b;
  const ex = sx + side * Math.sin(a) * NOAH.UPPER, ey = sy + Math.cos(a) * NOAH.UPPER;
  const wx = ex + side * Math.sin(a2) * NOAH.FORE, wy = ey + Math.cos(a2) * NOAH.FORE;
  const ux = side * Math.sin(a), uy = Math.cos(a), ox = side * Math.cos(a), oy = -Math.sin(a);
  const Pp = (u, o) => [sx + ux * u + ox * o, sy + uy * u + oy * o];
  const upper = () => {
    nLine(c, [sx, sy, ex, ey], NOAH.ARM_W + NOAH.W * 2, NOAH.out); nLine(c, [sx, sy, ex, ey], NOAH.ARM_W, NOAH.skin);
    // jumpsuit sleeve (covers the tee sleeve), rolled at mid upper arm
    c.beginPath(); c.moveTo(...Pp(-30, -54)); c.quadraticCurveTo(...Pp(-46, -10), ...Pp(-28, 22)); c.quadraticCurveTo(...Pp(40, 62), ...Pp(118, 64)); c.lineTo(...Pp(126, -50)); c.closePath(); fillU(c, JS.base, NOAH.W);
    c.beginPath(); c.moveTo(...Pp(100, 68)); c.lineTo(...Pp(140, 66)); c.lineTo(...Pp(146, -54)); c.lineTo(...Pp(104, -54)); c.closePath(); fillU(c, JS.light, NOAH.W * .8);
  };
  const lower = () => {
    nLine(c, [ex, ey, wx, wy], NOAH.ARM_W + NOAH.W * 2, NOAH.out); nLine(c, [ex, ey, wx, wy], NOAH.ARM_W, NOAH.skin);
    c.beginPath(); c.arc(ex, ey, NOAH.ARM_W / 2, 0, 7); c.fillStyle = NOAH.skin; c.fill();
    if (watch) {
      const k = .82, cx = ex + (wx - ex) * k, cy = ey + (wy - ey) * k, fx = side * Math.sin(a2), fy = Math.cos(a2);
      nLine(c, [cx - fy * 40, cy + fx * 40, cx + fy * 40, cy - fx * 40], 22, NOAH.out); nLine(c, [cx - fy * 36, cy + fx * 36, cx + fy * 36, cy - fx * 36], 13, NOAH.watch);
      c.beginPath(); c.arc(cx + fy * 34 * side, cy - fx * 34 * side, 18, 0, Math.PI * 2); nFill(c, NOAH.watch, 8);
    }
    c.save(); c.translate(wx, wy); if (spec.fist) noahFist(c, -side * a2 + (spec.hand || 0)); else noahHandLocal(c, -side * a2 + (spec.hand || 0)); c.restore();
  };
  // forearm folded back over the upper arm (chin pose): draw the upper arm first, forearm on top
  upper(); lower();
  return [wx, wy];
}
function noahFist(c, ang) {
  // closed hand (gripping a bar / holding chalk), same ink and skin as the rig's hand
  c.save(); c.rotate(ang);
  c.beginPath(); c.ellipse(0, 40, 44, 50, 0, 0, Math.PI * 2); nFill(c, NOAH.skin, NOAH.W * .8);
  for (const y of [22, 44, 66]) nLine(c, [-30, y, 24, y], 4, NOAH.out);
  c.beginPath(); c.ellipse(-30, 18, 18, 26, -.5, 0, 7); nFill(c, NOAH.skin, NOAH.W * .6);
  c.restore();
}
function drawNoahP(c, p = {}) {
  // front view Noah in the jumpsuit. p: like drawNoah + sit/seatH; arms specs may carry fist:true
  const W0 = NOAH.W; if (p.ink) NOAH.W = W0 * p.ink;
  const sv = [NOAH.pants, NOAH.stripe]; NOAH.pants = JS.base; NOAH.stripe = JS.seam;
  try {
    const k = p.k ?? .25, arms = Object.assign({}, NOAH.ARMS, p.arms || {}), e = p.expr || {};
    const dy = p.sit ? (-(p.seatH ?? 250)) - (NOAH.HEM + 40) - 60 : 0;
    c.save(); c.translate(p.x || 0, p.y || 0); c.scale(k * (p.s || 1), k); if (p.lean) c.rotate(p.lean);
    if (p.sit) noahLegsSitting(c, p, false); else noahLegs(c, p);
    c.save(); c.translate(0, dy + (p.bob || 0));
    noahTorso(c); jsTorso(c);
    c.beginPath(); c.rect(-46, -1000, 92, 62); c.fillStyle = NOAH.skin; c.fill(); nLine(c, [-46, -1000, -46, -948], 10, NOAH.out); nLine(c, [46, -1000, 46, -948], 10, NOAH.out);
    c.beginPath(); c.moveTo(-58, -952); c.quadraticCurveTo(0, -915, 58, -952); c.lineWidth = 10; c.strokeStyle = NOAH.out; c.stroke();
    const up = arms.l.a > 1.6 || arms.r.a > 1.6 || p.armsFront;
    const A = () => { noahArmP(c, -1, arms.l, false); noahArmP(c, 1, arms.r, true); if (p.hold) p.hold(c); };
    if (!up) A();
    c.save(); c.translate(0, NOAH.HEAD.y + 260); c.rotate(p.tilt || 0); c.translate(0, -(NOAH.HEAD.y + 260));
    noahHairBack(c); noahHeadLocal(c, e); c.restore();
    if (up) A();
    c.restore(); c.restore();
  } finally { NOAH.W = W0; NOAH.pants = sv[0]; NOAH.stripe = sv[1]; }
}
function drawNoahPSide(c, p = {}) {
  // side profile (walk/run cycle from the rig) in the jumpsuit: grey legs, open jumpsuit panel at the back of the torso
  const W0 = NOAH.W; if (p.ink) NOAH.W = W0 * p.ink;
  const sv = [NOAH.pants, NOAH.stripe]; NOAH.pants = JS.base; NOAH.stripe = JS.seam;
  try {
    const k = p.k ?? .25, e = p.expr || {}, ph = p.walk, walking = ph !== null && ph !== undefined;
    const sw = walking ? Math.sin(ph) : 0, lift = walking ? Math.max(0, Math.cos(ph)) : 0, lift2 = walking ? Math.max(0, -Math.cos(ph)) : 0;
    const bob = (walking ? -Math.abs(Math.cos(ph)) * 18 : 0) + (p.bob || 0), aSw = p.armSwing ?? .38, st = p.stride ?? 1;
    c.save(); c.translate(p.x || 0, p.y || 0); c.scale(k * (p.s || 1), k); if (p.lean) c.rotate(p.lean);
    c.save(); c.translate(0, bob);
    noahSideArm(c, walking ? aSw * sw : .05, walking ? .12 + .3 * Math.max(0, sw) : -.05, true, false);
    noahSideLeg(c, walking ? -.42 * st * sw : -.03, walking ? .9 * lift2 : 0, true, false);
    noahSideLeg(c, walking ? .42 * st * sw : .03, walking ? .9 * lift : 0, false, false);
    noahSideTorso(c, false, p.s || 1);
    c.beginPath(); c.moveTo(-60, -968); c.quadraticCurveTo(-100, -960, -108, -940); c.lineTo(-112, -515); c.lineTo(-30, -515); c.lineTo(-40, -760); c.lineTo(-20, -940); c.closePath(); fillU(c, JS.base, NOAH.W);
    c.beginPath(); c.moveTo(-60, -968); c.lineTo(-10, -962); c.lineTo(-40, -900); c.closePath(); fillU(c, JS.light, NOAH.W * .7);
    c.beginPath(); c.rect(-28, -1000, 72, 50); c.fillStyle = NOAH.skin; c.fill(); nLine(c, [-28, -1000, -28, -958], 9, NOAH.out); nLine(c, [44, -1000, 44, -958], 9, NOAH.out);
    c.save(); c.translate(0, -980); c.rotate(p.tilt || 0); c.translate(0, 980); noahSideHead(c, e); c.restore();
    noahSideArm(c, walking ? -aSw * sw : .02, walking ? .12 + .3 * Math.max(0, -sw) : -.05, false, false);
    c.restore(); c.restore();
  } finally { NOAH.W = W0; NOAH.pants = sv[0]; NOAH.stripe = sv[1]; }
}

// =========================== shared head for the other characters ===========================
// head centre at (0, hy), radius R. o: { hair, hairCol, beard, beardCol, stache, glasses, cap, eyes, lid, brows, mouth, look, straw }
function head(c, hy, R, o = {}) {
  const w = 12;
  // hair behind the head
  if (o.hair === 'long') { c.beginPath(); c.ellipse(0, hy + 40, R * 1.05, R * 1.08, 0, 0, 7); fillU(c, o.hairCol, w * .7); }
  if (o.hair === 'curly') for (let i = 0; i < 14; i++) { const a = Math.PI + i / 13 * Math.PI; c.beginPath(); c.arc(Math.cos(a) * R * .98, hy + Math.sin(a) * R * .98 + 10, R * .26, 0, 7); fillU(c, o.hairCol, w * .7); }
  if (o.hair === 'messy') for (let i = 0; i < 9; i++) { const a = Math.PI * 1.08 + i / 8 * Math.PI * .84; c.beginPath(); c.moveTo(Math.cos(a) * R * .7, hy + Math.sin(a) * R * .7); c.lineTo(Math.cos(a + .08) * R * 1.32, hy + Math.sin(a + .08) * R * 1.32); c.lineTo(Math.cos(a + .22) * R * .8, hy + Math.sin(a + .22) * R * .8); c.closePath(); fillU(c, o.hairCol, w * .6); }
  // skull
  c.save(); c.beginPath(); c.arc(0, hy, R, 0, 7); c.fillStyle = '#dedad6'; c.fill(); c.clip(); c.beginPath(); c.arc(-4, hy - R * .13, R - 4, 0, 7); c.fillStyle = '#fff'; c.fill(); c.restore();
  c.beginPath(); c.arc(0, hy, R, 0, 7); fillU(c, null, w);
  if (o.hair === 'bald') { c.beginPath(); c.ellipse(-R * .35, hy - R * .55, R * .22, R * .1, -.5, 0, 7); c.fillStyle = 'rgba(255,255,255,.9)'; c.fill(); lineU(c, [-R * .5, hy - R * .6, -R * .25, hy - R * .75], 8, 'rgba(180,190,205,.5)'); }
  if (o.hair === 'sides') for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * R * .98, hy - R * .25); c.quadraticCurveTo(s * R * 1.22, hy + R * .1, s * R * .9, hy + R * .45); c.quadraticCurveTo(s * R * 1.05, hy, s * R * .8, hy - R * .35); c.closePath(); fillU(c, o.hairCol, w * .6); }
  if (o.hair === 'buzz') { c.beginPath(); c.arc(0, hy, R, Math.PI * 1.08, Math.PI * 1.92); c.quadraticCurveTo(0, hy - R * .55, -R * .96, hy - R * .28); fillU(c, o.hairCol, w * .7); for (let i = 0; i < 18; i++) { const x = -R * .7 + rnd(i) * R * 1.4, y = hy - R * .9 + rnd(i + 9) * R * .35; c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(x, y, 6, 6); } }
  if (o.hair === 'curly' || o.hair === 'messy' || o.hair === 'long') { c.beginPath(); c.arc(0, hy, R, Math.PI * 1.06, Math.PI * 1.94); c.quadraticCurveTo(R * .3, hy - R * .45, 0, hy - R * .58); c.quadraticCurveTo(-R * .3, hy - R * .45, -R * .97, hy - R * .3); fillU(c, o.hairCol, w * .7);
    if (o.hair === 'curly') for (let i = 0; i < 7; i++) { c.beginPath(); c.arc(-R * .7 + i * R * .23, hy - R * .7 + Math.abs(i - 3) * 14, R * .2, 0, 7); fillU(c, o.hairCol, w * .6); } }
  if (o.hair === 'part') { c.beginPath(); c.moveTo(-R * .98, hy - R * .1); c.bezierCurveTo(-R * 1.05, hy - R * 1.1, R * 1.05, hy - R * 1.1, R * .98, hy - R * .1); c.quadraticCurveTo(R * .5, hy - R * .7, -R * .2, hy - R * .62); c.quadraticCurveTo(-R * .7, hy - R * .55, -R * .98, hy - R * .1); fillU(c, o.hairCol, w * .7); }
  // eyes
  const ey = hy + R * .08, lid = o.lid || 0;
  for (const s of [-1, 1]) {
    const ex = s * R * .36;
    if (o.eyes === 'closed') { c.beginPath(); c.moveTo(ex - 24, ey); c.quadraticCurveTo(ex, ey + 18, ex + 24, ey); c.lineWidth = 9; c.strokeStyle = INK; c.lineCap = 'round'; c.stroke(); }
    else { const big = o.big || 1; c.save(); c.beginPath(); c.rect(ex - 40, ey - 40 * big + lid * 64 * big, 80, 90 * big); c.clip(); c.beginPath(); c.ellipse(ex + (o.look || 0) * 6, ey, 21 * big, 31 * big, 0, 0, 7); c.fillStyle = INK; c.fill(); c.restore(); if (lid > .05) lineU(c, [ex - 25, ey - 31 * big + lid * 62 * big, ex + 25, ey - 31 * big + lid * 62 * big], 7, INK); }
  }
  // brows
  const bc = o.browCol || '#6c625b';
  for (const s of [-1, 1]) {
    const bx = s * R * .36, by = hy - R * .2;
    if (o.brows === 'angry') lineU(c, [bx - s * 50, by - 26, bx + s * 34, by + 8], 15, bc);
    else if (o.brows === 'sad') lineU(c, [bx - s * 44, by + 8, bx + s * 40, by - 22], 13, bc);
    else if (o.brows === 'bushy') { lineU(c, [bx - 48, by - 6, bx + 48, by - 10], 22, bc); }
    else { c.beginPath(); c.moveTo(bx - 44, by - 4 - (o.up || 0) * 16); c.quadraticCurveTo(bx, by - 24 - (o.up || 0) * 16, bx + 44, by - 8 - (o.up || 0) * 16); c.lineWidth = 12; c.strokeStyle = bc; c.lineCap = 'round'; c.stroke(); }
  }
  // beard / stubble
  if (o.beard === 'long') { c.beginPath(); c.moveTo(-R * .85, hy + R * .2); c.quadraticCurveTo(-R * .9, hy + R * 1.4, -R * .2, hy + R * 2.15); c.quadraticCurveTo(0, hy + R * 2.3, R * .2, hy + R * 2.15); c.quadraticCurveTo(R * .9, hy + R * 1.4, R * .85, hy + R * .2); c.quadraticCurveTo(0, hy + R * .75, -R * .85, hy + R * .2); fillU(c, o.beardCol || '#f4f3ef', w * .7);
    c.save(); c.clip(); for (let i = 0; i < 9; i++) lineU(c, [-R * .6 + i * R * .15, hy + R * .7, -R * .4 + i * R * .1, hy + R * 1.9], 4, 'rgba(160,165,175,.6)'); c.restore(); }
  if (o.stubble) { for (let i = 0; i < 40; i++) { const a = .3 + rnd(i) * 2.5, rr = R * (.55 + rnd(i + 40) * .38); c.fillStyle = 'rgba(70,64,60,.5)'; c.fillRect(Math.cos(a) * rr, hy + Math.sin(a) * rr, 6, 6); } }
  // mouth (static)
  const my = hy + R * .55, m = o.mouth || 'smile';
  if (o.beard !== 'long' || true) {
    if (m === 'smile') { c.beginPath(); c.moveTo(-R * .22, my - 6); c.quadraticCurveTo(0, my + 18, R * .23, my - 6); c.lineWidth = 9; c.strokeStyle = INK; c.lineCap = 'round'; c.stroke(); }
    else if (m === 'grin') { c.beginPath(); c.moveTo(-R * .3, my - 12); c.quadraticCurveTo(0, my + 50, R * .3, my - 12); c.closePath(); fillU(c, '#5a2026', 8); }
    else if (m === 'frown') { c.beginPath(); c.moveTo(-R * .2, my + 10); c.quadraticCurveTo(0, my - 14, R * .2, my + 10); c.lineWidth = 9; c.strokeStyle = INK; c.stroke(); }
    else if (m === 'o') { c.beginPath(); c.ellipse(0, my + 4, 22, 28, 0, 0, 7); fillU(c, '#5a2026', 8); }
    else lineU(c, [-R * .14, my, R * .14, my], 8, INK);
  }
  if (o.stache) { c.beginPath(); c.moveTo(-R * .34, my - 4); c.quadraticCurveTo(-R * .2, my - 40, 0, my - 26); c.quadraticCurveTo(R * .2, my - 40, R * .34, my - 4); c.quadraticCurveTo(0, my - 14, -R * .34, my - 4); fillU(c, o.stacheCol || '#5a4a40', 6); }
  if (o.straw) { lineU(c, [R * .1, my + 2, R * .9, my + 40 + (o.strawW || 0)], 7, '#d8b95a'); lineU(c, [R * .1, my + 2, R * .9, my + 40 + (o.strawW || 0)], 3, '#f2dc8a'); }
  if (o.glasses) { for (const s of [-1, 1]) { c.beginPath(); c.arc(s * R * .36, ey, o.glasses * 56, 0, 7); c.lineWidth = 9; c.strokeStyle = '#2b2420'; c.stroke(); c.fillStyle = 'rgba(200,220,255,.18)'; c.fill(); } lineU(c, [-R * .36 + o.glasses * 56, ey, R * .36 - o.glasses * 56, ey], 8, '#2b2420'); }
  if (o.cap === 'flat') { c.beginPath(); c.moveTo(-R * 1.02, hy - R * .25); c.bezierCurveTo(-R * 1.1, hy - R * 1.2, R * 1.1, hy - R * 1.25, R * 1.08, hy - R * .3); c.quadraticCurveTo(R * 1.3, hy - R * .18, R * .7, hy - R * .1); c.quadraticCurveTo(0, hy - R * .38, -R * 1.02, hy - R * .25); fillU(c, o.capCol || '#6a5a44', w * .8); lineU(c, [-R * .8, hy - R * .7, R * .7, hy - R * .82], 5, 'rgba(0,0,0,.2)'); }
  if (o.cap === 'beanie') { c.beginPath(); c.moveTo(-R * 1.0, hy - R * .3); c.bezierCurveTo(-R * 1.05, hy - R * 1.3, R * 1.05, hy - R * 1.3, R * 1.0, hy - R * .3); c.closePath(); fillU(c, o.capCol || '#9a3a32', w * .8); lineU(c, [-R, hy - R * .38, R, hy - R * .38], 30, o.capCol2 || '#7a2a24'); }
}
// generic front body (units like the rig: feet at 0). o: { Ht, R, sw (shoulder half width), suit, under, bare, tattoo, arms{l,r}, sit, seatH, legsCol, shoe, hold(c, hands) }
function body(c, o) {
  const Ht = o.Ht || 1500, R = o.R || 240, hy = -(Ht - R), sy = hy + R + 70, sw = o.sw || 150, hip = -Ht * .37, suit = o.suit || '#6f8790', w = 12;
  const legW = o.legW || 100;
  const seatDy = o.sit ? (-(o.seatH ?? 240)) - hip + 60 : 0;
  // legs
  if (o.sit) { for (const s of [-1, 1]) { const ky = -(o.seatH ?? 240) - 30; lineU(c, [s * sw * .55, ky, s * sw * .7, -70], legW + w * 2, INK); lineU(c, [s * sw * .55, ky, s * sw * .7, -70], legW, o.legsCol || suit); c.beginPath(); c.ellipse(s * sw * .55, ky + 6, legW * .65, legW * .5, 0, 0, 7); fillU(c, o.legsCol || suit, w); c.beginPath(); c.ellipse(s * sw * .72, -36, 70, 40, 0, 0, 7); fillU(c, o.shoe || '#3a332f', w); } }
  else for (const s of [-1, 1]) { const lift = (o.lift && o.lift[s < 0 ? 0 : 1]) || 0; lineU(c, [s * sw * .4, hip + 20, s * sw * .45, -80 - lift], legW + w * 2, INK); lineU(c, [s * sw * .4, hip + 20, s * sw * .45, -80 - lift], legW, o.legsCol || suit); c.beginPath(); c.ellipse(s * sw * .55, -36 - lift, 82, 42, 0, 0, 7); fillU(c, o.shoe || '#3a332f', w); }
  c.save(); c.translate(0, seatDy + (o.bob || 0));
  if (o.lean) { c.translate(0, hip); c.rotate(o.lean); c.translate(0, -hip); }
  // torso
  c.beginPath(); c.moveTo(-sw * .45, sy - 8); c.lineTo(-sw, sy); c.quadraticCurveTo(-sw * 1.04, (sy + hip) / 2, -sw * .9, hip); c.lineTo(sw * .9, hip); c.quadraticCurveTo(sw * 1.04, (sy + hip) / 2, sw, sy); c.lineTo(sw * .45, sy - 8); c.quadraticCurveTo(0, sy + 30, -sw * .45, sy - 8); c.closePath();
  fillU(c, o.bare ? o.under : suit, w);
  c.save(); c.clip();
  if (!o.bare) { c.beginPath(); c.moveTo(-sw * .3, sy - 10); c.lineTo(0, sy + 90); c.lineTo(sw * .3, sy - 10); c.closePath(); c.fillStyle = o.under || '#e8e4dc'; c.fill(); lineU(c, [0, sy + 90, 0, hip], 6, 'rgba(0,0,0,.25)'); for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(10, sy + 150 + i * 110, 9, 0, 7); c.fillStyle = 'rgba(0,0,0,.35)'; c.fill(); } }
  lineU(c, [-sw, sy + 40, -sw * .8, hip], 18, 'rgba(0,0,0,.12)');
  c.restore();
  if (o.num) { c.save(); c.translate(-sw * .5, sy + 140); c.beginPath(); rrect(c, -34, -24, 68, 46, 6); fillU(c, '#efeadf', 6); c.fillStyle = '#222'; c.font = `700 ${o.num > 99 ? 26 : 34}px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(o.num), 0, 1); c.restore(); }
  // neck + head
  c.beginPath(); c.rect(-R * .18, sy - 60, R * .36, 64); c.fillStyle = '#fff'; c.fill(); lineU(c, [-R * .18, sy - 60, -R * .18, sy], 9, INK); lineU(c, [R * .18, sy - 60, R * .18, sy], 9, INK);
  const arms = o.arms || { l: { a: .12, b: -.1 }, r: { a: .12, b: -.1 } };
  const UP = Ht * .15, FO = Ht * .14, AW = o.armW || 64;
  const armPts = (s, sp) => { const sx = s * sw * .92, a = sp.a, a2 = a + (sp.b || 0), ex = sx + s * Math.sin(a) * UP, ey = sy + 20 + Math.cos(a) * UP, wx = ex + s * Math.sin(a2) * FO, wy = ey + Math.cos(a2) * FO; return { sx, sy: sy + 20, ex, ey, wx, wy, a, a2 }; };
  const hands = {};
  const drawArm = (s, sp) => {
    const q = armPts(s, sp); hands[s] = q;
    lineU(c, [q.sx, q.sy, q.ex, q.ey, q.wx, q.wy], AW + w * 2, INK); lineU(c, [q.sx, q.sy, q.ex, q.ey, q.wx, q.wy], AW, '#fff');
    if (!o.bare) { lineU(c, [q.sx, q.sy, q.sx + (q.ex - q.sx) * .7, q.sy + (q.ey - q.sy) * .7], AW + w * 2 + 14, INK); lineU(c, [q.sx, q.sy, q.sx + (q.ex - q.sx) * .7, q.sy + (q.ey - q.sy) * .7], AW + 14, suit); }
    else if (o.tattoo) { // heart + anchor tattoos on the forearms
      const mx = (q.ex + q.wx) / 2, my = (q.ey + q.wy) / 2; c.save(); c.translate(mx, my); c.rotate(-s * q.a2);
      if (s < 0) { c.beginPath(); c.moveTo(0, 14); c.bezierCurveTo(-30, -6, -16, -30, 0, -14); c.bezierCurveTo(16, -30, 30, -6, 0, 14); c.fillStyle = '#c0464e'; c.fill(); c.lineWidth = 4; c.strokeStyle = '#2c4a7a'; c.stroke(); }
      else { c.lineWidth = 6; c.strokeStyle = '#2c4a7a'; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, -26); c.lineTo(0, 22); c.moveTo(-14, -14); c.lineTo(14, -14); c.moveTo(-20, 8); c.quadraticCurveTo(0, 34, 20, 8); c.stroke(); c.beginPath(); c.arc(0, -30, 6, 0, 7); c.stroke(); }
      c.restore();
    }
    c.beginPath(); c.ellipse(q.wx, q.wy + 18, AW * .62, AW * .7, 0, 0, 7); fillU(c, '#fff', w * .8);
  };
  const up = arms.l.a > 1.5 || arms.r.a > 1.5 || o.armsFront;
  if (!up) { drawArm(-1, arms.l); drawArm(1, arms.r); }
  c.save(); c.translate(0, sy); c.rotate(o.tilt || 0); c.translate(0, -sy); head(c, hy, R, o.head || {}); c.restore();
  if (up) { drawArm(-1, arms.l); drawArm(1, arms.r); }
  if (o.crossed) { // arms crossed over the chest
    for (const s of [-1, 1]) { lineU(c, [s * sw * .9, sy + 30, s * sw * .9, sy + 220, -s * sw * .5, sy + 240], AW + w * 2, INK); lineU(c, [s * sw * .9, sy + 30, s * sw * .9, sy + 220, -s * sw * .5, sy + 240], AW, s < 0 ? suit : '#f0efee'); }
    lineU(c, [-sw * .9, sy + 200, sw * .7, sy + 260], AW + w * 2, INK); lineU(c, [-sw * .9, sy + 200, sw * .7, sy + 260], AW, suit);
    c.beginPath(); c.ellipse(sw * .75, sy + 255, 40, 36, 0, 0, 7); fillU(c, '#fff', w * .8);
  }
  if (o.hold) o.hold(c, hands);
  c.restore();
  return { hy, sy, hands };
}

// =========================== the guard ===========================
const GU = { coat: '#24304f', coatD: '#18203a', coatL: '#3a4a74', brass: '#d9ac55', cap: '#1d2744', stache: '#a9aaa8', hair: '#bdbcb8', book: '#b5302c' };
let GUARD_LANTERN = null; // screen-space lantern centre of the last drawn guard (for the light)
function guardLantern(c, x, y, sw, t) {
  c.save(); c.translate(x, y); c.rotate(sw);
  lineU(c, [0, 0, 0, 50], 7, '#2a2624');
  c.translate(0, 50);
  c.beginPath(); c.moveTo(-50, 20); c.lineTo(50, 20); c.lineTo(42, 150); c.lineTo(-42, 150); c.closePath();
  const g = c.createRadialGradient(0, 85, 4, 0, 85, 70); g.addColorStop(0, '#fff7d0'); g.addColorStop(.4, '#ffc860'); g.addColorStop(1, '#d07a20'); c.fillStyle = g; c.fill();
  c.lineWidth = 9; c.strokeStyle = '#2a2624'; c.stroke();
  c.beginPath(); c.ellipse(0, 95 + Math.sin(t * 17) * 3, 12, 26 + Math.sin(t * 23) * 4, 0, 0, 7); c.fillStyle = '#fffbe8'; c.fill();
  for (const xx of [-25, 25]) lineU(c, [xx, 22, xx * .9, 148], 6, '#2a2624');
  c.beginPath(); c.moveTo(-60, 20); c.lineTo(60, 20); c.lineTo(30, -12); c.lineTo(-30, -12); c.closePath(); fillU(c, '#3a3430', 7);
  c.beginPath(); c.rect(-56, 150, 112, 22); fillU(c, '#3a3430', 7);
  c.restore();
}
function guardKeys(c, x, y, sw) {
  c.save(); c.translate(x, y); c.rotate(sw);
  c.beginPath(); c.arc(0, 60, 62, 0, 7); c.lineWidth = 12; c.strokeStyle = '#7a6a48'; c.stroke(); c.lineWidth = 5; c.strokeStyle = '#d8c48a'; c.stroke();
  for (let i = 0; i < 6; i++) { const a = .5 + i * .42; c.save(); c.translate(Math.cos(a) * 62, 60 + Math.sin(a) * 62); c.rotate(a - Math.PI / 2 + Math.sin(sw * 8 + i) * .2);
    c.beginPath(); c.arc(0, 10, 14, 0, 7); c.fillStyle = i % 2 ? '#c9a24e' : '#9a9a96'; c.fill(); c.lineWidth = 5; c.strokeStyle = INK; c.stroke(); lineU(c, [0, 22, 0, 92], 11, INK); lineU(c, [0, 22, 0, 92], 6, i % 2 ? '#c9a24e' : '#9a9a96'); lineU(c, [0, 80, 14, 80, 14, 90], 6, i % 2 ? '#c9a24e' : '#9a9a96'); c.restore(); }
  c.restore();
}
// side view, facing +x when s=1. o: { walk (phase), t, sag (moustache droop 0..1), nod }
function drawGuardSide(c, o = {}) {
  const t = o.t || 0, ph = o.walk, walking = ph != null, sw = walking ? Math.sin(ph) : 0;
  const k = o.k ?? .25; c.save(); c.translate(o.x || 0, o.y || 0); c.scale(k * (o.s || 1), k);
  const bob = walking ? -Math.abs(Math.cos(ph)) * 22 : 0, w = 13;
  // legs
  const leg = (th, bend, far) => {
    const hx = 0, hy = -960, kx = hx + Math.sin(th) * 440, ky = hy + Math.cos(th) * 440, t2 = th - bend, ax = kx + Math.sin(t2) * 440, ay = ky + Math.cos(t2) * 440;
    lineU(c, [hx, hy, kx, ky, ax, ay], 70 + w * 2, INK); lineU(c, [hx, hy, kx, ky, ax, ay], 70, far ? GU.coatD : '#202a46');
    c.save(); c.translate(ax, ay - 20); c.rotate(clamp(t2 * .5, -.3, .3)); c.beginPath(); c.moveTo(-40, -10); c.lineTo(-44, 40); c.lineTo(150, 40); c.quadraticCurveTo(160, 10, 120, 0); c.lineTo(30, -16); c.closePath(); fillU(c, '#15151a', w * .9); c.restore();
  };
  c.save(); c.translate(0, bob);
  leg(walking ? -.36 * sw : -.04, walking ? .6 * Math.max(0, -Math.cos(ph)) : 0, true);
  // far arm with the red notebook (against the chest)
  lineU(c, [-10, -1400, 40, -1150, 150, -1080], 56 + w * 2, INK); lineU(c, [-10, -1400, 40, -1150, 150, -1080], 56, GU.coatD);
  c.save(); c.translate(150, -1120); c.rotate(-.3); c.beginPath(); rrect(c, -40, -70, 90, 120, 8); fillU(c, GU.book, w * .7); lineU(c, [-30, -70, -30, 50], 6, '#7a1c1a'); c.restore();
  c.beginPath(); c.ellipse(165, -1080, 34, 38, 0, 0, 7); fillU(c, '#fff', w * .7);
  leg(walking ? .36 * sw : .04, walking ? .6 * Math.max(0, Math.cos(ph)) : 0, false);
  // long coat, hunched back
  const hemSw = walking ? sw * 20 : 0;
  c.beginPath(); c.moveTo(80, -1450); c.quadraticCurveTo(140, -1200, 120, -980); c.lineTo(170 + hemSw, -400); c.lineTo(-180 + hemSw, -400); c.quadraticCurveTo(-150, -800, -130, -1000); c.quadraticCurveTo(-160, -1300, -60, -1480); c.quadraticCurveTo(0, -1500, 80, -1450); c.closePath(); fillU(c, GU.coat, w);
  c.save(); c.clip(); lineU(c, [-120, -1300, -150 + hemSw, -400], 30, GU.coatD); lineU(c, [100, -1400, 140 + hemSw, -420], 8, GU.coatL); c.restore();
  for (let i = 0; i < 6; i++) { const y = -1380 + i * 150, x = 112 + (i > 2 ? (i - 2) * 9 : 0); c.beginPath(); c.arc(x, y, 17, 0, 7); fillU(c, GU.brass, 5); c.beginPath(); c.arc(x - 5, y - 5, 5, 0, 7); c.fillStyle = '#fff3c8'; c.fill(); }
  lineU(c, [-140, -960, 128, -960], 36, '#141420'); c.beginPath(); c.rect(70, -985, 46, 50); fillU(c, GU.brass, 5);
  guardKeys(c, -40, -950, (walking ? Math.sin(ph * 2) * .25 : 0) + Math.sin(t * 3) * .03);
  // head (forward, hunched)
  const hx = 170, hy = -1640 + (o.nod || 0) * 40;
  c.save(); c.translate(60, -1460); c.rotate((o.nod || 0) * .25); c.translate(-60, 1460);
  lineU(c, [40, -1450, 110, -1560], 80 + w * 2, INK); lineU(c, [40, -1450, 110, -1560], 80, '#fff');
  c.beginPath(); c.moveTo(-10, -1700); c.quadraticCurveTo(-60, -1580, 0, -1520); c.lineTo(40, -1600); c.closePath(); fillU(c, GU.hair, w * .6);
  c.save(); c.beginPath(); c.arc(hx, hy, 200, 0, 7); c.fillStyle = '#dedad6'; c.fill(); c.clip(); c.beginPath(); c.arc(hx - 4, hy - 28, 196, 0, 7); c.fillStyle = '#fff'; c.fill(); c.restore(); c.beginPath(); c.arc(hx, hy, 200, 0, 7); fillU(c, null, w);
  // eyes (bored, half lids), bushy grey brows
  for (const [ex, sc] of [[hx + 90, 1], [hx + 165, .78]]) { const ey = hy - 10; c.save(); c.beginPath(); c.rect(ex - 30, ey - 6, 60, 60); c.clip(); c.beginPath(); c.ellipse(ex, ey + 8, 17 * sc, 26, 0, 0, 7); c.fillStyle = INK; c.fill(); c.restore(); lineU(c, [ex - 20 * sc, ey - 6, ex + 20 * sc, ey - 6], 7, INK); }
  lineU(c, [hx + 55, hy - 62, hx + 130, hy - 58], 22, GU.stache); lineU(c, [hx + 150, hy - 60, hx + 190, hy - 54], 18, GU.stache);
  // thin drooping moustache
  const sg = o.sag ?? .3;
  lineU(c, [hx + 120, hy + 80, hx + 175, hy + 92, hx + 205, hy + 140 + sg * 90, hx + 200, hy + 230 + sg * 160], 9, '#8e8f8d');
  lineU(c, [hx + 120, hy + 80, hx + 80, hy + 100, hx + 70, hy + 160 + sg * 90, hx + 82, hy + 240 + sg * 150], 9, '#8e8f8d');
  lineU(c, [hx + 70, hy + 80, hx + 190, hy + 80], 16, GU.stache);
  // cap with visor
  c.beginPath(); c.moveTo(hx - 190, hy - 70); c.quadraticCurveTo(hx - 200, hy - 250, hx - 20, hy - 270); c.quadraticCurveTo(hx + 170, hy - 290, hx + 190, hy - 120); c.lineTo(hx + 190, hy - 80); c.closePath(); fillU(c, GU.cap, w);
  c.beginPath(); c.moveTo(hx + 120, hy - 100); c.quadraticCurveTo(hx + 280, hy - 110, hx + 300, hy - 60); c.quadraticCurveTo(hx + 220, hy - 60, hx + 120, hy - 70); c.closePath(); fillU(c, '#0f1424', w * .8);
  lineU(c, [hx - 190, hy - 90, hx + 180, hy - 95], 16, '#0f1424'); c.beginPath(); c.arc(hx + 120, hy - 170, 22, 0, 7); fillU(c, GU.brass, 5);
  c.restore();
  // near arm with the lantern
  const la = walking ? -sw * .3 : .15, ex = 30 + Math.sin(.2 + la) * 360, ey = -1400 + Math.cos(.2 + la) * 360, wx = ex + Math.sin(.05 + la) * 330, wy = ey + Math.cos(.05 + la) * 330;
  lineU(c, [0, -1400, ex, ey, wx, wy], 58 + w * 2, INK); lineU(c, [0, -1400, ex, ey, wx, wy], 58, GU.coat); lineU(c, [ex, ey, (ex + wx) / 2, (ey + wy) / 2], 64, GU.coatL);
  c.beginPath(); c.ellipse(wx, wy + 10, 36, 40, 0, 0, 7); fillU(c, '#fff', w * .7);
  const lsw = (walking ? Math.sin(ph - .8) * .35 : 0) + Math.sin(t * 2.1) * .05;
  guardLantern(c, wx, wy + 30, lsw, t);
  c.restore();
  // remember the lantern position (world units relative to feet, approximate)
  o._lantern = [(wx + Math.sin(-lsw) * 135) * k * (o.s || 1), (wy + 30 + bob + 135) * k];
  c.restore();
  return o._lantern;
}
// front / back view. o: { back, walk, t, nod, sag }
function drawGuardFront(c, o = {}) {
  const t = o.t || 0, ph = o.walk, walking = ph != null, k = o.k ?? .25, w = 13;
  c.save(); c.translate(o.x || 0, o.y || 0); c.scale(k, k);
  const bob = walking ? -Math.abs(Math.cos(ph)) * 22 : 0, back = o.back;
  for (const s of [-1, 1]) { const lift = walking ? Math.max(0, Math.sin(ph) * s) * 60 : 0; lineU(c, [s * 70, -900, s * 74, -80 - lift], 76 + w * 2, INK); lineU(c, [s * 70, -900, s * 74, -80 - lift], 76, '#202a46'); c.beginPath(); c.ellipse(s * 86, -40 - lift, 74, 42, 0, 0, 7); fillU(c, '#15151a', w); }
  c.save(); c.translate(0, bob);
  const hemSw = walking ? Math.sin(ph) * 14 : 0;
  c.beginPath(); c.moveTo(-70, -1480); c.lineTo(-175, -1430); c.quadraticCurveTo(-190, -1000, -230 + hemSw, -400); c.lineTo(230 + hemSw, -400); c.quadraticCurveTo(190, -1000, 175, -1430); c.lineTo(70, -1480); c.quadraticCurveTo(0, -1440, -70, -1480); c.closePath(); fillU(c, GU.coat, w);
  c.save(); c.clip(); lineU(c, [-160, -1400, -200, -400], 26, GU.coatD); lineU(c, [0, -1460, hemSw, -400], back ? 8 : 10, back ? GU.coatD : '#141a30'); c.restore();
  if (!back) for (let i = 0; i < 6; i++) { for (const s of [-1, 1]) { const y = -1360 + i * 150; c.beginPath(); c.arc(s * 50, y, 16, 0, 7); fillU(c, GU.brass, 5); } }
  lineU(c, [-185, -950, 185, -950], 36, '#141420'); if (!back) { c.beginPath(); c.rect(-26, -975, 52, 50); fillU(c, GU.brass, 5); }
  guardKeys(c, back ? -150 : 150, -940, (walking ? Math.sin(ph * 2) * .25 : 0) + Math.sin(t * 3) * .03);
  // arms: one with lantern, one with the notebook
  const ls = back ? 1 : -1;
  lineU(c, [ls * 170, -1400, ls * 210, -1050, ls * 220, -760], 60 + w * 2, INK); lineU(c, [ls * 170, -1400, ls * 210, -1050, ls * 220, -760], 60, GU.coat);
  c.beginPath(); c.ellipse(ls * 220, -735, 38, 42, 0, 0, 7); fillU(c, '#fff', w * .7);
  guardLantern(c, ls * 220, -715, (walking ? Math.sin(ph - .8) * .3 : 0) + Math.sin(t * 2.1) * .05, t);
  lineU(c, [-ls * 170, -1400, -ls * 210, -1120, -ls * 120, -1020], 60 + w * 2, INK); lineU(c, [-ls * 170, -1400, -ls * 210, -1120, -ls * 120, -1020], 60, GU.coat);
  if (!back) { c.save(); c.translate(-ls * 110, -1060); c.rotate(-ls * .2); c.beginPath(); rrect(c, -50, -70, 100, 130, 8); fillU(c, GU.book, w * .7); c.restore(); }
  c.beginPath(); c.ellipse(-ls * 110, -1010, 36, 38, 0, 0, 7); fillU(c, '#fff', w * .7);
  // head
  const hy = -1660 + (o.nod || 0) * 60;
  c.save(); c.translate(0, -1480); c.rotate(0); c.translate(0, 1480);
  lineU(c, [0, -1480, 0, hy + 150], 80 + w * 2, INK); lineU(c, [0, -1480, 0, hy + 150], 80, '#fff');
  c.save(); c.beginPath(); c.arc(0, hy, 200, 0, 7); c.fillStyle = '#dedad6'; c.fill(); c.clip(); c.beginPath(); c.arc(-4, hy - 28, 196, 0, 7); c.fillStyle = back ? GU.hair : '#fff'; c.fill(); c.restore(); c.beginPath(); c.arc(0, hy, 200, 0, 7); fillU(c, null, w);
  if (!back) {
    const nod = o.nod || 0;
    for (const s of [-1, 1]) { const ex = s * 70, ey = hy + 10 + nod * 20; c.save(); c.beginPath(); c.rect(ex - 30, ey - 4, 60, 60); c.clip(); c.beginPath(); c.ellipse(ex, ey + 8, 18, 26, 0, 0, 7); c.fillStyle = INK; c.fill(); c.restore(); lineU(c, [ex - 22, ey - 4, ex + 22, ey - 4], 7, INK); lineU(c, [ex - 40, hy - 50, ex + 40, hy - 46 - s * 4], 22, GU.stache); }
    const sg = o.sag ?? .3, my = hy + 95 + nod * 25;
    for (const s of [-1, 1]) lineU(c, [0, my, s * 70, my + 10, s * 115, my + 70 + sg * 80, s * 110, my + 170 + sg * 150], 9, '#8e8f8d');
    lineU(c, [-80, my, 80, my], 16, GU.stache);
  } else { c.beginPath(); c.moveTo(-190, hy); c.quadraticCurveTo(0, hy + 120, 190, hy); c.lineTo(190, hy + 40); c.quadraticCurveTo(0, hy + 200, -190, hy + 40); c.closePath(); fillU(c, GU.hair, w * .6); }
  // cap
  c.beginPath(); c.moveTo(-200, hy - 70); c.quadraticCurveTo(-220, hy - 280, 0, hy - 290); c.quadraticCurveTo(220, hy - 280, 200, hy - 70); c.closePath(); fillU(c, GU.cap, w);
  if (!back) { c.beginPath(); c.ellipse(0, hy - 72 + (o.nod || 0) * 14, 190, 46, 0, 0, Math.PI); fillU(c, '#0f1424', w * .8); c.beginPath(); c.arc(0, hy - 170, 24, 0, 7); fillU(c, GU.brass, 5); }
  lineU(c, [-196, hy - 90, 196, hy - 90], 16, '#0f1424');
  c.restore();
  c.restore(); c.restore();
}

// =========================== prisoners ===========================
const PR = {};
const HAIRS = ['#3a2c22', '#6a4a2a', '#c9a060', '#1e1a18', '#8a3a22', '#9a9a9a'];
function typeOf(n) {
  const fixed = { 1: 'knit', 4: 'giant', 9: 'books', 16: 'pushup', 37: 'bald', 99: 'spoon', 64: 'noah', 25: 'sit', 36: 'stand', 49: 'read', 81: 'stand', 100: 'sit' };
  if (fixed[n]) return fixed[n];
  return ['sleep', 'cards', 'letter', 'harmonica', 'sit', 'read', 'stand', 'sleep', 'cards', 'lean'][Math.floor(rnd(n * 13 + 5) * 10)];
}
const CH = { cheer: new Float32Array(101), out: new Float32Array(101), peek: new Float32Array(101), sad: 0, spoon: 0 };
function prisonerLook(n) {
  const h = rnd(n * 3 + 1), hairTypes = ['part', 'buzz', 'curly', 'messy', 'beanie', 'part', 'buzz', 'long'];
  const ht = hairTypes[Math.floor(h * hairTypes.length)];
  return { hair: ht === 'beanie' ? 'buzz' : ht, cap: ht === 'beanie' ? 'beanie' : null, hairCol: HAIRS[Math.floor(rnd(n * 7) * HAIRS.length)], stache: rnd(n * 11) > .7, stubble: rnd(n * 17) > .6, glasses: rnd(n * 19) > .85 ? .5 : 0,
    suit: ['#6f8790', '#7c8a7a', '#86807a', '#6e7f95'][Math.floor(rnd(n * 23) * 4)], under: ['#e8e4dc', '#d9c27a', '#b84a3a', '#5a6f9a'][Math.floor(rnd(n * 29) * 4)], Ht: 1380 + rnd(n * 31) * 260 };
}
// draw prisoner n at the origin (feet), in world units; t = time. Returns nothing.
function drawPrisoner(c, n, t, detail = 1) {
  const ty = typeOf(n), L = prisonerLook(n), ch = CH.cheer[n];
  const kk = .25; c.save(); c.scale(kk, kk);
  const cheerArms = ch > 0 ? { l: { a: lerp(.12, 2.6, ch) + Math.sin(t * 9) * .1 * ch, b: lerp(-.1, .3, ch) }, r: { a: lerp(.12, 2.6, ch) + Math.sin(t * 9 + 1) * .1 * ch, b: lerp(-.1, .3, ch) } } : null;
  const hop = ch > 0 ? -Math.abs(Math.sin(t * 7 + n)) * 70 * ch : 0;
  if (ty === 'knit') {
    // old man in a rocking chair, knitting a red scarf
    const rock = ch > 0 ? 0 : Math.sin(t * 2.2) * .07;
    if (ch > .3) { body(c, { Ht: 1250, R: 230, sw: 130, suit: '#7a8278', under: '#e0d4b8', bob: hop, lean: .12, arms: cheerArms, head: { hair: 'sides', hairCol: '#f2f1ec', beard: 'long', glasses: .5, mouth: 'smile', brows: 'bushy', browCol: '#dcdcd8' } }); c.restore(); return; }
    c.save(); c.translate(0, 0); c.rotate(rock);
    // chair back
    c.beginPath(); rrect(c, -230, -1150, 460, 900, 40); fillU(c, '#7a4e2a', 12); for (let i = 0; i < 4; i++) lineU(c, [-150 + i * 100, -1100, -150 + i * 100, -300], 18, '#5a361c');
    body(c, { Ht: 1250, R: 230, sw: 130, suit: '#7a8278', under: '#e0d4b8', sit: true, seatH: 380, lean: .18, arms: { l: { a: .5, b: 1.5 }, r: { a: .5, b: 1.5 } }, head: { hair: 'sides', hairCol: '#f2f1ec', beard: 'long', glasses: .5, mouth: 'flat', brows: 'bushy', browCol: '#dcdcd8', lid: .35 },
      hold: (c, hd) => { // needles + scarf hanging to the floor
        const a = hd[-1], b = hd[1]; const k = Math.sin(t * 8) * 10;
        c.beginPath(); c.moveTo(a.wx, a.wy + 20); c.lineTo(b.wx, b.wy + 20); c.lineTo(b.wx + 30, b.wy + 360); c.lineTo(a.wx - 30, a.wy + 420); c.closePath(); fillU(c, '#c0392f', 8); c.save(); c.clip(); for (let i = 0; i < 8; i++) lineU(c, [a.wx - 40, a.wy + 40 + i * 50, b.wx + 40, b.wy + 40 + i * 50], 6, '#8a2420'); c.restore();
        lineU(c, [a.wx - 40, a.wy - 40 + k, a.wx + 90, a.wy + 60], 7, '#d8c9a0'); lineU(c, [b.wx + 40, b.wy - 40 - k, b.wx - 90, b.wy + 60], 7, '#d8c9a0');
        c.beginPath(); c.arc(0, -80, 70, 0, 7); fillU(c, '#c0392f', 8);
      } });
    lineU(c, [-300, 0, 300, 0], 22, '#5a361c'); c.beginPath(); c.moveTo(-320, -10); c.quadraticCurveTo(0, 50, 320, -10); c.lineWidth = 20; c.strokeStyle = '#5a361c'; c.stroke();
    c.restore(); c.restore(); return;
  }
  if (ty === 'giant') {
    const water = ch > .3 ? null : (c, hd) => { const b = hd[1]; c.save(); c.translate(b.wx + 20, b.wy + 10); c.rotate(-.5 + Math.sin(t * 1.5) * .1); c.beginPath(); rrect(c, -20, -60, 150, 120, 20); fillU(c, '#4d8a5a', 9); lineU(c, [120, -30, 230, -100], 22, INK); lineU(c, [120, -30, 230, -100], 12, '#4d8a5a'); c.restore();
      for (let i = 0; i < 5; i++) { const ph = (t * 1.6 + i / 5) % 1; c.beginPath(); c.arc(b.wx + 200 + ph * 40, b.wy - 60 + ph * 260, 8, 0, 7); c.fillStyle = 'rgba(160,210,255,.8)'; c.fill(); } };
    body(c, { Ht: 1820, R: 230, sw: 260, legW: 150, armW: 110, suit: '#6e7f95', under: '#ecebe6', bare: true, tattoo: true, bob: hop, arms: cheerArms || { l: { a: .25, b: -.1 }, r: { a: .9, b: .6 } }, head: { hair: 'buzz', hairCol: '#2a2420', mouth: 'smile', stubble: true, brows: 'neutral' }, hold: water });
    if (ch < .3) { // pot with a flower
      c.save(); c.translate(560, 0); c.beginPath(); c.moveTo(-90, -300); c.lineTo(90, -300); c.lineTo(70, -120); c.lineTo(-70, -120); c.closePath(); fillU(c, '#b8643a', 10); lineU(c, [0, -300, 0, -520], 12, '#3a7a3a');
      for (let i = 0; i < 6; i++) { const a = i / 6 * 7; c.beginPath(); c.ellipse(Math.cos(a) * 40, -560 + Math.sin(a) * 40, 36, 22, a, 0, 7); fillU(c, '#f08aa8', 6); } c.beginPath(); c.arc(0, -560, 24, 0, 7); fillU(c, '#f6d04a', 6);
      c.beginPath(); rrect(c, -110, -120, 220, 120, 6); fillU(c, '#6a4a30', 9); c.restore();
    }
    c.restore(); return;
  }
  if (ty === 'books') {
    body(c, { Ht: 1600, R: 220, sw: 110, legW: 76, armW: 52, suit: '#7c8a7a', under: '#d8d0bf', bob: hop, arms: cheerArms || { l: { a: .4, b: 1.4 }, r: { a: .4, b: 1.4 } }, head: { hair: 'messy', hairCol: '#c9a060', glasses: .62, big: 1.1, mouth: 'flat', look: .2 },
      hold: cheerArms ? null : (c, hd) => { const a = hd[-1], b = hd[1]; c.save(); c.translate((a.wx + b.wx) / 2, (a.wy + b.wy) / 2 - 10); c.beginPath(); c.moveTo(0, -10); c.lineTo(-140, -40); c.lineTo(-140, 70); c.lineTo(0, 100); c.lineTo(140, 70); c.lineTo(140, -40); c.closePath(); fillU(c, '#f4efe0', 8); lineU(c, [0, -10, 0, 100], 6, INK); for (let i = 0; i < 4; i++) { lineU(c, [-120, -10 + i * 22, -20, 10 + i * 22], 3, '#999'); lineU(c, [20, 10 + i * 22, 120, -10 + i * 22], 3, '#999'); } c.restore(); } });
    c.restore(); return;
  }
  if (ty === 'pushup') {
    if (ch > .3) { body(c, { Ht: 1500, R: 230, sw: 160, suit: '#86807a', under: '#c0453a', bob: hop, arms: cheerArms, head: { hair: 'curly', hairCol: '#c0602a', mouth: 'grin' } }); c.restore(); return; }
    // side view push-up: body plank rising/falling
    const up = .5 + .5 * Math.sin(t * 5.5), lift = 120 + up * 150;
    c.save(); c.translate(-520, 0);
    const ang = Math.atan2(lift, 1050);
    lineU(c, [0, -30, 1050, -lift - 40], 120 + 24, INK); lineU(c, [0, -30, 1050, -lift - 40], 120, '#86807a');
    lineU(c, [520, -lift / 2 - 40, 1050, -lift - 40], 132, '#c0453a'); lineU(c, [0, -30, 500, -lift / 2 - 36], 110, '#86807a');
    c.beginPath(); c.ellipse(-20, -28, 70, 36, 0, 0, 7); fillU(c, '#3a332f', 12);
    const sx = 900, sy = -lift - 40 + 20; lineU(c, [sx, sy, sx + 40, -20], 70 + 24, INK); lineU(c, [sx, sy, sx + 40, -20], 70, '#fff'); c.beginPath(); c.ellipse(sx + 50, -20, 50, 26, 0, 0, 7); fillU(c, '#fff', 10);
    c.save(); c.translate(1200, -lift - 110); c.rotate(-ang * .5); head(c, 0, 200, { hair: 'curly', hairCol: '#c0602a', mouth: 'flat', brows: 'angry', look: 1 }); c.restore();
    c.restore(); c.restore(); return;
  }
  if (ty === 'bald') {
    const sad = CH.sad;
    body(c, { Ht: 1560, R: 245, sw: 175, suit: '#6f8790', under: '#e8e4dc', crossed: sad < .5, arms: sad >= .5 ? { l: { a: .02, b: 0 }, r: { a: .02, b: 0 } } : { l: { a: .1, b: 0 }, r: { a: .1, b: 0 } }, tilt: sad * .18, bob: sad * 60,
      head: { hair: 'bald', mouth: sad > .5 ? 'frown' : 'flat', brows: sad > .5 ? 'sad' : 'angry', stubble: true, lid: sad * .3 } });
    c.restore(); return;
  }
  if (ty === 'spoon') {
    const hit = Math.pow(Math.abs(Math.sin(t * 4.2)), 6);
    body(c, { Ht: 1480, R: 235, sw: 150, suit: '#86807a', under: '#e0d8c8', arms: { l: { a: .1, b: 0 }, r: { a: 1.2 - hit * .5, b: 1.1 } },
      head: { hair: 'part', hairCol: '#4a3a2a', cap: 'flat', capCol: '#6a5a44', lid: .55, mouth: 'flat', straw: true, strawW: Math.sin(t * 2) * 20 },
      hold: (c, hd) => { const b = hd[1]; c.save(); c.translate(b.wx, b.wy + 20); c.rotate(-1.2 + hit * .5); lineU(c, [0, 0, 0, -230], 20, '#8a5a2e'); c.beginPath(); c.ellipse(0, -270, 30, 48, 0, 0, 7); fillU(c, '#a8703a', 7); c.restore(); } });
    c.restore(); return;
  }
  // generic activities
  const hd = { hair: L.hair, hairCol: L.hairCol, cap: L.cap, stache: L.stache, stubble: L.stubble, glasses: L.glasses, mouth: ch > .3 ? 'grin' : 'flat', brows: ch > .3 ? 'neutral' : 'neutral', up: ch };
  if (ch > .05 || ty === 'stand' || ty === 'lean') {
    body(c, { Ht: L.Ht, R: 230, sw: 150, suit: L.suit, under: L.under, bob: hop, arms: cheerArms || { l: { a: .12, b: -.1 }, r: { a: .12, b: -.1 } }, lean: ty === 'lean' && !ch ? .08 : 0, head: hd, num: detail > 1 ? n : 0 });
    c.restore(); return;
  }
  if (ty === 'sleep') {
    // lying in the lower bunk, blanket, closed eyes, little zzz
    c.save(); c.translate(0, -330);
    c.beginPath(); c.moveTo(-500, 0); c.quadraticCurveTo(-200, -170, 200, -130); c.quadraticCurveTo(420, -110, 520, 0); c.closePath(); fillU(c, '#7b8291', 12);
    c.save(); c.translate(-560, -110); c.rotate(-.25); head(c, 0, 190, { hair: L.hair === 'long' ? 'part' : L.hair, hairCol: L.hairCol, eyes: 'closed', mouth: 'o', stache: L.stache }); c.restore();
    c.restore();
    if (detail > 0) { const ph = (t * .5) % 1; c.save(); c.globalAlpha = Math.sin(ph * Math.PI); c.fillStyle = '#e8f0ff'; c.font = `700 ${80 + ph * 40}px ${FONT}`; c.fillText('z', -500 + ph * 120, -700 - ph * 300); c.restore(); }
    c.restore(); return;
  }
  if (ty === 'cards') {
    body(c, { Ht: L.Ht, R: 230, sw: 150, suit: L.suit, under: L.under, sit: true, seatH: 200, arms: { l: { a: .55, b: 1.2 }, r: { a: .55, b: 1.2 } }, head: Object.assign(hd, { look: -.5 }),
      hold: (c, h) => { const a = h[-1]; for (let i = 0; i < 5; i++) { c.save(); c.translate(a.wx + 40, a.wy - 10); c.rotate(-.5 + i * .22); c.beginPath(); rrect(c, -30, -110, 60, 90, 6); fillU(c, i === 2 ? '#f6f2e8' : '#fbfaf6', 5); c.fillStyle = i % 2 ? '#c0392f' : '#222'; c.font = `700 30px ${FONT}`; c.fillText(['A', 'K', '7', 'D', '9'][i], -20, -80); c.restore(); } } });
    c.restore(); return;
  }
  if (ty === 'letter') {
    body(c, { Ht: L.Ht, R: 230, sw: 150, suit: L.suit, under: L.under, sit: true, seatH: 260, arms: { l: { a: .7, b: 1.0 }, r: { a: .6, b: 1.1 + Math.sin(t * 6) * .08 } }, head: Object.assign(hd, { look: .3, lid: .3 }) });
    c.beginPath(); rrect(c, -330, -560, 660, 60, 8); fillU(c, '#6a4a30', 10); lineU(c, [-280, -500, -280, 0], 24, '#4a3220'); lineU(c, [280, -500, 280, 0], 24, '#4a3220');
    c.save(); c.translate(-40, -590); c.rotate(.08); c.beginPath(); rrect(c, -110, -30, 220, 50, 4); fillU(c, '#f4efe0', 5); c.restore();
    c.fillStyle = '#efe6d2'; c.fillRect(230, -680, 36, 120); c.beginPath(); c.ellipse(248, -710, 14, 26 + Math.sin(t * 11) * 4, 0, 0, 7); c.fillStyle = '#ffd27a'; c.fill();
    c.restore(); return;
  }
  if (ty === 'harmonica') {
    body(c, { Ht: L.Ht, R: 230, sw: 150, suit: L.suit, under: L.under, sit: true, seatH: 240, armsFront: true, arms: { l: { a: .9, b: 2.2 }, r: { a: .9, b: 2.2 } }, head: Object.assign(hd, { eyes: 'closed', mouth: 'flat' }),
      hold: (c, h) => { const y = -(L.Ht - 230) + 230 * .55 + 300 - 240 + 0; c.save(); c.translate(0, -(L.Ht) + 230 * 1.6 + 300 - 240); c.beginPath(); rrect(c, -90, -24, 180, 48, 8); fillU(c, '#c8ccd4', 7); for (let i = 0; i < 8; i++) c.fillRect(-76 + i * 20, -6, 10, 12); c.restore(); } });
    if (detail > 0) { const ph = (t * .7) % 1; c.save(); c.globalAlpha = Math.sin(ph * Math.PI) * .9; c.fillStyle = '#ffe9b0'; c.font = `700 90px ${FONT}`; c.fillText('♪', 200 + ph * 140, -1300 - ph * 260); c.restore(); }
    c.restore(); return;
  }
  if (ty === 'read') {
    body(c, { Ht: L.Ht, R: 230, sw: 150, suit: L.suit, under: L.under, sit: true, seatH: 240, arms: { l: { a: .4, b: 1.3 }, r: { a: .4, b: 1.3 } }, head: Object.assign(hd, { look: 0, lid: .4 }),
      hold: (c, h) => { const a = h[-1], b = h[1]; c.save(); c.translate((a.wx + b.wx) / 2, (a.wy + b.wy) / 2); c.beginPath(); rrect(c, -110, -80, 220, 140, 8); fillU(c, '#3a5a8a', 8); c.restore(); } });
    c.restore(); return;
  }
  // sit
  body(c, { Ht: L.Ht, R: 230, sw: 150, suit: L.suit, under: L.under, sit: true, seatH: 260, arms: { l: { a: .3, b: .6 }, r: { a: .3, b: .6 } }, head: hd });
  c.restore();
}

// =========================== cell props + per-cell light ===========================
CELL_LIGHT = (q, t) => {
  const ty = typeOf(q.n);
  if (ty === 'letter') return [.35, .22, .08];
  if (q.n === 64) return [.12 + NOAH_CANDLE * .35, .08 + NOAH_CANDLE * .24, .04 + NOAH_CANDLE * .08];
  if (rnd(q.n * 41) > .7) return [.22, .15, .06];
  return [0, 0, 0];
};
let NOAH_CANDLE = 1, CHALK = { n: 0, drop: 0 };
function box(c, x0, x1, y0, y1, z0, z1, col, sh) {
  // axis box; draws the faces that face the camera
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, cz = (z0 + z1) / 2;
  if (CAM.y > y1) fillPoly(c, [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], sh(col, cx, y1, cz, [0, 1, 0]));
  if (CAM.y < y0) fillPoly(c, [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]], sh(col, cx, y0, cz, [0, -1, 0]));
  const xs = CAM.x < Math.min(x0, x1) ? Math.min(x0, x1) : CAM.x > Math.max(x0, x1) ? Math.max(x0, x1) : null;
  if (xs !== null) fillPoly(c, [[xs, y0, z0], [xs, y1, z0], [xs, y1, z1], [xs, y0, z1]], sh(col, xs, cy, cz, [Math.sign(xs - cx), 0, 0]));
  const zs = CAM.z < Math.min(z0, z1) ? Math.min(z0, z1) : CAM.z > Math.max(z0, z1) ? Math.max(z0, z1) : null;
  if (zs !== null) fillPoly(c, [[x0, y0, zs], [x1, y0, zs], [x1, y1, zs], [x0, y1, zs]], sh(col, cx, cy, zs, [0, 0, Math.sign(zs - cz)]));
}
CELL_PROPS = (c, q, t, detail, sh) => {
  const s = q.side, X = d => s * (G.HW + d), za = q.z0 + G.PIL / 2, zb = q.z0 + G.CW - G.PIL / 2, y = q.yf, ty = typeOf(q.n);
  // small barred window high on the back wall with moonlight
  const wx = X(G.CD - 2), wz = q.zc + 40, wy = y + 470;
  const win = fillPoly(c, [[wx, wy, wz - 60], [wx, wy, wz + 60], [wx, wy + 100, wz + 60], [wx, wy + 100, wz - 60]], LT.dawn > .4 ? '#ffd89a' : '#7f9cc8');
  if (win && detail > 0) { for (let i = -1; i <= 1; i++) line3(c, [wx - s, wy, wz + i * 30], [wx - s, wy + 100, wz + i * 30], 8, '#222833'); glow3(c, wx, wy + 50, wz, 160, LT.dawn > .4 ? '255,210,140' : '160,190,255', .35); }
  // bunk bed against the far side wall (+z side)
  const bz0 = zb - 150, bz1 = zb - 4, bx0 = X(130), bx1 = X(G.CD - 6);
  if (detail > 0) {
    box(c, bx0, bx1, y + 150, y + 200, bz0, bz1, [110, 110, 120], sh);
    fillPoly(c, [[bx0, y + 201, bz0], [bx1, y + 201, bz0], [bx1, y + 201, bz1], [bx0, y + 201, bz1]], sh([120, 126, 140], (bx0 + bx1) / 2, y + 201, (bz0 + bz1) / 2, [0, 1, 0]));
    box(c, bx0, bx1, y + 400, y + 440, bz0, bz1, [104, 110, 124], sh);
    line3(c, [bx0, y, bz0], [bx0, y + 470, bz0], 10, '#2a2d34');
    // sink on the near side wall (-z side)
    box(c, X(G.CD - 120), X(G.CD - 4), y + 220, y + 270, za + 4, za + 120, [190, 196, 204], sh);
    // stool
    if (ty !== 'cards') box(c, X(250), X(330), y + 0, y + 150, za + 90, za + 170, [120, 84, 52], sh);
  }
  if (ty === 'books' && detail > 0) {
    for (let k = 0; k < 6; k++) { const z0 = za + 10 + k * 18, x0 = X(G.CD - 70 - k * 40); for (let b = 0; b < 12; b++) { const yy = y + b * 42; fillPoly(c, [[x0, yy, z0], [x0, yy, z0 + 60], [x0, yy + 40, z0 + 60], [x0, yy + 40, z0]], sh([[180, 60, 50], [60, 90, 150], [200, 170, 80], [70, 130, 90], [150, 90, 140]][(b + k) % 5], x0, yy, z0, [-s, 0, 0])); } }
  }
  if (q.n === 64 && detail > 0) {
    // chalk tallies and numbers on the back wall
    onPlane(c, [X(G.CD - 3), y + 520, s > 0 ? zb - 20 : za + 20], [0, 0, -s], [0, -1, 0], (c) => {
      c.strokeStyle = 'rgba(240,240,232,.8)'; c.lineWidth = 3; c.lineCap = 'round';
      for (let g = 0; g < 3; g++) for (let i = 0; i < 5; i++) { c.beginPath(); if (i < 4) { c.moveTo(10 + g * 60 + i * 10, 10); c.lineTo(12 + g * 60 + i * 10, 48); } else { c.moveTo(4 + g * 60, 40); c.lineTo(50 + g * 60, 16); } c.stroke(); }
      c.fillStyle = 'rgba(240,240,232,.78)'; c.font = `700 30px ${FONT}`; 
      // the pairs Noah writes (CHALK.n lines)
      const lines = ['1 × 64', '2 × 32', '4 × 16', '8 × 8'];
      for (let i = 0; i < CHALK.n; i++) { c.font = `700 ${i === 3 ? 44 : 36}px ${FONT}`; c.fillStyle = i === 3 ? 'rgba(255,236,170,.95)' : 'rgba(245,245,238,.88)'; c.fillText(lines[i], 10, 120 + i * 52); }
      if (CHALK.cur != null) { const ln = lines[CHALK.cur], k = CHALK.k; c.font = `700 ${CHALK.cur === 3 ? 44 : 36}px ${FONT}`; c.fillStyle = 'rgba(245,245,238,.88)'; c.fillText(ln.slice(0, Math.ceil(ln.length * k)), 10, 120 + CHALK.cur * 52); }
    });
    // small table with the candle near the sink side
    box(c, X(G.CD - 200), X(G.CD - 70), y + 260, y + 290, za + 130, za + 230, [120, 84, 52], sh);
    line3(c, [X(G.CD - 135), y, za + 180], [X(G.CD - 135), y + 260, za + 180], 14, '#4a3220');
    const cp = billboard(c, X(G.CD - 135), y + 290, za + 180, (c) => { c.fillStyle = '#efe6d2'; c.fillRect(-9, -60, 18, 60); c.fillStyle = `rgba(255,214,120,${NOAH_CANDLE})`; c.beginPath(); c.ellipse(0, -74, 7, 15 + Math.sin(t * 13) * 3, 0, 0, 7); c.fill(); });
    glow3(c, X(G.CD - 135), y + 365, za + 180, 220, '255,180,90', .6 * NOAH_CANDLE);
  }
};
