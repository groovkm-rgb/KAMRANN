# CINECAM: the user's favourite camera language (from the "Zelle 64" Short)

The user said they loved the camera angles and movements of `examples/zelle64/` ("bu kamera açısını ve hareketlerini sevdim").
Use this camera language for new Noah videos, vertical or horizontal. It needs a real 3D space,
so build the location with the small 3D renderer in `places/prison3d/world.js`. That file has two parts: the camera core and the prison block.

## The 3D core (`places/prison3d/world.js`, top part)
- World axes: x across, y UP, z forward. 1 m ≈ 220 units; Noah is k .25 (≈ 382 units).
- `CAM = { x, y, z, yaw, pitch, F }`. yaw 0 looks +z; `HP` = π/2 looks +x. On a +x facade, screen-right = −z.
  `F` is the focal length (1000 normal; 850–900 wide; 1100–1350 for slow zooms).
- Drawing helpers:
  - `P(x,y,z)` → `[sx, sy, scale, depth]`.
  - `PP(pts)` projects a polygon with near-plane clipping. `fillPoly`, `line3`.
  - `onPlane(c, origin, u, v, fn)` draws flat 2D art (plates, chalk, signs, clock) on a wall. The u axis must point to screen-right, or the text comes out mirrored.
  - `billboard(c, x,y,z, fn)` draws a camera-facing sprite in world units at the feet.
- Light:
  - `LT.amb`, `LT.lamps` (point lights `{x,y,z,i,r,c}`), `lightAt`, `shade` (tone-mapped: v/(1+.55v), so stacked lamps never blow out).
  - Fog via `LT.fog/fogNear/fogFar/fogMax`.
  - `glow / glow3` for halos, `drawBeams` for volumetric beams, `motes3` for dust.
- Painter order: background → cells (far to near) → walkway slabs → actors on walkways → railings → ground actors → lamps → beams and motes.

## Characters in light (`examples/zelle64/shots.js` → `litChar`)
Every character is drawn into an offscreen buffer, then composited with:
- a tint by the local light (`lightAt` + extras);
- a `key` wash (warm or cool gradient on the lit side);
- `bars` shadows (diagonal stripes from the cell bars);
- a `rim` light (silhouette minus shifted silhouette, added with 'lighter');
- `blur` for depth of field.

`drawWorld(..., { focus: { n, inBlur, faceBlur } })` gives a rack focus: one cell's interior and facade go to separate layers with their own blur.

Exception to the house rule "no background blur": in cinecam films the user explicitly wanted soft foreground bars and rack focus. Blur only the foreground or the out-of-focus layer, never the far background.

## Shot recipes (times from the 44.9 s Short; scale to the voiceover)
| move | how (CAM keys via `camKeys([[u, x,y,z, yaw,pitch, F?], ...], easedU)`) |
|---|---|
| HOOK: crane-down → diagonal slide → dolly-in | 0–2.25 s, one continuous Catmull-Rom path: from under the roof (y 3150, pitch −.62) down past the floors (y 1300, pitch −.12, yaw .75), sliding diagonally into the walkway and turning to face the cell (yaw π/2), stopping ~200 units in front of the bars. Ease: `ease5`. Noah must be visible by 2 s at the latest. |
| lateral track | camera in the hall, parallel to the facade (yaw ±π/2), moving along z at a steady speed; the subject walks screen left→right (on a +x facade that means −z). Pitch −.3 so the door plates sit at the top edge, out of the caption band. |
| low-angle reveal | camera at walkway height + 100, pitch +.14, looking down the corridor into the dark; the figure with the lantern walks towards the lens; slow push forward. |
| over the shoulder | camera 560 behind and 150 above the walking figure, yaw π+.28, pitch −.2, locked to the figure's z. |
| match-cut close-up | the same framing on two different doors (one closing, one opening), with the slide direction kept left→right across the cut (use the facade where +z is screen-right for the second one). |
| time-lapse | static diagonal view with a big clock in frame; the state flips like piano keys; the figure becomes 3–4 ghost copies with falling alpha; the clock hands spin faster. |
| crane-up wide | from the entrance end: y 900 → 2900, pitch +.22 → −.36, F 920, so the whole block appears with the warm "Ausgang" light at the vanishing point. |
| dolly-in + rack focus | F 850, camera 340 from a brass plate; the plate glows on its word, then the focus pulls to the face behind the bars (in-blur 7→0, face-blur 0→5 over .7 s). |
| half orbit | darkness plus one spot. `yaw = π/2 + a`, a −.5 → +.5, the camera at `center − (sin yaw, 0, cos yaw)·600`, foreground bars blurred 4 px. |
| slow zoom on a realisation | F 1050 → 1350 over the line, the camera creeping in through the bars. |
| finale push → pull-back crane | a slow push-in until the payoff word, then the door opens; `ease5` pull back and up to a high diagonal wide (F 900) while the character runs out. |

Transitions: soft 8-frame dissolves (`tr: 'dis'`), dips through darkness for the thinking beat, match cuts. No flashes, whip pans or shake.

## Light per story beat
- Night mystery: cool teal grade (`temp −.5`), warm practicals (caged lamps, lantern, candles), moon beams.
- Thinking: near black with a single spot cone plus motes.
- Solution: steadily warmer gold (`temp → +.35`).
- Finale: golden dawn (`LT.dawn = 1`) through the high windows and the open exit gate.

## Vertical Shorts layout (when the user asks for 9:16)
- 1080x1920, 30 fps. Keep info cards inside x 120–820 and y 700–1600.
- Keep cards and door numbers out of the caption band (y 250–650), the bottom 300 px and the right 150 px.
- Cards are brass-framed dark glass with a warm glowing Inter text (`brass`, `gtext`, `cardEnv`). All words on cards are German.

## Timing and sound
- Word timings: `pip install faster-whisper`, run with `HF_HUB_DISABLE_XET=1`. Decode the mp3 with ffmpeg to 16 kHz float32 and pass the numpy array (a PyAV mismatch breaks file input). Use `language="de"`, `word_timestamps=True`.
- Cut only in silences (measure them with an RMS gate). Put sync points on the exact word start.
- `examples/zelle64/audio.py`: numpy-synthesised music (pizzicato, celesta, bass, pad, hall reverb) and SFX (steps, keys, iron doors, ticks, chalk, cheers, birds, gate creak). The script:
  1. ducks the music and SFX under the speech envelope;
  2. sets music ≈ 17 dB and SFX ≈ 13 dB under the voice;
  3. runs a two-pass `loudnorm` to −14 LUFS.
  Usage: `python3 audio.py <filmDir with voice.mp3> <duration>`.
- Mux: `-af apad -t <duration>`, never `-shortest` (it drops the last frames).

## Render
`node scripts/render-cine.cjs <filmDir> stills 1.2 5.0 …`, then `… mp4 out.mp4 4` (4 parallel Chromium pages, software canvas).
About 3 min for a 45 s vertical film.

## Pitfalls already hit (check these first)
- **Unbalanced `save()`.** One helper that ended with `c.save()` leaked transform and alpha into later frames. Stills looked fine but the sequential video broke (missing walls, smeared characters). Every helper must restore what it saves. Always look at stills taken from the real MP4 (contact sheet), not only at single renders.
- **Offscreen buffers.** Clip and clear the full used region before reuse, or stale pixels ghost into later characters.
- **Overexposure.** Start lamps dim (wall lamps i .5 r 380, hanging lamps i .75 r 1100, ambient [.1,.13,.19]). Grade with soft-light, then add a vignette.
- **Order of numbers on a wall.** On the +x facade, +z is screen-left. Lay rows of numbers and chalk text along −z.
