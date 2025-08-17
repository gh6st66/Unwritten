/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { memo, useMemo } from "react";
import { CardInstance, ResourceCost, Discipline, CardDef, EffectDef, EffectType, EffectContext } from "../core/types";

type Props = {
  card: CardInstance;
  selected?: boolean;
  onClick?: (id:string) => void;
};

const CostDisplay: React.FC<{ cost: ResourceCost }> = memo(({ cost }) => {
    const costEntries = Object.entries(cost).filter(([, value]) => value && value > 0);
  
    if (costEntries.length === 0) {
      return <div className="card-lite__cost"></div>;
    }
  
    const costDots = costEntries.flatMap(([type, value]) =>
      Array(value).fill(type)
    );
  
    return (
      <div className="card-lite__cost">
        {costDots.map((type, index) => (
          <div key={index} className={`cost-dot ${type}`}></div>
        ))}
      </div>
    );
});

const formatDiscipline = (discipline: Discipline) => {
    if (!discipline || discipline === Discipline.NONE) return "Neutral";
    const str = discipline.toString();
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

const describeEffect = (effect: EffectDef): string | null => {
    // For card text, we only care about combat or any-context effects.
    if (effect.context !== EffectContext.COMBAT && effect.context !== EffectContext.ANY) {
        return null;
    }

    switch (effect.type) {
        case EffectType.DEAL_DAMAGE:
            return `Deal ${effect.value} damage.`;
        case EffectType.GAIN_BLOCK:
            return `Gain ${effect.value} block.`;
        case EffectType.DRAW_CARDS:
            return `Draw ${effect.value} card${(effect.value ?? 1) > 1 ? 's' : ''}.`;
        case EffectType.APPLY_STATUS:
            if (!effect.params || effect.params.length < 2) return null;
            const target = effect.params[0];
            const status = capitalize(effect.params[1]);
            const duration = effect.params[2] || effect.value || 1;
            if (target === 'SELF') return `Apply ${duration} ${status} to yourself.`;
            return `Apply ${duration} ${status}.`;
        case EffectType.GAIN_TEMP_RESOURCE:
            if (!effect.params || effect.params.length < 2) return null;
            const resource = capitalize(effect.params[0]);
            const amount = effect.params[1];
            return `Gain ${amount} ${resource}.`;
        case EffectType.SCRY:
            return `Scry ${effect.value}.`;
        case EffectType.DEAL_DAMAGE_PER_MISSING_HP:
            return `Deal ${effect.value} damage per missing Health.`;
        case EffectType.EXHAUST_ON_DRAW:
            return `Exhaust.`;
        case EffectType.UNPLAYABLE:
            return `Unplayable.`;
        case EffectType.LOWER_DIFFICULTY:
            if (effect.context === EffectContext.ANY) {
                return `Lower difficulty by ${effect.value}.`;
            }
            return null;
        case EffectType.TRIGGER_AI_NARRATIVE:
             return `Plead your case.`;
        default:
            return null;
    }
};

const describeCard = (cardDef: CardDef): string[] => {
    return cardDef.effects
        .map(effect => describeEffect(effect))
        .filter((desc): desc is string => desc !== null);
};


/**
 * Lightweight, layout-stable card view with fixed box size.
 * Styling and hover effects are done via CSS; no dynamic size changes.
 */
export const CardViewLite = memo(function CardViewLite({ card, selected, onClick }: Props) {
  const { def, instanceId } = card;
  const disabled = !onClick;
  
  const descriptionLines = useMemo(() => describeCard(def), [def]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick?.(instanceId);
    }
  };

  return (
    <div
      className={`card-lite ${selected ? "is-selected" : ""} ${disabled ? "is-disabled" : ""}`}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={`${def.name}: ${descriptionLines.join(' ')}`}
      aria-disabled={disabled}
      onClick={() => onClick?.(instanceId)}
      onKeyDown={handleKeyDown}
      data-discipline={formatDiscipline(def.discipline)}
      data-eventtypes={(def.event_types || []).join(",")}
    >
      <div className="card-lite__title">{def.name}</div>
      <div className="card-lite__meta">
        <CostDisplay cost={def.cost} />
        <span className="card-lite__disc">{formatDiscipline(def.discipline)}</span>
      </div>
      <div className="card-lite__body">
        {descriptionLines.map((line, index) => (
            <p key={index} className="card-lite__effect-text">{line}</p>
        ))}
      </div>
    </div>
  );
});

export default CardViewLite;