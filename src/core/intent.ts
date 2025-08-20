
import type {
  Intent, Trait, Disposition, MarkId,
  RunState, Encounter, EncounterOption, Claim,
} from "./types";

// JSON module imports require `resolveJsonModule: true` in tsconfig.
import intentDefs from "../data/tables/intent_defs.js";
import dispWeights from "../data/tables/disposition_weights.js";
import markAff from "../data/tables/mark_affinities.js";
import claimBias from "../data/tables/claim_intent_bias.js";
import curves from "../data/tables/curves.js";

const σ = (x: number) => 1 / (1 + Math.exp(-x));
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

type IntentDef = { primary: Trait; secondary: Trait; baseTension: number; difficultyShift: number };

export interface Preview {
  chance: number;                  // 0..1
  projectedCosts: Record<string, number>;
  projectedTension: number;        // 0..100
}

function getDef(i: Intent): IntentDef {
  return (intentDefs as unknown as Record<string, IntentDef>)[i]!;
}
function dispositionWeight(i: Intent, d: Disposition): number {
  const row = (dispWeights as Record<string, Partial<Record<Disposition, number>>>)[i] ?? {};
  return row[d] ?? 0;
}
function markWeight(i: Intent, m: MarkId): number {
  const row = (markAff as Record<string, Partial<Record<MarkId, number>>>)[i] ?? {};
  return row[m] ?? 0;
}
function claimWeight(i: Intent, c: Claim): number {
  const row = (claimBias as Record<string, Partial<Record<Intent, number>>>)[c.id] ??
              (claimBias as Record<string, Partial<Record<Intent, number>>>).DEFAULT ?? {};
  return (row[i] ?? 0) * c.polarity;
}

export function previewOption(s: RunState, enc: Encounter, opt: EncounterOption): Preview {
  const def = getDef(opt.intent);

  const traitFit =
    (s.traits[def.primary] ?? 0) * 1.0 +
    (s.traits[def.secondary] ?? 0) * 0.5;

  const disp = Object.entries(s.dispositions).reduce((acc, [k, v]) =>
    acc + dispositionWeight(opt.intent, k as Disposition) * ((v ?? 0) / 100), 0);

  const markAffScore = s.marks.reduce((acc, m) => acc + markWeight(opt.intent, m.id) * m.tier, 0) * 3;

  const claimPush = claimWeight(opt.intent, s.claim) * (5 * s.claim.gravity);

  const tensionTax = (s.tension / 100) * 10;

  const baseDiff = (opt.baseDifficulty ?? 50) + def.difficultyShift;

  const score = traitFit + disp + markAffScore + claimPush - baseDiff - tensionTax;

  const k = curves.logisticK ?? 10;
  const chanceRaw = σ(score / k);
  const chance = clamp(chanceRaw, curves.chanceClamp?.min ?? 0.02, curves.chanceClamp?.max ?? 0.98);

  const projectedCosts: Record<string, number> = {};
  const slope = curves.costSlope ?? 1.0;
  Object.entries(opt.baseCosts ?? {}).forEach(([k2, v2]) => {
    projectedCosts[k2] = Math.ceil((v2 as number) * (1.0 + slope * (0.5 - chance)));
  });

  const tLow = curves.tensionOnPreview?.low ?? 6;
  const tHigh = curves.tensionOnPreview?.high ?? 3;
  const tConfront = curves.tensionOnPreview?.confrontBonus ?? 3;
  const projectedTension = clamp(
    s.tension + (chance < 0.5 ? tLow : tHigh) + (opt.intent === "CONFRONT" ? tConfront : 0) + (enc.tensionMod ?? 0) + (getDef(opt.intent).baseTension ?? 0),
    0, 100
  );

  return { chance, projectedCosts, projectedTension };
}