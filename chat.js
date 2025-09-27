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
const newChatBtn = document.getElementById('newChatBtn');
const voiceLogo = document.getElementById('voiceLogo');

// ================= SIDEBAR TOGGLE =================
menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
});

// ================= SCROLL TO BOTTOM =================
function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// ================= ADD MESSAGE =================
function addMessage(content, sender) {
    const msg = document.createElement('div');
    msg.classList.add('message', `${sender}-message`);

    const avatar = document.createElement('div');
    avatar.classList.add('message-avatar');
    avatar.textContent = sender === 'ai' ? 'α' : 'U';
    msg.appendChild(avatar);

    const messageContent = document.createElement('div');
    messageContent.classList.add('message-content');
    messageContent.textContent = content;
    msg.appendChild(messageContent);

    messagesContainer.appendChild(msg);
    scrollToBottom();
}

// ================= TEXT TO SPEECH =================
function speakText(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'hi-IN';
        speechSynthesis.speak(utterance);
        voiceLogo.style.display = 'block';
        utterance.onend = () => voiceLogo.style.display = 'none';
    }
}

// ================= SEND MESSAGE =================
async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    addMessage(message, 'user');
    messageInput.value = '';
    scrollToBottom();

    // Show typing indicator
    const typingDiv = document.createElement('div');
    typingDiv.textContent = 'Alfa AI typing...';
    typingDiv.id = 'typingIndicator';
    messagesContainer.appendChild(typingDiv);
    scrollToBottom();

    const response = await sendMessageToAPI(message);

    document.getElementById('typingIndicator').remove();

    addMessage(response || "Dhanyavad! Aap kya janna chahte hain?", 'ai');
    speakText(response);
}

// ================= SEND BUTTON =================
sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// ================= VOICE RECOGNITION =================
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition, isListening = false;

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = 'hi-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
        isListening = true;
        voiceBtn.style.background = "#4CAF50";
    };

    recognition.onresult = e => {
        const transcript = e.results[0][0].transcript;
        messageInput.value = transcript;
        sendMessage();
    };

    recognition.onend = () => {
        isListening = false;
        voiceBtn.style.background = "";
    };
}

voiceBtn.addEventListener('click', () => {
    if (!SpeechRecognition) return alert("Voice not supported");
    if (isListening) recognition.stop();
    else recognition.start();
});

// ================= NEW CHAT =================
newChatBtn.addEventListener('click', () => {
    messagesContainer.innerHTML = '';
    addMessage("Namaste! Main Alfa AI hoon, Prakash Modi ka personal assistant.", 'ai');
});

// ================= INITIALIZE =================
window.addEventListener('DOMContentLoaded', () => {
    addMessage("Namaste! Main Alfa AI hoon, Prakash Modi ka personal assistant.", 'ai');
});
