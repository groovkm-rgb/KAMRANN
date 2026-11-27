// Shots for the 20-second draft + review stills. Times come from words.json (silence/text alignment of the MP3).
const KID_H = 1.6, RIG_H = 1527; // Noah's rig height = 1.6 m in this film
function lightScreen(S) { const L = S.light.dir; return [V.dot(L, S.cam.right), -V.dot(L, S.cam.up)]; }
// place a character (2D rig) at a 3D foot point, with 3D-look lighting and optional cast shadow
function actor(S, pos, draw, o = {}) {
  billboard(S, pos, (c, sc, sp) => {
    const k = sc * KID_H / RIG_H * (o.scale || 1), Ls = o.lightDir || lightScreen(S);
    const hpx = sc * 1.9 * (o.scale || 1), bounds = [sp[0] - hpx * .5, sp[1] - hpx, sp[0] + hpx * .5, sp[1] + 10];
    const B = drawLit(c, cc => draw(cc, k), Object.assign({ light: Ls, bounds, feetY: o.sit ? null : sp[1], defer: true, rimInset: 13 * 1.6 * k, rimW: Math.max(2, 18 * k), rimA: .4 }, o.lit || {}));
    if (o.shadow !== false && !o.sit) castFromBuf(c, B, sp[1], Object.assign({ skew: -Ls[0] * 1.6, squash: .2, alpha: .28, cx: sp[0], cw: sc * .35, blur: 5 }, o.shadowOpt || {}));
    c.save(); c.setTransform(1, 0, 0, 1, 0, 0); if (o.alpha != null) c.globalAlpha = o.alpha; c.drawImage(B.cv, 0, 0); c.restore();
  }, { bias: o.bias || 0 });
}
const SEAT_H = Math.round(.46 * RIG_H / KID_H);
const seatPos = (name, dz = 0) => [SEATS[name][0], 0, SEATS[name][1] + dz];

// ---------- classroom scene builder ----------
function classroomFrame(c, t, cam, o = {}) {
  const S = scene(cam, Object.assign({}, SUN_MORNING, o.light || {}));
  classroomShell(S, t, { c, sunA: o.sunA }); classroomWallDecor(S, t, { c, time: o.clock });
  if (o.sun !== false) classroomSun(S, c, t, o.sunA ?? 1);
  classroomProps(S, t, o);
  if (o.cast) o.cast(S, t);
  flush(S, c);
  if (o.sun !== false) motes3D(S, c, [.2, .8, 1.2, 4.5, 2.0, 6], t, { n: 140, a: .55 * (o.sunA ?? 1), inside: p => p[0] < 1.8 * (p[1] < 1 ? 2.2 : 1) + 1.2 });
  return S;
}
// default cast in the classroom (seated students + teacher)
function classCast(o = {}) {
  return (S, t) => {
    const back = o.back, ex = o.expr || {};
    const sit = (name, P, e) => actor(S, seatPos(name), (c, k) => back ? drawPerson(c, P, { k, sit: true, seatH: SEAT_H, back: true, ink: 1.6 }) : drawPerson(c, P, { k, sit: true, seatH: SEAT_H, expr: e, ink: 1.6, arms: { l: { a: .35, b: -1.2 }, r: { a: .35, b: -1.2 } } }), { sit: true, bias: -.05 });
    sit('s1', CAST.student1, {}); sit('s2', CAST.student2, {}); sit('s3', CAST.student3, {}); sit('s4', CAST.student1, { mouth: 'soft' }); sit('s5', CAST.student2, {}); sit('s6', CAST.student3, {}); sit('s7', CAST.student2, {});
    sit('lea', CAST.lea, ex.lea || { mouth: 'soft', look: -.5 });
    actor(S, seatPos('jonas'), (c, k) => back ? drawPerson(c, CAST.jonas, { k, sit: true, seatH: SEAT_H, back: true, ink: 1.6, tilt: .25 }) : drawPerson(c, CAST.jonas, { k, sit: true, seatH: SEAT_H, ink: 1.6, tilt: .3, expr: ex.jonas || { eyes: 'closed', mouth: 'o' }, arms: { l: { a: .4, b: -1.3 }, r: { a: .4, b: -1.3 } } }), { sit: true, bias: -.05 });
    actor(S, seatPos('noah'), (c, k) => back ? drawNoahBack(c, { k, sit: true, seatH: SEAT_H, ink: 1.8 }) : drawNoah(c, { k, sit: true, seatH: SEAT_H, ink: 1.8, tilt: -.12, expr: ex.noah || { lid: .45, mouth: 'flat', look: .5 }, arms: { l: { a: .35, b: -1.2 }, r: { a: .35, b: -1.2 } } }), { sit: true, bias: -.05 });
    if (o.teacher !== false) actor(S, o.teacherPos || [3.2, 0, 7.35], (c, k) => drawPerson(c, CAST.becker, Object.assign({ k, ink: 1.6 }, o.teacherPose || { back: true, arms: { r: { a: 2.6, b: .2 }, l: { a: .1, b: -.2 } } })), {});
  };
}

// ======================= REVIEW STILLS =======================
const STILLS = {
  classroom(c) {
    const cam = lookAt([8.4, 2.45, .5], [3.6, .95, 6.6], { fov: 64 });
    classroomFrame(c, 2, cam, { cast: classCast({ back: true }), clock: [10, 12, 30] });
    gradeScreen(c, { sx: .05, sy: .1, warmA: .3, coolA: .22 }); vignette(c, .35);
  },
  classroomFront(c) {
    const cam = lookAt([7.8, 1.55, 7.3], [4.2, .85, 2.6], { fov: 52 });
    classroomFrame(c, 2, cam, { cast: classCast({ teacher: true, teacherPos: [6.6, 0, 7.0], teacherPose: { arms: { l: { a: .4, b: -.9 } } , expr: { mouth: 'soft', look: -.6 } } }), clock: [10, 12, 30] });
    gradeScreen(c, { sx: .0, sy: .2, warmA: .3, coolA: .2 }); vignette(c, .35);
  },
  corridor(c) {
    const cam = lookAt([1.7, 1.6, -1.2], [1.6, 1.3, 20], { fov: 58 });
    const S = scene(cam, { dir: V.norm([.2, .8, -.5]), col: [255, 248, 230], amb: .62, ambCol: [190, 196, 215], ink: 1.2, inkA: .5 });
    corridorScene(S, c, 2, {}); flush(S, c); gradeScreen(c, { sx: .5, sy: .3, warmA: .2, coolA: .18 }); vignette(c, .35);
  },
  corridorAlarm(c) {
    const t = 2.1, cam = lookAt([1.75, 1.5, 2.0], [1.4, 1.2, 22], { fov: 56 });
    const S = scene(cam, { dir: V.norm([.2, .8, -.5]), col: [200, 210, 255], amb: .5, ambCol: [90, 110, 170], ink: 1.2, inkA: .55 });
    corridorScene(S, c, t, { alarm: 1, dim: .4, flicker: i => i === 3 ? 0 : i === 5 ? .3 : .75, windowGlow: '180,200,255' }); flush(S, c);
    const bp = proj(cam, [.14, 2.4, 10]); alarmGrade(c, t, 1, bp ? { bx: bp[0], by: bp[1] } : {}); vignette(c, .55);
  },
  cast(c) {
    // character line-up on a neutral studio floor with key + rim light
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#e9e3d6'); g.addColorStop(1, '#cfc6b4'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.fillStyle = '#bfb6a3'; c.fillRect(0, 900, W, 180); line(c, [0, 900, W, 900], 3, 'rgba(0,0,0,.2)');
    const k = .43, Ls = [-1, -.5];
    const put = (x, fn, label) => { const B = drawLit(c, cc => fn(cc, x), { light: Ls, bounds: [x - 200, 150, x + 200, 905], feetY: 900, rimInset: 13 * 1.7 * k, rimW: 8, rimA: .4 }); txt(c, label, x, 1010, 36, '#3a332c', 'center'); };
    const shadowed = (x, fn) => { const B = buf('tmpS'); };
    put(170, (cc, x) => drawNoah(cc, { x, y: 900, k, ink: 1.8 }), 'Noah');
    put(450, (cc, x) => drawNoah34(cc, { x, y: 900, k, ink: 1.8, turn: 1 }), 'Noah 3/4');
    put(700, (cc, x) => drawNoahBack(cc, { x, y: 900, k, ink: 1.8 }), 'Noah hinten');
    put(960, (cc, x) => drawPerson(cc, CAST.jonas, { x, y: 900, k, ink: 1.6, expr: { mouth: 'grin' } }), 'Jonas');
    put(1220, (cc, x) => drawPerson(cc, CAST.lea, { x, y: 900, k, ink: 1.6, expr: { mouth: 'smile' } }), 'Lea');
    put(1500, (cc, x) => drawPerson(cc, CAST.becker, { x, y: 900, k, ink: 1.6, expr: { mouth: 'soft' } }), 'Frau Becker');
    put(1770, (cc, x) => drawPerson(cc, CAST.krueger, { x, y: 900, k, ink: 1.6, expr: { mouth: 'flat', brow: 'angry' } }), 'Herr Krüger');
  },
  faces(c) {
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#e9e3d6'); g.addColorStop(1, '#d6cdbb'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    const list = [['gelangweilt', { lid: .5, mouth: 'flat', look: .5 }], ['erschrocken', { browUp: 1, mouth: 'gasp', open: .8, eyeScale: 1.15, shine: 1 }], ['ängstlich', { brow: 'worried', mouth: 'wobbly', look: -.6, sweat: 1 }], ['nachdenklich', { brow: 'worried', browUp: .3, mouth: 'flat', look: .9, lookY: -.8 }], ['entschlossen', { brow: 'angry', mouth: 'flat' }], ['erleichtert', { eyes: 'closed', mouth: 'smile', browUp: .5 }], ['verlegen glücklich', { mouth: 'grin', blush: 1, eyes: 'closed' }]];
    list.forEach(([n, e], i) => { const x = 150 + i * 270, y = 520; drawLit(c, cc => drawNoahHead(cc, x, y, .4, e), { light: [-1, -.6], bounds: [x - 130, y - 140, x + 130, y + 130] }); txt(c, n, x, 760, 30, '#3a332c', 'center'); });
    txt(c, 'Noah – Ausdrücke', W / 2, 160, 56, '#3a332c', 'center');
  },
  attacker(c) {
    // dark corridor, backlit from the window end: turnaround (front / side / back). Never a face, no weapon.
    const cam = lookAt([1.7, 1.35, 4.2], [1.7, 1.25, 20], { fov: 46 });
    const S = scene(cam, { dir: V.norm([0, .5, .85]), col: [150, 170, 240], amb: .4, ambCol: [60, 70, 120], ink: 1.2, inkA: .6 });
    corridorScene(S, c, 3, { alarm: 1, dim: .45, flicker: i => i > 2 ? .15 : .5, windowGlow: '170,190,255' });
    const fig = (x, z, view, s, ex) => actor(S, [x, 0, z], (cc, k) => drawAttacker(cc, Object.assign({ k, view, s }, ex || {})), { scale: 1.0, lit: { rim: '175,205,255', rimA: .9, rimW: 5, rimInset: 3, shadeA: .45, light: [0, -1], warmA: 0, rimMode: 'source-over' }, shadowOpt: { skew: 0, squash: .5, alpha: .55 } });
    fig(.85, 9.5, 'front'); fig(1.75, 9.5, 'side', 1, { walk: .9 }); fig(2.6, 9.5, 'back');
    flush(S, c); const bp = proj(cam, [.14, 2.4, 10]); alarmGrade(c, 3, .8, bp ? { bx: bp[0], by: bp[1] } : {}); vignette(c, .6);
  },
};
function alarmGrade(c, t, k, o = {}) {
  // cold blue shadows + red strobe (from a beacon point if given)
  const ph = (t * 1.6 + (o.phase || 0)) % 1, pulse = Math.pow(Math.max(0, Math.sin(ph * Math.PI)), 2) * k;
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
  c.globalCompositeOperation = 'multiply'; c.fillStyle = `rgba(52,66,130,${.62 * k})`; c.fillRect(0, 0, W, H);
  c.globalCompositeOperation = 'screen';
  if (o.bx != null) { const g = c.createRadialGradient(o.bx, o.by, 0, o.bx, o.by, o.br || 900); g.addColorStop(0, `rgba(255,40,30,${.75 * pulse})`); g.addColorStop(.4, `rgba(220,20,20,${.3 * pulse})`); g.addColorStop(1, 'rgba(200,0,0,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H); }
  c.fillStyle = `rgba(255,20,20,${.16 * pulse})`; c.fillRect(0, 0, W, H);
  c.globalCompositeOperation = 'source-over'; c.restore();
  return pulse;
}

