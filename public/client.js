const socket = io();

const login = document.getElementById('login');
const chat = document.getElementById('chat');

const nicknameInput = document.getElementById('nicknameInput');
const joinBtn = document.getElementById('joinBtn');

const messages = document.getElementById('messages');
const onlineCount = document.getElementById('onlineCount');

const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');

let username = '';

/* ===== 参加 ===== */
joinBtn.addEventListener('click', () => {
  if (!nicknameInput.value.trim()) return;

  username = nicknameInput.value.trim();

  socket.emit(
    'joinRoom',
    { username },
    (res) => {
      if (res.status !== 'ok') {
        alert(res.message);
        return;
      }

      login.classList.add('hidden');
      chat.classList.remove('hidden');
      chat.classList.add('fade-in');
    }
  );
});

/* ===== メッセージ送信 ===== */
messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!messageInput.value.trim()) return;

  socket.emit('chatMessage', {
    text: messageInput.value
  });

  messageInput.value = '';
});

/* ===== メッセージ受信 ===== */
socket.on('message', ({ user, text, isAdmin }) => {
  const div = document.createElement('div');

  if (user === 'system') {
    div.className = 'message system';
    div.textContent = text;
  } else {
    div.className =
      'message ' +
      (isAdmin ? 'admin-message' : (user === username ? 'self' : 'other'));

    div.innerHTML = `
      <strong>
        ${user}
        ${isAdmin ? '<span class="admin-label">[管理者]</span>' : ''}
      </strong><br>
      ${text}
    `;
  }

  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
});

/* ===== オンライン人数 ===== */
socket.on('onlineCount', (count) => {
  onlineCount.textContent = `オンライン: ${count} 人`;
});
