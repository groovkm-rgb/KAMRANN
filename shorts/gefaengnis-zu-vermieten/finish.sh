#!/usr/bin/env bash
# Encode frames + mix -> mp4, then QA.   bash finish.sh "Title Of Short"
# Loudness: single-pass loudnorm undershot (-15.6 LUFS) on this mix, so we use gain + a true-peak-safe limiter
# and iterate the gain until the integrated loudness is -14.0 LUFS.
set -e; T="${1:-short}"; F="out/${T// /-}.mp4"
measure() { ffmpeg -hide_banner -i "$1" -af ebur128=peak=true:framelog=quiet -f null - 2>&1 | grep -E "^\s+I:" | tail -1 | awk '{print $2}'; }
g=$(python3 -c "print(round(-14.0 - ($(measure mix_raw.wav)), 2))")
for it in 1 2 3 4; do
  ffmpeg -v error -y -i mix_raw.wav -af "aresample=192000,volume=${g}dB,alimiter=limit=0.82:attack=3:release=60:level=false:asc=1,aresample=48000" -ac 2 mix.wav
  I=$(measure mix.wav); echo "gain ${g} dB -> ${I} LUFS"
  python3 -c "import sys; sys.exit(0 if abs(($I) + 14.0) < 0.05 else 1)" && break
  g=$(python3 -c "print(round($g + (-14.0 - ($I)), 2))")
done
ffmpeg -v error -y -framerate 30 -i frames/f%04d.jpg -i mix.wav -map 0:v:0 -map 1:a:0 -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart "$F"
ffprobe -v error -show_entries format=duration -show_entries stream=width,height,r_frame_rate -of compact "$F"
echo "--- QA (empty = no black/frozen spans)"; ffmpeg -i "$F" -vf "freezedetect=n=0.0005:d=0.4,blackdetect=d=0.05" -an -f null - 2>&1 | grep -E "freeze_start|black_start" || true
ffmpeg -i "$F" -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I|Peak):" | tail -2
ffmpeg -v error -y -i "$F" -vf "fps=2,scale=180:-1,tile=10x10" -frames:v 1 out/qa_sheet.jpg; echo "$F"
