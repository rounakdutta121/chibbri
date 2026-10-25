# Kali Puja Reel (West Bengal)

~88 second vertical reel (9:16) with cartoon scene art, Ken Burns motion, zoom transitions, captions, narration, ambient BGM, and scene-change SFX.

## Output

- `kali-puja-reel.mp4` — final deliverable
- `narration.mp3` / `narration.vtt` — voice and timed captions
- `assets/` — scene stills and BGM

## Rebuild

```bash
python3 /workspace/scripts/build_kali_puja_reel.py
```

## ElevenLabs narration (optional)

This environment has no `ELEVENLABS_API_KEY`. Narration uses **Microsoft Edge neural TTS** (`en-IN-PrabhatNeural`) for a natural Indian English male voice.

To swap in ElevenLabs:

```bash
export ELEVENLABS_API_KEY=your_key
curl -X POST "https://api.elevenlabs.io/v1/text-to-speech/<voice_id>" \
  -H "xi-api-key: $ELEVENLABS_API_KEY" -H "Content-Type: application/json" \
  -d '{"text":"...","model_id":"eleven_multilingual_v2"}' \
  --output deliverables/kali-puja-reel/narration.mp3
/home/ubuntu/.local/bin/edge-tts --voice en-IN-PrabhatNeural -f deliverables/kali-puja-reel/narration.txt \
  --write-subtitles deliverables/kali-puja-reel/narration.vtt --write-media /dev/null
python3 /workspace/scripts/build_kali_puja_reel.py
```

Replace `<voice_id>` with your preferred ElevenLabs voice (e.g. a warm documentary narrator).
