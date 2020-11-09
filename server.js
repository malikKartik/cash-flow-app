const http = require('http');
const app = require('./app');
const socketio = require('socket.io');

const port = process.env.PORT || 3001;

const server = http.createServer(app);

const io = socketio(server);
exports.io = io;
io.on('connection', require('./src/socket/socket').Socket);
server.listen(port);
