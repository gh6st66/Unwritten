// SPDX-License-Identifier: Apache-2.0

import { MarkId } from "../../core/types";

export type CoreTrait = "AGG" | "WIS" | "CUN";
export type HybridTrait = "AW" | "AC" | "WC"; // Agg+Wis, Agg+Cun, Wis+Cun

export type TraitKey = CoreTrait | HybridTrait;

export type IntentKind =
  | "CONFRONT"        // assert force, press, challenge
  | "DEFLECT"         // avoid, reframe, stall
  | "DECEIVE"         // lie, misdirect, mask motives
  | "PERSUADE"        // reason, appeal, empathize
  | "INTIMIDATE"      // threaten without immediate force
  | "SNEAK"           // stealth, concealment, evasion
  | "RECON"           // probe, learn, test
  | "SACRIFICE"       // accept cost now for position later
  | "ALTRUIST"        // aid another at personal opportunity cost
  | "OPPORTUNIST"     // self-advantage, exploit opening
  | "DEFY"            // act against imposed narrative (Journal/Claim)
  | "COMPLY";         // lean into imposed narrative

export interface IntentVector {
  // normalized weights describing the “shape” of the intent
  traits: Partial<Record<TraitKey, number>>; // 0..1 recommended, not enforced
  risk: number;       // 0..1 subjective exposure
  subtlety: number;   // 0..1 how concealed the action is
  resolveBias?: number; // -1..1 bias toward ending the scene sooner/later
}

export type DispositionKey = string; // e.g. "BRAVERY", "COMPASSION", etc.

export interface IntentSignals {
  favorsMarks?: Array<{ id: MarkId; delta: number }>;
  favorsDispositions?: Array<{ key: DispositionKey; delta: number }>;
  tags?: string[]; // free-form classifiers for filtering in encounters
}

export interface IntentDef {
  kind: IntentKind;
  vector: IntentVector;
  signals?: IntentSignals;
  // how costly this intent tends to be before option-level modifiers
  baseCost?: Partial<Record<TraitKey, number>>; // nominal resource costs
  // tuning knobs for difficulty hooks
  difficultyHint?: "easy" | "standard" | "hard" | "improbable";
}

export interface IntentOutcome {
  // actual applied costs after scaling
  costs: Partial<Record<TraitKey, number>>;
  // identity deltas applied on success/fail
  marksDelta?: Array<{ id: MarkId; delta: number }>;
  dispositionsDelta?: Array<{ key: DispositionKey; delta: number }>;
  // for encounter flow
  endEncounter?: boolean;
  revealIntelScore?: number; // how much info was surfaced (RECON)
  noise?: number;            // how much attention you attracted
  succeeded: boolean;
  // optional narrative hook key (lets content pick success/fail branches)
  branchKey?: string;
}