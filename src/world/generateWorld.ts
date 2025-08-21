/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { World, WorldGenConfig, GeoCell, Region } from './types';
import { makeRNG } from './rng';
import dialects from '../data/dialects.json';
import { DialectId } from '../systems/dialect/types';

// NOTE: This is a simplified stub implementation of the design document.
// A full implementation would involve complex algorithms for noise generation,
// watershed analysis, and Voronoi partitioning.

interface Dialect {
  id: DialectId;
}

export function generateWorld(cfg: WorldGenConfig): World {
  const rng = makeRNG(cfg.worldSeed);
  const worldId = `world_${rng.int(1e9).toString(36)}`;

  // 1. Generate a simple grid of GeoCells
  const grid: Record<string, GeoCell> = {};
  const width = 10;
  const height = 10;
  for (let q = 0; q < width; q++) {
    for (let r = 0; r < height; r++) {
      const id = `cell_${q}_${r}`;
      grid[id] = {
        id, q, r,
        elevation: rng.float(0, 1000),
        moisture: rng.next(),
        biome: rng.pick(['tundra', 'steppe', 'forest', 'desert', 'wetland', 'alpine', 'coast']),
        features: [],
      };
    }
  }

  // 2. Partition cells into Regions
  const regions: Record<string, Region> = {};
  const numRegions = 3;
  const cellIds = Object.keys(grid);
  const cellsPerRegion = Math.floor(cellIds.length / numRegions);

  for (let i = 0; i < numRegions; i++) {
    const regionId = `region_${i}_${rng.int(1e9).toString(36)}`;
    const regionCells = cellIds.splice(0, i === numRegions - 1 ? cellIds.length : cellsPerRegion);
    
    regions[regionId] = {
      id: regionId,
      name: `${rng.pick(["Veridian", "Crimson", "Golden", "Shadow"])} ${rng.pick(["Reach", "Expanse", "Vale", "Hold"])}`,
      cells: regionCells,
      identity: {
        temperament: rng.float(-1, 1),
        piety: rng.next(),
        wealth: rng.next(),
        law: rng.float(-1, 1),
        dialectId: rng.pick(dialects as Dialect[]).id,
      }
    };
  }

  // 3. Simulate a brief history
  const history = Array.from({ length: rng.int(cfg.historyYears) + 1 }).map((_, i) => {
    const regionKeys = Object.keys(regions);
    return {
      id: `event_${i}_${rng.int(1e9).toString(36)}`,
      year: i,
      kind: rng.pick<'war' | 'schism' | 'plague' | 'discovery' | 'cataclysm'>(['war', 'schism', 'plague', 'discovery']),
      regionIds: [rng.pick(regionKeys)],
      summary: `${rng.pick(["A great", "A minor", "A devastating"])} ${rng.pick(["war", "plague", "discovery"])} occurred.`,
    };
  });

  return {
    id: worldId,
    seed: cfg.worldSeed,
    grid,
    regions,
    civIds: [], // Will be populated by generateCivs
    history,
  };
}