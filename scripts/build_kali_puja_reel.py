#!/usr/bin/env python3
"""Assemble Kali Puja reel: animated stills, captions, SFX, narration, BGM."""

from __future__ import annotations

import math
import random
import re
import subprocess
import tempfile
from pathlib import Path

ROOT = Path("/workspace/deliverables/kali-puja-reel")
ASSETS = ROOT / "assets"
OUT = ROOT / "kali-puja-reel.mp4"
W, H, FPS = 1080, 1920, 30

# (image, start_sec, end_sec, zoom_style, caption_override)
SCENES = [
    ("scene01_intro.jpg", 0.0, 8.5, "in", "KALI PUJA · WEST BENGAL"),
    ("scene03_diwali_kali.jpg", 8.5, 13.5, "pan_r", None),
    ("scene02_bama_kali.jpg", 13.5, 23.5, "in", "BAMA KALI"),
    ("scene04_shashan_kali.jpg", 26.0, 36.0, "out", "SHASHAN KALI"),
    ("scene05_street_kali.jpg", 36.0, 46.5, "shake", "PHATAKESHTO KALI"),
    ("scene06_chamunda_rakta.jpg", 46.5, 54.5, "in", "CHAMUNDA · RAKTA KALI"),
    ("scene09_adya_ma.jpg", 54.5, 59.0, "pan_l", "ADYA MA · ADYAPEETH"),
    ("scene07_kumartuli.jpg", 59.0, 72.0, "in", "KUMARTULI"),
    ("scene08_procession.jpg", 72.0, 88.5, "pan_r", "JAY MA KALI"),
]


def run(cmd: list[str]) -> None:
    subprocess.run(cmd, check=True)


def parse_vtt(path: Path) -> list[tuple[float, float, str]]:
    text = path.read_text(encoding="utf-8")
    blocks = re.split(r"\n\n+", text.strip())
    cues: list[tuple[float, float, str]] = []
    for block in blocks:
        lines = block.strip().splitlines()
        if len(lines) < 2 or "-->" not in lines[0]:
            continue
        if lines[0].strip().isdigit():
            lines = lines[1:]
        if not lines or "-->" not in lines[0]:
            continue
        start_s, end_s = [x.strip() for x in lines[0].split("-->")]
        body = " ".join(lines[1:]).replace("\n", " ")

        def to_sec(ts: str) -> float:
            h, m, rest = ts.split(":")
            s, ms = rest.split(",")
            return int(h) * 3600 + int(m) * 60 + int(s) + int(ms) / 1000

        cues.append((to_sec(start_s), to_sec(end_s), body))
    return cues


def zoom_filter(style: str, duration: float) -> str:
    frames = max(1, int(duration * FPS))
    if style == "in":
        return (
            f"zoompan=z='min(zoom+0.0015,1.35)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':"
            f"d={frames}:s={W}x{H}:fps={FPS}"
        )
    if style == "out":
        return (
            f"zoompan=z='if(lte(zoom,1.0),1.35,max(1.001,zoom-0.0018))':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':"
            f"d={frames}:s={W}x{H}:fps={FPS}"
        )
    if style == "pan_r":
        return (
            f"zoompan=z='1.25':x='(iw-iw/zoom)*on/{frames}':y='(ih-ih/zoom)/3':"
            f"d={frames}:s={W}x{H}:fps={FPS}"
        )
    if style == "pan_l":
        return (
            f"zoompan=z='1.22':x='(iw-iw/zoom)*(1-on/{frames})':y='(ih-ih/zoom)/4':"
            f"d={frames}:s={W}x{H}:fps={FPS}"
        )
    # shake: subtle zoom + wobble via x/y
    return (
        f"zoompan=z='1.18+0.02*sin(on/3)':"
        f"x='(iw-iw/zoom)/2+25*sin(on/2)':y='(ih-ih/zoom)/2+18*cos(on/2)':"
        f"d={frames}:s={W}x{H}:fps={FPS}"
    )


def make_scene_clip(img: Path, out: Path, duration: float, style: str) -> None:
    vf = (
        f"scale={W*2}:{H*2}:force_original_aspect_ratio=increase,"
        f"crop={W*2}:{H*2},"
        f"{zoom_filter(style, duration)},"
        "eq=contrast=1.12:saturation=1.18,"
        "curves=all='0/0 0.5/0.58 1/1',"
        "noise=alls=8:allf=t+u,"
        "format=yuv420p"
    )
    run(
        [
            "ffmpeg",
            "-y",
            "-loop",
            "1",
            "-i",
            str(img),
            "-t",
            f"{duration:.3f}",
            "-vf",
            vf,
            "-an",
            str(out),
        ]
    )


def make_vfx_filter() -> str:
    """Fast reel VFX: vignette pulse + light film grain (no per-pixel random)."""
    return (
        "vignette=angle=PI/4:mode=forward,"
        "noise=alls=12:allf=t+u,"
        "hue=s=1.12,"
        "eq=gamma=1.05"
    )


def build_sfx(path: Path, duration: float) -> None:
    """Short whoosh + low thump at scene cuts."""
    run(
        [
            "ffmpeg",
            "-y",
            "-f",
            "lavfi",
            "-i",
            f"anoisesrc=d={duration}:c=pink:r=48000:a=0.25",
            "-f",
            "lavfi",
            "-i",
            f"sine=f=90:duration={duration}:sample_rate=48000",
            "-filter_complex",
            (
                "[0:a]highpass=f=400,lowpass=f=6000,volume=0.35[a0];"
                "[1:a]volume=0.5,afade=t=in:st=0:d=0.02,afade=t=out:st=0.18:d=0.12[a1];"
                "[a0][a1]amix=inputs=2:duration=first:dropout_transition=0"
            ),
            "-t",
            f"{duration:.3f}",
            str(path),
        ]
    )


def concat_with_xfade(clips: list[Path], durations: list[float], out: Path) -> None:
    if len(clips) == 1:
        run(["ffmpeg", "-y", "-i", str(clips[0]), "-c", "copy", str(out)])
        return
    fade = 0.35
    inputs: list[str] = []
    for c in clips:
        inputs.extend(["-i", str(c)])
    parts: list[str] = []
    acc = durations[0]
    prev = "[0:v]"
    for i in range(1, len(clips)):
        offset = max(0.01, acc - fade)
        nxt = f"[v{i}]" if i < len(clips) - 1 else "[vout]"
        parts.append(
            f"{prev}[{i}:v]xfade=transition=zoomin:duration={fade}:offset={offset:.3f}{nxt}"
        )
        prev = nxt
        acc += durations[i] - fade
    fc = ";".join(parts)
    run(["ffmpeg", "-y", *inputs, "-filter_complex", fc, "-map", "[vout]", "-an", str(out)])


def vtt_to_ass(cues: list[tuple[float, float, str]], path: Path) -> None:
    def ts(t: float) -> str:
        h = int(t // 3600)
        m = int((t % 3600) // 60)
        s = t % 60
        return f"{h}:{m:02d}:{s:05.2f}"

    lines = [
        "[Script Info]",
        "Title: Kali Puja Reel",
        "ScriptType: v4.00+",
        "PlayResX: 1080",
        "PlayResY: 1920",
        "",
        "[V4+ Styles]",
        "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
        "Style: Cap,DejaVu Sans,52,&H00FFFFFF,&H000000FF,&H00000000,&H96000000,-1,0,0,0,100,100,0,0,1,4,2,2,60,60,120,1",
        "Style: Title,DejaVu Sans,78,&H0000D4FF,&H000000FF,&H00000000,&HAA000000,-1,0,0,0,100,100,0,0,1,5,3,2,60,60,320,1",
        "",
        "[Events]",
        "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text",
    ]
    for start, end, txt in cues:
        safe = txt.replace("{", "\\{").replace("}", "\\}")
        lines.append(f"Dialogue: 0,{ts(start)},{ts(end)},Cap,,0,0,0,,{safe}")
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def add_title_cards(ass_path: Path, scenes: list) -> None:
    content = ass_path.read_text(encoding="utf-8")
    events = []
    for img, start, end, _style, cap in scenes:
        if not cap:
            continue
        h = int(start // 3600)
        m = int((start % 3600) // 60)
        s = start % 60
        t0 = f"{h}:{m:02d}:{s:05.2f}"
        h2 = int((start + 2.2) // 3600)
        m2 = int(((start + 2.2) % 3600) // 60)
        s2 = (start + 2.2) % 60
        t1 = f"{h2}:{m2:02d}:{s2:05.2f}"
        events.append(f"Dialogue: 1,{t0},{t1},Title,,0,0,0,,{cap}")
    if events:
        ass_path.write_text(content + "\n".join(events) + "\n", encoding="utf-8")


def main() -> None:
    random.seed(42)
    narration = ROOT / "narration.mp3"
    bgm = ASSETS / "bgm.mp3"
    vtt = ROOT / "narration.vtt"
    total = float(
        subprocess.check_output(
            [
                "ffprobe",
                "-v",
                "error",
                "-show_entries",
                "format=duration",
                "-of",
                "default=noprint_wrappers=1:nokey=1",
                str(narration),
            ],
            text=True,
        ).strip()
    )

    with tempfile.TemporaryDirectory(prefix="kali_reel_") as tmp:
        tdir = Path(tmp)
        clip_paths: list[Path] = []
        durations: list[float] = []
        for idx, (name, start, end, style, _cap) in enumerate(SCENES):
            dur = end - start
            if idx == len(SCENES) - 1:
                dur = max(dur, total - start)
            img = ASSETS / name
            clip = tdir / f"scene_{idx:02d}.mp4"
            make_scene_clip(img, clip, dur, style)
            clip_paths.append(clip)
            durations.append(dur)

        merged = tdir / "merged.mp4"
        concat_with_xfade(clip_paths, durations, merged)

        cues = parse_vtt(vtt)
        ass = tdir / "captions.ass"
        vtt_to_ass(cues, ass)
        add_title_cards(ass, SCENES)

        # SFX bed: sparse hits at scene boundaries
        sfx_parts = []
        for i, (_n, start, _e, _s, _c) in enumerate(SCENES[1:], 1):
            sfx_parts.append((start, 0.22))
        sfx_list = tdir / "sfx.txt"
        sfx_clips: list[Path] = []
        for j, (at, dur) in enumerate(sfx_parts):
            p = tdir / f"sfx_{j}.wav"
            build_sfx(p, dur)
            sfx_clips.append(p)

        # Mix narration + bgm + sfx
        sfx_delayed = tdir / "sfx_mix.wav"
        sfx_inputs = []
        filter_sfx = []
        for j, (at, _dur) in enumerate(sfx_parts):
            sfx_inputs.extend(["-i", str(sfx_clips[j])])
            filter_sfx.append(f"[{j+2}:a]adelay={int(at*1000)}|{int(at*1000)}[s{j}]")
        sfx_mix_label = "[sfxout]"
        if filter_sfx:
            mix_in = "".join(f"[s{j}]" for j in range(len(sfx_parts)))
            filter_sfx.append(f"{mix_in}amix=inputs={len(sfx_parts)}:duration=longest{sfx_mix_label}")
        else:
            sfx_mix_label = "[3:a]"

        vfx = tdir / "vfx.mp4"
        ass_esc = str(ass).replace(":", "\\:").replace("'", "\\'")
        run(
            [
                "ffmpeg",
                "-y",
                "-i",
                str(merged),
                "-vf",
                f"{make_vfx_filter()},ass={ass_esc}",
                "-t",
                f"{total:.3f}",
                str(vfx),
            ]
        )

        audio_filter = (
            "[0:a]volume=1.0[n];"
            "[1:a]volume=0.22,afade=t=in:st=0:d=2,afade=t=out:st=82:d=4[bg];"
        )
        if filter_sfx:
            audio_filter += ";".join(filter_sfx) + f";[n][bg]{sfx_mix_label}amix=inputs=3:duration=first:dropout_transition=0[aout]"
            vfx_index = 2 + len(sfx_clips)
            cmd = [
                "ffmpeg",
                "-y",
                "-i",
                str(narration),
                "-i",
                str(bgm),
                *sfx_inputs,
                "-i",
                str(vfx),
                "-filter_complex",
                audio_filter,
                "-map",
                f"{vfx_index}:v",
                "-map",
                "[aout]",
                "-c:v",
                "libx264",
                "-preset",
                "medium",
                "-crf",
                "20",
                "-c:a",
                "aac",
                "-b:a",
                "192k",
                "-t",
                f"{total:.3f}",
                str(OUT),
            ]
        else:
            cmd = [
                "ffmpeg",
                "-y",
                "-i",
                str(narration),
                "-i",
                str(bgm),
                "-i",
                str(vfx),
                "-filter_complex",
                "[0:a]volume=1.0[n];[1:a]volume=0.22,afade=t=in:st=0:d=2,afade=t=out:st=82:d=4[bg];[n][bg]amix=inputs=2:duration=first[aout]",
                "-map",
                "2:v",
                "-map",
                "[aout]",
                "-c:v",
                "libx264",
                "-preset",
                "medium",
                "-crf",
                "20",
                "-c:a",
                "aac",
                "-b:a",
                "192k",
                "-t",
                f"{total:.3f}",
                str(OUT),
            ]

        run(cmd)

    print(f"Wrote {OUT} ({total:.1f}s)")


if __name__ == "__main__":
    main()
