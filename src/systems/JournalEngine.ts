import { RunState, ClaimId, MarkId } from "../core/types";
import { applyMark } from "./Marks";

export function journalAccept(s: RunState, claimId: ClaimId): RunState {
  // Cement claim into a Mark
  const nextMarks = applyMark(s.identity.marks, claimId as MarkId, s.identity.generationIndex);

  const nextIdentity = {
    ...s.identity,
    marks: nextMarks,
    activeClaims: Object.fromEntries(Object.entries(s.identity.activeClaims).filter(([id]) => id !== claimId)),
  };
  
  return { ...s, identity: nextIdentity };
}

export function journalResist(s: RunState, claimId: ClaimId): RunState {
  // Resisting weakens an existing mark of the same type
  const nextMarks = applyMark(s.identity.marks, claimId as MarkId, s.identity.generationIndex, -1);
  
  return {
    ...s,
    identity: {
      ...s.identity,
      marks: nextMarks,
      activeClaims: Object.fromEntries(Object.entries(s.identity.activeClaims).filter(([id]) => id !== claimId)),
    },
  };
}
