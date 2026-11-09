#!/usr/bin/env bash
# Encode frames + mix -> high-quality MP4 at -14 LUFS, then QA.   bash finish.sh "Title Of Short" [fps]
# Quality first: CRF 16, preset slow, tune animation, NO bitrate cap (a cap turns grain/gradients into blocks).
set -e; T="${1:-short}"; FPS="${2:-30}"; F="out/${T// /-}.mp4"; mkdir -p out
lufs() { ffmpeg -i "$1" -af ebur128 -f null - 2>&1 | grep -E "^\s+I:" | tail -1 | awk '{print $2}'; }
I0=$(lufs mix_raw.wav); G=$(python3 -c "print(round(-14 - $I0, 2))")
for pass in 1 2 3; do   # gain + brick-wall limiter (oversampled), re-measured until within 0.2 LU of -14
  ffmpeg -v error -y -i mix_raw.wav -af "aresample=192000,volume=${G}dB,alimiter=limit=0.82:attack=3:release=60:level=false,aresample=48000" -ac 2 mix.wav
  I=$(lufs mix.wav); echo "loudness pass $pass: gain ${G} dB -> ${I} LUFS"
  python3 -c "import sys; sys.exit(0 if abs(-14 - $I) <= 0.2 else 1)" && break
  G=$(python3 -c "print(round($G + (-14 - $I), 2))")
done
ffmpeg -v error -y -framerate "$FPS" -i frames/f%04d.jpg -i mix.wav -map 0:v:0 -map 1:a:0 -c:v libx264 -preset slow -crf 16 -tune animation \
  -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart "$F"
ffprobe -v error -show_entries format=duration,bit_rate -show_entries stream=codec_name,width,height,r_frame_rate,nb_frames -of compact "$F"
echo "--- QA (empty = no black/frozen spans)"; ffmpeg -i "$F" -vf "freezedetect=n=0.0005:d=0.4,blackdetect=d=0.05" -an -f null - 2>&1 | grep -E "freeze_start|black_start" || true
ffmpeg -i "$F" -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+I:|^\s+Peak:" | tail -2
ffmpeg -v error -y -i "$F" -vf "fps=2,scale=216:-1,tile=10x10" -frames:v 1 out/qa_sheet.jpg; echo "$F"
