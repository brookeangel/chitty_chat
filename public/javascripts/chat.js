function Chat (socket) {
  this.socket = socket;
}

Chat.prototype.sendMessage = function (text, sender) {
  this.socket.emit('message', {
    text: text,
    sender: sender
  });
};

Chat.prototype.processCommand = function (input) {
  const command = input.match(/^\/\w+/)[0];
  switch (command) {
    case "/nick":
      break;
    default:

  }
};
