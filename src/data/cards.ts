/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { CardDef, Discipline, EffectContext, EffectType, EventType, Rarity } from '../core/types';

export const cardData: CardDef[] = [
    {
      id: "AGG_001", name: "Furious Strike", rarity: Rarity.COMMON, discipline: Discipline.AGGRESSION, event_types: [EventType.COMBAT], tags: ["ATTACK"],
      cost: {aggression: 1},
      effects: [{context: EffectContext.COMBAT, type: EffectType.DEAL_DAMAGE, value: 5}],
      upgradeId: "AGG_001+",
    },
    {
      id: "AGG_001+", name: "Furious Strike+", rarity: Rarity.COMMON, discipline: Discipline.AGGRESSION, event_types: [EventType.COMBAT], tags: ["ATTACK"],
      cost: {aggression: 1},
      effects: [{context: EffectContext.COMBAT, type: EffectType.DEAL_DAMAGE, value: 8}],
    },
    {
      id: "WIS_001", name: "Meditate", rarity: Rarity.COMMON, discipline: Discipline.WISDOM, event_types: [EventType.COMBAT, EventType.NARRATIVE], tags: ["UTILITY"],
      cost: {wisdom: 1},
      effects: [{context: EffectContext.ANY, type: EffectType.GAIN_TEMP_RESOURCE, params: ["wisdom", "2"]}],
      upgradeId: "WIS_001+",
    },
    {
      id: "WIS_001+", name: "Meditate+", rarity: Rarity.COMMON, discipline: Discipline.WISDOM, event_types: [EventType.COMBAT, EventType.NARRATIVE], tags: ["UTILITY"],
      cost: {wisdom: 1},
      effects: [{context: EffectContext.ANY, type: EffectType.GAIN_TEMP_RESOURCE, params: ["wisdom", "3"]}],
    },
    {
      id: "CUN_001", name: "Quick Jab", rarity: Rarity.COMMON, discipline: Discipline.CUNNING, event_types: [EventType.COMBAT], tags: ["ATTACK", "QUICK"],
      cost: {cunning: 1},
      effects: [{context: EffectContext.COMBAT, type: EffectType.DEAL_DAMAGE, value: 3}, {context: EffectContext.COMBAT, type: EffectType.DRAW_CARDS, value: 1}],
      upgradeId: "CUN_001+",
    },
    {
      id: "CUN_001+", name: "Quick Jab+", rarity: Rarity.COMMON, discipline: Discipline.CUNNING, event_types: [EventType.COMBAT], tags: ["ATTACK", "QUICK"],
      cost: {cunning: 1},
      effects: [{context: EffectContext.COMBAT, type: EffectType.DEAL_DAMAGE, value: 4}, {context: EffectContext.COMBAT, type: EffectType.DRAW_CARDS, value: 1}],
    },
    {
      id: "FURY_001", name: "Reckless Assault", rarity: Rarity.COMMON, discipline: Discipline.FURY, event_types: [EventType.COMBAT], tags: ["ATTACK", "HYBRID"],
      cost: {aggression: 1, cunning: 1},
      effects: [{context: EffectContext.COMBAT, type: EffectType.DEAL_DAMAGE, value: 12}]
    },
    {
      id: "TACTICS_001", name: "Calculated Advance", rarity: Rarity.UNCOMMON, discipline: Discipline.TACTICS, event_types: [EventType.COMBAT, EventType.SKILL], tags: ["UTILITY", "HYBRID"],
      cost: {aggression: 1, wisdom: 1},
      effects: [
        {context: EffectContext.COMBAT, type: EffectType.APPLY_STATUS, params: ["SELF", "STRENGTH", "2"]},
        {context: EffectContext.SKILL, type: EffectType.BYPASS_CHECK, params: ["wisdom", "cunning"]}
      ]
    },
    {
      id: "GUILE_001", name: "Exploit Weakness", rarity: Rarity.UNCOMMON, discipline: Discipline.GUILE, event_types: [EventType.COMBAT, EventType.NARRATIVE], tags: ["DEBUFF", "HYBRID"],
      cost: {cunning: 1, wisdom: 1},
      effects: [
        {context: EffectContext.COMBAT, type: EffectType.APPLY_STATUS, params: ["TARGET", "VULNERABLE", "1"]},
        {context: EffectContext.NARRATIVE, type: EffectType.GAIN_INSIGHT, params: ["HIDDEN_MOTIVE"]}
      ]
    },
    {
      id: "AGG_002", name: "Shield Bash", rarity: Rarity.COMMON, discipline: Discipline.AGGRESSION, event_types: [EventType.COMBAT], tags: ["DEFEND"],
      cost: {aggression: 1},
      effects: [{context: EffectContext.COMBAT, type: EffectType.GAIN_BLOCK, value: 7}],
      upgradeId: "AGG_002+",
    },
    {
      id: "AGG_002+", name: "Shield Bash+", rarity: Rarity.COMMON, discipline: Discipline.AGGRESSION, event_types: [EventType.COMBAT], tags: ["DEFEND"],
      cost: {aggression: 1},
      effects: [{context: EffectContext.COMBAT, type: EffectType.GAIN_BLOCK, value: 10}],
    },
    {
      id: "WIS_002", name: "Foresee", rarity: Rarity.UNCOMMON, discipline: Discipline.WISDOM, event_types: [EventType.COMBAT], tags: ["UTILITY"],
      cost: {wisdom: 2},
      effects: [{context: EffectContext.COMBAT, type: EffectType.SCRY, value: 3}]
    },
    {
        id: "WIS_003", name: "Plead Case", rarity: Rarity.UNCOMMON, discipline: Discipline.WISDOM, event_types: [EventType.NARRATIVE], tags: ["INTERACTION"],
        cost: {wisdom: 2},
        effects: [{context: EffectContext.NARRATIVE, type: EffectType.TRIGGER_AI_NARRATIVE}]
    },
    {
      id: "CUN_002", name: "Misdirect", rarity: Rarity.COMMON, discipline: Discipline.CUNNING, event_types: [EventType.NARRATIVE, EventType.SKILL], tags: ["UTILITY"],
      cost: {cunning: 1},
      effects: [{context: EffectContext.ANY, type: EffectType.LOWER_DIFFICULTY, value: 1}],
      upgradeId: "CUN_002+",
    },
    {
      id: "CUN_002+", name: "Misdirect+", rarity: Rarity.COMMON, discipline: Discipline.CUNNING, event_types: [EventType.NARRATIVE, EventType.SKILL], tags: ["UTILITY"],
      cost: {cunning: 1},
      effects: [{context: EffectContext.ANY, type: EffectType.LOWER_DIFFICULTY, value: 2}],
    },
    {
      id: "FURY_002", name: "Berserker's Rage", rarity: Rarity.RARE, discipline: Discipline.FURY, event_types: [EventType.COMBAT], tags: ["ATTACK", "HYBRID"],
      cost: {aggression: 2, cunning: 1},
      effects: [{context: EffectContext.COMBAT, type: EffectType.DEAL_DAMAGE_PER_MISSING_HP, value: 1}]
    },
    {
      id: "UNIQUE_001", name: "Ancestor's Blade", rarity: Rarity.RARE, discipline: Discipline.TACTICS, event_types: [EventType.COMBAT], tags: ["ATTACK", "UNIQUE"],
      cost: {aggression: 2},
      effects: [{context: EffectContext.COMBAT, type: EffectType.DEAL_DAMAGE, value: 10}, {context: EffectContext.COMBAT, type: EffectType.APPLY_STATUS, params: ["SELF", "STRENGTH", "2"]}]
    },
    {
      id: "CURSE_001", name: "Doubt", rarity: Rarity.CURSE, discipline: Discipline.NONE, event_types: [], tags: ["CURSE"],
      cost: {},
      effects: [{context: EffectContext.ANY, type: EffectType.EXHAUST_ON_DRAW}]
    },
    {
      id: "CURSE_002", name: "Fatigue", rarity: Rarity.CURSE, discipline: Discipline.NONE, event_types: [], tags: ["CURSE"],
      cost: {},
      effects: [{context: EffectContext.ANY, type: EffectType.UNPLAYABLE}]
    },
    {
      id: "CURSE_003", name: "Haunted", rarity: Rarity.CURSE, discipline: Discipline.NONE, event_types: [], tags: ["CURSE"],
      cost: {},
      effects: [{context: EffectContext.ANY, type: EffectType.UNPLAYABLE}]
    }
  ];