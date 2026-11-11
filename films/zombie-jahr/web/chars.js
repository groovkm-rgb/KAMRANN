// chars.js — THE character sheet in code. Every shot draws its people from these specs only.
// Main character: late 20s, short brown hair, blue hoodie, grey joggers, plaid slippers.
// Allowed changes over time (driven only by the story day): stubble -> beard -> belly beard, hair length,
// clothes wear/stains, blanket in winter (per shot), slimmer + stronger arms from month 9.

// story day per frame (piecewise linear, anchored on the voice-over sections)
const DAY_KEYS = [[0, 1], [1056, 2], [2240, 7], [2432, 21], [4006, 35], [4600, 75], [5442, 150], [5800, 240], [6572, 270], [6800, 330], [7049, 364], [7110, 365]];
export const dayAt = (f) => {
  if (f <= DAY_KEYS[0][0]) return DAY_KEYS[0][1];
  for (let i = 0; i < DAY_KEYS.length - 1; i++) { const [a, da] = DAY_KEYS[i], [b, db] = DAY_KEYS[i + 1]; if (f < b) return da + (db - da) * (f - a) / (b - a); }
  return 365;
};
const cl = (x) => Math.max(0, Math.min(1, x));
const r2 = (x, n = 20) => Math.round(x * n) / n;

export const HERO_BASE = {
  body: '#3a78c8', bw: 212, detail: ['hoodie'], sleeve: '#3a78c8',
  legs: '#a2a2ac', legW: 30, cuff: true, shoes: { c: '#c0353c' },
  hair: '#7a4a26', hairStyle: 'short', beard: '#7a4a26', seed: 5,
};
/** the hero for a given story day */
export const heroSpec = (day) => {
  const stubble = r2(cl((day - 18) / 60));              // Monat 3 (~day 75): full stubble
  const beardLen = day < 95 ? 0 : day < 240 ? r2(10 + 95 * (day - 95) / 145, 1) : r2(105 + 140 * cl((day - 240) / 125), 1); // Monat 8 long, Tag 365 to the belly
  const hairLong = r2(cl((day - 110) / 255));            // Tag 365: long messy hair
  const fit = day >= 270;                                 // from month 9: slimmer and stronger
  return {
    ...HERO_BASE, bw: fit ? 186 : 212, armW: fit ? 11.5 : 7.5,
    stubble, beardLen, mous: beardLen > 0 ? HERO_BASE.beard : undefined, mousStyle: 'brush', hairLong,
    hairStyle: hairLong > 0.3 ? 'mop' : 'short', wear: r2(cl(day / 330), 10),
  };
};
export const SCHMIDT = { body: '#7a4aa0', robe: true, bw: 226, detail: ['cardigan'], hair: '#c9c9cf', hairStyle: 'bun', seed: 8 };
export const GUENTHER = { body: '#d6c294', robe: true, bw: 214, detail: ['raincoat'], hair: '#a0a0a8', hairStyle: 'sides', mous: '#a0a0a8', seed: 11,
  hat: { type: 'flatcap', color: '#6e6452', stripes: '#867c66' } };
// Günther's walk: always hunched, slow, moaning. Same posture every time.
export const GUENTHER_POSE = { hunch: 0.75, expr: 'tired', L: { x: 250, y: 600, b: 0.4 }, R: { x: 380, y: 610, b: 0.4 } };
export const ZOMBIES = [
  { headCol: '#b8d898', body: '#8a5a9a', detail: ['torn'], legs: '#4a4a6a', legW: 16, hair: '#4a3a2a', hairStyle: 'mop', seed: 21 },
  { headCol: '#a8d0a0', body: '#d06a3a', detail: ['torn', 'straps'], legs: '#3a5a3a', legW: 16, hairStyle: 'bald', seed: 22 },
  { headCol: '#c2dc9c', body: '#f0f0ea', detail: ['collar', 'tie', 'torn'], legs: '#2a2a3a', legW: 16, hair: '#2a2228', hairStyle: 'side', seed: 23 },
];
export const ZOMBIE_POSE = (f, i = 0) => ({ expr: i % 2 ? 'zgrin' : 'zombie', hunch: 0.25, L: { x: 470, y: 440, b: 0.3 }, R: { x: 545, y: 455, b: 0.3 }, legs: 'walk', step: ((f + i * 7) % 26) / 26, tilt: Math.round(5 * Math.sin(f * 0.15 + i) * 10) / 10 });
export const POSTMAN = { body: '#f2c43a', detail: ['buttons', 'pocket', 'belt'], legs: '#2e3a6a', legW: 16, hair: '#3a2a22', hairStyle: 'sides', mous: '#3a2a22', seed: 31,
  hat: { type: 'police', color: '#2e3a6a', band: '#f2c43a' } };
export const KID = { body: '#e85a8a', bw: 170, headScale: 1.05, detail: ['pocket'], legs: '#3a4a8a', legW: 14, shoes: { c: '#3aa0e0' }, hair: '#3a2a22', hairStyle: 'side', seed: 41 };
export const VANMAN = { body: '#ffffff', detail: [{ t: 'stripes', c: '#f48ab0' }], hair: '#2a2228', hairStyle: 'short', mous: '#2a2228', seed: 51, hat: { type: 'chef' } };
