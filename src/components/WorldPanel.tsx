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

  const { stability, thresholds } = state.accord;
  const pressurePercent = ((stability + 100) / 200) * 100;

  const isNearThreshold = stability > thresholds.unity * 0.8 || stability < thresholds.fracture * 0.8;
  const pressureBarContainerClasses = ["pressure-bar-container"];
  if (isNearThreshold) {
      pressureBarContainerClasses.push("pulsing");
  }


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
        <div className={pressureBarContainerClasses.join(' ')} title={`Stability: ${stability}`}>
          <div className="pressure-bar" style={{ width: `${pressurePercent}%` }}></div>
        </div>
      </div>
    </div>
  );
};