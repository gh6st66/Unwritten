

import { RunState, LegacyState, Claim } from "../core/types";

// A stand-in for a real claim loader
const getStartingClaim = (): Claim => ({
    id: "HONOR_BOUND",
    text: "It is written: You will uphold your honor, even at great cost.",
    polarity: 1,
    gravity: 2,
});

export function initialRun(legacy: LegacyState | null): RunState {

  const state: RunState = {
    runId: crypto.randomUUID(),
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
    locationId: "ashvale:gate",
    echoesActive: [],
    compendium: {},
    log: [],
    inventory: {},
    scars: [],
    regions: {
      "ashvale": { prosperity: 0, notoriety: 0, stability: 0 },
    },
    leads: {},
    generationIndex: legacy?.runsCompleted ?? 0,
  };

  // TODO: Apply boons from legacy?.boons

  return state;
}