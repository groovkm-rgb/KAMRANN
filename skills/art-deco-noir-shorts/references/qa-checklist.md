# Frame QA checklist

Look at the contact sheet *and* full-size crops of every face and every pair of hands. Each item
below is a defect that actually happened in earlier films, with the fix that worked.

## Anatomy
| Symptom | Cause | Fix |
|---|---|---|
| One-legged seated/standing side figure | both legs in the same pose | rig now sets the far leg apart; if you override leg poses, keep the far leg offset |
| Missing far arm | only `hand` given | rig now always draws the far arm; for two-handed actions give `farHand` |
| Arms stretched like rubber | hand target beyond reach | rig clamps to reach, but aim targets within ~530 units of the shoulder anyway |
| Elbow sticks out backwards as a horizontal band | target too close to the shoulder | lower/forward the target (shovel hands near the hips, not the chest) |
| Hand floats beside a tool / points away | hand not gripping | draw the handle first, then the hand with fingers across it (`gripHand` pattern); rotate the whole arm+tool about the elbow |
| Hand grabs air at the top of a ladder | ladder ends below the hands | extend the ladder above the rim |
| Hands hidden behind a desk | desk drawn after the hands | body → desk → `drawBossHandsOnly` |
| Arms cover the face when cheering | both hands overhead in front | spread into a V: near hand forward, far hand back |
| Legs visible inside a hole/pit | nothing occludes them | after the figure, draw the ground in front of the hole (clip below the hole's front rim) |

## Faces
| Symptom | Cause | Fix |
|---|---|---|
| Face reads as a blank dark shape in a 3/4 or profile | key light behind the face | light the side the face turns toward; turn the head a bit more toward camera (`headTurn` 0.45–0.6) |
| Light streak under the eye ("tear") | smoke ribbon rising over a profile, sweat drop, or nose rim | no `smokeFrom` in side views; no `sweat` on profiles; nose rim is already limited to true profiles |
| Cigar looks like a vertical stick | cigar in the far mouth corner | `cigarSide: -1` for right-facing side figures |
| "Bearded" look on top-lit faces | light from straight above | give the key some front component (`dir` z ≥ 0.5) |
| Eyes like sunglasses / bruise patches | over-strong socket or cheek shading | keep `socket` small; don't add custom dark patches |

## Staging & sets
| Symptom | Cause | Fix |
|---|---|---|
| Characters overlap a prop they should stand beside | positions too close | move them clear, or draw them behind with `pass` / draw order |
| Black band between sky and ground during a tilt | parallax layers drift apart | paint far layers far beyond their edge; add a hills/skyline strip at the seam |
| Subject tiny with empty foreground | horizon too high | lower the set or zoom in; fill foreground with ground detail, rims, props |
| Reflections look like ladders/steps | big rectangular dashes | many thin slices with wobble + a soft glow |
| Too dark to read | multiply darkness too strong | lift the multiply colour; let a beam or lamp pick out the subject |
| Figures cut by the frame edge | camera zoom/pan | re-frame; keep two main characters fully inside |

## Content rules
- No letters, digits or symbols that read as text on any prop (stamps, markers, signs, books). Use
  Art-Deco emblems (sunburst, scales); avoid a five-point star in a circle — it reads as a pentagram.
- For real events: anonymous silhouettes for perpetrators, no methods of crime, no identifiable
  real people, symbolic courthouses/gavels instead of invented details.
- Final check from the MP4 itself: duration, frame count, `audio streams: 0`, last frame black.
