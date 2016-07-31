const socketio = require('socket.io');

const nicknames = {};
let guestNumber = 0;

function createChat (server) {
  const io = socketio(server);
  io.on('connection', (socket) => {
    guestNumber++;
    nicknames[guestNumber] = `guest_${guestNumber}`;

    socket.on('message', (data) => {
      console.log('message received: ' + data);
      io.emit('message', data);
    });

    socket.on('nicknameChangeRequest', (data) => {
      console.log('nickname change request: ' + data);

      if (nicknames.hasOwnKey(data.name)) {
        io.emit('nicknameChangeResult', {
          success: false,
          message: "Cannot choose nickname."
        });
      } else {
        nicknames[socket.id] = data.name;
        io.emit('nicknameChangeResult', {
          success: true,
          message: "Nickname changed."
        });
      }
    });

    socket.on('disconnect', () => {
      const name = nicknames[socket.id];
      delete nicknames[socket.id];

      io.emit('userLeftChat', {name: name});
    });
  });

  return io;
}

module.exports = createChat;
