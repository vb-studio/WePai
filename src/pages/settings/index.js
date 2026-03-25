/**
 * Settings Page
 * Modal-style settings page
 */

import { 
  getState, 
  saveState, 
  toggleDarkMode, 
  toggleSetting, 
  updateSetting,
  convertUnits,
  applyDarkMode,
  exportData,
  importData,
  resetData
} from '../../features/store.js';

let container = null;

export async function render(cont) {
  container = cont;
  renderSettings();
}

function renderSettings() {
  const state = getState();
  
  container.innerHTML = `
    <div id="screen-settings" class="screen active">
      <header class="lg:hidden bg-[#fcf9f8]/80 dark:bg-[#1c1b1b]/80 backdrop-blur-xl fixed top-0 w-full z-50">
        <div class="flex justify-between items-center px-6 py-4 w-full max-w-7xl mx-auto">
          <div class="flex items-center gap-3">
            <button data-link href="/" class="text-on-surface-variant">
              <span class="material-symbols-outlined text-2xl">arrow_back</span>
            </button>
            <span class="text-xl font-bold text-on-surface">Configuración</span>
          </div>
        </div>
      </header>

      <main class="max-w-2xl mx-auto px-6 pt-24 pb-32">
        <h1 class="text-4xl font-headline font-extrabold mb-8 text-on-surface">Configuración</h1>

        <!-- Dark Mode -->
        <div class="setting-item flex items-center justify-between py-4 border-b border-outline-variant">
          <div class="flex items-center gap-4">
            <span class="material-symbols-outlined text-2xl text-on-surface-variant">dark_mode</span>
            <div>
              <p class="text-on-surface font-medium">Modo oscuro</p>
              <p class="text-sm text-on-surface-variant">Cambia el tema de la app</p>
            </div>
          </div>
          <button onclick="window.toggleDarkMode()" id="dark-mode-toggle" class="w-14 h-8 rounded-full transition-colors duration-200 relative ${state.settings.modoOscuro ? 'bg-primary-container' : 'bg-surface-container-high'}">
            <div class="w-6 h-6 bg-white rounded-full absolute top-1 transition-transform duration-200 shadow ${state.settings.modoOscuro ? 'translate-x-6' : 'translate-x-1'}"></div>
          </button>
        </div>

        <!-- Units -->
        <div class="setting-item flex items-center justify-between py-4 border-b border-outline-variant">
          <div class="flex items-center gap-4">
            <span class="material-symbols-outlined text-2xl text-on-surface-variant">straighten</span>
            <div>
              <p class="text-on-surface font-medium">Unidades</p>
              <p class="text-sm text-on-surface-variant">Sistema métrico o imperial</p>
            </div>
          </div>
          <select id="setting-unidades" onchange="window.updateSetting('unidades', this.value)" class="bg-surface-container px-3 py-2 rounded-xl text-on-surface text-sm border border-outline-variant min-w-[100px]">
            <option value="metric" ${state.settings.unidades === 'metric' ? 'selected' : ''}>kg/cm</option>
            <option value="imperial" ${state.settings.unidades === 'imperial' ? 'selected' : ''}>lb/ft</option>
          </select>
        </div>

        <!-- Home Screen -->
        <div class="setting-item flex items-center justify-between py-4 border-b border-outline-variant">
          <div class="flex items-center gap-4">
            <span class="material-symbols-outlined text-2xl text-on-surface-variant">home</span>
            <div>
              <p class="text-on-surface font-medium">Pantalla de inicio</p>
              <p class="text-sm text-on-surface-variant">Qué mostrar al abrir la app</p>
            </div>
          </div>
          <select id="setting-pantalla" onchange="window.updateSetting('pantallaInicio', this.value)" class="bg-surface-container px-3 py-2 rounded-xl text-on-surface text-sm border border-outline-variant min-w-[120px]">
            <option value="dashboard" ${state.settings.pantallaInicio === 'dashboard' ? 'selected' : ''}>Dashboard</option>
            <option value="log" ${state.settings.pantallaInicio === 'log' ? 'selected' : ''}>Registro</option>
            <option value="routines" ${state.settings.pantallaInicio === 'routines' ? 'selected' : ''}>Rutinas</option>
          </select>
        </div>

        <!-- Rest Timer -->
        <div class="setting-item py-4 border-b border-outline-variant">
          <div class="flex items-center gap-4 mb-4">
            <span class="material-symbols-outlined text-2xl text-on-surface-variant">timer</span>
            <div>
              <p class="text-on-surface font-medium">Temporizador de descanso</p>
              <p class="text-sm text-on-surface-variant">Tiempo entre series</p>
            </div>
          </div>
          <div class="flex items-center gap-4 ml-12">
            <input type="range" id="setting-temporizador" min="30" max="300" step="15" value="${state.settings.temporizadorDescanso || 90}" 
              oninput="document.getElementById('temporizador-display').textContent = formatTime(this.value); window.updateSetting('temporizadorDescanso', parseInt(this.value))" 
              class="flex-1 accent-primary h-2 bg-surface-container-highest rounded-full">
            <span id="temporizador-display" class="text-on-surface font-bold w-16 text-right">${formatTime(state.settings.temporizadorDescanso || 90)}</span>
          </div>
        </div>

        <!-- Sound -->
        <div class="setting-item flex items-center justify-between py-4 border-b border-outline-variant">
          <div class="flex items-center gap-4">
            <span class="material-symbols-outlined text-2xl text-on-surface-variant">volume_up</span>
            <div>
              <p class="text-on-surface font-medium">Sonido</p>
              <p class="text-sm text-on-surface-variant">Sonidos de la app</p>
            </div>
          </div>
          <button onclick="window.toggleSetting('sonido')" id="sonido-toggle" class="w-14 h-8 rounded-full transition-colors duration-200 relative ${state.settings.sonido ? 'bg-primary-container' : 'bg-surface-container-high'}">
            <div class="w-6 h-6 bg-white rounded-full absolute top-1 transition-transform duration-200 shadow ${state.settings.sonido ? 'translate-x-6' : 'translate-x-1'}"></div>
          </button>
        </div>

        <!-- Vibration -->
        <div class="setting-item flex items-center justify-between py-4 border-b border-outline-variant">
          <div class="flex items-center gap-4">
            <span class="material-symbols-outlined text-2xl text-on-surface-variant">vibration</span>
            <div>
              <p class="text-on-surface font-medium">Vibración</p>
              <p class="text-sm text-on-surface-variant">Vibración al completar series</p>
            </div>
          </div>
          <button onclick="window.toggleSetting('vibracion')" id="vibracion-toggle" class="w-14 h-8 rounded-full transition-colors duration-200 relative ${state.settings.vibracion ? 'bg-primary-container' : 'bg-surface-container-high'}">
            <div class="w-6 h-6 bg-white rounded-full absolute top-1 transition-transform duration-200 shadow ${state.settings.vibracion ? 'translate-x-6' : 'translate-x-1'}"></div>
          </button>
        </div>

        <!-- Notification -->
        <div class="setting-item py-4 border-b border-outline-variant">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-4">
              <span class="material-symbols-outlined text-2xl text-on-surface-variant">notifications</span>
              <div>
                <p class="text-on-surface font-medium">Recordatorio diario</p>
                <p class="text-sm text-on-surface-variant">Notificación para entrenar</p>
              </div>
            </div>
            <button onclick="window.toggleSetting('recordatorio')" id="recordatorio-toggle" class="w-14 h-8 rounded-full transition-colors duration-200 relative ${state.settings.recordatorio ? 'bg-primary-container' : 'bg-surface-container-high'}">
              <div class="w-6 h-6 bg-white rounded-full absolute top-1 transition-transform duration-200 shadow ${state.settings.recordatorio ? 'translate-x-6' : 'translate-x-1'}"></div>
            </button>
          </div>
          <div class="flex items-center gap-4 ml-12 ${state.settings.recordatorio ? '' : 'opacity-50'}" id="recordatorio-time-container">
            <span class="text-on-surface-variant text-sm">Hora:</span>
            <input type="time" id="setting-hora-recordatorio" value="${state.settings.horaRecordatorio || '09:00'}" 
              onchange="window.updateSetting('horaRecordatorio', this.value)" class="bg-surface-container px-4 py-2 rounded-xl text-on-surface border border-outline-variant">
          </div>
        </div>

        <!-- Data Section -->
        <div class="mt-12 pt-6 border-t border-outline-variant">
          <h2 class="text-lg font-bold mb-4 text-on-surface">Datos</h2>
          
          <div class="space-y-3">
            <button onclick="window.exportData()" class="w-full py-4 rounded-xl bg-surface-container text-on-surface font-medium flex items-center justify-center gap-3">
              <span class="material-symbols-outlined">download</span>
              Exportar datos
            </button>
            <button onclick="window.importData()" class="w-full py-4 rounded-xl bg-surface-container text-on-surface font-medium flex items-center justify-center gap-3">
              <span class="material-symbols-outlined">upload</span>
              Importar datos
            </button>
            <button onclick="window.resetData()" class="w-full py-4 rounded-xl bg-red-50 text-red-600 font-medium flex items-center justify-center gap-3">
              <span class="material-symbols-outlined">delete_forever</span>
              Borrar todos los datos
            </button>
          </div>
        </div>

        <!-- About -->
        <div class="mt-8 text-center">
          <p class="text-on-surface-variant text-sm">WePai v1.0.0</p>
          <p class="text-on-surface-variant text-xs mt-1">Tu asistente de entrenamiento</p>
        </div>
      </main>
    </div>
  `;

  window.toggleDarkMode = () => {
    const btn = document.getElementById('dark-mode-toggle');
    const knob = btn?.querySelector('div');
    const isActive = btn?.classList.contains('bg-primary-container');
    
    if (isActive) {
      btn.classList.remove('bg-primary-container');
      btn.classList.add('bg-surface-container-high');
      knob?.classList.remove('translate-x-6');
      knob?.classList.add('translate-x-1');
    } else {
      btn.classList.add('bg-primary-container');
      btn.classList.remove('bg-surface-container-high');
      knob?.classList.add('translate-x-6');
      knob?.classList.remove('translate-x-1');
    }
    
    toggleDarkMode();
    applyDarkMode();
  };

  window.toggleSetting = (setting) => {
    const btn = document.getElementById(setting + '-toggle');
    const knob = btn?.querySelector('div');
    const isActive = btn?.classList.contains('bg-primary-container');
    
    if (isActive) {
      btn.classList.remove('bg-primary-container');
      btn.classList.add('bg-surface-container-high');
      knob?.classList.remove('translate-x-6');
      knob?.classList.add('translate-x-1');
    } else {
      btn.classList.add('bg-primary-container');
      btn.classList.remove('bg-surface-container-high');
      knob?.classList.add('translate-x-6');
      knob?.classList.remove('translate-x-1');
    }
    
    toggleSetting(setting);
  };

  window.updateSetting = (setting, value) => {
    updateSetting(setting, value);
    if (setting === 'unidades') {
      convertUnits();
    }
  };

  window.exportData = () => {
    exportData();
  };

  window.importData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        importData(file).then(() => {
          renderSettings();
          alert('Datos importados correctamente');
        });
      }
    };
    input.click();
  };

  window.resetData = () => {
    if (!confirm('¿Borrar todos los datos?')) return;
    resetData();
    window.location.href = '/';
  };
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default { render };
