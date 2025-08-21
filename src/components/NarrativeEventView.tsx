import React from 'react';

// This is a placeholder component.
// The original file was empty, which caused module resolution errors.
export const NarrativeEventView: React.FC<{ encounter: any }> = ({ encounter }) => {
    return (
        <div style={{border: '1px solid #ccc', padding: '10px', margin: '10px 0'}}>
            <h4>Encounter</h4>
            <p>{encounter?.prompt ?? 'No prompt available.'}</p>
        </div>
    );
};
