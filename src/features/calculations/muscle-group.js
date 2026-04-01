/**
 * Muscle Group Calculator - Pure Functions
 * No side effects. All functions return computed values.
 */

const MUSCLE_KEYWORDS = {
  pecho: ['press banca', 'banca', 'pectoral', 'cruce', 'pulover', 'fly', 'apertura', 'compression'],
  espalda: ['remo', 'dominada', 'jalón', 'jalon', 'row', 'lat', 'remoj', 'tirón', 'tiron', 'polea'],
  piernas: ['sentadilla', 'peso muerto', 'pierna', 'curl', 'extensión', 'exten', 'gemelo', 'prensa', 'hack', 'búlgara', 'lunges', 'zancada', 'hip thrust', 'squat', 'deadlift', 'leg press', 'leg curl', 'calf'],
  hombros: ['press militar', 'elevación', 'elevacion', 'shoulder', 'face pull', 'arnold', 'deltoide', 'deltoid', 'lateral', 'frontal', 'posterior', ' Raises'],
  brazos: ['curl', 'tríceps', 'triceps', 'bíceps', 'biceps', 'martillo', 'hammer', 'extensión', 'exten', 'patada', 'skull crusher', ' overhead', 'dip']
};

/**
 * Detect muscle group from exercise name
 * @param {string} exerciseName - Name of the exercise
 * @returns {string} Muscle group key or 'otros'
 */
export function detectMuscleGroup(exerciseName) {
  const name = exerciseName.toLowerCase();
  
  for (const [muscle, keywords] of Object.entries(MUSCLE_KEYWORDS)) {
    if (keywords.some(k => name.includes(k))) {
      return muscle;
    }
  }
  
  return 'otros';
}

/**
 * Get muscle group display name
 * @param {string} key - Muscle group key
 * @returns {string} Display name in Spanish
 */
export function getMuscleGroupName(key) {
  const names = {
    pecho: 'Pecho',
    espalda: 'Espalda',
    piernas: 'Piernas',
    hombros: 'Hombros',
    brazos: 'Brazos',
    otros: 'Otros'
  };
  return names[key] || key;
}

/**
 * Calculate muscle group levels from workout history
 * @param {Array<{exercises: Array<{name: string, sets: number, reps: number}>}>} registros - Array of workout records
 * @returns {Object} Level for each muscle group (0-10)
 */
export function calculateMuscleLevels(registros) {
  const counts = {
    pecho: 0,
    espalda: 0,
    piernas: 0,
    hombros: 0,
    brazos: 0
  };
  
  registros.forEach(reg => {
    if (reg.exercises && Array.isArray(reg.exercises)) {
      reg.exercises.forEach(ex => {
        const muscle = detectMuscleGroup(ex.name);
        if (counts[muscle] !== undefined) {
          counts[muscle] += ex.sets * ex.reps;
        }
      });
    }
  });
  
  const maxCount = Math.max(...Object.values(counts), 1);
  const levels = {};
  
  for (const [group, count] of Object.entries(counts)) {
    const percent = (count / maxCount) * 100;
    levels[group] = Math.round(percent / 10);
  }
  
  return levels;
}

/**
 * Get muscle group percentages
 * @param {Object} counts - Raw counts from calculateMuscleLevels
 * @returns {Object} Percentages for each muscle group
 */
export function getMusclePercentages(counts) {
  const total = Object.values(counts).reduce((sum, val) => sum + val, 0);
  if (total === 0) {
    return { pecho: 0, espalda: 0, piernas: 0, hombros: 0, brazos: 0 };
  }
  
  const percentages = {};
  for (const [group, count] of Object.entries(counts)) {
    percentages[group] = Math.round((count / total) * 100);
  }
  return percentages;
}

/**
 * Group exercises by muscle group
 * @param {Array<{name: string, sets: number, reps: number, weight: number}>} exercises
 * @returns {Object} Exercises grouped by muscle
 */
export function groupExercisesByMuscle(exercises) {
  const grouped = {
    pecho: [],
    espalda: [],
    piernas: [],
    hombros: [],
    brazos: [],
    otros: []
  };
  
  exercises.forEach(ex => {
    const muscle = detectMuscleGroup(ex.name);
    grouped[muscle].push(ex);
  });
  
  return grouped;
}

/**
 * Calculate volume per muscle group
 * @param {Array<{name: string, sets: number, reps: number, weight: number}>} exercises
 * @returns {Object} Volume per muscle group
 */
export function calculateVolumePerMuscle(exercises) {
  const volume = {
    pecho: 0,
    espalda: 0,
    piernas: 0,
    hombros: 0,
    brazos: 0,
    otros: 0
  };
  
  exercises.forEach(ex => {
    const muscle = detectMuscleGroup(ex.name);
    const setVolume = ex.sets * ex.reps * ex.weight;
    volume[muscle] += setVolume;
  });
  
  return volume;
}
