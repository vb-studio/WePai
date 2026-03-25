/**
 * Entity Models - Type definitions for the app
 */

/**
 * @typedef {Object} Perfil
 * @property {string} nombre
 * @property {number} peso
 * @property {number} altura
 * @property {string} objetivo
 */

/**
 * @typedef {Object} Ejercicio
 * @property {string} name
 * @property {number} sets
 * @property {number} reps
 * @property {number} weight
 * @property {boolean[]} [setsArr]
 */

/**
 * @typedef {Object} Registro
 * @property {string} date
 * @property {string} datetime
 * @property {Ejercicio[]} exercises
 */

/**
 * @typedef {Object} Record
 * @property {number} weight
 * @property {string} date
 */

/**
 * @typedef {Object} Rutina
 * @property {string} id
 * @property {string} name
 * @property {string[]} days
 * @property {Ejercicio[]} exercises
 */

/**
 * @typedef {Object} Meta
 * @property {string} exercise
 * @property {number} weight
 */

/**
 * @typedef {Object} Settings
 * @property {string} unidades
 * @property {number} temporizadorDescanso
 * @property {boolean} sonido
 * @property {boolean} vibracion
 * @property {boolean} recordatorio
 * @property {string} horaRecordatorio
 * @property {string} pantallaInicio
 * @property {boolean} modoOscuro
 */

/**
 * @typedef {Object} AppState
 * @property {string} currentScreen
 * @property {Perfil} perfil
 * @property {Registro[]} registros
 * @property {Rutina[]} rutinas
 * @property {Record} records
 * @property {Meta[]} goals
 * @property {string} selectedDate
 * @property {Ejercicio[]} currentDayExercises
 * @property {Settings} settings
 */

export const SCHEMA_VERSION = '1.0.0';

export const OBJETIVOS = [
  { value: 'Fuerza', label: 'Fuerza' },
  { value: 'Hipertrofia', label: 'Hipertrofia' },
  { value: 'Definición', label: 'Definición' },
  { value: 'Resistencia', label: 'Resistencia' }
];

export const DIAS_SEMANA = [
  'Lunes',
  'Martes', 
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo'
];

export const DIAS_CORTOS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export const UNIDADES = {
  METRIC: 'metric',
  IMPERIAL: 'imperial'
};
