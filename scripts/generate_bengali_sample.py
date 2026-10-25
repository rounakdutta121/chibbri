#!/usr/bin/env python3
"""Generate ~30s Bengali story sample with Indic Parler-TTS."""
import os
import torch
import soundfile as sf
from parler_tts import ParlerTTSForConditionalGeneration
from transformers import AutoTokenizer

OUT_PATH = "/workspace/deliverables/bengali-story-sample-30s.wav"
MODEL_ID = "ai4bharat/indic-parler-tts"

# PanelVerse-style opening (~slow narration ≈ 30 seconds)
PROMPT = (
    "রাতের আড়াইটা। পুরনো বাড়ির দরজায় হালকা ধাকা। "
    "অনিক ভেতরে বসে ছিল, কিন্তু তার কানে শুনতে পেল— কেউ তার নাম ডাকছে। "
    "আর তারপর... একটা শব্দ, যেন কেউ ফিসফিস করে বলছে, "
    "'দরজা খোল... আমি ভিতরে আছি।'"
)

DESCRIPTION = (
    "A deep, warm male storyteller with natural Indian Bengali pronunciation. "
    "He speaks slowly and intimately, with cinematic pauses before revelations. "
    "His voice is slightly low-pitched, calm but suspenseful, never robotic. "
    "The recording is very high quality with no background noise."
)


def main():
    device = "cpu"
    print(f"Loading {MODEL_ID} on {device}...")
    model = ParlerTTSForConditionalGeneration.from_pretrained(MODEL_ID).to(device)
    tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
    description_tokenizer = AutoTokenizer.from_pretrained(
        model.config.text_encoder._name_or_path
    )

    description_input_ids = description_tokenizer(DESCRIPTION, return_tensors="pt").to(
        device
    )
    prompt_input_ids = tokenizer(PROMPT, return_tensors="pt").to(device)

    print("Generating audio (CPU may take several minutes)...")
    with torch.inference_mode():
        generation = model.generate(
            input_ids=description_input_ids.input_ids,
            attention_mask=description_input_ids.attention_mask,
            prompt_input_ids=prompt_input_ids.input_ids,
            prompt_attention_mask=prompt_input_ids.attention_mask,
        )

    audio_arr = generation.cpu().numpy().squeeze()
    sf.write(OUT_PATH, audio_arr, model.config.sampling_rate)
    duration = len(audio_arr) / model.config.sampling_rate
    print(f"Wrote {OUT_PATH} ({duration:.1f}s @ {model.config.sampling_rate} Hz)")


if __name__ == "__main__":
    main()
