import React, { useState } from "react";
import { useRun } from "../context/RunContext";
import { NarrativeEventView } from "./NarrativeEventView";
import { IntentBar } from "./IntentBar";
import { JournalView } from "./JournalView";
import { getMarkDef } from "../systems/Marks";
import { MaskCultureModal } from "./MaskCultureModal";

export const Game: React.FC = () => {
  const { state, availableEncounters, toggleMask, endRun } = useRun();
  const masked = state.identity.mask.wearing;
  const [showCultureModal, setShowCultureModal] = useState(false);

  const dispositions = Object.entries(state.identity.dispositions)
    .filter(([, value]) => value !== 0)
    .sort(([, a], [, b]) => Math.abs(b) - Math.abs(a));

  const handleEndRun = () => {
    endRun({
        reason: "choice",
        summaryLog: ["You chose to end this path.", "The world remembers."],
    });
  };

  return (
    <>
      <div className="game">
        <header className="hud">
          <div className="time">Run: {state.identity.generationIndex} | Time: {new Date(state.world.time).toLocaleString()}</div>
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
          <JournalView />
          <h3>Marks</h3>
          <ul>
            {state.identity.marks.length === 0 && <li>None</li>}
            {state.identity.marks.map(m => (
              <li key={m.id}>{getMarkDef(m.id).name} • intensity {m.intensity}</li>
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
          <button onClick={() => setShowCultureModal(true)} style={{marginTop: "20px", width: "100%"}}>Inspect Regional Masks</button>
          <button onClick={handleEndRun} style={{marginTop: "10px", width: "100%"}}>End Run (Dev)</button>
        </aside>
      </div>
      {showCultureModal && <MaskCultureModal state={state} onClose={() => setShowCultureModal(false)} />}
    </>
  );
};