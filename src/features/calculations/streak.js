/**
 * Streak Engine - Pure Functions
 * No side effects. All functions return computed values.
 */

/**
 * Check if two dates are consecutive (1 day apart)
 * @param {string|Date} date1 - First date (ISO string or Date)
 * @param {string|Date} date2 - Second date (ISO string or Date)
 * @returns {boolean}
 */
export function isConsecutive(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  
  const diffTime = Math.abs(d2 - d1);
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays === 1;
}

/**
 * Check if dates are the same day
 * @param {string|Date} date1 
 * @param {string|Date} date2 
 * @returns {boolean}
 */
export function isSameDay(date1, date2) {
  const d1 = new Date(date1).toISOString().split('T')[0];
  const d2 = new Date(date2).toISOString().split('T')[0];
  return d1 === d2;
}

/**
 * Calculate current streak from workout dates
 * @param {string[]} workoutDates - Array of ISO date strings
 * @returns {number} Current streak count in days
 */
export function calculateCurrentStreak(workoutDates) {
  if (!workoutDates || workoutDates.length === 0) return 0;
  
  const uniqueDates = [...new Set(workoutDates)].sort().reverse();
  if (uniqueDates.length === 0) return 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let streak = 0;
  
  for (let i = 0; i < uniqueDates.length; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const checkDateStr = checkDate.toISOString().split('T')[0];
    
    if (uniqueDates.includes(checkDateStr)) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

/**
 * Check if streak is broken
 * @param {string} lastWorkoutDate - ISO date string of last workout
 * @param {string|Date} [today=new Date()] - Current date to check against
 * @returns {boolean}
 */
export function checkStreakBroken(lastWorkoutDate, today = new Date()) {
  const last = new Date(lastWorkoutDate);
  const current = new Date(today);
  
  last.setHours(0, 0, 0, 0);
  current.setHours(0, 0, 0, 0);
  
  const diffTime = current - last;
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays > 1;
}

/**
 * Get workout dates within this week
 * @param {Array<{date: string}>} workouts - Array of workout objects
 * @returns {string[]} Array of date strings
 */
export function getWorkoutDatesThisWeek(workouts) {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + 1);
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  return workouts
    .filter(w => {
      const workoutDate = new Date(w.date);
      return workoutDate >= startOfWeek && workoutDate <= endOfWeek;
    })
    .map(w => w.date);
}

/**
 * Calculate maximum streak from workout history
 * @param {string[]} workoutDates - Array of ISO date strings
 * @returns {number} Maximum streak achieved
 */
export function calculateMaxStreak(workoutDates) {
  if (!workoutDates || workoutDates.length === 0) return 0;
  
  const uniqueDates = [...new Set(workoutDates)].sort();
  if (uniqueDates.length === 0) return 0;
  
  let maxStreak = 1;
  let currentStreak = 1;
  
  for (let i = 1; i < uniqueDates.length; i++) {
    if (isConsecutive(uniqueDates[i - 1], uniqueDates[i])) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }
  
  return maxStreak;
}

/**
 * Get streak status message
 * @param {number} streak - Current streak count
 * @returns {string} Status message
 */
export function getStreakMessage(streak) {
  if (streak === 0) {
    return 'Comienza tu racha registrando entrenamientos';
  } else if (streak === 1) {
    return '¡Has started tu racha!';
  } else if (streak < 7) {
    return `Estás en racha. ¡Mantén el ritmo!`;
  } else if (streak < 30) {
    return `¡Increíble racha de ${streak} días!`;
  } else {
    return `¡Leyenda! ${streak} días consecutivos`;
  }
}
