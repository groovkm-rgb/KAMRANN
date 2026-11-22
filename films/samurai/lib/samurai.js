// Samurai outfits for NOAH — separate layers on top of the unchanged rig (noah.js).
// Head size/position, eyes, face, shoulders, arm lengths, hem and feet use NOAH.* numbers; nothing is rescaled.
//   drawSam(c, { x, y, k, ink, outfit: 'samurai' | 'armor' | 'ronin' | 'edo', hair: 'chonmage' | 'bun',
//                arms: { l, r }, grip: { l: true, r: true } (fists), expr, tilt, bob, swords: true, haori: true, breathe })
//   drawSamHead(c, x, y, k, expr, tilt, hair)
//   drawKatana(c, o) / drawWakizashi(c, o): local x axis from the pommel (0) towards the tip, see SWORD
const SAM = {
  indigo: '#26324f', indigoD: '#1a2238', indigoL: '#3a4a70',
  haori: '#3b3b3f', haoriD: '#2a2a2e', haoriL: '#55555b',
  hakama: '#3e3d44', hakamaD: '#2c2b31', hakamaStripe: '#76757e',
  obi: '#4a3122', obiL: '#6b4a33', collar: '#efebe2', mon: '#f3efe6',
  tabi: '#f4f1ea', zori: '#c8ad7a', zoriD: '#8f7650', thong: '#2b2320',
  lacquer: '#16130f', lacquerL: '#3a352f', lace: '#7a1f24', laceL: '#a53a3a', iron: '#2f2e30', ironL: '#57565a', gold: '#c9a24a', goldL: '#ecd28a',
  silk: '#141821', silkL: '#3b4256', ray: '#e9e4d6', navyCord: '#1f2a4a', steel: '#cfd5da', steelD: '#8d969e', hamon: '#f6f8f8',
  ronin: '#6e5640', roninD: '#54412f', roninL: '#8a7158', patch: '#806247', patch2: '#5e4a36',
  edo: '#77767a', edoD: '#5d5c61', edoL: '#9a999d', sleeveCover: '#3d3c42',
  shaved: '#e7eaee',
};
const SW = () => NOAH.W;

// ---------------------------------------------------------------- kamon (invented: three bamboo leaves in a ring)
function drawKamon(c, x, y, r, col = SAM.mon, ink = null) {
  c.save(); c.translate(x, y);
  c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.lineWidth = r * .14; c.strokeStyle = col; c.stroke();
  for (let i = 0; i < 3; i++) {
    c.save(); c.rotate(i * Math.PI * 2 / 3 - Math.PI / 2);
    c.beginPath(); c.moveTo(0, -r * .08); c.quadraticCurveTo(r * .26, -r * .38, 0, -r * .78); c.quadraticCurveTo(-r * .26, -r * .38, 0, -r * .08); c.fillStyle = col; c.fill();
    if (ink) { c.beginPath(); c.moveTo(0, -r * .14); c.lineTo(0, -r * .7); c.lineWidth = r * .04; c.strokeStyle = ink; c.stroke(); }
    c.restore();
  }
  circ(c, 0, 0, r * .1); c.fillStyle = col; c.fill();
  c.restore();
}
// invented banner crest for the enemy (green/gold): a gold ring with a diamond
function drawEnemyMon(c, x, y, r, col = '#d8b552') {
  c.save(); c.translate(x, y); c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.lineWidth = r * .16; c.strokeStyle = col; c.stroke();
  poly(c, [0, -r * .62, r * .5, 0, 0, r * .62, -r * .5, 0]); c.fillStyle = col; c.fill(); c.restore();
}

// ---------------------------------------------------------------- swords
// lengths in rig units (1 m ≈ 873 u, Noah 1,75 m = 1527 u). Real katana ≈ 1 m overall with hilt.
const SWORD = { katana: { tsuka: 230, blade: 610, saya: 640, tsuba: 46, w: 26 }, waki: { tsuka: 150, blade: 400, saya: 425, tsuba: 38, w: 23 } };
// o: { kind, drawn: 0..1 (blade out of the scabbard), sheath: true (draw scabbard), detail: 1, gleam: 0..1, edgeUp: true }
function drawSword(c, o = {}) {
  const S = SWORD[o.kind || 'katana'], lw = o.lw ?? SW() * .7, w = S.w, curve = S.blade * .045;
  const drawn = o.drawn || 0, sheath = o.sheath !== false;
  // x: 0 pommel → S.tsuka → tsuba → blade. Edge up = curve bulges towards -y.
  const bend = x => { const u = (x - S.tsuka) / (S.saya + 20); return u > 0 ? -curve * u * u * 4 * (o.edgeUp === false ? -1 : 1) : 0; };
  c.save(); if (o.sayaOnly) c.translate(-(S.tsuka + 12), 0);
  // scabbard (saya), slides back when drawing: it stays, the blade moves out -> we offset the saya by -drawn
  if (sheath) {
    const sx0 = S.tsuka + 12 + drawn * S.blade, sx1 = sx0 + S.saya;
    c.save(); c.translate(o.sayaDx || 0, 0);
    c.beginPath(); c.moveTo(sx0, -w * .62 + bend(sx0));
    for (let x = sx0; x <= sx1; x += 20) c.lineTo(x, -w * .62 + bend(x) + (x - sx0) / S.saya * w * .08);
    c.quadraticCurveTo(sx1 + 26, bend(sx1), sx1, w * .62 + bend(sx1));
    for (let x = sx1; x >= sx0; x -= 20) c.lineTo(x, w * .62 + bend(x) - (x - sx0) / S.saya * w * .08);
    c.closePath(); fo(c, SAM.lacquer, lw);
    // lacquer highlight
    c.beginPath(); for (let x = sx0 + 20; x <= sx1 - 30; x += 20) c.lineTo(x, -w * .3 + bend(x)); c.lineWidth = w * .18; c.strokeStyle = 'rgba(190,200,215,.55)'; c.stroke();
    // koiguchi ring + kojiri cap (horn)
    c.beginPath(); c.rect(sx0, -w * .66 + bend(sx0), 14, w * 1.32); fo(c, '#2c2622', lw * .6);
    c.beginPath(); c.moveTo(sx1 - 24, -w * .58 + bend(sx1)); c.lineTo(sx1, -w * .56 + bend(sx1)); c.quadraticCurveTo(sx1 + 26, bend(sx1), sx1, w * .58 + bend(sx1)); c.lineTo(sx1 - 24, w * .58 + bend(sx1)); c.closePath(); fo(c, '#2a2420', lw * .6);
    // kurikata knob and sageo cord (dark navy silk), tied loop
    if ((o.detail ?? 1) > 0) {
      const kx = sx0 + S.saya * .16; c.beginPath(); c.rect(kx - 10, w * .5 + bend(kx), 20, 12); fo(c, SAM.lacquer, lw * .5);
      c.beginPath(); c.moveTo(kx, w * .7 + bend(kx)); c.bezierCurveTo(kx + 40, w * 3, kx + 140, w * 2.6, kx + 90, w * 1.1 + bend(kx));
      c.moveTo(kx - 4, w * .7 + bend(kx)); c.bezierCurveTo(kx - 30, w * 3.4, kx + 70, w * 4.4, kx + 60, w * 5.6);
      c.lineWidth = w * .24; c.strokeStyle = SAM.navyCord; c.lineCap = 'round'; c.stroke();
      c.lineWidth = w * .07; c.strokeStyle = '#3b4c7a'; c.stroke();
      // wraps around the saya
      for (const dx of [6, 18]) { c.beginPath(); c.rect(kx + dx, -w * .64 + bend(kx + dx), 7, w * 1.28); c.fillStyle = SAM.navyCord; c.fill(); }
    }
    c.restore();
  }
  if (o.sayaOnly) { c.restore(); return; }
  // naked blade part (from the tsuba to the drawn length)
  if (drawn > 0 || o.naked) {
    const bl = o.naked ? S.blade : drawn * S.blade, x0 = S.tsuka + 12, x1 = x0 + bl;
    c.beginPath(); c.moveTo(x0, -w * .42);
    for (let x = x0; x <= x1; x += 15) c.lineTo(x, -w * .42 + bend(x) + (x - x0) / S.blade * w * .1);
    if (o.naked || drawn >= .999) { c.quadraticCurveTo(x1 + 10, bend(x1) - w * .3, x1 + 34, bend(x1) + w * .05); c.quadraticCurveTo(x1 + 6, bend(x1) + w * .3, x1 - 10, w * .3 + bend(x1)); }
    else c.lineTo(x1, w * .4 + bend(x1));
    for (let x = Math.min(x1, x1 - 10); x >= x0; x -= 15) c.lineTo(x, w * .38 + bend(x) - (x - x0) / S.blade * w * .06);
    c.closePath();
    const g = c.createLinearGradient(0, -w * .45, 0, w * .4); g.addColorStop(0, SAM.hamon); g.addColorStop(.3, '#e3e8ec'); g.addColorStop(.42, SAM.steel); g.addColorStop(1, SAM.steelD);
    c.fillStyle = g; c.fill(); c.lineWidth = lw * .8; c.strokeStyle = OUT; c.stroke();
    // hamon (wavy temper line), near the edge (edge = -y side)
    c.beginPath(); for (let x = x0 + 14; x <= x1 - 20; x += 6) { const yy = -w * .1 + Math.sin(x * .09) * w * .09 + Math.sin(x * .031) * w * .05 + bend(x); x === x0 + 14 ? c.moveTo(x, yy) : c.lineTo(x, yy); }
    c.lineWidth = w * .06; c.strokeStyle = 'rgba(255,255,255,.95)'; c.stroke();
    c.lineWidth = w * .16; c.strokeStyle = 'rgba(255,255,255,.25)'; c.stroke();
    // shinogi ridge
    c.beginPath(); for (let x = x0; x <= x1 - 20; x += 15) c.lineTo(x, w * .12 + bend(x)); c.lineWidth = 2; c.strokeStyle = 'rgba(80,90,100,.6)'; c.stroke();
    // gleam travelling along the blade
    if (o.gleam !== undefined) { const gx = x0 + o.gleam * bl; c.save(); c.globalCompositeOperation = 'screen'; const gg = c.createRadialGradient(gx, bend(gx) - w * .1, 0, gx, bend(gx), w * 3); gg.addColorStop(0, 'rgba(255,255,255,.95)'); gg.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gg; c.fillRect(gx - w * 3, -w * 3, w * 6, w * 6); c.restore(); }
  }
  // habaki (gold collar)
  c.beginPath(); c.rect(S.tsuka + 8, -w * .52, 26, w * 1.04); fo(c, SAM.gold, lw * .6); c.fillStyle = SAM.goldL; c.fillRect(S.tsuka + 12, -w * .45, 6, w * .9);
  // tsuba (round iron guard with carved bamboo), seen edge-on in profile: a thick vertical plate
  const tr = S.tsuba * (o.tsubaFace ? 1 : 1);
  c.beginPath(); c.rect(S.tsuka - 6, -tr, 16, tr * 2); fo(c, SAM.iron, lw * .7);
  c.fillStyle = SAM.ironL; c.fillRect(S.tsuka - 3, -tr + 4, 3, tr * 2 - 8);
  // seppa washers
  c.fillStyle = SAM.gold; c.fillRect(S.tsuka - 10, -w * .55, 4, w * 1.1); c.fillRect(S.tsuka + 10, -w * .55, 4, w * 1.1);
  // tsuka: white ray skin with black silk diamond wrap
  c.beginPath(); c.moveTo(0, -w * .55); c.lineTo(S.tsuka - 10, -w * .62); c.lineTo(S.tsuka - 10, w * .62); c.lineTo(0, w * .55); c.closePath(); fo(c, SAM.ray, lw * .7);
  c.save(); c.clip();
  const n = Math.round(S.tsuka / 34);
  for (let i = 0; i < n; i++) {
    const x = 12 + i * (S.tsuka - 30) / n, s = (S.tsuka - 30) / n;
    c.beginPath(); c.moveTo(x, -w * .7); c.lineTo(x + s * .5, -w * .08); c.lineTo(x + s, -w * .7); c.closePath(); c.fillStyle = SAM.silk; c.fill();
    c.beginPath(); c.moveTo(x, w * .7); c.lineTo(x + s * .5, w * .08); c.lineTo(x + s, w * .7); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(x + s * .5, -w * .08); c.lineTo(x + s, -w * .7); c.moveTo(x + s * .5, w * .08); c.lineTo(x + s, w * .7); c.lineWidth = 2; c.strokeStyle = SAM.silkL; c.stroke();
  }
  // menuki (small gold ornament under the wrap)
  if ((o.detail ?? 1) > 0) { ell(c, S.tsuka * .52, 0, 16, 7); c.fillStyle = SAM.gold; c.fill(); }
  c.restore();
  // fuchi collar + kashira pommel cap
  c.beginPath(); c.rect(S.tsuka - 22, -w * .64, 14, w * 1.28); fo(c, SAM.iron, lw * .6);
  c.beginPath(); c.moveTo(4, -w * .6); c.quadraticCurveTo(-16, -w * .5, -16, 0); c.quadraticCurveTo(-16, w * .5, 4, w * .6); c.closePath(); fo(c, SAM.iron, lw * .6);
  c.restore();
}
// tsuba face-on (round iron guard with an open-work bamboo motif), for macros
function drawTsubaFace(c, x, y, r, o = {}) {
  c.save(); c.translate(x, y);
  circ(c, 0, 0, r); const g = c.createRadialGradient(-r * .3, -r * .3, r * .1, 0, 0, r); g.addColorStop(0, '#5c5a5e'); g.addColorStop(1, '#232224'); c.fillStyle = g; c.fill();
  c.lineWidth = r * .06; c.strokeStyle = '#141314'; c.stroke();
  circ(c, 0, 0, r * .9); c.lineWidth = r * .03; c.strokeStyle = 'rgba(255,255,255,.12)'; c.stroke();
  // nakago-ana (blade slot)
  c.beginPath(); c.moveTo(-r * .1, -r * .32); c.quadraticCurveTo(0, -r * .4, r * .1, -r * .32); c.lineTo(r * .07, r * .32); c.lineTo(-r * .07, r * .32); c.closePath(); c.fillStyle = '#0c0b0c'; c.fill();
  // bamboo open-work: two culms and leaves
  const culm = (x0, y0, x1, y1) => { stroke(c, [x0, y0, x1, y1], r * .09, '#0d0c0d'); for (let i = 1; i < 4; i++) { const k = i / 4; stroke(c, [lerp(x0, x1, k) - r * .07, lerp(y0, y1, k), lerp(x0, x1, k) + r * .07, lerp(y0, y1, k) - r * .02], r * .025, '#6b696d'); } };
  culm(-r * .62, r * .55, -r * .38, -r * .66); culm(r * .45, r * .62, r * .6, -r * .5);
  for (const [lx, ly, a] of [[-r * .5, -r * .2, -.6], [-r * .45, r * .1, -2.4], [r * .55, -r * .1, -.4], [r * .5, r * .25, 2.6], [-r * .25, -r * .55, .3]]) {
    c.save(); c.translate(lx, ly); c.rotate(a); c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(r * .14, -r * .07, r * .34, 0); c.quadraticCurveTo(r * .14, r * .07, 0, 0); c.fillStyle = '#0d0c0d'; c.fill(); c.restore();
  }
  // rim highlight (moonlight)
  if (o.light) { c.beginPath(); c.arc(0, 0, r * .97, -2.6, -1.0); c.lineWidth = r * .05; c.strokeStyle = `rgba(200,220,255,${o.light})`; c.stroke(); }
  c.restore();
}

// ---------------------------------------------------------------- hands
// closed fist gripping something that runs along the local x axis (hand centre at 0,0); ang rotates
function samFist(c, x, y, ang = 0, s = 1, back = false) {
  c.save(); c.translate(x, y); c.rotate(ang); c.scale(s, s);
  const lw = SW() * .8;
  c.beginPath(); c.roundRect(-46, -40, 92, 84, 30); fo(c, NOAH.skin, lw);
  if (!back) for (let i = 0; i < 3; i++) stroke(c, [-46 + 23 * (i + 1), -30, -46 + 23 * (i + 1), 26], 5, NOAH.out);
  // thumb over the fingers
  c.beginPath(); c.moveTo(-40, -30); c.quadraticCurveTo(-10, -58, 30, -40); c.quadraticCurveTo(40, -26, 22, -18); c.quadraticCurveTo(-6, -24, -30, -6); c.closePath(); fo(c, NOAH.skin, lw * .8);
  c.restore();
}

// ---------------------------------------------------------------- head: hair styles
function samHeadBase(c) {
  const H = NOAH.HEAD, cy = H.y, R = H.r;
  c.save(); c.beginPath(); c.arc(0, cy, R, 0, Math.PI * 2); c.fillStyle = NOAH.shade; c.fill(); c.clip();
  c.beginPath(); c.arc(-4, cy - 34, R - 4, 0, Math.PI * 2); c.fillStyle = NOAH.skin; c.fill(); c.restore();
}
function samHeadOutline(c) { const H = NOAH.HEAD; c.beginPath(); c.arc(0, H.y, H.r, 0, Math.PI * 2); c.lineWidth = NOAH.W; c.strokeStyle = NOAH.out; c.stroke(); }
// chonmage: shaved crown (sakayaki), glossy oiled sides, small folded topknot on the crown
function chonmageFront(c, o = {}) {
  const H = NOAH.HEAD, cy = H.y, R = H.r, loose = o.loose || 0;
  // shaved area: faint cool tint on the top of the skull (stubble dots when grown out)
  c.save(); c.beginPath(); c.arc(0, cy, R - 2, 0, Math.PI * 2); c.clip();
  const g = c.createRadialGradient(0, cy - R * .95, 10, 0, cy - R * .75, R * .6); g.addColorStop(0, loose ? 'rgba(120,110,104,.55)' : 'rgba(170,185,200,.5)'); g.addColorStop(1, 'rgba(170,185,200,0)');
  c.fillStyle = g; c.beginPath(); c.ellipse(0, cy - R * .78, R * .56, R * .36, 0, 0, Math.PI * 2); c.fill();
  if (loose) for (let i = 0; i < 70; i++) { const a = rnd(i + 40) * Math.PI - Math.PI, rr = rnd(i + 41) * R * .55; const px = Math.cos(a) * rr * 1.1, py = cy - R * .55 + Math.sin(a) * rr * .8; circ(c, px, py, 2.4); c.fillStyle = 'rgba(70,60,55,.5)'; c.fill(); }
  c.restore();
  // side hair (bin): oiled, glossy, from temple down to the jaw line, both sides
  for (const s of [-1, 1]) {
    c.beginPath(); c.moveTo(s * (R + 4), cy - 6);
    c.bezierCurveTo(s * (R + 14), cy - 120, s * (R - 20), cy - 196, s * 168, cy - 200);
    c.bezierCurveTo(s * 196, cy - 150, s * 212, cy - 90, s * (R - 22), cy - 8);
    c.quadraticCurveTo(s * (R - 6), cy + 30, s * (R + 4), cy - 6); c.closePath();
    fo(c, NOAH.hair, NOAH.W * .8);
    c.save(); c.clip();
    for (let j = 0; j < 4; j++) { c.beginPath(); c.moveTo(s * (R - 8 - j * 9), cy - 10 - j * 6); c.quadraticCurveTo(s * (R - 14 - j * 10), cy - 120, s * (172 + j * 6), cy - 196); c.lineWidth = j === 1 ? 7 : 3.5; c.strokeStyle = j === 1 ? 'rgba(200,190,180,.55)' : NOAH.hairDark; c.lineCap = 'round'; c.stroke(); }
    c.restore();
    if (loose) for (let j = 0; j < 3; j++) { c.beginPath(); c.moveTo(s * (R - 20), cy - 120 + j * 30); c.quadraticCurveTo(s * (R + 34 + j * 6), cy - 40 + j * 40, s * (R + 12), cy + 40 + j * 36); c.lineWidth = 5; c.strokeStyle = NOAH.hair; c.stroke(); }
  }
  // the topknot (mage): folded forward over the crown; from the front a short glossy stub with a white paper tie
  c.save(); c.translate(0, cy - R + 18); c.rotate(loose ? .22 : 0);
  c.beginPath(); c.moveTo(-30, 36); c.lineTo(-34, -30); c.quadraticCurveTo(-32, -68, 0, -70); c.quadraticCurveTo(32, -68, 34, -30); c.lineTo(30, 36); c.closePath(); fo(c, NOAH.hair, NOAH.W * .8);
  stroke(c, [-12, 28, -14, -54], 4, 'rgba(210,200,190,.6)'); stroke(c, [12, 28, 12, -54], 3, NOAH.hairDark);
  c.beginPath(); c.rect(-33, 14, 66, 18); fo(c, '#f2eee4', NOAH.W * .5);
  if (loose) { c.beginPath(); c.moveTo(20, -50); c.quadraticCurveTo(70, -40, 64, 30); c.lineWidth = 5; c.strokeStyle = NOAH.hair; c.stroke(); }
  c.restore();
}
// option B: Noah's own swept-back hair, tied into a bun at the back (bun peeks over the crown)
function bunBack(c) {
  const cy = NOAH.HEAD.y, R = NOAH.HEAD.r;
  c.beginPath(); c.ellipse(0, cy - R - 18, 74, 58, 0, 0, Math.PI * 2); fo(c, NOAH.hair, NOAH.W * .8);
  for (const i of [-1, 0, 1]) { c.beginPath(); c.moveTo(i * 40, cy - R + 20); c.quadraticCurveTo(i * 60, cy - R - 40, i * 18, cy - R - 70); c.lineWidth = 4; c.strokeStyle = i ? NOAH.hairDark : NOAH.hairLight; c.stroke(); }
  c.beginPath(); c.rect(-70, cy - R + 10, 140, 16); fo(c, '#2a2422', NOAH.W * .5);
}
function samHeadLocal(c, e = {}, hair = 'chonmage') {
  if (hair === 'bun') { bunBack(c); noahHeadLocal(c, e); return; }
  if (hair === 'noah') { noahHairBack(c); noahHeadLocal(c, e); return; }
  samHeadBase(c);
  if (hair === 'helmet') { samHeadOutline(c); noahFace(c, e); return; }
  samHeadOutline(c);
  chonmageFront(c, { loose: hair === 'loose' });
  noahFace(c, e);
}
function drawSamHead(c, x, y, k = .5, e = {}, tilt = 0, hair = 'chonmage') {
  c.save(); c.translate(x, y); c.rotate(tilt); c.scale(k, k); c.translate(0, -NOAH.HEAD.y); samHeadLocal(c, e, hair); c.restore();
}

// ---------------------------------------------------------------- kabuto (helmet), drawn over the head
function kabuto(c, o = {}) {
  const cy = NOAH.HEAD.y, R = NOAH.HEAD.r, lw = NOAH.W * .85, sway = o.sway || 0;
  // shikoro: fanned neck-guard lames, behind the face at the sides
  for (let i = 4; i >= 0; i--) {
    const yy = cy - 120 + i * 44, wd = R + 40 + i * 30;
    c.beginPath(); c.moveTo(-wd, yy + 34 + sway * i); c.quadraticCurveTo(-wd - 10, yy - 30, -R * .7, yy - 40); c.lineTo(R * .7, yy - 40); c.quadraticCurveTo(wd + 10, yy - 30, wd, yy + 34 - sway * i);
    c.lineTo(wd - 20, yy + 50 - sway * i); c.quadraticCurveTo(0, yy + 10, -wd + 20, yy + 50 + sway * i); c.closePath(); fo(c, SAM.lacquer, lw);
    // red lacing on each lame
    c.save(); c.clip(); for (let x = -wd; x <= wd; x += 22) stroke(c, [x, yy - 20, x, yy + 50], 7, SAM.lace); c.restore();
    c.beginPath(); c.moveTo(-wd + 20, yy + 50 + sway * i); c.quadraticCurveTo(0, yy + 10, wd - 20, yy + 50 - sway * i); c.lineWidth = 4; c.strokeStyle = SAM.goldL; c.stroke();
  }
}
function kabutoTop(c, o = {}) {
  const cy = NOAH.HEAD.y, R = NOAH.HEAD.r, lw = NOAH.W * .85;
  // bowl (suji-bachi) with ridges
  c.beginPath(); c.moveTo(-R - 18, cy - 118); c.bezierCurveTo(-R - 26, cy - 330, R + 26, cy - 330, R + 18, cy - 118); c.closePath();
  const g = c.createLinearGradient(-R, 0, R, 0); g.addColorStop(0, '#1f1e20'); g.addColorStop(.35, '#4a494d'); g.addColorStop(1, '#19181a'); fo(c, g, lw);
  c.save(); c.clip(); for (let i = -7; i <= 7; i++) { c.beginPath(); c.moveTo(i * 38, cy - 118); c.quadraticCurveTo(i * 30, cy - 260, i * 6, cy - 330); c.lineWidth = 4; c.strokeStyle = i % 2 ? '#111' : '#6a696e'; c.stroke(); } c.restore();
  // tehen (top ring)
  ell(c, 0, cy - 300, 22, 8); fo(c, SAM.gold, lw * .5);
  // mabizashi visor (black lacquer brim) over the forehead
  c.beginPath(); c.moveTo(-R - 26, cy - 112); c.quadraticCurveTo(0, cy - 150, R + 26, cy - 112); c.lineTo(R + 10, cy - 92); c.quadraticCurveTo(0, cy - 122, -R - 10, cy - 92); c.closePath(); fo(c, SAM.lacquer, lw);
  c.beginPath(); c.moveTo(-R - 10, cy - 96); c.quadraticCurveTo(0, cy - 128, R + 10, cy - 96); c.lineWidth = 4; c.strokeStyle = SAM.gold; c.stroke();
  // fukigaeshi: turned-back wings at the temples
  for (const s of [-1, 1]) {
    c.beginPath(); c.moveTo(s * (R + 6), cy - 120); c.quadraticCurveTo(s * (R + 110), cy - 170, s * (R + 96), cy - 70); c.quadraticCurveTo(s * (R + 60), cy - 60, s * (R + 14), cy - 70); c.closePath(); fo(c, SAM.lacquer, lw);
    c.beginPath(); c.moveTo(s * (R + 22), cy - 112); c.quadraticCurveTo(s * (R + 90), cy - 150, s * (R + 82), cy - 82); c.lineWidth = 6; c.strokeStyle = SAM.lace; c.stroke();
    drawKamon(c, s * (R + 58), cy - 108, 18, SAM.goldL);
  }
  // maedate: invented gold crescent with a small disc (no real house crest); enemy: gilt antlers
  if (o.enemy) { for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 30, cy - 250); c.quadraticCurveTo(s * 150, cy - 400, s * 110, cy - 560); c.lineTo(s * 130, cy - 566); c.quadraticCurveTo(s * 190, cy - 400, s * 50, cy - 240); c.closePath(); fo(c, SAM.goldL, lw * .7); c.beginPath(); c.moveTo(s * 130, cy - 420); c.lineTo(s * 230, cy - 470); c.lineTo(s * 140, cy - 400); c.closePath(); fo(c, SAM.goldL, lw * .6); } return; }
  c.save(); c.translate(0, cy - 160);
  c.beginPath(); c.moveTo(-200, -170); c.quadraticCurveTo(-120, 30, 0, 26); c.quadraticCurveTo(120, 30, 200, -170); c.quadraticCurveTo(110, -20, 0, -20); c.quadraticCurveTo(-110, -20, -200, -170); c.closePath();
  const gg = c.createLinearGradient(0, -170, 0, 30); gg.addColorStop(0, SAM.goldL); gg.addColorStop(1, '#9c7a2c'); fo(c, gg, lw * .8);
  circ(c, 0, 0, 24); fo(c, SAM.goldL, lw * .6); circ(c, 0, 0, 10); c.fillStyle = SAM.lace; c.fill();
  c.restore();
  // chin cord (shinobi-no-o), thin, under the jaw so the face stays free
  for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * R * .62, cy + R * .8); c.quadraticCurveTo(s * R * .3, cy + R + 10, s * 20, cy + R + 8); c.lineWidth = 9; c.strokeStyle = SAM.lace; c.stroke(); }
  c.beginPath(); c.ellipse(0, cy + R + 8, 22, 12, 0, 0, Math.PI * 2); fo(c, SAM.lace, 3);
}

// ---------------------------------------------------------------- arms with kimono sleeves
function samArmPts(side, spec) {
  const S = NOAH.SHOULDER, sx = side * S.x, sy = S.y, a = spec.a, b = spec.b ?? 0, a2 = a + b;
  const ex = sx + side * Math.sin(a) * NOAH.UPPER, ey = sy + Math.cos(a) * NOAH.UPPER;
  const wx = ex + side * Math.sin(a2) * NOAH.FORE, wy = ey + Math.cos(a2) * NOAH.FORE;
  return { sx, sy, ex, ey, wx, wy, a, a2 };
}
// o: { col, dark, light, wide (hanging sleeve), cover (forearm sleeve cover colour), armor }
function samArm(c, side, spec, o) {
  const P = samArmPts(side, spec), lw = NOAH.W;
  const cx = P.ex + (P.wx - P.ex) * .78, cyy = P.ey + (P.wy - P.ey) * .78;
  // hanging sleeve bag (tamoto): from the upper arm/forearm straight down
  if (o.wide) {
    const drop = o.wide;
    c.beginPath(); c.moveTo(P.sx - side * 20, P.sy + 30);
    c.lineTo(P.ex, P.ey); c.lineTo(cx, cyy);
    c.lineTo(cx + side * 10, Math.max(cyy, P.ey) + drop * .35);
    c.quadraticCurveTo(cx - side * 10, Math.max(cyy, P.ey) + drop, (P.ex + cx) / 2 - side * 60, Math.max(cyy, P.ey) + drop);
    c.quadraticCurveTo(P.sx - side * 60, P.sy + drop * 1.1, P.sx - side * 50, P.sy + 60);
    c.closePath(); fo(c, o.dark, lw);
  }
  // the sleeve tube over the arm, ending at the cuff
  stroke(c, [P.sx, P.sy, P.ex, P.ey, cx, cyy], 128 + lw * 2, NOAH.out); stroke(c, [P.sx, P.sy, P.ex, P.ey, cx, cyy], 128, o.col);
  // fold lines
  stroke(c, [lerp(P.sx, P.ex, .5) + side * 18, lerp(P.sy, P.ey, .5), lerp(P.ex, cx, .3) + side * 22, lerp(P.ey, cyy, .3)], 4, o.light);
  if (o.cover) { const a0 = .3; stroke(c, [lerp(P.ex, cx, a0), lerp(P.ey, cyy, a0), cx, cyy], 118, o.cover); stroke(c, [lerp(P.ex, cx, a0) - 50, lerp(P.ey, cyy, a0), lerp(P.ex, cx, a0) + 50, lerp(P.ey, cyy, a0)], 5, '#24232a'); }
  if (o.armor) { // kote: dark silk sleeve with iron splints on the forearm
    stroke(c, [P.ex, P.ey, cx, cyy], 104, SAM.indigoD);
    for (let i = 0; i < 3; i++) { const k0 = .15 + i * .28; const px = lerp(P.ex, cx, k0), py = lerp(P.ey, cyy, k0); c.save(); c.translate(px, py); c.rotate(-side * P.a2); c.beginPath(); c.roundRect(-34, -18, 68, 50, 10); fo(c, SAM.iron, lw * .5); stroke(c, [-20, -6, 20, -6], 3, SAM.ironL); c.restore(); }
  }
  // the hand: open or gripping
  c.save(); c.translate(P.wx, P.wy);
  if (spec.fist) samFist(c, 0, 20, -side * P.a2 + Math.PI / 2 + (spec.hand || 0), 1);
  else noahHandLocal(c, -side * P.a2 + (spec.hand || 0));
  c.restore();
  // cuff ring over the wrist
  c.save(); c.translate(cx, cyy); c.rotate(-side * P.a2); c.beginPath(); c.ellipse(0, 0, 70, 22, 0, 0, Math.PI * 2); fo(c, o.armor ? SAM.lacquer : o.dark, lw * .8); c.restore();
  return P;
}

// ---------------------------------------------------------------- lower body
function hakamaFront(c, o) {
  const lw = NOAH.W, top = -600, bot = -46, sp = o.walk ? Math.sin(o.walk) * 26 : 0;
  c.beginPath(); c.moveTo(-138, top); c.lineTo(138, top); c.lineTo(212 + sp, bot); c.quadraticCurveTo(110, bot + 22, 10, bot - 4); c.lineTo(-10, bot - 4); c.quadraticCurveTo(-110, bot + 22, -212 + sp, bot); c.closePath();
  fo(c, o.col, lw);
  c.save(); c.clip();
  // fine grey stripes + pleats
  if (o.stripe) for (let x = -230; x <= 230; x += 18) stroke(c, [x * .66, top, x, bot], 2, o.stripe);
  for (const x of [-150, -95, -40, 40, 98, 156]) stroke(c, [x * .55, top + 30, x * 1.02 + sp * .5, bot], 6, o.dark);
  stroke(c, [0, top + 140, 0, bot], 7, o.dark);
  c.restore();
  // front straps (himo) with a cross knot under the obi
  c.beginPath(); c.rect(-140, top - 2, 280, 26); fo(c, o.dark, lw * .6);
  c.beginPath(); c.moveTo(-40, top + 20); c.lineTo(40, top + 60); c.moveTo(40, top + 20); c.lineTo(-40, top + 60); c.lineWidth = 16; c.strokeStyle = o.dark; c.lineCap = 'round'; c.stroke();
}
function feetFront(c, o = {}) {
  const lw = NOAH.W * .8, lift = o.lift || [0, 0];
  for (const s of [-1, 1]) {
    const L = lift[s < 0 ? 0 : 1], fx = s * 90;
    // sole: zori (straw) or geta (wood) or waraji (straw sandal with ties)
    if (o.geta) { c.beginPath(); c.rect(fx - 66, -26 - L, 132, 16); fo(c, '#a77d50', lw); for (const d of [-30, 30]) { c.beginPath(); c.rect(fx + d - 8, -12 - L, 16, 14); fo(c, '#7d5a36', lw * .6); } }
    else { c.beginPath(); c.ellipse(fx, -6 - L, 74, 16, 0, 0, Math.PI * 2); fo(c, o.waraji ? '#b49a6a' : SAM.zori, lw); }
    // tabi sock with split toe
    const by = o.geta ? -26 : -14;
    c.beginPath(); c.moveTo(fx - 56, by - L); c.quadraticCurveTo(fx - 64, by - 60 - L, fx - 36, by - 70 - L); c.lineTo(fx + 36, by - 70 - L); c.quadraticCurveTo(fx + 66, by - 60 - L, fx + 58, by - L); c.closePath(); fo(c, SAM.tabi, lw);
    stroke(c, [fx + s * 22, by - L, fx + s * 18, by - 34 - L], 4, '#9c968c');
    // thong
    stroke(c, [fx - 44, by - 6 - L, fx + s * 20, by - 40 - L, fx + 46, by - 6 - L], 9, o.waraji ? '#8b7448' : SAM.thong);
  }
}

// ---------------------------------------------------------------- torso garments
function kosodeTorso(c, o) {
  const lw = NOAH.W;
  c.beginPath(); c.moveTo(-60, -955); c.lineTo(-158, -942); c.quadraticCurveTo(-150, -820, -140, -720); c.lineTo(-138, -560); c.lineTo(138, -560); c.lineTo(140, -720); c.quadraticCurveTo(152, -820, 160, -942); c.lineTo(60, -955); c.closePath();
  fo(c, o.col, lw);
  c.save(); c.clip();
  // weave texture: tiny dots / patches
  if (o.texture) for (let i = 0; i < 90; i++) { const x = -150 + rnd(i + 3) * 300, y = -950 + rnd(i + 5) * 400; c.fillStyle = o.texture; c.fillRect(x, y, 5, 3); }
  if (o.patches) for (const [x, y, w, h, col] of o.patches) { c.beginPath(); c.rect(x, y, w, h); fo(c, col, 3); c.setLineDash([8, 8]); c.lineWidth = 3; c.strokeStyle = '#3a2a1c'; c.strokeRect(x + 6, y + 6, w - 12, h - 12); c.setLineDash([]); }
  c.restore();
  // collar: under-collar (white) then the left-over-right lapel
  c.beginPath(); c.moveTo(-60, -955); c.lineTo(-20, -955); c.lineTo(70, -740); c.lineTo(40, -720); c.closePath(); fo(c, SAM.collar, lw * .6);
  c.beginPath(); c.moveTo(60, -955); c.lineTo(20, -955); c.lineTo(-110, -600); c.lineTo(-70, -590); c.closePath(); fo(c, SAM.collar, lw * .6);
  c.beginPath(); c.moveTo(36, -955); c.lineTo(-92, -600); c.lineWidth = 34; c.strokeStyle = o.dark; c.stroke();
  // skin V at the neck
  c.beginPath(); c.moveTo(-30, -955); c.lineTo(30, -955); c.lineTo(2, -880); c.closePath(); c.fillStyle = NOAH.skin; c.fill();
  if (o.mon) { drawKamon(c, -96, -860, 26); drawKamon(c, 104, -860, 26); }
}
function haoriFront(c, o) {
  const lw = NOAH.W, hem = -440;
  for (const s of [-1, 1]) {
    c.beginPath(); c.moveTo(s * 56, -958); c.lineTo(s * 166, -944); c.quadraticCurveTo(s * 172, -800, s * 168, -700); c.lineTo(s * 182, hem); c.lineTo(s * 84, hem + 6); c.lineTo(s * 70, -780); c.closePath();
    fo(c, o.col, lw);
    c.save(); c.clip(); for (let i = 0; i < 4; i++) stroke(c, [s * (110 + i * 16), -900, s * (118 + i * 18), hem], 3, o.dark); c.restore();
    // black collar band down the front opening
    c.beginPath(); c.moveTo(s * 56, -958); c.lineTo(s * 70, -780); c.lineTo(s * 84, hem + 6); c.lineTo(s * 112, hem + 4); c.lineTo(s * 98, -780); c.lineTo(s * 92, -956); c.closePath(); fo(c, '#1d1d20', lw * .6);
    drawKamon(c, s * 132, -868, 22);
  }
  // haori himo: cords tied in the middle with a small tassel
  c.beginPath(); c.moveTo(-92, -770); c.quadraticCurveTo(-40, -740, 0, -760); c.quadraticCurveTo(40, -740, 92, -770); c.lineWidth = 10; c.strokeStyle = '#e8e2d4'; c.stroke();
  circ(c, 0, -760, 14); fo(c, '#e8e2d4', lw * .4);
  stroke(c, [-4, -750, -12, -712], 7, '#d9d2c2'); stroke(c, [4, -750, 12, -712], 7, '#d9d2c2');
}
function obiFront(c) { const lw = NOAH.W; c.beginPath(); c.rect(-140, -640, 280, 70); fo(c, SAM.obi, lw * .8); stroke(c, [-138, -618, 138, -618], 4, SAM.obiL); stroke(c, [-138, -594, 138, -594], 3, '#3a2419'); }
// swords in the obi on Noah's LEFT hip (= screen right in the front view), edge up, hilts forward
function swordsFront(c, part, o = {}) {
  const ks = .62; // foreshortening of the part pointing at the camera
  if (part === 'back') {
    // scabbard ends stick out behind the left hip
    for (const [kind, y, ang, dx] of [['katana', -600, .42, 150], ['waki', -612, .3, 140]]) {
      c.save(); c.translate(dx, y); c.rotate(ang); c.scale(.55, 1);
      const S = SWORD[kind]; c.beginPath(); c.moveTo(0, -S.w * .6); c.quadraticCurveTo(S.saya * .5, -S.w * .9, S.saya * .62, -S.w * .3); c.quadraticCurveTo(S.saya * .66, S.w * .3, S.saya * .6, S.w * .5); c.lineTo(0, S.w * .6); c.closePath(); fo(c, SAM.lacquer, NOAH.W * .8);
      stroke(c, [20, -S.w * .25, S.saya * .55, -S.w * .45], 5, 'rgba(190,200,215,.5)');
      c.restore();
    }
    return;
  }
  // hilts in front of the obi, pointing up-forward towards the body centre
  for (const [kind, x, y, ang, sc] of [['waki', 52, -614, Math.PI + .45, .78], ['katana', 92, -596, Math.PI + .3, .9]]) {
    c.save(); c.translate(x, y); c.rotate(ang); c.scale(ks * sc, sc);
    drawSword(c, { kind, sheath: false, detail: 1 });
    c.restore();
    // round tsuba face-ish (seen at an angle) at the obi
    c.save(); c.translate(x + 8, y + 2); c.rotate(-.3); c.scale(.42, 1); circ(c, 0, 0, SWORD[kind].tsuba * sc); fo(c, SAM.iron, NOAH.W * .6); c.restore();
  }
  // sageo cord hanging from the obi
  c.beginPath(); c.moveTo(112, -580); c.quadraticCurveTo(140, -520, 120, -470); c.quadraticCurveTo(100, -520, 96, -580); c.lineWidth = 7; c.strokeStyle = SAM.navyCord; c.stroke();
}

// ---------------------------------------------------------------- armour body (yoroi)
function armorBody(c, o) {
  const lw = NOAH.W, sway = o.sway || 0;
  // hakama (dark red) + shin guards
  for (const s of [-1, 1]) {
    c.beginPath(); c.moveTo(s * 20, -420); c.lineTo(s * 150, -420); c.lineTo(s * 150, -230); c.lineTo(s * 30, -230); c.closePath(); fo(c, '#5a1c22', lw);
    // suneate: black lacquered splints with ties
    c.beginPath(); c.moveTo(s * 40, -270); c.lineTo(s * 140, -270); c.lineTo(s * 132, -70); c.lineTo(s * 48, -70); c.closePath(); fo(c, SAM.lacquer, lw);
    for (let i = 0; i < 3; i++) stroke(c, [s * (64 + i * 24), -262, s * (66 + i * 22), -78], 4, SAM.lacquerL);
    stroke(c, [s * 40, -240, s * 140, -240], 6, SAM.lace); stroke(c, [s * 46, -110, s * 134, -110], 6, SAM.lace);
  }
  feetFront(c, { waraji: true, lift: o.lift });
  // haidate (thigh apron with small plates)
  c.beginPath(); c.moveTo(-170, -470); c.lineTo(170, -470); c.lineTo(182, -280); c.lineTo(-182, -280); c.closePath(); fo(c, '#3a2c27', lw);
  c.save(); c.clip(); for (let y = -460; y < -280; y += 30) for (let x = -180; x < 180; x += 30) { c.beginPath(); c.rect(x + ((y / 30) % 2) * 15, y, 22, 20); fo(c, SAM.iron, 2, '#111'); } c.restore();
  // kusazuri (tassets): 4 panels of 5 lames
  for (let p = 0; p < 4; p++) {
    const x0 = -176 + p * 88, ang = (p - 1.5) * .05 + sway * (p % 2 ? 1 : -1) * .02;
    c.save(); c.translate(x0 + 44, -560); c.rotate(ang);
    for (let l = 0; l < 5; l++) {
      const y = l * 46; c.beginPath(); c.roundRect(-46, y, 92, 50, 6); fo(c, SAM.lacquer, lw * .6);
      c.save(); c.clip(); for (let x = -42; x <= 42; x += 12) stroke(c, [x, y + 4, x, y + 46], 6, SAM.lace); c.restore();
      stroke(c, [-46, y + 48, 46, y + 48], 4, SAM.goldL);
    }
    c.restore();
  }
  // dō: chest armour, black lacquer lames with dark red lacing (kebiki odoshi)
  c.beginPath(); c.moveTo(-160, -930); c.lineTo(160, -930); c.quadraticCurveTo(178, -760, 168, -560); c.lineTo(-168, -560); c.quadraticCurveTo(-178, -760, -160, -930); c.closePath(); fo(c, SAM.lacquer, lw);
  c.save(); c.clip();
  for (let r = 0; r < 7; r++) {
    const y = -880 + r * 46; c.fillStyle = r % 2 ? '#1c1814' : '#221d18'; c.fillRect(-190, y, 380, 46);
    for (let x = -178; x <= 178; x += 13) stroke(c, [x, y + 6, x, y + 40], 7, r === 3 ? SAM.laceL : SAM.lace);
    stroke(c, [-190, y + 44, 190, y + 44], 4, SAM.goldL);
  }
  c.restore();
  // munaita (top plate) + gilt rim
  c.beginPath(); c.moveTo(-110, -950); c.lineTo(110, -950); c.lineTo(124, -880); c.lineTo(-124, -880); c.closePath(); fo(c, SAM.lacquer, lw * .8);
  stroke(c, [-120, -884, 120, -884], 5, SAM.gold); drawKamon(c, 0, -916, 22, SAM.goldL);
  // obi + swords
  c.beginPath(); c.rect(-170, -586, 340, 40); fo(c, '#2a2a33', lw * .7);
  // nodowa (throat guard)
  c.beginPath(); c.moveTo(-70, -968); c.quadraticCurveTo(0, -930, 70, -968); c.lineTo(78, -940); c.quadraticCurveTo(0, -900, -78, -940); c.closePath(); fo(c, SAM.lacquer, lw * .6);
}
function sodeFront(c, side, sway = 0) {
  // big shoulder boards hanging from the shoulders
  const lw = NOAH.W, x = side * 190, y = -960;
  c.save(); c.translate(x, y); c.rotate(side * (.12 + sway * .04));
  for (let l = 0; l < 6; l++) {
    const yy = l * 50; c.beginPath(); c.roundRect(-72, yy, 144, 54, 6); fo(c, SAM.lacquer, lw * .6);
    c.save(); c.clip(); for (let xx = -66; xx <= 66; xx += 13) stroke(c, [xx, yy + 4, xx, yy + 50], 7, SAM.lace); c.restore();
    stroke(c, [-72, yy + 52, 72, yy + 52], 4, SAM.goldL);
  }
  c.beginPath(); c.roundRect(-72, -20, 144, 26, 6); fo(c, SAM.lacquer, lw * .6); stroke(c, [-60, -8, 60, -8], 4, SAM.gold);
  c.restore();
}
function sashimono(c, t = 0, o = {}) {
  // back banner: pole + cross bar + narrow vertical flag with an invented crest
  const lw = NOAH.W * .8, x = o.x ?? 120;
  stroke(c, [x, -700, x, -2350], 22, '#3a2a1a'); stroke(c, [x, -700, x, -2350], 12, '#6b4e30');
  stroke(c, [x, -2340, x - 230, -2340], 18, '#3a2a1a');
  c.beginPath(); c.moveTo(x - 8, -2330);
  for (let i = 0; i <= 10; i++) { const y = -2330 + i * 130, wv = Math.sin(t * 4 + i * .7) * 16 * (i / 10); c.lineTo(x - 8 + wv, y); }
  for (let i = 10; i >= 0; i--) { const y = -2330 + i * 130, wv = Math.sin(t * 4 + i * .7) * 16 * (i / 10); c.lineTo(x - 230 + wv, y); }
  c.closePath(); fo(c, o.col || '#f1ece0', lw);
  drawKamon(c, x - 119 + Math.sin(t * 4 + 2) * 6, -2050, 70, o.ink || SAM.indigo);
  c.beginPath(); c.rect(x - 230, -1450, 222, 40); c.fillStyle = o.ink || SAM.indigo; c.fill();
}

// ---------------------------------------------------------------- full body, front view
function drawSam(c, p = {}) {
  if (p.ink && !p._inked) { const W0 = NOAH.W; NOAH.W = W0 * p.ink; try { return drawSam(c, Object.assign({}, p, { _inked: 1 })); } finally { NOAH.W = W0; } }
  if (p.outfit === 'nohaori') p = Object.assign({}, p, { outfit: 'samurai', haori: false });
  const k = p.k ?? .5, e = p.expr || {}, of = p.outfit || 'samurai';
  const arms = { l: Object.assign({}, { a: .1, b: -.06 }, (p.arms || {}).l), r: Object.assign({}, { a: .1, b: -.06 }, (p.arms || {}).r) };
  const hair = p.hair || (of === 'armor' ? 'helmet' : of === 'ronin' ? 'loose' : 'chonmage');
  const swords = p.swords !== false;
  const style = {
    samurai: { col: SAM.indigo, dark: SAM.indigoD, light: SAM.indigoL, hak: SAM.hakama, hakD: SAM.hakamaD, stripe: SAM.hakamaStripe, haori: p.haori !== false, mon: true },
    ronin: { col: SAM.ronin, dark: SAM.roninD, light: SAM.roninL, hak: '#5b5048', hakD: '#463d36', stripe: null, haori: false, mon: false, patches: [[-120, -840, 70, 80, SAM.patch], [60, -700, 80, 70, SAM.patch2]] },
    edo: { col: SAM.edo, dark: SAM.edoD, light: SAM.edoL, hak: '#5f5e63', hakD: '#4a494e', stripe: '#77767b', haori: false, mon: true, cover: SAM.sleeveCover },
    armor: { col: SAM.indigoD, dark: '#141a2c', light: SAM.indigo, armor: true },
    custom: p.custom ? { col: p.custom.col, dark: p.custom.dark, light: p.custom.light, hak: p.custom.hak || p.custom.col, hakD: p.custom.hakD || p.custom.dark, stripe: p.custom.stripe, haori: p.custom.haori, haoriCol: p.custom.haoriCol, mon: p.custom.mon, cover: p.custom.cover, patches: p.custom.patches, brocade: p.custom.brocade } : null,
  }[of];
  c.save(); c.translate(p.x || 0, p.y || 0); c.scale(k * (p.s || 1), k); if (p.lean) c.rotate(p.lean);
  const bob = p.bob || 0, br = p.breathe ? Math.sin(p.breathe) * 6 : 0;
  if (of === 'armor' && p.flag !== false) sashimono(c, p.t || 0, p.flagOpts || {});
  if (of === 'ronin' && p.kasa !== false) { // straw hat hanging on the back
    c.save(); c.translate(0, -1000 + bob); ell(c, 0, 0, 330, 300); fo(c, '#c9a965', NOAH.W);
    for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; stroke(c, [0, 0, Math.cos(a) * 326, Math.sin(a) * 296], 3, '#9c7f45'); }
    for (const r of [.35, .65, .9]) { ell(c, 0, 0, 330 * r, 300 * r); c.lineWidth = 3; c.strokeStyle = '#a88a50'; c.stroke(); }
    c.restore();
  }
  const sz = p.seiza ? 330 : 0, swordsOn = swords && !p.seiza;
  if (p.seiza) {
    // kneeling (front): body lowered, hakama spreads over the knees on the floor
    c.save(); c.translate(0, sz);
    c.beginPath(); c.moveTo(-150, -620); c.lineTo(150, -620); c.quadraticCurveTo(300, -520, 320, -380); c.quadraticCurveTo(330, -330, 280, -326); c.lineTo(-280, -326); c.quadraticCurveTo(-330, -330, -320, -380); c.quadraticCurveTo(-300, -520, -150, -620); c.closePath();
    fo(c, style.armor ? '#5a1c22' : style.hak, NOAH.W);
    c.save(); c.clip(); for (const x of [-200, -120, -40, 40, 120, 200]) stroke(c, [x * .5, -600, x, -330], 5, style.armor ? '#3f1318' : style.hakD); if (style.stripe) for (let x = -320; x <= 320; x += 18) stroke(c, [x * .5, -620, x, -330], 2, style.stripe); c.restore();
    c.restore();
  } else if (style.armor) armorBody(c, { sway: p.sway || 0, lift: p.lift });
  else {
    feetFront(c, { geta: p.geta, lift: p.lift });
    if (swordsOn) swordsFront(c, 'back');
    hakamaFront(c, { col: style.hak, dark: style.hakD, stripe: style.stripe, walk: p.walk });
  }
  c.save(); c.translate(0, bob + br * .3 + sz);
  if (style.armor && p.seiza) { const P = { sway: 0 }; c.save(); c.beginPath(); c.rect(-200, -980, 400, 420); c.clip(); armorBody(c, P); c.restore(); }
  if (!style.armor) { kosodeTorso(c, { col: style.col, dark: style.dark, mon: style.mon && !style.haori, texture: of === 'samurai' ? 'rgba(90,110,160,.45)' : of === 'ronin' ? 'rgba(60,45,30,.5)' : null, patches: style.patches }); obiFront(c); if (swordsOn) swordsFront(c, 'front'); }
  else if (swordsOn) { swordsFront(c, 'front'); }
  // neck
  c.beginPath(); c.rect(-46, -1000, 92, 62); c.fillStyle = NOAH.skin; c.fill(); stroke(c, [-46, -1000, -46, -955], 10, NOAH.out); stroke(c, [46, -1000, 46, -955], 10, NOAH.out);
  const hc = style.haoriCol || SAM.haori; const armOpt = { col: style.haori ? hc : style.col, dark: style.haori ? shadeHex(hc, -.25) : style.dark, light: style.haori ? shadeHex(hc, .2) : style.light, wide: style.armor ? 0 : 250, cover: style.cover, armor: style.armor };
  const up = arms.l.a > 1.6 || arms.r.a > 1.6;
  const drawArms = () => { samArm(c, -1, arms.l, armOpt); samArm(c, 1, arms.r, armOpt); };
  if (style.haori) haoriFront(c, { col: hc, dark: shadeHex(hc, -.25) });
  if (style.brocade) { c.save(); for (let i = 0; i < 30; i++) { const x = -130 + (i % 6) * 52, y = -920 + Math.floor(i / 6) * 70; if (Math.abs(x) < 70) continue; drawKamon(c, x, y, 14, 'rgba(220,190,110,.55)'); } c.restore(); }
  if (!up) drawArms();
  if (style.armor) { sodeFront(c, -1, p.sway || 0); sodeFront(c, 1, p.sway || 0); }
  c.save(); c.translate(0, NOAH.HEAD.y + 260); c.rotate(p.tilt || 0); c.translate(0, -(NOAH.HEAD.y + 260));
  if (p.headFn) p.headFn(c, e);
  else if (hair === 'helmet') { kabuto(c, { sway: p.sway || 0 }); samHeadLocal(c, e, 'helmet'); kabutoTop(c, { enemy: p.enemyCrest }); }
  else samHeadLocal(c, e, hair);
  c.restore();
  if (up) drawArms();
  c.restore(); c.restore();
}

// ---------------------------------------------------------------- the child samurai (separate character, same drawing language)
// big round white head, large dot eyes with a catch-light, short topknot with a forelock, small kosode + hakama, wooden sword
function drawChild(c, p = {}) {
  const k = p.k ?? .25, e = p.expr || {}, lw = NOAH.W * (p.ink || 1.8);
  c.save(); c.translate(p.x || 0, p.y || 0); c.scale(k * (p.s || 1), k);
  const HY = -760, R = 230;
  // legs/hakama
  c.beginPath(); c.moveTo(-90, -380); c.lineTo(90, -380); c.lineTo(140, -40); c.lineTo(-140, -40); c.closePath(); fo(c, '#6b5a4a', lw);
  stroke(c, [0, -300, 0, -40], 6, '#4e4135'); stroke(c, [-50, -360, -80, -40], 5, '#4e4135'); stroke(c, [50, -360, 80, -40], 5, '#4e4135');
  for (const s of [-1, 1]) { c.beginPath(); c.ellipse(s * 60, -20, 56, 26, 0, 0, Math.PI * 2); fo(c, SAM.tabi, lw * .8); }
  // body
  c.beginPath(); c.moveTo(-100, -560); c.lineTo(100, -560); c.lineTo(96, -370); c.lineTo(-96, -370); c.closePath(); fo(c, p.col || '#5d7fa6', lw);
  c.beginPath(); c.moveTo(34, -560); c.lineTo(-60, -400); c.lineWidth = 18; c.strokeStyle = SAM.collar; c.stroke();
  c.beginPath(); c.rect(-100, -410, 200, 40); fo(c, SAM.obi, lw * .6);
  drawKamon(c, 56, -500, 18);
  // arms
  const arm = (s, a, b, fist) => {
    const sx = s * 92, sy = -540, ex = sx + s * Math.sin(a) * 120, ey = sy + Math.cos(a) * 120, wx = ex + s * Math.sin(a + b) * 110, wy = ey + Math.cos(a + b) * 110;
    stroke(c, [sx, sy, ex, ey, wx, wy], 80 + lw * 2, NOAH.out); stroke(c, [sx, sy, ex, ey, wx, wy], 80, p.col || '#5d7fa6');
    c.save(); c.translate(wx, wy); if (fist) samFist(c, 0, 10, -s * (a + b) + Math.PI / 2, .7); else c.scale(.7, .7), noahHandLocal(c, -s * (a + b)); c.restore();
    return [wx, wy];
  };
  const al = (p.arms || {}).l || { a: .2, b: 0 }, ar = (p.arms || {}).r || { a: .2, b: 0 };
  if (p.bokken) { const [hx, hy] = [lerp(-60, 60, .5), -470]; }
  arm(-1, al.a, al.b, al.fist); const hr = arm(1, ar.a, ar.b, ar.fist);
  if (p.bokken) { c.save(); c.translate(hr[0], hr[1] + 10); c.rotate(p.bokkenAng ?? -1.9); drawBokken(c, 0, 0, .55); c.restore(); }
  // head
  c.beginPath(); c.arc(0, HY, R, 0, Math.PI * 2); c.fillStyle = NOAH.skin; c.fill(); c.lineWidth = lw; c.strokeStyle = NOAH.out; c.stroke();
  // side hair + forelock (maegami) + small topknot
  for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * (R + 2), HY); c.quadraticCurveTo(s * (R + 8), HY - 140, s * 120, HY - 190); c.quadraticCurveTo(s * 160, HY - 90, s * (R - 18), HY + 10); c.closePath(); fo(c, NOAH.hair, lw * .8); }
  c.beginPath(); c.moveTo(-120, HY - 190); c.quadraticCurveTo(0, HY - 250, 120, HY - 190); c.quadraticCurveTo(60, HY - 120, 0, HY - 150); c.quadraticCurveTo(-60, HY - 110, -120, HY - 190); c.closePath(); fo(c, NOAH.hair, lw * .8);
  c.beginPath(); c.ellipse(0, HY - R - 10, 34, 40, 0, 0, Math.PI * 2); fo(c, NOAH.hair, lw * .7); c.beginPath(); c.rect(-30, HY - R + 14, 60, 14); fo(c, '#f2eee4', lw * .4);
  // face: big dot eyes with catch-light
  for (const s of [-1, 1]) {
    const ex = s * 78, ey = HY + 20;
    if (e.eyes === 'closed') { c.beginPath(); c.moveTo(ex - 24, ey); c.quadraticCurveTo(ex, ey + 18, ex + 24, ey); c.lineWidth = 9; c.strokeStyle = NOAH.eye; c.stroke(); }
    else { ell(c, ex + (e.look || 0) * 6, ey, 28, 40); c.fillStyle = NOAH.eye; c.fill(); circ(c, ex - 8 + (e.look || 0) * 6, ey - 14, 8); c.fillStyle = '#fff'; c.fill(); }
    c.beginPath(); c.moveTo(s * 120, HY - 40 - (e.browUp || 0) * 14); c.quadraticCurveTo(s * 80, HY - 62 - (e.browUp || 0) * 14, s * 44, HY - 50 - (e.browUp || 0) * 14); c.lineWidth = 11; c.strokeStyle = NOAH.brow; c.stroke();
  }
  const m = e.mouth || 'flat', my = HY + 120;
  if (m === 'smile') { c.beginPath(); c.moveTo(-40, my - 4); c.quadraticCurveTo(0, my + 18, 40, my - 4); c.lineWidth = 8; c.strokeStyle = NOAH.out; c.stroke(); }
  else if (m === 'press') { stroke(c, [-26, my, 26, my], 9, NOAH.out); stroke(c, [-30, my - 6, -24, my + 4], 5, NOAH.out); stroke(c, [30, my - 6, 24, my + 4], 5, NOAH.out); }
  else if (m === 'o') { ell(c, 0, my, 18, 22); fo(c, NOAH.mouthIn, 6); }
  else stroke(c, [-24, my, 24, my], 8, NOAH.out);
  c.restore();
}
function drawBokken(c, x, y, s = 1) {
  c.save(); c.translate(x, y); c.scale(s, s);
  const L = 900, lw = NOAH.W * .9;
  c.beginPath(); c.moveTo(-60, -20); for (let i = 0; i <= 10; i++) c.lineTo(-60 + i * L / 10, -20 - Math.sin(i / 10 * Math.PI) * 24 + (i / 10) * 6); c.quadraticCurveTo(L - 40, 18, L - 80, 22);
  for (let i = 10; i >= 0; i--) c.lineTo(-60 + i * (L - 80) / 10, 20 - Math.sin(i / 10 * Math.PI) * 20); c.closePath();
  const g = c.createLinearGradient(0, -20, 0, 20); g.addColorStop(0, '#d8b27a'); g.addColorStop(1, '#a77b48'); fo(c, g, lw);
  for (let i = 0; i < 6; i++) stroke(c, [i * 140, -8 + rnd(i) * 10, i * 140 + 90, -10 + rnd(i + 1) * 10], 2, '#8a6236');
  c.beginPath(); ell(c, 180, 0, 8, 34); fo(c, '#3a2a1a', lw * .5);
  c.restore();
}
