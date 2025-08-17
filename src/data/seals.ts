/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { SealDef, OriginChoice, Dispositions, EffectType, EffectContext } from '../core/types';
import { DISPOSITIONS } from '../core/ids';

export const sealData: SealDef[] = [
    {
        id: 'seal_shadow',
        title: 'The Shadow',
        description: 'Your past is a web of denial and deception.',
        condition: (choices, finalDispositions) => {
            const refuteCount = choices.filter(c => c.modifier.id === 'refute').length;
            return (finalDispositions[DISPOSITIONS.DECEPTIVE] || 0) >= 3 && refuteCount >= 1;
        },
        effects: [
            { type: EffectType.ADD_CARD_TO_DECK, params: ['GUILE_001'], context: EffectContext.ANY }
        ],
        narrativeSeed: "My past is a shadow I myself have cast."
    },
    {
        id: 'seal_unbreakable',
        title: 'The Unbreakable',
        description: 'You have faced your past head-on, altering the narrative to survive.',
        condition: (choices, finalDispositions) => {
            const alterCount = choices.filter(c => c.modifier.id === 'alter').length;
            return (finalDispositions[DISPOSITIONS.FORCEFUL] || 0) >= 2 && alterCount >= 2;
        },
        effects: [
            { type: EffectType.ADD_CARD_TO_DECK, params: ['TACTICS_001'], context: EffectContext.ANY },
            { type: EffectType.PLAYER_BONUS, params: ['MAX_HEALTH', '5'], context: EffectContext.ANY }
        ],
        narrativeSeed: "I am defined not by what happened, but by how I endured it."
    },
    {
        id: 'seal_judge',
        title: 'The Judge',
        description: 'You accepted the past, owning every part of it.',
        condition: (choices, finalDispositions) => {
            const acceptCount = choices.filter(c => c.modifier.id === 'accept').length;
            return (finalDispositions[DISPOSITIONS.HONORABLE] || 0) >= 2 && acceptCount >= 2;
        },
        effects: [
             { type: EffectType.ADD_CARD_TO_DECK, params: ['WIS_002'], context: EffectContext.ANY },
        ],
        narrativeSeed: "My past does not define me, for I have already passed judgement on it."
    },
    // Default/Fallback Seal
    {
        id: 'seal_initiate',
        title: 'The Initiate',
        description: 'Your journey is just beginning, your past a prologue.',
        condition: () => true, // Always matches if others don't
        effects: [
            { type: EffectType.ADD_CARD_TO_DECK, params: ['WIS_001'], context: EffectContext.ANY }
        ],
        narrativeSeed: "The journal is closed. A new page turns."
    }
];