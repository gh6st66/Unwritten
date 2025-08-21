import { generateNPC, WorldContext } from "../gen";

export function buildNPCs(ctx: WorldContext, count: number) {
  return Array.from({ length: count }, (_, i) => generateNPC(ctx, i));
}
