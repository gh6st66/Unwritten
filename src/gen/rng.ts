// Small seedable RNG (Mulberry32). Deterministic per seed string.

export function hashString(s: string): number {
  let h = 1779033703 ^ s.length;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return (h >>> 0) || 0x9e3779b9;
}

export function makeRNG(seed: string) {
  let t = hashString(seed);
  const next = () => {
    t += 0x6D2B79F5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), 1 | x);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
  const int = (min: number, max: number) =>
    Math.floor(next() * (max - min + 1)) + min;

  const pick = <T,>(arr: readonly T[]) => arr[int(0, arr.length - 1)];

  const weightPick = <T,>(items: readonly { item: T; w: number }[]) => {
    const total = items.reduce((a, b) => a + b.w, 0);
    if (total <= 0) return items[Math.floor(next() * items.length)].item;
    let r = next() * total;
    for (const it of items) {
      if ((r -= it.w) <= 0) return it.item;
    }
    return items[items.length - 1].item;
  };

  const shuffle = <T,>(arr: readonly T[]) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = int(0, i);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  return { next, int, pick, weightPick, shuffle };
}

export type RNG = ReturnType<typeof makeRNG>;
