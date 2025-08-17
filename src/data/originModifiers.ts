/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { OriginModifierDef, EffectType, EffectContext } from '../core/types';
import { MARKS, DISPOSITIONS } from '../core/ids';

export const originModifiers: OriginModifierDef[] = [
    {
        id: 'accept',
        label: 'Accept',
        description: 'Accept this memory as truth, for good or ill.',
        dispositionAdjustments: { [DISPOSITIONS.HONORABLE]: 1 },
        narrativeSeedAppend: "I cannot deny what happened."
    },
    {
        id: 'refute',
        label: 'Refute',
        description: 'Deny this telling of events. The truth is something else.',
        dispositionAdjustments: { [DISPOSITIONS.DECEPTIVE]: 1, [DISPOSITIONS.FORCEFUL]: 1 },
        effects: [{ type: EffectType.ADD_CARD_TO_DECK, params: ['CUN_001'], context: EffectContext.ANY }],
        narrativeSeedAppend: "It was a lie, spun by my enemies."
    },
    {
        id: 'alter',
        label: 'Alter',
        description: 'Twist the memory. The core is true, but the details are yours to shape.',
        dispositionAdjustments: { [DISPOSITIONS.DECEPTIVE]: 1, [DISPOSITIONS.FORCEFUL]: 1 },
        effects: [{ type: EffectType.PLAYER_BONUS, params: ['MAX_HEALTH', '5'], context: EffectContext.ANY }],
        narrativeSeedAppend: "The truth is a matter of perspective."
    }
];