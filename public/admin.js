const socket = io();

const adminName = document.getElementById('adminName');
const adminPass = document.getElementById('adminPass');
const loginBtn = document.getElementById('loginAdmin');

const adminChat = document.getElementById('adminChat');
const messages = document.getElementById('messages');
const adminForm = document.getElementById('adminForm');
const adminMessage = document.getElementById('adminMessage');

let adminUsername = '';

loginBtn.onclick = () => {
  if (!adminName.value || !adminPass.value) return;

  socket.emit('joinRoom', {
    username: adminName.value,
    adminKey: adminPass.value
  }, res => {
    if (!res.isAdmin) {
      alert('パスワードが違います');
      return;
    }

    adminUsername = adminName.value;
    document.querySelector('.card').classList.add('hidden');
    adminChat.classList.remove('hidden');
  });
};

adminForm.onsubmit = e => {
  e.preventDefault();
  if (!adminMessage.value.trim()) return;

  socket.emit('chatMessage', {
    text: adminMessage.value
  });

  adminMessage.value = '';
};

socket.on('message', ({ user, text, isAdmin }) => {
  const div = document.createElement('div');
  div.className = `message ${isAdmin ? 'admin-message' : 'other'}`;
  div.innerHTML = `<strong>${user}</strong><br>${text}`;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
});
