/**
 * Profile Page
 * Personal data and records
 */

import { 
  getState, 
  saveState, 
  saveProfile,
  addGoal,
  deleteGoal
} from '../../features/store.js';
import { calculateMaxStreak } from '../../features/calculations/streak.js';
import { calculateTotalVolume } from '../../features/calculations/volume.js';

let container = null;

export async function render(cont) {
  container = cont;
  const state = getState();
  renderProfile();
}

function renderProfile() {
  const state = getState();
  
  const totalSessions = state.registros?.length || 0;
  const totalVolume = (state.registros || []).reduce((sum, r) => {
    return sum + calculateTotalVolume(r.exercises);
  }, 0);
  
  const dates = [...new Set((state.registros || []).map(r => r.date))];
  const maxStreak = calculateMaxStreak(dates);
  const totalExercises = Object.keys(state.records || {}).length;

  container.innerHTML = `
    <div id="screen-perfil" class="screen active">
      <header class="lg:hidden bg-[#fcf9f8]/80 dark:bg-[#1c1b1b]/80 backdrop-blur-xl fixed top-0 w-full z-50">
        <div class="flex justify-between items-center px-6 py-4 w-full max-w-7xl mx-auto">
          <div class="flex items-center gap-3">
            <span class="text-2xl font-black tracking-tighter text-[#1c1b1b] dark:text-white font-['Manrope']">WePai</span>
          </div>
          <div class="flex items-center gap-4">
            <button data-link href="/" class="text-[#FF6B00] hover:opacity-80 transition-opacity">
              <span class="material-symbols-outlined text-2xl">arrow_back</span>
            </button>
          </div>
        </div>
      </header>

      <main class="px-6 pt-20 pb-32 space-y-12 max-w-2xl mx-auto">
        <section class="space-y-2">
          <p class="font-label text-[10px] uppercase tracking-[0.2em] text-primary font-semibold">Atleta Elite</p>
          <h2 class="font-headline text-4xl font-extrabold tracking-tight">Mi Perfil</h2>
        </section>

        <!-- Body Weight -->
        <section class="space-y-6">
          <div class="flex items-baseline justify-between border-b border-outline-variant/15 pb-4">
            <span class="font-label text-xs uppercase tracking-wider text-on-surface-variant">Peso Corporal</span>
            <span class="font-label text-[10px] text-primary-container font-bold" id="peso-update-badge">
              ${state.perfil.peso > 0 ? 'PESO CONFIGURADO' : ''}
            </span>
          </div>
          <div class="relative group">
            <div class="flex items-baseline gap-4">
              <input id="input-peso-perfil" class="bg-surface-container-low border-none rounded-xl font-headline text-6xl font-extrabold w-48 p-4 focus:ring-2 focus:ring-primary-container transition-all text-on-surface" step="0.1" type="number" value="${state.perfil.peso || 0}"/>
              <span class="font-headline text-2xl font-light text-on-surface-variant">kg</span>
            </div>
          </div>
        </section>

        <!-- Profile Form -->
        <section class="space-y-6">
          <div class="flex items-center justify-between border-b border-outline-variant/15 pb-4">
            <span class="font-label text-xs uppercase tracking-wider text-on-surface-variant">Datos Personales</span>
          </div>
          <form onsubmit="window.saveProfile(event)" class="space-y-4">
            <div>
              <label class="block text-sm text-on-surface-variant mb-2">Nombre</label>
              <input type="text" id="input-nombre" class="input-field w-full px-4 py-3 text-on-surface" placeholder="Tu nombre" value="${state.perfil.nombre || ''}">
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm text-on-surface-variant mb-2">Altura (cm)</label>
                <input type="number" id="input-altura" class="input-field w-full px-4 py-3 text-on-surface" placeholder="175" value="${state.perfil.altura || ''}">
              </div>
              <div>
                <label class="block text-sm text-on-surface-variant mb-2">Objetivo</label>
                <select id="input-objetivo" class="input-field w-full px-4 py-3 text-on-surface">
                  <option value="">Selecciona</option>
                  <option value="Fuerza" ${state.perfil.objetivo === 'Fuerza' ? 'selected' : ''}>Fuerza</option>
                  <option value="Hipertrofia" ${state.perfil.objetivo === 'Hipertrofia' ? 'selected' : ''}>Hipertrofia</option>
                  <option value="Definición" ${state.perfil.objetivo === 'Definición' ? 'selected' : ''}>Definición</option>
                  <option value="Resistencia" ${state.perfil.objetivo === 'Resistencia' ? 'selected' : ''}>Resistencia</option>
                </select>
              </div>
            </div>
            <button type="submit" class="w-full py-3 rounded-xl signature-gradient text-white font-semibold">
              Guardar cambios
            </button>
          </form>
        </section>

        <!-- Goals -->
        <section class="space-y-6">
          <div class="flex items-center justify-between border-b border-outline-variant/15 pb-4">
            <span class="font-label text-xs uppercase tracking-wider text-on-surface-variant">Metas</span>
            <button onclick="window.openGoalModal()" class="text-primary">
              <span class="material-symbols-outlined">add_circle</span>
            </button>
          </div>
          <div id="goals-list">
            ${renderGoals()}
          </div>
        </section>

        <!-- Records -->
        <section class="space-y-8">
          <div class="flex items-center justify-between">
            <h3 class="font-headline text-xl font-bold tracking-tight">Récords Históricos</h3>
          </div>
          <div id="records-container" class="space-y-4">
            ${renderRecords()}
          </div>
        </section>

        <!-- Stats -->
        <section class="space-y-6">
          <div class="flex items-center justify-between border-b border-outline-variant/15 pb-4">
            <span class="font-label text-xs uppercase tracking-wider text-on-surface-variant">Estadísticas Generales</span>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-surface-container-low rounded-xl p-4">
              <p class="text-sm text-on-surface-variant">Total de sesiones</p>
              <p class="font-headline font-bold text-2xl">${totalSessions}</p>
            </div>
            <div class="bg-surface-container-low rounded-xl p-4">
              <p class="text-sm text-on-surface-variant">Volumen histórico</p>
              <p class="font-headline font-bold text-2xl">${totalVolume.toLocaleString()} <span class="text-base font-medium">kg</span></p>
            </div>
            <div class="bg-surface-container-low rounded-xl p-4">
              <p class="text-sm text-on-surface-variant">Racha máxima</p>
              <p class="font-headline font-bold text-2xl">${maxStreak}</p>
              <p class="text-xs text-on-surface-variant">días</p>
            </div>
            <div class="bg-surface-container-low rounded-xl p-4">
              <p class="text-sm text-on-surface-variant">Ejercicios</p>
              <p class="font-headline font-bold text-2xl">${totalExercises}</p>
            </div>
          </div>
        </section>

        <!-- Install App Button -->
        <section class="py-6">
          <button id="install-app-btn" onclick="window.installApp()" class="w-full py-4 rounded-xl bg-surface-container-low border-2 border-primary-container hover:border-primary transition-colors flex items-center justify-center gap-3 hidden">
            <span class="material-symbols-outlined text-2xl text-primary">download_for_offline</span>
            <span class="font-medium text-on-surface">Instalar App</span>
          </button>
        </section>
      </main>
    </div>
  `;

  window.saveProfile = (e) => {
    e.preventDefault();
    const perfil = {
      nombre: document.getElementById('input-nombre').value.trim(),
      peso: parseFloat(document.getElementById('input-peso-perfil').value) || 0,
      altura: parseInt(document.getElementById('input-altura').value) || 0,
      objetivo: document.getElementById('input-objetivo').value
    };
    saveProfile(perfil);
    alert('Perfil guardado correctamente');
    renderProfile();
  };

  window.toggleDarkMode = () => {
    toggleDarkMode();
    applyDarkMode();
    state = getState();
    renderProfile();
  };

  window.toggleSetting = (setting) => {
    toggleSetting(setting);
    state = getState();
    renderProfile();
  };

  window.updateSetting = (setting, value) => {
    updateSetting(setting, value);
    if (setting === 'unidades') {
      convertUnits();
    }
    state = getState();
    renderProfile();
  };

  window.updateTemporizadorDisplay = (value) => {
    document.getElementById('temporizador-display').textContent = formatTimerDisplay(value);
    updateSetting('temporizadorDescanso', parseInt(value));
  };

  window.openGoalModal = () => {
    const exercise = prompt('Nombre del ejercicio:');
    if (!exercise) return;
    const weight = parseFloat(prompt('Peso objetivo (kg):'));
    if (!weight) return;
    addGoal({ exercise, weight });
    renderProfile();
  };

  window.deleteGoal = (idx) => {
    deleteGoal(idx);
    renderProfile();
  };
}

function renderGoals() {
  const state = getState();
  if (!state.goals || state.goals.length === 0) {
    return '<p class="text-on-surface-variant text-sm">Sin metas configuradas</p>';
  }
  
  return state.goals.map((goal, idx) => {
    const record = state.records[goal.exercise.toLowerCase()];
    const current = record ? record.weight : 0;
    const percent = Math.min(100, Math.round((current / goal.weight) * 100));
    
    return `
      <div class="flex items-center justify-between bg-surface-container-low rounded-xl p-4">
        <div class="flex-1">
          <p class="font-medium">${goal.exercise}</p>
          <div class="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden mt-2">
            <div class="h-full signature-gradient rounded-full" style="width: ${percent}%"></div>
          </div>
        </div>
        <div class="text-right ml-4">
          <p class="font-bold">${goal.weight} kg</p>
          <p class="text-xs text-on-surface-variant">${percent}%</p>
        </div>
        <button onclick="window.deleteGoal(${idx})" class="ml-2 text-red-500">
          <span class="material-symbols-outlined text-lg">delete</span>
        </button>
      </div>
    `;
  }).join('');
}

function renderRecords() {
  const state = getState();
  const entries = Object.entries(state.records || {});
  
  if (entries.length === 0) {
    return '<p class="text-on-surface-variant text-sm text-center py-8">Aún no tienes récords</p>';
  }
  
  return entries
    .sort((a, b) => b[1].weight - a[1].weight)
    .map(([name, data]) => `
      <div class="flex items-center justify-between bg-surface-container-lowest p-4 rounded-xl">
        <span class="font-medium capitalize">${name}</span>
        <span class="font-headline text-2xl font-black">${data.weight} <span class="text-sm font-normal">kg</span></span>
      </div>
    `).join('');
}

function formatTimerDisplay(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default { render };
