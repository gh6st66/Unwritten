
import React from "react";
import { useRun } from "../context/RunContext";
import { NarrativeEventView } from "./NarrativeEventView";
import { IntentBar } from "./IntentBar";

export const Game: React.FC = () => {
  const { state, availableEncounters, toggleMask } = useRun();
  const masked = state.identity.mask.wearing;

  const dispositions = Object.entries(state.identity.dispositions)
    .filter(([, value]) => value !== 0)
    .sort(([, a], [, b]) => Math.abs(b) - Math.abs(a));

  return (
    <div className="game">
      <header className="hud">
        <div className="time">Time: {new Date(state.world.time).toLocaleString()}</div>
        <div className="pools">
          <span>Energy {state.resources.energy.toFixed(0)}/{state.resources.maxEnergy}</span>
          <span>Clarity {state.resources.clarity.toFixed(0)}/{state.resources.maxClarity}</span>
          <span>Will {state.resources.will.toFixed(0)}/{state.resources.maxWill}</span>
        </div>
        <div className="mask">
          <button onClick={toggleMask}>{masked ? "Remove Mask" : "Wear Mask"}</button>
        </div>
      </header>

      <section className="tools">
        <IntentBar />
      </section>

      <main>
        {availableEncounters.length === 0 ? (
          <p>No encounters right now. Travel, rest, or wait to progress time.</p>
        ) : (
          availableEncounters.map(enc => <NarrativeEventView key={enc.id} encounter={enc} />)
        )}
      </main>

      <aside className="marks">
        <h3>Marks</h3>
        <ul>
          {Object.values(state.identity.marks).length === 0 && <li>None</li>}
          {Object.values(state.identity.marks).map(m => (
            <li key={m.id}>{m.label} • strength {m.strength}</li>
          ))}
        </ul>
        <h3>Dispositions</h3>
        <ul>
          {dispositions.length === 0 && <li>Neutral</li>}
          {dispositions.map(([key, value]) => (
            <li key={key}>{key}: {value.toFixed(2)}</li>
          ))}
        </ul>
        <h3>Inventory</h3>
        <ul>
          {Object.values(state.inventory?.items ?? {}).length === 0 && <li>Empty</li>}
          {Object.values(state.inventory?.items ?? {}).map(it => (
            <li key={it.id}>{it.label} × {it.qty}</li>
          ))}
        </ul>
      </aside>
    </div>
  );
};
