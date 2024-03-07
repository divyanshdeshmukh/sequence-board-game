import React from 'react';

export default function ShuffledDeck({ deckCount }) {
    return (
        <>
      <div className="absolute bottom-[100%] right-[30%] mb-[15rem] z-50">
        <div className="flex -space-x-8">
          {[...Array(4)].map((_, index) => (
            <img
              key={index}
              src="../assests/1B.svg"
              alt="Card Back"
              className={`w-14 h-24 ${index > 0 ? '-ml-8' : ''}`}
            style={{ zIndex: 4 - index }} 
            />
          ))}
        </div>
        <p className="deck-count">Deck Count: {deckCount}</p>
      </div>
      </>
    );
  }