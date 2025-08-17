/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { ArchetypeDef } from '../core/types';

interface ArchetypeSelectionViewProps {
  archetypes: ArchetypeDef[];
  onSelect: (archetype: ArchetypeDef) => void;
}

export const ArchetypeSelectionView: React.FC<ArchetypeSelectionViewProps> = ({ archetypes, onSelect }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = (archetype: ArchetypeDef) => {
    setSelectedId(archetype.id);
  };

  const handleStart = () => {
    const selectedArchetype = archetypes.find(a => a.id === selectedId);
    if (selectedArchetype) {
      onSelect(selectedArchetype);
    }
  };

  return (
    <div className="archetype-selection-container">
      <h1 className="archetype-selection-title">Choose Your Archetype</h1>
      <div className="archetypes-list">
        {archetypes.map(archetype => (
          <div
            key={archetype.id}
            className={`archetype-card ${selectedId === archetype.id ? 'selected' : ''}`}
            onClick={() => handleSelect(archetype)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleSelect(archetype)}
            role="button"
            tabIndex={0}
            aria-pressed={selectedId === archetype.id}
            aria-label={`Select archetype: ${archetype.name}`}
          >
            <h2 className="archetype-card-name">{archetype.name}</h2>
            <p className="archetype-card-description">{archetype.description}</p>
            <p className="archetype-card-bonus">{archetype.bonuses[0].description}</p>
          </div>
        ))}
      </div>
      <button
        className="archetype-start-button"
        onClick={handleStart}
        disabled={!selectedId}
        aria-disabled={!selectedId}
      >
        Begin Run
      </button>
    </div>
  );
};
