/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import catalogJson from "./items.ts";

export type ItemRule = {
  id: string;
  name: string;
  nouns: string[];
  tags: string[];
  stackable: boolean;
  maxStack: number;
  keyItem: boolean;
};

const rulesById = new Map<string, ItemRule>(
  catalogJson.items.map(it => [
    it.id,
    { 
      id: it.id,
      name: it.name,
      nouns: it.nouns ?? [],
      stackable: !!it.stackable, 
      maxStack: it.maxStack ?? 1, 
      keyItem: !!it.keyItem, 
      tags: it.tags ?? [] 
    }
  ])
);

export function getItemRule(itemId: string): ItemRule {
  const r = rulesById.get(itemId);
  if (!r) throw new Error(`Unknown item: ${itemId}`);
  return r;
}