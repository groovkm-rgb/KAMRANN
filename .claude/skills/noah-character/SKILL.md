---
name: noah-character
description: "The user's own character NOAH (white round head, dot eyes, swept-back dark brown hair, black t-shirt with \"Noah\" lettering, white arms, striped brown trousers, gold watch on his left wrist, dark shoes), coded as a canvas rig measured from the user's reference sheet, plus a library of detailed places (forest, stone-age camp, cave, city street, office, luxury dining room, professional kitchen, 1960s kitchen, Amt, bank, ceremony hall …), a REAL-PERSPECTIVE 3D street (Altbau neighbourhood) and 3D dining room with oblique-to-front camera dollies, outfits (waiter, chef, suit), a cast of other characters in Noah's style, clay-look food, hand-drawn animated overlays, phone-screen inserts, cinematic light, info cards, and a full NARRATED-FILM pipeline (sentence sync to an MP3 without ASR, code-generated music + SFX under the untouched voice). Videos are ALWAYS horizontal 16:9 (1920x1080, 30 fps). Use whenever the user asks for a video, animation, still or scene with \"Noah\", \"bu karakter\", \"Noah şunu yapsın\", a narrated \"Was wäre, wenn …\" style explainer from an MP3 + script, or for places/animals/overlays/thumbnail prompts for these videos. Overrides the look of other character rigs: never redraw Noah with the toon-shorts defChar rig or the noah-skill storybook Noah."
---

# Noah films (the user's character)

Talk to the user in Turkish. Code comments in English. On-screen text is always German (see house rules).

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
- **All on-screen text is GERMAN — always** (the user's rule): info cards, badges, tables, labels, signs, anything
  written inside a scene. Talk to the user in Turkish, but never put Turkish or English text in a frame. Only Noah's shirt
  keeps his name "Noah". Numbers German style: 1.234.567 and 8,2; years under 10.000 without a dot; BC/AD as
  "8000 v. Chr." / "500 n. Chr."; units and abbreviations German ("8,2 Mrd.", "~5 Mio.", "Jahre", "km", "°C").
- **Never change Noah's proportions** in `NOAH` / `noahHeadLocal` / `NOAH_SIDE` to fit a scene. Outfits and the
  primitive look are separate layers on top. After any edit to the rig, compare it next to `reference.jpg`
  (front crop `(110,20,280,420)`, side crop `(360,20,530,420)`, both ×4) and fix differences, not the reference.
- **Do not render videos unless the user explicitly asks for a video** (the user's rule). Samples, tests,
  new places/features and changes are shown as **PNG stills** only. Render an MP4 only when the user's own message
  asks for a video ("video yap", "video üret", "… saniyelik video"); if unsure, show stills and ask.
- Before new features or big changes to this skill, show the user samples (stills) and wait for approval, then
  update this file.
- **Narrated films (user's rules from the Luxusrestaurant film):** no subtitles ever (the spoken text is never written on
  screen); the voice MP3 is never compressed, ducked, cut or trimmed — the film is at least as long as the MP3 (round the frame
  count UP: `ceil(mp3_seconds * 30)` frames); music is very quiet (≥ 20–24 dB under the voice, extra ducking while she/he
  speaks) and follows the story's emotion; SFX are present but always under the voice; output 1920x1080, 30 fps, AAC 48 kHz,
  verify with ffprobe. **Always make a ~20 s draft first** (MP3 0:00–0:20, cut at the next pause so no word is cut), send it,
  wait for approval, then do the full film in the same quality.
- **Camera never stands still**: every shot has a slow push-in, pull-out, pan or dolly. Vary shot types: wide establishing
  (z ≈ 1.0), normal (z 1.3–1.4), **waist-up (z ≈ 3.2–3.6 at k .25 — NOT 2.0–2.4, that is still knee-up)**, object close-ups,
  phone/screen inserts. Cuts: whip-pan (`whipIn` / `speed: 0`), match-cut, soft cuts. Cut ~0.12 s before a sentence starts.
- **Waist-up shots use GEGENBEWEGUNG** (`gegen()` in the kit): Noah on the left or right third, the background layers slide one
  way with parallax while Noah glides 40–80 px the other way over 3–5 s. For waist-up shots in the salon/living room/bedroom pass
  a low horizon (`hz: -95` salon, `hz: -70` living room) so paintings/windows/sconces sit behind the head, not bare floor.
- **3D where it helps (the user loves it):** exteriors and wide room shots use the real-perspective kit (`street3d`, `room3d`):
  camera dollies from an oblique angle down the street / from a corner toward the front. Never a flat frontal-only facade for an
  establishing shot. Upscale, bright, rich neighbourhood (Gründerzeit facades, balconies, awnings, linden trees, lanterns,
  cafés, cars, people) — never a plain row of boxes.
- **Dust motes / sparkles only where there is a light beam** (window shafts, lamp cone, stage spotlight) — not in every shot.
  Use `noMotes: true` on salonLight and friends otherwise.
- **Every background is detailed down to small things** (frames, sconces, bottles, plants, tickets, jars, posters with German
  text, cables, papers). Wall layers are drawn at distance scale (`c.scale(.55–.62)` after `translate(0, layerBase(...))`) so
  furniture and windows stay in proportion to Noah.
- **Cards/drawings never cover Noah's face**; a card stays ≤ 5–7 s; numbers appear when they are spoken.
- **Things hard to draw realistically (food, bread, flowers, cake, roulade) use the clay/plasticine look** (`film-kit/clay.js`),
  only on those objects.
- **Seated Noah with hands on a table: elbows OUT** (`noahIK(side, tx, ty, true)`, hand targets ≈ ±185–190 rig units from the
  centre). Elbow-down IK crosses the forearms into an X — the user flagged that. Draw the table after Noah, then redraw only his
  arms clipped above the table edge (`drawNoahDressed({...p, onlyArms: true})`).
- Proportions of props for Noah (k .25): table top y −128, depth 22; seat height `seatH: 250`; desks for seated people must be
  low (`bankDesk`), the skill's `office.desk` (top −230) is too high for a seated Noah. Keep monitors/props off faces.
- Give crowds variety (`PEOPLE.guest(i)` with well-spread indices), never a row of identical guests.

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
5. **Only if the user asked for a video:** render
   `node .claude/skills/noah-character/scripts/render169.cjs films/<slug> --mp4 films/<slug>/<slug>.mp4`
   (prints an ffprobe line: 1920x1080, exact frame count, no audio). Otherwise stop at step 4.
6. Send the stills (or the MP4 when one was asked for) to the user, describe each shot and what you checked/fixed,
   and say what you did not verify.

`scenes.js` uses the toon-shorts frame object (`set`, `setOpts`, `cam`, `behind`, `front`, `fx`, `screen`, `vignette`,
`fadeIn/fadeOut`) and helpers (`ease`, `seg`, `bump`, `lerp`, `clamp`, `rnd`, `CAM.mix`, `FX.zzz`, `FX.smoke`…).
Do not name a variable `CAM` (engine global). If the film uses overlays, wrap: `NOAH_FONTS_READY.then(() => defineFilm({...}))`.

## Narrated film pipeline (MP3 + script → finished MP4 with audio)

Reference film: `films/luxusrestaurant/` in the KAMRANN repo (13:06, 117 shots). Kit demo: `examples/kit-demo/`.
1. **Sync without ASR** (model downloads may be blocked): `ffmpeg -i voice.mp3 -af silencedetect=noise=-34dB:d=0.18 -f null - 2>&1 |
   grep -oE 'silence_(start|end): [0-9.]+' | awk '{print $2}' | paste - - > pauses.tsv`, save the narration as `script.txt`
   (paragraphs separated by blank lines), run `python3 sync/align.py script.txt pauses.tsv` → `sentences.json`, `timing.js`
   (`ST[i]` / `SE[i]` start/end of sentence i). Check the first sentences against a fine silencedetect (d=0.08). Write shots
   with `shot(at(i), name, f)` so cuts follow the voice; put numbers on screen at `ST[i] + offset` of the sentence that says them.
2. Film folder: `film.json` = `{ "title", "duration": <ceil(mp3*30)/30>, "modules": ["timing.js", "scenes1.js", …, "main.js"] }`.
   `main.js`: `NOAH_FONTS_READY.then(() => { defineFilm({ fadeIn: .25, fadeOut: 1.2, shots: buildShots() }); window.__cues = CUES; window.__moods = MOODS; })`.
   In scene files register sound with `cue(t, fx, db, args, { every, n, pan })` and music with `mood(t0, t1, kind)`.
3. Build: `node <skill>/scripts/build169.mjs <filmDir>` (1920x1080 directly; finds the toon-shorts engine automatically).
4. Stills + checks: `FILM_DIR=<filmDir> node <skill>/scripts/render_parallel.cjs stills 12.5 40 …`,
   contact sheet `FILM_DIR=<filmDir> bash <skill>/scripts/sheet.sh out.png 12.5 40 …`,
   every shot renders: `FILM_DIR=<filmDir> node <skill>/scripts/check_shots.cjs` (3 frames per shot, must say 0 failures).
5. Audio: `FILM_DIR=<filmDir> node <skill>/scripts/export_cues.cjs` → `audio/full_cues.json`; spec
   `{ "speech": "voice.mp3", "cues": "full_cues.json", "out": "full_mix.wav", "music_below_db": 24, "duck_db": 6, "automation": [...] }`;
   `python3 -I <skill>/audio/synth.py full.json` (name must contain "full"). It decodes the voice once (48 kHz), builds the
   music bed from moods (`curious light warm memory hope triumph dark dark2 tension tension2 swell bureau mystery outro silence`)
   and ~40 code-made SFX (`creak page scribble thunk whoosh clink register counter tick pop stamp rain keys rattle hiss hammer flash
   ding jingle coin pour crowd buzz carstart door typing wind shout(order bell) chair sizzle mop chew knife ring cheer heart applause
   scratch street room`), ducks the music under the voice and sums: the voice samples are untouched.
6. Video: render in 3 parallel chunks: `FILM_DIR=<filmDir> node render_parallel.cjs mp4 part0.mp4 0 7868` etc., concat with
   `ffmpeg -f concat -c copy`, mux `-c:v copy -c:a aac -b:a 256k -ar 48000`. Verify with `scripts/verify_av.sh film.mp4 voice.mp3 bed.wav`
   (duration, streams, voice loudness identical with/without bed).

## Film kit (`film-kit/`, loaded by build169 after the places)

| file | what |
|---|---|
| `outfits.js` | `drawNoahDressed(c, p)` — outfits `waiter` (white shirt, black vest, bow tie, long apron, folded napkin), `chef` (double-breasted jacket, black apron, towel), `suit` (slightly too big navy suit, tie, pocket square), `classic`; extra mouths `smirk grim grin`, `expr.worry`, `expr.sweat`; `onlyArms`, `armsLast`; `noahHandWorld(p, side)`; `lifeAt(t, seed)` blink + breathing |
| `people.js` | `drawPerson(c, { who, x, k, sit, arms, expr, item })`, cast `PEOPLE.oma advisor vormieter landlord clerk clerk2 chef sous cook lukas waiterA/B/C boss mother inspectorW inspectorM host`, `PEOPLE.guest(i)`; `talkMouth(t, t0, t1)`, `walkLegs(t)` |
| `clay.js` | `clayShape clayBlob clayBreadBasket clayDessert clayRoulade clayFlowers platePorcelain` |
| `restaurant.js` | `salon(c, cam, t, { tod: golden/evening/night, hz, midY, midGuests, row2Guests })`, `salonLight`; `dineTable chairBack wineGlass waterGlass candle tableDressing chandelier sconce goldFrame curtain wineRack barCounter bigPlant tableLamp` |
| `places2.js` | `drawerSet` (dark kitchen, drawer opening, one lamp) + `drawerLight`, `recipeBook`, `kitchenTiles hangingPans ticketRail spiceShelf` |
| `places3.js` | `proKitchen` (+`kitchenLight`, stove flames, steam, heat lamps), `omaKitchen` (1960s, +`omaLight`, `omaStove`), `shopRoom` (empty / junk / build, +`shopLight`), `amtOffice` (+`amtLight`) |
| `places4.js` | `bedroomNight`, `hildeExterior` (flat), `ceremonyHall` (+`ceremonyLight`), `closedStreet`, `rainWindow` (+`rainLight`), `livingRoom` (`hz`) |
| `street3d.js` | **3D street**: `street3d(c, cam, t, { cam3, tod: golden/day/evening/night, hilde: { state:'empty', guests, star, opening, flowers, board:[a,b,c], queue, closed }, walkers, extra, cars, traffic })`, `street3dLight`, `s3move(k, {a0,a1,d0,d1,f0,f1,y0,y1,ly0,ly1,tx})` (oblique → front dolly), `p3 poly3 plane3 bb3` |
| `room3d.js` | **3D dining room**: `room3d(c, cam, t, { cam3, tod, tables: 'full'|'few'|'empty'|fn(i), extra })`, `room3dLight`, `r3move(k, {...})`, `r3person(x, z, draw)` |
| `draw.js` | hand-drawn overlays: `handStroke handCircle handArrow handCross handText handScale` (balance scale), `costPanel` (table with running SUMME), `titleStamp`, `inkVeil`, `screenDim`, `noahIK` |
| `screens.js` | `phone(c, x, y, w, h, rot, draw, o)` with `appBanking appReview appSearch appVideo appCall`; `pieChart barChart chairGrid iconRow bigIcon menuSheet inviteLetter` |
| `kit.js` | shot list + sync helpers: `shot cue mood at buildShots`, `noahP noahW noahWalkSide P personW gegen camPush whipIn arm RELAX reach`, props `bottle tray keys folder envelope mop calculator paperStack clockBig thoughtBubble memoryLook bankDesk openBook drawPersonHand S3WALK fullGuests` |

### 3D mode (how it works)
Metres, Y up, facades/back wall on the plane Z = 0, camera at Z < 0 (`cam3 = { x, y, z, f, look: [X, Y, Z] }`, yaw from look-at,
vertical shift lens so verticals stay straight). Vertical planes are textured by mapping a cached canvas strip by strip
(`plane3`), floors/ceilings/awnings/balconies are projected polygons (`poly3`), and everything standing (trees, lanterns, cars,
people, tables, Noah) is a depth-sorted billboard drawn in world units (`bb3`, 220 units per metre, so `drawNoahDressed` /
`drawPerson` / `car` work unchanged). Add your own objects with `extra: [{ x, z, draw: (c, cam) => bb3(c, cam, x, z, c2 => …) }]`.
Textures are cached per state — keep the HILDE state stable inside a shot. Typical dollies: exterior `s3move(lt/T, { a0: -.9, a1: -.1,
d0: 25, d1: 17 })` (a > 0 comes from the right), interior `r3move(lt/T, { x0: -6, x1: -2, z0: -15, z1: -12 })`. Keep the camera ≥ 3 m
from the nearest table row. Text on facades/signs is German (shop names, ZU VERMIETEN, NEUERÖFFNUNG, MITTAGSTISCH …).

## Thumbnail prompts (the user generates the image elsewhere)
Write the prompt in English, no text in the image unless asked, say that the user attaches Noah's reference and that his design
must match it 1:1 (flat 2D cartoon, thick outline, do not make him realistic). **Noah big: waist-up only, very close to the camera,
filling the left 40–45 % of the width, head ≈ 45–50 % of the image height** (the user complained "knee-up" made him tiny); put
that framing first in the prompt and add a negative prompt (full body, small character, text, logo, changed design …).
Cinematic light (warm rim light on Noah, warm/cool contrast), balanced colours (neither neon nor washed out), one clear second
focal point (glowing notebook, lonely coin on a big plate, golden star, restaurant facade at blue hour).

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
Font: Inter Bold embedded (OFL, `assets/fonts/LICENSE-Inter.txt`); it covers German umlauts and ß. Card texts in German
(e.g. titles ZEITREISE, WELTBEVÖLKERUNG, BERECHNUNG; column heads EPOCHE, JAHR, BEVÖLKERUNG).

## Examples

- `examples/kit-demo/` — 12 s: 3D street dolly, 3D dining room with Noah carrying a tray, waist-up Gegenbewegung with a card (`node scripts/build169.mjs examples/kit-demo`).
- KAMRANN repo `films/luxusrestaurant/` — the full narrated film (sync, 3 scene files, audio spec) to copy patterns from.

- `films/time-travel-demo/` — Noah walks in the forest; German corner cards: ZEITREISE counts 2026 → 8000 v. Chr. with timeline and calculation, WELTBEVÖLKERUNG table.
- `films/stone-age-wakeup/` — primitive Noah (beard, wild hair, fur) wakes up in a cave at dawn.
- `films/places-demo/` — stills: forest + animals, stone-age night camp, office, golden-hour city, animal line-up.
- `films/noah-sleep/`, `films/stone-age-camp/` — older vertical tests (before the 16:9 rule).

## Not covered yet

Side profile has no sitting/lying pose and no outfits other than classic/caveman (in the 3D street a suited/waiter Noah walks in front view with `walkLegs`); no 3/4 view; the sheet's angry/confused/thinking/pointing
poses are not coded. Measure them from `reference.jpg` before using them and tell the user rather than improvising a
different-looking Noah.
