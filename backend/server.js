const express = require('express');
const mongoose = require("mongoose");
const { createServer } = require('http');
const { Server } = require('socket.io');
const allCards = require('./data/allCards.js');
const gameController = require('./controllers/gameController');
const RoomController = require('./controllers/roomController');
const app = express();
const httpServer = createServer(app);
const Game = require('./models/Game');
let filteredCards = allCards.filter(card => card.id <= 100);
let cards = JSON.parse(JSON.stringify(filteredCards));


require('dotenv').config(); 
const io = new Server(httpServer, {
    cors: {
        origin: '*',
        methods: ["GET","POST","OPTIONS"]
    }
});
const gamesByRoomId = {};

// MongoDB connection
const PORT = process.env.PORT || 7000;
const MONGO_URL = process.env.MONGO_URL;

mongoose.connect(MONGO_URL)
  .then(() => {
    console.log('MongoDB connected');
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      new RoomController(io);
    });
  })
  .catch(err => console.error('MongoDB connection error:', err));


function deepClone() {
    let filteredCards = allCards.filter(card => card.id <= 100);
    return JSON.parse(JSON.stringify(filteredCards));
}

// Method to initialize a game in a room
async function initializeGameForRoom(roomId, playerName, playerId) {
    // Check if a game already exists for the roomId
    let existingGame = await Game.findOne({ roomId: roomId });
  
    if (!existingGame) {
      let gameInitialState = gameController.initializeGame(allCards);
      gameInitialState.players.player1.socketId = playerId;
      gameInitialState.players.player1.name = playerName;

      let newGame = new Game({
        roomId: roomId,
        players: gameInitialState.players,
        scores: gameInitialState.scores,
        shuffledDeck: gameInitialState.shuffledDeck,
        cards: gameInitialState.cards,
        protectedPatterns: gameInitialState.protectedPatterns
      });
  
      try {
        await newGame.save();
        //console.log(`Game initialized in room ${roomId} by ${playerName}`);
      } catch (err) {
        console.error('Error saving new game to MongoDB:', err);
      }
    } else {
      //console.log(`Game already exists for room ${roomId}, proceeding with existing game.`);
    }
  }

  // Method to start a game in a room
async function startGameForRoom(roomId, playerName, playerId) {
    try {
        let game = await Game.findOne({ roomId: roomId });
        if (game && !game.players.player2.socketId) {
            game.players.player2.socketId = playerId;
            game.players.player2.name = playerName;
            game.cards = deepClone();
            // Save the updated game state back to the database
            await game.save();

            this.io.to(game.players.player1.socketId).emit('OpponentFound', {
                opponentName: playerName,
                yourHand: game.players.player1.hand,
                playingAs: "player1",
                deckCount: game.shuffledDeck.length,
                cards: game.cards,
            });

            this.io.to(playerId).emit('OpponentFound', {
                opponentName: game.players.player1.name,
                yourHand: game.players.player2.hand,
                playingAs: "player2",
                deckCount: game.shuffledDeck.length,
                cards: game.cards,
            });

            //console.log(`Game in room ${roomId} ready. Players: ${game.players.player1.socketId}, ${playerId}`);
        } else {
            console.log(`Game not found for room ${roomId}, or player2 already exists.`);
        }
    } catch (err) {
        console.error(`Error updating game for room ${roomId}:`, err);
    }
}
const roomController = new RoomController(io, initializeGameForRoom, startGameForRoom);

io.on("connection", (socket) => {
    console.log(`New connection: ${socket.id}`);

    socket.on('Boardcardclicked', async (data) => {
        const { roomId, cardId, selectedCard } = data;

        try {
            // Fetch the game state from MongoDB
            let game = await Game.findOne({ roomId: roomId });
            if (!game) {
                console.log("Game not found for room: ", roomId);
                return;
            }

            // Determine the current player based on the game state
            let currentTurn = game.players.player1.isTurn ? 'player1' : 'player2';
            let currentPlayer = game.players[currentTurn];
            if (socket.id !== currentPlayer.socketId || !currentPlayer.hand.some(card => card.id === selectedCard)) {
                console.log("Not this player's turn or invalid card manipulation");
                return;
            }
            let cards = game.cards;
            // Handle card selection and update the game state
            let  updatedGame = gameController.handleCardSelection(game, cardId, game.shuffledDeck,cards, currentTurn, selectedCard);
            if (!updatedGame.success) {
                console.log('Error: ', message);
                return;
            }
            await game.save();
            // Check for a winner
            let patternResult = await gameController.Pattern(updatedGame, game.cards);
            if (patternResult.winner) {
                io.emit('gameOver', { winner: gameResult.winner });
            } else {
                if (patternResult.updated) {
                    await game.save();
                }

                Object.keys(game.players).forEach(playerKey => {
                    const player = game.players[playerKey];
                    io.to(player.socketId).emit('updateGameState', {
                        deckCount: game.shuffledDeck.length,
                        score: game.scores,
                        cards: game.cards,
                        prevTurn: currentTurn,
                        currentTurn: game.players.player1.isTurn ? 'player1' : 'player2',
                        playerHand: player.hand,
                    });
                });
            }
        } catch (err) {
            console.error('Error processing Boardcardclicked:', err);
        }
    });

    socket.on('room_closed', roomId => {
        // Handle room closure, if necessary
    });
});

httpServer.listen(3000);