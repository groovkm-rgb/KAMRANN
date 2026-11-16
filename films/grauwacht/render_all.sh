#!/bin/bash
# render the 700 s film in 4 parallel chunks (frame-exact), then concat (stream copy)
cd "$(dirname "$0")"; R=${R:-/tmp/claude-0/r}; mkdir -p $R
S=../../skills/noah-skill/scripts/render_mp4.mjs
for i in 0 1 2 3; do a=$((i*175)); b=$(((i+1)*175)); node $S . $R/part$i.mp4 --from $a --to $b --no-audio > $R/log$i.txt 2>&1 & done
wait
for i in 0 1 2 3; do echo "file '$R/part$i.mp4'"; done > $R/list.txt
ffmpeg -y -loglevel error -f concat -safe 0 -i $R/list.txt -c copy $R/video.mp4
ffprobe -v error -count_frames -show_entries stream=nb_read_frames,duration -of compact $R/video.mp4
echo RENDER_DONE
