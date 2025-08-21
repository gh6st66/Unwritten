/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { WorldSeed } from '../game/types';
import '../styles/seedSelection.css';

interface Props {
  seeds: WorldSeed[];
  onSelect: (seed: WorldSeed) => void;
}

export const SeedSelectionView: React.FC<Props> = ({ seeds, onSelect }) => {
  return (
    <div className="seed-selection-container">
      <h1 className="seed-selection-title">The Unwritten</h1>
      <p className="seed-selection-subtitle">Choose a portent to begin your story.</p>
      <div className="seed-list">
        {seeds.map(seed => (
          <button key={seed.id} className="seed-card" onClick={() => onSelect(seed)}>
            <h2 className="seed-card-title">{seed.title}</h2>
            <p className="seed-card-description">{seed.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};