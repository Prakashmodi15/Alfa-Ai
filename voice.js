here// voice.js

// Language detect
function detectLanguage(text){ 
  const hindi=/[\u0900-\u097F]/;
  return hindi.test(text)?'hi-IN':'en-US';
}

// Progressive typing + voice
async function progressiveVoice(container, text){
  container.innerHTML='';
  let i=0;

  // Clean text for TTS
  let voiceText = text
    .replace(/```[\s\S]*?```/g,'')       
    .replace(/!\[.*?\]\(.*?\)/g,'')      
    .replace(/https?:\/\/[^\s]+/g,'')    
    .replace(/[\u{1F600}-\u{1F64F}]/gu,'') 
    .replace(/[\u{1F300}-\u{1F5FF}]/gu,'') 
    .replace(/[\u{1F680}-\u{1F6FF}]/gu,'') 
    .replace(/[\u{2600}-\u{26FF}]/gu,'')   
    .replace(/[\u{2700}-\u{27BF}]/gu,'')   
    .replace(/[^a-zA-Z0-9\u0900-\u097F\s.,:;!?()\-\n]/g,'')
    .trim();

  if(!voiceText) return;

  const utter = new SpeechSynthesisUtterance(voiceText);
  utter.lang = detectLanguage(text); 
  speechSynthesis.speak(utter);

  // Typing animation (original text show)
  while(i<text.length){
    container.innerHTML += text[i];
    container.scrollTop=container.scrollHeight;
    await new Promise(r=>setTimeout(r,25));
    i++;
  }
}
