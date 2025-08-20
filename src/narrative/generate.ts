import { ENCOUNTER_LINES, THOUGHTS } from "./pools";
import { PCState, WorldCtx } from "../core/types";
import { pickEncounterLine, pickThought } from "./select";

export function generateNarrative(pc: PCState, w: WorldCtx) {
  const line = pickEncounterLine(ENCOUNTER_LINES, pc, w);
  const thought = pickThought(THOUGHTS, pc, w);
  return `${line} [${thought}]`;
}
