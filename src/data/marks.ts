import { MarkDef } from "../core/types";

export const MARK_DEFS: Record<string, MarkDef> = {
  OATHBREAKER: {
    id: "OATHBREAKER",
    name: "Oathbreaker",
    polarity: "negative",
    opposite: "LOYALIST",
    maxIntensity: 3,
    decayRatePerRun: 1,
  },
  LOYALIST: {
    id: "LOYALIST",
    name: "Loyalist",
    polarity: "positive",
    opposite: "OATHBREAKER",
    maxIntensity: 3,
    decayRatePerRun: 1,
  },
  ABANDONER: {
    id: "ABANDONER",
    name: "Abandoner",
    polarity: "negative",
    maxIntensity: 3,
    decayRatePerRun: 1,
  },
};