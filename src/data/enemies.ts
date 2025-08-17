/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { EnemyDef, Discipline } from '../core/types';

export const enemyData: EnemyDef[] = [
    {
        id: "GUARD_01",
        name: "Guard",
        maxHealth: 15,
        discipline: Discipline.AGGRESSION,
        actions: [
            { type: 'ATTACK', value: 6 }
        ]
    },
    {
        id: "OUTLAW_01",
        name: "Outlaw",
        maxHealth: 22,
        discipline: Discipline.CUNNING,
        actions: [
            { type: 'ATTACK', value: 4 },
            { type: 'ATTACK', value: 4 }
        ]
    },
    {
        id: "BOSS_01",
        name: "Faction Captain",
        maxHealth: 80,
        discipline: Discipline.TACTICS,
        actions: [
            { type: 'ATTACK', value: 10 },
            { type: 'DEBUFF' },
            { type: 'ATTACK', value: 15 }
        ]
    }
];