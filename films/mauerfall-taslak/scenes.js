// MAUERFALL – 20-s draft: chapter 01 (press hall -> morning at the Brandenburg Gate). Noah is in the very first frame.
const SHOT = i => TL.cuts[i + 1] - TL.cuts[i];
const flashK = t => { let f = 0; for (const ft of TL.flashes) if (t >= ft && t < ft + .18) f = Math.max(f, 1 - (t - ft) / .18); return f; };
// Noah's standing mark in the press hall (among the journalists, right of the stage)
const NX = 980, NY = 180;
function hallCrowd(c, t, o = {}) {
  // journalists in depth rows (side view, facing the stage on the left); heads rise when the paper is read
  const up = o.up || 0, ft = flashK(t);
  const rows = [[-1500, -160], [-1150, -120], [-800, -90], [-450, -60], [300, -150], [620, -120], [1300, -140], [1620, -110], [1950, -150], [2300, -100], [250, 90], [560, 60], [1420, 70], [1750, 40], [2100, 80], [2450, 60], [-200, 120], [-650, 140]];
  rows.forEach(([x, y], i) => journalist(c, x, y, i, t + (ft > 0 && i % 3 === 0 ? 0 : 0), { up, s: x < 0 ? 1 : -1 }));
  for (const [lx, d] of [[-1900, 1], [2600, -1]]) tvLight(c, lx, PH_HZ + 80, d, 1);
}
function hallBase(cam, t, o = {}) {
  return {
    set: (c, cm, tt) => presseHall(c, cm, tt), cam, vignette: .22,
    behind: [c => {
      presseTable(c, t, { spokes: o.spokes });
      hallCrowd(c, t, o);
      if (o.noah !== false) { softShadow(c, NX, NY, 130, .35); drawNoah89(c, Object.assign({ x: NX, y: NY, k: .25, ink: 1.8, armsFront: true }, o.noahP || {})); }
      if (o.front) o.front(c);
    }],
    screen: [c => { if (o.near) o.near(c); }, c => presseLight(c, cam, t, { flash: (o.noFlash ? 0 : flashK(t) * .22) }), c => clockStamp(c, t, { t0: TL.stamp, t1: TL.cuts[5], text: '18:53' })],
  };
}
// foreground heads passing the lens (back view of journalists), parallax faster than the world
function nearHeads(cam, t, xs, ground = 520) {
  return c => nearLayer(c, cam, 1.5, 1.8, ground, cc => xs.forEach((x, i) => drawFolkSide(cc, Object.assign({ x, y: 0, s: i % 2 ? 1 : -1, expr: { mouth: 'flat' } }, JOURN[(i + 2) % JOURN.length]))));
}
const NOAH_PAD = { r: { a: .55, b: -1.55, hand: .3 }, l: { a: .4, b: -1.2 } };
const pad = c => { c.save(); c.rotate(.9); c.beginPath(); c.rect(-60, -10, 150, 120); fs(c, '#f4f0e2', 6); for (let k = 0; k < 4; k++) line(c, [-48, 18 + k * 22, 74, 18 + k * 22], 3, '#8aa0c0'); c.restore(); };
function torBase(cam, t, o = {}) {
  return { set: (c, cm, tt) => torSet(c, cm, tt), cam, vignette: .25,
    behind: [c => { torCrowd(c, t, o.crowd || {}); if (o.noah) o.noah(c); if (o.front) o.front(c); }],
    screen: [c => { if (o.near) o.near(c); }, c => torLight(c, cam, t), c => { if (o.ui) o.ui(c); }] };
}
const NOAH_WALL_X = -150;
defineFilm({ shots: [
  // 1.1 ORTA — bright hall, push through the journalists onto Noah's curious face (Noah is in frame from frame 1)
  { name: '1.1 Saal – Fahrt auf Noah', dur: SHOT(0), f(lt, T, t) {
    const k = ease(lt / T), cam = CAM.mix({ x: NX - 380, y: NY - 260, z: 1.45 }, { x: NX - 20, y: NY - 330, z: 2.5 }, k);
    return hallBase(cam, t, { noahP: { expr: { browUp: .5, look: -.6, mouth: 'soft', lid: blinkLid(t) } }, near: nearHeads(cam, t, [560, 790, 1290], 470) });
  } },
  // 1.2 ORTA — over Noah's shoulder: the grey-suited spokesman shuffles his papers
  { name: '1.2 Über die Schulter', dur: SHOT(1), f(lt, T, t) {
    const cam = { x: -40 + lt * 20, y: -560, z: 1.55 };
    const sh = Math.sin(lt * 9);
    return hallBase(cam, t, { noah: false, spokes: { arms: { l: { a: .55 + sh * .1, b: -1.9 }, r: { a: .6 - sh * .1, b: -1.7 } }, expr: { look: .2 }, tilt: .06 },
      near: c => nearLayer(c, cam, 1.3, 1.7, 190, cc => drawNoah89Back(cc, { x: 120, y: 0, k: .25, ink: 1.8 })) });
  } },
  // 1.3 ORTA — Noah with his notepad; behind him the man takes one sheet
  { name: '1.3 Noah notiert', dur: SHOT(2), f(lt, T, t) {
    const cam = { x: NX - 520 + lt * 30, y: NY - 420, z: 1.5 };
    return hallBase(cam, t, { spokes: { paper: lt > .5, arms: lt > .5 ? { l: { a: .5, b: -1.8 }, r: { a: .9, b: -1.6 } } : undefined },
      noahP: { arms: NOAH_PAD, hold: { r: pad }, expr: { look: -.8, browUp: .3, mouth: 'flat', lid: blinkLid(t) }, tilt: .05 } });
  } },
  // 1.4 ORTA — he reads; heads come up; Noah leans in; clock stamp 18:53
  { name: '1.4 Er liest vor – 18:53', dur: SHOT(3), f(lt, T, t) {
    const up = ease(clamp(lt / .5)), cam = { x: 560, y: -360, z: 1.3 };
    return hallBase(cam, t, { up, spokes: { paper: true, arms: { l: { a: .5, b: -1.8 }, r: { a: 1.3, b: -1.9 } }, expr: { look: .3 } },
      noahP: { lean: -.06 * up, arms: NOAH_PAD, hold: { r: pad }, expr: { look: -.9, browUp: .5 + up * .3, mouth: 'flat' } } });
  } },
  // 1.5 YAVAŞ — slow push on Noah: brows up, eyes wide, mouth opens; the hall freezes
  { name: '1.5 Stille – Noah', dur: SHOT(4), f(lt, T, t) {
    const k = ease(lt / T), cam = CAM.mix({ x: NX - 60, y: NY - 330, z: 2.4 }, { x: NX - 10, y: NY - 330, z: 3.4 }, k);
    const s = ease(clamp(lt / 1.4));
    return hallBase(cam, t, { up: 1, noFlash: true, spokes: { paper: true, arms: { l: { a: .5, b: -1.8 }, r: { a: 1.3, b: -1.9 } } },
      noahP: { lean: -.06, arms: NOAH_PAD, hold: { r: pad }, expr: { look: -.5 + s * .5, browUp: .5 + s * .5, lid: 0, mouth: s > .5 ? 'o' : 'flat', open: .7 } } });
  } },
  // 1.6a HIZLI — jump: bright morning, 10 November, crowd dancing on the wall before the Gate
  { name: '1.6 Morgen am Tor', dur: SHOT(5), f(lt, T, t) {
    const cam = { x: -100 + lt * 120, y: -900, z: .62 + lt * .04 };
    return torBase(cam, t, { noah: c => drawNoah89(c, { x: NOAH_WALL_X, y: TOR_TOP - Math.max(0, Math.sin(t * 7)) * 20, k: .25, ink: 1.8, arms: { l: { a: 2.5, b: -.2 }, r: { a: 2.5, b: -.2 } }, expr: { mouth: 'smile', eyes: 'closed' }, tilt: -.08 }) });
  } },
  // 1.6b HIZLI — Noah on the wall, arms up, tears of joy
  { name: '1.6 Noah – Freudentränen', dur: SHOT(6), f(lt, T, t) {
    const cam = { x: NOAH_WALL_X + 60, y: TOR_TOP - 250, z: 1.6 + lt * .12 };
    const hy = TOR_TOP - 310;
    return torBase(cam, t, { crowd: { xs: [-700, -420, 160, 430, 760, 1100], hammer: false },
      noah: c => { drawNoah89(c, { x: NOAH_WALL_X, y: TOR_TOP, k: .25, ink: 1.8, arms: { l: { a: 2.45 + Math.sin(t * 6) * .1, b: -.25 }, r: { a: 2.45 - Math.sin(t * 6) * .1, b: -.25 } }, expr: { mouth: 'smile', lid: .78, browUp: .4 }, tilt: -.12 }); tears(c, NOAH_WALL_X - 30, hy - 8, clamp(lt / 1.2), t); } });
  } },
  // 1.7 ORTA — red felt tip writes "Offen!" on the wall under Noah's feet
  { name: '1.7 „Offen!“', dur: SHOT(7), f(lt, T, t) {
    const cam = { x: NOAH_WALL_X + 120, y: TOR_TOP - 40, z: 1.1 };
    return torBase(cam, t, { crowd: { xs: [-820, -520, 300, 600, 900], hammer: false },
      noah: c => drawNoah89(c, { x: NOAH_WALL_X, y: TOR_TOP, k: .25, ink: 1.8, arms: { l: { a: 2.3, b: -.3 }, r: { a: .4, b: -.2 } }, expr: { mouth: 'smile', look: .4 } }),
      front: c => { const k = clamp((t - TL.marker[0]) / (TL.marker[1] - TL.marker[0])); markerWrite(c, 'Offen!', k, NOAH_WALL_X - 160, TOR_TOP + 260, 170, { underline: true, halo: true }); } });
  } },
  // HIZLI — hammer and chisel at the wall
  { name: 'Hammer und Meißel', dur: SHOT(8), f(lt, T, t) {
    const cam = { x: 1080, y: TOR_WALL - 300, z: 2.1 };
    return torBase(cam, t, { crowd: { xs: [700, 1500], hammerX: 1250 } });
  } },
  // HIZLI — cheering faces and the flag
  { name: 'Jubel', dur: SHOT(9), f(lt, T, t) {
    const cam = { x: -900, y: TOR_TOP - 280, z: 1.9 };
    return torBase(cam, t, { crowd: { hammer: false } });
  } },
  // 1.8 — Noah turns to camera: "Was wäre, wenn …"
  { name: '1.8 Noah zur Kamera', dur: SHOT(10), f(lt, T, t) {
    const cam = { x: NOAH_WALL_X, y: TOR_TOP - 290, z: 2.3 + lt * .15 };
    const turned = lt > .35;
    return torBase(cam, t, { crowd: { xs: [-800, -520, 300, 600], hammer: false },
      noah: c => turned ? drawNoah89(c, { x: NOAH_WALL_X, y: TOR_TOP, k: .25, ink: 1.8, expr: { mouth: 'soft', browUp: .3, look: 0 } }) : drawNoah89Side(c, { x: NOAH_WALL_X, y: TOR_TOP, k: .25, ink: 1.8, s: -1, expr: { mouth: 'smile' } }) });
  } },
  // 1.9 — old TV switches off
  { name: '1.9 TV aus', dur: SHOT(11), f(lt, T, t) {
    const cam = { x: NOAH_WALL_X, y: TOR_TOP - 290, z: 2.45 };
    const S = torBase(cam, t, { crowd: { xs: [-800, -520, 300, 600], hammer: false }, noah: c => drawNoah89(c, { x: NOAH_WALL_X, y: TOR_TOP, k: .25, ink: 1.8, expr: { mouth: 'soft', browUp: .3 } }) });
    S.vignette = 0; S.screen.push(c => tvOff(c, lt / T)); return S;
  } },
] });
function blinkLid(t) { const p = (t % 3.7) / 3.7; return p > .96 ? 1 : 0; }
