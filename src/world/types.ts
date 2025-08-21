/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { DialectId } from '../systems/dialect/types';

export type WorldId = string;

export interface WorldGenConfig {
  worldSeed: string;
  historyYears: number;
  variance: number;
}

export interface GeoCell {
  id: string;
  q: number; r: number; // hex axial coords
  elevation: number;
  moisture: number;
  biome: 'tundra' | 'steppe' | 'forest' | 'desert' | 'wetland' | 'alpine' | 'coast';
  features: string[];
}

export interface RegionIdentity {
  temperament: number; // -1 pacifist .. +1 militant
  piety: number;       // 0..1
  wealth: number;      // 0..1
  law: number;         // -1 clan .. +1 central
  dialectId: DialectId;
}

export interface Region {
  id: string;
  name: string;
  cells: string[]; // GeoCell ids
  identity: RegionIdentity;
}

export interface WorldEvent {
  id: string;
  year: number;
  kind: 'war' | 'schism' | 'plague' | 'discovery' | 'cataclysm';
  regionIds: string[];
  summary: string;
}

export interface World {
  id: WorldId;
  seed: string;
  grid: Record<string, GeoCell>;
  regions: Record<string, Region>;
  civIds: string[];
  history: WorldEvent[];
}
