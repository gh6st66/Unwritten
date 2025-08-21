/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { ForgeTemplate } from '../systems/maskforging/types';

export const TideGateForge: ForgeTemplate = {
  id: "forge_tide_gate",
  name: "Drowned Ruins of the Tide Gate",
  type: "ruin",
  location: {
    regionSeed: "coastal",
    description: "A half-submerged temple where tides gnaw at salt-stained idols.",
    visuals: ["water", "salt", "ruins", "floodlight"]
  },
  entryFlavor: "The sea breathes through these halls. Salt gathers in your mouth as the dream bends.",
  dreamOverlay: "Fragments float as if underwater, drifting slow and heavy.",
  wordModifiers: {
    ASH: {
      name: "Salt Ash",
      visual: "Bone-white mask streaked with salt crust.",
      effect: "Erosive damage-over-time replaces burst fire damage.",
      flavor: "You inscribe ASH, but the tide claims it, eroding it into Salt Ash."
    },
    BLADE: {
      name: "Tide Blade",
      visual: "Wavy patterns ripple across sharpened edges.",
      effect: "First strike repeats twice at weaker strength.",
      flavor: "The tide sharpens your blade, cutting once, then again, then again."
    }
  },
  defaultTwist: {
    name: "Tide-Worn Word",
    visual: "Mask etched with brine and waterlines.",
    effect: "Adds instability: effects fluctuate in strength.",
    flavor: "The sea will not let words remain whole."
  }
};

export const FORGES_DATA: ForgeTemplate[] = [TideGateForge];
