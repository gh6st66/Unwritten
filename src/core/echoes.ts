
import { RunState, EchoSeed } from "./types";

export function scoreEchoes(s: RunState): EchoSeed[] {
  // Simple example: tiered marks and unique outcomes push weights
  const seeds = s.marks
    .filter(m => Math.abs(m.tier) >= 2)
    .map<EchoSeed>(m => ({ tag: "RUMOR", weight: 10 + 5 * Math.abs(m.tier), payload: { mark: m.id }}));
  // In a real implementation, outcomes from encounters would also push seeds here.
  return seeds;
}

export function selectEchoesForNextRun(bank: EchoSeed[], rng: () => number, max=3): EchoSeed[] {
  // Weighted random without replacement
  const picked: EchoSeed[] = [];
  const pool = [...bank];
  for (let k=0; k<max && pool.length; k++) {
    const sum = pool.reduce((a, e) => a + e.weight, 0);
    if (sum <= 0) break;
    let r = rng() * sum;
    const i = pool.findIndex(e => (r -= e.weight) < 0);
    const selectionIndex = i < 0 ? 0 : i;
    picked.push(pool[selectionIndex]);
    pool.splice(selectionIndex, 1);
  }
  return picked;
}
