/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { feel } from '../config/feel';

let stopUntil = 0;
let isReducedMotion = false;

if (typeof window !== 'undefined') {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    isReducedMotion = mq.matches;
    mq.addEventListener("change", () => {
        isReducedMotion = mq.matches;
    });
}

/**
 * A global object to manage animation time scaling.
 * This allows freezing presentation while simulation continues.
 */
export const time = {
  animScale: 1,
  setAnimScale(x: number) { this.animScale = Math.max(0, x); },
  now: () => performance.now(),
};

/**
 * A robust, stackable hit-stop function. New calls extend the stop duration
 * up to a maximum, preventing overlapping timeouts.
 * @param ms The duration to pause animations.
 * @param maxMs The maximum duration the pause can be extended to.
 */
export function microHitStop(ms = feel.hitStop.blockBreakMs, maxMs = feel.hitStop.maxStackMs) {
    if (isReducedMotion) {
        ms *= feel.motion.reducedScale; // Halve duration if reduced motion is enabled
    }
    const now = time.now();
    // The new stop time is the later of:
    // 1. The end time of this new stop request.
    // 2. The *current* stop time, extended by a clamped amount.
    stopUntil = Math.min(now + maxMs, Math.max(stopUntil, now) + ms);
}

/**
 * This function should be called once per frame in the main game loop.
 * It checks if a hit-stop is active and sets the animation scale accordingly.
 */
export function applyHitStop() {
  const now = time.now();
  time.setAnimScale(now < stopUntil ? 0 : 1);
}
