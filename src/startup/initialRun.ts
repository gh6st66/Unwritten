import { RunState, WorldState, FactionState, RegionState, FactionId } from "../core/types";
import { deriveMaskAppearance } from "../systems/MaskEngine";

export function initialRun(): RunState {
  const start = Date.now();
  const ashvale: RegionState = { id: "ashvale", prosperity: 0, stability: 0, notoriety: 0, lastUpdatedAt: start };
  const inquisitors: FactionState = { id: "inquisitors" as FactionId, attitude: 0, remembersMarks: {}, requiresUnmasking: true };

  const world: WorldState = {
    time: start,
    regions: { ashvale },
    factions: { [inquisitors.id]: inquisitors },
    echoes: {},
    scars: [],
  };

  const identity = {
    runId: cryptoId(),
    generationIndex: 0,
    marks: {},
    activeClaims: {},
    mask: { wearing: true, appearance: {} as any }, // set after state build
    dispositions: {},
  };

  const state: RunState = {
    identity,
    world,
    resources: {
      energy: 10,
      clarity: 5,
      will: 5,
      maxEnergy: 10,
      maxClarity: 5,
      maxWill: 5,
      nextEnergyAt: start,
      nextClarityAt: start,
      nextWillAt: start,
      // Intent resources
      AGG: 3, WIS: 3, CUN: 3, AW: 1, AC: 1, WC: 1,
    },
    location: "ashvale:gate",
    isAlive: true,
    inventory: { items: {} },
    leads: {},
  };

  // finalize mask appearance based on marks (none at start → blank-ish)
  state.identity.mask.appearance = deriveMaskAppearance(state);
  return state;
}

function cryptoId() {
  return Math.random().toString(36).slice(2);
}
