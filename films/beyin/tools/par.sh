#!/usr/bin/env bash
# parallel render of a comma list:  bash tools/par.sh outdir "f1,f2,..." [procs]
OUT=$1; LIST=$2; N=${3:-4}
IFS=',' read -ra F <<< "$LIST"; for ((k=0;k<N;k++)); do part=""; for ((i=k;i<${#F[@]};i+=N)); do part="$part,${F[$i]}"; done; part=${part#,}; [ -n "$part" ] && node render.mjs "$OUT" "$part" 1 0.92 > /tmp/claude-0/r$k.log 2>&1 & done; wait; cat /tmp/claude-0/r*.log | grep -v "^done" | grep -v "^PAGE THREE.WebGLRenderer" | sort | uniq -c | head -20; grep -h "^done" /tmp/claude-0/r*.log
