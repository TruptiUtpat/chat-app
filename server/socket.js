const Message = require('./models/Message');
const rooms = {};  // { roomName: [{ id, username }] }

module.exports = (io) => {
  io.on('connection', (socket) => {

    socket.on('join_room', async ({ username, room }) => {
  socket.join(room);
  socket.username = username;
  socket.room = room;

  if (!rooms[room]) rooms[room] = [];

  // Remove any existing entry for this socket first
  rooms[room] = rooms[room].filter(u => u.id !== socket.id);

  // Then add fresh
  rooms[room].push({ id: socket.id, username });

  const history = await Message.find({ room })
    .sort({ timestamp: -1 }).limit(50).lean();
  socket.emit('message_history', history.reverse());

  io.to(room).emit('room_users', rooms[room]);
  socket.to(room).emit('receive_message', {
    username: 'System',
    text: `${username} joined the room`,
    timestamp: new Date()
  });
});

    socket.on('send_message', async ({ room, username, text }) => {
      const msg = await Message.create({ room, username, text });
      io.to(room).emit('receive_message', msg);
    });

    socket.on('typing', ({ room, username }) => {
      socket.to(room).emit('user_typing', username);
    });

    socket.on('stop_typing', ({ room }) => {
      socket.to(room).emit('user_stop_typing');
    });

    socket.on('disconnect', () => {
      const { room, username } = socket;
      if (room && rooms[room]) {
        rooms[room] = rooms[room].filter(u => u.id !== socket.id);
        io.to(room).emit('room_users', rooms[room]);
        io.to(room).emit('receive_message', {
          username: 'System',
          text: `${username} left the room`,
          timestamp: new Date()
        });
      }
    });
  });
};