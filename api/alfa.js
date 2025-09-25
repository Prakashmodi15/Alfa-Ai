// === HTML Elements ===
const btn = document.querySelector("#btn");
const content = document.querySelector("#content");
const voice = document.querySelector("#voice");
const messagesDiv = document.createElement("div");

// Append messages container dynamically
messagesDiv.id = "messages";
document.body.insertBefore(messagesDiv, btn);

// === Speech Synthesis (बोलने वाला हिस्सा) ===
const synth = window.speechSynthesis;
let hindiVoice = null;

function loadVoices() {
    const voices = synth.getVoices();
    hindiVoice = voices.find(v => v.lang === 'hi-IN');
}
loadVoices();
if (synth.onvoiceschanged !== undefined) {
    synth.onvoiceschanged = loadVoices;
}

function speak(text) {
    if (synth.speaking) synth.cancel();
    setTimeout(() => {
        const utter = new SpeechSynthesisUtterance(text);
        utter.voice = hindiVoice || null;
        utter.lang = 'hi-IN';
        utter.pitch = 1;
        utter.rate = 1;
        utter.volume = 1;
        synth.speak(utter);
    }, 200);
}

// === Speech Recognition (सुनने वाला हिस्सा) ===
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = 'hi-IN';
recognition.interimResults = false;
recognition.continuous = false;

recognition.onstart = () => { voice.style.display="block"; btn.style.display="none"; };
recognition.onend = () => { voice.style.display="none"; btn.style.display="flex"; };
recognition.onerror = (e) => { console.error(e); content.innerText="माफ़ कीजिये, मैं सुन नहीं पा रही हूँ।"; };
recognition.onresult = (e) => {
    const transcript = e.results[0][0].transcript.trim();
    content.innerText = `आपने कहा: "${transcript}"`;
    addMessage("User", transcript);
    processCommand(transcript.toLowerCase());
};

btn.addEventListener("click", () => { synth.cancel(); recognition.start(); });

// === Add message bubble ===
function addMessage(sender, text, typing=false) {
    const div = document.createElement("div");
    div.className = "bubble " + sender.toLowerCase();
    if(typing) div.classList.add("typing");
    div.innerHTML = text + (typing ? '' : `<span class="timestamp">${new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>`);
    messagesDiv.appendChild(div);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    return div;
}

// === Command Processing & API Call ===
async function processCommand(message) {
    // Built-in commands
    if (message.includes("hello") || message.includes("hey") || message.includes("हेलो")) {
        const text = "नमस्ते सर, मैं आपकी क्या मदद कर सकती हूँ?";
        addMessage("Alfa", text);
        speak(text);
    } else if (message.includes("who are you") || message.includes("कौन हो तुम")) {
        const text = "मैं Alfa AI हूँ, जिसे Prakash Modi ने बनाया है।";
        addMessage("Alfa", text);
        speak(text);
    } else if (message.includes("open youtube") || message.includes("यूट्यूब खोलो")) {
        const text = "यूट्यूब खोल रही हूँ।";
        addMessage("Alfa", text);
        speak(text);
        window.open("https://youtube.com/", "_blank");
    } else if (message.includes("open google") || message.includes("गूगल खोलो")) {
        const text = "गूगल खोल रही हूँ।";
        addMessage("Alfa", text);
        speak(text);
        window.open("https://google.com/", "_blank");
    } else if (message.includes("time") || message.includes("समय")) {
        const time = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
        const text = `अभी ${time} हो रहे हैं।`;
        addMessage("Alfa", text);
        speak(text);
    } else if (message.includes("date") || message.includes("तारीख")) {
        const date = new Date().toLocaleDateString("hi-IN", { day:"numeric", month:"long" });
        const text = `आज ${date} है।`;
        addMessage("Alfa", text);
        speak(text);
    } else {
        // Call API for everything else
        const typingDiv = addMessage("Alfa", `<span class="dot-typing"><span></span><span></span><span></span></span>`, true);
        try {
            const res = await fetch("/api/alfa", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message })
            });
            const data = await res.json();
            messagesDiv.removeChild(typingDiv);

            const reply = data.reply || "माफ़ करें, इस समय मैं जवाब नहीं दे पा रहा हूं।";
            addMessage("Alfa", reply);
            speak(reply);
        } catch (err) {
            messagesDiv.removeChild(typingDiv);
            const text = "⚠️ Network error: " + err.message;
            addMessage("Alfa", text);
            speak(text);
        }
    }
}
