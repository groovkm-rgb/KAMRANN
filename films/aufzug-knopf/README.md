# Der Tür-zu-Knopf (elevator "door close" button short)

Vertical 1080x1920 / 30 fps cartoon short built with the `cartoon-short-kit` skill
(three.js world + 2D character cards, ink pass, synthesized muzak + SFX under the supplied voice-over).
**No lettering anywhere in the picture** (panel buttons, floor dots, clock, pedestrian signal are icons only),
so titles/captions can be added later in an editor. Top band y 250-650 px is kept calm for text;
the bottom 300 px and right 150 px stay free of key action.

| | |
|---|---|
| Voice | `voice.mp3` (user supplied, 44.12 s) — not generated or altered |
| Length | 1339 frames = 44.63 s (voice + 0.5 s tail) |
| Shots | 22, every cut in a pause between phrases, none longer than 3.0 s |
| Timing | `work/phrases.json` (silence alignment + manual check against the RMS envelope; Whisper model host was unreachable) |
| Audio | `audio.py` → `mix_raw.wav`; music ~21.6 dB under speech, ducked wherever the voice is active |
| Output | `out/Der-Tuer-zu-Knopf.mp4` (-14 LUFS, H.264) + `out/qa_sheet.jpg` |

Rebuild:
```bash
bash <kit>/tools/setup.sh .            # only if web/lib/three.module.js or web/toonbase.js are missing
cat web/toonbase.js web/roman.js > web/toon.js
python3 audio.py
node render.mjs frames "0-1338"        # RESUME=1 skips existing frames
bash finish.sh "Der Tuer zu Knopf"
```
Files: `web/story.js` (shot plan, cameras, actors, fx), `web/main.js` (sets M1-M8), `web/roman.js` (cast: `CAST`, `castFront`,
`handCard`, `brainCard`, fx cards), `web/paint.js` (text-free textures), `audio.py` (music + SFX cue table).
Built on github.com/mromidev/claude-animated-shorts (MIT) via the cartoon-short-kit engine.
