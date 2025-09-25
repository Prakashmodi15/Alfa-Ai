// api/chat.js
export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ response: "Method Not Allowed" });
    }

    const { message } = req.body;

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
            },
            body: JSON.stringify({
                model: "openai/gpt-3.5-turbo",
                messages: [{ role: "user", content: message }]
            })
        });

        const data = await response.json();

        // error handling agar choices exist na kare
        if (!data.choices || !data.choices[0]) {
            return res.status(500).json({ response: "⚠️ OpenRouter API se response nahi mila." });
        }

        res.status(200).json({ response: data.choices[0].message.content });
    } catch (error) {
        console.error("API error:", error);
        res.status(500).json({ response: "⚠️ OpenRouter API call failed." });
    }
}
