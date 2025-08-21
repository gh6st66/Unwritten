import React, { createContext, useContext } from 'react';

// Using `any` for state is a temporary measure to fix module resolution errors.
const RunContext = createContext<any>(undefined);

export const useRun = () => {
    const context = useContext(RunContext);
    if (context === undefined) {
        // Provide a default mock value for components that might be rendered
        // outside of a RunProvider, to prevent crashes during development.
        return {
            state: {
                identity: {
                    mask: { wearing: false },
                    dispositions: {},
                    marks: [],
                    generationIndex: 1,
                    activeClaims: {},
                },
                world: { time: new Date().toISOString() },
                resources: {
                    energy: 100,
                    maxEnergy: 100,
                    clarity: 100,
                    maxClarity: 100,
                    will: 100,
                    maxWill: 100,
                },
                inventory: { items: {} },
            },
            availableEncounters: [],
            toggleMask: () => { console.warn("toggleMask called on mock RunContext"); },
            endRun: () => { console.warn("endRun called on mock RunContext"); },
        };
    }
    return context;
};

export const RunProvider: React.FC<{ children: React.ReactNode; value: any }> = ({ children, value }) => {
    return <RunContext.Provider value={value}>{children}</RunContext.Provider>;
};
