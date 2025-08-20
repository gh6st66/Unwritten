import { RunState, MarkId, ConditionFn } from "./types";

export const hasMark = (markId: MarkId): ConditionFn => (s) => {
  return s.marks.some(m => m.id === markId);
};

export const hasScar = (scar: string): ConditionFn => (s) => {
  return s.scars.includes(scar);
};

export const notHasScar = (scar: string): ConditionFn => (s) => {
  return !s.scars.includes(scar);
};