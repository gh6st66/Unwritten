/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { Discipline } from '../core/types';

const ADVANTAGE_MAP: { [key in Discipline]?: Discipline } = {
    [Discipline.AGGRESSION]: Discipline.CUNNING,
    [Discipline.CUNNING]: Discipline.WISDOM,
    [Discipline.WISDOM]: Discipline.AGGRESSION,
};

const ADVANTAGE_MULTIPLIER = 1.5;
const DISADVANTAGE_MULTIPLIER = 0.75;
const NEUTRAL_MULTIPLIER = 1.0;

/**
 * Calculates the damage multiplier based on the attacker's and defender's disciplines.
 * @param attacker The discipline of the attacker.
 * @param defender The discipline of the defender.
 * @returns A damage multiplier (e.g., 1.5 for advantage, 0.75 for disadvantage).
 */
export const computeMultiplier = (attacker: Discipline, defender: Discipline): number => {
    if (attacker === Discipline.NONE || defender === Discipline.NONE) {
        return NEUTRAL_MULTIPLIER;
    }
    if (ADVANTAGE_MAP[attacker] === defender) {
        return ADVANTAGE_MULTIPLIER;
    }
    if (ADVANTAGE_MAP[defender] === attacker) {
        return DISADVANTAGE_MULTIPLIER;
    }
    return NEUTRAL_MULTIPLIER;
};
