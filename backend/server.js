const express = require('express');
const {createServer} = require('http');
const { Server } = require('socket.io');
const  allCards  = require('./data/allCards.js');
const gameController = require('./controllers/gameController'); 
const app = express();
const httpServer = createServer(app);

const allUsers = {};

let filteredCards = allCards.filter(card => card.id <= 100);
let cards = JSON.parse(JSON.stringify(filteredCards));
let game = gameController.initializeGame(allCards);

const io = new Server(httpServer,{
    cors: "http://localhost:5173/",
});

io.on("connection",(socket) =>{
    allUsers[socket.id] = {
        socket: socket,
        online: true,
      };

      socket.on('Boardcardclicked', (data) =>{
        let cardId = data.cardId;
        let selectedCard= data.selectedCard;
        let currentTurn = game.players.player1.isTurn ? 'player1' : 'player2';
        let currentPlayerSocketId = game.players[currentTurn].socketId;
        let currentPlayerdeck = game.players[currentTurn].hand;
        if (!currentPlayerdeck.some(card => card.id === selectedCard)) { //if user tries to manipulate cardid
            return;
        }
        if (socket.id !== currentPlayerSocketId) {
            console.log("Not this player's turn");
            return;
        }
        shuffledDeck= game.shuffledDeck;
        cards = cards;
        let player = gameController.handleCardSelection(game,cardId, shuffledDeck,cards,currentTurn,selectedCard);
        if (!player.success && player.message === "Wrong move: Card is protected.") {
            console.log('Error: ', player.message);
        }
        game = player.game;
        //console.log(game);
        let result = gameController.checkForWinner(game,cards);
        game=result.game;
        console.log(game.protectedPatterns);
        console.log(result.game.scores);
        if (result.winner) {
            game.winner = result.winner;

            io.emit('gameOver', {
                winner: result.winner
            });

        } else {
        io.to(player.game.players.player1.socketId).emit('updateGameState', {
           deckCount: player.shuffledDeck.length,
           score: game.scores, 
           cards: player.cards,
           prevTurn:player.currentPlayer, 
           currentTurn:  player.game.players.player1.isTurn ? 'player1' : 'player2',
           playerHand: game.players.player1.hand,
        });

        io.to(player.game.players.player2.socketId).emit('updateGameState', {
            deckCount: player.shuffledDeck.length, 
            score: game.scores, 
            cards: player.cards,
            prevTurn:player.currentPlayer, 
            currentTurn:  player.game.players.player1.isTurn ? 'player1' : 'player2',
            playerHand: game.players.player2.hand,
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
        console.log(opponentPlayer)
        if (opponentPlayer){
            console.log('opponent found');

            game.players.player1.socketId = socket.id;
            game.players.player2.socketId = opponentPlayer.socket.id;
            
            let deckCount = game.shuffledDeck.length;
            console.log(deckCount);
        
            // socket.on('clickedcard', (data) =>{
            //      const { cardId } = data;
            //      console.log(`Card clicked: ${cardId}`);
            //  })

            currentUser.socket.emit("OpponentFound",{
                opponentName : opponentPlayer.playerName,
                yourHand: game.players.player1.hand,
                playingAs: "player1",
                deckCount:deckCount,
                cards:cards,
              })

            opponentPlayer.socket.emit("OpponentFound",{
              opponentName : currentUser.playerName,
              yourHand: game.players.player2.hand,
              playingAs: "player2",
              deckCount:deckCount,
              cards:cards,
            })
        }
        else{
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