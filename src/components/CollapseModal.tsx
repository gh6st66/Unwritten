import React from "react";
import '../styles/collapseModal.css';

interface Props {
  open: boolean;
  reason: "defeat" | "entropy" | "choice" | "escape";
  summaryLog: string[];
  onContinue: () => void; // begins next run
}

export default function CollapseModal({ open, reason, summaryLog, onContinue }: Props) {
  if (!open) return null;
  return (
    <div className="collapse-modal-backdrop" aria-modal="true" role="dialog">
      <div className="collapse-modal-content">
        <h2>Run Collapsed</h2>
        <p className="collapse-reason">Reason: {reason}</p>
        <div className="collapse-log">
          {summaryLog.length > 0 
            ? summaryLog.map((line, i) => (<div key={i}>{line}</div>))
            : <div>The Unwritten's path ends... for now.</div>
          }
        </div>
        <button className="collapse-continue-button" onClick={onContinue}>
          Inherit Echoes
        </button>
      </div>
    </div>
  );
}