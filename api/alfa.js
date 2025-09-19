export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Only POST allowed" });
  }

  if (!process.env.OPENROUTER_API_KEY) {
    return res.status(500).json({ error: "OpenRouter API key not configured" });
  }

  const { message } = req.body;
  if (!message || message.trim().length === 0) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat:free", // 👈 DeepSeek free model slug
        messages: [{ role: "user", content: message }],
      }),
    });

    const data = await r.json();

    if (!r.ok) {
      console.error("OpenRouter Error:", data);
      return res.status(r.status).json({ error: data.error?.message || "OpenRouter API error" });
    }

    const reply = data.choices?.[0]?.message?.content || "No reply from AI";
    res.status(200).json({ reply });
  } catch (err) {
    console.error("Backend Error:", err);
    res.status(500).json({ error: err.message });
  }
}
