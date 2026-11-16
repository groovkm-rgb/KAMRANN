#!/bin/bash
# build the Grauwacht film: splice the period kit into the engine, generate timing, concatenate parts → scenes.js → film.html
set -e
cd "$(dirname "$0")"
SK=../../skills/noah-skill
# (the period kit lives in noah.js between the PERIOD KIT markers)
cat parts/*.js > scenes.js
node $SK/scripts/build_film.mjs . film.html
