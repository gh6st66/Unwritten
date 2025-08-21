/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect, useState } from 'react';
import { getChronicleData } from '../../systems/chronicle';
import { ChronicleData } from '../../domain/states';
import { ProvenanceList } from './ProvenanceList';
import '../../styles/chronicle.css';

interface Props {
  onClose: () => void;
}

export const ChronicleHome: React.FC<Props> = ({ onClose }) => {
  const [data, setData] = useState<ChronicleData | null>(null);

  useEffect(() => {
    setData(getChronicleData());
  }, []);

  const sortedRuns = data ? Object.values(data.runs).sort((a, b) => b.startTs - a.startTs) : [];
  const sortedMasks = data ? Object.values(data.masks).sort((a,b) => b.provenance[0].ts - a.provenance[0].ts) : [];


  return (
    <div className="chronicle-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="chronicle-title">
      <div className="chronicle-content" onClick={(e) => e.stopPropagation()}>
        <button className="chronicle-close-button" onClick={onClose} aria-label="Close Chronicle">&times;</button>
        <h2 id="chronicle-title" className="chronicle-main-title">The Chronicle</h2>
        
        {data ? (
          <div className="chronicle-sections">
            <section>
              <h3 className="chronicle-section-title">Recorded Runs</h3>
              {sortedRuns.length > 0 ? (
                <ul className="chronicle-list">
                  {sortedRuns.map(run => (
                    <li key={run.runId} className="chronicle-item run-item">
                      <h4>Run: {run.seed}</h4>
                      <p>Started: {new Date(run.startTs).toLocaleString()}</p>
                      {run.endTs && <p>Ended: {new Date(run.endTs).toLocaleString()}</p>}
                      {run.outcome && <p>Outcome: {run.outcome}</p>}
                    </li>
                  ))}
                </ul>
              ) : <p className="empty-section-message">No runs have been recorded.</p>}
            </section>
            
            <section>
              <h3 className="chronicle-section-title">Forged Masks</h3>
              {sortedMasks.length > 0 ? (
               <ul className="chronicle-list">
                {sortedMasks.map(mask => (
                  <li key={mask.maskId} className="chronicle-item mask-item">
                    <h4>{mask.name}</h4>
                    <p className="mask-description">"{mask.description}"</p>
                    <ProvenanceList hops={mask.provenance} />
                  </li>
                ))}
              </ul>
              ) : <p className="empty-section-message">No masks have been forged.</p>}
            </section>
          </div>
        ) : (
          <p>The Chronicle is empty.</p>
        )}
      </div>
    </div>
  );
};
