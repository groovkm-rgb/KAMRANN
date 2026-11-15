#!/bin/bash
# rr.sh [N] [timeout] : renders the next missing frames of the whole film in order (chapter by chapter), time-boxed
N=${1:-3}; TO=${2:-560}
cd /home/user/shorts/milliarde
python3 - "$N" <<'PY'
import os, sys
N = int(sys.argv[1]); miss = [f for f in range(17934) if not os.path.exists('frames/f%05d.jpg' % f)][:N * 700]
for i in range(N): open(f'/tmp/claude-0/list{i}.txt', 'w').write(','.join(str(f) for f in miss[i::N]))
PY
for ((i=0;i<N;i++)); do l=$(cat /tmp/claude-0/list$i.txt); [ -n "$l" ] && RESUME=1 timeout $TO node render.mjs frames "$l" > /tmp/claude-0/w$i.log 2>&1 & done; wait
python3 -c "
import os; CH=[0,1719,3994,6498,9121,12238,15231,17934]
print(' | '.join(f'ch{c+1}: {sum(os.path.exists(\"frames/f%05d.jpg\"%f) for f in range(CH[c],CH[c+1]))}/{CH[c+1]-CH[c]}' for c in range(7)))"
