import React from 'react';
import { Mask } from '../game/types';
import '../styles/maskReveal.css';

interface Props {
  mask: Mask;
  onContinue: () => void;
}

export const MaskRevealView: React.FC<Props> = ({ mask, onContinue }) => {
  return (
    <div className="mask-reveal-container" aria-live="polite" aria-atomic="true">
      <div className="mask-reveal-content">
        <div className="mask-image-container">
          <img src={mask.imageUrl} alt={`The mask known as ${mask.name}`} className="mask-image" />
        </div>
        <div className="mask-details">
          <h2 className="mask-name">{mask.name}</h2>
          <p className="mask-description">"{mask.description}"</p>
        </div>
      </div>
      <button className="mask-reveal-continue" onClick={onContinue}>
        Accept Your Fate
      </button>
    </div>
  );
};
