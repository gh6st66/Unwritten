/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { Resources, Mark } from '../game/types';

interface Props {
  costs?: Partial<Resources>;
  effects?: Partial<Resources>;
  grantsMarks?: Mark[];
}

const formatMarkValue = (val: number) => (val > 0 ? `+${val}` : val);

export const OptionDetail: React.FC<Props> = ({ costs, effects, grantsMarks }) => {
  const costsArr = costs ? Object.entries(costs).filter(([, value]) => value !== 0) : [];
  const effectsArr = effects ? Object.entries(effects).filter(([, value]) => value !== 0) : [];
  const marksArr = grantsMarks ?? [];

  if (costsArr.length === 0 && effectsArr.length === 0 && marksArr.length === 0) {
    return null;
  }

  return (
    <div className="option-details">
      {costsArr.map(([key, value]) => (
        <span key={key} className="detail-item cost">-{value} {key}</span>
      ))}
      {effectsArr.map(([key, value]) => (
        <span key={key} className="detail-item effect">+{value} {key}</span>
      ))}
      {marksArr.map((mark) => (
        <span key={mark.id} className="detail-item mark">{mark.label} {formatMarkValue(mark.value)}</span>
      ))}
    </div>
  );
};
