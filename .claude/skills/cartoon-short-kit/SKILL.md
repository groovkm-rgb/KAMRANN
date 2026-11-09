---
name: cartoon-short-kit
description: Turn a voice-over (MP3) into a finished vertical 9:16 cartoon short (1080x1920, MP4 with mixed audio) whose characters are REAL 3D — round toon-shaded 3D heads with 3D hats, inflated volumetric bodies — in an inked, painted three.js world, plus a synthesized music bed and SFX under the user's voice. This project version supersedes anthropic-skills:cartoon-short-kit. Use whenever the user gives a voice-over or script and asks for an animated short, Reel, TikTok or YouTube Short in this style ("çizgi film short", "bu skill ile", "dikey video", "seslendirme bende").
---

# cartoon-short-kit (3D edition)

Audio in, finished vertical cartoon short out. Same pipeline as the original kit (three.js in headless
Chromium, no GPU), but **people are never flat cards any more**. Built and proven on
`films/spy` ("Der Mann, der nie existierte").

## THE 3D RULE (mandatory, every project)

The user explicitly asked that every future short keeps this. Do not ship flat-card people.

1. **Every standing character = `R3(...)`** (see `example/spy/story.js`):
   - body card drawn with `layer: 'body'` and **inflated** (`inflate: { d: 0.11 }`): the card silhouette is turned into a
     rounded front/back shell (distance field -> depth), so arms, legs and torso have thickness from any angle;
   - a **real 3D round head** (`head3d: T.spyHead3d(who, o)`): toon sphere, face painted on the front half,
     separate ears, hair cap, **3D hats** (peaked cap, captain cap, straw hat, knit cap; hat-in-hand stays 2D);
   - hands that sit in front of the face (shh, cheek, whistle, magnifier, pipe in hand, scratch, hat off) go to an
     **overlay card** (`layer: 'after'`, `towardCam: 0.3`) that main.js slides toward the camera along the view rays,
     so it is drawn in front of the 3D head with the exact same screen position (`hasAfter(opts)` decides).
2. Heads use an **unlit painted matcap** (`MeshMatcapMaterial`), so they match the unlit hand-shaded body cards in
   every light (a lit head next to a lamp glows; do not switch back to MeshToon for heads). Actor `tint` applies.
3. Lying people = `FLAT(...)` with `inflate` (volume on the ground); head-on-pillow = `HEADONLY` with `inflate`.
   Tiny far crowds / back views may keep a 2D head, but still `inflate` the body.
4. Props (letters, tickets, maps, documents, arrows) stay flat cards — never inflate props.
5. **Prove it before the full render**: side test with the cast held toward the shot camera while the view orbits:
   `HASH="#orbit=60" node render.mjs stills/side60 "<frames>" 1` and `#orbit=85`. Heads must be round, bodies thick,
   hats 3D. No paper-thin people from any angle.

New cast: add outfits to `SPY` in `engine/roman.js` (jacket/pants/shoes/skin/hair/hairStyle/hat/hatCol/band/...,
props: glasses, monocle, moustache, walrus, beard, brows, medals, epaul, coat, tank, sweater, rolled, pack). Every
outfit automatically works in 2D, body/face/after layers and as a 3D head. Rebuild: `cat web/toonbase.js web/roman.js > web/toon.js`.

## Kit layout

- `engine/` — copied into each project's `web/`
  - `main.js`: renderer. **Top part = per-story sets** (`// SETS` … one `set('<id>')` group per location; replace these
    for a new story). **Bottom part = shared engine — keep it**: sea shader, cards + `inflateGeo`, `Head3D`
    (+ matcap, ears, hats), `placeHead`, overlay (`towardCam`), ink pass, DOF, grade (soft grain, sepia tone, vignette),
    cross-dissolve (`XFADE`), fill light, `#orbit=N` debug.
  - `roman.js`: cast on top of the Pen library (mromidev/claude-animated-shorts, MIT, vendored as `toonbase.js`):
    `spyFront` (poses, props, back view, layers), `spyHead3d`, `hasAfter`, letter-free props
    (`propLetters/Tickets/Receipt/Bank/Doc/Jacket`, `fxRedX`, `fxArrow`, `fxGull`, `fxFlower`, `fxSpray`, `fxPour`, …).
  - `motion.js` (`camFromKeys`, easing, `idle`, `blinkAt`), `paint.js` (painted textures), `index.html`.
- `example/spy/` — full worked example: `story.js` (24 shots, R3/FLAT/HEADONLY helpers, cameras, world state, FX),
  `audio.py` (music bed + SFX cue table + ducking), `script.txt`.
- `tools/` — `setup.sh`, `timing.py`, `render.mjs`, `check.mjs`, `stills.sh`, `sheet.py`, `finish.sh`.

## Workflow

1. **Project**: `bash .claude/skills/cartoon-short-kit/tools/setup.sh films/<name>`; put `voice.mp3` + `script.txt` in it.
2. **Timing**: `python3 timing.py voice.mp3 script.txt --out work` (Whisper with `WHISPER_LANG`, default `de`; set it to the
   VO language). If Whisper cannot download (HuggingFace may be blocked), the silence aligner can merge phrases wrongly:
   map the silence segments to the script by hand and find inner boundaries from the energy/HF spectrum (fricatives,
   plosive closures). Cut only on phrase boundaries; shots <= 3 s; merge phrases < 0.8 s; TOTAL = mp3 + 0.5 s.
3. **Shot plan** (`web/story.js`): `SHOTS`, `LIGHTS`/`lightFor`, `CAMS` keys (every hold creeps), `worldAt` (set + dynamic
   transforms by name via `dyn()`), `actorsAt` (R3 / FLAT / HEADONLY), `fxAt`.
4. **Framing check before rendering** — vertical 9:16 has only ~25° horizontal FOV, people fall out of frame easily:
   `node check.mjs` prints every actor's screen position per shot (`!!` = out of frame, `^` = head inside the top text band
   y < 690). Fix cameras until clean. Keep the right 150 px / bottom 300 px free of key action.
5. **Stills**: `./stills.sh stills/v1` (3 frames per shot, 3 workers, contact sheet). Look at it; check: framing, no letters or
   digits anywhere (also nothing letter-like: spirals, M-shaped birds, Ω-like rings), people 3D, faces readable. Then the side test (rule 5).
6. **Audio**: rewrite the cue table in `audio.py`; never generate or add a voice — only the user's mp3. Music is scaled so the
   ducked bed sits ~21 dB under the speech (measure per section; keep SFX under the voice; give the ending enough level).
7. **Full render**: 4 workers, e.g. `for r in 0-341 342-683 …; do RESUME=1 node render.mjs frames "$r" & done`.
   Changed only some shots? Delete just those frame ranges and re-render them.
8. **Finish**: `bash finish.sh "Title"` -> loudness loop to -14 LUFS (limiter + gain), H.264 CRF 16 / preset slow / tune
   animation / **no maxrate**, QA (freeze/black detect, loudness), `out/qa_sheet.jpg`. Inspect frames at 100 % for
   grain/compression artefacts before delivering. Send the QA sheet + MP4 to the user.

## Look & quality rules learned the hard way

- Film grain must stay subtle: `grain` 0.015–0.02 (soft 1.9 px value noise, weaker in shadows). Strong per-pixel grain
  reads as digital noise and compresses into blocks.
- Never trade quality for file size (no bitrate caps, no high CRF) unless the user asks.
- Night scenes need the fill light (`fillI` in the light preset) or hulls/props become black silhouettes.
- Spray/foam: use `fxSpray` / soft textures (no ink outline); cartoon cloud puffs read as clouds, not water.
- No text rule (when the user asks for it): papers = grey wavy lines + seal + signature scribble; maps without labels;
  compass without letters; check every contact sheet for letter- or digit-like shapes.
- Deterministic everything (seeded rng) so `RESUME=1` re-renders match.

Credit: built on github.com/mromidev/claude-animated-shorts (MIT) — toon.ts (vendored as engine/toonbase.js), look values and readability rules.
