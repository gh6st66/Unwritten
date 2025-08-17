/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from "react";
import { CardInstance } from "../core/types";
import CardView from "./CardView";

type HandProps = {
  cards: CardInstance[];
  onPlay: (cardId: string) => void;
};

export const Hand: React.FC<HandProps> = ({ cards, onPlay }) => {
  return (
    <div className="hand-container" aria-label="Player's hand">
      {cards.map((card) => (
        <CardView
          key={card.instanceId} // STABLE KEY
          card={card}
          onClick={() => onPlay(card.instanceId)}
        />
      ))}
    </div>
  );
};

export default Hand;
