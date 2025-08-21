import * as React from "react";

type Mode = "light" | "dark" | "parchment";

export type TriangleMeterProps = {
  aggression: number;
  wisdom: number;
  cunning: number;

  conviction?: number;
  guile?: number;
  insight?: number;

  unwrittenTokens?: number;     // 0–3
  unwrittenUnstable?: boolean;  // pulse halo
  maxScale?: number;            // default 3
  showNumbers?: boolean;
  mode?: Mode;                  // visual theme
};

export const TriangleMeter: React.FC<TriangleMeterProps> = ({
  aggression,
  wisdom,
  cunning,
  conviction,
  guile,
  insight,
  unwrittenTokens = 0,
  unwrittenUnstable = false,
  maxScale = 3,
  showNumbers = false,
  mode = "dark",
}) => {
  const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

  const A = clamp(aggression, 0, maxScale);
  const W = clamp(wisdom, 0, maxScale);
  const C = clamp(cunning, 0, maxScale);

  const Conv = clamp(conviction ?? Math.floor((A + W) / 2), 0, maxScale);
  const Gui  = clamp(guile      ?? Math.floor((A + C) / 2), 0, maxScale);
  const Ins  = clamp(insight    ?? Math.floor((W + C) / 2), 0, maxScale);

  const uwTokens = clamp(unwrittenTokens ?? 0, 0, 3);
  const uwPulse  = unwrittenUnstable && uwTokens > 0;

  // Geometry
  const cx = 50, cy = 50, R = 42;
  const angles = { A: 90, W: 210, C: -30 };
  const toXY = (r: number, deg: number) => {
    const rad = (deg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };
  const vr = (v: number) => (R * v) / maxScale;

  const vA = toXY(R, angles.A), vW = toXY(R, angles.W), vC = toXY(R, angles.C);
  const pA = toXY(vr(A), angles.A), pW = toXY(vr(W), angles.W), pC = toXY(vr(C), angles.C);

  const midpoint = (p1: {x:number;y:number}, p2:{x:number;y:number}) => ({ x:(p1.x+p2.x)/2, y:(p1.y+p2.y)/2 });
  const edgeTick = (p1:any, p2:any, level:number, color:string, strokeAlpha=1) => {
    const m = midpoint(p1, p2);
    const dx = p2.x - p1.x, dy = p2.y - p1.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -(dy/len), ny = dx/len;
    const mag = 4 + level * 2;
    return (
      <line
        x1={m.x - nx * mag}
        y1={m.y - ny * mag}
        x2={m.x + nx * mag}
        y2={m.y + ny * mag}
        stroke={applyAlpha(color, strokeAlpha)}
        strokeWidth={2}
        strokeLinecap="round"
      />
    );
  };

  // Palette (RGB split)
  const col = {
    agg: "#dc2626",            // red
    wis: "#2563eb",            // blue
    cun: "#eab308",            // yellow
    conv: "#9333ea",           // purple
    guile: "#f97316",          // orange
    insight: "#22c55e",        // green
    unwritten: "#000000",      // black
  };

  // Theme accents
  const t = theme(mode);

  return (
    <div
      className={[
        "relative inline-flex items-center justify-center rounded-2xl",
        mode === "parchment" ? "p-3 bg-[#f7f3e8] ring-1 ring-[#d6cfbf]" : "",
      ].join(" ")}
      aria-label="Trait meter"
    >
      <svg viewBox="0 0 100 100" className="block">
        {/* defs: gradient + soft noise mask for parchment mode */}
        <defs>
          <linearGradient id="triangleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor={col.agg}/>
            <stop offset="50%"  stopColor={col.wis}/>
            <stop offset="100%" stopColor={col.cun}/>
          </linearGradient>
          <filter id="grain" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" result="noise"/>
            <feColorMatrix type="saturate" values={mode==="parchment" ? "0.2" : "0"}/>
            <feBlend mode="multiply" in="SourceGraphic" in2="noise"/>
          </filter>
        </defs>

        {/* Grid rings for readability */}
        {Array.from({ length: maxScale - 1 }).map((_, i) => {
          const lvl = i + 1;
          const qA = toXY(vr(lvl), angles.A), qW = toXY(vr(lvl), angles.W), qC = toXY(vr(lvl), angles.C);
          return (
            <polygon
              key={`grid-${lvl}`}
              points={`${qA.x},${qA.y} ${qW.x},${qW.y} ${qC.x},${qC.y}`}
              stroke={t.grid}
              strokeWidth={0.75}
              fill="none"
            />
          );
        })}

        {/* Outer triangle */}
        <polygon
          points={`${vA.x},${vA.y} ${vW.x},${vW.y} ${vC.x},${vC.y}`}
          stroke={t.frame}
          strokeWidth={1.25}
          fill="none"
        />

        {/* Radar fill */}
        <polygon
          points={`${pA.x},${pA.y} ${pW.x},${pW.y} ${pC.x},${pC.y}`}
          fill="url(#triangleGradient)"
          opacity={t.fillOpacity}
          filter={mode==="parchment" ? "url(#grain)" : undefined}
        />
        {/* Radar border */}
        <polyline
          points={`${pA.x},${pA.y} ${pW.x},${pW.y} ${pC.x},${pC.y} ${pA.x},${pA.y}`}
          stroke={t.radar}
          strokeWidth={1.5}
          fill="none"
        />

        {/* Hybrid ticks */}
        {edgeTick(vA, vW, Conv, col.conv, t.hybridAlpha)}
        {edgeTick(vA, vC, Gui,  col.guile, t.hybridAlpha)}
        {edgeTick(vW, vC, Ins,  col.insight, t.hybridAlpha)}

        {/* Vertices */}
        <circle cx={vA.x} cy={vA.y} r={3} fill={col.agg}/>
        <circle cx={vW.x} cy={vW.y} r={3} fill={col.wis}/>
        <circle cx={vC.x} cy={vC.y} r={3} fill={col.cun}/>

        {/* Unwritten */}
        <circle cx={cx} cy={cy} r={3} fill={t.unwrittenCore}/>
        {Array.from({ length: uwTokens }).map((_, i) => (
          <circle key={`uw-${i}`} cx={cx} cy={cy} r={6 + i * 4} stroke={t.unwrittenRing} strokeWidth={1.25} fill="none"/>
        ))}
        {uwPulse && (
          <circle
            cx={cx}
            cy={cy}
            r={6 + uwTokens * 4 + 3}
            className="animate-ping"
            fill={t.unwrittenPulse}
          />
        )}
      </svg>

      {/* Labels */}
      <Label className="top-0 left-1/2 -translate-x-1/2" color={col.agg} text={`Aggression${showNumbers?` (${A})`:``}`}/>
      <Label className="bottom-0 left-0"               color={col.wis} text={`Wisdom${showNumbers?` (${W})`:``}`}/>
      <Label className="bottom-0 right-0 text-right"   color={col.cun} text={`Cunning${showNumbers?` (${C})`:``}`}/>

      <SubLabel className="top-[30%] left-[15%]"        color={col.conv}    text={`Conv${showNumbers?` (${Conv})`:``}`}/>
      <SubLabel className="top-[30%] right-[15%]"       color={col.guile}   text={`Guile${showNumbers?` (${Gui})`:``}`}/>
      <SubLabel className="bottom-[20%] left-1/2 -translate-x-1/2" color={col.insight} text={`Insight${showNumbers?` (${Ins})`:``}`}/>

      <div className="absolute left-1/2 top-1/2 translate-y-5 -translate-x-1/2 text-[10px] font-semibold" style={{color:t.text}}>
        Unwritten {uwTokens}/3
      </div>
    </div>
  );
};

// ---------- helpers ----------

const Label: React.FC<{className?:string;color:string;text:string}> = ({className="", color, text}) => (
  <div className={`absolute text-xs font-medium ${className}`} style={{color}}>{text}</div>
);

const SubLabel: React.FC<{className?:string;color:string;text:string}> = ({className="", color, text}) => (
  <div className={`absolute text-[10px] ${className}`} style={{color}}>{text}</div>
);

function applyAlpha(hex: string, a: number) {
  // hex like #rrggbb -> rgba
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!m) return hex;
  const [_, r, g, b] = m;
  return `rgba(${parseInt(r,16)},${parseInt(g,16)},${parseInt(b,16)},${a})`;
}

function theme(mode: Mode) {
  if (mode === "parchment") {
    return {
      text: "#262522",
      frame: "#6b5d43",
      grid: applyAlpha("#6b5d43", 0.35),
      radar: applyAlpha("#1f2937", 0.65),
      fillOpacity: 0.20,
      hybridAlpha: 0.95,
      unwrittenCore: "#111111",
      unwrittenRing: "#111111",
      unwrittenPulse: "rgba(17,17,17,0.08)",
    };
  }
  if (mode === "light") {
    return {
      text: "#1f2937",
      frame: "#111827",
      grid: "rgba(17,24,39,0.25)",
      radar: "rgba(17,24,39,0.75)",
      fillOpacity: 0.22,
      hybridAlpha: 1,
      unwrittenCore: "#000000",
      unwrittenRing: "#111111",
      unwrittenPulse: "rgba(0,0,0,0.08)",
    };
  }
  // dark
  return {
    text: "#e5e7eb",
    frame: "#d1d5db",
    grid: "rgba(229,231,235,0.25)",
    radar: "rgba(229,231,235,0.85)",
    fillOpacity: 0.18,
    hybridAlpha: 1,
    unwrittenCore: "#ffffff",
    unwrittenRing: "#ffffff",
    unwrittenPulse: "rgba(255,255,255,0.1)",
  };
}
