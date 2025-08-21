import { Region } from "../../gen";

/**
 * Converts the travel cost from a procedurally generated region
 * into a format usable by the game's action or time system.
 * @param region The generated Region object.
 * @returns An object with `minutes` and `fatigue` costs.
 */
export function toActionCost(region: Region) {
  return { minutes: region.travelCost.time, fatigue: region.travelCost.fatigue };
}
