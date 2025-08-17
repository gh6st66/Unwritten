/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useMemo } from 'react';
import { PlayerState, CardDef } from '../core/types';
import { getCardById } from '../systems/DataLoader';
import CardViewLite from './CardViewLite';

interface RestSiteViewProps {
    playerState: PlayerState;
    deck: string[];
    onHeal: () => void;
    onUpgrade: (card: CardDef) => void;
    onLeave: () => void;
}

const UpgradeCardDetail: React.FC<{ original: CardDef; upgraded: CardDef; onConfirm: () => void; onBack: () => void;}> = ({ original, upgraded, onConfirm, onBack }) => {
    return (
        <div className="upgrade-detail-view">
            <h3>Upgrade Card</h3>
            <div className="upgrade-comparison">
                <div className="card-column">
                    <h4>Current</h4>
                    <CardViewLite card={{ def: original, instanceId: 'original' }} />
                </div>
                <div className="arrow">→</div>
                <div className="card-column">
                    <h4>Upgraded</h4>
                    <CardViewLite card={{ def: upgraded, instanceId: 'upgraded' }} />
                </div>
            </div>
            <div className="upgrade-actions">
                <button onClick={onBack} className="rest-site-button secondary">Back</button>
                <button onClick={onConfirm} className="rest-site-button">Confirm</button>
            </div>
        </div>
    )
};

export const RestSiteView: React.FC<RestSiteViewProps> = ({ playerState, deck, onHeal, onUpgrade, onLeave }) => {
    const [view, setView] = useState<'main' | 'upgrade_select' | 'upgrade_confirm'>('main');
    const [selectedCard, setSelectedCard] = useState<CardDef | null>(null);

    const healAmount = Math.ceil(playerState.maxHealth * 0.30);
    const canHeal = playerState.currentHealth < playerState.maxHealth;
    
    const deckCardDefs = useMemo(() => deck.map(id => getCardById(id)).filter((c): c is CardDef => !!c), [deck]);
    const upgradeableCards = useMemo(() => deckCardDefs.filter(c => c.upgradeId), [deckCardDefs]);
    const canUpgrade = upgradeableCards.length > 0;

    const handleSelectCardToUpgrade = (card: CardDef) => {
        setSelectedCard(card);
        setView('upgrade_confirm');
    };

    const handleConfirmUpgrade = () => {
        if (selectedCard) {
            onUpgrade(selectedCard);
        }
    };
    
    const renderMainView = () => (
        <>
            <div className="rest-site-options">
                <button className="rest-site-button" onClick={onHeal} disabled={!canHeal}>
                    <h3>Heal</h3>
                    <p>Restore {healAmount} health.</p>
                </button>
                <button className="rest-site-button" onClick={() => setView('upgrade_select')} disabled={!canUpgrade}>
                    <h3>Upgrade a Card</h3>
                    <p>Permanently improve a card in your deck.</p>
                </button>
            </div>
            <button className="rest-site-leave" onClick={onLeave}>Leave</button>
        </>
    );

    const renderUpgradeSelectView = () => (
        <div className="upgrade-select-view">
            <h3>Choose a Card to Upgrade</h3>
            <div className="upgrade-card-list">
                {upgradeableCards.map(card => (
                    <div key={card.id} className="upgrade-card-list-item" onClick={() => handleSelectCardToUpgrade(card)}>
                        <CardViewLite card={{ def: card, instanceId: card.id }} />
                    </div>
                ))}
            </div>
            <button onClick={() => setView('main')} className="rest-site-button secondary">Back</button>
        </div>
    );
    
    const renderContent = () => {
        switch (view) {
            case 'main':
                return renderMainView();
            case 'upgrade_select':
                return renderUpgradeSelectView();
            case 'upgrade_confirm':
                const upgradedDef = selectedCard?.upgradeId ? getCardById(selectedCard.upgradeId) : null;
                if (selectedCard && upgradedDef) {
                    return <UpgradeCardDetail original={selectedCard} upgraded={upgradedDef} onConfirm={handleConfirmUpgrade} onBack={() => setView('upgrade_select')} />;
                }
                // Fallback if something goes wrong
                return renderUpgradeSelectView();
            default:
                return renderMainView();
        }
    }

    return (
        <div className="rest-site-container">
            <h2 className="rest-site-title">Rest Site</h2>
            <p className="rest-site-description">A moment of peace. The fire crackles, offering a brief respite from the encroaching shadows.</p>
            {renderContent()}
        </div>
    );
};