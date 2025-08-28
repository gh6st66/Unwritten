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
    "move": ["go", "walk", "run", "enter", "climb", "leave", "cross"],
    "inspect": ["look", "examine", "study", "check", "approach", "l", "read", "inspect", "look at"],
    "take": ["take", "get", "pick up", "grab"],
    "drop": ["drop", "leave"],
    "use_on": ["use", "apply", "put", "place", "play", "offer", "drink", "shelter"],
    "open_close": ["open", "close", "shut", "lift lid"],
    "unlock": ["unlock"],
    "inventory": ["inventory", "i", "pack", "bag"],
    "search": ["search", "look in", "rummage", "scour"],
    "combine": ["combine", "merge", "join", "mix", "craft"],
    "destroy": ["destroy", "break", "smash", "strike"],
    "ask_about": ["ask"],
    "forge_mask": ["forge", "craft", "make"],
    "talk_to": ["talk to", "speak with", "talk", "converse", "address"],
    "vocalize": ["say", "shout", "yell", "call"],
    "eat": ["eat", "consume"],
    "listen": ["listen", "hear"],
    "push": ["push", "shove"],
    "pull": ["pull", "drag"],
    "give": ["give", "offer", "hand over"],
    "attack": ["attack", "strike", "hit"],
    "rest": ["rest", "sleep", "wait"],
    "pray": ["pray", "chant", "invoke"],
    "swear": ["swear", "pledge"],
    "renounce": ["renounce", "forsake"],
    "ally": ["ally with", "ally"],
    "betray": ["betray", "turn on"],
    "reveal": ["reveal", "show"],
    "withhold": ["withhold", "hide"],
  },
  nouns: {
    "mask_blank": ["blank mask", "shell", "unformed mask"],
    "crucible": ["crucible", "bowl", "pot"],
    "hearth": ["hearth", "forge", "anvil"],
    "old_chest": ["old chest", "chest", "box"],
    "key_forge": ["forge key", "key", "iron key"],
    "waterskin": ["waterskin", "canteen", "flask"],
    "ash": ["ash", "grey ash", "fine ash"],
    "clay": ["clay", "lump of clay", "workable clay"],
    "resonant_crystal": ["resonant crystal", "crystal", "humming crystal"],
    "bone_flute": ["bone flute", "flute"],
    "rope_bridge": ["rope bridge", "bridge", "hanging bridge"],
    "jagged_cairn": ["jagged cairn", "cairn", "stones", "markings"],
    "mossy_idol": ["moss-covered idol", "idol", "statue"],
    "offerings_dish": ["offerings dish", "dish", "bowl"],
    "scattered_coins": ["scattered coins", "coins", "coin"],
    "scorched_tree": ["scorched tree", "tree", "lightning tree"],
    "torn_banner": ["torn banner", "banner", "flag"],
    "glassy_pond": ["glassy pond", "pond", "pool", "water"],
    "stone_bench": ["stone bench", "bench", "riddles"],
    "skeletons": ["skeletons", "bones", "remains"],
    "chest_wooden": ["wooden chest", "chest", "box"],
    "npc_traveler": ["weary traveler", "traveler", "man", "person"],
    "campfire": ["old campfire", "campfire", "fire"],
    "stone_pile": ["pile of stones", "stones", "pile", "rocks"],
    "apple": ["apple", "red apple"],
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
    effects: [{ type: "message" }],
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
  // Accord Intents
  {
    id: "OATH_SWEAR",
    intentType: "SOCIAL",
    verbs: ["swear"],
    slots: ["object"],
    effects: [],
    hints: ["swear to the council"]
  },
  {
    id: "OATH_RENOUNCE",
    intentType: "SOCIAL",
    verbs: ["renounce"],
    slots: ["object"],
    effects: [],
    hints: ["renounce the council"]
  },
  {
    id: "ALLY_DECLARE",
    intentType: "SOCIAL",
    verbs: ["ally"],
    slots: ["object"],
    effects: [],
    hints: ["ally with the rebels"]
  },
  {
    id: "BETRAY_ACT",
    intentType: "SOCIAL",
    verbs: ["betray"],
    slots: ["object"],
    effects: [],
    hints: ["betray Elder Anah"]
  },
  {
    id: "REVEAL_SECRET",
    intentType: "SOCIAL",
    verbs: ["reveal"],
    slots: ["object"],
    effects: [],
  },
  {
    id: "WITHHOLD",
    intentType: "SOCIAL",
    verbs: ["withhold"],
    slots: ["object"],
    effects: [],
  },
  // Physical/Inventory Intents
  {
    id: "take",
    intentType: "PHYSICAL",
    verbs: ["take"],
    slots: ["object"],
    effects: [],
    hints: ["take crucible"]
  },
  {
    id: "drop",
    intentType: "PHYSICAL",
    verbs: ["drop"],
    slots: ["object"],
    effects: [],
    hints: ["drop crucible"]
  },
  {
    id: "inventory",
    intentType: "INTERNAL",
    verbs: ["inventory"],
    slots: [],
    effects: [],
    hints: ["inventory"]
  },
  {
    id: "open_close",
    intentType: "PHYSICAL",
    verbs: ["open_close"],
    slots: ["object"],
    effects: [],
    hints: ["open chest"]
  },
  {
    id: "unlock",
    intentType: "PHYSICAL",
    verbs: ["unlock"],
    slots: ["object", "tool"],
    effects: [],
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
    id: "search",
    intentType: "INTERNAL",
    verbs: ["search"],
    slots: ["object"],
    effects: [],
    hints: ["search hearth"],
  },
  {
    id: "combine",
    intentType: "INTERNAL",
    verbs: ["combine"],
    slots: ["object", "tool"],
    effects: [],
    hints: ["combine ash with waterskin"],
  },
  {
    id: "destroy",
    intentType: "PHYSICAL",
    verbs: ["destroy"],
    slots: ["object"],
    effects: [],
    hints: ["break crucible"],
  },
  {
    id: "give",
    intentType: "SOCIAL",
    verbs: ["give"],
    slots: ["tool", "object"],
    effects: [{ type: "message", text: "There is no one here to give that to." }],
    hints: ["give <item> to <person>"]
  },
  {
    id: "pull",
    intentType: "PHYSICAL",
    verbs: ["pull"],
    slots: ["object"],
    effects: [{ type: "message", text: "It doesn't move." }],
  },
  {
    id: "rest",
    intentType: "INTERNAL",
    verbs: ["rest"],
    slots: [],
    effects: [{ type: "message", text: "You rest for a moment, gathering your thoughts." }],
    hints: ["rest", "wait"]
  },
  {
    id: "pray",
    intentType: "SOCIAL",
    verbs: ["pray"],
    slots: [],
    effects: [{ type: "message", text: "You offer a silent prayer. The air grows still." }],
    hints: ["pray", "chant"]
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
  {
    id: "attack",
    intentType: "PHYSICAL",
    verbs: ["attack"],
    slots: ["object"],
    effects: [{ type: "message", text: "Violence is not the answer here." }],
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
    "description": "A narrow trail clings to the side of the mountain. A chest sits half-buried, an old campfire nearby, and a weary traveler leans on a staff. The forge entrance is to the south. A dark cavern opens to the east.",
    "objects": [
      { "id": "chest_wooden#1", "name": "wooden chest", "aliases": ["chest", "box"], "tags": ["container", "openable"], "salience": 0.8, "inspect": "A small wooden chest, half-buried in the dirt. It looks weathered but sturdy. It is not locked.", "state": { "locked": false, "open": false, "searchable": true, "searched": false, "searchYields": "apple" } },
      { "id": "npc_traveler#1", "name": "weary traveler", "aliases": ["traveler", "man", "person"], "tags": ["npc", "human"], "salience": 0.9, "inspect": "A traveler in dusty clothes, leaning heavily on a staff. They look exhausted and thirsty, but watch you with wary eyes.", "state": { "health": 10, "friendly": true, "given_apple": false } },
      { "id": "campfire#1", "name": "old campfire", "aliases": ["campfire", "fire"], "tags": ["searchable"], "salience": 0.7, "inspect": "The remains of a small campfire. The ashes are cold.", "state": { "searchable": true, "searched": false, "searchYields": "ash" } },
      { "id": "stone_pile#1", "name": "pile of stones", "aliases": ["stones", "pile", "rocks"], "tags": ["movable"], "salience": 0.6, "inspect": "A pile of loose stones. It looks like it could be pushed over.", "state": { "moved": false } }
    ],
    "exits": { "s": "mountain_forge", "e": "singing_hollow" }
  },
  "sanctum": {
    "scene_id": "sanctum",
    "description": "A small, quiet room behind the forge. The air is still and thick with the smell of old paper and incense. A single door leads out.",
    "objects": [],
    "exits": { "out": "mountain_forge" }
  },
  "singing_hollow": {
    "scene_id": "singing_hollow",
    "description": "You are in a cavern where the walls hum faintly, a living chorus stirred by every step. A large, resonant crystal pulses with a soft light in the center. A bone flute rests on a stone pedestal. Exits lead west, east, and south.",
    "tags": ["cavern"],
    "objects": [
        { "id": "resonant_crystal#1", "name": "resonant crystal", "aliases": ["crystal", "humming crystal"], "tags": ["crystal", "breakable"], "salience": 0.9, "inspect": "The crystal hums with a low, vibrational frequency. It feels ancient and powerful. Striking it seems like a bad idea." },
        { "id": "bone_flute#1", "name": "bone flute", "aliases": ["flute"], "tags": ["instrument"], "salience": 0.7, "inspect": "A flute carved from a single, long bone. It is smooth and cool to the touch.", "takeable": true, "itemId": "bone_flute" }
    ],
    "exits": { "w": "ridge_path", "e": "shifting_ravine", "s": "forgotten_shrine" }
  },
  "shifting_ravine": {
      "scene_id": "shifting_ravine",
      "description": "You stand at the edge of a cracked gorge. Stones grind underfoot as if the land itself moves. A fragile-looking rope bridge spans the chasm to the north. A jagged cairn of stones stands near the western entrance.",
      "tags": ["outdoors", "chasm"],
      "objects": [
          { "id": "rope_bridge#1", "name": "rope bridge", "aliases": ["bridge", "hanging bridge"], "tags": ["structure"], "salience": 0.8, "inspect": "A swaying bridge of rope and wood planks. It looks old and treacherous. Crossing it to the north will be a risk." },
          { "id": "jagged_cairn#1", "name": "jagged cairn", "aliases": ["cairn", "stones", "markings"], "tags": ["structure", "writing"], "salience": 0.6, "inspect": "A pile of sharp stones, carefully balanced. Faint markings are scratched into their surface, whispering of resilience and stone." }
      ],
      "exits": { "w": "singing_hollow", "n": "stormbreak_plateau" }
  },
  "forgotten_shrine": {
      "scene_id": "forgotten_shrine",
      "description": "An overgrown altar sits in a quiet grove, with thick vines choking ancient carvings. A moss-covered idol is half-buried in the greenery. Before it, an offerings dish holds a few scattered coins. Paths lead north and east.",
      "tags": ["sacred", "ruin"],
      "objects": [
          { "id": "mossy_idol#1", "name": "mossy idol", "aliases": ["moss-covered idol", "idol", "statue"], "tags": ["artifact", "sacred"], "salience": 0.9, "inspect": "An old stone idol of a forgotten deity. Its features are worn smooth by time and covered in a thick blanket of moss.", "takeable": true, "itemId": "mossy_idol" },
          { "id": "offerings_dish#1", "name": "offerings dish", "aliases": ["dish", "bowl"], "tags": ["container"], "salience": 0.7, "inspect": "A stone dish containing a few old, scattered coins.", "state": { "searchable": true, "searched": false, "searchYields": "scattered_coins" } }
      ],
      "exits": { "n": "singing_hollow", "e": "moonlit_garden" }
  },
  "stormbreak_plateau": {
      "scene_id": "stormbreak_plateau",
      "description": "Winds howl across a high, exposed plateau where storm clouds gather unnaturally. Lightning arcs between the peaks. The blackened, lightning-scorched trunk of a great tree stands defiantly in the center. A torn banner flutters from a broken spear plunged into the rock. Paths lead south and east.",
      "tags": ["outdoors", "mountain", "dangerous"],
      "objects": [
          { "id": "scorched_tree#1", "name": "scorched tree", "aliases": ["tree", "lightning tree"], "tags": ["shelter", "dangerous"], "salience": 0.8, "inspect": "This ancient tree has been struck by lightning countless times. Its wood is black as charcoal, but it still stands. Sheltering beneath it during this storm would be a terrible risk." },
          { "id": "torn_banner#1", "name": "torn banner", "aliases": ["banner", "flag"], "tags": ["cloth"], "salience": 0.7, "inspect": "A tattered banner bearing the faded crest of a forgotten house.", "takeable": true, "itemId": "torn_banner" }
      ],
      "exits": { "s": "shifting_ravine", "e": "moonlit_garden" }
  },
  "moonlit_garden": {
      "scene_id": "moonlit_garden",
      "description": "You enter a pale garden where strange flowers glow with a faint, silvery light. In the center, a glassy pond reflects unfamiliar constellations. A stone bench is inscribed with faint, winding text. Paths lead west and south.",
      "tags": ["garden", "mystical"],
      "objects": [
          { "id": "glassy_pond#1", "name": "glassy pond", "aliases": ["pond", "pool", "water"], "tags": ["water", "drinkable"], "salience": 0.9, "inspect": "The water of the pond is unnaturally still and clear, like black glass. It reflects stars you do not recognize. The water seems to hum with a strange energy." },
          { "id": "stone_bench#1", "name": "stone bench", "aliases": ["bench", "riddles", "text"], "tags": ["writing"], "salience": 0.7, "inspect": "The bench is carved with a spiraling riddle. Reading it might reveal something, but it could also tax your mind." }
      ],
      "exits": { "w": "stormbreak_plateau", "s": "forgotten_shrine" }
  }
};
