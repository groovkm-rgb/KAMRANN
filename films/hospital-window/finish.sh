#!/usr/bin/env bash
# Encode frames + mix -> mp4, then QA.   bash finish.sh "Title Of Short"
set -e; T="${1:-short}"; F="out/${T// /-}.mp4"
# loudness: gain to -14 LUFS + true-peak limiter (-1.5 dBTP), measured twice so the result lands on target
for pass in 1 2; do
  SRC=$([ $pass = 1 ] && echo mix_raw.wav || echo mix.wav); cp $SRC _ln_in.wav
  I=$(ffmpeg -hide_banner -i _ln_in.wav -af ebur128 -f null - 2>&1 | grep -E "^\s+I:" | tail -1 | awk '{print $2}')
  G=$(python3 -c "print(-14-($I))")
  ffmpeg -v error -y -i _ln_in.wav -af "volume=${G}dB,alimiter=limit=0.82:attack=3:release=60:level=disabled" -ar 48000 -ac 2 mix.wav
done; rm -f _ln_in.wav
ffmpeg -v error -y -framerate 30 -i frames/f%04d.jpg -i mix.wav -map 0:v:0 -map 1:a:0 -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart "$F"
ffprobe -v error -show_entries format=duration -show_entries stream=width,height,r_frame_rate -of compact "$F"
echo "--- QA (empty = no black/frozen spans)"; ffmpeg -i "$F" -vf "freezedetect=n=0.0005:d=0.4,blackdetect=d=0.05" -an -f null - 2>&1 | grep -E "freeze_start|black_start" || true
ffmpeg -i "$F" -af ebur128 -f null - 2>&1 | grep -E "^\s+I:" | tail -1
ffmpeg -v error -y -i "$F" -vf "fps=1,scale=180:-1,tile=8x6" -frames:v 1 out/qa_sheet.jpg; echo "$F"
