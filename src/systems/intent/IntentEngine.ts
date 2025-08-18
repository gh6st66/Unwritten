import {
  IntentDef,
  IntentKind,
  IntentOutcome,
  TraitKey,
  IntentVector
} from "./IntentTypes";
import { INTENTS } from "./IntentRegistry";
import { RunState } from "../../core/types";
import { clamp } from "../math";

export interface IntentContext {
  runState: RunState;
  // Encounter-side knobs
  difficultyMod?: number;  // -2..+2 maps to advantage/disadvantage
  noiseFloor?: number;     // minimum noise emitted by options in this scene
  claimPressure?: number;  // 0..1 how strongly the Journal is asserting a claim
  // Option-specific tuning
  optionCostMult?: Partial<Record<TraitKey, number>>;
  optionRiskDelta?: number;
  optionSubtletyDelta?: number;
  successCap?: number;     // 0..1 ceiling for success chance (hostile scenes)
}

export interface IntentScore {
  chance: number;     // 0..1
  projectedCost: Partial<Record<TraitKey, number>>;
  narrativeTension: number; // 0..1 derived from risk vs resources
}

export function scoreIntent(kind: IntentKind, ctx: IntentContext): IntentScore {
  const def = INTENTS[kind];
  const v = def.vector;

  const pool = ctx.runState.resources;

  // Affinity score: vector.traits dot product with available pool saturation
  let affinity = 0;
  let demand = 0;
  for (const [k, w] of Object.entries(v.traits)) {
    const key = k as TraitKey;
    const have = clamp(pool[key] ?? 0, 0, Infinity);
    affinity += (have > 0 ? 1 : 0) * (w ?? 0);
    demand += w ?? 0;
  }
  const traitFitness = demand === 0 ? 0 : affinity / demand; // 0..1

  // Difficulty and claim pressure shape success
  const difficulty = (ctx.difficultyMod ?? 0); // -2..+2
  const claim = clamp(ctx.claimPressure ?? 0, 0, 1);

  // DEFY is penalized by claim, COMPLY is reinforced by claim
  const claimBias =
    kind === "DEFY" ? -0.35 * claim :
    kind === "COMPLY" ? +0.35 * claim : 0;

  // Base chance mixes fitness, risk, subtlety
  let baseChance =
    0.45 * traitFitness +
    0.25 * (1 - v.risk) +
    0.15 * (v.subtlety) +
    0.15; // floor for possibility

  baseChance += 0.1 * difficulty + claimBias;
  baseChance = clamp(baseChance, 0.05, 0.95);

  const successCap = ctx.successCap ?? 1;
  const chance = clamp(baseChance, 0, successCap);

  // Project costs: scale baseCost by option multipliers
  const projectedCost: Partial<Record<TraitKey, number>> = {};
  const mults = ctx.optionCostMult ?? {};
  const base = def.baseCost ?? {};
  for (const k of Object.keys(base) as TraitKey[]) {
    const m = mults[k] ?? 1;
    projectedCost[k] = Math.ceil((base[k] ?? 0) * m);
  }

  // Tension: how badly this strains resources relative to risk
  const tension = computeTension(projectedCost, v);

  return { chance, projectedCost, narrativeTension: tension };
}

function computeTension(
  costs: Partial<Record<TraitKey, number>>,
  v: IntentVector
): number {
  let spend = 0;
  for (const val of Object.values(costs)) spend += val ?? 0;
  const risk = v.risk;
  const subtlety = v.subtlety;
  // Crude but effective: more cost + more risk + less subtlety = more tension
  const raw = 0.5 * norm(spend, 0, 6) + 0.35 * risk + 0.15 * (1 - subtlety);
  return clamp(raw, 0, 1);
}

function norm(x: number, min: number, max: number) {
  return clamp((x - min) / Math.max(1, max - min), 0, 1);
}

export function resolveIntent(
  kind: IntentKind,
  ctx: IntentContext,
  rng: () => number = Math.random
): IntentOutcome {
  const def = INTENTS[kind];
  const score = scoreIntent(kind, ctx);
  const success = rng() < score.chance;

  // Apply cost scaling on success/failure
  const scale = success ? 1 : 0.5; // failure still spends something, but less
  const costs: Partial<Record<TraitKey, number>> = {};
  for (const [k, v] of Object.entries(score.projectedCost)) {
    costs[k as TraitKey] = Math.max(0, Math.floor((v ?? 0) * scale));
  }

  // Narrative deltas
  const marksDelta = def.signals?.favorsMarks?.map(m => ({...m})) ?? [];
  const dispositionsDelta = def.signals?.favorsDispositions?.map(d => ({...d})) ?? [];

  // Noise emission
  const noise =
    Math.max(ctx.noiseFloor ?? 0, (1 - (def.vector.subtlety ?? 0)) * (success ? 0.6 : 0.9));

  const outcome: IntentOutcome = {
    costs,
    marksDelta,
    dispositionsDelta,
    endEncounter: def.vector.resolveBias ? def.vector.resolveBias > 0.2 && success : false,
    revealIntelScore: kind === "RECON" ? (success ? 1 : 0.3) : 0,
    noise,
    succeeded: success,
    branchKey: success ? `${kind}_SUCCESS` : `${kind}_FAIL`
  };

  return outcome;
}
