// SCENES S1–S11 (paragraphs 0–10). Absolute times from the aligned voice-over (S(i) = sentence start).
const FUR = ['#5a3d26', '#3e2a1a', '#8a6440'], FUR2 = ['#6b5038', '#4a3524', '#9c7a56'];

// ---------- close-ups / props used by several scenes ----------
function noahLyingECU(t, lt, o) {
  // top-down extreme close-up: Noah on his back on the furs, face lit by the embers from the lower right
  const z = o.z, cam = { x: o.cx || 0, y: o.cy ?? 12, z, rot: .015 * Math.sin(t * .3) };
  const e = o.e, breath = Math.sin(t * 1.7) * .7, headY = breath * .5, ember = o.ember * (1 + .1 * Math.sin(t * 9.3) + .06 * Math.sin(t * 23.1));
  return {
    set: (c, cm) => { layer(c, cm, 1, c => {
      c.fillStyle = '#2a1d14'; c.fillRect(-600, -500, 1200, 1000);
      furPatch(c, -400, -300, 400, 300, 11, FUR, { n: 5200, len: 9, lw: 1.1, dir: 1.0 });
      c.save(); c.beginPath(); c.ellipse(0, -30, 150, 62, 0, 0, Math.PI * 2); c.clip(); furPatch(c, -160, -100, 160, 40, 21, FUR2, { n: 1600, len: 8, lw: 1.1, dir: .2 }); c.restore();
      const g = c.createRadialGradient(0, -40, 40, 0, -30, 160); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(.7, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(15,8,4,.55)'); c.fillStyle = g; c.beginPath(); c.ellipse(0, -30, 152, 64, 0, 0, Math.PI * 2); c.fill();
      for (let i = 0; i < 26; i++) { const x = -330 + rnd(i + 50) * 660, y = -260 + rnd(i + 60) * 520; if (Math.abs(x) < 170 && Math.abs(y) < 170) continue; line(c, [x, y, x + (rnd(i + 70) - .5) * 40, y + (rnd(i + 80) - .5) * 26], 1.6, i % 2 ? '#c9a24a' : '#9c7c34'); }
    }); return { base: '#2a1d14' }; },
    cam, blur: 0, vignette: 0,
    behind: [c => {
      c.save(); c.beginPath(); c.moveTo(-95, 200); c.quadraticCurveTo(-92, 92, -30, 74); c.lineTo(30, 74); c.quadraticCurveTo(92, 92, 95, 200); c.closePath(); c.fillStyle = NOAH.shirt; c.fill(); c.lineWidth = 3; c.strokeStyle = NOAH.out; c.stroke(); c.restore();
      c.beginPath(); c.rect(-11, 58, 22, 22); c.fillStyle = NOAH.skin; c.fill(); line(c, [-11, 58, -11, 78], 2.4, NOAH.out); line(c, [11, 58, 11, 78], 2.4, NOAH.out);
      drawNoahHead(c, 0, headY, K, e, 0); noahHeadPolish(c, 0, headY, K, e, 0, { lx: .75, ly: .55, shadow: .38, glint: 0 });
      c.save(); c.beginPath(); c.moveTo(-420, 400); c.lineTo(-420, 104 + breath); for (let i = 0; i <= 16; i++) c.lineTo(-420 + i * 52.5, 100 + Math.abs(i - 8) * -1.5 + breath + Math.sin(i * 1.9) * 7 + (rnd(i + 5) - .5) * 8); c.lineTo(420, 400); c.closePath();
      c.save(); c.clip(); furPatch(c, -430, 80, 430, 400, 31, ['#6e4a2c', '#4a301c', '#a07448'], { n: 2600, len: 10, lw: 1.2, dir: 1.5 }); c.restore(); c.lineWidth = 2.4; c.strokeStyle = 'rgba(25,15,10,.8)'; c.stroke(); c.restore();
    }],
    screen: [c => {
      const [ex, ey] = w2s(cam, 170, 150), amb = Math.round(lerp(4, 16, clamp(o.ember)));
      lightMap(c, `${amb},${amb},${amb * 2}`, [{ x: ex, y: ey, r: 1700, col: '255,130,55', a: ember * .95 }, { x: ex - 300, y: ey - 300, r: 900, col: '255,175,100', a: ember * .6 }, { x: -200, y: -300, r: 1100, col: '70,95,150', a: .08 }]);
      withWorld(c, cam, c => noahHeadPolish(c, 0, headY, K, e, 0, { lx: .75, ly: .55, shadow: 0, rim: .7 * ember, rimCol: '255,150,70', glint: e.eyes === 'open' ? .95 : 0, glintCol: '255,214,160', gdx: 8, gdy: 10 }));
      sparks(c, ex - 120, H + 30, t, { n: 12, h: 700, speed: .22, size: 3.5, w: 380, drift: -160, a: .5 + ember });
      smokeWisp(c, ex - 240, H + 40, t, { n: 5, h: 800, r: 120, a: .05 + ember * .1 + (o.smoke || 0), drift: -260, col: '210,150,110' });
      for (const f of o.after || []) f(c);
      finish(c, t, { vig: .7, grain: .08 });
    }],
  };
}
// bedroom flash (hook start) and room scenes
function roomFrame(t, cam, o = {}) {
  const night = o.tod === 'night';
  return { set: roomSet, setOpts: { tod: o.tod || 'morning', horse: o.horse || 0 }, cam, blur: 0, vignette: 0,
    behind: [c => { bedBack(c, -300, night); nightstand(c, -480, t, { night, alarm: o.alarm, buzz: o.buzz, glow: o.glow, noPhone: o.noPhone }); for (const f of o.behind || []) f(c); }],
    front: [c => { for (const f of o.front || []) f(c); }],
    screen: [c => {
      if (night) lightMap(c, '40,46,70', [{ ...(() => { const [x, y] = w2s(cam, -530, -350); return { x, y }; })(), r: 700 * cam.z, col: '150,190,255', a: .9 * (o.glow ?? 1) }]);
      else { layer(c, cam, .9, c => sunRays(c, 640, -760, { n: 7, len: 1800, spread: .35, dir: Math.PI / 2 + .75, alpha: .16, t })); grade(c, { warm: '255,230,190', warmA: .25, cool: '40,40,70', coolA: .12, sx: .7, sy: .1 }); }
      for (const f of o.after || []) f(c); finish(c, t, { vig: .4, grain: .05 }); }] };
}
function noahInBed(c, t, x, o = {}) {
  // lying (head on the pillow, x = bed's headboard x) or sitting up (o.up 0..1)
  const up = o.up || 0;
  if (up < .5) { drawNoahHead(c, x + 140, -320, K, o.e || { eyes: 'closed', mouth: 'soft' }, -1.3); }
  else { N(c, t, { x: x + 260, y: -150, sit: true, seatH: 0, expr: o.e, arms: o.arms }); }
  bedFront(c, x, t, { night: o.night });
}
function watchCloseup(t, lt) {
  // macro: Noah's left wrist with the gold watch, second hand ticking, warm firelight
  const cam = { x: 0, y: 0, z: 1 };
  return { set: 'blank', setOpts: { color: '#1a120e' }, cam, vignette: 0,
    behind: [c => {
      c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
      furPatch(c, 0, 0, W, H, 5, ['#3a2618', '#24160c', '#5a3e26'], { n: 1800, len: 40, lw: 4, dir: 1.1 });
      c.translate(W / 2 + Math.sin(lt * .5) * 10, H / 2 + 40); c.rotate(-.18); c.scale(1 + lt * .02, 1 + lt * .02);
      // forearm + hand
      line(c, [-1100, 120, 260, 40], 300, NOAH.out); line(c, [-1100, 120, 260, 40], 280, NOAH.skin);
      c.save(); c.translate(400, 30); c.rotate(-1.62); c.scale(3.2, 3.2); noahHandLocal(c, 0); c.restore();
      // strap
      rrect(c, -150, -120, 120, 330, 30); c.fillStyle = NOAH.out; c.fill(); rrect(c, -142, -112, 104, 314, 26); c.fillStyle = NOAH.watch; c.fill();
      // case + face
      circle(c, -90, 40, 150); c.fillStyle = NOAH.out; c.fill(); circle(c, -90, 40, 138); const g = c.createRadialGradient(-130, 0, 10, -90, 40, 140); g.addColorStop(0, '#f2dc9a'); g.addColorStop(1, '#a8884a'); c.fillStyle = g; c.fill();
      circle(c, -90, 40, 112); c.fillStyle = '#f4efe2'; c.fill(); c.lineWidth = 6; c.strokeStyle = '#3a2e20'; c.stroke();
      for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; line(c, [-90 + Math.cos(a) * 92, 40 + Math.sin(a) * 92, -90 + Math.cos(a) * 104, 40 + Math.sin(a) * 104], i % 3 ? 4 : 8, '#2a2218'); }
      const sec = (Math.floor(lt * 1) + 17) / 60 * Math.PI * 2 - Math.PI / 2;
      line(c, [-90, 40, -90 + Math.cos(-2.2) * 50, 40 + Math.sin(-2.2) * 50], 10, '#2a2218'); line(c, [-90, 40, -90 + Math.cos(-.9) * 78, 40 + Math.sin(-.9) * 78], 7, '#2a2218');
      line(c, [-90, 40, -90 + Math.cos(sec) * 96, 40 + Math.sin(sec) * 96], 3, '#c8323a'); circle(c, -90, 40, 8); c.fillStyle = '#2a2218'; c.fill();
      // glass glint
      c.beginPath(); c.ellipse(-130, -10, 50, 18, -.6, 0, Math.PI * 2); c.fillStyle = 'rgba(255,255,255,.25)'; c.fill();
      c.restore();
    }],
    screen: [c => { lightMap(c, '30,26,36', [{ x: W * .8, y: H * .9, r: 1600, col: '255,150,70', a: .95 * (1 + .08 * Math.sin(t * 9)) }, { x: W * .3, y: H * .3, r: 900, col: '255,190,120', a: .4 }]); finish(c, t, { vig: .6 }); }] };
}
function emberCloseup(t, lt, o = {}) {
  const cam = { x: 0, y: -60 - lt * 4, z: 3.2 - lt * .06 };
  return caveFrame(t, cam, { mouth: 900, fires: [{ x: 0, k: o.k ?? .22 }], ambient: '14,12,18', behind: [c => { hearth(c, 0, t, o.k ?? .22, 1); }],
    after: [c => { const [x, y] = w2s(cam, 0, -40); smokeWisp(c, x, y, t, { n: 7, h: 900, r: 200, a: o.smoke ?? .12, drift: 300, sway: 120, col: '190,180,180' }); }] });
}
// lying Noah in the cave (wide)
function noahLying(c, t, x, o = {}) {
  // fur heap with Noah under a blanket, head on the left
  c.save(); c.beginPath(); c.ellipse(x + 120, -20, 300, 60, 0, Math.PI, 0); c.lineTo(x + 420, 0); c.lineTo(x - 180, 0); c.closePath(); c.clip(); furPatch(c, x - 200, -90, x + 440, 10, 9, ['#7a5a3c', '#4e3622', '#b08658'], { n: 1600, len: 14, lw: 2.2, dir: 1.3 }); c.restore();
  drawNoahHead(c, x - 40, -110, K, o.e || { eyes: 'closed', mouth: 'soft' }, -1.35 + (o.lift || 0));
  const br = Math.sin(t * 1.6) * 4;
  c.save(); c.beginPath(); c.moveTo(x + 10, -60); c.bezierCurveTo(x + 60, -150 - br, x + 300, -140 - br, x + 400, -50); c.lineTo(x + 410, -10); c.lineTo(x + 10, -10); c.closePath(); c.clip(); furPatch(c, x, -170, x + 420, 0, 19, ['#8a6440', '#5e4228', '#ab8458'], { n: 900, len: 14, lw: 2.4, dir: 1.4 }); c.restore();
  c.beginPath(); c.moveTo(x + 10, -60); c.bezierCurveTo(x + 60, -150 - br, x + 300, -140 - br, x + 400, -50); c.lineWidth = 3; c.strokeStyle = '#2a1a10'; c.stroke();
}
function dinoSil(c, x, y, s, a) { // cartoon dinosaur silhouette (joke), crossed out later
  c.save(); c.translate(x, y); c.scale(s, s); c.globalAlpha = a; c.fillStyle = '#4a7a3a'; c.strokeStyle = '#1a2a14'; c.lineWidth = 8;
  c.beginPath(); c.moveTo(-300, 0); c.quadraticCurveTo(-150, -140, 0, -160); c.quadraticCurveTo(80, -260, 90, -420); c.quadraticCurveTo(120, -470, 170, -440); c.quadraticCurveTo(200, -400, 140, -380); c.quadraticCurveTo(150, -200, 120, -100); c.quadraticCurveTo(140, 0, 100, 60); c.lineTo(80, 200); c.lineTo(40, 200); c.lineTo(40, 70); c.lineTo(-80, 70); c.lineTo(-90, 200); c.lineTo(-130, 200); c.lineTo(-130, 50); c.quadraticCurveTo(-250, 40, -300, 0); c.closePath(); c.fill(); c.stroke();
  for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(-120 + i * 40, -130 + i * 6 - (i > 3 ? 20 : 0)); c.lineTo(-100 + i * 40, -175 + i * 4); c.lineTo(-80 + i * 40, -128 + i * 6); c.fillStyle = '#c8a03a'; c.fill(); }
  circle(c, 150, -420, 8); c.fillStyle = '#fff'; c.fill(); c.restore();
}
function redX(c, x, y, s, k) { if (k <= 0) return; c.save(); c.translate(x, y); c.scale(s, s); const a = clamp(k * 2), b = clamp(k * 2 - 1); c.lineCap = 'round';
  for (const [x0, y0, x1, y1, kk] of [[-1, -1, 1, 1, a], [1, -1, -1, 1, b]]) if (kk > 0) { line(c, [x0 * 200, y0 * 200, x0 * 200 + (x1 - x0) * 200 * kk, y0 * 200 + (y1 - y0) * 200 * kk], 70, '#1a120d'); line(c, [x0 * 200, y0 * 200, x0 * 200 + (x1 - x0) * 200 * kk, y0 * 200 + (y1 - y0) * 200 * kk], 48, '#d23a2a'); }
  c.restore(); }
// a group of sleepers on fur heaps in the cave
const SLEEPERS = [[-1500, 'opa'], [-1260, 'frau2'], [-1000, 'kind1'], [-820, 'kind3'], [-560, 'mann1'], [-260, 'frau1'], [-60, 'baby'], [260, 'erzaehler'], [520, 'teen2'], [760, 'mann2'], [1010, 'kind2'], [1230, 'frau3']];
function sleepersRow(c, t, filter) { for (const [x, w] of SLEEPERS) { if (filter && !filter(w)) continue; c.save(); c.beginPath(); c.ellipse(x + 150, -12, 230, 40, 0, Math.PI, 0); c.closePath(); c.fillStyle = 'rgba(60,40,26,.8)'; c.fill(); c.restore(); sleeper(c, x, w, { breath: Math.sin(t * 1.5 + x) * 3, fur: rnd(x) > .5 ? FURC.brown : FURC.grey }); } }

// ======================= S1 HOOK =======================
const T_EYES = 1.45;
scene(0, t => {
  if (t < .72) { // flash: modern bedroom at night, phone glowing
    const cam = { x: -250 + t * 40, y: -330, z: 1.55 + t * .5 };
    const fr = roomFrame(t, cam, { tod: 'night', glow: 1, behind: [c => noahInBed(c, t, -300, { night: 1 })], after: [c => { const f = clamp((t - .5) / .22); if (f > 0) { c.fillStyle = `rgba(255,236,200,${f})`; c.fillRect(0, 0, W, H); } }] });
    return fr;
  }
  const lt = t;
  // white "time rip" flash decays into the cave close-up
  const flash = clamp(1 - (t - .72) / .45);
  const opening = seg(t, T_EYES, T_EYES + .5), bl = bump(t, 2.95, 3.17);
  const e = t < T_EYES ? { eyes: 'closed', mouth: 'soft' } : { eyes: 'open', lid: Math.max(1 - easeOut(opening), bl * .95), look: keys(t, [[3.25, 0], [3.5, -1], [3.95, -1], [4.2, 1], [4.65, 1], [4.9, .2], [6.2, .2], [6.5, -1], [7, -1], [7.3, 0]]), browUp: keys(t, [[2.2, 0], [2.7, .7], [4.2, .55], [5, .4]]), mouth: t > 3.3 && t < 4.4 ? 'o' : 'soft' };
  const fr = noahLyingECU(t, lt, { z: keys(t, [[.72, 6.6], [1.4, 6.3], [7.5, 4.6]]), e, ember: .35 + .65 * ease(seg(t, .8, 3.6)), after: [c => { if (flash > 0) { c.fillStyle = `rgba(255,240,215,${flash})`; c.fillRect(0, 0, W, H); } }] });
  return fr;
}, 0, 'S1 hook');
scene(S(2), t => emberCloseup(t, t - S(2), { k: .25, smoke: t > S(3) ? .2 + .1 * seg(t, S(3), S(3) + 1) : .08 }), .4, 'S1 embers');
scene(S(4), t => { // pull back: Noah lying on furs under the rock roof; wind outside
  const lt = t - S(4), cam = { x: lerp(-120, 150, ease(seg(lt, 0, 7))), y: lerp(-150, -330, ease(seg(lt, 0, 6))), z: lerp(2.9, 1.15, ease(seg(lt, 0, 6.5))) };
  return caveFrame(t, cam, { mouth: 760, fires: [{ x: 360, k: .22 }], ambient: '58,50,62', snowIn: 1,
    behind: [c => { hearth(c, 360, t, .22, 1); stoneTools(c, -700); woodPile(c, -1050); noahLying(c, t, 0, { e: EX(t, { look: -.4, browUp: .3, mouth: 'soft' }) }); }] });
}, .5, 'S1 pull back');
scene(S(6), t => { // tastet nach seinem Handy — Nichts.
  const lt = t - S(6), cam = { x: 40, y: -260, z: 2.1 };
  const pat = Math.sin(lt * 9) * .25;
  return caveFrame(t, cam, { mouth: 900, fires: [{ x: 420, k: .35 }], ambient: '60,52,64',
    behind: [c => { hearth(c, 420, t, .25, 1); noahLying(c, t, 0, { e: EX(t, { look: keys(lt, [[0, -1], [.5, 1], [1, -1], [1.5, .6]]), browUp: .8, mouth: lt > 1.4 ? 'o' : 'flat' }), lift: .1 });
      drawNoahHand(c, 90 + pat * 60, -150, K, -1.2 + pat); }],
    after: [c => phoneIconX(c, W * .72, H * .38, 1.5, seg(lt, .2, .6), seg(t, S(7), S(7) + .5))] });
}, .3, 'S1 phone');
scene(S(8), t => watchCloseup(t, t - S(8)), .35, 'S1 watch');
scene(S(9), t => { // ghost of his room, then back to the cave
  const lt = t - S(9), cam = { x: -200, y: -330, z: 1.4 + lt * .04 };
  return roomFrame(t, cam, { tod: 'morning', behind: [c => { c.save(); c.globalAlpha = .35; c.restore(); }], after: [c => { c.fillStyle = `rgba(20,14,10,${.35 + .4 * seg(lt, 1.4, 2.4)})`; c.fillRect(0, 0, W, H); }] });
}, .35, 'S1 room ghost');
scene(S(10), t => { // 15.000 years: counter card while the camera drifts to the bright cave mouth
  const lt = t - S(10), cam = { x: lerp(-200, 380, ease(seg(lt, 0, 6.6))), y: -300, z: lerp(1.25, 1.6, ease(seg(lt, 0, 6.6))) };
  const fr = caveFrame(t, cam, { mouth: 700, fires: [{ x: -300, k: .4 }], ambient: '62,54,66', snowIn: 1,
    behind: [c => { hearth(c, -300, t, .3, 1); noahLying(c, t, -700, { e: EX(t, { browUp: .9, mouth: 'o' }), lift: .25 }); woodPile(c, 300); }] });
  fr.screen.splice(fr.screen.length - 1, 0, c => cardZeitreise(c, t, tw('fünfzehntausend') - .2, S(11) - .1, 'bl'));
  return fr;
}, .45, 'S1 15000');
scene(S(11), t => { // fly out of the cave mouth: epic ice-age panorama at sunrise
  const lt = t - S(11), k = ease(seg(lt, 0, 2.4));
  const cam = { x: lerp(0, 600, k), y: lerp(-380, -520, k), z: lerp(1.6, .52, k) };
  return outFrame(t, cam, { tod: 'morning', snow: 50, wind: 2, setOpts: { sunX: .7, sunY: .46 },
    behind: [c => { rentier(c, 2400, { t, walk: t * 5, sc: .8, a: .9 }); rentier(c, 2700, { t, walk: t * 5 + 1, sc: .75 }); }],
    after: [c => { if (lt < .5) { c.fillStyle = `rgba(255,248,235,${1 - lt / .5})`; c.fillRect(0, 0, W, H); } }] });
}, .35, 'S1 eiszeit');

// ======================= S2 DINOSAURIER =======================
scene(S(12), t => {
  const lt = t - S(12), cam = { x: 0, y: -330, z: 1.35 };
  return outFrame(t, cam, { tod: 'morning', snow: 20,
    behind: [c => { const a = easeOut(seg(t, tw('dinosaurier') - .6, tw('dinosaurier'))); dinoSil(c, 420, -220, .55 * (.8 + .2 * a), a * .95 * (1 - seg(lt, 2.6, 3))); N(c, t, { x: -260, expr: EX(t, { look: 1, browUp: a, mouth: a > .5 ? 'o' : 'soft' }), arms: { r: { a: .5 + .3 * a, b: .4 } } }); }],
    after: [c => { const [x, y] = w2s(cam, 420, -350); redX(c, x, y, .9, seg(t, tw('dinosaurier') + .2, tw('dinosaurier') + .8) * (1 - seg(lt, 2.6, 3))); }] });
}, .4, 'S2 dino');
scene(S(13), t => { const lt = t - S(13), cam = { x: 200 + lt * 20, y: -420, z: .7 };
  const fr = outFrame(t, cam, { tod: 'morning', vig: .6, after: [c => { c.fillStyle = 'rgba(15,12,20,.35)'; c.fillRect(0, 0, W, H); }] });
  fr.screen.push(c => cardDinoTimeline(c, t, S(13) + .2, S(15) - .1)); return fr; }, .4, 'S2 timeline');
scene(S(15), t => { // dark, mysterious steppe; silhouettes flash on each name
  const lt = t - S(15), cam = { x: 0, y: -420, z: .62 + lt * .01 };
  const fl = [[S(16), 'm'], [S(17), 'r'], [S(18), 'l']];
  return outFrame(t, cam, { tod: 'night', grass: true, vig: .7,
    behind: [c => { for (const [t0, w] of fl) { const a = bump(t, t0 - .05, t0 + 1.4) * (t < S(19) + 1 ? 1 : 0); if (a <= 0) continue; const o = { t, dark: .96, darkCol: '12,10,18', a };
      if (w === 'm') mammut(c, -700, Object.assign({ walk: t * 3 }, o)); if (w === 'r') wollnashorn(c, 100, Object.assign({}, o)); if (w === 'l') loewe(c, 800, Object.assign({ crouch: .3 }, o)); } }],
    after: [c => { for (const [t0] of fl) { const f = bump(t, t0 - .05, t0 + .25); if (f > 0) { c.fillStyle = `rgba(200,215,255,${.45 * f})`; c.fillRect(0, 0, W, H); } } const d = seg(t, S(19), S(19) + 2); if (d > 0) { c.fillStyle = `rgba(0,0,0,${.4 * d})`; c.fillRect(0, 0, W, H); } }] });
}, .4, 'S2 silhouettes');

// ======================= S3 KALT / EUROPA =======================
scene(S(20), t => { // Noah sits up on the furs and shivers
  const lt = t - S(20), up = ease(seg(t, S(21), S(21) + .8)), cold = seg(t, S(21) + .6, S(21) + 1.2);
  const cam = { x: lerp(-60, 0, up), y: lerp(-170, -250, up), z: 1.9 };
  const sh = cold * Math.sin(t * 38) * .03;
  const e = EX(t, { browUp: .2 + .8 * cold, mouth: cold > .3 ? 'o' : 'soft', look: lt < 1.5 ? -1 : 0 });
  const [hx, hy] = noahHeadAt(0, -10, true);
  return caveFrame(t, cam, { mouth: 700, fires: [{ x: 420, k: .4 }], ambient: '66,64,84', snowIn: 1,
    behind: [c => { hearth(c, 420, t, .3, 1); c.save(); c.beginPath(); c.ellipse(0, -30, 330, 70, 0, Math.PI, 0); c.lineTo(330, 0); c.lineTo(-330, 0); c.closePath(); c.clip(); furPatch(c, -340, -110, 340, 10, 9, ['#7a5a3c', '#4e3622', '#b08658'], { n: 2400, len: 18, lw: 2.4, dir: 1.3 }); c.restore(); }],
    front: [c => { if (up < .5) noahLying(c, t, -150, { e }); else { N(c, t, { x: 0, y: -10, sit: true, seatH: 300, tilt: sh, expr: e, arms: cold > 0 ? { l: { a: -.35, b: -1.75 }, r: { a: -.35, b: -1.75 } } : undefined }); polish(c, t, hx, hy, e, { lx: .8, ly: .3 }); if (cold > 0) breathVapor(c, hx + 6, hy + 40, t, cold); } }] });
}, .45, 'S3 cold');
scene(S(22), t => { const lt = t - S(22), cam = { x: 300, y: -300, z: 1.1 + lt * .01 };
  const fr = caveFrame(t, cam, { mouth: 600, fires: [{ x: -500, k: .35 }], ambient: '40,40,60', snowIn: 1, behind: [c => { hearth(c, -500, t, .35, 1); }], vig: .65 });
  fr.screen.splice(fr.screen.length - 1, 0, c => { c.fillStyle = 'rgba(10,10,20,.35)'; c.fillRect(0, 0, W, H); cardEuropaEiszeit(c, t, S(22) + .3, S(24) - .1, tw('meeresspiegel') - .2); }); return fr; }, .4, 'S3 map');
scene(S(24), t => { const lt = t - S(24), cam = { x: lt * 60, y: -460, z: .55 };
  return outFrame(t, cam, { tod: 'morning', snow: t > S(25) ? 140 : 40, wind: t > S(25) ? 4 : 1.5, behind: [c => { for (let i = 0; i < 5; i++) rentier(c, 900 + i * 160, { t, walk: t * 5 + i, sc: .7, a: .9 }); }] }); }, .45, 'S3 steppe');

// ======================= S4 DIE GRUPPE =======================
scene(S(26), t => { const lt = t - S(26), cam = { x: lerp(-1300, 900, ease(seg(lt, 0, 12))), y: -200, z: 1.55 };
  const fr = caveFrame(t, cam, { mouth: 1500, fires: [{ x: -300, k: .45 }, { x: 700, k: .35 }], ambient: '60,54,66',
    behind: [c => { hearth(c, -300, t, .35, .9); hearth(c, 700, t, .25, .8); sleepersRow(c, t); }] });
  fr.screen.splice(fr.screen.length - 1, 0, c => cardMenschen(c, t, S(28) - .1, S(30)));
  return fr; }, .45, 'S4 sleepers');
scene(S(31), t => { const lt = t - S(31), cam = { x: -500 + lt * 30, y: -900, z: .3 };
  return outFrame(t, cam, { set: campSet, tod: 'day', setOpts: { rockX: -700 }, snow: 30, behind: [c => { hearth(c, -500, t, .7, 1.4); skinTent(c, 200, 1); hideOnStakes(c, 600); for (let i = 0; i < 6; i++) tribe(c, { who: ['frau1', 'mann1', 'kind1', 'oma', 'jaeger', 'kind2'][i], x: -900 + i * 180, k: .25 }, t); }],
    after: [c => { const [x, y] = w2s(cam, -500, -200); smokeWisp(c, x, y, t, { n: 6, h: 500, r: 60, a: .25, drift: 200 }); }] }); }, .45, 'S4 alone in the steppe');
scene(S(33), t => { const lt = t - S(33), cam = { x: 0, y: -300, z: 1.05 };
  const who = ['oma', 'kind2', 'mann1', 'frau1', 'kind1', 'erzaehler', 'malerin', 'jaeger', 'teen2', 'meister'];
  const fr = caveFrame(t, cam, { mouth: 1200, fires: [{ x: 0, k: .6 }],
    behind: [c => { hearth(c, 0, t, .5, 1); who.forEach((w, i) => { const x = -900 + i * 200 + (i > 4 ? 100 : 0); tribe(c, { who: w, x, k: .25, y: (i % 2) * 30, expr: EX(t, { seed: i, mouth: 'smile', look: x < 0 ? 1 : -1 }) }, t); }); }] });
  fr.screen.splice(fr.screen.length - 1, 0, c => cardVier(c, t, [tw('familie'), tw('team'), tw('versicherung'), tw('krankenhaus')], S(35) - .1)); return fr; }, .45, 'S4 family');
scene(S(35), t => { const lt = t - S(35), cam = { x: 0, y: -260, z: .9 - lt * .02 };
  return outFrame(t, cam, { tod: 'morning', snow: 220, wind: 5, vig: .7, behind: [c => { tribeSide(c, { who: 'mann2', x: lt * 30, walk: t * 5, armSwing: .2 }, t); }], after: [c => { c.fillStyle = 'rgba(230,236,245,.28)'; c.fillRect(0, 0, W, H); }] }); }, .4, 'S4 alone');

// ======================= S5 FEUER =======================
const T_ZACK = tw('zack');
scene(S(36), t => {
  const lt = t - S(36), k = t < T_ZACK ? .12 + .1 * seg(t, S(38), T_ZACK) : .3 + .7 * easeOut(seg(t, T_ZACK, T_ZACK + .6));
  const blow = t > S(38) + 1.2 && t < T_ZACK ? bump((t - S(38) - 1.2) % 1.6, 0, 1.2) : 0;
  const cam = { x: keys(t, [[S(36), -140], [S(38), -60], [T_ZACK, -60], [T_ZACK + 1.5, 80]]), y: keys(t, [[S(36), -200], [S(38), -150], [T_ZACK, -150], [T_ZACK + 1.5, -260]]), z: keys(t, [[S(36), 1.8], [S(38), 2.6], [T_ZACK, 2.6], [T_ZACK + 1.5, 1.4]]) };
  const [hx, hy] = noahHeadAt(430, -10, true), ne = EX(t, { look: -1, mouth: blow > .2 ? 'o' : k > .5 ? 'smile' : 'soft', browUp: k > .5 ? .6 : .2 });
  return caveFrame(t, cam, { mouth: 1100, fires: [{ x: 0, k }], ambient: t < T_ZACK + .3 ? '46,42,56' : '78,68,78',
    behind: [c => { hearth(c, 0, t, k, 1);
      if (t > S(38) && t < T_ZACK + .3) for (let i = 0; i < 8; i++) line(c, [-30 + i * 8, -16, -40 + i * 10, -50 - rnd(i) * 20], 3, '#d8b860');
      tribe(c, { who: 'oma', x: -230, pose: 'crouch', k: .25, expr: EX(t, { mouth: blow > .2 ? 'o' : 'smile', look: 1, seed: 2 }), arms: { r: { a: .9, b: .6 }, l: { a: .6, b: .8 } }, item: t > S(38) + 3 && t < T_ZACK ? { k: 'stick', rot: -1.2, dx: 0 } : null }, t); }],
    front: [c => { N(c, t, { x: 430, y: -10, sit: true, seatH: 300, expr: ne }); polish(c, t, hx, hy, ne, { lx: -.8, ly: .4 }); if (blow > .2) { for (const s of [-1, 1]) { ell(c, hx + s * 42, hy + 26, 18 * blow, 14 * blow); c.fillStyle = 'rgba(240,200,190,.6)'; c.fill(); } } }],
    after: [c => { const f = bump(t, T_ZACK, T_ZACK + .35); if (f > 0) { c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = `rgba(255,170,80,${.5 * f})`; c.fillRect(0, 0, W, H); c.restore(); } }] });
}, .45, 'S5 fire');
scene(S(39), t => { const lt = t - S(39);
  // 4 quick inserts: warmth, light, wild animals kept away, roasting
  return shots([
    [S(39), l => { const cam = { x: 0, y: -200, z: 1.7 }; return caveFrame(t, cam, { mouth: 1200, fires: [{ x: 0, k: 1 }], behind: [c => { hearth(c, 0, t, 1, 1); tribe(c, { who: 'kind1', x: -330, pose: 'sit', k: .25, expr: EX(t, { mouth: 'smile', eyes: 'closed' }), arms: { r: { a: 1.3, b: .1 }, l: { a: 1.3, b: .1 } } }, t); tribe(c, { who: 'opa', x: 330, pose: 'sit', k: .25, expr: EX(t, { mouth: 'smile', eyes: 'closed', seed: 2 }), arms: { r: { a: 1.3, b: .1 }, l: { a: 1.3, b: .1 } } }, t); }] }); }],
    [tw('licht') - .2, l => { const cam = { x: 0, y: -500, z: .9 }; return caveFrame(t, cam, { mouth: 1200, fires: [{ x: 0, k: 1, r: 1800 }], ambient: '60,50,56', behind: [c => { hearth(c, 0, t, 1, 1.2); sleepersRow(c, t, w => ['opa', 'frau2', 'kind1'].includes(w)); }] }); }],
    [tw('tiere', 1, S(40)) - .2, l => { const cam = { x: 0, y: -260, z: 1 }; return outFrame(t, cam, { set: campSet, tod: 'night', setOpts: { rockX: -1300 }, grass: false, behind: [c => { hearth(c, -400, t, 1, 1.2); wolf(c, 500 + l * 120, { t, s: 1, walk: t * 7, dark: .8, darkCol: '10,12,20' }); }], after: [c => { const [x, y] = w2s(cam, -400, -100); lightMap(c, '30,36,60', [{ x, y, r: 1100, col: '255,140,60', a: 1 }]); const [ex, ey] = w2s(cam, 500 + l * 120 + 165, -200); for (const d of [0, 14]) { circle(c, ex + d, ey, 4); c.fillStyle = 'rgba(255,220,120,.9)'; c.fill(); } }] }); }],
    [tw('essen') - .2, l => { const cam = { x: 0, y: -190, z: 2.2 }; return caveFrame(t, cam, { mouth: 1200, fires: [{ x: 0, k: 1 }], behind: [c => { hearth(c, 0, t, 1, 1); line(c, [-260, -250, 220, -150], 12, '#5a3a22'); c.save(); c.translate(-20, -200); c.rotate(.2); ell(c, 0, 0, 70, 40); c.fillStyle = '#8a3a26'; c.fill(); c.lineWidth = 5; c.strokeStyle = '#2a120a'; c.stroke(); ell(c, -10, -10, 40, 16); c.fillStyle = '#b0563a'; c.fill(); c.restore(); }], after: [c => { const [x, y] = w2s(cam, -20, -240); smokeWisp(c, x, y, t, { n: 5, h: 300, r: 40, a: .25 }); }] }); }],
  ], t);
}, .35, 'S5 fire is everything');
scene(S(41), t => { // flint against pyrite: macro with sparks
  const lt = t - S(41), strike = (tt) => { const p = (tt - S(42)) % 1.1; return p < 0 ? 0 : p; };
  const p = strike(t), hit = t > S(42) && p < .12;
  return { set: 'blank', setOpts: { color: '#120c0a' }, cam: { x: 0, y: 0, z: 1 }, vignette: 0,
    behind: [c => { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.translate(W / 2, H / 2 + 60);
      // left hand: pyrite nugget
      c.save(); c.translate(-120, 40); c.rotate(.2); line(c, [-700, 200, -60, 40], 230, '#1a120d'); line(c, [-700, 200, -60, 40], 210, PEOPLE.oma.coat[0]); c.beginPath(); c.ellipse(0, 0, 120, 90, 0, 0, Math.PI * 2); c.fillStyle = PEOPLE.oma.skin; c.fill(); c.lineWidth = 10; c.strokeStyle = '#1a120d'; c.stroke();
      c.beginPath(); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; c.lineTo(80 + Math.cos(a) * 70 * (.8 + rnd(i) * .3), -60 + Math.sin(a) * 60 * (.8 + rnd(i + 3) * .3)); } c.closePath(); const g = c.createLinearGradient(20, -120, 140, 0); g.addColorStop(0, '#e8d890'); g.addColorStop(1, '#8a7a40'); c.fillStyle = g; c.fill(); c.lineWidth = 6; c.strokeStyle = '#2a2010'; c.stroke(); c.restore();
      // right hand: flint, swinging down
      const sw = t > S(42) ? (p < .12 ? 0 : Math.min(1, (p - .12) / .5) * (p < .8 ? 1 : 1 - (p - .8) / .3)) : 1;
      c.save(); c.translate(160 + sw * 60, -60 - sw * 220); c.rotate(-.5 - sw * .4); line(c, [600, 200, 60, 40], 230, '#1a120d'); line(c, [600, 200, 60, 40], 210, PEOPLE.oma.coat[0]); c.beginPath(); c.ellipse(60, 30, 120, 90, 0, 0, Math.PI * 2); c.fillStyle = PEOPLE.oma.skin; c.fill(); c.lineWidth = 10; c.strokeStyle = '#1a120d'; c.stroke();
      c.beginPath(); c.moveTo(-60, -10); c.lineTo(10, -90); c.lineTo(70, -60); c.lineTo(40, 20); c.closePath(); c.fillStyle = '#6a6a7a'; c.fill(); c.lineWidth = 6; c.strokeStyle = '#1a1a22'; c.stroke(); c.restore();
      c.restore(); }],
    screen: [c => { lightMap(c, '50,40,46', [{ x: W / 2, y: H / 2, r: 1100, col: '255,170,100', a: .7 }]);
      if (t > S(42)) { const k = ((t - S(42)) % 1.1); if (k < .6) { c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 40; i++) { const a = -2.6 + rnd(i + Math.floor((t - S(42)) / 1.1) * 50) * 2.2, d = k * (200 + rnd(i) * 500) * (t > S(43) - .2 ? 1.5 : 1), x = W / 2 + 20 + Math.cos(a) * d, y = H / 2 - 20 + Math.sin(a) * d + k * k * 300; c.beginPath(); c.moveTo(x, y); c.lineTo(x - Math.cos(a) * 30, y - Math.sin(a) * 30); c.lineWidth = 4; c.strokeStyle = `rgba(255,${200 + rnd(i) * 55 | 0},120,${1 - k / .6})`; c.stroke(); } bloom(c, W / 2 + 20, H / 2 - 20, 300, '255,200,120', .8 * (1 - k / .6), 'lighter'); c.restore(); } }
      finish(c, t, { vig: .65 }); }] };
}, .35, 'S5 pyrite');
scene(S(44), t => { // keep the embers alive — and the old woman gives Noah a fur cape
  const lt = t - S(44), cam = { x: 150, y: -280, z: 1.55 }, throwK = ease(seg(t, ERA_CAPE - .8, ERA_CAPE)), [hx, hy] = noahHeadAt(320, 0, false);
  const ne = EX(t, { look: -1, mouth: t > ERA_CAPE + .2 ? 'smile' : 'soft', browUp: t > ERA_CAPE ? .5 : 0 });
  return caveFrame(t, cam, { mouth: 1200, fires: [{ x: -260, k: .9 }],
    behind: [c => { hearth(c, -260, t, .9, 1); }],
    front: [c => { tribe(c, { who: 'oma', x: 0, k: .25, expr: EX(t, { mouth: 'smile', look: 1, seed: 4 }), arms: { r: { a: .4 + 1.6 * bump(t, ERA_CAPE - 1, ERA_CAPE + .2), b: .3 } } }, t);
      N(c, t, { x: 320, expr: ne });
      if (throwK > 0 && throwK < 1) { c.save(); const x = lerp(80, 320, throwK), y = lerp(-280, -230, throwK) - Math.sin(throwK * Math.PI) * 120; c.translate(x, y); c.rotate(throwK * 1.2); ell(c, 0, 0, 90, 45); c.fillStyle = ERA.cape; c.fill(); c.lineWidth = 4; c.strokeStyle = '#2a1a10'; c.stroke(); c.restore(); }
      polish(c, t, hx, hy, ne, { lx: -.8, ly: .3 }); }],
    after: [c => polishLit(c, cam, t, hx, hy, ne, { lx: -.8, ly: .3, gdx: -8, gdy: 2 })] });
}, .4, 'S5 cape');

// ======================= S6 WIE WIR =======================
scene(S(46), t => { const lt = t - S(46);
  const faces = ['jaeger', 'malerin', 'erzaehler', 'frau1', 'meister', 'kind2'];
  return shots([
    [S(46), l => { const cam = { x: 0, y: -300, z: 1.25 }; return caveFrame(t, cam, { mouth: 1300, fires: [{ x: -100, k: .9 }], behind: [c => { hearth(c, -100, t, .9, .9); faces.forEach((w, i) => tribe(c, { who: w, x: -820 + i * 230 + (i > 2 ? 260 : 0), k: .25, expr: EX(t, { seed: i, mouth: 'smile', look: 0 }) }, t)); }], front: [c => NS(c, t, { x: 650, s: -1, walk: null, expr: EX(t, { browUp: .5 }) })] }); }],
    [S(48) - .2, l => { const cam = { x: 0, y: -310, z: 3.2 - l * .08 }; return caveFrame(t, cam, { mouth: 1300, fires: [{ x: 300, k: .9 }], behind: [c => { tribe(c, { who: 'jaeger', x: 0, k: .25, expr: EX(t, { mouth: 'smile' }) }, t); }] }); }],
  ], t);
}, .45, 'S6 faces');
function subwayFrame(t, lt) { // flash fantasy: one of the hunters in jeans and hoodie on the U-Bahn
  const cam = { x: 0, y: -300, z: 1.3 };
  const guy = Object.assign({}, PEOPLE.jaeger, { coat: ['#4a5a7a', '#2e3a54', '#7a8aa8'], fur: ['#4a5a7a', '#3a4a64', '#6a7a98'], beads: null, ochre: 0 });
  return { set: (c, cm) => { c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#c8ccd0'; c.fillRect(0, 0, W, H); layer(c, cm, 1, c => {
      c.fillStyle = '#dfe3e6'; c.fillRect(-2000, -900, 4000, 700); for (let i = -3; i <= 3; i++) { rrect(c, i * 520 - 200, -820, 400, 280, 30); c.fillStyle = '#2a3442'; c.fill(); const sx = ((lt * 1800 + i * 300) % 400) - 200; c.fillStyle = 'rgba(255,240,200,.5)'; c.fillRect(i * 520 - 200 + 200 + sx, -760, 30, 160); }
      c.fillStyle = '#8a94a0'; c.fillRect(-2000, -200, 4000, 220); rrect(c, -1600, -330, 3200, 140, 20); c.fillStyle = '#3a6a9a'; c.fill(); for (let i = -6; i <= 6; i++) line(c, [i * 260, -900, i * 260, -330], 10, '#b0b8c0'); line(c, [-2000, -880, 2000, -880], 14, '#9aa2aa');
      c.fillStyle = '#5a6068'; c.fillRect(-2000, 20, 4000, 600); }); return { base: '#5a6068' }; },
    cam, vignette: 0,
    behind: [c => { tribe(c, { who: guy, x: 0, pose: 'sit', k: .25, expr: EX(t, { mouth: 'soft', look: .4 }), item: null }, t); tribe(c, { who: 'frau2', x: -420, pose: 'sit', k: .25, expr: EX(t, { seed: 3, look: -.5 }) }, t); drawItemPhone(c, -360, -470); }],
    screen: [c => { grade(c, { warm: '255,245,230', warmA: .15, cool: '40,60,90', coolA: .15 }); finish(c, t, { vig: .4 }); }] };
}
function drawItemPhone(c, x, y) { rrect(c, x - 24, y - 40, 48, 80, 8); c.fillStyle = '#1a1a20'; c.fill(); rrect(c, x - 18, y - 34, 36, 64, 4); c.fillStyle = '#7ab0e8'; c.fill(); }
scene(S(49), t => { const lt = t - S(49); const fr = subwayFrame(t, lt); fr.screen.unshift(c => { const f = bump(lt, 0, .35); if (f) { c.fillStyle = `rgba(255,255,255,${f})`; c.fillRect(0, 0, W, H); } }); return fr; }, 0, 'S6 U-Bahn');
scene(S(50), t => { const lt = t - S(50), cam = { x: 0, y: -330, z: 1.15 };
  const who = ['malerin', 'jaeger', 'kind1', 'erzaehler', 'frau3'];
  const laugh = t > S(51) + 2;
  const fr = caveFrame(t, cam, { mouth: 1300, fires: [{ x: 0, k: .9 }], behind: [c => { hearth(c, 0, t, .9, .9); who.forEach((w, i) => tribe(c, { who: w, x: [-760, -480, 330, 560, 820][i], k: .25, expr: EX(t, { seed: i, mouth: laugh ? 'laugh' : 'smile', eyes: laugh && i % 2 ? 'closed' : 'open' }), bob: laugh ? Math.abs(Math.sin(t * 10 + i)) * -20 : 0 }, t)); }] });
  fr.screen.splice(fr.screen.length - 1, 0, c => keywordCard(c, t, tw('sapiens') - .4, tw('sapiens') + 3.4, 'Homo sapiens', 'moderne Menschen – wie du', 'tl', 760)); return fr; }, 0, 'S6 sapiens');

// ======================= S7 KLEIDUNG =======================
scene(S(53), t => { const lt = t - S(53), cam = { x: 0, y: -280, z: 1.4 };
  return outFrame(t, cam, { set: campSet, tod: 'morning', setOpts: { rockX: -1500 }, snow: 10,
    behind: [c => { const film = t < S(55) + .3; if (film) { drawNoah(c, { x: -200, k: K, ink: INK, outfit: 'caveman', expr: { beard: 1, wild: 1, mouth: 'flat' } }); } tribe(c, { who: 'malerin', x: 260, k: .25, expr: EX(t, { mouth: 'smile', look: -1 }), arms: { l: { a: .5, b: .5 } } }, t); }],
    after: [c => { const [x, y] = w2s(cam, -200, -200); redX(c, x, y, .6, seg(t, tw('lumpen') - .1, tw('lumpen') + .5) * (t < S(55) + .3 ? 1 : 0)); }] });
}, .45, 'S7 lumpen');
scene(S(55), t => { // tailored leather & fur: Noah gets the full kit (era 2 at ERA_FULL)
  const lt = t - S(55), cam = { x: 120, y: -300, z: 1.35 }, [hx, hy] = noahHeadAt(320, 0, false), e = EX(t, { mouth: 'smile', look: -.6, browUp: .3 });
  return caveFrame(t, cam, { mouth: 1300, fires: [{ x: -120, k: .9 }], behind: [c => { hearth(c, -120, t, .9, .9); }],
    front: [c => { tribe(c, { who: 'frau1', x: -320, k: .25, expr: EX(t, { mouth: 'smile', look: 1 }), arms: { r: { a: .7, b: .5 } } }, t); tribe(c, { who: 'mann1', x: 40, k: .25, expr: EX(t, { seed: 3, mouth: 'smile', look: 1 }) }, t); N(c, t, { x: 320, expr: e, arms: { l: { a: .3, b: .2 }, r: { a: .3 + .2 * Math.sin(lt * 2), b: .3 } } }); polish(c, t, hx, hy, e, { lx: -.8, ly: .3 });
      const pk = bump(t, ERA_FULL - .5, ERA_FULL + .4); if (pk > 0) { c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2; circle(c, 320 + Math.cos(a) * 160 * pk, -220 + Math.sin(a) * 220 * pk, 6); c.fillStyle = `rgba(255,220,150,${pk})`; c.fill(); } c.restore(); } }] });
}, .45, 'S7 kleidung');
scene(S(56), t => { // macro: bone needle with an eye, sinew thread, stitching leather
  const lt = t - S(56), pull = (lt * .8) % 1;
  return { set: 'blank', setOpts: { color: '#2a1c12' }, cam: { x: 0, y: 0, z: 1 }, vignette: 0,
    behind: [c => { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.translate(W / 2, H / 2); c.scale(1 + lt * .015, 1 + lt * .015);
      // two leather pieces
      for (const [y0, col] of [[-40, '#9a6a40'], [40, '#8a5a34']]) { c.beginPath(); c.moveTo(-1100, y0 - 200); c.lineTo(1100, y0 - 220); c.lineTo(1100, y0 + 200); c.lineTo(-1100, y0 + 220); c.closePath(); c.fillStyle = col; c.fill(); }
      furPatch(c, -1100, -300, 1100, 300, 3, ['rgba(0,0,0,0)', 'rgba(60,36,20,.25)', 'rgba(220,180,130,.15)'], { n: 600, len: 30, lw: 2, dir: 0 });
      line(c, [-1100, 0, 1100, 0], 6, '#5a3a20');
      // stitches already done
      for (let i = 0; i < 9; i++) { const x = -900 + i * 120; c.save(); c.setLineDash([]); line(c, [x, -40, x + 60, 40], 12, '#d8c8a0'); c.restore(); }
      // needle + sinew
      const nx = 300 + pull * 200, ny = -60 + pull * 80;
      c.save(); c.translate(nx, ny); c.rotate(.5); rrect(c, -340, -16, 680, 32, 16); const g = c.createLinearGradient(0, -16, 0, 16); g.addColorStop(0, '#f4ecd8'); g.addColorStop(1, '#b8a888'); c.fillStyle = g; c.fill(); c.lineWidth = 6; c.strokeStyle = '#3a2a1a'; c.stroke();
      c.beginPath(); c.moveTo(340, -16); c.lineTo(420, 0); c.lineTo(340, 16); c.closePath(); c.fill(); c.stroke();
      ell(c, -280, 0, 26, 8); c.fillStyle = '#2a1c12'; c.fill(); c.restore();
      c.beginPath(); c.moveTo(nx - 280 * Math.cos(.5), ny - 280 * Math.sin(.5)); c.bezierCurveTo(nx - 500, ny - 400, -300, -500, -900, -300); c.lineWidth = 10; c.strokeStyle = '#e6d6b0'; c.stroke();
      c.restore(); }],
    screen: [c => { lightMap(c, '70,56,50', [{ x: W * .7, y: H * .2, r: 1600, col: '255,190,120', a: .85 }]); finish(c, t, { vig: .6 });
      infoCard(c, t, { t0: tw('nadeln') - .2, t1: S(57) + .6, corner: 'tl', w: 640, h: 230, title: 'Knochennadel', sub: 'mit Öhr – Faden aus Tiersehnen' }); }] };
}, .4, 'S7 needle');
scene(S(58), t => { // macro: shell beads and a tooth necklace
  const lt = t - S(58);
  return { set: 'blank', setOpts: { color: '#3a2618' }, cam: { x: 0, y: 0, z: 1 }, vignette: 0,
    behind: [c => { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); furPatch(c, 0, 0, W, H, 8, ['#7a5636', '#5a3c24', '#9a7650'], { n: 1400, len: 30, lw: 3, dir: 1 }); c.translate(W / 2 + lt * 10, H / 2 - 60); c.rotate(-.1);
      c.beginPath(); c.moveTo(-800, -100); c.quadraticCurveTo(0, 500, 800, -100); c.lineWidth = 10; c.strokeStyle = '#3a2618'; c.stroke();
      for (let i = 0; i < 15; i++) { const u = i / 14, x = -760 + u * 1520, y = -100 + 4 * 300 * u * (1 - u) * 1.0; c.save(); c.translate(x, y); c.rotate((u - .5) * -1.2);
        if (i % 3 === 1) { c.beginPath(); c.moveTo(-26, -20); c.quadraticCurveTo(0, 150, 26, -20); c.closePath(); const g = c.createLinearGradient(0, -20, 0, 140); g.addColorStop(0, '#f4ecd6'); g.addColorStop(1, '#c8b890'); c.fillStyle = g; c.fill(); c.lineWidth = 5; c.strokeStyle = '#3a2a1a'; c.stroke(); }
        else { ell(c, 0, 20, 40, 48); const g = c.createRadialGradient(-10, 0, 4, 0, 20, 50); g.addColorStop(0, '#fffaf0'); g.addColorStop(1, '#d8cbb0'); c.fillStyle = g; c.fill(); c.lineWidth = 5; c.strokeStyle = '#3a2a1a'; c.stroke(); for (let r = 0; r < 4; r++) line(c, [-26 + r * 16, 0, -20 + r * 13, 56], 2, '#b0a080'); circle(c, 0, -6, 7); c.fillStyle = '#3a2618'; c.fill(); }
        c.restore(); }
      c.restore(); }],
    screen: [c => { lightMap(c, '80,64,56', [{ x: W * .3, y: H * .2, r: 1600, col: '255,200,140', a: .8 }]); finish(c, t, { vig: .55 }); }] };
}, .4, 'S7 beads');

// ======================= S8 SAMMELN =======================
scene(S(60), t => { const lt = t - S(60), cam = { x: lerp(-200, 300, ease(seg(lt, 0, 10))), y: -330, z: 1.05 };
  const walkers = [['frau1', 0], ['kind1', -220], ['oma', -440], ['junge', -620]];
  return outFrame(t, cam, { set: campSet, tod: 'morning', setOpts: { rockX: -1400 }, snow: 15,
    behind: [c => { hideOnStakes(c, -300); meatRack(c, 100); woodPile(c, -700); skinTent(c, 1300, .9); bones(c, 500); hearth(c, -900, t, .5, 1); }],
    front: [c => { const go = seg(t, S(63), S(63) + 6); walkers.forEach(([w, dx], i) => tribeSide(c, { who: w, x: -400 + dx + go * 900, walk: go > 0 && go < 1 ? t * 8 + i : null, item: w === 'frau1' ? { k: 'stick', rot: .3 } : null, expr: EX(t, { seed: i }) }, t));
      NS(c, t, { x: -650 + go * 900, walk: go > 0 && go < 1 ? t * 8 : null, expr: EX(t, { browUp: .3 }) });
      breathVapor(c, -560 + go * 900, -330, t, .8); }] });
}, .45, 'S8 leave camp');
scene(S(64), t => { const lt = t - S(64), cam = { x: lt * 150, y: -320, z: 1.2 };
  return outFrame(t, cam, { set: forestEdge, tod: 'morning', grass: false,
    front: [c => { [['frau1', 300], ['junge', 120]].forEach(([w, dx], i) => tribeSide(c, { who: w, x: lt * 150 + dx, walk: t * 8 + i }, t)); NS(c, t, { x: lt * 150 - 120, walk: t * 8, expr: EX(t, { browUp: .2 }) }); breathVapor(c, lt * 150 - 50, -330, t, 1);
      for (let i = 0; i < 10; i++) { const fx = lt * 150 - 160 - i * 60; ell(c, fx, 6, 14, 5); c.fillStyle = 'rgba(255,255,255,.4)'; c.fill(); } }],
    after: [c => { layer(c, cam, 1, c => sunRays(c, cam.x + 900, -1300, { n: 8, len: 2600, spread: .5, dir: Math.PI / 2 + .45, alpha: .2, t })); }] });
}, .45, 'S8 frosty walk');
scene(S(65), t => { const lt = t - S(65);
  return shots([
    [S(65), l => { const cam = { x: 0, y: -260, z: 1.6 }; return outFrame(t, cam, { set: forestEdge, tod: 'morning', grass: false, behind: [c => blueberryBush(c, 60, 20, 1.6, seg(l, .5, 2.5))], front: [c => tribe(c, { who: 'frau1', x: -150, k: .25, pose: 'crouch', arms: { r: { a: .9 + .2 * Math.sin(l * 5), b: .3 } }, expr: EX(t, { mouth: 'smile', look: 1 }), item: 'berries' }, t)] }); }],
    [tw('wurzeln') - .2, l => { const cam = { x: 0, y: -240, z: 1.6 }; return outFrame(t, cam, { set: forestEdge, tod: 'morning', grass: false, front: [c => { tribe(c, { who: 'oma', x: 0, k: .25, pose: 'crouch', arms: { r: { a: .6 + .3 * Math.abs(Math.sin(l * 4)), b: .6 } }, item: { k: 'stick', rot: 2.6 }, expr: EX(t, { mouth: 'smile' }) }, t); for (let i = 0; i < 6; i++) { const lx = 180 + i * 14; line(c, [lx, -10, lx + 20, -60], 6, '#7a5a3a'); } ell(c, 60, 4, 90, 16); c.fillStyle = '#4a3a28'; c.fill(); }] }); }],
    [tw('vogeleier') - .3, l => { const cam = { x: 0, y: -260, z: 2 }; return outFrame(t, cam, { set: forestEdge, tod: 'morning', grass: false, front: [c => { ell(c, 120, -10, 90, 34); c.fillStyle = '#6a5030'; c.fill(); for (let i = 0; i < 30; i++) line(c, [40 + rnd(i) * 160, -10 - rnd(i + 1) * 30, 60 + rnd(i + 2) * 120, -20], 3, '#a08050'); for (const ex of [90, 130]) { c.save(); c.translate(ex, -24); ITEMS.egg(c); c.restore(); } tribe(c, { who: 'kind2', x: -120, k: .25, expr: EX(t, { mouth: 'o', browUp: .8, look: 1 }), arms: { r: { a: .6, b: .4 } } }, t); }] }); }],
  ], t);
}, .4, 'S8 gathering');
scene(S(66), t => { const lt = t - S(66), cam = { x: lt * 260, y: -500, z: .6 };
  const fr = outFrame(t, cam, { tod: 'day', snow: 10,
    front: [c => { for (let i = 0; i < 5; i++) tribeSide(c, { who: ['frau1', 'junge', 'oma', 'kind1', 'mann2'][i], x: lt * 260 - 400 + i * 150, walk: t * 8 + i }, t); NS(c, t, { x: lt * 260 - 600, walk: t * 8 }); }] });
  fr.screen.splice(fr.screen.length - 1, 0, c => cardKm(c, t, tw('zehn') - .3, S(70) + 1.5)); return fr; }, .45, 'S8 walking');

// ======================= S9 PILZ =======================
const T_GIFT = S(73);
scene(S(71), t => { const lt = t - S(71), cam = { x: 40, y: -250, z: keys(t, [[S(71), 1.5], [S(72), 1.9], [T_GIFT, 2.4]]) };
  const reach = ease(seg(t, S(72), S(72) + 1.2)) * (1 - ease(seg(t, T_GIFT + .6, T_GIFT + 1.6))), grab = seg(t, S(72) + 1.6, S(72) + 2.0);
  const pale = seg(t, T_GIFT, T_GIFT + .4), [hx, hy] = noahHeadAt(-60, 0, false);
  const ne = EX(t, { look: 1, browUp: .3 + pale * .7, mouth: pale > .2 ? 'o' : 'smile', lid: 0 });
  return outFrame(t, cam, { set: forestEdge, tod: 'morning', grass: false,
    behind: [c => { mushroom(c, 140, 10, 1.4, true); mushroom(c, 230, 20, 1, true); fern(c, 300, 20, .6, 3); }],
    front: [c => { N(c, t, { x: -60, expr: ne, arms: { r: { a: .5 + reach * .9, b: -.2 - reach * .3 } }, tilt: pale * Math.sin(t * 30) * .02 });
      if (pale > 0) { c.save(); c.globalAlpha = .45 * pale; circle(c, hx, hy, 62); c.fillStyle = '#b8e0c8'; c.fill(); c.restore(); c.save(); c.globalAlpha = pale; ell(c, hx + 50, hy - 30, 6, 10); c.fillStyle = '#8ac8f0'; c.fill(); c.restore(); }
      else polish(c, t, hx, hy, ne, { lx: .8, ly: -.4 });
      tribe(c, { who: 'junge', x: -330 + grab * 120, k: .25, expr: EX(t, { frown: grab, mouth: grab > .5 ? 'frown' : 'soft', look: 1 }), arms: { r: { a: .4 + grab * 1.1, b: .2 } }, tilt: grab > .9 && t < T_GIFT + 1 ? Math.sin(t * 16) * .14 : 0 }, t); }],
    after: [c => infoCard(c, t, { t0: T_GIFT - .1, t1: T_GIFT + 2.6, corner: 'tr', w: 460, h: 160, title: 'Giftig!' })] });
}, .45, 'S9 mushroom');
scene(S(74), t => { const lt = t - S(74), cam = { x: lerp(-260, 260, ease(seg(lt, 0, 20))), y: -280, z: keys(lt, [[0, 1.6], [8, 1.25], [20, 1.5]]) };
  return outFrame(t, cam, { set: forestEdge, tod: 'morning', grass: false,
    behind: [c => { fern(c, -40, 20, .7, 2); blueberryBush(c, 120, 20, 1.2); mushroom(c, 260, 20, .9, false); }],
    front: [c => { tribe(c, { who: 'opa', x: -300, k: .25, pose: 'crouch', expr: EX(t, { mouth: 'talk', open: .3 + .3 * Math.abs(Math.sin(t * 7)), look: 1 }), arms: { r: { a: 1.2, b: .1 } } }, t);
      ['kind1', 'kind2', 'kind3'].forEach((w, i) => tribe(c, { who: w, x: 320 + i * 150, k: .25, expr: EX(t, { seed: i, mouth: 'o', browUp: .5, look: -1 }) }, t)); }] });
}, .45, 'S9 knowledge');

// ======================= S10 KLINGE =======================
scene(S(82), t => { const lt = t - S(82), cam = { x: 0, y: -260, z: 1.4 + lt * .03 };
  return outFrame(t, cam, { set: campSet, tod: 'day', setOpts: { rockX: -1500 }, grass: true,
    behind: [c => { rock(c, 0, 0, 90, 4, '#7a746c'); hideOnStakes(c, 700); }],
    front: [c => tribe(c, { who: 'meister', x: 0, pose: 'sit', k: .25, expr: EX(t, { look: .5, mouth: 'flat' }), arms: { l: { a: .7, b: 1.2 }, r: { a: .9, b: 1.0 } }, item: 'antler', item2: 'flint' }, t)] });
}, .45, 'S10 craftsman');
function knapClose(t, lt) {
  const hits = [tw('klack', 1), tw('klack', 2)], split = S(87) + .5;
  let sw = 1; for (const h of hits) { const d = t - h; if (d > -.35 && d < .25) sw = d < 0 ? 1 - ease((d + .35) / .35) : ease(d / .25) * .7; }
  if (t > hits[1] + .25) sw = .7;
  return { set: 'blank', setOpts: { color: '#2a2018' }, cam: { x: 0, y: 0, z: 1 }, vignette: 0,
    behind: [c => { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); furPatch(c, 0, 0, W, H, 12, ['#5a4632', '#3e2e20', '#7a6046'], { n: 1200, len: 40, lw: 4, dir: .3 }); c.translate(W / 2, H / 2 + 80);
      // flint core in the left hand
      c.save(); c.translate(-80, 60); line(c, [-900, 300, -100, 60], 240, '#1a120d'); line(c, [-900, 300, -100, 60], 220, PEOPLE.meister.coat[0]); c.beginPath(); c.ellipse(-60, 40, 140, 100, 0, 0, Math.PI * 2); c.fillStyle = PEOPLE.meister.skin; c.fill(); c.lineWidth = 10; c.strokeStyle = '#1a120d'; c.stroke();
      c.beginPath(); c.moveTo(-80, -120); c.lineTo(120, -160); c.lineTo(220, -60); c.lineTo(160, 60); c.lineTo(-40, 40); c.closePath(); const g = c.createLinearGradient(-80, -160, 220, 60); g.addColorStop(0, '#9a9aaa'); g.addColorStop(1, '#4a4a5a'); c.fillStyle = g; c.fill(); c.lineWidth = 8; c.strokeStyle = '#1a1a22'; c.stroke();
      for (let i = 0; i < 5; i++) { c.beginPath(); c.arc(40 + i * 30, -60 + i * 10, 40, -1, .5); c.lineWidth = 3; c.strokeStyle = 'rgba(220,220,240,.4)'; c.stroke(); }
      // the long thin blade splitting off
      const sp = easeOut(seg(t, split, split + .6)); c.save(); c.translate(160 + sp * 160, -40 - sp * 60); c.rotate(.15 + sp * .5); c.beginPath(); c.moveTo(-200, -6); c.lineTo(170, -14); c.lineTo(200, 0); c.lineTo(170, 14); c.lineTo(-200, 8); c.closePath(); const bg = c.createLinearGradient(0, -14, 0, 14); bg.addColorStop(0, '#d0d0e0'); bg.addColorStop(1, '#6a6a7a'); c.fillStyle = bg; c.fill(); c.lineWidth = 5; c.strokeStyle = '#1a1a22'; c.stroke(); if (sp > .9) { c.save(); c.globalCompositeOperation = 'lighter'; const gl = (t * .8) % 1; line(c, [-200 + gl * 400, -4, -160 + gl * 400, -6], 8, 'rgba(255,255,255,.7)'); c.restore(); } c.restore();
      c.restore();
      // antler hammer in the right hand
      c.save(); c.translate(260 + sw * 120, -120 - sw * 260); c.rotate(-.9 - sw * .5); line(c, [500, 300, 80, 40], 240, '#1a120d'); line(c, [500, 300, 80, 40], 220, PEOPLE.meister.coat[0]); c.beginPath(); c.ellipse(60, 30, 130, 95, 0, 0, Math.PI * 2); c.fillStyle = PEOPLE.meister.skin; c.fill(); c.lineWidth = 10; c.strokeStyle = '#1a120d'; c.stroke();
      line(c, [60, 30, -260, -60], 60, '#1a120d'); line(c, [60, 30, -260, -60], 44, '#d8c8a8'); line(c, [-120, -20, -170, -130], 30, '#1a120d'); line(c, [-120, -20, -170, -130], 18, '#d8c8a8'); c.restore();
      c.restore(); }],
    screen: [c => { lightMap(c, '90,80,76', [{ x: W * .6, y: H * .1, r: 1700, col: '255,236,200', a: .8 }]);
      for (const h of hits) { const k = t - h; if (k > 0 && k < .7) { c.save(); for (let i = 0; i < 16; i++) { const a = -2.4 + rnd(i + h) * 1.8, d = k * (300 + rnd(i) * 500), x = W / 2 + 200 + Math.cos(a) * d, y = H / 2 - 40 + Math.sin(a) * d + k * k * 900; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 10 + rnd(i) * 14, y - 8); c.lineTo(x + 6, y + 10); c.closePath(); c.fillStyle = `rgba(150,150,170,${1 - k / .7})`; c.fill(); } bloom(c, W / 2 + 200, H / 2 - 40, 200, '255,255,255', .6 * (1 - k / .3), 'lighter'); c.restore(); } }
      finish(c, t, { vig: .55 }); }] };
}
scene(S(84), t => knapClose(t, t - S(84)), .3, 'S10 klack');
scene(S(89), t => { // Noah tries — cuts his finger — the others laugh
  const lt = t - S(89), cut = tw('finger') - .1, hurt = seg(t, cut, cut + .2), cam = { x: lerp(0, 120, ease(seg(t, cut, cut + .4))), y: -270, z: keys(t, [[S(89), 1.35], [cut, 1.7], [S(91), 1.15]]) };
  const [hx, hy] = noahHeadAt(150, 0, true, 260), shake = hurt * (t < S(91) + 1.5 ? Math.sin(t * 30) * .5 : 0), laugh = t > S(91);
  const ne = EX(t, { eyes: hurt && t < S(91) ? 'closed' : 'open', mouth: hurt ? (t > S(92) ? 'smile' : 'o') : 'flat', browUp: hurt ? .9 : .2, look: -1 });
  return outFrame(t, cam, { set: campSet, tod: 'day', setOpts: { rockX: -1600 }, grass: true,
    behind: [c => { rock(c, 150, 0, 80, 5, '#7a746c'); rock(c, -300, 0, 90, 4, '#7a746c'); if (laugh) ['junge', 'frau1', 'mann1'].forEach((w, i) => tribe(c, { who: w, x: 520 + i * 200, k: .25, expr: EX(t, { seed: i, mouth: 'laugh', eyes: i % 2 ? 'closed' : 'open' }), bob: Math.abs(Math.sin(t * 11 + i)) * -24, arms: { r: { a: .9, b: 1.4 } } }, t)); }],
    front: [c => { tribe(c, { who: 'meister', x: -300, pose: 'sit', k: .25, expr: EX(t, { mouth: laugh ? 'laugh' : 'smile', look: 1 }), bob: laugh ? Math.abs(Math.sin(t * 9)) * -18 : 0 }, t);
      const swingK = seg(t, S(90) + 1.6, cut); N(c, t, { x: 150, y: 0, sit: true, seatH: 260, expr: ne, arms: { l: { a: .5, b: 1 }, r: hurt ? { a: .6 + shake, b: 1.6 } : { a: .5 + 1.2 * Math.sin(swingK * Math.PI), b: .8 } }, tilt: t > S(92) ? -.12 : 0 });
      polish(c, t, hx, hy, ne, { lx: .8, ly: -.4 });
      if (t > S(92)) { const sx = hx - 70, sy = hy - 60; drawNoahHand(c, sx, sy, K, 2.6 + Math.sin(t * 12) * .3); } }],
    after: [c => { if (hurt > 0 && t < S(91)) { const [x, y] = w2s(cam, 280, -330); c.save(); c.globalAlpha = 1 - seg(t, cut + .6, cut + 1.2); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; line(c, [x + Math.cos(a) * 30, y + Math.sin(a) * 30, x + Math.cos(a) * 60, y + Math.sin(a) * 60], 6, '#ffe070'); } c.restore(); } }] });
}, .4, 'S10 cut');

// ======================= S11 WERKZEUG / SPEERSCHLEUDER =======================
scene(S(93), t => { const lt = t - S(93);
  return { set: 'blank', setOpts: { color: '#5a4230' }, cam: { x: 0, y: 0, z: 1 }, vignette: 0,
    behind: [c => { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#8a6a48'; c.fillRect(0, 0, W, H); furPatch(c, 0, 0, W, H, 4, ['#8a6a48', '#6a4e32', '#a8885e'], { n: 900, len: 26, lw: 3, dir: 0 });
      const tools = [['messer', tw('messer')], ['schaber', tw('schaber')], ['bohrer', tw('bohrer')], ['spitze', tw('speerspitzen')]];
      tools.forEach(([k, t0], i) => { const a = easeBack(clamp(seg(t, t0 - .2, t0 + .25))); if (a <= 0) return; c.save(); c.translate(360 + i * 400, H / 2); c.scale(a * 1.6, a * 1.6); c.rotate(-.3);
        const st = (pts) => { c.beginPath(); pts.forEach((p, j) => j ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.closePath(); const g = c.createLinearGradient(-60, -60, 60, 60); g.addColorStop(0, '#b8b8c8'); g.addColorStop(1, '#5a5a6a'); c.fillStyle = g; c.fill(); c.lineWidth = 4; c.strokeStyle = '#1a1a22'; c.stroke(); };
        if (k === 'messer') { st([[-110, -8], [100, -14], [124, 0], [100, 12], [-110, 10]]); rrect(c, -170, -14, 80, 28, 10); c.fillStyle = '#6a4a2a'; c.fill(); c.stroke(); }
        if (k === 'schaber') st([[-50, -40], [50, -46], [64, 20], [0, 50], [-60, 20]]);
        if (k === 'bohrer') st([[-14, -90], [14, -90], [18, 30], [0, 100], [-18, 30]]);
        if (k === 'spitze') st([[0, -100], [36, 0], [20, 80], [-20, 80], [-36, 0]]);
        c.restore(); });
      c.restore(); }],
    screen: [c => { lightMap(c, '110,96,90', [{ x: W * .5, y: H * .1, r: 1600, col: '255,226,180', a: .7 }]); finish(c, t, { vig: .55 }); }] };
}, .4, 'S11 tools');
scene(S(94), t => { // hunter demonstrates the spear thrower in the steppe
  const lt = t - S(94), cam = { x: 400, y: -360, z: .9 };
  const thr = S(96) + 1.6, p = seg(t, thr - 1, thr), fly = seg(t, thr, thr + 2.2);
  const fr = outFrame(t, cam, { tod: 'day',
    front: [c => { tribeSide(c, { who: 'jaeger', x: -100, armsSide: { nearA: lerp(-2.4, .9, ease(p)), nearB: lerp(.4, -.2, p), farA: .6, farB: .4 }, item: fly <= 0 ? { k: 'thrower', rot: 0 } : { k: 'thrower', rot: .2 } }, t);
      if (fly > 0) { const x = lerp(0, 1500, fly), y = -560 - Math.sin(fly * Math.PI) * 320; c.save(); c.translate(x, y); c.rotate(-.35 + fly * .7); line(c, [-220, 0, 220, 0], 12, '#1a120d'); line(c, [-220, 0, 220, 0], 7, '#9a6a3c'); c.beginPath(); c.moveTo(220, -10); c.lineTo(270, 0); c.lineTo(220, 10); c.closePath(); c.fillStyle = '#b8b2a8'; c.fill(); c.restore(); }
      else { c.save(); c.translate(-100, -760 + p * 300); c.rotate(-1.6 + p * 1.3); line(c, [-200, 0, 240, 0], 12, '#1a120d'); line(c, [-200, 0, 240, 0], 7, '#9a6a3c'); c.restore(); }
      NS(c, t, { x: -420, walk: null, expr: EX(t, { browUp: fly > 0 ? 1 : .3, mouth: fly > 0 ? 'o' : 'soft' }) }); }] });
  fr.screen.splice(fr.screen.length - 1, 0, c => cardSpeerschleuder(c, t, tw('speerschleuder') - .3, S(98) - .2));
  return fr;
}, .45, 'S11 thrower');
scene(S(98), t => { const lt = t - S(98), cam = { x: 0, y: -300, z: 1.2 };
  return outFrame(t, cam, { set: campSet, tod: 'day', setOpts: { rockX: -1500 },
    behind: [c => { hideOnStakes(c, 700); woodPile(c, -600); }],
    front: [c => { ['jaeger', 'mann1', 'mann3', 'teen2'].forEach((w, i) => tribe(c, { who: w, x: -520 + i * 280, k: .25, item: { k: 'spear', rot: .02 }, arms: { r: { a: .5, b: -.2 } }, expr: EX(t, { seed: i, mouth: 'flat', frown: .3 }) }, t)); }] });
}, .45, 'S11 hunters gear up');
