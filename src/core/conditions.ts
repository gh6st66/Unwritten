/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { PlayerState, OptionCondition, OptionConditionFn, MarkSeverityGrade } from "./types";
import { getMarkById } from "../systems/DataLoader";

// This helper ensures that our switch statement is exhaustive. If a new type is
// added to the OptionCondition union and not handled in the switch, TypeScript
// will throw a compile-time error.
function assertNever(x: never): never {
  throw new Error(`Unreachable case: ${JSON.stringify(x)}`);
}

// A helper to compare severity grades based on their definition order in the MarkDef
function isSeverityGte(currentGrade: string, requiredGrade: string, allGrades: string[]): boolean {
    const currentIndex = allGrades.indexOf(currentGrade);
    const requiredIndex = allGrades.indexOf(requiredGrade);
    if (currentIndex === -1 || requiredIndex === -1) return false;
    return currentIndex >= requiredIndex;
}

/**
 * Resolves whether an event option's condition is met by the current player state.
 * Supports a declarative, type-safe condition structure.
 * @param cond The condition to check (can be an object, a function, or undefined).
 * @param p The current PlayerState.
 * @returns `true` if the condition is met, otherwise `false`.
 */
export function checkCondition(cond: OptionCondition | OptionConditionFn | undefined, p: PlayerState): boolean {
  if (!cond) return true; // No condition means the option is always available.
  if (typeof cond === "function") return cond(p);

  switch (cond.type) {
    case "HasMark": {
      const markInstance = p.marks[cond.mark];
      if (!markInstance) return false;

      const stacksOk = cond.minStacks == null || markInstance.stacks >= cond.minStacks;
      if (!stacksOk) return false;

      if (cond.minSeverityGrade) {
        const markDef = getMarkById(cond.mark);
        if (!markDef) return false; // Mark definition not found
        const currentGrade = markDef.gradeLabels[markInstance.severity - 1];
        if (!currentGrade) return false; // Player's severity is out of bounds
        return isSeverityGte(currentGrade, cond.minSeverityGrade, markDef.gradeLabels);
      }
      
      return true;
    }
    case "NotMark":
      return !p.marks[cond.mark];
    case "DispositionAtLeast":
      return (p.dispositions[cond.id] ?? 0) >= cond.value;
    case "Any":
      return cond.of.some(c => checkCondition(c, p));
    case "All":
      return cond.of.every(c => checkCondition(c, p));
    case "None":
      return !cond.of.some(c => checkCondition(c, p));
    default:
        // This will cause a TypeScript error if a case is missed.
        return assertNever(cond);
  }
}
