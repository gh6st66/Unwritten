/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export type GlossaryTerm = {
  id: string;
  term: string;
  definition: string;
  tags: string[];
  updatedAt: string;
};

const termDataSources = [
  [
    {
      "id": "mask",
      "term": "Mask",
      "definition": "A unique, evolving item tied to identity and playstyle. Grants traits or effects and can persist or echo across runs through provenance and legacy systems.",
      "tags": ["identity","items","persistence"],
      "updatedAt": "2025-08-20T00:00:00Z"
    },
    {
      "id": "mark",
      "term": "Mark",
      "definition": "A persistent reputation tag earned by actions. Alters NPC reactions, encounter generation, and narrative outcomes in current and future runs.",
      "tags": ["reputation","persistence"],
      "updatedAt": "2025-08-20T00:00:00Z"
    },
    {
      "id": "echo",
      "term": "Echo",
      "definition": "A saved consequence from a past run that can manifest later as modified locations, encounters, or characters.",
      "tags": ["persistence","world-state"],
      "updatedAt": "2025-08-20T00:00:00Z"
    },
    {
      "id": "claim",
      "term": "Claim",
      "definition": "A fate assertion placed on the player (e.g., a predicted behavior) that the player can enact or resist through choices.",
      "tags": ["narrative","pressure"],
      "updatedAt": "2025-08-20T00:00:00Z"
    },
    {
      "id": "the-journal",
      "term": "The Journal",
      "definition": "The system that issues Claims, tracks outcomes, and applies narrative gravity to steer upcoming events.",
      "tags": ["system","narrative"],
      "updatedAt": "2025-08-20T00:00:00Z"
    },
    {
      "id": "run",
      "term": "Run",
      "definition": "One life of the Unwritten. Begins with a Claim and ends at Collapse, with choices potentially creating Echoes.",
      "tags": ["structure","loop"],
      "updatedAt": "2025-08-20T00:00:00Z"
    },
    {
      "id": "collapse",
      "term": "Collapse",
      "definition": "The terminal state of a run. Finalizes consequences and writes eligible Echoes to the legacy pool.",
      "tags": ["end-state","persistence"],
      "updatedAt": "2025-08-20T00:00:00Z"
    },
    {
      "id": "intent-system",
      "term": "Intent System",
      "definition": "Choice framework that resolves actions as declared intents, consuming resources and triggering systemic effects.",
      "tags": ["choices","rules"],
      "updatedAt": "2025-08-20T00:00:00Z"
    },
    {
      "id": "dispositions",
      "term": "Dispositions",
      "definition": "Personality sliders that track behavioral tendencies. Influence available options, costs, and narrative tone.",
      "tags": ["persona","modifiers"],
      "updatedAt": "2025-08-20T00:00:00Z"
    },
    {
      "id": "narrative-gravity",
      "term": "Narrative Gravity",
      "definition": "Systemic pressure that nudges events toward fulfilling active Claims unless the player spends resources to resist.",
      "tags": ["pressure","narrative"],
      "updatedAt": "2025-08-20T00:00:00Z"
    },
    {
      "id": "real-time-economy",
      "term": "Real-Time Economy",
      "definition": "Resources refresh and opportunities unlock based on real-world time, pacing actions and preventing spam.",
      "tags": ["time","economy"],
      "updatedAt": "2025-08-20T00:00:00Z"
    },
    {
      "id": "omen",
      "term": "Omen",
      "definition": "A forecasted event hook seeded by world tensions or Marks. Signals likely future encounters the player can prepare for or avert.",
      "tags": ["forecast","encounters"],
      "updatedAt": "2025-08-20T00:00:00Z"
    },
    {
      "id": "whisper",
      "term": "Whisper",
      "definition": "A lightweight hint or rumor surfaced to the player, often tied to an Omen, suggesting risks, rewards, or NPC movements.",
      "tags": ["intel","ui"],
      "updatedAt": "2025-08-20T00:00:00Z"
    },
    {
      "id": "intro-gate",
      "term": "Intro Gate",
      "definition": "A transitional screen shown once per run that orients the player before the first decision.",
      "tags": ["ux","flow"],
      "updatedAt": "2025-08-20T00:00:00Z"
    },
    {
      "id": "opening-decree",
      "term": "Opening Decree",
      "definition": "The default Intro Gate mode that presents the initial Claim and tonal framing for the run.",
      "tags": ["ux","narrative"],
      "updatedAt": "2025-08-20T00:00:00Z"
    },
    {
      "id": "new-run-seed",
      "term": "New Run Seed",
      "definition": "Deterministic seed used to initialize run state, regional tensions, and encounter tables for reproducibility.",
      "tags": ["rng","worldgen"],
      "updatedAt": "2025-08-20T00:00:00Z"
    },
    {
      "id": "recognition",
      "term": "Recognition",
      "definition": "World-level knowledge of the Unwritten. NPCs instinctively identify the role, affecting trust, fear, and prices.",
      "tags": ["world","social"],
      "updatedAt": "2025-08-20T00:00:00Z"
    },
    {
      "id": "legacy",
      "term": "Legacy",
      "definition": "The cross-run record of notable acts. Determines which Echoes and world changes are eligible to manifest later.",
      "tags": ["persistence","meta"],
      "updatedAt": "2025-08-20T00:00:00Z"
    },
    {
      "id": "provenance",
      "term": "Provenance",
      "definition": "Ownership history for a unique item (e.g., a mask). Used by the marketplace and lore systems.",
      "tags": ["items","market"],
      "updatedAt": "2025-08-20T00:00:00Z"
    },
    {
      "id": "mask-exchange",
      "term": "Mask Exchange",
      "definition": "Player-driven marketplace for listing, buying, and selling unique masks with secure transfers and provenance tracking.",
      "tags": ["market","systems"],
      "updatedAt": "2025-08-20T00:00:00Z"
    }
  ],
  [
    {
      "id": "resource-pools",
      "term": "Resource Pools",
      "definition": "The game’s core currencies: Aggression, Wisdom, Cunning, and hybrids. They are spent to perform actions across all event types. There are no separate bars for combat, narrative, or social scenes.",
      "tags": ["resources","economy"],
      "updatedAt": "2025-08-20T00:00:00Z"
    },
    {
      "id": "resource-interdependence",
      "term": "Resource Interdependence",
      "definition": "All event types share the same resource pools. Spending a resource in one encounter reduces its availability everywhere else, forcing players to weigh tactical versus narrative priorities.",
      "tags": ["resources","systems"],
      "updatedAt": "2025-08-20T00:00:00Z"
    },
    {
      "id": "hybrid-resources",
      "term": "Hybrid Resources",
      "definition": "Costs that require a combination of two resources, such as Aggression + Wisdom. These narrow play options and force specialization or balance.",
      "tags": ["resources","costs"],
      "updatedAt": "2025-08-20T00:00:00Z"
    },
    {
      "id": "provenance",
      "term": "Provenance",
      "definition": "The ownership history of a unique item. Provenance is tracked permanently, giving masks a sense of mythic weight as they pass through many hands.",
      "tags": ["items","market"],
      "updatedAt": "2025-08-20T00:00:00Z"
    },
    {
      "id": "mask-exchange",
      "term": "Mask Exchange",
      "definition": "A player-driven marketplace where masks can be listed, bought, and sold. Tracks provenance, ensures no duplication exploits, and integrates into the game economy.",
      "tags": ["market","systems"],
      "updatedAt": "2025-08-20T00:00:00Z"
    },
    {
      "id": "legacy",
      "term": "Legacy",
      "definition": "The record of past actions across runs. Determines which Echoes and world changes are available to manifest in subsequent games.",
      "tags": ["meta","persistence"],
      "updatedAt": "2025-08-20T00:00:00Z"
    },
    {
      "id": "recognition",
      "term": "Recognition",
      "definition": "The world’s instinctive awareness of the Unwritten. NPCs identify the role on sight, influencing social dynamics, fear, and opportunity.",
      "tags": ["world","social"],
      "updatedAt": "2025-08-20T00:00:00Z"
    },
    {
      "id": "deck-manager",
      "term": "Deck Manager",
      "definition": "The subsystem that controls the draw pile, discard pile, and reshuffling. Ensures card cycling and deck integrity.",
      "tags": ["cards","systems"],
      "updatedAt": "2025-08-20T00:00:00Z"
    },
    {
      "id": "hand",
      "term": "Hand",
      "definition": "The current set of cards the player holds during a turn. Cards leave the hand when played, discarded, or otherwise consumed.",
      "tags": ["cards","turns"],
      "updatedAt": "2025-08-20T00:00:00Z"
    },
    {
      "id": "block",
      "term": "Block",
      "definition": "Temporary defense that absorbs incoming damage before health is reduced. Normally resets each turn.",
      "tags": ["combat","defense"],
      "updatedAt": "2025-08-20T00:00:00Z"
    },
    {
      "id": "encounter",
      "term": "Encounter",
      "definition": "A self-contained event with enemies, context, and resolution. May be combat-driven, narrative, or hybrid.",
      "tags": ["events","combat"],
      "updatedAt": "2025-08-20T00:00:00Z"
    },
    {
      "id": "enemy-intent",
      "term": "Enemy Intent",
      "definition": "A visible preview of what an enemy will do next turn. Helps players plan resource allocation and card plays.",
      "tags": ["ui","combat"],
      "updatedAt": "2025-08-20T00:00:00Z"
    },
    {
      "id": "player-turn",
      "term": "Player Turn",
      "definition": "The active phase where the player may play cards, spend resources, and take actions until ending the turn.",
      "tags": ["turns","flow"],
      "updatedAt": "2025-08-20T00:00:00Z"
    },
    {
      "id": "end-turn",
      "term": "End Turn",
      "definition": "The action that passes play to enemies. Triggers enemy intents and advances the turn cycle.",
      "tags": ["turns","flow"],
      "updatedAt": "2025-08-20T00:00:00Z"
    },
    {
      "id": "victory-defeat-states",
      "term": "Victory / Defeat States",
      "definition": "Possible outcomes of an encounter. Victory removes enemies; defeat occurs when player health hits zero.",
      "tags": ["states","combat"],
      "updatedAt": "2025-08-20T00:00:00Z"
    },
    {
      "id": "effect-system",
      "term": "Effect System",
      "definition": "The rules engine that applies card and action results, updating resources, health, marks, and narrative feedback.",
      "tags": ["systems","rules"],
      "updatedAt": "2025-08-20T00:00:00Z"
    },
    {
      "id": "turn-manager",
      "term": "Turn Manager",
      "definition": "The controller that sequences turns between player and enemies. Maintains order and enforces phase rules.",
      "tags": ["systems","turns"],
      "updatedAt": "2025-08-20T00:00:00Z"
    },
    {
      "id": "narrative-view",
      "term": "Narrative View",
      "definition": "The UI element that displays textual story descriptions, feedback, and the results of player actions.",
      "tags": ["ui","narrative"],
      "updatedAt": "2025-08-20T00:00:00Z"
    }
  ]
];

const mergedTerms = new Map<string, GlossaryTerm>();
termDataSources.flat().forEach(term => {
    mergedTerms.set(term.id, term as GlossaryTerm);
});

export const glossary: GlossaryTerm[] = Array.from(mergedTerms.values()).sort((a, b) => a.term.localeCompare(b.term));
