import React, { useState, useMemo } from "react";
import { useRun } from "../context/RunContext";
import { Encounter, EncounterOption, MarkId, NarrativeMark, PCState, WorldCtx } from "../core/types";
import { IntentPreview } from "./IntentPreview";
import { Preview } from "../core/intent";
import { pickThought } from "../narrative/select";
import { THOUGHTS } from "../narrative/pools";

// A plausible mapping from the game's specific Marks to the narrative system's archetypes.
const markIdToNarrativeMark: Partial<Record<MarkId, NarrativeMark>> = {
    OATHBREAKER: "Betrayer",
    LOYALIST: "Oathbound",
    MERCIFUL: "Savior",
    CRUEL: "Monster",
    TRICKSTER: "Trickster",
    STEADFAST: "Witness",
    BRAVE: "Savior",
    COWARD: "Outcast",
};

export const NarrativeEventView: React.FC<{ encounter: Encounter }> = ({ encounter }) => {
  const { state } = useRun();
  const { choose, preview: getPreview } = useRun();
  const [preview, setPreview] = useState<{ optionId: string; score: Preview } | null>(null);

  const handlePreview = (option: EncounterOption) => {
    const score = getPreview(encounter.id, option.id);
    if (score) {
        setPreview({ optionId: option.id, score });
    }
  };

  const clearPreview = () => {
    setPreview(null);
  };
  
  const pcState: PCState = useMemo(() => {
    const pcMarks: Partial<Record<NarrativeMark, number>> = {};
    for (const mark of state.marks) {
        const narrativeMark = markIdToNarrativeMark[mark.id];
        if (narrativeMark) {
            // Use the highest tier if multiple game marks map to one narrative mark
            pcMarks[narrativeMark] = Math.max(pcMarks[narrativeMark] ?? -Infinity, mark.tier);
        }
    }

    return {
        marks: pcMarks,
        disp: {
            Aggression: state.traits.AGG,
            Cunning: state.traits.CUN,
            Wisdom: state.traits.WIS
        },
        echoes: [] // Mapping is ambiguous, leaving empty for now.
    };
  }, [state.marks, state.traits]);

  const worldCtx: WorldCtx = useMemo(() => {
    const currentRegionState = state.regions[state.locationId.split(':')[0]];
    let recognition: WorldCtx['recognition'] = 'Unknown';
    const notoriety = currentRegionState?.notoriety ?? 0;

    if (!state.mask.worn) {
        recognition = 'Known';
    } else if (notoriety > 25) {
        recognition = 'Suspected';
    }

    // Create a unique, deterministic seed for this specific encounter instance
    const encounterSeed = encounter.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

    return {
        scene: encounter.context?.scene ?? 'Street',
        npcRole: encounter.context?.npcRole ?? 'Guard',
        tension: Math.min(3, Math.floor(state.tension / 25)) as WorldCtx['tension'],
        recognition,
        seed: state.time + encounterSeed, // Combine time with a unique encounter hash
    };
  }, [state.locationId, state.tension, state.mask.worn, state.regions, state.time, encounter.id, encounter.context]);

  const thought = useMemo(() => pickThought(THOUGHTS, pcState, worldCtx), [pcState, worldCtx]);

  return (
    <div className="event">
      <h2>{encounter.title}</h2>
      <p>{encounter.summary} [{thought}]</p>
      <div className="options-container">
        <div className="options">
            {encounter.options.map(o => (
            <button
                key={o.id}
                onClick={() => choose(encounter.id, o.id)}
                onMouseEnter={() => handlePreview(o)}
                onMouseLeave={clearPreview}
                onFocus={() => handlePreview(o)}
                onBlur={clearPreview}
            >
                {o.label}
            </button>
            ))}
        </div>
        <div className="intent-preview-area">
            {preview && <IntentPreview kind={encounter.options.find(o => o.id === preview.optionId)!.intent} score={preview.score} />}
        </div>
      </div>
    </div>
  );
};