#!/usr/bin/env python3
"""Final assembly: for each part take the silent render, splice in re-rendered frame ranges (patches), concat TEIL1+TEIL2
(each part already fades to/from black at the seam), put both mixes back to back (voice uninterrupted), master to -16 LUFS,
encode H.264 + AAC.   python3 final.py"""
import json, os, subprocess
B = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); P = lambda *a: os.path.join(B, *a)
PARTS = [('agent-teil1', [(302, 401, 'patch-msg.mp4')]), ('agent-teil2', [(1249, 1440, 'patch-msg.mp4')])]
OUT = P('agent-final'); os.makedirs(OUT, exist_ok=True)
run = lambda cmd: subprocess.run(cmd, check=True)
vids = []
for name, patches in PARTS:
    base = P(name, f'{name}-silent.mp4'); ins = []; segs = []; cur = 0; k = 0
    for f0, f1, pf in patches:   # separate inputs per range (memory-safe; no split of one decoded stream)
        ins += ['-ss', f'{cur / 30:.5f}', '-t', f'{(f0 - cur) / 30:.5f}', '-i', base, '-i', P(name, pf)]; segs += [f'[{k}:v]', f'[{k + 1}:v]']; k += 2; cur = f1
    ins += ['-ss', f'{cur / 30:.5f}', '-i', base]; segs.append(f'[{k}:v]')
    fc = ''.join(segs) + f'concat=n={len(segs)}:v=1:a=0[v]'
    out = os.path.join(OUT, f'{name}-video.mp4'); vids.append(out)
    run(['ffmpeg', '-y', '-v', 'error', *ins, '-filter_complex', fc, '-map', '[v]', '-c:v', 'libx264', '-preset', 'medium', '-crf', '21', '-pix_fmt', 'yuv420p', '-r', '30', out])
lst = os.path.join(OUT, 'list.txt'); open(lst, 'w').write(''.join(f"file '{v}'\n" for v in vids))
run(['ffmpeg', '-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', os.path.join(OUT, 'video.mp4')])
raw = os.path.join(OUT, 'mix-raw.wav')
run(['ffmpeg', '-y', '-v', 'error', '-i', P('agent-teil1', 'agent-teil1-mix.wav'), '-i', P('agent-teil2', 'agent-teil2-mix.wav'), '-filter_complex', '[0:a][1:a]concat=n=2:v=0:a=1[a]', '-map', '[a]', raw])
m = subprocess.run(['ffmpeg', '-hide_banner', '-i', raw, '-af', 'loudnorm=I=-16:TP=-3:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
j = json.loads(m[m.rindex('{'):m.rindex('}') + 1])
af = f"loudnorm=I=-16:TP=-3:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true,alimiter=limit=0.7:attack=1:release=80:level=disabled"
mix = os.path.join(OUT, 'mix.wav'); run(['ffmpeg', '-y', '-v', 'error', '-i', raw, '-af', af, '-ar', '48000', mix])
final = os.path.join(OUT, 'agent-geheimagent.mp4')
run(['ffmpeg', '-y', '-v', 'error', '-i', os.path.join(OUT, 'video.mp4'), '-i', mix, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', final])
print(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'stream=codec_name,width,height,nb_frames:format=duration,size', '-of', 'compact', final], capture_output=True, text=True).stdout)
r = subprocess.run(['ffmpeg', '-hide_banner', '-i', final, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr; print(r[r.rindex('Summary:'):])
