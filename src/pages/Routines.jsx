import React from 'react';
import AnimatedPage from '../components/AnimatedPage';
import { useStore } from '../store/useStore';
import { showConfirm } from '../store/useModalStore';

export default function Routines() {
  const { rutinas, deleteRoutine } = useStore();

  const handleDelete = async (id) => {
    const confirm = await showConfirm('¿Eliminar rutina?', 'Esta acción no se puede deshacer.');
    if (confirm) {
      deleteRoutine(id);
    }
  };

  return (
    <AnimatedPage className="pb-32">
      <header className="fixed top-0 w-full z-40 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/20">
        <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
          <h1 className="text-xl font-headline font-extrabold text-on-surface">Mis Rutinas</h1>
          <button className="text-primary-container p-2">
            <span className="material-symbols-outlined">add_circle</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rutinas.map((routine) => (
            <div key={routine.id} className="bg-surface-container-low p-6 rounded-[28px] border border-outline-variant/20 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-headline font-bold text-on-surface">{routine.name}</h3>
                <button onClick={() => handleDelete(routine.id)} className="text-red-500/70 p-1">
                  <span className="material-symbols-outlined text-xl">delete</span>
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {routine.exercises.map((ex, idx) => (
                  <span key={idx} className="bg-surface-container px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-on-surface-variant border border-outline-variant/10">
                    {ex}
                  </span>
                ))}
              </div>

              <button className="w-full mt-6 py-3 rounded-xl bg-primary/10 text-primary font-bold text-sm hover:bg-primary/20 transition-colors uppercase tracking-widest">
                Iniciar Entrenamiento
              </button>
            </div>
          ))}

          {rutinas.length === 0 && (
            <div className="col-span-full text-center p-20 border-2 border-dashed border-outline-variant/30 rounded-3xl">
              <span className="material-symbols-outlined text-5xl text-outline/30 mb-4 font-light">list_alt</span>
              <p className="text-on-surface-variant font-medium">No tienes ninguna rutina creada aún.</p>
            </div>
          )}
        </div>
      </main>
    </AnimatedPage>
  );
}
