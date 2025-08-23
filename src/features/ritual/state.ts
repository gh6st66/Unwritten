/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import type { Lexeme } from "../../types/lexeme";

export type RitualState =
  | { s: "idle" }
  | { s: "pre"; variantIdx: number }              // showing pre-choice text
  | { s: "choosing"; available: Lexeme[] }        // grid/list of lexemes
  | { s: "resolving"; chosen: Lexeme; postIdx: number }
  | { s: "committed"; chosen: Lexeme };

export type RitualEventMsg =
  | { t: "START"; lexemes: Lexeme[] }
  | { t: "OPEN_CHOOSER" }
  | { t: "CHOOSE"; lexeme: Lexeme }
  | { t: "FINISH" };

export function ritualReducer(st: RitualState, ev: RitualEventMsg): RitualState {
  switch (ev.t) {
    case "START":
      // For now, variant index is hardcoded. Can be randomized later.
      return { s: "pre", variantIdx: 0 };
    case "OPEN_CHOOSER":
      if (st.s !== "pre") return st;
      // The available lexemes are passed in at the component level
      return { s: "choosing", available: [] };
    case "CHOOSE":
      // For now, post-choice variant is hardcoded.
      return { s: "resolving", chosen: ev.lexeme, postIdx: 0 };
    case "FINISH":
      if (st.s !== "resolving") return st;
      return { s: "committed", chosen: st.chosen };
    default:
      return st;
  }
}
