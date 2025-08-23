/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from "react";
import { MaskSpec } from "../game/types";
import { MaskForger } from "../systems/MaskForger";
import { TesterMask } from "../game/types";
import { materials, forges, words, conditions, motifs, auras, presentations } from '../data/testerOptions';
import '../styles/generationTester.css';

const pickRandom = <T,>(arr: T[] | readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];

const INITIAL_SPEC: MaskSpec = {
  material: materials[0],
  forge: forges[0],
  intent: "Aggression",
  word: words[0],
  condition: conditions[0],
  motif: motifs[0],
  aura: auras[0],
  presentation: presentations[0],
};

export default function GenerationTester({ onClose }: { onClose: () => void; }) {
  const [spec, setSpec] = useState<MaskSpec>(INITIAL_SPEC);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TesterMask | null>(null);

  function set<K extends keyof MaskSpec>(k: K, v: string) {
    setSpec(s => ({ ...s, [k]: v as any }));
  }

  function randomize() {
    setSpec({
        material: pickRandom(materials),
        forge: pickRandom(forges),
        intent: pickRandom(["Aggression", "Wisdom", "Cunning"]),
        word: pickRandom(words),
        condition: pickRandom(conditions),
        motif: pickRandom(motifs),
        aura: pickRandom(auras),
        presentation: pickRandom(presentations),
    });
  }

  async function onGen() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const maskForger = new MaskForger();
      const mask = await maskForger.forgeFromSpec(spec, true); // Generate image
      setResult(mask);
      if (mask.error) {
        setError(mask.error);
      }
    } catch (e: any) {
      setError(e?.message ?? "Generation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="tester">
      <header>
        <h2>Generation Tester</h2>
        <button onClick={onClose}>Back</button>
      </header>

      <div className="form">
        <label>Material
          <select value={spec.material} onChange={e => set("material", e.target.value)}>
            {materials.map(o => <option key={o}>{o}</option>)}
          </select>
        </label>
        <label>Forge
          <select value={spec.forge} onChange={e => set("forge", e.target.value)}>
            {forges.map(o => <option key={o}>{o}</option>)}
          </select>
        </label>
        <label>Intent
          <select value={spec.intent} onChange={e => set("intent", e.target.value)}>
            <option>Aggression</option>
            <option>Wisdom</option>
            <option>Cunning</option>
          </select>
        </label>
        <label>Word
          <select value={spec.word} onChange={e => set("word", e.target.value)}>
            {words.map(o => <option key={o}>{o}</option>)}
          </select>
        </label>
        <label>Condition
          <select value={spec.condition} onChange={e => set("condition", e.target.value)}>
            {conditions.map(o => <option key={o}>{o}</option>)}
          </select>
        </label>
        <label>Motif
          <select value={spec.motif} onChange={e => set("motif", e.target.value)}>
            {motifs.map(o => <option key={o}>{o}</option>)}
          </select>
        </label>
        <label>Aura
          <select value={spec.aura} onChange={e => set("aura", e.target.value)}>
            {auras.map(o => <option key={o}>{o}</option>)}
          </select>
        </label>
        <label>Presentation
          <select value={spec.presentation} onChange={e => set("presentation", e.target.value)}>
            {presentations.map(o => <option key={o}>{o}</option>)}
          </select>
        </label>
      </div>

      <div className="actions">
        <button disabled={loading} onClick={randomize}>Randomize</button>
        <button disabled={loading} onClick={onGen}>Generate</button>
      </div>

      {loading && <div className="loading-indicator"><div className="spinner"></div><p>Generating...</p></div>}
      {error && <p className="error">Error: {error}</p>}

      {result && (
        <div className="result-grid">
          <div className="result-text">
            <h3>{result.name}</h3>
            <p>"{result.description}"</p>
            <h4>Granted Marks</h4>
            <ul>
              {result.grantedMarks.map(m => <li key={m.id}>{m.label} (+{m.value})</li>)}
            </ul>
            {result.themeOfFate && <h4>{result.themeOfFate.label}</h4>}
            <details>
              <summary>Text Prompt</summary>
              <pre>{result.textPrompt}</pre>
            </details>
            <details>
              <summary>Image Prompt</summary>
              <pre>{result.imagePrompt}</pre>
            </details>
          </div>
          <div className="result-image">
            {result.imageUrl ? (
              <img src={result.imageUrl} alt={result.name} />
            ) : (
              <div className="no-image">No image generated.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}