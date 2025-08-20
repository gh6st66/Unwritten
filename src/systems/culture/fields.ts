import { RegionCtx, WorldFields, CulturalAxes } from "./types";
import { noise2 } from "./rng";

export function computeFields(ctx: RegionCtx): WorldFields {
  const s = ctx.worldSeed;
  const scale = 0.08; // coarse structures
  const nx = ctx.x*scale, ny = ctx.y*scale, e = ctx.era*0.13;

  return {
    water: noise2(s^11, nx+e, ny) * 0.9,
    metal: noise2(s^22, nx, ny+e),
    clay: noise2(s^33, nx-0.7, ny+0.2),
    wood: noise2(s^44, nx+0.3, ny-0.5),
    fungus: noise2(s^55, nx*1.1, ny*1.1),
    cold: noise2(s^66, nx-0.9, ny-0.9),
    dust: noise2(s^77, nx+0.9, ny-0.4),
    tide: noise2(s^88, nx+1.5, ny+1.5),
  };
}

export function computeAxes(ctx: RegionCtx): CulturalAxes {
  const s = ctx.worldSeed, nx = ctx.x*0.05, ny = ctx.y*0.05, t = ctx.era*0.07;
  const base = (off:number)=> noise2(s^off, nx+off*0.01+t, ny-off*0.01+t);
  return {
    centralization: base(101),
    piety:          base(202),
    militarization: base(303),
    openness:       base(404),
    prosperity:     base(505),
    plaguePressure: base(606),
    iconoclasm:     base(707),
  };
}
