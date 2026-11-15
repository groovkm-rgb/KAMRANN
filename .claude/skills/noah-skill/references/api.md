# NOAH engine API (`assets/engine/noah.js`)

The world is a 1920×1080 canvas. Screen y grows downward. Every function takes the 2D context `g`
first. Everything must be a function of `t` (seconds inside the scene). Never use `Math.random`;
use `K.rng(seed)`.

## Film structure (`scenes.js`)

```js
// TITLE: Film title            ← build_film.mjs reads this for <title>
const { F } = K;                // furniture library
const ROOM = K.set((g) => { ...paint static background once... });
FILM({
  fps: 30, fadeIn: 0.3, fadeOut: 0.5,
  music: { mood: 'quirky', gain: 1, seed: 3, bpm: null, key: null },  // or just 'quirky'; mood 'none' = effects only
  autoSfx: true,                                                     // whoosh/swish on fade, wipe and flash
  scenes: [
    { name, dur, set: ROOM,
      in: 'cut'|'fade'|'flash'|'dip'|'wipe', inDur: 0.3,         // transition INTO this scene
      cam: [{t, x, y, z, r}, ...] | (t) => ({x, y, z, r}) | {x, y, z},  // centre, zoom, roll in degrees
      camEase: 'lin',                                             // default ease-in-out between keys
      shake: [[t, amp], ...],                                     // short impact shakes
      light: 1 | -1,                                              // key light from the left (1) or right (-1)
      grade: { tint: '#5a6ab0', tintA: 0.4, warm: 0.12, vignette: 0.32 },
      music: 'sleepy',                                            // optional mood change from this scene on
      sfx: [[t, 'name', gain, {dur, rate, n}], ...],             // sound effects, t in scene seconds
      draw(g, t, K) { ...characters, props that move, fx... },
      post(g, t, K) { ...screen-space overlay (rare)... } },
  ],
});
```

- Camera values are world coordinates; `z` = 1 shows the whole frame. Zoom stays crisp up to about
  z = 2, because sets are painted at 2x. The camera is clamped so it never shows outside the set.
- During a `fade` or `wipe`, the previous scene keeps rendering past its `dur`, so `draw` must
  handle `t > dur` (`K.key` and `K.ramp` already clamp).

## Math and animation helpers

| helper | use |
|---|---|
| `K.key(t, [[t0, v0], [t1, v1], …], ease?)` | keyframes. Values can be numbers, arrays or objects; strings switch at the midpoint. Default ease is in-out. |
| `K.lerp, K.ramp(t, a, b), K.sm, K.eio, K.eout, K.clamp` | basics |
| `K.blinkAt(t, seed)` | natural blink amount 0..1. Pass it as `blink`. |
| `K.flicker(t, seed)` | 0.5..1 flicker for fire, screens and lamps |
| `K.rng(seed)` | deterministic random |
| `K.shade(hex, k)`, `K.mixc(a, b, u)`, `K.rgba(hex, a)` | colour |

## The character: `K.noah(g, opts)` → `{ head, top, hands: [L, R] }` (world coords)

Feet stand at `(x, y)`. A standing figure is about 640 px tall at `s = 1` (with a cap).

| option | values |
|---|---|
| `x, y, s, flip` | position (feet), scale, mirror |
| `view` | `front` (default) or `side` (profile, facing +x; `flip` faces −x). `walk` defaults to `side`. In side view `armR` is the near arm and `armL` is the far, darker arm. |
| `pose` | `stand` · `walk` (set `step` = cycles, e.g. `t * 1.4`) · `sit` (on a chair/sedir/sofa seat about 280·s above y) · `lie` (in bed: `(x, y)` is the head centre on the pillow; options `blanket`, `blanketPattern`, `breath`, `handsOut`) |
| `outfit` | preset name or object (below) |
| `eyes` | `open` · `wide` · `tired` · `sleepy` · `closed` (asleep) · `happy` (^ ^) · `sad` · `worried` · `angry` · `dizzy` · `x` |
| `look` | `[lx, ly]`, each −1..1: where the pupils point |
| `blink` | 0..1 |
| `bags` | 0..1: dark circles under the eyes (great for "no sleep", "sick", "stress") |
| `blush` | 0..1 |
| `turn` | −1..1: slides the face toward a 3/4 view |
| `headTilt` | radians (a nod, dozing off, a confused tilt) |
| `bob` | px: breathing or bouncing offset of the upper body (negative = up) |
| `wide` | true = feet apart |
| `armL`, `armR` | preset name, or `[[ex, ey], [hx, hy]]` offsets from the shoulder (for animating with `K.key` between `K.ARMS.*`), or `{E:[x,y], H:[x,y]}` absolute local coords |
| `holdL`, `holdR` | `'tea'` · `'mug'` · `'coffee'` · `'phone'` · `'book'` · `'clock'`, or `{ item, tilt, color, s, empty }` |
| `t` | scene time (drives wave, typing, dizzy eyes and the sleepcap swing) |

**Arm presets** (`K.ARMS`): `hang`, `hip`, `wave` (animated), `point` (index finger), `up`,
`chin`, `face` (rub eyes), `hold` (object at the chest), `drink` (cup at the face), `rest` (hand on
the knee when sitting), `cross`, `front`, `type` (animated keyboard), `forward`, `shrug`, `head`
(hand on the head), `swing` (walk; follows `step`).

**Side-view arm presets** (`K.SIDE_ARMS`, x = forward): `hang`, `hold`, `drink`, `point`, `forward`,
`up`, `wave`, `chin`, `face`, `rest`, `type`, `cross`, `hip`, `head`, `shrug`, `swing`.

To animate an arm smoothly:
`armR: K.key(t, [[0, K.ARMS.hold], [0.8, K.ARMS.drink]])`.

### Outfits (`K.OUTFITS`)

`villager` (flat cap, knit cardigan, red scarf, knickerbockers, boots) · `villageGirl` (dark dress,
white collar, braid) · `granny` (headscarf, cardigan, floral skirt, slippers) · `pajamas` (striped,
messy hair) · `office` (shirt, tie, belt, short hair) · `casual` (hoodie, jeans, sneakers) ·
`winter` (tweed coat, beanie, scarf) · `student` (sweater, glasses, curly hair) · `worker`
(denim shirt, hard hat) · `chef` (white coat, apron, chef hat) · `summer` (t-shirt, shorts, cap).

A custom outfit can be written inline or spread from a preset:
```js
outfit: { ...K.OUTFITS.office, top: { type: 'sweater', color: '#3f6e5a', pattern: 'knit' }, hat: { type: 'beanie', color: '#d84a3a' } }
```
- `top.type`: cardigan, sweater, shirt, pajama, coat, dress, hoodie, tshirt, vest. Set `sleeve: 'short'` to show white arms.
- `bottom.type`: trousers, knickers, shorts, skirt, pajama.
- `pattern` (works on tops and bottoms): knit, rib, tweed, stripes, hstripes, check, plain, denim, floral, dots.
- `shoes.type`: boots, shoes, sneakers, slippers. `socks` is a colour.
- `hat.type`: flatcap, beanie, sleepcap, hardhat, cap, fedora, headscarf, chef, none.
- `hair.type`: none, short, messy, curly, braid, bun, long.
- Extras: `scarf`, `tie`, `belt`, `apron` (colours) and `glasses: true`.

**Never change the head itself.** It is always the white head with two black oval eyes, no mouth,
no nose and no skin colour, and the hands are always white gloves. Identity comes from clothes,
hair and hats.

## Hands and feet
`K.glove(g, x, y, angle, 'open'|'grip'|'point', mirror)` draws a white glove with four fingers, a
thumb and a cuff. `K.shoe(g, x, y, side, {type, color})` draws a front shoe and
`K.shoeSide(g, x, y, {type, color}, rot)` a side shoe with sole, heel and laces. The rig uses them
automatically.

## Sound (`scripts/audio.py`, run by `render_mp4.mjs`)
**Never speech or subtitles.** The music is synthesized from `music.mood`. The moods are `quirky`
(pizzicato + bassoon, the "what happens if" explainer sound), `cozy` (guitar + accordion), `folk`
(Anatolian hicaz saz + darbuka), `sleepy`, `dreamy` (music box), `mystery`, `tense`, `sad` (piano),
`happy` (ukulele, claps, whistle), `epic` and `none`. Set `scene.music` to switch the mood at that
scene (crossfaded).

**Sound effects** (`scene.sfx` entries `[t, name, gain, {dur, rate, n, seed}]`):
- steps: `step`, `step-wood`, `step-snow`, `step-grass`, `step-street`. `K.steps(t0, t1, rate, name, gain)`
  makes footsteps that match `step: t * rate`.
- transitions and cartoon: `whoosh`, `swish`, `pop`, `boing`, `ding`, `sparkle`, `chime`, `slide-up`,
  `slide-down`, `dizzy`, `fail` (sad trombone), `tada`.
- time: `tick`, `ticks` (`dur`, `rate`), `clock-fast`, `alarm`, `cuckoo`, `bell`.
- drink and kitchen: `sip`, `gulp`, `clink`, `cup`, `pour`, `kettle`, `drip`.
- ambience (use `dur`): `fire`, `wind`, `rain`, `birds`, `crowd`, `car`; also `owl`.
- body (non-verbal only): `snore`, `heartbeat` (`n`).
- objects: `typing`, `click`, `phone-buzz`, `notify`, `page`, `rustle`, `writing`, `thud`, `knock` (`n`), `door`.

## German text in the scene
`K.text(g, str, x, y, {size, font: sans|serif|hand|mono|display, weight, color, align, maxW, rot, outline})`
(use `\n` for multiple lines). Ready-made props: `F.poster(x, y, w, h, {title, lines, accent, pic})`,
`F.sign(x, y, w, h, label)`, `F.note(x, y, label)`, `F.chalkboard(x, y, w, h, lines)`,
`F.calendar(x, y, {label, month})`, the phone item `{time: '03:47', text, lines: [...]}` and the book
item `{title, lines}`. All text is German, e.g. "Bäckerei", "Schlaf ist wichtig", "Tag 30",
"Wecker: 06:00".

## Items: `K.item(g, name, x, y, s, opts)`
`tea` (with `tilt` and `empty` 0..1), `saucer`, `mug`, `coffee`, `phone` (screen glow), `book`,
`clock` (alarm clock: `time` 0..1, `ring` for vibration arcs), `pillow`, `plate`.

## FX
| call | notes |
|---|---|
| `K.steam(g, x, y, t, {s, a, h})` | tea, food, kettles, breath |
| `K.zzz(g, x, y, t, {s, n})` | sleep Zs, drawn as shapes |
| `K.sweat(g, x, y, s, t)` | falling drop |
| `K.dizzy(g, x, y, t, {r, s, n})` | stars orbiting the head (`x, y` = `r.top`) |
| `K.burst(g, x, y, u, {r, n, color})` | surprise lines, `u` 0→1 |
| `K.thought(g, x, y, w, h, inner(g, cx, cy, w, h), {from, a})` | thought bubble with any drawing inside (a dream, a wish, a memory) |
| `K.snow / K.rain(g, [x, y, w, h], t, {n, size, seed})` | weather in a rect (the whole frame or a window) |
| `K.motes(g, rect, t)` | dust in light |
| `K.beam(g, pts, {color, a, from, to})` | light shaft polygon (window light, moonlight) |
| `K.glow(g, x, y, r, '255,214,140', a)` | lamps, fire, screens |
| `K.star(g, x, y, r, rot, fill)` | single star shape |

## Sets (static, inside `K.set`)
| call | notes |
|---|---|
| `K.ceiling(g, {y1, color, beams})` | |
| `K.wall(g, {x0, x1, y0, y1, color, wainscot: {y, color}})` | painted plaster |
| `K.floor(g, {y0, type: planks\|tiles\|stone\|carpet, color, color2, vp})` | perspective floor |
| `K.rug(g, [[tl], [tr], [br], [bl]], {style: kilim\|plain\|round, color, color2, color3})` | |
| `K.window(g, x, y, w, h, {outside: {season, time, village}, cols, rows, curtains, plant, sill})` | `outside` may also be a function `(g, x, y, w, h)` |
| `K.landscape(g, x, y, w, h, {season, time, village})` | sky + mountains + village + ground in a rect |
| `K.outdoor(g, {season, time, groundY, village, path})` | full-frame exterior. Characters stand at about `groundY + 120`. |
| `K.sky, K.mountains, K.house, K.tree, K.stoneWall` | building blocks (`tree` type: bare, pine, leafy, autumn; `house` style: stone, plaster, wood, brick) |

`season`: winter, summer, autumn, spring. `time`: day, golden, dusk, night, overcast.

**Furniture `K.F.*`** (y is the floor contact point):
`sedir(x0, x1, y)`, `bed(x0, x1, y, {made, blanket})`, `nightstand(x, y)`,
`lamp(x, surfaceY, {on})`, `hangingLamp(x, y, {top, on})`, `wallClock(x, y, r)` (with
`K.clockHands(g, x, y, r, hours)` in `draw` for moving time), `desk(x0, x1, y, {h})`,
`computer(x, deskTopY, {on})`, `chair(x, y)` (a character sitting at the same `x, y` fits it),
`sofa(x0, x1, y)`, `stove(x, y, {teapot})` (returns `{spout, fire}`), `lowTable(x, y)` (returns
`{top}`), `table(x0, x1, y, {cloth})`, `shelf(x0, x1, y, {items: jug, plates, books, jar, plant})`,
`frame(x, y, w, h, {inner})`, `plant(x, y, {s})`, `wardrobe(x, y)`, `door(x, y, {open})`,
`counter(x0, x1, y)`, `fridge(x, y)`, `streetLamp(x, y, {on})`, `firewood(x, y)`,
`calendar(x, y, {label, month})` (German text, only when the story needs it), `poster`, `sign`, `note`, `chalkboard`,
`radiator(x, y)`.

Depth order is draw order. Anything that must sit in front of the character (a table edge, a
blanket, a counter) is drawn in `draw()` after `K.noah`, not inside the set.

## Proven recipes
- **Drinking:** `armR: K.key(t, [[a, K.ARMS.hold], [b, K.ARMS.drink], …])`, `holdR: {item: 'tea', tilt}` with tilt −0.5 while at the face, `eyes: 'happy'` or `'closed'` during the sip, and steam only while upright.
- **Getting tired over time:** animate `bags` from 0 to 1 and `eyes` open → tired → sleepy → closed, add `headTilt`, and finish with `K.zzz`.
- **Time passing:** spin `K.clockHands`, change `time` between scenes (day → golden → night), or hard-cut through a `flash`.
- **Explainer beat ("your brain…", "after 7 days…"):** a thought bubble with the idea drawn inside, or a quick location change with `in: 'wipe'`.
- **Walking across a set:** move `x` with `t`, `step: t * 1.3` (profile view is automatic; `flip: true` walks left), add `sfx: K.steps(0, dur, 1.3, 'step-snow')`, and follow with a function camera `(t) => ({ x: lerp(...), y, z: 1.25 })`. Speed: x should move about 230·s px per step cycle so the feet don't slide.
