#!/bin/bash
# usage: st.sh <name> <frames>  -> renders stills in 4 parallel chunks + sheet
N=$1; FR=$2; rm -rf stills/$N; mkdir -p stills/$N
python3 - "$FR" <<'PY' > /tmp/chunks.txt
import sys
fr=sys.argv[1].split(','); k=4
for i in range(k): print(','.join(fr[i::k]))
PY
while read c; do [ -n "$c" ] && node render.mjs stills/$N "$c" 1 0.9 > /tmp/st_$RANDOM.log 2>&1 & done < /tmp/chunks.txt
wait; grep -h -E "ERR|PAGE" /tmp/st_*.log | sort | uniq -c | head; rm -f /tmp/st_*.log
python3 sheet.py stills/$N stills/$N.jpg ${3:-8}
