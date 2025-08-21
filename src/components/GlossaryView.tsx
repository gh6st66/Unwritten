/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { GlossaryCategory } from '../data/glossary';
import '../styles/glossary.css';

interface Props {
  categories: GlossaryCategory[];
  onClose: () => void;
}

export const GlossaryView: React.FC<Props> = ({ categories, onClose }) => {
  return (
    <div className="glossary-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="glossary-title">
      <div className="glossary-content" onClick={(e) => e.stopPropagation()}>
        <button className="glossary-close-button" onClick={onClose} aria-label="Close glossary">&times;</button>
        <h2 id="glossary-title" className="glossary-main-title">Glossary</h2>
        <div className="glossary-list">
          {categories.map(category => (
            <section key={category.id} className="glossary-category">
              <h3 className="glossary-category-title">{category.name}</h3>
              <ul className="glossary-entry-list">
                {category.entries.map(entry => (
                  <li key={entry.id} className="glossary-item">
                    <h4 className="glossary-term">{entry.term}</h4>
                    <p className="glossary-definition">{entry.definition}</p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};