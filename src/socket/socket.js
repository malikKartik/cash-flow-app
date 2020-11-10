const io = require('../../app').io;

exports.Socket = (socket) => {
  socket.on('joinRoom', ({userId}) => {
    socket.join(userId);
    console.log('connected! ' + userId);
  });
  socket.on('notification', ({userId}) => {
    io.to(userId).emit('notification', {
      type: 'ADDED_TO_TEAM',
      data: {
        message: 'You have been added to a team.',
      },
    });
  });
};
