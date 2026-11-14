// "Hackfleisch" — vertical cartoon short, 1080x1920 @30 fps, voice.mp3 49.40 s + 0.5 s tail = 1497 frames.
// Phrase times (hand-checked against the waveform; work/phrases.json):
//  0.12- 1.85 Die Sägeblätter waren im Hackfleisch versteckt.      | 2.11- 3.42 Ein Hochsicherheitsgefängnis.
//  3.64- 4.78 Zwei verurteilte Mörder.                               | 4.93- 7.46 Und eine Mitarbeiterin aus der Gefängnisschneiderei,
//  7.78-10.07 die sich von einem der beiden um den Finger wickeln lässt. | 10.32-11.60 Sie schmuggelt Werkzeug rein:
// 11.78 Sägeblätter, 12.50 Meißel, 13.02-13.48 Bohrer.              | 13.77-15.25 Versteckt in gefrorenem Hackfleisch.
// 15.51-17.71 Ein Wärter bringt das Paket direkt zu den beiden.     | 18.03-20.71 Wochenlang sägen sie sich nachts durch die Stahlwand ...
// 21.05-21.91 Kriechen durch Gänge, | 22.18-23.23 durch ein riesiges Rohr, | 23.56-24.46 unter der Mauer durch.
// 24.79-27.13 Und eines Nachts klettern sie aus einem Gullydeckel.  | 27.47-29.73 Mitten auf einer Straße – außerhalb des Gefängnisses.
// 30.18-31.93 In ihren Betten: Puppen aus Klamotten.                | 32.25-34.60 Und eine Notiz: „Einen schönen Tag noch!“
// 34.77-36.64 Draußen sollte die Frau mit dem Fluchtauto warten.    | 36.78-37.86 Aber sie kriegt Panik.
// 38.21-40.62 Und fährt stattdessen … ins Krankenhaus.               | 40.97-42.12 Drei Wochen Großfahndung.
// 42.17-43.27 Dann ist die Flucht vorbei. | 43.61-45.13 Einer der beiden überlebt sie nicht.
// 45.42-46.83 Und die Frau mit dem Hackfleisch? | 47.24-49.37 Musste danach selbst ins Gefängnis.
import { at } from './layout.js';
import { SH, LIGHTS as LP } from './shots.js';
export const FPS = 30, TOTAL = 1497;
const D = [
  ['hook', 0, 52, 'kit'], ['sparks', 53, 70, 'cells'], ['prison', 71, 106, 'ext'], ['moerder', 107, 145, 'cells'],
  ['ws', 146, 230, 'ws'], ['charm', 231, 306, 'ws'], ['kit2', 307, 350, 'kit'], ['saw', 351, 373, 'kit'], ['chisel', 374, 389, 'kit'], ['drill', 390, 410, 'kit'],
  ['check', 411, 462, 'cp'], ['guard', 463, 537, 'cells'], ['sawing', 538, 626, 'cells'], ['gaenge', 627, 662, 'ug'], ['rohr', 663, 703, 'ug'], ['mauer', 704, 740, 'ug'],
  ['gully', 741, 820, 'ext'], ['street', 821, 899, 'ext'], ['dolls', 900, 963, 'cells'], ['note', 964, 1039, 'cells'], ['wait', 1040, 1099, 'ext'],
  ['panic', 1100, 1141, 'car'], ['hosp', 1142, 1225, 'hosp'], ['hunt', 1226, 1263, 'forest'], ['dawn', 1264, 1306, 'forest'], ['pack', 1307, 1359, 'forest'],
  ['cellA', 1360, 1413, 'cells'], ['final', 1414, 1496, 'cells'],
];
export const SHOTS = D.map(([id, a, b, set]) => ({ id, a, b, set }));
export const shotAt = (f) => { const fi = Math.floor(f); return SHOTS.find((s) => fi >= s.a && fi <= s.b) || (fi < 0 ? SHOTS[0] : SHOTS[SHOTS.length - 1]); };
export const LIGHTS = LP;
const def = (S) => SH[S.id] || SH._default;
export const lightFor = (S, f) => { const d = def(S); const L = { ...LP[d.light || 'kitNight'] }; return d.lightMod ? { ...L, ...d.lightMod(f - S.a, L) } : L; };

// ---------- camera ----------
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t, lerp3 = (a, b, t) => a.map((v, i) => lerp(v, b[i], t));
const smooth = (t) => { t = clamp(t); return t * t * t * (t * (t * 6 - 15) + 10); };
const EASE = { out: (t) => 1 - (1 - clamp(t)) ** 3.2, lin: (t) => clamp(t), in: (t) => clamp(t) ** 3, s: smooth, io: (t) => { t = clamp(t); return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2; } };
export const keysCam = (K, lf) => {
  if (lf <= K[0].f) return { ...K[0] };
  if (lf >= K[K.length - 1].f) return { ...K[K.length - 1] };
  for (let i = 0; i < K.length - 1; i++) if (lf >= K[i].f && lf < K[i + 1].f) {
    const a = K[i], b = K[i + 1], t = (EASE[b.e || 's'])((lf - a.f) / (b.f - a.f));
    return { pos: lerp3(a.pos, b.pos, t), look: lerp3(a.look, b.look, t), fov: lerp(a.fov, b.fov, t), roll: lerp(a.roll || 0, b.roll || 0, t) };
  }
};
export const camAt = (f) => {
  const S = shotAt(f), d = def(S), lf = f - S.a;
  let c = d.cam ? d.cam(lf, S) : keysCam(d.K, lf);
  c = { ...c, pos: [...c.pos], look: [...c.look] };
  // impact shakes: flip sign every frame, decay over ~7 frames
  for (const k of d.kicks || []) { const dd = lf - k.f; if (dd >= 0 && dd < (k.n || 7)) { const s = ((Math.floor(dd) % 2) ? -1 : 1) * k.a * (1 - dd / (k.n || 7)); c.look[1] += s * 0.6; c.look[0] += s * 0.4; c.roll = (c.roll || 0) + s * 12; } }
  // handheld micro drift so no frame is ever frozen
  const hh = d.hand ?? 0.004; c.look[0] += Math.sin(f * 0.071) * hh; c.look[1] += Math.sin(f * 0.053 + 1) * hh;
  const out = { pos: at(S.set, c.pos), look: at(S.set, c.look), fov: c.fov, roll: c.roll || 0 };
  out.flash = d.flash ? d.flash(lf) : 0;
  out.shadowAt = at(S.set, d.shadowAt || c.look);
  return out;
};
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
export const dofAt = (f) => {
  const S = shotAt(f), d = def(S), lf = f - S.a, C = camAt(f);
  const o = d.dof ? d.dof(lf) : { at: d.focus || [0, 1.4, 0], cinf: 10 };
  return { focus: o.focus ?? dist(C.pos, at(S.set, o.at)), cinf: o.cinf, near: o.near ?? 1 };
};
export const worldAt = (f) => { const S = shotAt(f), d = def(S), lf = f - S.a; return { set: S.set, shot: S.id, lf, ...(d.world ? d.world(lf, f) : {}) }; };
const xyz = (p) => ({ x: p[0], y: p[1], z: p[2] });
export const actorsAt = (f, T) => { const S = shotAt(f), d = def(S), lf = f - S.a; return (d.actors ? d.actors(lf, T, f) : []).map((a) => ({ ...a, ...xyz(at(S.set, [a.x, a.y, a.z])) })); };
export const fxAt = (f, T) => { const S = shotAt(f), d = def(S), lf = f - S.a; return (d.fx ? d.fx(lf, T, f) : []).map((a) => ({ ...a, ...xyz(at(S.set, [a.x, a.y, a.z])) })); };
globalThis.mbAt = (f) => { const S = shotAt(f), d = def(S); return d.mb ? d.mb(f - S.a) : 1; };
