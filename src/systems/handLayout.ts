/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
export type FanTransform = {
  x: number;           // px
  y: number;           // px
  r: number;           // deg
  z: number;           // z-index
  scale: number;       // 0..1
  focus?: boolean;     // center emphasis
};

export type FanOptions = {
  containerWidth: number;       // px
  cardWidth: number;            // px
  cardHeight: number;           // px
  maxSpreadDeg?: number;        // total arc degrees
  maxHorizontalSpread?: number; // px
  lift?: number;                // px raise for center
  overlap?: number;             // px horizontal overlap
};

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/**
 * Deterministic fan layout that:
 * - Does not depend on DOM flow (no flexbox jitter)
 * - Uses transform only; no width/height changes per frame
 * - Centers the hand; overlaps cards with controlled z-index
 */
export function computeFanLayout(count: number, opts: FanOptions): FanTransform[] {
  const {
    containerWidth,
    cardWidth,
    maxSpreadDeg = 24,
    maxHorizontalSpread = Math.min(containerWidth * 0.9, 560),
    lift = 16,
    overlap = 48,
  } = opts;

  if (count <= 0) return [];

  const totalWidthTarget = Math.min(maxHorizontalSpread, containerWidth * 0.95);
  const availableSpaceForGaps = Math.max(totalWidthTarget - cardWidth, 0);

  // The gap is the distance between the left edges of adjacent cards.
  // We want a gap of (cardWidth - overlap), but it must shrink if there are too many cards.
  const desiredGap = cardWidth - overlap;
  const gapToFit = count > 1 ? availableSpaceForGaps / (count - 1) : 0;

  const gap = count > 1 ? Math.min(desiredGap, gapToFit) : 0;
  
  const actualHandWidth = cardWidth + gap * (count - 1);
  const startX = (containerWidth - actualHandWidth) / 2;

  const transforms: FanTransform[] = [];
  const mid = (count - 1) / 2;
  const degStep = count > 1 ? maxSpreadDeg / (count - 1) : 0;

  for (let i = 0; i < count; i++) {
    const t = i - mid; // -mid to +mid
    const x = startX + i * gap;
    // Slight vertical lift for center cards to give arc
    const y = -Math.abs(t) * (lift / (mid + 0.5));
    const r = t * degStep;
    const scale = 1 - Math.abs(t) * 0.03;
    // Ensure center draws topmost
    const z = 100 - Math.abs(Math.round(t));

    transforms.push({
      x: Math.round(x),
      y: Math.round(y),
      r: Math.round(r * 10) / 10,
      z,
      scale: clamp(scale, 0.9, 1),
      focus: i === Math.round(mid),
    });
  }

  return transforms;
}