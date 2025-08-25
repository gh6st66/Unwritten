import { Claim } from "../game/types";

export const CLAIMS_DATA: Claim[] = [
  {
    id: "betray",
    text: "You will betray an ally.",
    severity: 2,
    embrace: { label: "Embrace this path", description: "Accept the necessity of sacrifice." },
    resist: { label: "Resist this fate", description: "Hold to loyalty, no matter the cost." },
  },
  {
    id: "forsake",
    text: "You will forsake your vows.",
    severity: 1,
    embrace: { label: "Embrace this path", description: "Recognize that oaths can be cages." },
    resist: { label: "Resist this fate", description: "An oath is the core of identity." },
  },
  {
    id: "ignite",
    text: "You will ignite an uprising.",
    severity: 3,
    embrace: { label: "Embrace this path", description: "Become the spark that burns the old world down." },
    resist: { label: "Resist this fate", description: "Seek order amidst the chaos." },
  },
  {
    id: "reveal_secret",
    text: "You will reveal a secret that should have remained buried.",
    severity: 2,
    embrace: { label: "Embrace this path", description: "Truth must out, whatever the cost." },
    resist: { label: "Resist this fate", description: "Some knowledge is too dangerous to share." },
  }
];