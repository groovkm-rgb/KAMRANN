// 10 s, golden hour: black Noah walks right along a shopping street; around him a crowd of DIFFERENT people (CAST).
// Every passer-by is a different CAST member; nobody is drawn with Noah's rig except Noah.
const DUR = 10;
const CROWD = [
  // walkers: who, depth y (sidewalk, -200 back … +80 front), x at t=0, speed (units/s, - = walks left)
  { who: 'kofi', y: -150, x0: 1450, v: -125 },
  { who: 'zara', y: -100, x0: 220, v: 80 },
  { who: 'malik', y: 75, x0: 2900, v: -250 },
  { who: 'ayo', y: 60, x0: -1500, v: 175 },
  { who: 'baba', y: -175, x0: 900, v: -45 },
  { who: 'grace', y: -135, x0: 2350, v: -70 }, { who: 'nia', y: -110, x0: 2250, v: -70, hop: 1 },
  { who: 'sade', y: -170, x0: -900, v: 105 },
  // standing / seated
  { who: 'imani', y: -175, x0: 1180, sit: 1 },
  { who: 'jamal', y: -195, x0: 1880, wave: 1 },
  { who: 'tunde', y: -200, x0: 2780, phone: 1 },
];
function crowdMember(c, o, t) {
  const P = CAST[o.who], x = o.x0 + (o.v || 0) * t, sc = P.T / 1527;
  castShadow(c, x + 10, 150 * Math.sqrt(sc) * Math.sqrt(P.bw), { dir: 1, len: 1.6, alpha: .28 });
  if (o.sit) { c.save(); c.translate(x, 0); c.scale(.9, .9); bench(c, 0); c.restore(); drawPersonSide(c, P, { x: x + 40, k: .25, s: -1, sit: true, seatH: 400, expr: { mouth: 'smile' } }); }
  else if (o.wave) drawPerson(c, P, { x, k: .25, arms: { r: { a: 2.3 + Math.sin(t * 7) * .35, b: .6 } }, expr: { mouth: 'grin', look: -.6 } });
  else if (o.phone) drawPerson(c, P, { x, k: .25, arms: { r: { a: .5, b: 1.9 } }, expr: { mouth: 'flat', look: .4 }, tilt: .08 });
  else drawPersonSide(c, P, { x, k: .25, s: Math.sign(o.v), walk: t * 8 * Math.max(.55, Math.abs(o.v) / 150) + o.x0 + (o.hop ? 1 : 0) });
}
function renderFrame(c, t) {
  const nx = -500 + 150 * t, cam = { x: nx + 240, y: -250, z: 1.35 };
  c.setTransform(1, 0, 0, 1, 0, 0);
  city(c, cam, t, { tod: 'golden', seed: 2 });
  layer(c, cam, 1, c => {
    for (let i = -2; i < 7; i++) { c.save(); c.translate(0, -215); streetLamp(c, i * 900 + 120); c.restore(); }
    c.save(); c.translate(0, -230); streetTree(c, 600, FOREST.day); streetTree(c, 2700, FOREST.day); bin(c, 1550); hydrant(c, -150); c.restore();
    for (let i = 0; i < 4; i++) { const px = 700 + i * 70, py = -40, f = t > 6 ? t - 6 : 0; c.save(); c.translate(px, py); c.scale(.55, .55); c.translate(-px, -py); pigeon(c, px + f * 220 * (i % 2 ? 1 : 1.3), t, py - f * (90 + i * 30)); c.restore(); }
    const all = CROWD.map(o => ({ ...o })).concat([{ noah: 1, y: 0 }]).sort((a, b) => a.y - b.y);
    for (const o of all) {
      c.save(); c.translate(0, o.y);
      if (o.noah) { castShadow(c, nx + 10, 150, { dir: 1, len: 1.6, alpha: .3 }); drawNoahSide(c, { x: nx, y: 0, k: .25, ink: 1.8, s: 1, walk: t * 8, expr: { mouth: 'smile' } }); }
      else crowdMember(c, o, t);
      c.restore();
    }
  });
  layer(c, cam, 1, c => { sunRays(c, cam.x - 1400, cam.y - 700, { n: 9, len: 3200, spread: .5, dir: .42, color: CITY.golden.ray, alpha: .13, t }); motes(c, cam.x - 1000, cam.x + 1000, cam.y - 500, cam.y + 450, t, { n: 35, color: '255,235,200' }); });
  grade(c, { sx: 0, sy: .2, warm: '255,160,80', warmA: .35, cool: '40,30,90', coolA: .22 });
  const f = Math.max(clamp(1 - t / .5), clamp((t - (DUR - .5)) / .5));
  if (f > 0) { c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = `rgba(0,0,0,${f})`; c.fillRect(0, 0, W, H); }
}
