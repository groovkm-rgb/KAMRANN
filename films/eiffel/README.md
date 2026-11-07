# Der Mann, der den Eiffelturm verkaufte — vertical cartoon short (1080x1920, 30 fps)

Built with the cartoon-short-kit (three.js cards in an inked, painted 3D world; based on mromidev/claude-animated-shorts, MIT).
Voice-over: the user's own `voice.mp3` (German). Music bed + SFX are synthesized in `audio.py` and mixed under the voice.
No letters, digits or captions appear anywhere in the picture (newspapers = grey lines + tower drawing, documents = seal + scribble, money = patterns).

- `work/phrases.json` — phrase times (whisper-small, `language="de"`, checked against the waveform's silences and hand-fixed)
- `web/story.js` — 29 shots, cuts only in the silences between phrases; every shot moves (push-in / pan / tilt / roll)
- `web/roman.js` — 1920s cast (`gentFront`, `CAST`): con man, scrap dealers, second victim, gendarmes, bellboy, prison guard, waiter
- `web/sets.js`, `web/sets2.js` — Paris + tower, café, forgery desk, hotel lobby + salon, corridor + study, station + train, scrapyard office, police station, press basement, island prison, cell block
- `web/paint.js` — painted textures

Rebuild: `bash setup` (kit) → `cat web/toonbase.js web/roman.js > web/toon.js` → `node render.mjs frames "0-1549"` → `python3 audio.py` → `bash finish.sh "Der Mann der den Eiffelturm verkaufte"`.
