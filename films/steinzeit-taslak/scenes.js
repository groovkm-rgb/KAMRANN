// STEINZEIT – 30 s draft (8 shots). Noah: caveman outfit, beard + wild hair. All on-screen text German.
const K = .25, INK = 1.8;
const PRIM = { beard: 1, wild: 1 };
const X = (o = {}) => Object.assign({}, PRIM, o);

// ---------- film-local helpers (rig parts unchanged; only add-ons on top) ----------
// side-profile beard + moustache + a few wild locks (the front view already has them in the rig)
function sideBeard(c, e) {
  c.beginPath(); c.moveTo(-5, -1200); c.quadraticCurveTo(20, -1140, 70, -1128); c.lineTo(205, -1126); c.quadraticCurveTo(236, -1112, 240, -1060);
  const tips = [[226, -992], [204, -1012], [180, -958], [152, -995], [124, -944], [94, -985], [64, -952], [34, -1000]];
  for (const [x, y] of tips) c.lineTo(x, y);
  c.quadraticCurveTo(-30, -1030, -55, -1095); c.quadraticCurveTo(-60, -1160, -5, -1200); c.closePath();
  c.fillStyle = NOAH.hair; c.fill(); c.lineWidth = NOAH.W * .75; c.strokeStyle = NOAH.out; c.lineJoin = 'round'; c.stroke();
  c.save(); c.clip(); for (let i = 0; i < 12; i++) { const x = -30 + i * 22, y0 = -1110 + Math.abs(i - 6) * 4; c.beginPath(); c.moveTo(x, y0); c.quadraticCurveTo(x + 10, y0 + 60, x + 4, y0 + 130); c.lineWidth = 4; c.strokeStyle = i % 2 ? NOAH.hairDark : NOAH.hairLight; c.stroke(); } c.restore();
  const m = e.mouth || 'smile', open = m === 'o' || m === 'yawn';
  c.beginPath(); c.ellipse(150, -1090, open ? 44 : 40, open ? 50 : 17, 0, 0, Math.PI * 2); c.fillStyle = NOAH.skin; c.fill(); c.lineWidth = 5; c.strokeStyle = NOAH.out; c.stroke();
  if (m === 'smile') { c.beginPath(); c.moveTo(120, -1096); c.quadraticCurveTo(150, -1080, 180, -1096); c.lineWidth = 8; c.strokeStyle = NOAH.out; c.stroke(); }
  else if (!open) nLine(c, [128, -1090, 172, -1090], 8, NOAH.out);
  else { const o = m === 'yawn' ? (e.open ?? 1) : .4; c.beginPath(); c.ellipse(150, -1086, 14 + 8 * o, 10 + 30 * o, 0, 0, Math.PI * 2); c.fillStyle = NOAH.mouthIn; c.fill(); c.lineWidth = 7; c.strokeStyle = NOAH.out; c.stroke(); }
  c.beginPath(); c.moveTo(98, -1102); c.quadraticCurveTo(130, -1146, 178, -1128); c.quadraticCurveTo(214, -1134, 226, -1100); c.quadraticCurveTo(196, -1116, 162, -1112); c.quadraticCurveTo(126, -1114, 98, -1102); c.closePath();
  c.fillStyle = NOAH.hair; c.fill(); c.lineWidth = 6; c.strokeStyle = NOAH.out; c.stroke();
}
function sideWild(c) {
  for (const [x, y, a, s] of [[-60, -1515, -1.9, 1], [70, -1520, -1.35, -1], [-180, -1455, -2.4, 1], [-252, -1260, -2.95, 1], [170, -1478, -.95, -1]]) {
    const L = 58, ex = x + Math.cos(a) * L, ey = y + Math.sin(a) * L, nx = -Math.sin(a), ny = Math.cos(a);
    c.beginPath(); c.moveTo(x + nx * 20, y + ny * 20); c.quadraticCurveTo(x + Math.cos(a) * L * .5 + nx * 26 * s, y + Math.sin(a) * L * .5 + ny * 26 * s, ex + nx * 14 * s, ey + ny * 14 * s);
    c.quadraticCurveTo(x + Math.cos(a) * L * .45, y + Math.sin(a) * L * .45, x - nx * 20, y - ny * 20); c.closePath();
    c.fillStyle = NOAH.hair; c.fill(); c.lineWidth = NOAH.W * .55; c.strokeStyle = NOAH.out; c.lineJoin = 'round'; c.stroke();
  }
}
// near-arm geometry (side view, local units) -> wrist + hand centre
function sideArmPts(th, bend) { const [sx, sy] = NOAH_SIDE.SHOULDER, ex = sx + Math.sin(th) * NOAH.UPPER, ey = sy + Math.cos(th) * NOAH.UPPER, t2 = th + bend, wx = ex + Math.sin(t2) * NOAH.FORE, wy = ey + Math.cos(t2) * NOAH.FORE; return { wx, wy, t2, hx: wx + Math.sin(t2) * 55, hy: wy + Math.cos(t2) * 55 }; }
// side profile like drawNoahSide, plus: beard/wild, near arm override (p.near = { th, bend }), spear in the near hand (p.spear)
function noahSideX(c, p = {}) {
  if (p.ink && !p._inked) { const W0 = NOAH.W; NOAH.W = W0 * p.ink; try { return noahSideX(c, Object.assign({}, p, { _inked: 1 })); } finally { NOAH.W = W0; } }
  const k = p.k ?? K, e = p.expr || {}, cave = p.outfit !== 'classic', ph = p.walk, walking = ph !== null && ph !== undefined;
  const sw = walking ? Math.sin(ph) : 0, lift = walking ? Math.max(0, Math.cos(ph)) : 0, lift2 = walking ? Math.max(0, -Math.cos(ph)) : 0;
  const bob = (walking ? -Math.abs(Math.cos(ph)) * 12 : 0) + (p.bob || 0), aSw = p.armSwing ?? .38;
  c.save(); c.translate(p.x || 0, p.y || 0); c.scale(k * (p.s || 1), k); c.save(); c.translate(0, bob);
  noahSideArm(c, walking ? aSw * sw : .05, walking ? .12 + .1 * Math.max(0, sw) : -.05, true, cave);
  noahSideLeg(c, walking ? -.42 * sw : -.03, walking ? .7 * lift2 : 0, true, cave);
  noahSideLeg(c, walking ? .42 * sw : .03, walking ? .7 * lift : 0, false, cave);
  noahSideTorso(c, cave, p.s || 1);
  c.beginPath(); c.rect(-28, -1000, 72, 50); c.fillStyle = NOAH.skin; c.fill(); nLine(c, [-28, -1000, -28, -958], 9, NOAH.out); nLine(c, [44, -1000, 44, -958], 9, NOAH.out);
  c.save(); c.translate(0, -980); c.rotate(p.tilt || 0); c.translate(0, 980); noahSideHead(c, e); if (e.wild) sideWild(c); if (e.beard) sideBeard(c, e); c.restore();
  const n = p.near || { th: walking ? -aSw * sw : .02, bend: walking ? .12 + .1 * Math.max(0, -sw) : -.05 };
  if (p.spear) { const a = sideArmPts(n.th, n.bend), ang = p.spearAng ?? -.12, L = 1900, ux = Math.cos(ang), uy = Math.sin(ang), x0 = a.hx - ux * L * .45, y0 = a.hy - uy * L * .45, x1 = a.hx + ux * L * .55, y1 = a.hy + uy * L * .55;
    nLine(c, [x0, y0, x1, y1], 40 + NOAH.W * 2, NOAH.out); nLine(c, [x0, y0, x1, y1], 40, '#9a6a3c');
    c.save(); c.translate(x1, y1); c.rotate(ang); c.beginPath(); c.moveTo(-10, -44); c.lineTo(190, 0); c.lineTo(-10, 44); c.closePath(); nFill(c, '#8d8a94'); nLine(c, [-30, -40, 30, 40], 14, '#c9a46a'); nLine(c, [-30, 40, 30, -40], 14, '#c9a46a'); c.restore(); }
  noahSideArm(c, n.th, n.bend, false, cave);
  c.restore(); c.restore();
}
function sideHandWorld(p, th, bend) { const a = sideArmPts(th, bend), k = p.k ?? K; return [p.x + (p.s || 1) * k * a.hx, (p.y || 0) + k * a.hy]; }
const noahF = (c, o) => drawNoah(c, Object.assign({ k: K, ink: INK, outfit: 'caveman' }, o));
const noahS = (c, o) => noahSideX(c, Object.assign({ k: K, ink: INK, outfit: 'caveman' }, o));
// flames only (no rock ring), for a fire that grows out of embers
function flames(c, x, t, s) {
  if (s <= 0) return; c.save(); c.translate(x, -24); c.scale(s, s);
  const fl = (sc, ph) => { const f = 1 + Math.sin(t * 11 + ph) * .08 + Math.sin(t * 17 + ph * 2) * .05, sway = Math.sin(t * 7 + ph) * 14;
    c.beginPath(); c.moveTo(-95 * sc, 0); c.quadraticCurveTo(-120 * sc, -120 * sc * f, sway - 20 * sc, -220 * sc * f); c.quadraticCurveTo(-10 * sc, -140 * sc * f, 0, -300 * sc * f + sway * .3);
    c.quadraticCurveTo(20 * sc, -150 * sc * f, sway + 40 * sc, -210 * sc * f); c.quadraticCurveTo(120 * sc, -110 * sc * f, 95 * sc, 0); c.closePath(); };
  fl(1, 0); c.fillStyle = '#e2492b'; c.fill(); c.lineWidth = 7; c.strokeStyle = OUT; c.stroke(); fl(.72, 1.3); c.fillStyle = '#f59a2e'; c.fill(); fl(.42, 2.1); c.fillStyle = '#ffe17a'; c.fill();
  for (let i = 0; i < 6; i++) { const ph = (t * .9 + rnd(i)) % 1; circle(c, (rnd(i + 9) - .5) * 140 + Math.sin(t * 3 + i) * 20, -100 - ph * 360, 6 * (1 - ph) + 2); c.fillStyle = `rgba(255,200,90,${1 - ph})`; c.fill(); }
  c.restore();
}
function handPrint(c, x, y, s, a = 1, col = '#b8322a') {
  c.save(); c.translate(x, y); c.scale(s, s); c.globalAlpha = a; c.fillStyle = col;
  c.beginPath(); c.ellipse(0, 0, 20, 24, 0, 0, Math.PI * 2); c.fill(); for (let f = 0; f < 5; f++) { const an = -2.6 + f * .45; c.beginPath(); c.ellipse(Math.cos(an) * 32, Math.sin(an) * 34, 6, 15, an + 1.57, 0, Math.PI * 2); c.fill(); }
  for (let i = 0; i < 7; i++) { circle(c, (rnd(i + 70) - .5) * 70, (rnd(i + 80) - .5) * 80, 2 + rnd(i + 90) * 3); c.fill(); }
  c.restore();
}
// warm firelight over the whole frame (screen space): colour wash from a screen point
function fireWash(c, sx, sy, a, t) {
  const r = Math.max(W, H) * (.9 + Math.sin(t * 9) * .02); c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
  const g = c.createRadialGradient(sx, sy, 0, sx, sy, r); g.addColorStop(0, `rgba(255,150,60,${a})`); g.addColorStop(.5, `rgba(255,110,40,${a * .45})`); g.addColorStop(1, 'rgba(255,90,30,0)');
  c.globalCompositeOperation = 'soft-light'; c.fillStyle = g; c.fillRect(0, 0, W, H); c.globalCompositeOperation = 'screen'; c.globalAlpha = .35; c.fillRect(0, 0, W, H); c.restore();
}
const dim = (a, col = '10,14,35') => c => { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = `rgba(${col},${a})`; c.fillRect(0, 0, W, H); c.restore(); };
const yearFmt = v => { const r = Math.round(v); if (r > 0) return String(r); const a = -r; return (a < 10000 ? String(a) : fmtNum(a)) + ' v. Chr.'; };
const nightForest = (o = {}) => (c, cam, t) => forest(c, cam, t, Object.assign({ tod: 'night', cave: true, caveX: 250, path: false, log: false, backdrop: snowyMountains }, o));
const dayForest = (o = {}) => (c, cam, t) => forest(c, cam, t, Object.assign({ tod: 'day', backdrop: snowyMountains }, o));

NOAH_FONTS_READY.then(() => defineFilm({
  fadeIn: .5, fadeOut: .9,
  shots: [
    // T1: moonlit snowy mountains, forest, cave. Slow pan. ZEITREISE 2026 -> 30.000 v. Chr.
    { name: 'T1 Nacht', dur: 4, f(lt, T, t) {
      const v = { x: -700 + ease(lt / T) * 700, y: -900 + ease(lt / T) * 300, z: 1 };
      return { set: nightForest({ treesX: [-2300, -1750, 1500, 2100] }), cam: v, vignette: .45,
        screen: [c => forestFrame(c, v, t, { tod: 'night' }), c => forestLight(c, v, t, { tod: 'night' }),
          c => hudCard(c, t, { t0: .5, t1: 3.85, corner: 'tr', w: 600, h: 250, title: 'ZEITREISE', icon: 'hourglass', color: HUD.blue, draw: (c, k, l, w, h) => {
            const kk = seg(l, .5, 2.9); hudCounter(c, 2026, -30000, kk, 0, 64, 60, { fmt: yearFmt, color: HUD.ink });
            hudTimeline(c, 70, 118, w - 140, [{ v: -30000, label: '30.000 v. Chr.' }, { v: -10000, label: '10.000 v. Chr.' }, { v: 2026, label: '2026' }], 2026 + (-30000 - 2026) * ease(kk), { size: 17 }); } })] };
    } },
    // T2: cave at dawn, golden beam + dust. Noah wakes: eyes closed -> blinking -> yawn
    { name: 'T2 Erwachen', dur: 4, f(lt, T, t) {
      const nx = -260, v = { x: nx + 140 - lt * 10, y: -240, z: 1.55 + lt * .03 };
      const yawn = bump(lt, 2.0, 3.6), lid = lt < 1.2 ? 1 : lt < 2.0 ? [1, .25, .9, .15, .7, .05][Math.floor((lt - 1.2) / .135)] ?? .1 : .1;
      const shut = lt < 1.2 || yawn > .55, stretch = ease(bump(lt, 1.9, 3.8));
      const expr = X({ eyes: shut ? 'closed' : 'open', lid: Math.min(1, lid), mouth: yawn > .05 ? 'yawn' : (lt > 3.6 ? 'soft' : 'flat'), open: yawn, browUp: yawn * .5 });
      const arm = { a: lerp(.13, 2.35, stretch), b: lerp(-.08, .55, stretch) };
      return { cam: v, vignette: .4,
        set: (c, cam, t) => caveInterior(c, cam, t, { mouthX: 700, tod: 'dawn' }),
        behind: [c => furBed(c, nx + 40, 560), c => stoneTools(c, nx + 420), c => castShadow(c, nx, 150, { dir: -1, alpha: .25 })],
        front: [c => noahF(c, { x: nx, sit: true, seatH: 95, expr, tilt: lt < 1.2 ? .14 + Math.sin(lt * 2) * .02 : -yawn * .12, bob: lt < 1.2 ? Math.sin(lt * 2.4) * 6 : 0, arms: { l: arm, r: arm } })],
        screen: [c => caveLight(c, v, t, { mouthX: 700, tod: 'dawn', rays: .2 })] };
    } },
    // T3: dying embers; Noah blows, flames grow, walls turn orange; relief
    { name: 'T3 Glut', dur: 3, f(lt, T, t) {
      const nx = -170, fx = 110, v = { x: -20, y: -170, z: 1.75 };
      const blow = bump(lt, .3, 1.5), grow = ease(seg(lt, .9, 2.0)), relief = seg(lt, 1.9, 2.3);
      const expr = X(relief > 0 ? { eyes: lt < 2.7 ? 'closed' : 'open', lid: .35, mouth: lt < 2.7 ? 'soft' : 'smile' } : { lid: .25, mouth: blow > .05 ? 'o' : 'flat', look: .9, browUp: .2 });
      const reach = { a: .55 * (1 - relief), b: .7 * (1 - relief) };
      return { set: (c, cam, t) => caveInterior(c, cam, t, { mouthX: 1400, tod: 'dawn' }), cam: v, vignette: .5,
        behind: [c => embers(c, fx, t, .25 + .75 * grow), c => flames(c, fx, t, .12 + .5 * grow)],
        front: [c => noahF(c, { x: nx, sit: true, seatH: 60, expr, tilt: .22 * (1 - relief) + .05 * blow, bob: relief * -6, arms: { l: { a: .2, b: -.1 }, r: reach } })],
        fx: [c => { // breath puffs towards the embers
            if (blow > .05) for (let i = 0; i < 4; i++) { const ph = (lt * 2.2 + i / 4) % 1; c.save(); c.globalAlpha = blow * (1 - ph) * .7; line(c, [nx + 70 + ph * 180, -170 + ph * 90 + i * 8, nx + 110 + ph * 200, -165 + ph * 95 + i * 8], 4, '#f4f1ea'); c.restore(); } },
          c => fireGlow(c, fx, t, .3 + 1.2 * grow)],
        screen: [dim(.5 - .38 * grow), c => fireWash(c, W * .62, H * .7, .1 + .5 * grow, t)] };
    } },
    // T4: misty pine forest, light shafts; Noah walks in profile with a spear, tracked
    { name: 'T4 Wald', dur: 4, f(lt, T, t) {
      const nx = -500 + lt * 150, v = { x: nx + 260, y: -240, z: 1.35 };
      const P = FOREST.day;
      return { set: dayForest({ path: false, log: false }), cam: v, vignette: .35,
        behind: [c => { for (const [x, h, sd] of [[-1100, 1500, 1], [-350, 1700, 2], [600, 1600, 3], [1300, 1750, 4]]) { c.save(); c.translate(x, -60); c.scale(.85, .85); fPine(c, 0, 0, h, P, sd, { lw: 3 }); c.restore(); } },
          c => { c.save(); c.globalAlpha = .55; mist(c, -120, '235,240,245', .55, 160); c.restore(); }, c => castShadow(c, nx, 110, { alpha: .25 })],
        front: [c => noahS(c, { x: nx, s: 1, walk: lt * 8, spear: true, near: { th: .35 + .06 * Math.sin(lt * 8), bend: .9 }, expr: X({ lid: 0, mouth: 'flat', browUp: .35, look: Math.sin(lt * 1.6) }), tilt: Math.sin(lt * 1.6) * .04 })],
        screen: [c => forestFrame(c, v, t, { tod: 'day' }), c => { layer(c, v, 1, c => { sunRays(c, v.x - 700, v.y - 900, { n: 7, len: 2600, spread: .5, dir: Math.PI / 2 - .35, color: '255,240,200', alpha: .2, t }); mist(c, -60, '240,244,248', .3, 220); }); },
          c => forestLight(c, v, t, { tod: 'day' })] };
    } },
    // T5: yellow eyes between the trees; camera pushes in; wolf steps out; Noah close-up, scared
    { name: 'T5 Wolf', dur: 4, f(lt, T, t) {
      const P = FOREST.dusk;
      if (lt < 2.5) {
        const v = { x: 560 + ease(seg(lt, 0, 2.5)) * 40, y: -200, z: 1.25 + ease(seg(lt, 0, 2.2)) * .75 };
        const out = ease(seg(lt, 1.15, 2.4)), wx = 820 - out * 260, blink = lt > .7 && lt < .8 ? .1 : 1;
        return { set: (c, cam, t) => forest(c, cam, t, { tod: 'dusk', path: false, log: false, backdrop: snowyMountains, treesX: [-900, 260, 980, 1500] }), cam: v, vignette: .6,
          behind: [c => { const g = c.createRadialGradient(700, -150, 30, 700, -150, 520); g.addColorStop(0, 'rgba(8,10,14,.92)'); g.addColorStop(1, 'rgba(8,10,14,0)'); c.fillStyle = g; c.fillRect(100, -700, 1200, 800); },
            c => { if (out < .05) wolfEyesInDark(c, 690, -190, blink * clamp(lt * 2), .8); },
            c => { if (out >= .05) { castShadow(c, wx, 200, { alpha: .3, dir: -1 }); wolf(c, wx, { s: -1, t, walk: out < .98, stalk: .7, snarl: seg(lt, 1.8, 2.4), glow: .5 }); } }],
          front: [c => { for (const [x, r, sd] of [[460, 120, 5], [640, 150, 7], [860, 140, 9], [1040, 110, 11]]) fBush(c, x, 30, r, { ...P, leaf: shade(P.leafDark, -.35) }, sd, false, 3); }],
          screen: [dim(.25, '20,15,30'), c => forestLight(c, v, t, { tod: 'dusk' })] };
      }
      const l2 = lt - 2.5, v = { x: 30, y: -300, z: 2.7 };
      return { set: (c, cam, t) => forest(c, cam, t, { tod: 'dusk', path: false, log: false, backdrop: snowyMountains }), cam: v, vignette: .6, shake: 6 * Math.exp(-l2 * 4),
        front: [c => noahF(c, { x: 0, expr: X({ lid: 0, browUp: 1, mouth: 'o', look: .7 }), tilt: -.05, bob: Math.sin(l2 * 30) * 2, arms: { l: { a: .35, b: .5 }, r: { a: .35, b: .5 } } })],
        screen: [dim(.18, '20,15,30'), c => forestLight(c, v, t, { tod: 'dusk' })] };
    } },
    // T6: wide; distant mammoth walking; Noah hides in a bush, holding his breath
    { name: 'T6 Mammut', dur: 4, f(lt, T, t) {
      const v = { x: -120 + lt * 15, y: -470, z: 1.0 }, P = FOREST.day;
      return { set: dayForest({ path: false, log: false, treesX: [-1500, -1050, 1250, 1700], mid: (c, base, t) => mammoth(c, -150 + lt * 60, { y: base, t, walk: true, sc: .55 }) }), cam: v, vignette: .4,
        behind: [c => castShadow(c, -560, 130, { alpha: .2 })],
        front: [c => noahF(c, { x: -560, sit: true, seatH: 130, expr: X({ lid: .1, mouth: 'flat', look: .9, browUp: .55 }), bob: Math.sin(lt * 18) * 1.5, arms: { l: { a: .3, b: .9 }, r: { a: .3, b: .9 } } }),
          c => { fBush(c, -560, 40, 170, P, 21, true, 3); fBush(c, -330, 50, 120, P, 23, false, 3); fern(c, -760, 40, .9, 4, P.leaf); }],
        screen: [c => forestFrame(c, v, t, { tod: 'day' }), c => forestLight(c, v, t, { tod: 'day' })] };
    } },
    // T7: night cave, big fire, wall paintings; Noah leaves a red hand print
    { name: 'T7 Malerei', dur: 4, f(lt, T, t) {
      const nx = 40, v = { x: -60, y: -400, z: 1.3 }, fx = 330;
      const up = ease(seg(lt, .3, 1.1)) * (1 - ease(seg(lt, 2.0, 2.7)));
      const near = { th: lerp(.02, 2.3, up), bend: lerp(-.05, -.2, up) }, p = { x: nx, s: -1 };
      const press = sideHandWorld(p, 2.3, -.2), printA = seg(lt, 1.9, 2.1);
      return { set: (c, cam, t) => caveInterior(c, cam, t, { mouthX: 1500, tod: 'night' }), cam: v, vignette: .55,
        behind: [c => handPrint(c, press[0] - 30, press[1], .9, printA), c => campfire(c, fx, t, .8), c => castShadow(c, nx, 120, { dir: -1, alpha: .35 })],
        front: [c => noahS(c, { ...p, near, expr: X({ lid: .15, mouth: lt > 2.2 ? 'soft' : 'flat', look: .3 }), tilt: lt > 2.4 ? -.05 : 0 })],
        fx: [c => fireGlow(c, fx, t, 1.4)],
        screen: [dim(.42, '12,10,30'), c => fireWash(c, W * .95, H * .62, .55, t)] };
    } },
    // T8: Noah at the cave mouth looking up at the stars, then slowly turns to the camera (serious, thoughtful)
    { name: 'T8 Sterne', dur: 3, f(lt, T, t) {
      const nx = 0, v = { x: 120, y: -300, z: 1.75 + lt * .05 };
      const turn = seg(lt, 1.2, 1.5), sideV = turn < .5, sq = Math.abs(Math.cos(turn * Math.PI));
      return { set: (c, cam, t) => caveInterior(c, cam, t, { mouthX: 400, tod: 'night' }), cam: v, vignette: .6,
        behind: [c => castShadow(c, nx, 120, { dir: -1, alpha: .3 })],
        front: [c => { c.save(); c.translate(nx, 0); c.scale(Math.max(.08, sq), 1); c.translate(-nx, 0);
          if (sideV) noahS(c, { x: nx, s: 1, expr: X({ lid: .1, mouth: 'flat', look: 1 }), tilt: -.16 });
          else noahF(c, { x: nx, expr: X({ lid: .3, mouth: 'flat', look: lerp(.5, 0, seg(lt, 1.5, 2.3)), browUp: .1 }), tilt: lerp(-.06, 0, seg(lt, 1.5, 2.3)) });
          c.restore(); }],
        screen: [dim(.3, '15,20,50'), c => { layer(c, v, 1, c => bloom(c, 900, -800, 1400, '170,190,255', .22)); }, c => fireWash(c, 0, H * .7, .3, t)] };
    } },
  ],
}));
