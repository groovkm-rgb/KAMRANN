# Frame QA checklist

Look at `sheet.jpg`, then at full-size frames for every face and every pair of hands. Each row
is a defect that happened while building the examples, with the fix that worked.

## Staging
| Symptom | Fix |
|---|---|
| A held prop covers someone's face (teapot in front of her face) | move the actor so the action happens between people / over the table, or swap who receives it |
| Someone walking in passes *in front of* a seated person | list them earlier in `chars` (drawn first = behind), stand them behind the table |
| Wide shot is mostly empty floor, people tiny | raise zoom (seated two-shot z ≈ 1.1–1.35) and set `cam.y` near −380 |
| Character cut by the frame edge in a wide | visible half-width = 540 / z; keep arms (±130 around x) inside |
| Gun / prop points the wrong way after a cut | compute aims with `aimAt` once at top level; never hand-tune angles near ±π |
| Close-up feels static | add a slow push (`CAM.mix(a, b, ease(lt/T))`, +0.1–0.2 z) |

## Anatomy / rig
| Symptom | Fix |
|---|---|
| "Arms down" look like hands on hips | that's the `hip` preset; `down` hangs nearly straight |
| Elbow pops outward in a weird band | hand target too close to the shoulder: move it lower / further out |
| Gun visible in hand before the draw starts | give `item` only when `k > 0` (see the western `draw()` helper) |
| Holster grip shown while the gun is in hand / gone | rig hides it when `main.item === 'gun'`; set `gunGone: true` after it's knocked away |
| Seated person's hands float above the table | use `front` (meets a table top at −280) or lower `dy` |
| Hat floats or sinks when flying back on | `drawHat`'s (x, y) is the head centre: use `headWorld(p)` |

## Faces
| Symptom | Fix |
|---|---|
| Mouth hidden by a big moustache | that's fine for `walrus/horseshoe`; for gasps use `mouth: 'gasp'` (taller) and `up` brows to sell it |
| Expression unreadable at wide size | exaggerate: `pupil` .5, `up` 1, `blush` 1, add `sweat` or a `bob`; or cut to a close-up |
| Everyone blinks together | give each character a different `seed` |
| Eyes look at the wrong person | `look` +x is the facing direction; to look at the camera use `[0, 0]` |

## House rules
| Symptom | Fix |
|---|---|
| Letters/numbers on signs, screens, papers | draw bars and shapes only (`verify_film` greps for `fillText`) |
| Flicker / different result on re-render | something isn't a function of `t`: replace randomness with `rnd(i)` |
| Duration not whole frames | make shot `dur`s multiples of 0.1 s at 30 fps |
