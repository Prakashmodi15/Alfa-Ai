// ================= API CALL FUNCTION =================
async function sendMessageToAPI(message) {
    try {
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message })
        });
        const data = await response.json();
        return data.reply;
    } catch (error) {
        console.error("Error:", error);
        return "⚠️ Error: Server se connect nahi ho pa raha.";
    }
}

// ================= DOM ELEMENTS =================
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const messagesContainer = document.getElementById('messagesContainer');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const voiceBtn = document.getElementById('voiceBtn');
const newChatBtn = document.querySelector('.new-chat-btn');
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeModal = document.getElementById('closeModal');
const saveSettings = document.getElementById('saveSettings');
const themeToggle = document.getElementById('themeToggle');
const voiceSelect = document.getElementById('voiceSelect');
const speedSelect = document.getElementById('speedSelect');
const themeSelect = document.getElementById('themeSelect');

// ================= TOGGLE SIDEBAR =================
menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
});

// ================= AUTO-RESIZE TEXTAREA =================
messageInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
});

// ================= SEND MESSAGE =================
async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    addMessage(message, 'user');
    messageInput.value = '';
    messageInput.style.height = 'auto';
    scrollToBottom();

    showTypingIndicator();

    const response = await sendMessageToAPI(message);

    removeTypingIndicator();
    addMessage(response || "Dhanyavad! Aap kya janna chahte hain?", 'ai');
}

// ================= ADD MESSAGE TO UI =================
function addMessage(content, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${sender}-message`);

    const avatar = document.createElement('div');
    avatar.classList.add('message-avatar');
    avatar.textContent = sender === 'ai' ? 'AI' : 'U';
    messageDiv.appendChild(avatar);

    const messageContent = document.createElement('div');
    messageContent.classList.add('message-content');
    messageContent.textContent = content;
    messageDiv.appendChild(messageContent);

    const messageTime = document.createElement('div');
    messageTime.classList.add('message-time');
    messageTime.textContent = getCurrentTime();
    messageDiv.appendChild(messageTime);

    messagesContainer.appendChild(messageDiv);
    scrollToBottom();
}

// ================= TYPING INDICATOR =================
function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.classList.add('typing-indicator');
    typingDiv.id = 'typingIndicator';
    typingDiv.textContent = 'Alfa AI typing...';
    messagesContainer.appendChild(typingDiv);
    scrollToBottom();
}
function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) typingIndicator.remove();
}

// ================= UTILITIES =================
function getCurrentTime() {
    const now = new Date();
    return `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
}
function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// ================= EVENT LISTENERS =================
sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
});

// ================= VOICE RECOGNITION =================
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
let isListening = false;
if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = 'hi-IN';
    recognition.onstart = () => { isListening = true; voiceBtn.classList.add('listening'); voiceBtn.innerHTML='<i class="fas fa-microphone-slash"></i>'; };
    recognition.onresult = e => { messageInput.value = e.results[0][0].transcript; sendMessage(); };
    recognition.onend = () => { isListening=false; voiceBtn.classList.remove('listening'); voiceBtn.innerHTML='<i class="fas fa-microphone"></i>'; };
}
voiceBtn.addEventListener('click', () => { if (!SpeechRecognition){ alert('Voice not supported'); return; } isListening ? recognition.stop() : recognition.start(); });

// ================= SETTINGS =================
function loadSettings() {
    const savedSettings = localStorage.getItem('alfaSettings');
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        voiceSelect.value = settings.voice || 'default';
        speedSelect.value = settings.speed || 'normal';
        themeSelect.value = settings.theme || 'dark';
        document.body.classList.toggle('light-theme', settings.theme==='light');
        themeToggle.innerHTML = settings.theme==='light' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
    }
}
saveSettings.addEventListener('click', () => {
    const settings = {voice: voiceSelect.value, speed: speedSelect.value, theme: themeSelect.value};
    localStorage.setItem('alfaSettings', JSON.stringify(settings));
    document.body.classList.toggle('light-theme', settings.theme==='light');
    themeToggle.innerHTML = settings.theme==='light' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
    settingsModal.style.display='none';
});
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    const savedSettings = JSON.parse(localStorage.getItem('alfaSettings')||'{}');
    savedSettings.theme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
    themeToggle.innerHTML = savedSettings.theme==='light'?'<i class="fas fa-moon"></i>':'<i class="fas fa-sun"></i>';
    localStorage.setItem('alfaSettings', JSON.stringify(savedSettings));
});
settingsBtn.addEventListener('click',()=>settingsModal.style.display='flex');
closeModal.addEventListener('click',()=>settingsModal.style.display='none');
window.addEventListener('click',e=>{ if(e.target===settingsModal) settingsModal.style.display='none'; });

// ================= NEW CHAT =================
newChatBtn.addEventListener('click',()=>{ messagesContainer.innerHTML=''; addMessage("Namaste! Main Alfa AI hoon, Prakash Modi ji ka personal assistant.",'ai'); });

// ================= INITIALIZE =================
window.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    setTimeout(()=>{ if(messagesContainer.children.length===0) addMessage("Namaste! Main Alfa AI hoon, Prakash Modi ji ka personal assistant.",'ai'); },1000);
});
