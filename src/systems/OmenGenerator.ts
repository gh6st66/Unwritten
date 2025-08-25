/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI, Type } from "@google/genai";
import { Origin, ResourceId } from "../game/types";
import { OMENS_DATA } from "../data/omens";
import { LEXEMES_DATA } from "../data/lexemes";
import { LexemeTier } from "../types/lexeme";

const MODEL = "gemini-2.5-flash";

const validOmenIds = OMENS_DATA.map(c => c.id);
const validResourceIds = Object.values(ResourceId);
const validMarkIds = ["indebted", "oathbreaker", "visionary", "outcast"]; // A few examples for Gemini to use.
const basicLexemeIds = LEXEMES_DATA.filter(l => l.tier === LexemeTier.Basic).map(l => l.id);

export class OriginGenerator {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  }

  public async generateOrigins(count: number = 3): Promise<Origin[]> {
    const prompt = this.buildPrompt(count);

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            origins: {
                type: Type.ARRAY,
                description: `Generate exactly ${count} unique origins.`,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.STRING, description: "A unique snake_case id, e.g., 'a_city_in_flame'." },
                        title: { type: Type.STRING, description: "A short, evocative title, e.g., 'A City in Flame'." },
                        description: { type: Type.STRING, description: "A 1-2 sentence somber, mystical description of the origin and its themes." },
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
                        omenBias: { type: Type.ARRAY, items: { type: Type.STRING }, description: `An array of 1-2 omen IDs from: ${validOmenIds.join(", ")}.` },
                        lexemeBias: { type: Type.ARRAY, items: { type: Type.STRING }, description: `An array of 3-4 thematically appropriate lexeme IDs from: ${basicLexemeIds.join(", ")}.` },
                    },
                    propertyOrdering: ["id", "title", "description", "tags", "initialPlayerMarkId", "resourceModifier", "omenBias", "lexemeBias"],
                    required: ["id", "title", "description"],
                }
            }
        },
        propertyOrdering: ["origins"],
        required: ["origins"],
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
      if (parsed.origins && Array.isArray(parsed.origins)) {
        // Basic validation and cleanup
        return parsed.origins.map((origin: any) => ({
          ...origin,
          id: origin.id || `gen_${Math.random().toString(36).slice(2)}`,
          title: origin.title || "An Unwritten Origin",
          description: origin.description || "Fate has not yet been written.",
        })).slice(0, count);
      }
      throw new Error("Generated data is not in the expected format.");
    } catch (e) {
      console.error("Failed to parse generated origins JSON:", res.text, e);
      throw new Error("The origins are unclear; the future could not be discerned.");
    }
  }

  private buildPrompt(count: number): string {
    return `
      System: You are a myth-maker for a dark fantasy roguerike called "Unwritten". Generate a set of starting scenarios called "Origins".
      Rules:
      - Generate a JSON object that strictly adheres to the provided schema, containing exactly ${count} origins.
      - The tone must be somber, mystical, and evocative.
      - Each origin should present a distinct narrative starting point.
      - Resource modifiers should be small and impactful (e.g., -10 COIN, +1 CLARITY).
      - Do not invent new omen IDs, resource IDs, mark IDs, or lexeme IDs. Use only the ones provided in the schema descriptions.
      
      Generate the JSON for the origins now.
    `;
  }
}