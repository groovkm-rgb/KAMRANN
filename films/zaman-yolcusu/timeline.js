/* =====================================================================
   ZAMAN YOLCUSU · shared event timeline (global seconds).
   Used by the picture (scenes.js) AND by the sound design (sfx.mjs), so
   every spark, step, beep and pop lands on the frame that shows it.
   ===================================================================== */
const CUE = (() => {
  const C = {
    // shot boundaries (the narrator's timing — do not move)
    s1: 0, s2a: 4, s2b: 5.5, s3a: 14, s3b: 20, s4: 24, s5: 38, s6: 48, loop: 54.5, end: 55,
    labSparks: [0.9, 2.25, 3.35],
    thunder: 8.5,
    leverGrab: 14.6, clank: 15.35, flash: 20.0, whiteFrames: 9,
    run: { t0: 24, t1: 28, omega: 10, x0: -760, x1: 470 },
    lamps: [-480, -140, 200],                        // world x of the street lamps he runs past
    bell: 32.95, wave: 33.05,
    bursts: [33.9, 34.15, 34.4, 34.65, 34.9],        // floor 0..4 lights explode, bottom to top
    upperBursts: [36.75, 36.95],
    devSparks4: [37.35, 37.6, 37.82],
    socketSparks: [38.2, 38.6, 39.0, 39.15], fwoosh: 39.2,
    devSparks5: [44.2, 44.7, 45.1],
    collapse: [45.8, 47.6],                          // slow-motion fall to the knees
    walk6: { t0: 48, t1: 50.3, omega: 6 },
    pickup: 51.8,
    tickFrom: 49.4, finalTik: 55 - 1 / 24,
  };
  // footstep times: a foot strikes whenever the walk phase passes a multiple of π
  const steps = (w) => { const out = []; for (let k = 1; ; k++) { const t = w.t0 + (k * Math.PI) / w.omega; if (t > w.t1) break; out.push(+t.toFixed(4)); } return out; };
  C.runSteps = steps(C.run);
  C.walkSteps = steps(C.walk6);
  // a lamp dies the moment he runs past it
  C.lampsOff = C.lamps.map(x => +(C.run.t0 + (x - C.run.x0) / (C.run.x1 - C.run.x0) * (C.run.t1 - C.run.t0)).toFixed(4));
  // device beeps: slow at first, faster and faster until the shock wave
  C.beeps = []; for (let t = 24.35; t < 32.9;) { C.beeps.push(+t.toFixed(4)); const f = (t - 24.35) / (32.9 - 24.35); t += 0.62 - 0.52 * Math.pow(f, 1.3); }
  // clock ticks in the last shot (every half second, on the beat), final TIK on the very last frame
  C.ticks = []; for (let t = C.tickFrom; t < C.finalTik - 0.2; t += 0.5) C.ticks.push(+t.toFixed(4));
  return C;
})();
/** brightness pulse of the device for each beep (0..1) */
function beepPulse(g) { let v = 0; for (const b of CUE.beeps) { const d = g - b; if (d >= 0 && d < 0.18) v = Math.max(v, 1 - d / 0.18); } return v; }
