
export default {
    "id": "town_gate",
    "title": "Gate of Ashvale",
    "location": "ashvale:gate",
    "summary": "The watch captain’s eyes flick to your hands, then to your face. A murmur ripples along the wall. They know what you are.",
    "options": [
      {
        "id": "parley_mask_on",
        "label": "Keep the mask on. Speak as a traveler.",
        "intent": "PERSUADE",
        "baseDifficulty": 50,
        "baseCosts": { "clarity": 5, "WIS": 1 },
        "outcomes": [
            { "kind": "SUCCESS", "text": "Your words are convincing enough. The guards wave you through, though their eyes linger." },
            { "kind": "FAIL", "text": "Your story doesn't quite hold up. The captain eyes you with suspicion but lets you pass for now." }
        ]
      },
      {
        "id": "reveal_and_resist",
        "label": "Remove the mask and challenge their judgment.",
        "intent": "CONFRONT",
        "baseDifficulty": 65,
        "baseCosts": { "will": 10, "AGG": 2 },
        "outcomes": [
            { "kind": "SUCCESS", "markEffects": [{"id": "BRAVE", "deltaXp": 4}], "text": "Your defiance is unexpected and potent. The guards, taken aback, step aside." },
            { "kind": "FAIL", "markEffects": [{"id": "COWARD", "deltaXp": 2}], "resourceDelta": { "will": -5 }, "text": "Your challenge falls flat, met with stony silence. You are allowed to pass, but your reputation suffers." }
        ]
      },
      {
        "id": "reveal_and_accept",
        "label": "Remove the mask and accept the blame placed upon you.",
        "intent": "WITHSTAND",
        "baseDifficulty": 40,
        "baseCosts": { "clarity": 10 },
        "outcomes": [
            { "kind": "SUCCESS", "markEffects": [{"id": "STEADFAST", "deltaXp": 3}], "text": "You bear their judgment without flinching. Some guards look away, a flicker of respect in their eyes." },
            { "kind": "FAIL", "markEffects": [{"id": "STEADFAST", "deltaXp": 1}], "text": "You accept their scorn, and it settles upon you like a heavy cloak." }
        ]
      }
    ]
  }
