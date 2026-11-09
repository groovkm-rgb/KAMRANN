# KAMRANN — notes for Claude

## Cartoon shorts: the 3D rule (always)

Whenever a cartoon short is made in this repo — with `/cartoon-short-kit`, `anthropic-skills:cartoon-short-kit`, or any
similar request (voice-over in, vertical cartoon MP4 out) — use the project skill `.claude/skills/cartoon-short-kit/`
and follow its **THE 3D RULE** section. In short:

- People are never flat cards: inflated volumetric bodies + real 3D round heads (painted face, ears, hair, 3D hats),
  hands in front of the face on the overlay card (`R3` in `example/spy/story.js`). Lying people are inflated too.
- Prove it with the side test (`HASH="#orbit=60"` / `#orbit=85`) on stills before the full render.
- Keep quality first: subtle soft grain, final encode CRF 16 / preset slow / tune animation, no bitrate cap, -14 LUFS
  (`tools/finish.sh`).
- Run `check.mjs` (framing in 9:16) and the stills contact sheet before every full render.

Finished example project: `films/spy/`.
