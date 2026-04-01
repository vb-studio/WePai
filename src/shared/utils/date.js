/**
 * Date Utilities
 */

/**
 * Format date to ISO string (YYYY-MM-DD)
 * @param {Date} date
 * @returns {string}
 */
export function toISODate(date = new Date()) {
  return date.toISOString().split('T')[0];
}

/**
 * Format date to display string
 * @param {string|Date} date
 * @param {Object} options
 * @returns {string}
 */
export function formatDate(date, options = {}) {
  const d = new Date(date);
  const defaultOptions = { month: 'short', day: 'numeric' };
  return d.toLocaleDateString('es-ES', { ...defaultOptions, ...options });
}

/**
 * Format date to full display
 * @param {string|Date} date
 * @returns {string}
 */
export function formatDateFull(date) {
  const d = new Date(date);
  return d.toLocaleDateString('es-ES', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  });
}

/**
 * Get day name from date
 * @param {string|Date} date
 * @returns {string}
 */
export function getDayName(date) {
  const d = new Date(date);
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return days[d.getDay()];
}

/**
 * Get short day name
 * @param {string|Date} date
 * @returns {string}
 */
export function getShortDayName(date) {
  const d = new Date(date);
  return d.toLocaleDateString('es-ES', { weekday: 'short' }).slice(0, 3).toUpperCase();
}

/**
 * Check if date is today
 * @param {string|Date} date
 * @returns {boolean}
 */
export function isToday(date) {
  const d = new Date(date);
  const today = new Date();
  return d.toDateString() === today.toDateString();
}

/**
 * Check if date is in the past
 * @param {string|Date} date
 * @returns {boolean}
 */
export function isPast(date) {
  const d = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
}

/**
 * Check if date is in the future
 * @param {string|Date} date
 * @returns {boolean}
 */
export function isFuture(date) {
  const d = new Date(date);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return d > today;
}

/**
 * Get date range for carousel (days before and after today)
 * @param {number} daysBefore
 * @param {number} daysAfter
 * @returns {Date[]}
 */
export function getDateRange(daysBefore = 7, daysAfter = 6) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dates = [];
  
  for (let i = -daysBefore; i <= daysAfter; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date);
  }
  
  return dates;
}

/**
 * Get start of week (Monday)
 * @param {Date} date
 * @returns {Date}
 */
export function getStartOfWeek(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

/**
 * Get end of week (Sunday)
 * @param {Date} date
 * @returns {Date}
 */
export function getEndOfWeek(date = new Date()) {
  const start = getStartOfWeek(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return end;
}

/**
 * Get dates between two dates
 * @param {Date} start
 * @param {Date} end
 * @returns {Date[]}
 */
export function getDatesBetween(start, end) {
  const dates = [];
  const current = new Date(start);
  
  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
}

/**
 * Format time (HH:mm)
 * @param {number} hours
 * @param {number} minutes
 * @returns {string}
 */
export function formatTime(hours, minutes) {
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Parse time string to minutes
 * @param {string} time - HH:mm format
 * @returns {number} Total minutes
 */
export function parseTimeToMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}
