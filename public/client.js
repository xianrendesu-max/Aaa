const socket = io();

const login = document.getElementById('login');
const chat = document.getElementById('chat');

const nicknameInput = document.getElementById('nicknameInput');
const roomInput = document.getElementById('roomInput');
const joinBtn = document.getElementById('joinBtn');

const roomTitle = document.getElementById('roomTitle');
const messages = document.getElementById('messages');
const onlineCount = document.getElementById('onlineCount');

const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');
const imageInput = document.getElementById('imageInput');

let username = '';

joinBtn.addEventListener('click', () => {
  if (!nicknameInput.value || !roomInput.value) return;

  username = nicknameInput.value.trim();

  socket.emit('joinRoom', {
    username,
    room: roomInput.value.trim()
  }, res => {
    if (res.status !== 'ok') {
      alert(res.message);
      return;
    }

    login.classList.add('hidden');
    chat.classList.remove('hidden');
    chat.classList.add('fade-in');
    roomTitle.textContent = `仙人OpenChat｜${roomInput.value}`;
  });
});

messageForm.addEventListener('submit', e => {
  e.preventDefault();
  if (!messageInput.value && !imageInput.files.length) return;

  if (imageInput.files.length) {
    const reader = new FileReader();
    reader.onload = () => {
      socket.emit('chatMessage', {
        text: messageInput.value,
        image: reader.result
      });
      messageInput.value = '';
      imageInput.value = '';
    };
    reader.readAsDataURL(imageInput.files[0]);
  } else {
    socket.emit('chatMessage', {
      text: messageInput.value,
      image: null
    });
    messageInput.value = '';
  }
});

socket.on('message', ({ user, text, image }) => {
  const div = document.createElement('div');

  if (user === 'system') {
    div.className = 'message system';
    div.textContent = text;
  } else {
    div.className = 'message ' + (user === username ? 'self' : 'other');
    div.innerHTML = `
      <strong>${user}</strong><br>
      ${text}
      ${image ? `<img src="${image}">` : ''}
    `;
  }

  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
});

socket.on('onlineCount', count => {
  onlineCount.textContent = `オンライン: ${count} 人`;
});
