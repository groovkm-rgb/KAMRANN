#!/usr/bin/env bash
# render frames a..b into frames/ with N interleaved workers (RESUME): bash tools/range.sh a b [N]
A=$1; B=$2; N=${3:-3}; mkdir -p frames logs
for ((k=0;k<N;k++)); do RESUME=1 node render.mjs frames "$((A+k))-$B" $N 0.94 > logs/range_${A}_$k.log 2>&1 & done; wait
grep -h "done\|ERR" logs/range_${A}_*.log
