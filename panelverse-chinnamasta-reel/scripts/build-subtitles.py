import json
import re

SEGMENTS_EN = [
    "Welcome to PanelVerse.",
    "Today Chinnamasta",
    "sixth goddess of the ten Mahavidyas.",
    "The name itself says",
    "severed head",
    "who stands holding her own severed head.",
    "In scriptural meditation she is naked, blood-red face, three-eyed.",
    "One hand the khadga, the other her own head.",
    "Three streams of blood",
    "to Dakini and Varnini,",
    "one to her own mouth.",
    "At her feet Kamadeva and Rati",
    "desire lies beneath her.",
    "Beside a half-burned cremation ground,",
    "amid sacred fire",
    "life, death, and passion in one frame.",
    "In one story Parvati bathed with two companions.",
    "Hunger became unbearable.",
    "Blood flowed from her body.",
    "Then she herself raised the sword and severed her head",
    "three streams satisfied her companions and herself.",
    "Life, as if life feeds on life.",
    "In another telling she is the fierce Chanda form",
    "drunk on blood-wine,",
    "then revealed as Chinnamasta.",
    "In tantra she is vajra-shakti,",
    "the door of the sahasrara chakra, the peak of kundalini sadhana.",
    "Here the head means the mind, the ego",
    "where it is cut, there is void and siddhi.",
    "In worship: shodashopachara,",
    "yantra, mantra, nyasa;",
    "once blood sacrifice",
    "today in many places only symbolic offering.",
    "Sadhana stays secret from the guru's mouth;",
    "at Serampore Sen Bari she is the household goddess,",
    "but deep left-hand rites are not for the public eye.",
    "She is terrifying",
    "yet the giver",
    "who shows the path of liberation by cutting the mind.",
    "Chinnamasta",
    "whose head is gone, yet who is everything.",
]

with open("public/voiceover.json", encoding="utf-8") as f:
    data = json.load(f)

words = []
segments = data["segments"]
for i, seg in enumerate(segments):
    en = SEGMENTS_EN[i] if i < len(SEGMENTS_EN) else seg["text"]
    tokens = re.findall(r"\S+", en)
    if not tokens:
        continue
    start = seg["start"]
    end = seg["end"]
    dur = (end - start) / len(tokens)
    for j, w in enumerate(tokens):
        words.append(
            {
                "text": w,
                "start": round(start + j * dur, 3),
                "end": round(start + (j + 1) * dur, 3),
            }
        )

with open("src/subtitles.json", "w", encoding="utf-8") as f:
    json.dump(words, f, ensure_ascii=False, indent=2)

print(f"Wrote {len(words)} words")
