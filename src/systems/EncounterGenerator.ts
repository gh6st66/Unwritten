import { GoogleGenAI } from "@google/genai";
import { GameState, Encounter, SpeakerContext, Affiliation } from "../game/types";
import { EncounterEngine, defaultRules } from "./encounters/EncounterEngine";
import { ENCOUNTER_SCHEMAS } from "../data/encounterSchemas";
import { NpcIndex } from "./encounters/NpcIndex";
import { 
    RunState as EncounterRunState, 
    RegionState as EncounterRegionState, 
    StructuredEncounter, 
    NpcId,
    Npc,
    RegionId,
    FactionId,
    RoleTag
} from "./encounters/types";
import { resolveLexeme } from "./lexicon/resolveLexeme";
import { NPC as GenNPC } from "../gen";

const MODEL = "gemini-2.5-flash";

// Adapter to convert procedurally generated NPCs to the format the encounter engine expects.
const factionToAffiliationMap: Record<string, Affiliation> = {
    "faction_inquisition": "inquisition",
    "faction_clergy": "clergy",
    "faction_guild": "guild",
    "faction_academy": "academy",
    "faction_watch": "military",
    "faction_smugglers": "outlaw",
};

const validRoleTags: Set<string> = new Set(["merchant", "captain", "witch", "thief", "lord", "artisan", "guard", "outsider"]);

function convertGenNpcToEncounterNpc(genNpc: GenNPC): Npc {
    const affiliations: Affiliation[] = [];
    if (genNpc.factionId && factionToAffiliationMap[genNpc.factionId]) {
        affiliations.push(factionToAffiliationMap[genNpc.factionId]);
    }
    if (!affiliations.includes("urban")) affiliations.push('urban');

    const roleTags: RoleTag[] = [];
    if (validRoleTags.has(genNpc.role)) {
        roleTags.push(genNpc.role as RoleTag);
    }

    return {
        id: genNpc.id as NpcId,
        name: genNpc.name,
        appearance: [], // This can be expanded later
        region: genNpc.regionId as RegionId,
        faction: genNpc.factionId as FactionId | undefined,
        affiliations,
        roleTags,
        marks: genNpc.marks.map(m => m.id),
        notoriety: 20 + Math.floor(Math.random() * 60), // 20-80
        ties: [],
    };
}

export class EncounterGenerator {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  }

  public async generate(state: GameState): Promise<Encounter> {
    const runState: EncounterRunState = {
      seed: state.runId,
      day: state.day,
      playerMarks: state.player.marks.map(m => m.id),
      region: state.world.regions[0].id as RegionId, // Use first generated region for now
      exposedFactions: [], // Placeholder
      notoriety: state.player.marks.reduce((acc, m) => acc + Math.abs(m.value), 0) * 5, // Simple notoriety calc
    };
    
    // The region state should also be dynamic, for now we find the one we're in.
    const regionState: EncounterRegionState | undefined = state.world.regions[0] as any; // TODO: Fix this type mismatch
    if (!regionState) {
        console.error("Player is in a region that doesn't exist in the world data.");
        return this.getFallbackEncounter();
    }
    
    const encounterNpcs = state.world.npcs.map(convertGenNpcToEncounterNpc);
    // Create a dynamic engine with the current run's generated NPCs
    const npcIndex = new NpcIndex(encounterNpcs);
    const engine = new EncounterEngine({
      schemas: ENCOUNTER_SCHEMAS,
      rules: defaultRules(),
      npcs: encounterNpcs,
    }, npcIndex);

    const structure = engine.suggest(runState, regionState);

    if (!structure) {
        console.warn("No structured encounter could be generated, using fallback.");
        return this.getFallbackEncounter();
    }

    const prompt = this.buildPrompt(structure, state, npcIndex);

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

  private buildPrompt(structure: StructuredEncounter, state: GameState, npcIndex: NpcIndex): string {
    const instigatorNpc = npcIndex.byId.get(structure.roles.instigator as NpcId);
        
    let speakerContext: SpeakerContext;
    if (instigatorNpc) {
        speakerContext = {
            locale: 'en-US', // Assuming for now
            region: 'en-US', // Assuming for now, can be mapped from instigatorNpc.region
            affiliations: instigatorNpc.affiliations,
            role: instigatorNpc.roleTags.join(', '),
        };
    } else {
        // Fallback context
        speakerContext = { locale: 'en-US', region: 'en-US', affiliations: ['commoner'], role: 'commoner' };
    }
    const fateRecordTerm = resolveLexeme('fateRecord', speakerContext);

    const roles = Object.fromEntries(
      Object.entries(structure.roles).map(([key, id]) => {
        const npc = npcIndex.byId.get(id as NpcId);
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
      `System: You generate a single JSON encounter for a text roguelike. The world's events are recorded in what this speaker calls "The ${fateRecordTerm}".`,
      "Rules:",
      "- The player is known as 'The Unwritten' and wears a mask called '" + (state.player.mask?.name ?? 'The First Mask') + "'.",
      "- Introduce characters by weaving their traits (`appearance`, `roles`, `marks`) into the scene's action and description. For example, instead of 'a wary merchant known for being upright,' write 'a merchant, dressed in fine silks, straightens their posture with an air of practiced honesty.' Show, don't just tell. Avoid repeating the same descriptive patterns. Do NOT use their real names.",
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