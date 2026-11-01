#!/usr/bin/env python3
"""Render 40 portrait scene JPEGs in a consistent Indian-cartoon style."""
from __future__ import annotations

import json
import math
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "scenes"
OUT.mkdir(parents=True, exist_ok=True)
W, H = 1080, 1920

# Fixed palette / character constants
SKIN = (210, 70, 55)
SKIN_D = (170, 45, 35)
OUTLINE = (45, 25, 20)
GOLD = (255, 200, 80)
MAROON = (80, 15, 25)
BG_TOP = (35, 8, 18)
BG_BOT = (120, 35, 25)


def lerp(a, b, t):
    return int(a + (b - a) * t)


def gradient_bg(draw: ImageDraw.ImageDraw, mood: float = 0.5):
    for y in range(H):
        t = y / H
        t = t * t * (3 - 2 * t)
        r = lerp(BG_TOP[0], BG_BOT[0], t)
        g = lerp(BG_TOP[1], BG_BOT[1], t)
        b = lerp(BG_TOP[2], BG_BOT[2], t)
        draw.line([(0, y), (W, y)], fill=(r, g, b))


def add_glow(img: Image.Image, color=(255, 120, 40), radius=40, alpha=90):
    glow = Image.new("RGBA", img.size, (0, 0, 0, 0))
    g = ImageDraw.Draw(glow)
    g.ellipse([W // 2 - 220, H // 3 - 180, W // 2 + 220, H // 3 + 260], fill=(*color, alpha))
    glow = glow.filter(ImageFilter.GaussianBlur(radius))
    return Image.alpha_composite(img.convert("RGBA"), glow)


def draw_outline_circle(d, cx, cy, r, fill, width=4):
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=fill, outline=OUTLINE, width=width)


def draw_chinnamasta(d: ImageDraw.ImageDraw, cx, cy, scale=1.0, head_in_hand=True, attendants=False):
    s = scale
    # Body
    d.ellipse([cx - 55 * s, cy - 20 * s, cx + 55 * s, cy + 130 * s], fill=SKIN, outline=OUTLINE, width=int(5 * s))
    # Neck
    d.rectangle([cx - 18 * s, cy - 45 * s, cx + 18 * s, cy - 18 * s], fill=SKIN_D, outline=OUTLINE, width=int(3 * s))
    # Arms
    d.line([(cx - 50 * s, cy + 10 * s), (cx - 110 * s, cy - 40 * s)], fill=(255, 210, 170), width=int(16 * s))
    d.line([(cx + 50 * s, cy + 10 * s), (cx + 120 * s, cy - 30 * s)], fill=(255, 210, 170), width=int(16 * s))
    # Sword
    d.polygon(
        [
            (cx + 120 * s, cy - 30 * s),
            (cx + 170 * s, cy - 90 * s),
            (cx + 155 * s, cy - 98 * s),
            (cx + 108 * s, cy - 38 * s),
        ],
        fill=(200, 210, 220),
        outline=OUTLINE,
    )
    if head_in_hand:
        hx, hy = cx - 105 * s, cy - 55 * s
        draw_outline_circle(d, hx, hy, 34 * s, SKIN, 4)
        d.ellipse([hx - 10 * s, hy - 8 * s, hx - 2 * s, hy], fill=OUTLINE)
        d.ellipse([hx + 2 * s, hy - 8 * s, hx + 10 * s, hy], fill=OUTLINE)
        d.arc([hx - 12 * s, hy + 2 * s, hx + 12 * s, hy + 16 * s], 20, 160, fill=OUTLINE, width=int(3 * s))
    else:
        draw_outline_circle(d, cx, cy - 70 * s, 38 * s, SKIN, 4)
        d.ellipse([cx - 12 * s, cy - 78 * s, cx - 4 * s, cy - 70 * s], fill=OUTLINE)
        d.ellipse([cx + 4 * s, cy - 78 * s, cx + 12 * s, cy - 70 * s], fill=OUTLINE)
        d.ellipse([cx - 6 * s, cy - 88 * s, cx + 6 * s, cy - 76 * s], fill=(255, 230, 120), outline=OUTLINE, width=2)
    # Crown / hair
    d.polygon(
        [(cx - 40 * s, cy - 55 * s), (cx, cy - 95 * s), (cx + 40 * s, cy - 55 * s)],
        fill=(25, 15, 15),
        outline=OUTLINE,
    )
    d.polygon(
        [(cx - 22 * s, cy - 72 * s), (cx, cy - 88 * s), (cx + 22 * s, cy - 72 * s)],
        fill=GOLD,
        outline=OUTLINE,
    )
    # Skull garland
    for i, ox in enumerate([-35, -15, 5, 25, 45]):
        draw_outline_circle(d, cx + ox * s, cy - 5 * s, 8 * s, (230, 230, 230), 2)
    # Streams
    for sx in (-25, 0, 25):
        d.line([(cx + sx * s, cy - 40 * s), (cx + sx * s * 1.3, cy + 40 * s)], fill=(190, 30, 40), width=int(6 * s))
    if attendants:
        draw_outline_circle(d, cx - 150 * s, cy + 40 * s, 28 * s, (255, 205, 190), 3)
        draw_outline_circle(d, cx + 150 * s, cy + 40 * s, 28 * s, (235, 90, 80), 3)


def draw_parvati(d, cx, cy, scale=1.0):
    s = scale
    d.ellipse([cx - 50 * s, cy, cx + 50 * s, cy + 120 * s], fill=(240, 180, 200), outline=OUTLINE, width=4)
    draw_outline_circle(d, cx, cy - 30 * s, 36 * s, (255, 220, 210), 4)
    d.rectangle([cx - 40 * s, cy + 20 * s, cx + 40 * s, cy + 150 * s], fill=(180, 60, 120), outline=OUTLINE, width=3)


def render_scene(scene_id: int) -> Image.Image:
    random.seed(scene_id * 9973)
    img = Image.new("RGB", (W, H), BG_TOP)
    d = ImageDraw.Draw(img)
    gradient_bg(d, mood=scene_id / 38)

    # Scene-specific compositions
    if scene_id == 1:
        d.rectangle([140, 500, 940, 1500], outline=GOLD, width=8)
        d.polygon([(540, 420), (260, 620), (820, 620)], fill=GOLD, outline=OUTLINE, width=4)
    elif scene_id == 2:
        for i in range(10):
            ang = math.pi * 0.15 + i * (math.pi * 0.07)
            x = W // 2 + int(math.cos(ang) * 320)
            y = 700 + int(math.sin(ang) * 180)
            draw_outline_circle(d, x, y, 36, (200, 80 + i * 8, 90), 3)
    elif scene_id in (3, 4, 5, 6, 7, 8, 9, 10):
        draw_chinnamasta(d, W // 2, 900, 1.15, head_in_hand=scene_id != 5, attendants=scene_id in (8, 9, 10))
    elif scene_id in (11, 12, 13):
        for i in range(6):
            d.polygon([(200 + i * 130, 1300), (260 + i * 130, 1100), (320 + i * 130, 1300)], fill=(255, 120 + i * 10, 30), outline=OUTLINE)
        if scene_id == 13:
            draw_outline_circle(d, 270, 980, 40, (255, 220, 120), 3)
            draw_outline_circle(d, 540, 980, 40, (200, 200, 200), 3)
            draw_outline_circle(d, 810, 980, 40, (255, 80, 80), 3)
    elif scene_id in (14, 15, 16, 17, 18, 19, 20):
        draw_parvati(d, W // 2 - 120, 920, 1.0)
        draw_parvati(d, W // 2 + 120, 920, 1.0)
        draw_parvati(d, W // 2, 860, 1.1)
        if scene_id >= 17:
            d.line([(W // 2, 700), (W // 2, 520)], fill=(220, 220, 230), width=8)
    elif scene_id in (21, 22, 23, 24):
        draw_chinnamasta(d, W // 2, 880, 1.2, head_in_hand=True, attendants=False)
        if scene_id == 22:
            d.ellipse([380, 520, 700, 760], fill=(120, 40, 140, 120), outline=GOLD, width=4)
    elif scene_id in (25, 26, 27, 28):
        for r in range(20, 160, 18):
            d.ellipse([W // 2 - r, 620 - r // 2, W // 2 + r, 620 + r // 2], outline=GOLD, width=2)
        if scene_id >= 27:
            draw_outline_circle(d, W // 2, 620, 55, (30, 20, 40), 4)
    elif scene_id in (29, 30, 31, 32):
        d.regular_polygon((W // 2, 900, 220), 6, outline=GOLD, width=4)
        if scene_id >= 31:
            d.ellipse([420, 1100, 660, 1300], fill=(255, 140, 40), outline=OUTLINE, width=3)
    elif scene_id in (33, 34, 35):
        d.rectangle([260, 700, 820, 1400], fill=(60, 30, 25), outline=GOLD, width=5)
        draw_chinnamasta(d, W // 2, 950, 0.9, head_in_hand=True)
    elif scene_id in (36, 37, 38, 39, 40):
        draw_chinnamasta(d, W // 2, 900, 1.25, head_in_hand=True, attendants=True)
        for i in range(80):
            x = random.randint(0, W)
            y = random.randint(0, H)
            d.point((x, y), fill=(255, random.randint(180, 240), random.randint(80, 160)))
    else:
        draw_chinnamasta(d, W // 2, 900, 1.1, True, attendants=scene_id % 2 == 0)

    img = add_glow(img)
    return img.convert("RGB")


def main():
    scenes = json.loads((ROOT / "src/scenes.json").read_text(encoding="utf-8"))
    for scene in scenes:
        sid = scene["id"]
        out = OUT / f"scene-{sid:02d}.jpg"
        render_scene(sid).save(out, quality=92, optimize=True)
        print("wrote", out.name)


if __name__ == "__main__":
    main()
