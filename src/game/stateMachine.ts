import { GameEvent, GameState, Encounter, Resources, Mark } from "./types";

const clampRes = (r: Resources) => ({
  TIME: Math.max(0, r.TIME),
  CLARITY: Math.max(0, r.CLARITY),
  CURRENCY: Math.max(0, r.CURRENCY),
});

export function reduce(state: GameState, ev: GameEvent): GameState {
  switch (ev.type) {
    case "START_RUN": {
      return {
        ...state,
        phase: "CLAIM",
        runId: crypto.randomUUID(),
        screen: { kind: "CLAIM", claim: seedClaim(ev.seed) }
      };
    }
    case "ACCEPT_CLAIM": {
      return {
        ...state,
        phase: "ENCOUNTER",
        screen: { kind: "ENCOUNTER", encounter: bootstrapEncounter(state) }
      };
    }
    case "GENERATE_ENCOUNTER": {
      return {
        ...state,
        phase: "ENCOUNTER",
        screen: { kind: "ENCOUNTER", encounter: bootstrapEncounter(state) }
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
      if (ev.to === "ENCOUNTER") {
        return {
          ...state,
          phase: "ENCOUNTER",
          screen: { kind: "ENCOUNTER", encounter: bootstrapEncounter(state) }
        };
      }
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
    default:
      return state;
  }
}

function seedClaim(seed: string) {
  // placeholder deterministic stub
  const pool = [
    { id: "betray", text: "You betray allies.", severity: 2 as const },
    { id: "forsake", text: "You forsake vows.", severity: 1 as const },
    { id: "ignite", text: "You ignite uprisings.", severity: 3 as const }
  ];
  const idx = Math.abs(hash(seed)) % pool.length;
  return pool[idx];
}

function bootstrapEncounter(state: GameState): Encounter {
  return {
    id: crypto.randomUUID(),
    prompt: "The watch captain’s eyes flick to your hands. A murmur ripples along the wall. They know what you are.",
    internalThoughtHint: "(Stay steady. Watch the exits.)",
    options: [
      {
        id: "parley",
        label: "Parley with the captain",
        costs: { TIME: 1 },
        effects: { CLARITY: 1 },
        grantsMarks: [{ id: "diplomatic", label: "Diplomatic", value: +1 }]
      },
      {
        id: "vanish",
        label: "Melt into the crowd",
        costs: { TIME: 1, CLARITY: 1 },
        effects: { TIME: 1 } // regain time via evasion window
      }
    ]
  };
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
