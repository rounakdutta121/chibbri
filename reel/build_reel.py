#!/usr/bin/env python3
"""Build a 9:16 motion-comic reel with VO, SFX, captions, Ken Burns motion."""

from __future__ import annotations

import asyncio
import json
import math
import subprocess
import wave
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "output"
ASSETS = ROOT / "assets"
SCENES_FILE = ROOT / "scenes.json"

W, H = 1080, 1920
FPS = 24
FONT_BOLD = "/usr/share/fonts/truetype/noto/NotoSans-Bold.ttf"
FONT_REG = "/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf"


def run(cmd: list[str]) -> None:
    subprocess.run(cmd, check=True)


def audio_duration(path: Path) -> float:
    r = subprocess.run(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            str(path),
        ],
        capture_output=True,
        text=True,
        check=True,
    )
    return float(r.stdout.strip())


async def tts(text: str, out: Path, voice: str) -> None:
    import edge_tts

    comm = edge_tts.Communicate(text, voice=voice, rate="+18%")
    await comm.save(str(out))


def make_sfx(kind: str, out: Path) -> None:
    specs: dict[str, tuple[list[str], str | None]] = {
        "pop": (["sine=frequency=880:duration=0.08"], "volume=2,afade=t=out:st=0.04:d=0.04"),
        "whoosh": (
            ["anoisesrc=d=0.25:c=pink"],
            "volume=0.35,lowpass=f=1200,afade=t=in:st=0:d=0.05,afade=t=out:st=0.15:d=0.1",
        ),
        "notification": (
            ["sine=frequency=1200:duration=0.12", "sine=frequency=1600:duration=0.12"],
            "[0:a][1:a]concat=n=2:v=0:a=1,volume=1.8",
        ),
        "error": (
            ["sine=frequency=220:duration=0.25", "sine=frequency=180:duration=0.25"],
            "[0:a][1:a]concat=n=2:v=0:a=1,volume=2.2",
        ),
        "success": (
            ["sine=frequency=660:duration=0.1", "sine=frequency=990:duration=0.15"],
            "[0:a][1:a]concat=n=2:v=0:a=1,volume=1.6",
        ),
        "laugh": (
            ["anoisesrc=d=0.45:c=pink"],
            "volume=0.5,highpass=f=400,lowpass=f=3500,tremolo=f=14:d=0.35",
        ),
        "celebration": (
            [
                "sine=frequency=523:duration=0.12",
                "sine=frequency=659:duration=0.12",
                "sine=frequency=784:duration=0.2",
            ],
            "[0:a][1:a][2:a]concat=n=3:v=0:a=1,volume=1.5",
        ),
        "ding": (
            ["sine=frequency=880:duration=0.25", "sine=frequency=1320:duration=0.25"],
            "[0:a][1:a]concat=n=2:v=0:a=1,volume=1.4,afade=t=out:st=0.35:d=0.15",
        ),
    }
    inputs, flt = specs.get(kind, specs["ding"])
    cmd = ["ffmpeg", "-y"]
    for src in inputs:
        cmd.extend(["-f", "lavfi", "-i", src])
    if flt:
        cmd.extend(["-filter_complex", flt])
    cmd.append(str(out))
    run(cmd)


def wrap_text(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.FreeTypeFont, max_w: int) -> list[str]:
    words = text.split()
    lines: list[str] = []
    cur = ""
    for w in words:
        test = (cur + " " + w).strip()
        if draw.textlength(test, font=font) <= max_w:
            cur = test
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines or [text]


def render_caption_frame(
    caption: str,
    header: str,
    brand: str,
    highlight: bool = False,
) -> Image.Image:
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    header_font = ImageFont.truetype(FONT_REG, 46)
    cap_font = ImageFont.truetype(FONT_BOLD, 92)
    brand_font = ImageFont.truetype(FONT_BOLD, 34)

    # persistent header
    hx, hy = 70, 70
    hw, hh = W - 140, 110
    draw.rounded_rectangle((hx, hy, hx + hw, hy + hh), radius=28, fill=(255, 255, 255, 235))
    for i, line in enumerate(wrap_text(draw, header, header_font, hw - 40)):
        draw.text((hx + 24, hy + 18 + i * 48), line, fill=(20, 20, 20, 255), font=header_font)

    # brand chip
    draw.rounded_rectangle((70, H - 150, 620, H - 80), radius=22, fill=(20, 10, 40, 190))
    draw.text((95, H - 138), brand, fill=(255, 220, 120, 255), font=brand_font)

    # center caption
    lines = wrap_text(draw, caption, cap_font, W - 180)
    block_h = len(lines) * 104
    y0 = (H // 2) - block_h // 2 + 80
    for line in lines:
        tw = draw.textlength(line, font=cap_font)
        x = (W - tw) / 2
        if highlight:
            pad = 18
            draw.rounded_rectangle(
                (x - pad, y0 - 8, x + tw + pad, y0 + 88),
                radius=16,
                fill=(255, 220, 0, 240),
            )
            draw.text((x, y0), line, fill=(10, 10, 10, 255), font=cap_font)
        else:
            for dx, dy in [(-3, 0), (3, 0), (0, -3), (0, 3)]:
                draw.text((x + dx, y0 + dy), line, fill=(0, 0, 0, 255), font=cap_font)
            draw.text((x, y0), line, fill=(255, 255, 255, 255), font=cap_font)
        y0 += 104

    return img


def build_scene_video(
    scene_id: str,
    image_path: Path,
    vo_path: Path,
    sfx_path: Path,
    captions: list[str],
    header: str,
    brand: str,
    out_path: Path,
    zoom_in: bool,
) -> None:
    dur = audio_duration(vo_path)
    cap_count = max(len(captions), 1)
    cap_dur = dur / cap_count

    cap_dir = OUT / "caps" / scene_id
    cap_dir.mkdir(parents=True, exist_ok=True)
    cap_paths: list[Path] = []
    for i, cap in enumerate(captions):
        highlight = i == len(captions) - 1 or "PANEL" in cap or "ENTRY" in cap
        frame = render_caption_frame(cap, header, brand, highlight=highlight)
        p = cap_dir / f"cap_{i:02d}.png"
        frame.save(p)
        cap_paths.append(p)

    # base image scaled/cropped to 9:16
    base = OUT / "scaled" / f"{scene_id}.png"
    base.parent.mkdir(parents=True, exist_ok=True)
    run(
        [
            "ffmpeg",
            "-y",
            "-i",
            str(image_path),
            "-vf",
            f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H}",
            str(base),
        ]
    )

    # Ken Burns on still + caption overlays via timed concat segments
    seg_paths: list[Path] = []
    z_start = 1.0 if zoom_in else 1.12
    z_end = 1.12 if zoom_in else 1.0
    for i in range(cap_count):
        seg = OUT / "segments" / f"{scene_id}_{i:02d}.mp4"
        seg.parent.mkdir(parents=True, exist_ok=True)
        z0 = z_start + (z_end - z_start) * (i / cap_count)
        z1 = z_start + (z_end - z_start) * ((i + 1) / cap_count)
        frames = max(int(cap_dur * FPS), 1)
        zoom_expr = f"if(on,{z0}+({z1}-{z0})*on/{frames},1)"
        run(
            [
                "ffmpeg",
                "-y",
                "-loop",
                "1",
                "-i",
                str(base),
                "-loop",
                "1",
                "-i",
                str(cap_paths[i if i < len(cap_paths) else -1]),
                "-filter_complex",
                (
                    f"[0:v]zoompan=z='{zoom_expr}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':"
                    f"d={frames}:s={W}x{H}:fps={FPS}[bg];"
                    f"[bg][1:v]overlay=0:0:format=auto[v]"
                ),
                "-map",
                "[v]",
                "-t",
                f"{cap_dur:.3f}",
                "-pix_fmt",
                "yuv420p",
                str(seg),
            ]
        )
        seg_paths.append(seg)

    concat_list = OUT / "segments" / f"{scene_id}_list.txt"
    with concat_list.open("w") as f:
        for p in seg_paths:
            f.write(f"file '{p}'\n")

    silent = OUT / "segments" / f"{scene_id}_silent.mp4"
    run(
        [
            "ffmpeg",
            "-y",
            "-f",
            "concat",
            "-safe",
            "0",
            "-i",
            str(concat_list),
            "-c",
            "copy",
            str(silent),
        ]
    )

    mixed_audio = OUT / "audio" / f"{scene_id}_mix.m4a"
    mixed_audio.parent.mkdir(parents=True, exist_ok=True)
    run(
        [
            "ffmpeg",
            "-y",
            "-i",
            str(vo_path),
            "-i",
            str(sfx_path),
            "-filter_complex",
            "[0:a]volume=1.05[vo];[1:a]adelay=120|120,volume=0.9[sfx];[vo][sfx]amix=inputs=2:duration=first:dropout_transition=0",
            str(mixed_audio),
        ]
    )

    run(
        [
            "ffmpeg",
            "-y",
            "-i",
            str(silent),
            "-i",
            str(mixed_audio),
            "-c:v",
            "libx264",
                "-preset",
                "ultrafast",
            "-crf",
            "20",
            "-c:a",
            "aac",
            "-b:a",
            "192k",
            "-shortest",
            str(out_path),
        ]
    )


async def main() -> None:
    data = json.loads(SCENES_FILE.read_text())
    voice = data["voice"]
    header = data["header"]
    brand = "Developed by PanelVerse Branding"

    OUT.mkdir(parents=True, exist_ok=True)
    ASSETS.mkdir(parents=True, exist_ok=True)

    scene_paths: list[Path] = []
    for idx, scene in enumerate(data["scenes"]):
        sid = scene["id"]
        img = ASSETS / f"scene_{sid}.jpg"
        if not img.exists():
            raise FileNotFoundError(f"Missing image: {img}. Generate scene images first.")

        vo = OUT / "audio" / f"{sid}_vo.mp3"
        vo.parent.mkdir(parents=True, exist_ok=True)
        await tts(scene["narration"], vo, voice)

        sfx = OUT / "audio" / f"{sid}_sfx.m4a"
        make_sfx(scene.get("sfx", "ding"), sfx)

        out = OUT / "scenes" / f"{sid}.mp4"
        out.parent.mkdir(parents=True, exist_ok=True)
        build_scene_video(
            sid,
            img,
            vo,
            sfx,
            scene["captions"],
            header,
            brand,
            out,
            zoom_in=idx % 2 == 0,
        )
        scene_paths.append(out)
        print(f"Built scene {sid}")

    concat = OUT / "concat.txt"
    with concat.open("w") as f:
        for p in scene_paths:
            f.write(f"file '{p}'\n")

    final = OUT / "panelverse-funny-reel.mp4"
    run(
        [
            "ffmpeg",
            "-y",
            "-f",
            "concat",
            "-safe",
            "0",
            "-i",
            str(concat),
            "-c",
            "copy",
            str(final),
        ]
    )

    total = audio_duration(final)
    print(f"Final reel: {final} ({total:.1f}s)")


if __name__ == "__main__":
    asyncio.run(main())
