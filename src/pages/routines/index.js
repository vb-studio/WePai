/**
 * Routines Page
 * CRUD for workout routines
 */

import { getState, saveState, addRoutine, updateRoutine, deleteRoutine } from '../../features/store.js';
import {
  resetFlow,
  initEditFlow,
  getFlowState,
  getCurrentStep,
  stepSetName,
  stepSetDays,
  stepAddExercise,
  stepUpdateExercise,
  stepRemoveExercise,
  stepGoToReview,
  stepGoBack,
  finalizeRoutine,
  getStepInfo
} from '../../features/flows/create-routine-flow.js';

let container = null;

export async function render(cont) {
  container = cont;
  const state = getState();
  resetFlow();
  renderRoutinesList();
}

function renderRoutinesList() {
  const state = getState();
  const routines = state.rutinas || [];
  
  container.innerHTML = `
    <div id="screen-rutinas" class="screen active">
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

      <main class="pt-20 px-6 pb-32 max-w-5xl mx-auto space-y-10">
        <section class="flex justify-between items-end">
          <div class="space-y-1">
            <span class="text-label-sm font-label tracking-widest text-primary uppercase text-[10px] font-bold">Gestión de Entrenamiento</span>
            <h2 class="text-4xl font-headline font-extrabold tracking-tight">Mis Rutinas</h2>
          </div>
          <button type="button" onclick="window.openNewRoutine()" class="signature-gradient text-on-primary px-6 py-3 rounded-full flex items-center gap-2 font-headline font-bold text-sm shadow-lg shadow-primary/20 active:scale-95 transition-transform">
            <span class="material-symbols-outlined text-sm">add</span>
            Crear Nueva Rutina
          </button>
        </section>

        ${routines.length === 0 ? `
          <div class="rounded-2xl p-12 text-center bg-surface-container-low">
            <span class="material-symbols-outlined text-6xl text-outline mb-4">fitness_center</span>
            <p class="text-on-surface-variant mb-4">Aún no tienes rutinas creadas</p>
            <button type="button" onclick="window.openNewRoutine()" class="px-6 py-3 rounded-full signature-gradient text-white font-medium">
              Crea tu primera rutina
            </button>
          </div>
        ` : `
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            ${routines.map(routine => `
              <div class="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="font-headline font-bold text-xl">${routine.name}</h3>
                  <div class="flex gap-2">
                    <button type="button" onclick="window.startRoutine('${routine.id}')" class="px-3 py-1.5 rounded-lg signature-gradient text-white text-sm font-medium">
                      Iniciar
                    </button>
                    <button type="button" onclick="window.editRoutine('${routine.id}')" class="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high transition">
                      <span class="material-symbols-outlined text-base text-on-surface-variant">edit</span>
                    </button>
                    <button type="button" onclick="window.deleteRoutine('${routine.id}')" class="p-2 rounded-lg bg-surface-container hover:bg-red-50 transition">
                      <span class="material-symbols-outlined text-base text-on-surface-variant">delete</span>
                    </button>
                  </div>
                </div>
                <div class="flex flex-wrap gap-2 mb-4">
                  ${routine.days.map(d => `
                    <span class="px-2 py-1 bg-surface-container rounded-lg text-xs text-on-surface-variant">${d}</span>
                  `).join('')}
                </div>
                <div class="space-y-2">
                  ${routine.exercises.map(ex => `
                    <div class="flex items-center justify-between py-2 border-b border-outline-variant/30 last:border-0">
                      <span class="text-sm text-on-surface">${ex.name}</span>
                      <span class="text-sm text-on-surface-variant">${ex.sets} × ${ex.reps}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        `}

        <!-- Week Grid -->
        <section class="space-y-6">
          <h3 class="text-xl font-headline font-bold">Planificación Semanal</h3>
          <div class="grid grid-cols-7 gap-1 md:gap-3">
            ${['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, i) => {
              const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
              const hasRoutine = routines.some(r => r.days.includes(dayNames[i]));
              return `
                <div class="bg-surface-container-lowest p-2 md:p-4 rounded-2xl flex flex-col items-center gap-1 md:gap-3 border-b-4 ${hasRoutine ? 'border-primary shadow-sm' : 'border-transparent opacity-60'}">
                  <span class="text-[10px] md:text-xs font-bold text-on-surface-variant">${day}</span>
                  <div class="w-10 h-10 rounded-full ${hasRoutine ? 'bg-primary-container/10 flex items-center justify-center text-primary' : 'bg-surface-container-highest flex items-center justify-center text-on-surface-variant'}">
                    <span class="material-symbols-outlined text-xl">${hasRoutine ? 'fitness_center' : 'weekend'}</span>
                  </div>
                  <span class="text-[8px] font-bold uppercase tracking-tighter text-on-surface whitespace-nowrap">${hasRoutine ? 'Activo' : 'Descanso'}</span>
                </div>
              `;
            }).join('')}
          </div>
        </section>
      </main>
    </div>
  `;

  window.openNewRoutine = () => {
    resetFlow();
    renderRoutineForm();
  };

  window.editRoutine = (id) => {
    initEditFlow(id);
    renderRoutineForm();
  };

  window.deleteRoutine = (id) => {
    if (!confirm('¿Eliminar esta rutina?')) return;
    deleteRoutine(id);
    renderRoutinesList();
  };

  window.startRoutine = (id) => {
    window.location.href = '/log?routine=' + id;
  };
}

function renderRoutineForm() {
  const flow = getFlowState();
  const stepInfo = getStepInfo(getCurrentStep());
  
  container.innerHTML = `
    <div id="screen-rutinas" class="screen active">
      <header class="lg:hidden bg-[#fcf9f8]/80 dark:bg-[#1c1b1b]/80 backdrop-blur-xl fixed top-0 w-full z-50">
        <div class="flex justify-between items-center px-6 py-4 w-full max-w-7xl mx-auto">
          <div class="flex items-center gap-3">
            <button type="button" onclick="window.cancelRoutine()" class="text-on-surface-variant">
              <span class="material-symbols-outlined text-2xl">arrow_back</span>
            </button>
            <span class="text-xl font-bold">${flow.editingId ? 'Editar' : 'Nueva'} Rutina</span>
          </div>
          <div class="flex items-center gap-4">
            <span class="text-xs text-on-surface-variant">Paso ${stepInfo.stepNum}/4</span>
          </div>
        </div>
      </header>

      <main class="pt-20 px-6 pb-32 max-w-2xl mx-auto">
        <!-- Progress Bar -->
        <div class="mb-8">
          <div class="flex justify-between mb-2">
            <span class="text-sm font-medium text-on-surface">${stepInfo.title}</span>
            <span class="text-sm text-on-surface-variant">${stepInfo.stepNum} de ${stepInfo.totalSteps}</span>
          </div>
          <div class="h-2 bg-surface-container-highest rounded-full overflow-hidden">
            <div class="h-full signature-gradient rounded-full transition-all" style="width: ${(stepInfo.stepNum / stepInfo.totalSteps) * 100}%"></div>
          </div>
        </div>

        <!-- Step 1: Name -->
        ${getCurrentStep() === 'name' ? `
          <div class="space-y-6">
            <div>
              <label class="block text-sm text-on-surface-variant mb-2">Nombre de la rutina</label>
              <input type="text" id="routine-name" class="input-field w-full px-4 py-3 text-on-surface text-xl" placeholder="Ej: Día de pecho" value="${flow.routineName || ''}">
            </div>
            <button type="button" onclick="window.submitName()" class="w-full py-4 rounded-xl signature-gradient text-white font-semibold">
              Continuar
            </button>
          </div>
        ` : ''}

        <!-- Step 2: Days -->
        ${getCurrentStep() === 'days' ? `
          <div class="space-y-6">
            <div>
              <label class="block text-sm text-on-surface-variant mb-4">Días de la semana</label>
              <div class="flex flex-wrap gap-3">
                ${['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(day => `
                  <div data-day="${day}" onclick="window.toggleDay('${day}')" class="day-toggle flex items-center justify-center px-4 py-3 rounded-xl cursor-pointer transition ${flow.selectedDays.includes(day) ? 'signature-gradient text-white' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'}">
                    <span class="text-sm font-medium">${day}</span>
                  </div>
                `).join('')}
              </div>
            </div>
            <div class="flex gap-3">
              <button type="button" onclick="window.backStep()" class="flex-1 py-4 rounded-xl bg-surface-container text-on-surface font-semibold">
                Atrás
              </button>
              <button type="button" onclick="window.submitDays()" class="flex-1 py-4 rounded-xl signature-gradient text-white font-semibold">
                Continuar
              </button>
            </div>
          </div>
        ` : ''}

        <!-- Step 3: Exercises -->
        ${getCurrentStep() === 'exercises' ? `
          <div class="space-y-6">
            <div class="flex justify-between items-center">
              <h3 class="text-xl font-bold">Ejercicios</h3>
              <button type="button" onclick="window.addExercise()" class="text-primary font-medium flex items-center gap-1">
                <span class="material-symbols-outlined text-base">add</span>
                Añadir
              </button>
            </div>
            
              <div class="space-y-3" id="exercises-list">
              ${flow.exercises.length === 0 ? `
                <p class="text-center text-on-surface-variant py-8">No hay ejercicios. Añade el primero.</p>
              ` : flow.exercises.map((ex, idx) => `
                <div class="bg-surface-container-low rounded-xl p-3">
                  <div class="flex items-center gap-2 mb-2">
                    <input type="text" value="${ex.name}" placeholder="Nombre del ejercicio" 
                      onchange="window.updateExName(${idx}, this.value)"
                      class="flex-1 px-3 py-2 bg-surface-container text-sm rounded-lg">
                    <button type="button" onclick="window.removeEx(${idx})" class="p-2 text-on-surface-variant hover:text-red-500">
                      <span class="material-symbols-outlined text-lg">close</span>
                    </button>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="flex items-center gap-1">
                      <span class="text-xs text-on-surface-variant">Series</span>
                      <input type="number" value="${ex.sets}" min="1" max="10" 
                        onchange="window.updateExField(${idx}, 'sets', this.value)"
                        class="w-14 px-2 py-1 bg-surface-container text-sm rounded-lg text-center">
                    </div>
                    <span class="text-sm text-on-surface-variant">×</span>
                    <div class="flex items-center gap-1">
                      <span class="text-xs text-on-surface-variant">Reps</span>
                      <input type="number" value="${ex.reps}" min="1" max="100" 
                        onchange="window.updateExField(${idx}, 'reps', this.value)"
                        class="w-14 px-2 py-1 bg-surface-container text-sm rounded-lg text-center">
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>

            <div class="flex gap-3">
              <button type="button" onclick="window.backStep()" class="flex-1 py-4 rounded-xl bg-surface-container text-on-surface font-semibold">
                Atrás
              </button>
              <button type="button" onclick="window.goToReview()" class="flex-1 py-4 rounded-xl signature-gradient text-white font-semibold">
                Revisar
              </button>
            </div>
          </div>
        ` : ''}

        <!-- Step 4: Review -->
        ${getCurrentStep() === 'review' ? `
          <div class="space-y-6">
            <h3 class="text-xl font-bold">Revisar Rutina</h3>
            
            <div class="bg-surface-container-low rounded-xl p-6">
              <p class="text-sm text-on-surface-variant mb-1">Nombre</p>
              <p class="font-headline font-bold text-lg mb-4">${flow.routineName}</p>
              
              <p class="text-sm text-on-surface-variant mb-2">Días</p>
              <div class="flex flex-wrap gap-2 mb-4">
                ${flow.selectedDays.map(d => `<span class="px-2 py-1 bg-primary-container/20 rounded-lg text-xs">${d}</span>`).join('')}
              </div>
              
              <p class="text-sm text-on-surface-variant mb-2">Ejercicios (${flow.exercises.length})</p>
              <div class="space-y-2">
                ${flow.exercises.map(ex => `
                  <div class="flex justify-between text-sm">
                    <span>${ex.name}</span>
                    <span class="text-on-surface-variant">${ex.sets} × ${ex.reps}</span>
                  </div>
                `).join('')}
              </div>
            </div>

            <div class="flex gap-3">
              <button type="button" onclick="window.backStep()" class="flex-1 py-4 rounded-xl bg-surface-container text-on-surface font-semibold">
                Atrás
              </button>
              <button type="button" onclick="window.saveRoutine()" class="flex-1 py-4 rounded-xl signature-gradient text-white font-semibold">
                Guardar Rutina
              </button>
            </div>
          </div>
        ` : ''}
      </main>
    </div>
  `;

  window.cancelRoutine = () => {
    resetFlow();
    renderRoutinesList();
  };

  window.submitName = () => {
    const name = document.getElementById('routine-name').value.trim();
    if (!name) {
      window.showToast('El nombre es obligatorio');
      return;
    }
    stepSetName(name);
    renderRoutineForm();
  };

  window.toggleDay = (day) => {
    const flow = getFlowState();
    const idx = flow.selectedDays.indexOf(day);
    if (idx > -1) {
      flow.selectedDays.splice(idx, 1);
    } else {
      flow.selectedDays.push(day);
    }
    document.querySelectorAll('.day-toggle').forEach(el => {
      const d = el.dataset.day;
      if (flow.selectedDays.includes(d)) {
        el.classList.remove('bg-surface-container-low', 'text-on-surface-variant', 'hover:bg-surface-container');
        el.classList.add('signature-gradient', 'text-white');
      } else {
        el.classList.remove('signature-gradient', 'text-white');
        el.classList.add('bg-surface-container-low', 'text-on-surface-variant', 'hover:bg-surface-container');
      }
    });
  };

  window.submitDays = () => {
    const flow = getFlowState();
    if (flow.selectedDays.length === 0) {
      window.showToast('Selecciona al menos un día');
      return;
    }
    stepSetDays(flow.selectedDays);
    renderRoutineForm();
  };

  window.addExercise = () => {
    const result = stepAddExercise({ name: 'Nuevo ejercicio', sets: 3, reps: 10 });
    if (!result.success) {
      window.showToast(result.error || 'Error al añadir ejercicio');
      return;
    }
    renderRoutineForm();
  };

  window.updateExName = (idx, value) => {
    stepUpdateExercise(idx, { name: value });
  };

  window.updateExField = (idx, field, value) => {
    stepUpdateExercise(idx, { [field]: parseInt(value) || 1 });
  };

  window.removeEx = (idx) => {
    stepRemoveExercise(idx);
    renderRoutineForm();
  };

  window.backStep = () => {
    stepGoBack();
    renderRoutineForm();
  };

  window.goToReview = () => {
    stepGoToReview();
    renderRoutineForm();
  };

  window.saveRoutine = () => {
    const result = finalizeRoutine();
    if (!result.success) {
      window.showToast(result.error || 'Error al guardar');
      return;
    }
    renderRoutinesList();
  };
}

export default { render };
