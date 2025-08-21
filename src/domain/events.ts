/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// Simplified for frontend simulation
export type ChronicleEvent =
  | { type: "RUN_STARTED"; runId: string; seed: string; ts: number; }
  | { type: "RUN_ENDED"; runId: string; outcome: string; ts: number; }
  | { type: "MASK_FORGED"; maskId: string; name: string; description: string; forgeId: string; learnedWordId: string; runId: string; ownerId: string; ts: number; }
  | { type: "FIGURE_SEEN"; figureId: string; runId: string; ts: number; context: string; }
  | { type: "FIGURE_UPDATE"; figureId: string; changes: { marks: any[] }; runId: string; ts: number; };
