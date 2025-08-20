import { ConditionFn, MarkId } from "./types";

export const hasMark = (markId: MarkId): ConditionFn => (s) => {
  return s.identity.marks.some(m => m.id === markId);
};

export const hasScar = (scar: string): ConditionFn => (s) => {
  return s.world.scars.includes(scar);
};

export const notHasScar = (scar: string): ConditionFn => (s) => {
  return !s.world.scars.includes(scar);
};