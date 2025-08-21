/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from "react";
import type { ProvenanceHop } from "../../domain/states";
import '../../styles/chronicle.css';

export const ProvenanceList: React.FC<{ hops: ProvenanceHop[] }> = ({ hops }) => {
  return (
    <div className="provenance-list">
      <h5 className="provenance-title">Provenance</h5>
      {hops.map((h, i) => (
        <div key={i} className="provenance-hop">
          <div className="provenance-details">
            <span className="provenance-owner">Owner: {h.ownerId}</span>
            <span className="provenance-reason">({h.reason})</span>
          </div>
          <div className="provenance-ts">{new Date(h.ts).toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
};
