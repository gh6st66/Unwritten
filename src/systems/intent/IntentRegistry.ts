// Central registry so designers and code speak the same language.

import { IntentDef, IntentKind } from "./IntentTypes";
import { MarkId } from "../../core/types";

// A stand-in for a real mark registry for now
const FEARED = "FEARED" as MarkId;
const FORKED_TONGUE = "FORKED_TONGUE" as MarkId;
const TRUSTED_BY_MANY = "TRUSTED_BY_MANY" as MarkId;
const GRASPING = "GRASPING" as MarkId;

export const INTENTS: Record<IntentKind, IntentDef> = {
  CONFRONT: {
    kind: "CONFRONT",
    vector: { traits: { AGG: 0.75, AC: 0.25 }, risk: 0.7, subtlety: 0.1, resolveBias: +0.2 },
    signals: {
      favorsMarks: [{ id: FEARED, delta: +1 }],
      favorsDispositions: [{ key: "BRAVERY", delta: +0.5 }],
      tags: ["force", "frontline"]
    },
    baseCost: { AGG: 1 },
    difficultyHint: "standard"
  },
  DEFLECT: {
    kind: "DEFLECT",
    vector: { traits: { WIS: 0.6, WC: 0.4 }, risk: 0.2, subtlety: 0.7, resolveBias: -0.1 },
    signals: { tags: ["stall", "redirect"] },
    baseCost: { WIS: 1 },
    difficultyHint: "easy"
  },
  DECEIVE: {
    kind: "DECEIVE",
    vector: { traits: { CUN: 0.6, AC: 0.2, WC: 0.2 }, risk: 0.4, subtlety: 0.8 },
    signals: { favorsMarks: [{ id: FORKED_TONGUE, delta: +1 }], tags: ["lies"] },
    baseCost: { CUN: 1 },
    difficultyHint: "standard"
  },
  PERSUADE: {
    kind: "PERSUADE",
    vector: { traits: { WIS: 0.7, AW: 0.3 }, risk: 0.5, subtlety: 0.6 },
    signals: { favorsDispositions: [{ key: "COMPASSION", delta: +0.5 }], tags: ["dialogue"] },
    baseCost: { WIS: 1 },
    difficultyHint: "standard"
  },
  INTIMIDATE: {
    kind: "INTIMIDATE",
    vector: { traits: { AGG: 0.5, CUN: 0.3, AC: 0.2 }, risk: 0.6, subtlety: 0.3 },
    signals: { favorsMarks: [{ id: FEARED, delta: +1 }], tags: ["threat"] },
    baseCost: { AGG: 1 },
    difficultyHint: "standard"
  },
  SNEAK: {
    kind: "SNEAK",
    vector: { traits: { CUN: 0.6, WC: 0.4 }, risk: 0.4, subtlety: 0.9, resolveBias: +0.0 },
    signals: { tags: ["stealth"] },
    baseCost: { CUN: 1 },
    difficultyHint: "standard"
  },
  RECON: {
    kind: "RECON",
    vector: { traits: { WIS: 0.6, CUN: 0.4 }, risk: 0.2, subtlety: 0.7, resolveBias: -0.2 },
    signals: { tags: ["intel"] },
    baseCost: { WIS: 1 },
    difficultyHint: "easy"
  },
  SACRIFICE: {
    kind: "SACRIFICE",
    vector: { traits: { AW: 0.5, AGG: 0.25, WIS: 0.25 }, risk: 0.8, subtlety: 0.3, resolveBias: +0.2 },
    signals: { tags: ["tradeoff"] },
    baseCost: { AW: 1 },
    difficultyHint: "hard"
  },
  ALTRUIST: {
    kind: "ALTRUIST",
    vector: { traits: { WIS: 0.6, AW: 0.4 }, risk: 0.5, subtlety: 0.6 },
    signals: { favorsMarks: [{ id: TRUSTED_BY_MANY, delta: +1 }], tags: ["aid"] },
    baseCost: { AW: 1 },
    difficultyHint: "standard"
  },
  OPPORTUNIST: {
    kind: "OPPORTUNIST",
    vector: { traits: { CUN: 0.6, AC: 0.4 }, risk: 0.5, subtlety: 0.5 },
    signals: { favorsMarks: [{ id: GRASPING, delta: +1 }], tags: ["selfish"] },
    baseCost: { AC: 1 },
    difficultyHint: "standard"
  },
  DEFY: {
    kind: "DEFY",
    vector: { traits: { AGG: 0.35, WIS: 0.35, CUN: 0.3 }, risk: 0.7, subtlety: 0.2, resolveBias: +0.3 },
    signals: { tags: ["anti-narrative"] },
    baseCost: { AW: 1, AC: 1, WC: 1 }, // expensive hybrid push
    difficultyHint: "hard"
  },
  COMPLY: {
    kind: "COMPLY",
    vector: { traits: { WIS: 0.5, CUN: 0.25, AGG: 0.25 }, risk: 0.3, subtlety: 0.6, resolveBias: +0.1 },
    signals: { tags: ["pro-narrative"] },
    baseCost: { WIS: 1 },
    difficultyHint: "easy"
  }
};