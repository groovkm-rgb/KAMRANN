# Die Milliarde (9:57, 16:9 1920x1080, 30 fps)

Built with the cartoon-short-kit skill (three.js in headless Chromium, white-head 2D character cards in a painted 3D world).

- `web/` — engine (`main.js`, `paint.js`), cast (`cast.js`, `castx.js`; one fixed design per character, see `characters/`),
  locations (`sets1-3.js`, `scene.js`, `common.js`), shot list synced to the voice-over (`shots1-4.js`, engine in `engine.js`, `story.js`).
- `audio.py` — synthesized music bed + SFX mixed under `voice.mp3` (voice levelled, music ~15 dB below).
- `work/` — phrase/word timings extracted from the MP3 (`timing.py`, silence detection + script alignment).
- Render: `./rr.sh 3 560` (repeat until all frames exist), `./enc.sh <1-7>` per chapter, `./final.sh` to mux with the mix.
  `web/lib/three.module.js` (three r160) and `web/toonbase.js` come from the kit's `setup.sh`; `web/toon.js` = `toonbase.js + cast.js + castx.js`.

The finished MP4 (322 MB) is not in git (GitHub's 100 MB file limit).
