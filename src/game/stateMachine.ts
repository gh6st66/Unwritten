/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GameEvent, GameState, Resources, Mark, Omen, Origin, ResourceId, Lexeme, SceneObject, Player } from "./types";
import { LEXEMES_DATA } from "../data/lexemes";
import { LexemeTier } from "../types/lexeme";
import { INTENTS, LEXICON, SCENES } from '../data/parser/content';
import { ParserEngine } from '../systems/parser/engine';
import { createInventory } from '../systems/inventory';
import { recordEvent, getEvents } from '../systems/chronicle';
import { getMarkDef } from "../systems/Marks";
import { OMENS_DATA } from "../data/claims";
import { ChronicleEvent } from "../domain/events";
import { handleIntent, applyDelta, selectVariant, selectAtmosphere } from "../accord/accord";
import { IntentCtx } from "../accord/types";
import { INITIAL_ACCORD, INITIAL_FACTIONS, INITIAL_NPCS } from "../data/accord/state";
import { INITIAL_OMEN_WEIGHTS } from "../data/omen/initial";

const STORAGE_KEY = "unwritten:v1";

const parser = new ParserEngine(INTENTS, LEXICON);

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
    maskTag: 'HERALD',
    resources: { [ResourceId.TIME]: 6, [ResourceId.CLARITY]: 3, [ResourceId.CURRENCY]: 0 },
    marks: [],
    mask: null,
    unlockedLexemes: LEXEMES_DATA.filter(l => l.tier === LexemeTier.Basic).map(l => l.id),
    flags: new Set(),
    inventory: createInventory(),
  },
  npcs: INITIAL_NPCS,
  factions: INITIAL_FACTIONS,
  accord: INITIAL_ACCORD,
  omenWeights: INITIAL_OMEN_WEIGHTS,
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
      const initialPlayer: Player = {
        ...structuredClone(INITIAL.player),
        maskTag: Math.random() > 0.5 ? 'HERALD' : 'TRICKSTER' // Randomize starting mask persona
      };
      
      if (ev.origin.resourceModifier) {
        for (const key in ev.origin.resourceModifier) {
          const resourceId = key as ResourceId;
          const delta = ev.origin.resourceModifier[resourceId] ?? 0;
          initialPlayer.resources[resourceId] = (initialPlayer.resources[resourceId] ?? 0) + delta;
        }
      }
    
      if (ev.origin.initialPlayerMarkId) {
        const markDef = getMarkDef(ev.origin.initialPlayerMarkId);
        const newMark: Mark = { id: markDef.id, label: markDef.name, value: 1 };
        initialPlayer.marks = mergeMarks(initialPlayer.marks, [newMark]);
      }
    
      return {
        ...INITIAL,
        player: initialPlayer,
        phase: "WORLD_GEN",
        runId: crypto.randomUUID(),
        activeOrigin: ev.origin,
        screen: { kind: "LOADING", message: "The world takes shape...", context: "WORLD_GEN" },
      };
    }
    case "WORLD_GENERATED": {
      if (!state.activeOrigin) return state;
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
      
      const newObjects = structuredClone(sceneData.objects);
      const newExits = structuredClone(sceneData.exits);
      let sceneDescription = sceneData.description;
      const newFlags = new Set(state.player.flags);
      
      const narrativeLog = [sceneDescription, ...selectAtmosphere(ev.sceneId, state)];
      
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
          narrativeLog: narrativeLog,
          suggestedCommands: [],
        }
      };
    }
    case "ATTEMPT_ACTION": {
      if (state.phase !== 'SCENE' || !state.currentSceneId || state.screen.kind !== 'SCENE') return state;
      
      const sceneData = SCENES[state.currentSceneId];
      const result = parser.resolve(ev.rawCommand, sceneData, state.player);
      
      if (!result.ok || !result.intent_id) {
        const currentScreen = state.screen;
        return { ...state, screen: { ...currentScreen, narrativeLog: [...currentScreen.narrativeLog, result.message ?? "Nothing happens."], suggestedCommands: result.suggested ?? [] } };
      }
      
      const intentCtx: IntentCtx = {
          intentId: result.intent_id!,
          actorId: state.player.id,
          mask: state.player.maskTag,
          sceneId: state.currentSceneId,
          bindings: result.bindings ?? {}
      };
    
      const delta = handleIntent(intentCtx, state);
      let nextState = applyDelta(state, delta);
      
      const currentScreen = nextState.screen.kind === 'SCENE' ? nextState.screen : null;
      if (currentScreen) {
        const line = selectVariant(delta.lineId ?? 'ACTION_DEFAULT', nextState);
        return { ...nextState, screen: { ...currentScreen, narrativeLog: [...currentScreen.narrativeLog, `> ${ev.rawCommand}`, line] } };
      }

      return nextState;
    }
    case "GENERATION_FAILED": {
        return { ...state, phase: "COLLAPSE", screen: { kind: "COLLAPSE", reason: `The world unravelled. (${ev.error})` } };
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
      return { ...snapshot, player: { ...snapshot.player, flags } };
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