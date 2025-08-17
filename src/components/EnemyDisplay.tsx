/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { EnemyInstance, GameEventV1, StatusEffect, StatusType } from '../core/types';
import DamageNumber from './DamageNumber';

const StatusLingerVFX: React.FC<{ statuses: StatusEffect[]; targetId: string }> = ({ statuses, targetId }) => {
    const [particles, setParticles] = useState<{ key: number; type: StatusType }[]>([]);

    useEffect(() => {
        const intervals: number[] = [];
        const createParticle = (type: StatusType) => {
            setParticles(p => [...p, { key: Math.random(), type }]);
            setTimeout(() => {
                setParticles(p => p.slice(1));
            }, 2000); // Animation duration
        };

        statuses.forEach(status => {
            if (status.type === StatusType.STRENGTH) {
                const id = setInterval(() => createParticle(StatusType.STRENGTH), 2500);
                intervals.push(id as unknown as number);
            }
            if (status.type === StatusType.VULNERABLE) {
                const id = setInterval(() => createParticle(StatusType.VULNERABLE), 2200);
                intervals.push(id as unknown as number);
            }
        });

        return () => intervals.forEach(clearInterval);
    }, [statuses]);

    return (
        <div className="vfx-linger-container">
            {particles.map(p => (
                <div key={p.key} className={`vfx-linger ${p.type.toLowerCase()}`} />
            ))}
        </div>
    );
};

const VFXRenderer: React.FC<{ events: GameEventV1[]; targetId: string }> = ({ events, targetId }) => {
    const [vfx, setVfx] = useState<(GameEventV1 & { key: number })[]>([]);

    useEffect(() => {
        const newVfx = events
            .filter(e => e.payload.targetId === targetId && e.type === 'STATUS_APPLY')
            .map(e => ({ ...e, key: Math.random() }));

        if (newVfx.length > 0) {
            setVfx(currentVfx => [...currentVfx, ...newVfx]);
            const timer = setTimeout(() => {
                setVfx(current => current.slice(newVfx.length));
            }, 1000); // Animation duration + buffer
            return () => clearTimeout(timer);
        }
    }, [events, targetId]);

    return (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' }}>
            {vfx.map(event => {
                if (event.type === 'STATUS_APPLY') {
                    const statusClass = event.payload.statusType.toLowerCase();
                    return <div key={event.key} className={`vfx-status-apply ${statusClass}`}><div /></div>;
                }
                return null;
            })}
        </div>
    );
};


interface EnemyDisplayProps {
  enemy: EnemyInstance;
  gameEvents: GameEventV1[];
}

const EnemyDisplay: React.FC<EnemyDisplayProps> = ({ enemy, gameEvents }) => {
  const { def, currentHealth, currentIntent, statusEffects } = enemy;
  const damageEvents = gameEvents.filter((e): e is Extract<GameEventV1, { type: 'DAMAGE' }> => e.type === 'DAMAGE' && e.payload.targetId === enemy.instanceId);

  const renderIntent = () => {
    if (!currentIntent) return null;

    switch (currentIntent.action.type) {
      case 'ATTACK':
        return <div className="enemy-intent">⚔️ {currentIntent.action.value}</div>;
      case 'DEFEND':
        return <div className="enemy-intent">🛡️ {currentIntent.action.value}</div>;
      case 'DEBUFF':
        return <div className="enemy-intent">💀 Debuff</div>;
      default:
        return null;
    }
  };

  return (
    <div className="enemy-display" role="group" aria-label={`Enemy: ${def.name}`}>
      <StatusLingerVFX statuses={statusEffects} targetId={enemy.instanceId} />
      <VFXRenderer events={gameEvents} targetId={enemy.instanceId} />
      <div className="damage-number-container">
        {damageEvents.map((event, index) => (
            <DamageNumber key={index} amount={event.payload.amount} />
        ))}
      </div>
      {renderIntent()}
      <div className="enemy-name">{def.name}</div>
      <div className="enemy-health" aria-label={`Health: ${currentHealth} of ${def.maxHealth}`}>
        {currentHealth} / {def.maxHealth}
      </div>
      {statusEffects && statusEffects.length > 0 && (
        <div className="status-effects-container">
          {statusEffects.map(status => (
            <div key={`${status.type}-${status.duration}`} className={`status-effect ${status.type.toLowerCase()}`} title={`${status.type} (${status.duration})`}>
              {status.duration}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EnemyDisplay;
