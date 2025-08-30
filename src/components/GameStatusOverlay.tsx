/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { GameState } from '../game/types';
import '../styles/gameStatusOverlay.css'; // Import the new styles

interface Props {
  state: GameState;
  onToggleChronicle: () => void;
  onToggleGlossary: () => void;
}

export const GameStatusOverlay: React.FC<Props> = ({ state, onToggleChronicle, onToggleGlossary }) => {
  // Don't show the overlay on the title screen
  if (state.phase === 'TITLE') {
    return null;
  }
  
  return (
    <div className="game-status-overlay-container" tabIndex={0} aria-label="Game Status Information. Press G for Glossary, C for Chronicle.">
      <div className="game-status-overlay-handle">
        Status
      </div>
      <div className="game-status-overlay-content">
        <div>
          <strong>Run:</strong> {state.runId.substring(0, 8)}... <br />
          <strong>Phase:</strong> {state.phase}
        </div>
        <div className="game-status-key-hints">
          <button onClick={onToggleGlossary}>
            <kbd>g</kbd> lossary
          </button>
          <button onClick={onToggleChronicle}>
            <kbd>c</kbd> hronicle
          </button>
        </div>
      </div>
    </div>
  );
};