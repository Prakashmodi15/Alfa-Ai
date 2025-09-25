export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ response: "Method Not Allowed" });
    }

    const { message } = req.body;

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "HTTP-Referer": "https://your-vercel-app.vercel.app", // अपना Vercel domain
                "X-Title": "Alfa AI Chat"
            },
            body: JSON.stringify({
                model: "openai/gpt-3.5-turbo", // आप कोई भी model चुन सकते हो
                messages: [{ role: "user", content: message }]
            })
        });

        const data = await response.json();
        res.status(200).json({ response: data.choices[0].message.content });
    } catch (error) {
        console.error("API error:", error);
        res.status(500).json({ response: "⚠️ OpenRouter API call failed." });
    }
}
