import { useState, useEffect } from 'react';
import Cards from './Cards'
import PlayerDeck from './PlayerDeck'
import Deck from './Deck'
import { allCards as importedAllCards    } from '../data';
//import { allCards as importedAllCards } from '../unittest'; //only for testing pattern logic
import ScoreComponent from './Score';

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
    const [redScore, setRedScore] = useState(0);
    const [blueScore, setBlueScore] = useState(0);
    const goal = 2;

    const updateScore = (color) => {
      if (color === 'red') {
        setRedScore(prev => prev + 1);
      } else if (color === 'blue') {
        setBlueScore(prev => prev + 1);
      }
    };
    const checkGoalReached = () => {
      if (redScore >= goal-1) {
        console.log(redScore);
        alert('Red wins the game!');
      } else if (blueScore >= goal-1) {
        alert('Blue wins the game!');
      }
    };

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
           <Cards playerHand={playerHand} shuffledDeck={shuffledDeck} setPlayerHand={setPlayerHand} setShuffledDeck={setShuffledDeck} hoveredCard={hoveredCard} setHoveredCard={setHoveredCard} 
           selectedJack={selectedJack} setSelectedJack={setSelectedJack} updateScore={updateScore} checkGoalReached={checkGoalReached}
           handleClick={(cardId) =>handleClick(cardId, playerHand, setPlayerHand, shuffledDeck, setShuffledDeck, setCards, selectedJack, setSelectedJack )}/>
           <span className="sequence-text sequence-text-right">SEQUENCE</span>
         </div>
         <div className="flex flex-col justify-end items-end relative mr-4 mb-4">
         <Deck deckCount={shuffledDeck.length} />
         <PlayerDeck playerHand={playerHand} hoveredCard={hoveredCard} setHoveredCard={setHoveredCard} selectedJack={selectedJack} setSelectedJack={setSelectedJack} />
         <ScoreComponent redScore={redScore} blueScore={blueScore} goal={goal} />
         </div>
    </>
  );
}