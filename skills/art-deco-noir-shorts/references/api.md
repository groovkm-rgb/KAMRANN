# Engine API (assets/engine) — what you write `scenes.js` against

Everything below is global in the built file. Frame = 1080 x 1920 (`W`, `H`), `FPS` = 24,
`DURATION` from film.json. A shot function is `function shotN(ctx, t)` where `t` is seconds since
the shot's start (it can be slightly negative or past its end during dissolves — use `prog`/`track`,
which clamp).

## Contents
1. Timeline & transitions · 2. Time & easing · 3. Camera & parallax · 4. Lights · 5. Cast & heads
6. Bodies & poses · 7. Hands & props · 8. Sets & architecture · 9. Atmosphere & FX · 10. Recipes

## 1. Timeline & transitions
```js
const SCENES = [{ id: 1, name: 'The Dig', start: 0, end: 5.5, draw: shot1 }, ...]; // must tile 0..DURATION
const TRANS = [{ at: 5.5, type: 'dissolve', dur: 0.8 }, { at: 13, type: 'dip', dur: 0.6 }];
```
Transitions are centred on boundaries, so both neighbouring shots must draw sensibly up to `dur/2`
outside their range. The player adds fade-in from black (0–1.1 s), film grain/vignette/flicker, and
fades to pure black at the end (`fadeOut` in film.json, default duration − 1.4 s).

## 2. Time & easing
- `prog(t, a, b, ease?)` → eased 0..1 between a and b (clamped). `pulse(t, a, b, ramp)` → 0→1→0.
- `track(t, [[t0, val], [t1, val, Ease.inOutCubic], ...])` → interpolates numbers or `{x,y,z}` objects.
- `Ease`: linear, inSine, outSine, inOutSine, inQuad, outQuad, inOutQuad, inCubic, outCubic,
  inOutCubic, inOutQuint, outExpo, inOutExpo, outBack, smooth, smoother.
- `lerp, clamp, inv`; noise: `hash(n)` 0..1, `hash2(a,b)`, `snz(x, seed)` −1..1 smooth, `fbm`.
- Colour: `rgba('#hex', a)`, `mixc(a, b, t)`, `darken`, `lighten`.

## 3. Camera & parallax
```js
const cam = track(t, [[0, { x: 540, y: 1000, z: 1 }], [6, { x: 556, y: 780, z: 2.2 }, Ease.inOutQuad]]);
setCam(ctx, cam, 0.3);  // far layer (sky/city)    — moves & zooms less
setCam(ctx, cam, 1);    // main plane (characters)
setCam(ctx, cam, 1.25); // foreground (curtains, rope, shoulders) — moves more
setScreen(ctx);         // screen space (overlays, haze, smoke from out.ember)
```
`cam = {x, y, z, r}`: world point shown at frame centre, zoom, roll. `camPt(cam, x, y, depth)` →
screen point (use for per-vertex perspective floors/tables). `G.shakeX/G.shakeY` add shake (reset to 0).
A clip set at one depth persists when you `setCam` another depth (windows: clip at 0.9, draw city at 0.1–0.4).
**Leave no gaps between layers:** paint far layers taller than needed, because different depths drift apart as the camera moves.

## 4. Lights
```js
const L = mkLight({ dir: [x, y, z], key: '#ffa84e', keyAmt: 0.45, mul: '#45253f', rim: '#a99aee', rimDir: [0.2, -1], rimW: 5, rimA: 0.85 });
```
`dir` points toward the key light (x right, y down, z toward camera; z<0 = backlight →
silhouettes). `keyAmt` tints lit colours, `mul` is the multiply shadow colour, `rimDir` the
direction the rim light comes from. `withL(L, flash)` boosts rim for lightning/photo flashes.
**Light the side the face is turned toward**; a profile lit from behind reads as a blank head.
Proven presets: desk lamp `[-0.78,0.3,0.5]` amber; window backlight `[0.62,-0.2,-0.76]` lavender;
top light `[0.25,-0.75,0.55]`; dawn `[0.65,-0.3,0.6]` gold; noir eye-light (draw the head twice,
dark, then a clipped band lit — see mafia `s6Eyes`).

## 5. Cast & heads
`HEAD` presets: `boss`, `rival` (pencil moustache), `accountant` (bald, round glasses), `ltA`–`ltD`
(lieutenants), `guard` (fedora). With `library museum-dresden`: `staff`, `det1` (fedora, trench coat),
`det2`, `shade` (anonymous silhouette in knit cap). Matching `OUTFIT` keys exist for each.
New person: add `HEAD.x = { lv: makeLevels(LV_BOSS, { sx, sy, jaw, chin, round }), skin, hair, hairHi,
gray, grayAmt, hl: HL_FULL|HL_SLICK|HL_BALD, browCol, browThick, frown, eyeOpen, iris, nose, stubble,
mouthDown, ear, comb, mustache?, glasses?, hat?: { color, band } | { type: 'cap', color } }` and
`OUTFIT.x = { suit, lapel, shirt, tie, cuff, shoe, pocket?, stripe?, coat?, plain? }`
(`coat` = trench coat to the knees; `plain` = no lapels/tie, e.g. work jacket).

`drawHead(ctx, HEAD.boss, o)` — usually called by bodies through `o.head`. Options:
`yaw` (0 = facing camera, ±π/2 profile, π back), `pitch` (+ looks down), `roll`, `gaze:[x,y]`,
`squint`, `eyeOpen`, `frown` (+ stern, − raised brows), `mouthOpen` (>0.7 shows an open mouth: shock/cheer),
`glint`, `cigar: true`, `cigarSide: -1` (use −1 when a right-facing side figure should show the
cigar in the near mouth corner), `glasses: 'round'|'shades'`, `sweat`, `sweatT`, `detail: 1` (ECU wrinkles,
iris), `noHat`, `out: {}` (receives `out.ember` screen point → `smokeFrom`).

## 6. Bodies & poses
- `drawBossSeatedFront(ctx, { x, y (neck base), s, light, t, breath, cigar, out, head:{…}, handR, handL, elbowR, elbowL })`
  The boss behind a desk/table, facing camera. To put hands *on* a desk: draw body without hands, draw the desk,
  then `drawBossHandsOnly(ctx, bossOpts, { handR: { x, y, rot, pose, fs, glint }, handL, elbowR, elbowL })`
  (`fs` ≈ 0.6 foreshortens hands lying toward the camera; `rot: PI` = fingers toward viewer).
- `drawStandingFront(ctx, { x, y (feet), s, who, view: 'front'|'back', turn (0 back..1 front), arms: 'sides'|'behind'|'clasped'|'hat', head, light, t, breath, ringGlint })`
- `drawSideFigure(ctx, o)` — profile figure (faces right; `face: -1` mirrors). Origin = ground under the hips.
  `sit` 0..1 (`seatH` ≈ 330), `walk` + `phase` (walk cycle), `climb` (phase, ladder legs), `lean`, `bow` 0..1,
  `hand: {x,y}` near-hand target and `farHand: {x,y}` (figure coords, y up negative; shoulder ≈ (6, −1350)
  standing, (6, −800) seated; arm reach ≈ 530), `handPose`, `farPose`, `carry: 'envelope'|'folder'|'torch'`,
  `prop: (ctx, toLocal) => {...}` (draw a held tool between the body and the near arm; `toLocal({x,y})`
  converts figure coords), `headTurn` 0 (pure profile)..1 (toward camera), `head:{…}`, `pass: 'legs'|'upper'`
  (draw legs before a table top and the upper body after it), `out` (gets `out.hand`, `out.torch`, `out.torchDir`).
- `drawBust(ctx, { x, y (neck base), s, who, view: 'front'|'back', light, t, head })` — close-ups.
- Rig guarantees (since the anatomy fix): far leg always visible (sitting/standing still), far arm always drawn
  (on table / thigh / hanging), hand targets clamped to reach. Scale guide: `s` 0.4–0.6 full figures, 2–2.5 busts.

## 7. Hands & props
`drawHand(ctx, { x, y, rot, s, fs, side: 1 right|-1 left, pose, light, skin, ring, glint, det })`; poses:
`flat, rest, fist, two, hold, grip, point`, `mixPose(a, b, t)`. Wrist at origin, fingers toward −y at `rot` 0.
`drawForearm(ctx, elbowX, elbowY, wristX, wristY, w0, w1, suitCol, cuffCol, L, flash)`.
**Gripping a straight handle** (gavel, magnifier, cane): draw the handle first, then the hand with fingers
crossing it — see `gripHand()` in green-vault scenes; a shovel is `shovelProp()` in the well example.
Props: `drawEnvelope, drawFolderTop/Side, drawLedgerTop (page turn), drawCash, drawCoffeeCup (ripple),
drawAshtray, drawRestingCigar (out.ember), drawWhiskey, drawCandlestickPhone, drawDecoLamp (returns bulb pos),
drawGem`. Museum library: `drawVitrine, drawTray, piece*` jewels, `drawBrokenGlass`, `bwPhoto`, `drawScales`,
`drawPalace`, `drawBaroqueSkyline`, `cobbleCanvas`, `drawStreetLantern`, `drawJewelRoom`.

## 8. Sets & architecture
`archPath(x,y,w,h,archH)` (window shape → clip), `drawWindowFrame(ctx, x,y,w,h,archH,{cols,rows,bar,rays,frame,edgeA})`,
`drawCity(ctx, t, cam, { flash, sky:[x,y,w,h], hz, layers:[{sky: SKY.far|mid|near, d, x, y, k, haze}], rain:[…], beams, blimp, bolt })`,
`drawNightSky, drawClouds, drawSkyline`, `drawFluted, drawPilaster, drawFrieze, drawSunburst (halo),
drawSconce, drawDeskFront, drawBossChair, drawChandelier, drawPendant, drawCurtain, drawBlinds, drawFanShadow,
drawCheckerFloor(ctx, cam, {vx,yFar,yNear,xw0,xw1,rows,cols,ca,cb,dFar,dNear}), drawPlankFloor, drawClosedTable,
drawPalm, drawBarShelves, drawDecoDoor(open 0..1)`. Well example adds `decoSun, steppedHills, crackedEarth,
deadTree, strata, ladder, lantern, fountain, waterBody`.

## 9. Atmosphere & FX
`drawRain(ctx, t, {x,y,w,h,n,len,speed,slant,width,color,alpha,seed})`, `drawSplashes`, `drawGlassRain`
(clip to the pane first), `drawRainShadows` (multiply, on faces/walls), `drawSmoke(ctx, t, x, y, k, {alpha,height,wind})`,
`smokeFrom(ctx, t, out, opts)` (from a cigar ember; skip in side views — smoke over a profile reads as tears),
`drawHaze(ctx, t, x,y,w,h, color, alpha, n, seed)`, `drawDust`, `glow(ctx, x, y, r, color, a)`,
`flashAt(t, [{t, peak}])` lightning envelope + `drawBolt`, `drawBeam` (searchlight/torch), `drawCone`
(lamp cone), `shaft` (light shaft polygon), `bokeh`, `paintOverlay` (painted texture), `edgeFill(ctx, path, dx, dy, color, a)` (rim/edge band).

## 10. Proven shot recipes
- **Slow push to a face**: `track` cam from wide (z 1) to the face (z 2–2.5) with `inOutQuad`; head lifts/turns mid-move.
- **One-point perspective room**: table/floor corners via `camPt` with depths 0.9 (far) → 1.35 (near); people
  placed along table edges, scale ∝ (y − horizon).
- **Over-the-shoulder**: foreground `drawBust(view:'back')` at depth 1.3, subject at depth 1.
- **Silhouette + rim**: backlight (`dir.z < 0`), strong `rimW`, city/lightning behind; add a soft `glow` behind the head.
- **Cross-section** (wells, buildings, mines): ground `strata`, a dark shaft, camera tilts with the action.
- **Long shadow**: draw a figure silhouette path with `ctx.transform(0.95, 0.04, -Dx, -Dy, 0, 0)` at the feet, multiply.
- **Eye-light ECU**: head at s≈10 drawn dark, then clipped to a horizontal band and drawn lit.
- **Celebration**: seated/standing `hand` + `farHand` raised in a V (both within reach), `mouthOpen` 1.1, `squint` 0.4.
