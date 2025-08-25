/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GameState, ResourceId, SceneObject } from "../game/types";
import { recordEvent } from '../systems/chronicle';
import { removeItem, addItem, hasItem } from '../systems/inventory';
import { getItemRule } from './itemCatalog';
import { mergeMarks } from '../game/stateMachine';
import { RECIPES } from "./recipes";

type InteractionContext = {
  state: GameState;
  bindings: Record<string, string>;
  sceneObjects: SceneObject[];
  reduce: (state: GameState, event: any) => GameState; // Allow calling back into the reducer for complex transitions
};

type InteractionRule = {
  id: string;
  conditions: (ctx: InteractionContext) => boolean;
  effect: (ctx: InteractionContext) => GameState;
};

export const INTERACTION_RULES: InteractionRule[] = [
  // --- HIGH PRIORITY / SPECIFIC INTERACTIONS ---

  // --- Ridge Path ---
  {
    id: 'give_apple_to_traveler',
    conditions: ctx => ctx.state.currentSceneId === 'ridge_path' && ctx.bindings.intentId === 'give' && ctx.bindings.toolId === 'apple' && ctx.bindings.objectId === 'npc_traveler#1',
    effect: ({ state }) => {
      const newState = structuredClone(state);
      const sceneScreen = newState.screen.kind === 'SCENE' ? newState.screen : null;
      if (!sceneScreen) return state;

      const appleRemove = removeItem(newState.player.inventory, 'apple', 1);
      if (appleRemove.ok) {
          newState.player.inventory = appleRemove.inv;
          const traveler = sceneScreen.objects.find(o => o.id === 'npc_traveler#1');
          if (traveler?.state) traveler.state.given_apple = true;
          sceneScreen.lastActionResponse = "You offer the apple to the traveler. Their eyes widen slightly. They take it with a grateful nod. 'You have my thanks,' they rasp.";
      } else {
          sceneScreen.lastActionResponse = "You don't have an apple to give.";
      }
      return newState;
    }
  },
  {
    id: 'move_stones_on_ridge',
    conditions: ctx => ctx.state.currentSceneId === 'ridge_path' && (ctx.bindings.intentId === 'push' || ctx.bindings.intentId === 'pull') && ctx.bindings.objectId === 'stone_pile#1',
    effect: ({ state }) => {
      const newState = structuredClone(state);
      const sceneScreen = newState.screen.kind === 'SCENE' ? newState.screen : null;
      if (!sceneScreen) return state;
      
      const stones = sceneScreen.objects.find(o => o.id === 'stone_pile#1');
      if (stones?.state) {
          const wasMoved = stones.state.moved;
          stones.state.moved = !wasMoved;
          sceneScreen.lastActionResponse = !wasMoved ? 'With a heave, you topple the pile of stones.' : 'You restack the stones into a pile.';
      }
      return newState;
    }
  },
  {
    id: 'attack_traveler',
    conditions: ctx => ctx.state.currentSceneId === 'ridge_path' && ctx.bindings.intentId === 'attack' && ctx.bindings.objectId === 'npc_traveler#1',
    effect: ({ state }) => {
      const newState = structuredClone(state);
      const sceneScreen = newState.screen.kind === 'SCENE' ? newState.screen : null;
      if (!sceneScreen) return state;

      const traveler = sceneScreen.objects.find(o => o.id === 'npc_traveler#1');
      if (traveler?.state) {
          const newHealth = (traveler.state.health || 0) - 5;
          if (newHealth <= 0) {
              sceneScreen.objects = sceneScreen.objects.filter(o => o.id !== 'npc_traveler#1');
              sceneScreen.lastActionResponse = "You strike the traveler down. They fall without a sound.";
          } else {
              traveler.state.health = newHealth;
              sceneScreen.lastActionResponse = `You strike the traveler. They stumble back, wounded, looking at you with fear.`;
          }
      }
      return newState;
    }
  },

  // --- Singing Hollow ---
  {
    id: 'destroy_crystal',
    conditions: ctx => ctx.state.currentSceneId === 'singing_hollow' && ctx.bindings.intentId === 'destroy' && ctx.bindings.objectId === 'resonant_crystal#1',
    effect: ({ state }) => {
      const newState = structuredClone(state);
      const sceneScreen = newState.screen.kind === 'SCENE' ? newState.screen : null;
      if (!sceneScreen) return state;

      newState.player.resources[ResourceId.CLARITY] = Math.max(0, newState.player.resources[ResourceId.CLARITY] - 1);
      recordEvent({ type: 'OBJECT_DESTROYED', runId: newState.runId, objectId: 'resonant_crystal#1', objectName: 'resonant crystal', sceneId: 'singing_hollow' });
      sceneScreen.objects = sceneScreen.objects.filter(o => o.id !== 'resonant_crystal#1');
      sceneScreen.lastActionResponse = 'With a deafening crack, the crystal shatters. The cavern falls silent, and dust rains from the ceiling.';
      return newState;
    }
  },
  {
    id: 'play_flute_in_hollow',
    conditions: ctx => ctx.state.currentSceneId === 'singing_hollow' && ctx.bindings.intentId === 'use_on' && ctx.bindings.toolId === 'bone_flute',
    effect: ({ state }) => {
      const newState = structuredClone(state);
      const sceneScreen = newState.screen.kind === 'SCENE' ? newState.screen : null;
      if (!sceneScreen) return state;

      newState.player.resources[ResourceId.TIME] += 1;
      sceneScreen.lastActionResponse = 'You play a soft, calming tune. The cavern\'s humming harmonizes for a moment, and you feel a sense of peace.';
      return newState;
    }
  },

  // --- Shifting Ravine ---
  {
    id: 'inspect_cairn',
    conditions: ctx => ctx.state.currentSceneId === 'shifting_ravine' && ctx.bindings.intentId === 'inspect' && ctx.bindings.objectId === 'jagged_cairn#1',
    effect: ({ state }) => {
      const newState = structuredClone(state);
      const sceneScreen = newState.screen.kind === 'SCENE' ? newState.screen : null;
      if (!sceneScreen) return state;
      
      newState.player.marks = mergeMarks(newState.player.marks, [{ id: 'earth-bound', label: 'Earth-Bound', value: 1 }]);
      sceneScreen.lastActionResponse = 'The markings speak of patience and the strength of stone. You feel more grounded.';
      return newState;
    }
  },

  // --- Forgotten Shrine ---
  {
    id: 'offer_coin_to_idol',
    conditions: ctx => ctx.state.currentSceneId === 'forgotten_shrine' && ctx.bindings.intentId === 'use_on' && ctx.bindings.toolId === 'scattered_coins' && ctx.bindings.objectId === 'mossy_idol#1',
    effect: ({ state }) => {
      const newState = structuredClone(state);
      const sceneScreen = newState.screen.kind === 'SCENE' ? newState.screen : null;
      if (!sceneScreen) return state;

      const coinRemove = removeItem(newState.player.inventory, 'scattered_coins', 1);
      if (coinRemove.ok) {
          newState.player.inventory = coinRemove.inv;
          newState.player.marks = mergeMarks(newState.player.marks, [{ id: 'spirit-favored', label: 'Spirit-Favored', value: 1 }]);
          recordEvent({ type: 'SPIRIT_HONORED', runId: newState.runId, sceneId: 'forgotten_shrine' });
          sceneScreen.lastActionResponse = 'You place a coin on the dish. A faint warmth seems to radiate from the idol in gratitude.';
      } else {
          sceneScreen.lastActionResponse = "You have no coins to offer.";
      }
      return newState;
    }
  },
  {
    id: 'take_idol',
    conditions: ctx => ctx.state.currentSceneId === 'forgotten_shrine' && ctx.bindings.intentId === 'take' && ctx.bindings.objectId === 'mossy_idol#1',
    effect: ({ state }) => {
      const newState = structuredClone(state);
      newState.player.resources[ResourceId.CLARITY] = Math.max(0, newState.player.resources[ResourceId.CLARITY] - 2);
      recordEvent({ type: 'IDOL_STOLEN', runId: newState.runId, sceneId: 'forgotten_shrine' });
      // Pass-through to generic 'take' handler
      return newState;
    }
  },

  // --- Stormbreak Plateau ---
  {
    id: 'shelter_under_tree',
    conditions: ctx => ctx.state.currentSceneId === 'stormbreak_plateau' && ctx.bindings.intentId === 'use_on' && (ctx.bindings.objectId === 'scorched_tree#1' || ctx.bindings.toolId === 'scorched_tree#1'),
    effect: ({ state, reduce }) => {
      if (Math.random() < 0.8) { // 80% chance of disaster
          return reduce(state, { type: 'END_RUN', reason: 'A bolt of lightning struck the tree, and you with it.' });
      } else {
          const newState = structuredClone(state);
          const sceneScreen = newState.screen.kind === 'SCENE' ? newState.screen : null;
          if (!sceneScreen) return state;
          newState.player.marks = mergeMarks(newState.player.marks, [{ id: 'storm-touched', label: 'Storm-Touched', value: 1 }]);
          sceneScreen.lastActionResponse = 'You survive a close call with the storm. The raw energy leaves a mark on your soul.';
          return newState;
      }
    }
  },

  // --- Moonlit Garden ---
  {
    id: 'read_bench_riddle',
    conditions: ctx => ctx.state.currentSceneId === 'moonlit_garden' && ctx.bindings.intentId === 'inspect' && ctx.bindings.objectId === 'stone_bench#1',
    effect: ({ state }) => {
      const newState = structuredClone(state);
      const sceneScreen = newState.screen.kind === 'SCENE' ? newState.screen : null;
      if (!sceneScreen) return state;

      if (newState.player.resources[ResourceId.CLARITY] >= 2) {
          newState.player.flags.add('solved_garden_riddle');
          sceneScreen.lastActionResponse = 'As you read the riddle, the words rearrange in your mind, revealing a hidden truth. A path to the north, previously unseen, becomes clear.';
      } else {
          newState.player.resources[ResourceId.TIME] = Math.max(0, newState.player.resources[ResourceId.TIME] - 1);
          sceneScreen.lastActionResponse = "You try to read the riddle, but the words swim and blur. The garden seems to twist around you, and you lose track of time.";
          sceneScreen.isHallucinating = true;
      }
      return newState;
    }
  },
  {
    id: 'drink_from_pond',
    conditions: ctx => ctx.state.currentSceneId === 'moonlit_garden' && ctx.bindings.intentId === 'use_on' && (ctx.bindings.objectId === 'glassy_pond#1' || ctx.bindings.toolId === 'glassy_pond#1'),
    effect: ({ state }) => {
      const newState = structuredClone(state);
      const sceneScreen = newState.screen.kind === 'SCENE' ? newState.screen : null;
      if (!sceneScreen) return state;

      newState.player.resources[ResourceId.TIME] = Math.max(0, newState.player.resources[ResourceId.TIME] - 1);
      const randomMark = Math.random() < 0.5 ? { id: 'moon-kissed', label: 'Moon-Kissed', value: 1 } : { id: 'star-poisoned', label: 'Star-Poisoned', value: -1 };
      newState.player.marks = mergeMarks(newState.player.marks, [randomMark]);
      sceneScreen.lastActionResponse = 'You drink from the pond. The alien starlight fills you with strange power, for better or worse. You lose some time in a daze.';
      return newState;
    }
  },
  
  // --- GENERIC / FALLBACK INTERACTIONS (LOW PRIORITY) ---
  {
    id: 'generic_inspect',
    conditions: ({ bindings }) => bindings.intentId === 'inspect',
    effect: ({ state, bindings, sceneObjects }) => {
      const newState = structuredClone(state);
      const sceneScreen = newState.screen.kind === 'SCENE' ? newState.screen : null;
      if (!sceneScreen) return state;
      
      const objectId = bindings.objectId;
      if (objectId) {
          const sceneObject = sceneObjects.find(o => o.id === objectId);
          sceneScreen.lastActionResponse = sceneObject?.inspect ?? `You see nothing special about the ${sceneObject?.name}.`;
      } else {
          sceneScreen.lastActionResponse = sceneScreen.description; // Inspecting the room
      }
      return newState;
    }
  },
  {
    id: 'generic_inventory',
    conditions: ({ bindings }) => bindings.intentId === 'inventory',
    effect: ({ state }) => {
      const newState = structuredClone(state);
      const sceneScreen = newState.screen.kind === 'SCENE' ? newState.screen : null;
      if (!sceneScreen) return state;
  
      if (state.player.inventory.slots.length === 0) {
          sceneScreen.lastActionResponse = "You are not carrying anything.";
          return newState;
      }
      
      const itemNames = state.player.inventory.slots.map(slot => {
          const rule = getItemRule(slot.itemId);
          return slot.qty > 1 ? `${rule.name} (x${slot.qty})` : rule.name;
      });
  
      sceneScreen.lastActionResponse = `You are carrying: ${itemNames.join(', ')}.`;
      return newState;
    }
  },
  {
    id: 'generic_take',
    conditions: ({ bindings }) => bindings.intentId === 'take' && !!bindings.objectId,
    effect: ({ state, bindings }) => {
      const newState = structuredClone(state);
      const sceneScreen = newState.screen.kind === 'SCENE' ? newState.screen : null;
      if (!sceneScreen) return state;
  
      const objectId = bindings.objectId;
      const sceneObject = sceneScreen.objects.find(o => o.id === objectId);
      if (!sceneObject || !sceneObject.takeable || !sceneObject.itemId) {
        sceneScreen.lastActionResponse = "You can't take that.";
        return newState;
      }
      const rule = getItemRule(sceneObject.itemId);
      const addResult = addItem(state.player.inventory, sceneObject.itemId, 1, rule);
  
      if (!addResult.ok) {
        const reason = addResult.reason === 'no_space' ? "Your pack is full." : "You already have one.";
        sceneScreen.lastActionResponse = reason;
        return newState;
      }
      
      recordEvent({ type: 'ITEM_TAKEN', runId: state.runId, itemId: sceneObject.itemId, sceneId: state.currentSceneId! });
      
      newState.player.inventory = addResult.inv;
      sceneScreen.objects = sceneScreen.objects.filter(o => o.id !== objectId);
      sceneScreen.lastActionResponse = `Taken: ${sceneObject.name}.`;
      return newState;
    }
  },
  {
    id: 'generic_drop',
    conditions: ({ bindings }) => bindings.intentId === 'drop' && !!bindings.objectId,
    effect: ({ state, bindings }) => {
      const newState = structuredClone(state);
      const sceneScreen = newState.screen.kind === 'SCENE' ? newState.screen : null;
      if (!sceneScreen) return state;

      const itemId = bindings.objectId; // Note: for drop, the objectId from parser IS the itemId
      const rule = getItemRule(itemId);
      const removeResult = removeItem(newState.player.inventory, itemId, 1);

      if (!removeResult.ok) {
        sceneScreen.lastActionResponse = `You are not carrying a '${rule.name}'.`;
        return newState;
      }

      newState.player.inventory = removeResult.inv;
      const newSceneObject: SceneObject = {
        id: `${itemId}#${Math.random()}`, // Make it unique in the scene
        name: rule.name,
        aliases: rule.nouns,
        salience: 0.5,
        tags: rule.tags,
        inspect: `A discarded ${rule.name}.`,
        takeable: true,
        itemId: itemId,
      };
      sceneScreen.objects.push(newSceneObject);
      sceneScreen.lastActionResponse = `You drop the ${rule.name}.`;
      return newState;
    }
  },
  {
    id: 'generic_open_close',
    conditions: ({ bindings }) => bindings.intentId === 'open_close' && !!bindings.objectId,
    effect: ({ state, bindings }) => {
      const newState = structuredClone(state);
      const sceneScreen = newState.screen.kind === 'SCENE' ? newState.screen : null;
      if (!sceneScreen) return state;

      const sceneObject = sceneScreen.objects.find(o => o.id === bindings.objectId);
      if (!sceneObject || !sceneObject.tags.includes('openable')) {
        sceneScreen.lastActionResponse = "You can't open that.";
        return newState;
      }
      if (sceneObject.state?.locked) {
        sceneScreen.lastActionResponse = `The ${sceneObject.name} is locked.`;
        return newState;
      }
      
      const currentlyOpen = sceneObject.state?.open ?? false;
      sceneObject.state = { ...sceneObject.state, open: !currentlyOpen };
      sceneScreen.lastActionResponse = `You ${currentlyOpen ? 'close' : 'open'} the ${sceneObject.name}.`;
      return newState;
    }
  },
  {
    id: 'generic_unlock',
    conditions: ({ bindings }) => bindings.intentId === 'unlock' && !!bindings.objectId && !!bindings.toolId,
    effect: ({ state, bindings }) => {
      const newState = structuredClone(state);
      const sceneScreen = newState.screen.kind === 'SCENE' ? newState.screen : null;
      if (!sceneScreen) return state;

      const sceneObject = sceneScreen.objects.find(o => o.id === bindings.objectId);
      const toolRule = getItemRule(bindings.toolId);
      
      if (!sceneObject || !sceneObject.state?.locked) {
        sceneScreen.lastActionResponse = `The ${sceneObject?.name ?? 'object'} isn't locked.`;
        return newState;
      }
      if (!toolRule.tags.includes('key')) {
        sceneScreen.lastActionResponse = `You can't unlock it with a ${toolRule.name}.`;
        return newState;
      }

      sceneObject.state.locked = false;
      sceneScreen.lastActionResponse = `You unlock the ${sceneObject.name} with the ${toolRule.name}.`;
      return newState;
    }
  },
  {
    id: 'generic_search',
    conditions: ({ bindings }) => bindings.intentId === 'search' && !!bindings.objectId,
    effect: ({ state, bindings }) => {
      const newState = structuredClone(state);
      const sceneScreen = newState.screen.kind === 'SCENE' ? newState.screen : null;
      if (!sceneScreen) return state;

      const sceneObject = sceneScreen.objects.find(o => o.id === bindings.objectId);
      if (!sceneObject || !sceneObject.state?.searchable) {
        sceneScreen.lastActionResponse = "You can't search that.";
        return newState;
      }
      if (sceneObject.state.searched) {
        sceneScreen.lastActionResponse = `You search the ${sceneObject.name}, but find nothing new.`;
        return newState;
      }
      
      sceneObject.state.searched = true;
      const itemId = sceneObject.state.searchYields;
      if (itemId) {
          const rule = getItemRule(itemId);
          const addResult = addItem(newState.player.inventory, itemId, 1, rule);
          if (addResult.ok) {
              newState.player.inventory = addResult.inv;
              const an = ['a','e','i','o','u'].includes(rule.name[0].toLowerCase()) ? 'an' : 'a';
              sceneScreen.lastActionResponse = `You search the ${sceneObject.name} and find ${an} ${rule.name}!`;
          } else {
              sceneScreen.lastActionResponse = `You find something in the ${sceneObject.name}, but have no room to carry it.`;
          }
      } else {
          sceneScreen.lastActionResponse = `You search the ${sceneObject.name}, but find nothing.`;
      }
      return newState;
    }
  },
  {
    id: 'generic_combine',
    conditions: ({ bindings }) => bindings.intentId === 'combine' && !!bindings.toolId && !!bindings.objectId,
    effect: ({ state, bindings }) => {
      const newState = structuredClone(state);
      const sceneScreen = newState.screen.kind === 'SCENE' ? newState.screen : null;
      if (!sceneScreen) return state;

      const recipe = RECIPES.find(r => 
        (r.ingredients[0] === bindings.toolId && r.ingredients[1] === bindings.objectId) ||
        (r.ingredients[1] === bindings.toolId && r.ingredients[0] === bindings.objectId)
      );

      if (recipe) {
          const hasIng1 = hasItem(newState.player.inventory, recipe.ingredients[0]);
          const hasIng2 = hasItem(newState.player.inventory, recipe.ingredients[1]);

          if (hasIng1 && hasIng2) {
              let inv = newState.player.inventory;
              const res1 = removeItem(inv, recipe.ingredients[0], 1);
              if (res1.ok) inv = res1.inv;
              const res2 = removeItem(inv, recipe.ingredients[1], 1);
              if (res2.ok) inv = res2.inv;

              const productRule = getItemRule(recipe.product);
              const addResult = addItem(inv, recipe.product, 1, productRule);
              
              newState.player.inventory = addResult.inv;
              sceneScreen.lastActionResponse = recipe.message;
          } else {
              sceneScreen.lastActionResponse = "You don't have the required items.";
          }
      } else {
          sceneScreen.lastActionResponse = "You can't combine those.";
      }
      return newState;
    }
  },
];
