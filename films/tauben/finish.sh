#!/usr/bin/env bash
# frames/ + work/mix_raw.wav -> out/tauben.mp4 (1080x1920, 30 fps, H.264 + AAC, -14 LUFS / -1.5 dBTP), then QA.
# ORIG=1: frames_orig/ + work/mix_raw_orig.wav -> out/tauben_orig.mp4, out/qa_sheet_orig.jpg
set -e
cd "$(dirname "$0")"
S=""; [ -n "$ORIG" ] && S="_orig"
OUT=out/tauben$S.mp4; FR=frames$S; RAW=work/mix_raw$S.wav; MIX=work/mix$S.wav; QA=out/qa_sheet$S.jpg; mkdir -p out
# two-pass loudnorm
J=$(ffmpeg -hide_banner -i $RAW -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
g() { echo "$J" | python3 -c "import json,sys;print(json.load(sys.stdin)['$1'])"; }
ffmpeg -v error -y -i $RAW -af "loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true,aresample=48000" -ar 48000 -ac 2 $MIX
ffmpeg -v error -y -framerate 30 -i $FR/f%04d.png -i $MIX -map 0:v:0 -map 1:a:0 \
  -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p -r 30 -c:a aac -b:a 192k -ar 48000 -shortest -movflags +faststart "$OUT"
echo "--- stream info"
ffprobe -v error -show_entries format=duration:stream=codec_name,width,height,r_frame_rate,sample_rate -of compact "$OUT"
echo "--- QA freezedetect/blackdetect (empty = no frozen or black spans)"
ffmpeg -hide_banner -i "$OUT" -vf "freezedetect=n=0.0005:d=0.4,blackdetect=d=0.05" -an -f null - 2>&1 | grep -E "freeze_start|freeze_end|black_start" || true
echo "--- loudness"
ffmpeg -hide_banner -i "$OUT" -vn -af ebur128=peak=true -f null - 2>&1 | grep -A12 "^\[Parsed_ebur128.*Summary" | grep -E "I:|Peak:"
ffmpeg -v error -y -i "$OUT" -vf "fps=2,scale=216:384,tile=10x4" -frames:v 1 $QA
echo "$OUT"
