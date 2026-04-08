// ===== CHATBOT.JS =====

const chatbotBtn = document.getElementById('chatbotBtn');
const chatbotWindow = document.getElementById('chatbotWindow');
const chatbotClose = document.getElementById('chatbotClose');
const chatbotInput = document.getElementById('chatbotInput');
const chatbotSend = document.getElementById('chatbotSend');
const chatMessages = document.getElementById('chatMessages');

const responses = {
  greet: ["Hey there! I'm Aria, your prompt engineering assistant. How can I help you craft better prompts today?", "Hi! Ready to supercharge your prompts? Ask me anything!"],
  clarity: ["For better clarity, always specify: WHO should respond, WHAT format you want, and WHY you need it. Example: 'As a marketing expert, write a 3-paragraph email to...'", "Clarity tip: Replace vague words like 'good' or 'nice' with specific adjectives. Instead of 'write a good blog post', try 'write an engaging, 800-word blog post with a compelling hook'."],
  structure: ["Great prompt structure = Context + Task + Format + Constraints. Try: 'You are a [role]. [Task description]. Format as [format]. Keep it under [limit].'", "Structure your prompts like a brief: background, objective, deliverable, and constraints. This dramatically improves AI output quality."],
  creative: ["For creative prompts, use vivid scene-setting: 'Imagine a world where...' or 'You are a master storyteller who...' — this activates more imaginative responses.", "Boost creativity by adding unexpected constraints: 'Write this as if it were a letter from the future' or 'Explain this concept using only metaphors from nature'."],
  coding: ["For coding prompts, always specify: language, version, use case, and expected input/output. Example: 'Write a Python 3.11 function that takes a list of strings and returns...'", "Add context to coding prompts: mention the framework, coding style (functional/OOP), and any constraints like performance requirements."],
  default: ["That's a great question! The key to better prompts is specificity. The more context you give, the better the AI can help you.", "Try using the Prompt Analyzer on the home page — it'll give you a detailed score and an improved version of your prompt!", "One quick tip: always tell the AI what role to play. 'You are an expert in...' dramatically improves response quality."]
};

function getBotResponse(input) {
  const lower = input.toLowerCase();
  if (lower.match(/hi|hello|hey|sup/)) return pick(responses.greet);
  if (lower.match(/clear|vague|specific/)) return pick(responses.clarity);
  if (lower.match(/struct|format|organiz/)) return pick(responses.structure);
  if (lower.match(/creat|imaginat|story|poem/)) return pick(responses.creative);
  if (lower.match(/code|program|function|script/)) return pick(responses.coding);
  return pick(responses.default);
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function addMessage(text, type) {
  const msg = document.createElement('div');
  msg.className = `chat-msg ${type}`;
  msg.innerHTML = `<div class="chat-bubble">${text}</div>`;
  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendMessage() {
  const text = chatbotInput.value.trim();
  if (!text) return;
  addMessage(text, 'user');
  chatbotInput.value = '';
  // Typing indicator
  const typing = document.createElement('div');
  typing.className = 'chat-msg bot';
  typing.id = 'typing';
  typing.innerHTML = '<div class="chat-bubble" style="color:var(--text-muted)">Aria is typing...</div>';
  chatMessages.appendChild(typing);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  setTimeout(() => {
    typing.remove();
    addMessage(getBotResponse(text), 'bot');
  }, 900 + Math.random() * 600);
}

if (chatbotBtn) {
  chatbotBtn.addEventListener('click', () => chatbotWindow.classList.toggle('open'));
}
if (chatbotClose) {
  chatbotClose.addEventListener('click', () => chatbotWindow.classList.remove('open'));
}
if (chatbotSend) {
  chatbotSend.addEventListener('click', sendMessage);
}
if (chatbotInput) {
  chatbotInput.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(); });
}
