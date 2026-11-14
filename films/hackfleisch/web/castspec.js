// The story cast. Same spec objects in every shot so faces, hair and clothes never change.
export const GREEN = '#5b8f4e';
export const WOMAN = { body: '#b8607a', bw: 214, detail: [{ t: 'cardigan', c: '#f3e6d2' }, 'tape'], legs: '#4a3a48',
  hair: '#e8985a', hairStyle: 'curly', glasses: { c: '#4a2618' }, seed: 5 };
export const WOMAN_JAIL = { body: GREEN, bw: 214, detail: ['jcollar', 'zip', 'patch'], legs: GREEN,
  hair: '#e8985a', hairStyle: 'curly', glasses: { c: '#4a2618' }, seed: 5 };
export const CHARMEUR = { body: GREEN, bw: 206, detail: ['jcollar', 'zip', 'patch'], legs: GREEN,
  hair: '#2b2230', hairStyle: 'slick', sharp: true, jawK: 0.2, seed: 2 };
export const STILLE = { body: GREEN, bw: 160, detail: ['jcollar', 'zip', 'patch'], legs: GREEN, headScale: 0.94,
  hair: '#5a4634', hairStyle: 'buzz', goggles: 'up', jawK: 0.12, seed: 8 };
const GREY = '#7d858f';
export const GUARD = { body: GREY, bw: 252, detail: ['collar', 'buttons', 'pocket', { t: 'belt', c: '#2a2a30' }], legs: '#4a4e58',
  hair: '#3a2a24', hairStyle: 'short', mous: '#5a3a24', hat: { type: 'police', color: '#5d636c', band: '#3a3e44', badge: false }, seed: 11 };
export const GUARD2 = { body: GREY, bw: 162, detail: ['collar', 'buttons', { t: 'belt', c: '#2a2a30' }], legs: '#4a4e58',
  hair: '#c08848', hairStyle: 'side', hat: { type: 'police', color: '#5d636c', band: '#3a3e44', badge: false }, headScale: 0.96, seed: 13 };
export const POLICE = { body: '#2c3a5c', bw: 210, detail: ['polvest', { t: 'belt', c: '#14161c' }], legs: '#1c2234',
  hair: '#3a2a24', hairStyle: 'short', hat: { type: 'police', color: '#22305a', band: '#1a1c24' }, seed: 17 };
export const POLICE2 = { ...POLICE, hair: '#8a6a40', mous: '#8a6a40', seed: 19 };
export const WORKERS = [
  { body: GREEN, bw: 200, detail: ['jcollar', 'zip'], legs: GREEN, hair: '#6a4024', hairStyle: 'mop', seed: 21 },
  { body: GREEN, bw: 230, detail: ['jcollar', 'zip'], legs: GREEN, hairStyle: 'bald', mous: '#3a2a22', seed: 23 },
  { body: GREEN, bw: 190, detail: ['jcollar', 'zip'], legs: GREEN, hair: '#1e1a1c', hairStyle: 'short', seed: 25 },
];
