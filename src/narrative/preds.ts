import { NarrativeMark, NarrativeDisposition, NarrativeEchoTag, PCState, WorldCtx } from "../core/types";
import { PredicateInput } from "./templates";

export const hasMark = (m: NarrativeMark, atLeast = 1) =>
  ({ pc }: PredicateInput) => (pc.marks[m] ?? 0) >= atLeast;

export const topMark = (m: NarrativeMark) =>
  ({ pc }: PredicateInput) => {
    const entries = Object.entries(pc.marks) as [NarrativeMark, number][];
    if (!entries.length) return false;
    const max = Math.max(...entries.map(([, v]) => v));
    return (pc.marks[m] ?? 0) === max && max > 0;
  };

export const dispGte = (d: NarrativeDisposition, v: number) =>
  ({ pc }: PredicateInput) => (pc.disp[d] ?? 0) >= v;

export const echoHas = (e: NarrativeEchoTag) =>
  ({ pc }: PredicateInput) => pc.echoes.includes(e);

export const roleIs = (r: WorldCtx["npcRole"]) =>
  ({ w }: PredicateInput) => w.npcRole === r;

export const recogIs = (r: WorldCtx["recognition"]) =>
  ({ w }: PredicateInput) => w.recognition === r;

export const tensionAtLeast = (t: number) =>
  ({ w }: PredicateInput) => w.tension >= t;
