/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI, Type } from "@google/genai";
import { Mask, WorldSeed } from "../game/types";
import { ForgeTemplate } from "./maskforging/types";

const TEXT_MODEL = "gemini-2.5-flash";
const IMAGE_MODEL = "imagen-3.0-generate-002";

export class MaskForger {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  }

  public async forge(wordId: string, seed: WorldSeed, forge: ForgeTemplate): Promise<Mask> {
    const textDetails = await this.generateTextDetails(wordId, seed, forge);
    const imageUrl = await this.generateMaskImage(textDetails.description, forge, wordId);

    return {
      id: crypto.randomUUID(),
      ...textDetails,
      imageUrl,
    };
  }

  private async generateTextDetails(wordId: string, seed: WorldSeed, forge: ForgeTemplate): Promise<Omit<Mask, 'imageUrl' | 'id'>> {
    const twist = forge.wordModifiers[wordId] ?? forge.defaultTwist;

    const prompt = [
      "System: You are a myth-maker for a dark fantasy roguelike. Generate a JSON object for a character's first mask based on a portent, a forge, and an inscribed word.",
      "Rules:",
      "- The JSON MUST have `name` (string, 1-3 words), `description` (string, evocative, 2-3 sentences), and `grantedMarks` (array of 1-2 objects with `id`, `label`, `value`).",
      "- The `name` should be creative and related to the twisted word name.",
      "- The `description` should incorporate the visual style of the twist and the portent's theme.",
      "- The `id` for marks should be a simple, machine-readable string (e.g., 'salt-ash-corrosion', 'tide-blade-fury').",
      "- The `value` for marks should be `1`.",
      "- The tone is somber and mystical.",
      `Portent: "${seed.description}"`,
      `Forge: "${forge.name} - ${forge.location.description}"`,
      `Inscribed Word: "${wordId}" which becomes "${twist.name}" at this forge.`,
      `Twist Flavor: "${twist.flavor}"`,
      `Twist Effect (for inspiration): "${twist.effect}"`,
    ].join("\n");

    const res = await this.ai.models.generateContent({
        model: TEXT_MODEL,
        contents: prompt,
        config: { 
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    grantedMarks: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                id: { type: Type.STRING },
                                label: { type: Type.STRING },
                                value: { type: Type.INTEGER }
                            },
                            propertyOrdering: ["id", "label", "value"],
                        }
                    }
                },
                propertyOrdering: ["name", "description", "grantedMarks"],
            }
        }
    });

    try {
        const text = res.text.trim();
        return JSON.parse(text);
    } catch (e) {
        console.error("Failed to parse mask description JSON:", res.text, e);
        throw new Error("The cultural ether is silent; the mask could not be formed.");
    }
  }

  private async generateMaskImage(description: string, forge: ForgeTemplate, wordId: string): Promise<string> {
    const twist = forge.wordModifiers[wordId] ?? forge.defaultTwist;
    const prompt = `A single, haunted mask, portrait style, on a black background. Dark fantasy oil painting. The mask is described as: "${description}". Visual keywords for the mask: ${twist.visual}. Visual keywords for the environment: ${forge.location.visuals.join(", ")}. Cinematic lighting, intricate details, moody, atmospheric.`;
    
    const res = await this.ai.models.generateImages({
        model: IMAGE_MODEL,
        prompt: prompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: '1:1',
        },
    });

    if (res.generatedImages && res.generatedImages.length > 0) {
        const base64ImageBytes: string = res.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
    
    // Return a placeholder if generation fails
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
  }
}