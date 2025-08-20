import React from "react";
import { generateNarrative } from "../narrative/generate";
import { PCState, WorldCtx } from "../core/types";

type Props = {
  pc: PCState;
  world: WorldCtx;
  className?: string;
};

export const EncounterRenderer: React.FC<Props> = ({ pc, world, className }: Props) => {
  const text = React.useMemo(() => generateNarrative(pc, world), [pc, world]);
  return <p className={className} aria-live="polite">{text}</p>;
}
