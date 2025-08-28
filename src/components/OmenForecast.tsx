/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { GameState } from '../game/types';
import { OmenTag } from '../omen/types';
import { selectOmenBands, selectOmenTooltip } from '../omen/selectors';
import '../styles/omenForecast.css';

interface Props {
  state: GameState;
}

const TAG_ORDER: OmenTag[] = ['embrace', 'resist', 'mixed'];

export const OmenForecast: React.FC<Props> = ({ state }) => {
  const bands = selectOmenBands(state);

  return (
    <div className="omen-forecast-container">
      <h3 className="status-header">Fate's Weave</h3>
      <ul className="omen-forecast-list">
        {TAG_ORDER.map(tag => (
          <li key={tag} className="omen-forecast-item">
            <span className="omen-forecast-tag">{tag}</span>
            <span
              className={`omen-forecast-band band--${bands[tag]}`}
              title={selectOmenTooltip(state, tag)}
            >
              {bands[tag]}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
