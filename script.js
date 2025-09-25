// === HTML Elements ===
const btn = document.querySelector("#btn");
const content = document.querySelector("#content");
const voice = document.querySelector("#voice");

// === Speech Synthesis (बोलने वाला हिस्सा) ===
const synth = window.speechSynthesis;
let hindiVoice = null;

function loadVoices() {
    const voices = synth.getVoices();
    hindiVoice = voices.find(v => v.lang === 'hi-IN');
    if (hindiVoice) console.log("SUCCESS: Hindi voice found and loaded.");
    else console.warn("WARNING: Hindi (hi-IN) voice not found. Using default.");
}

loadVoices();
if (synth.onvoiceschanged !== undefined) synth.onvoiceschanged = loadVoices;

function speak(text) {
    if (synth.speaking) synth.cancel();
    setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        if (hindiVoice) utterance.voice = hindiVoice;
        utterance.lang = 'hi-IN';
        utterance.pitch = 1;
        utterance.rate = 1;
        utterance.volume = 1;
        synth.speak(utterance);
    }, 200);
}

// === Speech Recognition (सुनने वाला हिस्सा) ===
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = 'hi-IN';
recognition.interimResults = false;
recognition.continuous = false;

recognition.onstart = () => {
    voice.style.display = "block";
    btn.style.display = "none";
};

recognition.onend = () => {
    voice.style.display = "none";
    btn.style.display = "flex";
};

recognition.onerror = (event) => {
    console.error("SpeechRecognition Error:", event.error);
    content.innerText = "माफ़ कीजिये, मैं सुन नहीं पा रही हूँ। माइक्रोफ़ोन जांचें।";
};

recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.trim();
    content.innerText = `आपने कहा: "${transcript}"`;
    console.log(`Command received: ${transcript}`);
    takeCommand(transcript.toLowerCase());
};

// Mic button click
btn.addEventListener("click", () => {
    synth.cancel();
    recognition.start();
});

// === Command Handling + API Integration ===
async function takeCommand(message) {
    console.log(`Processing command: ${message}`);

    // --- Local commands ---
    if (message.includes("hello") || message.includes("hey") || message.includes("हेलो")) {
        speak("नमस्ते सर, मैं आपकी क्या मदद कर सकती हूँ?");
        return;
    } 
    if (message.includes("who are you") || message.includes("कौन हो तुम")) {
        speak("मैं एक वर्चुअल असिस्टेंट हूँ, जिसे प्रकाश मोदी ने बनाया है।");
        return;
    } 
    if (message.includes("open youtube") || message.includes("यूट्यूब खोलो")) {
        speak("यूट्यूब खोल रही हूँ");
        window.open("https://youtube.com/", "_blank");
        return;
    } 
    if (message.includes("open google") || message.includes("गूगल खोलो")) {
        speak("गूगल खोल रही हूँ");
        window.open("https://google.com/", "_blank");
        return;
    } 
    if (message.includes("time") || message.includes("समय")) {
        const time = new Date().toLocaleString("en-US", { hour: "numeric", minute: "numeric", hour12: true });
        speak(`अभी ${time} हो रहे हैं।`);
        return;
    } 
    if (message.includes("date") || message.includes("तारीख")) {
        const date = new Date().toLocaleString("hi-IN", { day: "numeric", month: "long" });
        speak(`आज ${date} है।`);
        return;
    } 

    // --- API call for all other queries ---
    try {
        const typingDiv = document.createElement("div");
        typingDiv.className = "bubble alfa typing";
        typingDiv.innerText = "टाइप कर रहा है...";
        document.body.appendChild(typingDiv);

        const res = await fetch("/api/alfa", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: message })
        });
        const data = await res.json();
        document.body.removeChild(typingDiv);

        if (data.reply) {
            speak(data.reply);
            alert(data.reply); // या इसे अपने chat bubble में दिखा सकते हैं
        } else {
            speak("माफ़ कीजिये, मुझे जवाब नहीं मिला।");
        }
    } catch (err) {
        console.error("API Error:", err);
        speak("नेटवर्क एरर, कृपया बाद में प्रयास करें।");
    }
}
