#!/usr/bin/env bash
# parallel render: bash prender.sh <outdir> <a> <b> [step] [jobs]   (each job takes every jobs-th frame)
OUT=$1; A=$2; B=$3; STEP=${4:-1}; J=${5:-4}
for ((j=0;j<J;j++)); do
  L=""; for ((f=A+j*STEP; f<=B; f+=STEP*J)); do L="$L,$f"; done
  [ -n "$L" ] && RESUME=$RESUME node render.mjs "$OUT" "${L:1}" > /tmp/prender_$j.log 2>&1 &
done
wait; cat /tmp/prender_*.log | grep -v "^done" | sort | uniq -c | head -20; grep -h "^done" /tmp/prender_*.log
