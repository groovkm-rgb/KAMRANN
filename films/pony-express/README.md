# Pony Express – vertical cartoon short (German VO)

Built with the cartoon-short-kit (three.js in headless Chromium, white-head 2D cards in a painted 3D world).

- `voice.mp3` / `script.txt` – the narrator track (used unchanged) and its script
- `work/phrases.json` – phrase timing (silence alignment, then hand-checked against the waveform; final cut points are in the header of `web/story.js`)
- `web/shots.js` – the 30-shot plan (camera, actors, FX per shot), `web/lights.js` – light presets, `web/acts.js` – actor builders
- `web/sets/*.js` – the 12 locations (desert, storm meadow, capitol, continental flyover, town + print shop, prairie, candle room, relay station, snow pass, river, home station, telegraph office)
- `web/cast.js` + `web/western.js` – character rig (rider, keeper, workers, operator, townsfolk), horses (side/front gallop, jump, trot, stand), rim light, FX
- `audio.py` – original synthesized western score + SFX, mixed under the voice (music ≈ −21 dB, ducked while speaking)
- `tools_local/frame.mjs` – projects every actor to screen pixels per shot (framing checker for the narrow 9:16 width)

Rebuild: `bash <kit>/tools/setup.sh .` (fetches three.js), `cat web/toonbase.js web/cast.js web/western.js > web/toon.js`,
`node render.mjs frames "0-1548"`, `python3 audio.py`, `bash <kit>/tools/finish.sh "Pony Express"`.
Scene text is German only: Poststation, Post, Die Rede des Präsidenten, Telegraf, Geschlossen (font: Rye, OFL, via Fontsource).
