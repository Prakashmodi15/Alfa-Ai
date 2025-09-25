// chat.js
async function sendMessageToAPI(message) {
    try {
        const response = await fetch("/api/chat", {  // यह Vercel API function hit करेगा
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message })
        });

        const data = await response.json();
        return data.response;
    } catch (error) {
        console.error("Error:", error);
        return "⚠️ Error: Server se connect nahi ho pa raha.";
    }
}

// HTML ke input se message bhejne ka code
document.getElementById("send-btn").addEventListener("click", async () => {
    const promptInput = document.getElementById("prompt");
    const message = promptInput.value.trim();
    if (!message) return;

    // user message show
    addMessage("user", message);

    promptInput.value = "";

    // API call
    const response = await sendMessageToAPI(message);
    addMessage("alfa", response);
});

// chat messages display function
function addMessage(sender, text) {
    const messagesContainer = document.getElementById("messages");
    const bubble = document.createElement("div");
    bubble.classList.add("bubble", sender);
    bubble.textContent = text;

    // Timestamp
    const time = document.createElement("span");
    time.classList.add("timestamp");
    const date = new Date();
    time.textContent = date.getHours() + ":" + date.getMinutes();
    bubble.appendChild(time);

    messagesContainer.appendChild(bubble);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}
