// Chat.js - Frontend logic
const messagesContainer = document.getElementById("messagesContainer");
const textInput = document.getElementById("textInput");
const sendBtn = document.getElementById("sendBtn");

// Send button click
sendBtn.addEventListener("click", sendMessage);

// Send message on Enter
textInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Send message function
async function sendMessage() {
    const message = textInput.value.trim();
    if (!message) return;

    // Add user message
    addMessage(message, "user");
    textInput.value = "";

    // Show typing indicator
    showTypingIndicator();

    // Send to backend
    const reply = await sendMessageToAPI(message);

    // Remove typing indicator
    removeTypingIndicator();

    // Add AI message
    addMessage(reply, "ai");
}

// API call to backend
async function sendMessageToAPI(message) {
    try {
        const response = await fetch("/api/chat", {
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

// Add message in chat
function addMessage(content, sender) {
    const div = document.createElement("div");
    div.className = `message ${sender}-message`;
    div.innerHTML = `<div>${content}</div><div class="message-time">${getTime()}</div>`;
    messagesContainer.appendChild(div);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Typing indicator
function showTypingIndicator() {
    const div = document.createElement("div");
    div.id = "typingIndicator";
    div.className = "message ai-message";
    div.innerHTML = `<div><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>`;
    messagesContainer.appendChild(div);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function removeTypingIndicator() {
    const typing = document.getElementById("typingIndicator");
    if (typing) typing.remove();
}

// Current time
function getTime() {
    const d = new Date();
    return d.getHours().toString().padStart(2, "0") + ":" + d.getMinutes().toString().padStart(2, "0");
}
