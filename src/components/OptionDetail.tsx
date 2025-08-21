/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { Mark, ActionOutcome, Effect, ResourceId } from '../game/types';
import { splitEffects, resourceIcons } from '../systems/resourceEngine';

interface Props {
  outcome: ActionOutcome;
}

const formatMarkValue = (val: number) => (val > 0 ? `+${val}` : val);

export const OptionDetail: React.FC<Props> = ({ outcome }) => {
  const { costs, gains } = splitEffects(outcome.effects);
  const marksArr = outcome.grantsMarks ?? [];

  return (
    <div className="option-details-container">
      {costs.length > 0 && (
        <div className="detail-group">
          <span className="detail-group-label">Cost</span>
          {costs.map((cost) => (
            <ResourceChip key={cost.resource} effect={cost} />
          ))}
        </div>
      )}
      {gains.length > 0 && (
        <div className="detail-group">
          <span className="detail-group-label">Gain</span>
          {gains.map((gain) => (
            <ResourceChip key={gain.resource} effect={gain} />
          ))}
        </div>
      )}
      {marksArr.length > 0 && (
        <div className="detail-group">
           <span className="detail-group-label">Marks</span>
           {marksArr.map((mark) => (
            <span key={mark.id} className="detail-item mark" aria-label={`Grants mark: ${mark.label} ${formatMarkValue(mark.value)}`}>
                {mark.label} {formatMarkValue(mark.value)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

const ResourceChip: React.FC<{ effect: Effect }> = ({ effect }) => {
  const isCost = effect.delta < 0;
  const sign = isCost ? '' : '+';
  const label = `${isCost ? 'Cost' : 'Gain'}: ${Math.abs(effect.delta)} ${effect.resource}`;

  return (
    <span
      className={`detail-item ${isCost ? 'cost' : 'gain'}`}
      aria-label={label}
    >
      {resourceIcons[effect.resource]} {sign}{effect.delta}
    </span>
  );
};