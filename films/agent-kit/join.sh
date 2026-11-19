#!/bin/bash
# Join TEIL1 + TEIL2 into one film: video concat (each part fades to/from black at the seam), the two mixes back to back
# (voice uninterrupted), re-mastered together to -16 LUFS, H.264 + AAC.
set -e
cd "$(dirname "$0")/.."
OUT=agent-final; mkdir -p $OUT
printf "file '%s'\nfile '%s'\n" "$PWD/agent-teil1/agent-teil1-silent.mp4" "$PWD/agent-teil2/agent-teil2-silent.mp4" > $OUT/list.txt
ffmpeg -y -v error -f concat -safe 0 -i $OUT/list.txt -c:v libx264 -preset medium -crf 21 -pix_fmt yuv420p -r 30 $OUT/video.mp4
ffmpeg -y -v error -i agent-teil1/agent-teil1-mix.wav -i agent-teil2/agent-teil2-mix.wav -filter_complex "[0:a][1:a]concat=n=2:v=0:a=1[a]" -map "[a]" $OUT/mix-raw.wav
J=$(ffmpeg -hide_banner -i $OUT/mix-raw.wav -af loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
g(){ echo "$J" | python3 -c "import json,sys;print(json.load(sys.stdin)['$1'])"; }
ffmpeg -y -v error -i $OUT/mix-raw.wav -af "loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true" -ar 48000 $OUT/mix.wav
ffmpeg -y -v error -i $OUT/video.mp4 -i $OUT/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart $OUT/agent-geheimagent.mp4
ffprobe -v error -show_entries stream=codec_name,width,height,nb_frames:format=duration,size -of compact $OUT/agent-geheimagent.mp4
ffmpeg -hide_banner -i $OUT/agent-geheimagent.mp4 -af ebur128=peak=true -f null - 2>&1 | grep -A12 Summary | grep -E "I:|Peak"
