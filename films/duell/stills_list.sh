#!/bin/bash
# bash stills_list.sh outdir "f1,f2,..."  (3 workers)
OUT=$1; rm -rf $OUT; mkdir -p $OUT; IFS=',' read -ra A <<< "$2"; N=${#A[@]}
for w in 0 1 2; do L=""; for ((i=w;i<N;i+=3)); do L="$L${L:+,}${A[$i]}"; done; [ -n "$L" ] && node render.mjs $OUT "$L" 1 0.85 > /tmp/sl_$w.log 2>&1 & done; wait
grep -h "ERR" /tmp/sl_*.log | sort | uniq | head -5; python3 sheet.py $OUT $OUT.jpg ${3:-8}
