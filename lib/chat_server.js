const socketio = require('socket.io');

const nicknames = {};
let guestNumber = 0;

function createChat (server) {
  const io = socketio(server);
  io.on('connection', (socket) => {
    guestNumber++;
    nicknames[socket.id] = `guest_${guestNumber}`;
    console.log(socket.id);
    console.log(nicknames[socket.id]);
    socket.on('message', (data) => {
      console.log('message received: ' + data);
      io.emit('message', data);
    });

    socket.emit('memberJoined', {
      success: true,
      name: nicknames[socket.id],
      id: socket.id
    });

    io.emit('memberJoinedAnnouncement', {
      message: `${nicknames[socket.id]} has joined the chatroom!`
    });

    socket.on('nicknameChangeRequest', (data) => {
      console.log('nickname change request: ' + data);

      let alreadyExist = false;
      for (var id in nicknames) {
        if (nicknames[id] === data.name) {
          alreadyExist = true;
        }
      }

      if (alreadyExist || data.name.match(/^guest/)) {
        socket.emit('nicknameChangeResult', {
          success: false,
          message: `Invalid nickname: ${data.name}`
        });
      } else {
        const oldName = nicknames[socket.id];
        nicknames[socket.id] = data.name;
        io.emit('nicknameChangeResult', {
          success: true,
          id: socket.id,
          name: data.name,
          message: `${oldName} changed nicknames to ${data.name}.`
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
