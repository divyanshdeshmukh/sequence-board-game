import React, { useState, useEffect } from 'react';

// function shuffleDeck(cards) {
//   let shuffledCards = [...cards];
//   for (let i = shuffledCards.length - 1; i > 0; i--) {
//     const j = Math.floor(Math.random() * (i + 1));
//     [shuffledCards[i], shuffledCards[j]] = [shuffledCards[j], shuffledCards[i]];
//   }
//   return shuffledCards;
// }

const PlayerDeck = ({ playerHand, hoveredCard, setHoveredCard }) => {
  
    const handleMouseEnter = (matches) => {
        setHoveredCard(matches);
      };
      
      const handleMouseLeave = (matches) => {
        setHoveredCard([]);
      };

    // useEffect(() => {
    //   // Shuffle cards and set the player's hand when the component mounts
    //   const filteredCards = allCards.filter(card => ![1, 10, 91, 100].includes(card.id));

    //   const shuffledCards = shuffleDeck(filteredCards);
    //   setPlayerHand(shuffledCards.slice(0, 5)); // Take the first 5 cards for the player's hand
    // }, [allCards]);

    return (
    <div className="player-deck-container absolute bottom-0 right-0 mb-4 mr-4">
      <div className="player-deck-header">
        Player Deck
      </div>
      <div className="player-deck-cards">
        {playerHand.map((card) => (
          <img key={card.id} src={card.img} alt={`Card ${card.id}`} className="w-16 h-24 mr-2" onMouseEnter={() => handleMouseEnter(card.matches)}
          onMouseLeave={() => handleMouseLeave()}
        />
        ))}
      </div>
    </div>
  );
};

export default PlayerDeck;