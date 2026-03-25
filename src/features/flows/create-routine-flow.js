/**
 * Create Routine Flow - Conductor Pattern
 * Step-by-step flow for creating a new routine
 */

import { addRoutine, updateRoutine, getState } from '../store.js';

const FLOW_STEPS = {
  NAME: 'name',
  DAYS: 'days',
  EXERCISES: 'exercises',
  REVIEW: 'review'
};

let flowState = {
  currentStep: FLOW_STEPS.NAME,
  routineName: '',
  selectedDays: [],
  exercises: [],
  editingId: null
};

/**
 * Reset flow state
 */
export function resetFlow() {
  flowState = {
    currentStep: FLOW_STEPS.NAME,
    routineName: '',
    selectedDays: [],
    exercises: [],
    editingId: null
  };
}

/**
 * Initialize flow for editing
 * @param {string} routineId - ID of routine to edit
 */
export function initEditFlow(routineId) {
  const state = getState();
  const routine = state.rutinas.find(r => r.id === routineId);
  
  if (routine) {
    flowState = {
      currentStep: FLOW_STEPS.NAME,
      routineName: routine.name,
      selectedDays: [...routine.days],
      exercises: [...routine.exercises],
      editingId: routineId
    };
  }
  
  return flowState;
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
 * Validate step 1: Name
 * @param {string} name
 * @returns {{valid: boolean, error?: string}}
 */
export function validateNameStep(name) {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'El nombre es obligatorio' };
  }
  if (name.trim().length < 2) {
    return { valid: false, error: 'El nombre debe tener al menos 2 caracteres' };
  }
  if (name.trim().length > 50) {
    return { valid: false, error: 'El nombre debe tener menos de 50 caracteres' };
  }
  return { valid: true };
}

/**
 * Step 1: Set routine name
 * @param {string} name
 * @returns {{success: boolean, error?: string, nextStep: string}}
 */
export function stepSetName(name) {
  const validation = validateNameStep(name);
  
  if (!validation.valid) {
    return { success: false, error: validation.error, nextStep: FLOW_STEPS.NAME };
  }
  
  flowState.routineName = name.trim();
  flowState.currentStep = FLOW_STEPS.DAYS;
  
  return { success: true, nextStep: FLOW_STEPS.DAYS };
}

/**
 * Validate step 2: Days
 * @param {string[]} days
 * @returns {{valid: boolean, error?: string}}
 */
export function validateDaysStep(days) {
  if (!days || days.length === 0) {
    return { valid: false, error: 'Selecciona al menos un día' };
  }
  return { valid: true };
}

/**
 * Step 2: Set selected days
 * @param {string[]} days
 * @returns {{success: boolean, error?: string, nextStep: string}}
 */
export function stepSetDays(days) {
  const validation = validateDaysStep(days);
  
  if (!validation.valid) {
    return { success: false, error: validation.error, nextStep: FLOW_STEPS.DAYS };
  }
  
  flowState.selectedDays = days;
  flowState.currentStep = FLOW_STEPS.EXERCISES;
  
  return { success: true, nextStep: FLOW_STEPS.EXERCISES };
}

/**
 * Step 3: Add exercise to routine
 * @param {Object} exercise - {name, sets, reps}
 * @returns {{success: boolean}}
 */
export function stepAddExercise(exercise) {
  const name = exercise.name ? exercise.name.trim() : '';
  
  flowState.exercises.push({
    name: name,
    sets: Math.min(10, Math.max(1, exercise.sets || 3)),
    reps: Math.min(100, Math.max(1, exercise.reps || 10))
  });
  
  return { success: true };
}

/**
 * Step 3: Update exercise
 * @param {number} index
 * @param {Object} exercise
 * @returns {{success: boolean}}
 */
export function stepUpdateExercise(index, exercise) {
  if (index < 0 || index >= flowState.exercises.length) {
    return { success: false, error: 'Índice de ejercicio inválido' };
  }
  
  flowState.exercises[index] = {
    ...flowState.exercises[index],
    name: exercise.name?.trim() || flowState.exercises[index].name,
    sets: Math.min(10, Math.max(1, exercise.sets || 3)),
    reps: Math.min(100, Math.max(1, exercise.reps || 10))
  };
  
  return { success: true };
}

/**
 * Step 3: Remove exercise
 * @param {number} index
 * @returns {{success: boolean}}
 */
export function stepRemoveExercise(index) {
  if (index < 0 || index >= flowState.exercises.length) {
    return { success: false };
  }
  
  flowState.exercises.splice(index, 1);
  return { success: true };
}

/**
 * Go to review step
 * @returns {{success: boolean, nextStep: string}}
 */
export function stepGoToReview() {
  flowState.currentStep = FLOW_STEPS.REVIEW;
  return { success: true, nextStep: FLOW_STEPS.REVIEW };
}

/**
 * Go back to previous step
 * @returns {{success: boolean, previousStep: string}}
 */
export function stepGoBack() {
  if (flowState.currentStep === FLOW_STEPS.NAME) {
    return { success: false, previousStep: FLOW_STEPS.NAME };
  }
  
  if (flowState.currentStep === FLOW_STEPS.DAYS) {
    flowState.currentStep = FLOW_STEPS.NAME;
    return { success: true, previousStep: FLOW_STEPS.NAME };
  }
  
  if (flowState.currentStep === FLOW_STEPS.EXERCISES) {
    flowState.currentStep = FLOW_STEPS.DAYS;
    return { success: true, previousStep: FLOW_STEPS.DAYS };
  }
  
  if (flowState.currentStep === FLOW_STEPS.REVIEW) {
    flowState.currentStep = FLOW_STEPS.EXERCISES;
    return { success: true, previousStep: FLOW_STEPS.EXERCISES };
  }
  
  return { success: false };
}

/**
 * Finalize and save routine
 * @returns {{success: boolean, routine?: Object, error?: string}}
 */
export function finalizeRoutine() {
  if (!flowState.routineName) {
    return { success: false, error: 'Nombre es obligatorio' };
  }
  
  if (flowState.selectedDays.length === 0) {
    return { success: false, error: 'Selecciona al menos un día' };
  }
  
  const routine = {
    name: flowState.routineName,
    days: flowState.selectedDays,
    exercises: flowState.exercises.filter(ex => ex.name.trim())
  };
  
  try {
    if (flowState.editingId) {
      updateRoutine(flowState.editingId, routine);
    } else {
      addRoutine(routine);
    }
    
    const result = { ...routine, id: flowState.editingId || Date.now().toString() };
    resetFlow();
    
    return { success: true, routine: result };
  } catch (error) {
    return { success: false, error: 'Error al guardar la rutina' };
  }
}

/**
 * Get step display info
 * @param {string} step
 * @returns {{title: string, stepNum: number, totalSteps: number}}
 */
export function getStepInfo(step) {
  const steps = {
    [FLOW_STEPS.NAME]: { title: 'Nombre de la rutina', stepNum: 1 },
    [FLOW_STEPS.DAYS]: { title: 'Días de la semana', stepNum: 2 },
    [FLOW_STEPS.EXERCISES]: { title: 'Ejercicios', stepNum: 3 },
    [FLOW_STEPS.REVIEW]: { title: 'Revisar y guardar', stepNum: 4 }
  };
  
  return {
    ...steps[step],
    totalSteps: 4
  };
}
