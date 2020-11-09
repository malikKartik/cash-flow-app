const io = require('../../server').io;

exports.Socket = (socket) => {
  socket.on('notification', () => {
    console.log('connected!');
  });
};
