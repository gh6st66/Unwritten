/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GameEvent, GameState, Resources, Mark, Claim, WorldSeed, ResourceId, ActionOutcome, Lexeme } from "./types";
import { worldSeeds } from "../data/worldSeeds";
import { apply, canApply } from "../systems/resourceEngine";
import { LEXEMES_DATA } from "../data/lexemes";
import { LexemeTier } from "../types/lexeme";
import { INTENTS, LEXICON, SCENES } from '../data/parser/content';
import { ParserEngine } from '../systems/parser/engine';

const STORAGE_KEY = "unwritten:v1";

// Memoize the parser engine to avoid re-creating it on every action
const parser = new ParserEngine(INTENTS, LEXICON);

function selectRandomSeeds(count: number): WorldSeed[] {
  const shuffled = [...worldSeeds].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export const INITIAL: GameState = {
  phase: "TITLE",
  runId: "none",
  activeClaim: null,
  activeSeed: null,
  firstMaskLexeme: null,
  day: 1,
  world: {
    world: null,
    civs: [],
  },
  player: {
    id: "p1",
    name: "The Unwritten",
    resources: { [ResourceId.TIME]: 6, [ResourceId.CLARITY]: 3, [ResourceId.CURRENCY]: 0 },
    marks: [],
    mask: null,
    unlockedLexemes: LEXEMES_DATA.filter(l => l.tier === LexemeTier.Basic).map(l => l.id),
    flags: new Set(),
  },
  screen: { kind: "TITLE" },
  currentSceneId: null,
};


export function reduce(state: GameState, ev: GameEvent): GameState {
  switch (ev.type) {
    case "OPEN_TESTER": {
      if (state.phase !== "TITLE") return state;
      return { ...state, phase: "GENERATION_TESTER", screen: { kind: "GENERATION_TESTER" } };
    }
    case "CLOSE_TESTER": {
      if (state.phase !== "GENERATION_TESTER") return state;
      // Reset to INITIAL to ensure a clean slate when returning to title
      return INITIAL;
    }
    case "REQUEST_NEW_RUN": {
      return {
        ...state,
        phase: "SEED_SELECTION",
        screen: { kind: "SEED_SELECTION", seeds: selectRandomSeeds(3) },
      };
    }
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
        phase: "FIRST_MASK_FORGE",
        world: { world: ev.world, civs: ev.civs },
        screen: { kind: "FIRST_MASK_FORGE" },
      }
    }
    case "COMMIT_FIRST_MASK": {
      if (state.phase !== 'FIRST_MASK_FORGE') return state;
      return {
        ...state,
        phase: "LOADING",
        firstMaskLexeme: ev.lexeme,
        screen: { kind: "LOADING", message: "The mask takes form in the ether...", context: "MASK" }
      };
    }
    case "MASK_FORGED": {
      const lexeme = state.firstMaskLexeme;
      let newMarks = state.player.marks;
      if (lexeme?.effects.startingMarks) {
        const startingMarks: Mark[] = lexeme.effects.startingMarks.map(id => ({ id, label: id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), value: 1 }));
        newMarks = mergeMarks(newMarks, startingMarks);
      }
      return {
        ...state,
        phase: "MASK_REVEAL",
        player: {
          ...state.player,
          mask: ev.mask,
          marks: mergeMarks(newMarks, ev.mask.grantedMarks),
        },
        screen: { kind: "MASK_REVEAL", mask: ev.mask }
      };
    }
    case "CONTINUE_AFTER_REVEAL": {
        if (state.phase !== "MASK_REVEAL") return state;
        return {
            ...state,
            phase: "CLAIM",
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
        screen: { kind: "LOADING", message: "The ink of fate dries...", context: "SCENE" }
      };
    }
    case "LOAD_SCENE": {
      const sceneData = SCENES[ev.sceneId];
      if (!sceneData) {
        console.error(`Scene not found: ${ev.sceneId}`);
        return {
          ...state,
          phase: "COLLAPSE",
          screen: { kind: "COLLAPSE", reason: `The world faded. (Scene ${ev.sceneId} not found)` }
        };
      }
      return {
        ...state,
        phase: "SCENE",
        currentSceneId: ev.sceneId,
        screen: {
          kind: "SCENE",
          sceneId: ev.sceneId,
          prompt: sceneData.description,
          objects: sceneData.objects,
          lastActionResponse: null,
          suggestedCommands: [],
        }
      };
    }
    case "ATTEMPT_ACTION": {
      if (state.phase !== 'SCENE' || !state.currentSceneId) return state;
      const scene = SCENES[state.currentSceneId];
      if (!scene) return state; // Should not happen

      const result = parser.resolve(ev.rawCommand, scene, state.player);
      
      if (!result.ok && state.screen.kind === 'SCENE') {
        return {
          ...state,
          screen: {
            ...state.screen,
            lastActionResponse: result.message ?? "Nothing happens.",
            suggestedCommands: result.suggested ?? [],
          }
        };
      }
      
      if (result.ok && result.intent_id) {
        const intent = INTENTS.find(i => i.id === result.intent_id);
        if (!intent) return state; // Should not happen
        
        // This is where the 'execute.ts' logic lives now.
        let summary = `You perform the action: ${intent.id}.`;
        let newState = { ...state };
        
        for (const effect of intent.effects) {
          switch (effect.type) {
            case 'message': {
                switch (intent.id) {
                    case 'inspect': {
                        const objectId = result.bindings?.object;
                        if (objectId) {
                            const sceneObject = scene.objects.find(o => o.id === objectId);
                            summary = sceneObject?.inspect ?? `You see nothing special about the ${sceneObject?.name}.`;
                        } else {
                            summary = "You look around.";
                        }
                        break;
                    }
                    case 'take': {
                        summary = "You take it.";
                        break;
                    }
                    case 'open_close': {
                        const obj = scene.objects.find(o => o.id === result.bindings?.object);
                        if (obj?.state?.locked) {
                            summary = "It's locked.";
                        } else {
                            summary = "You open it. It's empty inside.";
                        }
                        break;
                    }
                    default: {
                         summary = effect.text ?? "Done.";
                         break;
                    }
                }
              break;
            }
            case 'move': {
              const direction = result.bindings?.direction as string;
              const nextSceneId = scene.exits[direction];
              if (nextSceneId) {
                summary = `You move ${direction}...`;
                return {
                  ...state,
                  phase: 'LOADING',
                  screen: { kind: 'LOADING', message: summary, context: 'SCENE' },
                  currentSceneId: nextSceneId,
                }
              } else {
                summary = `You can't go that way.`;
              }
              break;
            }
          }
        }
        
        return {
          ...newState,
          phase: "RESOLVE",
          screen: { kind: "RESOLVE", summary }
        };
      }
      
      return state;
    }
    case "GENERATION_FAILED": {
        return {
            ...state,
            phase: "COLLAPSE",
            screen: { kind: "COLLAPSE", reason: `The world unravelled. (${ev.error})` }
        };
    }
    case "CHOOSE_OPTION": {
      if (state.screen.kind !== "SCENE") return state;
      const opt = {id: 'placeholder', label: 'placeholder', effects: []}; // This path is now for non-parser events.
      if (!opt || !canApply(state.player.resources, opt as any)) return state;

      const nextRes = apply(state.player.resources, opt as any);

      const collapse = nextRes.TIME <= 0 ? "Out of time." : null;

      return {
        ...state,
        player: {
          ...state.player,
          resources: nextRes,
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
      // After resolving an action, return to the scene
      if (state.phase === 'RESOLVE' && state.currentSceneId) {
         return reduce(state, { type: 'LOAD_SCENE', sceneId: state.currentSceneId });
      }
      return state;
    }
    case "END_RUN": {
      return { ...state, phase: "COLLAPSE", screen: { kind: "COLLAPSE", reason: ev.reason } };
    }
    case "LOAD_STATE": {
      // Re-hydrate player.flags as a Set
      if (ev.snapshot.player.flags && !(ev.snapshot.player.flags instanceof Set)) {
        ev.snapshot.player.flags = new Set(ev.snapshot.player.flags as any);
      }
      return ev.snapshot;
    }
    case "RESET_GAME": {
      localStorage.removeItem(STORAGE_KEY);
      return INITIAL;
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