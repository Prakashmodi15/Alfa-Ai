async function sendMessageToAPI(message) {
    try {
        const response = await fetch("/api/chat", {   // अब Vercel function hit होगा
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message })
        });

        const data = await response.json();
        return data.response;
    } catch (error) {
        return "⚠️ Error: Server se connect nahi ho pa raha.";
    }
}
