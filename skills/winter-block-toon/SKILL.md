---
name: winter-block-toon
description: Make silent vertical (9:16, 1080x1920, 24 fps) 2D cartoon shorts in a flat "winter panel-block" adult-animation look — clean black ink outlines, flat colours with one cel-shade tone, long-necked sleepy-eyed characters (heavy upper lids, long noses, buzz cuts, zip hoodies, track pants with stripes, sneakers), Soviet-era panel apartment blocks at night with warm windows, hooked sodium street lamps, bus stops with torn posters, falling snow and breath clouds — drawn with HTML Canvas and exported as a frame-exact MP4 with no audio and no on-screen text. Use whenever the user asks for an animation "bu tarzda", "kış / kar / blok / panelka / gopnik / eşofmanlı" scenes, a melancholic winter-city cartoon, a Reel/TikTok/Short in this look, or sends reference stills of this style and asks for a video. For the dark Art-Deco mafia look use art-deco-noir-shorts; for bright round-head cartoons use toon-shorts.
---

# Winter-block toon

You turn a short mood or story into a finished, silent, vertical cartoon clip: one self-contained
HTML file plus an MP4. The look (palette, ink lines, characters, sets, snow, breath, grain) lives in
`assets/engine.js` and `assets/character.js`. Your job is direction: write the shots in one
`scenes.js`, look at frames, fix what looks wrong, render, deliver.

Talk to the user in their language (often Turkish). Code comments in English.

## House rules

- **9:16, 1080x1920, 24 fps, exact duration**, no audio stream, **no text in frame** (no
  `fillText`; posters/signs are blank shapes and scribble lines). The user adds sound later.
- **The look:** thin-to-medium black ink outline on everything (`ink()`), flat fills, at most one
  shade tone per surface, cold navy/lavender night palette with warm amber windows and orange lamp
  light. No gradients on characters. Grain + vignette + cold tint in `post`.
- **Characters** are long-necked and tired: heavy lids (`lid` ≈ .45–.6), small pupils, long nose,
  nasolabial lines, pursed full lips. Expressions are subtle — side-eye (`look`), slow blink
  (`lid` → 1 for ~3 frames), faint smirk (`smirk`), exhale (`mouth` + `breath()`).
- **Motion on twos:** pass `t: twos(t)` and use `twos(lt)` for character timing so they move at 12
  drawings/s like TV animation; snow and camera stay smooth on ones.
- **Deterministic:** everything is a function of `t`; use `hash()` instead of `Math.random`.
- **Mood over action:** 2–4 shots for 5–10 s, slow push-ins, little dialogue-free beats (waiting at a
  bus stop, phone glow, breath in the cold, a window lighting up, lighter flame in a kitchen).

## Workflow

Scripts are in `scripts/` (Node 18+, ffmpeg, Playwright with Chromium).

1. **Shot list** (say it to the user in 2–4 lines, then proceed): per shot — place, camera move,
   who, the one action, start/end times that tile the duration exactly.
2. **Scaffold:** copy `assets/templates/` (`film.json` + `scenes.js`) into `films/<slug>/`, set
   `title`, `slug`, `duration`.
3. **Write `scenes.js`** defining `const FILM = { duration, shots: [...], post }`. Each shot is
   `{ name, start, end, lw, draw(ctx, t, lt, u) }` — `t` global seconds, `lt` local seconds,
   `u` 0..1 progress. Use `withCam(ctx, cam, depth, fn)` for parallax layers (sky .25, far blocks
   .45, mid .7, ground .85, characters 1). `films/winter-block-demo/scenes.js` is a complete
   reference (wide street shot + face close-up).
4. **Look:** `node scripts/snap.mjs films/<slug> <outdir> [t ...]` → PNGs + `sheet.png`. Read the
   frames. Check: limbs and neck attached, eyes not crossing, breath leaves the mouth, nothing
   important under heavy snow, no lamp/pole growing out of a head, text-free.
5. **Render:** `node scripts/render_mp4.mjs films/<slug> renders/<slug>.mp4` (H.264, yuv420p, no
   audio). Report duration/frames from the printed ffprobe line.
6. Deliver the MP4 path (and `film.html`, which plays in any browser with a scrubber).

## API cheat-sheet

**Engine (`assets/engine.js`)**
- `W, H, FPS, PAL` (palette), `clamp, lerp, inv(a,b,v), E.inOut/out/in/sine, hash(a,b,c), twos(t)`
- `LW` — base line width (set per shot via `lw`; 6 for wides, 8–9 for close-ups)
- `ink(ctx, build, fill, lw, stroke)`, `stroke(ctx, build, lw, col)`, `poly(pts)`, `smooth(pts)`, `ellipse(x,y,rx,ry)`
- `withCam(ctx, {x,y,zoom}, depth, fn)`
- `sky(ctx, top, bot)`, `glow(ctx, x, y, r, 'r,g,b', a)`
- `panelBlock(ctx, {x, y, w, h, floors, cols, seed, side, far, lit, t, onAt:[[col,floor,time]], lw})`
- `streetLamp(ctx, x, baseY, h, dir, lw)` → returns lamp-head point for `glow()`
- `snowBank(ctx, pts, lw)`, `snowSpecks(ctx, x0,y0,x1,y1, n, seed)`, `busShelter(ctx, x, groundY, w, h, lw)`
- `snowfall(ctx, t, {n, seed, speed, size, wind, alpha})`, `snowStreaks(ctx, t, {...})` (blizzard)
- `breath(ctx, t, t0, x, y, {dir, dur, size, lw})`
- `coldTint(ctx)`, `vignette(ctx, a)`, `grain(ctx, t, a)`, `fade(ctx, a)`

**Characters (`assets/character.js`)**
- `CAST.lanky` (orange flat-top, black zip hoodie, blue track pants), `CAST.stocky` (blond,
  moustache, green/lilac jacket, short neck), `CAST.oldman` (navy beanie, walrus moustache). Add new
  casts by copying an entry (skin, hair*, hairStyle 'buzz'|'beanie', moustache, hoodie*, pants*,
  neck, faceW, faceL).
- `drawFigure(ctx, {cast, x, y (ground), s, t, sway, pose:'pockets', lid, look, lookY, mouth, smirk, headTilt, lw})`
  → returns `{chin, mouth}` points (use `mouth` for `breath()`). Full figure ≈ 1790·s px tall;
  s≈.6 for a wide, s≈1.5 with feet below frame (y≈3330) for a chest-up close-up.
- `drawHead(ctx, {cast, x, y (chin), s, ...})` for heads alone (e.g. a group behind a window).

**Extending:** new props (flip phone, Zippo, kitchen stove, radiator, tiled wall, fur-hood girl…)
go in the film's `scenes.js` first, built from `ink`/`poly`/`smooth`; if reused, move them into the
engine. Keep the same outline weight and flat-fill rules so they match.
