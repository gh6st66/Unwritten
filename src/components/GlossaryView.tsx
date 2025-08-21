/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { GlossaryTerm } from '../data/glossary';
import '../styles/glossary.css';

interface Props {
  terms: GlossaryTerm[];
  onClose: () => void;
}

export const GlossaryView: React.FC<Props> = ({ terms, onClose }) => {
  return (
    <div className="glossary-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="glossary-title">
      <div className="glossary-content" onClick={(e) => e.stopPropagation()}>
        <button className="glossary-close-button" onClick={onClose} aria-label="Close glossary">&times;</button>
        <h2 id="glossary-title" className="glossary-main-title">Glossary</h2>
        <ul className="glossary-list">
          {terms.map(term => (
            <li key={term.id} className="glossary-item">
              <h3 className="glossary-term">{term.term}</h3>
              <p className="glossary-definition">{term.definition}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
