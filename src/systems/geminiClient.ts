import { GoogleGenAI } from "@google/genai";

const MODEL = "gemini-2.5-flash";

export class GeminiClient {
  private ai: GoogleGenAI;
  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  }

  async generateEncounter(seed: {
    claimText: string;
    marks: Array<{ id: string; value: number }>;
    maskSeed?: string;
  }) {
    const prompt = [
      "System: You generate a single JSON encounter for a text roguelike.",
      "Rules:",
      "- Keep prompt <= 60 words.",
      "- 2–3 options. Each has label, costs, effects.",
      "- Add a short internalThoughtHint in parentheses.",
      "Output ONLY JSON with keys: prompt, options[], internalThoughtHint.",
      `Claim: ${seed.claimText}`,
      `Marks: ${seed.marks.map(m => `${m.id}:${m.value}`).join(", ") || "none"}`,
      seed.maskSeed ? `MaskSeed: ${seed.maskSeed}` : ""
    ].join("\n");

    const res = await this.ai.models.generateContent({
        model: MODEL,
        contents: prompt,
        config: {
            responseMimeType: "application/json"
        }
    });
    
    const text = res.text;
    
    try {
      const parsed = JSON.parse(text);
      return parsed;
    } catch {
      // fallback minimal encounter when parsing fails
      return {
        prompt: "A hush falls. Someone speaks your title like a curse.",
        internalThoughtHint: "(Pick a direction. Commit.)",
        options: [
          { id: "defy", label: "Defy the room", costs: { TIME: 1 }, effects: { CLARITY: 1 } },
          { id: "yield", label: "Yield and listen", costs: { TIME: 1 } }
        ]
      };
    }
  }
}
