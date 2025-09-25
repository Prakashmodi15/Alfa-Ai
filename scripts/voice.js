// Voice Module
class VoiceModule {
    constructor(app) {
        this.app = app;
        this.isListening = false;
        this.voiceRecognition = null;
        this.initialize();
    }

    initialize() {
        this.setupSpeechRecognition();
        this.setupVoiceUI();
    }

    // Setup speech recognition
    setupSpeechRecognition() {
        if ('webkitSpeechRecognition' in window) {
            this.voiceRecognition = new webkitSpeechRecognition();
            this.voiceRecognition.continuous = false;
            this.voiceRecognition.lang = this.app.config.defaultLanguage;
            this.voiceRecognition.interimResults = false;
            this.voiceRecognition.maxAlternatives = 1;

            this.setupRecognitionEvents();
        }
    }

    // Setup recognition events
    setupRecognitionEvents() {
        this.voiceRecognition.onresult = (event) => {
            const text = event.results[0][0].transcript;
            this.handleVoiceResult(text);
        };

        this.voiceRecognition.onerror = (error) => {
            this.handleRecognitionError(error);
        };

        this.voiceRecognition.onend = () => {
            this.isListening = false;
            this.updateListeningUI(false);
        };
    }

    // Setup voice UI
    setupVoiceUI() {
        this.voiceCommandBtn = document.getElementById('voiceCommandBtn');
        this.commandOutput = document.getElementById('commandOutput');
        this.commandText = document.getElementById('commandText');
        
        this.voiceCommandBtn.addEventListener('click', () => {
            this.toggleVoiceCommand();
        });
    }

    // Toggle voice command
    toggleVoiceCommand() {
        if (this.isListening) {
            this.stopListening();
        } else {
            this.startVoiceCommand();
        }
    }

    // Start voice command
    startVoiceCommand() {
        if (!this.voiceRecognition) {
            this.app.modules.chat.addMessage("वॉइस कमांड समर्थित नहीं है।", 'bot');
            return;
        }

        this.isListening = true;
        this.updateListeningUI(true);
        this.voiceRecognition.start();
    }

    // Stop listening
    stopListening() {
        if (this.voiceRecognition) {
            this.voiceRecognition.stop();
        }
        this.isListening = false;
        this.updateListeningUI(false);
    }

    // Handle voice result
    handleVoiceResult(text) {
        if (this.currentCallback) {
            this.currentCallback(text);
            this.currentCallback = null;
        } else {
            this.processVoiceCommand(text);
        }
    }

    // Process voice command
    processVoiceCommand(command) {
        this.showCommandOutput(command);
    }

    // Show command output
    showCommandOutput(command) {
        this.commandText.textContent = `कमांड: ${command}`;
        this.commandOutput.classList.add('show');

        // Setup execute button
        document.getElementById('executeCommand').onclick = () => {
            this.executeCommand(command);
            this.commandOutput.classList.remove('show');
        };

        // Setup cancel button
        document.getElementById('cancelCommand').onclick = () => {
            this.commandOutput.classList.remove('show');
            this.app.modules.chat.addMessage("कमांड रद्द की गई।", 'bot');
        };
    }

    // Execute command
    executeCommand(command) {
        this.app.modules.commands.execute(command);
    }

    // Handle recognition error
    handleRecognitionError(error) {
        this.isListening = false;
        this.updateListeningUI(false);
        this.app.modules.chat.addMessage("वॉइस त्रुटि: " + error.error, 'bot');
    }

    // Update listening UI
    updateListeningUI(listening) {
        if (listening) {
            this.voiceCommandBtn.classList.add('listening');
        } else {
            this.voiceCommandBtn.classList.remove('listening');
        }
    }

    // Start voice input for chat
    startVoiceInput(callback) {
        this.currentCallback = callback;
        this.startVoiceCommand();
    }
}
