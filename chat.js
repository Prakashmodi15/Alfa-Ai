// DOM Elements
const chatContainer = document.getElementById('chat-container');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const voiceBtn = document.getElementById('voice-btn');
const clearBtn = document.getElementById('clear-btn');
const themeToggle = document.getElementById('theme-toggle');
const voiceSelect = document.getElementById('voice-select');
const speedSelect = document.getElementById('speed-select');
const ttsToggle = document.getElementById('tts-toggle');

// Speech Synthesis Setup
let voices = [];
function loadVoices() {
    voices = speechSynthesis.getVoices();
}

if ('speechSynthesis' in window) {
    speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
}

// Text-to-Speech Function
function speakText(text) {
    if ('speechSynthesis' in window && isTTSEnabled()) {
        // Cancel any ongoing speech
        speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'hi-IN';
        utterance.rate = getSpeechSpeed();

        // Wait for voices to load if not available
        if (voices.length === 0) {
            setTimeout(() => {
                if (voices.length > 0) {
                    setVoiceGender(utterance);
                    speechSynthesis.speak(utterance);
                }
            }, 100);
        } else {
            setVoiceGender(utterance);
            speechSynthesis.speak(utterance);
        }
    }
}

function setVoiceGender(utterance) {
    const selectedVoice = voiceSelect.value;
    const hindiVoices = voices.filter(voice => voice.lang.startsWith('hi'));
    
    if (hindiVoices.length > 0) {
        if (selectedVoice === 'female') {
            utterance.voice = hindiVoices.find(v => v.name.toLowerCase().includes('female')) || hindiVoices[0];
        } else if (selectedVoice === 'male') {
            utterance.voice = hindiVoices.find(v => v.name.toLowerCase().includes('male')) || hindiVoices[0];
        } else {
            utterance.voice = hindiVoices[0];
        }
    }
}

function getSpeechSpeed() {
    return parseFloat(speedSelect.value) || 1.0;
}

function isTTSEnabled() {
    return ttsToggle.checked;
}

// Speech Recognition
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
        voiceBtn.title = "Listening... Click to stop";
        messageInput.placeholder = "Listening... Speak now";
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        messageInput.value = transcript;
        sendMessage();
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
            alert('Microphone permission denied. Please allow microphone access.');
        }
    };

    recognition.onend = () => {
        isListening = false;
        voiceBtn.classList.remove('listening');
        voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        voiceBtn.title = "Click to speak";
        messageInput.placeholder = "Type your message...";
    };
}

// Voice Button Event
voiceBtn.addEventListener('click', () => {
    if (!SpeechRecognition) {
        alert('Speech recognition is not supported in your browser. Try Chrome or Edge.');
        return;
    }
    
    if (isListening) {
        recognition.stop();
    } else {
        try {
            recognition.start();
        } catch (error) {
            console.error('Recognition start error:', error);
        }
    }
});

// Send Message Function
async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    addMessage('user', message);
    messageInput.value = '';
    
    // Show typing indicator
    const typingIndicator = addMessage('bot', 'Typing...', true);
    
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message })
        });

        const data = await response.json();
        
        // Remove typing indicator
        typingIndicator.remove();
        
        if (data.reply) {
            const botMessage = addMessage('bot', data.reply);
            speakText(data.reply);
        } else {
            addMessage('bot', '⚠️ Sorry, could not get response.');
        }
    } catch (error) {
        typingIndicator.remove();
        addMessage('bot', '⚠️ Error: ' + error.message);
    }
}

// Add Message to Chat
function addMessage(sender, text, isTyping = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message ${isTyping ? 'typing' : ''}`;
    
    if (!isTyping) {
        messageDiv.innerHTML = `
            <div class="message-content">${formatMessage(text)}</div>
            <div class="message-time">${getCurrentTime()}</div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="message-content typing-indicator">
                <span></span><span></span><span></span>
            </div>
        `;
    }
    
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    return messageDiv;
}

// Format Message Text
function formatMessage(text) {
    // Convert URLs to clickable links
    text = text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
    // Convert line breaks to <br>
    text = text.replace(/\n/g, '<br>');
    return text;
}

// Get Current Time
function getCurrentTime() {
    return new Date().toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
    });
}

// Event Listeners
sendBtn.addEventListener('click', sendMessage);

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

clearBtn.addEventListener('click', () => {
    chatContainer.innerHTML = '';
    // Add welcome message back
    addMessage('bot', 'नमस्ते! मैं Alfa AI हूँ। आप कैसे मदद कर सकता हूँ?');
});

// Theme Toggle
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
});

// Load Saved Theme
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-theme');
}

// Settings Change Events
voiceSelect.addEventListener('change', () => {
    localStorage.setItem('voicePreference', voiceSelect.value);
});

speedSelect.addEventListener('change', () => {
    localStorage.setItem('speechSpeed', speedSelect.value);
});

ttsToggle.addEventListener('change', () => {
    localStorage.setItem('ttsEnabled', ttsToggle.checked);
});

// Load Saved Settings
if (localStorage.getItem('voicePreference')) {
    voiceSelect.value = localStorage.getItem('voicePreference');
}

if (localStorage.getItem('speechSpeed')) {
    speedSelect.value = localStorage.getItem('speechSpeed');
}

if (localStorage.getItem('ttsEnabled')) {
    ttsToggle.checked = localStorage.getItem('ttsEnabled') === 'true';
}

// Initialize with welcome message
window.addEventListener('load', () => {
    addMessage('bot', 'नमस्ते! मैं Alfa AI हूँ। आप कैसे मदद कर सकता हूँ?');
});
