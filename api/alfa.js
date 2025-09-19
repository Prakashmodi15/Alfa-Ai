export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`, // API key .env file me rakho
        "Content-Type": "application/json",
        "HTTP-Referer": "https://your-site-url.com", // optional
        "X-Title": "Alfa AI", // optional
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat-v3-0324:free",
        messages: [
          { role: "user", content: message }
        ],
      }),
    });

    const data = await response.json();

    res.status(200).json({
      reply: data.choices[0].message.content,
    });

  } catch (error) {
    console.error("API error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
}
