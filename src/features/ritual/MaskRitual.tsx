/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect, useMemo, useReducer, useState } from "react";
import type { MaskRitualTemplate } from "../../types/ritual";
import type { Lexeme } from "../../types/lexeme";
import { ritualReducer } from "./state";
import "./mask-ritual.css";

type Props = {
  template: MaskRitualTemplate;
  lexemes: Lexeme[]; // filtered by progression/unlocks
  onCommit: (lexeme: Lexeme) => void; // write to save, emit events
};

export function MaskRitual({ template, lexemes, onCommit }: Props) {
  const [st, dispatch] = useReducer(ritualReducer, { s: "idle" });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    dispatch({ t: "START", lexemes });
  }, [lexemes]);
  
  // For now, we only have one variant of pre/post text. This can be expanded later.
  const pre = template.preChoice[st.s === "pre" ? st.variantIdx : 0];
  const post = template.postChoice[st.s === "resolving" ? st.postIdx : 0];

  const narration = useMemo(() => {
    if (st.s === "pre" || st.s === "choosing") return pre.lines;
    if (st.s === "resolving") return post.lines;
    return [] as string[];
  }, [st, pre, post]);

  const handleCommit = () => {
    if (st.s === 'resolving') {
        onCommit(st.chosen);
        dispatch({ t: "FINISH" });
    }
  }

  return (
    <section className="mask-ritual" aria-label="First Mask Ritual">
      <div className="mask-viewport" aria-hidden>
        {/* Mask silhouette and vapor */}
        <div className={`mask ${st.s === "resolving" ? "mask--awake" : ""}`} />
        <div className={`vapor ${st.s !== "idle" && st.s !== "committed" ? "vapor--active" : ""}`} />
        {/* Glyph crawlers animate only after choice */}
        <div className={`glyphs ${st.s === "resolving" ? "glyphs--crawl" : ""}`} />
      </div>

      <div className="sr-only" aria-live="polite">
        {narration.map((l, i) => <p key={i}>{l}</p>)}
      </div>

      <div className="ritual-text-container">
        {st.s === "pre" && (
          <div className="ritual-text">
            {pre.lines.map((l, i) => <p key={i}>{l}</p>)}
            <button autoFocus onClick={() => dispatch({ t: "OPEN_CHOOSER" })}>
              Choose the Word
            </button>
          </div>
        )}

        {st.s === "choosing" && (
          <LexemeChooser
            items={lexemes}
            onPick={(lex) => dispatch({ t: "CHOOSE", lexeme: lex })}
          />
        )}

        {st.s === "resolving" && (
          <div className="ritual-text ritual-text--post">
            {post.lines.map((l, i) => <p key={i}>{l}</p>)}
            <button onClick={handleCommit}>
              Bind Fate
            </button>
          </div>
        )}

        {st.s === "committed" && (
          <div className="ritual-text">
            <p>The choice is made.</p>
          </div>
        )}
      </div>
    </section>
  );
}

function LexemeChooser({ items, onPick }: { items: Lexeme[]; onPick: (l: Lexeme) => void; }) {
  if (items.length === 0) {
    return (
        <div className="chooser">
            <p>No words make themselves known to you.</p>
        </div>
    )
  }
  return (
    <div role="list" className="chooser">
      {items.map(l => (
        <button
          key={l.id}
          role="listitem"
          className={`lexeme lexeme--${l.tier}`}
          onClick={() => onPick(l)}
          aria-label={`${l.gloss}, ${l.tier}`}
        >
          <span className="lexeme__gloss">{l.gloss}</span>
          <span className="lexeme__tags">{l.tags.join(" · ")}</span>
        </button>
      ))}
    </div>
  );
}
