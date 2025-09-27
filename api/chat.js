// /api/chat.js
import admin from "firebase-admin";

// Firebase Admin Initialization using Vercel environment variables
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY,
      }),
      databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
    });
    console.log("✅ Firebase Admin Initialized");
  } catch (err) {
    console.error("❌ Firebase Admin Init Error:", err);
  }
}

const db = admin.firestore();

// Vercel API Route Handler
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST method allowed" });
  }

  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // OpenRouter API call
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

    if (!data || !data.choices) {
      return res.status(500).json({ error: "OpenRouter se valid reply nahi mila." });
    }

    const reply = data.choices[0].message?.content || "⚠️ Koi reply nahi mila.";

    // Save in Firestore
    await db.collection("messages").add({
      userMessage: message,
      aiReply: reply,
      timestamp: Date.now(),
    });

    return res.status(200).json({ reply });
  } catch (error) {
    console.error("❌ Handler Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
