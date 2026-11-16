#!/bin/bash
# stills.sh outdir : renders 3 frames per shot in 4 parallel workers
OUT=$1; rm -rf $OUT; mkdir -p $OUT
FR=$(node -e "import('./web/story.js').then(m=>{const a=[];for(const s of m.SHOTS){const n=s.b-s.a;a.push(s.a+3,Math.round(s.a+n*0.5),s.b-2)}console.log(a.join(','))})" 2>/dev/null)
python3 - "$FR" > work/split.txt <<'PY'
import sys; fr=sys.argv[1].split(','); 
for k in range(4): print(','.join(fr[k::4]))
PY
i=0; while read L; do node render.mjs $OUT "$L" 1 0.9 > $OUT.log$i 2>&1 & i=$((i+1)); done < work/split.txt; wait
python3 sheet.py $OUT $OUT.jpg 9; grep -h "ERR\|done" $OUT.log* | sort | uniq -c | head
