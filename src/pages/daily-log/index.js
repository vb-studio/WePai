/**
 * Daily Log Page
 * Workout logging with log-workout-flow conductor
 */

import { getState, saveState, addRegistro, updateRecord } from '../../features/store.js';
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
  resetFlow
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
const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

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
        const dayOfWeek = dayNames[date.getDay()];
        const hasRoutine = state.rutinas.some(r => r.days.includes(dayOfWeek));
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const compareDate = new Date(date);
        compareDate.setHours(0, 0, 0, 0);
        const isPast = compareDate < today;
        const isFuture = compareDate > today;
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        let dayStyle = '';
        if (isSelected) {
          dayStyle = 'signature-gradient text-white shadow-lg scale-105';
        } else if (isTodayDate) {
          dayStyle = 'bg-primary-container/20 border-2 border-primary';
        } else if (isRest) {
          dayStyle = 'bg-blue-100 border-2 border-blue-300 text-blue-700';
        } else if (hasWorkout) {
          dayStyle = 'bg-green-100 border-2 border-green-300 text-green-700';
        } else if (hasRoutine) {
          dayStyle = 'bg-orange-100 dark:bg-orange-900/40 border-2 border-orange-300 dark:border-orange-600 text-orange-700 dark:text-orange-300';
        } else if (isFuture) {
          dayStyle = isWeekend ? 'bg-surface-container border-2 border-gray-400 text-on-surface hover:border-primary' : 'bg-surface-container text-on-surface hover:bg-primary-container/10';
        } else if (isPast) {
          dayStyle = 'bg-surface-container-highest opacity-40 text-on-surface-variant';
        } else {
          dayStyle = 'bg-surface-container-low opacity-50';
        }
        return `
          <div role="button" tabindex="-1" id="date-btn-${dateStr}" data-date="${dateStr}" 
            class="date-btn flex-shrink-0 flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-200 cursor-pointer ${dayStyle}" style="min-width: 60px;">
            <span class="font-label text-[8px] uppercase font-bold ${isSelected ? 'text-white' : ''}">${formatDate(date, { weekday: 'short' }).slice(0,3)}</span>
            <span class="font-headline text-xl font-bold ${isSelected ? 'text-white' : ''}">${date.getDate()}</span>
            ${isRest ? '<span class="material-symbols-outlined text-xs">bedtime</span>' : ''}
            ${hasWorkout && !isRest ? '<span class="material-symbols-outlined text-xs">fitness_center</span>' : ''}
            ${hasRoutine && !hasWorkout && !isRest ? '<span class="material-symbols-outlined text-xs">event_note</span>' : ''}
            ${isSelected ? '<div class="w-1.5 h-1.5 bg-white rounded-full"></div>' : ''}
          </div>
        `;
      }).join('')}
    </section>
  `;
}

function centerCarouselOnToday() {
  setTimeout(() => {
    setTimeout(() => {
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

function getYesterdayMuscleTip() {
  const state = getState();
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  const yesterdayReg = state.registros.find(r => r.date === yesterdayStr);
  
  const healthTips = [
    'Descansa entre 7-9 horas para una óptima recuperación muscular.',
    'Hidratarse con al menos 2 litros de agua al día mejora el rendimiento.',
    'Los días de descanso son tan importantes como los de entrenamiento.',
    'Una alimentación rica en proteínas ayuda a la recuperación muscular.',
    'El estiramiento post-entrenamiento mejora la flexibilidad y reduce lesiones.',
    'El descanso adecuado aumenta la producción de hormona del crecimiento.',
    'Incorporar carbohidratos complejos antes del entrenamiento mejora la energía.',
    'El sueño profundo es cuando los músculos se reparan y crecen.'
  ];
  
  if (!yesterdayReg || !yesterdayReg.exercises || yesterdayReg.exercises.length === 0) {
    const randomTip = healthTips[Math.floor(Math.random() * healthTips.length)];
    return {
      muscle: 'consejo de salud',
      tip: randomTip
    };
  }
  
  const muscleTips = [
    { muscles: ['pierna', 'piernas', 'cuadriceps', 'femoral', 'gemelos'], name: 'pierna', tip: 'Ayer trabajaste pierna con alta intensidad. Hoy tu cuerpo necesita reparar fibras musculares. Prioriza hidratación y proteína en tus comidas.' },
    { muscles: ['pecho', 'pectoral'], name: 'pecho', tip: 'Ayer trabajaste pecho. Considera estiramientos de pectorales y abdominales suaves hoy.' },
    { muscles: ['espalda', 'dorsal', 'lat'], name: 'espalda', tip: 'Ayer trabajaste espalda. Estiramientos de dorsales y movilidad de hombros te ayudará en la recuperación.' },
    { muscles: ['hombro', 'hombros', 'deltoides'], name: 'hombros', tip: 'Ayer trabajaste hombros. Estiramientos de deltoides y trapecios recomendada.' },
    { muscles: ['brazo', 'biceps', 'triceps'], name: 'brazos', tip: 'Ayer trabajaste brazos. Hidratación extra y proteína recomendada para la recuperación.' }
  ];
  
  const exerciseNames = yesterdayReg.exercises.map(ex => ex.name.toLowerCase()).join(' ');
  
  for (const mt of muscleTips) {
    if (mt.muscles.some(m => exerciseNames.includes(m))) {
      return { muscle: mt.name, tip: mt.tip };
    }
  }
  
  return {
    muscle: 'múltiples grupos musculares',
    tip: 'Ayer tuviste una sesión completa. Descansa bien, hidrátate y come proteínas para optimizar tu recuperación.'
  };
}
  
  const muscleTips = [
    { muscles: ['pierna', 'piernas', 'cuadriceps', 'femoral', 'gemelos'], name: 'pierna', tip: 'Ayer trabajaste pierna con alta intensidad. Hoy tu cuerpo necesita reparar fibras musculares. Prioriza hidratación y proteína en tus comidas.' },
    { muscles: ['pecho', 'pectoral'], name: 'pecho', tip: 'Ayer trabajaste pecho. Considera estiramientos de pectorales y abdominales suaves hoy.' },
    { muscles: ['espalda', 'dorsal', 'lat'], name: 'espalda', tip: 'Ayer trabajaste espalda. Estiramientos de dorsales y movilidad de hombros te ayudarán en la recuperación.' },
    { muscles: ['hombro', 'hombros', 'deltoides'], name: 'hombros', tip: 'Ayer trabajaste hombros. Estiramientos de deltoides y trapecios recomendada.' },
    { muscles: ['brazo', 'biceps', 'triceps'], name: 'brazos', tip: 'Ayer trabajaste brazos. Hidratación extra y proteína recomendada para la recuperación.' }
  ];
  
  const exerciseNames = yesterdayReg.exercises.map(ex => ex.name.toLowerCase()).join(' ');
  
  for (const mt of muscleTips) {
    if (mt.muscles.some(m => exerciseNames.includes(m))) {
      return { muscle: mt.name, tip: mt.tip };
    }
  }
  
  return {
    muscle: 'múltiples grupos musculares',
    tip: 'Ayer tuviste una sesión completa. Descansa bien, hidrátate y come proteínas para optimizar tu recuperación.'
  };
}

function getAIRecommendation() {
  const tips = [
    'Basándome en tus últimas sesiones, te recomiendo estiramientos de isquiotibiales y cuádriceps. También considera aumentar tu consumo de carbohidratos complejos para reponer glucógeno.',
    'Tu frecuencia cardíaca ha estado alta esta semana. Te sugiero incorporar 10 minutos de respiración profunda antes de dormir para mejorar tu recuperación.',
    'Has mejorado en press de banca. Considera aumentar ligeramente el peso mientras mantienes la técnica. No olvides trabajar los músculos auxiliares.',
    'Remember that consistency is key. Keep up the good work!',
    'Hoy sería un buen día para trabajar abdominales y core de forma ringan.'
  ];
  return tips[Math.floor(Math.random() * tips.length)];
}

function renderSelectRoutine() {
  const state = getState();
  const todayStr = toISODate();
  const todayDate = new Date();
  const todayDayName = dayNames[todayDate.getDay()];
  const registro = state.registros.find(r => r.date === todayStr);
  const todayRoutine = state.rutinas.find(r => r.days.includes(todayDayName));
  const isRest = registro && registro.isRest === true;
  const hasWorkout = registro && registro.exercises && registro.exercises.length > 0;
  
  const { muscle: yesterdayMuscle, tip: yesterdayTip } = getYesterdayMuscleTip();
  const aiRecommendation = getAIRecommendation();
  const formattedDate = todayDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric' });
  
  let mainContent = '';
  
  if (isRest) {
    mainContent = `
      <div class="section-eyebrow" style="padding: 0 24px 6px;">HOY</div>
      <div class="rest-hero" style="margin: 0 20px 16px;">
        <div class="rest-hero-top">
          <div class="rest-moon-icon">🌙</div>
          <div>
            <div class="rest-hero-title">Día de Descanso</div>
            <div class="rest-hero-sub">Recuperación activa · ${formattedDate}</div>
          </div>
        </div>
        <div class="rest-tip">
          Ayer trabajaste <strong>${yesterdayMuscle}</strong>. ${yesterdayTip}
        </div>
      </div>
      <div class="section-divider"></div>
      <div class="section-eyebrow">TU ASISTENTE IA</div>
      <div class="ai-card">
        <div class="ai-card-header">
          <div class="ai-avatar">🤖</div>
          <div>
            <div class="ai-name">WePai Coach</div>
            <span class="ai-badge">IA · Personalizado</span>
          </div>
        </div>
        <div class="ai-message">
          ${aiRecommendation}
        </div>
        <button class="ai-ask-btn" onclick="window.showToast('Próximamente disponible')">
          <span>Hacerle una pregunta al coach…</span>
        </button>
      </div>
    `;
  } else if (todayRoutine) {
    const muscleGroups = ['Pecho', 'Espalda', 'Hombros', 'Brazos', 'Pierna', 'Abdomen'];
    const routineMuscles = todayRoutine.exercises.slice(0, 3).map((ex, i) => muscleGroups[i % muscleGroups.length]);
    
    mainContent = `
      <div class="section-eyebrow" style="padding: 0 24px 6px;">HOY · ${formattedDate.toUpperCase()}</div>
      
      <div class="routine-header" style="padding: 0 24px 20px;">
        <div class="routine-title" style="font-family: 'Manrope', sans-serif; font-size: 26px; font-weight: 800; color: #1c1b1b; line-height: 1.1; margin-bottom: 4px;">¿Listo para<br>entrenar?</div>
        <div class="routine-meta" style="font-size: 13px; color: #A8998C; font-weight: 500;">Rutina asignada · <span style="color: #C45A0A; font-weight: 600;">${todayRoutine.exercises.length} ejercicios</span></div>
      </div>

      <div class="main-routine-card" onclick="window.selectRoutine('${todayRoutine.id}')" style="margin: 0 20px 12px; background: linear-gradient(135deg, #C45A0A 0%, #E8834A 100%); border-radius: 22px; padding: 20px; cursor: pointer; position: relative; overflow: hidden;">
        <div style="position: absolute; top: -30px; right: -30px; width: 120px; height: 120px; background: radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%); border-radius: 50%;"></div>
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px;">
          <div style="width: 44px; height: 44px; background: rgba(255,255,255,0.2); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px;">🏋️</div>
          <div style="width: 32px; height: 32px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
            <svg style="width: 14px; height: 14px; stroke: #fff; fill: none; stroke-width: 2.5;" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </div>
        </div>
        <div style="font-family: 'Manrope', sans-serif; font-size: 22px; font-weight: 800; color: #fff; margin-bottom: 4px;">${todayRoutine.name}</div>
        <div style="font-size: 13px; color: rgba(255,255,255,0.75);">${todayDayName} · ${todayRoutine.exercises.length} ejercicios · ~45 min</div>
        <div style="display: flex; gap: 8px; margin-top: 14px; flex-wrap: wrap;">
          ${routineMuscles.map(m => `<span style="background: rgba(255,255,255,0.2); border-radius: 20px; padding: 5px 12px; font-size: 11px; font-weight: 600; color: #fff;">${m}</span>`).join('')}
        </div>
      </div>

      <div class="section-divider"></div>
      <div class="section-eyebrow" style="margin-bottom: 12px;">ANALIZAR RUTINA</div>
      <div class="ai-card" style="margin: 0 20px 16px;">
        <div class="ai-card-header" style="padding: 16px 18px 12px; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid #EDE4D8;">
          <div class="ai-avatar" style="background: linear-gradient(135deg, #C45A0A 0%, #E8834A 100%);">🤖</div>
          <div>
            <div class="ai-name">WePai Coach</div>
            <span class="ai-badge">IA · Análisis</span>
          </div>
        </div>
        <button class="ai-ask-btn" style="margin: 16px 18px; background: #FFF0E6; border: 1.5px dashed #E8834A;" onclick="window.showToast('Próximamente disponible')">
          <span style="color: #C45A0A;">Analizar "${todayRoutine.name}"</span>
        </button>
      </div>
    `;
  } else {
    mainContent = `
      <div class="section-eyebrow" style="padding: 0 24px 6px;">HOY · ${formattedDate.toUpperCase()}</div>
      
      <div class="routine-header" style="padding: 0 24px 20px;">
        <div class="routine-title" style="font-family: 'Manrope', sans-serif; font-size: 26px; font-weight: 800; color: #1c1b1b; line-height: 1.1; margin-bottom: 4px;">¿Qué vas a<br>hacer hoy?</div>
        <div class="routine-meta" style="font-size: 13px; color: #A8998C;">Sin rutina asignada para ${todayDayName}</div>
      </div>

      <div class="section-divider"></div>
      <div class="section-eyebrow" style="margin-bottom: 12px;">CREAR ENTRENAMIENTO</div>
      <button onclick="window.selectRoutine(null)" style="margin: 0 20px 16px; padding: 15px 18px; background: transparent; border: 1.5px solid #EDE4D8; border-radius: 16px; display: flex; align-items: center; gap: 12px; cursor: pointer; width: calc(100% - 40px); text-align: left;">
        <div style="width: 38px; height: 38px; background: #F5EFE6; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px;">⚡</div>
        <div style="flex: 1;">
          <div style="font-size: 14px; font-weight: 600; color: #1c1b1b;">Entrenamiento Libre</div>
          <div style="font-size: 11.5px; color: #A8998C; margin-top: 1px;">Crea tus ejercicios</div>
        </div>
        <svg style="width: 14px; height: 14px; stroke: #A8998C; fill: none; stroke-width: 2;" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </button>
    `;
  }
  
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

        <div class="scroll-content" style="flex: 1; overflow-y: auto;">
          ${mainContent}
        </div>
      </main>
    </div>
  `;
  
  centerCarouselOnToday();
  
  window.selectRoutine = (routineId) => {
    stepSelectRoutine(routineId);
    renderExercises();
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
