#!/usr/bin/env bash
# wait for any running render, then render the remaining sections in order
cd "$(dirname "$0")/.."
while pgrep -f "render.mjs frames" > /dev/null; do sleep 20; done
for sec in "2010 3749" "3750 5399" "5400 7049" "7050 8999"; do set -- $sec; echo "start $1-$2 $(date +%T)"; bash tools/range.sh $1 $2 4; echo "end $1-$2 $(date +%T)"; done
