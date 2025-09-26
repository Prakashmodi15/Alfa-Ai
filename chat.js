// ================= API CALL FUNCTION =================
async function sendMessageToAPI(message) {
    try {
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message })
        });
        const data = await response.json();
        return data.reply; // ✅ Backend ka "reply" key use ho raha hai
    } catch (error) {
        console.error("Error:", error);
        return "⚠️ Error: Server se connect nahi ho pa raha.";
    }
}

// ================= DOM ELEMENTS =================
const messagesContainer = document.getElementById('messagesContainer');
const textInput = document.getElementById('textInput');
const sendBtn = document.getElementById('sendBtn');
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

// ================= SETTINGS =================
function loadSettings() {
    const savedSettings = localStorage.getItem('alfaSettings');
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        voiceSelect.value = settings.voice || 'default';
        speedSelect.value = settings.speed || 'normal';
        themeSelect.value = settings.theme || 'dark';
        if (settings.theme === 'light') {
            document.body.classList.add('light-theme');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        } else {
            document.body.classList.remove('light-theme');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
    }
}

// ================= SEND MESSAGE =================
async function sendMessage() {
    const message = textInput.value.trim();
    if (!message) return;

    addMessage(message, 'user');
    textInput.value = '';
    textInput.style.height = 'auto';

    const welcomeScreen = document.querySelector('.welcome-screen');
    if (welcomeScreen) welcomeScreen.style.display = 'none';

    showTypingIndicator();

    // === API CALL ===
    const response = await sendMessageToAPI(message);

    removeTypingIndicator();
    addMessage(response || generateAIResponse(message), 'ai');
}

// ================= MESSAGE UI =================
function addMessage(content, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${sender}-message`);
    
    const messageContent = document.createElement('div');
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
    const typingText = document.createElement('span');
    typingText.textContent = 'Alfa AI typing';
    typingDiv.appendChild(typingText);
    const typingDots = document.createElement('div');
    typingDots.classList.add('typing-dots');
    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('div');
        dot.classList.add('typing-dot');
        typingDots.appendChild(dot);
    }
    typingDiv.appendChild(typingDots);
    messagesContainer.appendChild(typingDiv);
    scrollToBottom();
}
function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) typingIndicator.remove();
}

// ================= GENERATE LOCAL AI RESPONSE =================
function generateAIResponse(userMessage) {
    const lowerMessage = userMessage.toLowerCase();
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('namaste')) {
        return "Namaste! Main Alfa AI hoon, Prakash Modi ji ka personal assistant. Aaj main aapki kya madad kar sakta hoon?";
    } else if (lowerMessage.includes('weather') || lowerMessage.includes('mausam')) {
        return "Aaj Delhi ka mausam clear hai, temperature 28°C hai.";
    } else if (lowerMessage.includes('news') || lowerMessage.includes('khabar')) {
        return "Aaj ki top news: Technology sector mein naye innovations, stock market stable hai.";
    } else if (lowerMessage.includes('time') || lowerMessage.includes('samay')) {
        return `Abhi samay hai: ${new Date().toLocaleTimeString('hi-IN')}`;
    } else {
        return "Dhanyavad! Aap kya janna chahte hain?";
    }
}

// ================= UTILITY =================
function getCurrentTime() {
    const now = new Date();
    return `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
}
function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// ================= EVENT LISTENERS =================
sendBtn.addEventListener('click', sendMessage);
textInput.addEventListener('keydown', e => { if(e.key==='Enter' && e.ctrlKey){ e.preventDefault(); sendMessage(); } });

// ================= VOICE RECOGNITION =================
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
let isListening = false;
if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = 'hi-IN';
    recognition.onstart = () => { isListening = true; voiceBtn.classList.add('listening'); voiceBtn.innerHTML='<i class="fas fa-microphone-slash"></i>'; };
    recognition.onresult = e => { textInput.value = e.results[0][0].transcript; sendMessage(); };
    recognition.onend = () => { isListening=false; voiceBtn.classList.remove('listening'); voiceBtn.innerHTML='<i class="fas fa-microphone"></i>'; };
}
voiceBtn.addEventListener('click', () => { if (!SpeechRecognition){ alert('Voice not supported'); return; } isListening ? recognition.stop() : recognition.start(); });

// ================= SETTINGS & THEME =================
saveSettings.addEventListener('click', () => {
    const voice = voiceSelect.value;
    const speed = speedSelect.value;
    const theme = themeSelect.value;
    localStorage.setItem('alfaSettings', JSON.stringify({voice, speed, theme}));
    if (theme==='light'){ document.body.classList.add('light-theme'); themeToggle.innerHTML='<i class="fas fa-moon"></i>'; }
    else{ document.body.classList.remove('light-theme'); themeToggle.innerHTML='<i class="fas fa-sun"></i>'; }
    alert('Settings saved successfully!'); settingsModal.style.display='none';
});
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    const savedSettings = JSON.parse(localStorage.getItem('alfaSettings')||'{}');
    if(document.body.classList.contains('light-theme')){
        themeToggle.innerHTML='<i class="fas fa-moon"></i>'; savedSettings.theme='light';
    }else{ themeToggle.innerHTML='<i class="fas fa-sun"></i>'; savedSettings.theme='dark'; }
    localStorage.setItem('alfaSettings', JSON.stringify(savedSettings));
});
settingsBtn.addEventListener('click',()=>settingsModal.style.display='flex');
closeModal.addEventListener('click',()=>settingsModal.style.display='none');
window.addEventListener('click',e=>{ if(e.target===settingsModal) settingsModal.style.display='none'; });

// ================= INITIALIZE =================
window.addEventListener('DOMContentLoaded', loadSettings);
setTimeout(()=>{ if(messagesContainer.children.length===0) addMessage("Namaste! Main Alfa AI hoon, Prakash Modi ji ka personal assistant.",'ai'); },1000);
