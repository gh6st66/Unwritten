/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { Intent, Lexicon, SceneIndex } from '../../systems/parser/types';

export const LEXICON: Lexicon = {
  verbs: {
    "move": ["go", "walk", "run", "enter", "climb", "take", "look", "leave"],
    "inspect": ["look", "examine", "study", "check"],
    "take": ["take", "get", "pick up", "grab"],
    "drop": ["drop", "leave"],
    "use_on": ["use", "apply", "put", "place"],
    "open_close": ["open", "close", "shut"],
    "search": ["search"],
    "combine": ["combine", "merge", "join"],
    "ask_about": ["ask"],
    "forge_mask": ["forge", "craft", "make"],
  },
  nouns: {
    "mask_blank": ["blank mask", "shell", "unformed mask"],
    "crucible": ["crucible", "bowl", "pot"],
    "hearth": ["hearth", "forge", "anvil"],
    "old_chest": ["old chest", "chest", "box"],
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
    verbs: ["inspect"],
    slots: ["object"],
    effects: [{ type: "message", key: "inspect.outcome" }],
    hints: ["inspect <object>", "look at <object>"]
  },
  {
    id: "move",
    verbs: ["move"],
    slots: ["direction"],
    effects: [{ type: "move" }],
    hints: ["go north", "enter sanctum"]
  },
  {
    id: "take",
    verbs: ["take"],
    slots: ["object"],
    effects: [{ type: "message", text: "You take the item." }],
    hints: ["take crucible"]
  },
  {
    id: "drop",
    verbs: ["drop"],
    slots: ["object"],
    effects: [{ type: "message", text: "You drop the item." }],
    hints: ["drop crucible"]
  },
  {
    id: "open_close",
    verbs: ["open_close"],
    slots: ["object"],
    effects: [{ type: "message", text: "You open it." }],
    hints: ["open chest"]
  },
  {
    id: "use_on",
    verbs: ["use_on"],
    slots: ["tool", "object"],
    effects: [{ type: "message", text: "You use the item." }],
    hints: ["use crucible on hearth"]
  },
  {
    id: "forge_mask",
    verbs: ["forge_mask"],
    slots: ["object", "tool"],
    requirements: {
      location_tag: ["forge_site"]
    },
    effects: [{ type: "message", text: "You lack the spark to forge anything right now." }],
    hints: ["forge mask with crucible"]
  }
];

export const SCENES: Record<string, SceneIndex> = {
  "mountain_forge": {
    "scene_id": "mountain_forge",
    "description": "You stand in a forge carved into the heart of a mountain. A great hearth, cold and silent, dominates the far wall. Before it rests a heavy anvil. A simple crucible and a blank, unformed mask sit on a stone workbench. An old wooden chest is pushed against the wall.",
    "tags": ["forge_site"],
    "objects": [
      { "id": "mask_blank#1", "name": "blank mask", "aliases": ["shell", "unformed mask"], "tags": ["mask", "forgeable"], "salience": 0.9, "inspect": "It is a smooth, featureless shell of bone-white material, cool to the touch. It waits for a word, a will, an identity." },
      { "id": "crucible#1", "name": "crucible", "aliases": ["bowl", "pot"], "tags": ["tool", "container"], "salience": 0.8, "inspect": "A heavy clay bowl, stained with the residue of forgotten rituals." },
      { "id": "hearth#1", "name": "hearth", "aliases": ["forge", "anvil"], "tags": ["forge_site", "heat"], "salience": 0.6, "inspect": "The stone hearth is large enough to swallow a person whole. The embers within are dead and grey." },
      { "id":"old_chest#1", "name":"old chest", "aliases":["chest", "box"], "tags":["container", "openable"], "salience":0.7, "state": {"locked": true}, "inspect": "A sturdy wooden chest, bound with iron. It seems to be locked."}
    ],
    "exits": { "n": "ridge_path", "in": "sanctum", "out": "ridge_path" }
  },
  "ridge_path": {
    "scene_id": "ridge_path",
    "description": "You are on a narrow path on the mountain's ridge. The wind howls, and the world spreads out far below. The forge entrance is to the south.",
    "objects": [],
    "exits": { "s": "mountain_forge" }
  },
  "sanctum": {
    "scene_id": "sanctum",
    "description": "A small, quiet room behind the forge. The air is still and thick with the smell of old paper and incense. A single door leads out.",
    "objects": [],
    "exits": { "out": "mountain_forge" }
  }
};