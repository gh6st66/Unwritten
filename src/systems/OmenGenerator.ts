/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI, Type } from "@google/genai";
import { WorldSeed, ResourceId } from "../game/types";
import { CLAIMS_DATA } from "../data/claims";

const MODEL = "gemini-2.5-flash";

const validClaimIds = CLAIMS_DATA.map(c => c.id);
const validResourceIds = Object.values(ResourceId);
const validMarkIds = ["indebted", "oathbreaker", "visionary", "outcast"]; // A few examples for Gemini to use.

export class OmenGenerator {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  }

  public async generateOmens(count: number = 3): Promise<WorldSeed[]> {
    const prompt = this.buildPrompt(count);

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            omens: {
                type: Type.ARRAY,
                description: `Generate exactly ${count} unique omens.`,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.STRING, description: "A unique snake_case id, e.g., 'a_city_in_flame'." },
                        title: { type: Type.STRING, description: "A short, evocative title, e.g., 'A City in Flame'." },
                        description: { type: Type.STRING, description: "A 1-2 sentence somber, mystical description of the omen and its themes." },
                        tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3-4 lowercase thematic tags, e.g., ['conflict', 'urban', 'rebellion']." },
                        initialPlayerMarkId: { type: Type.STRING, description: `Optional. If used, must be one of: ${validMarkIds.join(", ")}.` },
                        resourceModifier: {
                            type: Type.OBJECT,
                            description: "Optional. Can contain keys from the valid list with a small integer delta.",
                            properties: {
                                [ResourceId.CURRENCY]: { type: Type.INTEGER, nullable: true },
                                [ResourceId.CLARITY]: { type: Type.INTEGER, nullable: true },
                                [ResourceId.TIME]: { type: Type.INTEGER, nullable: true },
                            }
                        },
                        claimBias: { type: Type.ARRAY, items: { type: Type.STRING }, description: `An array of 1-2 claim IDs from: ${validClaimIds.join(", ")}.` },
                    },
                    propertyOrdering: ["id", "title", "description", "tags", "initialPlayerMarkId", "resourceModifier", "claimBias"],
                    required: ["id", "title", "description"],
                }
            }
        },
        propertyOrdering: ["omens"],
        required: ["omens"],
    };

    const res = await this.ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema,
      },
    });

    try {
      const parsed = JSON.parse(res.text.trim());
      if (parsed.omens && Array.isArray(parsed.omens)) {
        // Basic validation and cleanup
        return parsed.omens.map((omen: any) => ({
          ...omen,
          id: omen.id || `gen_${Math.random().toString(36).slice(2)}`,
          title: omen.title || "An Unwritten Omen",
          description: omen.description || "Fate has not yet been written.",
        })).slice(0, count);
      }
      throw new Error("Generated data is not in the expected format.");
    } catch (e) {
      console.error("Failed to parse generated omens JSON:", res.text, e);
      throw new Error("The omens are unclear; the future could not be discerned.");
    }
  }

  private buildPrompt(count: number): string {
    return `
      System: You are a myth-maker for a dark fantasy roguelike called "Unwritten". Generate a set of starting scenarios called "Omens".
      Rules:
      - Generate a JSON object that strictly adheres to the provided schema, containing exactly ${count} omens.
      - The tone must be somber, mystical, and evocative.
      - Each omen should present a distinct narrative starting point.
      - Resource modifiers should be small and impactful (e.g., -10 COIN, +1 CLARITY).
      - Do not invent new claim IDs, resource IDs, or mark IDs. Use only the ones provided in the schema descriptions.
      
      Generate the JSON for the omens now.
    `;
  }
}
