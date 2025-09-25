// Chat Module
class ChatModule {
    constructor(app) {
        this.app = app;
        this.messages = [];
        this.isTyping = false;
        this.initialize();
    }

    initialize() {
        this.chatMessages = document.querySelector('.chat-messages');
        this.chatInput = document.querySelector('.chat-input');
        this.sendButton = document.getElementById('send-btn');
        this.voiceButton = document.getElementById('voice-btn');
        this.typingIndicator = document.querySelector('.typing-indicator');

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Send message on button click
        this.sendButton.addEventListener('click', () => {
            this.sendMessage(this.chatInput.value);
        });

        // Send message on Enter key
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage(this.chatInput.value);
            }
        });

        // Voice input
        this.voiceButton.addEventListener('click', () => {
            this.startVoiceInput();
        });
    }

    // Add message to chat
    addMessage(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender + '-message');
        
        const messageContent = document.createElement('div');
        messageContent.classList.add('message-content');
        messageContent.textContent = content;
        
        const messageTime = document.createElement('div');
        messageTime.classList.add('message-time');
        messageTime.textContent = this.getCurrentTime();
        
        messageDiv.appendChild(messageContent);
        messageDiv.appendChild(messageTime);
        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;

        // Store message
        this.messages.push({
            content,
            sender,
            timestamp: new Date()
        });
    }

    // Get current time
    getCurrentTime() {
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes() < 10 ? '0' + now.getMinutes() : now.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        return hours + ':' + minutes + ' ' + ampm;
    }

    // Send message to API
    async sendMessage(message) {
        if (!message.trim()) return;

        // Add user message
        this.addMessage(message, 'user');
        this.chatInput.value = '';
        
        // Show typing indicator
        this.showTypingIndicator();

        try {
            const response = await this.callChatAPI(message);
            this.addMessage(response, 'bot');
            this.speakText(response);
        } catch (error) {
            this.addMessage("त्रुटि: " + error.message, 'bot');
        } finally {
            this.hideTypingIndicator();
        }
    }

    // Call chat API
    async callChatAPI(message) {
        const response = await fetch(this.app.config.api.chat, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });

        if (!response.ok) {
            throw new Error('API error');
        }

        const data = await response.json();
        return data.reply || "माफ़ करें, इस समय मैं जवाब नहीं दे पा रहा हूं।";
    }

    // Show typing indicator
    showTypingIndicator() {
        this.typingIndicator.style.display = 'block';
        this.isTyping = true;
    }

    // Hide typing indicator
    hideTypingIndicator() {
        this.typingIndicator.style.display = 'none';
        this.isTyping = false;
    }

    // Speak text
    speakText(text) {
        if (!('speechSynthesis' in window)) return;

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = this.app.config.defaultLanguage;
        window.speechSynthesis.speak(utterance);
    }

    // Start voice input
    startVoiceInput() {
        if (this.app.modules.voice) {
            this.app.modules.voice.startVoiceInput((text) => {
                this.chatInput.value = text;
            });
        }
    }

    // Start video call
    async startVideoCall() {
        try {
            this.addMessage("वीडियो कॉल शुरू की जा रही है...", 'bot');
            
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: true, 
                audio: true 
            });
            
            this.showVideoStream(stream, "वीडियो कॉल");
            
        } catch (error) {
            this.addMessage("वीडियो कॉल त्रुटि: " + error.message, 'bot');
        }
    }

    // Show video stream in chat
    showVideoStream(stream, title) {
        const video = document.createElement('video');
        video.srcObject = stream;
        video.autoplay = true;
        video.controls = true;
        video.style.width = '100%';
        video.style.maxHeight = '300px';
        video.style.borderRadius = '12px';
        video.style.marginTop = '10px';

        this.chatMessages.appendChild(video);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;

        // Handle stream end
        stream.getTracks().forEach(track => {
            track.onended = () => {
                video.remove();
                this.addMessage(`${title} बंद हुई।`, 'bot');
            };
        });
    }
}
