import { Weighted } from "./types";

export function wPick<T>(rng:()=>number, pool:Weighted<T>[]): T {
  if (pool.length === 0) return "" as T;
  const total = pool.reduce((s,p)=>s+p.w,0);
  if (total <= 0) return pool[Math.floor(rng() * pool.length)].value;
  let r = rng()*total;
  for (const p of pool) { r -= p.w; if (r <= 0) return p.value; }
  return pool[pool.length-1].value;
}

export function wAdd<T>(pool:Weighted<T>[], inc:number, pred:(v:T)=>boolean): Weighted<T>[]{
  return pool.map(p=> pred(p.value) ? { ...p, w: Math.max(0, p.w+inc)} : p);
}

export function wMerge<T>(a:Weighted<T>[], b:Weighted<T>[], biasA=1, biasB=1): Weighted<T>[]{
  const map = new Map<string,Weighted<T>>();
  function key(v:T){ return String(v); }
  for (const p of a) map.set(key(p.value), { value:p.value, w:p.w*biasA });
  for (const p of b) {
    const k = key(p.value), cur = map.get(k);
    if (cur) cur.w += p.w*biasB; else map.set(k, { value:p.value, w:p.w*biasB });
  }
  return [...map.values()];
}
