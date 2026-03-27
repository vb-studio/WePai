import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import AnimatedPage from '../components/AnimatedPage';
import { useStore } from '../store/useStore';
import { showPrompt, showConfirm, showAlert } from '../store/useModalStore';

// Utilities for formatting
const getFormattedDate = (isoString) => {
  if (!isoString) return 'Desconocido';
  const d = new Date(isoString);
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function Profile() {
  const { perfil, updateProfile, goals, addGoal, deleteGoal, records, registros } = useStore();

  // Combine logic for Historical PR vs Current Record
  const combinedRecords = useMemo(() => {
    const list = [];
    
    // Find the current/last weight for each exercise
    const recents = {};
    const sortedRegistros = [...registros].sort((a,b) => new Date(b.date) - new Date(a.date));
    
    sortedRegistros.forEach(reg => {
      if (reg.exercises) {
        reg.exercises.forEach(ej => {
          const key = ej.name.toLowerCase().trim();
          if (!recents[key]) {
            recents[key] = { weight: propsMaxWeight(ej), date: reg.date };
          }
        });
      }
    });

    Object.keys(records).forEach(key => {
      list.push({
        name: key.toUpperCase(),
        historical: { weight: records[key].weight, date: records[key].date },
        current: recents[key] ? { weight: recents[key].weight, date: recents[key].date } : null
      });
    });

    return list.sort((a, b) => b.historical.weight - a.historical.weight);
  }, [records, registros]);

  // Helper func: calculates the max weight of a specific exercise entry
  function propsMaxWeight(ej) {
    // Si viene como string o número simple
    if (ej.weight !== undefined) return parseFloat(ej.weight) || 0;
    // (Si la data en WePai guarda weight per set, habría que iterar, asumo un solo weight por ej)
    return 0;
  }

  // --- Handlers using Premium Modals ---
  
  const handleEditProfile = async () => {
    const newName = await showPrompt('Actualizar Nombre', 'Escribe tu nombre', perfil.nombre);
    if (!newName) return;
    const newWeight = await showPrompt('Actualizar Peso (kg)', 'Ej: 75.5', perfil.peso);
    if (!newWeight) return;
    const newHeight = await showPrompt('Actualizar Altura (cm)', 'Ej: 180', perfil.altura);
    
    if (newName && newWeight && newHeight) {
      updateProfile({ 
        nombre: newName.trim(), 
        peso: parseFloat(newWeight) || 0, 
        altura: parseFloat(newHeight) || 0 
      });
      showAlert('Perfil Actualizado', 'Tus datos se guardaron correctamente.');
    }
  };

  const handleAddGoal = async () => {
    const goalTitle = await showPrompt('Nueva Meta', 'Escribe tu objetivo');
    if (goalTitle?.trim()) {
      addGoal({
        id: Date.now().toString(),
        title: goalTitle,
        progress: 0,
        completed: false
      });
    }
  };

  const handleRemoveGoal = async (index) => {
    const confirm = await showConfirm('Eliminar meta', '¿Estás seguro de que deseas borrar este objetivo?');
    if (confirm) deleteGoal(index);
  };

  const bmi = perfil.peso > 0 && perfil.altura > 0 
    ? (perfil.peso / Math.pow(perfil.altura / 100, 2)).toFixed(1) 
    : '0.0';

  return (
    <AnimatedPage className="pb-32 bg-surface">
      <header className="fixed top-0 w-full z-40 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/20 dark:border-white/5">
        <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
          <h1 className="text-xl font-headline font-extrabold text-on-surface">Tu Perfil</h1>
          <button onClick={handleEditProfile} className="text-primary-container p-2 active:scale-95 transition-transform">
            <span className="material-symbols-outlined">edit_square</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-24">
        {/* Profile Card */}
        <section className="bg-surface-container-low dark:bg-[#1e1e1e] rounded-3xl p-6 shadow-sm mb-8 border border-outline-variant/30 dark:border-white/5">
          <div className="flex flex-col items-center mb-6">
            <div className="w-24 h-24 rounded-full signature-gradient flex items-center justify-center text-4xl font-headline font-black text-white shadow-xl shadow-primary-container/20 mb-4">
              {perfil.nombre ? perfil.nombre.charAt(0).toUpperCase() : 'W'}
            </div>
            <h2 className="text-2xl font-headline font-extrabold text-on-surface">
              {perfil.nombre || 'Atleta WePai'}
            </h2>
            <p className="text-sm font-label text-outline uppercase tracking-widest mt-1">Activo y Listo</p>
          </div>

          <div className="grid grid-cols-3 gap-4 border-t border-outline-variant/30 dark:border-white/5 pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-on-surface">{perfil.peso || 0}</p>
              <p className="text-xs uppercase tracking-wider text-outline">kg</p>
            </div>
            <div className="text-center border-x border-outline-variant/30 dark:border-white/5">
              <p className="text-2xl font-bold text-on-surface">{perfil.altura || 0}</p>
              <p className="text-xs uppercase tracking-wider text-outline">cm</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-container">{bmi}</p>
              <p className="text-xs uppercase tracking-wider text-outline">IMC</p>
            </div>
          </div>
        </section>

        {/* Goals */}
        <section className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-headline font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container">flag</span>
              Metas Actuales
            </h3>
            <button onClick={handleAddGoal} className="text-primary-container text-sm font-semibold flex items-center gap-1 active:scale-95 transition-transform bg-primary-container/10 px-3 py-1 rounded-full">
              <span className="material-symbols-outlined text-sm">add</span> Add
            </button>
          </div>
          
          <div className="space-y-3">
            {goals.map((g, i) => (
              <motion.div 
                layout
                key={i} 
                className="bg-surface-container-low dark:bg-[#1e1e1e] rounded-2xl p-4 flex justify-between items-center border border-outline-variant/30 dark:border-white/5"
              >
                <div>
                  <h4 className="font-semibold text-on-surface">{g.title}</h4>
                  <div className="w-full bg-surface-container-high rounded-full h-1.5 mt-2 overflow-hidden">
                    <div className="signature-gradient h-1.5 rounded-full" style={{ width: `${g.progress}%` }}></div>
                  </div>
                </div>
                <button onClick={() => handleRemoveGoal(i)} className="p-2 text-red-500/70 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors">
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </motion.div>
            ))}
            {goals.length === 0 && (
              <div className="text-center p-6 border-2 border-dashed border-outline-variant/50 rounded-2xl">
                <p className="text-outline text-sm">No tienes metas establecidas.</p>
              </div>
            )}
          </div>
        </section>

        {/* Récords Histórico vs Actual */}
        <section>
          <div className="mb-6 flex items-baseline justify-between">
            <h3 className="text-lg font-headline font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container">emoji_events</span>
              Récords
            </h3>
            <span className="text-xs text-outline uppercase tracking-wider">Histórico vs Actual</span>
          </div>

          <div className="space-y-4">
            {combinedRecords.map((r, i) => (
              <div key={i} className="bg-surface-container-low dark:bg-[#1e1e1e] rounded-[20px] p-5 shadow-sm border border-outline-variant/30 dark:border-white/5">
                <h4 className="font-headline font-bold text-on-surface mb-4 pb-3 border-b border-outline-variant/30 dark:border-white/5 tracking-tight">{r.name}</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Histórico Column */}
                  <div className="flex flex-col border-r border-outline-variant/30 dark:border-white/5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#FF6B00] mb-1">Récord (PR)</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-on-surface">{r.historical.weight}</span>
                      <span className="text-xs font-semibold text-outline">kg</span>
                    </div>
                    <span className="text-xs text-outline mt-1 font-medium">{getFormattedDate(r.historical.date)}</span>
                  </div>

                  {/* Actual Column */}
                  <div className="flex flex-col pl-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Actual (Último)</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-on-surface-variant">
                        {r.current ? r.current.weight : '—'}
                      </span>
                      {r.current && <span className="text-xs font-semibold text-outline">kg</span>}
                    </div>
                    <span className="text-xs text-outline mt-1 font-medium">
                      {r.current ? getFormattedDate(r.current.date) : 'Sin repetición'}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {combinedRecords.length === 0 && (
              <div className="text-center p-8 bg-surface-container-low dark:bg-[#1e1e1e] rounded-[20px] border border-outline-variant/30 dark:border-white/5">
                <span className="material-symbols-outlined text-4xl text-outline/50 mb-3">bar_chart</span>
                <p className="text-sm font-medium text-on-surface">Todavía no hay récords.</p>
                <p className="text-xs text-outline mt-1">Registra ejercicios para ver tus PRs aquí.</p>
              </div>
            )}
          </div>
        </section>

      </main>
    </AnimatedPage>
  );
}
