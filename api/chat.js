import fetch from 'node-fetch';

export default function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ response: "Method not allowed" });

    const { message } = req.body;
    if (!message) return res.status(400).json({ response: "⚠️ Message missing" });

    (async () => {
        try {
            console.log("Sending message:", message);

            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'deepseek/deepseek-chat-v3.1:free',
                    messages: [{ role: 'user', content: message }]
                })
            });

            const data = await response.json();
            console.log("OpenRouter response:", data);

            const aiResponse = data?.choices?.[0]?.message?.content || "⚠️ AI se response nahi aaya";
            res.status(200).json({ response: aiResponse });

        } catch (err) {
            console.error("Error connecting to OpenRouter:", err);
            res.status(500).json({ response: "⚠️ Error: Server se connect nahi ho pa raha" });
        }
    })();
}
