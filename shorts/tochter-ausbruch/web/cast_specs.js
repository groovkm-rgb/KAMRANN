// the cast for this story (invented cartoon characters)
const PINK = '#ff4f9a', JEANS = '#3d62a8', BLACK = '#17131c', OR = '#f08a24';
export const GIRL = { _id: 'GIRL', body: PINK, bw: 180, detail: ['donuts', 'jeans'], legs: JEANS, feet: '#8fd0f0', hair: BLACK, hairStyle: 'long', glasses: true, headScale: 0.98 };
export const DADFIT = { bw: 320, legW: 26, legGap: 62, neck: 124, headUp: 56, headScale: 0.98 };
export const DISG = { _id: 'DISG', ...DADFIT, body: PINK, detail: ['donuts', 'jeans', 'stretch'], legs: JEANS, feet: '#8fd0f0', hair: BLACK, hairStyle: 'long', glasses: true, mask: true,
  arm: { w: 38, bicep: true, sleeve: PINK, sleeveLen: 0.36 } };
export const BALD = { ...DISG, _id: 'BALD', hair: null, hairStyle: 'bald', glasses: false };         // wig off, mask still on
export const UNMASK = { ...BALD, _id: 'UNMASK', mask: false, hair: '#2a2228', hairStyle: 'short', stubble: true, browT: 14 }; // real face, donut tee
export const DAD = { _id: 'DAD', ...DADFIT, body: OR, detail: ['hstripes', 'collar'], legs: OR, feet: '#e8e2d6', hair: '#2a2228', hairStyle: 'short', stubble: true, browT: 14,
  arm: { w: 38, bicep: true, col: OR, cuff: '#f6f2ea' }, neckBody: null };
export const G1 = { _id: 'G1', body: '#8d95a0', bw: 215, detail: ['buttons', 'pocket', 'belt', 'keys'], legs: '#4a505c', hair: '#3a3038', hairStyle: 'sides', mous: '#3a3038', mousStyle: 'brush', browT: 11,
  hat: { type: 'police', color: '#6c7480', band: '#3c424c', noBadge: true } };
export const G2 = { _id: 'G2', body: '#8d95a0', bw: 262, detail: ['buttons', 'belt'], legs: '#4a505c', hair: '#b8763a', hairStyle: 'mop', headScale: 1.04, hat: { type: 'police', color: '#6c7480', band: '#3c424c', noBadge: true } };
export const G3 = { _id: 'G3', body: '#8d95a0', bw: 200, detail: ['pocket', 'belt'], legs: '#4a505c', hair: '#5a4630', hairStyle: 'short', hat: { type: 'police', color: '#6c7480', band: '#3c424c', noBadge: true } };
export const G4 = { _id: 'G4', body: '#8d95a0', bw: 190, detail: ['buttons', 'belt'], legs: '#4a505c', hair: '#c8a23a', hairStyle: 'bun' };
export const VIS = [
  { body: '#8a6ab0', robe: true, detail: [{ t: 'scarf', c: '#e8d0e0' }], hair: '#d8d8dc', hairStyle: 'bun', headScale: 0.95 },
  { body: '#3f8fd0', bw: 210, detail: ['pocket', 'jeans'], legs: JEANS, hair: '#6a4024', hairStyle: 'mop', mous: '#6a4024' },
  { body: '#e8c23a', bw: 160, detail: ['pocket'], legs: '#5a4a3a', hair: '#c8552a', hairStyle: 'side', headScale: 1.02 },
  { body: '#3a8a6a', bw: 230, detail: ['collar', 'buttons'], legs: '#3a3a44', hair: '#2a2228', hairStyle: 'sides', glasses: true, hat: { type: 'bowler', color: '#3a2e2a' } },
  { body: '#d85a3a', bw: 190, detail: [{ t: 'scarf', c: '#f2e6c8' }], legs: '#4a4458', hair: '#3a2a22', hairStyle: 'bun' },
  { body: '#5a6ac8', bw: 150, detail: ['pocket'], legs: '#3a3a44', hair: '#e0c060', hairStyle: 'mop', headScale: 1.08 },
];
export const CON = (i) => ({ ...DADFIT, _id: 'con' + i, bw: [220, 260, 190, 240][i % 4], neck: 0, headUp: 0, legGap: 40, legW: 12, body: OR, detail: ['hstripes', 'mud'], legs: '#8a5a2a', mudHead: true,
  hair: ['#6a4024', '#2a2228', '#b8763a', '#8a8a92'][i % 4], hairStyle: ['mop', 'short', 'side', 'sides'][i % 4], mous: i % 3 === 1 ? '#2a2228' : null, beard: i % 4 === 3 ? '#8a8a92' : null });
VIS.forEach((v, i) => { v._id = 'vis' + i; });
export const DADMUD = { ...DAD, _id: 'DADMUD', detail: ['hstripes', 'collar', 'mud'], mudHead: true };
