/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { Omen, SpeakerContext } from '../game/types';
import { useLexeme } from '../hooks/useLexeme';
import '../styles/omenView.css';

interface Props {
  omen: Omen;
  onAccept: (approach: 'embrace' | 'resist') => void;
}

export const OmenView: React.FC<Props> = ({ omen, onAccept }) => {
  // This context defines the "voice" of the journal entity.
  const journalContext: SpeakerContext = {
    locale: 'en-US',
    region: 'en-US',
    affiliations: ['bureaucracy', 'clergy'],
    role: 'Chronicler'
  };
  const journalTerm = useLexeme('fateRecord', journalContext);

  return (
    <div className="omen-view-container">
      <header className="omen-header">
        <h1 className="omen-title">An Omen is Declared</h1>
        <h2 className="omen-source">The {journalTerm} Writes:</h2>
        <p className="omen-text">"{omen.text}"</p>
      </header>
      <div className="omen-choices">
        <button className="omen-choice-card" onClick={() => onAccept('embrace')} aria-label={`Embrace: ${omen.embrace.description}`}>
          <h3 className="omen-choice-title">{omen.embrace.label}</h3>
          <p className="omen-choice-description">{omen.embrace.description}</p>
        </button>
        <button className="omen-choice-card" onClick={() => onAccept('resist')} aria-label={`Resist: ${omen.resist.description}`}>
          <h3 className="omen-choice-title">{omen.resist.label}</h3>
          <p className="omen-choice-description">{omen.resist.description}</p>
        </button>
      </div>
    </div>
  );
};