// ================= API CALL FUNCTION =================
async function sendMessageToAPI(message) {
    try {
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message })
        });
        const data = await response.json();
        return data.reply;
    } catch (error) {
        console.error("Error:", error);
        return "⚠️ Server se connect nahi ho pa raha.";
    }
}

// ================= DOM ELEMENTS =================
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const messagesContainer = document.getElementById('messagesContainer');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const voiceBtn = document.getElementById('voiceBtn');
const newChatBtn = document.getElementById('newChatBtn');
const voiceLogo = document.getElementById('voiceLogo');

async function loadChatHistory() {
  const historyContainer = document.getElementById("chatHistory");

  try {
    const res = await fetch("/api/getMessages");
    const data = await res.json();

    if (data.messages && data.messages.length > 0) {
      // Clear existing messages
      historyContainer.innerHTML = `<div class="history-title">Chat History</div>`;

      data.messages.forEach(msg => {
        const chatItem = document.createElement("div");
        chatItem.classList.add("chat-item");
        chatItem.textContent = `${msg.user}: ${msg.message}`;
        
        // Click to load in main chat
        chatItem.addEventListener("click", () => {
          loadMessageToChat(msg);
        });

        historyContainer.appendChild(chatItem);
      });
    }
  } catch (err) {
    console.error("Error loading chat history:", err);
  }
}

// Load a single message into chat container
function loadMessageToChat(msg) {
  const messagesContainer = document.querySelector(".messages-container");

  // Clear current chat
  messagesContainer.innerHTML = "";

  // User message
  const userDiv = document.createElement("div");
  userDiv.classList.add("message", "user-message");
  userDiv.innerHTML = `
    <div class="message-content">${msg.message}</div>
    <div class="message-avatar">U</div>
  `;
  messagesContainer.appendChild(userDiv);

  // AI reply
  const aiDiv = document.createElement("div");
  aiDiv.classList.add("message", "ai-message");
  aiDiv.innerHTML = `
    <div class="message-avatar">A</div>
    <div class="message-content">${msg.reply}</div>
  `;
  messagesContainer.appendChild(aiDiv);

  // Scroll to bottom
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Call on page load
window.addEventListener("DOMContentLoaded", loadChatHistory);
});

// New Chat button
const newChatBtn = document.getElementById('newChatBtn');
const chatHistory = document.getElementById('chatHistory');

newChatBtn.addEventListener('click', () => {
    const newChatDiv = document.createElement('div');
    newChatDiv.classList.add('chat-item');
    newChatDiv.textContent = `New Chat ${chatHistory.children.length}`;
    chatHistory.appendChild(newChatDiv);

    // Optionally, scroll to bottom
    chatHistory.scrollTop = chatHistory.scrollHeight;
});

// Optional: Click on chat history item to open chat
chatHistory.addEventListener('click', (e) => {
    if(e.target.classList.contains('chat-item')){
        alert(`Opening ${e.target.textContent}`);
        // Yaha aap main chat area ko update kar sakte ho
    }
});
});
// ================= ADD MESSAGE =================
function addMessage(content, sender) {
    const msg = document.createElement('div');
    msg.classList.add('message', `${sender}-message`);

    const avatar = document.createElement('div');
    avatar.classList.add('message-avatar');
    avatar.textContent = sender === 'ai' ? 'α' : 'U';
    msg.appendChild(avatar);

    const messageContent = document.createElement('div');
    messageContent.classList.add('message-content');
    messageContent.textContent = content;
    msg.appendChild(messageContent);

    messagesContainer.appendChild(msg);
    scrollToBottom();
}

// ================= TEXT TO SPEECH =================
function speakText(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'hi-IN';
        speechSynthesis.speak(utterance);
        voiceLogo.style.display = 'block';
        utterance.onend = () => voiceLogo.style.display = 'none';
    }
}

// ================= WEATHER FUNCTION =================
async function getWeather(city) {
    const apiKey = "360de8cc933ebf77fa9c3a82db4fd652"; // OpenWeatherMap key
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
        const data = await response.json();
        if (data.cod === 200) {
            const temp = data.main.temp;
            const desc = data.weather[0].description;
            addMessage(`🌤 ${city} ka current temperature: ${temp}°C, Weather: ${desc}`, 'ai');
            speakText(`${city} ka current temperature ${temp} degree Celsius hai aur mausam ${desc} hai`);
        } else {
            addMessage(`⚠️ ${city} ka weather nahi mila.`, 'ai');
        }
    } catch (error) {
        addMessage("⚠️ Weather fetch karne me error.", 'ai');
    }
}

// ================= NEWS FUNCTION =================
async function getNews(city) {
    const apiKey = "3d53de59cab643418e1568d72fcbce4e"; // NewsAPI key
    try {
        const response = await fetch(`https://newsapi.org/v2/top-headlines?country=in&q=${city}&apiKey=${apiKey}`);
        const data = await response.json();
        if (data.articles.length > 0) {
            addMessage(`📰 ${city} ki latest news: ${data.articles[0].title}`, 'ai');
            speakText(`${city} ki latest news: ${data.articles[0].title}`);
        } else {
            addMessage(`⚠️ ${city} ki latest news nahi mili.`, 'ai');
        }
    } catch (error) {
        addMessage("⚠️ News fetch karne me error.", 'ai');
    }
}

// ================= SEND MESSAGE =================
async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    addMessage(message, 'user');
    messageInput.value = '';
    scrollToBottom();

    // Show typing indicator
    const typingDiv = document.createElement('div');
    typingDiv.textContent = 'Alfa AI typing...';
    typingDiv.id = 'typingIndicator';
    messagesContainer.appendChild(typingDiv);
    scrollToBottom();

    // Check for weather or news keywords
    const lowerMsg = message.toLowerCase();
    if (lowerMsg.includes("weather")) {
        const city = message.split("in")[1]?.trim() || "Raniwara";
        document.getElementById('typingIndicator').remove();
        getWeather(city);
    } else if (lowerMsg.includes("news")) {
        const city = message.split("in")[1]?.trim() || "India";
        document.getElementById('typingIndicator').remove();
        getNews(city);
    } else {
        const response = await sendMessageToAPI(message);
        document.getElementById('typingIndicator').remove();
        addMessage(response || "Dhanyavad! Aap kya janna chahte hain?", 'ai');
        speakText(response);
    }
}

// ================= SEND BUTTON =================
sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// ================= VOICE RECOGNITION =================
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition, isListening = false;

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = 'hi-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
        isListening = true;
        voiceBtn.style.background = "#4CAF50";
    };

    recognition.onresult = e => {
        const transcript = e.results[0][0].transcript;
        messageInput.value = transcript;
        sendMessage();
    };

    recognition.onend = () => {
        isListening = false;
        voiceBtn.style.background = "";
    };
}

voiceBtn.addEventListener('click', () => {
    if (!SpeechRecognition) return alert("Voice not supported");
    if (isListening) recognition.stop();
    else recognition.start();
});

// ================= NEW CHAT =================
newChatBtn.addEventListener('click', () => {
    messagesContainer.innerHTML = '';
    addMessage("Namaste! Main Alfa AI hoon, Prakash Modi ka personal assistant.", 'ai');
});

// ================= INITIALIZE =================
window.addEventListener('DOMContentLoaded', () => {
    addMessage("Namaste! Main Alfa AI hoon, Prakash Modi ka personal assistant.", 'ai');
});
