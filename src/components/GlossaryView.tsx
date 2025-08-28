/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useMemo, useState } from 'react';
import { GlossaryCategory, GlossaryEntry } from '../data/glossary';
import '../styles/glossary.css';

interface Props {
  categories: GlossaryCategory[];
  onClose: () => void;
}

export const GlossaryView: React.FC<Props> = ({ categories, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) {
      return categories;
    }
    const lowercasedFilter = searchTerm.toLowerCase();
    
    return categories.map(category => {
      const filteredEntries = category.entries.filter(entry => 
        entry.term.toLowerCase().includes(lowercasedFilter) ||
        entry.definition.toLowerCase().includes(lowercasedFilter)
      );
      
      return { ...category, entries: filteredEntries };
    }).filter(category => category.entries.length > 0);

  }, [categories, searchTerm]);

  return (
    <div className="glossary-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="glossary-title">
      <div className="glossary-content" onClick={(e) => e.stopPropagation()}>
        <header className="glossary-header">
          <h2 id="glossary-title" className="glossary-main-title">Glossary</h2>
          <button className="glossary-close-button" onClick={onClose} aria-label="Close glossary">&times;</button>
        </header>

        <div className="glossary-search-container">
          <input
            type="search"
            placeholder="Search terms..."
            className="glossary-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search glossary terms"
          />
        </div>

        <div className="glossary-list">
          {filteredCategories.length > 0 ? (
            filteredCategories.map(category => (
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
            ))
          ) : (
            <p className="glossary-no-results">No results found for "{searchTerm}".</p>
          )}
        </div>
      </div>
    </div>
  );
};