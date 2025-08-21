/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import '../styles/maskForging.css';
import { ForgeTemplate, LearnedWord } from '../systems/maskforging/types';

interface Props {
  seedTitle: string;
  forge: ForgeTemplate;
  learnedWords: LearnedWord[];
  onForge: (wordId: string) => void;
}

export const MaskForgingView: React.FC<Props> = ({ seedTitle, forge, learnedWords, onForge }) => {
  const [selectedWord, setSelectedWord] = useState<LearnedWord | null>(null);

  return (
    <div className="mask-forging-container">
      <div className="mask-forging-header">
        <p className="portent-label">Your Portent:</p>
        <h1 className="portent-title">{seedTitle}</h1>
        <p className="forge-flavor">{forge.entryFlavor}</p>
      </div>
      
      <div className="mask-forging-prompt">
        <label className="prompt-label">
          Inscribe a Learned Word to define the mask's essence.
        </label>
        
        <div className="learned-words-grid">
          {learnedWords.map(word => (
            <button
              key={word.id}
              className={`word-button ${selectedWord?.id === word.id ? 'selected' : ''}`}
              onClick={() => setSelectedWord(word)}
            >
              <span className="word-id">{word.id}</span>
              <span className="word-category">{word.category}</span>
            </button>
          ))}
        </div>
      </div>

      <button
        className="forge-button"
        onClick={() => selectedWord && onForge(selectedWord.id)}
        disabled={!selectedWord}
      >
        Forge the Mask
      </button>
    </div>
  );
};
