const socketio = require('socket.io');

const userRooms = {};
const nicknames = {};
const currentRooms = {};
let guestNumber = 0;


function createChat (server) {
  const io = socketio(server);

  io.on('connection', (socket) => {
    const joinRoom = (newRoom) =>  {
      if (currentRooms[newRoom] && userRooms[socket.id] !== newRoom) {
        if (currentRooms[userRooms[socket.id]]) {
          const guests = currentRooms[userRooms[socket.id]];
          socket.leave(userRooms[socket.id]);
          const idx = guests.indexOf(socket.id);
          if (idx > 0) guests.splice(idx, 1);
        }

        socket.join(newRoom);
        userRooms[socket.id] = newRoom;
        currentRooms[newRoom].push(socket.id);
        return true;
      }

      return false;
    };

    const createAndJoinRoom = (newRoom) => {
      if (!currentRooms[newRoom]) {
        io.of(newRoom);
        currentRooms[newRoom] = [];
        joinRoom(newRoom);
        return true;
      }

      joinRoom (newRoom);
      return false;
    };

    const announceRoomEntry = () => {
      console.log(`${nicknames[socket.id]} is in ${userRooms[socket.id]}`);
      io.to(userRooms[socket.id]).emit('memberJoinedAnnouncement', {
        message: `${nicknames[socket.id]} has joined the ${userRooms[socket.id]}!`
      });
    };

    const announceRoomDeparture = (oldRoom) => {
      const name = nicknames[socket.id];
      io.to(oldRoom).emit('userLeftChat', {name: name});
    };

    guestNumber++;
    nicknames[socket.id] = `guest_${guestNumber}`;

    createAndJoinRoom('lobby', socket.id);
    for (let room in currentRooms) {
      socket.emit('roomCreated', {room: room});
    }

    socket.emit('roomChanged', {room: 'lobby'});
    announceRoomEntry();

    socket.on('message', (data) => {
      io.to(userRooms[socket.id]).emit('message', data);
    });

    socket.emit('memberJoined', {
      success: true,
      id: socket.id,
      name: nicknames[socket.id],
      room: userRooms[socket.id],
    });

    socket.on('nicknameChangeRequest', (data) => {
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
        io.to(userRooms[socket.id]).emit('nicknameChangeResult', {
          success: true,
          id: socket.id,
          name: data.name,
          message: `${oldName} changed nicknames to ${data.name}.`
        });
      }
    });

    socket.on('disconnect', () => {
      announceRoomDeparture(userRooms[socket.id]);

      if (currentRooms[userRooms[socket.id]]) {
        const guests = currentRooms[userRooms[socket.id]];
        const idx = guests.indexOf(socket.id);
        if (idx > 0) guests.splice(idx, 1);
      }

      delete userRooms[socket.id];
      delete nicknames[socket.id];
    });

    socket.on('roomChangeRequest', (data) => {
      const oldRoom = userRooms[socket.id];
      if (joinRoom(data.room, socket.id)) {
        socket.emit('roomChanged', {room: data.newRoom});
        announceRoomDeparture(oldRoom);
        announceRoomEntry();
      }
    });

    socket.on('createRoomRequest', (data) => {
      if (createAndJoinRoom(data.room, socket.id)) {
        io.emit('roomCreated', {room: data.room});
        socket.emit('roomChanged', {room: data.room});
        announceRoomEntry();
      }
    });
  });

  return io;
}

module.exports = createChat;
