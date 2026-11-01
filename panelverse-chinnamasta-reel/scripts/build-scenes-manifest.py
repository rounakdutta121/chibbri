import json
from pathlib import Path

STYLE = (
    "Indian mythological TV cartoon animation still, portrait 9:16, bold outlines, "
    "rich maroon gold palette, cinematic lighting, no text, no watermark. "
    "Recurring goddess design: youthful red-orange skin, long black hair, gold crown, "
    "skull garland, green snake sacred thread, four arms when shown as Chinnamasta."
)

PROMPTS = [
    "PanelVerse title card atmosphere, mystical maroon temple gates opening, golden light beams, empty scene for intro",
    "Silhouette of ten Mahavidya goddesses in a cosmic arc, Indian cartoon mythology style",
    "Close-up cartoon scroll revealing the name Chinnamasta in visual symbols only, severed head icon glowing",
    "Full-body Chinnamasta cartoon goddess standing proud, holding her own head in left hand, khadga in right, red skin",
    "Same Chinnamasta character close-up three eyes and calm fierce expression, Indian animation style",
    "Same Chinnamasta character showing khadga sword and head in hands, dynamic pose",
    "Three luminous red energy streams flowing from goddess neck, cartoon symbolic not gory",
    "Dakini and Varnini attendants fair and red skin flanking the same Chinnamasta design",
    "Same attendants drinking energy streams, spiritual cartoon style",
    "Kamadeva and Rati tiny figures beneath goddess feet on lotus, Indian cartoon",
    "Kamadeva and Rati embrace beneath lotus as goddess watches from above, romantic cartoon symbolism",
    "Half-burned cremation ground at night with fire pits, Indian mythological cartoon background",
    "Sacred fire and smoke swirling, dramatic orange flames portrait scene",
    "Triptych feeling: life lotus, death skull, passion fire symbols in one cartoon frame",
    "Goddess Parvati bathing in river with two companions, Bengali cartoon mythology, modest respectful",
    "Parvati and companions exhausted from hunger, worried expressions, river ghat background",
    "Symbolic red life-energy flowing from Parvati's form, magical cartoon rays not graphic",
    "Parvati raising khadga toward sky in symbolic self-sacrifice moment, no gore, golden light burst",
    "Three energy streams feeding companions and self, cartoon spiritual metaphor",
    "Lotus feeding lotus imagery, life nourishing life, Indian cartoon symbolism",
    "Fierce Chandika form of goddess with wild energy aura, same red character design",
    "Goddess holding ritual cup in trance, dark purple background, cartoon style",
    "Transformation reveal: Chandika becomes calm Chinnamasta same character design center frame",
    "Lightning vajra and goddess merged, tantric power cartoon illustration",
    "Sahasrara lotus chakra glowing above head silhouette, kundalini spiral golden",
    "Human head silhouette dissolving into stars, ego becoming void, spiritual cartoon",
    "Empty luminous void with floating golden particles, siddhi achievement mood",
    "Ritual altar with sixteen offerings plates shodashopachara, Indian cartoon top view",
    "Tantric yantra mandala glowing red gold, mantra letters as abstract shapes not readable text",
    "Ancient ritual fire homa with offerings, priest silhouette, cartoon",
    "Modern symbolic pumpkin and rice offering instead of animal, gentle cartoon scene",
    "Guru whispering to disciple in shadow, secret mouth-to-ear teaching, Indian cartoon",
    "Serampore Bengali zamindar house courtyard puja, Sen Bari atmosphere, lamps and flowers",
    "Closed wooden door with mystic lock, left-hand tantra secrets hidden from crowd",
    "Chinnamasta fierce close-up with fire eyes, terrifying but divine cartoon",
    "Same goddess offering bowl of light to devotees, compassionate giver mood",
    "Path of liberation: mind chains breaking into butterflies, cartoon metaphor",
    "Hero shot Chinnamasta full figure with attendants on cremation fire background same design",
    "Devotional close-up Chin namasta blessing gesture, same cartoon goddess design",
    "Cosmic finale goddess merged with universe stars, headless silhouette filled with galaxies same character",
]

TARGET_SCENES = 40
assert len(PROMPTS) == TARGET_SCENES

with open("public/voiceover.json", encoding="utf-8") as f:
    data = json.load(f)

segments = data["segments"]
n_seg = len(segments)
assert n_seg == 41, f"expected 41 whisper segments, got {n_seg}"

# 40 images: one cut per narration segment (0–38), finale spans last two segments (39–40)
scenes = []
for i in range(39):
    scenes.append(
        {
            "id": i + 1,
            "file": f"scenes/scene-{i+1:02d}.jpg",
            "start": segments[i]["start"],
            "end": segments[i]["end"],
            "prompt": PROMPTS[i] + " " + STYLE,
            "segmentRange": [i, i],
        }
    )
scenes.append(
    {
        "id": 40,
        "file": "scenes/scene-40.jpg",
        "start": segments[39]["start"],
        "end": segments[40]["end"],
        "prompt": PROMPTS[39] + " " + STYLE,
        "segmentRange": [39, 40],
    }
)

Path("src/scenes.json").write_text(json.dumps(scenes, indent=2), encoding="utf-8")
Path("public/scenes").mkdir(parents=True, exist_ok=True)
print(f"Wrote {len(scenes)} scenes to src/scenes.json")
