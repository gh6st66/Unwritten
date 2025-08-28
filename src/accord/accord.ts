/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GameState } from "../game/types";
import { EngineDelta, IntentCtx, NPCState, Condition, VariantBlock } from "./types";
import { INTENT_WEIGHTS, SCOPE_FACTORS } from "../data/accord/weights";
import { TEXT_VARIANTS } from "../data/text/variants";
import { SCENES } from "../data/parser/content";

/**
 * The main "Intent Handler". Takes a resolved player action and the current state,
 * and calculates the narrative consequences as a declarative EngineDelta.
 */
export function handleIntent(ctx: IntentCtx, state: GameState): EngineDelta {
  const delta: EngineDelta = {};
  const weightDef = INTENT_WEIGHTS[ctx.intentId];

  if (!weightDef) {
    // This intent has no Accord effect.
    return { lineId: 'ACTION_DEFAULT' };
  }

  // For now, assume the target is always Elder Anah for demo purposes
  const targetNpcId = "ELDER_ANAH";
  const targetNpc = state.npcs[targetNpcId];
  if (!targetNpc) {
     return { lineId: 'ACTION_DEFAULT' };
  }
  
  const maskAffinity = targetNpc.factions.reduce((acc, factionId) => {
    const faction = state.factions[factionId];
    return acc + (faction?.stance[ctx.mask] ?? 0);
  }, 0);

  // 1. Recognition Delta
  const recognition: { npcId: string, trust?: number, fear?: number } = { npcId: targetNpcId };
  if (weightDef.trust) {
    recognition.trust = weightDef.trust + Math.round(maskAffinity / 2);
  }
  if (weightDef.fear) {
    recognition.fear = weightDef.fear;
  }
  delta.recognition = [recognition];

  // 2. Accord Delta
  if (weightDef.accord) {
    delta.accord = { stability: weightDef.accord };
  }
  
  // 3. Line ID for response text
  delta.lineId = "COUNCIL_GREET"; // hardcoded for demo

  return delta;
}

/**
 * A pure function that applies an EngineDelta to a GameState, producing a new GameState.
 */
export function applyDelta(state: GameState, delta: EngineDelta): GameState {
    let next = { ...state };

    if (delta.recognition) {
        const nextNpcs = { ...next.npcs };
        for (const r of delta.recognition) {
            const npc = { ...nextNpcs[r.npcId] };
            npc.recognition = { ...npc.recognition };
            if (r.trust) npc.recognition.trust += r.trust;
            if (r.fear) npc.recognition.fear += r.fear;
            if (r.awe) npc.recognition.awe += r.awe;
            nextNpcs[r.npcId] = npc;
        }
        next = { ...next, npcs: nextNpcs };
    }

    if (delta.accord) {
        const nextAccord = { ...next.accord };
        nextAccord.stability = Math.max(-100, Math.min(100, nextAccord.stability + delta.accord.stability));
        next = { ...next, accord: nextAccord };
    }
    
    // loyalty, beats, echoes would be handled here
    
    return next;
}

/**
 * A simple DSL condition evaluator.
 */
export function evaluateCondition(condition: Condition, state: GameState): boolean {
    try {
        const npcRegex = /npc\('(.+?)'\)\.(.+)/;
        const match = condition.match(npcRegex);
        if (match) {
            const [, npcId, path] = match;
            const npc = state.npcs[npcId];
            if (!npc) return false;
            
            const [key1, key2] = path.split('.') as [keyof NPCState, keyof NPCState['recognition']];
            if (key1 === 'recognition' && npc.recognition[key2] !== undefined) {
                const operator = condition.includes('>') ? '>' : '<';
                const value = parseInt(condition.split(operator)[1].trim(), 10);
                if (operator === '>') return npc.recognition[key2] > value;
                if (operator === '<') return npc.recognition[key2] < value;
            }
        }
    } catch (e) {
        console.error("Error evaluating condition:", condition, e);
        return false;
    }
    return false;
}

/**
 * Selects the appropriate line of text from a variant block based on game state.
 */
export function selectVariant(blockId: string, state: GameState): string {
  const block = TEXT_VARIANTS[blockId];
  if (!block) return `Error: Missing variant block '${blockId}'`;

  for (const variant of block.variants) {
    if (variant.if && evaluateCondition(variant.if, state)) {
      return variant.text;
    }
  }
  // Return the default (last, no 'if' condition)
  return block.variants[block.variants.length - 1].text;
}

export function selectAtmosphere(sceneId: string, state: GameState): string[] {
    // Stub for atmosphere selection
    const hints: string[] = [];
    if (state.accord.stability < state.accord.thresholds.fracture) {
        hints.push("The air feels heavy with unspoken tension.");
    } else if (state.accord.stability > state.accord.thresholds.unity) {
        hints.push("A sense of shared purpose seems to lighten the air.");
    }
    return hints;
}
