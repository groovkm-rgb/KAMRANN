// assemble the film: shots from all scene files, exported cues/moods for the audio script
NOAH_FONTS_READY.then(() => { defineFilm({ fadeIn: .25, fadeOut: 1.2, shots: buildShots() }); window.__cues = CUES; window.__moods = MOODS; window.__shots = SHOTS.map(s => [s.t0, s.name]); });
