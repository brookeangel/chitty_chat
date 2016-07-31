function Chat (socket) {
  this.socket = socket;
}

Chat.prototype.sendMessage = function (data) {
  this.socket.emit('message', data);
};

Chat.prototype.processCommand = function (input, id) {
  const command = input.match(/^\/\w+/)[0];
  const options = input.match(/^\/\w+\s(.*)/)[1];
  switch (command) {
    case "/nick":
      console.log('name changing!');
      this.socket.emit('nicknameChangeRequest', {
        name: options,
        id: id
      });
      break;
    default:
      break;
  }
};
