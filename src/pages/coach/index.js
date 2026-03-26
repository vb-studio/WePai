/**
 * WePai Coach Page
 * AI Chat with Gemini 2.5 Flash
 */

import { getChatHistory, saveChatHistory, sendMessage, getSuggestions, clearChatHistory } from '../../features/ai/coach-service.js';

let container = null;
let messages = [];
let isTyping = false;
let recognition = null;

export async function render(cont) {
  container = cont;
  messages = getChatHistory();
  
  renderChat();
  setupVoiceInput();
  
  setTimeout(() => {
    const contextStr = localStorage.getItem('wepai_coach_context');
    if (contextStr) {
      localStorage.removeItem('wepai_coach_context');
      const context = JSON.parse(contextStr);
      
      if (context.type === 'analyze_routine' && context.routine) {
        const routine = context.routine;
        const exercisesList = routine.exercises.map(ex => `- ${ex.name}: ${ex.sets} series x ${ex.reps} repeticiones`).join('\n');
        const prompt = `Analiza mi rutina "${routine.name}" que tiene los siguientes ejercicios:\n${exercisesList}\n\nDime qué grupos musculares están trabajando, si hay desequilibrios, y sugerencias de mejora.`;
        
        const input = document.getElementById('chat-input');
        if (input) {
          input.value = prompt;
          getAIResponse(prompt);
        }
      }
    }
  }, 500);
}

function renderChat() {
  const today = new Date();
  const formattedDate = today.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric' });
  const suggestions = getSuggestions();
  
  container.innerHTML = `
    <div id="screen-coach" class="screen active">
      <header class="lg:hidden bg-[#fcf9f8]/80 dark:bg-[#1c1b1b]/80 backdrop-blur-xl fixed top-0 w-full z-50">
        <div class="chat-topbar" style="justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <button data-link href="/log" class="chat-back">
              <svg viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            </button>
            <div class="chat-avatar"><span class="material-symbols-outlined text-xl">psychology</span></div>
            <div class="chat-meta">
              <div class="chat-name">WePai Coach</div>
              <div class="chat-status">
                <div class="status-dot"></div>
                <span class="chat-status-text">Activo</span>
              </div>
            </div>
          </div>
          <div style="display: flex; gap: 8px;">
            <button onclick="window.clearChat()" style="background: none; border: none; cursor: pointer;">
              <span class="material-symbols-outlined text-2xl chat-header-btn" style="color: #A8998C;">delete</span>
            </button>
            <button data-link href="/profile" style="background: none; border: none; cursor: pointer;">
              <span class="material-symbols-outlined text-2xl chat-header-btn-profile" style="color: #C45A0A;">person</span>
            </button>
          </div>
        </div>
      </header>

      <main class="chat-main">
        <div class="chat-date">Hoy · ${formattedDate}</div>

        ${messages.length === 0 ? `
          <div class="msg-ai">
            <div class="msg-ai-avatar"><span class="material-symbols-outlined text-xl">psychology</span></div>
            <div class="bubble-ai">
              ¡Hola! Soy WePai Coach, tu asistente de fitness. ¿En qué puedo ayudarte hoy?
            </div>
          </div>
        ` : ''}

        <div id="chat-messages">
          ${messages.map(msg => renderMessage(msg)).join('')}
        </div>

        ${isTyping ? `
          <div class="msg-typing">
            <div class="msg-ai-avatar"><span class="material-symbols-outlined text-xl">psychology</span></div>
            <div class="typing-bubble">
              <div class="typing-dot"></div>
              <div class="typing-dot"></div>
              <div class="typing-dot"></div>
            </div>
          </div>
        ` : ''}

        <div class="suggestions">
          ${suggestions.map(s => `
            <button class="suggestion-chip" onclick="window.sendSuggestion('${s}')">${s}</button>
          `).join('')}
        </div>
      </main>

      <div class="chat-input-bar">
        <div class="chat-input-wrap">
          <input type="text" id="chat-input" class="chat-input" placeholder="Pregúntale al coach…" autocomplete="off">
          <button id="mic-btn" class="chat-mic-btn" onclick="window.toggleVoice()">
            <svg viewBox="0 0 24 24"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"/></svg>
          </button>
        </div>
        <button class="send-btn" onclick="window.sendMessage()">
          <svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    </div>
  `;

  scrollToBottom();
  
  document.getElementById('chat-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      window.sendMessage();
    }
  });

  window.sendSuggestion = async (text) => {
    document.getElementById('chat-input').value = text;
    window.sendMessage();
  };

  window.sendMessage = async () => {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (!message || isTyping) return;
    
    input.value = '';
    addMessage(message, 'user');
    
    await getAIResponse(message);
  };

  window.clearChat = () => {
    if (confirm('¿Quieres reiniciar la conversación?')) {
      clearChatHistory();
      messages = [];
      renderChat();
      window.showToast('Conversación reiniciada');
    }
  };

  window.toggleVoice = () => {
    if (recognition && recognition.recording) {
      recognition.stop();
    } else {
      startVoiceInput();
    }
  };
}

function renderMessage(msg) {
  if (msg.role === 'user') {
    return `
      <div class="msg-user">
        <div class="bubble-user">${msg.content}</div>
      </div>
    `;
  } else {
    const formatted = msg.content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
    return `
      <div class="msg-ai">
        <div class="msg-ai-avatar"><span class="material-symbols-outlined text-xl">psychology</span></div>
        <div class="bubble-ai">${formatted}</div>
      </div>
    `;
  }
}

function addMessage(content, role) {
  messages.push({ role, content });
  saveChatHistory(messages);
  
  const messagesContainer = document.getElementById('chat-messages');
  if (messagesContainer) {
    messagesContainer.innerHTML += renderMessage({ role, content });
    scrollToBottom();
  }
}

async function getAIResponse(userMessage) {
  isTyping = true;
  renderChat();
  
  try {
    const response = await sendMessage(userMessage, messages);
    addMessage(response, 'ai');
  } catch (error) {
    console.error('AI Error:', error);
    addMessage('Lo siento, tuve un problema al procesar tu mensaje. ¿Podrías intentarlo de nuevo?', 'ai');
  }
  
  isTyping = false;
  renderChat();
  scrollToBottom();
}

function scrollToBottom() {
  setTimeout(() => {
    const chatMain = document.querySelector('.chat-main');
    if (chatMain) {
      chatMain.scrollTop = chatMain.scrollHeight;
    }
  }, 100);
}

function setupVoiceInput() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    const micBtn = document.getElementById('mic-btn');
    if (micBtn) {
      micBtn.style.display = 'none';
    }
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  
  recognition.lang = 'es-ES';
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onstart = () => {
    const micBtn = document.getElementById('mic-btn');
    if (micBtn) {
      micBtn.classList.add('recording');
    }
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    document.getElementById('chat-input').value = transcript;
  };

  recognition.onerror = (event) => {
    console.error('Voice recognition error:', event.error);
    const micBtn = document.getElementById('mic-btn');
    if (micBtn) {
      micBtn.classList.remove('recording');
    }
  };

  recognition.onend = () => {
    const micBtn = document.getElementById('mic-btn');
    if (micBtn) {
      micBtn.classList.remove('recording');
    }
  };
}

function startVoiceInput() {
  if (recognition) {
    try {
      recognition.start();
    } catch (e) {
      console.error('Error starting voice recognition:', e);
    }
  }
}

export default { render };
