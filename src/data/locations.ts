import { LocationDef, LocationId } from "../core/types";

export const LOCATIONS: Record<LocationId, LocationDef> = {
  "ashvale:gate": {
    id: "ashvale:gate",
    name: "Gate of Ashvale",
    description: "The main gate of the town, bustling with guards and merchants.",
    connections: [
      { to: "ashvale:market", label: "Enter the market", timeCost: { amount: 1, unit: "hours" }, willCost: 0 },
      { to: "ashvale:wilds", label: "Venture into the wilds", timeCost: { amount: 4, unit: "hours" }, willCost: 1 },
    ],
  },
  "ashvale:market": {
    id: "ashvale:market",
    name: "Ashvale Market",
    description: "A sprawling market, filled with stalls and shadowed alleys.",
    connections: [
      { to: "ashvale:gate", label: "Return to the gate", timeCost: { amount: 1, unit: "hours" }, willCost: 0 },
    ],
  },
  "ashvale:wilds": {
    id: "ashvale:wilds",
    name: "The Ashvale Wilds",
    description: "Untamed forests and hills surrounding the town.",
    connections: [
      { to: "ashvale:gate", label: "Return to Ashvale", timeCost: { amount: 4, unit: "hours" }, willCost: 1 },
    ],
  },
};