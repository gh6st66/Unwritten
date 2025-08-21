import { GameEvent, GameState, Resources, Mark, Claim, WorldSeed } from "./types";
import { worldSeeds } from "../data/worldSeeds";

function selectRandomSeeds(count: number): WorldSeed[] {
  const shuffled = [...worldSeeds].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export const INITIAL: GameState = {
  phase: "INTRO",
  runId: "none",
  activeClaim: null,
  activeSeed: null,
  forgingInput: null,
  day: 1,
  world: {
    regions: [],
    factions: [],
    npcs: [],
  },
  player: {
    id: "p1",
    name: "The Unwritten",
    resources: { TIME: 6, CLARITY: 3, CURRENCY: 0 },
    marks: [],
    mask: null,
  },
  screen: { kind: "INTRO", seeds: selectRandomSeeds(3) }
};


const clampRes = (r: Resources) => ({
  TIME: Math.max(0, r.TIME),
  CLARITY: Math.max(0, r.CLARITY),
  CURRENCY: Math.max(0, r.CURRENCY),
});

export function reduce(state: GameState, ev: GameEvent): GameState {
  switch (ev.type) {
    case "START_RUN": {
      return {
        ...INITIAL,
        phase: "WORLD_GEN",
        runId: crypto.randomUUID(),
        activeSeed: ev.seed,
        screen: { kind: "LOADING", message: "The world takes shape...", context: "WORLD_GEN" },
      };
    }
    case "WORLD_GENERATED": {
      if (!state.activeSeed) return state; // Should not happen
      return {
        ...state,
        phase: "FORGE_MASK",
        world: ev.world,
        screen: { kind: "FORGE_MASK", seedTitle: state.activeSeed.title },
      }
    }
    case "FORGE_MASK": {
      return {
        ...state,
        phase: "LOADING",
        forgingInput: ev.input,
        screen: { kind: "LOADING", message: "The mask takes form in the ether...", context: "MASK" }
      };
    }
    case "MASK_FORGED": {
      return {
        ...state,
        phase: "CLAIM",
        forgingInput: null,
        player: {
          ...state.player,
          mask: ev.mask,
          marks: mergeMarks(state.player.marks, ev.mask.grantedMarks),
        },
        screen: { kind: "CLAIM", claim: seedClaim(state.runId) }
      };
    }
    case "ACCEPT_CLAIM": {
      const startingMark: Mark = ev.approach === 'embrace'
        ? { id: 'fate-embraced', label: 'Fate-Embraced', value: 1 }
        : { id: 'fate-defiant', label: 'Fate-Defiant', value: 1 };

      return {
        ...state,
        phase: "LOADING",
        activeClaim: ev.claim,
        player: {
          ...state.player,
          marks: mergeMarks(state.player.marks, [startingMark]),
        },
        screen: { kind: "LOADING", message: "The ink of fate dries...", context: "ENCOUNTER" }
      };
    }
    case "GENERATE_ENCOUNTER": {
      return {
        ...state,
        phase: "LOADING",
        day: state.day + 1,
        screen: { kind: "LOADING", message: "The path twists...", context: "ENCOUNTER" }
      };
    }
    case "ENCOUNTER_LOADED": {
      return {
        ...state,
        phase: "ENCOUNTER",
        screen: { kind: "ENCOUNTER", encounter: ev.encounter }
      };
    }
    case "GENERATION_FAILED": {
        return {
            ...state,
            phase: "COLLAPSE",
            screen: { kind: "COLLAPSE", reason: `The world unravelled. (${ev.error})` }
        };
    }
    case "CHOOSE_OPTION": {
      if (state.screen.kind !== "ENCOUNTER") return state;
      const opt = state.screen.encounter.options.find(o => o.id === ev.optionId);
      if (!opt) return state;

      // apply costs/effects
      const nextRes: Resources = clampRes({
        TIME: state.player.resources.TIME - (opt.costs?.TIME ?? 0) + (opt.effects?.TIME ?? 0),
        CLARITY: state.player.resources.CLARITY - (opt.costs?.CLARITY ?? 0) + (opt.effects?.CLARITY ?? 0),
        CURRENCY: state.player.resources.CURRENCY - (opt.costs?.CURRENCY ?? 0) + (opt.effects?.CURRENCY ?? 0),
      });

      const collapse = nextRes.TIME <= 0 ? "Out of time." : null;

      return {
        ...state,
        player: {
          ...state.player,
          resources: nextRes,
          marks: opt.grantsMarks ? mergeMarks(state.player.marks, opt.grantsMarks) : state.player.marks
        },
        phase: collapse ? "COLLAPSE" : "RESOLVE",
        screen: collapse
          ? { kind: "COLLAPSE", reason: collapse }
          : { kind: "RESOLVE", summary: `You chose ${opt.label}.` }
      };
    }
    case "ADVANCE": {
      if (ev.to === "COLLAPSE") {
        return { ...state, phase: "COLLAPSE", screen: { kind: "COLLAPSE", reason: "Ended by design." } };
      }
      return state;
    }
    case "END_RUN": {
      return { ...state, phase: "COLLAPSE", screen: { kind: "COLLAPSE", reason: ev.reason } };
    }
    case "LOAD_STATE": {
      return ev.snapshot;
    }
    case "RESET_GAME": {
      localStorage.removeItem("unwritten:v1");
      return {
        ...INITIAL,
        // Reselect seeds on reset
        screen: { kind: "INTRO", seeds: selectRandomSeeds(3) }
      };
    }
    default:
      return state;
  }
}

function seedClaim(seed: string): Claim {
  // placeholder deterministic stub
  const pool: Claim[] = [
    {
      id: "betray", text: "You will betray an ally.", severity: 2 as const,
      embrace: { label: "Embrace this path", description: "Accept the necessity of sacrifice." },
      resist: { label: "Resist this fate", description: "Hold to loyalty, no matter the cost." },
    },
    {
      id: "forsake", text: "You will forsake your vows.", severity: 1 as const,
      embrace: { label: "Embrace this path", description: "Recognize that oaths can be cages." },
      resist: { label: "Resist this fate", description: "An oath is the core of identity." },
    },
    {
      id: "ignite", text: "You will ignite an uprising.", severity: 3 as const,
      embrace: { label: "Embrace this path", description: "Become the spark that burns the old world down." },
      resist: { label: "Resist this fate", description: "Seek order amidst the chaos." },
    }
  ];
  const idx = Math.abs(hash(seed)) % pool.length;
  return pool[idx];
}

function mergeMarks(current: Mark[], gains: Mark[]) {
  const map = new Map(current.map(m => [m.id, m]));
  for (const g of gains) {
    const prev = map.get(g.id);
    if (prev) map.set(g.id, { ...prev, value: Math.max(-3, Math.min(3, prev.value + g.value)) });
    else map.set(g.id, g);
  }
  return Array.from(map.values());
}

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return h | 0;
}