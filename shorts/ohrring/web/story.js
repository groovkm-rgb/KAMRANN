// "Der goldene Ohrring" — vertical cartoon short, 30 fps. Voice: voice.mp3 (56.37 s), TOTAL = voice + 0.5 s.
// Shot cuts (frame: phrase), hand-checked against the waveform; every cut sits in a silence gap:
//    0 Ein goldener Ohrring –                 |  43 für Seeleute angeblich 'ne Versicherung.
//   98 Und zwar … für den Fall, dass sie draufgehen.        183 Stell dir vor: Ein Seemann überlebt 'nen Sturm nicht.
//  264 Irgendwann wird er an einen fremden Strand gespült.  346 Und wer ihn findet, sieht:   394 Da hängt ein goldener Ohrring.
//  460 Genug Kohle für 'ne ordentliche Beerdigung.          542 Manche haben angeblich       580 sogar ihren Heimathafen reingeritzt.
//  643 Und das ist noch lange nicht alles.                  701 Einen Ohrring gab's angeblich,  772 wenn du zum ersten Mal über den Äquator gesegelt bist.
//  857 Oder wenn du's ums Kap Hoorn geschafft hast –        938 eine der krassesten Ecken auf dem Meer.
// 1010 Manche dachten sogar:   1051 Gold im Ohr – und du ertrinkst nicht.   1123 Oder du siehst besser.
// 1181 Und die Jungs an den Kanonen haben angeblich   1246 Wachs an ihre Ohrringe gehängt.   1296 Als Ohrstöpsel.   1337 Weil's da unten ordentlich geknallt hat.
// 1403 Der Haken an der Sache:   1440 Für das meiste davon gibt's kaum Beweise.   1500 Klar, Seeleute hatten echt Ohrringe.
// 1547 Aber warum genau?   1585 Vielleicht war so'n Ohrring manchmal …   1650 einfach nur ein Ohrring.   (end 1705)
import { VENV } from './venv.js';
export const FPS = 30, TOTAL = 1706;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const smooth = (t) => { t = clamp(t); return t * t * t * (t * (t * 6 - 15) + 10); };
const easeOut = (t) => 1 - (1 - clamp(t)) ** 3.2;
const lerp = (a, b, t) => a + (b - a) * t, lerp3 = (a, b, t) => a.map((v, i) => lerp(v, b[i], t)), ramp = (f, a, b) => clamp((f - a) / (b - a));
const q = (x, n = 2) => Math.round(x * 10 ** n) / 10 ** n;
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const blinkAt = (f, seed) => { const per = 70 + (seed * 17) % 40, ph = (f + seed * 13) % per; return ph < 2 ? 1 : 0; };
const talk = (f) => { const v = VENV[f] || 0; return v > 0.55 ? 'open' : v > 0.25 ? 'grin' : null; };
const jit = (f, a = 1) => Math.sin(f * 2.9) * a;

// ---------------- cast ----------------
const OLD = { body: '#2c3a66', detail: ['knit'], beardBig: '#ecebe6', beardSh: 0.84, hairStyle: 'bald', wrinkles: true, twinkle: true, earR: 1, hat: { type: 'beanie', color: '#8a2f2a', band: '#6a1f1c' }, bw: 230 };
const CHEF = { body: '#f6f4ee', bw: 280, detail: ['buttons', { t: 'apron', c: '#e2d2b8' }], mous: '#3a2a22', hat: { type: 'chef' }, cheeks: '#f4a0a0', hairStyle: 'bald' };
const BOY = { body: '#4a7ab0', bw: 175, headScale: 1.06, detail: ['straps', 'pocket'], hair: '#3a2a22', hairStyle: 'mop', hat: { type: 'flatcap', color: '#6a5a4a', stripes: '#8a7a6a' } };
const FISH = { body: '#e8b830', detail: ['buttons', { t: 'scarf', c: '#3a6a8a' }], hair: '#8a5a2e', hairStyle: 'sides', cheeks: '#ff6a6a', mous: '#8a5a2e', hat: { type: 'beanie', color: '#3a6a5a', band: '#2a4a40' } };
const YOUNG = { body: '#f4f2ee', bw: 185, detail: [{ t: 'hstripes', c: '#2c3a7a' }], hair: '#c8622a', hairStyle: 'mop', freckles: true };
const NEPTUN = { body: '#4a7a92', robe: true, cape: '#8a7a5a', capeNet: '#efe2b0', beardBig: '#6aa04a', beardLine: '#3a6a2a', seaweed: true, beardLen: 1.45, hat: { type: 'crown', color: '#f2e6c0' }, bw: 220 };
const SAILA = { body: '#e8e4dc', detail: [{ t: 'hstripes', c: '#9a2a2a' }], hair: '#2a2228', hairStyle: 'short', goatee: '#2a2228' };
const SAILB = { body: '#3a5a8a', detail: ['buttons', 'belt'], hair: '#d8b070', hairStyle: 'mop', mous: '#a8783a' };
const SAILC = { body: '#7a4a2a', detail: ['vest', { t: 'scarf', c: '#d8a030' }], hairStyle: 'bald', beardBig: '#3a2a22', beardLen: 1.05, hat: { type: 'beanie', color: '#c84a3a' } };
const OMA = { body: '#8a5a7a', robe: true, detail: [{ t: 'apron', c: '#e8dcc0' }, { t: 'scarf', c: '#c84a3a' }], hair: '#d8d8dc', hairStyle: 'bun', hat: { type: 'wide', color: '#e0c070', band: '#a8742a' }, bw: 210 };
const GUNNER = { body: '#d8d0bc', bw: 260, detail: [{ t: 'vest', c: '#6a4224' }, 'belt'], hairStyle: 'bald', mous: '#2a1d1a', mousStyle: 'handle', headScale: 1.04, earR: 1 };
const HIST = { body: '#7a6a52', detail: ['collar', { t: 'bowtie', c: '#b8282b' }, 'pocket', 'buttons'], hair: '#9a9aa4', hairStyle: 'side', glasses: true };

// ---------------- lights ----------------
const base = { az: 120, el: 40, sky: '#c4d6f2', ground: '#7a7088', hemi: 1.2, sun: '#fff1dc', sunI: 2.4, fog: '#c6daf2', fogNear: 60, fogFar: 700, skyTop: '#3d7fd6', skyHor: '#c8ddf4', sat: 1.18, waterDeep: '#2c6c8c', waterShal: '#5aaec4', glint: '#effaff', vig: 0.22, shadowExt: 12 };
export const LIGHTS = {
  tav: { ...base, az: 60, el: 28, sky: '#b08a6a', ground: '#3a2418', hemi: 0.8, sun: '#ffc078', sunI: 1.3, fog: '#1a1420', fogNear: 14, fogFar: 90, skyTop: '#0a1028', skyHor: '#26304e', sat: 1.2, waterDeep: '#0e1a30', waterShal: '#24365a', glint: '#ffe0a0', vig: 0.34, shadowExt: 7, gain: '#fff4e6' },
  street: { ...base, az: 150, el: 35, sky: '#6a7aa8', ground: '#3a2a2a', hemi: 0.9, sun: '#9ab0e0', sunI: 0.7, fog: '#141a30', fogNear: 20, fogFar: 120, skyTop: '#060a1e', skyHor: '#1e2a4a', sat: 1.2, waterDeep: '#0e1a30', waterShal: '#24365a', glint: '#ffe0a0', vig: 0.34, shadowExt: 9 },
  storm: { ...base, az: 160, el: 30, sky: '#a0aca8', ground: '#2a302a', hemi: 1.0, sun: '#e8f0e8', sunI: 2.2, fog: '#8a9894', fogNear: 30, fogFar: 300, skyTop: '#2e3836', skyHor: '#b0bcb8', sepia: 1, vig: 0.3, shadowExt: 26, sat: 1 },
  dawn: { ...base, az: -80, el: 14, sky: '#f2c8a0', ground: '#8a6a5a', hemi: 1.15, sun: '#ffd0a0', sunI: 2.4, fog: '#f0c8a0', fogNear: 60, fogFar: 600, skyTop: '#6a8ac8', skyHor: '#ffd8a8', sunDisc: '#ffe6b0', sunSize: 0.012, waterDeep: '#4a7a9a', waterShal: '#e8b890', glint: '#fff0d0', sepia: 1, shadowExt: 16 },
  noon: { ...base, az: 140, el: 66, hemi: 1.25, sunI: 2.6, waterDeep: '#1e6a9a', waterShal: '#4ab0d0', sepia: 1, shadowExt: 20 },
  ice: { ...base, az: 200, el: 26, sky: '#b8c8d0', ground: '#4a5058', hemi: 1.1, sun: '#f0f6ff', sunI: 2.0, fog: '#a8b6bc', fogNear: 30, fogFar: 320, skyTop: '#46525a', skyHor: '#c8d4d8', sepia: 1, vig: 0.3, shadowExt: 26 },
  gun: { ...base, az: 90, el: 20, sky: '#d8b080', ground: '#4a3020', hemi: 1.35, sun: '#ffe0b0', sunI: 1.7, fog: '#2a1c14', fogNear: 10, fogFar: 40, skyTop: '#2a1c14', skyHor: '#3a2a1a', sepia: 1, vig: 0.3, shadowExt: 8 },
  arch: { ...base, az: 40, el: 50, sky: '#e0c8a0', ground: '#5a4030', hemi: 1.05, sun: '#ffe2b0', sunI: 1.2, fog: '#3a2a1e', fogNear: 14, fogFar: 60, skyTop: '#2a1e14', skyHor: '#3a2a1e', vig: 0.28, shadowExt: 8, sat: 1.15 },
  gal: { ...base, az: 60, el: 45, sky: '#e8cca0', ground: '#5a4030', hemi: 1.1, sun: '#ffe2b0', sunI: 1.0, fog: '#3a2a1e', fogNear: 14, fogFar: 60, skyTop: '#2a1e14', skyHor: '#3a2a1e', vig: 0.26, shadowExt: 10, sat: 1.15 },
};
export const lightFor = (S, f) => {
  const L = { ...LIGHTS[S.light] };
  if (S.lightning) { const fl = S.lightning(f - S.a); if (fl > 0) { L.hemi += fl * 1.4; L.skyHor = '#e8f0f0'; L.sunI += fl * 2; } }
  if (S.light === 'tav') { const k = 1 + 0.05 * Math.sin(f * 0.9) + 0.03 * Math.sin(f * 2.3); L.hemi *= k; if (S.dim) L.hemi *= S.dim(f - S.a); }
  return L;
};

// ---------------- helpers for actors and fx ----------------
const C = (spec, o, pos, extra = {}) => ({ key: JSON.stringify([spec, o]), draw: (p) => p.toon.toonChar(p, spec, o), x: pos[0], y: pos[1], z: pos[2], ...extra });
const FXH = 1.069; // design (300,500) sits this many card-heights above the card base (at s = 1)
const FX = (key, draw, P, s, extra = {}) => ({ key, draw, x: P[0], y: P[1] - FXH * s, z: P[2], s, blob: false, shadow: false, order: 6, ...extra });
// 2D fx drawn around (300,500)
const D = {
  sparkle: (g, t, col = '#fff6c8') => { const a = Math.sin(clamp(t) * Math.PI), r = 70 + 90 * a; g.save(); g.translate(300, 500); g.rotate(t * 1.2);
    const gr = g.createRadialGradient(0, 0, 0, 0, 0, r * 1.4); gr.addColorStop(0, `rgba(255,250,220,${0.9 * a})`); gr.addColorStop(1, 'rgba(255,240,180,0)'); g.fillStyle = gr; g.fillRect(-r * 1.5, -r * 1.5, r * 3, r * 3);
    g.fillStyle = col; g.globalAlpha = a; g.beginPath(); for (let k = 0; k < 8; k++) { const an = k * Math.PI / 4, rr = k % 2 ? r * 0.18 : r; g.lineTo(Math.cos(an) * rr, Math.sin(an) * rr); } g.closePath(); g.fill(); g.restore(); },
  glow: (g, k, col = '255,214,140') => { const r = g.createRadialGradient(300, 500, 0, 300, 500, 290); r.addColorStop(0, `rgba(${col},${0.9 * k})`); r.addColorStop(0.3, `rgba(${col},${0.4 * k})`); r.addColorStop(1, `rgba(${col},0)`); g.fillStyle = r; g.fillRect(0, 200, 600, 600); },
  flame: (g, f) => { const w = 1 + 0.12 * Math.sin(f * 1.7), h = 1 + 0.2 * Math.sin(f * 2.3 + 1); D.glow(g, 0.55 + 0.1 * Math.sin(f)); g.save(); g.translate(300, 540); g.scale(w, h);
    g.beginPath(); g.moveTo(0, -150); g.quadraticCurveTo(60, -40, 34, 20); g.quadraticCurveTo(0, 50, -34, 20); g.quadraticCurveTo(-60, -40, 0, -150); g.fillStyle = '#ffc850'; g.fill(); g.lineWidth = 10; g.strokeStyle = '#1a1416'; g.stroke();
    g.beginPath(); g.moveTo(0, -70); g.quadraticCurveTo(26, -10, 0, 20); g.quadraticCurveTo(-26, -10, 0, -70); g.fillStyle = '#fff4c0'; g.fill(); g.restore(); },
  puff: (g, t, col = '238,232,222', a0 = 0.9) => { const r = (1 - (1 - t) ** 2); for (let i = 0; i < 6; i++) { const an = i * 1.05 + t, d = 40 + 120 * r, rr = (90 + 30 * (i % 3)) * (0.5 + 0.7 * r);
    g.beginPath(); g.ellipse(300 + Math.cos(an) * d, 500 + Math.sin(an) * d * 0.7 - 60 * t, rr, rr * 0.86, 0, 0, Math.PI * 2); g.fillStyle = `rgba(${col},${a0 * (1 - t * 0.85)})`; g.fill(); g.lineWidth = 8; g.strokeStyle = `rgba(26,20,22,${0.5 * (1 - t)})`; g.stroke(); } },
  hat: (g, rot = 0, wet = 0) => { g.save(); g.translate(300, 500); g.rotate(rot); // tricorn sailor hat
    const ink = (pts, fill, w = 10) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fillStyle = fill; g.fill(); g.lineWidth = w; g.lineJoin = 'round'; g.strokeStyle = '#1a1416'; g.stroke(); };
    ink([[-190, 40], [-150, -60], [-60, -110], [0, -120], [60, -110], [150, -60], [190, 40], [100, 10], [0, 30], [-100, 10]], wet ? '#4a4a5a' : '#262838');
    ink([[-190, 40], [-100, 10], [0, 30], [100, 10], [190, 40], [100, 60], [0, 70], [-100, 60]], '#3a3c4e');
    g.lineWidth = 12; g.strokeStyle = '#d8b050'; g.beginPath(); g.moveTo(-180, 38); g.quadraticCurveTo(0, 0, 180, 38); g.stroke();
    g.beginPath(); g.arc(-40, -40, 22, 0, Math.PI * 2); g.fillStyle = '#c84a3a'; g.fill(); g.lineWidth = 7; g.strokeStyle = '#1a1416'; g.stroke();
    if (wet) for (const x of [-120, 30, 140]) { g.beginPath(); g.moveTo(x, 64); g.quadraticCurveTo(x + 12, 100, x, 112); g.quadraticCurveTo(x - 12, 100, x, 64); g.fillStyle = '#bfe4ff'; g.fill(); }
    g.restore(); },
  gull: (g, ph) => { const y = Math.sin(ph) * 50; g.lineWidth = 16; g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = '#1a1416'; g.beginPath(); g.moveTo(130, 500 - y); g.quadraticCurveTo(210, 440 - y * 0.3, 300, 500); g.quadraticCurveTo(390, 440 - y * 0.3, 470, 500 - y); g.stroke();
    g.strokeStyle = '#ffffff'; g.lineWidth = 7; g.stroke(); },
  bolt: (g, a) => { g.save(); g.globalAlpha = a; const pts = [[330, 0], [250, 300], [330, 320], [230, 650], [300, 660], [200, 1000]]; g.lineJoin = 'miter';
    g.strokeStyle = 'rgba(255,255,240,0.5)'; g.lineWidth = 60; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
    g.strokeStyle = '#ffffff'; g.lineWidth = 18; g.stroke(); g.restore(); },
  shake: (g, t) => { const j = 8 * Math.sin(t * 40); g.lineCap = 'round'; g.strokeStyle = '#1a1416'; for (const s of [-1, 1]) for (const k of [-1, 0, 1]) { g.lineWidth = 12; g.beginPath(); g.arc(300 + s * (150 + j), 400 + k * 70, 60, s > 0 ? -0.5 : Math.PI - 0.5, s > 0 ? 0.5 : Math.PI + 0.5); g.stroke(); } },
  ring: (g, t) => { for (let k = 0; k < 3; k++) { const u = t - k * 0.2; if (u <= 0 || u >= 1) continue; g.beginPath(); g.ellipse(300, 500, 60 + 220 * u, 60 + 220 * u, 0, 0, Math.PI * 2); g.strokeStyle = '#f6fcff'; g.lineWidth = 12 * (1 - u) + 3; g.stroke(); } },
  stars: (g, t) => { for (let i = 0; i < 4; i++) { const a = t * Math.PI * 2 + i * Math.PI / 2, x = 300 + 160 * Math.cos(a), y = 500 + 50 * Math.sin(a); g.beginPath(); for (let k = 0; k < 10; k++) { const r = k % 2 ? 16 : 40, b = (k * 36 - 90) * Math.PI / 180; g.lineTo(x + r * Math.cos(b), y + r * Math.sin(b)); } g.closePath(); g.fillStyle = '#ffd84a'; g.fill(); g.lineWidth = 7; g.strokeStyle = '#1a1416'; g.stroke(); } },
  splash: (g, t) => { g.save(); g.translate(-100, -260); g.scale(1, 1); const pn = { g, poly: (pts, col, w) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); if (col) { g.fillStyle = col; g.fill(); } if (w) { g.lineWidth = w; g.strokeStyle = '#1a1416'; g.stroke(); } }, ell: (x, y, rx, ry, col, w) => { g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); if (col) { g.fillStyle = col; g.fill(); } if (w) { g.lineWidth = w; g.strokeStyle = '#1a1416'; g.stroke(); } } };
    window.__T.fxSplash(pn, t); g.restore(); },
  spark: (g, f) => { for (let i = 0; i < 7; i++) { const a = (i * 0.9 + f * 0.7) % (Math.PI * 2), r = 30 + ((f * 13 + i * 37) % 70); g.strokeStyle = i % 2 ? '#ffe070' : '#ff9a30'; g.lineWidth = 8; g.beginPath(); g.moveTo(300 + Math.cos(a) * r * 0.4, 500 + Math.sin(a) * r * 0.4); g.lineTo(300 + Math.cos(a) * r, 500 + Math.sin(a) * r); g.stroke(); } D.glow(g, 0.6, '255,180,80'); },
  muzzle: (g, t) => { const a = 1 - t; D.glow(g, a, '255,230,170'); g.save(); g.translate(300, 500); for (let i = 0; i < 12; i++) { const an = i * Math.PI / 6, r = 120 + 140 * (1 - a) + (i % 2) * 60; g.beginPath(); g.moveTo(Math.cos(an - 0.15) * 40, Math.sin(an - 0.15) * 40); g.lineTo(Math.cos(an) * r, Math.sin(an) * r); g.lineTo(Math.cos(an + 0.15) * 40, Math.sin(an + 0.15) * 40); g.fillStyle = `rgba(255,${200 + i * 4},120,${a})`; g.fill(); } g.restore(); },
  dust: (g, t) => { for (let i = 0; i < 9; i++) { const an = i * 0.7, d = 40 + 160 * t, r = (40 + (i % 3) * 16) * (1 - t * 0.5); g.beginPath(); g.arc(300 + Math.cos(an) * d * 1.3, 560 - Math.abs(Math.sin(an)) * d * 0.6, r, 0, Math.PI * 2); g.fillStyle = `rgba(230,214,180,${0.75 * (1 - t)})`; g.fill(); } },
  smoke: (g, t, k = 1) => { for (let i = 0; i < 4; i++) { const u = (t + i * 0.25) % 1, x = 300 + Math.sin(u * 6 + i) * 40 * u, y = 700 - u * 520, r = 30 + u * 90; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = `rgba(235,230,222,${0.55 * k * (1 - u)})`; g.fill(); } },
};

// ---------------- camera ----------------
const camFromKeys = (K, t) => {
  let c;
  if (t <= K[0].t) c = { ...K[0] };
  else if (t >= K[K.length - 1].t) { const a = K[K.length - 2], b = K[K.length - 1], r = (t - b.t) / Math.max(1, b.t - a.t);
    c = (b.e === 'lin') ? { pos: b.pos.map((v, i) => v + (v - a.pos[i]) * r), look: b.look.map((v, i) => v + (v - a.look[i]) * r), fov: b.fov + (b.fov - a.fov) * r, roll: (b.roll || 0) + ((b.roll || 0) - (a.roll || 0)) * r } : { ...b }; }
  else for (let i = 0; i < K.length - 1; i++) if (t >= K[i].t && t < K[i + 1].t) {
    const a = K[i], b = K[i + 1], r = (t - a.t) / (b.t - a.t), e = b.e === 'out' ? easeOut(r) : b.e === 'lin' ? r : smooth(r);
    c = { pos: lerp3(a.pos, b.pos, e), look: lerp3(a.look, b.look, e), fov: lerp(a.fov, b.fov, e), roll: lerp(a.roll || 0, b.roll || 0, e) }; break; }
  return { pos: [...c.pos], look: [...c.look], fov: c.fov, roll: c.roll || 0 };
};
export const camAt = (f, S0) => {
  const S = S0 || shotAt(f), t = f - S.a, c = camFromKeys(S.cam, t);
  for (const k of S.kicks || []) { const d = t - k.t; if (d >= 0 && d < (k.n || 7)) { const s = (d % 2 ? -1 : 1) * k.a * (1 - d / (k.n || 7)); c.look[1] += s * 3; c.look[0] += s * 2; c.roll += s * 25; } }
  // a breath of handheld drift so no frame is ever frozen
  c.look[0] += Math.sin(f * 0.05) * 0.004; c.look[1] += Math.sin(f * 0.037 + 1) * 0.003;
  c.flash = S.flash ? S.flash(t) : 0;
  c.shadowAt = S.shadowAt || c.look;
  return c;
};
export const dofAt = (f, S0) => {
  const S = S0 || shotAt(f), t = f - S.a, Cm = camAt(f, S);
  const d = typeof S.dof === 'function' ? S.dof(t, Cm) : S.dof || { at: Cm.look, cinf: 10 };
  return { focus: d.focus ?? dist(Cm.pos, d.at), cinf: d.cinf, near: d.near ?? 1 };
};

// ---------------- world positions ----------------
const OLDP = [0, 0.05, -1.25], EAR = [0.314, 1.569, -1.21], EARF = [0.3, 1.58, -0.85]; // old sailor card base + his earring (card faces +z)
const CHEFP = [-0.74, -0.14, -0.35], BOYP = [0.76, -0.1, -0.35], FISHP = [1.75, 0, -2.3];
const DECK = 2.02, shipBob = (f, st = 0) => Math.sin(f / 30 * 1.1) * (0.05 + st * 0.4);
const faceZ = (C, x, z) => -Math.atan2(C.pos[0] - x, C.pos[2] - z);

// tavern people (shared by tavern shots)
const tavern = (f, t, o = {}) => {
  const out = [], hush = o.hush || 0;
  const oldO = { expr: 'sly', blink: blinkAt(f, 3), L: 'table', R: 'table', mouth: talk(f), ...o.old };
  out.push(C(OLD, oldO, [OLDP[0] + (o.oldDx || 0), OLDP[1], OLDP[2] + (o.oldDz || 0)], { s: 1.05, order: 3, ...(o.oldCard || {}) }));
  if (o.crowd !== false) {
    out.push(C(CHEF, { expr: hush ? 'hush' : 'happy', look: 0.6, turn: 0.35, blink: hush ? 0 : blinkAt(f, 5), L: 'table', R: hush ? 'chin' : 'belly', holdL: 'mugFoam', tilt: hush ? 4 : 0, ...(o.chef || {}) }, [CHEFP[0], CHEFP[1], CHEFP[2] + (hush ? 0.15 : 0)], { s: 1.0, order: 2 }));
    out.push(C(BOY, { expr: hush ? 'hush' : 'goofy', look: -0.7, turn: -0.35, blink: hush ? 0 : blinkAt(f, 9), L: hush ? 'chin' : 'table', R: 'table', tilt: hush ? -5 : 0, ...(o.boy || {}) }, [BOYP[0], BOYP[1], BOYP[2] + (hush ? 0.15 : 0)], { s: 0.92, order: 2 }));
    out.push(C(FISH, { expr: hush ? 'hush' : 'happy', look: -0.8, turn: -0.4, blink: blinkAt(f, 13), L: 'hang', R: 'forward', holdR: 'mugFoam', ...(o.fish || {}) }, FISHP, { s: 1.0, order: 1 }));
  }
  return out;
};
const candleFx = (f, list) => list.map(([x, y, z], i) => FX('fl' + ((f + i * 3) % 6), (p) => D.flame(p.g, f + i * 3), [x, y + 0.02, z], 0.09));
const CANDLES = [[-0.35, 1.39, -0.2], [0.45, 1.31, -0.75], [-0.62, 1.27, -0.75]];
const pipeSmoke = (f, P, k = 1) => [FX('ps' + (f % 30), (p) => D.smoke(p.g, (f % 60) / 60, k), [P[0], P[1] + 0.25, P[2]], 0.35)];

// ================= SHOTS =================
const SH = [];
const shot = (o) => SH.push(o);

// 1a — macro on the gold earring (3D ring at the old sailor's ear), it glints
shot({ id: '1a', a: 0, set: 'tav', light: 'tav',
  cam: [{ t: 0, pos: [EARF[0] + 0.1, EARF[1] + 0.02, EARF[2] + 0.62], look: [EARF[0], EARF[1] - 0.005, EARF[2]], fov: 26 }, { t: 60, pos: [EARF[0] + 0.08, EARF[1] + 0.02, EARF[2] + 0.5], look: [EARF[0], EARF[1], EARF[2]], fov: 25, e: 'lin' }],
  dof: { at: EARF, cinf: 34 },
  world: (t) => ({ ring: { p: EARF, s: 0.042, rx: Math.PI / 2 - 0.35, ry: 2.6 + t * 0.012, rz: 0.15, plain: 1 } }),
  act: (t, f) => [],
  fx: (t, f) => [FX('spk' + q(ramp(t, 0, 22), 2), (p) => D.sparkle(p.g, ramp(t, 0, 22)), [EARF[0] - 0.02, EARF[1] + 0.045, EARF[2] + 0.03], 0.045), ...candleFx(f, CANDLES)],
});
// 1b — burst pull-back: the old sailor at his table, customers around
shot({ id: '1b', a: 43, set: 'tav', light: 'tav',
  cam: [{ t: 0, pos: [EARF[0] + 0.08, EARF[1] + 0.02, EARF[2] + 0.5], look: [EARF[0], EARF[1], EARF[2]], fov: 25 }, { t: 13, pos: [0.1, 1.58, 2.05], look: [0.05, 1.4, -1.0], fov: 50, e: 'out' }, { t: 70, pos: [0.1, 1.57, 1.85], look: [0.05, 1.41, -1.0], fov: 49, e: 'lin' }],
  dof: (t, Cm) => ({ at: [0, 1.6, -1.25], cinf: lerp(30, 6, ramp(t, 0, 13)) }),
  world: (t) => ({ ring: { p: lerp3(EARF, EAR, smooth(ramp(t, 0, 11))), s: 0.042, rx: Math.PI / 2 - 0.35, ry: 2.6 + (t + 43) * 0.012, rz: 0.15, plain: 1 } }),
  act: (t, f) => tavern(f, t, { old: { earR: 0, expr: t < 30 ? 'smug' : 'sly', look: t < 30 ? 0.4 : 0, R: t > 18 ? 'raise' : 'table', holdR: 'mugFoam' }, oldCard: { yaw: 0 } }),
  fx: (t, f) => candleFx(f, CANDLES),
});
// 2 — the candle trembles, he leans in; the customers hold their breath
shot({ id: '2', a: 98, set: 'tav', light: 'tav', dim: (t) => 0.9 - 0.25 * smooth(ramp(t, 30, 64)),
  cam: [{ t: 0, pos: [0.15, 1.68, 2.35], look: [0.05, 1.45, -1.1], fov: 45 }, { t: 10, pos: [0.0, 1.52, 1.75], look: [0.0, 1.5, -1.0], fov: 42, e: 'out' }, { t: 34, pos: [0.0, 1.5, 1.6], look: [0.0, 1.52, -1.0], fov: 41, roll: -1, e: 'lin' }, { t: 46, pos: [0.06, 1.44, 0.75], look: [0.0, 1.6, -0.9], fov: 38, roll: -4.5, e: 'out' }, { t: 100, pos: [0.06, 1.44, 0.6], look: [0.0, 1.6, -0.9], fov: 37, roll: -5, e: 'lin' }],
  dof: (t, Cm) => ({ at: [0, 1.7, -0.95], cinf: t < 34 ? 8 : 14 }),
  act: (t, f) => { const lean = smooth(ramp(t, 30, 44)); return tavern(f, t, { hush: t > 6 ? 1 : 0, oldDz: lean * 0.32, old: { expr: t < 30 ? 'sly' : t < 60 ? 'smug' : 'shock', look: 0, L: t < 30 ? 'table' : { x: 160, y: 520, b: 0.5 }, R: t < 30 ? 'table' : { x: 440, y: 520, b: 0.5 }, headTilt: -6 * lean, blink: 0 } }); },
  fx: (t, f) => candleFx(f, CANDLES.map(([x, y, z]) => [x + jit(f, 0.004), y, z])),
});
// 3 — page turn into the legend: storm, a lone sailor's hat blown into the waves
shot({ id: '3', a: 183, set: 'sea', light: 'storm', legend: true, tr: { type: 'page', n: 14 }, weather: 'rain',
  lightning: (t) => (t >= 20 && t < 26 ? [1, 0.3, 0.9, 0.2, 0.5, 0.1][t - 20] : 0),
  cam: [{ t: 0, pos: [17, 5.5, 21], look: [4, 6.5, 2], fov: 50, roll: 6 }, { t: 40, pos: [17.5, 3.6, 20.5], look: [9, 4.5, 8], fov: 48, roll: -5 }, { t: 100, pos: [17.6, 3.0, 20.2], look: [11, 2.5, 11], fov: 46, roll: -7, e: 'lin' }],
  dof: (t, Cm) => ({ at: t < 40 ? [8, 6, 8] : [12, 2, 13], cinf: 3 }),
  world: (t) => ({ storm: 1, seaCol: '#1c3230' }),
  act: () => [],
  fx: (t, f) => { const out = [], k = smooth(ramp(t, 4, 60)), P = [lerp(6, 13.6, k), 7.4 + Math.sin(k * Math.PI) * 1.5 - k * 6.9, lerp(7, 15.6, k)];
    if (t < 64) out.push(FX('hat' + q(t * 0.22 % 6.28, 1), (p) => D.hat(p.g, t * 0.22, 0), P, 2.0, { alpha: 1 - ramp(t, 58, 64) }));
    if (t >= 58 && t < 76) out.push(FX('spl' + q(ramp(t, 58, 76)), (p) => D.splash(p.g, ramp(t, 58, 76)), [13.6, 0.4, 15.6], 2.2));
    if (t >= 20 && t < 26) out.push(FX('bolt' + (t % 2), (p) => D.bolt(p.g, t % 2 ? 0.5 : 1), [-30, 30, -60], 28));
    return out; },
});
// 4 — dawn, a foreign beach: wet hat and a gold earring glinting in the sand
const HATP = [-0.3, 0, 0.2], RINGB = [0.28, 0.04, 0.6];
shot({ id: '4', a: 264, set: 'beach', light: 'dawn', legend: true, tr: { type: 'smoke', n: 10, seed: 9 },
  cam: [{ t: 0, pos: [-0.4, 1.0, 2.7], look: [0.05, 0.3, 0.4], fov: 40, roll: 2 }, { t: 90, pos: [-0.2, 0.85, 2.05], look: [0.05, 0.28, 0.42], fov: 38, roll: 0, e: 'lin' }],
  dof: { at: [0.1, 0.2, 0.4], cinf: 11 },
  world: (t) => ({ ring: { p: RINGB, s: 0.1, rx: 1.1, ry: 0.4, rz: 0.2 } }),
  act: () => [],
  fx: (t, f) => [FX('hatw', (p) => D.hat(p.g, -0.1, 1), [HATP[0], 0.26, HATP[2]], 0.85, { order: 3 }),
    FX('rg' + q(0.5 + 0.5 * Math.sin(t * 0.3), 1), (p) => D.glow(p.g, 0.5 + 0.3 * Math.sin(t * 0.3)), [RINGB[0], 0.12, RINGB[2] + 0.05], 0.35),
    FX('spk' + q((t % 40) / 40, 2), (p) => D.sparkle(p.g, (t % 40) / 40), [RINGB[0] + 0.05, 0.2, RINGB[2] + 0.06], 0.15),
    ...[0, 1, 2].map((i) => FX('gull' + q(Math.sin(t * 0.35 + i * 2), 1), (p) => D.gull(p.g, t * 0.35 + i * 2), [-6 + i * 5 + t * 0.06, 6 + i * 1.2 + Math.sin(t * 0.05 + i), -14 - i * 4], 1.6))],
});
// 5a — an old village woman walks along the shore, sees the glint
const OMAP0 = [3.4, 0, 1.4], OMAP1 = [1.15, 0, 0.95];
shot({ id: '5a', a: 346, set: 'beach', light: 'dawn', legend: true,
  cam: [{ t: 0, pos: [-1.6, 0.9, 3.9], look: [0.6, 0.85, 0.6], fov: 44 }, { t: 12, pos: [-1.8, 1.25, 4.6], look: [1.0, 1.0, 0.7], fov: 46, e: 'out' }, { t: 80, pos: [-1.6, 1.22, 4.2], look: [1.0, 1.05, 0.7], fov: 45, e: 'lin' }],
  dof: { at: [1.2, 1.4, 0.9], cinf: 8 },
  world: () => ({ ring: { p: RINGB, s: 0.1, rx: 1.1, ry: 0.4, rz: 0.2 } }),
  act: (t, f) => { const k = smooth(ramp(t, 0, 26)), P = lerp3(OMAP0, OMAP1, k), walking = t < 26, spot = t > 26;
    return [C(OMA, { expr: spot ? 'shock' : 'happy', look: spot ? -0.8 : -0.3, turn: spot ? -0.35 : -0.2, blink: spot ? 0 : blinkAt(f, 2), legs: walking ? 'walk' : 'stand', step: q((t % 16) / 16), L: 'forward', holdL: 'basket', R: spot ? 'point' : 'hang', bob: walking ? q(Math.abs(Math.sin(t / 16 * Math.PI * 2)) * 0.015, 3) : 0, headTilt: spot ? 6 : 0 }, P, { s: 1.0, flip: false })]; },
  fx: (t, f) => [FX('hatw', (p) => D.hat(p.g, -0.15, 1), [HATP[0], 0.32, HATP[2]], 0.75, { order: 3 }),
    FX('rg' + q(0.6 + 0.3 * Math.sin(t * 0.4), 1), (p) => D.glow(p.g, 0.6 + 0.3 * Math.sin(t * 0.4)), [RINGB[0], 0.12, RINGB[2] + 0.05], 0.4),
    ...(t > 24 && t < 44 ? [FX('spk' + q(ramp(t, 24, 44)), (p) => D.sparkle(p.g, ramp(t, 24, 44)), [RINGB[0] + 0.05, 0.22, RINGB[2] + 0.06], 0.3)] : [])],
});
// 5b — she picks it up; her eyes go wide
shot({ id: '5b', a: 394, set: 'beach', light: 'dawn', legend: true,
  cam: [{ t: 0, pos: [-0.6, 1.0, 3.8], look: [0.85, 0.8, 0.8], fov: 44 }, { t: 12, pos: [-0.2, 1.2, 3.55], look: [0.9, 1.2, 0.85], fov: 42, e: 'out' }, { t: 80, pos: [-0.1, 1.22, 3.3], look: [0.92, 1.25, 0.85], fov: 41, e: 'lin' }],
  dof: { at: [1.0, 1.5, 0.9], cinf: 13 },
  act: (t, f) => { const up = smooth(ramp(t, 4, 30)), crouch = 1 - smooth(ramp(t, 14, 30));
    return [C(OMA, { expr: t < 20 ? 'neutral' : 'shock', look: t < 20 ? -0.6 : -0.2, turn: -0.25, legs: crouch > 0.3 ? 'crouch' : 'stand', L: 'forward', holdL: 'basket', R: { x: lerp(470, 430, up), y: lerp(780, 400, up), b: 0.6 }, holdR: 'earring', earGlow: 0.6 + 0.4 * Math.sin(t * 0.4), headTilt: t > 30 ? 4 : 0, blink: 0 }, [OMAP1[0] - 0.2, -0.32 * crouch, OMAP1[2]], { s: 1.0 })]; },
  fx: (t, f) => [FX('hatw', (p) => D.hat(p.g, -0.15, 1), [HATP[0], 0.32, HATP[2]], 0.75, { order: 3 }), ...(t > 30 && t < 52 ? [FX('spk' + q(ramp(t, 30, 52)), (p) => D.sparkle(p.g, ramp(t, 30, 52)), [1.25, 1.62, 1.0], 0.35)] : [])],
});
// 6 — the little white chapel on the hill, a simple gravestone, she lays flowers
const GR = [12.2, 2.95, -2.6];
shot({ id: '6', a: 460, set: 'beach', light: 'dawn', legend: true, tr: { type: 'fade', n: 8 },
  cam: [{ t: 0, pos: [10.0, 4.6, 3.3], look: [12.0, 4.2, -4.0], fov: 47 }, { t: 90, pos: [10.3, 4.4, 2.6], look: [12.0, 4.1, -4.0], fov: 45, e: 'lin' }],
  dof: { at: [11.8, 3.8, -2.4], cinf: 4 },
  world: (t) => ({ flowers: t > 44 ? 1 : 0, bell: t < 40 ? 1 : 0 }),
  act: (t, f) => { const k = smooth(ramp(t, 18, 40));
    return [C(OMA, { expr: 'happy', look: 0.7, turn: 0.4, legs: 'crouch', blink: blinkAt(f, 2), L: 'hang', R: t < 44 ? { x: lerp(430, 540, k), y: lerp(560, 760, k), b: 0.5 } : 'hang', holdR: t < 44 ? 'flowers' : null, headTilt: 6 }, [10.95, GR[1] - 0.3, -2.1], { s: 1.0 })]; },
  fx: (t, f) => [...[0, 1].map((i) => FX('gull' + q(Math.sin(t * 0.3 + i * 2), 1), (p) => D.gull(p.g, t * 0.3 + i * 2), [14 + i * 4 - t * 0.05, 11 + i, -12 - i * 3], 1.8))],
});
// 7a — the earring held up in the dawn light, turning
const RING_SKY = [0, 40, 0];
shot({ id: '7a', a: 542, set: 'beach', light: 'dawn', legend: true, tr: { type: 'fade', n: 6 },
  cam: [{ t: 0, pos: [RING_SKY[0] + 0.8, RING_SKY[1] - 0.9, RING_SKY[2] + 8.6], look: [0, RING_SKY[1] + 0.1, 0], fov: 34 }, { t: 60, pos: [RING_SKY[0] + 0.5, RING_SKY[1] - 0.75, RING_SKY[2] + 7.6], look: [0, RING_SKY[1] + 0.1, 0], fov: 33, e: 'lin' }],
  dof: { at: RING_SKY, cinf: 6 },
  world: (t) => ({ ring: { p: RING_SKY, s: 1.0, rx: -0.42, ry: 2.2 + t * 0.012, rz: 0.08 } }),
  act: () => [],
  fx: (t) => [FX('spk' + q(ramp(t, 8, 30)), (p) => D.sparkle(p.g, ramp(t, 8, 30)), [RING_SKY[0] - 0.9, RING_SKY[1] + 0.55, RING_SKY[2] + 0.4], 1.3)],
});
// 7b — inside the ring: "Hamburg" and a little ship engraved
shot({ id: '7b', a: 580, set: 'beach', light: 'dawn', legend: true,
  cam: [{ t: 0, pos: [RING_SKY[0] + 0.5, RING_SKY[1] - 0.73, RING_SKY[2] + 7.5], look: [0, RING_SKY[1] + 0.1, 0], fov: 33 }, { t: 16, pos: [0.12, RING_SKY[1] + 0.03, 0.88], look: [0.0, RING_SKY[1] - 0.02, -1], fov: 40, e: 'out' }, { t: 90, pos: [-0.12, RING_SKY[1] + 0.02, 0.86], look: [0.06, RING_SKY[1] - 0.02, -1], fov: 38, e: 'lin' }],
  dof: { at: [0, RING_SKY[1], -1], cinf: 4 },
  world: (t) => ({ ring: { p: RING_SKY, s: 1.0, rx: lerp(-0.42, 0, smooth(ramp(t, 0, 16))), ry: lerp(2.2 + 38 * 0.012, 0, smooth(ramp(t, 0, 16))), rz: lerp(0.08, 0, smooth(ramp(t, 0, 16))) } }),
  act: () => [],
  fx: (t) => t > 24 && t < 50 ? [FX('spk' + q(ramp(t, 24, 50)), (p) => D.sparkle(p.g, ramp(t, 24, 50)), [0.38, RING_SKY[1] + 0.12, -0.93], 0.35)] : [],
});
// 8 — bubble pop back to reality: the swinging sign outside, then in through the door: the old sailor raises his mug
shot({ id: '8', a: 643, set: 'tav', light: 'tav', tr: { type: 'bubble', n: 13 },
  cam: [{ t: 0, pos: [0.4, 2.3, 9.4], look: [0, 2.35, 4.4], fov: 46 }, { t: 18, pos: [0.3, 2.25, 8.4], look: [0, 2.3, 4.4], fov: 46, e: 'lin' }, { t: 34, pos: [0.1, 1.72, 2.2], look: [0.05, 1.5, -1.1], fov: 45, e: 'out' }, { t: 80, pos: [0.1, 1.68, 1.85], look: [0.05, 1.52, -1.1], fov: 44, e: 'lin' }],
  dof: (t) => t < 20 ? { at: [0, 2.3, 4.95], cinf: 7 } : { at: [0, 1.6, -1.25], cinf: 8 },
  act: (t, f) => tavern(f, t, { old: { expr: t > 30 ? 'laugh' : 'sly', R: t > 26 ? 'raise' : 'table', holdR: 'mugFoam', L: 'table' }, chef: { expr: 'goofy', R: 'raise' } }),
  fx: (t, f) => candleFx(f, CANDLES),
});
// 9a — smoke into the legend: equator ceremony, the "sea king" raises his trident; a golden line on the sea ahead
const NEP = [3.2, DECK, -0.7], YNG = [4.1, DECK, 0.6];
const ringCrew = (f, t, cheer) => [[1.4, -1.6, SAILA], [2.0, 1.9, SAILB], [5.1, -1.9, SAILC], [5.6, 1.6, SAILA], [6.4, -0.2, SAILB]].map(([x, z, sp], i) =>
  C(sp, { expr: cheer ? (i % 2 ? 'laugh' : 'goofy') : 'happy', turn: (3.5 - x) * 0.15, look: (3.5 - x) * 0.3, blink: blinkAt(f, i + 20), L: cheer ? (((f + i * 5) % 12) < 6 ? 'up' : 'wave') : 'hang', R: cheer ? (((f + i * 5) % 12) < 6 ? 'wave' : 'up') : 'hip', bob: cheer ? q(Math.abs(Math.sin((f + i * 4) * 0.5)) * 0.02, 3) : 0 }, [x, DECK + shipBob(f), z], { s: 0.92, order: 1 }));
shot({ id: '9a', a: 701, set: 'sea', light: 'noon', legend: true, tr: { type: 'smoke', n: 13, seed: 3 },
  cam: [{ t: 0, pos: [-2.6, 4.3, 5.4], look: [6, 3.1, -0.8], fov: 52 }, { t: 90, pos: [-1.9, 4.1, 4.9], look: [6, 3.0, -0.8], fov: 50, e: 'lin' }],
  dof: { at: [3.5, 3, 0], cinf: 4 },
  world: () => ({ storm: 0, equator: 1 }),
  act: (t, f) => { const up = smooth(ramp(t, 6, 22));
    return [C(NEPTUN, { expr: 'laugh', turn: 0.2, blink: 0, L: 'hip', R: { x: 470, y: lerp(560, 330, up), b: 0.4 }, holdR: 'trident' }, [NEP[0], NEP[1] + shipBob(f), NEP[2]], { s: 1.05, order: 3 }),
      C(YNG, { expr: 'goofy', turn: -0.3, look: -0.6, blink: blinkAt(f, 4), L: 'hang', R: 'hip' }, [YNG[0], YNG[1] + shipBob(f), YNG[2]], { s: 0.95, order: 3 }), ...ringCrew(f, t, t > 24)]; },
  fx: (t, f) => (t >= 26 && t < 40 ? [FX('tok' + q(ramp(t, 26, 40)), (p) => window.__T.fxBurst({ g: p.g, poly: (pts, col, w) => { const g = p.g; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x + 50, y + 250) : g.moveTo(x + 50, y + 250))); g.closePath(); g.fillStyle = col; g.fill(); g.lineWidth = w; g.strokeStyle = '#1a1416'; g.stroke(); }, ell: () => {} }, ramp(t, 26, 40), '#fff3b0', 10, 30, 200), [NEP[0] + 0.55, DECK + 0.1, NEP[2] + 0.2], 0.7)] : []),
});
// 9b — the young sailor gets his first earring and grins with pride; everyone claps
shot({ id: '9b', a: 772, set: 'sea', light: 'noon', legend: true,
  cam: [{ t: 0, pos: [2.0, 4.4, 4.9], look: [3.7, 3.6, 0.0], fov: 46 }, { t: 12, pos: [2.9, 3.9, 4.1], look: [3.65, 3.55, 0.0], fov: 44, e: 'out' }, { t: 90, pos: [3.0, 3.88, 3.85], look: [3.65, 3.57, 0.0], fov: 43, e: 'lin' }],
  dof: { at: [3.9, 3.6, 0.6], cinf: 12 },
  world: () => ({ storm: 0, equator: 1 }),
  act: (t, f) => { const on = t > 34;
    return [C(NEPTUN, { expr: 'laugh', turn: 0.3, look: 0.6, blink: 0, L: t < 36 ? { x: 520, y: 330, b: 0.4 } : 'hip', R: 'hang', holdR: 'trident' }, [NEP[0], NEP[1] + shipBob(f), NEP[2]], { s: 1.05, order: 2 }),
      C(YNG, { expr: on ? 'proud' : 'goofy', turn: on ? 0 : -0.3, look: on ? 0 : -0.6, blink: on ? 0 : blinkAt(f, 4), earR: on ? 1 : 0, earGlow: on ? clamp(1 - (t - 34) / 20) : 0, L: on ? 'thumb' : 'hang', R: on ? 'hip' : 'hip', headTilt: on ? 5 : 0, bob: on ? q(Math.abs(Math.sin(t * 0.4)) * 0.012, 3) : 0 }, [YNG[0], YNG[1] + shipBob(f), YNG[2]], { s: 0.95, order: 3 }),
      ...ringCrew(f, t, true).map((a, i) => ({ ...a, draw: a.draw }))]; },
  fx: (t) => (t > 34 && t < 56 ? [FX('spk' + q(ramp(t, 34, 56)), (p) => D.sparkle(p.g, ramp(t, 34, 56)), [YNG[0] + 0.3, DECK + 1.5, YNG[2] + 0.1], 0.45)] : []),
});
// 10a — Cape Horn: icy wind, giant grey waves, sharp dark rocks, snow; the ship struggles round
shot({ id: '10a', a: 857, set: 'sea', light: 'ice', legend: true, tr: { type: 'flash', n: 7 }, weather: 'snow',
  cam: [{ t: 0, pos: [26, 3.0, 26], look: [4, 6, 0], fov: 50, roll: -5 }, { t: 90, pos: [22, 2.6, 22], look: [3, 5.5, -2], fov: 47, roll: 4, e: 'lin' }],
  dof: { at: [4, 5, 0], cinf: 2 },
  world: (t) => ({ storm: 1, rocks: 1, seaCol: '#24302e', shipYaw: lerp(0.5, -0.4, smooth(ramp(t, 0, 80))), heel: -0.06 }),
  act: () => [],
  fx: () => [],
});
// 10b — the same young sailor, tired but proud, puts in his second earring
shot({ id: '10b', a: 938, set: 'sea', light: 'ice', legend: true, weather: 'snow',
  cam: [{ t: 0, pos: [1.2, 3.85, 4.2], look: [2.6, 3.55, 0.6], fov: 42, roll: -3 }, { t: 12, pos: [1.9, 3.75, 3.1], look: [2.6, 3.6, 0.6], fov: 40, roll: 2, e: 'out' }, { t: 90, pos: [2.0, 3.72, 2.85], look: [2.6, 3.62, 0.6], fov: 39, roll: 3, e: 'lin' }],
  dof: { at: [2.6, 3.6, 0.6], cinf: 12 },
  world: () => ({ storm: 1, rocks: 1, seaCol: '#24302e', shipYaw: -0.4, heel: -0.04 }),
  act: (t, f) => { const on = t > 30, YP = [2.6, DECK + shipBob(f, 1) * 0.3, 0.6];
    return [C({ ...YOUNG, hat: { type: 'beanie', color: '#5a6a7a', band: '#3a4a5a' } }, { expr: on ? 'proud' : 'tired', turn: 0.1, look: 0.2, blink: on ? 0 : blinkAt(f, 4), earR: on ? 2 : 1, earGlow: on ? clamp(1 - (t - 30) / 18) : 0, L: 'hang', R: t > 14 && t < 34 ? 'ear' : on ? 'thumb' : 'hang', tilt: Math.sin(t * 0.12) * 4, sweat: !on }, YP, { s: 0.98, order: 3 })]; },
  fx: (t) => (t > 30 && t < 50 ? [FX('spk' + q(ramp(t, 30, 50)), (p) => D.sparkle(p.g, ramp(t, 30, 50)), [2.95, DECK + 1.72, 0.65], 0.35)] : []),
});
// 11a — a sailor slips and falls overboard (calm sea)
const FALL0 = [2.6, DECK, 2.1];
shot({ id: '11a', a: 1010, set: 'sea', light: 'noon', legend: true, tr: { type: 'fade', n: 7 },
  cam: [{ t: 0, pos: [4.2, 4.0, -2.0], look: [3.0, 2.6, 4.6], fov: 48 }, { t: 60, pos: [4.1, 4.2, -1.5], look: [3.1, 2.2, 4.9], fov: 47, e: 'lin' }],
  dof: { at: [2.8, 3, 3], cinf: 4 },
  world: () => ({ storm: 0 }),
  act: (t, f) => { const k = ramp(t, 10, 36), P = [FALL0[0] + k * 0.6, FALL0[1] + Math.sin(Math.min(k * 1.4, 1) * Math.PI * 0.6) * 1.2 - (k > 0.4 ? (k - 0.4) ** 2 * 9 : 0), FALL0[2] + k * 3.4];
    return t < 36 ? [C(SAILB, { expr: t < 10 ? 'happy' : 'scared', blink: 0, L: t < 10 ? 'hang' : 'flail', R: t < 10 ? 'hip' : 'flail', legs: t < 10 ? 'walk' : 'stand', step: q((t % 16) / 16), tilt: t < 10 ? 0 : -40 * k }, P, { s: 0.92, order: 3, blob: t < 10 })] : []; },
  fx: (t) => (t >= 34 && t < 52 ? [FX('spl' + q(ramp(t, 34, 52)), (p) => D.splash(p.g, ramp(t, 34, 52)), [FALL0[0] + 0.6, 0.2, FALL0[2] + 3.6], 1.2)] : []),
});
// 11b — the gold glows, BOING: the sea spits him back up onto the deck
const WATER = [3.4, -0.85, 6.6];
shot({ id: '11b', a: 1051, set: 'sea', light: 'noon', legend: true,
  cam: [{ t: 0, pos: [3.9, 5.0, 1.9], look: [3.4, 0.3, 6.6], fov: 46 }, { t: 26, pos: [3.9, 4.9, 2.1], look: [3.4, 0.4, 6.6], fov: 46, e: 'lin' }, { t: 37, pos: [2.8, 3.9, -1.2], look: [3.3, 5.2, 4.0], fov: 54, e: 'out' }, { t: 50, pos: [2.6, 4.0, -2.6], look: [3.1, 4.0, 2.0], fov: 52 }, { t: 100, pos: [2.6, 3.95, -2.3], look: [3.1, 3.9, 1.8], fov: 50, e: 'lin' }],
  dof: (t) => ({ at: t < 30 ? [3.4, 0, 6.6] : [3.2, 3.4, 1.6], cinf: 5 }),
  world: () => ({ storm: 0 }),
  act: (t, f) => { let P, o;
    if (t < 26) { P = [WATER[0], WATER[1] + Math.sin(t * 0.4) * 0.06, WATER[2]]; o = { expr: t < 12 ? 'scared' : 'shock', blink: 0, earR: 1, earGlow: clamp((t - 8) / 10), L: 'flail', R: 'flail' }; }
    else if (t < 50) { const k = (t - 26) / 24; P = [lerp(WATER[0], 3.2, k), WATER[1] + k * (DECK - WATER[1]) + Math.sin(k * Math.PI) * 4.5, lerp(WATER[2], 1.6, k)]; o = { expr: 'goofy', blink: 0, earR: 1, earGlow: 1 - k * 0.6, L: 'up', R: 'up', tilt: -Math.sin(k * Math.PI) * 30 }; }
    else { P = [3.2, DECK, 1.6]; o = { expr: 'goofy', blink: 0, earR: 1, earGlow: 0.3, L: 'up', R: 'thumb', bob: q(Math.max(0, Math.sin((t - 50) * 0.6)) * 0.03 * clamp(1 - (t - 50) / 20), 3) }; }
    return [C(SAILB, o, P, { s: t < 26 ? 1.15 : 0.95, order: 3, blob: t >= 50 })]; },
  fx: (t) => { const out = [];
    if (t > 8 && t < 26) out.push(FX('eg' + q(ramp(t, 8, 26), 1), (p) => D.glow(p.g, 0.8 + 0.2 * Math.sin(t)), [WATER[0] + 0.3, WATER[1] + 1.6, WATER[2] + 0.2], 0.9));
    if (t >= 24 && t < 40) out.push(FX('spl' + q(ramp(t, 24, 40)), (p) => D.splash(p.g, ramp(t, 24, 40)), [WATER[0], 0.2, WATER[2]], 1.2));
    if (t >= 50 && t < 74) out.push(FX('st' + q(ramp(t, 50, 74)), (p) => D.stars(p.g, ramp(t, 50, 74)), [3.2, DECK + 2.15, 1.7], 0.7));
    return out; },
});
// 12 — up the mast: the lookout's earring glows, his eyes stretch out like telescopes
const NEST = [0, 17.44, 0];
shot({ id: '12', a: 1123, set: 'sea', light: 'noon', legend: true,
  cam: [{ t: 0, pos: [6.5, 4.6, 9], look: [3.2, 4.2, 2.6], fov: 47 }, { t: 12, pos: [-0.5, 18.15, 3.5], look: [0.55, 18.0, 0.4], fov: 46, e: 'out' }, { t: 80, pos: [-0.42, 18.12, 3.15], look: [0.6, 18.0, 0.4], fov: 45, e: 'lin' }],
  dof: { at: [0.35, 18.0, 0.45], cinf: 8 },
  world: () => ({ storm: 0 }),
  act: (t, f) => { const tele = smooth(ramp(t, 24, 40));
    return [C(SAILA, { expr: t < 22 ? 'happy' : 'goofy', turn: 0.45, look: 1, blink: t < 20 ? blinkAt(f, 6) : 0, earR: 1, earGlow: clamp((t - 12) / 8) * (1 - 0.5 * tele), tele, L: 'hang', R: t < 24 ? 'chin' : 'hip' }, [0.35, NEST[1] - 0.95, 0.45], { s: 0.95, order: 3, blob: false })]; },
  fx: (t) => (t > 12 && t < 30 ? [FX('spk' + q(ramp(t, 12, 30)), (p) => D.sparkle(p.g, ramp(t, 12, 30)), [0.66, NEST[1] + 0.5, 0.5], 0.4)] : []),
});
// 13a1 — the gun deck: the boys at the cannons
const GNR = [2.0, 0, 0.25];
const gunCrew = (f, t, o = {}) => [C(SAILC, { expr: o.scared ? 'scared' : 'happy', turn: 0.3, look: 0.5, blink: blinkAt(f, 31), L: o.scared ? 'cover' : 'hang', R: o.scared ? 'cover' : 'hip', tilt: o.shake ? jit(f, 6) : 0 }, [0.95, 0, -1.9], { s: 0.95, order: 1 }),
  C(SAILA, { expr: o.scared ? 'scared' : 'goofy', turn: 0.2, look: 0.6, blink: blinkAt(f, 37), L: o.scared ? 'cover' : 'hip', R: o.scared ? 'cover' : 'hang', tilt: o.shake ? -jit(f, 6) : 0 }, [-0.2, 0, -0.9], { s: 0.95, order: 1 })];
shot({ id: '13a1', a: 1181, set: 'gun', light: 'gun', legend: true, tr: { type: 'fade', n: 7 },
  cam: [{ t: 0, pos: [1.3, 1.75, 3.7], look: [1.55, 1.4, -1.0], fov: 48 }, { t: 90, pos: [1.35, 1.72, 3.2], look: [1.6, 1.42, -1.0], fov: 46, e: 'lin' }],
  dof: { at: [2.0, 1.5, 0.3], cinf: 6 },
  world: () => ({}),
  act: (t, f) => [C(GUNNER, { expr: 'smug', turn: -0.2, look: -0.4, blink: blinkAt(f, 41), wax: true, L: 'hip', R: 'belly' }, GNR, { s: 1.05, order: 3 }), ...gunCrew(f, t)],
  fx: () => [],
});
// 13a2 — close-up: a yellow ball of wax dangling from his earring
const GEAR = [GNR[0] + 0.33, 1.62, GNR[2] + 0.02];
shot({ id: '13a2', a: 1246, set: 'gun', light: 'gun', legend: true,
  cam: [{ t: 0, pos: [GEAR[0] - 0.6, 1.6, GEAR[2] + 2.4], look: [GEAR[0] - 0.25, 1.52, GEAR[2]], fov: 40 }, { t: 12, pos: [GEAR[0] - 0.2, 1.58, GEAR[2] + 1.6], look: [GEAR[0] - 0.14, 1.52, GEAR[2]], fov: 38, e: 'out' }, { t: 70, pos: [GEAR[0] - 0.19, 1.58, GEAR[2] + 1.45], look: [GEAR[0] - 0.14, 1.52, GEAR[2]], fov: 37, e: 'lin' }],
  dof: { at: GEAR, cinf: 14 },
  act: (t, f) => [C(GUNNER, { expr: 'sly', turn: -0.1, look: 0.6, blink: blinkAt(f, 41), wax: true, L: 'hip', R: t > 16 ? { x: 470, y: 420, b: 0.6 } : 'belly' }, GNR, { s: 1.05, order: 3 }), ...gunCrew(f, t)],
  fx: () => [],
});
// 13a3 — plop! wax off the earring, into the ears
shot({ id: '13a3', a: 1296, set: 'gun', light: 'gun', legend: true,
  cam: [{ t: 0, pos: [GNR[0] - 0.2, 1.62, GNR[2] + 2.2], look: [GNR[0], 1.55, GNR[2]], fov: 40 }, { t: 60, pos: [GNR[0] - 0.18, 1.6, GNR[2] + 1.95], look: [GNR[0], 1.56, GNR[2]], fov: 39, e: 'lin' }],
  dof: { at: [GNR[0], 1.6, GNR[2]], cinf: 12 },
  act: (t, f) => { const plucked = t > 6, inEars = t > 20;
    return [C(GUNNER, { expr: inEars ? 'smug' : 'sly', turn: 0, blink: blinkAt(f, 41), wax: !plucked, L: inEars ? 'ear' : 'hip', R: !plucked ? 'ear' : inEars ? 'ear' : { x: 470, y: 470, b: 0.6 }, holdR: plucked && !inEars ? 'wax' : null }, GNR, { s: 1.05, order: 3 }), ...gunCrew(f, t)]; },
  fx: (t) => (t >= 6 && t < 18 ? [FX('pl' + q(ramp(t, 6, 18)), (p) => D.ring(p.g, ramp(t, 6, 18)), [GEAR[0] + 0.05, GEAR[1] - 0.05, GEAR[2] + 0.05], 0.3)] : []),
});
// 13b — fuse, BOOM (only smoke and noise), the others shake with hands over their ears, he just smiles
const BOOM = 47; // t of the bang ("geknallt")
shot({ id: '13b', a: 1337, set: 'gun', light: 'gun', legend: true,
  cam: [{ t: 0, pos: [1.6, 1.7, 2.3], look: [1.7, 1.5, -0.6], fov: 46 }, { t: 12, pos: [1.35, 1.8, 3.6], look: [1.65, 1.42, -0.8], fov: 50, e: 'out' }, { t: 100, pos: [1.35, 1.78, 3.3], look: [1.65, 1.42, -0.8], fov: 49, e: 'lin' }],
  kicks: [{ t: BOOM, a: 0.06, n: 9 }], flash: (t) => (t >= BOOM && t < BOOM + 3 ? (1 - (t - BOOM) / 3) * 0.55 : 0),
  dof: { at: [2.0, 1.5, 0.3], cinf: 5 },
  world: (t) => ({ fireZ: -0.7, recoil: t >= BOOM ? Math.max(0, 1 - (t - BOOM) / 10) * (t - BOOM < 2 ? (t - BOOM + 1) / 2 : 1) : 0 }),
  act: (t, f) => { const after = t >= BOOM;
    return [C(GUNNER, { expr: after ? 'admire' : 'smug', turn: -0.15, look: -0.3, blink: after ? 1 : blinkAt(f, 41), L: 'ear', R: t < BOOM ? { x: 500, y: 640, b: 0.5 } : 'ear', holdR: t < BOOM ? 'torch' : null }, GNR, { s: 1.05, order: 3 }),
      ...gunCrew(f, t, { scared: t > BOOM - 12, shake: after && t < BOOM + 16 })]; },
  fx: (t, f) => { const out = [], BR = [2.65, 1.0, -0.7];
    if (t < BOOM) out.push(FX('sp' + (f % 6), (p) => D.spark(p.g, f), [BR[0], BR[1] + 0.05, BR[2] + 0.1], 0.25));
    if (t >= BOOM && t < BOOM + 8) out.push(FX('mz' + q(ramp(t, BOOM, BOOM + 8)), (p) => D.muzzle(p.g, ramp(t, BOOM, BOOM + 8)), [4.4, 1.65, -0.7], 1.6));
    for (let i = 0; i < 5; i++) { const s0 = BOOM + i * 2; if (t >= s0 && t < s0 + 40) { const k = ramp(t, s0, s0 + 40); out.push(FX('sm' + i + q(k), (p) => D.puff(p.g, k), [3.6 - i * 0.45 - k * 0.8, 1.2 + k * 0.6 + i * 0.1, -0.7 + i * 0.35], 1.1 + i * 0.2 + k * 0.8, { order: 7 })); } }
    if (t >= BOOM && t < BOOM + 16) for (const [x, z] of [[0.95, -1.9], [-0.2, -0.9]]) out.push(FX('sk' + (t % 4), (p) => D.shake(p.g, t / 16), [x, 1.62, z + 0.05], 0.8));
    return out; },
});
// 14a — bubble pop back to the archive; legend scenes float past as soap bubbles and pop one by one
shot({ id: '14a', a: 1403, set: 'arch', light: 'arch', tr: { type: 'bubble', n: 12 },
  bubbles: [{ x: 300, y: 1180, r: 165, img: 0, pop: 1414, v: 3 }, { x: 780, y: 1000, r: 150, img: 1, pop: 1421, v: 4 }, { x: 560, y: 1420, r: 140, img: 2, pop: 1428, v: 3.5 }, { x: 250, y: 860, r: 130, img: 3, pop: 1434, v: 2.5 }, { x: 760, y: 1360, r: 135, img: 4, pop: 1439, v: 3 }],
  cam: [{ t: 0, pos: [0.4, 2.1, 4.8], look: [0.2, 1.7, -1.5], fov: 48 }, { t: 60, pos: [0.42, 1.95, 4.1], look: [0.2, 1.62, -1.5], fov: 47, e: 'lin' }],
  dof: { at: [0, 1.6, -1.4], cinf: 5 },
  world: () => ({ page: 0 }),
  act: (t, f) => [C(HIST, { expr: 'skeptic', turn: 0.2, look: 0.6, blink: blinkAt(f, 51), L: 'table', R: 'table', holdR: 'magnifier' }, [-0.32, -0.05, -1.35], { s: 1.05, order: 2 })],
  fx: (t, f) => [FX('lmp', (p) => D.glow(p.g, 0.55, '255,236,170'), [-0.95, 1.55, -0.85], 0.5)],
});
// 14b — the historian turns the pages, squints through the magnifier and shakes his head
shot({ id: '14b', a: 1440, set: 'arch', light: 'arch',
  cam: [{ t: 0, pos: [0.3, 1.7, 3.1], look: [0.25, 1.42, -0.6], fov: 44 }, { t: 70, pos: [0.28, 1.68, 2.75], look: [0.25, 1.44, -0.6], fov: 43, e: 'lin' }],
  dof: { at: [0.0, 1.5, -0.6], cinf: 5 },
  world: (t) => ({ page: smooth(ramp(t, 4, 18)) }),
  act: (t, f) => { const shake = t > 30 ? Math.sin((t - 30) * 0.55) * clamp((t - 30) / 6) : 0;
    return [C(HIST, { expr: t < 26 ? 'skeptic' : 'worried', turn: shake * 0.5, look: shake * 0.8, blink: blinkAt(f, 51), L: t < 18 ? { x: 230, y: 610, b: 0.4 } : 'table', R: { x: 440, y: 520, b: 0.6 }, holdR: 'magnifier', headTilt: shake * 6 }, [-0.32, -0.05, -1.35], { s: 1.05, order: 2 })]; },
  fx: (t, f) => [FX('lmp', (p) => D.glow(p.g, 0.55, '255,236,170'), [-0.95, 1.55, -0.85], 0.5), ...(t >= 14 && t < 34 ? [FX('du' + q(ramp(t, 14, 34)), (p) => D.dust(p.g, ramp(t, 14, 34)), [-0.3, 1.25, -0.2], 0.5)] : []),
    ...[0, 1, 2, 3, 4, 5].map((i) => { const u = ((t * 0.006 + i * 0.17) % 1); return FX('mt' + q(Math.sin(u * Math.PI), 1), (p) => p.toon.fxMote(p, u), [-1.0 + i * 0.35 + Math.sin(t * 0.03 + i) * 0.1, 1.2 + u * 1.2, -0.6], 0.12); })],
});
// 15 — portrait gallery: sailors with earrings, plaques "Unbekannter Seemann"
shot({ id: '15', a: 1500, set: 'gal', light: 'gal', tr: { type: 'whip', n: 8, dir: 1 },
  cam: [{ t: 0, pos: [-0.2, 1.72, 2.75], look: [0.0, 1.78, -0.3], fov: 50 }, { t: 60, pos: [3.0, 1.72, 2.75], look: [3.2, 1.78, -0.3], fov: 50, e: 'lin' }],
  dof: { at: [2, 1.9, -0.1], cinf: 1, focus: 2.95 },
  world: () => ({}),
  act: () => [],
  fx: () => [],
});
// 16 — back in the tavern: he scratches his beard and shrugs
shot({ id: '16', a: 1547, set: 'tav', light: 'tav', tr: { type: 'whip', n: 8, dir: 1 },
  cam: [{ t: 0, pos: [0.25, 1.65, 1.55], look: [0.05, 1.55, -1.2], fov: 44 }, { t: 60, pos: [0.22, 1.64, 1.3], look: [0.05, 1.56, -1.2], fov: 43, e: 'lin' }],
  dof: { at: [0, 1.65, -1.25], cinf: 11 },
  act: (t, f) => tavern(f, t, { old: { expr: t < 18 ? 'worried' : 'neutral', look: t < 18 ? 0.6 : 0, L: t < 18 ? 'chin' : 'shrug', R: t < 18 ? 'table' : 'shrug', headTilt: t < 18 ? 8 + Math.sin(t * 1.6) * 2 : -6, blink: blinkAt(f, 3) } }),
  fx: (t, f) => candleFx(f, CANDLES),
});
// 17a — he polishes his earring on his sleeve, very pleased with himself
shot({ id: '17a', a: 1585, set: 'tav', light: 'tav',
  cam: [{ t: 0, pos: [0.3, 1.66, 1.2], look: [0.12, 1.58, -1.2], fov: 42 }, { t: 12, pos: [0.42, 1.66, 0.7], look: [0.16, 1.6, -1.2], fov: 40, e: 'out' }, { t: 70, pos: [0.43, 1.66, 0.55], look: [0.16, 1.6, -1.2], fov: 39, e: 'lin' }],
  dof: { at: [0.1, 1.65, -1.25], cinf: 13 },
  act: (t, f) => tavern(f, t, { crowd: false, old: { expr: 'admire', look: 0.8, turn: 0.2, L: 'table', R: { x: 455 + Math.sin(t * 0.9) * 22, y: 330 + Math.cos(t * 0.9) * 14, b: 1.4 }, earGlow: 0.3 + 0.3 * Math.max(0, Math.sin(t * 0.45)), headTilt: 6, blink: 0 } }),
  fx: (t, f) => [...candleFx(f, CANDLES), ...[10, 30, 50].filter((s) => t >= s && t < s + 16).map((s) => FX('spk' + s + q(ramp(t, s, s + 16)), (p) => D.sparkle(p.g, ramp(t, s, s + 16)), [EAR[0] + 0.02, EAR[1] + 0.04, EAR[2] + 0.08], 0.22))],
});
// 17b — admires himself in a shiny pewter mug, then turns to us and winks. The end.
const WINK = 34;
shot({ id: '17b', a: 1650, set: 'tav', light: 'tav',
  cam: [{ t: 0, pos: [0.35, 1.62, 0.95], look: [0.1, 1.5, -1.2], fov: 42 }, { t: 60, pos: [0.3, 1.63, 0.68], look: [0.06, 1.55, -1.2], fov: 41, e: 'lin' }],
  kicks: [{ t: WINK, a: 0.012, n: 6 }],
  dof: { at: [0.05, 1.6, -1.25], cinf: 12 },
  act: (t, f) => { const w = t >= WINK;
    return tavern(f, t, { crowd: false, old: { expr: w ? 'wink' : 'admire', look: w ? 0 : -0.9, turn: w ? 0 : -0.35, L: { x: 160, y: 400, b: 0.6 }, holdL: 'pewter', reflect: true, R: w ? 'thumb' : 'table', headTilt: w ? 4 : -4, blink: 0, earGlow: w ? clamp(1 - (t - WINK) / 14) * 0.8 : 0 } }); },
  fx: (t, f) => [...candleFx(f, CANDLES), ...(t >= WINK && t < WINK + 16 ? [FX('wk' + q(ramp(t, WINK, WINK + 16)), (p) => D.sparkle(p.g, ramp(t, WINK, WINK + 16)), [-0.12, 1.78, -1.1], 0.3)] : [])],
});

// ---------------- exports ----------------
SH.forEach((s, i) => { s.b = i + 1 < SH.length ? SH[i + 1].a - 1 : TOTAL - 1; s.i = i; });
export const SHOTS = SH;
export const shotAt = (f) => { for (let i = SH.length - 1; i >= 0; i--) if (f >= SH[i].a) return SH[i]; return SH[0]; };
export const transAt = (f) => { const S = shotAt(f); if (!S.tr || S.i === 0) return null; const t = f - S.a; if (t >= S.tr.n) return null; return { ...S.tr, f0: S.a, fromF: f, fromS: SH[S.i - 1] }; };
export const worldAt = (f, S0) => { const S = S0 || shotAt(f); return { set: S.set, ...(S.world ? S.world(f - S.a, f) : {}) }; };
export const actorsAt = (f, T, S0) => { const S = S0 || shotAt(f); window.__T = T; const Cm = camAt(f, S);
  return (S.act ? S.act(f - S.a, f, T) : []).map((a) => { const d = a.draw; return { ...a, draw: (p) => { p.toon = T; d(p); }, yaw: a.yaw === 0 ? faceZ(Cm, a.x, a.z) : (a.yaw || 0) }; }); };
export const fxAt = (f, T, S0) => { const S = S0 || shotAt(f); window.__T = T;
  return (S.fx ? S.fx(f - S.a, f, T) : []).map((a) => { const d = a.draw; return { ...a, draw: (p) => { p.toon = T; d(p); } }; }); };
