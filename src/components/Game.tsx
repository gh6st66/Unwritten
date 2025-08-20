


import React, { useState } from "react";
import { useRun } from "../context/RunContext";
import { NarrativeEventView } from "./NarrativeEventView";
import { IntentBar } from "./IntentBar";
import { JournalView } from "./JournalView";
import { LOCATIONS } from "../data/locations";
import { LogView } from "./LogView";
import { Mark } from "../core/types";
import { TriangleMeter } from "./TriangleMeter";

export const Game: React.FC = () => {
  const { state } = useRun();
  const { availableEncounters } = useRun();
  const locationDef = LOCATIONS[state.locationId];

  const dispositions = Object.entries(state.dispositions)
    .filter(([, value]) => value !== 0)
    .sort(([, a], [, b]) => Math.abs(b) - Math.abs(a));

  return (
    <>
      <div className="game">
        <header className="hud">
          <div className="time">Location: {locationDef?.name ?? state.locationId} | Day: {Math.floor(state.time / 1440) + 1}</div>
          <div className="pools">
            <span>Energy {state.resources.energy.toFixed(0)}</span>
            <span>Clarity {state.resources.clarity.toFixed(0)}</span>
            <span>Will {state.resources.will.toFixed(0)}</span>
          </div>
          <div className="mask">
            {/* Mask toggle functionality to be re-implemented */}
            <button>{state.mask.worn ? "Remove Mask" : "Wear Mask"}</button>
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
            {state.marks.length === 0 && <li>None</li>}
            {state.marks.map((m: Mark) => (
              <li key={m.id}>{m.id} | Tier {m.tier > 0 ? '+' : ''}{m.tier} (XP: {m.xp})</li>
            ))}
          </ul>
          <h3>Dispositions</h3>
          <ul>
            {dispositions.length === 0 && <li>Neutral</li>}
            {dispositions.map(([key, value]) => (
              <li key={key}>{key}: {value.toFixed(2)}</li>
            ))}
          </ul>
          <h3>Traits</h3>
          <TriangleMeter
              className="h-48 w-48 mx-auto my-4"
              aggression={state.traits.AGG}
              wisdom={state.traits.WIS}
              cunning={state.traits.CUN}
              conviction={state.traits.AGG_WIS}
              guile={state.traits.AGG_CUN}
              insight={state.traits.WIS_CUN}
              unwrittenTokens={Math.floor(state.tension / 33.4)}
              unwrittenUnstable={state.tension > 75}
              maxScale={5}
              showNumbers={true}
            />
        </aside>
        <LogView />
      </div>
    </>
  );
};