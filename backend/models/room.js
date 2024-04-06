// models/Room.js
const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true
  },
  players: [{
    type: String
  }],
  isCustom: {
    type: Boolean,
    default: false
  },
  empty: {
    type: Boolean,
    default: true
  },
  gameData: {} // You can specify more detailed schema based on your game data structure
}, { timestamps: true });

module.exports = mongoose.model('Room', RoomSchema);
