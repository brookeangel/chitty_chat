/* globals io */

function ChatUI (chatEl, chatSocket) {
  this.chatEl = chatEl;
  this.chatSocket = chatSocket;
  this.id = null;
  this.room = null;
  this.nickname = 'Guest';
  this.bindHandlers();
}

ChatUI.prototype.bindHandlers = function () {
  this.chatEl.querySelector('#chat-form').addEventListener('submit',
    this.handleSubmit.bind(this)
  );

  this.chatEl.querySelector('#room-creation-form').addEventListener('submit',
    this.handleRoomCreation.bind(this)
  );

  this.chatEl.querySelector('.menu ul').addEventListener('click',
    this.handleRoomChange.bind(this)
  );

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

  this.chatSocket.socket.on('roomCreated', (data) => {
    this.addRoom(data.room);
  });

  this.chatSocket.socket.on('roomChanged', (data) => {
    this.room = data.room;
    this.clearChatBox();
  });
};

ChatUI.prototype.clearChatBox = function () {
  this.chatEl.querySelector('#chat-zone').innerHTML = "";
};

ChatUI.prototype.handleSubmit = function (e) {
  e.preventDefault();
  const msg = this.getMessage();
  if (msg.match(/^\//)) {
    this.chatSocket.processCommand(msg);
  } else {
    this.sendMessage(msg);
  }
  this.chatEl.querySelector('#chat-form input[type=text]').value = "";
};

ChatUI.prototype.getMessage = function () {
  const input = this.chatEl.querySelector('#chat-form input[type=text]');
  return input.value;
};

ChatUI.prototype.sendMessage = function (message) {
  this.chatSocket.sendMessage({
    message: message,
    sender: this.nickname
  });
};

ChatUI.prototype.addLine = function (line) {
  this.chatEl.querySelector('#chat-zone').innerHTML += `<p>${line}</p>`;
};

ChatUI.prototype.addMessage = function (message) {
  this.addLine(`${new Date().toTimeString()} <b>${message.sender}:</b> ${message.message}`);
};

ChatUI.prototype.handleRoomCreation = function (e) {
  e.preventDefault();
  const roomInput = this.chatEl.querySelector('#room-creation-form input[type=text]');
  this.chatSocket.addRoom(roomInput.value);
  roomInput.value = "";
};

ChatUI.prototype.handleRoomChange = function (e) {
  this.chatSocket.changeRooms(e.target.textContent);
};

ChatUI.prototype.addRoom = function (room) {
  const menu = this.chatEl.querySelector('.menu ul');
  menu.innerHTML += `<li>${room}</li>`;
};
