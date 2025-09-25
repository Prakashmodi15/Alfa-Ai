const btn = document.querySelector("#btn");
const sendBtn = document.querySelector("#send-btn");
const messagesDiv = document.querySelector("#messages");
const promptInput = document.querySelector("#prompt");
const voice = document.querySelector("#voice");

const synth = window.speechSynthesis;
let hindiVoice = null;

function loadVoices() {
  const voices = synth.getVoices();
  hindiVoice = voices.find(v => v.lang === 'hi-IN');
}
loadVoices();
if (synth.onvoiceschanged !== undefined) synth.onvoiceschanged = loadVoices;

function speak(text){
  if(synth.speaking) synth.cancel();
  setTimeout(()=>{
    text = text.replace(/[\u{1F600}-\u{1F6FF}]/gu,'');
    const utter = new SpeechSynthesisUtterance(text);
    if(/[^\x00-\x7F]/.test(text)){
      if(hindiVoice) utter.voice=hindiVoice;
      utter.lang='hi-IN';
    } else { utter.lang='en-US'; }
    utter.pitch=1; utter.rate=1; utter.volume=1;
    synth.speak(utter);
  },200);
}

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang='hi-IN';
recognition.interimResults=false;
recognition.continuous=true;

recognition.onstart = ()=>{ voice.style.display="block"; btn.style.display="none"; };
recognition.onend = ()=>{ voice.style.display="none"; btn.style.display="flex"; };
recognition.onerror = ()=>{ addMessage("Alfa","माफ़ कीजिये, मैं सुन नहीं पा रही हूँ।"); };
recognition.onresult = (e)=>{
  const transcript = e.results[e.results.length-1][0].transcript.trim();
  addMessage("User",transcript);
  processCommand(transcript.toLowerCase());
};

btn.addEventListener("click",()=>{synth.cancel(); recognition.start();});
sendBtn.addEventListener("click",()=>{
  const message = promptInput.value.trim();
  if(!message) return;
  promptInput.value="";
  addMessage("User",message);
  processCommand(message.toLowerCase());
});
promptInput.addEventListener("keypress",(e)=>{if(e.key==="Enter") sendBtn.click();});

function addMessage(sender,text,typing=false){
  const div=document.createElement("div");
  div.className="bubble "+sender.toLowerCase();
  if(typing) div.classList.add("typing");
  div.innerHTML=text + (typing ? '' : `<span class="timestamp">${new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</span>`);
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop=messagesDiv.scrollHeight;
  return div;
}

async function processCommand(message){
  const typingDiv = addMessage("Alfa",`<span class="dot-typing"><span></span><span></span><span></span></span>`,true);
  try{
    const res = await fetch("/api/alfa",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({prompt:message})
    });
    const data = await res.json();
    messagesDiv.removeChild(typingDiv);
    const reply = data.reply || "माफ़ करें, जवाब नहीं मिला।";
    addMessage("Alfa",reply);
    speak(reply);
  } catch(err){
    messagesDiv.removeChild(typingDiv);
    speak("नेटवर्क एरर, कृपया बाद में प्रयास करें।");
  }
}
