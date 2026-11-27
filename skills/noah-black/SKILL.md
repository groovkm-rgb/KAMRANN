---
name: noah-black
description: NOAH BLACK — the user's character Noah with jet-black skin, plus a cast of DIFFERENT black-skinned characters (men, women, children, elders; each with own height, build, hairstyle, clothes) for his world, in places like the city street, forest, cave and office. 16:9 (1920x1080) stills and, only on explicit request, silent MP4s. Use when the user asks for "Noah Black", "siyah Noah", "siyah karakterler", or a Noah scene where everyone is black. The original white Noah stays in the separate noah-character skill; do not change that one from here.
---

# NOAH BLACK

Talk to the user in Turkish. Code comments in English. All on-screen text in frames is German (signs, cards, labels),
except Noah's shirt name "Noah".

NOAH BLACK is a separate skill from `noah-character`. **Never edit the `noah-character` skill from here**; the original
white Noah must stay as it is.

## The rule of this skill

- **Every character is jet-black skinned** (`#1b1716`, shade `#110e0d`) — Noah and all people.
  **Animals and objects keep their normal colours.**
- Faces stay readable on black skin: light dot eyes `#f4efe8`, light grey brows, light mouth line `#cfc6bd`.
- **Everybody is different.** Noah is drawn only with `noah.js`. Every other person comes from `people.js`
  (`CAST` or `makePerson`), never from Noah's rig with other colours. In one shot no two people share the same
  CAST member, and the crowd mixes men, women, children and elders, different heights, builds, hair and clothes.

## House rules (as in noah-character)

- 16:9, 1920x1080, 30 fps. Noah at `k: .25`, `ink: 1.8`; normal shots `cam.z ≈ 1.3–1.4` (Noah ≈ 45–50 % of frame height),
  wide shots z ≈ 1.0, close-ups 1.7–2.6. Grow people by zooming the camera, never by `k`. 1 m ≈ 220 world units.
- No background blur. Depth comes from parallax, haze, light and value.
- Detailed worlds: every frame has foreground, midground and background. One light idea per shot; `castShadow` under
  every character.
- Warm sun rays (`sunRays`, screen blend) lighten black skin. Keep their alpha around **.13** and the grade's
  `warmA` around **.35**, so the characters still read as black.
- **Do NOT render videos unless the user's own message explicitly asks for a video** ("video yap", "video üret",
  "… saniyelik video"). Samples, tests and changes are PNG stills only. If unsure, show stills and ask.
- Before new features or big changes, show stills and wait for approval, then update this file.

## Files

| file | what |
|---|---|
| `noah.js` | Noah rig (same proportions as noah-character), black palette. `drawNoah`, `drawNoahSide`, `drawNoahHead`, `drawNoahHand` — same API as noah-character |
| `people.js` | the different people: `drawPerson`, `drawPersonSide`, `CAST`, `makePerson` |
| `places/*.js` | forest, stone-age, cave, city, office, animals, light, overlays (copied from noah-character; animals/objects unchanged) |
| `engine/shim.js` | minimal engine globals (`W H OUT rnd circle ell rrect fs line shade clamp lerp ease layer`) so the places run without toon-shorts |
| `scripts/render.cjs` | standalone renderer: PNG stills and, only when asked, MP4 |
| `films/cast-lineup/` | cast sheet still: Noah + all CAST members, front and walking side views |
| `films/street-walk/` | example: Noah walks along a golden-hour shopping street among 11 different people |
| `reference.jpg` | Noah's reference sheet (proportions) |

## Workflow

1. Plan the shots (one light idea each) and say them to the user in a few lines.
2. Make `films/<slug>/film.json` and `films/<slug>/scene.js`:
   ```json
   { "duration": 10, "modules": ["noah.js", "people.js", "places/light.js", "places/stone-age.js", "places/forest.js", "places/city.js"] }
   ```
   Module order matters: `light.js` first among the places. `forest.js` needs `stone-age.js`. `city.js` and `cave.js`
   need `forest.js`. `office.js` needs `city.js`. `overlays.js` needs `fonts.js`. `scene.js` defines
   `renderFrame(c, t)` and draws everything itself (see `films/street-walk/scene.js`): set → `layer(c, cam, 1, …)`
   with props and characters sorted by depth `y` → light (`sunRays`, `motes`) → `grade` → fades.
3. Stills: `node scripts/render.cjs films/<slug> 1 3 5 7 9` → `films/<slug>/stills/t_*.png`. Look at them. Check:
   - faces are readable
   - nobody is cut in half by another person in a bad way
   - the crowd is varied
   - nobody floats or sinks (feet on the ground; seated people on the seat)

   Fix and repeat.
4. **Only if the user asked for a video:** `node scripts/render.cjs films/<slug> --mp4 films/<slug>/<slug>.mp4`.
   It prints an ffprobe line: 1920x1080, exact frame count, no audio.
5. Send the stills (or the MP4 when one was asked for). Say what you checked, and what you did not check.

## Noah API (`noah.js`)

Same as noah-character: `drawNoah(c, { x, y, k: .25, ink: 1.8, arms, expr, tilt, bob, outfit: 'classic'|'caveman', sit, seatH })`,
`drawNoahSide(c, { x, y, k: .25, ink: 1.8, s, walk: t * 8, expr })`. `expr`: `eyes`, `lid`, `look`, `browUp`,
`mouth: smile|soft|flat|o|yawn`, `open`, `beard`, `wild`. Palette keys added for black skin:
- `NOAH.mouth`: colour of the mouth lines
- `NOAH.skinFar`: skin on the far side in side view

Never change Noah's proportions.

## People API (`people.js`)

```js
drawPerson(c, P, { x, y, k: .25, s: 1|-1, ink: 1.8, arms: { l: { a, b }, r: { a, b } }, expr, tilt, bob, sit, seatH })  // front view
drawPersonSide(c, P, { x, y, k: .25, s: 1|-1, ink: 1.8, walk: t * 8 * speedFactor, expr, sit, seatH: 400 })  // side: walk or seated
```

- Arm angles work like Noah's: `a` is measured from straight down. A wave is `r: { a: 2.3 + Math.sin(t * 7) * .35, b: .6 }`.
  A phone at the ear or a hand at the chin is `r: { a: .5, b: 1.9 }`.
- Walk phase: `t * 8 * (speed / 150)`, where 150 units/s is a normal walk at k .25. Add an offset so walkers are not
  in step.
- **Seated: use the side view** (`drawPersonSide(…, { sit: true, seatH })`). A front-view seated person reads as
  standing. `seatH` is in figure units before `k`:
  - city `bench` drawn with `c.scale(.9, .9)` → `seatH: 400`
  - in general, `seatH` = (seat height in world units) / k
- `expr`:
  - `eyes: 'open'|'closed'`
  - `look` (−1…1)
  - `browUp` (0…1)
  - `mouth: 'smile'|'grin'|'flat'|'o'`

### CAST (all different; use each at most once per shot)

| name | who |
|---|---|
| `amara` | young woman, afro puffs, yellow dotted dress, earrings |
| `kofi` | man, red cap, short beard, grey hoodie, jeans |
| `zara` | woman, long braids with gold beads, denim jacket, dark skirt, shoulder bag |
| `baba` | old man, bald, white full beard, glasses, brown cardigan, cane (walks slowly, ~45 units/s) |
| `nia` | little girl, puffs, pink t-shirt, shorts, purple backpack |
| `tunde` | tall man, high-top fade, goatee, navy suit, briefcase bag, watch |
| `grace` | older woman, orange headwrap, green dress, glasses, handbag |
| `malik` | boy, buzz cut, striped t-shirt, shorts |
| `imani` | woman, bun, glasses, white blouse, plum trousers |
| `jamal` | big man, teal beanie, full beard, orange sweater, jeans |
| `ayo` | teen, locs, yellow tank top, shorts |
| `sade` | woman, long straight hair, red coat |

New people: `makePerson({ T, head, bw, hips, legs, hair, hairCol, hatCol, beard, beardCol, glasses, earrings, lashes,
top, topCol, top2, pattern, patCol, bottom, botCol, shoe, bag, backpack, cane, watch })`. Options:

| option | values |
|---|---|
| `T` (height, units) | adult 1450–1660; child 950–1150 (with `head: .86–.9`, `bw: .8`, `legs: .33`) |
| `hair` | `bald`, `buzz`, `grey`, `fade`, `afro`, `puffs`, `bun`, `ponytail`, `long`, `braids`, `locs`, `cap`, `beanie`, `headwrap` |
| `top` | `tshirt`, `shirt`, `jacket`, `hoodie`, `sweater`, `tank`, `dress`, `coat` |
| `bottom` | `pants`, `jeans`, `skirt`, `shorts` |
| `pattern` | `stripes`, `dots` |

## Not covered yet

- People have no 3/4 view.
- Side-view Noah cannot sit.
- People cannot lie down, run, or hold objects (besides cane and bags).
- `ponytail`, `fade` and `headwrap` have only been checked in small sizes.
- `places/overlays.js` and `office.js` load and draw with `engine/shim.js` (one test frame, no errors), but they have
  not been checked in a real scene.
