// Shot plan for "The Emu War" — timed to voice.mp3 (41.56 s) + 0.5 s tail = 1262 frames @ 30 fps.
// Phrase times (s), hand-checked against the waveform / spectral onsets:
//  0.00-1.92 Ein Land schickt seine Armee in den Krieg. | 2.05-2.40 Gegen … | 2.65-3.09 Vögel. | 3.31-3.94 Und verliert.
//  4.24-5.30 Zwanzigtausend Emus | 5.49-6.87 fressen die Weizenfelder kahl. | 7.20-8.57 Die Farmer wollen Maschinengewehre.
//  8.75-9.48 Sie bekommen sie. | 9.83-12.12 Dazu Soldaten und zehntausend Schuss Munition. | 12.51-13.23 Erster Versuch:
//  13.40-15.03 Die Emus teilen sich in kleine Gruppen auf | 15.06-16.57 und rennen in alle Richtungen davon.
//  16.86-17.58 Zweiter Versuch: | 17.72-18.39 ein Hinterhalt. | 18.60-19.94 Über tausend Emus kommen näher. | 19.96-20.40 Feuer!
//  20.70-21.63 Nach ein paar Vögeln: | 21.78-22.42 Ladehemmung. | 22.46-23.18 Dritter Versuch: | 23.34-24.95 das Maschinengewehr auf einem Lastwagen.
//  25.08-26.22 Aber der ist zu langsam. | 26.36-28.72 Und so holprig, dass der Schütze nicht mal schießen kann.
//  29.29-30.12 Die Armee zieht ab. | 30.22-30.74 Kommt zurück. | 30.96-31.47 Am Ende: | 31.73-32.81 fast zehntausend Schuss. | 33.23-34.38 Für knapp tausend Emus.
//  34.85-36.45 Der Kommandant sagt danach sinngemäß: | 36.81-38.85 Diese Vögel stecken Kugeln ein wie Panzer. | 39.27-40.16 Und die Emus? | 40.43-41.31 Haben gewonnen.
import { M as E, camFromKeys, blinkAt, q, clamp, lerp, lerp3, ramp } from './motion.js';

export const FPS = 30, TOTAL = 1262;
export const SHOTS = [
  { id: 'march', a: 0, b: 58, light: 'day' },        // Ein Land schickt seine Armee in den Krieg.
  { id: 'birds', a: 59, b: 122, light: 'day' },      // Gegen … Vögel. Und verliert.  (punch-in at 96)
  { id: 'horde', a: 123, b: 210, light: 'day' },     // Zwanzigtausend Emus fressen die Weizenfelder kahl.
  { id: 'farmers', a: 211, b: 259, light: 'day' },   // Die Farmer wollen Maschinengewehre.
  { id: 'deliver', a: 260, b: 289, light: 'day' },   // Sie bekommen sie.
  { id: 'unload', a: 290, b: 368, light: 'day' },    // Dazu Soldaten und zehntausend Schuss Munition.
  { id: 'first', a: 369, b: 450, light: 'day' },     // Erster Versuch: | Die Emus teilen sich in kleine Gruppen auf (crane up at 399)
  { id: 'dizzy', a: 451, b: 500, light: 'day' },     // und rennen in alle Richtungen davon.
  { id: 'ambush', a: 501, b: 554, light: 'day' },    // Zweiter Versuch: ein Hinterhalt.
  { id: 'approach', a: 555, b: 615, light: 'day' },  // Über tausend Emus kommen näher. | Feuer! (punch-in at 599)
  { id: 'jam', a: 616, b: 672, light: 'day' },       // Nach ein paar Vögeln: Ladehemmung.
  { id: 'truck', a: 673, b: 749, light: 'day' },     // Dritter Versuch: das Maschinengewehr auf einem Lastwagen.
  { id: 'slow', a: 750, b: 787, light: 'day' },      // Aber der ist zu langsam.
  { id: 'bumpy', a: 788, b: 869, light: 'day' },     // Und so holprig, dass der Schütze nicht mal schießen kann.
  { id: 'retreat', a: 870, b: 925, light: 'day' },   // Die Armee zieht ab. | Kommt zurück. (whip-around at 904)
  { id: 'pile', a: 926, b: 990, light: 'day' },      // Am Ende: fast zehntausend Schuss.
  { id: 'reveal', a: 991, b: 1037, light: 'day' },   // Für knapp tausend Emus.
  { id: 'cmdr', a: 1038, b: 1098, light: 'day' },    // Der Kommandant sagt danach sinngemäß:
  { id: 'tank', a: 1099, b: 1171, light: 'day' },    // Diese Vögel stecken Kugeln ein wie Panzer.
  { id: 'dusk', a: 1172, b: 1208, light: 'sunset' }, // Und die Emus?
  { id: 'victory', a: 1209, b: 1261, light: 'sunset' }, // Haben gewonnen.
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];

// ---------- places ----------
const NEST1 = [5.6, -3.4], NEST2 = [11.2, -4.6], AMB = [119, -45], POND = [120, -60], PILE = [27, 3], HILL = [40, 360], TRK = 200;
const FARMERS = [-14, -30];
const H = (x, z, s = 1) => x + z * 0; // (readability helper)

// ---------- lights ----------
export const LIGHTS = {
  day: { az: 55, el: 58, sky: '#d6e6f4', ground: '#c47a4c', hemi: 1.5, sun: '#fff1d8', sunI: 2.2, fog: '#f0dcb8', fogNear: 90, fogFar: 1500,
    skyTop: '#2f7bd6', skyHor: '#cfe7f6', sat: 1.14, vig: 0.2, shadowExt: 22 },
  sunset: { az: 90, el: 12.5, lightEl: 14, sky: '#a77fb0', ground: '#5a3028', hemi: 0.85, sun: '#ff9a4c', sunI: 2.3, fog: '#e98a62', fogNear: 120, fogFar: 1100,
    skyTop: '#47357f', skyHor: '#ff9248', sunDisc: '#fff2c4', sunSize: 0.0035, sat: 1.18, gain: '#fff0e4', vig: 0.32, shadowExt: 30, cloud: '#ffc09a' },
};
export const lightFor = (S, f) => {
  const L = { ...LIGHTS[S.light] };
  if (S.id === 'horde' || S.id === 'reveal') L.shadowExt = 45;
  if (S.id === 'first' && f >= 399) L.shadowExt = 60;
  if (S.id === 'dizzy') L.shadowExt = 30;
  return L;
};

// ---------- truck paths ----------
const truckAt = (f) => {
  const S = shotAt(f);
  switch (S.id) {
    case 'march': return { x: 6.6, z: -1.5, ry: Math.PI, canopy: true };
    case 'birds': return { x: 6.6, z: -1.5, ry: Math.PI, canopy: true };
    case 'deliver': { const k = E.easeOut(ramp(f, 260, 281)), z = 1 + 13 * (1 - k); const st = f > 279 ? Math.exp(-(f - 279) / 5) * Math.sin((f - 279) * 0.9) : 0;
      return { x: 1.0, z, ry: Math.PI, canopy: true, pitch: 0.05 * Math.min(1, (f - 268) / 8) * (f < 281 ? 1 : 0) + 0.06 * st, wheel: -(14 - (z - 1)) / 0.58, bounce: 0.02 * Math.sin(f * 1.7) * (f < 281 ? 1 : 0) }; }
    case 'unload': return { x: 1.0, z: 1.0, ry: Math.PI, canopy: false, bounce: f < 300 ? 0.01 * Math.sin(f * 2) : 0 };
    case 'truck': { const t = Math.max(0, (f - 683) / 30), d = 0.5 * 7 * t * t; const idle = f < 690 ? 0.025 * Math.sin(f * 2.3) : 0;
      return { x: TRK, z: 10 - d, ry: Math.PI, gun: true, wheel: -d / 0.58, bounce: idle + 0.06 * Math.abs(Math.sin(f * 0.6)) * clamp(t * 2), pitch: f > 683 && f < 695 ? -0.04 * Math.sin((f - 683) / 12 * Math.PI) : 0, gunYaw: 0.05 * Math.sin(f * 0.3) }; }
    case 'slow': { const d = (f - 750) * 9 / 30; return { x: TRK, z: -20 - d, ry: Math.PI, gun: true, wheel: -d / 0.58, bounce: 0.05 * Math.abs(Math.sin(f * 0.7)), roll: 0.02 * Math.sin(f * 0.5) }; }
    case 'bumpy': { const d = (f - 788) * 8 / 30, ph = (f - 788) / 13; const b = Math.abs(Math.sin(ph * Math.PI)) * (0.35 + 0.2 * Math.sin(ph * 2.3));
      return { x: TRK, z: -60 - d, ry: Math.PI, gun: true, wheel: -d / 0.58, bounce: b, pitch: 0.12 * Math.sin(ph * Math.PI * 2 + 0.6), roll: 0.09 * Math.sin(ph * 4.1), wheelHop: b * 0.5, gunYaw: 0.5 * Math.sin(f * 0.37), gunPitch: 0.35 * Math.sin(f * 0.53) }; }
    case 'retreat': return null;
    case 'cmdr': case 'tank': return { x: 3.4, z: 14, ry: Math.PI * 0.85, canopy: true };
    case 'pile': case 'reveal': return { x: 14, z: 9, ry: Math.PI * 0.6, canopy: false };
  }
  return null;
};
const tw = (t, lx, ly, lz) => { const c = Math.cos(t.ry || 0), s = Math.sin(t.ry || 0); return [t.x + lx * c + lz * s, (t.y || 0) + ly + (t.bounce || 0), t.z - lx * s + lz * c]; };

// ---------- cameras ----------
const K = (f, pos, look, fov, roll = 0, ease) => ({ f, pos, look, fov, roll, ease });
const CAMS = {
  march: [K(0, [0.45, 0.42, 4.3], [0.0, 1.85, -1.5], 44, -2.5), K(58, [0.3, 0.5, 3.75], [0.0, 1.95, -2.5], 42, 1.5)],
  birds: [K(59, [0.1, 1.45, 4.1], [0.0, 1.45, -0.5], 40, 0), K(95, [0.12, 1.47, 3.8], [0.0, 1.47, -0.5], 38.5, -1),
    K(98, [0.05, 1.68, 2.85], [0.0, 1.66, -0.25], 36, 2, 'easeOut'), K(122, [0.03, 1.7, 2.65], [0.0, 1.68, -0.25], 34.5, 3)],
  horde: [K(123, [-2.0, 5.2, 12], [-34, 1.4, -80], 40, 0), K(210, [-1.5, 3.4, 4], [-15, 1.0, -26], 50, -3, 'smooth')],
  farmers: [K(211, [-13.2, 1.45, -25.4], [-14.3, 1.45, -31.2], 42, 2), K(259, [-13.5, 1.45, -26.6], [-14.2, 1.5, -31.2], 37, -1.5)],
  deliver: [K(260, [-2.4, 0.75, -8.2], [1.2, 1.4, 3], 46, -4), K(289, [-2.0, 0.85, -7.6], [1.0, 1.4, 0.5], 43, 1)],
  unload: [K(290, [4.2, 1.7, 10.0], [0.9, 1.0, 3.4], 46, 0), K(368, [3.4, 1.55, 8.6], [0.8, 0.95, 3.6], 43, -2)],
  first: [K(369, [NEST1[0] + 0.25, 0.92, NEST1[1] - 3.3], [NEST1[0], 0.95, NEST1[1] + 0.2], 30, 0), K(398, [NEST1[0] + 0.2, 0.9, NEST1[1] - 2.6], [NEST1[0], 0.95, NEST1[1] + 0.2], 27, 1.5),
    K(450, [17.5, 27, -32], [18, 0, -47.5], 58, 0, 'easeOut')],
  dizzy: [K(451, [8.4, 2.5, 0.9], [8.4, 1.15, -4.0], 54, 0), K(500, [8.4, 2.8, 1.5], [8.4, 1.1, -4.0], 56, 6)],
  ambush: [K(501, [AMB[0] + 0.5, 1.5, AMB[1] - 5.0], [AMB[0], 1.5, AMB[1] + 0.4], 36, 0), K(554, [AMB[0] + 0.25, 1.55, AMB[1] - 3.8], [AMB[0], 1.55, AMB[1] + 0.4], 32, -1.5)],
  approach: [K(555, [AMB[0] + 0.7, 2.7, AMB[1] + 3.4], [AMB[0] - 0.5, 1.0, AMB[1] - 35], 46, 0), K(598, [AMB[0] + 0.6, 2.6, AMB[1] + 2.8], [AMB[0] - 0.5, 1.0, AMB[1] - 35], 43, 0),
    K(601, [AMB[0] + 0.25, 2.1, AMB[1] + 1.3], [AMB[0] + 0.2, 1.2, AMB[1] - 30], 38, -3, 'easeOut'), K(615, [AMB[0] + 0.24, 2.05, AMB[1] + 1.15], [AMB[0] + 0.2, 1.2, AMB[1] - 30], 37, 2)],
  jam: [K(616, [AMB[0] + 3.0, 1.9, AMB[1] + 4.2], [AMB[0] + 0.0, 1.45, AMB[1] + 0.2], 40, 0), K(672, [AMB[0] + 2.7, 1.9, AMB[1] + 3.8], [AMB[0] + 0.0, 1.5, AMB[1] + 0.2], 37, 2)],
  pile: [K(926, [PILE[0] - 2.5, 1.0, PILE[1] + 12], [PILE[0], 2.1, PILE[1]], 46, -2), K(990, [PILE[0] - 1.5, 1.1, PILE[1] + 11], [PILE[0], 2.2, PILE[1]], 43, 1)],
  reveal: [K(991, [PILE[0] - 1.8, 1.3, PILE[1] + 11.5], [PILE[0], 2.8, PILE[1]], 46, 0), K(1037, [PILE[0] - 1.0, 7.2, PILE[1] + 12], [PILE[0] - 8, 3.0, PILE[1] - 90], 46, 0)],
  cmdr: [K(1038, [7.3, 1.25, -3.0], [8.0, 1.7, 0.6], 40, 0), K(1098, [7.6, 1.32, -2.2], [8.0, 1.75, 0.6], 36, 2)],
  tank: [K(1099, [7.7, 1.6, -4.4], [7.75, 2.35, 0.6], 48, 0), K(1171, [7.75, 1.65, -3.7], [7.75, 2.45, 0.6], 45, -2)],
  dusk: [K(1172, [HILL[0] + 1, 6.0, HILL[1] - 46], [HILL[0], 16.2, HILL[1]], 34, 0), K(1208, [HILL[0] + 0.6, 6.4, HILL[1] - 42], [HILL[0], 16.4, HILL[1]], 32, 0.5)],
  victory: [K(1209, [HILL[0] + 0.5, 15.6, HILL[1] - 13.5], [HILL[0], 15.3, HILL[1] - 9.0], 34, 0), K(1261, [HILL[0] + 0.9, 14.9, HILL[1] - 18.5], [HILL[0], 15.5, HILL[1] - 9.0], 44, -1, 'easeOut')],
};
const KICKS = [{ f: 97, a: 0.03 }, { f: 300, a: 0.015 }, { f: 312, a: 0.015 }, { f: 324, a: 0.02 }, { f: 336, a: 0.02 },
  { f: 600, a: 0.05 }, { f: 603, a: 0.04 }, { f: 606, a: 0.05 }, { f: 609, a: 0.04 }, { f: 612, a: 0.04 }, { f: 653, a: 0.03 }, { f: 660, a: 0.02 }, { f: 666, a: 0.02 },
  { f: 683, a: 0.03 }, { f: 700, a: 0.02 }, { f: 1100, a: 0.02 }];
const shake = (f, a0, a1, amp) => f >= a0 && f <= a1 ? amp * (Math.sin(f * 2.7) + 0.6 * Math.sin(f * 4.3)) : 0;
export const camAt = (f) => {
  const S = shotAt(f);
  let c;
  if (S.id === 'truck') { // roars off towards camera, camera pans with it
    const t = truckAt(f), tp = [t.x, 1.4, t.z];
    const k = E.smooth(ramp(f, 690, 749));
    c = { pos: lerp3([TRK + 2.8, 0.7, 3.0], [TRK + 4.2, 1.0, -15], k), look: lerp3([TRK - 0.2, 1.7, 8.5], tp, clamp(k * 1.4)), fov: lerp(42, 48, k), roll: lerp(-2, 3, k) };
  } else if (S.id === 'slow') {
    const t = truckAt(f); c = { pos: [TRK + 7.0, 1.7, t.z - 1.6], look: [TRK, 1.6, t.z - 1.7], fov: 46, roll: 1.5 * Math.sin(f * 0.2) };
  } else if (S.id === 'bumpy') {
    const t = truckAt(f), k = ramp(f, 788, 869); c = { pos: [TRK + 5.2 - k * 0.6, 3.3, t.z - 3.2], look: [TRK, 2.4 + (t.bounce || 0) * 0.5, t.z + 1.0], fov: 52 - 4 * k, roll: 3 * Math.sin(f * 0.4) };
  } else if (S.id === 'retreat') {
    // soldiers walk towards camera (south); at 904 the camera whips 180° around them; they march back north, towards camera again
    const cz = soldierZ(f), mid = [0, 1.45, cz];
    if (f < 903) { const k = ramp(f, 870, 903); c = { pos: [0.4, 1.35, cz + 5.4 - k * 0.3], look: [0, 1.55, cz - 2], fov: 42 - 2 * k, roll: -1 }; }
    else if (f < 909) { const k = E.smooth(ramp(f, 903, 909)), a = k * Math.PI, R = 5.4; c = { pos: [Math.sin(a) * 3.2 + 0.4 * Math.cos(a), 1.35 + Math.sin(a) * 0.8, cz + Math.cos(a) * R], look: mid, fov: 42 + 10 * Math.sin(a), roll: 12 * Math.sin(a) }; }
    else { const k = ramp(f, 909, 925); c = { pos: [-0.4, 1.3, cz - 5.0 + k * 0.4], look: [0, 1.6, cz + 2], fov: 38 - 2 * k, roll: 1.5 }; }
  } else c = camFromKeys(CAMS[S.id], f, { creep: 0.0015, kicks: KICKS });
  if (S.id !== 'truck' && S.id !== 'slow' && S.id !== 'bumpy' && S.id !== 'retreat') { /* kicks applied in camFromKeys */ }
  else for (const k of KICKS) { const d = f - k.f; if (d >= 0 && d < 7) { const s = (d % 2 ? -1 : 1) * k.a * (1 - d / 7); c.look = [c.look[0], c.look[1] + s * 3, c.look[2] + s * 2]; c.roll = (c.roll || 0) + s * 20; } }
  // continuous shakes: Feuer!, jam bangs, bumpy truck
  const sh = shake(f, 599, 615, 0.05) + shake(f, 788, 869, 0.035) + shake(f, 123, 210, 0.01) + shake(f, 451, 500, 0.012);
  if (sh) { c.look = [c.look[0] + sh, c.look[1] + sh * 0.8, c.look[2]]; c.roll = (c.roll || 0) + sh * 30; }
  c.flash = 0;
  if (f >= 599 && f <= 615 && f % 3 === 0) { c.flash = 0.16; c.flashCol = '#ffd27a'; }
  if (f >= 616 && f <= 630 && f % 3 === 1) { c.flash = 0.1; c.flashCol = '#ffd27a'; }
  if (S.id === 'first' && f >= 399) c.shadowAt = [18, 0, -40];
  if (S.id === 'horde') c.shadowAt = [-12, 0, -18];
  if (S.id === 'reveal') c.shadowAt = [PILE[0], 0, PILE[1] - 10];
  if (S.id === 'dusk') c.shadowAt = [HILL[0], 14, HILL[1] - 4];
  if (S.id === 'victory') c.shadowAt = [HILL[0], 14, HILL[1] - 9];
  return c;
};
// soldier column position during the retreat
const soldierZ = (f) => f < 904 ? -14 + (f - 870) * 0.035 : -12.8 - (f - 904) * 0.06;

// ---------- lens ----------
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
export const dofAt = (f) => {
  const S = shotAt(f), C = camAt(f);
  switch (S.id) {
    case 'march': return { focus: dist(C.pos, [0, 1.6, -1.2]), cinf: 5 };
    case 'birds': return { focus: dist(C.pos, [0.2, 1.6, -0.4]), cinf: f < 96 ? 7 : 10 };
    case 'farmers': return { focus: dist(C.pos, [-14.2, 1.5, -31]), cinf: 8 };
    case 'deliver': return { focus: dist(C.pos, [1, 1.4, 1.5]), cinf: 5 };
    case 'unload': return { focus: dist(C.pos, [0.8, 1, 4]), cinf: 5 };
    case 'first': return f < 399 ? { focus: dist(C.pos, [NEST1[0], 0.9, NEST1[1] + 0.4]), cinf: 12 } : { focus: 40, cinf: lerp(6, 0, ramp(f, 399, 415)) };
    case 'dizzy': return { focus: dist(C.pos, [8.4, 1.0, -3.4]), cinf: 4 };
    case 'ambush': return { focus: dist(C.pos, [AMB[0], 1.6, AMB[1] + 0.4]), cinf: 10 };
    case 'approach': return { focus: f < 599 ? 30 : 20, cinf: 5, near: 1.2 };
    case 'jam': return { focus: dist(C.pos, [AMB[0] + 0.3, 1.5, AMB[1] + 0.8]), cinf: 9 };
    case 'truck': return { focus: dist(C.pos, [TRK, 1.6, truckAt(f).z]), cinf: 5 };
    case 'slow': return { focus: 6, cinf: 4 };
    case 'bumpy': return { focus: 7.3, cinf: 5 };
    case 'retreat': return { focus: 5.6, cinf: 7 };
    case 'pile': return { focus: dist(C.pos, [PILE[0], 1.6, PILE[1]]), cinf: 7 };
    case 'reveal': return { focus: lerp(7, 60, E.smooth(ramp(f, 995, 1030))), cinf: 5 };
    case 'cmdr': return { focus: dist(C.pos, [8.0, 1.6, 0.4]), cinf: 10 };
    case 'tank': return { focus: dist(C.pos, [8.0, 1.9, 0.4]), cinf: 10 };
    case 'dusk': return { focus: 60, cinf: 3 };
    case 'victory': return { focus: dist(C.pos, [HILL[0], 15, HILL[1] - 9]), cinf: lerp(9, 5, ramp(f, 1209, 1261)) };
  }
  return { focus: 10, cinf: 0 };
};

// ---------- world state ----------
const EAT_WEST = { front: -5, x0: -150, x1: -3.7 };
export const worldAt = (f) => {
  const S = shotAt(f), W = { truck: truckAt(f), wheatR: 34 };
  switch (S.id) {
    case 'march': W.wheatC = [0, -16]; W.wheatR = 30; break;
    case 'birds': W.wheatC = [0, -10]; W.wheatR = 24; break;
    case 'horde': { const k = E.smooth(ramp(f, 123, 210)) * 0.55 + ramp(f, 123, 210) * 0.45; const fr = lerp(-88, -8, k);
      W.eat = { front: fr, x0: -150, x1: -3.7 }; W.fenceFall = fr; W.wheatC = [-12, -16]; W.wheatR = 36; W.hordeFront = fr; break; }
    case 'farmers': W.eat = EAT_WEST; W.fenceFall = -5; W.wheatC = [-6, -24]; W.wheatR = 22; W.table = [FARMERS[0], 0, FARMERS[1] - 0.2, 0.05];
      W.tableJump = [226, 241, 253].reduce((a, k) => a + (f >= k && f < k + 6 ? 0.05 * Math.sin((f - k) / 6 * Math.PI) : 0), 0); break;
    case 'deliver': W.wheatC = [-6, -4]; W.wheatR = 24; break;
    case 'unload': { W.wheatC = [-6, 6]; W.wheatR = 18;
      const tr = W.truck, cr = [];
      const drops = [298, 310, 322, 334, 344, 354], spots = [[2.6, 6.2], [3.4, 6.4], [3.0, 6.3], [-0.9, 6.6], [-0.1, 6.8], [-0.5, 6.7]], hs = [0, 0, 0.5, 0, 0, 0.5];
      drops.forEach((d, i) => { const t = ramp(f, d - 9, d), b = f > d ? 0.08 * Math.exp(-(f - d) / 3) * Math.abs(Math.sin((f - d) * 1.2)) : 0;
        const from = tw(tr, 0, 1.06 - (tr.bounce || 0), -2.4 + i * 0.05), to = [spots[i][0], hs[i], spots[i][1]];
        if (f < d - 9) cr.push([from[0] + (i % 2 ? 0.3 : -0.3), from[1], from[2] + 0.3, 0.1 * i, 0, 0]);
        else { const p = lerp3(from, to, t); p[1] += Math.sin(t * Math.PI) * 0.9 + b; cr.push([p[0], p[1], p[2], 0.2 * i + t * 0.6, (1 - t) * 0.5 * (i % 2 ? 1 : -1), 0]); } });
      W.crates = cr;
      const up = (a) => 0.06 + 0.36 * E.back(ramp(f, a, a + 10));
      W.guns = [{ x: 2.0, y: up(326), z: 8.3, ry: Math.PI * 0.92 }, { x: -1.4, y: up(346), z: 8.6, ry: -Math.PI * 0.95 }];
      break; }
    case 'first': { W.wheatC = f < 399 ? [6, -12] : [16, -40]; W.wheatR = f < 399 ? 14 : 44; W.eat = { patch: [18, -46, 12] };
      W.guns = [{ x: NEST1[0], y: 0.62, z: NEST1[1] - 0.7, ry: Math.PI, jit: f > 392 ? 0.01 * Math.sin(f * 3) : 0 }, { x: NEST2[0], y: 0.62, z: NEST2[1] - 0.7, ry: Math.PI }]; break; }
    case 'dizzy': W.wheatC = [8, -14]; W.wheatR = 14; W.eat = { patch: [18, -46, 12] };
      W.guns = [{ x: NEST1[0], y: 0.62, z: NEST1[1] - 0.7, ry: Math.PI + 0.5 * Math.sin(f * 0.3) }, { x: NEST2[0], y: 0.62, z: NEST2[1] - 0.7, ry: Math.PI - 0.4 }]; break;
    case 'ambush': W.guns = [{ x: AMB[0] + 0.35, y: 1.42, z: AMB[1] - 0.15, ry: Math.PI + 0.03 * Math.sin(f * 0.2) }]; break;
    case 'approach': { const firing = f >= 599; W.guns = [{ x: AMB[0] + 0.35, y: 1.42, z: AMB[1] - 0.15, ry: Math.PI + (firing ? 0.06 * Math.sin(f * 1.7) : 0), recoil: firing ? (f % 2) * 0.06 : 0, jit: firing ? 0.02 * Math.sin(f * 5) : 0 }]; break; }
    case 'jam': { const firing = f < 632, bang = f >= 657 && (f - 657) % 6 < 2; W.guns = [{ x: AMB[0] + 0.35, y: 1.42, z: AMB[1] - 0.15, ry: Math.PI, recoil: firing ? (f % 2) * 0.05 : 0, jit: firing ? 0.02 * Math.sin(f * 5) : bang ? 0.05 : 0, kick: bang ? -0.08 : 0 }]; break; }
    case 'retreat': W.eat = EAT_WEST; W.fenceFall = -5; W.wheatC = [6, soldierZ(f)]; W.wheatR = 26; break;
    case 'pile': W.pileFlow = (f - 926) / 30; W.wheatC = null; W.eat = { front: 60 }; break;
    case 'reveal': W.pileFlow = (f - 926) / 30; W.eat = { front: 60 }; W.fenceFall = 60; break;
    case 'cmdr': case 'tank': W.wheatC = [6, -12]; W.wheatR = 14; W.eat = { front: 60 }; W.guns = [{ x: NEST1[0], y: 0.62, z: NEST1[1] - 0.7, ry: Math.PI }];
      break;
  }
  return W;
};

// ---------- herd (instanced emus) ----------
const rnd = (i, k = 0) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };
const runFr = (f, i, alt = 0, spd = 1) => (alt ? 10 : 0) + Math.floor(((f * 0.1 * spd + rnd(i, 9)) % 1) * 10);
const frontFr = (f, i, spd = 1) => 30 + Math.floor(((f * 0.12 * spd + rnd(i, 9)) % 1) * 8);
const peckFr = (f, i) => 20 + Math.floor(((f * 0.045 + rnd(i, 8)) % 1) * 4);
/** pick frame + flip for an emu at p moving with velocity v (xz), seen from camera c */
const pose = (f, i, p, v, c, spd = 1) => {
  const sp = Math.hypot(v[0], v[1]);
  const tc = [c[0] - p[0], c[2] - p[2]], tl = Math.hypot(tc[0], tc[1]) || 1, right = [tc[1] / tl, -tc[0] / tl];
  if (sp < 0.05) return [i % 7 === 0 ? 24 + (i % 2) : peckFr(f, i), rnd(i, 4) < 0.5 ? 1 : -1];
  const toward = (v[0] * tc[0] + v[1] * tc[1]) / (sp * tl);
  if (toward > 0.82) return [frontFr(f, i, spd), rnd(i, 5) < 0.5 ? 1 : -1];
  return [runFr(f, i, i % 3 === 0, spd), (v[0] * right[0] + v[1] * right[1]) >= 0 ? 1 : -1];
};
export const herdAt = (f) => {
  const S = shotAt(f), C = camAt(f), L = [];
  const push = (i, x, z, v, s = 1, y = 0, spd = 1, fr) => { const [frame, fl] = fr || pose(f, i, [x, 0, z], v, C.pos, spd); L.push([x, y, z, s * (0.92 + 0.16 * rnd(i, 2)), frame, fl, 0.88 + 0.2 * rnd(i, 3)]); };
  switch (S.id) {
    case 'birds': { // a few curious emus wandering in the wheat behind
      for (let i = 0; i < 9; i++) push(i, -6 - rnd(i) * 20, -12 - rnd(i, 1) * 30, [0, 0]); return { list: L }; }
    case 'horde': {
      const fr = worldAt(f).hordeFront, n = 1500;
      for (let i = 0; i < n; i++) {
        const x = -148 + rnd(i, 1) * 144; if (x > -4.2) continue;
        if (i % 3 === 0) { const z = fr - 6 - rnd(i, 2) * 140; if (z < -330) continue; push(i, x, z, [0, 0], 1.4); } // grazing behind the front
        else { const z = fr - rnd(i, 2) * 10 - 1.5 + 2 * Math.sin(f * 0.2 + i); push(i, x + Math.sin(f * 0.05 + i) * 0.6, z, [0.15 * (rnd(i, 6) - 0.5), 1], 1.5, 0, 2.2); }
      }
      return { list: L }; }
    case 'farmers': for (let i = 0; i < 70; i++) push(i, -20 - rnd(i, 1) * 90, -38 - rnd(i, 2) * 120, rnd(i, 3) < 0.3 ? [0.3, 0.2] : [0, 0]); return { list: L };
    case 'march': for (let i = 0; i < 26; i++) push(i, -10 - rnd(i, 1) * 60, -40 - rnd(i, 2) * 90, [0, 0]); return { list: L };
    case 'deliver': case 'unload': for (let i = 0; i < 40; i++) push(i, -8 - rnd(i, 1) * 70, -10 - rnd(i, 2) * 120, [0, 0]); return { list: L };
    case 'first': case 'dizzy': {
      const C0 = [18, -46], split = 405; const n = 190;
      for (let i = 0; i < n; i++) {
        const g = i % 12, ga = g / 12 * Math.PI * 2 + 0.2 * Math.sin(g * 3), r0 = 1.2 + rnd(i, 1) * 6.5, a0 = rnd(i, 2) * Math.PI * 2;
        const t = Math.max(0, (f - split) / 30), spd = 9 + 2 * rnd(g, 4), d = spd * t, curve = 0.35 * Math.sin(g * 1.7) * t;
        const ox = Math.cos(a0) * r0 * (0.45 + 0.55 * Math.exp(-t * 2)), oz = Math.sin(a0) * r0 * (0.45 + 0.55 * Math.exp(-t * 2));
        const dir = ga + curve; const x = C0[0] + ox + Math.cos(dir) * d, z = C0[1] + oz + Math.sin(dir) * d;
        const v = t > 0 ? [Math.cos(dir), Math.sin(dir)] : [0, 0];
        if (S.id === 'dizzy' && Math.hypot(x - 8, z + 3) > 70) continue;
        push(i, x, z, v, 1.35, 0, 2.6);
      }
      if (S.id === 'dizzy') for (let i = 0; i < 14; i++) { // groups streaking right past the soldiers
        const a = i / 14 * Math.PI * 2, t = ((f - 451) / 30 * 0.9 + rnd(i, 5)) % 1, R = 22, x = 8.4 + Math.cos(a) * (t * 2 - 1) * R + Math.sin(a) * (3 + 2 * rnd(i)), z = -3.4 + Math.sin(a) * (t * 2 - 1) * R - Math.cos(a) * (3 + 2 * rnd(i));
        push(200 + i, x, z, [Math.cos(a), Math.sin(a)], 1, 0, 2.8);
      }
      return { list: L, upright: S.id === 'first' ? 1 - E.smooth(ramp(f, 405, 430)) * 0.85 : 0.6 }; }
    case 'approach': case 'ambush': case 'jam': {
      const n = S.id === 'ambush' ? 0 : 1150;
      for (let i = 0; i < n; i++) {
        const x = POND[0] - 45 + rnd(i, 1) * 90, z0 = POND[1] - 8 - Math.pow(rnd(i, 2), 0.8) * 150;
        if (S.id === 'approach') { const z = z0 + (f - 555) * 0.09 * (1 + rnd(i, 3)); const hop = f >= 600 ? Math.max(0, Math.sin((f - 600 + i * 3) * 0.5)) * 0.4 * (z > POND[1] - 70 ? 1 : 0) : 0; push(i, x, z, [0, 0.4 + (f >= 600 ? 0.6 : 0)], 1, hop, 0.7); }
        else { const t = Math.max(0, (f - 630) / 30), z = z0 + 9 - t * t * 10 - t * 6, v = t > 0 ? [0.2 * (rnd(i, 4) - 0.5), -1] : [0, 0.3]; push(i, x + (rnd(i, 4) - 0.5) * t * 10, z, v, 1, 0, 2.5); }
      }
      return { list: L }; }
    case 'truck': for (let i = 0; i < 40; i++) push(i, TRK - 8 - rnd(i, 1) * 50, -30 - rnd(i, 2) * 90, [0, 0]); return { list: L };
    case 'slow': case 'bumpy': { const t = truckAt(f);
      for (let i = 0; i < 26; i++) { const lane = i % 2 ? 1 : -1, lx = TRK + lane * (3.2 + rnd(i, 1) * 9), rel = (S.id === 'slow' ? 14 : 9.3) - 9; // emus overtake (slow) or keep pace (bumpy)
        const z = t.z + 8 - rnd(i, 2) * 40 - rel * ((f - S.a) / 30) * (S.id === 'slow' ? 1 : 0) + (S.id === 'bumpy' ? Math.sin(f * 0.05 + i) * 2 : 0);
        if (S.id === 'slow' && Math.abs(lx - TRK) < 4.5 && Math.abs(z - t.z + 1) < 4) continue;
        push(i, lx, z, [0, -1], 1, 0, 2.6); }
      return { list: L }; }
    case 'retreat': { const back = f >= 904;
      for (let i = 0; i < 40; i++) { const x = (i % 2 ? -1 : 1) * (8 + rnd(i, 1) * 26), z = back ? 10 + rnd(i, 2) * 30 : -34 - rnd(i, 2) * 40;
        const fr = 26 + ((Math.floor(f / 4) + i) % 2); push(i, x, z, [0, 0], 1, 0, 1, back ? undefined : [fr, rnd(i, 4) < 0.5 ? 1 : -1]); }
      return { list: L }; }
    case 'pile': for (let i = 0; i < 30; i++) push(i, PILE[0] - 30 + rnd(i, 1) * 60, PILE[1] - 30 - rnd(i, 2) * 60, [0, 0]); return { list: L };
    case 'reveal': {
      for (let i = 0; i < 1800; i++) { const x = PILE[0] - 120 + rnd(i, 1) * 200, z = PILE[1] - 16 - Math.pow(rnd(i, 2), 0.7) * 260; const walk = rnd(i, 5) < 0.25;
        push(i, x + (walk ? (f - 991) * 0.04 * (rnd(i, 6) - 0.5) : 0), z, walk ? [rnd(i, 6) - 0.5, 0.1] : [0, 0], 1, 0, 0.6); }
      return { list: L }; }
    case 'cmdr': case 'tank': for (let i = 0; i < 60; i++) push(i, -10 + rnd(i, 1) * 60, -14 - rnd(i, 2) * 80, [0, 0]); return { list: L };
    case 'dusk': case 'victory': {
      for (let i = 0; i < 70; i++) { const a = (rnd(i, 1) - 0.5) * 0.5, R = 80, x = HILL[0] + Math.sin(a) * R * 1.6, z = HILL[1] - Math.cos(a) * R * 0.25 + 4 + rnd(i, 2) * 14, y = 14 - Math.pow(x - HILL[0], 2) / (2 * 128 * 128 / 80) - Math.max(0, (z - HILL[1])) * 0.0;
        const fr = rnd(i, 3) < 0.4 ? 28 + (i % 2) : 24 + (i % 2) * 3; const zz = HILL[1] - 5 + rnd(i, 2) * 9, xx = HILL[0] + (rnd(i, 1) - 0.5) * 60; push(i, xx, zz, [0, 0], 1.05, hillY(xx, zz), 1, [fr, rnd(i, 4) < 0.5 ? 1 : -1]); }
      return { list: L, tint: S.id === 'dusk' ? '#4a2c3a' : '#5a3644', blobs: false }; }
  }
  return { list: L };
};
// surface height of the sunset hill (sphere r=80 centred 66 m below, x scaled 1.6)
export const hillY = (x, z) => { const dx = (x - HILL[0]) / 1.6, dz = z - HILL[1], r2 = 80 * 80 - dx * dx - dz * dz; return r2 > 0 ? Math.sqrt(r2) - 66 : -66; };

// ---------- actors (2D cards) ----------
const R = (T, who, o, pos, extra = {}) => ({ key: who + JSON.stringify(o), draw: (p) => T.aussieFront(p, who, o), x: pos[0], y: pos[1], z: pos[2], ...extra });
const EM = (T, o, pos, extra = {}) => ({ key: 'emu' + JSON.stringify(o), draw: (p) => T.emuDraw(p, o), x: pos[0], y: pos[1], z: pos[2], ...extra });
const HAT = (T, kind, pos, extra = {}) => ({ key: 'hat' + kind, draw: (p) => T.hatCard(p, kind), x: pos[0], y: pos[1], z: pos[2], blob: false, ...extra });
const idleO = (f, seed) => ({ bob: q(0.006 * Math.sin((f + seed * 11) * 0.11), 3), tilt: q(1.2 * Math.sin((f + seed * 7) * 0.05), 1), headTilt: q(1.5 * Math.sin((f + seed * 5) * 0.037 + 1), 1) });
const marchO = (f, seed, sp = 1) => { const ph = ((f * 0.055 * sp + seed * 0.13) % 1); return { step: q(ph, 2), swing: q(ph, 2), L: 'march', R: 'march', bob: q(Math.abs(Math.sin(ph * Math.PI * 2)) * 0.02, 3) }; };
const TINT = '#ffffff';

export const actorsAt = (f, T) => {
  const S = shotAt(f), out = [];
  switch (S.id) {
    case 'march': {
      const z0 = -1.4 + (f) * 0.042;
      out.push(R(T, 'cmdr', { expr: 'stern', seed: 3, blink: blinkAt(f, 3), ...marchO(f, 3), L: 'march', R: 'march' }, [0.0, 0, z0]));
      [['sold1', -0.75, -1.5, 5, 'determined'], ['sold2', 0.8, -1.6, 8, 'determined'], ['sold3', -0.8, -3.0, 21, 'determined'], ['sold4', 0.75, -3.1, 22, 'determined']]
        .forEach(([w, x, dz, s, e]) => out.push(R(T, w, { expr: e, seed: s, blink: blinkAt(f, s), ...marchO(f, s) }, [x, 0, z0 + dz])));
      break;
    }
    case 'birds': {
      const pre = f < 96, hatT = (f - 97) / 30;
      const frz = f >= 80;
      out.push(R(T, 'cmdr', { expr: pre ? (frz ? 'shock' : 'stern') : 'shock', seed: 3, blink: frz ? 0 : blinkAt(f, 3), hatOff: f >= 97, L: pre ? 'hang' : 'cheek', R: pre ? 'hang' : 'cheek', look: frz ? -0.6 : 0, ...(frz ? {} : idleO(f, 3)) }, [0.45, 0, -0.6], { order: 3 }));
      out.push(R(T, 'sold1', { expr: frz ? 'shock' : 'determined', seed: 5, blink: frz ? 0 : blinkAt(f, 5), look: frz ? -0.6 : 0 }, [-0.55, 0, -2.6]));
      out.push(R(T, 'sold2', { expr: frz ? 'panic' : 'determined', seed: 8, blink: frz ? 0 : blinkAt(f, 8), L: frz ? 'cheek' : 'hang', R: frz ? 'cheek' : 'hang', look: frz ? -0.5 : 0 }, [1.15, 0, -2.4]));
      // emu head slides in from frame left, winks, then grins
      const slide = E.back(ramp(f, 62, 78)), ex = lerp(-2.6, -0.62, slide);
      const expr = f < 82 ? 'neutral' : f < 96 ? 'wink' : 'grin';
      out.push(EM(T, { pose: 'stand', head: 'cam', expr, headTilt: q(f < 96 ? 10 * Math.sin(ramp(f, 78, 90) * Math.PI) : -6, 0), look: -0.4 }, [ex, 0, 0.25], { order: 4 }));
      if (f >= 97) { const t = hatT, y = 1.82 + 1.4 * t - 4.9 * t * t, x = 0.35 + 0.6 * t; if (y > -0.2) out.push(HAT(T, 'peak', [x, Math.max(0, y - 1.2), -0.55], { s: 0.55, roll: q(t * 7, 1), order: 5 })); }
      break;
    }
    case 'horde': { // chaff + dust along the front near camera handled in fx
      break;
    }
    case 'farmers': {
      const wv = (f - 211) * 0.55;
      out.push(R(T, 'farmA', { expr: (f % 16) < 8 ? 'angry' : 'yell', seed: 11, L: 'fist', R: 'point', wv: q(wv, 1), blink: blinkAt(f, 11), headTilt: q(4 * Math.sin(f * 0.4), 1) }, [FARMERS[0] - 0.85, 0, FARMERS[1] - 0.25]));
      const slam = [226, 241, 253].some((k) => f >= k - 4 && f < k + 3);
      out.push(R(T, 'farmB', { expr: slam ? 'yell' : 'angry', seed: 12, R: 'slam', L: 'hip', wv: slam ? 0 : 1.57, blink: blinkAt(f, 12), headTilt: q(3 * Math.sin(f * 0.3), 1) }, [FARMERS[0] + 0.05, 0, FARMERS[1] - 0.9]));
      out.push(R(T, 'farmC', { expr: (f % 20) < 10 ? 'angry' : 'pained', seed: 13, L: (f % 24) < 12 ? 'shrug' : 'fist', R: 'shrug', wv: q(wv * 1.2, 1), blink: blinkAt(f, 13) }, [FARMERS[0] + 0.9, 0, FARMERS[1] - 0.35]));
      break;
    }
    case 'deliver': {
      const t = truckAt(f); out.push(R(T, 'sold2', { expr: f > 276 ? 'panic' : 'nervous', seed: 8, L: 'grip', R: 'grip', headTilt: q(4 * Math.sin(f * 0.8), 1) }, tw(t, -0.4, 0.62, 0.95), { s: 0.82, blob: false, shadow: false }));
      break;
    }
    case 'unload': {
      const t = truckAt(f);
      // soldiers hop down from the tail, cmdr points
      const hop = (who, seed, a, lx, land, expr) => { const k = ramp(f, a, a + 10), from = tw(t, lx, 1.06, -2.6), y = from[1] * (1 - k) + Math.sin(k * Math.PI) * 0.6, p = lerp3(from, land, k);
        out.push(R(T, who, { expr, seed, blink: blinkAt(f, seed), L: k < 1 && k > 0 ? 'up' : 'hang', R: k < 1 && k > 0 ? 'up' : 'hang', ...idleO(f, seed) }, [p[0], y, p[2]], { blob: y < 0.3 })); };
      hop('sold3', 21, 292, -0.4, [-0.2, 0, 5.4], 'determined'); hop('sold4', 22, 300, 0.4, [1.7, 0, 5.2], 'determined');
      hop('sold1', 5, 312, 0, [0.6, 0, 7.4], 'grin'); hop('sold2', 8, 330, 0.2, [-1.3, 0, 7.6], 'nervous');
      out.push(R(T, 'cmdr', { expr: 'stern', seed: 3, R: 'point', L: 'hip', blink: blinkAt(f, 3), ...idleO(f, 3) }, [2.9, 0, 5.0]));
      break;
    }
    case 'first': {
      if (f < 405) out.push(R(T, 'sold1', { expr: f < 380 ? 'determined' : 'aim', seed: 5, L: 'grip', R: 'grip', blink: 0, headTilt: q(-4 + 2 * Math.sin(f * 0.2), 1) }, [NEST1[0] + 0.05, -0.62, NEST1[1] + 0.35]));
      else out.push(R(T, 'sold1', { expr: f < 418 ? 'aim' : 'shock', seed: 5, L: 'grip', R: 'grip', blink: 0 }, [NEST1[0] + 0.05, -0.62, NEST1[1] + 0.35], { face: f > 412 ? 'cam' : undefined }));
      if (f >= 399) { out.push(R(T, 'sold2', { expr: f < 418 ? 'nervous' : 'shock', seed: 8, blink: 0 }, [NEST2[0], -0.5, NEST2[1] + 0.4], { face: f > 412 ? 'cam' : undefined })); }
      break;
    }
    case 'dizzy': {
      const spin = (who, seed, x, z, sp, ph) => { const a = (f - 451) * sp + ph, c = Math.cos(a);
        out.push(R(T, who, { expr: 'dazed', seed, L: 'flail', R: 'flail', wv: q(f * 0.6 + seed, 1), tilt: q(8 * Math.sin(f * 0.21 + seed), 0) }, [x + 0.2 * Math.sin(f * 0.17 + seed), 0, z], { sx: Math.max(0.18, Math.abs(c)), flip: c < 0, face: 'cam' })); };
      spin('sold1', 5, 7.55, -3.3, 0.42, 0); spin('sold2', 8, 9.25, -3.1, 0.38, 1.5); spin('sold3', 21, 8.4, -5.0, 0.5, 3);
      break;
    }
    case 'ambush': {
      const look = q(Math.sin(f * 0.12) > 0 ? 0.9 : -0.9, 1);
      out.push(R(T, 'sold1', { expr: 'squint', seed: 5, leaves: true, look, blink: blinkAt(f, 5) }, [AMB[0] - 0.55, 0.46, AMB[1] + 0.55]));
      out.push(R(T, 'sold2', { expr: 'nervous', seed: 8, leaves: true, look: -look, blink: blinkAt(f, 8) }, [AMB[0] + 0.62, 0.64, AMB[1] + 0.6]));
      break;
    }
    case 'approach': {
      break;
    }
    case 'jam': {
      const jammed = f >= 652, bang = f >= 657 && (f - 657) % 6 < 3;
      out.push(R(T, 'sold1', { expr: f < 632 ? 'yell' : !jammed ? 'determined' : f < 657 ? 'shock' : 'angry', seed: 5, leaves: true, L: 'grip', R: jammed && f >= 656 ? 'slam' : 'grip', wv: bang ? 1.57 : 0, blink: 0 }, [AMB[0] + 0.45, 0, AMB[1] + 0.75]));
      out.push(R(T, 'sold2', { expr: jammed ? 'panic' : 'nervous', seed: 8, leaves: true, L: jammed ? 'cheek' : 'hang', R: jammed ? 'cheek' : 'hang', blink: blinkAt(f, 8) }, [AMB[0] - 0.7, 0, AMB[1] + 0.9]));
      break;
    }
    case 'truck': case 'slow': case 'bumpy': {
      const t = truckAt(f);
      const drvE = S.id === 'truck' ? (f < 690 ? 'determined' : 'panic') : S.id === 'slow' ? (f > 768 ? 'shock' : 'panic') : 'chatter';
      out.push(R(T, 'sold2', { expr: drvE, seed: 8, L: 'grip', R: 'grip', headTilt: q(5 * Math.sin(f * 0.9), 1) }, tw(t, -0.4, 0.62, 0.95), { s: 0.82, blob: false, shadow: false }));
      let gy = 1.06, hatOff = false;
      if (S.id === 'bumpy') { const ph = (f - 788) / 13; gy += Math.max(0, Math.sin(ph * Math.PI - 0.5)) * 0.9; hatOff = f > 806; }
      out.push(R(T, 'sold1', { expr: S.id === 'bumpy' ? 'chatter' : S.id === 'slow' ? 'shock' : 'determined', seed: 5, L: S.id === 'bumpy' ? 'flail' : 'grip', R: S.id === 'bumpy' ? 'flail' : 'grip', wv: q(f * 0.7, 1), hatOff, headTilt: q(S.id === 'bumpy' ? 9 * Math.sin(f * 1.3) : 0, 0) }, tw(t, 0, gy, -2.35), { blob: false }));
      if (S.id === 'bumpy' && f > 806) { const k = (f - 806) / 30; const p = tw(t, 0.4 + k * 2, 2.6 + k * 2.2 - k * k * 2.4, -2.4 - k * 9); out.push(HAT(T, 'slouch', p, { s: 0.6, roll: q(k * 9, 1) })); }
      if (S.id === 'slow') { // the cheeky emu running alongside the cab, winking at the driver
        const p = tw(t, -1.9, 0, 2.5); const ph = q(((f * 0.1) % 1), 1);
        out.push(EM(T, { pose: 'run', phase: ph, head: 'cam', expr: f > 760 ? 'wink' : 'smug', look: -0.7, headTilt: -8 }, [p[0], 0, p[2]], { order: 3 }));
      }
      if (S.id === 'bumpy') { const p = tw(t, 2.7, 0, 0.6); out.push(EM(T, { pose: 'run', phase: q((f * 0.1) % 1, 1), head: 'cam', expr: 'happy', look: -0.6 }, [p[0], 0, p[2]])); }
      break;
    }
    case 'retreat': {
      const cz = soldierZ(f), back = f >= 904;
      const sad = { expr: 'sad', L: 'droop', R: 'droop' }, det = { expr: 'determined' };
      const sp = back ? 1.2 : 0.55;
      const col = [['cmdr', 0, 3], ['sold1', -0.8, 5], ['sold2', 0.8, 8], ['sold3', -0.75, 21], ['sold4', 0.75, 22]];
      col.forEach(([w, x, s], i) => { const dz = (i === 0 ? 0 : i < 3 ? 1.4 : 2.8) * (back ? 1 : -1); const o = back ? { ...det, ...marchO(f, s, sp) } : { ...sad, ...marchO(f, s, sp), L: 'droop', R: 'droop' };
        if (w === 'cmdr' && !back) o.hatOff = true;
        out.push(R(T, w, { seed: s, blink: blinkAt(f, s), ...o, headTilt: back ? 0 : 6 }, [x, 0, cz + dz])); });
      break;
    }
    case 'pile': {
      out.push(R(T, 'cmdr', { expr: 'pained', seed: 3, L: 'hip', R: 'cheek', blink: blinkAt(f, 3), ...idleO(f, 3) }, [PILE[0] - 1.7, 0, PILE[1] + 5.4]));
      out.push(R(T, 'sold1', { expr: 'dazed', seed: 5, L: 'hang', R: 'shrug', ...idleO(f, 5) }, [PILE[0] + 1.3, 0, PILE[1] + 5.2]));
      break;
    }
    case 'reveal': {
      break;
    }
    case 'cmdr': case 'tank': {
      const bin = S.id === 'cmdr' && f < 1088;
      out.push(R(T, 'cmdr', { expr: S.id === 'tank' ? (f < 1130 ? 'shock' : 'pained') : bin ? 'stern' : 'shock', seed: 3, L: bin ? 'binoc' : 'hang', R: bin ? 'binoc' : 'cheek', blink: bin ? 0 : blinkAt(f, 3), ...idleO(f, 3) }, [8.0, 0, 0.6]));
      break;
    }
    case 'dusk': case 'victory': {
      const v = S.id === 'victory', y = hillY(HILL[0], HILL[1] - 9);
      out.push(EM(T, { pose: v ? 'proud' : 'stand', head: v || f > 1188 ? 'cam' : 'side', expr: v ? (f > 1240 ? 'wink' : 'proud') : 'smug', chief: true, hat: true, headTilt: q(v ? -4 + 3 * Math.sin(f * 0.1) : 0, 0), flap: v ? q(0.5 + 0.5 * Math.sin(f * 0.4), 1) : 0 }, [HILL[0], y, HILL[1] - 9], { tint: v ? '#ffd9c4' : '#5e3a48', s: 1.1, blob: false }));
      break;
    }
  }
  return out;
};

// ---------- 2D effects ----------
const FX = (key, draw, pos, s, extra = {}) => ({ key, draw, x: pos[0], y: pos[1], z: pos[2], s, blob: false, shadow: false, order: 5, ...extra });
export const fxAt = (f, T) => {
  const S = shotAt(f), out = [];
  const flashAt = (p, s, i) => out.push(FX('flash' + (i % 3), (pp) => T.fxFlash(pp, (i % 3) * 0.7), p, s, { face: 'cam', roll: q((i % 4) * 0.4, 1) }));
  const feathers = (cx, cz, t0, n, spread = 3, y0 = 1.2) => { for (let i = 0; i < n; i++) { const t = (f - t0) / 30 - rnd(i, 7) * 0.4; if (t < 0 || t > 1.4) continue;
    const a = rnd(i, 1) * 6.28, x = cx + Math.cos(a) * spread * (0.3 + t), z = cz + Math.sin(a) * spread * 0.5 * (0.3 + t), y = y0 + 1.6 * t - 1.0 * t * t + 0.2 * Math.sin(t * 9 + i);
    out.push(FX('feather' + (i % 3), (p) => T.fxFeather(p, i % 3), [x, Math.max(0.1, y), z], 0.35, { roll: q(Math.sin(t * 6 + i) * 1.2, 1), face: 'cam' })); } };
  const dust = (key, p, k, s, col = '#d99a6a') => { if (k > 0 && k < 1) out.push(FX(key + q(k, 1), (pp) => T.fxDust(pp, q(k, 1), col), p, s * 0.42, { tint: '#ffffff', alpha: 0.85, order: 1 })); };
  switch (S.id) {
    case 'birds': if (f >= 97 && f < 108) { const t = q((f - 97) / 11, 2); out.push(FX('stars' + t, (p) => { p.g.translate(90, 300); T.fxStars(p, t); }, [0.35, 1.25, -0.5], 0.7)); } break;
    case 'horde': { const fr = worldAt(f).hordeFront;
      for (let i = 0; i < 10; i++) { const x = -6 - i * 3.2 - rnd(i) * 2, k = q(((f * 0.05 + rnd(i, 1)) % 1), 1); if (fr < -60) continue; dust('hdust', [x, 0, fr - 1.5], k, 3.2, '#e0b070'); }
      for (let i = 0; i < 6; i++) { const t = q(((f * 0.06 + rnd(i, 2)) % 1), 1); if (fr < -50) continue; out.push(FX('chaff' + t + (i % 2), (p) => T.fxChaff(p, t, i % 2), [-5 - i * 4, 0.2, fr + 0.5], 1.6)); }
      break; }
    case 'deliver': dust('dl', [1.0, 0, 3.2], q(ramp(f, 270, 289), 2), 4.5, '#d9a070'); break;
    case 'unload': for (const d of [298, 310, 322, 334, 344, 354]) { const k = ramp(f, d, d + 12); dust('cd' + d, [d < 334 ? 3.0 : -0.5, 0, 6.6], q(k, 2), 1.2, '#d9a070'); } break;
    case 'first': if (f >= 405) for (let g = 0; g < 12; g++) { const a = g / 12 * Math.PI * 2, t = (f - 405) / 30, d = 14 * t; dust('sd' + g, [18 + Math.cos(a) * d * 0.8, 0, -46 + Math.sin(a) * d * 0.8], q(ramp(f, 405 + g, 440 + g), 2), 5); } break;
    case 'dizzy': {
      for (const [x, z, s] of [[7.55, -3.3, 5], [9.25, -3.1, 8], [8.4, -5.0, 21]]) { const t = q(((f * 0.04 + s * 0.1) % 1), 2); out.push(FX('stars' + t, (p) => { p.g.translate(90, 250); T.fxStars(p, t); }, [x, 2.05, z], 0.6, { face: 'cam' })); }
      break; }
    case 'approach': if (f >= 599) {
      flashAt([AMB[0] + 0.35, 1.42 - 1.07 * 0.9, AMB[1] - 1.55], 0.9, f);
      feathers(AMB[0] - 3, AMB[1] - 26, 600, 18, 9, 1.4); feathers(AMB[0] + 4, AMB[1] - 32, 604, 12, 8, 1.6);
    } break;
    case 'jam': {
      if (f < 632) { flashAt([AMB[0] + 0.35, 1.42 - 1.07 * 0.6, AMB[1] - 1.55], 0.6, f); feathers(AMB[0] - 4, AMB[1] - 14, 616, 10, 5, 1.3); }
      if (f >= 652 && f < 672) { const t = q((f - 652) / 20, 2); out.push(FX('smoke' + t, (p) => T.fxSmoke(p, t), [AMB[0] + 0.35, 1.6, AMB[1] - 0.35], 0.6)); }
      if (f >= 653 && f < 659) { const t = q((f - 653) / 6, 2); out.push(FX('spark' + t, (p) => T.fxSpark(p, t), [AMB[0] + 0.35, 1.68, AMB[1] - 0.3], 0.35, { face: 'cam' })); }
      for (let i = 0; i < 6; i++) dust('jd' + i, [AMB[0] - 12 + i * 5, 0, AMB[1] - 26 - i * 3], q(ramp(f, 632 + i * 3, 672), 2), 6, '#d9a070');
      break; }
    case 'truck': { const t = truckAt(f); for (const k0 of [680, 700]) { const k = ramp(f, k0, k0 + 14); if (k > 0 && k < 1) { const p = tw(t, 0.6, 0.2, -3.0); out.push(FX('bang' + q(k, 1), (pp) => T.fxSmoke(pp, q(k, 1)), p, 0.45)); } }
      if (f > 688) dust('td', tw(t, 0, 0, -4.5), q((f * 0.06) % 1, 2), 3.5); break; }
    case 'slow': { const t = truckAt(f); dust('sd', tw(t, 0, 0, -4), q((f * 0.07) % 1, 2), 3); out.push(FX('speed' + q((f * 0.1) % 1, 1), (p) => T.fxSpeed(p, q((f * 0.1) % 1, 1)), [TRK + 4.2, 1.5, t.z - 4], 1.2, { face: 'cam', alpha: 0.6 })); break; }
    case 'bumpy': { const t = truckAt(f); for (let i = 0; i < 2; i++) dust('bd' + i, tw(t, i ? 1 : -1, 0, -2 - i), q(((f * 0.08 + i * 0.5) % 1), 2), 2.6);
      if ((f - 788) % 13 < 3) out.push(FX('spark' + ((f - 788) % 13), (p) => T.fxSpark(p, ((f - 788) % 13) / 3), tw(t, 0, 0.4, 1.6), 0.4, { face: 'cam' })); break; }
    case 'tank': { const pop = (f - 1099) / 8; out.push(FX('bubble' + q(Math.min(1, pop), 2) + '_' + q(((f - 1099) / 30) % 4, 1), (p) => T.fxThought(p, q((f - 1099) / 30, 1), Math.min(1, pop)), [7.62, 1.5, 0.5], 1.3, { face: 'cam', order: 6 })); break; }
    case 'dusk': case 'victory': break;
  }
  return out;
};
