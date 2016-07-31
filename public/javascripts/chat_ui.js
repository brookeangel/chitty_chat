/* globals io */

function ChatUI (form, chatBox, chatSocket) {
  this.form = form;
  this.chatBox = chatBox;
  this.chatSocket = chatSocket;
  this.id = null;
  this.nickname = 'Guest';
  this.bindHandlers();
}

ChatUI.prototype.bindHandlers = function () {
  this.form.addEventListener('submit', this.handleSubmit.bind(this));

  this.chatSocket.socket.on('memberJoined', (data) => {
    this.id = data.id;
    this.nickname = data.name;
  });

  this.chatSocket.socket.on('memberJoinedAnnouncement', (data) => {
    this.addLine(data.message);
  });

  this.chatSocket.socket.on('message', (message) => {
    this.addMessage(message);
  });

  this.chatSocket.socket.on('nicknameChangeResult', (data) => {
    this.addLine(data.message);
    if (data.success === true && this.id === data.id) {
      this.nickname = data.name;
    }
  });

  this.chatSocket.socket.on('userLeftChat', (data) => {
    this.addLine(`${data.name} left the chatroom.`);
  });
};

ChatUI.prototype.handleSubmit = function (e) {
  e.preventDefault();
  const msg = this.getMessage();
  if (msg.match(/^\//)) {
    this.chatSocket.processCommand(msg, this.id);
  } else {
    this.sendMessage(msg);
  }
  this.form.querySelector('input[type=text]').value = "";
};

ChatUI.prototype.getMessage = function () {
  const input = this.form.querySelector('input[type=text]');
  return input.value;
};

ChatUI.prototype.sendMessage = function (message) {
  this.chatSocket.sendMessage({
    message: message,
    sender: this.nickname
  });
};

ChatUI.prototype.addLine = function (line) {
  this.chatBox.innerHTML += `<p>${line}</p>`;
};

ChatUI.prototype.addMessage = function (message) {
  this.addLine(`${new Date().toTimeString()} <b>${message.sender}:</b> ${message.message}`);
};
