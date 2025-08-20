
export default {
  "id": "HELP_MILLER",
  "title": "The Broken Wheel",
  "summary": "A miller blocks the road, his cart's wheel splintered. He pleads for aid.",
  "tensionMod": 2,
  "context": {
    "scene": "Street",
    "npcRole": "Merchant"
  },
  "options": [
    {
      "id": "LEND_HAND",
      "label": "Lift the axle back in place.",
      "intent": "WITHSTAND",
      "baseDifficulty": 55,
      "baseCosts": { "energy": 8, "AGG_WIS": 1 },
      "outcomes": [
        { "kind": "SUCCESS", "resourceDelta": { "will": 3 }, "markEffects": [{ "id": "MERCIFUL", "deltaXp": 5 }], "echoSeeds": [{ "tag": "TOWN", "weight": 8, "payload": { "millerHelped": true } }], "text": "With a grunt, you heave the heavy axle back into place. The miller is overjoyed." },
        { "kind": "FAIL", "resourceDelta": { "energy": -4 }, "markEffects": [{ "id": "COWARD", "deltaXp": 2 }], "text": "You strain, but the weight is too much. The axle slips, and you stumble back." }
      ]
    },
    {
      "id": "BARGAIN_PASSAGE",
      "label": "Offer coin for a faster repair.",
      "intent": "BARGAIN",
      "baseDifficulty": 35,
      "baseCosts": { "clarity": 3, "WIS_CUN": 1 },
      "outcomes": [
        { "kind": "SUCCESS", "dispositionDelta": { "PRUDENCE": 5 }, "text": "You pay a few coins. The miller, motivated, quickly gets the wheel patched enough to move." },
        { "kind": "FAIL", "markEffects": [{ "id": "TRICKSTER", "deltaXp": 2 }], "text": "Your offer is seen as an insult. The miller grumbles and takes his time, costing you more than just coin." }
      ]
    }
  ]
}