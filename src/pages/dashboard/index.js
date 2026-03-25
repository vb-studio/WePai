/**
 * Dashboard Page
 * Main overview screen with stats, streak, volume chart, muscle groups
 */

import { getState } from '../../features/store.js';
import { calculateCurrentStreak, getStreakMessage } from '../../features/calculations/streak.js';
import { calculateMuscleLevels } from '../../features/calculations/muscle-group.js';
import { calculateTotalVolume, aggregateByMuscleGroup } from '../../features/calculations/volume.js';

export async function render(container) {
  const state = getState();
  
  const streak = calculateCurrentStreak(state.registros.map(r => r.date));
  const streakMsg = getStreakMessage(streak);
  
  const muscleLevels = calculateMuscleLevels(state.registros);
  
  const totalVolume = state.registros.reduce((sum, r) => {
    return sum + calculateTotalVolume(r.exercises);
  }, 0);

  container.innerHTML = `
    <div id="screen-dashboard" class="screen active">
      <header class="lg:hidden bg-[#fcf9f8]/80 dark:bg-[#1c1b1b]/80 backdrop-blur-xl fixed top-0 w-full z-50">
        <div class="flex justify-between items-center px-6 py-4 w-full max-w-7xl mx-auto">
          <div class="flex items-center gap-3">
            <span class="text-2xl font-black tracking-tighter text-[#1c1b1b] dark:text-white font-['Manrope']">WePai</span>
          </div>
          <div class="flex items-center gap-4">
            <button data-link href="/settings" class="text-[#FF6B00] hover:opacity-80 transition-opacity">
              <span class="material-symbols-outlined text-2xl">settings</span>
            </button>
          </div>
        </div>
      </header>

      <main class="max-w-7xl mx-auto px-6 pt-24 pb-32">
        <section class="mb-12">
          <div class="flex flex-col md:flex-row justify-between items-end gap-6">
            <div>
              <p class="font-label text-primary uppercase tracking-[0.05rem] text-[10px] font-bold mb-1">Resumen de Rendimiento</p>
              <h1 class="text-5xl md:text-7xl font-extrabold tracking-tighter text-on-surface">Análisis <span class="text-primary-container">WePai</span></h1>
            </div>
            <div class="flex flex-col items-end">
              <span class="headline text-4xl font-bold text-on-surface" id="dashboard-peso">
                ${state.perfil.peso > 0 ? state.perfil.peso + '<span class="text-lg text-outline ml-1 font-medium">kg</span>' : '—<span class="text-lg text-outline ml-1 font-medium">kg</span>'}
              </span>
              <p class="font-label text-xs text-outline uppercase tracking-wider">Peso Actual</p>
            </div>
          </div>
        </section>

        <div class="grid grid-cols-1 md:grid-cols-12 gap-8">
          <!-- Progression Chart -->
          <div class="md:col-span-8 bg-surface-container-lowest rounded-xl p-8 relative overflow-hidden border border-outline-variant/10">
            <div class="flex justify-between items-start mb-10">
              <div>
                <h3 class="text-2xl font-bold tracking-tight mb-1">Progresión de Peso</h3>
                <p class="text-sm text-on-surface-variant font-medium">Registra tu primer entrenamiento</p>
              </div>
            </div>
            <div id="chart-empty" class="flex flex-col items-center justify-center py-12">
              <span class="material-symbols-outlined text-6xl text-outline opacity-20 mb-4">show_chart</span>
              <p class="text-sm text-on-surface-variant text-center">Aún no hay registros.<br>Empieza tu primer entrenamiento.</p>
            </div>
          </div>

          <!-- Goals & Streak -->
          <div class="md:col-span-4 space-y-8">
            <div class="bg-surface-container-low rounded-xl p-6">
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-bold">Objetivos y Metas</h3>
                <button data-link href="/profile" class="text-primary hover:opacity-80 transition-opacity">
                  <span class="material-symbols-outlined text-xl">add_circle</span>
                </button>
              </div>
              <div id="goals-container">
                ${renderGoals(state)}
              </div>
            </div>
            <div class="bg-inverse-surface rounded-xl p-6 text-white overflow-hidden relative">
              <div class="relative z-10">
                <p class="text-[10px] font-bold uppercase tracking-widest opacity-60">Racha de Constancia</p>
                <h4 class="text-4xl font-extrabold mb-4" id="streak-count">${streak} Días</h4>
                <p class="text-xs opacity-80 leading-relaxed font-medium" id="streak-message">${streakMsg}</p>
              </div>
              <div class="absolute -right-4 -bottom-4 opacity-10">
                <span class="material-symbols-outlined text-9xl">bolt</span>
              </div>
            </div>
          </div>

          <!-- Muscle Groups -->
          <div class="md:col-span-12 lg:col-span-5 bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/10">
            <h3 class="text-2xl font-bold tracking-tight mb-8">Especialización Muscular</h3>
            <div class="space-y-6" id="muscle-groups">
              ${renderMuscleGroups(muscleLevels, state)}
            </div>
          </div>

          <!-- Recent PR & Volume -->
          <div class="md:col-span-12 lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="bg-surface-container-low rounded-xl p-8 flex flex-col justify-between">
              <div>
                <span class="material-symbols-outlined text-primary-container text-3xl mb-4">emoji_events</span>
                <h4 class="text-xl font-bold mb-1">Récord Reciente</h4>
                <p class="text-sm text-outline font-medium" id="recent-pr-name">${renderRecentPR(state)}</p>
              </div>
              <div class="mt-8">
                <span class="text-5xl font-extrabold tracking-tighter" id="recent-pr-weight">${getRecentPRWeight(state)}</span>
                <span class="text-lg font-bold text-primary-container">KG</span>
              </div>
            </div>
            <div class="bg-surface-container-low rounded-xl p-8 flex flex-col justify-between relative overflow-hidden">
              <div class="relative z-10">
                <h4 class="text-xl font-bold mb-2">Distribución de Volumen</h4>
                <p class="text-xs text-outline leading-tight font-medium">${totalVolume > 0 ? `${totalVolume.toLocaleString()} kg totales` : 'Registra ejercicios para ver.'}</p>
              </div>
              <div class="mt-8 flex items-end gap-1 relative z-10" id="volume-distribution">
                ${renderVolumeDistribution(state)}
              </div>
              <div class="absolute -right-4 top-4 w-24 h-24 border-8 border-primary-container/5 rounded-full"></div>
            </div>
          </div>
        </div>

        <!-- New Workout Button -->
        <div class="fixed bottom-32 md:bottom-8 right-6 z-40">
          <a href="/log" data-link class="signature-gradient text-white px-5 py-3 rounded-full flex items-center gap-2 font-medium text-sm shadow-lg shadow-primary/20 hover:shadow-xl transition-all active:scale-95">
            <span class="material-symbols-outlined">add</span>
            Nuevo
          </a>
        </div>
      </main>
    </div>
  `;
}

function renderGoals(state) {
  if (!state.goals || state.goals.length === 0) {
    return `
      <div class="text-center py-4 text-on-surface-variant">
        <span class="material-symbols-outlined text-3xl opacity-40 mb-2 block">flag</span>
        <p class="text-xs">Añade metas para seguir tu progreso</p>
      </div>
    `;
  }
  
  return state.goals.map((goal, idx) => {
    const record = state.records[goal.exercise.toLowerCase()];
    const current = record ? record.weight : 0;
    const percent = Math.min(100, Math.round((current / goal.weight) * 100));
    
    return `
      <div class="mb-4">
        <div class="flex justify-between items-end mb-2">
          <div>
            <p class="text-[10px] font-bold uppercase tracking-widest text-outline">${goal.exercise}</p>
            <p class="text-xl font-bold">${goal.weight}.0 <span class="text-xs font-normal">kg</span></p>
          </div>
          <span class="text-[10px] font-black text-primary">${percent}%</span>
        </div>
        <div class="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
          <div class="h-full signature-gradient rounded-full" style="width: ${percent}%"></div>
        </div>
      </div>
    `;
  }).join('');
}

function renderMuscleGroups(levels, state) {
  const groups = ['pecho', 'espalda', 'piernas', 'hombros', 'brazos'];
  const names = { pecho: 'Pecho', espalda: 'Espalda', piernas: 'Piernas', hombros: 'Hombros', brazos: 'Brazos' };
  
  return groups.map(group => `
    <div class="flex items-center gap-6">
      <span class="w-16 text-[10px] font-bold uppercase tracking-widest text-outline">${names[group]}</span>
      <div class="flex-1 h-8 bg-surface-container-low rounded-sm relative overflow-hidden">
        <div class="absolute inset-y-0 left-0 bg-primary-container/20 w-full"></div>
        <div class="absolute inset-y-0 left-0 bg-primary-container w-[${levels[group] * 10}%]"></div>
        <span class="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-on-surface">Lv. ${levels[group]}</span>
      </div>
    </div>
  `).join('');
}

function renderRecentPR(state) {
  const entries = Object.entries(state.records || {});
  if (entries.length === 0) return 'Sin récords aún';
  
  const sorted = entries.sort((a, b) => new Date(b[1].date) - new Date(a[1].date));
  return sorted[0][0];
}

function getRecentPRWeight(state) {
  const entries = Object.entries(state.records || {});
  if (entries.length === 0) return '0';
  
  const sorted = entries.sort((a, b) => new Date(b[1].date) - new Date(a[1].date));
  return sorted[0][1].weight;
}

function renderVolumeDistribution(state) {
  if (!state.registros || state.registros.length === 0) {
    return `
      <div class="w-1/3 bg-on-surface h-12 rounded-t-sm opacity-20"></div>
      <div class="w-1/3 signature-gradient h-24 rounded-t-sm opacity-20"></div>
      <div class="w-1/3 bg-on-surface-variant h-16 rounded-t-sm opacity-20"></div>
    `;
  }
  
  const volume = aggregateByMuscleGroup(
    state.registros.flatMap(r => r.exercises)
  );
  
  const total = Object.values(volume).reduce((s, v) => s + v, 0) || 1;
  
  return `
    <div class="w-1/3 bg-primary h-12 rounded-t-sm" style="height: ${(volume.pecho / total) * 100}%"></div>
    <div class="w-1/3 signature-gradient h-24 rounded-t-sm" style="height: ${(volume.espalda / total) * 100}%"></div>
    <div class="w-1/3 bg-on-surface-variant h-16 rounded-t-sm" style="height: ${(volume.piernas / total) * 100}%"></div>
  `;
}

export default { render };
