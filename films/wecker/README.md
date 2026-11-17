# Der menschliche Wecker — vertical cartoon short (1080x1920, 30 fps)

Built with the cartoon-short-kit (white-head cards in a painted three.js world, headless Chromium).

- `web/scene.js` – the five places: night street (M1), family bedroom (M2), clock shop (M3), factory gate (M4), the waker's room (M5)
- `web/story.js` – 28 shots timed to `voice.mp3` (phrase table at the top), cameras, light, cast, FX
- `web/cast.js` – white-head rig + story cast (waker woman, pole man, family, foreman, clockmaker, old waker) and FX
- `audio.py` – synthesized music bed + SFX mixed ~20 dB under the voice → `mix_raw.wav`
- No captions; all in-scene text is German ("Fabrik", "Wer zu spät kommt, zahlt!", "Wecker", "Teuer!", "Bitte um 4 wecken").

Rebuild: `cat web/toonbase.js web/cast.js > web/toon.js; python3 audio.py; node render.mjs frames 0-1521; bash finish.sh "Der menschliche Wecker"`
