#!/usr/bin/env bash
# render a frame list in parallel: bash pstills.sh <outdir> "f1 f2 f3 ..." [jobs]
OUT=$1; FR=($2); J=${3:-4}
for ((j=0;j<J;j++)); do
  L=""; for ((i=j;i<${#FR[@]};i+=J)); do L="$L,${FR[$i]}"; done
  [ -n "$L" ] && node render.mjs "$OUT" "${L:1}" > /tmp/pst_$j.log 2>&1 &
done
wait; cat /tmp/pst_*.log | grep -v "^done" | sort | uniq -c | head -20; grep -h "^done" /tmp/pst_*.log
