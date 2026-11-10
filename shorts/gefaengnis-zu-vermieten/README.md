# Gefängnis zu vermieten (vertical cartoon short)

1080x1920, 30 fps, 48.33 s (voice 47.83 s + 0.5 s tail), built with the `cartoon-short-kit` skill
(2D bean-head cards in an inked three.js world, rendered in headless Chromium).

- Voice-over: `voice.mp3` (supplied, used as is, nothing generated). Script: `script.txt` (German).
- Music bed + SFX are synthesized in `audio.py` and mixed under the voice (music about 21 dB under speech, ducked).
- No text, letters or digits anywhere in the picture; no flags, emblems or landmarks before the final shot;
  the Netherlands are only revealed in the last shot (tulip fields, windmills, canals, cyclists; no flag). No smoking shown.

## Files
| path | what |
|---|---|
| `web/story.js` | shot plan: 24 shots, cameras, lights, actors, fx (phrase times in the header) |
| `web/sets.js` | all locations: prison (M1) + garden (M6) + Dutch reveal (M9), office, lineup, prison row, corridor (M2), guard room (M3), border (M4), north/fjord (M5), market (M7), cell (M8) |
| `web/roman.js` | cast added for this film: warden, 2 guards, 4 prisoners, northern official, bus driver (`castFront`), props and text-free fx |
| `web/paint.js` | procedural textures (brick, slate, tiles, tulips, ...) |
| `audio.py` | music + SFX cue table, mix -> `mix_raw.wav` |
| `asr_words.py` | word timestamps with sherpa-onnx + Parakeet TDT v3 (Whisper weights were not downloadable here) |
| `work/phrases.json` | hand-checked phrase times + shot table; `work/words.json` word times |
| `out/` | final MP4 + QA sheet |

## Rebuild
```bash
cat web/toonbase.js web/roman.js > web/toon.js
node render.mjs frames "0-1449"          # RESUME=1 to continue
python3 audio.py                          # -> mix_raw.wav
bash finish.sh "Gefaengnis zu vermieten" # -14 LUFS, H.264, QA
```
Stills check with safe-area guides: `node render.mjs stills/x "0,100,..." && python3 tools_dev/sheetg.py stills/x stills/x.jpg`
(red = Shorts UI: bottom 300 px and right 150 px; blue = top text band y 250-650).

Built on github.com/mromidev/claude-animated-shorts (MIT): toon.ts (Pen/head/face library), look values, readability rules.
