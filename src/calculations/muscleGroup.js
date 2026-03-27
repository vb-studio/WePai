function normalizeString(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .trim();
}

export const MUSCLE_KEYWORDS = {
  // Ejercicios Compuestos y de Pecho
  'pecho': ['pecho', 'pectoral', 'banca', 'chest', 'aperturas', 'flexiones', 'pushup', 'lagartijas', 'cruces', 'fondos'],
  'espalda': ['espalda', 'dorsal', 'remo', 'back', 'pull', 'dominadas', 'jalon', 'pullover'],
  'hombros': ['hombro', 'shoulder', 'militar', 'laterales', 'frontales', 'pajaros', 'press frances'],
  
  // Piernas
  'cuadriceps': ['cuadricep', 'quad', 'sentadilla', 'squat', 'prensa', 'extension'],
  'isquiosurales': ['isquio', 'femoral', 'curl pierna', 'peso muerto rumano', 'pmr'],
  'gluteos': ['gluteo', 'hip thrust', 'puente'],
  'gemelos': ['gemelo', 'pantorrilla', 'calf'],
  
  // Brazos
  'biceps': ['bicep', 'curl', 'martillo'],
  'triceps': ['tricep', 'extension tricep', 'press frances', 'copa'],
  
  // Core
  'abdominales': ['abs', 'abdominal', 'crunch', 'plancha', 'core', 'rueda', 'elevacion piernas']
};

export function detectMuscleGroup(exerciseName) {
  const normName = normalizeString(exerciseName);
  
  // Check exact matches or substrings
  for (const [group, keywords] of Object.entries(MUSCLE_KEYWORDS)) {
    for (const keyword of keywords) {
      if (normName.includes(normalizeString(keyword))) {
        return group; // 'pecho', 'espalda', etc.
      }
    }
  }
  
  return 'otros';
}

// Map groups to a display color via Tailwind classes
export const MUSCLE_COLORS = {
  'pecho': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  'espalda': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  'hombros': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  'cuadriceps': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  'isquiosurales': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
  'gluteos': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
  'gemelos': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  'biceps': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
  'triceps': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
  'abdominales': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  'otros': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
};

/**
 * Calculates a level 0-10 based on volume (Sets x Reps x Weight)
 * Si el peso es 0 (ej. peso corporal), usamos un peso nominal de 10
 */
export function calculateMuscleLevels(registros) {
  const volumes = {};

  registros.forEach(registro => {
    if (registro.isRest || !registro.exercises) return;

    registro.exercises.forEach(ej => {
      const group = detectMuscleGroup(ej.name);
      if (group !== 'otros') {
        const sets = parseFloat(ej.sets) || 0;
        const reps = parseFloat(ej.reps) || 0;
        // Nominal weight for bodyweight exercises to not equal 0 volume
        const weight = parseFloat(ej.weight) || 10; 
        
        const volume = sets * reps * weight;
        
        volumes[group] = (volumes[group] || 0) + volume;
      }
    });
  });

  // Convert volume to a 0-10 level scale log-linearly to make early levels easier
  // Volume of ~5000 = Level 10 (configurable baseline)
  const MAX_VOLUME_BASELINE = 10000; 

  const levels = {};
  Object.keys(MUSCLE_KEYWORDS).forEach(g => {
    const vol = volumes[g] || 0;
    if (vol === 0) {
      levels[g] = 0;
    } else {
      // Curve: Math.log10 makes progression slow down at higher levels
      // For level 10: vol = baseline
      let rawLvl = (Math.log10(vol + 10) / Math.log10(MAX_VOLUME_BASELINE)) * 10;
      levels[g] = Math.min(10, Math.max(0, parseFloat(rawLvl.toFixed(1))));
    }
  });

  return levels;
}
