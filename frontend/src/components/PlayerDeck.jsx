import React, { useState, useEffect } from 'react';

const PlayerDeck = ({ socket, playerHand, setSelectCard, setHoveredCard, playingAs, currentPlayer }) => {

  const [selectedCardId, setSelectedCardId] = useState(null);
  const handleCardClick = (card) => {
      // socket?.emit('clickedcard', { cardId: card.id });
      setSelectedCardId(prevId => prevId === card.id ? null : card.id);
      setSelectCard(card.id);
  };

  const handleMouseEnter = (matches) => {
    setHoveredCard(matches);
  };

  const handleMouseLeave = (matches) => {
    setHoveredCard([]);
  };

  const handleSwapCards = () => {
    if (playingAs === currentPlayer) {
      console.log('Attempting to swap cards...');
      console.log('Socket exists:', !!socket);
      socket?.emit('swapCards');
    } else {
      alert('You can only swap cards during your turn!');
    }
  };

  // Add useEffect to verify socket connection
  useEffect(() => {
    if (socket) {
      socket.on('updateGameState', (gameState) => {
        console.log('Received updated game state after swap:', gameState);
      });
    }
  }, [socket]);

  return (
    <div className="player-deck-container absolute bottom-0 right-0 mb-4 mr-4">
      <button 
        onClick={handleSwapCards}
        className="swap-button mb-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Swap Random Cards
      </button>
      <div className="player-deck-header">
        Player Deck
      </div>
      <div className="player-deck-cards">
        {playerHand.map((card) => (
          <img key={card.id} src={card.img} alt={`Card ${card.id}`}
            className={`w-16 h-24 mr-2 ${selectedCardId === card.id ? 'selected-card' : ''}`}
            onClick={() => playingAs === currentPlayer && handleCardClick(card)}
            onMouseEnter={() => handleMouseEnter(card.matches)}
            onMouseLeave={() => handleMouseLeave()} />
        ))}
      </div>
    </div>
  );
};

export default PlayerDeck;