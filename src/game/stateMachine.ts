/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GameEvent, GameState, Resources, Mark, Claim, WorldSeed, ResourceId, ActionOutcome, Lexeme, SceneObject } from "./types";
import { apply, canApply } from "../systems/resourceEngine";
import { LEXEMES_DATA } from "../data/lexemes";
import { LexemeTier } from "../types/lexeme";
import { INTENTS, LEXICON, SCENES } from '../data/parser/content';
import { ParserEngine } from '../systems/parser/engine';
import { createInventory, addItem, removeItem, hasItem } from '../systems/inventory';
import { getItemRule } from '../data/itemCatalog';
import { recordEvent } from '../systems/chronicle';
import { RECIPES } from '../data/recipes';
import { getMarkDef } from "../systems/Marks";
import { CLAIMS_DATA } from "../data/claims";

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
        screen: { kind: "LOADING", message: "Discerning the omens...", context: "OMEN_GEN" },
      };
    }
    case "OMENS_GENERATED": {
      return {
        ...state,
        phase: "SEED_SELECTION",
        screen: { kind: "SEED_SELECTION", seeds: ev.seeds },
      };
    }
    case "START_RUN": {
      const initialPlayer = structuredClone(INITIAL.player);
      
      // Apply omen modifiers
      if (ev.seed.resourceModifier) {
        for (const key in ev.seed.resourceModifier) {
          const resourceId = key as ResourceId;
          const delta = ev.seed.resourceModifier[resourceId] ?? 0;
          initialPlayer.resources[resourceId] = (initialPlayer.resources[resourceId] ?? 0) + delta;
        }
      }
    
      if (ev.seed.initialPlayerMarkId) {
        const markDef = getMarkDef(ev.seed.initialPlayerMarkId);
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
            screen: { kind: "CLAIM", claim: seedClaim(state.runId, state.activeSeed) }
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
      // Note: We copy objects from the template. In a more complex game,
      // scene state (like which objects are present) would be part of the saved game state.
      // For now, this reset-on-load is sufficient. Our inventory logic will modify this list in memory.
      return {
        ...state,
        phase: "SCENE",
        currentSceneId: ev.sceneId,
        screen: {
          kind: "SCENE",
          sceneId: ev.sceneId,
          prompt: sceneData.description,
          objects: structuredClone(sceneData.objects),
          lastActionResponse: null,
          suggestedCommands: [],
        }
      };
    }
    case "ATTEMPT_ACTION": {
      if (state.phase !== 'SCENE' || !state.currentSceneId || state.screen.kind !== 'SCENE') return state;

      const result = parser.resolve(ev.rawCommand, SCENES[state.currentSceneId], state.player);
      
      if (!result.ok) {
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
        
        // --- UNLOCK LOGIC ---
        const isUnlockAction = intent.id === 'unlock' || 
                               (intent.id === 'use_on' && result.bindings?.tool?.includes('key'));

        if (isUnlockAction) {
          const objectSceneId = result.bindings?.object;

          if (!hasItem(state.player.inventory, 'key_forge')) {
            return { ...state, screen: {...state.screen, lastActionResponse: "You don't have the key for that." }};
          }

          if (!objectSceneId) {
             return { ...state, screen: {...state.screen, lastActionResponse: "What do you want to unlock?" }};
          }

          const sceneObjects = state.screen.objects;
          const objIndex = sceneObjects.findIndex(o => o.id === objectSceneId);
          if (objIndex === -1) {
            return { ...state, screen: {...state.screen, lastActionResponse: "You don't see that here." }};
          }
          
          const objToUnlock = sceneObjects[objIndex];

          if (!objToUnlock.id.startsWith('old_chest')) {
            return { ...state, screen: {...state.screen, lastActionResponse: "That key doesn't fit that lock." }};
          }
          
          if (!objToUnlock.state?.locked) {
            return { ...state, screen: {...state.screen, lastActionResponse: "It's already unlocked." }};
          }
          
          const unlockedObj = { ...objToUnlock, state: { ...objToUnlock.state, locked: false }};
          const newObjects = [...sceneObjects];
          newObjects[objIndex] = unlockedObj;

          recordEvent({ type: 'OBJECT_UNLOCKED', runId: state.runId, objectId: objectSceneId, sceneId: state.currentSceneId, toolId: 'key_forge' });

          return {
            ...state,
            screen: {
              ...state.screen,
              objects: newObjects,
              lastActionResponse: "You hear a solid *click*. The chest is unlocked."
            }
          };
        }

        // --- INVENTORY INTENT LOGIC ---
        if (intent.id === 'take') {
          const objectId = result.bindings?.object;
          if (!objectId) return { ...state, screen: {...state.screen, lastActionResponse: "Take what?"}};
          
          const sceneObject = state.screen.objects.find(o => o.id === objectId);
          if (!sceneObject || !sceneObject.takeable || !sceneObject.itemId) {
            return { ...state, screen: {...state.screen, lastActionResponse: "You can't take that."}};
          }
          const rule = getItemRule(sceneObject.itemId);
          const addResult = addItem(state.player.inventory, sceneObject.itemId, 1, rule);

          if (!addResult.ok) {
            const reason = addResult.reason === 'no_space' ? "Your pack is full." : "You already have one.";
            return { ...state, screen: {...state.screen, lastActionResponse: reason}};
          }

          recordEvent({ type: 'ITEM_TAKEN', runId: state.runId, itemId: sceneObject.itemId, sceneId: state.currentSceneId });

          const nextPlayerState = { ...state.player, inventory: addResult.inv };
          const nextScreen: GameState['screen'] = {
            ...state.screen,
            objects: state.screen.objects.filter(o => o.id !== objectId),
            lastActionResponse: `Taken: ${sceneObject.name}.`
          };
          return { ...state, player: nextPlayerState, screen: nextScreen };
        }

        if (intent.id === 'drop') {
            const itemIdToDrop = result.bindings?.object; // This is an itemId, thanks to the resolver
            if (!itemIdToDrop) return {...state, screen: {...state.screen, lastActionResponse: "Drop what?"}};

            const rule = getItemRule(itemIdToDrop);
            const removeResult = removeItem(state.player.inventory, itemIdToDrop, 1);

            if (!removeResult.ok) {
                return {...state, screen: {...state.screen, lastActionResponse: "You aren't carrying that."}};
            }
            
            recordEvent({ type: 'ITEM_DROPPED', runId: state.runId, itemId: itemIdToDrop, sceneId: state.currentSceneId });

            const droppedObject: SceneObject = {
              id: `dropped_${itemIdToDrop}_${Date.now()}`,
              name: rule.name,
              aliases: rule.nouns ?? [rule.name.toLowerCase()],
              takeable: true,
              itemId: itemIdToDrop,
              tags: [],
              salience: 0.8,
            };
            
            const nextPlayerState = { ...state.player, inventory: removeResult.inv };
            const nextScreen: GameState['screen'] = {
                ...state.screen,
                objects: [...state.screen.objects, droppedObject],
                lastActionResponse: `Dropped: ${rule.name}.`
            };
            return { ...state, player: nextPlayerState, screen: nextScreen };
        }
        
        if (intent.id === 'inventory') {
            const inv = state.player.inventory;
            let message: string;
            if (inv.slots.length === 0) {
                message = "You carry nothing.";
            } else {
                const lines = inv.slots.map(s => {
                    const rule = getItemRule(s.itemId);
                    return `${rule.name}${s.qty > 1 ? ` x${s.qty}` : ''}`;
                });
                message = `You are carrying:\n- ${lines.join('\n- ')}`;
            }
             return { ...state, screen: {...state.screen, lastActionResponse: message}};
        }

        // --- NEW CRAFTING/INTERACTION LOGIC ---
        if (intent.id === 'search') {
          const objectId = result.bindings?.object;
          if (!objectId) return { ...state, screen: {...state.screen, lastActionResponse: "Search what?"}};
          
          const sceneObjects = state.screen.objects;
          const objIndex = sceneObjects.findIndex(o => o.id === objectId);
          if (objIndex === -1) return { ...state, screen: {...state.screen, lastActionResponse: "You don't see that here."}};
          
          const obj = sceneObjects[objIndex];
          if (!obj.state?.searchable) return { ...state, screen: {...state.screen, lastActionResponse: "You find nothing of interest."}};
          if (obj.state?.searched) return { ...state, screen: {...state.screen, lastActionResponse: "You've already searched that."}};

          const itemIdToCreate = obj.state.searchYields;
          if (!itemIdToCreate) return { ...state, screen: {...state.screen, lastActionResponse: "You find nothing useful."}};

          const rule = getItemRule(itemIdToCreate);
          const newObject: SceneObject = {
            id: `created_${itemIdToCreate}_${Date.now()}`,
            name: rule.name,
            aliases: rule.nouns,
            takeable: true,
            itemId: itemIdToCreate,
            tags: rule.tags,
            salience: 0.8,
          };

          const newObjects = [...sceneObjects];
          newObjects[objIndex] = { ...obj, state: { ...obj.state, searched: true } }; // Mark as searched
          newObjects.push(newObject);

          return { ...state, screen: { ...state.screen, objects: newObjects, lastActionResponse: `You search the ${obj.name} and find some ${rule.name}.` }};
        }

        if (intent.id === 'destroy') {
            const objectId = result.bindings?.object;
            if (!objectId) return { ...state, screen: {...state.screen, lastActionResponse: "Destroy what?"}};
            const sceneObject = state.screen.objects.find(o => o.id === objectId);
            if (!sceneObject) return { ...state, screen: {...state.screen, lastActionResponse: "You can't destroy that."}};

            // Prevent destroying key puzzle items for now
            if (sceneObject.itemId && getItemRule(sceneObject.itemId).keyItem) {
                return { ...state, screen: {...state.screen, lastActionResponse: `You get the feeling you shouldn't destroy the ${sceneObject.name}.`}};
            }
            
            const nextObjects = state.screen.objects.filter(o => o.id !== objectId);
            return { ...state, screen: { ...state.screen, objects: nextObjects, lastActionResponse: `You destroy the ${sceneObject.name}.`}};
        }

        if (intent.id === 'combine') {
            const item1_id = result.bindings?.object;
            const item2_id = result.bindings?.tool;
            if (!item1_id || !item2_id) return { ...state, screen: {...state.screen, lastActionResponse: "Combine what with what?"}};

            const recipe = RECIPES.find(r => 
                (r.ingredients[0] === item1_id && r.ingredients[1] === item2_id) ||
                (r.ingredients[0] === item2_id && r.ingredients[1] === item1_id)
            );

            if (!recipe) return { ...state, screen: {...state.screen, lastActionResponse: "You can't combine those."}};

            let tempInv = state.player.inventory;
            const r1 = removeItem(tempInv, recipe.ingredients[0], 1);
            if (!r1.ok) return state; // Should not happen if resolver worked
            const r2 = removeItem(r1.inv, recipe.ingredients[1], 1);
            if (!r2.ok) return state; // Should not happen

            const rule = getItemRule(recipe.product);
            const addResult = addItem(r2.inv, recipe.product, 1, rule);

            return { ...state, player: { ...state.player, inventory: addResult.inv }, screen: { ...state.screen, lastActionResponse: recipe.message }};
        }


        // --- STANDARD INTENT LOGIC ---
        let summary = `You perform the action: ${intent.id}.`;
        let newState = { ...state };
        
        for (const effect of intent.effects) {
          switch (effect.type) {
            case 'message': {
                switch (intent.id) {
                    case 'inspect': {
                        const objectId = result.bindings?.object;
                        if (objectId) {
                            const sceneObject = state.screen.objects.find(o => o.id === objectId);
                            summary = sceneObject?.inspect ?? `You see nothing special about the ${sceneObject?.name}.`;
                        } else {
                            summary = SCENES[state.currentSceneId].description;
                        }
                        break;
                    }
                    case 'open_close': {
                        const obj = state.screen.objects.find(o => o.id === result.bindings?.object);
                        if (obj?.state?.locked) {
                            summary = "It's locked.";
                        } else if (obj) {
                            const isOpen = !!obj.state?.open;
                            const newOpenState = !isOpen;
                            const newObjects = state.screen.objects.map(o => 
                                o.id === obj.id ? { ...o, state: { ...o.state, open: newOpenState } } : o
                            );
                            summary = newOpenState ? `You open the ${obj.name}. It's empty inside.` : `You close the ${obj.name}.`;
                            return {
                                ...state,
                                screen: {
                                    ...state.screen,
                                    objects: newObjects,
                                    lastActionResponse: summary,
                                }
                            };
                        } else {
                            summary = "You can't open that.";
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
              const nextSceneId = SCENES[state.currentSceneId].exits[direction];
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
          screen: { ...state.screen, lastActionResponse: summary },
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
      const snapshot = ev.snapshot;
      // Rehydrate complex types
      const flags = Array.isArray(snapshot.player.flags) ? new Set(snapshot.player.flags as string[]) : new Set<string>();
      const inventory = snapshot.player.inventory ? createInventory(snapshot.player.inventory) : createInventory();
      
      return {
        ...snapshot,
        player: {
          ...snapshot.player,
          flags,
          inventory,
        }
      };
    }
    case "RESET_GAME": {
      localStorage.removeItem(STORAGE_KEY);
      return INITIAL;
    }
    default:
      return state;
  }
}

function seedClaim(runId: string, seed: WorldSeed | null): Claim {
  let pool = [...CLAIMS_DATA];

  // If a seed with a claim bias is provided, filter the pool.
  if (seed?.claimBias && seed.claimBias.length > 0) {
    const biasedPool = CLAIMS_DATA.filter(c => seed.claimBias!.includes(c.id));
    if (biasedPool.length > 0) {
      pool = biasedPool;
    }
  }

  // Use the runId hash to deterministically pick from the (potentially filtered) pool.
  const idx = Math.abs(hash(runId)) % pool.length;
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