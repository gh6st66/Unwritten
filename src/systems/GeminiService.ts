import { GoogleGenAI, Type } from "@google/genai";
import { MaskBlueprint, RegionCulture, MaskSeed, MaskDescription } from "./culture/types";
import { ImagePromptSpec } from "./culture/imagePrompts";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateMaskDescription(bp: MaskBlueprint, culture: RegionCulture, seed: MaskSeed): Promise<MaskDescription> {
  const schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      summary: { type: Type.STRING },
      appearance: { type: Type.STRING },
      craftNotes: { type: Type.STRING },
      ritualUse: { type: Type.STRING },
      legalNote: { type: Type.STRING },
      tags: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
    required: ["title", "summary", "appearance", "craftNotes", "tags"],
  };

  const systemInstruction = "You are a creative writer for a dark fantasy game. Generate a compelling description for a cultural mask.";
  const userPrompt = `
    Based on the following data, create a mask description.
    Culture: ${JSON.stringify(culture.axes)}
    Blueprint: ${JSON.stringify(bp)}
    Seed Flavor: ${seed.flavor?.tagline}
  `;
  
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
  return JSON.parse(json) as MaskDescription;
}

export async function generateMaskImage(spec: ImagePromptSpec): Promise<string> {
    const response = await ai.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: spec.prompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: spec.aspect,
        },
    });

    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64ImageBytes}`;
}
