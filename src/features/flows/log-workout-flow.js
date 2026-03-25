/**
 * Log Workout Flow - Conductor Pattern
 * Step-by-step flow for logging a workout session
 */

import { 
  getState, 
  addRegistro, 
  updateRecord, 
  setCurrentDayExercises,
  clearCurrentDayExercises,
  saveState,
  playBeep,
  vibrate
} from '../store.js';
import { calculateSetVolume, calculateTotalVolume } from '../calculations/volume.js';
import { calculateCurrentStreak } from '../calculations/streak.js';

const FLOW_STEPS = {
  SELECT_ROUTINE: 'select-routine',
  EXERCISES: 'exercises',
  LOGGING: 'logging',
  REST_TIMER: 'rest-timer',
  SUMMARY: 'summary'
};

let flowState = {
  currentStep: FLOW_STEPS.SELECT_ROUTINE,
  selectedRoutineId: null,
  isFreeTraining: false,
  date: new Date().toISOString().split('T')[0],
  exercises: [],
  currentExerciseIndex: 0,
  timerRunning: false,
  timerSeconds: 0,
  timerInterval: null
};

/**
 * Reset flow state
 */
export function resetFlow() {
  if (flowState.timerInterval) {
    clearInterval(flowState.timerInterval);
  }
  
  flowState = {
    currentStep: FLOW_STEPS.SELECT_ROUTINE,
    selectedRoutineId: null,
    isFreeTraining: false,
    date: new Date().toISOString().split('T')[0],
    exercises: [],
    currentExerciseIndex: 0,
    timerRunning: false,
    timerSeconds: 0,
    timerInterval: null
  };
}

/**
 * Get current flow state
 * @returns {Object}
 */
export function getFlowState() {
  return { ...flowState };
}

/**
 * Get current step
 * @returns {string}
 */
export function getCurrentStep() {
  return flowState.currentStep;
}

/**
 * Get available routines
 * @returns {Array}
 */
export function getAvailableRoutines() {
  const state = getState();
  return state.rutinas || [];
}

/**
 * Get current exercise
 * @returns {Object|null}
 */
export function getCurrentExercise() {
  return flowState.exercises[flowState.currentExerciseIndex] || null;
}

/**
 * Get previous exercise
 * @returns {Object|null}
 */
export function getPreviousExercise() {
  if (flowState.currentExerciseIndex > 0) {
    return flowState.exercises[flowState.currentExerciseIndex - 1];
  }
  return null;
}

/**
 * Step 1: Select routine
 * @param {string|null} routineId - ID of routine or null for free training
 * @returns {{success: boolean, nextStep: string}}
 */
export function stepSelectRoutine(routineId) {
  flowState.selectedRoutineId = routineId;
  flowState.isFreeTraining = !routineId;
  
  if (routineId) {
    const routines = getAvailableRoutines();
    const routine = routines.find(r => r.id === routineId);
    
    if (routine) {
      flowState.exercises = routine.exercises.map(ex => ({
        name: ex.name,
        sets: ex.sets,
        reps: ex.reps,
        weight: 0,
        setsArr: Array(ex.sets).fill(false)
      }));
    }
  } else {
    flowState.exercises = [];
  }
  
  setCurrentDayExercises(flowState.exercises);
  flowState.currentStep = FLOW_STEPS.EXERCISES;
  
  return { success: true, nextStep: FLOW_STEPS.EXERCISES };
}

/**
 * Step 2: Add exercise to workout
 * @param {Object} exercise - {name, sets, reps, weight}
 * @returns {{success: boolean}}
 */
export function stepAddExercise(exercise) {
  flowState.exercises.push({
    name: exercise.name,
    sets: Math.min(10, Math.max(1, exercise.sets || 3)),
    reps: Math.min(100, Math.max(1, exercise.reps || 10)),
    weight: Math.max(0, exercise.weight || 0),
    setsArr: Array(exercise.sets || 3).fill(false)
  });
  
  setCurrentDayExercises(flowState.exercises);
  return { success: true };
}

/**
 * Step 2: Update exercise
 * @param {number} index
 * @param {Object} updates
 * @returns {{success: boolean}}
 */
export function stepUpdateExercise(index, updates) {
  if (index < 0 || index >= flowState.exercises.length) {
    return { success: false };
  }
  
  const exercise = flowState.exercises[index];
  
  if (updates.sets !== undefined && updates.sets !== exercise.sets) {
    updates.setsArr = Array(updates.sets).fill(false);
  }
  
  flowState.exercises[index] = { ...exercise, ...updates };
  setCurrentDayExercises(flowState.exercises);
  
  return { success: true };
}

/**
 * Step 2: Remove exercise
 * @param {number} index
 * @returns {{success: boolean}}
 */
export function stepRemoveExercise(index) {
  if (index < 0 || index >= flowState.exercises.length) {
    return { success: false };
  }
  
  flowState.exercises.splice(index, 1);
  
  if (flowState.currentExerciseIndex >= flowState.exercises.length) {
    flowState.currentExerciseIndex = Math.max(0, flowState.exercises.length - 1);
  }
  
  setCurrentDayExercises(flowState.exercises);
  return { success: true };
}

/**
 * Step 3: Complete a set
 * @param {number} exerciseIndex
 * @param {number} setIndex
 * @returns {{success: boolean, setsCompleted: number, totalSets: number}}
 */
export function stepCompleteSet(exerciseIndex, setIndex) {
  if (exerciseIndex < 0 || exerciseIndex >= flowState.exercises.length) {
    return { success: false };
  }
  
  const exercise = flowState.exercises[exerciseIndex];
  
  if (setIndex < 0 || setIndex >= exercise.setsArr.length) {
    return { success: false };
  }
  
  exercise.setsArr[setIndex] = !exercise.setsArr[setIndex];
  
  const setsCompleted = exercise.setsArr.filter(s => s).length;
  
  playBeep();
  vibrate(50);
  
  setCurrentDayExercises(flowState.exercises);
  
  return { 
    success: true, 
    setsCompleted,
    totalSets: exercise.sets
  };
}

/**
 * Start rest timer
 * @param {number} seconds - Timer duration in seconds
 * @returns {{success: boolean}}
 */
export function stepStartTimer(seconds) {
  const state = getState();
  const timerDuration = seconds || state.settings?.temporizadorDescanso || 90;
  
  flowState.timerSeconds = timerDuration;
  flowState.timerRunning = true;
  flowState.currentStep = FLOW_STEPS.REST_TIMER;
  
  flowState.timerInterval = setInterval(() => {
    flowState.timerSeconds--;
    
    if (flowState.timerSeconds <= 0) {
      stepStopTimer();
      playBeep();
      vibrate(200);
    }
  }, 1000);
  
  return { success: true };
}

/**
 * Stop rest timer
 * @returns {{success: boolean}}
 */
export function stepStopTimer() {
  if (flowState.timerInterval) {
    clearInterval(flowState.timerInterval);
    flowState.timerInterval = null;
  }
  
  flowState.timerRunning = false;
  flowState.currentStep = FLOW_STEPS.EXERCISES;
  
  return { success: true };
}

/**
 * Skip timer
 * @returns {{success: boolean}}
 */
export function stepSkipTimer() {
  return stepStopTimer();
}

/**
 * Get timer remaining seconds
 * @returns {number}
 */
export function getTimerSeconds() {
  return flowState.timerSeconds;
}

/**
 * Check if timer is running
 * @returns {boolean}
 */
export function isTimerRunning() {
  return flowState.timerRunning;
}

/**
 * Go to next exercise
 * @returns {{success: boolean, hasNext: boolean}}
 */
export function stepNextExercise() {
  if (flowState.currentExerciseIndex < flowState.exercises.length - 1) {
    flowState.currentExerciseIndex++;
    return { success: true, hasNext: true };
  }
  
  return { success: true, hasNext: false };
}

/**
 * Go to previous exercise
 * @returns {{success: boolean, hasPrev: boolean}}
 */
export function stepPrevExercise() {
  if (flowState.currentExerciseIndex > 0) {
    flowState.currentExerciseIndex--;
    return { success: true, hasPrev: true };
  }
  
  return { success: true, hasPrev: false };
}

/**
 * Go to specific exercise
 * @param {number} index
 * @returns {{success: boolean}}
 */
export function stepGoToExercise(index) {
  if (index >= 0 && index < flowState.exercises.length) {
    flowState.currentExerciseIndex = index;
    return { success: true };
  }
  return { success: false };
}

/**
 * Finalize workout and save
 * @returns {{success: boolean, summary: Object, error?: string}}
 */
export function finalizeWorkout() {
  if (flowState.exercises.length === 0) {
    return { success: false, error: 'No hay ejercicios registrados' };
  }
  
  const totalVolume = calculateTotalVolume(
    flowState.exercises.map(ex => ({
      weight: ex.weight,
      reps: ex.reps
    }))
  );
  
  const completedSets = flowState.exercises.reduce((sum, ex) => {
    return sum + (ex.setsArr ? ex.setsArr.filter(s => s).length : 0);
  }, 0);
  
  const totalSets = flowState.exercises.reduce((sum, ex) => sum + ex.sets, 0);
  
  const registro = {
    date: flowState.date,
    datetime: new Date().toISOString(),
    exercises: flowState.exercises.map(ex => ({
      name: ex.name,
      sets: ex.sets,
      reps: ex.reps,
      weight: ex.weight
    }))
  };
  
  addRegistro(registro);
  
  flowState.exercises.forEach(ex => {
    if (ex.weight > 0) {
      updateRecord(ex.name, ex.weight);
    }
  });
  
  const state = getState();
  const workoutDates = state.registros.map(r => r.date);
  const currentStreak = calculateCurrentStreak(workoutDates);
  
  const summary = {
    totalVolume,
    completedSets,
    totalSets,
    exercisesCount: flowState.exercises.length,
    currentStreak,
    date: flowState.date
  };
  
  clearCurrentDayExercises();
  flowState.currentStep = FLOW_STEPS.SUMMARY;
  
  return { success: true, summary };
}

/**
 * Get workout summary
 * @returns {Object}
 */
export function getWorkoutSummary() {
  const totalVolume = calculateTotalVolume(
    flowState.exercises.map(ex => ({
      weight: ex.weight,
      reps: ex.reps
    }))
  );
  
  const completedSets = flowState.exercises.reduce((sum, ex) => {
    return sum + (ex.setsArr ? ex.setsArr.filter(s => s).length : 0);
  }, 0);
  
  const totalSets = flowState.exercises.reduce((sum, ex) => sum + ex.sets, 0);
  
  return {
    totalVolume,
    completedSets,
    totalSets,
    exercisesCount: flowState.exercises.length
  };
}

/**
 * Get step display info
 * @param {string} step
 * @returns {{title: string, description: string}}
 */
export function getStepInfo(step) {
  const steps = {
    [FLOW_STEPS.SELECT_ROUTINE]: {
      title: 'Seleccionar Rutina',
      description: 'Elige una rutina o entrenamiento libre'
    },
    [FLOW_STEPS.EXERCISES]: {
      title: 'Ejercicios',
      description: 'Registra tus ejercicios y series'
    },
    [FLOW_STEPS.REST_TIMER]: {
      title: 'Descanso',
      description: 'Descansa entre series'
    },
    [FLOW_STEPS.SUMMARY]: {
      title: 'Resumen',
      description: '¡Entrenamiento completado!'
    }
  };
  
  return steps[step] || { title: step, description: '' };
}

/**
 * Format timer display
 * @param {number} seconds
 * @returns {string}
 */
export function formatTimer(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
