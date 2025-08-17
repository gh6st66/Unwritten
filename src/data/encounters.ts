/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { EncounterDef, EventType, EventOption, GameStateUpdate } from '../core/types';
import { EVENTS, MARKS, DISPOSITIONS } from '../core/ids';
import * as id from '../systems/identity';

export const encounterData: EncounterDef[] = [
    {
      id: EVENTS.COMBAT_001, name: "Wary Guards", event_type: EventType.COMBAT,
      description: "",
      enemies: ["GUARD_01", "GUARD_01"]
    },
    {
      id: EVENTS.COMBAT_002, name: "Cunning Outlaw", event_type: EventType.COMBAT,
      description: "",
      enemies: ["OUTLAW_01"]
    },
    {
      id: EVENTS.BOSS_FIGHT_01, name: "Captain's Stand", event_type: EventType.COMBAT,
      description: "The Faction Captain stands in your way. There is no escape.",
      enemies: ["BOSS_01"]
    },
    {
      id: EVENTS.EVENT_001, name: "The Whispering Idol", event_type: EventType.NARRATIVE,
      description: "", // Intentionally blank, to be filled by Gemini
      dynamicResolution: true, // The outcome will be resolved by Gemini
      seed: 12345,
      options: [
        {
          id: "pray",
          label: "Pray to the idol.",
          onChoose: () => {}, // Dynamic
        },
        {
          id: "touch",
          label: "Touch the idol.",
          onChoose: () => {}, // Dynamic
        },
        {
          id: "leave",
          label: "Leave it alone.",
          onChoose: () => {}, // Dynamic
        }
      ] as EventOption[]
    },
    {
      id: EVENTS.SKILL_001, name: "A Rusted Lock", event_type: EventType.SKILL,
      description: "A heavy chest sits before you, sealed by a complex, rusted lock.",
      options: [
        { 
          id: 'force', 
          label: "[Aggression] Force it open.", 
          onChoose: ({ player }) => {
            id.disp.bump(player, DISPOSITIONS.FORCEFUL, 1);
            // In a real scenario, this would trigger a skill check
          } 
        },
        { 
          id: 'pick', 
          label: "[Cunning] Try to pick the lock.", 
          onChoose: ({ player }) => {
            id.disp.bump(player, DISPOSITIONS.DECEPTIVE, 1);
          } 
        }
      ] as EventOption[]
    },
    {
      id: EVENTS.BEGGAR_PLEA,
      name: "The Beggar's Plea",
      description: "A rag-wrapped figure extends a shaking hand. \"A coin, if you can spare it...\"",
      event_type: EventType.NARRATIVE,
      options: [
        {
          id: "give_coin",
          label: "Give a coin",
          description: "A small act of kindness.",
          onChoose: ({ player, emitLog }) => {
            id.disp.bump(player, DISPOSITIONS.HONORABLE, 1);
            id.marks.addStack(player, MARKS.MERCIFUL);
            emitLog("You press a coin into their palm. Their thanks is a whisper.");
          },
        },
        {
          id: "refuse",
          label: "Refuse",
          description: "You need it more.",
          onChoose: ({ emitLog }) => emitLog("You turn away. Silence follows."),
        },
        {
          id: "intimidate",
          label: "Intimidate",
          description: "Make them back off.",
          onChoose: ({ player, emitLog }) => {
            id.disp.bump(player, DISPOSITIONS.FORCEFUL, 1);
            id.marks.addStack(player, MARKS.BLOODTHIRSTY);
            emitLog("Your stare hardens. They shrink into the alley's shadow.");
          },
        },
        {
          id: "commiserate",
          label: "[Chainscarred] Share a scarred truth",
          description: "You've slept on stone. You remember the ache.",
          condition: { type: "HasMark", mark: MARKS.CHAINSCARRED, minStacks: 1 },
          visibilityHint: "Requires MARK_CHAINSCARRED",
          onChoose: ({ emitLog }) => {
            emitLog("You speak the language of hunger. The beggar nods, eyes bright with recognition.");
            // Potential for a narrative reward here
          },
        },
        {
          id: "terrorize",
          label: "[Killer] Let the reputation speak",
          description: "No words. Just the memory of what you've done.",
          condition: { type: "HasMark", mark: MARKS.KILLER, minSeverityGrade: "Murderer" },
          visibilityHint: "Requires MARK_KILLER at Murderer severity",
          onChoose: ({ player, emitLog }) => {
            id.disp.bump(player, DISPOSITIONS.FORCEFUL, 2);
            emitLog("They recognize you. The coin cup hits the cobbles. Footsteps scatter.");
          },
        },
      ] as EventOption[],
    }
  ];