import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedPage from '../components/AnimatedPage';
import { useStore } from '../store/useStore';
import { showAlert } from '../store/useModalStore';

export default function Log() {
  const navigate = useNavigate();
  const { addRegistro } = useStore();
  const [exercise, setExercise] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');

  const handleSave = () => {
    if (!exercise || !sets || !reps || !weight) {
      showAlert('Campos incompletos', 'Por favor llena todos los campos para registrar el ejercicio.');
      return;
    }

    const newLog = {
      date: new Date().toISOString().split('T')[0],
      datetime: new Date().toISOString(),
      exercises: [
        { name: exercise, sets: parseInt(sets), reps: parseInt(reps), weight: parseFloat(weight) }
      ]
    };

    addRegistro(newLog);
    showAlert('¡Guardado!', 'Tu entrenamiento ha sido registrado exitosamente.');
    navigate('/');
  };

  return (
    <AnimatedPage className="pb-32">
      <header className="fixed top-0 w-full z-40 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/20">
        <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
          <h1 className="text-xl font-headline font-extrabold text-on-surface">Registrar Entreno</h1>
          <button onClick={() => navigate(-1)} className="text-primary p-2">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-6 pt-24">
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-outline mb-2">Ejercicio</label>
            <input 
              type="text" 
              placeholder="Ej: Press de Banca"
              value={exercise}
              onChange={(e) => setExercise(e.target.value)}
              className="w-full p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-on-surface focus:ring-2 focus:ring-primary/50 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-outline mb-2">Series</label>
              <input 
                type="number" 
                placeholder="0"
                value={sets}
                onChange={(e) => setSets(e.target.value)}
                className="w-full p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-on-surface focus:ring-2 focus:ring-primary/50 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-outline mb-2">Reps</label>
              <input 
                type="number" 
                placeholder="0"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                className="w-full p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-on-surface focus:ring-2 focus:ring-primary/50 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-outline mb-2">Peso (kg)</label>
              <input 
                type="number" 
                placeholder="0"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-on-surface focus:ring-2 focus:ring-primary/50 outline-none transition-all"
              />
            </div>
          </div>

          <button 
            onClick={handleSave}
            className="w-full py-4 mt-8 rounded-2xl signature-gradient text-white font-bold text-lg shadow-xl shadow-primary/20 active:scale-[0.98] transition-all"
          >
            Guardar Entrenamiento
          </button>
        </div>
      </main>
    </AnimatedPage>
  );
}
