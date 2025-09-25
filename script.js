// ====== Elements ======
const btn = document.querySelector("#btn");
const sendBtn = document.querySelector("#send-btn");
const messagesDiv = document.querySelector("#messages");
const promptInput = document.querySelector("#prompt");
const voice = document.querySelector("#voice");

// ====== Speech Synthesis Setup ======
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
        text = text.replace(/[\u{1F600}-\u{1F6FF}]/gu,''); // remove emojis
        const utter = new SpeechSynthesisUtterance(text);
        if(/[^\x00-\x7F]/.test(text)){
            if(hindiVoice) utter.voice = hindiVoice;
            utter.lang = 'hi-IN';
        } else {
            utter.lang = 'en-US';
        }
        utter.pitch = 1; utter.rate = 1; utter.volume = 1;
        synth.speak(utter);
    },200);
}

// ====== Speech Recognition ======
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = 'hi-IN';
recognition.interimResults = false;
recognition.continuous = true;

recognition.onstart = () => { voice.style.display = "block"; btn.style.display = "none"; };
recognition.onend = () => { voice.style.display = "none"; btn.style.display = "flex"; };
recognition.onerror = () => { addMessage("Alfa", "माफ़ कीजिये, मैं सुन नहीं पा रही हूँ।"); };
recognition.onresult = (e) => {
    const transcript = e.results[e.results.length-1][0].transcript.trim();
    addMessage("User", transcript);
    processCommand(transcript.toLowerCase());
};

btn.addEventListener("click",()=>{synth.cancel(); recognition.start();});
sendBtn.addEventListener("click",()=>{
    const message = promptInput.value.trim();
    if(!message) return;
    promptInput.value="";
    addMessage("User", message);
    processCommand(message.toLowerCase());
});
promptInput.addEventListener("keypress",(e)=>{if(e.key==="Enter") sendBtn.click();});

// ====== Chat Bubble ======
function addMessage(sender, text, typing=false){
    const div = document.createElement("div");
    div.className = "bubble "+sender.toLowerCase();
    if(typing) div.classList.add("typing");
    div.innerHTML = text + (typing ? '' : `<span class="timestamp">${new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</span>`);
    messagesDiv.appendChild(div);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    return div;
}

// ====== CSV / Items Setup ======
const fileInput = document.createElement("input");
fileInput.type = "file";
fileInput.accept = ".csv";
document.body.appendChild(fileInput);

let itemsData = [];
let fuse;

// Trigger CSV select
function selectCSVFile(){ fileInput.click(); }

// Handle CSV upload
fileInput.addEventListener("change",(e)=>{
    const file = e.target.files[0];
    if(file) readCSVFile(file);
});

function readCSVFile(file){
    const reader = new FileReader();
    reader.onload = (e)=>{
        const text = e.target.result;
        itemsData = csvToJSON(text);
        fuse = new Fuse(itemsData, { keys:['Name','Alias','Print Name'], threshold:0.3 });
        console.log("Items loaded:", itemsData.length);
        addMessage("Alfa",`CSV loaded with ${itemsData.length} items.`);
        speak("CSV file load हो गयी है। अब आप किसी item का नाम पूछ सकते हैं।");
    };
    reader.readAsText(file);
}

function csvToJSON(csvText){
    const lines = csvText.trim().split("\n");
    const headers = lines[0].split(",");
    const data=[];
    for(let i=1;i<lines.length;i++){
        const obj={};
        const currentLine = lines[i].split(",");
        headers.forEach((header,j)=>{
            obj[header.trim()] = currentLine[j]?.trim()||"";
        });
        data.push(obj);
    }
    return data;
}

function getPrice(itemName){
    if(!fuse) return "CSV file load नहीं हुई है। कृपया पहले CSV जोड़ें।";
    const result = fuse.search(itemName);
    if(result.length>0){
        const item = result[0].item;
        const price = item["Sale Price-B"] || item["Sale Price"] || "N/A";
        return `Item: ${item.Name}, Price: ₹${price}`;
    }
    return "माफ़ कीजिये, यह आइटम हमारे database में नहीं है।";
}

// ====== Process Commands ======
async function processCommand(message){
    // ---- CSV Load ----
    if(message.includes("load csv") || message.includes("सीएसवी जोड़ो")){
        selectCSVFile();
        return;
    }

    // ---- Item Price Check ----
    const priceReply = getPrice(message);
    if(priceReply.includes("Price")){
        addMessage("Alfa", priceReply);
        speak(priceReply);
        return;
    }

    // ---- Local Commands ----
    if(message.includes("hello") || message.includes("हेलो")){ speak("नमस्ते सर, मैं आपकी क्या मदद कर सकती हूँ?"); return; }
    if(message.includes("who are you") || message.includes("कौन हो तुम")){ speak("मैं Alfa AI हूँ, जिसे Prakash Modi ने बनाया है।"); return; }
    if(message.includes("open youtube") || message.includes("यूट्यूब खोलो")){ speak("यूट्यूब खोल रही हूँ"); window.open("https://youtube.com/","_blank"); return; }
    if(message.includes("open google") || message.includes("गूगल खोलो")){ speak("गूगल खोल रही हूँ"); window.open("https://google.com/","_blank"); return; }
    if(message.includes("time") || message.includes("समय")){ const time=new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}); speak(`अभी ${time} हो रहे हैं।`); return; }
    if(message.includes("date") || message.includes("तारीख")){ const date=new Date().toLocaleDateString("hi-IN",{day:"numeric",month:"long"}); speak(`आज ${date} है।`); return; }

    // ---- API Fallback ----
    const typingDiv = addMessage("Alfa", `<span class="dot-typing"><span></span><span></span><span></span></span>`, true);
    try{
        const res = await fetch("/api/alfa",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt:message})});
        const data = await res.json();
        messagesDiv.removeChild(typingDiv);
        const reply = data.reply || "माफ़ करें, जवाब नहीं मिला।";
        addMessage("Alfa", reply);
        speak(reply);
    } catch(err){
        messagesDiv.removeChild(typingDiv);
        speak("नेटवर्क एरर, कृपया बाद में प्रयास करें।");
    }
}
