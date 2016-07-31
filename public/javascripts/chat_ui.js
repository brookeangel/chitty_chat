/* globals io */

function ChatUI (form, chatBox, chatSocket) {
  this.form = form;
  this.chatBox = chatBox;
  this.chatSocket = chatSocket;
  this.nickName = 'Guest';
  this.bindHandlers();
}

ChatUI.prototype.bindHandlers = function () {
  this.form.addEventListener('submit', (e) => {
    e.preventDefault();
    this.sendMessage(this.getMessage());
  });

  this.chatSocket.socket.on('message', (message) => {
    console.log('message broadcast received!');
    this.addMessage(message);
  });
};

ChatUI.prototype.getMessage = function () {
  const input = this.form.querySelector('input[type=text]');
  return input.value;
};

ChatUI.prototype.sendMessage = function (message) {
  this.chatSocket.sendMessage(message);
  const input = this.form.querySelector('input[type=text]');
  input.value = "";
};

ChatUI.prototype.addMessage = function (message) {
  this.chatBox.innerHTML += `<p>${message.sender}: ${message.text}</p>`;
};
