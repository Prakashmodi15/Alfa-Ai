// /api/chat.js
import fetch from "node-fetch";
import { saveMessage } from "./data.js"; // Firebase helper import

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST method allowed" });
  }

  try {
    const { message, user = "guest" } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    let userMsg = message.toLowerCase();
    let reply = "";

    // ===== WEATHER HANDLER =====
    if (userMsg.includes("weather") || userMsg.includes("tapman")) {
      const cityMatch = message.match(/in ([a-zA-Z\s]+)/i) || message.match(/ka weather ([a-zA-Z\s]+)/i);
      let city = cityMatch ? cityMatch[1].trim() : "";

      if (!city) {
        reply = "Kripya city ka naam batayein jaha ka weather aapko chahiye.";
      } else {
        try {
          const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`);
          const geoData = await geoRes.json();

          if (!geoData.results || geoData.results.length === 0) {
            reply = "City ka data nahi mila. Kripya pin code ya state batayein.";
          } else {
            const { latitude, longitude, name, country } = geoData.results[0];
            const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
            const weatherData = await weatherRes.json();

            if (weatherData.current_weather) {
              const temp = weatherData.current_weather.temperature;
              const wind = weatherData.current_weather.windspeed;
              reply = `🌤️ ${name}, ${country} ka current weather: Temperature ${temp}°C, Wind Speed ${wind} km/h.`;
            } else {
              reply = `⚠️ Weather data nahi mil raha ${name} ke liye.`;
            }
          }
        } catch (wErr) {
          console.error("Weather Error:", wErr);
          reply = "⚠️ Weather fetch karne me error aa gaya.";
        }
      }
    }

    // ===== NEWS HANDLER =====
    else if (userMsg.includes("news") || userMsg.includes("kya hua")) {
      try {
        const newsRes = await fetch(`https://newsapi.org/v2/top-headlines?language=en&apiKey=${process.env.NEWS_API_KEY}`);
        const newsData = await newsRes.json();

        if (newsData.articles && newsData.articles.length > 0) {
          const top3 = newsData.articles.slice(0, 3).map(a => `- ${a.title}`).join("\n");
          reply = `📰 Latest news:\n${top3}`;
        } else {
          reply = "⚠️ News fetch karne me error.";
        }
      } catch (nErr) {
        console.error("News Error:", nErr);
        reply = "⚠️ News fetch karne me error.";
      }
    }

    // ===== DEFAULT GPT CHAT =====
    if (!reply) {
      const gptRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
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

      const gptData = await gptRes.json();
      reply = gptData.choices?.[0].message?.content || "⚠️ Koi reply nahi mila.";
    }

    // ===== FIREBASE SAVE =====
    try {
      await saveMessage(user, message, reply);
    } catch (dbErr) {
      console.error("🔥 Firestore Save Error:", dbErr);
    }

    return res.status(200).json({ reply });

  } catch (error) {
    console.error("❌ Handler Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
