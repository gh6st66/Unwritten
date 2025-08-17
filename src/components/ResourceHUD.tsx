/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { UseResourcePoolsReturn } from '../hooks/useResourcePools';

interface ResourceHUDProps {
  pools: UseResourcePoolsReturn;
}

const ResourceHUD: React.FC<ResourceHUDProps> = ({ pools }) => {
  return (
    <div className="resource-hud" aria-label="Player Resources">
      <div className="resource-display" aria-label={`Aggression: ${pools.aggression}`}>
        <div className="resource-icon aggression"></div>
        <span>{pools.aggression}</span>
      </div>
      <div className="resource-display" aria-label={`Wisdom: ${pools.wisdom}`}>
        <div className="resource-icon wisdom"></div>
        <span>{pools.wisdom}</span>
      </div>
      <div className="resource-display" aria-label={`Cunning: ${pools.cunning}`}>
        <div className="resource-icon cunning"></div>
        <span>{pools.cunning}</span>
      </div>
    </div>
  );
};

export default ResourceHUD;
