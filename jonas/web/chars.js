// chars.js — THE character sheet (single source of truth). Every shot draws these exact specs.
// Jonas: 27, short black curly hair, light stubble, red tee, white apron "Alis Döner", jeans, white sneakers.
export const JONAS = { body: '#d8303a', bw: 205, detail: [{ t: 'apronW', text: 'Alis Döner' }], hair: '#18141c', hairStyle: 'curly', stubble: '#6a6070', legs: '#3b5f9e', shoes: '#ffffff', seed: 3 };
// allowed variants (face, hair, colours identical)
export const JONAS_LAB = { ...JONAS, body: '#8e9098', detail: ['hoodie'] };           // grey hoodie in the lab
export const JONAS_ROPE = { ...JONAS, detail: [...JONAS.detail, 'rope'] };          // steel rope round the waist (Tag 100)
export const JONAS_MEDAL = { ...JONAS, detail: [...JONAS.detail, 'medal'] };        // medal in the finale
export const MURAT = { body: '#3f8f5a', bw: 285, detail: ['belly', 'pocket'], hair: '#1e1a1c', hairStyle: 'short', hat: { type: 'cap', color: '#e0402e', band: '#b8301e', logo: '#ffffff', text: 'M' }, legs: '#4a4a5c', shoes: '#e04a3a', seed: 8 };
export const ALI = { body: '#bcd4ea', bw: 270, detail: [{ t: 'apron', c: '#ffffff' }, 'belly', { t: 'scarf', c: '#d03a34' }], hair: '#2e2420', hairStyle: 'sides', mous: '#2a1d1a', mousStyle: 'handle', legs: '#2b2733', shoes: '#3a2a22', seed: 5 };
export const PAPA = { body: '#efe4c8', bw: 215, detail: [{ t: 'cardigan', c: '#8a6440' }], hair: '#a9a9b2', hairStyle: 'short', glasses: true, legs: '#4a4a56', shoes: '#4a3020', seed: 11 };
export const MAMA = { body: '#f4e6d6', bw: 205, robe: true, detail: [{ t: 'cardigan', c: '#3f9a5a' }], hair: '#6a3a24', hairStyle: 'bob', shoes: '#6a3a2a', seed: 14 };
export const WEBER = { body: '#4c5c7c', bw: 200, robe: true, detail: ['labcoat'], hair: '#d8b070', hairStyle: 'bun', glasses: true, shoes: '#2a2a32', seed: 17 };
export const WEBER_MESSY = { ...WEBER, hairStyle: 'messy' };
// extras
export const GUARD = { body: '#f2f2f2', bw: 230, detail: [{ t: 'suit', c: '#1c1c24' }, { t: 'tie', c: '#14141a' }], hair: '#1a1a1a', hairStyle: 'short', shades: true, legs: '#1c1c24', shoes: '#14141a', seed: 21 };
export const HAZMAT = { body: '#f4f0dc', bw: 220, detail: ['buttons', { t: 'belt', c: '#e8b030' }], hat: { type: 'hood', color: '#f4f0dc' }, legs: '#f4f0dc', shoes: '#e8b030', seed: 23 };
export const BUSDRIVER = { body: '#3a5a9a', bw: 220, detail: ['buttons', 'badge', 'tie'], hair: '#3a2a20', hairStyle: 'sides', mous: '#3a2a20', hat: { type: 'police', color: '#2a3a6a', band: '#1c1a24' }, legs: '#2a3050', shoes: '#14141a', seed: 31 };
export const OPA = { body: '#c8b8a0', bw: 210, detail: [{ t: 'cardigan', c: '#7a6a5a' }], hair: '#f0f0f2', hairStyle: 'sides', mous: '#f0f0f2', legs: '#6a5a4a', shoes: '#b03a3a', seed: 33 };
export const ROBE = { body: '#8ac4ea', bw: 220, robe: true, detail: [{ t: 'belt', c: '#5a94c0' }, 'collar'], hair: '#7a4a2a', hairStyle: 'messy', toothbrush: true, shoes: '#f0f0f0', seed: 35 };
const WCOL = ['#e85a8a', '#f0a030', '#6a5ad0', '#30a0a0', '#e04a4a', '#4a8ae0', '#a0c040', '#c070c0', '#f07850', '#5ab0e0'];
const HCOL = ['#3a2418', '#d8a050', '#1a1416', '#a83a20', '#6a4a2a', '#e8d090', '#2a1a12', '#8a8a92'];
const HST = ['bob', 'long', 'bun', 'long', 'bob', 'short'];
/** deterministic woman #i of the crowds */
export const woman = (i) => ({ body: WCOL[i % WCOL.length], bw: 180 + (i * 37) % 50, robe: i % 3 !== 0, detail: [i % 2 ? 'collar' : { t: 'scarf', c: WCOL[(i + 3) % WCOL.length] }], hair: HCOL[(i * 3) % HCOL.length], hairStyle: HST[(i * 5) % HST.length], legs: i % 3 === 0 ? '#3a3a50' : null, shoes: '#3a2a2a', seed: 40 + i });
const MCOL = ['#4a7ab0', '#8a5a3a', '#5a8a4a', '#b04a3a', '#6a6a7a', '#c8a040', '#3a6a6a'];
/** deterministic man #i (returning men) */
export const man = (i) => ({ body: MCOL[i % MCOL.length], bw: 200 + (i * 29) % 70, detail: [i % 2 ? 'collar' : 'pocket', ...(i % 3 ? [] : ['belly'])], hair: HCOL[(i * 5 + 1) % HCOL.length], hairStyle: ['short', 'sides', 'mop', 'curly', 'short'][i % 5], mous: i % 4 === 1 ? HCOL[(i * 5 + 1) % HCOL.length] : null, hat: i % 6 === 2 ? { type: 'flatcap', color: '#5a5a6a', stripes: '#8a8a9a' } : null, legs: '#3a3a4a', shoes: '#2a2222', seed: 60 + i });
