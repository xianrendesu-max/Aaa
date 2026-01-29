const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

/* ===== 設定 ===== */
const ROOM_NAME = 'sennin-openchat';
const ADMIN_PASSWORD = 'senninkamikami';

/* ===== ユーザー管理 ===== */
const users = {};

/* ===== オンライン人数送信 ===== */
const sendOnlineCount = () => {
  io.to(ROOM_NAME).emit(
    'onlineCount',
    Object.keys(users).length
  );
};

io.on('connection', (socket) => {

  /* ===== 参加 ===== */
  socket.on('joinRoom', ({ username, adminKey }, callback = () => {}) => {
    if (!username) {
      callback({ status: 'error', message: 'ニックネーム必須' });
      return;
    }

    const isAdmin = adminKey === ADMIN_PASSWORD;

    users[socket.id] = {
      username,
      isAdmin
    };

    socket.join(ROOM_NAME);

    socket.to(ROOM_NAME).emit('message', {
      user: 'system',
      text: `${username} が参加しました`,
      isAdmin: false
    });

    socket.emit('message', {
      user: 'system',
      text: '仙人OpenChatへようこそ',
      isAdmin: false
    });

    sendOnlineCount();

    callback({
      status: 'ok',
      isAdmin
    });
  });

  /* ===== メッセージ ===== */
  socket.on('chatMessage', ({ text }) => {
    const user = users[socket.id];
    if (!user || !text) return;

    io.to(ROOM_NAME).emit('message', {
      user: user.username,
      text,
      isAdmin: user.isAdmin
    });
  });

  /* ===== 切断 ===== */
  socket.on('disconnect', () => {
    const user = users[socket.id];
    if (!user) return;

    delete users[socket.id];

    io.to(ROOM_NAME).emit('message', {
      user: 'system',
      text: `${user.username} が退出しました`,
      isAdmin: false
    });

    sendOnlineCount();
  });
});

server.listen(3000, () => {
  console.log('仙人OpenChat 起動 http://localhost:3000');
});
