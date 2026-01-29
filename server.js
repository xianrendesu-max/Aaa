const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

const rooms = {};

io.on('connection', socket => {

  socket.on('joinRoom', ({ username, room }, cb) => {
    if (!rooms[room]) rooms[room] = {};
    rooms[room][socket.id] = username;

    socket.join(room);

    socket.to(room).emit('message', {
      user: 'system',
      text: `${username} が参加しました`
    });

    cb({ status: 'ok' });
  });

  socket.on('chatMessage', msg => {
    const room = [...socket.rooms].find(r => r !== socket.id);
    if (!room) return;

    io.to(room).emit('message', {
      user: rooms[room][socket.id],
      text: msg.text,
      image: msg.image
    });
  });

  socket.on('disconnect', () => {
    for (const room in rooms) {
      if (rooms[room][socket.id]) {
        const name = rooms[room][socket.id];
        delete rooms[room][socket.id];

        io.to(room).emit('message', {
          user: 'system',
          text: `${name} が退出しました`
        });
      }
    }
  });
});

server.listen(3000, () => {
  console.log('仙人OpenChat 起動 http://localhost:3000');
});
