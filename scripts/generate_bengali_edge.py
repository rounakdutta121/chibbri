#!/usr/bin/env python3
"""Bengali PanelVerse-style ~30s sample via Microsoft Edge TTS (free)."""
import asyncio
import edge_tts

OUT = "/workspace/deliverables/bengali-story-sample-30s.mp3"
VOICE = "bn-IN-BashkarNeural"

TEXT = (
    "রাতের আড়াইটা। পুরনো বাড়ির দরজায় হালকা ধাকা। "
    "অনিক ভেতরে বসে ছিল, কিন্তু তার কানে শুনতে পেল— কেউ তার নাম ডাকছে। "
    "আলো নিভে গেল। ঘরের কোণে ছায়া নড়ে। "
    "আর তারপর... একটা শব্দ, যেন কেউ ফিসফিস করে বলছে, "
    "দরজা খোল... আমি ভিতরে আছি। "
    "অনিকের হাত কাঁপছে। সে জানে, এই রাতটা শুধু গল্প নয়।"
)


async def main():
    communicate = edge_tts.Communicate(TEXT, VOICE, rate="-8%")
    await communicate.save(OUT)
    print(f"Saved {OUT}")


if __name__ == "__main__":
    asyncio.run(main())
