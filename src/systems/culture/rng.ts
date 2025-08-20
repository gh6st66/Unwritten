// Mulberry32 + hash for tiny deterministic RNG
export function mulberry32(a: number) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function hash3(a:number,b:number,c:number){ // simple int hash
  let h = 2166136261 ^ a; h = Math.imul(h,16777619);
  h ^= b; h = Math.imul(h,16777619);
  h ^= c; h = Math.imul(h,16777619);
  return h >>> 0;
}

// Value noise (cheap, tile-safe-ish when hashed)
export function noise2(seed:number, x:number, y:number){
  const xi = Math.floor(x), yi = Math.floor(y);
  const tx = x - xi, ty = y - yi;
  function n(ix:number, iy:number){
    const h = hash3(seed, ix, iy);
    return (h % 10000) / 10000; // 0..1
  }
  const a = n(xi,yi), b = n(xi+1,yi), c = n(xi,yi+1), d = n(xi+1,yi+1);
  const sx = tx*tx*(3-2*tx), sy = ty*ty*(3-2*ty);
  const u = a + (b-a)*sx;
  const v = c + (d-c)*sx;
  return u + (v-u)*sy; // 0..1
}
