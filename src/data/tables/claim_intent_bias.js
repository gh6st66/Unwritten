
export default {
  "$schema": "https://unwritten/schemas/claim_intent_bias.json",
  "_note": "Signed weights. Positive enacts the claim; negative resists it. Claim.polarity multiplies this.",
  "BETRAY_AN_ALLY": { "DECEIVE": 2, "BARGAIN": 1, "AID": -2, "WITHSTAND": -1 },
  "COWARDICE":      { "SNEAK": 2,  "CONFRONT": -2, "WITHSTAND": -2 },
  "HONOR_BOUND":    { "WITHSTAND": 2, "CONFRONT": 1, "DECEIVE": -2 },
  "TRICKSTERS_DUE": { "DECEIVE": 2, "SNEAK": 1, "WITHSTAND": -1, "PERSUADE": -1 },
  "OATH_KEEPING":   { "AID": 1, "PERSUADE": 1, "WITHSTAND": 1, "DECEIVE": -2 },
  "MERCY":          { "AID": 2, "PERSUADE": 1, "CONFRONT": -1 },
  "CRUELTY":        { "CONFRONT": 2, "DECEIVE": 1, "AID": -2 },
  "DEFAULT":        { }
}
