/**
 * Daily Log Page
 * Workout logging with log-workout-flow conductor
 */

import { getState, saveState, addRegistro, updateRecord, setRestDay, removeRestDay, isRestDay } from '../../features/store.js';
import { 
  getFlowState, 
  getCurrentStep, 
  stepSelectRoutine, 
  stepAddExercise,
  stepUpdateExercise,
  stepRemoveExercise,
  stepCompleteSet,
  stepNextExercise,
  stepPrevExercise,
  finalizeWorkout,
  getWorkoutSummary,
  formatTimer,
  getTimerSeconds,
  isTimerRunning,
  stepStartTimer,
  stepStopTimer,
  stepSkipTimer,
  resetFlow,
  getAvailableRoutines
} from '../../features/flows/log-workout-flow.js';
import { calculateTotalVolume } from '../../features/calculations/volume.js';
import { calculateCurrentStreak } from '../../features/calculations/streak.js';
import { toISODate, formatDate, getDateRange, isToday } from '../../shared/utils/date.js';

let container = null;

export async function render(cont) {
  container = cont;
  const state = getState();
  
  resetFlow();
  
  renderSelectRoutine();
}

// ==================== DATE CAROUSEL HELPER ====================
function renderDateCarousel() {
  const state = getState();
  const dates = getDateRange(7, 6);
  const todayStr = toISODate();
  const selectedDate = state.selectedDate || todayStr;
  
  return `
    <section class="py-4 overflow-x-auto flex gap-2" id="date-carousel" style="scroll-behavior: smooth; scrollbar-width: none; -ms-overflow-style: none; -webkit-scrollbar: none;">
      ${dates.map((date, idx) => {
        const dateStr = toISODate(date);
        const isSelected = dateStr === selectedDate;
        const isTodayDate = isToday(date);
        const registro = state.registros.find(r => r.date === dateStr);
        const hasWorkout = registro && registro.exercises && registro.exercises.length > 0;
        const isRest = registro && registro.isRest === true;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const compareDate = new Date(date);
        compareDate.setHours(0, 0, 0, 0);
        const isPast = compareDate < today;
        const isFuture = compareDate > today;
        const dayOfWeek = date.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        let dayStyle = '';
        if (isSelected) {
          dayStyle = 'signature-gradient text-white shadow-lg scale-105';
        } else if (isTodayDate) {
          dayStyle = 'bg-primary-container/20 border-2 border-primary';
        } else if (isRest) {
          dayStyle = 'bg-blue-100 border-2 border-blue-300 text-blue-700';
        } else if (hasWorkout) {
          dayStyle = 'bg-green-100 border-2 border-green-300 text-green-700';
        } else if (isFuture) {
          dayStyle = isWeekend ? 'bg-surface-container border-2 border-gray-400 text-on-surface hover:border-primary' : 'bg-surface-container text-on-surface hover:bg-primary-container/10';
        } else if (isPast) {
          dayStyle = 'bg-surface-container-highest opacity-40 text-on-surface-variant';
        } else {
          dayStyle = 'bg-surface-container-low opacity-50';
        }
        return `
          <div role="button" tabindex="-1" data-date="${dateStr}" 
            class="date-btn flex-shrink-0 flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-200 cursor-pointer ${dayStyle}" style="min-width: 60px;">
            <span class="font-label text-[8px] uppercase font-bold ${isSelected ? 'text-white' : ''}">${formatDate(date, { weekday: 'short' }).slice(0,3)}</span>
            <span class="font-headline text-xl font-bold ${isSelected ? 'text-white' : ''}">${date.getDate()}</span>
            ${isRest ? '<span class="material-symbols-outlined text-xs">bedtime</span>' : ''}
            ${hasWorkout && !isRest ? '<span class="material-symbols-outlined text-xs">fitness_center</span>' : ''}
            ${isSelected ? '<div class="w-1.5 h-1.5 bg-white rounded-full"></div>' : ''}
          </div>
        `;
      }).join('')}
    </section>
  `;
}

function centerCarouselOnToday() {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const todayStr = new Date().toISOString().split('T')[0];
      const todayBtn = document.getElementById('date-btn-' + todayStr);
      const carousel = document.getElementById('date-carousel');
      if (todayBtn && carousel) {
        const containerWidth = carousel.offsetWidth;
        const buttonWidth = todayBtn.offsetWidth;
        const buttonLeft = todayBtn.offsetLeft;
        const scrollPosition = buttonLeft - (containerWidth / 2) + (buttonWidth / 2);
        carousel.scrollLeft = scrollPosition;
      }
    });
  });
}

function renderSelectRoutine() {
  const routines = getAvailableRoutines();
  
  container.innerHTML = `
    <div id="screen-registro" class="screen active">
      <header class="lg:hidden bg-[#fcf9f8]/80 dark:bg-[#1c1b1b]/80 backdrop-blur-xl fixed top-0 w-full z-50">
        <div class="flex justify-between items-center px-6 py-4 w-full max-w-7xl mx-auto">
          <div class="flex items-center gap-3">
            <span class="text-2xl font-black tracking-tighter text-[#1c1b1b] dark:text-white font-['Manrope']">WePai</span>
          </div>
          <div class="flex items-center gap-4">
            <button data-link href="/settings" class="text-[#FF6B00]">
              <span class="material-symbols-outlined text-2xl">settings</span>
            </button>
          </div>
        </div>
      </header>

      <main class="max-w-7xl mx-auto px-6 pt-24 pb-32">
        ${renderDateCarousel()}

        <section class="py-4">
          <div class="flex flex-col gap-1">
            <span class="font-label text-[10px] uppercase tracking-[0.15rem] text-primary font-semibold">Registro</span>
            <h2 class="font-headline font-extrabold text-4xl md:text-5xl tracking-tighter text-on-surface">¿Qué vas a hacer?</h2>
          </div>
        </section>

        <div class="grid grid-cols-1 gap-4 max-w-2xl mx-auto">
          <button onclick="window.selectRoutine(null)" class="p-6 rounded-2xl bg-surface-container-low border-2 border-primary-container hover:border-primary transition-colors text-left">
            <div class="flex items-center gap-4">
              <span class="material-symbols-outlined text-4xl text-primary">fitness_center</span>
              <div>
                <h3 class="font-headline font-bold text-xl text-on-surface">Entrenamiento Libre</h3>
                <p class="text-sm text-on-surface-variant">Sin rutina definida, crea tus ejercicios</p>
              </div>
            </div>
          </button>

          ${routines.map(routine => `
            <button onclick="window.selectRoutine('${routine.id}')" class="p-6 rounded-2xl bg-surface-container-low border-2 border-outline-variant hover:border-primary transition-colors text-left">
              <div class="flex items-center gap-4">
                <span class="material-symbols-outlined text-4xl text-on-surface-variant">event_note</span>
                <div>
                  <h3 class="font-headline font-bold text-xl text-on-surface">${routine.name}</h3>
                  <p class="text-sm text-on-surface-variant">${routine.days.join(', ')} • ${routine.exercises.length} ejercicios</p>
                </div>
              </div>
            </button>
          `).join('')}

          <button onclick="window.setAsRest()" class="p-6 rounded-2xl bg-blue-50 border-2 border-blue-200 hover:border-blue-400 transition-colors text-left">
            <div class="flex items-center gap-4">
              <span class="material-symbols-outlined text-4xl text-blue-500">bedtime</span>
              <div>
                <h3 class="font-headline font-bold text-xl text-on-surface">Día de Descanso</h3>
                <p class="text-sm text-on-surface-variant">No entreno hoy</p>
              </div>
            </div>
          </button>
        </div>
      </main>
    </div>
  `;
  
  centerCarouselOnToday();
  
  window.selectRoutine = (routineId) => {
    stepSelectRoutine(routineId);
    renderExercises();
  };

  window.setAsRest = () => {
    const state = getState();
    const dateStr = state.selectedDate || toISODate();
    setRestDay(dateStr);
    window.showToast('Día marcado como descanso');
    renderSelectRoutine();
  };
}

function renderExercises() {
  const flow = getFlowState();
  
  let dailyVolume = 0;
  let completedSets = 0;
  let totalSets = 0;
  
  flow.exercises.forEach(ex => {
    dailyVolume += ex.sets * ex.weight;
    completedSets += ex.setsArr ? ex.setsArr.filter(s => s).length : 0;
    totalSets += ex.sets;
  });
  
  container.innerHTML = `
    <div id="screen-registro" class="screen active">
      <header class="lg:hidden bg-[#fcf9f8]/80 dark:bg-[#1c1b1b]/80 backdrop-blur-xl fixed top-0 w-full z-50">
        <div class="flex justify-between items-center px-6 py-4 w-full max-w-7xl mx-auto">
          <div class="flex items-center gap-3">
            <span class="text-2xl font-black tracking-tighter text-[#1c1b1b] dark:text-white font-['Manrope']">WePai</span>
          </div>
          <div class="flex items-center gap-4">
            <button data-link href="/settings" class="text-[#FF6B00]">
              <span class="material-symbols-outlined text-2xl">settings</span>
            </button>
            <button onclick="window.finishWorkout()" class="signature-gradient text-white px-4 py-2 rounded-full font-bold text-sm">
              Finalizar
            </button>
          </div>
        </div>
      </header>

      <main class="max-w-7xl mx-auto px-6 pt-24 pb-32">
        <section class="py-8">
          <div class="flex flex-col gap-1">
            <span class="font-label text-[10px] uppercase tracking-[0.15rem] text-primary font-semibold">Registro</span>
            <h2 class="font-headline font-extrabold text-5xl md:text-7xl tracking-tighter text-on-surface">${flow.isFreeTraining ? 'Entrenamiento Libre' : 'Ejercicios'}</h2>
          </div>
        </section>

        ${renderDateCarousel()}

        <div class="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <aside class="md:col-span-4 flex flex-col gap-4">
            <div class="p-6 rounded-xl bg-surface-container-low border border-outline-variant/10">
              <span class="font-label text-[10px] uppercase font-bold tracking-widest text-primary block mb-2">Peso Movido</span>
              <div class="flex items-baseline gap-2">
                <span class="font-headline text-5xl font-black tracking-tighter" id="daily-volume">${dailyVolume}</span>
                <span class="font-label text-sm text-outline font-medium">kg</span>
              </div>
            </div>
            
            <div class="p-6 rounded-xl bg-surface-container-low border border-outline-variant/10">
              <span class="font-label text-[10px] uppercase font-bold tracking-widest text-primary block mb-2">Series</span>
              <div class="flex items-baseline gap-2">
                <span class="font-headline text-5xl font-black tracking-tighter" id="series-completed">${completedSets}</span>
                <span class="font-label text-sm text-outline font-medium" id="series-total">/ ${totalSets}</span>
              </div>
              <div class="mt-2 h-2 bg-surface-container-highest rounded-full overflow-hidden">
                <div class="h-full signature-gradient rounded-full" id="series-bar" style="width: ${totalSets > 0 ? (completedSets / totalSets) * 100 : 0}%"></div>
              </div>
            </div>

            ${flow.isFreeTraining ? `
              <button onclick="window.openAddExercise()" class="flex items-center justify-center gap-3 p-5 rounded-full bg-surface-container-highest dark:bg-[#383838] text-on-surface dark:text-white font-headline font-bold text-lg hover:bg-surface-variant transition-colors">
                <span class="material-symbols-outlined text-primary">add_circle</span>
                Añadir ejercicio
              </button>
            ` : ''}
            
            <button onclick="window.finishWorkout()" class="w-full py-4 rounded-xl signature-gradient text-white font-semibold flex items-center justify-center gap-2">
              <span class="material-symbols-outlined">check_circle</span>
              Guardar sesión
            </button>
          </aside>

          <section class="md:col-span-8 flex flex-col gap-4" id="exercises-list">
            ${flow.exercises.length === 0 ? `
              <div class="rounded-2xl p-6 text-center bg-surface-container-low">
                <span class="material-symbols-outlined text-5xl text-outline mb-3">fitness_center</span>
                <p class="text-on-surface-variant">No hay ejercicios</p>
              </div>
            ` : flow.exercises.map((ex, idx) => `
              <div class="rounded-xl bg-surface-container-lowest shadow-sm border-l-4 border-primary-container">
                <div class="p-6">
                  <div class="flex justify-between items-start mb-4">
                    <h3 class="font-headline text-2xl font-bold tracking-tight">${ex.name}</h3>
                    <button onclick="window.removeExercise(${idx})" class="text-stone-300 hover:text-red-500 transition-colors">
                      <span class="material-symbols-outlined">delete_outline</span>
                    </button>
                  </div>
                  <div class="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <span class="font-label text-[10px] uppercase font-bold text-outline block mb-1">Peso</span>
                      <input type="number" value="${ex.weight}" min="0" max="500" step="0.5" 
                        onchange="window.updateExercise(${idx}, 'weight', this.value)"
                        class="font-headline text-3xl font-bold bg-transparent border-b border-outline-variant/30 focus:border-primary-container w-24 text-on-surface">
                      <span class="text-xs text-outline">kg</span>
                    </div>
                    <div>
                      <span class="font-label text-[10px] uppercase font-bold text-outline block mb-1">Series</span>
                      <input type="number" value="${ex.sets}" min="1" max="10" 
                        onchange="window.updateExercise(${idx}, 'sets', this.value)"
                        class="font-headline text-3xl font-bold text-primary-container bg-transparent border-b border-outline-variant/30 w-16">
                    </div>
                    <div>
                      <span class="font-label text-[10px] uppercase font-bold text-outline block mb-1">Reps</span>
                      <input type="number" value="${ex.reps}" min="1" max="100" 
                        onchange="window.updateExercise(${idx}, 'reps', this.value)"
                        class="font-headline text-3xl font-bold bg-transparent border-b border-outline-variant/30 w-16 text-on-surface">
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    ${(ex.setsArr || []).map((done, i) => `
                      <button onclick="window.completeSet(${idx}, ${i})" 
                        class="flex-1 py-2 rounded-lg text-xs font-medium transition ${done ? 'signature-gradient text-white' : 'bg-surface-container text-on-surface-variant'}">
                        ${i + 1}
                      </button>
                    `).join('')}
                  </div>
                </div>
              </div>
            `).join('')}
          </section>
        </div>
      </main>
    </div>
  `;
  
  centerCarouselOnToday();
  
  window.updateExercise = (idx, field, value) => {
    const updates = {};
    if (field === 'sets') updates.sets = parseInt(value) || 1;
    else if (field === 'reps') updates.reps = parseInt(value) || 1;
    else if (field === 'weight') updates.weight = parseFloat(value) || 0;
    
    stepUpdateExercise(idx, updates);
    renderExercises();
  };
  
  window.completeSet = (exIdx, setIdx) => {
    stepCompleteSet(exIdx, setIdx);
    renderExercises();
  };
  
  window.removeExercise = (idx) => {
    stepRemoveExercise(idx);
    renderExercises();
  };
  
  window.openAddExercise = () => {
    const overlay = document.getElementById('modal-overlay');
    const input = document.getElementById('modal-input');
    const cancelBtn = document.getElementById('modal-cancel');
    const confirmBtn = document.getElementById('modal-confirm');
    
    input.value = '';
    overlay.classList.add('show');
    input.focus();
    
    const closeModal = () => {
      overlay.classList.remove('show');
    };
    
    const handleConfirm = () => {
      const name = input.value.trim();
      if (!name) {
        window.showToast('Escribe un nombre');
        return;
      }
      stepAddExercise({
        name,
        sets: 3,
        reps: 10,
        weight: 0
      });
      closeModal();
      renderExercises();
    };
    
    cancelBtn.onclick = closeModal;
    confirmBtn.onclick = handleConfirm;
    input.onkeydown = (e) => {
      if (e.key === 'Enter') handleConfirm();
      if (e.key === 'Escape') closeModal();
    };
    overlay.onclick = (e) => {
      if (e.target === overlay) closeModal();
    };
  };
  
  window.selectDate = (dateStr) => {
    const state = getState();
    state.selectedDate = dateStr;
    saveState();
    if (window.location.hash.includes('log') || window.location.pathname.includes('log')) {
      renderExercises();
    } else {
      renderSelectRoutine();
    }
  };

  setTimeout(() => {
    document.querySelectorAll('.date-btn').forEach(btn => {
      btn.onclick = () => {
        window.selectDate(btn.dataset.date);
      };
    });
  }, 0);

  window.finishWorkout = () => {
    const result = finalizeWorkout();
    
    if (!result.success) {
      window.showToast(result.error || 'Error al guardar');
      return;
    }
    
    renderSummary(result.summary);
  };
}

function renderSummary(summary) {
  const state = getState();
  const dates = state.registros.map(r => r.date);
  const streak = calculateCurrentStreak(dates);
  
  container.innerHTML = `
    <div id="screen-registro" class="screen active">
      <main class="max-w-7xl mx-auto px-6 pt-24 pb-32 min-h-screen flex items-center justify-center">
        <div class="text-center max-w-md mx-auto">
          <span class="material-symbols-outlined text-8xl text-primary mb-6">check_circle</span>
          <h2 class="font-headline text-4xl font-extrabold mb-4 text-on-surface">¡Entrenamiento Guardado!</h2>
          
          <div class="bg-surface-container-low rounded-2xl p-6 mb-8">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-xs text-on-surface-variant uppercase">Volumen</p>
                <p class="font-headline text-2xl font-bold text-on-surface">${summary.totalVolume.toLocaleString()} <span class="text-sm">kg</span></p>
              </div>
              <div>
                <p class="text-xs text-on-surface-variant uppercase">Series</p>
                <p class="font-headline text-2xl font-bold text-on-surface">${summary.completedSets}/${summary.totalSets}</p>
              </div>
              <div>
                <p class="text-xs text-on-surface-variant uppercase">Ejercicios</p>
                <p class="font-headline text-2xl font-bold text-on-surface">${summary.exercisesCount}</p>
              </div>
              <div>
                <p class="text-xs text-on-surface-variant uppercase">Racha</p>
                <p class="font-headline text-2xl font-bold text-primary">${streak} días</p>
              </div>
            </div>
          </div>
          
          <div class="flex flex-col gap-3">
            <a href="/log" data-link class="w-full py-4 rounded-xl signature-gradient text-white font-semibold">
              Nuevo Entrenamiento
            </a>
            <a href="/dashboard" data-link class="w-full py-4 rounded-xl bg-surface-container text-on-surface font-semibold">
              Ver Dashboard
            </a>
          </div>
        </div>
      </main>
    </div>
  `;
}

export default { render };
