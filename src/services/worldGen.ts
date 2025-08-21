import { generateRegion, WorldContext } from "../gen";

export function buildRegions(ctx: WorldContext, count: number) {
  const regions = Array.from({ length: count }, (_, i) => generateRegion(ctx, i));
  // neighbor stitching can be done later; leave neighbors = []
  return regions;
}
