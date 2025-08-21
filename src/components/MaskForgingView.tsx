/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import '../styles/maskForging.css';

interface Props {
  seedTitle: string;
  onForge: (input: string) => void;
}

export const MaskForgingView: React.FC<Props> = ({ seedTitle, onForge }) => {
  const [input, setInput] = useState('');

  const handleForge = () => {
    if (input.trim()) {
      onForge(input.trim());
    }
  };

  return (
    <div className="mask-forging-container">
      <div className="mask-forging-header">
        <p className="portent-label">Your Portent:</p>
        <h1 className="portent-title">{seedTitle}</h1>
      </div>
      
      <div className="mask-forging-prompt">
        <label htmlFor="mask-input" className="prompt-label">
            To forge your first mask, inscribe a memory, a hope, or a fear.
        </label>
        <textarea
          id="mask-input"
          className="prompt-textarea"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g., The memory of a promise broken by winter's first snow..."
          rows={4}
        />
      </div>

      <button
        className="forge-button"
        onClick={handleForge}
        disabled={!input.trim()}
      >
        Forge the Mask
      </button>
    </div>
  );
};
