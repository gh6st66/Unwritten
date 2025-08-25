/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { Origin } from '../game/types';
import '../styles/originSelection.css';

interface Props {
  origins: Origin[];
  onSelect: (origin: Origin) => void;
}

export const OriginSelectionView: React.FC<Props> = ({ origins, onSelect }) => {
  return (
    <div className="origin-selection-container">
      <h1 className="origin-selection-title">Unwritten</h1>
      <p className="origin-selection-subtitle">Choose an origin to begin your story.</p>
      <div className="origin-list">
        {origins.map(origin => (
          <button key={origin.id} className="origin-card" onClick={() => onSelect(origin)}>
            <h2 className="origin-card-title">{origin.title}</h2>
            <p className="origin-card-description">{origin.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};