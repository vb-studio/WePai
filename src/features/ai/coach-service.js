/**
 * WePai Coach Service
 * Gemini 2.5 Flash API integration
 */

const getApiKey = () => {
  if (typeof import.meta !== 'undefined' && import.meta?.env) {
    return import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || '';
  }
  return '';
};
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const STORAGE_KEY = 'wepai_chat_history';

export function getChatHistory() {
  try {
    const history = localStorage.getItem(STORAGE_KEY);
    return history ? JSON.parse(history) : [];
  } catch {
    return [];
  }
}

export function saveChatHistory(messages) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch (e) {
    console.error('Error saving chat history:', e);
  }
}

export function clearChatHistory() {
  localStorage.removeItem(STORAGE_KEY);
}

function buildContextPrompt() {
  const state = window.getState ? window.getState() : null;
  
  if (!state) {
    return '';
  }

  const registros = state.registros || [];
  const rutinas = state.rutinas || [];
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const todayDayName = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][today.getDay()];
  
  const todayRegistro = registros.find(r => r.date === todayStr);
  const isRest = todayRegistro && todayRegistro.isRest === true;
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  const yesterdayRegistro = registros.find(r => r.date === yesterdayStr);
  
  const todayRoutine = rutinas.find(r => r.days.includes(todayDayName));

  let context = `Eres WePai Coach, un asistente de fitness personalizado.\n\n`;
  context += `Información del usuario:\n`;
  context += `- Día actual: ${todayDayName} ${today.getDate()}\n`;
  
  if (isRest) {
    context += `- Estado hoy: Día de descanso\n`;
  } else if (todayRoutine) {
    context += `- Rutina asignada hoy: ${todayRoutine.name}\n`;
    context += `- Ejercicios: ${todayRoutine.exercises.map(e => e.name).join(', ')}\n`;
  }
  
  if (yesterdayRegistro && yesterdayRegistro.exercises && yesterdayRegistro.exercises.length > 0) {
    const exercises = yesterdayRegistro.exercises.map(e => e.name).join(', ');
    context += `- Ayer entrenó: ${exercises}\n`;
  }
  
  const last7Days = [];
  for (let i = 1; i <= 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    last7Days.push(d.toISOString().split('T')[0]);
  }
  
  const workoutsThisWeek = registros.filter(r => 
    last7Days.includes(r.date) && r.exercises && r.exercises.length > 0
  );
  
  context += `- Entrenamientos esta semana: ${workoutsThisWeek.length}\n`;
  context += `- Racha actual: ${calculateStreak(registros)} días\n`;
  
  context += `\nResponde siempre en español, de manera amigable y motivadora. Mantén las respuestas cortas y concretas. Si te pide crear una rutina, pregunta qué grupos musculares quiere trabajar.`;

  return context;
}

function calculateStreak(registros) {
  if (!registros || registros.length === 0) return 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let streak = 0;
  let currentDate = new Date(today);
  
  while (true) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const reg = registros.find(r => r.date === dateStr);
    
    if (reg && (reg.exercises && reg.exercises.length > 0 || reg.isRest === true)) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (currentDate.getTime() === today.getTime()) {
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
}

export async function sendMessage(userMessage, conversationHistory = []) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('API key no configurada. Configura GEMINI_API_KEY en variables de entorno o archivo .env');
  }
  
  const context = buildContextPrompt();
  
  const contents = conversationHistory.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }]
  }));
  
  contents.push({
    role: 'user',
    parts: [{ text: userMessage }]
  });

  const requestBody = {
    contents,
    systemInstruction: {
      parts: [{ text: context }]
    },
    generationConfig: {
      temperature: 0.9,
      maxOutputTokens: 500,
    }
  };

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Error en la API');
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('Respuesta vacía de la API');
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
}

export function getSuggestions() {
  return [
    '¿Qué estiramientos hago hoy?',
    'Crear una rutina nueva',
    'Ver mi progreso',
    'Consejos para recuperar',
    'Mi próxima rutina'
  ];
}
