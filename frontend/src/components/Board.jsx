import { useState, useEffect } from 'react';
import Cards from './Cards'
import PlayerDeck from './PlayerDeck'
import ShuffledDeck from './ShuffledDeck'
import { allCards as importedAllCards    } from '../data';

function shuffleDeck(cards) {
    let shuffledCards = [...cards];
    for (let i = shuffledCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledCards[i], shuffledCards[j]] = [shuffledCards[j], shuffledCards[i]];
    }
    return shuffledCards;
  }

export default function Boards(){
    const [cards, setCards] = useState([]); // The state for all cards on the board
    const [hoveredCard, setHoveredCard] = useState([]); // State for hovered card identifiers
    const [shuffledDeck, setShuffledDeck] = useState([]); // The state for the shuffled deck of cards
    const [playerHand, setPlayerHand] = useState([]);
    const [selectedJack, setSelectedJack] = useState(null);

    useEffect(() => {
        const initialDeck = shuffleDeck(importedAllCards.filter(card => ![1, 10, 91, 100].includes(card.id)));
        const playerInitialHand = initialDeck.slice(0, 5);
        const remainingDeck = initialDeck.slice(5);// Update the shuffled deck to exclude the drawn cards 
        setPlayerHand(playerInitialHand);
        setShuffledDeck(remainingDeck);
        setCards(remainingDeck); 
      }, []);
    
      const drawCardForPlayer = () => {
        if (shuffledDeck.length > 0) {
          const newCard = shuffledDeck[0];
          setPlayerHand(prev => [...prev, newCard]);
          setShuffledDeck(prev => prev.slice(1));
        }
      };


      return (
        <>
         <div className="game-board">
           <span className="sequence-text sequence-text-left">SEQUENCE</span>
           <Cards playerHand={playerHand} shuffledDeck={shuffledDeck} setPlayerHand={setPlayerHand} setShuffledDeck={setShuffledDeck} hoveredCard={hoveredCard} setHoveredCard={setHoveredCard} selectedJack={selectedJack} setSelectedJack={setSelectedJack}
           handleClick={(cardId) =>handleClick(cardId, playerHand, setPlayerHand, shuffledDeck, setShuffledDeck, setCards, selectedJack, setSelectedJack )}/>
           <span className="sequence-text sequence-text-right">SEQUENCE</span>
         </div>
         <div className="flex flex-col justify-end items-end relative mr-4 mb-4">
         <ShuffledDeck deckCount={shuffledDeck.length} />
         <PlayerDeck playerHand={playerHand} hoveredCard={hoveredCard} setHoveredCard={setHoveredCard} selectedJack={selectedJack} setSelectedJack={setSelectedJack} />
           

         </div>
    </>
  );
}