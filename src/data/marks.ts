/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// =================================================================================
// WHAT IS THIS FILE? - A Layperson's Guide to "Marks"
// =================================================================================
// See MARK_INDEX.md for a table of contents.
//
// Think of "Marks" as reputation tags or badges your character earns based on
// their actions and choices throughout the game. This file is the master
// rulebook that defines every possible Mark a player can get.
//
// HOW IT WORKS:
//
// 1. WHAT ARE MARKS?
//    - A Mark is a label that describes something significant about your
//      character. For example, if you kill many enemies, you might earn the
//      "KILLER" Mark. If you are merciful, you might get the "MERCIFUL" Mark.
//      If you escape from prison, you might get "CHAINSCARRED".
//
// 2. HOW DO THEY CHANGE THE GAME?
//    - Marks have small, flavorful effects that make the world react to you.
//      A "KILLER" might find that guards are more hostile. Someone who is
//      "TRUSTED_BY_GUILD" might get better prices at guild shops.
//    - They also change the story. The AI narrator will describe you differently
//      based on your Marks, and sometimes new, unique choices will appear in
//      events just for you.
//
// 3. WHAT IS "SEVERITY" AND "GRADE LABELS"?
//    - Marks can grow in intensity. The "KILLER" Mark, for example, has three
//      levels of severity, which we call "Grades":
//        - Grade 1: "Soldier" (a respected, sanctioned killer)
//        - Grade 2: "Mercenary" (a killer for hire)
//        - Grade 3: "Murderer" (a feared, unsanctioned killer)
//      Each grade has different effects and causes the world to react to you
//      in a different way. A guard might respect a "Soldier" but attack a
//      "Murderer" on sight.
//
// IN SHORT: This file is the dictionary that tells the game what every
// reputation tag means, how to get it, how it can grow, and how it affects
// your unique adventure.
//
// ---
//
// Resolver family note:
// Families may be broad ("social") or specific ("social.intimidate", "stealth.sneak").
// If both match, the most specific modifier should take precedence.
//
// Visibility note:
// Valid values: "public" | "hidden" | "revealed_on_trigger".
// "hidden" lets the narrator react without exposing the Mark in UI until a trigger.
//
// =================================================================================

import { MarkDef } from '../core/types';
import { MARKS, DISPOSITIONS } from '../core/ids';

/**
 * The Mark system is a core part of the character's identity, representing their reputation,
 * past actions, and significant experiences. Unlike the slow-changing Dispositions, Marks
 * are numerous, dynamic, and provide specific, situational effects.
 *
 * - Category: The thematic grouping of the Mark.
 * - gradeLabels: The player-facing names for the Mark at different severity levels.
 * - maxStacks: How many times this mark can be acquired. Severity increases with stacks.
 * - decay: How and when a Mark's stacks might decrease over time.
 * - effectsBySeverity: The mechanical consequences of the Mark, which can change as its
 *   severity level increases. This is where Marks hook into other game systems like
 *   dialogue checks (dcModifiers), vendor prices (shopModifiers), and what kinds of
 *   random encounters the player finds (encounterBias).
 */
export const markData: MarkDef[] = [
    // =============================================================================
    // BEHAVIOR MARKS (Acquired through repeated actions)
    // =============================================================================
    {
        id: MARKS.ARSONIST,
        category: "behavior",
        gradeLabels: ["Firestarter", "Arsonist"],
        maxStacks: 2,
        decay: { type: "none", rate: 0 },
        tags: ["fire", "destruction", "chaos"],
        effectsBySeverity: {
            1: { dispositionNudges: { [DISPOSITIONS.FORCEFUL]: 1 }, narratorFlairs: ["smell_of_smoke"] },
            2: { 
                encounterBias: [{ tag: "law_enforcement", weight: 20 }],
                dcModifiers: [{ resolverFamily: "social.intimidate", delta: -2 }]
            }
        },
        visibility: "revealed_on_trigger"
    },
    {
        id: MARKS.BEASTSLAYER,
        category: "behavior",
        gradeLabels: ["Hunter", "Beastslayer"],
        maxStacks: 2,
        decay: { type: "time", rate: 48 },
        tags: ["wilderness", "beasts", "tracking"],
        effectsBySeverity: {
          1: { dcModifiers: [{ resolverFamily: "skill.tracking", delta: -1 }], encounterBias: [{ tag: "beast_trail", weight: 10 }] },
          2: { narratorFlairs: ["trophies_of_claw"], encounterBias: [{ tag: "beast", weight: -10 }] } // fewer random beast ambushes
        },
        visibility: "public"
    },
    {
        id: MARKS.BLOODTHIRSTY,
        category: "behavior",
        gradeLabels: ["Brute", "Bloodthirsty"],
        maxStacks: 2,
        decay: { type: "node", rate: 5 },
        tags: ["violence", "brutality"],
        effectsBySeverity: {
            1: { dcModifiers: [{ resolverFamily: "social.persuade", delta: 1 }], dispositionNudges: { [DISPOSITIONS.FORCEFUL]: 1 } },
            2: { 
                dcModifiers: [{ resolverFamily: "social.intimidate", delta: -2 }],
                encounterBias: [{ tag: "violent_resolution", weight: 15 }] // Events are more likely to end in fights
            }
        },
        visibility: "public"
    },
    {
        id: MARKS.GRAVEROBBER,
        category: "behavior",
        gradeLabels: ["Grave-Trespasser", "Graverobber"],
        maxStacks: 2,
        decay: { type: "node", rate: 8 },
        tags: ["taboo", "tomb", "loot"],
        effectsBySeverity: {
          1: { encounterBias: [{ tag: "restless_dead", weight: 8 }] },
          2: { dcModifiers: [{ resolverFamily: "social.persuade", delta: 1 }], narratorFlairs: ["grave_dirt_under_nails"] }
        },
        visibility: "revealed_on_trigger"
    },
    {
        id: MARKS.KILLER,
        category: "behavior",
        gradeLabels: ["Soldier", "Mercenary", "Murderer"],
        maxStacks: 3,
        decay: { type: "none", rate: 0 },
        tags: ["violence", "death"],
        effectsBySeverity: {
            1: { dcModifiers: [{ resolverFamily: "social.intimidate", delta: -1 }], narratorFlairs: ["killer_soldier"] },
            2: { encounterBias: [{ tag: "distrustful_npc", weight: 5 }], narratorFlairs: ["killer_mercenary"] },
            3: { 
                shopModifiers: { vendorTag: "lawful", priceDeltaPct: 20 },
                encounterBias: [{ tag: "guard", weight: 15 }],
                narratorFlairs: ["killer_murderer"]
            }
        },
        visibility: "public"
    },
    {
        id: MARKS.MERCIFUL,
        category: "behavior",
        gradeLabels: ["Kind Soul", "Merciful", "Savior"],
        maxStacks: 3,
        decay: { type: "node", rate: 10 }, // Mercy can be forgotten over time
        tags: ["compassion", "life"],
        effectsBySeverity: {
            1: { dcModifiers: [{ resolverFamily: "social.persuade", delta: -1 }]},
            2: { encounterBias: [{ tag: "desperate_npc", weight: 10 }], narratorFlairs: ["merciful_deeds"] },
            3: { 
                shopModifiers: { vendorTag: "lawful", priceDeltaPct: -10 },
                encounterBias: [{ tag: "hostile", weight: -5 }] // Less likely to be ambushed
            }
        },
        visibility: "public"
    },
    {
        id: MARKS.PACIFIST,
        category: "behavior",
        gradeLabels: ["Reluctant", "Pacifist"],
        maxStacks: 2,
        decay: { type: "combat", rate: 1 }, // erodes fast if you fight
        tags: ["mercy", "restraint"],
        effectsBySeverity: {
          1: { dcModifiers: [{ resolverFamily: "diplomacy.negotiate", delta: -1 }] },
          2: { encounterBias: [{ tag: "violent_resolution", weight: -15 }], narratorFlairs: ["hands_unstained"] }
        },
        visibility: "public"
    },
    {
        id: MARKS.POISONER,
        category: "behavior",
        gradeLabels: ["Dabbler", "Poisoner"],
        maxStacks: 2,
        decay: { type: "node", rate: 6 },
        tags: ["assassin", "alchemy", "ambush"],
        effectsBySeverity: {
          1: { dcModifiers: [{ resolverFamily: "skill.alchemy", delta: -1 }] },
          2: { encounterBias: [{ tag: "assassin_contract", weight: 12 }], narratorFlairs: ["whiff_of_bitter_herbs"] }
        },
        visibility: "revealed_on_trigger"
    },
    {
        id: MARKS.THIEF,
        category: "behavior",
        gradeLabels: ["Pickpocket", "Thief", "Master Thief"],
        maxStacks: 3,
        decay: { type: "combat", rate: 4 }, // fades if you stop stealing
        tags: ["theft", "crime", "stealth"],
        effectsBySeverity: {
          1: { dcModifiers: [{ resolverFamily: "stealth.sneak", delta: -1 }], narratorFlairs: ["light_fingers"] },
          2: { dcModifiers: [{ resolverFamily: "social.lie", delta: -1 }], encounterBias: [{ tag: "black_market", weight: 10 }] },
          3: { shopModifiers: { vendorTag: "lawful", priceDeltaPct: 15 }, encounterBias: [{ tag: "bounty_hunter", weight: 15 }] }
        },
        visibility: "public"
    },
    
    // =============================================================================
    // CONTEXT MARKS (Acquired from events or locations)
    // =============================================================================
    {
        id: MARKS.AETHER_SCARRED,
        category: "context",
        gradeLabels: ["Aether-Touched", "Aether-Scarred"],
        maxStacks: 2,
        decay: { type: "none", rate: 0 },
        tags: ["magic", "arcane", "unstable"],
        effectsBySeverity: {
            1: { narratorFlairs: ["aether_tingle"] },
            2: {
                encounterBias: [{ tag: "magical_anomaly", weight: 25 }], // More strange magical events
                dispositionNudges: { [DISPOSITIONS.DECEPTIVE]: -1 } // The magic makes you hard to read
            }
        },
        visibility: "public"
    },
    {
        id: MARKS.CHAINSCARRED,
        category: "context",
        gradeLabels: ["Ex-Prisoner", "Hunted"],
        maxStacks: 2,
        decay: { type: "node", rate: 6 },
        tags: ["prison", "pain", "law"],
        effectsBySeverity: {
            1: { dcModifiers: [{ resolverFamily: "social.intimidate", delta: -1 }] },
            2: { encounterBias: [{ tag: "law_enforcement", weight: 10 }], narratorFlairs: ["chains_visible"] }
        },
        visibility: "revealed_on_trigger"
    },
    {
        id: MARKS.DESERTBORN,
        category: "context",
        gradeLabels: ["Dune-Walker", "Sandwise"],
        maxStacks: 2,
        decay: { type: "time", rate: 72 },
        tags: ["desert", "heat", "survival"],
        effectsBySeverity: {
          1: { dcModifiers: [{ resolverFamily: "skill.survival", delta: -1 }] },
          2: { encounterBias: [{ tag: "sandstorm", weight: -10 }, { tag: "desert_bandit", weight: -5 }] }
        },
        visibility: "public"
    },
    {
        id: MARKS.FROSTBITTEN,
        category: "context",
        gradeLabels: ["Snow-Treader", "Ice-Hardened"],
        maxStacks: 2,
        decay: { type: "time", rate: 72 },
        tags: ["cold", "winter", "survival"],
        effectsBySeverity: {
          1: { dcModifiers: [{ resolverFamily: "skill.survival", delta: -1 }] },
          2: { encounterBias: [{ tag: "frost_attack", weight: -10 }], narratorFlairs: ["breath_like_ice"] }
        },
        visibility: "public"
    },
    {
        id: MARKS.GRAVEKEEPER,
        category: "context",
        gradeLabels: ["Gravedelver", "Gravekeeper"],
        maxStacks: 2,
        decay: { type: "none", rate: 0 },
        tags: ["tomb", "ritual", "respect_for_dead"],
        effectsBySeverity: {
          1: { dcModifiers: [{ resolverFamily: "skill.rituals", delta: -1 }] },
          2: { encounterBias: [{ tag: "undead", weight: -10 }], narratorFlairs: ["whispers_of_bone"] }
        },
        visibility: "public"
    },
    {
        id: MARKS.MARSHWALKER,
        category: "context",
        gradeLabels: ["Swamp-Treader", "Marshwalker"],
        maxStacks: 2,
        decay: { type: "time", rate: 24 }, // You lose the knack if you're away too long
        tags: ["swamp", "survival", "nature"],
        effectsBySeverity: {
            1: { dcModifiers: [{ resolverFamily: "skill.survival", delta: -1 }] },
            2: { encounterBias: [{ tag: "swamp_creature", weight: -10 }] } // Less likely to be surprised
        },
        visibility: "public"
    },
    {
        id: MARKS.NIGHTWALKER,
        category: "context",
        gradeLabels: ["Night-Walker", "Moon-Shadow"],
        maxStacks: 2,
        decay: { type: "time", rate: 24 },
        tags: ["night", "stealth", "moon"],
        effectsBySeverity: {
          1: { dcModifiers: [{ resolverFamily: "stealth.sneak", delta: -1 }] },
          2: { encounterBias: [{ tag: "night_patrol", weight: -10 }], narratorFlairs: ["eyes_adjusted_to_dark"] }
        },
        visibility: "public"
    },

    // =============================================================================
    // SOCIAL MARKS (Tied to factions and relationships)
    // =============================================================================
    {
        id: MARKS.ALLIED_WITH_REBELS,
        category: "social",
        gradeLabels: ["Sympathizer", "Rebel Ally"],
        maxStacks: 2,
        decay: { type: "none", rate: 0 },
        tags: ["rebels", "faction", "cause"],
        effectsBySeverity: {
          1: { encounterBias: [{ tag: "rebel_contact", weight: 15 }] },
          2: { shopModifiers: { vendorTag: "black_market", priceDeltaPct: -10 }, narratorFlairs: ["cloak_of_cause"] }
        },
        visibility: "public"
    },
    {
        id: MARKS.EXCOMMUNICATED,
        category: "social",
        gradeLabels: ["Excommunicated"],
        maxStacks: 1, // binary
        decay: { type: "none", rate: 0 },
        tags: ["church", "taboo", "outcast"],
        effectsBySeverity: {
          1: { encounterBias: [{ tag: "clergy", weight: 15 }], shopModifiers: { vendorTag: "church", priceDeltaPct: 25 } }
        },
        visibility: "public"
    },
    {
        id: MARKS.FAVORED_BY_NOBILITY,
        category: "social",
        gradeLabels: ["Known to Nobles", "Favored by Nobility"],
        maxStacks: 2,
        decay: { type: "time", rate: 72 },
        tags: ["court", "favor", "prestige"],
        effectsBySeverity: {
          1: { shopModifiers: { vendorTag: "noble", priceDeltaPct: -5 } },
          2: { dcModifiers: [{ resolverFamily: "diplomacy.negotiate", delta: -1 }], encounterBias: [{ tag: "court_invitation", weight: 12 }] }
        },
        visibility: "public"
    },
    {
        id: MARKS.HUNTED_BY_INQUISITION,
        category: "social",
        gradeLabels: ["Suspect", "Hunted"],
        maxStacks: 2,
        decay: { type: "none", rate: 0 },
        tags: ["inquisition", "heretic", "hunted"],
        effectsBySeverity: {
            1: { shopModifiers: { vendorTag: "inquisition", priceDeltaPct: 15 } },
            2: { 
                encounterBias: [{ tag: "inquisition_patrol", weight: 30 }],
                narratorFlairs: ["inquisition_watched"]
            }
        },
        visibility: "public"
    },
    {
        id: MARKS.OATHBREAKER,
        category: "social",
        gradeLabels: ["Oathbreaker"],
        maxStacks: 1, // This is a binary state Mark
        decay: { type: "none", rate: 0 },
        tags: ["outlaw", "contract", "betrayal"],
        effectsBySeverity: {
            1: {
                shopModifiers: { vendorTag: "black_market", priceDeltaPct: -10 },
                dcModifiers: [{ resolverFamily: "diplomacy.negotiate", delta: 1 }], // Harder to make deals
                encounterBias: [{ tag: "bounty_hunter", weight: 12 }]
            }
        },
        visibility: "public"
    },
    {
        id: MARKS.TRUSTED_BY_GUILD,
        category: "social",
        gradeLabels: ["Associate", "Friend of the Guild"],
        maxStacks: 2,
        decay: { type: "none", rate: 0 },
        tags: ["guild", "merchant", "trusted"],
        effectsBySeverity: {
            1: { shopModifiers: { vendorTag: "guild", priceDeltaPct: -5 } },
            2: { 
                shopModifiers: { vendorTag: "guild", priceDeltaPct: -15 },
                encounterBias: [{ tag: "guild_quest", weight: 20 }] // Unlocks new opportunities
            }
        },
        visibility: "public"
    },
    {
        id: MARKS.WANTED,
        category: "social",
        gradeLabels: ["Suspect", "Wanted"],
        maxStacks: 2,
        decay: { type: "node", rate: 12 }, // cools off if you lay low
        tags: ["crime", "poster", "pursuit"],
        effectsBySeverity: {
          1: { encounterBias: [{ tag: "informant", weight: 8 }] },
          2: { encounterBias: [{ tag: "city_guard", weight: 20 }], shopModifiers: { vendorTag: "lawful", priceDeltaPct: 20 } }
        },
        visibility: "public"
    },

    // =============================================================================
    // STYLE MARKS (How the player solves problems)
    // =============================================================================
    {
        id: MARKS.BERSERKER,
        category: "style",
        gradeLabels: ["Hot-Blooded", "Berserker"],
        maxStacks: 2,
        decay: { type: "node", rate: 5 },
        tags: ["rage", "rushdown", "reckless"],
        effectsBySeverity: {
          1: { dcModifiers: [{ resolverFamily: "combat.provoke", delta: -1 }] },
          2: { encounterBias: [{ tag: "violent_resolution", weight: 12 }], narratorFlairs: ["eyes_ablaze"] }
        },
        visibility: "public"
    },
    {
        id: MARKS.SHOWBOAT,
        category: "style",
        gradeLabels: ["Braggart", "Showboat"],
        maxStacks: 2,
        decay: { type: "time", rate: 24 },
        tags: ["flashy", "crowd", "bold"],
        effectsBySeverity: {
          1: { dcModifiers: [{ resolverFamily: "social.persuade", delta: -1 }] },
          2: { encounterBias: [{ tag: "crowd_event", weight: 10 }], narratorFlairs: ["flair_for_drama"] }
        },
        visibility: "public"
    },
    {
        id: MARKS.SILVER_TONGUE,
        category: "style",
        gradeLabels: ["Deceiver", "Silver-Tongue"],
        maxStacks: 2,
        decay: { type: "combat", rate: 3 }, // Style fades if you don't use it
        tags: ["social", "deception", "diplomacy"],
        effectsBySeverity: {
            1: { dcModifiers: [{ resolverFamily: "social.lie", delta: -1 }], dispositionNudges: { [DISPOSITIONS.DECEPTIVE]: 1 } },
            2: { dcModifiers: [{ resolverFamily: "social", delta: -1 }] } // A bonus to ALL social checks
        },
        visibility: "public"
    },
    {
        id: MARKS.TACTICIAN,
        category: "style",
        gradeLabels: ["Planner", "Tactician"],
        maxStacks: 2,
        decay: { type: "combat", rate: 3 },
        tags: ["tactics", "setup", "control"],
        effectsBySeverity: {
          1: { dcModifiers: [{ resolverFamily: "tactics.plan", delta: -1 }] },
          2: { encounterBias: [{ tag: "ambush_setup", weight: 10 }], narratorFlairs: ["measured_steps"] }
        },
        visibility: "public"
    },
    
    // =============================================================================
    // STORY MARKS (Acquired from key plot points)
    // =============================================================================
    {
        id: MARKS.BRANDED,
        category: "story",
        gradeLabels: ["Bearer of the Brand"],
        maxStacks: 1,
        decay: { type: "none", rate: 0 },
        tags: ["brand", "curse", "plot"],
        effectsBySeverity: {
          1: { narratorFlairs: ["brand_flares"], encounterBias: [{ tag: "seeker_of_brand", weight: 10 }] }
        },
        visibility: "revealed_on_trigger"
    },
    {
        id: MARKS.ORACLE_SPOKEN,
        category: "story",
        gradeLabels: ["Prophesied"],
        maxStacks: 1,
        decay: { type: "none", rate: 0 },
        tags: ["destiny", "prophecy", "main_quest"],
        effectsBySeverity: {
            1: {
                narratorFlairs: ["oracle_words_echo"],
                encounterBias: [{ tag: "main_quest", weight: 10 }] // More likely to encounter story events
            }
        },
        visibility: "public"
    },
    {
        id: MARKS.WITNESS_TO_CATACLYSM,
        category: "story",
        gradeLabels: ["Witness", "Survivor"],
        maxStacks: 2,
        decay: { type: "none", rate: 0 },
        tags: ["cataclysm", "memory", "trauma"],
        effectsBySeverity: {
          1: { narratorFlairs: ["ash_in_the_air"] },
          2: { encounterBias: [{ tag: "disaster_echo", weight: 15 }], dcModifiers: [{ resolverFamily: "social.intimidate", delta: -1 }] }
        },
        visibility: "public"
    }
];