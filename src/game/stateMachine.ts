/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GameEvent, GameState, Resources, Mark, Omen, Origin, ResourceId, ActionOutcome, Lexeme, SceneObject } from "./types";
import { apply, canApply } from "../systems/resourceEngine";
import { LEXEMES_DATA } from "../data/lexemes";
import { LexemeTier } from "../types/lexeme";
import { INTENTS, LEXICON, SCENES } from '../data/parser/content';
import { ParserEngine } from '../systems/parser/engine';
import { createInventory, addItem, removeItem } from '../systems/inventory';
import { getItemRule } from '../data/itemCatalog';
import { recordEvent, getEvents } from '../systems/chronicle';
import { getMarkDef } from "../systems/Marks";
import { OMENS_DATA } from "../data/omens";
import { INTERACTION_RULES } from "../data/interactions";

const STORAGE_KEY = "unwritten:v1";

// Memoize the parser engine to avoid re-creating it on every action
const parser = new ParserEngine(INTENTS, LEXICON);

function createInitialInventory() {
    let inv = createInventory();
    const result = addItem(inv, 'waterskin', 1, getItemRule('waterskin'));
    return result.inv;
}

export const INITIAL: GameState = {
  phase: "TITLE",
  runId: "none",
  activeOmen: null,
  activeOrigin: null,
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
    inventory: createInitialInventory(),
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
        phase: "LOADING",
        screen: { kind: "LOADING", message: "Reading the threads of fate...", context: "ORIGIN_GEN" },
      };
    }
    case "ORIGINS_GENERATED": {
      return {
        ...state,
        phase: "ORIGIN_SELECTION",
        screen: { kind: "ORIGIN_SELECTION", origins: ev.origins },
      };
    }
    case "START_RUN": {
      const initialPlayer = structuredClone(INITIAL.player);
      
      // Apply origin modifiers
      if (ev.origin.resourceModifier) {
        for (const key in ev.origin.resourceModifier) {
          const resourceId = key as ResourceId;
          const delta = ev.origin.resourceModifier[resourceId] ?? 0;
          initialPlayer.resources[resourceId] = (initialPlayer.resources[resourceId] ?? 0) + delta;
        }
      }
    
      if (ev.origin.initialPlayerMarkId) {
        const markDef = getMarkDef(ev.origin.initialPlayerMarkId);
        const newMark: Mark = {
          id: markDef.id,
          label: markDef.name,
          value: 1,
        };
        initialPlayer.marks = mergeMarks(initialPlayer.marks, [newMark]);
      }
    
      return {
        ...INITIAL,
        player: initialPlayer, // Use the modified player object
        phase: "WORLD_GEN",
        runId: crypto.randomUUID(),
        activeOrigin: ev.origin,
        screen: { kind: "LOADING", message: "The world takes shape...", context: "WORLD_GEN" },
      };
    }
    case "WORLD_GENERATED": {
      if (!state.activeOrigin) return state; // Should not happen
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
            phase: "OMEN",
            screen: { kind: "OMEN", omen: seedOmen(state.runId, state.activeOrigin) }
        };
    }
    case "ACCEPT_OMEN": {
      const startingMark: Mark = ev.approach === 'embrace'
        ? { id: 'fate-embraced', label: 'Fate-Embraced', value: 1 }
        : { id: 'fate-defiant', label: 'Fate-Defiant', value: 1 };

      return {
        ...state,
        phase: "LOADING",
        activeOmen: ev.omen,
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
      
      let newObjects = structuredClone(sceneData.objects);
      let newExits = structuredClone(sceneData.exits);
      let sceneDescription = sceneData.description;
      let initialMessage: string | null = null;
      const newFlags = new Set(state.player.flags);
    
      // --- ECHO SYSTEM V1 IMPLEMENTATION ---
      const chronicleEvents = getEvents();
      const pastEvents = chronicleEvents.filter(e => e.runId !== state.runId);
      
      if (pastEvents.length > 0) {
        let echoApplied = false;
        
        // Scene-specific echo checks
        switch (ev.sceneId) {
          case 'singing_hollow': {
            const crystalShattered = pastEvents.some(e => e.type === 'OBJECT_DESTROYED' && e.objectId === 'resonant_crystal#1' && e.sceneId === 'singing_hollow');
            if (crystalShattered) {
                const rubbleObject: SceneObject = { id: 'echo_rubble#1', name: 'collapsed rubble', aliases: ['rubble', 'rocks', 'collapse'], salience: 0.9, inspect: 'A pile of shattered rock blocks the eastern tunnel. The air is still and silent here now.', tags: ['echo']};
                newObjects = newObjects.filter(o => o.id !== 'resonant_crystal#1');
                newObjects.push(rubbleObject);
                delete newExits.e;
                echoApplied = true;
            }
            break;
          }
          case 'shifting_ravine': {
            const bridgeFell = pastEvents.some(e => e.type === 'BRIDGE_COLLAPSE' && e.sceneId === 'shifting_ravine');
            if (bridgeFell) {
                const skeletonObject: SceneObject = { id: 'echo_skeletons#1', name: 'skeletons', aliases: ['bones', 'remains'], salience: 0.7, inspect: 'The splintered remains of a rope bridge lie in the chasm below, tangled with the skeletons of those who fell.', tags: ['echo'] };
                newObjects = newObjects.filter(o => o.id !== 'rope_bridge#1');
                newObjects.push(skeletonObject);
                delete newExits.n;
                echoApplied = true;
            }
            break;
          }
          case 'forgotten_shrine': {
            const idolStolen = pastEvents.some(e => e.type === 'IDOL_STOLEN' && e.sceneId === 'forgotten_shrine');
            if (idolStolen) {
              newObjects = newObjects.filter(o => o.id !== 'mossy_idol#1');
              sceneDescription = "An empty altar sits in a quiet, overgrown grove. There is a palpable sense of loss here.";
              echoApplied = true;
            } else {
              const spiritHonored = pastEvents.some(e => e.type === 'SPIRIT_HONORED' && e.sceneId === 'forgotten_shrine');
              if (spiritHonored) {
                  const idol = newObjects.find(o => o.id === 'mossy_idol#1');
                  if (idol) {
                      idol.inspect += " A faint, warm glow emanates from it, a sign of remembered piety.";
                      idol.tags.push('blessed');
                  }
                  echoApplied = true;
              }
            }
            break;
          }
        }
        
        const echoSeenFlag = `echo_seen_${ev.sceneId}`;
        if (echoApplied && !state.player.flags.has(echoSeenFlag)) {
            initialMessage = "A faint echo of a past event resonates here.";
            newFlags.add(echoSeenFlag);
        }
      }

      SCENES[ev.sceneId].exits = newExits;

      return {
        ...state,
        phase: "SCENE",
        currentSceneId: ev.sceneId,
        player: { ...state.player, flags: newFlags },
        screen: {
          kind: "SCENE",
          sceneId: ev.sceneId,
          description: sceneDescription,
          objects: newObjects,
          lastActionResponse: initialMessage,
          suggestedCommands: [],
        }
      };
    }
    case "ATTEMPT_ACTION": {
      if (state.phase !== 'SCENE' || !state.currentSceneId || state.screen.kind !== 'SCENE') return state;
      
      const stateForThisAction = { ...state, screen: { ...state.screen, isHallucinating: false } };
      const sceneData = SCENES[state.currentSceneId];
      const result = parser.resolve(ev.rawCommand, sceneData, stateForThisAction.player);
      
      if (!result.ok || !result.intent_id) {
        return { ...stateForThisAction, screen: { ...stateForThisAction.screen, lastActionResponse: result.message ?? "Nothing happens.", suggestedCommands: result.suggested ?? [] } };
      }
      
      const intent = INTENTS.find(i => i.id === result.intent_id);
      if (!intent) return stateForThisAction;

      const interactionContext = {
        state: stateForThisAction,
        bindings: { ...result.bindings, intentId: intent.id },
        sceneObjects: sceneData.objects,
        reduce: reduce,
      };

      // Find the first matching rule (specific or generic) and execute it.
      const matchedRule = INTERACTION_RULES.find(rule => rule.conditions(interactionContext));
      
      if (matchedRule) {
        let nextState = matchedRule.effect(interactionContext);

        // Handle move as a special case that requires a phase transition
        const direction = result.bindings?.direction as string;
        if (intent.id === 'move' && direction) {
            if (state.currentSceneId === 'shifting_ravine' && direction === 'n') {
                if (Math.random() < 0.5) { // 50% chance of failure
                    recordEvent({ type: 'BRIDGE_COLLAPSE', runId: state.runId, sceneId: 'shifting_ravine' });
                    return reduce(state, { type: 'END_RUN', reason: 'The rope bridge snapped, plunging you into the chasm.' });
                }
            }
            if (state.currentSceneId === 'moonlit_garden' && direction === 'n') {
                if (!state.player.flags.has('solved_garden_riddle')) {
                    return { ...state, screen: { ...state.screen, lastActionResponse: "There is no path to the north." }};
                }
                 return reduce(state, { type: 'END_RUN', reason: 'You stepped onto the secret path, and your story ends here for now.' });
            }
            const nextSceneId = sceneData.exits[direction];
            if (nextSceneId) {
                const summary = `You move ${direction}...`;
                return { ...state, phase: 'LOADING', screen: { kind: 'LOADING', message: summary, context: 'SCENE' }, currentSceneId: nextSceneId };
            } else {
                return { ...state, screen: { ...state.screen, lastActionResponse: "You can't go that way." } };
            }
        }
        return nextState;
      }

      // Fallback if no interaction rule matches the resolved intent.
      return { ...stateForThisAction, screen: { ...stateForThisAction.screen, lastActionResponse: "That doesn't seem to do anything here." }};
    }
    case "GENERATION_FAILED": {
        return { ...state, phase: "COLLAPSE", screen: { kind: "COLLAPSE", reason: `The world unravelled. (${ev.error})` } };
    }
    case "CHOOSE_OPTION": {
      if (state.screen.kind !== "SCENE") return state;
      const opt = {id: 'placeholder', label: 'placeholder', effects: []}; // This path is now for non-parser events.
      if (!opt || !canApply(state.player.resources, opt as any)) return state;

      const nextRes = apply(state.player.resources, opt as any);
      const collapse = nextRes.TIME <= 0 ? "Out of time." : null;

      return { ...state, player: { ...state.player, resources: nextRes }, phase: collapse ? "COLLAPSE" : "RESOLVE", screen: collapse ? { kind: "COLLAPSE", reason: collapse } : { kind: "RESOLVE", summary: `You chose ${opt.label}.` } };
    }
    case "ADVANCE": {
      if (ev.to === "COLLAPSE") {
        return { ...state, phase: "COLLAPSE", screen: { kind: "COLLAPSE", reason: "Ended by design." } };
      }
      if (state.phase === 'RESOLVE' && state.currentSceneId) {
         return reduce(state, { type: 'LOAD_SCENE', sceneId: state.currentSceneId });
      }
      return state;
    }
    case "END_RUN": {
      if (state.player.resources.TIME <= 0) {
        recordEvent({ type: 'RUN_ENDED', runId: state.runId, outcome: 'Time ran out.' });
      }
      return { ...state, phase: "COLLAPSE", screen: { kind: "COLLAPSE", reason: ev.reason } };
    }
    case "LOAD_STATE": {
      const snapshot = ev.snapshot;
      const flags = Array.isArray(snapshot.player.flags) ? new Set(snapshot.player.flags as string[]) : new Set<string>();
      const inventory = snapshot.player.inventory ? createInventory(snapshot.player.inventory) : createInventory();
      return { ...snapshot, player: { ...snapshot.player, flags, inventory } };
    }
    case "RESET_GAME": {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('unwritten:chronicle:events');
      return INITIAL;
    }
    default:
      return state;
  }
}

function seedOmen(runId: string, origin: Origin | null): Omen {
  let pool = [...OMENS_DATA];
  if (origin?.omenBias && origin.omenBias.length > 0) {
    const biasedPool = OMENS_DATA.filter(c => origin.omenBias!.includes(c.id));
    if (biasedPool.length > 0) pool = biasedPool;
  }
  const idx = Math.abs(hash(runId)) % pool.length;
  return pool[idx];
}

export function mergeMarks(current: Mark[], gains: Mark[]) {
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