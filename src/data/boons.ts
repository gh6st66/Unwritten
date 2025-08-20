import { BoonDef, BoonId, RunState } from "../core/types";

export const BOONS: BoonDef[] = [
  {
    id: "boon:quiet_passage" as BoonId,
    label: "A Quiet Passage",
    description: "You've learned to tread lightly. Start with lower notoriety in your starting region.",
    cost: 10,
    rarity: "common",
    applyEffect: (s: RunState): RunState => {
      const regionId = s.locationId.split(":")[0];
      if (s.regions[regionId]) {
        s.regions[regionId].notoriety -= 20;
      }
      return s;
    },
  },
  {
    id: "boon:well_stocked" as BoonId,
    label: "Well Stocked",
    description: "A fortunate find before setting out. Start with +5 max Energy, +2 max Clarity, and +2 max Will.",
    cost: 15,
    rarity: "common",
    applyEffect: (s: RunState): RunState => {
      s.resources.maxEnergy += 5;
      s.resources.energy = s.resources.maxEnergy;
      s.resources.maxClarity += 2;
      s.resources.clarity = s.resources.maxClarity;
      s.resources.maxWill += 2;
      s.resources.will = s.resources.maxWill;
      return s;
    },
  },
  {
    id: "boon:resilient_spirit" as BoonId,
    label: "Resilient Spirit",
    description: "The echoes of the past are quieter. Inherited Marks are less potent at the start of your run.",
    cost: 25,
    rarity: "rare",
    applyEffect: (s: RunState): RunState => {
      // Reduce the tier of all inherited marks by 1, making them less potent.
      s.marks = s.marks
        .map(mark => ({ ...mark, tier: mark.tier - Math.sign(mark.tier) }))
        .filter(mark => mark.tier !== 0);
      return s;
    }
  }
];