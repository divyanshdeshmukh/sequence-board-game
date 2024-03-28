import { useState } from "react"
import Pattern from "./Pattern";

export default function Cards({socket,selectCard, cards,hoveredCard,playingAs,currentPlayer}){

    function handleClick(cardId,selectCard,socket,card){
        let card_matches = card.matches;
        let validMove = false;
        if (selectCard > 100 && selectCard < 104 && ![1, 10, 90, 100].includes(cardId)) {
            validMove = true;
        }
        if (selectCard > 104 && selectCard < 108 && cardId.selected) {
            validMove = true;
        }

        if (validMove || card_matches.includes(selectCard) && playingAs === currentPlayer){
            socket?.emit('Boardcardclicked', { cardId: cardId, selectedCard: selectCard  });
        }
        else{
            alert('Invalid move! This action is not allowed.');
        }
    }
      
    return (
        <>
        <div className="inner-container">
             {cards.map((card) => (
               <div key={card.id} className={`card ${hoveredCard.includes(card.id) ? 'highlighted' : ''}`} 
               onClick={() => handleClick(card.id, selectCard,socket,card)}>
                   {card.img && <img src={card.img} alt={`Card ${card.id}`} />} 
                   {card.selected && (
                    <div className={`poker-chip-${card.selectedby === "red" ? "red" : "blue"} absolute`}></div>
                    )}
                </div>
            ))}
        </div>
        </>
    )
    }