/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { PlayerState, MarkId, DispositionId } from "../core/types";
import { getMarkById } from "./DataLoader";

const clampDisposition = (value: number) => Math.max(-5, Math.min(5, value));

/**
 * Provides centralized, safe methods for mutating a player's identity (Marks and Dispositions).
 * This ensures that rules like clamping and stacking are consistently applied.
 */

export const marks = {
  /**
   * Adds a stack to a given Mark, handling initialization and severity updates.
   * @param p The PlayerState to modify (mutated directly).
   * @param id The ID of the Mark to add.
   * @param delta The number of stacks to add (default: 1).
   */
  addStack(p: PlayerState, id: MarkId, delta = 1) {
    const markDef = getMarkById(id);
    if (!markDef) {
        console.warn(`Attempted to add unknown mark: ${id}`);
        return;
    }

    const current = p.marks[id];
    if (current) {
        const newStacks = Math.min(current.stacks + delta, markDef.maxStacks);
        current.stacks = newStacks;
        // For now, severity mirrors stacks. A more complex system could evaluate context.
        current.severity = Math.min(newStacks, markDef.gradeLabels.length);
        current.last_updated_ts = Date.now();
    } else {
        p.marks[id] = {
            stacks: 1,
            severity: 1,
            first_seen_ts: Date.now(),
            last_updated_ts: Date.now(),
        };
    }
  },
};

export const disp = {
  /**
   * Bumps a disposition value, ensuring it stays within the allowed bounds.
   * @param p The PlayerState to modify (mutated directly).
   * @param id The ID of the Disposition to change.
   * @param delta The amount to add (can be negative).
   */
  bump(p: PlayerState, id: DispositionId, delta: number) {
    const v = p.dispositions[id] ?? 0;
    p.dispositions[id] = clampDisposition(v + delta);
  },
};
