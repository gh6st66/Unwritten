/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useMemo } from 'react';
import { GameState } from '../game/types';
import { getItemRule } from '../data/itemCatalog';
import { OmenForecast } from './OmenForecast';
import '../styles/playerStatus.css';

interface Props {
  state: GameState;
}

export const PlayerStatus: React.FC<Props> = ({ state }) => {
  const { player, npcs } = state;
  const { inventory, marks, mask } = player;

  const recognition = useMemo(() => {
    if (!npcs || Object.keys(npcs).length === 0) {
      return { trust: 0, fear: 0 };
    }
    const totalTrust = Object.values(npcs).reduce((sum, npc) => sum + npc.recognition.trust, 0);
    const totalFear = Object.values(npcs).reduce((sum, npc) => sum + npc.recognition.fear, 0);
    return { trust: totalTrust, fear: totalFear };
  }, [npcs]);


  return (
    <div className="player-status-container">
      <OmenForecast state={state} />
      
      <div className="status-section">
        <h3 className="status-header">Recognition Meter</h3>
        <div className="recognition-meter">
          <span>Trust: {recognition.trust}</span>
          <span>Fear: {recognition.fear}</span>
        </div>
      </div>

       {mask && (
        <div className="status-section">
          <h3 className="status-header">Mask: {mask.name}</h3>
          <div className="mask-tags">
            {Object.keys(mask.themeOfFate).map(theme => (
              <span className="mask-tag" key={theme}>
                {theme}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="status-section">
        <h3 className="status-header">Inventory</h3>
        {inventory.slots.length > 0 ? (
          <ul className="status-list inventory-list">
            {inventory.slots.map(slot => {
              const rule = getItemRule(slot.itemId);
              return (
                <li key={slot.itemId} className="status-item inventory-item">
                  <span className="item-name">{rule.name}</span>
                  {slot.qty > 1 && <span className="item-qty">x{slot.qty}</span>}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="status-empty-text">Your pack is empty.</p>
        )}
      </div>
      
      {marks.length > 0 && (
         <div className="status-section">
            <h3 className="status-header">Marks</h3>
            <ul className="status-list marks-list">
                {marks.map(mark => (
                    <li key={mark.id} className="status-item mark-item">
                        {mark.label}
                        <span className="mark-value">{mark.value > 0 ? `+${mark.value}` : mark.value}</span>
                    </li>
                ))}
            </ul>
        </div>
      )}
    </div>
  );
};