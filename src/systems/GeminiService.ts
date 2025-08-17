/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { EncounterDef, EventOption, PlayerState, DynamicEventOutcome, PlayerMarks, Dispositions, MarkId } from "../core/types";
import { JournalPage } from "../components/OriginStoryView";
import { getMarkById } from "./DataLoader";

// IMPORTANT: Do not hardcode the API key. This is configured externally.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const describeDispositions = (dispositions: Dispositions): string => {
    const sorted = Object.entries(dispositions).filter(([,v]) => v !== 0).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
    if (sorted.length === 0) return "perfectly balanced";
    return sorted.map(d => d[0]).join(', ');
};

const describeMarks = (marks: PlayerMarks): string => {
    if (Object.keys(marks).length === 0) return "none";
    return Object.entries(marks).map(([id, markInstance]) => {
        const markDef = getMarkById(id as MarkId);
        if (!markDef) return id.replace('MARK_', '');
        const gradeLabel = markDef.gradeLabels[markInstance.severity - 1] || markDef.gradeLabels[markDef.gradeLabels.length - 1];
        const rootLabel = id.replace('MARK_', '').replace(/_/g, ' ');
        const formattedRoot = rootLabel.charAt(0).toUpperCase() + rootLabel.slice(1).toLowerCase();
        return `${formattedRoot} (${gradeLabel})`;
    }).join(', ');
};

/**
 * Generates narrative text from a given prompt using the Gemini model.
 * @param prompt The prompt to send to the model.
 * @returns The generated text as a string.
 */
export const generateNarrative = async (prompt: string): Promise<string> => {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    const text = response.text;
    if (typeof text === 'string') {
      return text.trim();
    }
    
    console.error("No text content found in Gemini response:", response);
    return "The threads of fate are tangled. The outcome is unclear.";

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "A sudden shift in the winds of fate prevents a clear outcome.";
  }
};

/**
 * Generates a unique, 3-page "Inquisitor's Journal" origin story.
 * The race is not directly chosen but inferred from choices with hidden hints.
 * @returns A promise that resolves to an array of three JournalPage objects.
 */
export const generateOriginStory = async (): Promise<JournalPage[]> => {
    const prompt = `
You are the Game Master for a gritty, low-fantasy roguelike deck-builder. Your task is to generate the character's origin story via the "Inquisitor's Journal." The player is piecing together their past from the burnt notes of an Inquisitor.

Each journal page MUST be an accusation, a piece of damning evidence, or a leading question about a past crime or transgression.
The answers (the "fragments") MUST be short, first-person memories that respond to the accusation. They are what the player "chooses to remember."

You MUST return a single, valid JSON array of THREE "JournalPage" objects. Do not include any markdown like \`\`\`json.

The JSON structure is:
interface JournalPage {
    id: string; // "page_1", "page_2", etc.
    text: string; // The Inquisitor's journal entry. MUST be an accusation or piece of evidence. e.g., "The ledger shows a page torn out, the night the Guildmaster was found dead. The subject's alibi is... thin."
    answers: AnswerDef[];
}
interface AnswerDef {
    id: string; // "p1_a1", etc.
    text: string; // A fragment of truth the player chooses. A short, first-person statement. e.g., "A childhood spent scaling the unforgiving peaks."
    narrativeSeed: string; // A more detailed version for the game's narrator. e.g., "They learned to survive in the biting winds of the high mountains."
    effects: EffectDef[]; // Mechanical outcomes.
    dispositionAdjustments?: { forceful?: number; deceptive?: number; honorable?: number; };
    marksToAdd?: string[]; // Array of Mark IDs. e.g. ["MARK_CHAINSCARRED"]
}

**Rules for generating the Journal:**

1.  **Create a Cohesive Narrative Arc**: The three pages should feel connected, telling a mysterious story about a single significant event in the character's past (a crime, an escape, a betrayal).
2.  **Vary the Outcomes**: Each answer should provide a distinct flavor and mechanical outcome.
3.  **Answer Count**: Each journal page must have exactly THREE distinct \`AnswerDef\` objects.
4.  **Mechanical Constraints**:
    - Use valid card IDs for effects: 'AGG_001', 'WIS_001', 'CUN_001', 'FURY_001', 'TACTICS_001', 'GUILE_001'.
    - Use valid bonus types for effects: 'MAX_HEALTH', 'START_COMBAT_WISDOM'.
    - Use small integer adjustments for dispositions (e.g., 2, 1, -1). Ensure a variety of mechanical outcomes across the answers.
    - If a memory strongly implies a specific context (like being in chains), add an appropriate mark like "MARK_CHAINSCARRED".

Now, generate the complete JSON array of THREE JournalPage objects.
`;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    const text = response.text;
    if (typeof text !== 'string') {
        throw new Error("Generated content is not a valid text response.");
    }
    const trimmedText = text.trim().replace(/^```json\s*|```$/g, '');
    if (trimmedText.startsWith('[') && trimmedText.endsWith(']')) {
      return JSON.parse(trimmedText) as JournalPage[];
    } else {
      throw new Error("Generated content is not a valid JSON array.");
    }
  } catch (error) {
    console.error("Error generating origin story from Gemini API:", error);
    // Return an empty array on failure to prevent crashing the app.
    // The UI will handle this state gracefully.
    return [];
  }
};


/**
 * Resolves the outcome of a player's choice in a dynamic narrative event.
 * @param event The definition of the encounter.
 * @param option The option the player selected.
 * @param playerState The current state of the player.
 * @returns A promise that resolves to a DynamicEventOutcome object.
 */
export const resolveDynamicEvent = async (event: EncounterDef, option: EventOption, playerState: PlayerState): Promise<DynamicEventOutcome> => {
    const narrativeContext = playerState.narrativeSeeds?.map(s => s.text).join('\n') || 'The player character is a blank slate.';
    
    const prompt = `
You are the Game Master for a gritty, low-fantasy rogelike. The player is in a narrative event and has made a choice. Your task is to determine the outcome.

You MUST return a single, valid JSON "DynamicEventOutcome" object. Do not include any markdown.

The JSON structure is:
interface DynamicEventOutcome {
    narrativeText: string; // A 2-3 sentence, flavorful description of what happens as a result of the player's action.
    effects: EffectDef[]; // An array of mechanical effects.
    dispositionAdjustments: { forceful?: number; deceptive?: number; honorable?: number; }; // Adjustments to the player's core personality.
    marksToAdd?: string[]; // Array of new Mark IDs acquired from this choice. e.g. ["MARK_KILLER"]
}

**Event Context:**
- Event: "${event.name}"
- Scene: "${event.description}"
- Player's Action: "${option.label}"

**Player Character Profile:**
- Race: ${playerState.race}
- Backstory Notes: ${narrativeContext}
- Core Dispositions: ${describeDispositions(playerState.dispositions)}
- Current Marks: ${describeMarks(playerState.marks)}

**Rules for generating the outcome:**

1.  **Be Creative and Reactive**: The outcome should be a logical, interesting consequence of the player's action, tailored to their character profile. A forceful character might have different results than a deceptive one. A character with the 'Chainscarred (Hunted)' mark should be treated differently by guards than one with 'Killer (Soldier)'.
2.  **Show, Don't Tell**: In \`narrativeText\`, describe the scene and the result. Do not say "You gain 5 health." Instead, describe the feeling of vitality returning.
3.  **Balance**: Keep the mechanical outcomes reasonable. A single choice shouldn't break the game. Minor boons, small costs, or simple trade-offs are best.
4.  **Mechanical Constraints**:
    - Use valid effect types: 'LOSE_HEALTH', 'GAIN_TEMP_RESOURCE', 'ADD_MARK'.
    - Use valid resource types: 'aggression', 'wisdom', 'cunning'.
    - Use small integer values for effects and disposition adjustments (e.g., 5, 2, 1, -1).
    - If there are no mechanical effects, return an empty array for \`effects\`.
    - If there are no reputation changes, return an empty object for \`dispositionAdjustments\`.
    - If no new marks are gained, return an empty array or omit \`marksToAdd\`.

Now, generate the single DynamicEventOutcome JSON object.
`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        const text = response.text;
        if (typeof text !== 'string') {
            throw new Error("Generated content is not a valid text response.");
        }
        const trimmedText = text.trim().replace(/^```json\s*|```$/g, '');
        if (trimmedText.startsWith('{') && trimmedText.endsWith('}')) {
          return JSON.parse(trimmedText) as DynamicEventOutcome;
        } else {
          throw new Error("Generated content is not a valid JSON object.");
        }
    } catch (error) {
        console.error("Error resolving dynamic event from Gemini API:", error);
        // Provide a safe fallback outcome
        return {
            narrativeText: "The world holds its breath, and for a moment, nothing happens. You feel unchanged by your decision.",
            effects: [],
            dispositionAdjustments: {},
            marksToAdd: []
        };
    }
};