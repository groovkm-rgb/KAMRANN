// Shared world coordinates for "The Lighthouse Keeper" (metres, sea level y = 0).
export const CLIFF = 16;                 // headland top
export const SEABED = -16;
export const TOWER_H = 17;               // tower body
export const GAL = CLIFF + TOWER_H;      // gallery floor (33)
export const LAMP = [0, GAL + 1.55, 0];  // lens centre
export const QUAY = 1.6;                 // village quay height
// village quay: villagers stand here and look across the bay at the tower
export const VIL = [-58, QUAY, 44];
// interior set (stairwell + watch room), far away and only visible in the interior shots
export const INT = [400, 300, 0];
export const STAIR_H = 12, ROOM_R = 2.6, STEP_N = 54, STEP_DA = 20, STEP_A_END = 0; // degrees
export const stepPos = (i, r = 1.55) => {
  const a = (STEP_A_END - (STEP_N - 1 - i) * STEP_DA) * Math.PI / 180;
  return [INT[0] + Math.cos(a) * r, INT[1] + (i + 1) * (STAIR_H / STEP_N), INT[2] + Math.sin(a) * r];
};
// watch-room table (opposite the stair opening) and the book on it
export const TABLE = [INT[0] - 1.05, INT[1] + STAIR_H, INT[2] + 0.35];
export const TABLE_TOP = TABLE[1] + 0.78;
export const BOOK = [TABLE[0] + 0.02, TABLE_TOP, TABLE[2] - 0.02];
export const CANDLE = [TABLE[0] - 0.28, TABLE_TOP, TABLE[2] - 0.3];
