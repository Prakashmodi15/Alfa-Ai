// Main Application Module
class AlphaAI {
    constructor() {
        this.modules = {};
        this.isInitialized = false;
    }

    // Initialize all modules
    async initialize() {
        if (this.isInitialized) return;
        
        try {
            // Load configuration
            await this.loadConfig();
            
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
    async loadConfig() {
        // Configuration is loaded from config.js
        this.config = window.APP_CONFIG || {};
        this.features = window.FEATURE_REGISTRY || {};
    }

    // Initialize chat module
    initializeChat() {
        this.modules.chat = new ChatModule(this);
    }

    // Initialize voice module
    initializeVoice() {
        if (this.config.features.voiceCommands) {
            this.modules.voice = new VoiceModule(this);
        }
    }

    // Initialize commands module
    initializeCommands() {
        this.modules.commands = new CommandModule(this);
    }

    // Initialize UI events
    initializeUI() {
        this.setupEventListeners();
    }

    // Setup event listeners
    setupEventListeners() {
        // Dark mode toggle
        document.getElementById('dark-mode-btn').addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
        });

        // Video call button
        document.getElementById('video-call-btn').addEventListener('click', () => {
            this.modules.chat.startVideoCall();
        });

        // Fullscreen button
        document.getElementById('fullscreen-btn').addEventListener('click', () => {
            this.toggleFullscreen();
        });
    }

    // Toggle fullscreen
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    // Register new feature
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
