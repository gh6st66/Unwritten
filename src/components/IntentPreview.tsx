
import React from "react";
import { Intent } from "../core/types";
import { Preview } from "../core/intent";

export function IntentPreview({ kind, score }: { kind: Intent; score: Preview | null }) {
  if (!score) return null;

  const costString = Object.entries(score.projectedCosts)
    .filter(([,v]) => v && v > 0)
    .map(([k,v]) => `${k}:${v}`)
    .join(" ") || "None";

  return (
    <div className="intent-preview" aria-live="polite">
      <div className="intent-kind">{kind}</div>
      <div className="intent-detail">
        <span>Success</span>
        <span>{(score.chance * 100).toFixed(0)}%</span>
      </div>
       <div className="intent-detail">
        <span>Tension</span>
        <span>{(score.projectedTension).toFixed(0)}%</span>
      </div>
       <div className="intent-detail">
        <span>Cost</span>
        <span>{costString}</span>
      </div>
    </div>
  );
}
