function Chat (socket) {
  this.socket = socket;
}

Chat.prototype.sendMessage = function (data) {
  this.socket.emit('message', data);
};

Chat.prototype.changeRooms = function (room) {
  this.socket.emit('roomChangeRequest', {room: room});
};

Chat.prototype.addRoom = function (room) {
  this.socket.emit('createRoomRequest', {room: room});
};

Chat.prototype.processCommand = function (input) {
  const command = input.match(/^\/\w+/)[0];
  const options = input.match(/^\/\w+\s(.*)/)[1];
  switch (command) {
    case "/nick":
      this.socket.emit('nicknameChangeRequest', {
        name: options
      });
      break;
    case "/room":
      this.socket.emit('roomChangeRequest', {
        name: options
      });
      break;
    default:
      break;
  }
};
