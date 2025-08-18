import React, { useState } from "react";
import { useRun } from "../context/RunContext";
import { EncounterDef, EncounterOption } from "../core/types";
import { IntentContext, scoreIntent, IntentScore } from "../systems/intent/IntentEngine";
import { IntentPreview } from "./IntentPreview";

export const NarrativeEventView: React.FC<{ encounter: EncounterDef }> = ({ encounter }) => {
  const { choose, state } = useRun();
  const masked = state.identity.mask.wearing;
  const [preview, setPreview] = useState<{ optionId: string; score: IntentScore } | null>(null);

  const handlePreview = (option: EncounterOption) => {
    if (option.intent) {
      const context: IntentContext = {
        runState: state,
        optionCostMult: option.intent.costMult,
        optionRiskDelta: option.intent.riskDelta,
        optionSubtletyDelta: option.intent.subtletyDelta,
        successCap: option.intent.successCap
      };
      const score = scoreIntent(option.intent.kind, context);
      setPreview({ optionId: option.id, score });
    }
  };

  const clearPreview = () => {
    setPreview(null);
  };

  return (
    <div className="event">
      <h2>{encounter.title}</h2>
      <p>{encounter.prose}</p>
      <div className="options-container">
        <div className="options">
            {encounter.options.map(o => (
            <button
                key={o.id}
                onClick={() => choose(encounter.id, o.id)}
                disabled={o.requiresUnmasked && masked}
                title={o.requiresUnmasked && masked ? "Requires removing the mask" : ""}
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
            {preview && <IntentPreview kind={encounter.options.find(o => o.id === preview.optionId)?.intent?.kind!} score={preview.score} />}
        </div>
      </div>
    </div>
  );
};