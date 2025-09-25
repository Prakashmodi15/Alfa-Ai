// App Configuration - यहाँ नई features register करें
const APP_CONFIG = {
    name: "Alfa AI",
    version: "1.0.0",
    defaultLanguage: "hi-IN",
    
    // Features Configuration
    features: {
        voiceCommands: true,
        videoCall: true,
        screenShare: true,
        multiLanguage: true
    },
    
    // Registered Commands
    commands: {
        "whatsapp": {
            handler: "handleWhatsApp",
            description: "WhatsApp संदेश भेजें"
        },
        "youtube": {
            handler: "handleYouTube", 
            description: "YouTube खोलें"
        },
        "facebook": {
            handler: "handleFacebook",
            description: "Facebook खोलें"
        },
        "instagram": {
            handler: "handleInstagram",
            description: "Instagram खोलें"
        },
        "call": {
            handler: "handleCall",
            description: "कॉल करें"
        }
    },
    
    // API Endpoints
    api: {
        chat: "/api/alfa",
        voice: "/api/voice"
    }
};

// New features यहाँ add करें
const FEATURE_REGISTRY = {
    // Future features will be added here dynamically
};
