
import React, { useState } from "react";
import { useRun } from "../context/RunContext";
import { Encounter, EncounterOption } from "../core/types";
import { IntentPreview } from "./IntentPreview";
import { Preview } from "../core/intent";

export const NarrativeEventView: React.FC<{ encounter: Encounter }> = ({ encounter }) => {
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

  return (
    <div className="event">
      <h2>{encounter.title}</h2>
      <p>{encounter.summary}</p>
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
