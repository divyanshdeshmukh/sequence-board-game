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
    const [hoveredCard, setHoveredCard] = useState([]);
    const [shuffledDeck, setShuffledDeck] = useState([]);
    const [playerHand, setPlayerHand] = useState([]);

    useEffect(() => {
        const allCards = shuffleDeck(importedAllCards.filter(card => ![1, 10, 91, 100].includes(card.id)));
        setShuffledDeck(allCards);
        setPlayerHand(allCards.slice(0, 5));
        setShuffledDeck(prev => prev.slice(5)); // Update the shuffled deck to exclude the drawn cards
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
           <Cards hoveredCard={hoveredCard} setHoveredCard={setHoveredCard} />
           <span className="sequence-text sequence-text-right">SEQUENCE</span>
         </div>
         <div className="flex flex-col justify-end items-end relative mr-4 mb-4">
         <ShuffledDeck drawCardForPlayer={drawCardForPlayer} deckCount={shuffledDeck.length} />
         <PlayerDeck playerHand={playerHand} hoveredCard={hoveredCard} setHoveredCard={setHoveredCard} />
           

         </div>
    </>
  );
}