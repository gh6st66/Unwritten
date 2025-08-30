import React, { useMemo } from 'react';
import { getChronicleData } from '../systems/chronicle';
import { calculateBias } from '../chronicle/bias';
import { generateSummary } from '../chronicle/summary';
import '../styles/inGameChronicle.css';

interface Props {
  onClose: () => void;
}

export const InGameChronicle: React.FC<Props> = ({ onClose }) => {
  const chronicleData = useMemo(() => getChronicleData(), []);

  const lastRun = useMemo(() => {
    if (!chronicleData || Object.keys(chronicleData.runs).length === 0) return null;
    return Object.values(chronicleData.runs)
      .filter(r => r.endTs) // Only completed runs
      .sort((a, b) => b.startTs - a.startTs)[0];
  }, [chronicleData]);

  const summary = useMemo(() => {
    if (!lastRun) return ["No previous run recorded."];
    return generateSummary(lastRun, chronicleData.events);
  }, [lastRun, chronicleData]);
  
  const bias = useMemo(() => {
    return calculateBias(chronicleData.events);
  }, [chronicleData]);

  return (
    <div className="ingame-chronicle-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="ingame-chronicle-content" onClick={(e) => e.stopPropagation()}>
        <header className="ingame-chronicle-header">
          <h2>The Chronicle</h2>
          <button onClick={onClose} aria-label="Close">&times;</button>
        </header>
        <div className="ingame-chronicle-body">
          <section>
            <h3 className="panel-header">Last Run Highlights</h3>
            <div className="summary-log">
              {summary.map((line, i) => <p key={i}>{line}</p>)}
            </div>
          </section>
          <section>
            <h3 className="panel-header">Active Echoes</h3>
            <p className="bias-description">Your past actions have left an imprint on this world, creating the following biases:</p>
            {Object.keys(bias.factionStanceDeltas).length > 0 ? (
                <ul className="bias-list">
                    {/* FIX: Cast `value` to number to resolve type errors. */}
                    {Object.entries(bias.factionStanceDeltas).map(([key, value]) => {
                        const numericValue = value as number;
                        return (
                            <li key={key}><strong>{key.split(':')[1]}</strong> stance towards <strong>{key.split(':')[0]}</strong>: {numericValue > 0 ? '+' : ''}{numericValue.toFixed(2)}</li>
                        );
                    })}
                </ul>
            ) : <p className="empty-section-message">The world feels no strong echoes from your past.</p> }
          </section>
        </div>
      </div>
    </div>
  );
};