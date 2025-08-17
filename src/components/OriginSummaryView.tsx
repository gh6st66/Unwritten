/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { PlayerState, SealDef, Dispositions, MarkId } from '../core/types';
import { getMarkById } from '../systems/DataLoader';
import { getCardById } from '../systems/DataLoader';

interface FinalizedCharacter {
  playerState: PlayerState;
  startingDeck: string[];
  seal: SealDef;
}

interface OriginSummaryViewProps {
  character: FinalizedCharacter;
  onBegin: () => void;
  describeDispositions: (dispositions: Dispositions) => string;
}

export const OriginSummaryView: React.FC<OriginSummaryViewProps> = ({ character, onBegin, describeDispositions }) => {
  const { playerState, seal, startingDeck } = character;

  const baseDeckSize = startingDeck.filter(id => ['AGG_001', 'WIS_001', 'CUN_001', 'AGG_002', 'CUN_002'].includes(id)).length;
  const addedCards = startingDeck.slice(baseDeckSize).map(id => getCardById(id)?.name || 'Unknown Card');

  const startingMarks = Object.keys(playerState.marks).map(id => {
      const markId = id as MarkId;
      const def = getMarkById(markId);
      const instance = playerState.marks[markId];
      
      const rootLabel = def ? id.replace('MARK_', '').replace(/_/g, ' ') : 'Unknown Mark';
      const gradeLabel = def ? (def.gradeLabels[instance.severity - 1] || def.gradeLabels[def.gradeLabels.length - 1]) : '';
      
      return {
          id: id,
          name: rootLabel,
          grade: gradeLabel,
          stacks: instance.stacks,
      };
  });

  return (
    <main className="origin-summary-container">
        <div className="summary-content">
            <h1 className="summary-title">Your Story Begins</h1>
            
            <div className="summary-seal-section">
                <div className="seal-title">You are {seal.title}</div>
                <p className="seal-description">"{seal.description}"</p>
            </div>

            <div className="summary-character-info">
                <div className="info-block">
                    <h3>Dispositions</h3>
                    <p>{describeDispositions(playerState.dispositions)}</p>
                    <small>Your core nature.</small>
                </div>
            </div>

            {startingMarks.length > 0 && (
                <div className="summary-marks">
                    <h3>Starting Marks</h3>
                    <div className="marks-list">
                        {startingMarks.map(mark => (
                            <span key={mark.id} className="mark-pill">
                                {mark.name} ({mark.grade})
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <div className="summary-bonuses">
                <h3>Starting Bonuses</h3>
                <ul>
                    <li>{playerState.maxHealth} Max Health</li>
                    {playerState.bonuses?.filter(b => b.type !== 'MAX_HEALTH').map((bonus, i) => (
                       <li key={i}>{bonus.type.replace(/_/g, ' ')}: +{bonus.value}</li>
                    ))}
                    <li>Added Cards: {addedCards.join(', ')}</li>
                </ul>
            </div>

            <button className="summary-begin-button" onClick={onBegin}>
                Enter the World
            </button>
        </div>
    </main>
  );
};