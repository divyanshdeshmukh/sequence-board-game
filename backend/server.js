const express = require('express');
const {createServer} = require('http');
const {Server} = require('socket.io');

const app = express();
const httpServer = createServer(app);

const allUsers = {};

const io = new Server(httpServer,{
    cors: "http://localhost:5173/",
});

io.on("connection",(socket) =>{
    allUsers[socket.id] = {
        socket: socket,
        online: true,
      };

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

            opponentPlayer.socket.emit("OpponentFound",{
              opponentName : currentUser.playerName,
              playingAs: "red"
            })

            currentUser.socket.emit("OpponentFound",{
                opponentName : opponentPlayer.playerName,
                playingAs: "blue"
              })

              currentUser.socket.on("playerMoveFromClient", (data) => {
                opponentPlayer.socket.emit("playerMoveFromServer", {
                  ...data,
                });
              });
        
              opponentPlayer.socket.on("playerMoveFromClient", (data) => {
                currentUser.socket.emit("playerMoveFromServer", {
                  ...data,
                });
              });
              

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