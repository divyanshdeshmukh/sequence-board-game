import React, { useState, useEffect } from 'react';

const PlayerDeck = ({ playerHand, hoveredCard, setHoveredCard, selectedJack, setSelectedJack  }) => {
  
    const [lastClickedJackId, setLastClickedJackId] = useState(null);

    const handleCardClick = (card) => {
        if (card.id >= 101 && card.id <= 104) {
          setSelectedJack('TwoEyed');
          setLastClickedJackId(card.id);
        } else if (card.id >= 105 && card.id <= 108) {
          setSelectedJack('OneEyed');
          setLastClickedJackId(card.id);
        }
        else {
          setSelectedJack(null);
          setLastClickedJackId(null); // Reset
        }
      };

    const handleMouseEnter = (matches) => {
        setHoveredCard(matches);
      };
      
      const handleMouseLeave = (matches) => {
        setHoveredCard([]);
      };

    return (
    <div className="player-deck-container absolute bottom-0 right-0 mb-4 mr-4">
      <div className="player-deck-header">
        Player Deck
      </div>
      <div className="player-deck-cards">
        {playerHand.map((card) => (
          <img key={card.id} src={card.img} alt={`Card ${card.id}`} className={`w-16 h-24 mr-2 ${card.id === lastClickedJackId ? 'selected-jack' : ''}`}
          onClick={() => handleCardClick(card)} onMouseEnter={() => handleMouseEnter(card.matches)}
          onMouseLeave={() => handleMouseLeave()}
        />
        ))}
      </div>
    </div>
  );
};

export default PlayerDeck;