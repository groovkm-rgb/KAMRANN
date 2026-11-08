# Der Mann, der nie existierte — vertical cartoon short (1080x1920, 30 fps)

Built with the `cartoon-short-kit` skill (three.js in headless Chromium + 2D bean-head cards, synthesized music/SFX).
Voice-over is the user's own `voice.mp3` (German); nothing is voiced or added on top of it.

- **No text anywhere**: papers use grey wavy lines, seals and signature scribbles only; the map has islands, grid and a letter-free compass.
- **No countries**: our side = navy-grey uniforms, enemy = dark green-brown; plain buttons, epaulettes, belts — no flags, badges or insignia.
- The agent is always drawn as a peacefully sleeping man (closed eyes, soft smile, normal skin) with a soft "hero" glow.

## Files
- `web/roman.js` — cast added on top of the kit: `SPY` outfits (`agent`, `plan1`, `plan2`, `captain`, `crew`, `fisher`, `enemy`, `inspector`, `general`, `sentry`), `spyFront()` (poses, props, back view), letter-free props (`propLetters`, `propTickets`, `propReceipt`, `propBank`, `propDoc`, `fxRedX`, …). Rebuild: `cat web/toonbase.js web/roman.js > web/toon.js`.
- `web/main.js` — 10 sets (night sea + submarine, planning room, cold room, desk, briefcase void, dawn shore, enemy HQ/map, march, landing beach, sunset hill), sea shader, flat cards, film grain + sepia grade, cross-dissolve.
- `web/story.js` — 24 shots cut on phrase boundaries (timings checked by hand against the waveform; Whisper could not be downloaded here), camera keys, lights, world state, actors, FX.
- `audio.py` — light 1940s spy bed (pizzicato, walking bass, brushes, clarinet) ducked ~21 dB under the voice + synced SFX → `mix_raw.wav`.
- `check.mjs` — projects every actor to screen space per shot (out-of-frame `!!`, inside the top text band `^`).
- `stills.sh` — 3 stills per shot in parallel + contact sheet.

## Rebuild
```
bash <kit>/tools/setup.sh .        # three.js + toon base (web/lib, web/toonbase.js)
python3 audio.py
for r in 0-341 342-683 684-1025 1026-1367; do RESUME=1 node render.mjs frames "$r" & done; wait
bash finish.sh "Der Mann der nie existierte"
```
