/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export interface WordTwist {
  name: string;
  visual: string;
  effect: string;
  flavor: string;
}

export interface ForgeTemplate {
  id: string;
  name: string;
  type: "shrine" | "ruin" | "monastery" | "other";
  location: {
    regionSeed: string;
    description: string;
    visuals: string[];
  };
  entryFlavor: string;
  dreamOverlay: string;
  wordModifiers: {
    [wordId: string]: WordTwist;
  };
  defaultTwist: WordTwist;
}

export type LearnedWord = {
  id: string;
  category: 'Aggression' | 'Wisdom' | 'Cunning' | 'Hybrid';
};
