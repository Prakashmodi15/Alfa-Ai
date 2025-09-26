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
        return "⚠️ Server se connect nahi ho pa raha.";
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

// ================= ADD MESSAGE TO UI =================
function addMessage(content, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${sender}-message`);

    const avatar = document.createElement('div');
    avatar.classList.add('message-avatar');
    avatar.textContent = sender === 'ai' ? 'α' : 'U';
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

// ================= TEXT-TO-SPEECH (UPDATED) =================
function speakText(text) {
    if ('speechSynthesis' in window && isTTSEnabled()) {
        let voices = speechSynthesis.getVoices();
        if (!voices.length) {
            speechSynthesis.onvoiceschanged = () => {
                voices = speechSynthesis.getVoices();
                playVoice(text, voices);
            };
        } else {
            playVoice(text, voices);
        }
    }
}

function playVoice(text, voices) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hi-IN';
    utterance.rate = getSpeechSpeed();

    if (voiceSelect.value === 'female') {
        utterance.voice = voices.find(v => v.lang.startsWith('hi') && v.name.toLowerCase().includes('female')) || voices[0];
    } else if (voiceSelect.value === 'male') {
        utterance.voice = voices.find(v => v.lang.startsWith('hi') && v.name.toLowerCase().includes('male')) || voices[0];
    }

    speechSynthesis.speak(utterance);
}

function isTTSEnabled() {
    const settings = JSON.parse(localStorage.getItem('alfaSettings') || '{}');
    return settings.ttsEnabled !== false;
}
function getSpeechSpeed() {
    const settings = JSON.parse(localStorage.getItem('alfaSettings') || '{}');
    switch(settings.speed) {
        case 'slow': return 0.7;
        case 'fast': return 1.3;
        default: return 1.0;
    }
}

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

    speakText(response);
}

// ================= VOICE RECOGNITION (UPDATED) =================
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
let isListening = false;

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = 'hi-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
        isListening = true;
        voiceBtn.classList.add('listening');
        voiceBtn.innerHTML = '<i class="fas fa-microphone-slash"></i>';
        voiceBtn.title = "Listening...";
    };

    recognition.onresult = e => {
        const transcript = e.results[0][0].transcript;
        messageInput.value = transcript;
        sendMessage();
    };

    recognition.onend = () => {
        isListening = false;
        voiceBtn.classList.remove('listening');
        voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        voiceBtn.title = "Click to speak";
    };
}

voiceBtn.addEventListener('click', () => {
    if (!SpeechRecognition) {
        alert('Voice not supported');
        return;
    }
    if (isListening) recognition.stop();
    else recognition.start();
});

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

        const ttsToggle = document.getElementById('ttsToggle');
        if (ttsToggle) ttsToggle.checked = settings.ttsEnabled !== false;
    }
}
saveSettings.addEventListener('click', () => {
    const ttsToggle = document.getElementById('ttsToggle');
    const settings = {
        voice: voiceSelect.value,
        speed: speedSelect.value,
        theme: themeSelect.value,
        ttsEnabled: ttsToggle ? ttsToggle.checked : true
    };
    localStorage.setItem('alfaSettings', JSON.stringify(settings));
    document.body.classList.toggle('light-theme', settings.theme==='light');
    themeToggle.innerHTML = settings.theme==='light' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
    settingsModal.style.display='none';
});
themeToggle.addEventListener('click', ()=>{
    document.body.classList.toggle('light-theme');
    const savedSettings = JSON.parse(localStorage.getItem('alfaSettings')||'{}');
    savedSettings.theme = document.body.classList.contains('light-theme')?'light':'dark';
    themeToggle.innerHTML = savedSettings.theme==='light'?'<i class="fas fa-moon"></i>':'<i class="fas fa-sun"></i>';
    localStorage.setItem('alfaSettings', JSON.stringify(savedSettings));
});
settingsBtn.addEventListener('click',()=>settingsModal.style.display='flex');
closeModal.addEventListener('click',()=>settingsModal.style.display='none');
window.addEventListener('click',e=>{ if(e.target===settingsModal) settingsModal.style.display='none'; });

// ================= NEW CHAT =================
newChatBtn.addEventListener('click',()=>{
    messagesContainer.innerHTML='';
    addMessage("Namaste! Main Alfa AI hoon, Prakash Modi ji ka personal assistant.",'ai');
});

// ================= SEND BUTTON =================
sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e)=>{
    if(e.key==='Enter' && !e.shiftKey){
        e.preventDefault();
        sendMessage();
    }
});

// ================= INITIALIZE =================
window.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    setTimeout(()=>{
        if(messagesContainer.children.length===0)
            addMessage("Namaste! Main Alfa AI hoon, Prakash Modi ji ka personal assistant.",'ai');
    },1000);
});
