// Shared layout of the island world (used by main.js to build it and story.js to stage shots).
// Sea level y=0, island meadow plateau ~G. All places invented; nothing here carries text or insignia.
export const G = 3;
export const P = {
  farm: [0, -2],            // the two homesteads, fence on x=0
  cabinA: [-10, -12], cabinB: [11, -12],
  barnA: [-22, 2], barnB: [14, 1], pen: [8.5, 7],
  field: [-16, -3, -4, 9],  // x0 x1 z0 z1 (farmer's potatoes)
  flagA: [-4.5, -6.5], flagB: [5, -6.5],
  knoll: [2, 40],           // centre meadow where the two flags are planted
  cove: [-55, 92],          // landing bay (beach at its north end)
  beach: [-55, 60],
  hill: [-46, 38],          // blue gun hill above the cove
  campA: [-95, 18],         // blue camp (west)
  campB: [100, -6],         // green camp (east)
  palace: [0, -400, 0],     // interior set, far below the world
};
const sstep = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const n2 = (x, z) => Math.sin(x * 0.071 + 1.3) * Math.cos(z * 0.083 - 0.7) + 0.5 * Math.sin(x * 0.17 - z * 0.13 + 2.1) + 0.25 * Math.cos(x * 0.31 + z * 0.29);
const gauss = (x, z, cx, cz, r) => Math.exp(-((x - cx) ** 2 + (z - cz) ** 2) / (2 * r * r));
/** island "elevation" field e: <0 sea, 0..1 land */
export const eAt = (x, z) => {
  let e = 1 - Math.sqrt((x / 152) ** 2 + (z / 96) ** 2) + 0.07 * n2(x, z);
  const c = 1 - Math.sqrt(((x - P.cove[0]) / 24) ** 2 + ((z - P.cove[1]) / 40) ** 2); if (c > 0) e -= c * 0.75;
  e += 0.05 * gauss(x, z, 60, 85, 25) - 0.06 * gauss(x, z, 130, 60, 22);
  return e;
};
const flat = (x, z) => Math.max(gauss(x, z, P.farm[0], P.farm[1], 20), gauss(x, z, P.campA[0], P.campA[1], 16), gauss(x, z, P.campB[0], P.campB[1], 18), gauss(x, z, P.beach[0], P.beach[1], 8));
/** terrain height */
export const hAt = (x, z) => {
  const e = eAt(x, z); let h;
  if (e < 0) h = Math.max(-9, -1.2 + e * 40);
  else {
    const coveSoft = gauss(x, z, P.cove[0], P.cove[1] - 30, 18);
    const shore = sstep(0, 0.035 + 0.12 * coveSoft, e);
    h = -1.2 + (G + 1.2) * shore;
    const inland = sstep(0.05, 0.3, e), fl = flat(x, z);
    h += inland * (1 - fl) * (1.6 * n2(x * 1.7, z * 1.7) + 1.2);
    h += 10 * gauss(x, z, P.hill[0], P.hill[1], 13) * (1 - gauss(x, z, P.beach[0], P.beach[1], 9));
    h += 7 * gauss(x, z, 112, -34, 16) + 6 * gauss(x, z, -20, -50, 22) + 2.2 * gauss(x, z, P.knoll[0], P.knoll[1], 9);
  }
  const wB = Math.exp(-(((x - P.beach[0]) / 15) ** 2) - (((z - P.beach[1] - 4) / 10) ** 2)), hb = Math.max(-4, 3.1 - Math.max(0, z - 54) * 0.3);
  return h + (hb - h) * wB;
};
export const forestAt = (x, z) => {
  const e = eAt(x, z); if (e < 0.04) return 0;
  const clear = Math.max(gauss(x, z, P.farm[0], P.farm[1], 26), gauss(x, z, P.campA[0], P.campA[1], 22), gauss(x, z, P.campB[0], P.campB[1], 24), gauss(x, z, P.knoll[0], P.knoll[1], 16), gauss(x, z, P.hill[0], P.hill[1], 14), gauss(x, z, P.beach[0], P.beach[1], 14), gauss(x, z, 0, 22, 16));
  return Math.max(0, (0.55 + 0.6 * n2(x * 0.8 + 40, z * 0.8)) * (1 - clear * 1.3));
};
