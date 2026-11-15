#!/bin/bash
for r in "0-405" "406-811" "812-1217" "1218-1621"; do RESUME=1 node render.mjs frames "$r" > work/render_$r.log 2>&1 & done
wait; ls frames | wc -l; tail -n 2 work/render_*.log
