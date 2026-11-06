#!/usr/bin/env bash
# Copy the example films into the toon-shorts skill, install it as a project skill and package it.
set -euo pipefail
cd "$(dirname "$0")/.."
SK=skills/toon-shorts
for f in cafe-tea western-duel; do
  mkdir -p $SK/assets/examples/$f
  cp films/$f/film.json films/$f/cast.js films/$f/scenes.js $SK/assets/examples/$f/
  [ -f films/$f/props.js ] && cp films/$f/props.js $SK/assets/examples/$f/
done
rm -rf .claude/skills/toon-shorts && mkdir -p .claude/skills && cp -r $SK .claude/skills/
mkdir -p dist && rm -f dist/toon-shorts.zip dist/toon-shorts.skill
(cd skills && zip -qr ../dist/toon-shorts.zip toon-shorts) && cp dist/toon-shorts.zip dist/toon-shorts.skill
echo "toon-shorts synced (skills/, .claude/skills/, dist/)"
