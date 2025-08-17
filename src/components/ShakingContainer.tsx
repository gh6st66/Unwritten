/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useRef, useEffect, useState } from 'react';
import { ShakeImpulse } from '../core/types';
import { time } from '../systems/TimeScale';

type ShakeImpulseWithKey = ShakeImpulse & { key: number; t0?: number };

interface ShakingContainerProps {
  children: React.ReactNode;
  impulse?: ShakeImpulseWithKey;
  multiplier?: number;
  className?: string;
}

// A simple pseudo-random number generator for deterministic noise if needed.
// For now, Math.random is sufficient.
const simpleNoise = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
};

export const ShakingContainer: React.FC<ShakingContainerProps> = ({ children, impulse, multiplier = 1.0, className }) => {
  const ref = useRef<HTMLDivElement>(null);
  const animRef = useRef<number | null>(null);
  const activeImpulses = useRef<ShakeImpulseWithKey[]>([]);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  // Listen for changes to the user's OS-level motion preference
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = () => setIsReducedMotion(mq.matches);
    handleChange(); // Initial check
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);
  
  // Reset transform if the tab becomes hidden to prevent visual jumps on return
  useEffect(() => {
      const handleVisibilityChange = () => {
          if (document.visibilityState !== 'visible' && ref.current) {
              ref.current.style.transform = "translate(0px, 0px)";
              if (animRef.current) {
                cancelAnimationFrame(animRef.current);
                animRef.current = null;
              }
              activeImpulses.current = [];
          }
      }
      document.addEventListener("visibilitychange", handleVisibilityChange);
      return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  useEffect(() => {
    if (!impulse || isReducedMotion) return;

    // Add the new impulse and start the animation loop if it's not already running
    activeImpulses.current.push({ ...impulse, t0: performance.now() });

    if (animRef.current) return; // Loop is already active

    let lastTime = performance.now();
    let simTime = lastTime;

    const loop = (t: number) => {
      const el = ref.current;
      if (!el) return;
      
      const dt = t - lastTime;
      lastTime = t;

      simTime += dt * time.animScale;

      // Prune expired impulses
      activeImpulses.current = activeImpulses.current.filter(s => t - (s.t0 ?? 0) < s.duration);

      let totalOffsetX = 0;
      let totalOffsetY = 0;

      for (const s of activeImpulses.current) {
        const elapsed = t - (s.t0 ?? 0);
        const decay = 1 - (elapsed / s.duration);
        const noise = simpleNoise(simTime * s.freq * 0.001); // Simple noise function

        totalOffsetX += ((noise * s.amp * decay) + (s.bias.x * 0.35 * decay)) * multiplier;
        totalOffsetY += ((noise * s.amp * decay) + (s.bias.y * 0.35 * decay)) * multiplier;
      }

      el.style.transform = `translate(${totalOffsetX.toFixed(2)}px, ${totalOffsetY.toFixed(2)}px)`;

      if (activeImpulses.current.length > 0) {
        animRef.current = requestAnimationFrame(loop);
      } else {
        // Animation finished, reset state
        el.style.transform = "translate(0px, 0px)";
        animRef.current = null;
      }
    };

    animRef.current = requestAnimationFrame(loop);

  }, [impulse, isReducedMotion, multiplier]);

  return <div className={`shaking-provider ${className || ''}`} ref={ref}>{children}</div>;
};
