const { Server } = require("socket.io");
const Room = require('../models/room');

class RoomController {
  constructor(io, initializeGameForRoom, startGameForRoom) {
    this.io = io;
    this.initializeGameForRoom = initializeGameForRoom;
    this.startGameForRoom = startGameForRoom;
    this.registerEvents();
  }
  
  async generateUniqueRoomId() {
    let roomId;
    let isUnique = false;
  
    while (!isUnique) {
      roomId = Math.random().toString(36).substring(2, 9);
      const existingRoom = await Room.findOne({ roomId: roomId });
      isUnique = !existingRoom;
    }
  
    return roomId;
  }

  async handleCreateCustomRoom(socket) {
    socket.on("create_custom_room", async (data, callback) => {
      const { playerName } = data;
      const roomId = await this.generateUniqueRoomId();
      try {
        const newRoom = new Room({
          roomId,
          players: [socket.id],
          isCustom: true,
          empty: true,
          playersName: [playerName],
        });
        await newRoom.save();

        socket.join(roomId);
        if (typeof callback === 'function') {
          callback({ roomId });
        }
        console.log(`Room created with ID: ${roomId}, by player: ${playerName}`);
        await initializeGameForRoom(roomId, playerName, socket.id);
        socket.emit("custom_room_created", { roomId });
      } catch (err) {
        console.error('Error saving room to MongoDB:', err);
        socket.emit("room_creation_error", "Failed to create the room.");
      }
    });
  }

  async handleJoinCustomRoom(socket) {
    socket.on("join_custom_room", async (data, callback) => {
      const { roomId, playerName } = data;
      try {
        const room = await Room.findOne({ roomId: roomId });

        if (room && room.players.length < 2) {
          room.players.push(socket.id);
          room.playersName.push(playerName);
          room.empty = false;
          await room.save();

          socket.join(roomId);
          if (typeof callback === 'function') {
            callback({ success: true });
          }
          await startGameForRoom(roomId, playerName, socket.id);
        } else {
          socket.emit("room_join_error", "Room is full or does not exist.");
        }
      } catch (err) {
        console.error("Error joining custom room:", err);
        socket.emit("room_join_error", "Failed to join the room.");
      }
    });
  }

  async handlePlayOnline(socket) {
    socket.on("play_online", async (data, callback) => {
      const { playerName } = data;
      let room;
      try {
        room = await Room.findOne({ empty: true });
        if (!room) {
          const roomId = await this.generateUniqueRoomId();
          room = new Room({
            roomId,
            players: [socket.id],
            isCustom: false,
            empty: true,
            playersName: [playerName],
          });
          await room.save();
        } else {
          room.players.push(socket.id);
          room.playersName.push(playerName);
          room.empty = room.players.length < 2;
          await room.save();
        }

        socket.join(room.roomId);
        if (room.players.length === 2) {
          await this.startGameForRoom(room.roomId, playerName, socket.id);
          callback({ roomId: room.roomId });
        } else {
          callback({ waiting: true, waitingroom: room.roomId });
          await this.initializeGameForRoom(room.roomId, playerName, socket.id);
        }
      } catch (err) {
        console.error("Error handling play online:", err);
        socket.emit("play_online_error", "Failed to find or create a room.");
      }
    });
  }

  async handleDisconnection(socket) {
    socket.on("gameOverclicked", async (roomId) => {
      try {
        await Room.deleteOne({ roomId: roomId });
        this.io.to(roomId).emit("room_closed", roomId);
      } catch (err) {
        console.error("Error removing room:", err);
      }
    });
  }

  registerEvents() {
    this.io.on("connection", (socket) => {
      this.handleCreateCustomRoom(socket);
      this.handleJoinCustomRoom(socket);
      this.handlePlayOnline(socket);
      this.handleDisconnection(socket);
    });
  }
}

module.exports = RoomController;
