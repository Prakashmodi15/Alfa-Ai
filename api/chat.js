export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",  // अपना पसंदीदा मॉडल डाल सकते हो
        messages: [
          { role: "system", content: "Aap ek helpful AI Assistant hain jiska naam Alfa AI hai." },
          { role: "user", content: message }
        ],
      }),
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "⚠️ Maaf kijiye, koi reply nahi mila.";

    return res.status(200).json({ reply }); // ✅ Frontend reply key से ही पढ़ेगा
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
