# Das Fenster — vertical cartoon short (cartoon-short-kit)

45.9 s, 1080×1920, 30 fps, H.264 + AAC, −14 LUFS. Final render: `renders/das-fenster.mp4`; full-length QA sheet: `out/qa_sheet.jpg`.
Voice: the supplied `voice.mp3` only (German). No on-screen text, letters or digits anywhere (papers/clipboards are grey lines only).

- `work/phrases.json` — phrase times, checked by hand against the RMS envelope (Whisper weights were not downloadable here, so `timing.py` fell back to silence alignment; one boundary was corrected: "Also …" starts at 41.90 s).
- `web/story.js` — 23 shots, cuts only in speech pauses, longest shot 3.35 s; split-screen views for the two rooms.
- `web/main.js` — sets: two identical rooms (tree / brick wall), operating room, archive, hospital exit, garden hospital, POV room.
- `web/roman.js` — new cast (`hosp`, `lying`, `phoneHands`) + fx; rebuild with `cat web/toonbase.js web/roman.js > web/toon.js`.
- `audio.py` — synthesized piano/strings bed (−21 dB under speech, ducked) + SFX → `mix_raw.wav`.

Rebuild: `node render.mjs frames "0-1376" && python3 audio.py && bash finish.sh "Das Fenster"`.
