#!/usr/bin/env python3
"""Clear Bengali TTS via Indic Parler-TTS HF Space (chunked; avoids gibberish on long text)."""
from __future__ import annotations

import json
import subprocess
import tempfile
import time
import urllib.request
from pathlib import Path

SPACE = "https://ai4bharat-indic-parler-tts.hf.space/gradio_api"

# Official-style caption for Bengali male narrator (model card)
DEFAULT_DESCRIPTION = (
    "Arjun speaks slowly in a low-pitched, calm voice, with a neutral tone, "
    "perfect for narration. The recording is very high quality with no background noise."
)


def _call_space(prompt: str, description: str, out_path: Path) -> None:
    payload = json.dumps({"data": [prompt, description]}).encode()
    req = urllib.request.Request(
        f"{SPACE}/call/generate_finetuned",
        data=payload,
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=120) as resp:
        event_id = json.loads(resp.read())["event_id"]

    path = None
    for _ in range(180):
        with urllib.request.urlopen(
            f"{SPACE}/call/generate_finetuned/{event_id}", timeout=120
        ) as resp:
            for line in resp.read().decode().split("\n"):
                if line.startswith("data:"):
                    data = json.loads(line[5:].strip())
                    if data:
                        path = data[0]["path"]
                        break
        if path:
            break
        time.sleep(2)

    if not path:
        raise RuntimeError("Timed out waiting for Parler-TTS")

    with urllib.request.urlopen(f"{SPACE}/file={path}") as resp:
        out_path.write_bytes(resp.read())


def generate_scenes(
    scenes: list[str],
    out_mp3: str | Path,
    description: str = DEFAULT_DESCRIPTION,
    pause_s: float = 0.45,
) -> Path:
    """Generate each short scene separately, then concat (max ~20 words per scene)."""
    out_mp3 = Path(out_mp3)
    with tempfile.TemporaryDirectory() as tmp:
        tmp_path = Path(tmp)
        chunks: list[Path] = []
        for i, scene in enumerate(scenes):
            chunk = tmp_path / f"scene_{i}.mp3"
            _call_space(scene.strip(), description, chunk)
            chunks.append(chunk)

        silence = tmp_path / "silence.mp3"
        subprocess.check_call(
            [
                "ffmpeg",
                "-y",
                "-f",
                "lavfi",
                "-i",
                "anullsrc=r=44100:cl=mono",
                "-t",
                str(pause_s),
                "-q:a",
                "9",
                str(silence),
            ],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )

        list_file = tmp_path / "list.txt"
        with list_file.open("w") as f:
            for i, chunk in enumerate(chunks):
                f.write(f"file '{chunk}'\n")
                if i < len(chunks) - 1:
                    f.write(f"file '{silence}'\n")

        subprocess.check_call(
            [
                "ffmpeg",
                "-y",
                "-f",
                "concat",
                "-safe",
                "0",
                "-i",
                str(list_file),
                "-c",
                "copy",
                str(out_mp3),
            ],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )

    return out_mp3


if __name__ == "__main__":
    story = [
        "রাতের আড়াইটা। পুরনো বাড়ির দরজায় হালকা ধাকা।",
        "অনিক ভেতরে বসে ছিল। হঠাৎ শুনতে পেল, কেউ তার নাম ডাকছে।",
        "আলো নিভে গেল। ঘরের কোণে ছায়া নড়ে।",
        "একটা ফিসফিস, দরজা খোল। আমি ভিতরে আছি।",
        "অনিকের হাত কাঁপছে। এই রাতটা শুধু গল্প নয়।",
    ]
    path = generate_scenes(story, "bengali-story-clear.mp3")
    print(path)
