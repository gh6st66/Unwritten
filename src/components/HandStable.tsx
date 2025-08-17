/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import CardViewLite from "./CardViewLite";
import { computeFanLayout } from "../systems/handLayout";
import { CardInstance } from "../core/types";

type HandCard = CardInstance & { __shake?: boolean; __disabled?: boolean };

type Props = {
  hand: HandCard[];
  onPlay: (instanceId: string) => void;
  cardSize?: { width: number; height: number }; // px
  reducedMotion?: boolean;
};

export function HandStable({ hand, onPlay, cardSize = { width: 120, height: 168 }, reducedMotion }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState<number>(360);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const next = Math.round(entry.contentRect.width);
        if (next > 0) {
          requestAnimationFrame(() => setWidth(next));
        }
      }
    });
    const initialWidth = Math.round(el.getBoundingClientRect().width);
    if (initialWidth > 0) {
      setWidth(initialWidth);
    }
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const transforms = useMemo(() => {
    return computeFanLayout(hand.length, {
      containerWidth: width,
      cardWidth: cardSize.width,
      cardHeight: cardSize.height,
      maxSpreadDeg: 28,
      maxHorizontalSpread: Math.min(640, width * 0.95),
      lift: 18,
      overlap: 52,
    });
  }, [hand.length, width, cardSize.width, cardSize.height]);

  const handlePlay = useCallback((id: string) => onPlay(id), [onPlay]);

  return (
    <div className="hand-wrap">
      <div className="hand-container" ref={containerRef} style={{ height: cardSize.height + 24 }}>
        {hand.map((card, i) => {
          const t = transforms[i];
          if (!t) return null;
          
          const style: React.CSSProperties = reducedMotion
            ? {
                transform: `translate(${t.x}px, 0px)`,
                zIndex: t.z,
                width: cardSize.width,
                height: cardSize.height,
              }
            : {
                transform: `translate(${t.x}px, ${t.y}px) rotate(${t.r}deg) scale(${t.scale})`,
                zIndex: t.z,
                width: cardSize.width,
                height: cardSize.height,
              };
          return (
            <div
              key={card.instanceId}
              className={`hand-slot ${card.__shake ? 'shake' : ''} ${card.__disabled ? 'is-locked' : ''}`}
              style={style}
              data-focus={t.focus ? "1" : "0"}
            >
              <CardViewLite card={card} onClick={card.__disabled ? undefined : handlePlay} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default HandStable;
