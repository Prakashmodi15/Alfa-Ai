const btn = document.querySelector("#btn");   // 🎤 Voice Button
const sendBtn = document.querySelector("#sendBtn"); // 📩 Send Button
const content = document.querySelector("#content");
const voice = document.querySelector("#voice");
const messagesDiv = document.querySelector("#messages");
const promptInput = document.querySelector("#prompt");

const synth = window.speechSynthesis;
let hindiVoice = null;

function loadVoices() {
    const voices = synth.getVoices();
    hindiVoice = voices.find(v => v.lang === 'hi-IN');
}
loadVoices();
if (synth.onvoiceschanged !== undefined) synth.onvoiceschanged = loadVoices;

function speak(text) {
    if (synth.speaking) synth.cancel();
    setTimeout(() => {
        text = text.replace(/[\u{1F600}-\u{1F6FF}]/gu, '').replace(/[^\w\s.,?!]/g,'');
        const utter = new SpeechSynthesisUtterance(text);
        if(hindiVoice) utter.voice = hindiVoice;
        utter.lang = 'hi-IN';
        utter.pitch = 1;
        utter.rate = 1;
        utter.volume = 1;
        synth.speak(utter);
    }, 200);
}

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = 'hi-IN';
recognition.interimResults = false;
recognition.continuous = true;

recognition.onstart = () => { voice.style.display = "block"; btn.style.display = "none"; };
recognition.onend = () => { voice.style.display = "none"; btn.style.display = "flex"; };
recognition.onerror = (e) => { content.innerText="माफ़ कीजिये, मैं सुन नहीं पा रही हूँ।"; };
recognition.onresult = (e) => {
    const transcript = e.results[e.results.length - 1][0].transcript.trim();
    addMessage("User", transcript);
    processCommand(transcript.toLowerCase());
};

btn.addEventListener("click", () => { synth.cancel(); recognition.start(); });

// 🎯 Send button click event
sendBtn.addEventListener("click", () => {
    if(promptInput.value.trim() !== "") {
        const message = promptInput.value.trim();
        promptInput.value = "";
        addMessage("User", message);
        processCommand(message.toLowerCase());
    }
});

// 🎯 Enter दबाने पर भी भेजे
promptInput.addEventListener("keypress", (e) => {
    if(e.key === "Enter" && promptInput.value.trim() !== "") {
        const message = promptInput.value.trim();
        promptInput.value = "";
        addMessage("User", message);
        processCommand(message.toLowerCase());
    }
});

function addMessage(sender, text, typing=false) {
    const div = document.createElement("div");
    div.className = "bubble " + sender.toLowerCase();
    if(typing) div.classList.add("typing");
    div.innerHTML = text + (typing ? '' : `<span class="timestamp">${new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>`);
    messagesDiv.appendChild(div);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    return div;
}

async function processCommand(message) {
    if(message.includes("hello") || message.includes("हेलो")) { speak("नमस्ते सर, मैं आपकी क्या मदद कर सकती हूँ?"); return; }
    if(message.includes("who are you") || message.includes("कौन हो तुम")) { speak("मैं Alfa AI हूँ, जिसे Prakash Modi ने बनाया है।"); return; }
    if(message.includes("open youtube") || message.includes("यूट्यूब खोलो")) { speak("यूट्यूब खोल रही हूँ"); window.open("https://youtube.com/","_blank"); return; }
    if(message.includes("open google") || message.includes("गूगल खोलो")) { speak("गूगल खोल रही हूँ"); window.open("https://google.com/","_blank"); return; }
    if(message.includes("time") || message.includes("समय")) { const time = new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}); speak(`अभी ${time} हो रहे हैं।`); return; }
    if(message.includes("date") || message.includes("तारीख")) { const date = new Date().toLocaleDateString("hi-IN", {day:"numeric",month:"long"}); speak(`आज ${date} है।`); return; }

    const typingDiv = addMessage("Alfa", `<span class="dot-typing"><span></span><span></span><span></span></span>`, true);
    try {
        const res = await fetch("/api/alfa", {
            method: "POST",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify({ prompt: message })
        });
        const data = await res.json();
        messagesDiv.removeChild(typingDiv);
        const reply = data.reply || "माफ़ करें, जवाब नहीं मिला।";
        addMessage("Alfa", reply);
        speak(reply);
    } catch(err) {
        messagesDiv.removeChild(typingDiv);
        speak("नेटवर्क एरर, कृपया बाद में प्रयास करें।");
    }
}
