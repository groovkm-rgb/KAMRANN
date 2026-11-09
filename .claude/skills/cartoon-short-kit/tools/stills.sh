#!/usr/bin/env bash
# stills.sh <dir> : renders 3 frames per shot in 3 parallel workers, then a contact sheet
D=$1; rm -rf $D; mkdir -p $D
FR=$(node -e "import('./web/story.js').then(S=>{const o=[];for(const s of S.SHOTS){o.push(s.a+4,Math.round((s.a+s.b)/2),s.b-2)};console.log(o.join(','))})")
IFS=',' read -ra A <<< "$FR"; n=${#A[@]}; k=$(( (n+2)/3 ))
for w in 0 1 2; do S=$(IFS=,; echo "${A[*]:$((w*k)):$k}"); [ -n "$S" ] && timeout 1200 node render.mjs $D "$S" 1 > $D.w$w.log 2>&1 & done; wait
grep -h "ERR\|done" $D.w*.log; python3 sheet.py $D $D.jpg 12
