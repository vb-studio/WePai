import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const DEFAULT_SETTINGS = {
  unidades: 'metric',
  temporizadorDescanso: 90,
  sonido: true,
  vibracion: true,
  recordatorio: false,
  horaRecordatorio: '09:00',
  pantallaInicio: 'dashboard',
  modoOscuro: false
};

const DEFAULT_STATE = {
  perfil: {
    nombre: '',
    peso: 0,
    altura: 0,
    objetivo: ''
  },
  registros: [],
  rutinas: [],
  records: {},
  goals: [],
  restDays: [],
  selectedDate: new Date().toISOString().split('T')[0],
  currentDayExercises: [],
  workoutDraft: null,
  settings: { ...DEFAULT_SETTINGS }
};

export const useStore = create(
  persist(
    (set, get) => ({
      ...DEFAULT_STATE,

      // --- Perfil ---
      updateProfile: (profileData) => set((state) => ({
        perfil: { ...state.perfil, ...profileData }
      })),

      // --- Settings ---
      toggleDarkMode: () => {
        const isDark = !get().settings.modoOscuro;
        set((state) => ({
          settings: { ...state.settings, modoOscuro: isDark }
        }));
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },
      updateSetting: (key, value) => set((state) => ({
        settings: { ...state.settings, [key]: value }
      })),
      toggleSetting: (key) => set((state) => ({
        settings: { ...state.settings, [key]: !state.settings[key] }
      })),

      // --- Registros ---
      addRegistro: (registro) => set((state) => ({
        registros: [...state.registros, registro]
      })),
      updateRegistro: (date, exercises) => set((state) => {
        const registros = [...state.registros];
        const idx = registros.findIndex(r => r.date === date);
        if (idx >= 0) {
          registros[idx].exercises = exercises;
        } else {
          registros.push({ date, datetime: new Date().toISOString(), exercises });
        }
        return { registros };
      }),
      setRestDay: (date) => set((state) => {
        const registros = [...state.registros];
        const idx = registros.findIndex(r => r.date === date);
        if (idx >= 0) {
          registros[idx].isRest = true;
        } else {
          registros.push({ date, datetime: new Date().toISOString(), isRest: true, exercises: [] });
        }
        return { registros };
      }),
      removeRestDay: (date) => set((state) => ({
        registros: state.registros.filter(r => r.date !== date)
      })),
      toggleRestDayInWeek: (dayName) => set((state) => {
        const restDays = state.restDays || [];
        if (restDays.includes(dayName)) {
          return { restDays: restDays.filter(d => d !== dayName) };
        }
        return { restDays: [...restDays, dayName] };
      }),

      // --- Records ---
      updateRecord: (exerciseName, weight) => set((state) => {
        const key = exerciseName.toLowerCase();
        const currentRecord = state.records[key];
        if (!currentRecord || weight > currentRecord.weight) {
          return {
            records: {
              ...state.records,
              [key]: { weight, date: new Date().toISOString() }
            }
          };
        }
        return state;
      }),

      // --- Rutinas ---
      addRoutine: (routine) => set((state) => ({
        rutinas: [...state.rutinas, { ...routine, id: routine.id || Date.now().toString() }]
      })),
      updateRoutine: (id, routineData) => set((state) => ({
        rutinas: state.rutinas.map(r => r.id === id ? { ...r, ...routineData } : r)
      })),
      deleteRoutine: (id) => set((state) => ({
        rutinas: state.rutinas.filter(r => r.id !== id)
      })),

      // --- Goals ---
      addGoal: (goal) => set((state) => ({
        goals: [...state.goals, goal]
      })),
      deleteGoal: (index) => set((state) => ({
        goals: state.goals.filter((_, i) => i !== index)
      })),

      // --- Current Workout ---
      setCurrentDayExercises: (exercises) => set({ currentDayExercises: exercises }),
      addCurrentDayExercise: (exercise) => set((state) => ({
        currentDayExercises: [...state.currentDayExercises, exercise]
      })),
      updateCurrentDayExercise: (index, updates) => set((state) => {
        const exercises = [...state.currentDayExercises];
        exercises[index] = { ...exercises[index], ...updates };
        return { currentDayExercises: exercises };
      }),
      removeCurrentDayExercise: (index) => set((state) => ({
        currentDayExercises: state.currentDayExercises.filter((_, i) => i !== index)
      })),
      clearCurrentDayExercises: () => set({ currentDayExercises: [] }),

      // --- Drafts ---
      saveWorkoutDraft: (draft) => set({
        workoutDraft: { ...draft, savedAt: new Date().toISOString() }
      }),
      clearWorkoutDraft: () => set({ workoutDraft: null }),

      // --- Reset & Export/Import ---
      resetData: () => set(() => DEFAULT_STATE),
      importData: (data) => set(() => ({ ...DEFAULT_STATE, ...data }))
    }),
    {
      name: 'wepai_state', // Key in localStorage
    }
  )
);
