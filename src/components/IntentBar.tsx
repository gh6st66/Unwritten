import React, { useMemo, useState } from "react";
import { useRun } from "../context/RunContext";
import { flora } from "../data/flora";
import { LOCATIONS } from "../data/locations";
import { ForageParams } from "../systems/ForageEngine";

type Action = 'forage' | 'travel' | 'rest';

const ForagePanel: React.FC = () => {
    const { state, forage } = useRun();
    const regionId = state.locationId.split(":")[0] ?? "ashvale";
    const options = useMemo(() => flora.filter(f => f.regions.includes(regionId)), [regionId]);
  
    const [target, setTarget] = useState(options[0]?.id ?? "");
    const [hours, setHours] = useState(3);
    const [reveal, setReveal] = useState(false);
    const masked = state.mask.worn;
  
    const submit = () => {
      if (!target) {
        // A log message could be pushed here in a more robust implementation
        return;
      }
      forage({ itemId: target, hours, unmaskOnStart: reveal });
    };
  
    return (
        <>
            <label>
                Forage:
                <select value={target} onChange={e => setTarget(e.target.value)}>
                {options.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                </select>
            </label>
            <label>
                Hours: {hours}
                <input type="range" min={1} max={8} value={hours} onChange={e => setHours(parseInt(e.target.value, 10))} />
            </label>
            <label title="Removing the mask increases recognition risk">
                Reveal:
                <input type="checkbox" checked={reveal} onChange={e => setReveal(e.target.checked)} />
            </label>
            <button onClick={submit}>Go</button>
            <span className="hint">{masked ? "Currently masked" : "Currently unmasked"}</span>
        </>
    );
};

const TravelPanel: React.FC = () => {
    const { state, travel } = useRun();
    const locationDef = LOCATIONS[state.locationId];
    
    if (!locationDef) return <div>Invalid location...</div>

    return (
        <div className="travel-buttons">
            {locationDef.connections.map(c => (
                <button 
                    key={c.to} 
                    onClick={() => travel(c.to, c.willCost)}
                    title={`${c.timeCost.amount} ${c.timeCost.unit}, ${c.willCost} Will`}
                    disabled={(state.resources.will ?? 0) < c.willCost}
                >
                    {c.label}
                </button>
            ))}
        </div>
    );
};

const RestPanel: React.FC = () => {
    const { rest } = useRun();
    const [hours, setHours] = useState(4);
    
    return (
        <>
            <label>
                Rest for {hours} hours
                <input type="range" min={1} max={12} value={hours} onChange={e => setHours(parseInt(e.target.value, 10))} />
            </label>
            <button onClick={() => rest(hours)}>Rest</button>
        </>
    );
};

export const IntentBar: React.FC = () => {
  const [activeAction, setActiveAction] = useState<Action>('travel');

  return (
    <div className="actions-panel">
        <div className="action-tabs">
            <button onClick={() => setActiveAction('forage')} className={activeAction === 'forage' ? 'active' : ''}>Forage</button>
            <button onClick={() => setActiveAction('travel')} className={activeAction === 'travel' ? 'active' : ''}>Travel</button>
            <button onClick={() => setActiveAction('rest')} className={activeAction === 'rest' ? 'active' : ''}>Rest</button>
        </div>
        <div className="action-content">
            {activeAction === 'forage' && <ForagePanel />}
            {activeAction === 'travel' && <TravelPanel />}
            {activeAction === 'rest' && <RestPanel />}
        </div>
    </div>
  );
};