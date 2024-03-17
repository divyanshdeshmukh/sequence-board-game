import { useState, useEffect } from "react";
import Cards from "./Cards";
import PlayerDeck from "./PlayerDeck";
import Deck from "./Deck";
import { allCards as importedAllCards } from "../data";
//import { allCards as importedAllCards } from '../unittest'; //only for testing pattern logic
import ScoreComponent from "./Score";
import { io } from "socket.io-client";
import PlayerTurn from "./PlayerTurn";
import Swal from "sweetalert2";

function shuffleDeck(cards) {
  let shuffledCards = [...cards];
  for (let i = shuffledCards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledCards[i], shuffledCards[j]] = [shuffledCards[j], shuffledCards[i]];
  }
  return shuffledCards;
}

export default function Boards() {
  const [cards, setCards] = useState([]); // The state for all cards on the board
  const [hoveredCard, setHoveredCard] = useState([]); // State for hovered card identifiers
  const [shuffledDeck, setShuffledDeck] = useState([]); // The state for the shuffled deck of cards
  const [playerHand, setPlayerHand] = useState([]);
  const [selectedJack, setSelectedJack] = useState(null);
  const [redScore, setRedScore] = useState(0);
  const [blueScore, setBlueScore] = useState(0);
  const [playOnline, setPlayOnline] = useState(false);
  const [socket, setSocket] = useState(null);
  const [playerName, setPlayerName] = useState("");
  const [opponentName, setOpponentName] = useState(null);
  const [playingAs,setPlayingAs]= useState(null);
  const [currentPlayer,setCurrentPlayer] = useState("blue");
  const goal = 2;

  const updateScore = (color) => {
    if (color === "red") {
      setRedScore((prev) => prev + 1);
    } else if (color === "blue") {
      setBlueScore((prev) => prev + 1);
    }
  };
  const checkGoalReached = () => {
    if (redScore >= goal - 1) {
      console.log(redScore);
      alert("Red wins the game!");
    } else if (blueScore >= goal - 1) {
      alert("Blue wins the game!");
    }
  };

  const togglePlayer = () => {
    setCurrentPlayer((currentPlayer) =>
      currentPlayer === "Player 1" ? "Player 2" : "Player 1"
    );
  };

  const inputPlayerName = async () => {
    const result = await Swal.fire({
      title: "Enter your Name",
      input: "text",
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return "You need to write something!";
        }
      },
    });
    return result;
  };

  socket?.on("connect", function () {
    setPlayOnline(true);
  });

  socket?.on("OpponentNotFound", function () {
    setOpponentName(false);
  });

  socket?.on("OpponentFound", function (data) {
    setPlayingAs(data.playingAs);
    setOpponentName(data.opponentName);
  });


  //clicking play button
  async function onlineButton() {
    const result = await inputPlayerName();
    if (!result.isConfirmed) {
      return;
    }

    const username = result.value;
    setPlayerName(username);

    const newSocket = io("http://localhost:3000", {
      autoConnect: true,
    });

    newSocket?.emit("request_to_play", {
      playerName: username,
    });

    setSocket(newSocket);
  }

  useEffect(() => {
    const initialDeck = shuffleDeck(
      importedAllCards.filter((card) => ![1, 10, 91, 100].includes(card.id))
    );
    const playerInitialHand = initialDeck.slice(0, 5);
    const remainingDeck = initialDeck.slice(5); // Update the shuffled deck to exclude the drawn cards
    setPlayerHand(playerInitialHand);
    setShuffledDeck(remainingDeck);
    setCards(remainingDeck);
  }, []);

  if (!playOnline) {
    return (
      <div className="main-bg">
        <button onClick={onlineButton} className="playOnline">
          Play Online
        </button>
      </div>
    );
  }

  if (playOnline && !opponentName) {
    return (
      <div className="waiting">
        <p>Waiting for opponent</p>
      </div>
    );
  }

  return (
    <>
      <div className="game-board">
        <span className="sequence-text sequence-text-left">SEQUENCE</span>
        <Cards
          socket={socket}
          currentPlayer={currentPlayer}
          playerHand={playerHand}
          shuffledDeck={shuffledDeck}
          setPlayerHand={setPlayerHand}
          setShuffledDeck={setShuffledDeck}
          hoveredCard={hoveredCard}
          setHoveredCard={setHoveredCard}
          selectedJack={selectedJack}
          setSelectedJack={setSelectedJack}
          updateScore={updateScore}
          checkGoalReached={checkGoalReached}
          handleClick={(cardId) =>
            handleClick(
              cardId,
              playerHand,
              setPlayerHand,
              shuffledDeck,
              setShuffledDeck,
              setCards,
              selectedJack,
              setSelectedJack
            )
          }
        />
        <span className="sequence-text sequence-text-right">SEQUENCE</span>
      </div>
      <div className="flex flex-col justify-end items-end relative mr-4 mb-4">
        <Deck deckCount={shuffledDeck.length} />
        <PlayerDeck
          playerHand={playerHand}
          hoveredCard={hoveredCard}
          setHoveredCard={setHoveredCard}
          selectedJack={selectedJack}
          setSelectedJack={setSelectedJack}
        />
        <ScoreComponent redScore={redScore} blueScore={blueScore} goal={goal} />
        <PlayerTurn playerName={playerName} opponentName={opponentName} currentPlayer={currentPlayer} playingAs={playingAs}/>
      </div>
    </>
  );
}
