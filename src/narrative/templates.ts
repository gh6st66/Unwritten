import { PCState, WorldCtx } from "../core/types";

export interface PredicateInput { pc: PCState; w: WorldCtx }
export type Pred = (i: PredicateInput) => boolean;

export interface LineTemplate {
  weight?: number;
  when?: Pred[];
  text: string;      // encounter line (external POV)
}

export interface ThoughtTemplate {
  weight?: number;
  when?: Pred[];
  maxWords?: number; // optional hard cap
  text: string;      // internal fragment, no brackets
}
