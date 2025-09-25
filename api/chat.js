// /api/chat.js
export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ response: "⚠️ Message missing" });
        }

        try {
            // OpenRouter DeepSeek V3 API call
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'deepseek/deepseek-v3-0324:free',
                    messages: [{ role: 'user', content: message }]
                })
            });

            const data = await response.json();
            const aiResponse = data?.choices?.[0]?.message?.content || "⚠️ AI se response nahi aaya";

            return res.status(200).json({ response: aiResponse });

        } catch (error) {
            console.error('Error:', error);
            return res.status(500).json({ response: "⚠️ Error: Server se connect nahi ho pa raha" });
        }

    } else {
        return res.status(405).json({ response: "Method not allowed" });
    }
}
