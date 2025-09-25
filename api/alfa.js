import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

let itemsCache = null;

// Function to load CSV once
const loadCSV = () => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(path.join(process.cwd(), 'List of Items.csv'))
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Only POST allowed" });
  const { prompt } = req.body;
  if (!prompt || prompt.trim() === "") return res.status(400).json({ error: "Message is required" });

  // Load CSV into memory once
  if (!itemsCache) itemsCache = await loadCSV();

  // Check if prompt matches any item
  const lowerPrompt = prompt.toLowerCase();
  const item = itemsCache.find(row => row.Name?.toLowerCase() === lowerPrompt);
  if (item) {
    return res.status(200).json({ reply: `Item: ${item.Name}, Price: ₹${item['Sale Price-B']}` });
  }

  // Else fallback to OpenRouter AI
  try {
    const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat",
        messages: [
          { role: "system", content: "तुम Alfa AI हो, जवाब छोटा और simple होना चाहिए।" },
          { role: "user", content: prompt }
        ],
        max_tokens: 150,
        temperature: 0.7
      }),
    });

    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: data.error?.message || "OpenRouter API error" });

    const reply = data.choices?.[0]?.message?.content || "माफ़ करें, इस समय मैं जवाब नहीं दे पा रहा हूं।";
    res.status(200).json({ reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
