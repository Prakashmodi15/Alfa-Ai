// api/chat.js
export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ response: "⚠️ Message missing" });
        }

        // Yahan aap real AI API call ya local logic laga sakte ho
        let aiResponse;

        // Simple local AI fallback
        const lowerMessage = message.toLowerCase();
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('namaste')) {
            aiResponse = "Namaste! Main Alfa AI hoon, Prakash Modi ji ka personal assistant.";
        } else if (lowerMessage.includes('time') || lowerMessage.includes('samay')) {
            aiResponse = `Abhi samay hai: ${new Date().toLocaleTimeString('hi-IN')}`;
        } else {
            aiResponse = "Dhanyavad! Main aapki query ko samajhne ki koshish kar raha hoon.";
        }

        return res.status(200).json({ response: aiResponse });
    } else {
        res.status(405).json({ response: "Method not allowed" });
    }
}
