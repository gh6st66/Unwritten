/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { Brand } from './types';

// --- Branded Types ---
export type MarkId = Brand<string, "MarkId">;
export type EventId = Brand<string, "EventId">;
export type DispositionId = Brand<string, "DispositionId">;

// --- ID Constants ---

// Using 'as const' allows TypeScript to infer the exact keys and values,
// making it possible to iterate over them or use them in other type definitions.

export const MARKS = {
    ARSONIST: "MARK_ARSONIST" as MarkId,
    BEASTSLAYER: "MARK_BEASTSLAYER" as MarkId,
    BLOODTHIRSTY: "MARK_BLOODTHIRSTY" as MarkId,
    GRAVEROBBER: "MARK_GRAVEROBBER" as MarkId,
    KILLER: "MARK_KILLER" as MarkId,
    MERCIFUL: "MARK_MERCIFUL" as MarkId,
    PACIFIST: "MARK_PACIFIST" as MarkId,
    POISONER: "MARK_POISONER" as MarkId,
    THIEF: "MARK_THIEF" as MarkId,
    AETHER_SCARRED: "MARK_AETHER_SCARRED" as MarkId,
    CHAINSCARRED: "MARK_CHAINSCARRED" as MarkId,
    DESERTBORN: "MARK_DESERTBORN" as MarkId,
    FROSTBITTEN: "MARK_FROSTBITTEN" as MarkId,
    GRAVEKEEPER: "MARK_GRAVEKEEPER" as MarkId,
    MARSHWALKER: "MARK_MARSHWALKER" as MarkId,
    NIGHTWALKER: "MARK_NIGHTWALKER" as MarkId,
    ALLIED_WITH_REBELS: "MARK_ALLIED_WITH_REBELS" as MarkId,
    EXCOMMUNICATED: "MARK_EXCOMMUNICATED" as MarkId,
    FAVORED_BY_NOBILITY: "MARK_FAVORED_BY_NOBILITY" as MarkId,
    HUNTED_BY_INQUISITION: "MARK_HUNTED_BY_INQUISITION" as MarkId,
    OATHBREAKER: "MARK_OATHBREAKER" as MarkId,
    TRUSTED_BY_GUILD: "MARK_TRUSTED_BY_GUILD" as MarkId,
    WANTED: "MARK_WANTED" as MarkId,
    BERSERKER: "MARK_BERSERKER" as MarkId,
    SHOWBOAT: "MARK_SHOWBOAT" as MarkId,
    SILVER_TONGUE: "MARK_SILVER_TONGUE" as MarkId,
    TACTICIAN: "MARK_TACTICIAN" as MarkId,
    BRANDED: "MARK_BRANDED" as MarkId,
    ORACLE_SPOKEN: "MARK_ORACLE_SPOKEN" as MarkId,
    WITNESS_TO_CATACLYSM: "MARK_WITNESS_TO_CATACLYSM" as MarkId,
} as const;

export const EVENTS = {
    COMBAT_001: "COMBAT_001" as EventId,
    COMBAT_002: "COMBAT_002" as EventId,
    BOSS_FIGHT_01: "BOSS_FIGHT_01" as EventId,
    EVENT_001: "EVENT_001" as EventId,
    SKILL_001: "SKILL_001" as EventId,
    BEGGAR_PLEA: "EVENT_BEGGAR_PLEA" as EventId,
    REST_SITE: "REST_SITE" as EventId,
} as const;

export const DISPOSITIONS = {
    FORCEFUL: "forceful" as DispositionId,
    DECEPTIVE: "deceptive" as DispositionId,
    HONORABLE: "honorable" as DispositionId,
} as const;