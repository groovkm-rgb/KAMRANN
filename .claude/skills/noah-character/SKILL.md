---
name: noah-character
description: The user's own character NOAH (white round head, dot eyes, swept-back dark brown hair, black t-shirt with "Noah" lettering, white arms, striped brown trousers, gold watch on his left wrist, dark shoes), coded as a canvas rig measured from the user's reference sheet, plus a library of detailed places (forest, stone-age camp, cave, city street, office), detailed animals, cinematic light and on-screen info cards (counters, calculations, tables, timelines). Videos are ALWAYS horizontal 16:9 (1920x1080). Use whenever the user asks for a video, animation, still or scene with "Noah", "bu karakter", "Noah şunu yapsın" (e.g. "Noah uyumaya gitsin", "Noah taş devrinde uyanıyor", "ormanda geziyor"), or for places/animals/overlays for these videos. Overrides the look of other character rigs: never redraw Noah with the toon-shorts defChar rig or the noah-skill storybook Noah.
---

# Noah films (the user's character)

Talk to the user in Turkish. Code comments in English.

## House rules

- **Always horizontal: 1920x1080, 30 fps.** Render with `scripts/render169.cjs` (below), never the
  vertical toon-shorts renderer. Silent MP4 (no audio) unless the user asks otherwise.
- **No background blur** (`blur: 0` in every frame). Depth comes from parallax layers, haze between
  layers, light and value — not from blurring.
- **Noah's size on screen:** draw him at `k ≈ .25` (≈ 380 world units ≈ 1.75 m) so places and animals stay in
  proportion, and frame normal shots with **`cam.z ≈ 1.3–1.4`** so he is about **45–50 % of the frame height**
  (the user asked for him bigger than at z 1). Use `cam.z ≈ 1.0` only for wide establishing shots, and 1.7–2.6 for
  close-ups. Never enlarge Noah with `k` to make him look bigger: zoom the camera. Track a walking Noah with the
  camera (e.g. `cam.x = noahX + 260`). Pass `ink: 1.8` so his outline stays thick. World scale for places/animals:
  **1 m ≈ 220 world units**.
- **Detailed worlds:** every frame has foreground, midground and background; no bare floors or plain walls.
- **Cinematic light, one light idea per shot** (from the user's cartoon skill): low golden sun with long
  shadows, sun shafts through trees or a cave mouth, a beam through a window with the pane projected on
  the floor, night blue with warm fire/lamps. Haze turns distance soft; glows on every light source;
  dust motes in beams; soft cool cast shadows (`castShadow`) under characters; warm-light / cool-shadow grade.
- **Light ink on the world** (thin outlines near, none on far landscape); **characters keep thick ink**.
- Text appears only in info cards / badges (`overlays.js`) and in Noah's shirt lettering. Default card
  language: Turkish; numbers Turkish style (1.234.567 and 8,2); years under 10.000 without a dot (M.Ö. 8000).
- **Never change Noah's proportions** in `NOAH` / `noahHeadLocal` / `NOAH_SIDE` to fit a scene. Outfits and the
  primitive look are separate layers on top. After any edit to the rig, compare it next to `reference.jpg`
  (front crop `(110,20,280,420)`, side crop `(360,20,530,420)`, both ×4) and fix differences, not the reference.
- Before new features or big changes to this skill, show the user samples and wait for approval, then update
  this file.

## Workflow

1. Plan the shots (each with its light idea), tell the user in a few lines, proceed.
2. Make `films/<slug>/` with `film.json` and `scenes.js` (see examples). `film.json` lists modules in this order
   (include only what you use, but keep dependencies):
   ```json
   "modules": ["../../.claude/skills/noah-character/noah.js",
     "../../.claude/skills/noah-character/places/light.js",      // needed by every place
     "../../.claude/skills/noah-character/places/stone-age.js",  // fern/rock/campfire… (forest.js needs it)
     "../../.claude/skills/noah-character/places/forest.js",     // also needed by city.js and cave.js
     "../../.claude/skills/noah-character/places/cave.js",
     "../../.claude/skills/noah-character/places/city.js",       // also needed by office.js (window view)
     "../../.claude/skills/noah-character/places/office.js",
     "../../.claude/skills/noah-character/places/animals.js",
     "../../.claude/skills/noah-character/places/fonts.js",      // only with overlays
     "../../.claude/skills/noah-character/places/overlays.js",
     "scenes.js"]
   ```
3. Build with the toon-shorts engine: `node <toon-shorts>/scripts/build_film.mjs films/<slug>`.
4. Look at stills: `node .claude/skills/noah-character/scripts/render169.cjs films/<slug> 0.5 2.1 4.3`
   (PNGs in `films/<slug>/stills/`). Check faces, framing, light, detail; fix; repeat 2–4 times.
5. Render: `node .claude/skills/noah-character/scripts/render169.cjs films/<slug> --mp4 films/<slug>/<slug>.mp4`
   (prints an ffprobe line: 1920x1080, exact frame count, no audio).
6. Send the MP4 to the user, describe each shot and what you checked/fixed, and say what you did not verify.

`scenes.js` uses the toon-shorts frame object (`set`, `setOpts`, `cam`, `behind`, `front`, `fx`, `screen`, `vignette`,
`fadeIn/fadeOut`) and helpers (`ease`, `seg`, `bump`, `lerp`, `clamp`, `rnd`, `CAM.mix`, `FX.zzz`, `FX.smoke`…).
Do not name a variable `CAM` (engine global). If the film uses overlays, wrap: `NOAH_FONTS_READY.then(() => defineFilm({...}))`.

## Noah API (`noah.js`; world units, feet on y = 0, up is negative)

```js
drawNoah(c, { x, y, k: .25, ink: 1.8, s: 1, arms, expr, tilt, bob, lean, outfit, sit, seatH })  // front view
drawNoahSide(c, { x, y, k: .25, ink: 1.8, s: 1 | -1, walk: phase | null, expr, outfit, armSwing, tilt, bob }) // side profile, walk cycle
drawNoahHead(c, x, y, k, expr, tilt)   // head only, (x,y) = head centre (in bed, lying: tilt ≈ -1.25)
drawNoahHand(c, x, y, k, ang)          // loose hand (on a blanket, a table edge)
```
- `arms: { l: { a, b }, r: {...} }` — `a` shoulder angle from straight down (+ outward, ~2.45 = up), `b` elbow bend.
  Relaxed `{ a: .13, b: -.08 }`. Watch on `r`. Stretch/yawn: `a: 2.4, b: .5`.
- `walk: t * 8` drives the side walk cycle (move `x` yourself, ~150 units/s at k .25).
- `outfit: 'classic' | 'caveman'` (fur tunic, rope belt, bare arms/legs, fur foot wraps, no watch/lettering).
- `sit: true, seatH: 300` — seated front view; the seat behind him is `seatH * k` high.
- `expr`: `eyes: 'open' | 'closed'`, `lid` 0..1, `look` −1..1, `browUp` 0..1,
  `mouth: 'smile' | 'soft' | 'flat' | 'o' | 'yawn'`, `open` 0..1;
  **primitive look:** `beard: 1` (scruffy beard + moustache), `wild: 1` (unkempt locks). Front view only so far.

## Places (`places/`)

| file | set (frame `set:`) | props / extras |
|---|---|---|
| `light.js` | — | `sunRays`, `bloom`, `dappled`, `castShadow`, `motes`, `fireflies`, `haze`, `mist`, `grade`, `blobs`, `layerBase` |
| `forest.js` | `forestSet` (day), `forest` (`tod: day/dusk/night`, `cave`, `caveX`, `path`, `log`, `treesX`), `stoneAgeForest` (night + cave) | `forestFrame(c, cam, t, o)` foreground leaves, `forestLight(c, cam, t, o)` shafts/motes/fireflies/grade — both in `screen`; `fTree fPine fBush fFlower fMushroom fLog fMossRock` |
| `stone-age.js` | — | `campfire`, `fireGlow`, `logSeat`, `spear`, `bonePile`, `rock`, `fern` (scale props with `c.scale(.5)` at k .25) |
| `cave.js` | `caveInterior` (`mouthX`, `tod: day/dawn`) | `furBed`, `embers`, `stoneTools`, `cavePaintings`; `caveLight(c, cam, t, { tod, rays })` in `screen` |
| `city.js` | `city` (`tod: day/golden/night`) | `streetLamp`, `streetTree`, `bench`, `hydrant`, `bin`, `bike`, `car`, `trafficLight`, `pigeon`; `cityLight` in `screen` |
| `office.js` | `office` (`tod: day/golden/night`) | `desk`, `officeChair`, `plantPot`, `waterCooler`, `printer`, `cabinet`; `officeLight` in `screen` |
| `animals.js` | — | `rabbit deer fox bear dog cat horse mammoth (c, x, { s, sc, t, walk })`, `bird owl (c, x, y, { s, sc, t, color })` |

Light functions take the same camera object as the frame (`const v = { x, y, z }` → `cam: v`, `screen: [c => forestLight(c, v, t)]`).
New places follow the same pattern: parallax `layer(c, cam, p, …)` with bases from `layerBase(cam, HZ, p)`, `haze()` between far
layers, light ink, lots of small detail, and a matching `xxxLight()` for the shot's light idea.

## Info overlays (`overlays.js` + `fonts.js`)

A card that sits in a screen corner like a pasted PNG sticker (white border, ink outline, drop shadow, slight tilt),
popping in and out. All in `screen`:
```js
hudCard(c, t, { t0, t1, corner: 'tr'|'tl'|'br'|'bl', w, h, title, icon: 'hourglass'|'clock'|'people'|'calc'|'table', color,
  draw: (c, k, lt, w, h) => { /* card-local, 0,0 = top-left of the body */ } })
hudCounter(c, from, to, k, x, y, size, { fmt, color })   hudCalc(c, lines, k, x, y, size, { result: true })
hudTable(c, x, y, cols, rows, k, { hi, size })             hudTimeline(c, x, y, w, ticks, value)
hudText(c, s, x, y, size, col, align)   hudBadge(c, t, { t0, t1, x, y, text, color })   fmtNum(n, dec)
```
Font: Inter Bold embedded (OFL, `assets/fonts/LICENSE-Inter.txt`).

## Examples

- `films/time-travel-demo/` — Noah walks in the forest; corner card counts 2026 → M.Ö. 8000, timeline, calculation, population table.
- `films/stone-age-wakeup/` — primitive Noah (beard, wild hair, fur) wakes up in a cave at dawn.
- `films/places-demo/` — stills: forest + animals, stone-age night camp, office, golden-hour city, animal line-up.
- `films/noah-sleep/`, `films/stone-age-camp/` — older vertical tests (before the 16:9 rule).

## Not covered yet

Side profile has no sitting/lying pose and no beard/wild hair; no 3/4 view; the sheet's angry/confused/thinking/pointing
poses are not coded. Measure them from `reference.jpg` before using them and tell the user rather than improvising a
different-looking Noah.
