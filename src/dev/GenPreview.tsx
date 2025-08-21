import React, { useMemo } from "react";
import { FACTIONS_DATA } from "../data/factions";
import { WorldContext } from "../gen";
import { buildRegions } from "../services/worldGen";
import { buildNPCs } from "../services/npcGen";

async function initWorldForRun(seed: string) {
  const ctx: WorldContext = {
    seed,
    epoch: "Inquisition",
    gravity: "Order",
    knownFactions: FACTIONS_DATA,
  };
  const regions = buildRegions(ctx, 3);
  const ctxWithRegions: WorldContext = { ...ctx, knownRegions: regions.map(r => ({ id: r.id, name: r.name, biome: r.biome, climate: r.climate })) };
  const npcs = buildNPCs(ctxWithRegions, 6);

  return { regions, npcs, factions: FACTIONS_DATA };
}

export function GenPreview({ seed }: { seed: string }) {
  const [data, setData] = React.useState<any>(null);

  useMemo(() => {
    initWorldForRun(seed).then(setData);
  }, [seed]);

  if (!data) return <div>Generating preview...</div>;

  return (
    <pre aria-label="gen-preview" style={{ whiteSpace: "pre-wrap", padding: '1rem', background: '#222', fontSize: '12px' }}>
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}