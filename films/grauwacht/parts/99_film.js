// ------------------------------------------------------------------ the film (700.000 s exactly, voice-aligned)
const FILM_SCENES = SC.filter(Boolean);
FILM({ fps: 30, fadeIn: 1.0, fadeOut: 2.0, duration: 700, preload: false, autoSfx: false,
  music: { mood: 'mystery', gain: 1, seed: 7, perc: false }, scenes: FILM_SCENES });
