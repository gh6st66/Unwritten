/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GameEventV1, PlayerState, ShakeImpulse } from '../core/types';
import { feel } from '../config/feel';

/**
 * Calculates a shake impulse's amplitude based on damage relative to max HP.
 * This ensures heavy hits feel impactful, while chip damage is ignored.
 */
function impulseFromDamage(dmg: number, maxHp: number, dir: { x: number; y: number }): ShakeImpulse | null {
    const ratio = Math.max(0, Math.min(1, dmg / Math.max(1, maxHp)));
    // Using a power curve to make the shake feel more impactful at higher damage percentages
    const amp = Math.min(feel.shake.damage.maxPx, feel.shake.damage.baseAmp * Math.pow(ratio, feel.shake.damage.damageScalePower));
  
    // Ignore trivial shakes
    if (amp < feel.shake.minPx) return null;
  
    return { amp, freq: feel.shake.damage.freqHz, duration: feel.shake.damage.durationMs, bias: dir };
}

/**
 * Acts as a centralized adapter, converting game events into shake impulses.
 * This is the single source of truth for "what causes the screen to shake".
 * @param event The game event to process.
 * @param playerState The current player state, needed for context like max HP.
 * @returns A ShakeImpulse object or null if the event doesn't cause a shake.
 */
export function impulseFromEvent(event: GameEventV1, playerState?: PlayerState | null): ShakeImpulse | null {
    switch (event.type) {
        case 'DAMAGE':
            // Only shake if the player is the target
            if (event.payload.targetId === 'PLAYER' && playerState) {
                return impulseFromDamage(event.payload.amount, playerState.maxHealth, { x: 0, y: 1 });
            }
            return null;

        case 'BLOCK_SHATTER':
            // A smaller, sharper shake for block breaks, scaled by amount
            const amp = Math.min(feel.shake.blockBreak.maxAmp, feel.shake.blockBreak.minAmp + event.payload.amount * feel.shake.blockBreak.ampScale);
            return { amp, freq: feel.shake.blockBreak.freqHz, duration: feel.shake.blockBreak.durationMs, bias: event.payload.direction };
        
        // Future: Add shakes for other events, like applying STUN
        // case 'STATUS_APPLY':
        //     if (event.payload.statusType === 'STUN') {
        //         return { amp: 6, freq: 22, duration: 110, bias: {x:0, y:0} };
        //     }
        //     return null;

        default:
            return null;
    }
}

/**
 * Centralized logic for determining if and for how long an event should trigger a hit-stop.
 * @param event The game event.
 * @param playerState The current player state.
 * @returns Duration in ms for the hit-stop, or 0 if none.
 */
export function hitStopFromEvent(event: GameEventV1, playerState?: PlayerState | null): number {
    switch (event.type) {
        case 'DAMAGE':
            if (event.payload.targetId === 'PLAYER' && playerState) {
                const ratio = event.payload.amount / playerState.maxHealth;
                if (ratio > 0.1) return feel.hitStop.heavyHitMs; // "Heavy" hit
            }
            return 0;
        
        case 'BLOCK_SHATTER':
            return feel.hitStop.blockBreakMs;

        default:
            return 0;
    }
}
