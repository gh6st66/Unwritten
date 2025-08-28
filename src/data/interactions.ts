/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GameState } from "../game/types";

// This file is a stub. The interaction logic has been moved to the new
// "Shattered Accord" system and is now handled declaratively via `src/accord/accord.ts`.
// The `INTERACTION_RULES` array is kept to prevent import errors in the existing
// state machine, but it will no longer be executed for parser commands.

type InteractionContext = {
  state: GameState;
  bindings: Record<string, string>;
  sceneObjects: any[];
  reduce: (state: GameState, event: any) => GameState;
};

type InteractionRule = {
  id: string;
  conditions: (ctx: InteractionContext) => boolean;
  effect: (ctx: InteractionContext) => GameState;
};

export const INTERACTION_RULES: InteractionRule[] = [];
