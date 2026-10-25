#!/usr/bin/env python3
"""Generate Bengali audio via ai4bharat/indic-parler-tts Hugging Face Space (free)."""
import json
import sys
import time
import urllib.request

SPACE = "https://ai4bharat-indic-parler-tts.hf.space/gradio_api"


def generate(prompt: str, description: str, out_path: str) -> None:
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
        raise RuntimeError("Timed out waiting for Parler-TTS generation")

    with urllib.request.urlopen(f"{SPACE}/file={path}") as resp:
        with open(out_path, "wb") as f:
            f.write(resp.read())


if __name__ == "__main__":
    prompt = sys.argv[1] if len(sys.argv) > 1 else "নমস্কার।"
    desc = (
        sys.argv[2]
        if len(sys.argv) > 2
        else "A deep male Bengali storyteller speaks slowly with expressive emotion and very clear audio."
    )
    out = sys.argv[3] if len(sys.argv) > 3 else "output.mp3"
    generate(prompt, desc, out)
    print(out)
