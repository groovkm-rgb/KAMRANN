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
    for (const [w, x, oo] of row) person(c, t, P(w, x, Object.assign({ y: sDepth(.9), sc: PSC * .9, off: 'front' }, oo, (o.row || {})[w] || {})));
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
    front: [c => drawNoahP(c, Object.assign({ x: NX, y: 0 }, noah)), ...(o.seated === false ? [] : [seated]), ...(o.fg === false ? [] : [fg])],
    screen: [c => pressLightA(c, cam, t, { flashes: FLASH_A }), ...(o.screen || [])] };
}

// podium view with Noah over-the-shoulder (side profile, near foreground) and journalists' backs
function hallB(t, cam, o = {}) {
  const p = 1.25, zp = 1 + (cam.z - 1) * p;
  const near = (c) => layer(c, cam, p, c => {
    const cx = cam.x * p, cy = cam.y * p, hw = 540 / zp;
    journalistBack(c, cx + hw * .7, cy + 900 / zp, .5, '#4a5a7a', '#5a3b26', { hand: o.hand ? -1 : 0, lift: o.hand || 0, mic: '#c23a2a' });
    journalistBack(c, cx - hw * .05, cy + 1000 / zp, .45, '#7a6a52', '#2b2326', { mic: o.mic2 ? '#2a4a8a' : null });
    if (o.noah !== false) { const kN = .25 * 1.5, nx = cx - hw * .62, ny = cy + 260 / zp + 310 * kN * 2.2;
      drawNoahSideP(c, Object.assign({ x: nx, y: ny, k: kN, s: 1, walk: null, expr: { mouth: 'soft', browUp: .3 } }, o.noahP || {})); }
  });
  return { set: pressHallB, setOpts: { spokes: o.spokes }, cam, blur: 0, vignette: .28,
    front: [near], screen: [c => pressLightB(c, cam, t, { flashes: o.flashes || [] }), ...(o.screen || [])] };
}
const spk = (lt, o) => o; // readability helper
const paperItem = (rot = 0) => (c2) => { c2.save(); c2.rotate(rot); itemPaper(c2); c2.restore(); };
function fistArm(c, x, y, len, pump, sleeve) {
  // a raised arm with a fist, seen from below (world space), pump 0..1
  const ty = y - len - pump * 120;
  line(c, [x, y, x + 20, ty + 60], 120, OUT); line(c, [x, y, x + 20, ty + 60], 104, sleeve);
  c.beginPath(); c.roundRect(x - 56 + 20, ty - 50, 112, 120, 40); fs(c, '#f6dcae', 9);
  for (let i = 0; i < 3; i++) line(c, [x - 30 + 20 + i * 28, ty - 44, x - 30 + 20 + i * 28, ty - 10], 6);
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
  // S2 2.3–3.7: daylight, people dancing on the wall (tilt down)
  { name: 'S2 Mauer, Tag', end: 3.7, f(lt, T, t) {
    const k = ease(seg(lt, 0, T));
    const cam = { x: lerp(-120, 60, k), y: lerp(-1450, -520, k), z: 1.5 };
    return { set: wallDay, cam, blur: 0, vignette: .2,
      behind: [c => { crowdRow(c, t, -850, .95, -900, 900, 7, { cheer: 1, steam: false }); }],
      front: [c => {
        crowdRow(c, t, 0, 1.05, -900, -150, 17, { cheer: .7, steam: false });
        // chiseller with a hammer (Mauerspecht)
        const hk = Math.abs(Math.sin(t * 9)); person(c, t, P('c7', 120, { sc: PSC * 1.05, s: -1, look: [1, -.3], mouth: 'grit', main: { from: 'hold', to: 'up', k: hk, item: (c2) => { line(c2, [0, 20, 0, -90], 12, '#7a5a3a'); c2.beginPath(); c2.rect(-30, -120, 60, 34); fs(c2, '#5a5a62', 5); } }, off: 'hold' }));
        crowdRow(c, t, 0, 1.05, 380, 1000, 27, { cheer: .7, steam: false });
      }] };
  } },
  // S2b 3.7–5.4: Noah close-up — "AUS VERSEHEN?!"
  { name: 'S2b aus Versehen', end: 5.4, f(lt, T, t) {
    const cam = faceCam(3.5 + lt * .12);
    const noah = { expr: { mouth: lt < .15 ? 'smile' : 'o', browUp: 1, lid: 0, look: 0 }, tilt: -.05 * ease(seg(lt, .1, .4)) };
    return hallA(t, cam, noah, { fg: false, screen: [c => word(c, t, { t0: 3.85, t1: 5.35, text: 'AUS\nVERSEHEN?!', x: 490, y: 440, size: 118, mark: 'circle', seed: 1 })] });
  } },
  // S3 5.4–6.9: 80s TV clock graphic (no logo), word "18:53"
  { name: 'S3 18:53', end: 6.9, f(lt, T, t) {
    const k = easeOut(seg(lt, 0, T));
    const cam = { x: -90, y: lerp(-640, -735, k), z: lerp(1.25, 1.6, k) };
    return { set: tvRoom, cam, blur: 0, vignette: .45,
      screen: [c => word(c, t, { t0: 5.5, t1: 6.85, text: '18:53', x: 470, y: 1190, size: 190, mark: 'underline', seed: 2, col: '#ffe36a' })] };
  } },
  // S4 6.9–9.6: the spokesman pulls a paper out of his jacket; Noah watches over the shoulder
  { name: 'S4 Sprecher zieht Zettel', end: 9.6, f(lt, T, t) {
    const k = ease(seg(lt, 0, T));
    const cam = { x: lerp(-40, 0, k), y: lerp(-320, -280, k), z: lerp(1.9, 2.35, k) };
    const a = ease(seg(t, 7.3, 7.8)), b = ease(seg(t, 8.1, 8.6));
    const main = b > 0 ? { from: 'chest', to: 'hold', k: b, item: paperItem(-.1) } : { from: 'front', to: 'chest', k: a, item: a > .9 ? paperItem(-.6) : null };
    return hallB(t, cam, { spokes: { main, look: b > .5 ? [.2, .6] : [0, .2], talk: t > 7.9 && t < 9.4 ? .6 : 0, mouth: 'flat', lid: .2 },
      noahP: { expr: { mouth: 'soft', browUp: .4 + .4 * b, look: .3 } }, flashes: [[7.0, -500, -420, .8], [8.35, 520, -380, .7], [9.2, -300, -520, .6]] });
  } },
  // S5 9.6–11.7: from the spokesman's glasses (Noah reflected) down to the paper
  { name: 'S5 Brille + Zettel', end: 11.7, f(lt, T, t) {
    const k = ease(seg(lt, .35, 1.6));
    const cam = { x: 0, y: lerp(-1450, 120, k), z: lerp(1.05, .95, k) };
    return { set: paperSet, cam, blur: 0, vignette: .35,
      behind: [c => {
        paperSheet(c, 0, 200, 980, 1300, { rot: -.04 + Math.sin(t * 1.3) * .01 });
        for (const sx of [-1, 1]) { ell(c, sx * 470, 520, 90, 120, sx * .4); fs(c, '#fbe6cf', 8); for (let i = 0; i < 3; i++) line(c, [sx * 430, 450 + i * 40, sx * 380, 440 + i * 40], 8); }
        glassesCU(c, 0, -1450, 1, t, { look: .2 * Math.sin(t * 2), lid: .25 });
      }], screen: [c => pressLightB(c, cam, t, { flashes: [[10.4, 300, -1300, 2]] })] };
  } },
  // S7 11.7–13.8: "Die DDR-Bürger dürfen reisen" — Noah leans in, curious
  { name: 'S7 Noah lehnt sich vor', end: 13.8, f(lt, T, t) {
    const lean = ease(seg(t, 12.0, 12.5)), joy = seg(t, 12.85, 13.1);
    const cam = faceCam(lerp(2.4, 3.3, lean)); cam.y = lerp(-290, -300, lean);
    const noah = { expr: { mouth: joy > 0 ? 'smile' : 'soft', browUp: .3 + .7 * lean, look: 0, lid: 0 }, bob: 16 * lean, tilt: .06 * lean };
    return hallA(t, cam, noah, { fg: false });
  } },
  // S6 13.8–15.9: a journalist raises his hand, a mic reaches out — "Ab wann?"
  { name: 'S6 Ab wann', end: 15.9, f(lt, T, t) {
    const raise = ease(seg(t, 13.95, 14.35)), ask = t > 15.08 && t < 15.6;
    const cam = { x: lerp(150, 180, lt / T), y: -280, z: lerp(2.6, 2.85, lt / T) };
    const noah = { expr: { mouth: 'soft', browUp: .5, look: .8 } };
    const st = hallA(t, cam, noah, { fg: false, seated: false, row: { j3: { main: { from: 'down', to: 'up', k: raise, item: (c2) => itemMic(c2, { color: '#c23a2a' }) }, talk: ask ? .9 : 0, mouth: 'flat', up: .5 + .5 * raise, look: [1, .1] } },
      screen: [c => word(c, t, { t0: 15.12, t1: 15.85, text: 'Ab wann?', x: 470, y: 430, size: 140, mark: 'underline', seed: 4 })] });
    const reach = easeOut(seg(t, 14.4, 15.2));
    st.front.push(c => layer(c, cam, 1.35, c => { // second microphone pushed towards the podium (= us)
      const zp = 1 + (cam.z - 1) * 1.35, x = cam.x * 1.35 + lerp(-330, -230, reach) / zp, y = cam.y * 1.35 + lerp(1050, 640, reach) / zp;
      line(c, [x - 60, y + 500, x, y + 60], 46, OUT); line(c, [x - 60, y + 500, x, y + 60], 32, '#4a5a7a');
      c.save(); c.translate(x, y + 60); c.rotate(.35); c.scale(1.2, 1.2); itemMic(c, { color: '#2a4a8a' }); c.restore(); circle(c, x - 10, y + 80, 34); fs(c, '#f6dcae', 7); }));
    return st;
  } },
  // S8 15.9–18.4: the spokesman leafs through his papers, unsure
  { name: 'S8 Sprecher blaettert', end: 18.4, f(lt, T, t) {
    const cam = { x: 10, y: -275, z: lerp(2.9, 3.3, lt / T) };
    const flip = Math.sin(t * 9) * .5 * (t > 16.4 && t < 17.3 ? 1 : .3);
    return Object.assign(hallB(t, cam, { noah: false, hand: bump(t, 16.0, 17.0), spokes: {
      main: { pose: 'hold', dy: -30 + flip * 20, item: paperItem(flip), ang: flip * .4 }, off: { pose: 'hold', dy: 10, item: paperItem(-.3 - flip * .3) },
      look: t > 17.3 ? [Math.sin(t * 3) * .6, -.1] : [0, .7], worry: t > 17.2 ? 1 : .4, mouth: t > 17.3 ? 'wobble' : 'flat', sweat: seg(t, 17.3, 18.4), blush: .3 },
      flashes: [[16.2, -350, -400, .7], [17.0, 380, -460, .7], [17.9, -100, -560, .6]] }), { shake: 3 });
  } },
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
  // S10a 21.6–23.0: "Das Problem?" — the moment freezes into a press photo
  { name: 'S10a Freeze', end: 23.0, f(lt, T, t) {
    const tf = Math.min(t, 21.72), fr = ease(seg(t, 21.72, 22.1));
    const cam = { x: 0, y: -300, z: 1.55 + .15 * ease(seg(lt, 0, T)) };
    const st = hallB(tf, cam, { noah: false, hand: 1, mic2: true, spokes: { main: { pose: 'hold', item: paperItem(.2) }, off: 'front', look: [0, -.2], mouth: 'o', up: 1 }, flashes: [[21.62, 200, -420, 1.4]] });
    st.screen.push(c => { // desaturate + photo border + slight tilt
      c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'saturation'; c.fillStyle = `rgba(128,128,128,${.85 * fr})`; c.fillRect(0, 0, W, H);
      c.globalCompositeOperation = 'source-over'; c.fillStyle = `rgba(255,240,210,${.12 * fr})`; c.fillRect(0, 0, W, H);
      const b = 46 * fr; c.lineWidth = b * 2; c.strokeStyle = '#f8f4ea'; c.strokeRect(0, 0, W, H); });
    st.cam.rot = -.03 * fr; st.flash = .8 * (1 - seg(t, 21.6, 21.85));
    return st;
  } },
  // S10b 23.0–25.4: red marker strikes a line on the paper — "Sperrfrist: 4 Uhr"
  { name: 'S10b Sperrfrist', end: 25.4, f(lt, T, t) {
    const cam = { x: 0, y: lerp(80, 40, lt / T), z: lerp(1.15, 1.25, lt / T) };
    const lk = ease(seg(t, 23.15, 23.6));
    return { set: paperSet, cam, blur: 0, vignette: .4,
      behind: [c => { paperSheet(c, 0, 120, 980, 1300, { rot: -.02, hiRow: 6 });
        // marker pen moving along the line
        markerStroke(c, [[-400, -122], [-100, -128], [200, -118], [410, -126]], lk, 22, MK.red, 9);
        const px = lerp(-400, 410, lk), py = -150; c.save(); c.translate(px + 40, py - 120); c.rotate(.6); c.beginPath(); c.roundRect(-26, -200, 52, 230, 14); fs(c, '#d8302a', 7); c.beginPath(); c.moveTo(-20, 30); c.lineTo(20, 30); c.lineTo(0, 70); c.closePath(); fs(c, '#e8e0d0', 6); c.restore(); }],
      screen: [c => word(c, t, { t0: 23.75, t1: 25.35, text: 'Sperrfrist:\n4 Uhr', x: 480, y: 1180, size: 118, col: MK.red, mark: 'box', markCol: '#1d1618', seed: 6, rot: -.07 })] };
  } },
  // S11 25.4–27.2: "Aber das stand nicht auf seinem Zettel." — Noah shrugs at the camera
  { name: 'S11 Schulterzucken', end: 27.2, f(lt, T, t) {
    const sh = ease(seg(t, 25.75, 26.15)) * (1 - ease(seg(t, 26.9, 27.15)));
    const cam = faceCam(2.15 + lt * .06); cam.y = -250;
    const noah = { expr: { mouth: 'flat', browUp: .3 + .7 * sh, look: 0 }, tilt: .08 * sh, bob: -8 * sh,
      arms: { l: { a: .13 + .25 * sh, b: -.08 + 1.75 * sh, hand: -.3 * sh }, r: { a: .13 + .25 * sh, b: -.08 + 1.75 * sh, hand: -.3 * sh } } };
    return hallA(t, cam, noah, { fg: false });
  } },
  // S12 27.2–28.8: evening street; windows open, people run; Noah hurries down the stoop
  { name: 'S12 Strasse', end: 28.8, f(lt, T, t) {
    const pr = clamp(lt / 1.0), nx = lerp(-60, 300, pr), step = Math.min(4, Math.floor(pr * 5)), ny = pr < 1 ? -150 + step * 37 : 0;
    const cam = { x: lerp(40, 260, ease(clamp(lt / T))), y: -230, z: 1.6 };
    return { set: eastStreet, setOpts: { doorX: -150, doorOpen: true, open: 1, openT: 27.1, lamps: [-1100, 1350] }, cam, blur: 0, vignette: .35,
      behind: [c => { for (let i = 0; i < 4; i++) { c.beginPath(); c.rect(-330 + i * 0, -150 + i * 37, 420 + i * 70, 37); fs(c, i % 2 ? '#8a8276' : '#9a9286', 4); } trabant(c, 980, 250, .9, '#a7b8a0', { night: true }); trabant(c, -900, 260, -.9, '#d8c89a', { night: true }); }],
      front: [c => { drawNoahSideP(c, { x: nx, y: ny, s: 1, walk: lt * 13, armSwing: .7, lean: .08, expr: { mouth: 'o', browUp: .8 } });
        for (let i = 0; i < 4; i++) walker(c, t, CROWD[(i * 3) % 8], ((lt * 520 + i * 520) % 2200) - 800, 300 + (i % 2) * 60, 1, 1.1, { speed: 13, ph: i }); }],
      screen: [c => grade(c, { sx: .8, sy: .3, warm: '255,190,100', warmA: .25, cool: '20,30,90', coolA: .3 })] };
  } },
  // S13 28.8–30.4: from above — the crowd streams to the border past abandoned cars
  { name: 'S13 Von oben', end: 30.4, f(lt, T, t) {
    const cam = { x: lerp(-80, 40, lt / T), y: -600 - t * 200 + 5760, z: lerp(.5, .58, lt / T), rot: lerp(.12, .05, lt / T) };
    return { set: topDown, setOpts: { noah: [60, 6000 - 340] }, cam, blur: 0, vignette: .45, screen: [c => grade(c, { sx: .5, sy: 0, warm: '255,190,100', warmA: .25, cool: '20,30,90', coolA: .35 })] };
  } },
  // S14a 30.4–31.2: at the gate the crowd starts to chant; Noah with them
  { name: 'S14a Sprechchor', end: 31.2, f(lt, T, t) {
    BN.HZ = -330; const beat = Math.abs(Math.sin(t * Math.PI * 2.2));
    const cam = { x: 20, y: -330, z: 2.3 + lt * .2 };
    const noah = (c) => drawNoahP(c, { x: 0, y: 0, expr: { mouth: beat > .5 ? 'o' : 'flat', browUp: .8, look: 0 }, arms: { l: { a: .13, b: -.08 }, r: { a: 2.2 + .25 * beat, b: .25 } } });
    return { set: borderNight, setOpts: { crowd: 1, cheer: 1, hutX: -1300, towerX: -400, masts: [-800, 300, 1000] }, cam, blur: 0, vignette: .35,
      behind: [c => crowdRow(c, t, bDepth(.85), .85, -700, 700, 101, { cheer: 1 })],
      front: [noah, c => { crowdRow(c, t, 30, 1.02, -700, -170, 111, { cheer: 1 }); crowdRow(c, t, 30, 1.02, 180, 700, 121, { cheer: 1 }); }],
      screen: [c => borderLight(c, cam, t)] };
  } },
  // S14b 31.2–32.3: "Tor auf!" — fists punch the floodlit sky (three rhythmic framings)
  { name: 'S14b Faeuste', end: 32.3, f(lt, T, t) {
    BN.HZ = -330; const sub = Math.min(2, Math.floor(lt / .37)), pump = Math.pow(Math.abs(Math.sin((t - 31.28) * Math.PI * 2.4)), .6);
    if (sub === 1) { // Noah shouting, close
      const cam = faceCam(3.6); cam.y = -330;
      return { set: borderNight, setOpts: { crowd: 1, cheer: 1, towerX: -200, masts: [-300, 200] }, cam, blur: 0, vignette: .4,
        front: [c => drawNoahP(c, { x: 0, y: 0, expr: { mouth: 'o', browUp: 1, lid: 0 }, bob: -10 * pump, arms: { l: { a: .13, b: -.08 }, r: { a: 2.3, b: .2 } } })], screen: [c => borderLight(c, cam, t)] };
    }
    const cam = sub === 0 ? { x: 0, y: -1050, z: 1.5, rot: -.08 } : { x: 100, y: -700, z: 1.05, rot: .05 };
    return { set: borderNight, setOpts: { crowd: 1, cheer: 1, towerX: -500, masts: [-900, 350, 1100] }, cam, blur: 0, vignette: .4, shake: 6 * pump,
      front: [c => { const cols = ['#4a5a7a', '#9a4a5a', PARKA.olive, '#7a6a52', '#3f6f7a', '#c8843a'];
        const n = sub === 0 ? 6 : 10, gap = sub === 0 ? 190 : 120, by = cam.y + 980 / cam.z;
        for (let i = 0; i < n; i++) { const x = cam.x - (n - 1) * gap / 2 + i * gap; fistArm(c, x + 40, by - 60, (sub === 0 ? 330 : 260) + rnd(i) * 90, Math.pow(Math.abs(Math.sin((t - 31.28) * Math.PI * 2.4 + i * .3)), .6), cols[i % 6]); }
        for (let i = 0; i < n + 1; i++) { const x = cam.x - n * gap / 2 + i * gap; journalistBack(c, x, by + 120, sub === 0 ? .6 : .45, cols[(i + 2) % 6], ['#2b2326', '#5a3b26', '#e8c060', '#7a4524'][i % 4]); } }],
      screen: [c => borderLight(c, cam, t)] };
  } },
  // S15 32.3–34.2: a soldier in the hut on the phone — "Kein Befehl"
  { name: 'S15 Kein Befehl', end: 34.2, f(lt, T, t) {
    const pick = ease(seg(t, 32.35, 32.7));
    const cam = { x: -60, y: -300, z: lerp(2.3, 2.6, lt / T) };
    const sol = P('soldier', -60, { look: t > 33.1 ? [-.8, -.1] : [0, .3], worry: 1, mouth: t > 33.2 ? 'wobble' : 'flat', sweat: seg(t, 32.8, 34.2), pupil: .7,
      main: { from: 'front', to: 'ear', k: pick, item: (c2) => itemPhone(c2) }, off: 'front' });
    return { set: hutInside, cam, blur: 0, vignette: .4,
      behind: [c => person(c, t, sol)], front: [c => hutDesk(c, t, { dial: -2 * (1 - ease(seg(t, 32.3, 32.9))) })],
      screen: [c => word(c, t, { t0: 33.3, t1: 34.15, text: 'Kein Befehl', x: 470, y: 400, size: 120, mark: 'underline', seed: 8 })] };
  } },
  // S16 34.2–35.1: the border clock — "23:30"
  { name: 'S16 23:30', end: 35.1, f(lt, T, t) {
    BN.HZ = -330; const m = t < 34.35 ? 29 : 30;
    const cam = { x: 0, y: -1040, z: 1.6 + lt * .15 };
    return { set: borderNight, setOpts: { crowd: 0, hut: false, towerX: -500, masts: [-700, 700] }, cam, blur: 0, vignette: .45,
      front: [c => { line(c, [0, -760, 0, 0], 30, OUT); line(c, [0, -760, 0, 0], 20, '#4a4a55'); stationClock(c, 0, -1060, 230, 23, m, { sec: m === 30 ? (t - 34.35) * 60 % 60 : 58 }); bloom(c, 0, -1060, 420, '255,240,200', .25); }],
      screen: [c => borderLight(c, cam, t), c => word(c, t, { t0: 34.3, t1: 35.05, text: '23:30', x: 470, y: 1420, size: 150, mark: 'underline', seed: 10 })] };
  } },
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
  // S18 38.3–39.5: over the bridge — Noah runs (low angle), "28 Jahre"
  { name: 'S18 Bruecke', end: 39.5, f(lt, T, t) {
    BN.HZ = -120; const nx = lt * 520;
    const cam = { x: nx + 40, y: -230, z: 2.15 };
    return { set: borderNight, setOpts: { crowd: 0, hut: false, towerX: -2400, masts: [-1800] }, cam, blur: 0, vignette: .35,
      behind: [c => { trussBridge(c, -2500, 3500, 0, 1.3); for (let i = 0; i < 6; i++) walker(c, t, CROWD[i % 8], nx - 600 + i * 260 + Math.sin(i) * 60, -40, 1, .8, { speed: 15, ph: i * 1.3, main: i % 3 ? 'down' : 'up' }); }],
      front: [c => { drawNoahSideP(c, { x: nx, y: 0, s: 1, walk: t * 16, armSwing: .9, lean: .14, expr: { mouth: 'smile', browUp: .7 } }); steamPuff(c, nx + 60, -300, t, 1);
        for (let i = 0; i < 2; i++) walker(c, t, CROWD[(i + 4) % 8], nx - 380 + i * 820 + ((lt * 120) % 200), 90, 1, 1.2, { speed: 15, ph: i }); }],
      screen: [c => borderLight(c, cam, t), c => word(c, t, { t0: 38.3, t1: 39.45, text: '28 Jahre', x: 470, y: 420, size: 150, mark: 'circle', seed: 12 })] };
  } },
  // S19 39.5–40.4: West side — hugs, champagne, Noah happy with tears
  { name: 'S19 Westen', end: 40.4, f(lt, T, t) {
    const pop = seg(t, 39.62, 40.3);
    const cam = { x: 40, y: -330, z: lerp(1.9, 2.15, lt / T) };
    return { set: westNight, cam, blur: 0, vignette: .3,
      behind: [c => { // hugging pairs
        for (const [x, a, b] of [[-420, 'c2', 'c3'], [470, 'c5', 'c1']]) { person(c, t, P(a, x - 50, { s: 1, sc: PSC * .95, mouth: 'laugh', lid: .5, main: { hand: [150, -470] }, off: 'chest' })); person(c, t, P(b, x + 50, { s: -1, sc: PSC * .95, mouth: 'smile', lid: .5, main: { hand: [140, -480] }, off: 'chest' })); } }],
      front: [c => { drawNoahP(c, { x: 0, y: 0, tears: .8, expr: { mouth: 'smile', lid: .35, browUp: .6 }, arms: { l: { a: 2.2, b: .3 }, r: { a: 2.2, b: .3 } }, bob: -12 * Math.abs(Math.sin(t * 6)) });
        person(c, t, P('c6', -280, { sc: PSC, s: 1, mouth: 'laugh', main: { pose: 'up', item: (c2) => itemBottle(c2, { tilt: .5 }) }, off: 'up' }));
        spray(c, -200, -470, -1.2, pop, t); confetti(c, t, -400, 400, -800, 100); }] };
  } },
  // S20 40.4–41.7: Noah's tearful smile — "3 Worte"
  { name: 'S20 3 Worte', end: 41.7, f(lt, T, t) {
    const cam = faceCam(3.4 + lt * .2);
    return { set: westNight, setOpts: { crowd: true }, cam, blur: 0, vignette: .35,
      front: [c => { drawNoahP(c, { x: 0, y: 0, tears: 1, expr: { mouth: 'smile', lid: .3, browUp: .5 } }); confetti(c, t, -200, 200, -600, -100, 25); }],
      screen: [c => word(c, t, { t0: 40.52, t1: 41.65, text: '3 Worte', x: 470, y: 420, size: 160, mark: 'circle', seed: 14 })] };
  } },
  // S21 41.7–43.7: Noah turns to the camera, eyebrows raised — "Wärst du losgerannt?"
  { name: 'S21 Waerst du', end: 43.7, f(lt, T, t) {
    const turned = t >= 41.98, k = ease(seg(lt, .3, T));
    const cam = turned ? faceCam(lerp(2.6, 3.4, k)) : { x: 60, y: -300, z: 2.6 };
    return { set: westNight, cam, blur: 0, vignette: .35,
      front: [c => turned ? drawNoahP(c, { x: 0, y: 0, expr: { mouth: t > 42.6 ? 'smile' : 'soft', browUp: 1, look: 0 }, tilt: .05 * k })
        : drawNoahSideP(c, { x: 0, y: 0, s: 1, walk: null, expr: { mouth: 'smile', browUp: .4 } }), c => confetti(c, t, -300, 300, -700, 0, 20)] };
  } },
  // S22 43.7–45.87: back into the press-hall light; the last frame matches the first (loop)
  { name: 'S22 Loop', end: DUR_TOTAL, f(lt, T, t) {
    const k = ease(seg(lt, .15, T));
    const cam = CAM.mix({ x: NX, y: -300, z: 3.4 }, { x: NX + 30, y: -250, z: 1.45 }, k);
    const noah = { expr: { mouth: 'soft', look: 0, browUp: .3 + .4 * (1 - k), lid: 0 } };
    const st = hallA(t, cam, noah);
    st.flash = .85 * (1 - seg(lt, 0, .35));
    return st;
  } },
];
let _prev = 0;
for (const s of SHOTS) { s.dur = +(s.end - _prev).toFixed(4); _prev = s.end; }
NOAH_FONTS_READY.then(() => defineFilm({ fadeIn: 0, fadeOut: 0, shots: SHOTS }));
