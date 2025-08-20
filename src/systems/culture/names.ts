import { mulberry32, hash3 } from "./rng";

function tc(s:string){ return s.replace(/\b\w/g, c => c.toUpperCase()); }

export function regionalEpithet(worldSeed:number,x:number,y:number,era:number){
  const rng = mulberry32(hash3(worldSeed,x,y)^era);
  const starts = ["Reed","Tide","Ash","Ledger","Garrison","Moon","Spore","Ruin","Forge","Knot","River","Veil","Star","Mask"];
  const ends   = ["-ward","-reach","-court","-gate","-step","-mouth","-fold","-rise","-march","-bight"];
  const pick = (a:string[])=> a[Math.floor(rng()*a.length)];
  return pick(starts)+pick(ends);
}

export function nicknameFromDrivers(rng:()=>number, drivers:string[]): string {
  const a = ["Guild","Temple","Ash","Tide","Oath","Vigil","Quenched","Garrison","Reed","Porcelain","Fang","Moon","Spore","Ledger","Carnival","Icon"];
  const b = ["Whorl","Grid","Veil","Mirror","Stitch","Mark","Sun","River","Knot","Star","Shard","Echo"];
  const c = ["Mask","Face","Visor","Veil","Headdress"];
  const pick = <T>(arr:T[])=> arr[Math.floor(rng()*arr.length)];
  const driver = drivers.length > 0 ? drivers[Math.floor(rng() * drivers.length)] : pick(a);
  return `${tc(driver)} ${pick(b)} ${pick(c)}`;
}
