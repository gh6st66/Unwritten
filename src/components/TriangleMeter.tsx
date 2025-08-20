import * as React from "react";

export type TriangleMeterProps = {
  aggression: number;
  wisdom: number;
  cunning: number;

  conviction?: number;
  guile?: number;
  insight?: number;

  unwrittenTokens?: number;     // 0–3 only
  unwrittenUnstable?: boolean;  // adds pulse if true
  maxScale?: number;            // default 3
  className?: string;
  showNumbers?: boolean;
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
  className = "",
  showNumbers = false,
}) => {
  const clamp = (v: number, lo: number, hi: number) =>
    Math.max(lo, Math.min(hi, v));

  const A = clamp(aggression, 0, maxScale);
  const W = clamp(wisdom, 0, maxScale);
  const C = clamp(cunning, 0, maxScale);

  const Conv = clamp(conviction ?? Math.floor((A + W) / 2), 0, maxScale);
  const Gui = clamp(guile ?? Math.floor((A + C) / 2), 0, maxScale);
  const Ins = clamp(insight ?? Math.floor((W + C) / 2), 0, maxScale);

  const uwTokens = clamp(unwrittenTokens ?? 0, 0, 3);
  const uwPulse = unwrittenUnstable && uwTokens > 0;

  // Coordinates
  const cx = 50,
    cy = 50,
    R = 42;
  const angles = { A: -90, W: 150, C: 30 }; // Corrected angles: Aggression=top, Wisdom=bl, Cunning=br
  const toXY = (r: number, deg: number) => {
    const rad = (deg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };
  const vr = (v: number) => (R * v) / maxScale;

  const vA = toXY(R, angles.A);
  const vW = toXY(R, angles.W);
  const vC = toXY(R, angles.C);

  const pA = toXY(vr(A), angles.A);
  const pW = toXY(vr(W), angles.W);
  const pC = toXY(vr(C), angles.C);

  const midpoint = (p1: { x: number; y: number }, p2: { x: number; y: number }) => ({
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
  });
  const edgeTick = (p1: any, p2: any, level: number, color: string) => {
    const m = midpoint(p1, p2);
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -(dy / len);
    const ny = dx / len;
    const mag = 4 + level * 2;
    return (
      <line
        x1={m.x - nx * mag}
        y1={m.y - ny * mag}
        x2={m.x + nx * mag}
        y2={m.y + ny * mag}
        stroke={color}
        strokeWidth={2}
      />
    );
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 100 100" className="block">
        {/* Triangle outline */}
        <polygon
          points={`${vA.x},${vA.y} ${vW.x},${vW.y} ${vC.x},${vC.y}`}
          stroke="black"
          strokeWidth={1.25}
          fill="transparent"
        />

        {/* Radar fill */}
        <polygon
          points={`${pA.x},${pA.y} ${pW.x},${pW.y} ${pC.x},${pC.y}`}
          fill="url(#triangleGradient)"
          opacity={0.25}
        />
        <defs>
          <linearGradient id="triangleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#dc2626" />   {/* red */}
            <stop offset="50%" stopColor="#2563eb" />  {/* blue */}
            <stop offset="100%" stopColor="#eab308" /> {/* yellow */}
          </linearGradient>
        </defs>

        {/* Hybrid ticks */}
        {edgeTick(vA, vW, Conv, "#9333ea" /* purple */)}
        {edgeTick(vA, vC, Gui, "#f97316" /* orange */)}
        {edgeTick(vW, vC, Ins, "#22c55e" /* green */)}

        {/* Vertices */}
        <circle cx={vA.x} cy={vA.y} r={3} fill="#dc2626" />
        <circle cx={vW.x} cy={vW.y} r={3} fill="#2563eb" />
        <circle cx={vC.x} cy={vC.y} r={3} fill="#eab308" />

        {/* Unwritten center */}
        <circle cx={cx} cy={cy} r={3} fill="black" />
        {Array.from({ length: uwTokens }).map((_, i) => (
          <circle
            key={`uw-${i}`}
            cx={cx}
            cy={cy}
            r={6 + i * 4}
            stroke="black"
            strokeWidth={1.25}
            fill="none"
          />
        ))}
        {uwPulse && (
          <circle
            cx={cx}
            cy={cy}
            r={6 + uwTokens * 4 + 3}
            className="animate-ping"
            fill="rgba(0,0,0,0.1)"
          />
        )}
      </svg>

      {/* Labels */}
      <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-xs font-medium text-red-500">
        Aggression {showNumbers && `(${A})`}
      </div>
      <div className="absolute bottom-0 left-0 text-xs font-medium text-blue-500">
        Wisdom {showNumbers && `(${W})`}
      </div>
      <div className="absolute bottom-0 right-0 text-xs font-medium text-yellow-500">
        Cunning {showNumbers && `(${C})`}
      </div>
      <div className="absolute top-[26%] left-[16%] -translate-x-1/2 -translate-y-1/2 text-[10px] text-purple-500">
        Conv {showNumbers && `(${Conv})`}
      </div>
      <div className="absolute top-[26%] right-[16%] translate-x-1/2 -translate-y-1/2 text-[10px] text-orange-500">
        Guile {showNumbers && `(${Gui})`}
      </div>
      <div className="absolute bottom-[18%] left-1/2 -translate-x-1/2 text-[10px] text-green-500">
        Insight {showNumbers && `(${Ins})`}
      </div>
      <div className="absolute left-1/2 top-1/2 translate-y-5 -translate-x-1/2 text-[10px] font-semibold text-black dark:text-zinc-200">
        Unwritten {uwTokens}/3
      </div>
    </div>
  );
};