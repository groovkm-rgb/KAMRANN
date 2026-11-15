// Pony Express short (German VO, 51.1 s). Phrase times (hand-checked against the waveform, s):
//  1 0.00-1.54 Stell dir vor, du bist sechzehn. | 2 1.73-3.69 Und dein Job ... reiten. | 3 4.01-5.70 Amerika ... Bürgerkrieg.
//  4 5.89-7.47 Der neue Präsident hält eine Rede. | 5 7.61-9.23 Und Kalifornien muss sie hören – | 9.41-10.82 Tausende Kilometer entfernt.
//  6 10.94-11.94 Es gibt keine Bahn. | 12.15-13.03 Kein Telefon. | 13.22-13.98 Nur Reiter.
//  7 14.45-16.35 Alle fünfzehn bis fünfundzwanzig Kilometer | 16.55-17.77 wartet ein frisches Pferd.
//  8 18.03-20.17 Du springst ab, wirfst die Posttasche rüber, | 20.37-21.19 springst wieder auf.
//  9 21.52 Durch Wüste, | 22.07 Schnee | 22.59-23.19 und Flüsse. | 10 23.58-25.88 Nach über hundert ... Nächste.
// 11 26.22-27.96 Sieben Tage und siebzehn Stunden später | 28.0-29.26 ist die Rede in Kalifornien. | 12 29.53-30.13 Rekord.
// 13 30.46-32.64 Aber während ... jagen, | 32.77-35.01 stehen neben ihnen Männer ... auf. | 14 35.30-36.40 Für einen Draht.
// 15 36.75-38.70 Ein paar Monate später ist der Draht fertig: | 38.92-39.56 der Telegraf.
// 16 40.03-41.76 Eine Nachricht braucht jetzt nicht mehr Tage. | 41.93-43.03 Sondern Minuten.
// 17 43.58-45.08 Zwei Tage später ist alles vorbei. | 18 45.14-46.29 Nach nur achtzehn Monaten.
// 19 46.64-48.11 Die schnellsten Reiter der Welt. | 48.58-50.73 Besiegt … von einem Draht.
import { camFromKeys, M as E, blinkAt, q, lerp, lerp3, clamp, ramp } from './motion.js';
import { SH } from './shots.js';
export const FPS = 30, TOTAL = 1549;
export const SHOTS = SH;
export const shotAt = (f) => { for (const s of SH) if (f >= s.a && f <= s.b) return s; return SH[SH.length - 1]; };
const loc = (f) => { const S = shotAt(f); return { S, lf: f - S.a, u: (f - S.a) / Math.max(1, S.b - S.a) }; };
import { LIGHTS as L0 } from './lights.js';
export const LIGHTS = L0;
export const lightFor = (S, f) => { const { lf } = loc(f); const base = { ...LIGHTS[S.light] }; return S.lightAt ? { ...base, ...S.lightAt(lf, base) } : base; };
export const camAt = (f) => { const { S, lf } = loc(f); const c = S.cam(lf); c.shadowAt = c.shadowAt || S.shadowAt || c.look; return c; };
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
export const dofAt = (f) => { const { S, lf } = loc(f); const C = camAt(f); if (!S.dof) return { focus: 10, cinf: 0 }; const d = S.dof(lf, C); return { focus: d.at ? dist(C.pos, d.at) : d.focus, cinf: d.cinf, near: d.near ?? 1 }; };
export const worldAt = (f) => { const { S, lf, u } = loc(f); const C = camAt(f); const L = lightFor(S, f);
  const el = (L.discEl ?? L.el) * Math.PI / 180, az = (L.discAz ?? L.az) * Math.PI / 180;
  return { loc: S.loc, id: S.id, lf, u, cam: C.pos, sunDir: [Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az)], ...(S.world ? S.world(lf, f) : {}) }; };
export const actorsAt = (f, T) => { const { S, lf } = loc(f); return S.actors ? S.actors(lf, T, f) : []; };
export const fxAt = (f, T) => { const { S, lf } = loc(f); return S.fx ? S.fx(lf, T, f) : []; };
export const overlayAt = (f) => { const { S, lf } = loc(f); return S.overlay ? S.overlay(lf, f) : null; };
globalThis.mbAt = (f) => { const { S, lf } = loc(Math.round(f)); return S.mb ? S.mb(lf) : 1; };
