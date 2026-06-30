const client = mqtt.connect('wss://test.mosquitto.org:8081');
const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const nicknameInput = document.getElementById('nickname');
const statusDiv = document.getElementById('status');
const typingIndicator = document.getElementById('typingIndicator');

let typingTimeout;

client.on('connect', () => {
    statusDiv.innerText = '🟢 已连接';
    client.subscribe('yunlun-chat-room');
});

client.on('error', (err) => {
    statusDiv.innerText = '🔴 连接失败';
    console.error(err);
});

client.on('message', (topic, payload) => {
    const data = JSON.parse(payload.toString());
    displayMessage(data);
});

function sendMessage() {
    const nick = nicknameInput.value.trim() || '匿名用户';
    const text = messageInput.value.trim();
    if (!text) return;

    const payload = JSON.stringify({ nick, text, time: new Date().toLocaleTimeString() });
    client.publish('yunlun-chat-room', payload);
    messageInput.value = '';
    typingIndicator.innerText = '';
}

function displayMessage(data) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message';
    if (data.nick === '系统') {
        msgDiv.className = 'system';
        msgDiv.innerText = data.text;
    } else {
        msgDiv.innerHTML = `<div class="author">${data.nick}</div><div class="text">${data.text}</div>`;
    }
    messagesDiv.appendChild(msgDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

messageInput.addEventListener('input', () => {
    clearTimeout(typingTimeout);
    typingIndicator.innerText = `${nicknameInput.value || '有人'} 正在输入...`;
    typingTimeout = setTimeout(() => { typingIndicator.innerText = ''; }, 1500);
});
