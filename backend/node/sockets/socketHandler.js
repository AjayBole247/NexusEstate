const { Server } = require('socket.io');

let io;

exports.initSockets = (server) => {
  io = new Server(server, {
    cors: { origin: '*' }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Negotiation Room (Chat)
    socket.on('join_negotiation', (roomId) => {
      socket.join(`chat_${roomId}`);
      console.log(`Socket ${socket.id} joined chat_${roomId}`);
    });

    socket.on('send_message', (data) => {
      io.to(`chat_${data.roomId}`).emit('receive_message', data);
    });

    // Swap Commitment Room
    socket.on('join_swap_room', (transactionId) => {
      socket.join(`swap_${transactionId}`);
    });

    socket.on('user_ready_to_commit', (data) => {
      const { transactionId, userId } = data;
      io.to(`swap_${transactionId}`).emit('user_ready', { userId });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
};

exports.getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};
