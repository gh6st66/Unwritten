import { JournalClaim, ClaimId } from "../core/types";

// Use a partial type for definitions, as some fields are added at runtime.
export type ClaimDef = Omit<JournalClaim, "issuedAt" | "expiresAt">;

export const claims: ClaimDef[] = [
  {
    id: "ABANDONER" as ClaimId,
    text: "Fate has decreed: You will abandon another in their time of need.",
    severity: "major",
  },
  {
    id: "SELFISH" as ClaimId,
    text: "It is written: You will prioritize your own gain, no matter the cost to others.",
    severity: "major",
  },
  {
    id: "DEFIANT" as ClaimId,
    text: "The path is set: You will defy a rightful authority.",
    severity: "minor",
  },
  {
    id: "OATHBREAKER" as ClaimId,
    text: "Fate commands: You will break a sworn promise.",
    severity: "major",
  },
];