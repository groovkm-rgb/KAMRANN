# Toon engine API

Everything below is global in the built page (engine `toon.js` + `sets.js`, then the film's
`cast.js`, `props.js`, `scenes.js`). Coordinates are **world units**: feet stand on `y = 0`,
negative y is up. A standing person is ~720 tall: hips −250, shoulders −452, head centre −600,
head radius 118. Seated (`sit: 1`) everything above the hips drops by 120 (head centre −480).
Back walls / building fronts sit at y = −140 in the background.

## Contents
1. Film and frame object
2. Characters: `defChar` fields
3. Pose state (per frame)
4. Arms, presets, held items
5. Props
6. Sets (backgrounds)
7. FX
8. Camera helpers and framing numbers
9. Rig queries (hands, muzzles, aiming)
10. Helpers (timing, easing)
11. Recipes

## 1. Film and frame object

```js
defineFilm({
  fadeIn: .3, fadeOut: .5,                 // optional black fades (s)
  shots: [ { name: 'wide', dur: 3, f(lt, T, t) { return { /* frame */ }; } }, ... ],
});
```
Shots tile in order; total duration = sum of `dur` (keep it a whole number of frames at 30 fps,
e.g. multiples of 0.1 s). `lt` = time inside the shot, `T` = shot length, `t` = film time.

Frame object (all optional except `cam`):

| key | meaning |
|---|---|
| `set`, `setOpts` | set name (`'cafe'`, `'street'`, …) or a function `(c, cam, t, opts)`; opts e.g. `{ tod: 'night' }` |
| `cam` | `{ x, y, z, rot }` world point at screen centre, zoom, roll (rad) |
| `blur` | background blur px (wide 2–6, medium 7–10, close-up 12, ECU 16–18) |
| `behind` | `[fn(c, t)]` drawn sharp before characters (chairs, things behind people) |
| `chars` | pose states, drawn in order (later = in front) |
| `front` | `[fn(c, t)]` drawn after characters (tables, counters, foreground props) |
| `fx` | `[fn(c, t)]` world-space effects on top |
| `screen` | `[fn(c, t)]` screen-space (1080x1920) drawing on top |
| `shake` | camera shake amount (px at z=1), e.g. `22 * Math.exp(-age * 7)` |
| `flash` | white flash 0..1 |
| `speed` | angle (rad): adds streaking speed lines (slow-motion feel) |
| `tint` | full-frame rgba overlay (night, warmth); sets may supply one |
| `vignette` | 0..1 (default .3) |
| `letterbox` | 0..1 cinematic bars |
| `fade` | 0..1 black |

## 2. Characters: `defChar({...})`

| field | values |
|---|---|
| `skin` | `'pale' 'light' 'tan' 'olive' 'brown' 'dark'` or `['#fill', '#shade']` |
| `headR`, `height`, `build` | head radius (118); overall scale (1; kids .75); torso width (1; .85 slim, 1.2 wide) |
| `eyes` | `'big'` (white eyes with pupils) or `'dot'` (small black eyes, heavy lids) |
| `lashes`, `blush`, `freckles`, `scar`, `stubble`, `mole` | booleans |
| `brows`, `browColor` | `'thin'` / `'thick'`, colour |
| `nose` | `null` (default, the style), `'small'`, `'round'`, `'big'` |
| `lips` | mouth colour for smiles (e.g. `'#b8344f'`) |
| `hair` | `{ style, color }`; style `bald tufts combover short side long bob ponytail bun curly spiky afro`; color a `HAIR` key (`black brown chestnut ginger blond grey white`) or hex |
| `facial` | `{ style, color }`; style `horseshoe`/`walrus` (big droopy), `thin` (pencil), `handlebar`, `beard`, `goatee` |
| `glasses` | `{ style: 'round' | 'square' | 'shades', color }` |
| `hat` | `{ style, color, band, trim }`; style `cowboy cap flatcap beanie bowler tophat chef headscarf` |
| `top` | `{ style, color, inner, collar, pattern, patternColor }`; style `shirt tshirt sweater hoodie coat vest suit apron dress`; `inner` = shirt strip for coat/vest, apron colour for apron; pattern `stripes dots check` |
| `neck` | `{ style: 'tie' | 'bowtie' | 'bandana' | 'scarf', color }` |
| `badge` | `'star'` |
| `belt`, `holster`, `grip` | `true`/`{color,buckle}`; holster on the facing side; gun grip colour |
| `pants`, `legs`, `shoes`, `skirt` | coloured trousers (else stick legs in `legs` colour), shoe colour, skirt colour (dress adds one automatically) |
| `seed` | different per character so blinks don't sync |

`PAL` has named colours (`red blue navy green teal yellow mustard orange purple pink brown tan cream white grey charcoal black denim maroon`).

## 3. Pose state (per frame)

`{ who: CAST.x, x, y, s, ... }` — build with a small factory per character and override per
shot, e.g. `const ali = (t, o = {}) => Object.assign({ who: CAST.ali, x: -250, s: 1, sit: 1, ...EXPR.content }, o)`.

| key | meaning |
|---|---|
| `x`, `y`, `s`, `sc` | feet position; facing (1 right, −1 left; mirrors everything); extra scale |
| `look: [x, y]` | pupils, −1..1 (+x = facing direction); `[0,0]` at camera |
| `mouth` | `flat smile frown grin laugh o sip blow gasp grit gulp wobble smirk none` |
| `talk` | 0..1 animated talking mouth (overrides `mouth` while open) |
| `worry`, `anger`, `up`, `quirk` | brows: worried (inner up), angry (inner down), both raised, facing-side brow raised |
| `lid`, `pupil`, `blink` | eyelid closure 0..1, pupil scale (.5 = scared), `false` disables auto-blink |
| `blush` | 0..1 extra red cheeks (embarrassed, hot) |
| `sweat` | 0..1 progress of a sweat drop sliding down; omit/−1 for none |
| `vein` | scale of a red anger mark |
| `straw` | angle of a chewed straw in the mouth (`null` = none) |
| `smirk` | 0..1 lifts one side of a big moustache |
| `bob`, `tilt`, `lean` | head offset y (nod: `Math.sin(lt*7)*4`, gulp, hop); head roll; torso lean (rad) |
| `sit` | 0..1 seated (pair with `PROPS.chair` behind and a table in front) |
| `walk` | phase in rad (e.g. `lt * 9`) for a walk cycle; move `x` yourself; `null` stands |
| `main`, `off` | arm specs (§4). `main` is the facing-side arm and is drawn in front of the face |
| `hat` | `false` hides the hat (e.g. it's flying); `hatSq` squash 0.8–1 when it lands |
| `gunGone` | hides the holstered grip |
| `twitch` | finger-twitch phase on the main hand (nervous) |

`EXPR` presets to spread in: `neutral happy laugh grin sad angry worried scared surprised smug sleepy content disgust`.

## 4. Arms, presets, held items

An arm spec is one of:
- a preset name: `down hip hover front hold chest drink sip chin ear text wipe wave up shrug point facepalm blow`
- `{ pose: 'hold', dx, dy, item, itemOpts, ang }` — preset with offsets
- `{ hand: [x, y], ang, item }` — explicit body-local hand target (+x outward/facing side)
- `{ aim: angle, item: 'gun' }` — straight arm along `angle` (0 = forward, −π/2 = up)
- `{ from: specA, to: specB, k: 0..1, arc: 30, item }` — blend (use eased `k`), the hand
  travels on an arc. This is how every gesture is animated: `{ from: 'front', to: 'drink', k: ease(seg(lt, .2, .8)), item: 'teaglass' }`.

Hand targets are body-local, so they follow `sit`, `lean` and `s` automatically. The off arm
uses the same presets mirrored onto the back side. Arms are IK'd (2×108 long; targets beyond
reach are clamped).

Items held in a hand (origin = hand; `ang` rotates it; 0 = upright cup / gun pointing forward):
`gun teaglass mug phone book newspaper flower spoon simit` or any function `(c, opts, t)`.
`itemOpts`: teaglass `{ fill: 0..1, tea }`, mug `{ color, drink, stripe }`, gun `{ grip }`,
phone `{ screen }`, book `{ color }`, flower `{ color }`.

## 5. Props (`PROPS.*`, world space)

| prop | call |
|---|---|
| table | `PROPS.table(c, x, { top: -280, w: 440, color, cloth: '#f7f2e6', check, legs: 'pedestal' })` — draw in `front` |
| chair | `PROPS.chair(c, x, { color })` — draw in `behind` for a seated person at the same x |
| tea glass on saucer | `PROPS.teaglass(c, x, y, { fill, spoon })` (y = surface) |
| mug | `PROPS.mug(c, x, y, { color })` |
| teapot (çaydanlık) | `PROPS.teapot(c, x, y, { color, top })` |
| plate | `PROPS.plate(c, x, y, { simit: true } | { cake: true })` |
| sugar bowl, plant | `PROPS.sugar(c, x, y)`, `PROPS.plant(c, x, y, { s, pot })` |
| tumbleweed, bullet, gun | `PROPS.tumbleweed(c, x, y, r, rot)`, `PROPS.bullet(c, x, y, ang, t)`, `PROPS.gun(c, x, y, rot, grip)` |
| loose hat | `drawHat(c, hatDef, x, y, rot, sq, 118, s)` — (x, y) = where the head centre would be |
| sweat/tear drop | `FX.drop(c, x, y, scale, rot, alpha)` |

Table top at −280 lines up with seated hands in the `front` preset.

## 6. Sets (`set:` in the frame)

`cafe` (wallpaper, wainscot, arched windows, shelf of tea glasses, pendant lamps, counter with
teapot; opts `wall floor panel lamp tod`), `street` (shopfronts, awnings, lamp posts; `tod`),
`park` (hills, trees, bushes, path, benches; `tod`), `room` (window + curtains, sofa, lamp,
bookshelf, rug; `wall floor curtain sofa rug tod`), `office` (blinds, desk + monitor, cabinet,
cooler, plant), `western` (false-front shops, boardwalk, mesas; `tod` default `'sunset'`),
`blank` (`{ color }`). `tod`: `'day' | 'sunset' | 'night'` (night adds stars/moon, lit windows
and a blue tint).

Custom set: a function `(c, cam, t, o) => ({ base, tint })` that calls `layer(c, cam, p, c => {...})`
for parallax layers (`p` .1 sky … .75 walls … 1 floor), drawing the floor fill from y −150 down
in the `.75` layer so there is never a gap (see `SETS.cafe`).

## 7. FX (`FX.*`, world space unless noted)

`flash(c,x,y,ang,k,size)` muzzle/burst (k = life 0..1) · `smoke(c,x,y,age,seed,dir,amount)` ·
`steam(c,x,y,t,{h,n,a})` hot drink · `drop(...)` · `dust(c,t,x0,x1,y0,y1)` drifting motes ·
`puff(c,x,y,k,s)` cartoon cloud · `sparkle(c,x,y,k,s)` · `hearts(c,x,y,t,n)` ·
`impact(c,x,y,k,s)` star burst · `motion(c,x,y,ang,len)` speed lines behind an object ·
`rings(c,x,y,ang,t)` air rings behind a projectile · `zzz(c,x,y,t)` sleeping (drawn as zig-zags, not letters).

## 8. Camera helpers and framing

`CAM.wide(x, z=.88)`, `CAM.full(p)`, `CAM.medium(p)`, `CAM.closeUp(p, z=2.35)`, `CAM.ecu(p, z=5.6)`,
`CAM.two(a, b, z)`, `CAM.ots(from, to)`, `CAM.mix(camA, camB, k)` for moves (use eased k).

Rules of thumb: visible width = 1080 / z. Wide shot of two standing people 840 apart: z ≈ .85–.95.
Two seated people at a table: z ≈ 1.1–1.35. Medium (head + torso): 1.5–1.9. Close-up (head
fills ~half the width): 2.2–2.5. ECU eyes: 5.4–6. Keep heads in the upper half of the frame.

## 9. Rig queries

`handWorld(p, 'main' | 'off', t)` → `[x, y]` · `headWorld(p)` → head centre ·
`muzzleWorld(p, t)` → `{ x, y, ang }` of a gun in the main hand ·
`aimAt(p, [x, y])` → angle for `{ aim }` so the gun points at the target (compute once at top level).

## 10. Helpers

`seg(t, a, b)` 0..1 ramp · `ease`, `easeIn`, `easeOut`, `easeBack` · `bump(t, a, b)` 0→1→0 ·
`keys(t, [[t0, v0], [t1, v1], …])` eased keyframes (numbers or `[x, y]`) · `hold(t, kf)` stepped ·
`lerp`, `clamp`, `rnd(i)` deterministic noise · drawing: `circle ell rrect line fs star heart shade`.

## 11. Recipes

- **Sip:** `main: { from: 'front', to: 'drink', k: ease(seg(lt, .2, .8)), item: 'teaglass' }`, `...EXPR.content`, steam `FX.steam` above the glass while it is on the table.
- **Too hot:** after the sip, `mouth: 'gasp'`, `blush: 1`, `pupil: .45`, `up: 1`, short `shake`, `FX.smoke` puffs from both sides of the head, `sweat` rising.
- **Laugh:** `...EXPR.laugh`, `bob: -Math.abs(Math.sin(lt*12))*8`, `tilt: Math.sin(lt*12)*.04`.
- **Walk in:** `x: lerp(900, 95, ease(seg(lt, 0, 1)))`, `walk: lt * 9` while moving, `null` when arrived; draw him first if he passes behind others.
- **Pour:** held item function (see cafe `heldTeapot`), tilt with `ang`, stream = a quadratic curve from the spout to the glass.
- **Quick draw:** `{ from: { pose: 'hover', ang: Math.PI/2 }, to: { aim }, k, item: 'gun' }`, flash + white `flash` + `shake` on the shot frame, recoil = add a decaying negative angle to `aim`.
- **Slow motion:** camera follows the object at z ≈ 3, `blur: 18`, `speed: angle`, `FX.rings`.
- **Hat flies / lands:** `hat: false` on the person + `drawHat` along a parabola; landing: `hat: true`, `hatSq: 1 - .18 * bump(...)`, small `bob` dip.
- **Nervous:** `EXPR.worried`, `sweat: seg(...)`, eyes dart with `keys` on `look`, `twitch` on a hand, gulp = `mouth: 'gulp'` + `bob` dip.
- **Night street:** `set: 'street', setOpts: { tod: 'night' }`.
