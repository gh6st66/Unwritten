/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import type { GlossaryIndex } from "../core/glossaryTypes";

export const GLOSSARY: GlossaryIndex = [
  {
    id: "aggression",
    term: "Aggression",
    definition: "A core resource, represented by red icons. Primarily used for direct attacks and powerful combat effects.",
    tags: ["resources", "discipline"]
  },
  {
    id: "block",
    term: "Block",
    definition: "A temporary shield that absorbs incoming damage before health is reduced. Block resets at the start of each player turn unless otherwise stated.",
    tags: ["combat","status"]
  },
  {
    id: "cunning",
    term: "Cunning",
    definition: "A core resource, represented by green icons. Often used for multi-hit attacks, card draw, and debuffing enemies.",
    tags: ["resources", "discipline"]
  },
  {
    id: "curse",
    term: "Curse",
    definition: "A negative card that is added to your deck by certain events or enemies. Curses often have detrimental effects or are unplayable, cluttering your hand.",
    tags: ["cards", "status"]
  },
  {
    id: "deck-manager",
    term: "Deck Manager",
    definition: "The system that controls the player’s draw pile, discard pile, and card draws, ensuring cards cycle correctly.",
    tags: ["cards","systems"]
  },
  {
    id: "discard-pile",
    term: "Discard Pile",
    definition: "The pile where cards go after they are played or explicitly discarded. When the Draw Pile is empty, the Discard Pile is shuffled to form a new one.",
    tags: ["cards", "systems"]
  },
  {
    id: "draw-pile",
    term: "Draw Pile",
    definition: "The stack of cards from which you draw your hand each turn. Its contents are hidden until drawn.",
    tags: ["cards", "systems"]
  },
  {
    id: "effect-system",
    term: "Effect System",
    definition: "The rules engine that processes the outcome of playing a card, updating health, resources, enemies, and narrative text.",
    tags: ["systems","effects"]
  },
  {
    id: "encounter",
    term: "Encounter",
    definition: "A discrete game event containing one or more enemies and a description. Resolved through a sequence of player and enemy turns until victory or defeat.",
    tags: ["flow","events"]
  },
  {
    id: "end-turn",
    term: "End Turn",
    definition: "The player’s action to finish their turn, triggering enemy actions and advancing to the next turn cycle.",
    tags: ["flow","turns"]
  },
  {
    id: "enemy-intent",
    term: "Enemy Intent",
    definition: "A preview of the action an enemy will take on its next turn, such as attacking or applying effects. Displayed before the player acts.",
    tags: ["combat","ui"]
  },
  {
    id: "exhaust",
    term: "Exhaust",
    definition: "A card effect that removes a card from the current combat or encounter entirely. Exhausted cards do not go to the discard pile and cannot be drawn again.",
    tags: ["cards", "mechanics"]
  },
  {
    id: "fury",
    term: "Fury",
    definition: "A hybrid discipline combining Aggression and Cunning. Fury cards often feature high-risk, high-reward offensive abilities.",
    tags: ["discipline", "hybrid"]
  },
  {
    id: "guile",
    term: "Guile",
    definition: "A hybrid discipline combining Cunning and Wisdom. Guile cards focus on manipulating enemies and exploiting their weaknesses.",
    tags: ["discipline", "hybrid"]
  },
  {
    id: "hand",
    term: "Hand",
    definition: "The set of cards the player has drawn and can play during their current turn. Changes as cards are played or effects add/remove cards.",
    tags: ["cards","ui"]
  },
  {
    id: "hybrid-resources",
    term: "Hybrid Resources",
    definition: "Resource costs that require a mix of two resource types, limiting which cards can be played and demanding more careful resource planning.",
    tags: ["systems","resources"]
  },
  {
    id: "narrative-view",
    term: "Narrative View",
    definition: "The interface area that displays text-based story feedback, contextual descriptions, and the consequences of player actions.",
    tags: ["narrative","ui"]
  },
  {
    id: "player-turn",
    term: "Player Turn",
    definition: "The phase when the player can play cards from their hand and take actions until they choose to end their turn.",
    tags: ["flow","turns"]
  },
  {
    id: "rarity",
    term: "Rarity",
    definition: "The classification of a card's power and how frequently it appears as a reward. Common cards are the baseline, while Uncommon and Rare cards are more powerful.",
    tags: ["cards", "systems"]
  },
  {
    id: "resource-pools",
    term: "Resource Pools",
    definition: "The game’s core currencies: Aggression, Wisdom, Cunning, and hybrids. Used to pay card costs during any event type.",
    tags: ["systems","resources"]
  },
  {
    id: "scry",
    term: "Scry",
    definition: "A card effect that allows you to look at a number of cards from the top of your draw pile. You can then typically reorder them or discard some.",
    tags: ["cards", "mechanics"]
  },
  {
    id: "strength",
    term: "Strength",
    definition: "A beneficial status effect that increases the damage dealt by your attacks.",
    tags: ["combat", "status"]
  },
  {
    id: "tactics",
    term: "Tactics",
    definition: "A hybrid discipline combining Aggression and Wisdom. Tactics cards excel at long-term strategy, defense, and buffing the player.",
    tags: ["discipline", "hybrid"]
  },
  {
    id: "tags",
    term: "Tags",
    definition: "Keywords on a card that categorize its function, such as 'Attack' or 'Defend'. Some card effects may interact with specific tags.",
    tags: ["cards", "ui"]
  },
  {
    id: "turn-manager",
    term: "Turn Manager",
    definition: "The system responsible for turn sequencing, determining whose turn it is, and triggering the correct phase logic.",
    tags: ["systems","turns"]
  },
  {
    id: "victory-defeat-states",
    term: "Victory / Defeat States",
    definition: "End conditions for an encounter or game. Victory clears all enemies; defeat occurs when the player’s health reaches zero.",
    tags: ["flow","end-state"]
  },
  {
    id: "vulnerable",
    term: "Vulnerable",
    definition: "A detrimental status effect that increases the damage an entity receives from attacks.",
    tags: ["combat", "status"]
  },
  {
    id: "wisdom",
    term: "Wisdom",
    definition: "A core resource, represented by blue icons. Excels at defensive abilities, resource generation, and deck manipulation.",
    tags: ["resources", "discipline"]
  }
];
