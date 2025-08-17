/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// Centralized tuning knobs for "game feel".
// All magic numbers related to VFX, timings, and shake should live here.

export const feel = {
  hitStop: {
    blockBreakMs: 70,
    heavyHitMs: 80,
    maxStackMs: 120,
  },
  shake: {
    // General
    minPx: 2, // Shakes with amplitude below this will be ignored
    
    // Damage Shake
    damage: {
        baseAmp: 10,
        maxPx: 18,
        freqHz: 28,
        durationMs: 140,
        damageScalePower: 0.6, // Power curve for scaling damage to amplitude
    },
    // Block Shatter Shake
    blockBreak: {
        minAmp: 2,
        maxAmp: 8,
        ampScale: 0.2, // per point of block
        freqHz: 30,
        durationMs: 120,
    }
  },
  motion: {
    reducedScale: 0.5, // How much to scale down effects for reduced motion
  },
};
