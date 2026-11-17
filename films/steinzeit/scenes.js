// "Ein Tag in der Steinzeit" — scenes. Times are seconds of the merged voice-over (teil1 + teil2).
// DRAFT: shot 1 = first 5 s of the hook (Noah's eyes open in the dark), shot 2 = card-template preview (still only).

const K = .25;               // Noah scale (≈ 1,75 m)
const FUR = ['#5a3d26', '#3e2a1a', '#8a6440'], FUR2 = ['#6b5038', '#4a3524', '#9c7a56'];

// ---------- S1 HOOK: extreme close-up, Noah lying on furs, eyes open in the dark ----------
function hookEyes(lt) {
  const z = keys(lt, [[0, 6.4], [1.4, 6.3], [5, 4.7]]);
  const cam = { x: Math.sin(lt * .4) * 3 + lerp(4, -6, seg(lt, 0, 5)), y: 14 - seg(lt, 0, 5) * 4, z, rot: .015 * Math.sin(lt * .3) };
  // expression timeline (seconds in the voice: "…machst die Augen auf" ≈ 1,3–1,9 / "stockdunkel" ≈ 3,0–3,7)
  const opening = seg(lt, 1.45, 1.95), blink = bump(lt, 2.95, 3.17);
  const e = lt < 1.45 ? { eyes: 'closed', mouth: 'soft' } : {
    eyes: 'open', lid: Math.max(1 - easeOut(opening), blink * .95),
    look: keys(lt, [[3.25, 0], [3.5, -1], [3.95, -1], [4.2, 1], [4.65, 1], [4.9, .2]]),
    browUp: keys(lt, [[2.2, 0], [2.7, .7], [4.2, .55], [5, .4]]), mouth: lt > 3.3 && lt < 4.4 ? 'o' : 'soft',
  };
  const breath = Math.sin(lt * 1.7) * .7, headY = breath * .5;
  // ember light (lower right, off-screen): almost nothing at first, then it breathes up and reveals the face
  const flick = 1 + .1 * Math.sin(lt * 9.3) + .06 * Math.sin(lt * 23.1) + .05 * Math.sin(lt * 4.1);
  const ember = (.04 + .96 * ease(seg(lt, 1.8, 4.6))) * flick;
  const set = (c, cm, t) => {
    layer(c, cm, 1, c => {
      c.fillStyle = '#2a1d14'; c.fillRect(-600, -500, 1200, 1000);
      furPatch(c, -400, -300, 400, 300, 11, FUR, { n: 5200, len: 9, lw: 1.1, dir: 1.0 });
      // rolled fur pillow under the head
      c.save(); c.beginPath(); c.ellipse(0, -30, 150, 62, 0, 0, Math.PI * 2); c.clip(); furPatch(c, -160, -100, 160, 40, 21, FUR2, { n: 1600, len: 8, lw: 1.1, dir: .2 }); c.restore();
      { const g = c.createRadialGradient(0, -40, 40, 0, -30, 160); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(.7, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(15,8,4,.55)'); c.fillStyle = g; c.beginPath(); c.ellipse(0, -30, 152, 64, 0, 0, Math.PI * 2); c.fill(); }
      // a few loose straw stalks and a bone at the bed's edge
      for (let i = 0; i < 26; i++) { const x = -330 + rnd(i + 50) * 660, y = -260 + rnd(i + 60) * 520; if (Math.abs(x) < 170 && Math.abs(y) < 170) continue; line(c, [x, y, x + (rnd(i + 70) - .5) * 40, y + (rnd(i + 80) - .5) * 26], 1.6, i % 2 ? '#c9a24a' : '#9c7c34'); }
    });
    return { base: '#2a1d14' };
  };
  const world = c => {
    // shoulders in the dark t-shirt, mostly under the blanket
    c.save(); c.beginPath(); c.moveTo(-95, 200); c.quadraticCurveTo(-92, 92, -30, 74); c.lineTo(30, 74); c.quadraticCurveTo(92, 92, 95, 200); c.closePath(); c.fillStyle = NOAH.shirt; c.fill(); c.lineWidth = 3; c.strokeStyle = NOAH.out; c.stroke(); c.restore();
    c.beginPath(); c.rect(-11, 58, 22, 22); c.fillStyle = NOAH.skin; c.fill(); line(c, [-11, 58, -11, 78], 2.4, NOAH.out); line(c, [11, 58, 11, 78], 2.4, NOAH.out);
    drawNoahHead(c, 0, headY, K, e, 0);
    noahHeadPolish(c, 0, headY, K, e, 0, { lx: .75, ly: .55, shadow: .38, glint: 0 });
    // fur blanket pulled up to the chest
    c.save(); c.beginPath(); c.moveTo(-420, 400); c.lineTo(-420, 104 + breath); for (let i = 0; i <= 16; i++) c.lineTo(-420 + i * 52.5, 100 + Math.abs(i - 8) * -1.5 + breath + Math.sin(i * 1.9) * 7 + (rnd(i + 5) - .5) * 8); c.lineTo(420, 400); c.closePath();
    c.save(); c.clip(); furPatch(c, -430, 80, 430, 400, 31, ['#6e4a2c', '#4a301c', '#a07448'], { n: 2600, len: 10, lw: 1.2, dir: 1.5 }); c.restore();
    c.lineWidth = 2.4; c.strokeStyle = 'rgba(25,15,10,.8)'; c.stroke(); c.restore();
  };
  return {
    set, cam, blur: 0, vignette: 0,
    behind: [world],
    screen: [c => {
      const [ex, ey] = w2s(cam, 170, 150), amb = Math.round(lerp(2, 16, seg(lt, 1.6, 4.5)));
      lightMap(c, `${amb},${amb},${amb * 2}`, [
        { x: ex, y: ey, r: 1700, col: '255,130,55', a: ember * .95 },
        { x: ex - 300, y: ey - 300, r: 900, col: '255,175,100', a: ember * .6 },
        { x: -200, y: -300, r: 1100, col: '70,95,150', a: .07 * seg(lt, 2, 4.5) },   // faint cold blue from the cave mouth
      ]);
      // rim light + ember reflections in the eyes (glow even in total darkness)
      withWorld(c, cam, c => noahHeadPolish(c, 0, headY, K, e, 0, { lx: .75, ly: .55, shadow: 0, rim: .7 * ember, rimCol: '255,150,70', glint: e.eyes === 'open' ? .95 : 0, glintCol: '255,214,160', gdx: 8, gdy: 10 }));
      sparks(c, ex - 120, H + 30, lt, { n: 10, h: 700, speed: .22, size: 3.5, w: 380, drift: -160, a: .35 + ember });
      smokeWisp(c, ex - 240, H + 40, lt, { n: 5, h: 800, r: 120, a: .05 + ember * .1, drift: -260, col: '210,150,110' });
      finish(c, lt, { vig: .7, grain: .08 });
    }],
  };
}

// ---------- CARD TEMPLATE PREVIEW (still only): cave at dawn, Noah on his furs, year counter card ----------
function cardPreview(lt) {
  const cam = { x: -20 + lt * 12, y: -260, z: 1.3 }, mouth = 680, fire = { x: 80, y: -80, k: 1 };
  const NX = 420, seatH = 300, headY = -10 + (-seatH - (NOAH.HEM + 40) - 60 + NOAH.HEAD.y) * K;
  const ex = { eyes: 'open', look: -.7, browUp: .55, mouth: 'o' };
  return {
    set: caveSet2, setOpts: { mouthX: mouth, outside: 'dawn' }, cam, blur: 0, vignette: 0,
    behind: [c => {
      // fur heap (bed) under Noah, firewood, bones, tools
      c.save(); c.beginPath(); c.ellipse(NX, -30, 330, 70, 0, Math.PI, 0); c.lineTo(NX + 330, 0); c.lineTo(NX - 330, 0); c.closePath(); c.clip(); furPatch(c, NX - 340, -110, NX + 340, 10, 9, ['#7a5a3c', '#4e3622', '#b08658'], { n: 2400, len: 18, lw: 2.4, dir: 1.3 }); c.restore();
      for (let i = 0; i < 6; i++) { c.save(); c.translate(-1150 + i * 18, -14 - (i % 3) * 22); c.rotate(-.04 + i * .01); rrect(c, -110, -10, 220, 20, 10); c.fillStyle = i % 2 ? '#5a4030' : '#6e4e36'; c.fill(); c.lineWidth = 2; c.strokeStyle = '#21160e'; c.stroke(); c.restore(); }
      stoneTools(c, -380);
      hearth(c, fire.x, lt, 1, 1.1);
    }],
    front: [c => {
      castShadow(c, NX, 150, { dir: 1, alpha: .35, len: 1.2 });
      drawNoah(c, { x: NX, y: -10, k: K, ink: 1.8, sit: true, seatH, expr: ex, arms: { l: { a: .25, b: -.1 }, r: { a: .2, b: -.05 } } });
      noahHeadPolish(c, NX, headY, K, ex, 0, { lx: -.85, ly: .25, shadow: .34, glint: 0 });
    }],
    screen: [c => {
      caveLights(c, cam, lt, { fires: [fire], mouth, ambient: '38,32,44' });
      withWorld(c, cam, c => noahHeadPolish(c, NX, headY, K, ex, 0, { lx: -.85, ly: .25, shadow: 0, rim: .55, rimCol: '255,160,80', glintCol: '255,220,170', gdx: -8, gdy: 4 }));
      const [fx, fy] = w2s(cam, fire.x, -120);
      sparks(c, fx, fy, lt, { n: 16, h: 520, size: 3, w: 90, drift: 30 });
      smokeWisp(c, fx, fy - 150, lt, { n: 6, h: 650, r: 90, a: .12, drift: 120 });
      stoneCard(c, lt, { t0: .2, t1: 9, x: 96, y: 640, w: 760, h: 350, seed: 5, draw: (c, k, l, w, h) => {
        cardTitle(c, 'Zeitreise', 54, 100, 68);
        ochreRule(c, 54, 124, 340, 4);
        const ck = countK(l, .5, 1.6), yr = lerp(2026, -13000, ck);
        const txt = ck < 1 ? deYear(yr > 0 ? Math.round(yr) : -Math.round(-yr / 10) * 10) : 'ca. ' + deYear(-13000);
        cardTitle(c, txt, 54, 250, 116, { top: CARD.amber, bot: CARD.ochre, maxW: w - 110 });
        landFlash(c, 330, 210, 360, l, 2.1);
        iconPoint(c, 70, 298, .9, CARD.cream); cardBody(c, 'vor 15.000 Jahren', 98, 312, 46);
      } });
      finish(c, lt, { vig: .5, grain: .06 });
    }],
  };
}

STZ_FONTS_READY.then(() => defineFilm({
  shots: [
    { name: 'S1 hook – eyes', dur: 5, f: lt => hookEyes(lt) },
    { name: 'card preview', dur: 4, f: lt => cardPreview(lt) },
  ],
}));
