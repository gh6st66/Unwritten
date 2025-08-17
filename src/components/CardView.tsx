/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { CardInstance, ResourceCost } from '../core/types';

interface CardViewProps {
  card: CardInstance;
  onClick: () => void;
}

const CostDisplay: React.FC<{ cost: ResourceCost }> = ({ cost }) => {
    const costEntries = Object.entries(cost).filter(([, value]) => value && value > 0);

    if (costEntries.length === 0) {
        return null; // No cost to display
    }
    
    const icons = costEntries.flatMap(([type, value]) => 
        Array(value).fill(type)
    );

    return (
        <div className="cost-display">
            {icons.map((type, index) => (
                <div key={index} className={`cost-icon ${type}`}>
                    {/* The number is removed, as the icon count itself represents the cost */}
                </div>
            ))}
        </div>
    );
};

const CardView: React.FC<CardViewProps> = ({ card, onClick }) => {
  const { def } = card;

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      onClick();
    }
  };

  return (
    <div 
      className="card-view" 
      onClick={onClick} 
      onKeyDown={handleKeyDown}
      role="button" 
      tabIndex={0} 
      aria-label={`Play card: ${def.name}`}
    >
      <div className="card-header">
        <span className="card-name">{def.name}</span>
        <CostDisplay cost={def.cost} />
      </div>
      <div className="card-discipline">{def.discipline}</div>
    </div>
  );
};

export default CardView;