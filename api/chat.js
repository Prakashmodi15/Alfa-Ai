try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'deepseek/deepseek-chat-v3.1:free',
            messages: [{ role: 'user', content: message }]
        })
    });

    console.log("API Status:", response.status);
    const data = await response.json();
    console.log("API Response:", data);

    const aiResponse = data?.choices?.[0]?.message?.content || "⚠️ AI se response nahi aaya";
    return res.status(200).json({ response: aiResponse });

} catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ response: "⚠️ Error: Server se connect nahi ho pa raha" });
}
