// "Der Diamantenraub" — 1080x1920, 30 fps. Voice: user's voice.mp3 (58.51 s) + 0.5 s tail = 1771 frames.
// Phrase times (silence-detect + energy dips, checked by hand; cuts sit in the pauses):
//  0.12- 1.86 Der größte Diamantenraub der Geschichte.     | 2.16- 3.13 Perfekt geplant. (word gap 2.53-2.66)
//  3.34- 4.33 Und dann verrät die Diebe … | 4.66- 6.38 ein angebissenes Salamibrot.
//  6.63- 7.19 Der Tresor: | 7.46- 8.82 zwei Stockwerke unter der Erde. | 9.11-10.39 Zehn Sicherheitssysteme.
// 10.62-11.60 Wärmesensoren, | 11.60-12.07 Radar, | 12.31-13.11 Magnetfelder.
// 13.42-14.54 Und ein Zahlenschloss mit | 14.83-16.79 hundert Millionen Kombinationen. | 17.09-18.70 Unknackbar, sagen alle.
// 19.04-21.10 Aber einer der Diebe gibt sich jahrelang | 21.18-22.21 als Diamantenhändler aus. | 22.58-25.09 Er mietet ein Büro im Gebäude.
// 25.52-27.39 Und bekommt dadurch … ein eigenes Schließfach im Tresor. | 27.54-28.71 Er geht ein und aus | 28.79-30.26 und schaut sich alles ganz genau an.
// 30.77-32.92 Dann, an einem Wochenende, schlägt die Bande zu. | 33.26-35.04 Über hundert Schließfächer werden geknackt. | 35.35-37.43 Beute: über hundert Millionen Dollar.
// 37.81-39.28 Auf der Flucht wirft einer von ihnen | 39.34-40.75 einen Müllsack in einen Wald. | 41.40-43.03 Ein Anwohner findet ihn und schaut rein:
// 43.42-45.01 Umschläge vom Diamantenzentrum. | 45.35-46.13 Ein Videoband. | 46.45-47.80 Und ein halbes Salamibrot.
// 48.03-49.79 Auf dem Brot: DNA. | 50.20-51.47 Die Spur führt direkt zur Bande. | 51.65-53.97 Der Kopf der Bande muss für zehn Jahre ins Gefängnis.
// 54.38-55.36 Und die Diamanten? | 55.92-57.55 Sind bis heute zum größten Teil | 57.60-58.16 verschwunden.
export const FPS = 30, TOTAL = 1771;
export const SHOTS = [
  { id: 'hook', a: 0, b: 59, set: 'vault', light: 'vaultHook' },
  { id: 'gloves', a: 60, b: 77, set: 'vault', light: 'corridor' },
  { id: 'gang', a: 78, b: 99, set: 'vault', light: 'vault' },
  { id: 'car', a: 100, b: 136, set: 'car', light: 'car' },
  { id: 'bite', a: 137, b: 194, set: 'car', light: 'car' },
  { id: 'building', a: 195, b: 268, set: 'building', light: 'dusk' },
  { id: 'ten', a: 269, b: 314, set: 'vault', light: 'corridor' },
  { id: 'heat', a: 315, b: 347, set: 'vault', light: 'corridorRed' },
  { id: 'radar', a: 348, b: 365, set: 'vault', light: 'corridorGreen' },
  { id: 'magnet', a: 366, b: 397, set: 'vault', light: 'corridorBlue' },
  { id: 'dial', a: 398, b: 439, set: 'vault', light: 'corridor' },
  { id: 'spin', a: 440, b: 509, set: 'vault', light: 'corridor' },
  { id: 'guard', a: 510, b: 565, set: 'vault', light: 'corridor' },
  { id: 'office', a: 566, b: 632, set: 'office', light: 'office' },
  { id: 'loupe', a: 633, b: 671, set: 'office', light: 'office' },
  { id: 'doorSign', a: 672, b: 723, set: 'office', light: 'hall' },
  { id: 'doorOpen', a: 724, b: 758, set: 'office', light: 'hall' },
  { id: 'key', a: 759, b: 822, set: 'office', light: 'office' },
  { id: 'walk', a: 823, b: 861, set: 'vault', light: 'corridor' },
  { id: 'pen', a: 862, b: 914, set: 'vault', light: 'corridor' },
  { id: 'alley', a: 915, b: 992, set: 'alley', light: 'night' },
  { id: 'domino', a: 993, b: 1055, set: 'vault', light: 'vaultHeist' },
  { id: 'bags', a: 1056, b: 1130, set: 'vault', light: 'vaultHeist' },
  { id: 'road', a: 1131, b: 1178, set: 'forest', light: 'forestNight' },
  { id: 'throw', a: 1179, b: 1231, set: 'forest', light: 'forestNight' },
  { id: 'find', a: 1232, b: 1301, set: 'forest', light: 'morning' },
  { id: 'env', a: 1302, b: 1352, set: 'forest', light: 'morning' },
  { id: 'tape', a: 1353, b: 1384, set: 'forest', light: 'morning' },
  { id: 'sandwich', a: 1385, b: 1440, set: 'forest', light: 'spot' },
  { id: 'lab', a: 1441, b: 1504, set: 'lab', light: 'lab' },
  { id: 'board', a: 1505, b: 1548, set: 'board', light: 'board' },
  { id: 'cell', a: 1549, b: 1625, set: 'cell', light: 'cell' },
  { id: 'empty', a: 1626, b: 1672, set: 'vault', light: 'vaultFinal' },
  { id: 'gem', a: 1673, b: 1726, set: 'vault', light: 'vaultFinal' },
  { id: 'gone', a: 1727, b: 1770, set: 'vault', light: 'vaultFinal' },
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b + 0.999) || (f < 0 ? SHOTS[0] : SHOTS[SHOTS.length - 1]);
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const smooth = (t) => { t = clamp(t); return t * t * t * (t * (t * 6 - 15) + 10); };
const easeOut = (t) => 1 - (1 - clamp(t)) ** 3.2;
const lerp = (a, b, t) => a + (b - a) * t, lerp3 = (a, b, t) => a.map((v, i) => lerp(v, b[i], t)), ramp = (f, a, b) => clamp((f - a) / (b - a));
const q = (x, n = 2) => Math.round(x * 10 ** n) / 10 ** n;
const OFF = { vault: [0, 0, 0], building: [300, 0, 0], office: [-300, 0, 0], alley: [600, 0, 0], forest: [900, 0, 0], car: [1200, 0, 0], lab: [1500, 0, 0], board: [1800, 0, 0], cell: [2100, 0, 0] };
const at = (set, p) => [p[0] + OFF[set][0], p[1] + OFF[set][1], p[2] + OFF[set][2]];

// ---------------- light presets ----------------
const base = { az: 120, el: 60, sky: '#8090b0', ground: '#202430', hemi: 0.8, sun: '#e0e8ff', sunI: 1.2, fog: '#0c1220', fogNear: 14, fogFar: 60,
  skyTop: '#05070c', skyHor: '#0c1220', sat: 1.18, waterDeep: '#2c6c8c', waterShal: '#5aaec4', glint: '#effaff', vig: 0.35, shadowExt: 8, ink: 1.6, gain: '#f0f4ff', lift: '#020308' };
export const LIGHTS = {
  vaultHook: { ...base, sky: '#5a6c98', ground: '#141822', hemi: 0.62, sun: '#bcd0ff', sunI: 0.9, az: 60, el: 55, fog: '#0a1020', fogNear: 6, fogFar: 22, vig: 0.42, gain: '#e8f0ff' },
  vault: { ...base, sky: '#6a7ea8', ground: '#161a24', hemi: 0.75, sun: '#c8d8ff', sunI: 1.1, az: 80, el: 60, fogNear: 10, fogFar: 32 },
  vaultHeist: { ...base, sky: '#5a6c98', ground: '#141822', hemi: 0.65, sun: '#c8d8ff', sunI: 1.0, az: 200, el: 55, fogNear: 8, fogFar: 26, vig: 0.4 },
  vaultFinal: { ...base, sky: '#4a5a80', ground: '#0c0e14', hemi: 0.55, sun: '#90a8e0', sunI: 0.55, az: 90, el: 25, fog: '#05080e', fogNear: 4, fogFar: 16, vig: 0.55, gain: '#d8e4ff' },
  corridor: { ...base, sky: '#8a9cc0', ground: '#2a2e3a', hemi: 0.95, sun: '#e8f0ff', sunI: 1.3, az: 110, el: 65, fog: '#101828', fogNear: 12, fogFar: 40, vig: 0.32 },
  corridorRed: { ...base, sky: '#c07a7a', ground: '#2a1a1e', hemi: 0.85, sun: '#ffd0c8', sunI: 1.2, az: 110, el: 65, fog: '#201014', fogNear: 3, fogFar: 14, vig: 0.42, gain: '#ffe8e4' },
  corridorGreen: { ...base, sky: '#7ab0a0', ground: '#14221e', hemi: 0.85, sun: '#d8ffe8', sunI: 1.2, az: 110, el: 65, fog: '#0c1a16', fogNear: 3, fogFar: 14, vig: 0.42, gain: '#e8fff0' },
  corridorBlue: { ...base, sky: '#7a98d0', ground: '#141a2a', hemi: 0.85, sun: '#d8e8ff', sunI: 1.2, az: 110, el: 65, fog: '#0c1426', fogNear: 3, fogFar: 14, vig: 0.42 },
  car: { ...base, sky: '#3a5070', ground: '#0e1018', hemi: 0.55, sun: '#8aa8d8', sunI: 0.5, az: 30, el: 40, fog: '#0a1018', fogNear: 4, fogFar: 14, vig: 0.45, gain: '#e0ecff' },
  dusk: { ...base, sky: '#b8b8d8', ground: '#2a2430', hemi: 1.0, sun: '#ffb880', sunI: 1.2, az: 35, el: 14, fog: '#6a5a78', fogNear: 40, fogFar: 160, skyTop: '#22305e', skyHor: '#f09060', sunDisc: '#ffcf90', sunSize: 0.004, vig: 0.3, shadowExt: 30, gain: '#fff0e4', lift: '#06040a', ink: 1.4 },
  office: { ...base, sky: '#ffe0b8', ground: '#5a3a28', hemi: 1.0, sun: '#ffd8a0', sunI: 1.5, az: 70, el: 35, fog: '#3a2618', fogNear: 10, fogFar: 40, vig: 0.32, gain: '#fff2e0', lift: '#060302' },
  hall: { ...base, sky: '#fff0d8', ground: '#6a5040', hemi: 1.1, sun: '#ffe8c8', sunI: 1.3, az: 60, el: 50, fog: '#4a3a2a', fogNear: 12, fogFar: 40, vig: 0.3, gain: '#fff2e4', lift: '#040302' },
  night: { ...base, sky: '#5a6a9a', ground: '#1a1e2a', hemi: 0.85, sun: '#a8b8ff', sunI: 0.8, az: 250, el: 35, fog: '#0e1628', fogNear: 14, fogFar: 80, skyTop: '#03050c', skyHor: '#1a2444', vig: 0.42, shadowExt: 12, gain: '#e0e8ff', ink: 1.4 },
  forestNight: { ...base, sky: '#5a7a8a', ground: '#14201c', hemi: 0.8, sun: '#a8c4e0', sunI: 0.9, az: 300, el: 40, fog: '#14242a', fogNear: 14, fogFar: 90, skyTop: '#04080c', skyHor: '#1a2a30', vig: 0.42, shadowExt: 25, gain: '#e0f0ff', ink: 1.3 },
  morning: { ...base, sky: '#d8ecd8', ground: '#3a4a30', hemi: 1.05, sun: '#fff0c8', sunI: 2.0, az: 300, el: 22, fog: '#b8ccc0', fogNear: 14, fogFar: 90, skyTop: '#a8c4c8', skyHor: '#e8f0e4', vig: 0.28, shadowExt: 8, gain: '#fff8ec', lift: '#040604', ink: 1.4 },
  spot: { ...base, sky: '#8aa090', ground: '#1a2018', hemi: 0.55, sun: '#ffe0a0', sunI: 2.2, az: 280, el: 50, fog: '#2a3428', fogNear: 2, fogFar: 14, skyTop: '#2a3428', skyHor: '#2a3428', vig: 0.55, shadowExt: 3, gain: '#fff4e0', ink: 1.8 },
  lab: { ...base, sky: '#f0f8ff', ground: '#8898a8', hemi: 1.15, sun: '#ffffff', sunI: 1.3, az: 60, el: 60, fog: '#d8e4ee', fogNear: 10, fogFar: 40, vig: 0.26, gain: '#f4faff', lift: '#000204', sat: 1.12 },
  board: { ...base, sky: '#d8c8b0', ground: '#3a3028', hemi: 0.9, sun: '#ffd8a8', sunI: 1.4, az: 30, el: 30, fog: '#2a2420', fogNear: 10, fogFar: 40, vig: 0.36, gain: '#fff0e0' },
  cell: { ...base, sky: '#6a7aa8', ground: '#1a1c24', hemi: 0.55, sun: '#a8c0ff', sunI: 1.3, az: 270, el: 45, fog: '#0c1020', fogNear: 6, fogFar: 20, vig: 0.48, gain: '#dce6ff' },
};
export const lightFor = (S, f) => {
  const L = { ...LIGHTS[S.light] };
  if (S.id === 'bags') { const k = Math.exp(-((f - 1115) ** 2) / 60); L.hemi += k * 0.6; }
  if (S.id === 'sandwich' || S.id === 'tape' || S.id === 'env') L.ink = 2;
  return L;
};

// ---------------- camera ----------------
// keys per shot in set-local coordinates; e: 'out' burst, 'lin' creep, default smooth
const CK = {
  hook: [{ f: 0, pos: [0.22, 1.18, -2.1], look: [0.05, 1.3, -4.3], fov: 56, roll: 4 }, { f: 9, pos: [0.14, 1.2, -2.32], look: [0.04, 1.3, -4.3], fov: 55, roll: 2, e: 'out' }, { f: 59, pos: [0.08, 1.22, -2.6], look: [0.0, 1.3, -4.3], fov: 52, roll: -1.5, e: 'lin' }],
  gloves: [{ f: 60, pos: [0.25, 1.4, 13.3], look: [0.02, 1.3, 12.0], fov: 44, roll: -6 }, { f: 66, pos: [0.06, 1.33, 13.05], look: [0.0, 1.3, 12.0], fov: 42, roll: -2, e: 'out' }, { f: 77, pos: [0.04, 1.32, 12.92], look: [0.0, 1.3, 12.0], fov: 41, roll: 0, e: 'lin' }],
  gang: [{ f: 78, pos: [0.0, 1.0, 2.3], look: [0.0, 1.5, 6.5], fov: 56, roll: 5 }, { f: 99, pos: [0.0, 1.1, 3.1], look: [0.0, 1.5, 6.5], fov: 55, roll: 1, e: 'out' }],
  car: [{ f: 100, pos: [0.6, 1.75, 1.75], look: [0.5, 1.5, -0.5], fov: 58, roll: -4 }, { f: 107, pos: [0.46, 1.68, 1.5], look: [0.48, 1.5, -0.5], fov: 56, roll: -2, e: 'out' }, { f: 136, pos: [0.45, 1.67, 1.38], look: [0.48, 1.5, -0.5], fov: 55, roll: -1, e: 'lin' }],
  bite: [{ f: 137, pos: [0.62, 1.68, 1.3], look: [0.64, 1.6, 0.0], fov: 50, roll: 2 }, { f: 165, pos: [0.64, 1.66, 1.16], look: [0.66, 1.58, 0.0], fov: 49, roll: 0, e: 'lin' }, { f: 175, pos: [0.82, 1.33, 0.95], look: [0.84, 1.19, 0.18], fov: 38, roll: -3, e: 'out' }, { f: 194, pos: [0.825, 1.33, 0.9], look: [0.84, 1.19, 0.18], fov: 36, roll: -4, e: 'lin' }],
  building: [{ f: 195, pos: [0.3, 4.4, 27], look: [0.3, 4.5, 0], fov: 56, roll: 0 }, { f: 205, pos: [0.3, 4.05, 24.5], look: [0.3, 4.45, 0], fov: 55, e: 'out' }, { f: 212, pos: [0.3, 4.0, 24.2], look: [0.3, 4.43, 0], fov: 55, e: 'lin' }, { f: 256, pos: [1.4, -4.0, 15.5], look: [1.8, -4.8, -6], fov: 52, roll: -2 }, { f: 268, pos: [1.75, -5.7, 7.0], look: [1.95, -6.2, -9.5], fov: 50, roll: -3 }],
  ten: [{ f: 269, pos: [1.8, 1.9, 13.2], look: [0.6, 1.9, 5.6], fov: 54, roll: -5 }, { f: 277, pos: [0.35, 1.6, 12.4], look: [0.0, 1.8, 5.6], fov: 54, roll: -1, e: 'out' }, { f: 314, pos: [0.22, 1.62, 10.9], look: [0.0, 1.8, 5.6], fov: 53, roll: 1, e: 'lin' }],
  heat: [{ f: 315, pos: [-1.1, 2.2, 8.2], look: [-2.2, 2.95, 5.95], fov: 42, roll: 6 }, { f: 323, pos: [-1.5, 2.45, 7.6], look: [-2.25, 2.95, 5.95], fov: 47, roll: 4, e: 'out' }, { f: 347, pos: [-1.6, 2.5, 7.45], look: [-2.25, 2.95, 5.95], fov: 46, roll: 5, e: 'lin' }],
  radar: [{ f: 348, pos: [0.9, 2.1, 7.9], look: [2.2, 2.9, 5.95], fov: 42, roll: -6 }, { f: 355, pos: [1.45, 2.42, 7.5], look: [2.25, 2.95, 5.95], fov: 47, roll: -5, e: 'out' }, { f: 365, pos: [1.5, 2.45, 7.4], look: [2.25, 2.95, 5.95], fov: 46, roll: -6, e: 'lin' }],
  magnet: [{ f: 366, pos: [-1.0, 1.0, 7.9], look: [-2.2, 1.35, 5.98], fov: 44, roll: 5 }, { f: 374, pos: [-1.55, 1.22, 7.55], look: [-2.3, 1.35, 5.98], fov: 47, roll: 3, e: 'out' }, { f: 397, pos: [-1.6, 1.25, 7.4], look: [-2.3, 1.35, 5.98], fov: 46, roll: 4, e: 'lin' }],
  dial: [{ f: 398, pos: [0.4, 1.5, 8.0], look: [-0.3, 1.85, 5.8], fov: 48, roll: -4 }, { f: 406, pos: [-0.18, 1.82, 7.0], look: [-0.45, 1.9, 5.81], fov: 46, roll: -1, e: 'out' }, { f: 439, pos: [-0.22, 1.85, 6.85], look: [-0.45, 1.9, 5.81], fov: 45, roll: 0, e: 'lin' }],
  spin: [{ f: 440, pos: [0.42, 1.38, 6.85], look: [-0.45, 1.9, 5.81], fov: 42, roll: 10 }, { f: 446, pos: [0.3, 1.45, 6.7], look: [-0.45, 1.9, 5.81], fov: 40, roll: 7, e: 'out' }, { f: 509, pos: [0.2, 1.52, 6.58], look: [-0.45, 1.9, 5.81], fov: 38, roll: 4, e: 'lin' }],
  guard: [{ f: 510, pos: [0.6, 1.6, 14.0], look: [1.45, 1.45, 11.1], fov: 48, roll: 3 }, { f: 517, pos: [0.3, 1.55, 13.65], look: [1.4, 1.45, 11.1], fov: 46, roll: 1, e: 'out' }, { f: 531, pos: [0.25, 1.55, 13.5], look: [1.38, 1.45, 11.1], fov: 46, e: 'lin' }, { f: 543, pos: [0.3, 1.55, 12.1], look: [-0.9, 1.45, 8.6], fov: 46, roll: -2 }, { f: 565, pos: [0.25, 1.55, 11.75], look: [-0.9, 1.45, 8.6], fov: 45, roll: -3, e: 'lin' }],
  office: [{ f: 566, pos: [0.5, 1.75, 2.0], look: [-0.38, 1.35, -1.9], fov: 52, roll: -3 }, { f: 574, pos: [0.32, 1.65, 1.6], look: [-0.38, 1.35, -1.9], fov: 50, roll: -1, e: 'out' }, { f: 632, pos: [0.25, 1.62, 1.3], look: [-0.38, 1.35, -1.9], fov: 49, roll: 1, e: 'lin' }],
  loupe: [{ f: 633, pos: [0.45, 1.6, -0.95], look: [0.15, 1.45, -2.65], fov: 48, roll: 4 }, { f: 640, pos: [0.28, 1.56, -1.2], look: [0.12, 1.45, -2.65], fov: 46, roll: 2, e: 'out' }, { f: 671, pos: [0.25, 1.55, -1.36], look: [0.12, 1.45, -2.65], fov: 45, roll: 3, e: 'lin' }],
  doorSign: [{ f: 672, pos: [0.6, 1.72, 5.4], look: [-0.05, 1.76, 2.1], fov: 54, roll: -3 }, { f: 680, pos: [0.18, 1.7, 5.0], look: [-0.05, 1.75, 2.1], fov: 52, roll: -1, e: 'out' }, { f: 723, pos: [0.1, 1.71, 4.62], look: [-0.05, 1.75, 2.1], fov: 52, roll: 0, e: 'lin' }],
  doorOpen: [{ f: 724, pos: [0.8, 1.62, 4.7], look: [0.0, 1.5, 1.0], fov: 54, roll: 3 }, { f: 731, pos: [0.6, 1.6, 4.4], look: [0.0, 1.5, 1.0], fov: 54, roll: 1, e: 'out' }, { f: 758, pos: [0.4, 1.58, 3.7], look: [0.0, 1.48, 0.6], fov: 53, roll: 0, e: 'lin' }],
  key: [{ f: 759, pos: [0.5, 1.55, 0.7], look: [0.1, 1.3, -1.1], fov: 50, roll: -4 }, { f: 766, pos: [0.36, 1.48, 0.42], look: [0.08, 1.28, -1.1], fov: 48, roll: -2, e: 'out' }, { f: 822, pos: [0.3, 1.46, 0.2], look: [0.07, 1.3, -1.1], fov: 47, roll: 0, e: 'lin' }],
  walk: [{ f: 823, pos: [-2.4, 1.5, 13.0], look: [-0.5, 1.4, 11.6], fov: 52, roll: 3 }, { f: 830, pos: [-2.5, 1.45, 12.6], look: [-0.55, 1.4, 11.2], fov: 52, roll: 1, e: 'out' }, { f: 861, pos: [-2.5, 1.45, 10.3], look: [-0.6, 1.4, 8.9], fov: 52, roll: 0, e: 'lin' }],
  pen: [{ f: 862, pos: [0.7, 1.55, 10.4], look: [-0.5, 1.55, 6.2], fov: 50, roll: -4 }, { f: 869, pos: [0.42, 1.48, 9.85], look: [-0.55, 1.55, 6.2], fov: 48, roll: -1, e: 'out' }, { f: 914, pos: [0.32, 1.5, 9.3], look: [-0.58, 1.55, 6.2], fov: 47, roll: 1, e: 'lin' }],
  alley: [{ f: 915, pos: [4.4, 3.2, 10.2], look: [0.4, 2.1, -4.5], fov: 52, roll: 0 }, { f: 923, pos: [4.0, 3.0, 9.5], look: [0.2, 2.0, -4.5], fov: 52, e: 'out' }, { f: 950, pos: [3.6, 2.75, 8.6], look: [0.0, 1.9, -4.5], fov: 52, e: 'lin' }, { f: 964, pos: [1.5, 0.5, 2.6], look: [-0.4, 1.35, -2.9], fov: 52, roll: -4 }, { f: 992, pos: [1.35, 0.47, 2.2], look: [-0.4, 1.38, -2.9], fov: 51, roll: -5, e: 'lin' }],
  domino: [{ f: 993, pos: [0.3, 1.8, 3.2], look: [3.6, 1.4, -2.0], fov: 54, roll: -5 }, { f: 1000, pos: [0.75, 1.65, 2.7], look: [4.0, 1.35, -2.0], fov: 52, roll: -3, e: 'out' }, { f: 1055, pos: [0.95, 1.6, 2.0], look: [4.0, 1.3, -2.2], fov: 51, roll: -4, e: 'lin' }],
  bags: [{ f: 1056, pos: [0.4, 2.3, 2.3], look: [0.0, 1.25, -0.6], fov: 54, roll: 4 }, { f: 1063, pos: [0.15, 2.05, 1.8], look: [0.0, 1.25, -0.6], fov: 52, roll: 2, e: 'out' }, { f: 1130, pos: [0.05, 1.9, 1.35], look: [0.0, 1.25, -0.6], fov: 50, roll: -2, e: 'lin' }],
  road: [{ f: 1131, pos: [0.6, 8, -4], look: [-1.2, 0.5, -30], fov: 50, roll: 0 }, { f: 1178, pos: [0.4, 3.2, 20], look: [-1.2, 0.8, 9], fov: 50, roll: -4 }],
  find: [{ f: 1232, pos: [1.0, 1.1, 41.4], look: [2.9, 0.95, 36.4], fov: 52, roll: 2 }, { f: 1239, pos: [1.2, 0.95, 40.7], look: [3.0, 0.95, 36.4], fov: 50, roll: 1, e: 'out' }, { f: 1301, pos: [1.6, 0.88, 39.6], look: [3.2, 0.7, 36.8], fov: 50, roll: -1, e: 'lin' }],
  env: [{ f: 1302, pos: [3.32, 1.15, 38.95], look: [3.3, 0.0, 38.1], fov: 54, roll: 3 }, { f: 1309, pos: [3.33, 0.98, 38.78], look: [3.33, 0.0, 38.12], fov: 50, roll: 1, e: 'out' }, { f: 1352, pos: [3.33, 0.94, 38.74], look: [3.33, 0.0, 38.12], fov: 49, roll: 0, e: 'lin' }],
  tape: [{ f: 1353, pos: [3.3, 1.0, 39.15], look: [3.1, 0.05, 38.45], fov: 52, roll: -4 }, { f: 1359, pos: [3.13, 0.82, 38.97], look: [3.1, 0.05, 38.45], fov: 50, roll: -1, e: 'out' }, { f: 1384, pos: [3.12, 0.78, 38.92], look: [3.1, 0.05, 38.45], fov: 49, roll: -1, e: 'lin' }],
  sandwich: [{ f: 1385, pos: [3.36, 0.32, 39.4], look: [3.3, 0.14, 38.15], fov: 44, roll: 0 }, { f: 1395, pos: [3.33, 0.25, 38.95], look: [3.3, 0.12, 38.15], fov: 40, roll: -2, e: 'out' }, { f: 1440, pos: [3.32, 0.23, 38.8], look: [3.3, 0.12, 38.15], fov: 38, roll: -6, e: 'lin' }],
  lab: [{ f: 1441, pos: [0.25, 1.7, 3.3], look: [-0.05, 1.45, 0.1], fov: 58, roll: 3 }, { f: 1448, pos: [0.1, 1.62, 3.0], look: [-0.05, 1.45, 0.1], fov: 56, roll: 1, e: 'out' }, { f: 1504, pos: [0.05, 1.58, 2.6], look: [-0.05, 1.47, 0.1], fov: 55, roll: -1, e: 'lin' }],
  board: [{ f: 1505, pos: [-0.65, 1.5, 0.9], look: [-1.0, 1.42, -1.9], fov: 48, roll: 2 }, { f: 1514, pos: [-0.72, 1.48, 0.7], look: [-1.0, 1.42, -1.9], fov: 46, e: 'lin' }, { f: 1526, pos: [0.15, 1.55, 1.95], look: [0.08, 1.8, -1.9], fov: 52, roll: -1 }, { f: 1548, pos: [0.12, 1.55, 1.75], look: [0.08, 1.8, -1.9], fov: 51, roll: -2, e: 'lin' }],
  cell: [{ f: 1549, pos: [0.4, 1.45, 3.3], look: [-0.45, 1.12, -1.2], fov: 48, roll: 0 }, { f: 1560, pos: [0.3, 1.4, 2.9], look: [-0.48, 1.1, -1.2], fov: 46, e: 'out' }, { f: 1625, pos: [0.125, 1.32, 1.0], look: [-0.5, 1.08, -1.2], fov: 46, roll: -2 }],
  empty: [{ f: 1626, pos: [0.0, 1.7, 4.2], look: [0.0, 1.3, -3.0], fov: 56, roll: 0 }, { f: 1672, pos: [0.0, 1.5, 2.7], look: [0.1, 1.15, -3.0], fov: 54, roll: -2, e: 'lin' }],
  gem: [{ f: 1673, pos: [0.0, 0.32, -0.25], look: [0.5, 0.08, -1.6], fov: 42, roll: 2 }, { f: 1680, pos: [0.15, 0.24, -0.6], look: [0.52, 0.08, -1.6], fov: 40, roll: 1, e: 'out' }, { f: 1726, pos: [0.22, 0.22, -0.85], look: [0.45, 0.08, -1.75], fov: 40, roll: -2, e: 'lin' }],
};
// lone diamond path (empty vault)
const loneAt = (f) => {
  if (f < 1705) return [0.55, 0.06, -1.6];
  const t = (f - 1705) / 60, s = t * t * 0.9 + t * 0.35; // accelerating roll
  return [0.55 - s * 3.0, 0.06, -1.6 - s * 2.0];
};
const carZ = (f) => (f < 1179 ? -30 + (f - 1131) * 0.9 : 22 + (f - 1179) * 0.58);
const CARX = -1.2;
const interp = (K, f) => {
  if (f <= K[0].f) return { ...K[0] }; if (f >= K[K.length - 1].f) return { ...K[K.length - 1] };
  for (let i = 0; i < K.length - 1; i++) if (f >= K[i].f && f < K[i + 1].f) {
    const a = K[i], b = K[i + 1], r = (f - a.f) / (b.f - a.f), t = b.e === 'out' ? easeOut(r) : b.e === 'lin' ? r : smooth(r);
    return { pos: lerp3(a.pos, b.pos, t), look: lerp3(a.look, b.look, t), fov: lerp(a.fov, b.fov, t), roll: lerp(a.roll || 0, b.roll || 0, t) };
  }
};
const KICKS = [{ f: 2, a: 0.02 }, { f: 69, a: 0.02 }, { f: 80, a: 0.025 }, { f: 147, a: 0.03 }, { f: 168, a: 0.035 }, { f: 1115, a: 0.02 }, { f: 1220, a: 0.02 }, { f: 1515, a: 0.015 }, { f: 1558, a: 0.03 }];
const FLASH = [[566, 0.7], [1232, 0.6], [1441, 0.8], [1113, 0.45], [1478, 0.35]];
export const camAt = (f) => {
  const S = shotAt(f);
  let c;
  if (S.id === 'throw') { // camera beside the road: car rushes past, bag lands in front of us
    const t = clamp((f - 1179) / 52);
    const pan = smooth(ramp(f, 1203, 1219)); c = { pos: [1.4, 1.15 - t * 0.1, 41.6 - t * 0.5], look: [lerp(-0.9, 3.0, pan), lerp(1.1, 0.45, pan), lerp(33, 38.9, pan)], fov: 50, roll: lerp(-3, 2, t) };
  } else if (S.id === 'gone') { const g = loneAt(f); c = { pos: [g[0] + 1.1, 0.3, g[2] + 1.5], look: [g[0], 0.1, g[2]], fov: 42, roll: -3 }; }
  else c = interp(CK[S.id], f);
  c = { ...c, pos: at(S.set, c.pos), look: at(S.set, c.look) };
  for (const k of KICKS) { const d = f - k.f; if (d >= 0 && d < 7) { const s = (Math.floor(d) % 2 ? -1 : 1) * k.a * (1 - d / 7); c.look[1] += s * 3; c.look[0] += s * 2; c.roll = (c.roll || 0) + s * 25; } }
  c.flash = 0; for (const [ff, k] of FLASH) if (f >= ff && f < ff + 5) c.flash = Math.max(c.flash, (1 - (f - ff) / 5) * k);
  c.shadowAt = c.look;
  return c;
};
globalThis.mbAt = (f) => {
  const fi = Math.floor(f);
  if ((fi >= 0 && fi <= 4) || (fi >= 166 && fi <= 171) || (fi >= 440 && fi <= 509) || (fi >= 1131 && fi <= 1178) || (fi >= 1203 && fi <= 1214)) return 3;
  const S = shotAt(fi); if (fi - S.a < 3 && !['hook', 'empty'].includes(S.id)) return 3;
  return 1;
};
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const FOCUS = { hook: [-0.15, 1.4, -4.15], gloves: [0, 1.3, 12.0], gang: [0, 1.5, 6.8], car: [0.62, 1.55, 0.02], building: [0.8, 4.7, 0.5], ten: [0, 1.75, 5.8], heat: [-2.3, 3.0, 6.0], radar: [2.3, 3.0, 6.0], magnet: [-2.35, 1.35, 6.0], dial: [-0.45, 1.9, 5.82], spin: [-0.45, 1.9, 5.82], office: [0.1, 1.55, -2.65], loupe: [0.12, 1.5, -2.6], doorSign: [-0.05, 1.8, 2.1], doorOpen: [-0.2, 1.5, 2.2], key: [0.05, 1.4, -1.1], pen: [-0.85, 1.5, 7.4], domino: [3.6, 1.3, -1.5], bags: [0, 1.3, -0.5], find: [2.6, 0.8, 36.9], env: [3.3, 0.0, 38.12], tape: [3.1, 0.05, 38.45], sandwich: [3.3, 0.1, 38.18], lab: [-0.15, 1.45, 0.6], cell: [-0.55, 1.2, -1.2], empty: [0, 1.2, -1.5], gem: [0.55, 0.08, -1.6] };
export const dofAt = (f) => {
  const S = shotAt(f), C = camAt(f);
  const F = (p, k) => ({ focus: dist(C.pos, at(S.set, p)), cinf: k });
  switch (S.id) {
    case 'hook': return F(FOCUS.hook, 9);
    case 'gloves': return F(FOCUS.gloves, 16);
    case 'gang': return F(FOCUS.gang, 6);
    case 'car': return F(FOCUS.car, 12);
    case 'bite': return f < 168 ? F([0.6, 1.6, 0.02], 12) : F([0.846, 1.25, 0.18], 14);
    case 'building': return F(FOCUS.building, 1.5);
    case 'guard': return f < 537 ? F([1.55, 1.6, 11.3], 10) : F([-0.9, 1.6, 8.6], 10);
    case 'walk': { const z = lerp(11.5, 8.9, ramp(f, 823, 861)); return F([-0.6, 1.5, z], 9); }
    case 'alley': return f < 957 ? F([0, 1.5, -2.5], 2) : F([-0.3, 1.5, -2.7], 10);
    case 'road': return { focus: dist(C.pos, at('forest', [CARX, 0.8, carZ(f)])), cinf: 3 };
    case 'throw': return { focus: f < 1210 ? 5 : 3.2, cinf: 5 };
    case 'board': return f < 1520 ? F([-1.3, 1.5, -1.2], 12) : F([0.08, 1.7, -1.9], 5);
    case 'gone': return { focus: dist(C.pos, at('vault', loneAt(f))), cinf: 12 };
    case 'empty': return F(FOCUS.empty, 3);
    default: return F(FOCUS[S.id] || [0, 1.5, 0], 11);
  }
};

// ---------------- world state ----------------
const lampP = (x, y, z, dir, k = 4, ca = 0.55) => ({ p: [x, y, z], dir, k, ca });
export const worldAt = (f) => {
  const S = shotAt(f), id = S.id;
  const W = { set: S.set };
  if (S.set === 'vault') { W.door = 0; W.sec = 10; W.hook = 0; W.hookFill = 1; }
  switch (id) {
    case 'hook': W.hook = easeOut((f + 5) / 9); W.gush = (f + 5) / 30; W.hookFill = 1 - clamp((f + 5) / 40) * 0.7; W.gemLight = 2.2; W.gemLightP = [0.3, 1.6, -3.9];
      W.lamps = [lampP(-0.15, 1.45, -4.0, [0.55, -0.5, -0.2], 2, 0.45)]; break;
    case 'gloves': W.lamps = [{ ...lampP(0.0, 1.9, 12.4, [0, -1, -0.3], 3, 0), cone: false }]; break;
    case 'gang': { W.door = easeOut((f - 78) / 15) * 0.92; W.shaftK = 0; const z = lerp(7.2, 6.6, ramp(f, 78, 99)); W.lamps = [-0.6, 0.05, 0.65].map((x) => lampP(x, 1.95, z - 0.1, [0, -0.3, -1], 3, 0.6)); break; }
    case 'ten': W.sec = Math.floor(clamp((f - 271) / 33) * 10.99); break;
    case 'dial': W.dial = (f - 398) * 0.04; break;
    case 'spin': { const t = f - 440; W.dial = 1.68 + t * 0.15 + t * t * 0.006; break; }
    case 'domino': W.door = 1; W.domino = ramp(f, 996, 1046) * 1.15; W.lamps = [lampP(1.6, 1.9, -0.4, [1, -0.3, -0.3]), lampP(1.4, 1.75, -2.4, [1, -0.35, 0.1]), lampP(2.1, 1.95, -3.8, [0.8, -0.3, 0.4])]; break;
    case 'bags': W.door = 1; W.domino = 1.2; W.bags = true; W.bagFill = ramp(f, 1060, 1110); W.gemLight = 3 + 9 * Math.exp(-((f - 1115) ** 2) / 50); W.gemLightP = [0, 1.7, -0.3];
      W.lamps = [lampP(-0.85, 1.85, -1.25, [0.4, -1, 0.5], 3, 0.2), lampP(0, 1.95, -1.55, [0, -1, 0.6], 3, 0.2), lampP(0.75, 1.85, -1.3, [-0.4, -1, 0.5], 3, 0.2)]; break;
    case 'empty': case 'gem': case 'gone': { W.door = 1; W.allOpen = true; W.shaftK = 0.55; W.sec = 0; const g = id === 'empty' ? [0.55, 0.06, -1.6] : loneAt(f);
      W.lone = f > 1762 ? null : { p: g, rz: f > 1705 ? -(f - 1705) * 0.25 : 0 }; W.gemLight = 1.2; W.gemLightP = [g[0], 0.4, g[2] + 0.3]; break; }
    case 'building': W.cabY = lerp(0, -8.2, smooth(ramp(f, 210, 258))); break;
    case 'doorOpen': W.officeDoor = smooth(ramp(f, 727, 746)); break;
    case 'key': {
      const fall = ramp(f, 762, 772), hand = [0.278, 0.99, -1.0], up = smooth(ramp(f, 790, 804));
      let p; if (f < 772) p = [0.28, lerp(2.4, hand[1], fall * fall), -1.0]; else { const b = f < 778 ? Math.sin((f - 772) / 6 * Math.PI) * 0.04 : 0; p = [lerp(hand[0], 0.33, up), lerp(hand[1], 1.3, up) + b, -1.0]; }
      W.key = { p, rz: f < 772 ? f * 0.4 : 0.35, ry: 0.3, s: 1.8 }; break;
    }
    case 'road': W.night = true; W.carZ = carZ(f); W.carX = CARX; break;
    case 'throw': { W.night = true; W.carZ = carZ(f); W.carX = CARX; W.winOpen = true;
      if (f >= 1200) { const t = (f - 1200) / 30, p0 = [CARX + 0.9, 1.3, carZ(1200) - 0.6]; const y = p0[1] + 2.4 * t - 4.9 * t * t;
        if (y > 0.25 && t < 1) W.bag = { p: [p0[0] + 5.6 * t, y, p0[2] + 8 * t], r: t * 6, rz: t * 4, s: 0.85 }; else W.bag = { p: [3.3, 0.12, 38.8], r: 0.3, rz: 0.2, s: 0.85 }; }
      break; }
    case 'find': W.bag = f < 1284 ? { p: [3.4, 0.0, 37.5], r: 0.1, s: 0.85 } : { p: [3.4, 0.0, 37.5], open: true, s: 0.85 }; break;
    case 'env': { W.bag = { p: [3.4, 0.0, 37.5], open: true, s: 0.85 }; const t = easeOut(ramp(f, 1302, 1312));
      const FF = [[3.16, 0.006, 38.0, 0, -0.28, 0], [3.46, 0.009, 38.0, 0, 0.3, 0], [3.3, 0.013, 38.14, 0, 0.04, 0]];
      W.env = FF.map(([x, y, z, r, ry, rz]) => ({ p: [lerp(3.4, x, t), lerp(0.3, y, t), lerp(37.6, z, t)], r, ry, rz })); W.cas = { p: [2.82, 0.035, 38.5], ry: 0.5 }; break; }
    case 'tape': W.bag = { p: [3.4, 0.0, 37.5], open: true, s: 0.85 }; W.env = [{ p: [3.16, 0.006, 38.0], ry: -0.28 }, { p: [3.46, 0.009, 38.0], ry: 0.3 }, { p: [3.3, 0.013, 38.14], ry: 0.04 }];
      W.cas = { p: [3.1, 0.035, 38.45], ry: 0 }; break;
    case 'sandwich': W.bag = { p: [3.4, 0.0, 37.5], open: true, s: 0.85 }; W.env = [{ p: [3.16, 0.006, 38.0], ry: -0.28 }, { p: [3.46, 0.009, 38.0], ry: 0.3 }, { p: [3.3, 0.013, 38.14], ry: 0.04 }]; W.cas = { p: [2.9, 0.035, 38.4], ry: 0.4 }; break;
    case 'lab': W.dnaFlash = Math.exp(-((f - 1480) ** 2) / 40); break;
    case 'board': { const t = smooth(ramp(f, 1506, 1514)); W.lastPhoto = { x: lerp(0.18, 0, t), y: lerp(-0.1, 0, t), z: lerp(0.35, 0, t), rz: lerp(-0.3, 0.06, t) }; W.pinIn = f >= 1515; W.strings = ramp(f, 1518, 1546); break; }
    case 'cell': W.bars = lerp(-2.4, 0, easeOut(ramp(f, 1549, 1558))); break;
  }
  return W;
};

// ---------------- actors ----------------
const blinkAt = (f, seed) => { const per = 46 + (seed * 17) % 30, ph = (f + seed * 13) % per; return ph < 2 ? 0.5 : ph < 4 ? 1 : 0; };
let T_;
const CH = (spec, o, set, pos, extra = {}) => { const p = at(set, pos); return { key: JSON.stringify([spec, o]), draw: (pen) => T_.toonChar(pen, T_.CAST[spec], o), x: p[0], y: p[1], z: p[2], ...extra }; };
const CARD = (key, draw, set, pos, s, extra = {}) => { const p = at(set, pos); return { key, draw, x: p[0], y: p[1], z: p[2], s, blob: false, shadow: false, order: 5, ...extra }; };
// fx placed with its design centre (300,500) at world point pos
const FXC = (key, draw, set, pos, s, extra = {}) => CARD(key, draw, set, [pos[0], pos[1] - 1.069 * s, pos[2]], s, extra);
const glovesDraw = (t) => (p) => { // two gloved hands; the right one snaps the cuff of the left glove
  const g = p.g, GL = '#202028', IK = '#0c0c10';
  const ink = (pts, fill, w = 9) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fillStyle = fill; g.fill(); g.lineWidth = w; g.strokeStyle = IK; g.lineJoin = 'round'; g.stroke(); };
  const pill = (x, y, w, h, a, fill) => { g.save(); g.translate(x, y); g.rotate(a); g.beginPath(); g.roundRect(-w / 2, -h, w, h, w / 2); g.fillStyle = fill; g.fill(); g.lineWidth = 8; g.strokeStyle = IK; g.stroke(); g.strokeStyle = '#5a5a6a'; g.lineWidth = 4; g.beginPath(); g.moveTo(-w / 4, -h + 18); g.lineTo(-w / 4, -18); g.stroke(); g.restore(); };
  const pull = t < 0.55 ? t / 0.55 : Math.max(0, 1 - (t - 0.55) / 0.12);
  pill(230, 470, 56, 150, -0.35, GL); pill(282, 452, 58, 175, -0.1, GL); pill(334, 458, 56, 165, 0.12, GL); pill(382, 482, 50, 130, 0.35, GL); pill(170, 600, 56, 120, -1.0, GL);
  ink([[200, 470], [410, 480], [420, 640], [330, 700], [230, 690], [190, 600]], GL);
  g.strokeStyle = '#5a5a6a'; g.lineWidth = 5; g.beginPath(); g.moveTo(240, 520); g.quadraticCurveTo(300, 560, 380, 520); g.stroke();
  const cy = 720 + pull * 70;
  ink([[228, 690], [338, 704], [350 + pull * 20, cy + 40], [216 - pull * 20, cy + 40]], '#2c2c38');
  for (let k = 0; k < 4; k++) { g.strokeStyle = '#4a4a5a'; g.lineWidth = 4; g.beginPath(); g.moveTo(222 - pull * 15, 712 + k * (cy - 690) / 4); g.lineTo(344 + pull * 15, 712 + k * (cy - 690) / 4); g.stroke(); }
  ink([[340, cy - 10], [470, cy - 40], [520, cy + 40], [470, cy + 110], [360, cy + 90]], GL);
  for (let k = 0; k < 3; k++) { g.strokeStyle = '#5a5a6a'; g.lineWidth = 5; g.beginPath(); g.moveTo(360, cy + 10 + k * 26); g.lineTo(420, cy + k * 26); g.stroke(); }
  g.lineWidth = 34; g.strokeStyle = IK; g.lineCap = 'round'; g.beginPath(); g.moveTo(500, cy + 40); g.lineTo(600, cy + 120); g.stroke(); g.lineWidth = 22; g.strokeStyle = '#1e1e26'; g.stroke();
  if (t > 0.55 && t < 0.85) { const k = 1 - (t - 0.55) / 0.3; g.strokeStyle = `rgba(255,255,255,${k})`; g.lineWidth = 10; for (let i = 0; i < 5; i++) { const a = -2.6 + i * 0.35; g.beginPath(); g.moveTo(280 + 120 * Math.cos(a), 700 + 120 * Math.sin(a)); g.lineTo(280 + 190 * Math.cos(a), 700 + 190 * Math.sin(a)); g.stroke(); } }
};
const TINT = { vault: '#dfe7f8', vaultHook: '#e2ebff', corridor: '#eef2ff', corridorRed: '#ffe8e8', corridorGreen: '#e8fff0', corridorBlue: '#e8f0ff', car: '#c0cfe8', night: '#7884aa', forestNight: '#9eb0c8', morning: '#fffaf0', office: '#fff4e4', hall: '#fff6ea', lab: '#ffffff', board: '#fff2e2', cell: '#b8c6e8', vaultFinal: '#9aa8c8', spot: '#fff6e0', vaultHeist: '#d8e2f8', dusk: '#ffeede' };
const W_domino = (f) => ramp(f, 996, 1046) * 1.15;
const T_dog = (T, o, set, pos, s, flip) => CARD('dog' + JSON.stringify(o), (p) => T.toonDog(p, o), set, pos, s, { flip, blob: true, shadow: true, order: 2 });
export const actorsAt = (f, T) => {
  T_ = T; const S = shotAt(f), id = S.id, out = [], tint = TINT[S.light] || '#ffffff', set = S.set, ff = Math.floor(f);
  const add = (a) => { a.tint = a.tint || tint; out.push(a); };
  switch (id) {
    case 'hook': {
      const ph = ff < 24 ? 0 : ff < 41 ? 1 : 2;
      const o = ph === 0 ? { expr: 'determined', turn: 0.4, look: 0.8, R: { x: 530, y: 375, b: 0.5 }, L: 'hip' } : ph === 1 ? { expr: 'smug', turn: 0.12, look: 0, R: { x: 520, y: 390, b: 0.5 }, L: 'hip', blink: blinkAt(ff, 2) } : { expr: 'sly', turn: 0.05, look: 0, headTilt: -4, R: { x: 520, y: 390, b: 0.5 }, L: 'hip' };
      add(CH('kopfHeist', o, set, [-0.15, 0, -4.15], { s: 0.85 }));
      add(FXC('gemglow', (p) => T.fxGlow(p, '170,215,255', 0.8), set, [0.3, 1.3, -4.25], 0.5));
      for (let i = 0; i < 14; i++) { const t = ((ff + i * 7) % 24) / 24; const a = i * 2.39; const r = 0.12 + 0.35 * ((i * 37) % 10) / 10; const p = [0.3 + Math.cos(a) * r, 1.45 + Math.sin(a * 1.7) * 0.35 + 0.2, -4.0 + (i % 4) * 0.12];
        add(FXC('tw' + q(t, 1), (pp) => T.fxTwinkle(pp, q(t, 1)), set, p, 0.09 + (i % 3) * 0.03, { order: 7 })); }
      add(FXC('lampglow', (p) => T.fxGlow(p, '255,246,210', 0.9), set, [-0.13, 1.47, -4.05], 0.16, { order: 8 }));
      break;
    }
    case 'gloves': { const t = q(clamp((f - 60) / 18), 2); add(CARD('gl' + t, glovesDraw(t), set, [0, 0.8, 12.0], 0.6, { tint: '#ffffff' })); break; }
    case 'gang': {
      const z = lerp(7.2, 6.6, ramp(f, 78, 99)), st = q((ff % 16) / 16), wk = { legs: 'walk', step: st };
      add(CH('koca', { expr: 'smug', turn: 0.2, holdR: 'toolbag', R: 'hang', ...wk }, set, [-0.6, 0, z], { s: 0.95, tint: '#c4cce0' }));
      add(CH('kopfHeist', { expr: 'determined', ...wk, L: 'hang', R: 'hang' }, set, [0.05, 0, z - 0.2], { s: 0.95, tint: '#c4cce0' }));
      add(CH('siska', { expr: 'worried', turn: -0.2, ...wk, L: 'belly', R: 'hang' }, set, [0.65, 0, z + 0.1], { s: 0.95, tint: '#c4cce0' }));
      for (const x of [-0.6, 0.05, 0.65]) add(FXC('lg', (p) => T.fxGlow(p, '255,246,210', 1), set, [x, 1.92, z - 0.25], 0.22, { order: 8 }));
      break;
    }
    case 'car': case 'bite': {
      const siskaPos = [0.62, 0.33, 0.02];
      add(CH('kopfHeist', { expr: 'smug', turn: 0.3, look: 0.5, legs: 'sit', L: 'cross', R: 'cross', blink: blinkAt(ff, 5), lampOn: false }, set, [0.05, 0.28, -1.45], { s: 0.9, blob: false }));
      add(CH('koca', { expr: 'determined', turn: -0.3, legs: 'sit', L: 'wheel', R: 'wheel', lampOn: false }, set, [-0.85, 0.28, 0.02], { s: 0.92, blob: false }));
      if (id === 'car') {
        const lift = smooth(ramp(f, 104, 126));
        add(CH('siska', { expr: f < 118 ? 'worried' : 'goofy', look: f < 118 ? -0.3 : 0.7, turn: 0.1, legs: 'sit', holdR: 'sandwichFull', R: { x: q(lerp(420, 410, lift), 0), y: q(lerp(560, 450, lift), 0), b: 0.6 }, L: 'belly', blink: blinkAt(ff, 9) }, set, siskaPos, { s: 0.9, blob: false }));
      } else {
        const toMouth = smooth(ramp(f, 137, 146)), back = smooth(ramp(f, 149, 158)), bitten = f >= 147;
        const X = bitten ? lerp(0.59, 0.82, back) : lerp(0.82, 0.59, toMouth), Y = bitten ? lerp(1.33, 0.98, back) : lerp(0.98, 1.33, toMouth);
        const hx = (X - 0.026 - 0.6) / (1.35 * 0.9) * 600 + 300, hy = (2.19375 - ((Y + 0.046) - 0.33) / 0.9) / 2.25 * 1000;
        const chew = q(((ff - 147) % 8) / 8, 2);
        const o = !bitten ? { expr: 'bite', turn: 0.15, look: 0.4 } : { expr: 'chew', chew, turn: 0, look: 0, headTilt: q(Math.sin(f * 0.8) * 2, 1) };
        add(CH('siska', { ...o, legs: 'sit', R: { x: q(hx, 0), y: q(hy, 0), b: 0.5 }, L: 'belly' }, set, siskaPos, { s: 0.9, blob: false }));
        add(CARD('sand' + (bitten ? 1 : 0), (p) => T.sandwichCard(p, { k: 3, bite: bitten ? 1 : 0, rot: -1.35 }), set, [X, Y, 0.18], 0.148, { tint: f > 165 ? '#fff4e0' : '#e8eefc' }));
        if (f >= 147 && f < 156) { const t = q((f - 147) / 9, 1); add(FXC('crumb' + t, (p) => T.fxBurst(p, t, '#f0c070', 9, 30, 160), set, [0.62, 1.6, 0.25], 0.3)); }
        if (f >= 168 && f < 178) { const t = q((f - 168) / 10, 1); add(FXC('hit' + t, (p) => T.fxSpeed(p, t), set, [0.846, 1.25, 0.2], 0.22, { order: 9 })); }
      }
      break;
    }
    case 'ten': {
      const n = Math.floor(clamp((f - 271) / 33) * 10.99);
      for (let k = 0; k < n; k++) { const a = Math.PI * (0.95 - k * 0.09); add(FXC('rg', (p) => T.fxGlow(p, '255,60,50', 1), set, [Math.cos(a) * 2.05, 1.75 + Math.sin(a) * 1.85, 5.9], 0.35, { order: 8 })); }
      break;
    }
    case 'heat': add(FXC('hg', (p) => T.fxGlow(p, '255,70,40', 1), set, [-2.3, 3.0, 6.1], 0.7, { order: 8 })); add(FXC('heat' + (ff % 12), (p) => T.fxHeat(p, (ff % 12) / 12), set, [-2.3, 3.0, 6.15], 0.42, { order: 9 })); break;
    case 'radar': add(FXC('ping' + (ff % 15), (p) => T.fxPing(p, (ff % 15) / 15), set, [2.3, 3.0, 6.1], 0.5, { order: 9 })); add(FXC('grg', (p) => T.fxGlow(p, '90,255,140', 0.6), set, [2.3, 3.0, 6.05], 0.5, { order: 8 })); break;
    case 'magnet': add(FXC('force' + (ff % 14), (p) => T.fxForce(p, (ff % 14) / 14), set, [-2.35, 1.35, 6.15], 0.55, { order: 9 })); add(FXC('mg', (p) => T.fxGlow(p, '120,190,255', 0.5), set, [-2.35, 1.35, 6.1], 0.5, { order: 8 })); break;
    case 'dial': case 'spin': if (id === 'spin') add(FXC('sp' + (ff % 6), (p) => T.fxSpeed(p, (ff % 6) / 6, 'rgba(200,230,255,0.35)'), set, [-0.45, 1.9, 5.9], 0.42, { order: 9 })); break;
    case 'guard': {
      const yawn = f < 535;
      add(CH('guard', yawn ? { expr: 'yawn', L: 'up', R: 'up', bob: q(Math.sin((f - 510) / 25 * Math.PI) * 0.01, 3) } : { expr: 'smug', L: 'hip', R: 'thumb', blink: blinkAt(ff, 3) }, set, [1.55, 0, 11.3], { s: 1.05 }));
      const nod = q(Math.sin(f * 0.32) * 7, 0);
      add(CH('merchA', { expr: 'happy', headTilt: nod, turn: 0.3, L: 'belly', R: 'hang' }, set, [-1.3, 0, 8.8], { s: 0.95 }));
      add(CH('merchB', { expr: 'happy', headTilt: -nod, turn: -0.3, L: 'hang', R: 'thumb' }, set, [-0.45, 0, 8.4], { s: 0.95 }));
      break;
    }
    case 'office': {
      const wave = f < 600;
      add(CH('kopfSuit', { expr: 'happy', turn: -0.35, look: -0.6, headTilt: q(Math.sin(f * 0.25) * 4, 0), R: wave ? 'wave' : 'hang', L: 'belly', blink: blinkAt(ff, 4) }, set, [0.1, 0, -2.65], { s: 0.95 }));
      add(CH('merchA', { expr: 'laugh', turn: 0.4, look: 0.6, L: 'belly', R: wave ? 'wave' : 'hang' }, set, [-0.95, 0, -1.15], { s: 0.95 }));
      break;
    }
    case 'loupe': {
      add(CH('kopfSuit', { expr: f < 655 ? 'neutral' : 'smug', loupe: true, look: 0.5, turn: 0.15, holdR: 'diamond', R: { x: 440, y: 360, b: 0.5 }, L: 'hang', blink: 0 }, set, [0.1, 0, -2.65], { s: 0.95 }));
      for (const [f0, s] of [[637, 0.16], [652, 0.2]]) if (f >= f0 && f < f0 + 12) { const t = q((f - f0) / 12, 1); add(FXC('tw' + t, (p) => T.fxTwinkle(p, t), set, [0.395, 1.43, -2.55], s, { order: 9 })); }
      break;
    }
    case 'doorSign': {
      const x = lerp(-1.0, -0.48, easeOut(ramp(f, 672, 700))), walking = f < 700;
      add(CH('kopfSuit', { expr: f < 700 ? 'happy' : 'sly', turn: f < 700 ? 0.5 : 0.1, look: f < 700 ? 0.8 : 0.2, legs: walking ? 'walk' : 'stand', step: q((ff % 18) / 18), holdL: 'briefcase', L: 'hang', R: f < 700 ? 'hang' : 'thumb', blink: blinkAt(ff, 6) }, set, [x, 0, 2.95], { s: 0.95 }));
      break;
    }
    case 'doorOpen': {
      const t = smooth(ramp(f, 735, 758));
      add(CH('kopfSuit', { expr: 'happy', turn: 0.4, look: 0.6, legs: f > 735 ? 'walk' : 'stand', step: q((ff % 18) / 18), holdL: 'briefcase', R: f < 736 ? { x: 470, y: 520, b: 0.6 } : 'hang', L: 'hang' }, set, [lerp(-0.55, 0.0, t), 0, lerp(2.85, 1.6, t)], { s: 0.95 }));
      add(FXC('warm', (p) => T.fxGlow(p, '255,200,120', 0.55), set, [0, 1.4, 1.5], 1.2, { order: 1 }));
      break;
    }
    case 'key': {
      const up = smooth(ramp(f, 790, 804));
      add(CH('kopfSuit', { expr: f < 790 ? 'curious' : 'sly', look: f < 790 ? 0.5 : 0, turn: f < 790 ? 0.2 : 0, R: { x: q(lerp(430, 455, up), 0), y: q(lerp(520, 380, up), 0), b: 0.6 }, L: 'hang', blink: f < 790 ? 0 : blinkAt(ff, 1) }, set, [0.0, 0, -1.1], { s: 0.95 }));
      if (f >= 806 && f < 820) { const t = q((f - 806) / 14, 1); add(FXC('tw' + t, (p) => T.fxTwinkle(p, t, '#fff4c0'), set, [0.36, 1.35, -0.95], 0.2, { order: 9 })); }
      break;
    }
    case 'walk': {
      const z = lerp(11.5, 8.9, ramp(f, 823, 861));
      add(CH('kopfSuit', { expr: 'happy', turn: 0.5, look: 0.9, legs: 'walk', step: q((ff % 18) / 18), holdL: 'briefcase', L: 'hang', R: f > 838 ? 'wave' : 'hang' }, set, [-0.6, 0, z], { s: 0.95 }));
      add(CH('guard', { expr: 'happy', turn: -0.5, look: -0.8, L: 'hip', R: f > 835 ? 'wave' : 'hang' }, set, [1.55, 0, 11.3], { s: 1.05 }));
      break;
    }
    case 'pen': {
      const glance = f >= 903;
      add(CH('kopfSuit', { expr: glance ? 'sly' : 'determined', turn: glance ? 0.1 : -0.55, look: glance ? 0.4 : -0.9, holdR: 'pen', R: { x: 210, y: 380, b: 0.6 }, L: 'hang', blink: 0 }, set, [-0.42, 0, 7.8], { s: 0.95 }));
      for (const c of [871, 884, 897]) if (f >= c && f < c + 6) { const t = q((f - c) / 6, 1); add(FXC('fl' + t, (p) => T.fxFlash(p, t), set, [-0.6, 1.43, 7.7], 0.12, { order: 9 })); }
      break;
    }
    case 'alley': {
      const t = ramp(f, 926, 992), st = q((ff % 16) / 16), lamp = f >= 975;
      const pos = (x1, z1) => [x1 - (1 - t) * 5.5, 0, z1 - (1 - t) * 1.8];
      const tn = f < 960 ? '#5c6a92' : '#8a96bc';
      const wk = { legs: 'walk', step: st, lampOn: lamp };
      add(CH('koca', { expr: 'smug', turn: 0.4, holdR: 'toolbag', R: 'hang', L: 'hang', ...wk }, set, pos(-1.3, -3.3), { s: 0.95, tint: tn }));
      add(CH('kopfHeist', { expr: 'determined', turn: 0.35, L: 'hang', R: 'hang', ...wk }, set, pos(-0.3, -2.7), { s: 0.95, tint: tn }));
      add(CH('siska', { expr: 'worried', turn: 0.4, look: -0.5, L: 'belly', R: 'hang', ...wk }, set, pos(0.6, -3.5), { s: 0.95, tint: tn }));
      if (lamp) for (const [x, z] of [[-1.3, -3.3], [-0.3, -2.7]]) add(FXC('al', (p) => T.fxGlow(p, '255,246,210', 1), set, [x - (1 - t) * 5.5, 1.88, z - (1 - t) * 1.8 + 0.05], 0.2, { order: 8 }));
      break;
    }
    case 'domino': {
      add(CH('koca', { expr: f > 1015 ? 'laugh' : 'determined', turn: 0.5, look: 0.8, L: f > 1015 ? 'up' : 'hang', R: f > 1015 ? 'up' : 'hang', holdL: f > 1015 ? null : 'toolbag' }, set, [1.65, 0, -0.5], { s: 0.95 }));
      add(CH('siska', { expr: 'goofy', turn: 0.5, look: 0.8, holdR: 'sandwichFull', R: 'forward', L: 'belly' }, set, [1.1, 0, -2.4], { s: 0.95 }));
      add(CH('kopfHeist', { expr: 'smug', turn: 0.3, look: 0.5, L: 'cross', R: 'cross' }, set, [2.1, 0, -3.9], { s: 0.95 }));
      for (let k = 0; k < 6; k++) { const t = ((ff + k * 5) % 18) / 18, z = -4.2 + (k * 0.9) % 4.8, y = 0.8 + (k * 0.37) % 1.8; if (W_domino(f) > (z + 4.4) / 6) add(FXC('tw' + q(t, 1), (p) => T.fxTwinkle(p, q(t, 1)), set, [4.3, y, z], 0.12, { order: 9 })); }
      break;
    }
    case 'bags': {
      const peak = f > 1108;
      add(CH('koca', { expr: 'laugh', turn: 0.3, L: 'up', R: peak ? 'up' : 'belly' }, set, [-0.9, 0, -1.3], { s: 0.95 }));
      add(CH('kopfHeist', { expr: peak ? 'laugh' : 'sly', L: 'cross', R: peak ? 'up' : 'cross' }, set, [0, 0, -1.6], { s: 0.95 }));
      add(CH('siska', { expr: 'goofy', turn: -0.3, holdL: 'sandwichFull', L: 'forward', R: peak ? 'up' : 'belly' }, set, [0.85, 0, -1.3], { s: 0.95 }));
      for (let i = 0; i < 16; i++) { const t = ((ff + i * 5) % 20) / 20, a = i * 2.39, r = 0.2 + (i % 5) * 0.16; add(FXC('tw' + q(t, 1), (p) => T.fxTwinkle(p, q(t, 1)), set, [Math.cos(a) * r * 1.4, 1.25 + (i % 4) * 0.15 + Math.sin(a) * 0.1, -0.4 + Math.sin(a) * 0.25], 0.1 + (i % 3) * 0.04, { order: 9 })); }
      const k = Math.exp(-((f - 1115) ** 2) / 60); if (k > 0.05) add(FXC('bg' + q(k, 1), (p) => T.fxGlow(p, '210,235,255', q(k, 1)), set, [0, 1.35, -0.3], 1.4, { order: 9 }));
      break;
    }
    case 'throw': {
      const cz = carZ(f), lean = f < 1201;
      if (f < 1222) add(CH('siska', { expr: lean ? 'worried' : 'goofy', turn: 0.5, look: 0.7, holdR: lean ? 'trashbag' : null, R: lean ? { x: 520, y: q(lerp(420, 260, ramp(f, 1189, 1200)), 0), b: 0.5 } : 'wave', L: 'hang', tilt: 8 }, set, [CARX + 0.42, 0.5, cz - 0.75], { s: 0.48, blob: false, tint: '#a8b8d4' }));
      if (f >= 1220 && f < 1231) { const t = q((f - 1220) / 11, 1); add(FXC('pf' + t, (p) => T.fxPuff(p, t), set, [3.3, 0.35, 38.8], 1.2, { order: 9 })); add(FXC('lv' + t, (p) => T.fxBurst(p, t, '#5a8a3a', 8, 30, 200), set, [3.3, 0.4, 38.8], 0.8, { order: 9 })); }
      break;
    }
    case 'find': {
      const walkT = ramp(f, 1232, 1262), crouch = f >= 1264;
      const x = lerp(2.0, 2.65, walkT), z = lerp(33.6, 36.8, walkT);
      add(CH('anwohner', crouch ? { expr: f < 1288 ? 'curious' : 'shock', legs: 'crouch', turn: 0.4, look: 0.7, L: 'hang', R: { x: 520, y: 640, b: 0.5 } } : { expr: 'neutral', legs: 'walk', step: q((ff % 18) / 18), turn: 0.4, look: 0.6, L: 'hang', R: 'hang', blink: blinkAt(ff, 2) }, set, [x, 0, z], { s: 0.95 }));
      const dz = lerp(35.5, 37.0, ramp(f, 1232, 1255));
      add(T_dog(T, { sniff: q(0.5 + 0.5 * Math.sin(f * 0.6), 1), wag: q((ff % 10) / 10, 1), expr: f > 1270 ? 'want' : 'happy' }, set, [lerp(2.6, 3.0, ramp(f, 1232, 1255)), 0, dz], 0.75, false));
      break;
    }
    case 'env': break;
    case 'tape': break;
    case 'sandwich': {
      add(FXC('sg', (p) => T.fxGlow(p, '255,210,120', 0.6), set, [3.3, 0.1, 38.1], 0.4, { order: 3 }));
      add(CARD('sandH', (p) => T.sandwichCard(p, { k: 1.8, bite: 1, rot: -0.08 }), set, [3.3, 0.06 - 0.267 * 0.2, 38.18], 0.2, { tint: '#ffffff', order: 6 }));
      for (const [f0, x, y] of [[1392, 3.4, 0.16], [1412, 3.24, 0.14], [1428, 3.38, 0.12]]) if (f >= f0 && f < f0 + 12) { const t = q((f - f0) / 12, 1); add(FXC('tw' + t, (p) => T.fxTwinkle(p, t, '#fff6d0'), set, [x, y, 38.22], 0.08, { order: 9 })); }
      const dx = lerp(2.85, 3.02, smooth(ramp(f, 1390, 1415)));
      add(T_dog(T, { sniff: 0.2, wag: q((ff % 8) / 8, 1), expr: 'want', look: 1 }, set, [dx, 0, 38.05], 0.55, false));
      break;
    }
    case 'lab': {
      add(CH('labExpert', { expr: f < 1478 ? 'curious' : 'happy', turn: 0.35, look: f < 1478 ? 0.7 : 0.1, R: { x: 470, y: 330, b: 0.6 }, holdR: 'tweezers', L: 'hang', blink: blinkAt(ff, 7) }, set, [-0.6, 0, 0.55], { s: 0.95 }));
      add(CARD('sandL', (p) => T.sandwichCard(p, { k: 3, bite: 1, rot: -1.35 }), set, [-0.11, 1.35, 0.64], 0.12, { tint: '#ffffff', order: 6 }));
      if (f >= 1476 && f < 1492) { const t = q((f - 1476) / 16, 1); add(FXC('dtw' + t, (p) => T.fxTwinkle(p, t, '#c8f4ff'), set, [0.4, 1.7, -0.05], 0.45, { order: 9 })); }
      break;
    }
    case 'board': {
      const pinned = f >= 1515;
      add(CH('detective', { expr: pinned ? 'determined' : 'serious', turn: 0.55, look: 0.8, R: pinned && f > 1522 ? 'hang' : { x: 505, y: 410, b: 0.5 }, L: 'hip', blink: blinkAt(ff, 8) }, set, [-1.3, 0, -1.2], { s: 0.95 }));
      break;
    }
    case 'cell': {
      const sigh = f >= 1586 && f < 1604;
      add(CH('kopfPrison', { expr: sigh ? 'sleep' : 'sad', legs: 'sit', turn: 0.1, look: -0.2, headTilt: sigh ? -7 : -2, bob: sigh ? -0.012 : 0, L: 'belly', R: 'belly', blink: sigh ? 0 : blinkAt(ff, 3) }, set, [-0.55, 0.12, -1.2], { s: 0.95, blob: false }));
      break;
    }
    case 'empty': case 'gem': case 'gone': {
      if (f > 1762) break;
      const g = id === 'empty' ? [0.55, 0.06, -1.6] : loneAt(f);
      for (const [f0, k] of [[1640, 0.1], [1682, 0.16], [1700, 0.14], [1735, 0.14], [1750, 0.2]]) if (f >= f0 && f < f0 + 12) { const t = q((f - f0) / 12, 1); add(FXC('tw' + t, (p) => T.fxTwinkle(p, t), set, [g[0], 0.12, g[2] + 0.05], k, { order: 9 })); }
      add(FXC('lg' + (id === 'empty' ? 1 : 0), (p) => T.fxGlow(p, '170,215,255', 0.5), set, [g[0], 0.1, g[2]], id === 'empty' ? 0.25 : 0.4, { order: 3 }));
      break;
    }
  }
  return out;
};
export const fxAt = (f, T) => [];
