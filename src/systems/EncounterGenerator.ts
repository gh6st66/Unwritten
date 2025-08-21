import { GoogleGenAI } from "@google/genai";
import { GameState, Encounter, SpeakerContext, Affiliation, ResourceId } from "../game/types";
import { EncounterEngine, defaultRules } from "./encounters/EncounterEngine";
import { ENCOUNTER_SCHEMAS } from "../data/encounterSchemas";
import { NpcIndex } from "./encounters/NpcIndex";
import { 
    RunState as EncounterRunState, 
    RegionState as EncounterRegionState, 
    StructuredEncounter, 
    NpcId,
    Npc as EncounterNpc,
    RegionId,
    FactionId,
    RoleTag,
    RegionTensionEdge
} from "./encounters/types";
import { resolveLexeme } from "./lexicon/resolveLexeme";
import { NPC as CivNPC } from "../civ/types";
import { Region as WorldRegion, World } from "../world/types";

const MODEL = "gemini-2.5-flash";

const factionToAffiliationMap: Record<string, Affiliation> = {
    // This should be populated based on generated faction names or agendas
};

const validRoleTags: Set<string> = new Set(["merchant", "captain", "witch", "thief", "lord", "artisan", "guard", "outsider"]);

function convertCivNpcToEncounterNpc(civNpc: CivNPC): EncounterNpc {
    const affiliations: Affiliation[] = [];
    if (civNpc.factionId && factionToAffiliationMap[civNpc.factionId]) {
        affiliations.push(factionToAffiliationMap[civNpc.factionId]);
    }
    // Add fallback affiliations based on role or civ values
    if (!affiliations.length) {
        if (civNpc.role === 'merchant' || civNpc.role === 'artisan') affiliations.push('guild');
        if (civNpc.role === 'guard') affiliations.push('military');
    }
    if (!affiliations.includes("urban")) affiliations.push('urban');

    const roleTags: RoleTag[] = [];
    if (validRoleTags.has(civNpc.role)) {
        roleTags.push(civNpc.role as RoleTag);
    } else {
        roleTags.push('commoner');
    }

    return {
        id: civNpc.id as NpcId,
        name: civNpc.name,
        appearance: [], // This can be expanded later by Gemini or procgen
        region: civNpc.regionId as RegionId,
        faction: civNpc.factionId as FactionId | undefined,
        affiliations,
        roleTags,
        marks: civNpc.marks.map(m => m.id),
        notoriety: 20 + Math.floor(Math.random() * 60), // Placeholder
        ties: [],
    };
}

function convertWorldRegionToEncounterRegionState(world: World, worldRegion: WorldRegion, civs: GameState['world']['civs']): EncounterRegionState {
    // Find factions present in this region from all civs
    const presentFactions: { id: FactionId, civId: string }[] = [];
    const regionNpcs = civs.flatMap(c => c.npcs).filter(n => n.regionId === worldRegion.id);
    const factionIdsInRegion = new Set(regionNpcs.map(n => n.factionId).filter(Boolean));
    
    const allFactions = civs.flatMap(c => c.factions.map(f => ({...f, civId: c.id})));
    const factions = allFactions.filter(f => factionIdsInRegion.has(f.id));

    const tensionEdges: RegionTensionEdge[] = [];
    if (factions.length > 1) {
        for (let i = 0; i < factions.length; i++) {
            for (let j = i + 1; j < factions.length; j++) {
                const facA = factions[i];
                const facB = factions[j];
                // Tension is higher if they are from different civs, or have conflicting agendas
                let weight = (facA.civId !== facB.civId) ? 50 : 10;
                if (facA.agenda === 'expansion' && facB.agenda !== 'expansion') weight += 20;

                tensionEdges.push({
                    a: facA.id as FactionId,
                    b: facB.id as FactionId,
                    weight: weight,
                    topics: ["territory", "influence", facA.agenda, facB.agenda]
                });
            }
        }
    }

    return {
        id: worldRegion.id as RegionId,
        name: worldRegion.name,
        factions: factions.map(f => f.id as FactionId),
        tensionEdges,
        scarcity: {
            // Derive from biome
            coin: worldRegion.identity.wealth * 80,
            grain: worldRegion.cells.length > 0 && world.grid[worldRegion.cells[0]].biome === 'desert' ? 80 : 20,
            timber: worldRegion.cells.length > 0 && world.grid[worldRegion.cells[0]].biome === 'forest' ? 10 : 60,
        },
        entropy: worldRegion.identity.law < 0 ? 70 : 30, // Lawless regions have higher entropy
    };
}


export class EncounterGenerator {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  }

  public async generate(state: GameState): Promise<Encounter> {
    if (!state.world.world) {
        throw new Error("World data is not available for encounter generation.");
    }
    const allNpcs = state.world.civs.flatMap(c => c.npcs);
    const playerRegionId = allNpcs.find(n => n.id === state.player.id)?.regionId ?? Object.keys(state.world.world.regions)[0];

    const runState: EncounterRunState = {
      seed: state.runId,
      day: state.day,
      playerMarks: state.player.marks.map(m => m.id),
      region: playerRegionId as RegionId,
      exposedFactions: [], // Placeholder
      notoriety: state.player.marks.reduce((acc, m) => acc + Math.abs(m.value), 0) * 5,
    };
    
    const currentWorldRegion = state.world.world.regions[playerRegionId];
    if (!currentWorldRegion) {
        console.error("Player is in a region that doesn't exist in the world data.");
        return this.getFallbackEncounter();
    }
    const regionState: EncounterRegionState = convertWorldRegionToEncounterRegionState(state.world.world, currentWorldRegion, state.world.civs);
    
    const encounterNpcs = allNpcs.map(convertCivNpcToEncounterNpc);
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
            locale: 'en-US',
            region: 'en-US',
            affiliations: instigatorNpc.affiliations,
            role: instigatorNpc.roleTags.join(', '),
        };
    } else {
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

    const currentRegion = state.world.world?.regions[structure.region];
    const promptContext = [
        `System: You generate a single JSON encounter for a text roguelike. The world's events are recorded in what this speaker calls "The ${fateRecordTerm}".`,
        `The current region is ${currentRegion?.name}, a ${currentRegion?.identity.dialectId} speaking area with a temperament that is ${currentRegion?.identity.temperament > 0 ? 'militant' : 'pacifist'} and ${currentRegion?.identity.law > 0 ? 'lawful' : 'lawless'}. The biome is ${currentRegion?.cells.length > 0 ? state.world.world?.grid[currentRegion.cells[0]].biome : 'unknown'}.`,
        "Rules:",
        "- The player is known as 'The Unwritten' and wears a mask called '" + (state.player.mask?.name ?? 'The First Mask') + "'.",
        "- Introduce characters by weaving their traits (`appearance`, `roles`, `marks`) into the scene's action and description. For example, instead of 'a wary merchant known for being upright,' write 'a merchant, dressed in fine silks, straightens their posture with an air of practiced honesty.' Show, don't just tell. Avoid repeating the same descriptive patterns. Do NOT use their real names.",
        "- Use the structure to inspire the encounter's narrative.",
        "- Keep the main `prompt` text brief and evocative (<= 60 words).",
        "- Create 3–4 options. Each `option` MUST have a unique `id`, a `label`, and can have `effects` and `grantsMarks`.",
        "- One option must represent inaction, waiting, or observing (e.g., 'Wait and see', 'Stay silent'). This passive option must always have a TIME cost. e.g. `effects: [{resource: \"TIME\", delta: -1}]`",
        "- `effects` is an array of objects, each with `resource` (\"TIME\", \"CLARITY\", \"COIN\") and `delta` (a number, negative for cost, positive for gain).",
        "- `grantsMarks` is an array of objects: {id, label, value: +1 or -1}.",
        "- Add a very short `internalThoughtHint` (4-8 words) in parentheses. This should be a brief, personal thought or gut feeling, not a strategic analysis.",
        "- Output ONLY the JSON object with keys: prompt, options[], internalThoughtHint.",
        "## Encounter Structure",
        `Schema: ${structure.schemaId}`,
        `Topics: ${structure.topics.join(", ")}`,
        `Stakes: ${structure.stakes.join(", ")}`,
        `Roles: ${JSON.stringify(roles)}`,
      ].join("\n");
  
      return promptContext;
  }

  private getFallbackEncounter(): Encounter {
    return {
        id: crypto.randomUUID(),
        prompt: "A hush falls. Someone speaks your title like a curse.",
        internalThoughtHint: "(Pick a direction. Commit.)",
        options: [
          { 
            id: "defy", 
            label: "Defy the room", 
            effects: [{ resource: ResourceId.TIME, delta: -1 }, { resource: ResourceId.CLARITY, delta: 1 }] 
          },
          { 
            id: "yield", 
            label: "Yield and listen", 
            effects: [{ resource: ResourceId.TIME, delta: -1 }] 
          }
        ]
    };
  }
}