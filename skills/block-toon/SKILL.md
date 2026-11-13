---
name: block-toon
description: Make silent vertical (9:16, 1080x1920, 24 fps) 2D cartoon shorts in a flat adult-animation "block-toon" look — clean black ink outlines, flat colours with one cel-shade tone, long-necked sleepy-eyed characters (heavy upper lids, long noses, buzz cuts, track pants with stripes, sneakers; hoodies, tank tops, tees, shorts, sunglasses) living around Soviet-era panel apartment blocks — in ANY season and time of day: winter nights with snow, sodium lamps and breath clouds, hot summer days with sun, poplars, laundry on balconies and drifting poplar fluff, warm summer evenings. Drawn with HTML Canvas and exported as a frame-exact MP4 with no audio and no on-screen text. Use whenever the user asks for an animation "bu tarzda", sends reference stills of this style, or wants a cartoon / Reel / TikTok / Short with panel blocks, courtyards (avlu), bus stops, kitchens, eşofmanlı / kapüşonlu / atletli characters, kış or yaz scenes.
---

# Block-toon

You turn a short mood or story into a finished, silent, vertical cartoon clip: one self-contained
HTML file plus an MP4. The look lives in `assets/engine.js` (themes, sets, props, particles, finish)
and `assets/character.js` (cast, outfits, poses, faces). Your job is direction: write the shots in
one `scenes.js`, look at frames, fix what looks wrong, render, deliver.

Talk to the user in their language (often Turkish). Code comments in English.

## House rules

- **9:16, 1080x1920, 24 fps, exact duration**, no audio stream, **no text in frame** (no
  `fillText`; posters/signs are blank shapes and scribble lines). The user adds sound later.
- **The look:** black ink outline on everything (`ink()`), flat fills, at most one shade tone per
  surface, no gradients on characters. Colour comes from the active **theme**; grain + vignette +
  `tint()` in `post`.
- **Characters** are long-necked and tired: heavy lids (`lid` ≈ .45–.62), small pupils, long nose,
  nasolabial lines, pursed full lips. Acting is subtle — side-eye (`look`), cross-eyed stare
  (`cross`), slow blink (`lid` → 1 for ~3 frames), faint smirk (`smirk`), exhale/blow (`mouth`).
- **Motion on twos:** pass `t: twos(t)` and time beats with `twos(lt)` so characters move at 12
  drawings/s like TV animation; particles and camera stay smooth.
- **Deterministic:** everything is a function of `t`; use `hash()` instead of `Math.random`.
- **Mood over action:** 2–4 shots per 5–10 s, slow push-ins, one small beat per shot.

## Seasons / themes

Call `theme(name)` at the top of every shot's `draw()`:

| theme | sky & light | ground | particles | typical props |
|---|---|---|---|---|
| `winterNight` | navy sky, warm lit windows, lamps on | snow (`bank`, `specks` = little o's) | `snowfall`, `snowStreaks`, `breath` | `streetLamp`+`glow`, `busShelter` (snow roof) |
| `summerDay` | blue sky, `sun`, `cloud`, window glints | grass mounds, `asphalt` with cracks | `fluff` (poplar fluff), `heatLines` | `tree` (poplar/round/birch), `bush`, `bench`, balconies with laundry & dishes |
| `summerEvening` | orange-to-blue sky, lit windows, lamps on | darker grass | `fluff` | same as summer, `glow` on lamps |

Add a theme by copying an entry in `THEMES` (block / window / ground / foliage / sky / tint colours).
For autumn: dry ground, `foliage` in ochre/rust, falling leaves made from `fluff` with a leaf shape.

## Workflow

Scripts are in `scripts/` (Node 18+, ffmpeg, Playwright with Chromium).

1. **Shot list** (say it to the user in 2–4 lines, then proceed): per shot — place, theme, camera
   move, who, outfit, the one action, start/end times that tile the duration exactly.
2. **Scaffold:** copy `assets/templates/` (`film.json` + `scenes.js`, the summer demo) into
   `films/<slug>/`, set `title`, `slug`, `duration`. The winter reference is
   `assets/templates/winter.scenes.js`.
3. **Write `scenes.js`** defining `const FILM = { duration, shots: [...], post }`. Each shot is
   `{ name, start, end, lw, draw(ctx, t, lt, u) }` — `t` global seconds, `lt` local seconds, `u`
   0..1 progress. Use `withCam(ctx, cam, depth, fn)` for parallax (sky .2, far blocks .45, mid
   block .65, trees/ground .8, characters 1).
4. **Look:** `node scripts/snap.mjs films/<slug> <outdir> [t ...]` → PNGs + `sheet.png`. Read the
   frames. Check: arms/neck attached, hands tucked or drawn, eyes not accidentally crossed, props
   not growing out of heads, particles not hiding the face, text-free.
5. **Render:** `node scripts/render_mp4.mjs films/<slug> renders/<slug>.mp4` (H.264, yuv420p, no
   audio). Report duration/frames from the printed ffprobe line.
6. Deliver the MP4 (and `film.html`, which plays in any browser with a scrubber).

## API cheat-sheet

**Engine (`assets/engine.js`)**
- `W, H, FPS, PAL` (characters/props), `THEMES`, `theme(name)`, `TH` (active theme)
- `clamp, lerp, inv(a,b,v), E.inOut/out/in/sine, hash(a,b,c), twos(t)`; `LW` base line width (shot `lw`: 6 wide, 8–9 close-up)
- drawing: `ink(ctx, build, fill, lw, stroke)`, `stroke(...)`, `poly(pts)`, `smooth(pts)`, `ellipse(...)`, `rect(x,y,w,h)`, `blob(x,y,rx,ry,n,seed)`
- camera: `withCam(ctx, {x,y,zoom}, depth, fn)`
- sky/light: `sky(ctx)`, `sun(ctx,x,y,r)`, `cloud(ctx,x,y,s,seed)`, `glow(ctx,x,y,r,'r,g,b',a)`
- buildings: `panelBlock(ctx, {x,y,w,h,floors,cols,seed,side,far,lit,t,onAt,balconies,laundry,dishes,lw})`
- street: `streetLamp(ctx,x,baseY,h,dir)` → lamp-head point, `busShelter(ctx,x,groundY,w,h)`, `bench(ctx,x,groundY,w)`
- ground: `bank(ctx, pts)` (snow drift / grass mound), `specks(...)`, `asphalt(ctx,x0,y0,x1,y1,seed)`
- nature: `tree(ctx,x,groundY,h,{kind:'poplar'|'round'|'birch',seed,t})`, `bush(ctx,x,y,w,h,seed,t)`
- particles: `snowfall`, `snowStreaks`, `fluff(ctx,t,{n,seed,speed,size,wind})`, `fluffTuft(ctx,x,y,r)` (a single hero tuft), `breath(ctx,t,t0,x,y,{dir,dur,size})`, `heatLines(ctx,t,x0,x1,y)`
- finish: `tint(ctx)`, `vignette(ctx,a,'r,g,b')`, `grain(ctx,t,a)`, `fade(ctx,a,'r,g,b')`

**Characters (`assets/character.js`)**
- Casts: `lanky` (orange flat-top, black zip hoodie, blue track pants), `stocky` (blond, moustache,
  green/lilac jacket, short neck), `oldman` (navy beanie, walrus moustache), and summer outfits
  `lankySummer` (white tank), `stockySummer` (red tee, shorts, sunglasses), `oldmanSummer` (tee).
- `drawFigure(ctx, {cast, x, y (ground), s, t, top:'hoodie'|'tank'|'tee', bottom:'track'|'shorts',
  topCol, topShade, pose:'pockets' (hoodie pouch)|'hips' (hands in trouser pockets)|'down' (arms hanging),
  shades, sway, lid, look, cross, lookY, mouth, smirk, headTilt, lw})` → `{chin, mouth}` points.
  Full figure ≈ 1790·s px; s≈.4–.6 for wides, s≈1.5 with feet below frame (y≈3330) for a
  chest-up close-up (nose tip then ≈ (x−40, 838)).
- `drawHead(ctx, {cast, x, y (chin), s, ...})` for heads alone (crowd behind glass, window, etc.).
- New casts: copy an entry (skin, hair*, hairStyle 'buzz'|'beanie', moustache 'brush'|'walrus',
  hoodie*, pants*, shorts, top, bottom, topCol, shades, neck, faceW, faceL).

**Extending:** new props (flip phone, Zippo, kitchen stove, radiator, tiled wall, fur-hood girl,
kvass barrel, swing set, garages…) go into the film's `scenes.js` first, built from
`ink`/`poly`/`smooth`/`tube`; if reused, move them into the engine. Keep outline weight and
flat-fill rules so they match.
