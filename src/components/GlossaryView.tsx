/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useMemo, useState } from "react";
import { GLOSSARY } from "../data/glossary";
import "../styles/glossary.css";

type Props = {
    onClose: () => void;
};

export function GlossaryView({ onClose }: Props) {
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLowerCase();

  const items = useMemo(() => {
    if (!normalized) return GLOSSARY;
    return GLOSSARY.filter(e =>
      e.term.toLowerCase().includes(normalized) ||
      e.definition.toLowerCase().includes(normalized) ||
      (e.tags ?? []).some(t => t.toLowerCase().includes(normalized))
    );
  }, [normalized]);

  return (
    <div className="glossary-container">
        <section className="glossary" aria-labelledby="glossary-title">
        <header className="glossary__header">
            <button className="glossary__back-button" onClick={onClose} aria-label="Back to main menu">←</button>
            <h1 id="glossary-title">Glossary</h1>
            <div className="glossary__search">
            <input
                type="search"
                placeholder="Search terms…"
                aria-label="Search glossary terms"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            <span className="glossary__count" aria-live="polite" aria-atomic="true">
                {items.length} item{items.length === 1 ? "" : "s"}
            </span>
            </div>
        </header>

        <ul className="glossary__list">
            {items.map((e) => (
            <li key={e.id} className="glossary__item">
                <h2 className="glossary__term">{e.term}</h2>
                <p className="glossary__def">{e.definition}</p>
                {e.tags?.length ? (
                <div className="glossary__tags" aria-label="tags">
                    {e.tags.map((t) => (
                    <span key={t} className="glossary__tag">{t}</span>
                    ))}
                </div>
                ) : null}
            </li>
            ))}
        </ul>
        </section>
    </div>
  );
}
