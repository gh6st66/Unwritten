import React, { useState, useMemo } from 'react';
import { BoonId } from '../core/types';
import { BOONS } from '../data/boons';
import '../styles/boonSelection.css';

interface Props {
  echoBalance: number;
  onComplete: (selectedBoonIds: BoonId[]) => void;
}

const MAX_BOONS = 2;
const MAX_RARE_BOONS = 1;

export const BoonSelectionView: React.FC<Props> = ({ echoBalance, onComplete }) => {
  const [selected, setSelected] = useState<Set<BoonId>>(new Set());

  const { totalCost, selectedBoons, selectedRareCount } = useMemo(() => {
    const selectedBoons = BOONS.filter(b => selected.has(b.id));
    const totalCost = selectedBoons.reduce((sum, b) => sum + b.cost, 0);
    const selectedRareCount = selectedBoons.filter(b => b.rarity === 'rare').length;
    return { totalCost, selectedBoons, selectedRareCount };
  }, [selected]);

  const canAfford = echoBalance >= totalCost;

  const handleToggle = (boonId: BoonId) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(boonId)) {
        next.delete(boonId);
      } else {
        next.add(boonId);
      }
      return next;
    });
  };

  const getIsDisabled = (boonId: BoonId): boolean => {
    const isSelected = selected.has(boonId);
    if (isSelected) return false; // Can always deselect

    if (selected.size >= MAX_BOONS) return true;
    
    const boon = BOONS.find(b => b.id === boonId);
    if (boon?.rarity === 'rare' && selectedRareCount >= MAX_RARE_BOONS) {
      return true;
    }
    
    return false;
  }

  return (
    <div className="boon-selection-view">
      <div className="boon-container">
        <header className="boon-header">
          <h1>Whispers of the Past</h1>
          <p>The echoes of your previous lives offer a choice. Spend them to shape the path ahead.</p>
          <div className="echo-balance">
            Echoes to Spend: <span>{echoBalance}</span>
          </div>
        </header>
        <main className="boon-list">
          {BOONS.map(boon => {
            const isSelected = selected.has(boon.id);
            const isDisabled = getIsDisabled(boon.id);
            return (
              <button
                key={boon.id}
                className={`boon-card ${isSelected ? 'selected' : ''} ${boon.rarity}`}
                onClick={() => handleToggle(boon.id)}
                disabled={isDisabled}
                aria-pressed={isSelected}
              >
                <div className="boon-card-header">
                  <h3>{boon.label}</h3>
                  <span className="cost">{boon.cost} Echoes</span>
                </div>
                <p>{boon.description}</p>
                {boon.rarity === 'rare' && <span className="rarity-tag">Rare</span>}
              </button>
            )
          })}
        </main>
        <footer className="boon-footer">
          <div className="selection-summary">
            <span>Selected: {selected.size}/{MAX_BOONS}</span>
            <span>Rare: {selectedRareCount}/{MAX_RARE_BOONS}</span>
            <span>Cost: <span className={!canAfford ? 'unaffordable' : ''}>{totalCost}</span></span>
          </div>
          <button 
            className="start-run-button" 
            disabled={!canAfford}
            onClick={() => onComplete(Array.from(selected))}
          >
            {canAfford ? 'Begin the Next Path' : 'Not Enough Echoes'}
          </button>
        </footer>
      </div>
    </div>
  );
};