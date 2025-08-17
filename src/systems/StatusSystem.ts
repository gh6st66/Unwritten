/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { PlayerState, EnemyInstance, StatusEffect, StatusType } from '../core/types';

type Target = PlayerState | EnemyInstance;

/**
 * Applies a status effect to a target, either adding it or refreshing/stacking its duration.
 * @param target The player or enemy to apply the status to.
 * @param type The type of status to apply.
 * @param duration The number of turns the status should last.
 * @returns The updated target with the new status effect.
 */
export function applyStatus(target: PlayerState, type: StatusType, duration: number): PlayerState;
export function applyStatus(target: EnemyInstance, type: StatusType, duration: number): EnemyInstance;
export function applyStatus(target: Target, type: StatusType, duration: number): Target {
    const newStatusEffects = [...target.statusEffects];
    const existingStatusIndex = newStatusEffects.findIndex(s => s.type === type);

    if (existingStatusIndex > -1) {
        // Refresh or stack duration
        newStatusEffects[existingStatusIndex] = {
            ...newStatusEffects[existingStatusIndex],
            duration: newStatusEffects[existingStatusIndex].duration + duration
        };
    } else {
        // Add new status
        newStatusEffects.push({ type, duration });
    }
    return { ...target, statusEffects: newStatusEffects };
};

/**
 * Processes all end-of-turn effects for a target, primarily ticking down status durations.
 * @param target The player or enemy to process.
 * @returns The updated target after effects are processed.
 */
export function processTurnEndEffects(target: PlayerState): PlayerState;
export function processTurnEndEffects(target: EnemyInstance): EnemyInstance;
export function processTurnEndEffects(target: Target): Target {
    if (!target.statusEffects || target.statusEffects.length === 0) {
        return target;
    }

    const updatedEffects = target.statusEffects
        .map(s => ({ ...s, duration: s.duration - 1 }))
        .filter(s => s.duration > 0);
    
    return { ...target, statusEffects: updatedEffects };
};

/**
 * Gets the value of a specific status effect on a target. For now, this returns the duration.
 * @param target The target to check.
 * @param type The status type to look for.
 * @returns The duration of the status, or 0 if not present.
 */
export const getStatusValue = (target: Target, type: StatusType): number => {
    const status = target.statusEffects.find(s => s.type === type);
    return status ? status.duration : 0;
}