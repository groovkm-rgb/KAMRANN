// "Die schnellsten Reiter der Welt" — Pony-Express short, 51.12 s voice + 0.5 s tail, 30 fps.
// Phrase starts (s -> frame), hand-checked against voice.mp3 (silence analysis):
//  0.10 Stell dir vor, du bist sechzehn.            f0     | 1.73 Und dein Job ... zu reiten.          f52
//  4.00 Amerika steht kurz vor dem Bürgerkrieg.     f120   | 5.89 Der neue Präsident hält eine Rede.   f177
//  7.63 Und Kalifornien muss sie hören –            f229   | 9.41 Tausende Kilometer entfernt.         f282
// 10.95 Es gibt keine Bahn. f328 | 12.15 Kein Telefon. f364 | 13.22 Nur Reiter. f397
// 14.45 Alle fünfzehn bis fünfundzwanzig Kilometer f433 ... wartet ein frisches Pferd (~16.3) f487
// 18.02 Du springst ab, f540 | 18.36 wirfst die Posttasche rüber, f551 | 20.37 springst wieder auf. f611
// 21.52 Durch Wüste, f645 | 22.08 Schnee f662 | 22.72 und Flüsse. f682
// 23.57 Nach über hundert Kilometern f707 ... übernimmt der Nächste (~24.9) f752
// 26.21 Sieben Tage und siebzehn Stunden später f786 ... ist die Rede in Kalifornien (~27.95) f838
// 29.54 Rekord. f886 | 30.46 Aber während die Reiter durch die Prärie jagen, f914 | 32.78 stehen neben ihnen Männer ... f983
// 35.36 Für einen Draht. f1061 | 36.76 Ein paar Monate später ist der Draht fertig: f1103 | 38.92 der Telegraf. f1168
// 39.92 Eine Nachricht braucht jetzt nicht mehr Tage. f1198 | 41.95 Sondern Minuten. f1258
// 43.52 Zwei Tage später ist alles vorbei. f1306 | 45.14 Nach nur achtzehn Monaten. f1354
// 46.65 Die schnellsten Reiter der Welt. f1399 | 48.57 Besiegt … von einem Draht. f1457 | end 51.12 + 0.5 tail
export const FPS = 30, TOTAL = 1549;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const smooth = (t) => { t = clamp(t); return t * t * t * (t * (t * 6 - 15) + 10); };
const easeOut = (t) => 1 - (1 - clamp(t)) ** 3.2, easeIn = (t) => clamp(t) ** 2.4;
const lerp = (a, b, t) => a + (b - a) * t, lerp3 = (a, b, t) => a.map((v, i) => lerp(v, b[i], t)), ramp = (f, a, b) => clamp((f - a) / (b - a));
const q = (x, n = 2) => Math.round(x * 10 ** n) / 10 ** n;
const sin = Math.sin, cos = Math.cos, PI = Math.PI, abs = Math.abs;
const hash = (n) => { const x = sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// ---------------- cast ----------------
const RIDER = { body: '#9fd0f0', bw: 190, detail: [{ t: 'vest', c: '#8a5a2e' }, { t: 'scarf', c: '#d8302a' }, 'satchel', 'belt'], hair: '#b98a4e', hairStyle: 'mop', freckles: true, iris: '#3a8ae0', backHat: '#d2ae72', legs: '#6a4426', boots: '#3a2416' };
const RIDER2 = { body: '#ece2c8', bw: 190, detail: [{ t: 'vest', c: '#4a3a34' }, { t: 'scarf', c: '#3f9a4e' }, 'belt'], hair: '#1c1a20', hairStyle: 'mop', backHat: '#8a6a4a', legs: '#3a3a48', boots: '#2a1c14' };
const KEEPER = { body: '#5a7a9a', bw: 215, detail: ['straps', 'pocket', 'buttons'], hair: '#eeeeee', hairStyle: 'sides', mous: '#f6f6f6', mousStyle: 'handle', hat: { type: 'flatcap', color: '#6a6258', stripes: '#7c7468' }, legs: '#4a5a72', boots: '#3a2a1c' };
const OPERATOR = { body: '#f0ece0', detail: ['collar', { t: 'vest', c: '#3a3a48' }, { t: 'sleeves', c: '#26262e' }, 'tie'], hair: '#6a4024', hairStyle: 'sides', mous: '#6a4024', glasses: '#2a2228', hat: { type: 'visor', color: '#3f9a5a' } };
const PRINTER = { body: '#e8e0d0', detail: [{ t: 'apron', c: '#4a4a56' }, { t: 'sleeves', c: '#e8e0d0' }], hair: '#3a2a22', hairStyle: 'sides', mous: '#3a2a22', hat: { type: 'flatcap', color: '#5a5a66' } };
const MEGA = { body: '#7a3a4a', detail: ['collar', 'tie', 'buttons'], hair: '#2a2228', hairStyle: 'sides', mous: '#2a2228', mousStyle: 'handle', hat: { type: 'top', color: '#2a2430', band: '#b8402e' }, legs: '#3a3a44' };
const NEWSBOY = { body: '#c8a45a', bw: 170, headScale: 1.05, detail: ['straps', 'pocket'], hair: '#8a5a2e', hairStyle: 'mop', freckles: true, hat: { type: 'flatcap', color: '#5a5a6a' }, legs: '#5a4a3a' };
const SPY = { body: '#b8683a', bw: 210, detail: ['straps', 'belt'], hair: '#3a2a22', hairStyle: 'sides', beard: '#6a4a32', hat: { type: 'wide', color: '#6a5238', band: '#3a2a1c' }, legs: '#4a4a5a', boots: '#3a2a1c' };
const LADY = { body: '#c85a7a', robe: true, detail: [{ t: 'scarf', c: '#f4ead8' }, { t: 'trim', c: '#f4ead8' }], hair: '#8a5a2e', hairStyle: 'bun', hat: { type: 'bonnet', color: '#f0e4cc', band: '#c85a7a' } };
const MINER = { body: '#d8483a', detail: ['belt', 'collar'], hair: '#6a4024', hairStyle: 'sides', goatee: '#6a4024', hat: { type: 'wide', color: '#c9a56a', band: '#7a4a26' }, legs: '#4a3a30' };
const BLUE = { body: '#3a5fa8', detail: ['buttons', 'belt'], hair: '#3a2a22', hairStyle: 'sides', mous: '#3a2a22', hat: { type: 'kepi', color: '#27407a' }, legs: '#3a4a6a' };
const GREY = { body: '#a3a8ac', detail: ['buttons', 'belt'], hair: '#8a5a2e', hairStyle: 'sides', goatee: '#8a5a2e', hat: { type: 'kepi', color: '#6f757c' }, legs: '#6a6f76' };
const SPEAKER = { body: '#1c1a22', bw: 170, robe: true, hair: '#141218', hairStyle: 'short' };
const WORKER = (i) => ({ body: ['#e0d2b4', '#d0b890', '#c8c0b0'][i % 3], bw: 205, detail: ['straps', { t: 'sleeves', c: '#f0e6d0' }, 'belt'], hair: ['#3a2a22', '#8a5a2e', '#2a2228'][i % 3], hairStyle: i % 2 ? 'sides' : 'short', mous: i % 2 ? '#3a2a22' : null, beard: i === 2 ? '#8a5a2e' : null, hat: i % 3 === 1 ? null : { type: i % 2 ? 'flatcap' : 'wide', color: i % 2 ? '#6a6a5a' : '#8a7250' }, legs: '#5a5046', boots: '#3a2a1c' });
const CROWDBACK = (i) => ({ body: ['#b8683a', '#4a6a8a', '#8a9a5a', '#c85a7a', '#7a3a4a'][i % 5], robe: i % 5 === 3, detail: [], hair: ['#3a2a22', '#6a4024', '#8a5a2e'][i % 3], hairStyle: i % 5 === 3 ? 'bun' : 'short', hat: i % 5 === 3 ? { type: 'bonnet', color: '#f0e4cc' } : { type: ['wide', 'bowler', 'flatcap'][i % 3], color: ['#6a5238', '#2e2a30', '#6a6a5a'][i % 3] }, legs: '#4a4a5a' });

// ---------------- light presets ----------------
const BASE = { az: -60, el: 35, sky: '#cfdcf2', ground: '#8a7a6a', hemi: 1.15, sun: '#fff1dc', sunI: 2.4, fog: '#cfdcee', fogNear: 60, fogFar: 800, skyTop: '#3d7fd6', skyHor: '#cfe0f4', sat: 1.2,
  waterDeep: '#2c6c8c', waterShal: '#5aaec4', glint: '#effaff', vig: 0.22, shadowExt: 14, ink: 1.5 };
export const LIGHTS = {
  sunset: { ...BASE, az: -90, el: 7, sky: '#ffc49a', ground: '#8a4630', hemi: 1.05, sun: '#ffb468', sunI: 2.7, fog: '#f39a5c', fogNear: 25, fogFar: 520, skyTop: '#5b3f9a', skyHor: '#ffab4e', sunDisc: '#fff0c0', sunSize: 0.011, sat: 1.28, gain: '#fff2e2', lift: '#0a0206', vig: 0.3, heat: 0.5, tint: '#f6dcc4', rim: '#ffd08a', shadowExt: 12 },
  gold: { ...BASE, az: -105, el: 13, sky: '#ffd0a4', ground: '#8a4a32', hemi: 1.1, sun: '#ffc078', sunI: 2.8, fog: '#f5a868', fogNear: 30, fogFar: 600, skyTop: '#5f58b0', skyHor: '#ffb860', sunDisc: '#fff0c0', sunSize: 0.008, sat: 1.28, gain: '#fff4e6', lift: '#080206', vig: 0.26, heat: 0.35, tint: '#f8e2cc', rim: '#ffd08a', shadowExt: 12 },
  noon: { ...BASE, az: -70, el: 62, sky: '#ffe6c0', ground: '#b06a44', hemi: 1.3, sun: '#fff4d8', sunI: 3.0, fog: '#f6cf9c', fogNear: 20, fogFar: 380, skyTop: '#4a90d8', skyHor: '#f8dcae', sat: 1.25, gain: '#fff6e8', heat: 1.6, vig: 0.24, tint: '#fff0dc', rim: '#fff0c0' },
  storm: { ...BASE, az: -130, el: 30, sky: '#8a96a8', ground: '#4a5248', hemi: 0.95, sun: '#c8d4e8', sunI: 0.9, fog: '#6c7886', fogNear: 18, fogFar: 300, skyTop: '#232a36', skyHor: '#77828e', sat: 0.82, gain: '#eef2ff', lift: '#02040a', vig: 0.42, tint: '#b8c2d0', rim: '#dfe8ff' },
  speech: { ...BASE, az: 130, el: 34, sky: '#dce8fa', ground: '#8a8478', hemi: 1.2, sun: '#fff2dc', sunI: 2.5, fog: '#d6e4f4', fogNear: 60, fogFar: 600, skyTop: '#4688d8', skyHor: '#dceafa', sat: 1.12, vig: 0.24, tint: '#f4f0ea', rim: '#fff4d8', shadowExt: 30 },
  flight: { ...BASE, az: -90, el: 20, sky: '#ffd8ae', ground: '#9a5236', hemi: 1.15, sun: '#ffcc8a', sunI: 2.6, fog: '#f4b47c', fogNear: 80, fogFar: 900, skyTop: '#4a78d0', skyHor: '#ffc478', sunDisc: '#fff0c0', sunSize: 0.006, sat: 1.25, vig: 0.2, shadowExt: 80 },
  town: { ...BASE, az: 150, el: 32, sky: '#ffe8c8', ground: '#a8784e', hemi: 1.2, sun: '#ffeccc', sunI: 2.6, fog: '#f0d8b4', fogNear: 40, fogFar: 600, skyTop: '#3f86dc', skyHor: '#f4dcb8', sat: 1.22, gain: '#fff6ea', vig: 0.22, tint: '#fbf2e6', rim: '#ffe6b0' },
  townBack: { ...BASE, az: 90, el: 20, sky: '#ffe2ba', ground: '#a8784e', hemi: 1.2, sun: '#ffd8a0', sunI: 2.6, fog: '#f4c890', fogNear: 14, fogFar: 260, skyTop: '#4a86d8', skyHor: '#ffd49a', sunDisc: '#fff0c0', sunSize: 0.008, sat: 1.25, gain: '#fff4e4', vig: 0.26, tint: '#f6e4d0', rim: '#ffd890' },
  plain: { ...BASE, az: 110, el: 40, sky: '#e6ecf6', ground: '#8a8a5a', hemi: 1.2, sun: '#fff2d8', sunI: 2.5, fog: '#dbe4ec', fogNear: 50, fogFar: 700, skyTop: '#3f82da', skyHor: '#d8e6f2', sat: 1.2, heat: 0.5, vig: 0.22, tint: '#faf4ea', rim: '#fff0c8' },
  candle: { ...BASE, az: 40, el: 60, sky: '#a894b8', ground: '#8a5c38', hemi: 1.9, sun: '#ffb060', sunI: 0.0, fog: '#141020', fogNear: 6, fogFar: 40, skyTop: '#0c1024', skyHor: '#1c2040', sat: 1.1, gain: '#ffe6c0', lift: '#04030a', vig: 0.55, ink: 2 },
  station: { ...BASE, az: 155, el: 24, sky: '#ffe6c4', ground: '#8a7a4e', hemi: 1.15, sun: '#ffdca8', sunI: 2.7, fog: '#f0d8b0', fogNear: 40, fogFar: 600, skyTop: '#4688d8', skyHor: '#f6dcb0', sat: 1.22, gain: '#fff5e6', vig: 0.24, tint: '#fbf0e0', rim: '#ffdc98' },
  stationW: { ...BASE, az: 178, el: 13, sky: '#ffdcb0', ground: '#8a7446', hemi: 1.1, sun: '#ffc888', sunI: 2.7, fog: '#f6c488', fogNear: 20, fogFar: 380, skyTop: '#4a80d0', skyHor: '#ffcc88', sunDisc: '#fff0c0', sunSize: 0.009, sat: 1.25, gain: '#fff3e2', vig: 0.26, tint: '#f6e0c8', rim: '#ffd48a' },
  snow: { ...BASE, az: 110, el: 28, sky: '#dfeaff', ground: '#a8b8d8', hemi: 1.45, sun: '#e8f0ff', sunI: 1.2, fog: '#dfe9f6', fogNear: 6, fogFar: 85, skyTop: '#8aa6c8', skyHor: '#e6eef8', sat: 0.95, gain: '#eef4ff', lift: '#040810', vig: 0.3, tint: '#dfe8fa', rim: '#ffffff' },
  river: { ...BASE, az: 110, el: 36, sky: '#dcefff', ground: '#6a8a5a', hemi: 1.2, sun: '#fff4dc', sunI: 2.6, fog: '#cfe4f0', fogNear: 40, fogFar: 500, skyTop: '#3a84dc', skyHor: '#cfe6f4', sat: 1.25, waterDeep: '#1f7a9a', waterShal: '#58bcd0', glint: '#f4fdff', vig: 0.22, tint: '#f6f6f0', rim: '#f0fbff' },
  dusk: { ...BASE, az: -165, el: 5, sky: '#8a84c8', ground: '#5a4038', hemi: 0.95, sun: '#ff9a5a', sunI: 1.5, fog: '#a8607a', fogNear: 18, fogFar: 320, skyTop: '#221f55', skyHor: '#f0764a', sat: 1.2, gain: '#ffeede', lift: '#06030c', vig: 0.36, tint: '#d2c2d6', rim: '#ffb46a' },
  press: { ...BASE, az: 40, el: 60, sky: '#ffe8c8', ground: '#8a6a48', hemi: 1.55, sun: '#fff', sunI: 0.0, fog: '#e8d8b8', fogNear: 10, fogFar: 60, skyTop: '#cfe6ff', skyHor: '#cfe6ff', sat: 1.18, gain: '#fff4e2', vig: 0.34, ink: 1.9, tint: '#fbf0e0', rim: '#ffe8b0' },
  office: { ...BASE, az: 40, el: 60, sky: '#f4dcb8', ground: '#7a5a40', hemi: 1.4, sun: '#fff', sunI: 0.0, fog: '#d8c8a8', fogNear: 10, fogFar: 60, skyTop: '#cfe6ff', skyHor: '#cfe6ff', sat: 1.15, gain: '#fff2e0', lift: '#020308', vig: 0.4, ink: 1.9, tint: '#f6ecdc', rim: '#fff0c0' },
  prairie: { ...BASE, az: 120, el: 30, sky: '#ffeccc', ground: '#8a8a52', hemi: 1.2, sun: '#ffe8bc', sunI: 2.6, fog: '#ecdcb8', fogNear: 50, fogFar: 700, skyTop: '#4186da', skyHor: '#f0e0bc', sat: 1.22, gain: '#fff6e8', vig: 0.22, heat: 0.25, tint: '#fbf2e2', rim: '#ffe4a8' },
  wire: { ...BASE, az: 6, el: 16, sky: '#ffe2b8', ground: '#8a8a52', hemi: 1.15, sun: '#ffd49a', sunI: 2.6, fog: '#f4d4a4', fogNear: 60, fogFar: 700, skyTop: '#4a80d4', skyHor: '#ffd69c', sunDisc: '#fff2c8', sunSize: 0.007, sat: 1.24, gain: '#fff4e4', vig: 0.26, ink: 1.6 },
  blue: { ...BASE, az: 100, el: 24, sky: '#cfdcff', ground: '#6a7a6a', hemi: 1.05, sun: '#ffe2c0', sunI: 2.2, fog: '#c2d2ee', fogNear: 50, fogFar: 700, skyTop: '#2f5fc8', skyHor: '#c8d8f4', sat: 1.2, gain: '#f2f6ff', lift: '#02040c', vig: 0.3, tint: '#eaf0fa', rim: '#9fd8ff' },
  closing: { ...BASE, az: 150, el: 18, sky: '#e0d8d0', ground: '#7a6a52', hemi: 1.1, sun: '#f4d4b0', sunI: 1.9, hemi: 1.45, fog: '#d2c4b4', fogNear: 30, fogFar: 420, skyTop: '#7a8cb0', skyHor: '#e2ccb4', sat: 0.86, gain: '#fbf2ec', lift: '#040406', vig: 0.36, tint: '#e6dcd4', rim: '#f6dcb8' },
  final: { ...BASE, az: -96, el: 3.5, sky: '#c88ab8', ground: '#4a2a3a', hemi: 0.8, sun: '#ff9a50', sunI: 1.8, fog: '#d2685e', fogNear: 60, fogFar: 900, skyTop: '#34206e', skyHor: '#ff8a3c', sunDisc: '#fff0b8', sunSize: 0.012, sat: 1.3, gain: '#fff0e6', lift: '#08030c', vig: 0.34, ink: 1.2, tint: '#2c1a32', rim: '#ffb060', shadowExt: 20 },
};

// ---------------- card helpers ----------------
let _tmp;
/** rim light: bright edge on the side the light comes from (dx,dy = shift of the mask in design px) */
const withRim = (draw, col, dx = 9, dy = 5, a = 0.92) => (p) => { draw(p); const g = p.g, c = g.canvas; if (!_tmp) _tmp = document.createElement('canvas'); _tmp.width = c.width; _tmp.height = c.height; const t = _tmp.getContext('2d');
  t.drawImage(c, 0, 0); t.globalCompositeOperation = 'destination-out'; t.drawImage(c, dx * 2, dy * 2); t.globalCompositeOperation = 'source-in'; t.fillStyle = col; t.fillRect(0, 0, c.width, c.height);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = a; g.drawImage(_tmp, 0, 0); g.restore(); };
let LCUR = BASE; // light of the current shot (tint + rim for cards)
const rimOf = (o) => (o.rim === false ? null : o.rim || LCUR.rim), dxOf = (o) => o.rimDx ?? 9;
const CH = (T, spec, opts, pos, o = {}) => { const rim = rimOf(o), d = (p) => T.toonChar(p, spec, opts); return { key: 'c' + JSON.stringify([spec, opts, rim, dxOf(o)]), draw: rim ? withRim(d, rim, dxOf(o), o.rimDy ?? 5) : d, x: pos[0], y: pos[1], z: pos[2], tint: o.tint || LCUR.tint, ...o }; };
const HS = (T, ho, pos, o = {}) => { const rim = rimOf(o), d = (p) => T.horseSide(p, ho); return { key: 'h' + JSON.stringify([ho, rim, dxOf(o)]), draw: rim ? withRim(d, rim, dxOf(o), o.rimDy ?? 5) : d, x: pos[0], y: pos[1], z: pos[2], s: 2.7, tint: o.tint || LCUR.tint, ...o }; };
const HF = (T, ho, pos, o = {}) => { const rim = rimOf(o), d = (p) => T.horseFront(p, ho); return { key: 'f' + JSON.stringify([ho, rim]), draw: rim ? withRim(d, rim, o.rimDx ?? 0, o.rimDy ?? 9) : d, x: pos[0], y: pos[1], z: pos[2], s: 1.75, tint: o.tint || LCUR.tint, ...o }; };
const FX = (key, draw, pos, s = 1, o = {}) => ({ key, draw, x: pos[0], y: pos[1], z: pos[2], s, blob: false, shadow: false, order: 2, ...o });
const blinkAt = (f, seed) => { const per = 38 + (seed * 17) % 30, ph = (Math.floor(f) + seed * 13) % per; return ph < 2 ? 0.5 : ph < 4 ? 1 : 0; };
const gph = (f, per = 11, off = 0) => q((((f + off) % per) + per) % per / per, 3);
/** rider-on-horse option block */
const riding = (f, o = {}) => ({ spec: o.spec || RIDER, lean: o.lean, dy: o.dy, opts: { expr: 'determined', wind: -1, windPh: q(f * 0.9 % 6.28, 1), hatSwing: q(sin(f * 0.8), 1), R: { x: 440, y: 560 }, L: { x: 330, y: 610 }, ...o.opts } });
const DUST = '232,188,140', DUSTR = '240,160,104', SNOWC = '244,248,255';
/** dust puffs left behind a galloping horse. xr(frame) = horse x at that frame */
const trail = (out, T, f, f0, xr, z, col = DUST, o = {}) => { const ev = o.every || 3, life = o.life || 24, e0 = Math.floor(f / ev) * ev;
  for (let k = 0; k < Math.ceil(life / ev); k++) { const e = e0 - k * ev; if (e < f0 - (o.pre || 0)) break; const t = (f - e) / life; if (t >= 1 || t < 0) continue; const sd = ((e / ev) % 3 + 3) % 3;
    out.push(FX('dust' + sd + col, (p) => T.fxDustCloud(p, sd + 1, col, 1), [(o.zr ? (o.x || 0) : xr(e) - (o.back ?? 1.5)) - (o.zr ? 0 : t * 0.6) + (hash(e) - 0.5) * 0.5, (o.y || 0) - 0.6 + t * 1.3, (o.zr ? xr(e) - 2.6 : z) + (hash(e + 3) - 0.5) * 0.6], (o.s0 || 1.0) + (o.s1 || 2.4) * t, { alpha: q((1 - t) ** 1.2 * (o.a || 0.75)), tint: o.tint })); } };
const birds = (out, T, f, n, base, dir = [0.12, 0.01, 0], s = 0.5, col = '#1e1a22', seed = 0) => { for (let i = 0; i < n; i++) { const fl = q(sin(f * 0.55 + i * 1.9 + seed), 1); out.push(FX('bird' + fl + col, (p) => T.propBird(p, fl, col), [base[0] + i * 2.2 * s * 3 + dir[0] * f + sin(i * 4.1 + seed) * 3, base[1] + sin(i * 2.3 + seed) * 1.8 + dir[1] * f + sin(f * 0.1 + i) * 0.3, base[2] + cos(i * 3.3) * 4 + dir[2] * f], s * (0.8 + 0.4 * hash(i + seed)), { rim: false })); } };
const motes = (out, T, f, n, box, s = 0.12, col = '#fff6dc', seed = 0) => { for (let i = 0; i < n; i++) { const t = (f * 0.006 + hash(i + seed) + 1) % 1; out.push(FX('mote', (p) => T.fxMote(p, 0.5), [box[0] + hash(i * 3 + seed) * box[3] + sin(f * 0.03 + i) * 0.25, box[1] + t * box[4], box[2] + hash(i * 7 + seed) * box[5]], s * (0.6 + hash(i * 5)), { alpha: q(sin(t * PI) * 0.9), y0: 0 })); } };
const glowAt = (out, T, pos, s, col = '255,214,140', k = 1, a = 1) => out.push(FX('glow' + col + k, (p) => T.fxGlow(p, col, k), [pos[0], pos[1] - 1.1 * s, pos[2]], s, { alpha: a }));
const tumble = (out, T, f, pos, s = 0.45) => out.push(FX('tumble', (p) => T.propTumble(p, 0), [pos[0], pos[1] - 1.0 * s + abs(sin(f * 0.35)) * 0.25, pos[2]], s, { roll: -f * 0.3, shadow: true }));
const flakes = (out, T, f, cam, n, o = {}) => { for (let i = 0; i < n; i++) { const sp = (o.speed || 0.05) * (1 + i * 0.3), ty = ((f * sp + i * 0.37) % 1), tx = ((f * (o.wind || 0.03) * (1 + i * 0.2) + i * 0.53) % 1), d = (o.d0 || 2.5) + i * (o.dd || 1.6), s = (o.s || 2.6) + i * 0.5, w = 1.35 * s, h = 2.25 * s;
  for (const k of [0, 1]) out.push(FX('flk' + (i % 3) + (o.col || SNOWC) + (o.streak || 0), (p) => T.fxFlakes(p, (i % 3) + 1, o.cnt || 46, o.r || 8, o.col || SNOWC, o.streak || 0), [cam[0] + (o.cx || 0) - (tx - 0.5 + k - 0.5) * w * 1.0, cam[1] - h / 2 + (o.cy || 0.6) - (ty - 0.5) * h * 0.6 + (k ? h * 0.3 : -h * 0.3) * 0, cam[2] - d], s, { alpha: o.a || 0.9 })); } };

// ---------------- shots ----------------
const hookZ = (u) => (u < 28 ? 0.4 + u * 0.13 : 4.04 + (u - 28) * 0.42), hookLift = (u) => (u < 28 ? 0 : 2.3 * sin(PI * clamp((u - 28) / 26)));
const chaseX = (f) => 14 + (f - 52) * 0.42;
const SWAP = { brown: [-1.5, 0, 3.8], black: [1.7, 0, 0.9], keeper: [3.5, 0, 2.0] };
const brownSkid = (u) => lerp(-8, SWAP.brown[0], easeOut(u / 10));
const blackGo = (u) => (u < 83 ? 0 : 0.016 * (u - 83) ** 2 + 0.1 * (u - 83));
const HAND = { brown: [-1.6, 0, 3.6], pinto: [1.5, 0, 0.9] };
const pintoGo = (u) => (u < 24 ? 0 : 0.02 * (u - 24) ** 2 + 0.12 * (u - 24));
const WORKX = 104, mastX = (f) => 88 + (f - 983) * 0.44, overX = (f) => 330 + (f - 1258) * 0.4;
const TAPS = [1108, 1112, 1120, 1124, 1128, 1136, 1142, 1146, 1150, 1156, 1160, 1163];
export const SHOTS = [
  // 1 ---- HOOK: rider gallops straight at the lens, leaps the ditch
  { id: 'hook', a: 0, b: 52, set: 'desert', light: 'sunset', world: () => ({ cloud: '#ffc890', cloudA: 0.9 }),
    cam: (f, u) => { const k = sin(PI * smooth(ramp(u, 24, 50))); return { pos: [0.35, 0.42 + k * 0.1, 8.8 - u * 0.008], look: [0, 1.75 + k * 5.2, -5], fov: 40 - u * 0.05 + k * 6, roll: -3 + u * 0.09, shadowAt: [0, 0, hookZ(u)] }; },
    dof: (f, u, C) => ({ focus: Math.max(1.5, C.pos[2] - hookZ(u)), cinf: 9 }), mb: (u) => (u >= 38 ? 3 : 1),
    act: (f, u, T) => { const out = []; if (u < 47) out.push(HF(T, { ph: gph(f, 10), lift: 0, rider: { spec: RIDER, dy: u > 28 ? -20 : 0, opts: { expr: 'determined', wind: 1, windPh: q(f * 0.9 % 6.28, 1), hatSwing: q(sin(f * 0.8), 1), R: { x: 270, y: 640 }, L: { x: 250, y: 600 }, blink: 0, headTilt: q(sin(f * 0.6) * 2, 0) } } }, [0, hookLift(u), hookZ(u)], { roll: u > 28 ? -0.05 * sin((u - 28) / 5) : 0 })); return out; },
    fx: (f, u, T) => { const out = []; glowAt(out, T, [0, 34, -300], 78, '255,196,110', 1, 0.9);
      trail(out, T, f, -30, (e) => hookZ(e), 0, DUSTR, { zr: 1, every: 3, life: 18, s0: 1.0, s1: 2.2, a: 0.5, y: 0.1, pre: 30 });
      for (let i = 0; i < 5; i++) out.push(FX('dust' + (i % 3) + DUSTR, (p) => T.fxDustCloud(p, (i % 3) + 1, DUSTR, 1), [sin(i * 2.4) * 4.2, -1.6 + i * 0.25 + sin(f * 0.1 + i) * 0.2, Math.min(hookZ(u), 5) - 6 - i * 2.6], 4.2 + i * 0.9, { alpha: 0.5 }));
      birds(out, T, f, 3, [-7, 9, -60], [0.14, 0.01, 0], 0.7, '#3a1c1c'); tumble(out, T, f, [-6 + u * 0.09, 0, -3.5], 0.5);
      for (let i = 0; i < 12; i++) { const t0 = 30 + (i % 4) * 3, t = (u - t0) / 16; if (t < 0 || t > 1) continue; const a = i * 1.37; out.push(FX('clod' + (i % 4), (p) => T.propClod(p, i % 4 + 1), [0.35 + cos(a) * (0.25 + t * 1.5), 0.3 + sin(a) * 0.35 + t * 1.6 - t * t * 1.3 + 0.25, 7.9 - t * 0.2 + (i % 3) * 0.12], 0.07 + 0.05 * (i % 3), { roll: f * 0.3 + i, rim: false })); }
      if (u >= 46) { const k = smooth(ramp(u, 46, 51)); out.push(FX('dust1' + DUSTR, (p) => T.fxDustCloud(p, 2, DUSTR, 1), [0.35, -1.3, 7.5], 1.6, { alpha: q(k), order: 9 })); out.push(FX('dust0' + DUSTR, (p) => T.fxDustCloud(p, 1, DUSTR, 1), [0.5, 0.2, 7.8], 1.2, { alpha: q(k), order: 9 })); }
      return out; } },
  // 2 ---- side chase at full speed, ducking under the branch
  { id: 'chase', a: 52, b: 120, set: 'desert', light: 'gold', world: () => ({ cloud: '#ffd0a0', cloudA: 0.9 }),
    cam: (f, u) => { const x = chaseX(f); return { pos: [x + 2.6 - u * 0.012, 0.85, 10.6 - u * 0.02], look: [x + 0.7, 2.25, 0], fov: 39, roll: 2.2 - u * 0.02, shadowAt: [x, 0, 0] }; },
    dof: (f, u, C) => ({ focus: C.pos[2], cinf: 11, near: 1.3 }), mb: (u) => (u < 4 ? 3 : 1),
    act: (f, u, T) => { const x = chaseX(f), d = smooth(ramp(u, 36, 45)) * (1 - smooth(ramp(u, 55, 64))); return [HS(T, { ph: gph(f), mochila: true, rider: riding(f, { lean: 14 + d * 36, dy: d * 30, opts: { expr: d > 0.3 ? 'scared' : 'determined', headTilt: q(d * 14, 0) } }) }, [x, 0, 0])]; },
    fx: (f, u, T) => { const out = [], x = chaseX(f); glowAt(out, T, [x - 80, 62, -300], 70, '255,200,120', 1, 0.8);
      trail(out, T, f, 40, chaseX, 0.3, DUSTR, { s0: 1.0, s1: 2.8, a: 0.8, pre: 12 }); birds(out, T, f, 4, [x - 4, 7.5, -30], [0.2, 0, 0], 0.5, '#3a1c1c', 2); tumble(out, T, f, [30 + u * 0.07, 0, -5], 0.5);
      for (let i = 0; i < 6; i++) { const e = Math.floor(f / 2) * 2 - i * 2, t = (f - e) / 12; if (t < 1) out.push(FX('clod' + (i % 4), (p) => T.propClod(p, i % 4 + 1), [chaseX(e) - 1.3 - t * 0.7, 0.1 + t * 1.3 - t * t * 1.2, 0.5 + hash(e) * 0.5], 0.06, { roll: f * 0.4, rim: false })); }
      if (u > 44 && u < 62) for (let i = 0; i < 5; i++) { const t = (u - 44 - i) / 14; if (t > 0 && t < 1) out.push(FX('leaf', (p) => { p.g.fillStyle = '#7a5a34'; p.g.beginPath(); p.g.ellipse(300, 500, 240, 110, 0.4, 0, 7); p.g.fill(); }, [34.2 + t * 2.2 + i * 0.3, 3.0 - t * 1.4 + sin(i) * 0.3, 0.6 + i * 0.2], 0.06, { roll: f * 0.5 + i })); }
      if (u < 7) { const k = 1 - smooth(u / 7); out.push(FX('dust1' + DUSTR, (p) => T.fxDustCloud(p, 2, DUSTR, 1), [x + 2.2, -1.2, 9.3], 1.7, { alpha: q(k), order: 9 })); }
      return out; } },
  // 3 ---- storm meadow: two groups across the fence
  { id: 'storm', a: 120, b: 177, set: 'storm', light: 'storm', world: () => ({ cloud: '#3c424e', cloudY: 0.75 }), whipOut: 1,
    cam: (f, u) => ({ pos: lerp3([0.5, 1.0, 13.4], [0.2, 1.3, 11.9], easeOut(u / 57) * 0.75 + u / 57 * 0.25), look: [0, 1.75, 0], fov: 45 - u * 0.04, roll: 4 - u * 0.05 }),
    dof: (f, u, C) => ({ focus: C.pos[2] - 6.1, cinf: 9, near: 1.2 }),
    act: (f, u, T) => [CH(T, BLUE, { expr: 'angry', turn: 0.8, look: 0.8, blink: blinkAt(f, 3), L: 'hip', R: 'cross', headTilt: q(sin(f * 0.15) * 2, 0) }, [-1.2, 0, 6.1], { s: 1.2, rimDx: -9 }),
      CH(T, GREY, { expr: 'determined', turn: -0.8, look: -0.8, blink: blinkAt(f, 8), L: 'cross', R: 'hip', headTilt: q(-sin(f * 0.13) * 2, 0) }, [1.2, 0, 6.0], { s: 1.2, rimDx: 9 })],
    fx: (f, u, T) => { const out = []; birds(out, T, f, 5, [-10, 9, -40], [0.16, 0.02, 0], 0.6, '#14161c', 5);
      for (const [f0, x, sd] of [[136, -70, 1], [160, 60, 2]]) if (f >= f0 && f < f0 + 6) out.push(FX('bolt' + sd, (p) => T.propBolt(p, sd), [x, 8, -260], 42, { alpha: f - f0 < 4 ? 1 : 0.5 }));
      flakes(out, T, f, [0.6, 1.2, 12], 3, { col: '200,210,225', streak: 26, r: 3, cnt: 34, speed: 0.11, wind: 0.09, a: 0.5 }); return out; },
    lightFn: (L, f) => { for (const f0 of [136, 160]) if (f >= f0 && f < f0 + 6) { const k = f - f0 < 3 ? 1 : 0.5; return { ...L, skyTop: '#5a6a8a', skyHor: '#c8d4ee', sunI: 0.9 + 3 * k, hemi: 0.95 + 0.9 * k }; } return L; } },
  // 4 ---- the speech: distant figure from behind the crowd, unfinished dome
  { id: 'speech', a: 177, b: 229, set: 'capitol', light: 'speech', world: () => ({ cloud: '#ffffff' }), whipIn: 1,
    cam: (f, u) => ({ pos: lerp3([2.6, 1.7, 9.5], [1.4, 3.3, 4.0], easeOut(u / 52) * 0.6 + u / 52 * 0.4), look: lerp3([0, 9.5, -40], [0, 11, -40], u / 52), fov: 47 - u * 0.06, roll: -1.5 + u * 0.03 }),
    dof: (f, u, C) => ({ focus: 34, cinf: 7, near: 1.6 }),
    act: (f, u, T) => { const out = [CH(T, SPEAKER, { back: true, L: 'hang', R: u % 26 < 13 ? 'up' : 'point', holdR: 'paper' }, [0, 2.6, -30.2], { s: 1.45, tint: '#15131a', rim: false })];
      [[-2.9, 2.2, 0], [3.2, 1.6, 1], [-1.2, -0.6, 2], [1.6, -1.6, 3], [4.6, -1.2, 4], [-4.4, -1.4, 5]].forEach(([x, z, i]) => out.push(CH(T, CROWDBACK(i), { back: true, L: i % 2 ? 'up' : 'hang', R: i % 3 ? 'hang' : 'wave', holdR: i % 3 ? null : 'hat', bob: q(abs(sin(f * 0.25 + i)) * 0.012, 3) }, [x, 0, z], { s: 1.1, rim: false })));
      return out; },
    fx: (f, u, T) => { const out = []; birds(out, T, f, 5, [-14, 34, -60], [0.1, 0.02, 0], 1.1, '#2a2a34', 9);
      for (let i = 0; i < 9; i++) { const t = ((f * 0.011 + i * 0.211) % 1); out.push(FX('paper', (p) => T.propPaper(p, 0), [-9 + t * 20 + sin(i * 3) * 2, 3.2 + sin(t * 6 + i) * 1.2 + (i % 3), -22 + (i % 4) * 4.5], 0.16, { roll: f * 0.12 + i * 2, rim: false })); }
      motes(out, T, f, 10, [-3, 1, 0, 7, 4, 3], 0.1); return out; } },
  // 5 ---- west: flight over the desert to California
  { id: 'flight', a: 229, b: 282, set: 'desert', light: 'flight', world: () => ({ cloud: '#fff0dc' }),
    cam: (f, u) => { const t = u / 53, z = lerp(390, -70, t * 0.55 + easeIn(t) * 0.45), y = lerp(92, 30, smooth(t)); return { pos: [18 * sin(t * 2.2), y, z], look: [-10 * sin(t * 2.2), y - 26 - t * 12, z - 150], fov: 56 - t * 6, roll: 7 * sin(t * 3.0) }; },
    dof: () => ({ focus: 100, cinf: 0 }), mb: (u) => (u > 40 ? 4 : 2),
    act: () => [],
    fx: (f, u, T) => { const out = [], C = SHOTS[4].cam(f, u); glowAt(out, T, [0, 150, -420], 150, '255,206,130', 1, 0.8); birds(out, T, f, 5, [C.pos[0] - 6, C.pos[1] - 9, C.pos[2] - 40], [0, 0, -0.5], 0.9, '#3a2a2a', 3);
      for (let i = 0; i < 4; i++) { const t = ((u * 0.05 + i * 0.27) % 1); out.push(FX('cl' + i % 2, (p) => T.fxDustCloud(p, i % 2 + 1, '255,250,244', 1), [C.pos[0] + (i % 2 ? 9 : -10) + sin(i * 5) * 4, C.pos[1] - 5 - i, C.pos[2] - 60 + t * 62], 5 + i * 2, { alpha: q(sin(t * PI) * 0.75) })); }
      if (u > 44) out.push(FX('cl0', (p) => T.fxDustCloud(p, 1, '255,250,244', 1), [C.pos[0], C.pos[1] - 12, C.pos[2] - 8], 9, { alpha: q(smooth(ramp(u, 44, 52))), order: 9 })); return out; } },
  // 6 ---- California waits: the crowd looks east
  { id: 'wait', a: 282, b: 328, set: 'town', light: 'town', world: () => ({ cloud: '#ffffff' }),
    cam: (f, u) => ({ pos: lerp3([1.5, 1.3, 7.4], [0.75, 1.42, 4.9], easeOut(u / 46) * 0.7 + u / 46 * 0.3), look: [0.05, 1.95, -2], fov: 43, roll: -2 + u * 0.03 }),
    dof: (f, u, C) => ({ focus: C.pos[2] + 1.5, cinf: 12, near: 1.3 }),
    act: (f, u, T) => [CH(T, SPY, { expr: 'worried', turn: 0.12, R: { x: 395, y: 262, b: 1.6 }, holdR: 'spyglass', L: 'hip', headTilt: q(sin(f * 0.1) * 2, 0) }, [0, 0, -1.5], { s: 1.2 }),
      CH(T, LADY, { expr: 'worried', turn: 0.3, look: 0.4, blink: blinkAt(f, 5), L: 'chin', R: 'hang' }, [-1.75, 0, -2.5], { s: 1.05 }),
      CH(T, NEWSBOY, { expr: f > 305 ? 'shock' : 'neutral', turn: -0.2, look: 0, blink: blinkAt(f, 11), L: { x: 180, y: 250, b: 1.4 }, R: 'hang', bob: q(abs(sin(f * 0.3)) * 0.012, 3) }, [1.55, 0, -1.9], { s: 0.88 }),
      CH(T, MINER, { expr: 'neutral', turn: -0.25, blink: blinkAt(f, 2), L: 'hip', R: 'hip' }, [3.0, 0, -3.3], { s: 1.08 })],
    fx: (f, u, T) => { const out = []; tumble(out, T, f, [-5 + u * 0.1, 0, 1.6], 0.42); motes(out, T, f, 12, [-2.5, 0.4, 0, 5, 3.4, 3], 0.1); birds(out, T, f, 3, [-6, 11, -40], [0.1, 0, 0], 0.6, '#2a2a34', 4);
      for (let i = 0; i < 3; i++) out.push(FX('dust' + i + DUST, (p) => T.fxDustCloud(p, i + 1, DUST, 1), [-4 + i * 4 + u * 0.03, 0.2, -9 - i * 5], 3.5, { alpha: 0.28 }));
      if (u < 7) out.push(FX('cl0', (p) => T.fxDustCloud(p, 1, '255,250,244', 1), [1.4, -1.0, 6.2], 1.5, { alpha: q(1 - smooth(u / 7)), order: 9 })); return out; } },
  // 7 ---- no railway: empty prairie
  { id: 'nobahn', a: 328, b: 364, set: 'prairie', light: 'plain', world: () => ({ poles: 0, cloud: '#ffffff' }), whipOut: 1,
    cam: (f, u) => ({ pos: [200 + u * 0.05, 0.55 + u * 0.004, 7.6], look: [196 + u * 0.32, 1.9, -30], fov: 47, roll: 1.5 }),
    dof: () => ({ focus: 40, cinf: 8, near: 1.5 }), act: () => [],
    fx: (f, u, T) => { const out = []; tumble(out, T, f, [195 + u * 0.22, 0, -4], 0.5); tumble(out, T, f + 9, [206 + u * 0.13, 0, -11], 0.36); birds(out, T, f, 2, [196, 6.5, -30], [0.12, 0.02, 0], 0.7, '#2a2a34', 6);
      for (let i = 0; i < 3; i++) out.push(FX('dust' + i + DUST, (p) => T.fxDustCloud(p, i + 1, DUST, 1), [192 + i * 7 + u * 0.08, 0.3, -16 - i * 6], 4, { alpha: 0.3 })); motes(out, T, f, 10, [198, 0.3, 3, 5, 2.5, 3], 0.08); return out; } },
  // 8 ---- no telephone: an empty desk, a candle and a letter
  { id: 'notel', a: 364, b: 397, set: 'room', light: 'candle', world: () => ({ room: 'table', cloud: 0 }), whipIn: 1, whipOut: 1,
    cam: (f, u) => ({ pos: lerp3([1.0, 1.85, 2.9], [0.5, 1.55, 2.0], easeOut(u / 33) * 0.7 + u / 33 * 0.3), look: [-0.12, 1.18, -0.02], fov: 38, roll: -3 + u * 0.05 }),
    dof: (f, u, C) => ({ focus: Math.hypot(C.pos[0] + 0.3, C.pos[1] - 1.2, C.pos[2]), cinf: 10, near: 1.4 }), act: () => [],
    fx: (f, u, T) => { const out = [], fk = 0.9 + 0.1 * sin(f * 1.1); glowAt(out, T, [-0.55, 1.52, -0.05], 0.62 * fk, '255,190,100', 1, 0.8); glowAt(out, T, [-0.55, 1.5, 0.0], 0.14, '255,240,200', 1, 1);
      motes(out, T, f, 14, [-1.6, 1.0, -0.6, 3, 1.6, 1.4], 0.035, '#ffe0b0', 3);
      for (let i = 0; i < 3; i++) { const t = ((f * 0.02 + i * 0.33) % 1); out.push(FX('smk', (p) => T.fxSmoke(p, 1, 0.5), [-0.55 + sin(t * 5 + i) * 0.05, 1.6 + t * 0.7, -0.1], 0.08 + t * 0.12, { alpha: q((1 - t) * 0.35) })); } return out; } },
  // 9 ---- only riders: he bursts into frame
  { id: 'reiter', a: 397, b: 433, set: 'desert', light: 'gold', world: () => ({ cloud: '#ffd0a0', cloudA: 0.9 }), whipIn: 1,
    cam: (f, u) => { const x = 50 + u * 0.56, lx = lerp(60, x + 0.9, smooth(ramp(u, 5, 17))); return { pos: [63.5 + smooth(ramp(u, 10, 36)) * 4.5, 0.5, 8.2], look: [lx, 2.1, 0], fov: 44, roll: -3 + u * 0.06, shadowAt: [x, 0, 0] }; },
    dof: (f, u, C) => ({ focus: 8.4, cinf: 9, near: 1.3 }), mb: (u) => (u > 4 && u < 14 ? 3 : 1),
    act: (f, u, T) => [HS(T, { ph: gph(f), mochila: true, rider: riding(f) }, [50 + u * 0.56, 0, 0])],
    fx: (f, u, T) => { const out = [], xr = (e) => 50 + (e - 397) * 0.56; glowAt(out, T, [0, 62, -300], 70, '255,200,120', 1, 0.8); trail(out, T, f, 385, xr, 0.3, DUSTR, { s0: 1.1, s1: 3.0, a: 0.85, pre: 12 }); tumble(out, T, f, [66 - u * 0.05, 0, -4.5], 0.5); birds(out, T, f, 3, [58, 7, -30], [0.2, 0, 0], 0.5, '#3a1c1c', 2); return out; } },
  // 10 ---- relay station: the keeper waits with a fresh horse
  { id: 'keeper', a: 433, b: 487, set: 'station', light: 'station', world: () => ({ cloud: '#ffffff' }),
    cam: (f, u) => ({ pos: lerp3([-0.3, 1.25, 12.6], [0.2, 1.3, 10.6], easeOut(u / 54) * 0.7 + u / 54 * 0.3), look: [0.2, 3.15, 1.6], fov: 41, roll: 1.5 - u * 0.03, shadowAt: [0.5, 0, 1] }),
    dof: (f, u, C) => ({ focus: C.pos[2] - 2.6, cinf: 9, near: 1.3 }),
    act: (f, u, T) => [HS(T, { coat: 'black', gait: 'stand', tailSw: q(sin(f * 0.22), 1), paw: q(Math.max(0, sin(f * 0.25)) * (u > 20 && u < 44 ? 1 : 0), 1), breath: q(sin(f * 0.2), 1), wind: 0.3, windPh: q(f * 0.2 % 6.28, 1), reinTo: [330, -250] }, [0.9, 0, 1.8]),
      CH(T, KEEPER, { expr: 'happy', turn: -0.3, look: -0.6, blink: blinkAt(f, 4), R: { x: 470, y: 560, b: 0.6 }, L: u > 30 ? { x: 150, y: 230, b: 1.5 } : 'hip', headTilt: q(sin(f * 0.1) * 2, 0) }, [-0.75, 0, 3.4], { s: 1.12 })],
    fx: (f, u, T) => { const out = []; for (let i = 0; i < 4; i++) { const t = ((f * 0.012 + i * 0.25) % 1); out.push(FX('smk', (p) => T.fxSmoke(p, 1, 0.6), [-3.0 + t * 1.4, 5.9 + t * 3.2, -6.6], 0.5 + t * 1.3, { alpha: q((1 - t) * 0.55) })); }
      motes(out, T, f, 14, [-3, 0.3, 2, 7, 3.5, 5], 0.09); birds(out, T, f, 3, [-8, 9, -30], [0.1, 0.01, 0], 0.6, '#2a2a34', 8); tumble(out, T, f, [-6 + u * 0.06, 0, 5.2], 0.3); return out; } },
  // 11 ---- a dust cloud on the horizon
  { id: 'horizon', a: 487, b: 540, set: 'station', light: 'stationW', world: () => ({ cloud: '#ffe0b8' }),
    cam: (f, u) => ({ pos: lerp3([5.4, 1.45, 5.6], [4.6, 1.5, 5.0], u / 53), look: [-30, 2.3 - u * 0.004, 2.6], fov: 42 - u * 0.05, roll: -2 + u * 0.03, shadowAt: [0, 0, 3] }),
    dof: (f, u, C) => ({ focus: lerp(4.2, 9, smooth(ramp(u, 26, 44))), cinf: 12, near: 1 }),
    act: (f, u, T) => { const rx = lerp(-75, -9, easeIn(u / 53) * 0.6 + u / 53 * 0.4); return [
      HS(T, { ph: gph(f), mochila: true, rider: riding(f) }, [rx, 0, 2.4], { rimDx: -9 }),
      HS(T, { coat: 'black', gait: 'stand', tailSw: q(sin(f * 0.22), 1), breath: q(sin(f * 0.2), 1), wind: 0.4, windPh: q(f * 0.2 % 6.28, 1), tack: true, reinTo: [330, -250] }, [-8.5, 0, 6.9], { flip: true, rimDx: 9, s: 2.5 }),
      CH(T, KEEPER, { expr: u > 30 ? 'laugh' : 'happy', turn: -0.85, look: -1, L: u > 30 ? 'wave' : { x: 130, y: 250, b: 1.5 }, R: 'hip', bob: u > 30 ? q(abs(sin(f * 0.5)) * 0.015, 3) : 0 }, [-2.2, 0, 5.95], { s: 1.1, rimDx: -9 })]; },
    fx: (f, u, T) => { const out = [], xr = (e) => lerp(-75, -9, easeIn((e - 487) / 53) * 0.6 + (e - 487) / 53 * 0.4); glowAt(out, T, [-300, 68, 8], 70, '255,206,130', 1, 0.8);
      trail(out, T, f, 470, xr, 2.6, DUSTR, { s0: 1.4, s1: 4.2, a: 0.85, life: 40, every: 3, pre: 30, back: 2.4 }); motes(out, T, f, 12, [-2, 0.3, 2, 6, 3, 3], 0.09); birds(out, T, f, 3, [-30, 8, 6], [0, 0.01, -0.1], 0.5, '#3a2a2a', 3); return out; } },
  // 12 ---- the swap: off, throw the mochila across, on again, away (one flowing three-beat action)
  { id: 'swap', a: 540, b: 645, set: 'station', light: 'station', world: () => ({ cloud: '#ffffff' }),
    cam: (f, u) => { const k1 = easeOut(ramp(u, 11, 20)), k2 = easeOut(ramp(u, 71, 80)), k3 = smooth(ramp(u, 84, 104)); return { pos: [-0.9 + k1 * 0.5 + k2 * 0.9 + k3 * 1.6, 1.5 - k1 * 0.1, 10.9 - u * 0.006 - k1 * 1.1 - k2 * 0.3 + k3 * 1.2], look: [0.1 + k1 * 0.3 + k2 * 0.9 + k3 * 2.6, 1.95 + k2 * 0.3, 2], fov: 47 - k1 * 2 + k3 * 2, roll: -1.5 + k1 * 2 + k2 * 2 - k3 * 1.5, shadowAt: [0.3, 0, 2] }; },
    dof: (f, u, C) => ({ focus: C.pos[2] - 2.6, cinf: 6, near: 1.2 }), mb: (u) => (u < 6 ? 3 : 1),
    kicks: [{ f: 551, a: 0.012 }, { f: 582, a: 0.016 }, { f: 623, a: 0.014 }],
    act: (f, u, T) => { const out = [], B = SWAP.brown, K = SWAP.black, bx = brownSkid(u), gone = blackGo(u), mounted2 = u >= 82;
      // fresh black horse (far right) + keeper
      out.push(HS(T, { coat: 'black', gait: mounted2 && gone > 0.2 ? 'gallop' : 'stand', ph: gph(f), mochila: u >= 42, tailSw: q(sin(f * 0.22), 1), paw: u > 44 && u < 70 ? q(Math.max(0, sin(f * 0.4)), 1) : 0, wind: 0.3, windPh: q(f * 0.2 % 6.28, 1), reinTo: mounted2 ? undefined : [330, -250], pitch: u >= 78 && u < 88 ? q(-9 * sin(PI * (u - 78) / 10), 0) : 0, rider: mounted2 ? riding(f, { lean: gone > 0.2 ? 16 : 4, opts: { expr: 'determined' } }) : null }, [K[0] + gone, 0, K[2]]));
      out.push(CH(T, KEEPER, { expr: u > 84 ? 'laugh' : 'happy', turn: u > 84 ? 0.5 : -0.4, look: u > 84 ? 0.8 : -0.6, blink: blinkAt(f, 4), R: u > 84 ? 'wave' : 'hip', holdR: u > 84 ? 'hat' : null, L: u < 80 ? { x: 150, y: 520, b: 0.6 } : 'hip', bob: u > 84 ? q(abs(sin(f * 0.5)) * 0.015, 3) : 0, hat: u > 84 ? null : KEEPER.hat, hairStyle: 'sides' }, [K[0] + 2.0, 0, K[2] + 1.0], { s: 1.1 }));
      // tired brown horse (near left)
      out.push(HS(T, { coat: 'brown', gait: u < 6 ? 'gallop' : 'stand', ph: gph(f), mochila: u < 16, pitch: u < 12 ? q(-8 * (1 - u / 12), 0) : 0, headDown: q(smooth(ramp(u, 30, 60)) * 0.5, 1), breath: q(sin(f * 0.5), 1), breathPuff: u > 14 ? q(Math.max(0, sin(f * 0.26)) * 0.8, 1) : 0, tailSw: q(sin(f * 0.3), 1), rider: u < 4 ? riding(f, { lean: -6 }) : null }, [bx, 0, B[2]]));
      // the rider on foot
      if (u >= 4 && u < 82) { let x, y = 0, z, o;
        if (u < 12) { const t = (u - 4) / 8; x = lerp(bx - 0.3, 0.35, t); y = lerp(1.25, 0, t) + 0.7 * sin(PI * t); z = lerp(B[2], 3.0, t); o = { expr: 'determined', legs: t > 0.8 ? 'crouch' : 'stand', L: 'up', R: 'up', tilt: q(10 * (1 - t), 0), turn: 0.5 }; }
        else if (u < 26) { x = 0.35; z = 3.0; o = { expr: 'determined', legs: u < 15 ? 'crouch' : 'stand', turn: -0.6, look: -0.8, L: { x: 120, y: 430, b: 0.5 }, R: { x: 200, y: 470, b: 0.5 }, tilt: -6 }; }
        else if (u < 44) { const t = ramp(u, 26, 32); x = 0.35; z = 3.0; o = { expr: 'determined', turn: 0.6, look: 0.8, L: t < 1 ? { x: 160, y: 380 - t * 150, b: 0.8 } : 'hip', R: t < 1 ? { x: 330 + t * 160, y: 420 - t * 220, b: 0.6 } : { x: 520, y: 330, b: 0.4 }, tilt: q(-10 + t * 22, 0), legs: 'stand' }; }
        else if (u < 71) { const t = ramp(u, 44, 68); x = lerp(0.35, K[0] - 0.75, t); z = lerp(3.0, K[2] + 0.5, t); o = { expr: 'determined', turn: 0.7, look: 0.8, legs: 'walk', step: q(((u - 44) % 8) / 8, 2), L: 'forward', R: 'reach', tilt: 10, bob: q(abs(sin((u - 44) / 8 * PI * 2)) * 0.02, 3) }; }
        else { const t = (u - 71) / 11; x = lerp(K[0] - 0.75, K[0] - 0.25, t); z = K[2] + 0.4; y = lerp(0, 1.2, t) + 1.0 * sin(PI * t); o = { expr: 'determined', turn: 0.7, L: 'up', R: 'up', legs: t < 0.25 ? 'crouch' : 'stand', tilt: q(18 * sin(PI * t), 0) }; }
        out.push(CH(T, RIDER, { wind: -0.6, hatSwing: q(sin(f * 0.7), 1), ...o }, [x, y, z], { s: 0.97 })); }
      // the mochila
      if (u >= 16 && u < 42) { let p; if (u < 30) p = [0.35 + (u < 26 ? -0.42 : lerp(-0.42, 0.5, (u - 26) / 4)), u < 26 ? 1.05 : lerp(1.05, 1.9, (u - 26) / 4), 3.05]; else { const t = (u - 30) / 12; p = [lerp(0.85, K[0] - 0.12, t), lerp(1.9, 1.55, t) + 1.5 * sin(PI * t), lerp(3.05, K[2] + 0.05, t)]; }
        out.push(FX('moch', (p_) => T.propMochila(p_, 0), [p[0], p[1] - 0.42, p[2]], 0.34, { roll: u < 30 ? 0.2 : -(u - 30) * 0.5, shadow: true, tint: LCUR.tint })); }
      return out; },
    fx: (f, u, T) => { const out = [], K = SWAP.black; for (let i = 0; i < 4; i++) { const t = ((f * 0.012 + i * 0.25) % 1); out.push(FX('smk', (p) => T.fxSmoke(p, 1, 0.6), [-3.0 + t * 1.4, 5.9 + t * 3.2, -6.6], 0.5 + t * 1.3, { alpha: q((1 - t) * 0.55) })); }
      for (let i = 0; i < 5; i++) { const t = (u + 4 - i * 2) / 26; if (t > 0 && t < 1) out.push(FX('dust' + (i % 3) + DUST, (p) => T.fxDustCloud(p, i % 3 + 1, DUST, 1), [brownSkid(u) - 0.6 - i * 0.7 - t, 0.1 + t * 1.2, 4.0], 1.4 + t * 2.6, { alpha: q((1 - t) * 0.8) })); }
      if (u >= 11 && u < 20) { const t = (u - 11) / 9; out.push(FX('dust1' + DUST, (p) => T.fxDustCloud(p, 2, DUST, 1), [0.35, -0.3, 3.2], 0.7 + t, { alpha: q((1 - t) * 0.7) })); }
      if (u >= 42 && u < 50) { const t = (u - 42) / 8; out.push(FX('brst' + q(t, 1), (p) => T.fxSpark(p, t, '#fff3b0'), [K[0] - 0.1, 0.75, K[2] + 0.3], 0.55, {})); }
      if (u >= 83) trail(out, T, f, 623, (e) => K[0] + blackGo(e - 540), K[2] + 0.3, DUST, { s0: 0.9, s1: 2.8, a: 0.8, every: 2 });
      motes(out, T, f, 12, [-3, 0.3, 2, 7, 3.5, 5], 0.09); return out; } },
  // 13-15 ---- through desert, snow and rivers (three fast cuts on the hoofbeat)
  { id: 'wueste', a: 645, b: 662, set: 'desert', light: 'noon', world: () => ({ cloud: '#fff4e0' }),
    cam: (f, u) => { const x = 96 + u * 0.46; return { pos: [x + 6.5 - u * 0.05, 0.6, 7.2], look: [x + 0.6, 2.0, 0], fov: 43, roll: 3, shadowAt: [x, 0, 0] }; }, dof: () => ({ focus: 9.4, cinf: 9, near: 1.2 }),
    act: (f, u, T) => [HS(T, { ph: gph(f), mochila: true, rider: riding(f, { opts: { expr: 'worried' } }) }, [96 + u * 0.46, 0, 0])],
    fx: (f, u, T) => { const out = [], xr = (e) => 96 + (e - 645) * 0.46; trail(out, T, f, 630, xr, 0.3, '244,206,150', { s0: 1.1, s1: 3.0, a: 0.85, pre: 14 }); glowAt(out, T, [xr(f) - 60, 190, -200], 90, '255,244,210', 1, 0.7); birds(out, T, f, 2, [xr(f) + 2, 9, -20], [0.1, 0, 0], 0.5, '#3a2a2a', 1);
      for (const s of [-1, 1]) out.push(FX('drop', (p) => { p.g.fillStyle = '#9fd8f2'; p.g.beginPath(); p.g.ellipse(300, 500, 150, 240, 0, 0, 7); p.g.fill(); }, [xr(f) + 0.25 - ((u * 0.09 + (s > 0 ? 0.5 : 0)) % 1) * 0.9, 3.0 - ((u * 0.09 + (s > 0 ? 0.5 : 0)) % 1) * 0.4, 0.2], 0.05, {})); return out; } },
  { id: 'schnee', a: 662, b: 682, set: 'snow', light: 'snow', world: () => ({ cloud: '#dfe6f0' }),
    cam: (f, u) => { const x = 20 + u * 0.42; return { pos: [x + 2.6, 0.9, 9.6 - u * 0.03], look: [x + 0.8, 2.2, 0], fov: 41, roll: -3, shadowAt: [x, 0, 0] }; }, dof: () => ({ focus: 9.6, cinf: 8, near: 1.2 }),
    act: (f, u, T) => [HS(T, { ph: gph(f), mochila: true, breathPuff: q(0.5 + 0.5 * sin(f * 0.6), 1), rider: riding(f, { lean: 20, opts: { expr: 'scared' } }) }, [20 + u * 0.42, 0, 0])],
    fx: (f, u, T) => { const out = [], xr = (e) => 20 + (e - 662) * 0.42, C = SHOTS[13].cam(f, u); trail(out, T, f, 650, xr, 0.3, SNOWC, { s0: 0.9, s1: 2.4, a: 0.9, pre: 12 });
      flakes(out, T, f, C.pos, 4, { streak: 30, r: 7, cnt: 60, speed: 0.09, wind: 0.14, a: 0.95, d0: 1.6, dd: 2.0 });
      for (let i = 0; i < 3; i++) out.push(FX('dust' + i + SNOWC, (p) => T.fxDustCloud(p, i + 1, SNOWC, 1), [C.pos[0] - 6 + i * 6 - u * 0.2, 1.2, 3 - i * 3], 5, { alpha: 0.4 })); return out; } },
  { id: 'fluss', a: 682, b: 707, set: 'river', light: 'river', world: () => ({ cloud: '#ffffff' }),
    cam: (f, u) => { const x = -7 + u * 0.44; return { pos: [x + 2.4 + u * 0.03, 0.5, 9.2], look: [x + 0.8, 1.75, 0], fov: 42, roll: 2.5, shadowAt: [x, 0, 0] }; }, dof: () => ({ focus: 9.2, cinf: 8, near: 1.2 }),
    kicks: [{ f: 682, a: 0.012 }],
    act: (f, u, T) => [HS(T, { ph: gph(f), mochila: true, rider: riding(f, { opts: { expr: 'determined' } }) }, [-7 + u * 0.44, -0.5, 0], { blob: false })],
    fx: (f, u, T) => { const out = [], xr = (e) => -7 + (e - 682) * 0.44; for (let k = 0; k < 6; k++) { const e = Math.floor(f / 3) * 3 - k * 3, t = (f - e) / 15; if (t >= 1 || e < 676) continue; out.push(FX('spl' + q(t, 1) + (k % 2), (p) => T.fxSplashW(p, t, k % 2 + 1), [xr(e) + 0.5 - (k % 2) * 1.4, -0.75, 0.25 + (k % 2) * 0.2], 1.35, { rim: false })); }
      motes(out, T, f, 12, [xr(f) - 3, -0.1, -1, 7, 0.4, 3], 0.1, '#ffffff', 4); birds(out, T, f, 3, [xr(f) - 4, 8, -30], [0.14, 0, 0], 0.5, '#2a2a34', 7); return out; } },
  // 16 ---- home station at dusk: the next rider takes over
  { id: 'handoff', a: 707, b: 752, set: 'station', light: 'dusk', world: () => ({ big: 1, dusk: 1, cloud: '#e88a70', cloudA: 0.9 }),
    cam: (f, u) => { const k = smooth(ramp(u, 24, 44)); return { pos: [-1.2 + k * 1.8, 1.45, 11.2 - u * 0.02 + k * 0.6], look: [0.1 + k * 2.4, 2.0, 2], fov: 46, roll: 1.5 - k * 3, shadowAt: [0.3, 0, 2] }; },
    dof: (f, u, C) => ({ focus: C.pos[2] - 2.6, cinf: 7, near: 1.2 }), mb: (u) => (u < 4 ? 3 : 1), kicks: [{ f: 729, a: 0.014 }],
    act: (f, u, T) => { const B = HAND.brown, Pn = HAND.pinto, bx = lerp(-8, B[0], easeOut(u / 10)), go = pintoGo(u), give = smooth(ramp(u, 9, 16)), out = [];
      out.push(HS(T, { coat: 'pinto', gait: go > 0.15 ? 'gallop' : 'stand', ph: gph(f), mochila: u >= 22, tailSw: q(sin(f * 0.25), 1), paw: u < 20 ? q(Math.max(0, sin(f * 0.45)), 1) : 0, wind: 0.3, windPh: q(f * 0.2 % 6.28, 1), rider: { spec: RIDER2, lean: go > 0.15 ? 16 : 0, opts: { expr: u < 22 ? 'happy' : 'determined', turn: u < 22 ? -0.6 : 0.7, look: u < 22 ? -0.8 : 0.5, wind: go > 0.15 ? -1 : -0.3, L: u > 12 && u < 24 ? { x: 150, y: 500, b: 0.5 } : { x: 330, y: 610 }, R: { x: 440, y: 560 } } } }, [Pn[0] + go, 0, Pn[2]]));
      out.push(HS(T, { coat: 'brown', gait: u < 6 ? 'gallop' : 'stand', ph: gph(f), mochila: u < 14, pitch: u < 12 ? q(-8 * (1 - u / 12), 0) : 0, headDown: q(smooth(ramp(u, 26, 44)) * 0.5, 1), breathPuff: u > 12 ? q(Math.max(0, sin(f * 0.26)) * 0.8, 1) : 0, tailSw: q(sin(f * 0.3), 1),
        rider: riding(f, { lean: u < 8 ? -4 : 6 + smooth(ramp(u, 26, 40)) * 14, opts: { expr: u < 24 ? 'worried' : 'happy', blink: u > 34 ? 1 : 0, wind: u < 8 ? -1 : -0.2, R: u >= 9 && u < 26 ? { x: 440 + give * 90, y: 560 - give * 150, b: 0.4 } : { x: 420, y: 600 }, L: { x: 330, y: 610 }, headTilt: q(smooth(ramp(u, 26, 40)) * 12, 0) } }) }, [bx, 0, B[2]]));
      if (u >= 14 && u < 22) { const t = (u - 14) / 8; out.push(FX('moch', (p_) => T.propMochila(p_, 0), [lerp(B[0] + 0.75, Pn[0] - 0.15, t), lerp(2.0, 1.55, t) + 0.5 * sin(PI * t) - 0.42, lerp(B[2] + 0.05, Pn[2] + 0.05, t)], 0.34, { roll: -t * 1.2, tint: LCUR.tint })); }
      return out; },
    fx: (f, u, T) => { const out = [], Pn = HAND.pinto; for (const [x, y, z, s] of [[2.6, 2.48, -1.5, 1.5], [4.0, 2.68, -0.9, 1.7], [-10.0, 2.78, -4.9, 1.6], [-12.6, 2.78, -5.2, 1.6]]) glowAt(out, T, [x, y, z + 0.15], s * (0.94 + 0.06 * sin(f * 0.8 + x)), '255,196,110', 1, 0.9);
      for (let i = 0; i < 5; i++) { const t = (u + 4 - i * 2) / 26; if (t > 0 && t < 1) out.push(FX('dust' + (i % 3) + '214,160,150', (p) => T.fxDustCloud(p, i % 3 + 1, '214,160,150', 1), [lerp(-8, HAND.brown[0], easeOut(u / 10)) - 0.6 - i * 0.7 - t, 0.1 + t * 1.2, 3.9], 1.4 + t * 2.6, { alpha: q((1 - t) * 0.7) })); }
      if (u >= 24) trail(out, T, f, 731, (e) => Pn[0] + pintoGo(e - 707), Pn[2] + 0.3, '214,160,150', { s0: 0.9, s1: 2.8, a: 0.75, every: 2 });
      if (u >= 22 && u < 30) { const t = (u - 22) / 8; out.push(FX('brst' + q(t, 1), (p) => T.fxSpark(p, t, '#ffe0a0'), [Pn[0] - 0.1, 0.75, Pn[2] + 0.3], 0.55, {})); }
      for (let i = 0; i < 4; i++) { const t = ((f * 0.012 + i * 0.25) % 1); out.push(FX('smk', (p) => T.fxSmoke(p, 1, 0.6), [-3.0 + t * 1.4, 5.9 + t * 3.2, -6.6], 0.5 + t * 1.3, { alpha: q((1 - t) * 0.5) })); }
      motes(out, T, f, 14, [-4, 0.3, 1, 9, 3.5, 5], 0.07, '#ffd890', 2); return out; } },
  // 17 ---- he drops onto a hay bale, smiling
  { id: 'hay', a: 752, b: 786, set: 'station', light: 'dusk', world: () => ({ big: 1, dusk: 1, cloud: '#e88a70', cloudA: 0.9 }),
    cam: (f, u) => ({ pos: lerp3([-2.0, 1.3, 7.6], [-2.5, 1.15, 6.6], easeOut(u / 34) * 0.7 + u / 34 * 0.3), look: [-3.1, 1.35, 1.1], fov: 40, roll: 3 - u * 0.05, shadowAt: [-3, 0, 0.5] }),
    dof: (f, u, C) => ({ focus: Math.hypot(C.pos[0] + 3.1, C.pos[2] - 1.1), cinf: 10, near: 1 }), kicks: [{ f: 761, a: 0.02 }],
    act: (f, u, T) => { const t = ramp(u, 0, 9), land = u >= 9, sq = land ? 0.04 * Math.exp(-(u - 9) / 4) * cos((u - 9) * 1.2) : 0;
      return [HS(T, { coat: 'brown', gait: 'stand', headDown: 0.9, tailSw: q(sin(f * 0.3), 1), saddle: true, breathPuff: 0 }, [-6.6, 0, -1.6], { s: 2.5, rimDx: -9 }),
        CH(T, RIDER, { expr: land ? 'happy' : 'shock', blink: u > 18 ? 1 : 0, legs: 'sit', turn: 0.15, tilt: q(lerp(20, -16, t), 0), headTilt: q(land ? -8 + sin(f * 0.25) * 3 : 0, 0), L: land ? { x: 120, y: 640, b: 1 } : 'up', R: land ? { x: 480, y: 640, b: 1 } : 'up', wind: 0 }, [-3.15, lerp(1.5, 0.08, t * t) - sq, 1.1], { s: 1.05, rimDx: -9 })]; },
    fx: (f, u, T) => { const out = []; glowAt(out, T, [4.0, 2.68, -0.75], 1.8, '255,196,110', 1, 0.9); glowAt(out, T, [2.6, 2.48, -1.4], 1.5, '255,196,110', 1, 0.9); glowAt(out, T, [-10.0, 2.78, -4.9], 1.6, '255,196,110', 1, 0.9);
      if (u >= 9 && u < 30) { const t = (u - 9) / 21; for (let i = 0; i < 4; i++) out.push(FX('dust' + (i % 3) + '240,214,130', (p) => T.fxDustCloud(p, i % 3 + 1, '240,214,130', 1), [-3.15 + (i - 1.5) * (0.5 + t * 0.9), 0.1 + t * 0.7, 1.3 + (i % 2) * 0.2], 0.45 + t * 0.7, { alpha: q((1 - t) * 0.22) }));
        for (let i = 0; i < 9; i++) out.push(FX('straw', (p) => { p.g.strokeStyle = '#e8c860'; p.g.lineWidth = 60; p.g.lineCap = 'round'; p.g.beginPath(); p.g.moveTo(120, 500); p.g.lineTo(480, 500); p.g.stroke(); }, [-3.15 + cos(i * 0.9) * (0.4 + t * 1.3), 0.8 + sin(i * 1.7) * 0.3 + t * 1.6 - t * t * 1.8, 1.4 + (i % 3) * 0.1], 0.07, { roll: f * 0.2 + i })); }
      if (u > 20) { const t = ((u - 20) % 14) / 14; out.push(FX('puf', (p) => T.fxDustCloud(p, 2, '255,255,255', 1), [-2.75 + t * 0.4, 1.5 + t * 0.25, 1.3], 0.16 + t * 0.2, { alpha: q((1 - t) * 0.6) })); }
      motes(out, T, f, 14, [-5, 0.3, 0.5, 5, 2.6, 2.5], 0.06, '#ffd890', 5); return out; } },
  // 18 ---- California: the rider storms into town
  { id: 'arrive', a: 786, b: 838, set: 'town', light: 'townBack', world: () => ({ crowd: 0, cloud: '#ffe8c8' }),
    cam: (f, u) => ({ pos: [0.5 - u * 0.004, 1.05 + u * 0.004, -3.6], look: [0, 2.0 + smooth(ramp(u, 30, 52)) * 0.5, 14], fov: 44 - u * 0.04, roll: 2.5 - u * 0.08, shadowAt: [0, 0, 6] }),
    dof: (f, u, C) => ({ focus: Math.max(3, 30 - u * 0.48 + 3.6), cinf: 9, near: 1 }), mb: (u) => (u > 46 ? 3 : 1),
    act: (f, u, T) => { const z = 30 - u * 0.5, out = [HF(T, { ph: gph(f, 10), rider: { spec: RIDER, opts: { expr: u > 24 ? 'laugh' : 'determined', wind: 1, windPh: q(f * 0.9 % 6.28, 1), hatSwing: q(sin(f * 0.8), 1), R: u > 24 ? 'up' : { x: 270, y: 640 }, L: { x: 250, y: 600 } } } }, [0, 0, z])];
      [[-1.1, 2.2, 0], [1.2, 1.9, 1], [-1.9, 4.4, 2], [2.0, 4.0, 3], [-2.6, 6, 4], [2.8, 7, 5], [-3.4, 11, 6], [3.5, 12.5, 7], [-3.2, 17, 8], [3.3, 19, 9]].forEach(([x, zz, i]) => out.push(CH(T, CROWDBACK(i), { back: zz < 3, expr: 'laugh', turn: zz < 3 ? 0 : (x < 0 ? 0.7 : -0.7), L: 'up', R: i % 2 ? 'wave' : 'up', holdR: i % 3 === 0 ? 'hat' : null, bob: q(abs(sin(f * 0.45 + i * 1.3)) * 0.03, 3) }, [x, 0, zz], { s: zz < 3 ? 1.0 : 1.05, rim: zz < 3 ? false : undefined, tint: zz < 3 ? '#b8a898' : undefined })));
      return out; },
    fx: (f, u, T) => { const out = []; glowAt(out, T, [0, 110, 300], 80, '255,214,150', 1, 0.8); trail(out, T, f, 760, (e) => 30 - (e - 786) * 0.5 + 2.6, 0, '246,206,150', { zr: 1, every: 2, life: 30, s0: 1.4, s1: 4.2, a: 0.85, y: 0.4, pre: 26 });
      for (let i = 0; i < 6; i++) { const t0 = 16 + i * 5, t = (u - t0) / 26; if (t > 0 && t < 1) out.push(FX('hat' + i % 2, (p) => T.propHat(p, 0, i % 2 ? '#c9a56a' : '#6a5238'), [(i % 2 ? 1 : -1) * (1.8 + (i % 3) * 0.7), 2.2 + 3.2 * sin(PI * t), 1 + i * 1.6], 0.3, { roll: f * 0.25 + i })); }
      motes(out, T, f, 12, [-2.5, 0.4, -1, 5, 3.4, 3], 0.08); return out; } },
  // 19 ---- print shop: "Die Rede des Präsidenten"
  { id: 'press', a: 838, b: 886, set: 'room', light: 'press', world: (f, u) => { const k = smooth(ramp(u, 4, 18)); return { room: 'press', cloud: 0, press: abs(sin(f * 0.26)), fly: ramp(u, 0, 14),
      hero: { pos: [lerp(-1.6, -0.62, k), lerp(1.2, 1.12, k) + 0.7 * sin(PI * k), lerp(-0.6, 2.4, k)], rx: lerp(-1.4, -0.1, k), ry: lerp(1.2, 0.1, k) + sin(f * 0.07) * 0.03, rz: lerp(0.8, -0.05, k) + sin(f * 0.1) * 0.02, s: 0.86 } }; },
    cam: (f, u) => ({ pos: lerp3([-0.2, 1.75, 5.9], [-0.1, 1.6, 5.0], easeOut(u / 48) * 0.7 + u / 48 * 0.3), look: [-0.7, 1.75, -0.6], fov: 46, roll: -2 + u * 0.04 }),
    dof: (f, u, C) => ({ focus: C.pos[2] - 2.4, cinf: 6, near: 1 }), kicks: [{ f: 838, a: 0.012 }],
    act: (f, u, T) => [CH(T, PRINTER, { expr: 'laugh', turn: 0.4, look: 0.6, R: { x: 500, y: 300 + q(abs(sin(f * 0.26)) * 120, 0), b: 0.5 }, L: 'hip', bob: q(abs(sin(f * 0.26)) * 0.012, 3) }, [-3.1, 0, -0.4], { s: 1.12 }),
      CH(T, NEWSBOY, { expr: 'goofy', turn: -0.3, L: 'up', R: 'up', holdR: 'paper', bob: q(abs(sin(f * 0.5)) * 0.03, 3) }, [3.0, 0, -0.3], { s: 0.9 })],
    fx: (f, u, T) => { const out = []; motes(out, T, f, 16, [-2.4, 0.6, -1.2, 4, 3, 2.6], 0.05, '#fff0d0', 6); return out; } },
  // 20 ---- Rekord: hats in the air
  { id: 'rekord', a: 886, b: 914, set: 'town', light: 'town', world: () => ({ cheer: 1, cloud: '#ffffff' }),
    cam: (f, u) => ({ pos: lerp3([0.9, 1.15, 8.6], [0.55, 1.2, 7.7], easeOut(u / 28)), look: [0.15, 2.55, -1], fov: 46, roll: -3 + u * 0.1, shadowAt: [0, 0, 0] }),
    dof: (f, u, C) => ({ focus: C.pos[2] + 1.0, cinf: 8, near: 1.2 }), flash: (u) => (u < 4 ? (1 - u / 4) * 0.8 : 0), kicks: [{ f: 886, a: 0.02 }],
    act: (f, u, T) => { const rear = sin(PI * ramp(u, 0, 22)); return [HS(T, { coat: 'brown', gait: 'stand', pitch: q(-16 * rear, 0), lift: q(40 * rear, 0), paw: q(rear, 1), tailSw: q(sin(f * 0.4), 1), wind: 0.4, windPh: q(f * 0.3 % 6.28, 1), mochila: true, rider: riding(f, { lean: -8, opts: { expr: 'laugh', turn: 0.15, look: 0, wind: -0.4, R: { x: 470, y: 150, b: 1 }, holdR: 'hat', L: { x: 300, y: 610 } } }) }, [0.1, 0, -1.3], {}),
      CH(T, MEGA, { expr: 'laugh', turn: 0.35, R: { x: 420, y: 300, b: 1.2 }, holdR: 'megaphone', L: { x: 170, y: 470, b: 0.6 }, holdL: 'paper', bob: q(abs(sin(f * 0.5)) * 0.02, 3) }, [-0.8, 0, 2.0], { s: 1.08 }),
      CH(T, NEWSBOY, { expr: 'goofy', turn: -0.3, L: 'up', R: 'up', holdL: 'paper', bob: q(abs(sin(f * 0.6 + 1)) * 0.04, 3) }, [1.05, 0, 2.6], { s: 0.9 })]; },
    fx: (f, u, T) => { const out = []; for (let i = 0; i < 11; i++) { const t = ((u + i * 5) % 30) / 30; out.push(FX('hat' + i % 3, (p) => T.propHat(p, 0, ['#c9a56a', '#6a5238', '#2e2a30'][i % 3]), [-4.6 + i * 0.95 + sin(i * 2.2) * 0.6, 2.4 + 3.4 * sin(PI * t) + (i % 3) * 0.4, -2.5 - (i % 4) * 1.6], 0.3, { roll: f * 0.3 + i * 1.7 })); }
      motes(out, T, f, 12, [-2.5, 0.4, 2, 5, 3.4, 3], 0.08); birds(out, T, f, 4, [-5, 12, -40], [0.25, 0.05, 0], 0.6, '#f4f0e8', 4); return out; } },
  // 21 ---- but while the riders race across the prairie ...
  { id: 'prairie', a: 914, b: 983, set: 'prairie', light: 'prairie', world: () => ({ poles: 10, cloud: '#ffffff' }), whipOut: 1,
    cam: (f, u) => { const x = 44 + u * 0.42; return { pos: [x + 3.2 - u * 0.02, 1.0 + u * 0.004, 11.4 - u * 0.025], look: [x + 0.9, 2.6, 0], fov: 40, roll: -2 + u * 0.03, shadowAt: [x, 0, 1.6] }; },
    dof: (f, u, C) => ({ focus: C.pos[2] - 1.6, cinf: 8, near: 1.3 }),
    act: (f, u, T) => { const x = 44 + u * 0.42; return [HS(T, { ph: gph(f), mochila: true, rider: riding(f) }, [x, 0, 1.6]), HS(T, { coat: 'pinto', ph: gph(f, 11, 4), mochila: true, rider: riding(f, { spec: RIDER2 }) }, [x + 46 + u * 0.05, 0, -16], { s: 2.7 })]; },
    fx: (f, u, T) => { const out = [], xr = (e) => 44 + (e - 914) * 0.42; trail(out, T, f, 900, xr, 1.9, DUST, { s0: 1.0, s1: 2.8, a: 0.75, pre: 12 }); trail(out, T, f, 900, (e) => xr(e) + 46 + (e - 914) * 0.05, -15.7, DUST, { s0: 1.0, s1: 2.8, a: 0.6, pre: 12 });
      birds(out, T, f, 4, [xr(f) - 3, 9, -40], [0.3, 0.01, 0], 0.7, '#2a2a34', 2); tumble(out, T, f, [xr(f) + 4 - u * 0.1, 0, -2.4], 0.38); return out; } },
  // 22 ---- ... men stand beside them and raise poles
  { id: 'masts', a: 983, b: 1061, set: 'prairie', light: 'prairie', world: (f, u) => ({ poles: 9, wires: 8, gear: WORKX, raise: { x: WORKX, k: smooth(ramp(u, 4, 56)) }, cloud: '#ffffff' }), whipIn: 1,
    cam: (f, u) => { const x = mastX(f); return { pos: [lerp(101.6, 104.6, smooth(u / 78)), 1.25, 7.9 - u * 0.012], look: [lerp(102.6, 103.9, smooth(u / 78)), 2.75, -3.5], fov: 48, roll: 1.5 - u * 0.03, shadowAt: [103, 0, -2] }; },
    dof: (f, u, C) => ({ focus: lerp(11.4, 6.6, smooth(ramp(u, 20, 30)) * (1 - smooth(ramp(u, 42, 54)))), cinf: 7, near: 1 }),
    act: (f, u, T) => { const x = mastX(f), k = smooth(ramp(u, 4, 56)), hm = q(abs(sin(f * 0.42)), 1), out = [];
      out.push(CH(T, WORKER(0), { expr: 'determined', turn: 0.6, L: 'up', R: 'up', tilt: q(14 - k * 10, 0), legs: 'walk', step: q((f % 14) / 14, 1), bob: q(abs(sin(f * 0.4)) * 0.01, 3) }, [WORKX - 2.6 + k * 1.5, 0, -3.6], { s: 1.3 }));
      out.push(CH(T, WORKER(1), { expr: 'scared', turn: 0.6, L: 'up', R: 'up', tilt: q(10 - k * 8, 0), legs: 'crouch' }, [WORKX - 1.3 + k * 0.8, 0, -3.4], { s: 1.3 }));
      out.push(CH(T, WORKER(2), { expr: 'determined', turn: -0.5, look: -0.6, R: 'hip', L: { x: 150, y: 520 - hm * 220, b: 0.8 }, holdL: 'hammer', legs: 'crouch' }, [WORKX + 3.2, 0, -3.0], { s: 1.3 }));
      out.push(CH(T, WORKER(3), { expr: u > 30 && u < 60 ? 'neutral' : 'worried', turn: u > 30 && u < 60 ? 0.2 : -0.6, look: u > 30 && u < 60 ? 0.6 : -0.5, L: 'reach', R: 'reach', tilt: -8 }, [WORKX - 5.0, 0, -5.0], { s: 1.3 }));
      out.push(HS(T, { ph: gph(f), mochila: true, rider: riding(f, { lean: 8, opts: { expr: 'worried', turn: lerp(0.7, -0.75, smooth(ramp(u, 24, 44))) > 0 ? 0.7 : -0.7, look: u > 34 ? -1 : 0.5, headTilt: u > 34 ? -6 : 0 } }) }, [x, 0, 1.6]));
      return out; },
    fx: (f, u, T) => { const out = []; trail(out, T, f, 970, mastX, 1.9, DUST, { s0: 1.0, s1: 2.8, a: 0.75, pre: 12 });
      for (let i = 0; i < 3; i++) { const t = ((f * 0.06 + i * 0.33) % 1); out.push(FX('drop', (p) => { p.g.fillStyle = '#9fd8f2'; p.g.beginPath(); p.g.ellipse(300, 500, 150, 240, 0, 0, 7); p.g.fill(); }, [WORKX - 2.2 + i * 0.9 + t * 0.3, 2.3 - t * 0.5, -3.3], 0.045, {})); }
      const hk = (f * 0.42 / PI) % 1; if (hk < 0.25) out.push(FX('brst' + q(hk * 4, 1), (p) => T.fxSpark(p, hk * 4, '#fff3b0'), [WORKX + 2.75, 0.2, -2.95], 0.35, {}));
      birds(out, T, f, 3, [98, 10, -40], [0.12, 0.01, 0], 0.7, '#2a2a34', 5); motes(out, T, f, 10, [100, 0.3, 3, 8, 2.5, 3], 0.08); return out; } },
  // 23 ---- for a wire
  { id: 'wire', a: 1061, b: 1103, set: 'prairie', light: 'wire', world: () => ({ cloud: '#ffe6c0' }),
    cam: (f, u) => { const k = u / 42; const cx = 40.6 + k * 5.5, t = ((cx + 40) % 16) / 16; return { pos: [cx, 6.6 - sin(t * PI) * 0.55 + 0.2 - k * 0.04, -3.33 + k * 0.1], look: [cx + 60, lerp(4.6, 5.9, smooth(ramp(u, 0, 26))), -3.45], fov: 40 + k * 4, roll: -4 + k * 4 }; },
    dof: (f, u) => ({ focus: lerp(1.2, 40, smooth(ramp(u, 6, 34))), cinf: 12, near: 1.2 }), act: () => [],
    fx: (f, u, T) => { const out = [], x = 44 + u * 1.9; glowAt(out, T, [600, 170, 60], 120, '255,216,150', 1, 0.8); out.push(FX('glow255,250,230' + 1, (p) => T.fxGlow(p, '255,250,230', 1), [x, 6.25 - 0.33, -3.45], 0.3, {}));
      birds(out, T, f, 3, [70, 9, -14], [0.2, 0.01, 0], 0.5, '#2a2a34', 2); motes(out, T, f, 10, [39, 5.6, -4.5, 4, 2, 2], 0.03); return out; } },
  // 24 ---- a few months later the wire is finished: the operator's key
  { id: 'operator', a: 1103, b: 1168, set: 'room', light: 'office', world: (f) => ({ room: 'office', cloud: 0, key: TAPS.some((t) => f >= t && f < t + 2) ? -1 : 0 }),
    cam: (f, u) => { const k = smooth(ramp(u, 34, 54)); return { pos: lerp3(lerp3([0.95, 1.7, 3.1], [0.5, 1.62, 2.5], easeOut(u / 34)), [0.25, 1.5, 1.75], k), look: lerp3([0.0, 1.5, -0.2], [-0.12, 1.22, 0.1], k), fov: 40, roll: 2 - u * 0.04 }; },
    dof: (f, u, C) => ({ focus: lerp(C.pos[2] + 0.5, C.pos[2] - 0.2, smooth(ramp(u, 34, 54))), cinf: 10, near: 1 }), flash: (u) => (u >= 62 ? (u - 61) / 4 * 0.9 : 0),
    act: (f, u, T) => { const tap = TAPS.some((t) => f >= t && f < t + 2); return [CH(T, OPERATOR, { expr: u > 44 ? 'goofy' : 'determined', look: -0.3, turn: -0.15, blink: blinkAt(f, 6), L: { x: 228, y: tap ? 560 : 546, b: 0.5 }, R: { x: 430, y: 560, b: 0.7 }, headTilt: q(-4 + sin(f * 0.2) * 1.5, 0) }, [0.15, 0, -0.62], { s: 1.12, rim: u > 44 ? '#8fd0ff' : undefined })]; },
    fx: (f, u, T) => { const out = [], tap = TAPS.find((t) => f >= t && f < t + 4); glowAt(out, T, [-1.15, 1.4, 0.4], 0.6, '255,224,160', 1, 0.8);
      if (tap) { const t = (f - tap) / 4; out.push(FX('bsp' + q(t, 1), (p) => T.fxSpark(p, t, '#bfe6ff'), [-0.25, 1.16 - 0.14, 0.3], 0.13, {})); }
      const pk = smooth(ramp(u, 40, 62)); if (pk > 0) { out.push(FX('pulse' + q(pk, 1), (p) => T.fxPulse(p, 1, q(f * 0.5 % 6.28, 1)), [-0.25, 1.16 - 0.5 * (0.25 + pk * 0.5), 0.3], 0.25 + pk * 0.5, { alpha: q(pk) }));
        const t = ramp(u, 50, 64); out.push(FX('pulse1b', (p) => T.fxPulse(p, 1, 0), [-0.95, 1.5 + t * 2.4 - 0.18, -0.15], 0.16, { alpha: q(pk) })); }
      motes(out, T, f, 12, [-1.8, 0.9, -0.8, 3.4, 1.8, 1.6], 0.035, '#fff0d0', 8); return out; } },
  // 25 ---- "der Telegraf": the pulse leaves the office
  { id: 'telegraf', a: 1168, b: 1198, set: 'prairie', light: 'blue', world: () => ({ office: 1, cloud: '#eef2ff' }), whipOut: 1,
    cam: (f, u) => { const k = smooth(ramp(u, 19, 30)); return { pos: [-51.6 + k * 1.0, 1.0, 7.6 - u * 0.02], look: [-51.9 + k * 4.5, 5.9 + k * 0.5, -2.7], fov: 50, roll: -3 + u * 0.12 }; },
    dof: () => ({ focus: 9, cinf: 5, near: 1.2 }), flash: (u) => (u < 4 ? (1 - u / 4) * 0.9 : 0),
    act: () => [],
    fx: (f, u, T) => { const out = [], A = [-49.4, 7.5, -3.1], B = [-40, 6.6, -3.45], t = easeIn(ramp(u, 8, 26)), p0 = lerp3(A, B, t), ch = smooth(ramp(u, 0, 8));
      out.push(FX('pulse1', (p) => T.fxPulse(p, 1, q(f * 0.7 % 6.28, 1)), [p0[0], p0[1] - 0.5 * (0.5 + ch * 0.9), p0[2]], 0.5 + ch * 0.9, {})); for (let i = 1; i < 6; i++) { const tt = t - i * 0.045; if (tt > 0) { const q0 = lerp3(A, B, tt); out.push(FX('pulse1b', (p) => T.fxPulse(p, 1, 0), [q0[0], q0[1] - 0.5 * (1 - i * 0.14), q0[2]], 1 - i * 0.14, { alpha: q(0.6 - i * 0.09) })); } }
      glowAt(out, T, [-50.7, 1.75, -2.6], 1.3, '255,220,150', 1, 0.8); birds(out, T, f, 3, [-58, 11, -30], [0.2, 0.02, 0], 0.6, '#2a2a34', 3); tumble(out, T, f, [-54 + u * 0.08, 0, 1.5], 0.36); motes(out, T, f, 10, [-53, 0.4, 0, 5, 3, 3], 0.08); return out; } },
  // 26 ---- the message now needs minutes: the pulse races along the poles
  { id: 'pulse', a: 1198, b: 1258, set: 'prairie', light: 'blue', world: () => ({ cloud: '#eef2ff' }), whipIn: 1,
    cam: (f, u) => { const x = -20 + u * 5.2 + easeIn(u / 60) * 30; return { pos: [x - 9, 8.4 + sin(u * 0.1) * 0.5, -0.6 + sin(u * 0.07) * 0.8], look: [x + 40, 5.6, -3.6], fov: 52 + u * 0.1, roll: 5 * sin(u * 0.09) }; },
    dof: () => ({ focus: 30, cinf: 0 }), mb: () => 4,
    act: (f, u, T) => [HS(T, { ph: gph(f), mochila: true, rider: riding(f) }, [overX(f) - 6 + (u - 60) * 0.4, 0, 1.6])],
    fx: (f, u, T) => { const out = [], x = -20 + u * 5.2 + easeIn(u / 60) * 30 + 9; out.push(FX('pulse1', (p) => T.fxPulse(p, 1, q(f * 0.7 % 6.28, 1)), [x, 6.3 - 1.1, -3.45], 2.2, {}));
      for (let i = 1; i < 9; i++) out.push(FX('pulse1b', (p) => T.fxPulse(p, 1, 0), [x - i * 2.4, 6.3 - 0.5 * (1.6 - i * 0.15), -3.45], 1.6 - i * 0.15, { alpha: q(0.6 - i * 0.06) }));
      for (let i = 0; i < 4; i++) { const t = ((u * 0.07 + i * 0.25) % 1); out.push(FX('cl' + i % 2, (p) => T.fxDustCloud(p, i % 2 + 1, '240,246,255', 1), [x + 60 - t * 80, 12 + i * 2, 6 - i * 5], 5, { alpha: q(sin(t * PI) * 0.4) })); } return out; } },
  // 27 ---- the pulse overtakes the rider; he looks up, stunned
  { id: 'overtake', a: 1258, b: 1306, set: 'prairie', light: 'blue', world: () => ({ cloud: '#eef2ff' }),
    cam: (f, u) => { const x = overX(f); return { pos: [x + 2.8 - u * 0.02, 0.75, 8.6 - u * 0.02], look: [x + 0.8, 3.3 + smooth(ramp(u, 10, 20)) * 0.5, -0.4], fov: 46, roll: -2.5 + u * 0.05, shadowAt: [x, 0, 1.6] }; },
    dof: (f, u, C) => ({ focus: C.pos[2] - 1.6, cinf: 6, near: 1.2 }), flash: (u) => (u >= 14 && u < 19 ? (1 - abs(u - 16) / 3) * 0.45 : 0), kicks: [{ f: 1273, a: 0.016 }],
    act: (f, u, T) => { const up = u >= 15, slow = smooth(ramp(u, 18, 46)); return [HS(T, { ph: gph(f * (1 - slow * 0.25)), mochila: true, eye: up ? 'wide' : null, rider: riding(f, { lean: up ? -4 : 14, opts: { expr: up ? 'shock' : 'determined', turn: 0.55, look: up ? 0.3 : 0.5, headTilt: up ? -20 : 0, wind: up ? -0.6 : -1 } }) }, [overX(f), 0, 1.6], { rim: u >= 11 && u < 26 ? '#9fdcff' : undefined, rimDy: u >= 11 && u < 26 ? 12 : 5, rimDx: u >= 11 && u < 26 ? 2 : 9 })]; },
    fx: (f, u, T) => { const out = [], x = overX(f), px = x - 50 + (u - 8) * 7.5; trail(out, T, f, 1246, overX, 1.9, '214,206,200', { s0: 1.0, s1: 2.6, a: 0.7, pre: 12 });
      if (u >= 6 && u < 30) { const y = 6.2; out.push(FX('pulse1', (p) => T.fxPulse(p, 1, q(f * 0.7 % 6.28, 1)), [px, y - 1.0, -3.45], 2.0, {})); for (let i = 1; i < 10; i++) out.push(FX('pulse1b', (p) => T.fxPulse(p, 1, 0), [px - i * 1.6, y - 0.5 * (1.5 - i * 0.13), -3.45], 1.5 - i * 0.13, { alpha: q(0.6 - i * 0.055) })); }
      if (u > 20) for (let i = 0; i < 3; i++) out.push(FX('qm', (p) => T.fxSpark(p, 0.35, '#dff2ff'), [x + 0.55 + i * 0.0, 3.55, 1.7], 0.0001, {}));
      birds(out, T, f, 3, [x - 6, 10, -40], [0.36, 0.01, 0], 0.6, '#2a2a34', 9); return out; } },
  // 28 ---- two days later it is all over: "Geschlossen" is nailed to the door
  { id: 'closed', a: 1306, b: 1354, set: 'station', light: 'closing', world: (f, u) => ({ closed: Math.max(0.02, easeOut(u / 8)), cloud: '#d8ccc4' }),
    cam: (f, u) => ({ pos: lerp3([1.7, 1.45, 4.1], [1.6, 1.5, 3.3], easeOut(u / 48) * 0.6 + u / 48 * 0.4), look: [1.55, 1.12, -3.2], fov: 46, roll: 2.5 - u * 0.04, shadowAt: [1.2, 0, -2.6] }),
    dof: (f, u, C) => ({ focus: C.pos[2] + 3.0, cinf: 5, near: 1 }), kicks: [{ f: 1314, a: 0.02 }, { f: 1326, a: 0.016 }, { f: 1338, a: 0.016 }],
    act: (f, u, T) => { const hits = [1314, 1326, 1338], h = hits.find((t) => f >= t - 5 && f < t + 4), sw = h ? (f < h ? (f - (h - 5)) / 5 : 1 - (f - h) / 4) : 0;
      return [CH(T, KEEPER, { expr: 'worried', turn: -0.55, look: -0.7, blink: u > 40 ? 1 : blinkAt(f, 4), L: { x: 150 + sw * 40, y: 380 + sw * 130 - (1 - sw) * 60, b: 0.6 }, holdL: 'hammer', R: 'hang', headTilt: q(4 + (u > 40 ? 8 : 0), 0) }, [2.62, 0, -2.6], { s: 1.05 })]; },
    fx: (f, u, T) => { const out = []; for (const t0 of [1314, 1326, 1338]) if (f >= t0 && f < t0 + 5) { const t = (f - t0) / 5; out.push(FX('brst' + q(t, 1), (p) => T.fxSpark(p, t, '#fff3b0'), [2.1, 1.45 - 0.2, -2.95], 0.4, {})); }
      motes(out, T, f, 12, [0.5, 0.4, -2.6, 3, 2.6, 2.4], 0.05, '#fff0d8', 3);
      for (let i = 0; i < 4; i++) { const t = ((f * 0.02 + i * 0.25) % 1); out.push(FX('leaf', (p) => { p.g.fillStyle = '#a8804a'; p.g.beginPath(); p.g.ellipse(300, 500, 240, 110, 0.4, 0, 7); p.g.fill(); }, [0.2 + t * 3.4, 0.3 + sin(t * 9 + i) * 0.25 + i * 0.5, -2.2 + i * 0.3], 0.05, { roll: f * 0.2 + i })); } return out; } },
  // 29 ---- after only eighteen months: empty saddles, the horses are let out to pasture
  { id: 'empty', a: 1354, b: 1399, set: 'station', light: 'closing', world: () => ({ closed: 1, cloud: '#d8ccc4' }),
    cam: (f, u) => { const k = smooth(ramp(u, 13, 26)); return { pos: lerp3([7.1, 1.5, -0.6], [12.6, 1.35, 4.6], k), look: lerp3([7.2, 1.6, -7.9], [14.8, 1.75, -4.5], k), fov: lerp(36, 44, k), roll: -2 + k * 3.5 - u * 0.02, shadowAt: [13, 0, -2] }; },
    dof: (f, u, C) => { const k = smooth(ramp(u, 13, 26)); return { focus: lerp(7.2, 5.3, k), cinf: 8, near: 1 }; }, mb: (u) => (u > 15 && u < 24 ? 3 : 1),
    act: (f, u, T) => { const out = [CH(T, RIDER, { expr: 'worried', legs: 'sit', turn: 0.6, look: 0.9, blink: blinkAt(f, 9), L: { x: 200, y: 660, b: 1 }, R: { x: 400, y: 660, b: 1 }, wind: -0.5, windPh: q(f * 0.25 % 6.28, 1), hatSwing: q(sin(f * 0.2) * 0.5, 1), headTilt: 6 }, [13.3, 0.5, -0.55], { s: 1.0, blob: false })];
      [['brown', 15.6, -7, 0], ['black', 17.2, -11, 4], ['pinto', 14.6, -15, 7]].forEach(([c, x, z, off], i) => out.push(HS(T, { coat: c, ph: gph(f, 12, off), saddle: false, tack: false }, [x + u * 0.09, 0, z - u * 0.16], { s: 2.5 })));
      return out; },
    fx: (f, u, T) => { const out = []; [[15.6, -7, 0], [17.2, -11, 1], [14.6, -15, 2]].forEach(([x, z, i]) => trail(out, T, f, 1340, (e) => x + (e - 1354) * 0.09, z - u * 0.16 + 0.3, '210,196,170', { s0: 0.8, s1: 2.2, a: 0.6, every: 4, pre: 10 }));
      motes(out, T, f, 10, [11, 0.4, 0, 6, 2.6, 3], 0.06, '#fff0d8', 7);  motes(out, T, f, 10, [6, 0.6, -7.6, 3, 2, 1.5], 0.05, '#fff0d8', 2); birds(out, T, f, 3, [10, 9, -40], [0.1, 0.01, 0], 0.6, '#2a2a34', 4); return out; } },
  // 30 ---- the fastest riders in the world: silhouettes on the hill
  { id: 'final1', a: 1399, b: 1457, set: 'hill', light: 'final', world: () => ({ cloud: '#ff9a6a', cloudA: 0.95, cloudY: 0.8 }),
    cam: (f, u) => ({ pos: lerp3([3.4, 6.3, 9.4], [2.6, 6.5, 10.6], u / 58), look: [0.5, 8.75, 0], fov: 37, roll: 1.5 - u * 0.02, shadowAt: [0, 6, 0] }),
    dof: () => ({ focus: 10, cinf: 6, near: 1.4 }),
    act: (f, u, T) => finalActors(f, T),
    fx: (f, u, T) => finalFx(f, T) },
  // 31 ---- beaten ... by a wire: slow pull-back, one bird on the wire
  { id: 'final2', a: 1457, b: 1549, set: 'hill', light: 'final', world: () => ({ cloud: '#ff9a6a', cloudA: 0.95, cloudY: 0.8 }),
    cam: (f, u) => { const k = smooth(u / 92); return { pos: lerp3([2.6, 6.5, 10.6], [4.6, 7.4, 19.5], k * 0.85 + u / 92 * 0.15), look: lerp3([0.5, 8.75, 0], [1.2, 9.6, 0], k), fov: lerp(37, 40, k), roll: 0.3 - k * 1.5, shadowAt: [0, 6, 0] }; },
    dof: (f, u) => ({ focus: lerp(10.6, 19.5, smooth(u / 92)), cinf: 5, near: 1.4 }),
    act: (f, u, T) => finalActors(f, T),
    fx: (f, u, T) => finalFx(f, T) },
];
const finalActors = (f, T) => [HS(T, { coat: 'brown', gait: 'stand', tailSw: q(sin(f * 0.12), 1), wind: 0.75, windPh: q(f * 0.16 % 6.28, 1), headDown: q(0.12 + 0.05 * sin(f * 0.05), 2), breath: q(sin(f * 0.1), 1), mochila: false,
  rider: { spec: RIDER, lean: 2, opts: { expr: 'worried', turn: 0.7, look: 0.4, wind: -0.8, windPh: q(f * 0.16 % 6.28, 1), hatSwing: q(sin(f * 0.14) * 0.6, 1), headTilt: q(8 + sin(f * 0.06) * 2, 0), R: { x: 420, y: 610 }, L: { x: 330, y: 620 } } } }, [0, 5.85, 0], { rimDx: 3, rimDy: 9, blob: false })];
const finalFx = (f, T) => { const out = [], tw = q(Math.max(0, sin(f * 0.21)) * (f % 60 < 30 ? 1 : 0), 1); glowAt(out, T, [-32, 26, -300], 120, '255,170,90', 1, 0.95); glowAt(out, T, [-32, 13, -300], 46, '255,236,180', 1, 1);
  out.push(FX('bsit' + tw, (p) => T.propBirdSit(p, tw), [1.75, 11.25 - 0.68, -1.25], 0.9, { tint: '#2c1a32' }));
  motes(out, T, f, 22, [-6, 5.5, 1, 14, 5, 7], 0.06, '#ffd8a0', 2);
  for (let i = 0; i < 3; i++) out.push(FX('dust' + i + '255,150,110', (p) => T.fxDustCloud(p, i + 1, '255,150,110', 1), [-30 + i * 28 + f * 0.01, 3 + i, -60 - i * 20], 16, { alpha: 0.22 }));
  birds(out, T, f, 4, [-40 + (f - 1399) * 0.05, 22, -120], [0, 0.005, 0], 1.6, '#2a1830', 3); return out; };

export const shotAt = (f) => { const g = Math.floor(f); return SHOTS.find((s) => g >= s.a && g < s.b) || SHOTS[SHOTS.length - 1]; };
export const lightFor = (S, f) => { let L = { ...LIGHTS[S.light] }; if (S.lightFn) L = S.lightFn(L, f); LCUR = L; return L; };
const yaw = (c, ang) => { const dx = c.look[0] - c.pos[0], dz = c.look[2] - c.pos[2], a = ang * PI / 180, cs = cos(a), sn = sin(a); c.look = [c.pos[0] + dx * cs - dz * sn, c.look[1], c.pos[2] + dx * sn + dz * cs]; };
const WH = 5, WA = 34;
export const camAt = (f) => { const S = shotAt(f), u = f - S.a, n = S.b - S.a, c = { roll: 0, ...S.cam(f, u) }; c.pos = [...c.pos]; c.look = [...c.look];
  if (S.whipOut && u > n - WH - 1) { const k = clamp((u - (n - WH - 1)) / WH); yaw(c, S.whipOut * WA * k * k); }
  if (S.whipIn && u < WH) { const k = 1 - clamp((u + 1) / WH); yaw(c, -S.whipIn * WA * k * k); }
  for (const k of S.kicks || []) { const d = f - k.f; if (d >= 0 && d < 7) { const s = (Math.floor(d) % 2 ? -1 : 1) * k.a * (1 - d / 7); c.look[1] += s * 6; c.look[0] += s * 3; c.roll += s * 30; } }
  c.flash = S.flash ? clamp(S.flash(u)) : 0; return c; };
export const dofAt = (f) => { const S = shotAt(f); return S.dof ? S.dof(f, f - S.a, camAt(f)) : { focus: 10, cinf: 0 }; };
export const worldAt = (f) => { const S = shotAt(f); return { set: S.set, ...(S.world ? S.world(f, f - S.a) : {}) }; };
export const actorsAt = (f, T) => { const S = shotAt(f); LCUR = LIGHTS[S.light]; return S.act(f, f - S.a, T); };
export const fxAt = (f, T) => { const S = shotAt(f); LCUR = LIGHTS[S.light]; return S.fx ? S.fx(f, f - S.a, T) : []; };
globalThis.mbAt = (f) => { const S = shotAt(f), u = f - S.a, n = S.b - S.a; if ((S.whipOut && u > n - WH - 1) || (S.whipIn && u < WH)) return 5; return S.mb ? S.mb(u) : 1; };
