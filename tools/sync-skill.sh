#!/usr/bin/env bash
# Copy the current engine + reference films into the skill so the skill never drifts from src/.
set -euo pipefail
cd "$(dirname "$0")/.."
SK=skills/art-deco-noir-shorts
cp src/01-core.js src/02-fx.js src/03-head.js src/04-body.js src/05-sets.js src/05b-scene-kit.js src/07-player.js src/shell.html $SK/assets/engine/
cp films/green-vault/sets.js $SK/assets/library/museum-dresden.js
cp films/well/scenes.js $SK/assets/examples/the-well.scenes.js
cp films/green-vault/scenes.js $SK/assets/examples/green-vault.scenes.js
cp src/06-scenes.js $SK/assets/examples/mafia-boss.scenes.js
rm -rf .claude/skills/art-deco-noir-shorts && mkdir -p .claude/skills && cp -r $SK .claude/skills/
echo "skill engine synced (skills/ and .claude/skills/)"
