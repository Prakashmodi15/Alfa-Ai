// Command Module
class CommandModule {
    constructor(app) {
        this.app = app;
        this.commands = app.config.commands;
    }

    // Execute command
    execute(commandText) {
        this.app.modules.chat.addMessage(`कमांड: ${commandText}`, 'user');

        // Find matching command
        const matchedCommand = this.findMatchingCommand(commandText);
        
        if (matchedCommand) {
            this.executeCommandHandler(matchedCommand, commandText);
        } else {
            this.app.modules.chat.addMessage(
                `मैंने आपकी कमांड समझी: ${commandText}. लेकिन मैं इसे प्रोसेस नहीं कर सकता।`, 
                'bot'
            );
        }
    }

    // Find matching command
    findMatchingCommand(commandText) {
        const lowerCommand = commandText.toLowerCase();
        
        for (const [key, command] of Object.entries(this.commands)) {
            if (lowerCommand.includes(key)) {
                return command;
            }
        }
        return null;
    }

    // Execute command handler
    executeCommandHandler(command, originalText) {
        const handlerName = command.handler;
        
        if (this[handlerName]) {
            this[handlerName](originalText);
        } else {
            this.app.modules.chat.addMessage(
                `कमांड हैंडलर '${handlerName}' नहीं मिला।`, 
                'bot'
            );
        }
    }

    // WhatsApp command handler
    handleWhatsApp(command) {
        const messageMatch = command.match(/को (.+) भेजो/i);
        let message = "Hello";
        
        if (messageMatch) {
            message = messageMatch[1].trim();
        }
        
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
        this.app.modules.chat.addMessage(`WhatsApp message भेजा जा रहा है...`, 'bot');
    }

    // YouTube command handler
    handleYouTube(command) {
        const searchMatch = command.match(/(खोलो|चलाओ) (.+)/i);
        
        if (searchMatch) {
            const query = searchMatch[2].trim();
            window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, '_blank');
            this.app.modules.chat.addMessage(`YouTube पर "${query}" खोला जा रहा है...`, 'bot');
        } else {
            window.open('https://www.youtube.com', '_blank');
            this.app.modules.chat.addMessage("YouTube खोला जा रहा है...", 'bot');
        }
    }

    // Facebook command handler
    handleFacebook(command) {
        window.open('https://www.facebook.com', '_blank');
        this.app.modules.chat.addMessage("Facebook खोला जा रहा है...", 'bot');
    }

    // Instagram command handler
    handleInstagram(command) {
        window.open('https://www.instagram.com', '_blank');
        this.app.modules.chat.addMessage("Instagram खोला जा रहा है...", 'bot');
    }

    // Call command handler
    handleCall(command) {
        this.app.modules.chat.addMessage("कॉल सुविधा जल्द ही उपलब्ध होगी...", 'bot');
    }

    // Register new command
    registerCommand(name, handler, description) {
        this.commands[name] = {
            handler: handler,
            description: description
        };
    }
}
