// /api/chat.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST method allowed" });
  }

  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    let reply = "";

    // ================= Weather Handling =================
    const weatherRegex = /(weather|tapman|temperature|humidity).*(?:in|ka|me)?\s*(.*)/i;
    const weatherMatch = message.match(weatherRegex);

    if (weatherMatch) {
      const location = weatherMatch[2] || "Raniwara"; // Default location
      try {
        const weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`);
        const weatherData = await weatherRes.json();
        if (weatherData.cod === 200) {
          reply = `🌤️ ${location} ka weather: ${weatherData.weather[0].description}, Temperature: ${weatherData.main.temp}°C, Humidity: ${weatherData.main.humidity}%`;
          return res.status(200).json({ reply });
        } else {
          reply = `⚠️ ${location} ka weather nahi mila.`;
          return res.status(200).json({ reply });
        }
      } catch (err) {
        console.error("Weather API Error:", err);
        reply = "⚠️ Weather service se connect nahi ho pa raha.";
        return res.status(200).json({ reply });
      }
    }

    // ================= News Handling =================
    const newsRegex = /(news|aaj ki khabar|kya hua|latest updates|aaj ka update)/i;
    const newsMatch = message.match(newsRegex);

    if (newsMatch) {
      try {
        const newsRes = await fetch(`https://newsapi.org/v2/top-headlines?country=in&apiKey=${process.env.NEWS_API_KEY}`);
        const newsData = await newsRes.json();
        if (newsData.articles && newsData.articles.length > 0) {
          reply = `📰 Latest news:\n`;
          newsData.articles.slice(0, 3).forEach((article, idx) => {
            reply += `${idx + 1}. ${article.title}\n`;
          });
          return res.status(200).json({ reply });
        } else {
          reply = "⚠️ Koi latest news nahi mili.";
          return res.status(200).json({ reply });
        }
      } catch (err) {
        console.error("News API Error:", err);
        reply = "⚠️ News service se connect nahi ho pa raha.";
        return res.status(200).json({ reply });
      }
    }

    // ================= GPT Fallback =================
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [
          { role: "system", content: "Aap ek helpful AI Assistant hain jiska naam Alfa AI hai." },
          { role: "user", content: message },
        ],
      }),
    });

    const data = await response.json();
    reply = data.choices?.[0].message?.content || "⚠️ Koi reply nahi mila.";

    return res.status(200).json({ reply });

  } catch (error) {
    console.error("❌ Handler Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
