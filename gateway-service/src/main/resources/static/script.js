const API_BASE = 'http://localhost:8080'; // gateway
const CHAT_FALLBACK_BASE = 'http://localhost:8083'; // lazım olsa birbaşa chat-service
const USE_GATEWAY_FOR_CHAT = true;

const state = {
    token: localStorage.getItem('gm_token') || '',
    user: JSON.parse(localStorage.getItem('gm_user') || 'null'),
    rooms: [],
    activeRoom: null,
    pollTimer: null,
};

const authView = document.getElementById('authView');
const appView = document.getElementById('appView');
const authMessage = document.getElementById('authMessage');

const loginForm = document.getElementById('loginTab');
const registerForm = document.getElementById('registerTab');
const tabButtons = document.querySelectorAll('.tab-btn');

const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const registerUsername = document.getElementById('registerUsername');
const registerEmail = document.getElementById('registerEmail');
const registerPassword = document.getElementById('registerPassword');

const roomList = document.getElementById('roomList');
const roomTitle = document.getElementById('roomTitle');
const roomDescription = document.getElementById('roomDescription');
const roomStatus = document.getElementById('roomStatus');
const messagesList = document.getElementById('messagesList');
const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');

const profileName = document.getElementById('profileName');
const profileEmail = document.getElementById('profileEmail');
const profileAvatar = document.getElementById('profileAvatar');

const logoutBtn = document.getElementById('logoutBtn');
const refreshRoomsBtn = document.getElementById('refreshRoomsBtn');

function setMessage(text, type = 'success') {
    authMessage.textContent = text;
    authMessage.className = `message-box ${type}`;
    authMessage.classList.remove('hidden');
}

function clearMessage() {
    authMessage.className = 'message-box hidden';
    authMessage.textContent = '';
}

function setActiveTab(tabId) {
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.toggle('active', form.id === tabId);
    });

    tabButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
}

async function apiFetch(path, options = {}) {
    const headers = {
        ...(options.headers || {}),
    };

    if (state.token) {
        headers.Authorization = `Bearer ${state.token}`;
    }

    if (options.body && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed: ${res.status}`);
    }

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
        return res.json();
    }

    return res.text();
}

function saveSession(authResponse) {
    state.token = authResponse.token;
    state.user = authResponse;
    localStorage.setItem('gm_token', authResponse.token);
    localStorage.setItem('gm_user', JSON.stringify(authResponse));
}

function clearSession() {
    state.token = '';
    state.user = null;
    state.rooms = [];
    state.activeRoom = null;
    localStorage.removeItem('gm_token');
    localStorage.removeItem('gm_user');
    stopPolling();
}

function showApp() {
    authView.classList.add('hidden');
    appView.classList.remove('hidden');

    profileName.textContent = state.user?.username || 'User';
    profileEmail.textContent = state.user?.email || '';
    profileAvatar.textContent = (state.user?.username || 'U').slice(0, 1).toUpperCase();
}

function showAuth() {
    appView.classList.add('hidden');
    authView.classList.remove('hidden');
}

async function login(email, password) {
    const result = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        headers: { 'Content-Type': 'application/json' },
    });

    saveSession(result);
    showApp();
    await loadRooms();
    setMessage('Login successful.', 'success');
}

async function register(username, email, password) {
    const result = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password }),
        headers: { 'Content-Type': 'application/json' },
    });

    saveSession(result);
    showApp();
    await loadRooms();
    setMessage('Account created successfully.', 'success');
}

function renderRooms() {
    roomList.innerHTML = '';

    if (!state.rooms.length) {
        roomList.innerHTML = `<div class="empty-state"><p>No rooms found.</p></div>`;
        return;
    }

    state.rooms.forEach(room => {
        const item = document.createElement('div');
        item.className = `room-item ${state.activeRoom?.code === room.code ? 'active' : ''}`;
        item.innerHTML = `
      <strong>${prettyRoomName(room.code, room.title)}</strong>
      <p>${room.description || ''}</p>
    `;
        item.addEventListener('click', () => selectRoom(room));
        roomList.appendChild(item);
    });
}

function prettyRoomName(code, title) {
    if (title) return title;
    if (code === 'GENERAL_CHAT') return 'General Chat';
    if (code === 'GAME_ROOM') return 'Game Room';
    if (code === 'LANGUAGE_ROOM') return 'Language Room';
    return code;
}

async function loadRooms() {
    try {
        const rooms = await apiFetch('/api/rooms');
        state.rooms = rooms;
        renderRooms();

        if (!state.activeRoom && rooms.length) {
            await selectRoom(rooms[0]);
        }
    } catch (err) {
        roomList.innerHTML = `<div class="empty-state"><p>Unable to load rooms.</p></div>`;
        console.error(err);
    }
}

function renderMessages(messages) {
    if (!messages.length) {
        messagesList.innerHTML = `
      <div class="empty-state">
        <h3>No messages yet</h3>
        <p>Be the first to say something in this room.</p>
      </div>
    `;
        return;
    }

    messagesList.innerHTML = '';
    messages.forEach(msg => {
        const wrap = document.createElement('div');
        wrap.className = `message ${msg.sender === state.user?.username ? 'self' : ''}`;

        const avatar = (msg.sender || 'U').slice(0, 1).toUpperCase();
        const time = msg.sentAt ? new Date(msg.sentAt).toLocaleString() : '';

        wrap.innerHTML = `
      <div class="msg-avatar">${avatar}</div>
      <div class="msg-body">
        <div class="msg-head">
          <strong>${escapeHtml(msg.sender || 'Unknown')}</strong>
          <span class="msg-time">${escapeHtml(time)}</span>
        </div>
        <p class="msg-content">${escapeHtml(msg.content || '')}</p>
      </div>
    `;

        messagesList.appendChild(wrap);
    });

    messagesList.scrollTop = messagesList.scrollHeight;
}

async function loadMessages(roomCode) {
    try {
        const base = USE_GATEWAY_FOR_CHAT ? API_BASE : CHAT_FALLBACK_BASE;
        const res = await fetch(`${base}/api/chat/${encodeURIComponent(roomCode)}`, {
            headers: state.token ? { Authorization: `Bearer ${state.token}` } : {},
        });

        if (!res.ok) throw new Error('Failed to load messages');

        const messages = await res.json();
        renderMessages(messages);
    } catch (err) {
        console.error(err);
        messagesList.innerHTML = `
      <div class="empty-state">
        <h3>Chat unavailable</h3>
        <p>Message history could not be loaded.</p>
      </div>
    `;
    }
}

async function selectRoom(room) {
    state.activeRoom = room;
    roomTitle.textContent = prettyRoomName(room.code, room.title);
    roomDescription.textContent = room.description || '';
    roomStatus.textContent = room.active ? 'Active' : 'Inactive';
    messageForm.classList.remove('hidden');

    renderRooms();
    await loadMessages(room.code);

    startPolling();
}

async function sendMessage(content) {
    if (!state.activeRoom) return;
    const roomCode = state.activeRoom.code;
    const sender = state.user?.username || state.user?.email || 'user';

    const base = USE_GATEWAY_FOR_CHAT ? API_BASE : CHAT_FALLBACK_BASE;

    await fetch(`${base}/api/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            sender,
            ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}),
        },
        body: JSON.stringify({
            roomCode,
            content,
        }),
    });
}

function startPolling() {
    stopPolling();
    if (!state.activeRoom) return;

    state.pollTimer = setInterval(() => {
        loadMessages(state.activeRoom.code);
    }, 2500);
}

function stopPolling() {
    if (state.pollTimer) {
        clearInterval(state.pollTimer);
        state.pollTimer = null;
    }
}

function escapeHtml(str) {
    return String(str)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        setActiveTab(btn.dataset.tab);
        clearMessage();
    });
});

loginForm.addEventListener('submit', async e => {
    e.preventDefault();
    clearMessage();

    try {
        await login(loginEmail.value.trim(), loginPassword.value);
    } catch (err) {
        setMessage('Login failed. Check email/password.', 'error');
        console.error(err);
    }
});

registerForm.addEventListener('submit', async e => {
    e.preventDefault();
    clearMessage();

    try {
        await register(
            registerUsername.value.trim(),
            registerEmail.value.trim(),
            registerPassword.value
        );
    } catch (err) {
        setMessage('Register failed. Username/email may already exist.', 'error');
        console.error(err);
    }
});

messageForm.addEventListener('submit', async e => {
    e.preventDefault();

    const content = messageInput.value.trim();
    if (!content || !state.activeRoom) return;

    try {
        await sendMessage(content);
        messageInput.value = '';
        await loadMessages(state.activeRoom.code);
    } catch (err) {
        console.error(err);
        alert('Message could not be sent.');
    }
});

logoutBtn.addEventListener('click', () => {
    clearSession();
    showAuth();
    setActiveTab('loginTab');
    clearMessage();
});

refreshRoomsBtn.addEventListener('click', () => loadRooms());

window.addEventListener('load', async () => {
    if (state.token && state.user) {
        showApp();
        await loadRooms();
    } else {
        showAuth();
    }
});