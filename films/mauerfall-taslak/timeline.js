// Shared timeline (seconds) — the same numbers drive picture and sound (audio.py reads timeline.json).
// Shot cuts sit in the speech pauses found in the MP3 (silence detection, first 20 s).
const TL = {
  cuts: [0, 3.78, 5.80, 7.17, 8.36, 11.81, 13.45, 15.04, 16.91, 17.60, 18.33, 19.75, 20.0],
  flashes: [0.35, 0.95, 1.55, 2.30, 2.95, 4.20, 4.95, 6.30, 7.65],
  stamp: 7.40,               // "18:53" pops in, clock ticking starts
  freeze: 8.60,              // hall falls silent
  marker: [15.25, 16.45],    // red felt-tip writes "Offen!"
  hits: [16.98, 17.18, 17.38],
  tvoff: 19.75,
};
