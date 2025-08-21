import React from 'react';
import { JournalClaim } from '../core/types';
import '../styles/journalView.css';

// Note: This component was using a `useRun` hook from a non-existent module.
// The hook has been removed to resolve the error. This component is not currently
// rendered by the main application.
export const JournalView: React.FC = () => {
    // const { state } = useRun();
    const activeClaims: JournalClaim[] = []; // Placeholder

    if (activeClaims.length === 0) {
        return (
            <div className="journal">
                <h3>The Ledger</h3>
                <p>No active claims.</p>
            </div>
        );
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
