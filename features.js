// features.js

// Text sanitize function
export function sanitizeText(text) {
  // सिर्फ readable text रखो, emoji और special chars हटा दो
  return text.replace(/[^a-zA-Z0-9 .,!?;:()\n]/g, '');
}

// Progressive live voice
export async function progressiveVoice(msgDiv, text) {
  if (!('speechSynthesis' in window)) return;

  // अगर कोई purani voice चल रही है तो cancel करो
  window.speechSynthesis.cancel();

  // Clean text
  text = sanitizeText(text);

  const words = text.split(' ');

  for (const word of words) {
    const utterance = new SpeechSynthesisUtterance(word + ' ');
    utterance.lang = /[\u0900-\u097F]/.test(word) ? 'hi-IN' : 'en-US';
    utterance.rate = 1; // speed adjust कर सकते हो
    utterance.pitch = 1;

    window.speechSynthesis.speak(utterance);

    await new Promise(resolve => {
      utterance.onend = resolve;
    });
  }
}
