// Main Application Module
class AlphaAI {
    constructor() {
        this.modules = {};      // Chat, Voice, Command modules
        this.features = {};     // Registered features
        this.isInitialized = false;
    }

    // Initialize all modules
    async initialize() {
        if (this.isInitialized) return;

        try {
            // Load configuration
            this.loadConfig();

            // Initialize modules
            this.initializeChat();
            this.initializeVoice();
            this.initializeCommands();
            this.initializeUI();

            this.isInitialized = true;
            console.log('अल्फा AI initialized successfully');
        } catch (error) {
            console.error('Initialization error:', error);
        }
    }

    // Load configuration
    loadConfig() {
        this.config = window.APP_CONFIG || {};
        this.features = window.FEATURE_REGISTRY || {};
    }

    // Initialize chat module
    initializeChat() {
        if (typeof ChatModule !== "undefined") {
            this.modules.chat = new ChatModule(this);
        } else {
            console.warn('ChatModule not found');
        }
    }

    // Initialize voice module
    initializeVoice() {
        if (this.config.features?.voiceCommands && typeof VoiceModule !== "undefined") {
            this.modules.voice = new VoiceModule(this);
        }
    }

    // Initialize commands module
    initializeCommands() {
        if (typeof CommandModule !== "undefined") {
            this.modules.commands = new CommandModule(this);
        }
    }

    // Initialize UI events
    initializeUI() {
        this.setupEventListeners();
    }

    // Setup event listeners
    setupEventListeners() {
        // Dark mode toggle
        const darkModeBtn = document.getElementById('dark-mode-btn');
        if (darkModeBtn) {
            darkModeBtn.addEventListener('click', () => {
                document.body.classList.toggle('dark-mode');
            });
        }

        // Video call button
        const videoCallBtn = document.getElementById('video-call-btn');
        if (videoCallBtn && this.modules.chat?.startVideoCall) {
            videoCallBtn.addEventListener('click', () => {
                this.modules.chat.startVideoCall();
            });
        }

        // Fullscreen button
        const fullscreenBtn = document.getElementById('fullscreen-btn');
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        }

        // Send chat message
        const sendBtn = document.getElementById('send-btn');
        const chatInput = document.querySelector('.chat-input');
        if (sendBtn && chatInput && this.modules.chat?.sendMessage) {
            sendBtn.addEventListener('click', () => {
                const msg = chatInput.value.trim();
                if (msg) this.modules.chat.sendMessage(msg);
                chatInput.value = '';
            });

            // Enter key sends message
            chatInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const msg = chatInput.value.trim();
                    if (msg) this.modules.chat.sendMessage(msg);
                    chatInput.value = '';
                }
            });
        }
    }

    // Toggle fullscreen
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((err) => {
                console.warn(`Fullscreen request failed: ${err.message}`);
            });
        } else {
            document.exitFullscreen().catch((err) => {
                console.warn(`Exit fullscreen failed: ${err.message}`);
            });
        }
    }

    // Register new feature dynamically
    registerFeature(name, featureModule) {
        this.features[name] = featureModule;
        console.log(`Feature registered: ${name}`);
    }

    // Get feature by name
    getFeature(name) {
        return this.features[name];
    }
}

// Global app instance
window.alphaAI = new AlphaAI();

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.alphaAI.initialize();
});
