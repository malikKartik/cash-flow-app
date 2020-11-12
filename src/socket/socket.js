const io = require('../../app').io;

exports.Socket = (socket) => {
  socket.on('joinRoom', ({userId}) => {
    socket.join(userId);
  });
  socket.on('notification', ({data, type}) => {
    switch (type) {
      case 'ADDED_TO_TEAM':
        io.to(data.userId).emit('notification', {
          type: 'ADDED_TO_TEAM',
          data: {
            message: 'You have been added to a team.',
          },
        });
        break;
      case 'TRANSACTION_ADDED':
        data.users.forEach((user) => {
          console.log(user);
          io.to(user).emit('notification', {
            type: 'TRANSACTION_ADDED',
            data: {
              message: 'You have been added to a transaction.',
            },
          });
        });
        break;
      default:
        break;
    }
  });
};
