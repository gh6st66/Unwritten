
import React, { useMemo, useState } from "react";
import { useRun } from "../context/RunContext";
import { flora } from "../data/flora";
import { forage } from "../systems/ForageEngine";

export const IntentBar: React.FC = () => {
  const { state, setState } = useRun();
  const regionId = state.location.split(":")[0] ?? "ashvale";
  const options = useMemo(() => flora.filter(f => f.regions.includes(regionId)), [regionId]);

  const [target, setTarget] = useState(options[0]?.id ?? "");
  const [hours, setHours] = useState(3);
  const [reveal, setReveal] = useState(false);
  const masked = state.identity.mask.wearing;

  const submit = () => {
    if (!target) {
      alert("Please select a target to forage.");
      return;
    }
    const { next, outcome } = forage(state, { itemId: target, hours, unmaskOnStart: reveal });
    setState(next);
    const log = outcome.map(o => "• " + o.log).join("\n");
    alert(log); // keep it simple; you’ll swap for a proper log panel later
  };

  return (
    <div className="intentbar">
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
        Remove mask on start:
        <input type="checkbox" checked={reveal} onChange={e => setReveal(e.target.checked)} />
      </label>
      <button onClick={submit}>Head out</button>
      <span className="hint">{masked ? "Currently masked" : "Currently unmasked"}</span>
    </div>
  );
};
