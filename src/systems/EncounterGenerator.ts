import { GoogleGenAI } from "@google/genai";
import { GameState, Encounter } from "../game/types";
import { EncounterEngine, defaultRules } from "./encounters/EncounterEngine";
import { ENCOUNTER_SCHEMAS } from "../data/encounterSchemas";
import { NPCS_SAMPLE } from "../data/npcs.sample";
import { REGION_PORT } from "../data/regions";
import { NpcIndex } from "./encounters/NpcIndex";
import { 
    RunState as EncounterRunState, 
    RegionState as EncounterRegionState, 
    StructuredEncounter, 
    NpcId 
} from "./encounters/types";

const MODEL = "gemini-2.5-flash";

export class EncounterGenerator {
  private ai: GoogleGenAI;
  private engine: EncounterEngine;
  private npcIndex: NpcIndex;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    this.npcIndex = new NpcIndex(NPCS_SAMPLE);
    this.engine = new EncounterEngine({
      schemas: ENCOUNTER_SCHEMAS,
      rules: defaultRules(),
      npcs: NPCS_SAMPLE,
    });
  }

  public async generate(state: GameState): Promise<Encounter> {
    const runState: EncounterRunState = {
      seed: state.runId,
      day: state.day,
      playerMarks: state.player.marks.map(m => m.id),
      region: state.region as any,
      exposedFactions: [], // Placeholder
      notoriety: state.player.marks.reduce((acc, m) => acc + Math.abs(m.value), 0) * 5, // Simple notoriety calc
    };
    const regionState: EncounterRegionState = REGION_PORT;

    const structure = this.engine.suggest(runState, regionState);

    if (!structure) {
        console.warn("No structured encounter could be generated, using fallback.");
        return this.getFallbackEncounter();
    }

    const prompt = this.buildPrompt(structure);

    const res = await this.ai.models.generateContent({
        model: MODEL,
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });
    
    const text = res.text;
    
    try {
      const parsed = JSON.parse(text);
      return {
        ...parsed,
        id: crypto.randomUUID(),
        options: (parsed.options || []).map((o: any, i: number) => ({
          ...o,
          id: o.id ?? `gen-opt-${i}`,
        })),
      };
    } catch (e) {
      console.error("Failed to parse Gemini response:", text, e);
      return this.getFallbackEncounter();
    }
  }

  private buildPrompt(structure: StructuredEncounter): string {
    const roles = Object.fromEntries(
      Object.entries(structure.roles).map(([key, id]) => {
        const npc = this.npcIndex.byId.get(id as NpcId);
        if (npc) {
            return [key, {
                appearance: npc.appearance,
                roles: npc.roleTags,
                marks: npc.marks
            }];
        }
        return [key, { description: id }];
      })
    );

    const prompt = [
      "System: You generate a single JSON encounter for a text roguelike based on a provided structure.",
      "Rules:",
      "- The `Roles` field provides character data as objects. When referring to them, combine their `appearance`, `roles`, and `marks` into a natural description (e.g., 'a stern-faced, armored guard captain known for being unyielding'). Do NOT use their real names.",
      "- Use the structure to inspire the encounter's narrative.",
      "- Keep the main `prompt` text brief and evocative (<= 60 words).",
      "- Create 3–4 options. Each `option` MUST have a unique `id`, a `label`, and can have `costs`, `effects`, and `grantsMarks`.",
      "- One option must represent inaction, waiting, or observing (e.g., 'Wait and see', 'Stay silent'). This passive option must always have a `TIME` cost, usually 1.",
      "- Costs/effects are objects with keys: TIME, CLARITY, CURRENCY.",
      "- grantsMarks is an array of objects: {id, label, value: +1 or -1}.",
      "- Add a very short `internalThoughtHint` (4-8 words) in parentheses. This should be a brief, personal thought or gut feeling, not a strategic analysis.",
      "- Output ONLY the JSON object with keys: prompt, options[], internalThoughtHint.",
      "## Encounter Structure",
      `Schema: ${structure.schemaId}`,
      `Topics: ${structure.topics.join(", ")}`,
      `Stakes: ${structure.stakes.join(", ")}`,
      `Roles: ${JSON.stringify(roles)}`,
    ].join("\n");

    return prompt;
  }

  private getFallbackEncounter(): Encounter {
    return {
        id: crypto.randomUUID(),
        prompt: "A hush falls. Someone speaks your title like a curse.",
        internalThoughtHint: "(Pick a direction. Commit.)",
        options: [
          { id: "defy", label: "Defy the room", costs: { TIME: 1 }, effects: { CLARITY: 1 } },
          { id: "yield", label: "Yield and listen", costs: { TIME: 1 } }
        ]
    };
  }
}