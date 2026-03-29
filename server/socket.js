// ✅ EXISTING
const Message = require('./models/Message');
const jwt = require('jsonwebtoken'); // 🆕 ADD THIS

// ✅ EXISTING
const rooms = {};
const onlineUsers = {}; // 🆕 ADD THIS — tracks { username: socketId } for DMs

module.exports = (io) => {

  // 🆕 ADD THIS BLOCK — optional auth middleware
  // "optional" means existing users without a token still connect fine
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      socket.user = null;
      return next();
    }
    try {
      socket.user = jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {

    // 🆕 ADD THIS — private message handler
    socket.on('private_message', ({ to, message }) => {
      const targetSocketId = onlineUsers[to];
      const from = socket.user?.username || socket.username;
      const payload = { from, message, timestamp: Date.now() };

      if (targetSocketId) {
        io.to(targetSocketId).emit('private_message', payload);
      }
      socket.emit('private_message', { ...payload, to });
    });

    // 🆕 ADD THIS — read receipt handler
    socket.on('message_read', ({ by, from }) => {
      const senderSocketId = onlineUsers[from];
      if (senderSocketId) {
        io.to(senderSocketId).emit('message_read', { by });
      }
    });

    // ✅ EXISTING — only 1 line added inside (marked below)
    socket.on('join_room', async ({ username, room }) => {
      socket.join(room);
      socket.username = username;
      socket.room = room;

      if (!rooms[room]) rooms[room] = [];
      rooms[room] = rooms[room].filter(u => u.id !== socket.id);
      rooms[room].push({ id: socket.id, username });

      onlineUsers[username] = socket.id; // 🆕 ADD THIS LINE ONLY

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

    // ✅ EXISTING — unchanged
    socket.on('send_message', async ({ room, username, text }) => {
      const msg = await Message.create({ room, username, text });
      io.to(room).emit('receive_message', msg);
    });

    // ✅ EXISTING — unchanged
    socket.on('typing', ({ room, username }) => {
      socket.to(room).emit('user_typing', username);
    });

    // ✅ EXISTING — unchanged
    socket.on('stop_typing', ({ room }) => {
      socket.to(room).emit('user_stop_typing');
    });

    // ✅ EXISTING — 1 line added at bottom (marked below)
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
      // 🆕 ADD THIS — clean up DM map on disconnect
      if (username && onlineUsers[username] === socket.id) {
        delete onlineUsers[username];
      }
    });

  });
};