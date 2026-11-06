// ZAMAN YOLCUSU · procedural sound effects (no music, no voice).
// Every cue is read from timeline.js — the same file the picture uses — so sounds land on their frames.
// Output: 48 kHz stereo 24-bit WAV, exactly 55.000 s, mixed low under a narrator (-22 LUFS target, peaks <= -6 dBFS).
//   node sfx.mjs [out.wav]
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const CUE = new Function(readFileSync(join(HERE, 'timeline.js'), 'utf8') + '\nreturn CUE;')();
const OUT = resolve(process.argv[2] || join(HERE, 'sfx.wav'));
const SR = 48000, DUR = CUE.end, N = Math.round(SR * DUR);
const TAU = Math.PI * 2;
const L = new Float32Array(N), R = new Float32Array(N);

/* ---------- basics ---------- */
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const S = t => Math.round(t * SR);
const db = d => Math.pow(10, d / 20);
/** piecewise-linear envelope over global time: [[t, v], ...] */
function env(pts) { return t => { if (t <= pts[0][0]) return pts[0][1]; for (let i = 1; i < pts.length; i++) if (t <= pts[i][0]) { const [t0, v0] = pts[i - 1], [t1, v1] = pts[i]; return v0 + (v1 - v0) * (t - t0) / (t1 - t0 || 1); } return pts[pts.length - 1][1]; }; }
/** add a mono buffer into the stereo mix at time t0 with gain and pan (-1..1) */
function mix(buf, t0, gain = 1, pan = 0) {
  const s0 = S(t0), gl = gain * Math.cos((pan + 1) * Math.PI / 4) * Math.SQRT2, gr = gain * Math.sin((pan + 1) * Math.PI / 4) * Math.SQRT2;
  for (let i = 0; i < buf.length; i++) { const j = s0 + i; if (j < 0 || j >= N) continue; L[j] += buf[i] * gl; R[j] += buf[i] * gr; }
}
const buf = sec => new Float32Array(Math.max(1, Math.round(sec * SR)));
function noise(len, seed) { const r = rng(seed), b = buf(len); for (let i = 0; i < b.length; i++) b[i] = r() * 2 - 1; return b; }
function brown(len, seed) { const r = rng(seed), b = buf(len); let v = 0; for (let i = 0; i < b.length; i++) { v = (v + (r() * 2 - 1) * 0.02) * 0.998; b[i] = v * 8; } return b; }
/** RBJ biquad, in place. type: lp | hp | bp | peak. f may be a function of sample index */
function biquad(x, type, f, Q = 0.707, gainDb = 0) {
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0, b0, b1, b2, a1, a2, lastF = -1;
  const fn = typeof f === 'function' ? f : () => f;
  for (let i = 0; i < x.length; i++) {
    const fc = Math.min(SR * 0.45, Math.max(10, fn(i)));
    if ((i & 31) === 0 || lastF < 0) if (Math.abs(fc - lastF) > 0.5) {
      lastF = fc; const w = TAU * fc / SR, c = Math.cos(w), s = Math.sin(w), al = s / (2 * Q), A = Math.pow(10, gainDb / 40);
      let B0, B1, B2, A0, A1, A2;
      if (type === 'lp') { B0 = (1 - c) / 2; B1 = 1 - c; B2 = (1 - c) / 2; A0 = 1 + al; A1 = -2 * c; A2 = 1 - al; }
      else if (type === 'hp') { B0 = (1 + c) / 2; B1 = -(1 + c); B2 = (1 + c) / 2; A0 = 1 + al; A1 = -2 * c; A2 = 1 - al; }
      else if (type === 'bp') { B0 = al; B1 = 0; B2 = -al; A0 = 1 + al; A1 = -2 * c; A2 = 1 - al; }
      else { B0 = 1 + al * A; B1 = -2 * c; B2 = 1 - al * A; A0 = 1 + al / A; A1 = -2 * c; A2 = 1 - al / A; }
      b0 = B0 / A0; b1 = B1 / A0; b2 = B2 / A0; a1 = A1 / A0; a2 = A2 / A0;
    }
    const y = b0 * x[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
    x2 = x1; x1 = x[i]; y2 = y1; y1 = y; x[i] = y;
  }
  return x;
}
function shape(b, fn) { for (let i = 0; i < b.length; i++) b[i] *= fn(i / SR, i); return b; }
const expDecay = (k, att = 0.002) => t => (t < att ? t / att : Math.exp(-(t - att) * k));
function sines(len, partials, seed = 1) {   // partials: [freq, amp, decay]
  const b = buf(len), r = rng(seed);
  for (const [f, a, d] of partials) { const ph = r() * TAU; for (let i = 0; i < b.length; i++) { const t = i / SR; b[i] += a * Math.sin(TAU * f * t + ph) * Math.exp(-t * d); } }
  return b;
}
function echo(b, delay, fb, wet) { const d = S(delay), out = new Float32Array(b.length + d * 6); out.set(b); for (let i = d; i < out.length; i++) out[i] += out[i - d] * fb * (i - d < b.length ? 1 : 1); for (let i = 0; i < out.length; i++) out[i] = (i < b.length ? b[i] * (1 - wet) : 0) + out[i] * wet; return out; }

/* ---------- sections ---------- */
const inLab = t => (t < CUE.s2a || (t >= CUE.s3a && t < CUE.s3b) || t >= CUE.loop);

/* rain bed (0–55): bright outside, muffled inside the lab, silent for a beat after the explosion */
{
  const rainG = env([[0, 0.55], [CUE.s3b - 0.02, 0.55], [CUE.s3b, 0], [CUE.s3b + 0.55, 0], [CUE.s3b + 1.6, 1], [CUE.collapse[0], 1], [CUE.s6 - 0.01, 1], [CUE.s6, 0.55], [CUE.loop - 0.01, 0.55], [CUE.loop, 0.5], [DUR, 0.55]]);
  for (const [ch, seed] of [[0, 11], [1, 12]]) {
    const hi = biquad(biquad(noise(DUR, seed), 'hp', 500), 'lp', 7000);
    const lo = biquad(noise(DUR, seed + 5), 'lp', 900);
    const r = rng(seed + 9);
    for (let k = 0; k < DUR * 45; k++) { const s0 = Math.floor(r() * N), a = 0.2 + r() * 0.6, f = 2500 + r() * 3500; for (let i = 0; i < 240 && s0 + i < N; i++) hi[s0 + i] += a * Math.sin(TAU * f * i / SR) * Math.exp(-i / 40); }
    const out = ch ? R : L;
    for (let i = 0; i < N; i++) { const t = i / SR, inside = inLab(t) ? 1 : 0; out[i] += rainG(t) * (inside ? lo[i] * 0.55 : hi[i] * 0.35 + lo[i] * 0.12); }
  }
}
/* lab hum: mains buzz + deep machine rumble (scene 1 and the loop tail) */
function labHum(t0, t1, gain, seed) {
  const len = t1 - t0, b = buf(len), r = rng(seed);
  for (let i = 0; i < b.length; i++) { const t = i / SR, g = t0 + t; b[i] = 0.5 * Math.sin(TAU * 50 * g) + 0.25 * Math.sin(TAU * 100 * g + 1) + 0.12 * Math.sin(TAU * 150 * g) + 0.08 * Math.sin(TAU * 200 * g + 2) + 0.6 * Math.sin(TAU * 38 * g) * (0.7 + 0.3 * Math.sin(TAU * 0.4 * g)) + 0.35 * Math.sin(TAU * 57 * g); b[i] += (r() * 2 - 1) * 0.05; }
  mix(shape(b, (t) => clamp(t / 0.05) * clamp((len - t) / 0.05)), t0, gain);
}
labHum(0, CUE.s2a + 0.25, 0.42, 1);
labHum(CUE.loop - 0.05, DUR, 0.42, 1);   // same phase as the start (global time), so the loop joins
labHum(CUE.s3a - 0.4, CUE.s3b, 0.22, 2);

/* crackles (sparks) */
function crackle(len, density, seed, hp = 1800) {
  const b = buf(len), r = rng(seed);
  for (let k = 0; k < len * density; k++) { const s0 = Math.floor(r() * b.length), a = (r() * 2 - 1) * (0.3 + r()), d = 8 + r() * 60; for (let i = 0; i < 400 && s0 + i < b.length; i++) b[s0 + i] += a * Math.exp(-i / d) * (r() * 2 - 1); }
  return biquad(b, 'hp', hp);
}
function sparkSfx(t0, gain, pan, seed, len = 0.45) { mix(shape(crackle(len, 260, seed), expDecay(5, 0.005)), t0, gain, pan); }
CUE.labSparks.forEach((t, i) => sparkSfx(t, 0.75, [0.4, -0.5, -0.3][i], 20 + i));
mix(shape(crackle(4, 6, 29), () => 1), 0, 0.25, -0.2);               // sparse background crackle in the lab

/* fire crackle + roar */
function fireSfx(t0, t1, gEnv, seed) {
  const len = t1 - t0, roar = biquad(brown(len, seed), 'lp', 420), pops = crackle(len, 26, seed + 1, 1200);
  const b = buf(len); for (let i = 0; i < b.length; i++) b[i] = (roar[i] * 0.5 + pops[i] * 0.8) * gEnv(t0 + i / SR);
  mix(b, t0, 1, 0.25);
}
fireSfx(CUE.s2a, CUE.s2b, env([[CUE.s2a, 0], [CUE.s2a + 0.6, 0.12], [CUE.s2b, 0.2]]), 40);           // embers on the photo
fireSfx(CUE.s2b, CUE.s3a, env([[CUE.s2b - 0.5, 0.2], [CUE.s2b + 0.6, 0.55], [CUE.s3a - 0.4, 0.55], [CUE.s3a, 0]]), 41);
fireSfx(CUE.fwoosh, CUE.s6, env([[CUE.fwoosh, 0.2], [CUE.s5 + 3, 0.3], [CUE.s5 + 3.05, 0.4], [CUE.collapse[0], 0.62], [CUE.s6, 0.62]]), 42);

/* distant siren (flashback): wailing, filtered, with a slap echo */
{
  const t0 = CUE.s2b - 0.3, len = CUE.s3a - t0, b = buf(len); let ph = 0;
  for (let i = 0; i < b.length; i++) { const t = i / SR, f = 640 * Math.pow(950 / 640, 0.5 - 0.5 * Math.cos(TAU * t / 3.4)); ph += TAU * f / SR; b[i] = Math.sin(ph) + 0.3 * Math.sin(2 * ph); }
  biquad(b, 'lp', 1800); biquad(b, 'hp', 300);
  shape(b, t => clamp(t / 1.2) * clamp((len - t) / 0.4) * (0.75 + 0.25 * Math.sin(TAU * 0.13 * t)));
  mix(echo(b, 0.23, 0.35, 0.4), t0, 0.07, -0.55);
}
/* thunder (once) */
{
  const t0 = CUE.thunder + 0.12, len = 4.2, crack = shape(biquad(noise(0.25, 51), 'hp', 900), expDecay(18, 0.004));
  const roll = biquad(brown(len, 52), 'lp', 160); shape(roll, t => clamp(t / 0.12) * Math.exp(-t * 0.9) * (0.7 + 0.3 * Math.sin(TAU * 1.7 * t) * Math.sin(TAU * 0.6 * t)));
  mix(crack, t0, 0.35, 0.3); mix(roll, t0 + 0.05, 0.9, 0.1);
}

/* the lever: grab squeak, heavy metal CLANK */
mix(shape(biquad(noise(0.5, 60), 'bp', i => 900 + i / SR * 1400, 6), t => Math.sin(Math.PI * clamp(t / 0.5))), CUE.leverGrab + 0.35, 0.12, -0.3);
{
  const k = sines(1.6, [[176, 0.6, 3], [412, 0.5, 4.5], [663, 0.45, 5], [977, 0.35, 7], [1342, 0.3, 9], [2210, 0.2, 12], [3120, 0.12, 18]], 61);
  const click = shape(biquad(noise(0.08, 62), 'hp', 1500), expDecay(60)), thump = sines(0.4, [[58, 1, 12]], 63);
  mix(k, CUE.clank, 0.38, -0.25); mix(click, CUE.clank, 0.5, -0.25); mix(thump, CUE.clank, 0.7, 0);
}
/* rising electric hum + arcs, then the whoosh + explosion, then sudden silence */
{
  const t0 = CUE.clank + 0.05, t1 = CUE.flash, len = t1 - t0, b = buf(len); let p1 = 0, p2 = 0, p3 = 0;
  for (let i = 0; i < b.length; i++) {
    const u = i / b.length, f = 55 * Math.pow(4.2, u), wf = 700 * Math.pow(4.5, u);
    p1 += f / SR; p2 += f * 1.007 / SR; p3 += TAU * wf / SR;
    b[i] = ((p1 % 1) * 2 - 1) * 0.5 + ((p2 % 1) * 2 - 1) * 0.5 + 0.15 * Math.sin(p3) * u;
  }
  biquad(b, 'lp', i => 300 + 5500 * Math.pow(i / b.length, 1.6), 1.2);
  shape(b, t => Math.pow(t / len, 1.5) * (0.85 + 0.15 * Math.sin(TAU * 7 * t)));
  mix(b, t0, 0.4, 0);
  const arcs = shape(crackle(len, 80, 71, 2500), t => Math.pow(t / len, 2)); mix(arcs, t0, 0.5, 0.2);
  // reverse-swell whoosh into the flash
  const wl = 0.9, w = biquad(noise(wl, 72), 'bp', i => 200 * Math.pow(30, i / (wl * SR)), 1.4);
  shape(w, t => Math.pow(t / wl, 2.2)); mix(w, t1 - wl, 0.9, 0);
  // explosion: crack + body + sub, cut short into silence
  const ex = 0.45, crack = shape(biquad(noise(ex, 73), 'lp', 2500), expDecay(7, 0.003)), sub = sines(ex, [[42, 1, 4], [63, 0.5, 6]], 74);
  const cut = t => clamp((ex - t) / 0.05);
  mix(shape(crack, cut), t1, 1.0, 0); mix(shape(sub, cut), t1, 0.9, 0);
}

/* running on the wet pavement */
function wetStep(t, g, pan, seed) {
  mix(shape(sines(0.12, [[95, 1, 35], [140, 0.5, 40]], seed), () => 1), t, g * 0.5, pan);
  mix(shape(biquad(noise(0.2, seed), 'bp', 2600, 0.8), expDecay(22, 0.003)), t + 0.005, g * 0.55, pan);
}
CUE.runSteps.forEach((t, i) => wetStep(t, 0.5, -0.3 + 0.6 * (t - CUE.run.t0) / 4, 100 + i));
[30.6, 30.88, 31.2].forEach((t, i) => wetStep(t, 0.45 - i * 0.1, 0, 130 + i));
/* the device: beeps faster and higher, a whine that climbs to the shock wave */
CUE.beeps.forEach((t, i) => { const f = (t - CUE.beeps[0]) / (CUE.wave - CUE.beeps[0]), fr = 1900 + 1500 * f; mix(shape(sines(0.07, [[fr, 1, 0], [fr * 2, 0.15, 0]], 140 + i), t => clamp(t / 0.004) * clamp((0.07 - t) / 0.01)), t, 0.07 + 0.08 * f, 0.15); });
{
  const t0 = CUE.s4, len = CUE.wave + 0.1 - t0, b = buf(len); let ph = 0;
  for (let i = 0; i < b.length; i++) { const u = i / b.length, f = 2600 + 2400 * u * u + 40 * Math.sin(TAU * 6 * i / SR); ph += TAU * f / SR; b[i] = Math.sin(ph) * Math.pow(u, 2.2); }
  mix(b, t0, 0.05, 0.1);
}
/* street lamps die: bzzt + pop */
CUE.lampsOff.forEach((t, i) => {
  const len = 0.6, b = buf(len), r = rng(160 + i);
  for (let k = 0; k < b.length; k++) { const tt = k / SR, on = Math.sin(TAU * 9 * tt + r() * 0.2) > -0.2 && tt < 0.5 ? 1 : 0; b[k] = on * (((tt * 120) % 1) < 0.5 ? 0.6 : -0.6) * (0.6 + 0.4 * Math.sin(TAU * 240 * tt)); }
  biquad(b, 'bp', 900, 0.7); shape(b, tt => clamp((0.55 - tt) / 0.05));
  mix(b, t - 0.25, 0.2, -0.5 + i * 0.4);
  mix(shape(biquad(noise(0.06, 170 + i), 'hp', 2000), expDecay(60)), t + 0.25, 0.3, -0.5 + i * 0.4);
});
/* door bell: ding (dong is swallowed by the shock wave) */
mix(sines(1.4, [[659, 0.6, 2.5], [659 * 2.76, 0.2, 5], [659 * 5.4, 0.08, 9]], 180), CUE.bell, 0.3, 0.3);
mix(shape(sines(1.2, [[523, 0.6, 3], [523 * 2.76, 0.2, 6]], 181), t => 0.5), CUE.bell + 0.42, 0.18, 0.3);
/* shock wave: falling electric sweep + crackle */
{
  const len = 0.9, b = buf(len); let ph = 0;
  for (let i = 0; i < b.length; i++) { const u = i / b.length, f = 1400 * Math.pow(0.05, u); ph += TAU * f / SR; b[i] = Math.sin(ph) * Math.exp(-u * 3); }
  mix(b, CUE.wave, 0.4, 0); mix(shape(crackle(len, 300, 191, 2000), expDecay(4)), CUE.wave, 0.45, 0);
  mix(shape(biquad(noise(len, 192), 'lp', 600), expDecay(4, 0.01)), CUE.wave, 0.5, 0);
}
/* light bulbs burst, floor by floor (three windows each) + glass */
function bulbPop(t, g, pan, seed) {
  mix(shape(biquad(noise(0.08, seed), 'hp', 1800), expDecay(70, 0.001)), t, g, pan);
  mix(sines(0.35, Array.from({ length: 6 }, (_, k) => [3000 + rng(seed + k)() * 4500, 0.15, 10 + k * 3]), seed + 9), t + 0.01, g * 0.5, pan);
}
CUE.bursts.forEach((t, f) => { for (let c = 0; c < 3; c++) bulbPop(t + c * 0.03, 0.42, (c - 1) * 0.45, 200 + f * 3 + c); mix(sines(0.3, [[70, 1, 14]], 230 + f), t, 0.35, 0); });
CUE.upperBursts.forEach((t, i) => bulbPop(t, 0.5, 0.1, 240 + i));
CUE.devSparks4.forEach((t, i) => sparkSfx(t, 0.45, 0.1, 250 + i, 0.35));
/* socket sparks, the curtain catches: fuuş */
CUE.socketSparks.forEach((t, i) => sparkSfx(t, 0.4, -0.35, 260 + i, 0.3));
{
  const len = 1.1, w = biquad(noise(len, 270), 'lp', i => 250 + 3200 * clamp(i / (0.45 * SR)), 0.9);
  shape(w, t => clamp(t / 0.35) * Math.exp(-Math.max(0, t - 0.35) * 2.5)); mix(w, CUE.fwoosh - 0.05, 0.75, 0.2);
  mix(shape(biquad(brown(len, 271), 'lp', 200), t => clamp(t / 0.3) * Math.exp(-t * 1.5)), CUE.fwoosh, 0.6, 0.2);
}
CUE.devSparks5.forEach((t, i) => sparkSfx(t, 0.4, 0, 280 + i, 0.35));
/* knees hit the wet street (muffled by the master filter below) */
mix(sines(0.3, [[80, 1, 12], [120, 0.4, 16]], 290), CUE.collapse[1] - 0.1, 0.6, 0);

/* low tension drone (very quiet, one note) from the run to the fall */
{
  const t0 = CUE.s4, t1 = CUE.s6, len = t1 - t0, b = buf(len);
  for (let i = 0; i < b.length; i++) { const g = t0 + i / SR; b[i] = Math.sin(TAU * 55 * g) * 0.6 + Math.sin(TAU * 82.4 * g) * 0.25 * (0.6 + 0.4 * Math.sin(TAU * 0.11 * g)); }
  shape(b, t => clamp(t / 3) * clamp((len - t) / 0.4)); mix(b, t0, 0.06, 0);
}

/* MASTER muffle during the slow-motion fall: everything sinks under water, then the morning cuts in clean */
{
  const a = S(CUE.collapse[0] - 0.2), b = S(CUE.s6);
  for (const ch of [L, R]) {
    const seg = ch.slice(a, b);
    biquad(seg, 'lp', i => 9000 * Math.pow(350 / 9000, clamp(i / (0.9 * SR))), 0.9);
    biquad(seg, 'lp', i => 9000 * Math.pow(350 / 9000, clamp(i / (0.9 * SR))), 0.9);
    for (let i = 0; i < seg.length; i++) ch[a + i] = seg[i] * 0.85;
  }
}

/* morning: soft wind, steps on ash, the watch, the ticking that grows */
{
  const t0 = CUE.s6, len = CUE.loop - t0;
  for (const [pan, seed] of [[-0.4, 300], [0.4, 301]]) { const w = biquad(noise(len, seed), 'bp', i => 380 + 120 * Math.sin(TAU * 0.17 * i / SR + seed), 0.6); shape(w, t => clamp(t / 0.3) * (0.5 + 0.5 * Math.sin(TAU * 0.23 * t + seed)) * clamp((len - t) / 0.3)); mix(w, t0, 0.75, pan); }
}
function ashStep(t, g, seed) {
  const b = buf(0.18), r = rng(seed);
  for (let k = 0; k < 14; k++) { const s0 = Math.floor(r() * 0.12 * SR), a = (r() * 2 - 1); for (let i = 0; i < 300 && s0 + i < b.length; i++) b[s0 + i] += a * Math.exp(-i / 25) * (r() * 2 - 1); }
  biquad(b, 'bp', 2400, 0.7);
  mix(b, t, g, -0.1); mix(sines(0.12, [[110, 1, 30]], seed + 1), t, g * 0.4, 0);
}
CUE.walkSteps.forEach((t, i) => ashStep(t, 0.9, 320 + i));
mix(sines(0.6, [[2480, 0.5, 9], [4120, 0.3, 14], [5900, 0.15, 20]], 340), CUE.pickup + 0.05, 0.12, 0.1);
CUE.ticks.forEach((t, i) => {
  const u = (t - CUE.tickFrom) / (CUE.finalTik - CUE.tickFrom), f = i % 2 ? 2300 : 3100;
  const b = biquad(shape(noise(0.03, 350 + i), expDecay(400)), 'bp', f, 8);
  mix(b, t, 0.45 + 2.2 * Math.pow(u, 1.6), 0);
});
// lab hum creeps back under the last ticks so the loop's first frame continues it (see labHum above)
// the final TIK — on the very last frame — then the sound stops
{
  const t = CUE.finalTik, len = DUR - t, b = biquad(shape(noise(len, 399), expDecay(120, 0.0005)), 'bp', 2800, 5);
  const body = sines(len, [[1400, 0.6, 60], [180, 0.5, 40]], 398);
  for (let i = 0; i < b.length; i++) b[i] = b[i] * 3 + body[i];
  mix(b, t, 1.0, 0);
}

/* ---------- master: loudness to -22 LUFS, peak limit -6 dBFS, hard end ---------- */
function writeWav(path, l, r, bits = 24) {
  const n = l.length, bps = bits / 8, data = Buffer.alloc(n * 2 * bps), mx = Math.pow(2, bits - 1) - 1;
  for (let i = 0; i < n; i++) for (const [c, ch] of [[0, l], [1, r]]) { const v = Math.round(clamp(ch[i], -1, 1) * mx), o = (i * 2 + c) * bps; if (bits === 24) data.writeIntLE(v, o, 3); else data.writeInt16LE(v, o); }
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + data.length, 4); h.write('WAVE', 8); h.write('fmt ', 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(2, 22);
  h.writeUInt32LE(SR, 24); h.writeUInt32LE(SR * 2 * bps, 28); h.writeUInt16LE(2 * bps, 32); h.writeUInt16LE(bits, 34); h.write('data', 36); h.writeUInt32LE(data.length, 40);
  writeFileSync(path, Buffer.concat([h, data]));
}
function measure(path) {
  const o = execFileSync('ffmpeg', ['-hide_banner', '-nostats', '-i', path, '-af', 'ebur128=peak=true', '-f', 'null', '-'], { stdio: ['ignore', 'pipe', 'pipe'] }).toString() + '';
  return o;
}
function lufs(path) {
  let err = '';
  try { execFileSync('ffmpeg', ['-hide_banner', '-nostats', '-i', path, '-af', 'ebur128=peak=true', '-f', 'null', '-'], { stdio: ['ignore', 'ignore', 'pipe'] }); } catch (e) { err = String(e.stderr); }
  const out = err || execFileSync('sh', ['-c', `ffmpeg -hide_banner -nostats -i "${path}" -af ebur128=peak=true -f null - 2>&1`]).toString();
  const I = +(/I:\s+(-?[\d.]+) LUFS/.exec(out.split('Summary:').pop()) || [])[1], P = +(/Peak:\s+(-?[\d.]+) dBFS/.exec(out.split('Summary:').pop()) || [])[1];
  return { I, P };
}
const TARGET = -22, CEIL = db(-7.2);
const tmp = OUT.replace(/\.wav$/, '') + '.tmp.wav';
writeWav(tmp, L, R, 24);
const m0 = lufs(tmp), g = db(TARGET - m0.I);
for (const ch of [L, R]) for (let i = 0; i < N; i++) { let v = ch[i] * g; const a = Math.abs(v); if (a > CEIL * 0.7) v = Math.sign(v) * (CEIL * 0.7 + (CEIL * 0.3) * Math.tanh((a - CEIL * 0.7) / (CEIL * 0.3))); ch[i] = v; }
writeWav(OUT, L, R, 24);
execFileSync('rm', [tmp]);
const m1 = lufs(OUT);
console.log(`wrote ${OUT}: ${N} samples = ${(N / SR).toFixed(4)} s @ ${SR} Hz stereo 24-bit; integrated ${m1.I} LUFS, true peak ${m1.P} dBFS`);
