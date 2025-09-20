// main.js

import { startVoiceRecognition } from './voice.js';
import * as Features from './features.js'; // future features like screen share, video call, etc.

// Elements
const chatContainer = document.getElementById('chatContainer');
const chatButton = document.getElementById('chatButton');
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const darkModeToggle = document.getElementById('darkModeToggle');

// Toggle chat visibility
export function toggleChat() {
  const isHidden = chatContainer.style.display === 'none' || chatContainer.style.display === '';
  chatContainer.style.display = isHidden ? 'flex' : 'none';
  chatButton.style.display = isHidden ? 'none' : 'block';
  if (isHidden) userInput.focus();
}

// Dark mode toggle
darkModeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
});

// Append message (user or bot)
export function appendMessage(text, isUser = false) {
  const div = document.createElement('div');
  div.className = 'flex items-start ' + (isUser ? 'justify-end' : 'justify-start');

  const avatar = document.createElement('span');
  avatar.className = 'avatar';
  avatar.textContent = isUser ? '🧑' : '🤖';

  const msgDiv = document.createElement('div');
  msgDiv.className =
    'message ' + (isUser ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black dark:bg-gray-700 dark:text-white');

  // Code block formatting
  const codeRegex = /```([\s\S]*?)```/g;
  text = text.replace(codeRegex, (match, p1) => `<div class="codeBlock">${p1}</div>`);

  // Links formatting
  const linkRegex = /https?:\/\/[^\s]+/g;
  text = text.replace(linkRegex, match => `<a href="${match}" target="_blank">${match}</a>`);

  msgDiv.innerHTML = text;

  // Timestamp
  const timeSpan = document.createElement('span');
  timeSpan.className = 'timestamp';
  const now = new Date();
  timeSpan.textContent = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
  msgDiv.appendChild(timeSpan);

  if (isUser) {
    div.appendChild(msgDiv);
    div.appendChild(avatar);
  } else {
    div.appendChild(avatar);
    div.appendChild(msgDiv);
  }

  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  // Live voice for bot messages
  if (!isUser) Features.progressiveVoice(msgDiv, text);
}

// Typing placeholder
function appendTyping() {
  const div = document.createElement('div');
  div.className = 'flex items-start mr-auto';

  const avatar = document.createElement('span');
  avatar.className = 'avatar mr-2';
  avatar.textContent = '🤖';

  const msgDiv = document.createElement('div');
  msgDiv.className = 'message bg-gray-200 text-black dark:bg-gray-700 dark:text-white';

  const dots = document.createElement('span');
  dots.className = 'typingDots';
  dots.innerHTML = '<span>.</span><span>.</span><span>.</span>';

  msgDiv.appendChild(dots);
  div.appendChild(avatar);
  div.appendChild(msgDiv);

  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  return { div, msgDiv, dots };
}

// Detect language (simple example)
function detectLanguage(msg) {
  const hindiPattern = /[\u0900-\u097F]/;
  return hindiPattern.test(msg) ? 'hi' : 'en';
}

// Send message to API
export async function sendMessage() {
  const msg = userInput.value.trim();
  if (!msg) return;
  appendMessage(msg, true);
  userInput.value = '';

  const typingObj = appendTyping();

  try {
    const res = await fetch('/api/alfa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg, lang: detectLanguage(msg) }),
    });
    const data = await res.json();
    typingObj.div.remove();

    if (data.reply) appendMessage(data.reply, false);
    else appendMessage('⚠️ Something went wrong', false);
  } catch (err) {
    typingObj.div.remove();
    appendMessage('⚠️ Network error', false);
  }
}

// Enter key listener
userInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') sendMessage();
});

// Voice input button
export function startVoiceBtn() {
  startVoiceRecognition(userInput, sendMessage); // call function from voice.js
}
