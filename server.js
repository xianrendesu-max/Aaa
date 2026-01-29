const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

const rooms = {};

const sendOnlineCount = (room) => {
  const count = rooms[room] ? Object.keys(rooms[room]).length : 0;
  io.to(room).emit('onlineCount', count);
};

io.on('connection', socket => {

  socket.on('joinRoom', ({ username, room }, callback) => {
    if (!username || !room) {
      callback({ status: 'error', message: '入力不足です' });
      return;
    }

    if (!rooms[room]) rooms[room] = {};
    rooms[room][socket.id] = username;

    socket.join(room);

    socket.to(room).emit('message', {
      user: 'system',
      text: `${username} が参加しました`,
      image: null
    });

    socket.emit('message', {
      user: 'system',
      text: `仙人OpenChat「${room}」へようこそ`,
      image: null
    });

    sendOnlineCount(room);
    callback({ status: 'ok' });
  });

  socket.on('chatMessage', ({ text, image }) => {
    const room = [...socket.rooms].find(r => r !== socket.id);
    if (!room || !rooms[room]) return;

    io.to(room).emit('message', {
      user: rooms[room][socket.id],
      text: text || '',
      image: image || null
    });
  });

  socket.on('disconnect', () => {
    for (const room in rooms) {
      if (rooms[room][socket.id]) {
        const name = rooms[room][socket.id];
        delete rooms[room][socket.id];

        io.to(room).emit('message', {
          user: 'system',
          text: `${name} が退出しました`,
          image: null
        });

        sendOnlineCount(room);

        if (Object.keys(rooms[room]).length === 0) {
          delete rooms[room];
        }
        break;
      }
    }
  });
});

server.listen(3000, () => {
  console.log('仙人OpenChat 起動 http://localhost:3000');
});
