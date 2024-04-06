const { Server } = require("socket.io");
const Room = require('../models/room');

class RoomManager {
  constructor() {
    this.rooms = {}; //stores info about rooms including players, room id , custom room or not, room empty or full
    this.queue = []; //contains only the empty rooms for stranger players.
  }

  generateUniqueRoomId() {
    let roomId;
    do {
      roomId = Math.random().toString(36).substring(2, 9);
    } while (this.rooms[roomId]); // Keep generating until we find a unique one
    return roomId;
  }

  createRoom(hostId, isCustom = false) {
    const roomId = this.generateUniqueRoomId();
    this.rooms[roomId] = {
      players: [hostId],
      isCustom: isCustom,
      empty: true,
    };
    return roomId;
  }

  createCustomRoom(hostId) {
    return this.createRoom(hostId, true);
  }

  joinCustomRoom(playerId, roomId) {
    const room = this.rooms[roomId];
    if (room && room.players.length < 2) {
      room.players.push(playerId);
      room.empty = false;
      return true;
    }
    return false;
  }

  matchRandomPlayer(playerId) {
    if (this.queue.length > 0) {
      const roomId = this.queue.shift(); //remove the first element in queue
      const room = this.rooms[roomId];
      room.players.push(playerId);
      room.empty = false;
      return roomId;
    } else {
      // Create a new room and add it to the queue if no match is found
      const newRoomId = this.createRoom(playerId);
      this.queue.push(newRoomId);
      return newRoomId;
    }
  }

  removeRoom(roomId) {
    delete this.rooms[roomId];
    // remove from the queue if present
    const index = this.queue.indexOf(roomId);
    if (index > -1) {
      this.queue.splice(index, 1);
    }
  }
}

class RoomController {
  constructor(io) {
    this.io = io;
    this.roomManager = new RoomManager();
    this.registerEvents();
  }
  registerEvents() {
    this.io.on("connection", (socket) => {
      // Handle creation of custom rooms
      socket.on("create_custom_room", () => {
        const roomId = this.roomManager.createCustomRoom(socket.id);
        socket.join(roomId);
        socket.emit("custom_room_created", { roomId });
      });

      // Handle joining of custom rooms
      socket.on("join_custom_room", (data) => {
        const { roomId } = data;
        if (this.roomManager.joinCustomRoom(socket.id, roomId)) {
          socket.join(roomId);
          this.io.to(roomId).emit("start_game");
        } else {
          socket.emit("room_join_error", "Room is full or does not exist.");
        }
      });

      // Handle requests to play online (random matches)
      socket.on("play_online", () => {
        const roomId = this.roomManager.matchRandomPlayer(socket.id);
        socket.join(roomId);
        if (this.roomManager.rooms[roomId].players.length == 2) {
          // Both players have joined; start the game
          this.io.to(roomId).emit("start_game");
        } else {
          // Waiting for another player
          socket.emit("waiting_for_player");
        }
      });

      // Handle player disconnection
      socket.on("gameOverclicked", (roomId) => {
        this.roomManager.removeRoom(roomId);
        this.io.to(roomId).emit("room_closed");
      });
    });
  }
}

module.exports = RoomController;
