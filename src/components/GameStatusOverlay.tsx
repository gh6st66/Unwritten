/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { GameState } from '../game/types';

interface Props {
  state: GameState;
  onToggleChronicle: () => void;
  onToggleGlossary: () => void;
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: '1rem',
  left: '1rem',
  backgroundColor: 'rgba(18, 18, 18, 0.8)',
  backdropFilter: 'blur(4px)',
  border: '1px solid #333',
  borderRadius: '8px',
  padding: '0.5rem 1rem',
  color: '#a0a0a0',
  fontSize: '0.75rem',
  zIndex: 10,
  boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const keyHintStyle: React.CSSProperties = {
    display: 'flex',
    gap: '1rem',
    marginTop: '0.5rem',
    paddingTop: '0.5rem',
    borderTop: '1px solid #333'
};

const kbdStyle: React.CSSProperties = {
    background: '#333',
    padding: '0.1rem 0.4rem',
    borderRadius: '3px',
    border: '1px solid #555',
    color: '#e0e0e0',
    fontFamily: 'monospace'
}

export const GameStatusOverlay: React.FC<Props> = ({ state, onToggleChronicle, onToggleGlossary }) => {
  // Don't show the overlay on the title screen
  if (state.phase === 'TITLE') {
    return null;
  }
  
  return (
    <div style={overlayStyle}>
      <div>
        <strong>Run:</strong> {state.runId.substring(0, 8)}... <br />
        <strong>Phase:</strong> {state.phase}
      </div>
      <div style={keyHintStyle}>
          <button onClick={onToggleGlossary} style={{background: 'none', border: 'none', padding: 0, color: 'inherit', cursor: 'pointer'}}>
            <kbd style={kbdStyle}>g</kbd> lossary
          </button>
          <button onClick={onToggleChronicle} style={{background: 'none', border: 'none', padding: 0, color: 'inherit', cursor: 'pointer'}}>
            <kbd style={kbdStyle}>c</kbd> hronicle
          </button>
      </div>
    </div>
  );
};
