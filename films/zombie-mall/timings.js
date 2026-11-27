// Shared timeline (video seconds). Read by scene.js AND by audio/mix.py (the JSON between the markers), so picture and sound stay in sync.
// Voice-over: MP3 starts at VO_OFFSET; after the source time GAP_AT the VO is pushed GAP later (1 s silent beat after "Wenn er kommt.").
const TIMING = /*JSON*/{
  "duration": 28.4,
  "vo_offset": 0.6, "gap_at": 21.8, "gap": 0.48, "vo_cut": 26.62,
  "shots": { "s1": 0, "s2": 3.1, "crack": 7.55, "s3": 8.55, "s4": 14.5, "s5": 23.1, "rewind": 25.62, "day": 27.5 },
  "type_text": "TAG 30 · 03:00 UHR", "type_start": 0.62, "type_step": 0.085,
  "knack": 7.62,
  "torch_flicker": [[17.02, 17.12], [17.3, 17.44]], "torch_dim": 17.6,
  "look_up": 18.3, "tilt": [18.7, 21.0],
  "silence": [22.16, 23.2],
  "hazard_period": 0.84,
  "neon_glitch": [[0.35, 0.5], [0.95, 1.02], [1.6, 1.9], [2.3, 2.36], [2.75, 2.95]]
}/*END*/;
