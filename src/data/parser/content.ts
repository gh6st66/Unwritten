/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { Intent, Lexicon, SceneIndex as ParserSceneIndex } from '../../systems/parser/types';
import { SceneObject } from '../../game/types';

// The SCENES data uses game-specific fields on SceneObject (like `takeable`),
// so we redefine SceneIndex here to use the richer SceneObject from game/types.
interface SceneIndex extends Omit<ParserSceneIndex, 'objects'> {
    objects: SceneObject[];
}

export const LEXICON: Lexicon = {
  verbs: {
    "move": ["go", "walk", "run", "enter", "climb", "leave"],
    "inspect": ["look", "examine", "study", "check", "approach", "l"],
    "take": ["take", "get", "pick up", "grab"],
    "drop": ["drop", "leave"],
    "use_on": ["use", "apply", "put", "place"],
    "open_close": ["open", "close", "shut", "lift lid"],
    "unlock": ["unlock"],
    "inventory": ["inventory", "i", "pack", "bag"],
    "search": ["search", "look in"],
    "combine": ["combine", "merge", "join", "mix", "craft"],
    "destroy": ["destroy", "break", "smash"],
    "ask_about": ["ask"],
    "forge_mask": ["forge", "craft", "make"],
    "talk_to": ["talk to", "speak with", "talk"],
    "vocalize": ["say", "shout", "yell", "call"],
    // Graceful failures for unsupported but common verbs
    "eat": ["eat", "drink", "consume"],
    "listen": ["listen", "hear"],
    "push": ["push", "pull", "move object"], // Distinguishing from player movement
  },
  nouns: {
    "mask_blank": ["blank mask", "shell", "unformed mask"],
    "crucible": ["crucible", "bowl", "pot"],
    "hearth": ["hearth", "forge", "anvil"],
    "old_chest": ["old chest", "chest", "box", "oak chest"],
    "key_forge": ["forge key", "key", "iron key"],
    "waterskin": ["waterskin", "canteen", "flask"],
    "ash": ["ash", "grey ash", "fine ash"],
    "clay": ["clay", "lump of clay", "workable clay"],
  },
  directions: {
    "n": ["north", "n"],
    "e": ["east", "e"],
    "s": ["south", "s"],
    "w": ["west", "w"],
    "in": ["enter", "inside", "in"],
    "out": ["exit", "outside", "out"],
  }
};

export const INTENTS: Intent[] = [
  {
    id: "inspect",
    intentType: "INTERNAL",
    verbs: ["inspect"],
    slots: ["object"],
    effects: [{ type: "message" }], // Handled in state machine
    hints: ["inspect <object>", "look at <object>"]
  },
  {
    id: "move",
    intentType: "PHYSICAL",
    verbs: ["move"],
    slots: ["direction"],
    effects: [{ type: "move" }],
    hints: ["go north", "enter sanctum"]
  },
  {
    id: "take",
    intentType: "PHYSICAL",
    verbs: ["take"],
    slots: ["object"],
    effects: [], // Handled in state machine
    hints: ["take crucible"]
  },
  {
    id: "drop",
    intentType: "PHYSICAL",
    verbs: ["drop"],
    slots: ["object"],
    effects: [], // Handled in state machine
    hints: ["drop crucible"]
  },
  {
    id: "inventory",
    intentType: "INTERNAL",
    verbs: ["inventory"],
    slots: [],
    effects: [], // Handled in state machine
    hints: ["inventory"]
  },
  {
    id: "open_close",
    intentType: "PHYSICAL",
    verbs: ["open_close"],
    slots: ["object"],
    effects: [], // Handled in state machine
    hints: ["open chest"]
  },
  {
    id: "unlock",
    intentType: "PHYSICAL",
    verbs: ["unlock"],
    slots: ["object", "tool"],
    effects: [], // Handled in state machine
    hints: ["unlock chest with key"]
  },
  {
    id: "use_on",
    intentType: "PHYSICAL",
    verbs: ["use_on"],
    slots: ["tool", "object"],
    effects: [{ type: "message", text: "You use the item." }],
    hints: ["use crucible on hearth"]
  },
  {
    id: "forge_mask",
    intentType: "PHYSICAL",
    verbs: ["forge_mask"],
    slots: ["object", "tool"],
    requirements: {
      location_tag: ["forge_site"]
    },
    effects: [{ type: "message", text: "You lack the spark to forge anything right now." }],
    hints: ["forge mask with crucible"]
  },
  {
    id: "talk_to",
    intentType: "SOCIAL",
    verbs: ["talk_to"],
    slots: ["object"],
    effects: [{ type: "message", text: "They do not respond. What would you ask them about?" }],
    hints: ["talk to <person>", "ask <person> about <topic>"]
  },
  {
    id: "search",
    intentType: "INTERNAL",
    verbs: ["search"],
    slots: ["object"],
    effects: [], // Handled in state machine
    hints: ["search hearth"],
  },
  {
    id: "combine",
    intentType: "INTERNAL",
    verbs: ["combine"],
    slots: ["object", "tool"],
    effects: [], // Handled in state machine
    hints: ["combine ash with waterskin"],
  },
  {
    id: "destroy",
    intentType: "PHYSICAL",
    verbs: ["destroy"],
    slots: ["object"],
    effects: [], // Handled in state machine
    hints: ["break crucible"],
  },
  // Graceful Failure Intents
  {
    id: "vocalize",
    intentType: "SOCIAL",
    verbs: ["vocalize"],
    slots: [],
    effects: [{ type: "message", text: "Your voice echoes in the silence, but nothing answers." }],
  },
  {
    id: "eat",
    intentType: "INTERNAL",
    verbs: ["eat"],
    slots: [],
    effects: [{ type: "message", text: "You have no need for that here." }],
  },
  {
    id: "listen",
    intentType: "INTERNAL",
    verbs: ["listen"],
    slots: [],
    effects: [{ type: "message", text: "You listen intently, but hear only the wind whistling over the rock." }],
  },
  {
    id: "push",
    intentType: "PHYSICAL",
    verbs: ["push"],
    slots: ["object"],
    effects: [{ type: "message", text: "It doesn't budge." }],
  },
];

export const SCENES: Record<string, SceneIndex> = {
  "mountain_forge": {
    "scene_id": "mountain_forge",
    "description": "You stand in a forge carved into the heart of a mountain. A great hearth, cold and silent, dominates the far wall. Before it rests a heavy anvil. A simple crucible and a blank, unformed mask sit on a stone workbench. An old wooden chest is pushed against the wall.",
    "tags": ["forge_site"],
    "objects": [
      { "id": "mask_blank#1", "name": "blank mask", "aliases": ["shell", "unformed mask"], "tags": ["mask", "forgeable"], "salience": 0.9, "inspect": "It is a smooth, featureless shell of bone-white material, cool to the touch. It waits for a word, a will, an identity.", "takeable": true, "itemId": "mask_blank" },
      { "id": "crucible#1", "name": "crucible", "aliases": ["bowl", "pot"], "tags": ["tool", "container"], "salience": 0.8, "inspect": "A heavy clay bowl, stained with the residue of forgotten rituals.", "takeable": true, "itemId": "crucible" },
      { "id": "hearth#1", "name": "hearth", "aliases": ["forge", "anvil"], "tags": ["forge_site", "heat"], "salience": 0.6, "inspect": "The stone hearth is large enough to swallow a person whole. The embers within are dead and grey. You might find something if you search it.", "state": { "searchable": true, "searched": false, "searchYields": "ash" } },
      { "id":"old_chest#1", "name":"old chest", "aliases":["chest", "box"], "tags":["container", "openable"], "salience":0.7, "state": {"locked": true, "open": false}, "inspect": "A sturdy wooden chest, bound with iron. It seems to be locked."}
    ],
    "exits": { "n": "ridge_path", "in": "sanctum", "out": "ridge_path" }
  },
  "ridge_path": {
    "scene_id": "ridge_path",
    "description": "You are on a narrow path on the mountain's ridge. The wind howls, and the world spreads out far below. Something small and dark glints on the ground. The forge entrance is to the south.",
    "objects": [
        { "id": "key_forge#1", "name": "iron key", "aliases": ["key", "forge key"], "tags": ["key", "metal"], "salience": 0.7, "inspect": "A small, heavy key made of dark iron. It looks very old.", "takeable": true, "itemId": "key_forge" }
    ],
    "exits": { "s": "mountain_forge" }
  },
  "sanctum": {
    "scene_id": "sanctum",
    "description": "A small, quiet room behind the forge. The air is still and thick with the smell of old paper and incense. A single door leads out.",
    "objects": [],
    "exits": { "out": "mountain_forge" }
  }
};