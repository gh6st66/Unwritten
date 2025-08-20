import { NewRunSeed, RunOutcome, MarkState, RunState } from "../core/types";
import { loadLegacy, saveRunOutcome } from "./Persistence";
import { decayMarks } from "./Marks";

export interface CollapseTrigger {
  reason: RunOutcome["reason"];
  summaryLog: string[];
}

export function computeNewRunSeed(currentRunIndex: number, decayFloor = 0): NewRunSeed {
  const legacy = loadLegacy();
  const inherited: MarkState[] = legacy
    ? decayMarks(legacy.carriedMarks, currentRunIndex, decayFloor)
    : [];
  return {
    runIndex: currentRunIndex,
    startingMarks: inherited
  };
}

// Call this exactly once when run ends
export function collapseRun(
  finalState: RunState,
  trigger: CollapseTrigger
): RunOutcome {
  const outcome: RunOutcome = {
    reason: trigger.reason,
    summaryLog: trigger.summaryLog,
    finalMarks: finalState.identity.marks,
    runIndex: finalState.identity.generationIndex,
  };
  saveRunOutcome(outcome);
  return outcome;
}