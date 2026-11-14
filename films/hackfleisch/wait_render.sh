#!/bin/bash
cd ~/shorts/hackfleisch
while [ $(ls frames | wc -l) -lt 1497 ]; do
  if ! pgrep -x node >/dev/null; then echo "node renders stopped"; break; fi
  sleep 30
done
ls frames | wc -l
