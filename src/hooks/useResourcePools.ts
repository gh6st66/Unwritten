/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useState, useCallback, useMemo } from 'react';
import { ResourceCost } from '../core/types';

interface ResourcePoolsState {
  aggression: number;
  wisdom: number;
  cunning: number;
}

export interface UseResourcePoolsReturn extends ResourcePoolsState {
  spend: (cost: ResourceCost) => void;
  gain: (gains: Partial<ResourcePoolsState>) => void;
  canAfford: (cost: ResourceCost) => boolean;
  reset: () => void;
}

export const useResourcePools = (initialState: ResourcePoolsState): UseResourcePoolsReturn => {
  const [pools, setPools] = useState<ResourcePoolsState>(initialState);

  const canAfford = useCallback((cost: ResourceCost): boolean => {
    return (
      (pools.aggression >= (cost.aggression || 0)) &&
      (pools.wisdom >= (cost.wisdom || 0)) &&
      (pools.cunning >= (cost.cunning || 0))
    );
  }, [pools]);

  const spend = useCallback((cost: ResourceCost) => {
    setPools(prev => {
        const canActuallyAfford =
            (prev.aggression >= (cost.aggression || 0)) &&
            (prev.wisdom >= (cost.wisdom || 0)) &&
            (prev.cunning >= (cost.cunning || 0));

        if (canActuallyAfford) {
            return {
                aggression: prev.aggression - (cost.aggression || 0),
                wisdom: prev.wisdom - (cost.wisdom || 0),
                cunning: prev.cunning - (cost.cunning || 0),
            };
        }
        return prev;
    });
  }, []);

  const gain = useCallback((gains: Partial<ResourcePoolsState>) => {
    setPools(prev => ({
      aggression: prev.aggression + (gains.aggression || 0),
      wisdom: prev.wisdom + (gains.wisdom || 0),
      cunning: prev.cunning + (gains.cunning || 0),
    }));
  }, []);

  const reset = useCallback(() => {
    setPools(initialState);
  }, [initialState]);

  return useMemo(() => ({ ...pools, spend, gain, canAfford, reset }), [pools, spend, gain, canAfford, reset]);
};
