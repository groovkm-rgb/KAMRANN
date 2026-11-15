---
name: noah-skill
description: NOAH SKILL. Produce horizontal 16:9 (1920x1080, 30 fps) 2D animated videos in a warm painted storybook style starring one fixed character, NOAH — a pure-white round head with two black oval eyes (no mouth, no nose), white gloves, and a bean body made of clothes (knit cardigans, scarves, caps). Outfits, places, seasons and times of day change per video (village room, bedroom, office, kitchen, snowy street, summer, night…); the character never does. Characters are drawn from the front or in side profile (walking is always in profile), with human-like gloved hands and real shoes. Rendered with HTML Canvas and exported as a frame-exact MP4 with a synthesized music bed and sound effects that fit the topic — never speech, never subtitles; any text inside the scene (walls, books, phones, signs) is German. Use this skill whenever the user asks for a horizontal / YouTube / 16:9 animation, an explainer such as "1 ay boyunca uyumazsan ne olur?", "ne olur eğer…", "what happens if…", a "NOAH" video, "beyaz kafalı karakter", "bu tarzda yatay video", "çay içen adam animasyonu", or another video in the same style as the Köyde Çay / uyku demo films — even if they don't say NOAH.
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
- **Sound: music + effects, never speech.** No narration, no dialogue, no subtitles or captions. Every
  video gets a melody that fits its topic and mood (`music` in `FILM`, per-scene changes with
  `scene.music`) and sound effects on the actions (`scene.sfx`: steps, sips, ticks, wind, doors,
  pops…). `render_mp4.mjs` synthesizes and mixes them automatically (`scripts/audio.py`, -16 LUFS).
  Pick the mood on purpose: `quirky` for "what happens if…" explainers, `cozy`/`folk` for village
  and home life, `sleepy`/`dreamy` for night and sleep, `mystery`, `tense`, `sad`, `happy`, `epic`.
- **Text inside the scene is always German.** No overlay text at all. When the story needs writing
  in the world — a poster, a shop sign, a book page, a phone screen, a calendar, a sticky note, a
  chalkboard — it is German, spelled correctly with ä ö ü ß (`F.poster`, `F.sign`, `F.note`,
  `F.chalkboard`, `F.calendar({label})`, `K.item(g, 'phone', …, {time, text, lines})`,
  `K.item(g, 'book', …, {title, lines})`, `K.text`). Don't add text the story doesn't need.
- **Front and side views.** A walking character is always drawn in profile (`pose: 'walk'` defaults
  to `view: 'side'`; use `flip: true` to walk left). Use `view: 'side'` for standing, sitting,
  drinking or pointing toward something on the side, and the front view for reactions to camera.
  Never show someone walking sideways across the frame while facing the camera.
- **Human hands and feet.** Hands are white gloves with four fingers, a thumb and a cuff (open,
  gripping, pointing). Feet wear real shoes with soles, heels and laces. Make hands touch what they
  hold.
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
4. **Anatomy check for a new outfit:** `node scripts/rig_sheet.mjs <out.jpg> <outfit>` draws front
   poses, a walk cycle in profile and side poses on one image. Look at the hands and feet.
5. **Build and look:** run `node scripts/build_film.mjs films/<slug>`, then
   `node scripts/snap.mjs films/<slug> <snapdir>`. That makes three stills per scene and a
   `sheet.jpg`. Open the sheet and check:
   - the character reads clearly (big white head, eyes visible, feet on the floor, seated poses
     actually sit on something);
   - hands and props line up;
   - nothing important is cropped by the camera;
   - every frame has foreground, midground and background (no empty walls or floors);
   - each scene has a light idea (a window beam, a lamp glow, moonlight, fire);
   - any text in the scene is German and correctly spelled, and there is no overlay text;
   - walking characters are in profile.
   Fix the problems and snap again. Expect 2–3 rounds; this is where the quality comes from.
6. **Render:** `node scripts/render_mp4.mjs films/<slug> [out.mp4]`. It renders every frame, writes
   H.264 at 1920×1080, synthesizes the music and sound effects from the cue sheet, muxes them in as
   AAC (with `--no-audio` for a silent version), then prints an ffprobe line. Listen-check by reading
   the printed cue count and moods; if a cue name is unknown, `audio.py` warns. Run long renders in the
   background. Never deliver a half-written file.
7. **Deliver:** send the MP4 to the user (for example with `SendUserFile`). Report the duration,
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
scripts/new_film.mjs | build_film.mjs | snap.mjs | rig_sheet.mjs | render_mp4.mjs | audio.py
```
