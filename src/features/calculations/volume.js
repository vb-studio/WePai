/**
 * Volume Calculator - Pure Functions
 * No side effects. All functions return computed values.
 */

/**
 * Calculate volume for a single set
 * @param {number} weight - Weight in kg
 * @param {number} reps - Number of repetitions
 * @returns {number} Volume (weight × reps)
 */
export function calculateSetVolume(weight, reps) {
  return weight * reps;
}

/**
 * Calculate total volume for multiple sets
 * @param {Array<{weight: number, reps: number, sets: number}>} sets - Array of set objects
 * @returns {number} Total volume
 */
export function calculateTotalVolume(sets) {
  return sets.reduce((total, set) => {
    return total + calculateSetVolume(set.weight, set.reps);
  }, 0);
}

/**
 * Calculate 1 Rep Max using Epley formula
 * 1RM = weight × (1 + reps/30)
 * @param {number} weight - Weight lifted
 * @param {number} reps - Number of reps performed
 * @returns {number} Estimated 1RM
 */
export function calculate1RMEpley(weight, reps) {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30) * 10) / 10;
}

/**
 * Calculate 1 Rep Max using Brzycki formula
 * 1RM = weight × (36 / (37 - reps))
 * @param {number} weight - Weight lifted
 * @param {number} reps - Number of reps performed
 * @returns {number} Estimated 1RM
 */
export function calculate1RMBrzycki(weight, reps) {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  if (reps >= 37) return weight * 10;
  return Math.round(weight * (36 / (37 - reps)) * 10) / 10;
}

/**
 * Calculate 1RM using default formula (Epley)
 * @param {number} weight - Weight lifted
 * @param {number} reps - Number of reps performed
 * @param {'epley'|'brzycki'} [formula='epley'] - Formula to use
 * @returns {number} Estimated 1RM
 */
export function calculate1RM(weight, reps, formula = 'epley') {
  if (formula === 'brzycki') {
    return calculate1RMBrzycki(weight, reps);
  }
  return calculate1RMEpley(weight, reps);
}

/**
 * Aggregate volume by muscle group
 * @param {Array<{name: string, sets: number, reps: number, weight: number}>} exercises
 * @returns {Object} Volume grouped by muscle (pecho, espalda, piernas, hombros, brazos)
 */
export function aggregateByMuscleGroup(exercises) {
  const muscleGroups = {
    pecho: ['press', 'banca', 'pectoral', 'cruce', 'pulover', 'fly'],
    espalda: ['remo', 'dominada', 'jalón', 'row', 'lat', 'remo'],
    piernas: ['sentadilla', 'peso muerto', 'pierna', 'curl', 'extensión', 'gemelo', 'prensa', 'hack'],
    hombros: ['press militar', 'elevación', ' shoulder', 'face pull', 'press', 'arnold'],
    brazos: ['curl', 'tríceps', 'bíceps', 'martillo', 'extensión', 'press banca']
  };

  const counts = {
    pecho: 0,
    espalda: 0,
    piernas: 0,
    hombros: 0,
    brazos: 0
  };

  exercises.forEach(ex => {
    const name = ex.name.toLowerCase();
    for (const [group, keywords] of Object.entries(muscleGroups)) {
      if (keywords.some(k => name.includes(k))) {
        counts[group] += ex.sets * ex.reps;
        break;
      }
    }
  });

  return counts;
}

/**
 * Calculate volume distribution percentages
 * @param {Object} muscleGroups - Output from aggregateByMuscleGroup
 * @returns {Object} Percentages for each muscle group
 */
export function calculateVolumeDistribution(muscleGroups) {
  const total = Object.values(muscleGroups).reduce((sum, val) => sum + val, 0);
  if (total === 0) return { pecho: 0, espalda: 0, piernas: 0, hombros: 0, brazos: 0 };
  
  const distribution = {};
  for (const [group, count] of Object.entries(muscleGroups)) {
    distribution[group] = Math.round((count / total) * 100);
  }
  return distribution;
}

/**
 * Compare current volume with previous session
 * @param {number} currentVolume - Current session volume
 * @param {number} previousVolume - Previous session volume
 * @returns {{diff: number, percent: number, direction: 'up'|'down'|'same'}}
 */
export function compareVolume(currentVolume, previousVolume) {
  if (previousVolume === 0) {
    return { diff: currentVolume, percent: 0, direction: 'same' };
  }
  
  const diff = currentVolume - previousVolume;
  const percent = Math.round((diff / previousVolume) * 100);
  
  let direction = 'same';
  if (diff > 0) direction = 'up';
  else if (diff < 0) direction = 'down';
  
  return { diff, percent, direction };
}
