const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const allCards = require('./data/allCards.js');
//const jackCards = require('./data/jackCards.js'); for testing
const gameController = require('./controllers/gameController');
const app = express();
const httpServer = createServer(app);

const allUsers = {};

let filteredCards = allCards.filter(card => card.id <= 100);
let cards = JSON.parse(JSON.stringify(filteredCards));
let game = gameController.initializeGame(allCards);

const io = new Server(httpServer, {
    cors: "http://localhost:5173/",
});

io.on("connection", (socket) => {
    allUsers[socket.id] = {
        socket: socket,
        online: true,
    };

    socket.on('Boardcardclicked', (data) => {
        let { cardId, selectedCard } = data;
        let currentTurn = game.players.player1.isTurn ? 'player1' : 'player2';
        let currentPlayer = game.players[currentTurn];
        if (socket.id !== currentPlayer.socketId || !currentPlayer.hand.some(card => card.id === selectedCard)) {
            console.log("Not this player's turn or invalid card manipulation");
            return;
        }
        let playerUpdate = gameController.handleCardSelection(game, cardId, game.shuffledDeck, cards, currentTurn, selectedCard);
        if (!playerUpdate.success) {
            console.log('Error: ', playerUpdate.message);
            return;
        }
        let gameResult = gameController.Pattern(playerUpdate.game, cards);
        game = gameResult.game;

        if (gameResult.winner) {
            io.emit('gameOver', { winner: gameResult.winner });
        } else {
            Object.entries(game.players).forEach(([key, player]) => {
                io.to(player.socketId).emit('updateGameState', {
                    deckCount: playerUpdate.shuffledDeck.length,
                    score: game.scores,
                    cards: playerUpdate.cards,
                    prevTurn: playerUpdate.currentPlayer,
                    currentTurn: game.players.player1.isTurn ? 'player1' : 'player2',
                    playerHand: player.hand,
                });
            });
        }
    })

    socket.on("request_to_play", (data) => {
        const currentUser = allUsers[socket.id];
        currentUser.playerName = data.playerName;

        let opponentPlayer;

        for (const key in allUsers) {
            const user = allUsers[key];
            if (user.online && !user.playing && socket.id !== key) {
                opponentPlayer = user;
                break;
            }
        }
        // console.log(opponentPlayer)
        if (opponentPlayer) {
            game.players.player1.socketId = socket.id;
            game.players.player2.socketId = opponentPlayer.socket.id;

            let deckCount = game.shuffledDeck.length;
            currentUser.socket.emit("OpponentFound", {
                opponentName: opponentPlayer.playerName,
                yourHand: game.players.player1.hand,
                playingAs: "player1",
                deckCount: deckCount,
                cards: cards,
            })

            opponentPlayer.socket.emit("OpponentFound", {
                opponentName: currentUser.playerName,
                yourHand: game.players.player2.hand,
                playingAs: "player2",
                deckCount: deckCount,
                cards: cards,
            })
        }
        else {
            console.log('opponent not found');
            currentUser.socket.emit("OpponentNotFound");
        }
    });

    socket.on("disconnect", function () {
        const currentUser = allUsers[socket.id];
        currentUser.online = false;
        currentUser.playing = false;
    })
});

httpServer.listen(3000);