#!/bin/bash
# render a film part with mixed audio: ./part.sh t0 t1 name   (needs sfx_full.wav)
set -e; cd "$(dirname "$0")"; T0=$1; T1=$2; N=$3; SP=/tmp/claude-0/-home-user-KAMRANN/1a5a9a58-ca9f-5745-b404-949eab0a0474/scratchpad
node render.cjs mp4 $SP/v_$N.mp4 $T0 $T1 --jobs 4 | tail -2
D=$(python3 -c "print($T1-$T0)")
ffmpeg -y -loglevel error -i $SP/v_$N.mp4 -ss $T0 -t $D -i /root/.claude/uploads/1a5a9a58-ca9f-5745-b404-949eab0a0474/228d355f-okul.mp3 -ss $T0 -t $D -i sfx_full.wav \
  -filter_complex "[1:a]aresample=48000,asetpts=N/SR/TB[v];[2:a]volume=-9dB,asetpts=N/SR/TB[s];[v][s]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-16:TP=-1.5:LRA=11,afade=t=in:d=0.05,afade=t=out:st=$(python3 -c "print($D-0.25)"):d=0.25[a]" \
  -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -movflags +faststart renders/$N.mp4
ffprobe -v error -show_entries format=duration -of csv=p=0 renders/$N.mp4
