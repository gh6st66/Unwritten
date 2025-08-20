
import React from 'react';
import { useRun } from '../context/RunContext';
import '../styles/journalView.css';

export const JournalView: React.FC = () => {
    const { state } = useRun();
    const { claim } = state;

    if (!claim) {
        return null;
    }

    return (
        <div className="journal">
            <h3>The Ledger</h3>
            <ul>
                <li>
                    <p>{claim.text}</p>
                    <span className="severity">Gravity: {claim.gravity}</span>
                </li>
            </ul>
        </div>
    );
};
