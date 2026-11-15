---
name: noah-skill
description: NOAH SKILL. Produce horizontal 16:9 (1920x1080, 30 fps) 2D animated videos in a warm painted storybook style starring one fixed character, NOAH — a pure-white round head with two black oval eyes (no mouth, no nose), white gloves, and a bean body made of clothes (knit cardigans, scarves, caps). Outfits, places, seasons and times of day change per video (village room, bedroom, office, kitchen, snowy street, summer, night…); the character never does. Rendered with HTML Canvas and exported as a frame-exact MP4 with no audio (the user adds voice-over). Use this skill whenever the user asks for a horizontal / YouTube / 16:9 animation, an explainer such as "1 ay boyunca uyumazsan ne olur?", "ne olur eğer…", "what happens if…", a "NOAH" video, "beyaz kafalı karakter", "bu tarzda yatay video", "çay içen adam animasyonu", or another video in the same style as the Köyde Çay / uyku demo films — even if they don't say NOAH.
---

# NOAH SKILL

You turn a topic or script into a finished horizontal animated video: one self-contained HTML
animation plus an MP4. The engine (`assets/engine/noah.js`) already contains the character rig,
outfits, sets, furniture, FX, camera, transitions and player. Your job is direction: plan the
shots, write one `scenes.js`, look at the frames, fix what's wrong, render, and deliver.

Talk to the user in their language (usually Turkish). Keep code comments in English.

## House rules (why they matter)

- **Always NOAH.** The main character is always the same: a white wobbly-round head, two tall
  black oval eyes, no mouth, no nose, no ears, no skin colour, and white gloves. Emotion comes
  only from the eyes (`eyes`, `look`, `blink`, `bags`), the head tilt and body poses. Never add
  a mouth, a face colour or a different head style; that breaks the channel's identity. Other
  people (family, coworkers, a doctor) are the same rig in other outfits.
- **Clothes and places change, the look doesn't.** Pick the outfit and set that fit the story
  (`K.OUTFITS` presets or custom). Keep the warm painted palette, thick dark ink outlines, knit
  and tweed textures, soft light shafts and vignette.
- **16:9, 1920×1080, 30 fps, exact duration.** The user makes YouTube videos.
- **No audio.** The MP4 has no audio stream; the user records the voice-over. Time the shots to
  the script so each beat has its own picture.
- **No on-screen text by default**: no captions, titles or numbers. Explain with pictures:
  clocks, calendars without numbers, thought bubbles, day/night changes. Add text (for example
  `F.calendar({label: '7'})`) only when the user asks for it.
- **Deterministic.** Everything is a function of `t`; use `K.rng(seed)`, never `Math.random`.
- **Readable anatomy.** Hands hold what they hold, there are no floating limbs, the face is never
  covered (except a cup at the face during a sip), and characters stand on the floor. You find
  these problems only by looking at the stills.

## Workflow

Scripts live in `scripts/` next to this file. Call them with `node <skill>/scripts/...`. They need
Node 18+, ffmpeg and Playwright with Chromium (`npm i -D playwright && npx playwright install
chromium` if it is missing). Work in the user's repo (`films/<slug>/`) or a folder they name.

1. **Plan the beats.** Split the topic or script into scenes of 2.5–4 s (a voice-over sentence
   each). An explainer such as "1 ay uyumazsan ne olur?" usually goes: hook → day 1 → a few days
   → a week → a month → conclusion. For each scene choose the place, outfit, time of day, the
   one action, the eye state and the transition. Show the user a short plan in a few lines, then
   continue without waiting unless something is truly ambiguous. Default length: 10–15 s for a
   sample; for a full script, about 2.5 words per second of voice-over.
2. **Scaffold:** `node scripts/new_film.mjs films/<slug> --title "…"`. This gives a working
   two-scene `scenes.js` (tea on the sedir, then a walk in the snow).
3. **Write `scenes.js`.** Read `references/api.md` first: it covers every option, preset and
   recipe. `examples/uyku-demo/scenes.js` is a complete 12 s explainer with four places: a night
   bedroom, a home office, a snowy street and a village room with a thought bubble. Static things
   go in `K.set(...)`, which is painted once. Moving things and anything in front of the
   character go in `draw`.
4. **Build and look:** run `node scripts/build_film.mjs films/<slug>`, then
   `node scripts/snap.mjs films/<slug> <snapdir>`. That makes three stills per scene and a
   `sheet.jpg`. Open the sheet and check:
   - the character reads clearly (big white head, eyes visible, feet on the floor, seated poses
     actually sit on something);
   - hands and props line up;
   - nothing important is cropped by the camera;
   - every frame has foreground, midground and background (no empty walls or floors);
   - each scene has a light idea (a window beam, a lamp glow, moonlight, fire);
   - there is no text unless it was requested.
   Fix the problems and snap again. Expect 2–3 rounds; this is where the quality comes from.
5. **Render:** `node scripts/render_mp4.mjs films/<slug> [out.mp4]`. It renders every frame and
   writes H.264 at 1920×1080 with no audio, then prints an ffprobe line. Run long renders in the
   background. Never deliver a half-written file.
6. **Deliver:** send the MP4 to the user (for example with `SendUserFile`). Report the duration,
   the size, what each scene shows and what you fixed. In a git repo, commit the film folder and
   the MP4 (if it is under about 50 MB) and push when the session expects it.

## When the user asks for changes

Edit `scenes.js`, rebuild, snap only the affected times (`snap.mjs <dir> <out> 4.2 7.5`), then
render again. If the problem is in the rig, a garment or a prop, fix it in `assets/engine/noah.js`
so every future video gets the fix, and say so. To add a new garment, prop or set piece, add it
to the engine (next to the similar ones) and document it in `references/api.md`.

## Files

```
SKILL.md                      this file
assets/engine/noah.js         engine: rig, outfits, items, fx, sets, furniture, FILM runtime
assets/engine/shell.html      page template (the build inlines the engine + scenes)
assets/templates/scenes.template.js
references/api.md             full API and recipes. Read it before writing scenes.
examples/uyku-demo/scenes.js  12 s "1 ay uyumazsan" style sample
scripts/new_film.mjs | build_film.mjs | snap.mjs | render_mp4.mjs
```
