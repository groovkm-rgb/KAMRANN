# 30 Tage im Einkaufszentrum — production plan (continue from here)

Style: NOAH BLACK skill (all people jet-black skin, Noah = noah.js, others = people.js CAST, zombies = zombies.js).
16:9 1920x1080 30 fps, all on-screen text German. 3D sets = three.js (mall3d.js), 2D cast composited at projected points.

## Status
- [x] Intro 0–28.4 s (scene.js): crane/neon (3D), glass doors, crack, roof, Noah close-up, VHS rewind, TAG 1 atrium (3D).
- [x] Full VO word timings: audio/vo_words.txt, segments: audio/vo_segments.txt (source MP3 time).
- [ ] audio/mix.py: SFX + music + VO (cue list per section)
- [ ] Sections below (main.js shot list), render, concat.

## Time mapping
video = src + 0.6, and + 0.48 more after src 21.8 (1 s silent beat). VO ends src 531.4 → video ≈ 532.5. Film end ≈ 535.

## Sections (src times) → shot ideas (reuse sets: atrium day/dark/night, lot night/dawn, roof, glass doors, cards)
1. 26.7–110.3  TAG 1: shoe store checkout, TVs "EILMELDUNG", phones "WARNUNG", panic run, zombie in lot (3D lot day),
   Jamal hits red button, Rollgitter down, the five introduced (close-ups + name cards), "Fünf Fremde".
2. 110.9–151.1 Paradise montage: food court, Boxspringbett (Möbelhaus), gaming on huge TV, Nia plush castle, Jamal jackets,
   night: scratching at the grates, more each morning (counter).
3. 151.9–217.1 TAG 6 14:12 power out (atrium dark), freezers, brown water, Imani's calculation card (18 Tage / 9 Tage),
   basement generator, rules card (4 rules), Jamal angry.
4. 217.7–262.2 TAG 11 base: roof rain system, planters, barricades, sofas on escalators, floor-plan cutaway card
   (EG Sperrzone / 1. OG Lager / 2. OG Wohnen / Dach Farm), TAG 15 radishes, all laugh.
5. 262.2–299.6 TAG 17 theft at night in storage, argument, everyone looks at you, "Nein", lock + key to Grace.
6. 300.3–327.2 Nia fever 39,8 °C, knee wound (no gore), pharmacy map card 80 m.
7. 328.0–394.96 TAG 21 04:00 sneaking across lot (3D lot night), zombie 2 m away, pharmacy, car alarm, chase, door slam, laughing.
8. 394.96–450.0 Nia better, radio built, TAG 24 voice, painting HILFE, horde counter 40→300, diesel empty, last can.
9. 450.0–519.5 TAG 30: doors break (reuse intro glass/crack), stairs, roof (reuse shot3/4), 3:40, 3:50, Nia's hand,
   rotors, searchlight on HILFE, helicopter boarding, lift-off, mall shrinking (3D crane up), stats card.
10. 519.5–531.4 Outro: question card "Was hättest du dir als Erstes geholt?", "Schreib es in die Kommentare", last question.
