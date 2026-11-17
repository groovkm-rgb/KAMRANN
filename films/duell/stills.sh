#!/bin/bash
# usage: bash stills.sh outdir  -> renders 2 frames per shot (40% and 85% through) in 3 parallel workers
OUT=$1; rm -rf $OUT; mkdir -p $OUT
FR=$(node -e "import('./web/story.js').then(m=>{}).catch(()=>{})" ; python3 - <<'PY'
import re
s=open('web/story.js').read()
sh=re.findall(r"\{ id: '(\w+)', a: (\d+), b: (\d+)",s)
fr=[]
for i,a,b in sh:
    a,b=int(a),int(b); fr+= [a+int((b-a)*0.35), a+int((b-a)*0.85)]
print(' '.join(map(str,fr)))
PY
)
set -- $FR; ALL=($FR); N=${#ALL[@]}
for w in 0 1 2; do L=""; for ((i=w;i<N;i+=3)); do L="$L${L:+,}${ALL[$i]}"; done; node render.mjs $OUT "$L" 1 0.85 > /tmp/st_$w.log 2>&1 & done; wait
grep -h "ERR\|done" /tmp/st_*.log | sort | uniq | head
python3 sheet.py $OUT $OUT.jpg 9
