
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function genPlantEntry(seed: { biome: string; rarity: "COMMON"|"RARE"|"MYTHIC" }) {
  const schema = {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING },
      lore: { type: Type.STRING },
      artPrompt: { type: Type.STRING }
    },
    required: ["name","lore","artPrompt"],
  };

  const systemInstruction = "You are a creative writer for a dark fantasy game. Generate a unique plant name, lore, and an art prompt for an in-game botanical illustration.";
  const userPrompt = `Biome=${seed.biome}; Rarity=${seed.rarity}.`;
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.7,
    }
  });
  
  const json = response.text.trim();
  return JSON.parse(json);
}

export async function generateMaskImage(prompt: string): Promise<string> {
    const response = await ai.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: prompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: "1:1",
        },
    });

    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64ImageBytes}`;
}
