/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// Simplified for frontend simulation

// Payloads for events, without the timestamp.
export type ChronicleEventPayload =
  | { type: "RUN_STARTED"; runId: string; seed: string; }
  | { type: "RUN_ENDED"; runId: string; outcome: string; }
  | { type: "MASK_FORGED"; maskId: string; name: string; description: string; forgeId: string; learnedWordId: string; runId: string; ownerId: string; }
  | { type: "FIGURE_SEEN"; figureId: string; runId: string; context: string; }
  | { type: "FIGURE_UPDATE"; figureId: string; changes: { marks: any[] }; runId: string; }
  | { type: "ITEM_TAKEN"; runId: string; itemId: string; sceneId: string; }
  | { type: "ITEM_DROPPED"; runId: string; itemId: string; sceneId: string; }
  | { type: "OBJECT_UNLOCKED"; runId: string; objectId: string; sceneId: string | null; toolId: string; };

// The full event type, with timestamp.
// Using an intersection with a union distributes the intersection over the members of the union,
// which is a reliable way to add a common property to a discriminated union.
export type ChronicleEvent = ChronicleEventPayload & { ts: number };