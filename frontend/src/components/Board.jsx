import { useState, useEffect } from "react";
import Cards from "./Cards";
import PlayerDeck from "./PlayerDeck";
import Deck from "./Deck";
import ScoreComponent from "./Score";
import { io } from "socket.io-client";
import PlayerTurn from "./PlayerTurn";
import Swal from "sweetalert2";

export default function Boards() {
  const [cards, setCards] = useState([]); // The state for all cards on the board
  const [hoveredCard, setHoveredCard] = useState([]); // State for hovered card identifiers
  const [redScore, setRedScore] = useState(0);
  const [blueScore, setBlueScore] = useState(0);
  const [playOnline, setPlayOnline] = useState(false);
  const [socket, setSocket] = useState(null);
  const [playerName, setPlayerName] = useState("");
  const [opponentName, setOpponentName] = useState(null);
  const [playingAs,setPlayingAs]= useState(null);
  const [currentPlayer,setCurrentPlayer] = useState('player1');
  const [yourHand,setYourHand] = useState(null);
  const [deckCount,setDeckCount] = useState(null);
  const [selectCard,setSelectCard] = useState(null);



  //Enter playerName
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

  //Establishing connection and setting the playOnline to true
  socket?.on("connect", function () {
    console.log("Conneected");
    setPlayOnline(true);
  });

  socket?.on("OpponentNotFound", function () {
    setOpponentName(false);
  });

  socket?.on("OpponentFound", function (data) {
    setPlayingAs(data.playingAs);
    setOpponentName(data.opponentName);
    setYourHand(data.yourHand);
    setDeckCount(data.deckCount);
    setCards(data.cards);

  });

  socket?.on("gameOver", data=>{
    Swal.fire({
      title: "`{data} Won the game`",
      showClass: {
        popup: `
          animate__animated
          animate__fadeInUp
          animate__faster
        `
      },
      hideClass: {
        popup: `
          animate__animated
          animate__fadeOutDown
          animate__faster
        `
      }
    });
    
  })
  
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
    socket?.on('updateGameState', gameState => {
      setDeckCount(gameState.deckCount);
      setCards(gameState.cards);
      setYourHand(gameState.playerHand);
      setCurrentPlayer(gameState.currentTurn);  
      setBlueScore(gameState.score.blue);
      setRedScore(gameState.score.red);
    });
    return () => {
      socket?.off('updateGameState');
    };
  }, [socket]);

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
          cards={cards}
          selectCard = {selectCard}
          hoveredCard={hoveredCard}
          currentPlayer={currentPlayer} playingAs={playingAs}
        />
        <span className="sequence-text sequence-text-right">SEQUENCE</span>
      </div>
      <div className="flex flex-col justify-end items-end relative mr-4 mb-4">
        <Deck deckCount={deckCount} />
        <PlayerDeck
          socket={socket}
          playerHand={yourHand}
          setSelectCard = {setSelectCard}
          setHoveredCard={setHoveredCard}
          currentPlayer={currentPlayer} playingAs={playingAs}
        />
        <ScoreComponent redScore={redScore} blueScore={blueScore} />
        <PlayerTurn playerName={playerName} opponentName={opponentName} currentPlayer={currentPlayer} playingAs={playingAs}/>
      </div>
    </>
  );
}
