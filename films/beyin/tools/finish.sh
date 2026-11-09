#!/usr/bin/env bash
# Encode deliverables + QA (no -14 LUFS normalisation: the music+sfx mix is already at ~-24 LUFS / <= -1 dBTP)
set -e; cd "$(dirname "$0")/.."
n=$(ls frames/f*.jpg | wc -l); [ "$n" = 9000 ] || { echo "frames: $n (need 9000)"; exit 1; }
ffmpeg -v error -y -framerate 30 -i frames/f%04d.jpg -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -r 30 -movflags +faststart out/video_sessiz.mp4
ffmpeg -v error -y -i out/video_sessiz.mp4 -i work/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 256k -ar 48000 -movflags +faststart out/video_muzik_efekt.mp4
for f in out/video_sessiz.mp4 out/video_muzik_efekt.mp4; do echo "== $f"; ffprobe -v error -count_frames -show_entries stream=codec_type,width,height,r_frame_rate,nb_read_frames,duration -of compact "$f"; done
echo "--- QA (empty = no black/frozen spans)"; ffmpeg -i out/video_sessiz.mp4 -vf "freezedetect=n=0.0005:d=0.4,blackdetect=d=0.05" -an -f null - 2>&1 | grep -E "freeze_start|black_start" || true
echo "--- loudness of the delivered mix"; ffmpeg -nostats -i out/video_muzik_efekt.mp4 -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I|Peak):" | tail -2
ffmpeg -v error -y -i out/video_sessiz.mp4 -vf "fps=1/5,scale=320:-1,tile=6x10" -frames:v 1 out/qa_sheet.jpg; echo done
