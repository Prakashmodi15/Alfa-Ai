export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Only POST allowed" });
  }

  if (!process.env.OPENROUTER_API_KEY) {
    return res.status(500).json({ error: "API key not configured" });
  }

  const { prompt } = req.body;
  if (!prompt || prompt.trim().length === 0) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": req.headers.host || "http://localhost:3000",
        "X-Title": "Alfa AI",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat:free",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    const data = await r.json();

    if (!r.ok) {
      return res
        .status(r.status)
        .json({ error: data.error?.message || "OpenRouter API error" });
    }

    const reply = data.choices?.[0]?.message?.content || "No reply";
    res.status(200).json({ reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
