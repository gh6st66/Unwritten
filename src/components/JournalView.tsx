import React from 'react';
import { useRun } from '../context/RunContext';
import { JournalClaim } from '../core/types';
import '../styles/journalView.css';

export const JournalView: React.FC = () => {
    const { state } = useRun();
    const activeClaims = Object.values(state.identity.activeClaims);

    if (activeClaims.length === 0) {
        return null;
    }

    return (
        <div className="journal">
            <h3>The Ledger</h3>
            <ul>
                {activeClaims.map((claim: JournalClaim) => (
                    <li key={claim.id}>
                        <p>{claim.text}</p>
                        <span className="severity">Severity: {claim.severity}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};
