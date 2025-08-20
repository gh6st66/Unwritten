import { RunState, LegacyState, Claim } from "../core/types";
import { generateRegion } from "../gen/region";
import { generateNPC } from "../gen/npc";
import type { WorldContext, FactionDef, Region as GenRegion, RegionSummary, Echo } from "../gen/types";

// A stand-in for a real claim loader
const getStartingClaim = (): Claim => ({
    id: "HONOR_BOUND",
    text: "It is written: You will uphold your honor, even at great cost.",
    polarity: 1,
    gravity: 2,
});

// Stand-in factions for world generation
const factions: FactionDef[] = [
  { id: "faction_ledgers", name: "Ledgers of Dawn", tier: 2, ethos: "Tally the living and the lost", methods: ["audits","oaths"], taboo: ["unwitnessed deals"], symbol: "sun‑ledger" },
  { id: "faction_mourners", name: "Mourners’ Guild", tier: 1, ethos: "Keep the blanks for the dead", methods: ["vigils","processions"], symbol: "black page" },
  { id: "faction_ferrymen", name: "Ferrymen of the Upstream", tier: 2, ethos: "Cross what should not cross", methods: ["tolls","seals"], symbol: "reversed current" },
];

export function initialRun(legacy: LegacyState | null): RunState {
  const runId = crypto.randomUUID();
  const generationIndex = legacy?.runsCompleted ?? 0;

  // 1. Set up World Generation Context
  const worldCtx: WorldContext = {
    seed: runId,
    epoch: "Inquisition",
    gravity: "Order",
    knownFactions: factions,
    echoes: (legacy?.echoesBank ?? []).map(e => ({ tag: e.tag, weight: e.weight })) as Echo[],
  };

  // 2. Generate the World
  const r0 = generateRegion(worldCtx, 0);
  const r1 = generateRegion(worldCtx, 1);
  const r2 = generateRegion(worldCtx, 2);
  
  // Create a simple travel graph: r0 <-> r1 <-> r2
  r0.neighbors = [r1.id];
  r1.neighbors = [r0.id, r2.id];
  r2.neighbors = [r1.id];

  const regions: GenRegion[] = [r0, r1, r2];
  const regionSummaries: RegionSummary[] = regions.map(({ id, name, biome, climate }) => ({ id, name, biome, climate }));
  
  const ctxWithRegions: WorldContext = { ...worldCtx, knownRegions: regionSummaries };
  const npcs = [
      generateNPC(ctxWithRegions, 0),
      generateNPC(ctxWithRegions, 1),
      generateNPC(ctxWithRegions, 2),
      generateNPC(ctxWithRegions, 3),
  ];
  
  // 3. Construct Initial Run State
  const state: RunState = {
    runId,
    rngSeed: Math.random().toString(36).slice(2),
    claim: getStartingClaim(),
    resources: { energy: 80, clarity: 60, will: 50, maxEnergy: 100, maxClarity: 100, maxWill: 100 },
    traits: { AGG: 2, WIS: 3, CUN: 2, AGG_WIS: 1, AGG_CUN: 1, WIS_CUN: 1 },
    marks: (legacy?.markCarry ?? []).map(mc => ({ 
        id: mc.id, 
        tier: mc.carriedTier, 
        xp: 0, 
        decaysPerRun: 1 
    })),
    dispositions: {},
    mask: {
        worn: true,
        style: { strokes: 1, symmetry: 1, paletteKey: "default" },
        derivedFromMarks: [],
    },
    time: 480, // Start at 8 AM
    tension: 10,
    locationId: regions[0].id,
    echoesActive: [],
    compendium: {},
    log: [],
    inventory: {},
    scars: [],
    regions: Object.fromEntries(
        regions.map(r => [r.id, { prosperity: 0, notoriety: 0, stability: 0 }])
    ),
    leads: {},
    generationIndex,
    world: { regions, npcs, factions },
  };

  // TODO: Apply boons from legacy?.boons

  return state;
}