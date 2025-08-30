import React from 'react';
import { GameState } from '../game/types';
import '../styles/worldPanel.css';

interface Props {
  state: GameState;
}

export const WorldPanel: React.FC<Props> = ({ state }) => {
  if (!state.currentSceneId || !state.world.world) {
    return null;
  }
  
  const allNpcs = state.world.civs.flatMap(c => c.npcs);
  const playerRegionId = allNpcs.find(n => n.id === state.player.id)?.regionId;
  const currentRegion = playerRegionId ? state.world.world.regions[playerRegionId] : null;

  if (!currentRegion) {
    return (
        <div className="world-panel">
            <h3 className="panel-header">Location</h3>
            <p className="current-region">Location unknown</p>
        </div>
    );
  }

  const pressure = state.accord.stability;
  const pressurePercent = ((pressure + 100) / 200) * 100;

  return (
    <div className="world-panel">
      <div className="region-info">
        <h3 className="panel-header">Location</h3>
        <p className="current-region">{currentRegion.name}</p>
        <p className="region-neighbors">
          Exits: {currentRegion.neighbors.map(id => state.world.world?.regions[id].name).join(', ') || 'None'}
        </p>
      </div>
      <div className="pressure-info">
        <h3 className="panel-header">World Accord</h3>
        <div className="pressure-bar-container" title={`Stability: ${pressure}`}>
          <div className="pressure-bar" style={{ width: `${pressurePercent}%` }}></div>
        </div>
      </div>
    </div>
  );
};