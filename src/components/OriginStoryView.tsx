/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { AnswerDef, OriginChoice, OriginModifierDef } from '../core/types';
import { originModifiers } from '../data/originModifiers';

export interface JournalPage {
  id: string;
  text: string;
  answers: AnswerDef[];
}

interface OriginStoryViewProps {
  pages: JournalPage[];
  isLoading: boolean;
  onComplete: (choices: OriginChoice[]) => void;
}

export const OriginStoryView: React.FC<OriginStoryViewProps> = ({ pages, isLoading, onComplete }) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [chosenSelections, setChosenSelections] = useState<OriginChoice[]>([]);
  const [selectedFragment, setSelectedFragment] = useState<AnswerDef | null>(null);
  
  if (isLoading) {
    return (
        <main className="origin-story-container">
            <h1 className="origin-story-title loading">Uncovering a burnt journal... its pages seem to shift in the firelight...</h1>
        </main>
    );
  }

  if (pages.length === 0 && !isLoading) {
    return (
        <main className="origin-story-container">
            <h1 className="origin-story-title">The journal is empty... the past is lost.</h1>
            <p className="journal-error">There was an issue generating the origin story. Please try again.</p>
        </main>
    );
  }

  const currentPage = pages[currentPageIndex];
  
  const handleSelectModifier = (modifier: OriginModifierDef) => {
    if (!selectedFragment) return;

    const newSelections = [...chosenSelections, { fragment: selectedFragment, modifier, pageText: currentPage.text }];
    setChosenSelections(newSelections);

    if (currentPageIndex < pages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
      setSelectedFragment(null);
    } else {
      onComplete(newSelections);
    }
  };

  return (
    <main className="origin-story-container">
      <div className="origin-story-progress">
        Page {currentPageIndex + 1} of {pages.length}
      </div>
      <div className="origin-story-journal">
        <p className="journal-entry-text">"{currentPage.text}"</p>
        
        {!selectedFragment ? (
            <div className="journal-choices">
                <p className="journal-prompt">How do you remember it?</p>
                {currentPage.answers.map(answer => (
                    <button
                    key={answer.id}
                    className="journal-choice-button"
                    onClick={() => setSelectedFragment(answer)}
                    >
                    {answer.text}
                    </button>
                ))}
            </div>
        ) : (
            <div className="modifier-selection">
                <p className="selected-fragment">
                    <span className="fragment-label">Your Memory:</span> "{selectedFragment.text}"
                </p>
                <div className="modifier-choices">
                    {originModifiers.map(modifier => (
                        <button
                            key={modifier.id}
                            className={`modifier-button modifier-${modifier.id}`}
                            onClick={() => handleSelectModifier(modifier)}
                            title={modifier.description}
                        >
                            {modifier.label}
                        </button>
                    ))}
                </div>
            </div>
        )}
      </div>
    </main>
  );
};