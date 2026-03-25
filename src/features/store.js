/**
 * Store - Side Effects Layer
 * Handles localStorage, notifications, audio, vibration
 * All I/O operations go through here
 */

const STORAGE_KEY = 'wepai_state';
const DEFAULT_SETTINGS = {
  unidades: 'metric',
  temporizadorDescanso: 90,
  sonido: true,
  vibracion: true,
  recordatorio: false,
  horaRecordatorio: '09:00',
  pantallaInicio: 'dashboard',
  modoOscuro: false
};

const DEFAULT_STATE = {
  currentScreen: 'dashboard',
  perfil: {
    nombre: '',
    peso: 0,
    altura: 0,
    objetivo: ''
  },
  registros: [],
  rutinas: [],
  records: {},
  goals: [],
  selectedDate: new Date().toISOString().split('T')[0],
  currentDayExercises: [],
  settings: { ...DEFAULT_SETTINGS }
};

let state = { ...DEFAULT_STATE };

/**
 * Load state from localStorage
 * @returns {Object} Current state
 */
export function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      state = { ...DEFAULT_STATE, ...parsed };
      state.selectedDate = new Date().toISOString().split('T')[0];
    }
    
    if (!state.settings) {
      state.settings = { ...DEFAULT_SETTINGS };
    }
  } catch (error) {
    console.error('Error loading state:', error);
    state = { ...DEFAULT_STATE };
  }
  
  applyDarkMode();
  return state;
}

/**
 * Save state to localStorage
 */
export function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving state:', error);
  }
}

/**
 * Get current state
 * @returns {Object}
 */
export function getState() {
  return state;
}

/**
 * Update state partially
 * @param {Object} updates - Partial state updates
 */
export function updateState(updates) {
  state = { ...state, ...updates };
  saveState();
}

/**
 * Get a nested value from state
 * @param {string} path - Dot notation path (e.g., 'perfil.peso')
 * @returns {any}
 */
export function get(path) {
  return path.split('.').reduce((obj, key) => obj?.[key], state);
}

/**
 * Set a nested value in state
 * @param {string} path - Dot notation path
 * @param {any} value - Value to set
 */
export function set(path, value) {
  const keys = path.split('.');
  const lastKey = keys.pop();
  const target = keys.reduce((obj, key) => {
    if (!obj[key]) obj[key] = {};
    return obj[key];
  }, state);
  target[lastKey] = value;
  saveState();
}

/**
 * Reset all data
 */
export function resetData() {
  localStorage.removeItem(STORAGE_KEY);
  state = { ...DEFAULT_STATE };
  saveState();
}

/**
 * Apply dark mode to document
 */
export function applyDarkMode() {
  if (state.settings?.modoOscuro) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

/**
 * Toggle dark mode
 */
export function toggleDarkMode() {
  state.settings.modoOscuro = !state.settings.modoOscuro;
  applyDarkMode();
  saveState();
}

/**
 * Toggle a boolean setting
 */
export function toggleSetting(setting) {
  state.settings[setting] = !state.settings[setting];
  saveState();
}

/**
 * Update a setting value
 */
export function updateSetting(setting, value) {
  state.settings[setting] = value;
  saveState();
}

/**
 * Export data as JSON file
 */
export function exportData() {
  const data = JSON.stringify(state, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'wepai_backup.json';
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Import data from JSON file
 * @param {File} file - JSON file to import
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function importData(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        state = { ...DEFAULT_STATE, ...data };
        saveState();
        resolve({ success: true });
      } catch (err) {
        resolve({ success: false, error: 'Invalid JSON file' });
      }
    };
    reader.onerror = () => {
      resolve({ success: false, error: 'Failed to read file' });
    };
    reader.readAsText(file);
  });
}

/**
 * Play notification sound
 */
export function playBeep() {
  if (!state.settings?.sonido) return;
  
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gainNode.gain.value = 0.3;
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
  } catch (e) {
    console.log('Audio not supported');
  }
}

/**
 * Vibrate device
 * @param {number} [duration=100] - Duration in ms
 */
export function vibrate(duration = 100) {
  if (!state.settings?.vibracion) return;
  
  if (navigator.vibrate) {
    navigator.vibrate(duration);
  }
}

/**
 * Request notification permission
 * @returns {Promise<NotificationPermission>}
 */
export function requestNotificationPermission() {
  if (!('Notification' in window)) {
    return Promise.resolve('denied');
  }
  
  return Notification.requestPermission();
}

/**
 * Schedule notification
 * @param {string} time - Time in HH:mm format
 * @param {string} message - Notification message
 */
export function scheduleNotification(time, message = '¡Hora de entrenar!') {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }
  
  console.log(`Notification scheduled for ${time}: ${message}`);
}

/**
 * Show browser notification
 * @param {string} title - Notification title
 * @param {Object} options - Notification options
 */
export function showNotification(title, options = {}) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }
  
  new Notification(title, {
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    ...options
  });
}

/**
 * Convert units between metric and imperial
 */
export function convertUnits() {
  const isMetric = state.settings.unidades === 'metric';
  const factor = isMetric ? 2.20462 : 0.453592;
  
  if (state.perfil.peso > 0) {
    state.perfil.peso = Math.round((state.perfil.peso / factor) * 10) / 10;
  }
  
  if (state.perfil.altura > 0) {
    state.perfil.altura = isMetric
      ? state.perfil.altura * 30.48
      : Math.round(state.perfil.altura / 30.48);
  }
  
  state.registros.forEach(reg => {
    if (reg.exercises) {
      reg.exercises.forEach(ex => {
        if (ex.weight) {
          ex.weight = Math.round((ex.weight / factor) * 10) / 10;
        }
      });
    }
  });
  
  saveState();
}

// Profile operations
export function saveProfile(profileData) {
  state.perfil = { ...state.perfil, ...profileData };
  saveState();
}

// Registros operations
export function addRegistro(registro) {
  state.registros.push(registro);
  saveState();
}

export function getRegistro(date) {
  return state.registros.find(r => r.date === date);
}

export function updateRegistro(date, exercises) {
  const idx = state.registros.findIndex(r => r.date === date);
  if (idx >= 0) {
    state.registros[idx].exercises = exercises;
  } else {
    state.registros.push({
      date,
      datetime: new Date().toISOString(),
      exercises
    });
  }
  saveState();
}

// Records operations
export function updateRecord(exerciseName, weight) {
  const key = exerciseName.toLowerCase();
  if (!state.records[key] || weight > state.records[key].weight) {
    state.records[key] = {
      weight,
      date: new Date().toISOString()
    };
    saveState();
  }
}

// Rutinas operations
export function addRoutine(routine) {
  state.rutinas.push({
    ...routine,
    id: routine.id || Date.now().toString()
  });
  saveState();
}

export function updateRoutine(id, routineData) {
  const idx = state.rutinas.findIndex(r => r.id === id);
  if (idx >= 0) {
    state.rutinas[idx] = { ...state.rutinas[idx], ...routineData };
    saveState();
  }
}

export function deleteRoutine(id) {
  state.rutinas = state.rutinas.filter(r => r.id !== id);
  saveState();
}

// Goals operations
export function addGoal(goal) {
  state.goals.push(goal);
  saveState();
}

export function deleteGoal(index) {
  state.goals.splice(index, 1);
  saveState();
}

// Current day exercises (not yet saved)
export function setCurrentDayExercises(exercises) {
  state.currentDayExercises = exercises;
  saveState();
}

export function addCurrentDayExercise(exercise) {
  state.currentDayExercises.push(exercise);
  saveState();
}

export function updateCurrentDayExercise(index, updates) {
  state.currentDayExercises[index] = {
    ...state.currentDayExercises[index],
    ...updates
  };
  saveState();
}

export function removeCurrentDayExercise(index) {
  state.currentDayExercises.splice(index, 1);
  saveState();
}

export function clearCurrentDayExercises() {
  state.currentDayExercises = [];
  saveState();
}
