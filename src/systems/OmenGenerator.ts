/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { Origin, ResourceId } from "../game/types";
import { OMENS_DATA } from "../data/claims";
import { LEXEMES_DATA } from "../data/lexemes";
import { LexemeTier } from "../types/lexeme";

const validOmenIds = OMENS_DATA.map(c => c.id);
const validResourceIds = Object.values(ResourceId);
const validMarkIds = ["indebted", "oathbreaker", "visionary", "outcast"]; // A few examples for Gemini to use.
const basicLexemeIds = LEXEMES_DATA.filter(l => l.tier === LexemeTier.Basic).map(l => l.id);

export class OmenGenerator {
  constructor() {
    // API Client is no longer initialized here
  }

  public async generateOrigins(count: number = 3): Promise<Origin[]> {
    const promptContext = {
      count,
      validOmenIds,
      validMarkIds,
      basicLexemeIds,
    };
    
    try {
      const response = await fetch('/api/generate-origins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(promptContext),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Server responded with ${response.status}: ${errorBody}`);
      }

      const parsed = await response.json();

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
      console.error("Failed to fetch or parse generated origins:", e);
      // Return a set of default, hardcoded origins as a fallback.
      return this.getFallbackOrigins();
    }
  }

  private getFallbackOrigins(): Origin[] {
    return [
      {
        id: "fallback_debt",
        title: "A Debt Unpaid",
        description: "The run begins with a heavy obligation, either material or spiritual.",
        tags: ["economic", "obligation"],
        initialPlayerMarkId: "indebted",
        resourceModifier: { [ResourceId.CURRENCY]: -10 },
        omenBias: ["betray", "forsake"],
        lexemeBias: ["endurance", "guile", "insight"],
      },
      {
        id: "fallback_heresy",
        title: "A Whispered Heresy",
        description: "A forbidden truth has been uncovered, and dogmatic authority is aware.",
        tags: ["secrecy", "rebellion"],
        omenBias: ["reveal_secret", "ignite"],
        lexemeBias: ["insight", "deception", "ferocity"],
      },
       {
        id: "fallback_truce",
        title: "A Fragile Truce",
        description: "Old rivals have agreed to a ceasefire, but tensions simmer beneath the surface.",
        tags: ["political", "intrigue"],
        omenBias: ["betray", "reveal_secret"],
        lexemeBias: ["deception", "guile", "insight"],
      }
    ];
  }
}