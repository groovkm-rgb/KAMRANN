#!/usr/bin/env bash
# New 3D cartoon short project:  bash .claude/skills/cartoon-short-kit/tools/setup.sh <project_dir>
# Needs: node >= 22, python3 + numpy + Pillow, ffmpeg, Playwright Chromium (pre-installed in cloud sessions).
set -e
KIT="$(cd "$(dirname "$0")/.." && pwd)"; P="${1:?project dir}"
mkdir -p "$P/web/lib" "$P/work" "$P/stills" "$P/out" "$P/logs" "$P/frames"
cp "$KIT"/engine/*.js "$KIT"/engine/index.html "$P/web/"           # engine incl. 3D heads + inflated bodies (keep them!)
[ -f "$P/web/story.js" ] || cp "$KIT"/example/spy/story.js "$P/web/story.js"   # starting point: rewrite the shot plan
[ -f "$P/audio.py" ] || cp "$KIT"/example/spy/audio.py "$P/audio.py"                 # starting point: rewrite the cue table
cp "$KIT"/tools/{render.mjs,check.mjs,timing.py,sheet.py,finish.sh,stills.sh} "$P/"; chmod +x "$P"/*.sh
# three.js r160 (module build): npm first, then a sparse git clone
if [ ! -f "$P/web/lib/three.module.js" ]; then
  ( T=$(mktemp -d) && cd "$T" && npm pack three@0.160.0 >/dev/null 2>&1 && tar xzf three-0.160.0.tgz && cp package/build/three.module.js "$P/web/lib/" ) \
  || ( T=$(mktemp -d) && cd "$T" && git clone -q --depth 1 --filter=blob:none --sparse --branch r160 https://github.com/mrdoob/three.js t3 && cd t3 && git sparse-checkout set build && cp build/three.module.js "$P/web/lib/" )
fi
cat "$P/web/toonbase.js" "$P/web/roman.js" > "$P/web/toon.js"
mkdir -p "$P/node_modules"; [ -e "$P/node_modules/playwright" ] || ln -sf "$(npm root -g)/playwright" "$P/node_modules/playwright"
printf 'frames/\nstills/\nlogs/\nnode_modules\nweb/lib/\n*.wav\n' > "$P/.gitignore"
echo "ready: $P   (after editing cast code: cat web/toonbase.js web/roman.js > web/toon.js)"
