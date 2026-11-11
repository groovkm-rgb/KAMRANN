#!/usr/bin/env bash
# usage: bash rchunk.sh A B [seconds]  -> renders even frames A..B with 4 workers, stops after time limit (RESUME)
A=$1; B=$2; LIM=${3:-560}
for k in 0 1 2 3; do
  L=$(python3 -c "print(','.join(str(f) for f in range($A + ($A%2), $B+1, 2) if (f//2)%4==$k))")
  [ -z "$L" ] && continue
  RESUME=1 timeout $LIM node render.mjs frames "$L" 1 0.93 > work/r$k.log 2>&1 &
done
wait
python3 -c "
import os; A,B=$A,$B; need=[f for f in range(A+(A%2),B+1,2)]; have=sum(os.path.exists(f'frames/f{f:05d}.jpg') for f in need); print(f'{have}/{len(need)} frames done in {A}-{B}')"
