// World origins of every set (sets are far apart; only the active one is visible).
export const O = {
  ext: [0, 0, 0],          // prison exterior, town street, roadside (night)
  kit: [1000, 0, 0],       // M1 kitchen
  ws: [1100, 0, 0],        // M3 tailor workshop
  cells: [1200, 0, 0],     // M4/M7 cells, back passage, pipe
  cp: [1300, 0, 0],        // checkpoint
  ug: [1400, 0, 0],        // M5 underground
  car: [1500, 0, 0],       // M8 car interior
  hosp: [1600, 0, 0],      // M8 hospital entrance
  forest: [1800, 0, 0],    // M9 forest + M10 meadow
};
export const at = (set, p) => [O[set][0] + p[0], O[set][1] + p[1], O[set][2] + p[2]];
