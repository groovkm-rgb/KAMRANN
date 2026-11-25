// "Die Mauer fiel aus Versehen" — vertical Short (1080x1920, 30 fps), 45,87 s = 1376 frames, cut to the voice-over.
// Word times (VO): Versehen 4.28 · 9. November 5.46 · Pressekonferenz 7.96 · Zettel 10.80 · reisen 12.92 · ab wann 15.12
// blättert 16.58 · sofort 19.70 · unverzüglich 20.48 · Problem 21.86 · Morgen 24.38 · Zettel 26.78 · Grenze 29.84
// Tor auf 31.28 · Befehl 33.40 · halb zwölf 34.50 · Schlagbaum 37.14 · 28 Jahre 38.24 · drei Worten 40.54 · losgerannt 42.64
const DUR_TOTAL = 1376 / 30;
const NX = 0; // Noah's spot in the press hall
const faceCam = (z) => ({ x: NX, y: -310, z });
const FLASH_A = [[.04, -420, -420, .9], [.95, 380, -470, .8], [1.65, -150, -520, .7], [2.9, 520, -430, .8], [3.75, -380, -380, .9], [4.6, 200, -500, .7]];

// Noah standing in the press hall among journalists (reverse view)
function hallA(t, cam, noah, o = {}) {
  const neigh = (c) => {
    // same-row journalists slightly behind Noah
    const row = [['j2', -300, { main: { pose: 'hold', item: (c2) => itemPad(c2) }, look: [.2, 0] }], ['j3', 290, { s: -1, main: { pose: 'up', item: (c2) => itemMic(c2, { color: '#c23a2a' }) }, mouth: 'o' }],
      ['j6', -560, { main: { pose: 'hold', item: (c2, oo, tt) => itemFlashCam(c2, tt, false) } }], ['j5', 560, { s: -1, main: 'chest' }]];
    for (const [w, x, oo] of row) person(c, t, P(w, x, Object.assign({ y: sDepth(.9), sc: PSC * .9, off: 'front' }, oo)));
  };
  const seated = (c) => {
    const row = [['j7', -430, { main: { pose: 'hold', item: (c2) => itemPad(c2) }, look: [.3, -.2] }], ['j1', -215, { main: { pose: 'up', item: (c2) => itemMic(c2, { color: '#2a4a8a' }) }, mouth: 'o', look: [.2, -.3] }],
      ['j8', 235, { s: -1, main: 'chin', look: [.3, -.2] }], ['j4', 460, { s: -1, main: { pose: 'hold', item: (c2, oo, tt) => itemFlashCam(c2, tt, false) }, look: [0, -.2] }]];
    for (const [w, x, oo] of row) person(c, t, P(w, x, Object.assign({ y: sDepth(1.18), sc: PSC * 1.18, sit: 1, off: 'front' }, oo)));
  };
  const fg = (c) => layer(c, cam, 1.3, c => {
    // near foreground: the podium table edge seen from behind (felt, papers, mic stands, water glass)
    const ty = 250;
    c.beginPath(); c.rect(-3000, ty, 6000, 2000); fs(c, '#3e5a48', 6);
    c.fillStyle = 'rgba(255,255,255,.07)'; for (let i = 0; i < 30; i++) c.fillRect(-3000 + i * 200, ty + 10, 90, 2000);
    c.beginPath(); c.rect(-3000, ty - 18, 6000, 26); fs(c, '#4e6e58', 5);
    for (const [x, r] of [[-520, -.08], [380, .1]]) { c.save(); c.translate(x, ty + 70); c.rotate(r); c.beginPath(); c.rect(-120, -60, 240, 150); fs(c, '#f4f1e6', 4); for (let i = 0; i < 6; i++) line(c, [-90, -36 + i * 20, 80 - (i % 2) * 40, -36 + i * 20], 4, '#8a8a92'); c.restore(); }
    for (const [dx, col, a] of [[-330, '#3a3a40', -.2], [-250, '#c23a2a', -.1], [210, '#2a4a8a', .12], [300, '#e8e4d8', .22]]) standMic(c, NX + dx, ty - 6, 1.25, col, .8, a);
    c.beginPath(); c.moveTo(560, ty - 120); c.lineTo(620, ty - 120); c.lineTo(612, ty); c.lineTo(568, ty); c.closePath(); fs(c, 'rgba(200,225,240,.7)', 4);
  });
  return { set: pressHallA, setOpts: { lights: 1 }, cam, blur: 0, vignette: .25,
    behind: [neigh, c => castShadow(c, NX, 120, { alpha: .25, dir: -1, len: .6 })],
    front: [c => drawNoahP(c, Object.assign({ x: NX, y: 0 }, noah)), seated, ...(o.fg === false ? [] : [fg])],
    screen: [c => pressLightA(c, cam, t, { flashes: FLASH_A }), ...(o.screen || [])] };
}

// placeholder for shots not yet built (stills phase)
const todo = (label) => ({ dur: 0, f(lt, T, t) { return { set: 'blank', setOpts: { color: '#333' }, cam: { x: 0, y: -400, z: 1 }, screen: [c => { c.setTransform(1, 0, 0, 1, 0, 0); c.font = mkFont(48); c.fillStyle = '#fff'; c.textAlign = 'center'; c.fillText(label, 540, 960); }] }; } });

const SHOTS = [
  // S1 0.0–2.3: press hall, camera rushes into Noah's face, flash
  { name: 'S1 Noah im Pressesaal', end: 2.3, f(lt, T, t) {
    const k = easeOut(seg(lt, 0, 1.0));
    const cam = CAM.mix({ x: NX + 30, y: -250, z: 1.45 }, { x: NX, y: -300, z: 3.4 }, k);
    cam.z += lt * .08;
    const noah = { expr: { mouth: lt < 1.3 ? 'soft' : 'smile', look: Math.sin(lt * 2) * .3, browUp: .3 + .3 * bump(lt, .9, 1.4), lid: bump(lt, .95, 1.1) > .5 ? 1 : 0 } };
    return Object.assign(hallA(t, cam, noah), { flash: .55 * (1 - seg(lt, .04, .2)) * (lt > .04 ? 1 : 0) });
  } },
  { ...todo('S2 Mauer, Tag'), end: 3.7 },
  // S2b 3.7–5.4: Noah close-up — "AUS VERSEHEN?!"
  { name: 'S2b aus Versehen', end: 5.4, f(lt, T, t) {
    const cam = faceCam(3.5 + lt * .12);
    const noah = { expr: { mouth: lt < .15 ? 'smile' : 'o', browUp: 1, lid: 0, look: 0 }, tilt: -.05 * ease(seg(lt, .1, .4)) };
    return hallA(t, cam, noah, { fg: false, screen: [c => word(c, t, { t0: 3.85, t1: 5.35, text: 'AUS\nVERSEHEN?!', x: 490, y: 440, size: 118, mark: 'circle', seed: 1 })] });
  } },
  { ...todo('S3 18:53 Uhr'), end: 6.9 },
  { ...todo('S4 Sprecher + Zettel'), end: 9.6 },
  { ...todo('S5 Zettel Nahaufnahme'), end: 11.7 },
  { ...todo('S7 Noah lehnt sich vor'), end: 13.8 },
  { ...todo('S6 Ab wann?'), end: 15.9 },
  { ...todo('S8 Sprecher blättert'), end: 18.4 },
  // S9 18.4–21.6 SLOW: push into Noah's face, shock on "sofort" (19.70)
  { name: 'S9 SOFORT (langsam)', end: 21.6, f(lt, T, t) {
    const k = ease(seg(lt, 0, T));
    const cam = faceCam(lerp(3.0, 5.6, k)); cam.y = lerp(-300, -318, k);
    const hit = t >= 19.68, after = seg(t, 19.68, 19.9);
    const noah = { expr: hit ? { mouth: 'o', lid: 0, browUp: 1, look: 0 } : { mouth: 'flat', lid: .15, browUp: .2, look: Math.sin(lt * 1.5) * .25 },
      bob: hit ? -10 * bump(t, 19.68, 19.95) : 0 };
    const st = hallA(t, cam, noah, { fg: false, screen: [
      c => { // slow-moment darkening + tunnel vignette
        c.setTransform(1, 0, 0, 1, 0, 0); const g = c.createRadialGradient(540, 900, 300, 540, 900, 1100);
        g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(10,8,20,${.35 + .3 * k})`); c.fillStyle = g; c.fillRect(0, 0, W, H); },
      c => word(c, t, { t0: 19.72, t1: 21.5, text: 'SOFORT.', x: 490, y: 430, size: 150, col: MK.paper, mark: 'double', seed: 3, rot: -.06 })] });
    st.flash = hit ? .35 * (1 - after) : 0;
    st.behind.push(c => { // cold backlight halo + rays behind the head (the moment freezes)
      bloom(c, NX + 30, -360, 360, '235,245,255', .55 + .35 * after); sunRays(c, NX + 30, -420, { n: 9, len: 900, spread: 2.6, dir: -Math.PI / 2, color: '235,245,255', alpha: .16 + .14 * after, t }); });
    return st;
  } },
  { ...todo('S10a Das Problem'), end: 23.0 },
  { ...todo('S10b Sperrfrist'), end: 25.4 },
  { ...todo('S11 Schulterzucken'), end: 27.2 },
  { ...todo('S12 Strasse, Treppe'), end: 28.8 },
  { ...todo('S13 Menge von oben'), end: 30.4 },
  { ...todo('S14a Tor auf'), end: 31.2 },
  { ...todo('S14b Faeuste'), end: 32.3 },
  { ...todo('S15 Kein Befehl'), end: 34.2 },
  { ...todo('S16 23:30'), end: 35.1 },
  // S17 35.1–38.3 SLOW: the barrier rises; one second of silence after it opens
  { name: 'S17 Schlagbaum (langsam)', end: 38.3, f(lt, T, t) {
    BN.HZ = -150; // low camera: nearer heads stand higher than farther ones
    const up = ease(seg(t, 35.5, 37.45)), k = ease(seg(lt, 0, T));
    // low angle; the camera rises with the arm, then holds in the silence
    const cam = { x: 30, y: lerp(-300, -470, k), z: lerp(2.1, 1.9, k) };
    const nx = 40, ns = 1, ny = bDepth(ns), joy = seg(t, 37.3, 37.8);
    const noah = (c) => drawNoahP(c, { x: nx, y: ny, k: .25 * ns, expr: joy > 0 ? { mouth: joy > .5 ? 'smile' : 'o', browUp: 1, lid: 0, look: 0 } : { mouth: up > .2 ? 'o' : 'flat', browUp: .5 + .5 * up, lid: 0, look: -.6 + .4 * up }, tilt: -.03 * up,
      arms: joy > 0 ? { l: { a: .13 + 2.2 * joy, b: .3 }, r: { a: .13 + 2.2 * joy, b: .3 } } : undefined });
    const rows = (c) => {
      crowdRow(c, t, bDepth(.62), .62, -600, 800, 51, { cheer: joy * .8 });
      crowdRow(c, t, bDepth(.76), .76, -560, 700, 61, { cheer: joy * .7 });
      crowdRow(c, t, bDepth(.88), .88, -560, 640, 67, { cheer: joy * .6 });
      crowdRow(c, t, bDepth(1), 1, -560, -120, 71, { cheer: joy * .6 });
      noah(c); steamPuff(c, nx + 30, ny - 290 * ns, t + .4, ns * .8);
      crowdRow(c, t, bDepth(1), 1, 220, 640, 81, { cheer: joy * .6 });
    };
    return { set: borderNight, setOpts: { crowd: 1, cheer: joy * .6, hutX: -1150, towerX: -260, masts: [-900, 260, 950] }, cam, blur: 0, vignette: .35,
      behind: [rows], front: [c => barrier(c, -390, -up * 1.38)],
      screen: [c => borderLight(c, cam, t)] };
  } },
  { ...todo('S18 Bruecke, Noah rennt'), end: 39.5 },
  { ...todo('S19 Westen, Sekt'), end: 40.4 },
  { ...todo('S20 3 Worte'), end: 41.7 },
  { ...todo('S21 Waerst du losgerannt?'), end: 43.7 },
  { ...todo('S22 zurueck ins Licht'), end: DUR_TOTAL },
];
let _prev = 0;
for (const s of SHOTS) { s.dur = +(s.end - _prev).toFixed(4); _prev = s.end; }
NOAH_FONTS_READY.then(() => defineFilm({ fadeIn: 0, fadeOut: 0, shots: SHOTS }));
