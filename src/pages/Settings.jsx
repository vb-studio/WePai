import React from 'react';
import AnimatedPage from '../components/AnimatedPage';
import { useStore } from '../store/useStore';
import { showConfirm, showAlert } from '../store/useModalStore';

export default function Settings() {
  const { settings, toggleDarkMode, updateSetting, toggleSetting, resetData } = useStore();

  const handleResetData = async () => {
    const confirm = await showConfirm(
      '¿Borrar todos los datos?', 
      'Esta acción eliminará tus rutinas, historial de entrenamientos, perfil y todos los récords de forma permanente. No se puede deshacer.'
    );
    if (confirm) {
      resetData();
      showAlert('Datos borrados', 'Tu aplicación ha sido restaurada a su estado de fábrica.');
    }
  };

  const handleImport = async () => {
    showAlert('Opción en desarrollo', 'La importación de datos se migrará a React pronto.');
  };

  const handleExport = async () => {
    showAlert('Opción en desarrollo', 'La exportación de datos temporalmente desactivada por refactorización.');
  };

  return (
    <AnimatedPage className="pb-32 bg-surface">
      <header className="fixed top-0 w-full z-40 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/20 dark:border-white/5">
        <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
          <h1 className="text-xl font-headline font-extrabold text-on-surface">Ajustes</h1>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-6 pt-24 space-y-8">
        {/* Aspecto Visual */}
        <section>
          <h3 className="text-xs font-bold text-outline uppercase tracking-widest mb-4">Aspecto Visual</h3>
          <div className="bg-surface-container-low dark:bg-[#1e1e1e] rounded-[20px] overflow-hidden border border-outline-variant/30 dark:border-white/5">
            <div className="p-4 flex justify-between items-center border-b border-outline-variant/30 dark:border-white/5">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-on-surface-variant">dark_mode</span>
                <span className="font-semibold text-on-surface">Modo Oscuro</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={settings.modoOscuro} onChange={toggleDarkMode} />
                <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
              </label>
            </div>
          </div>
        </section>

        {/* Entrenamiento */}
        <section>
          <h3 className="text-xs font-bold text-outline uppercase tracking-widest mb-4">Entrenamiento</h3>
          <div className="bg-surface-container-low dark:bg-[#1e1e1e] rounded-[20px] overflow-hidden border border-outline-variant/30 dark:border-white/5">
            
            <div className="p-4 flex justify-between items-center border-b border-outline-variant/30 dark:border-white/5">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-on-surface-variant">timer</span>
                <div>
                  <span className="block font-semibold text-on-surface">Descanso (s)</span>
                </div>
              </div>
              <select 
                value={settings.temporizadorDescanso}
                onChange={(e) => updateSetting('temporizadorDescanso', parseInt(e.target.value))}
                className="bg-transparent border-none text-right font-medium text-primary-container pr-8 focus:ring-0 cursor-pointer"
              >
                <option value="30">30s</option>
                <option value="60">60s</option>
                <option value="90">90s</option>
                <option value="120">120s</option>
                <option value="180">180s</option>
              </select>
            </div>

            <div className="p-4 flex justify-between items-center border-b border-outline-variant/30 dark:border-white/5">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-on-surface-variant">volume_up</span>
                <span className="font-semibold text-on-surface">Sonido de Timer</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={settings.sonido} onChange={() => toggleSetting('sonido')} />
                <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
              </label>
            </div>
            
            <div className="p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-on-surface-variant">vibration</span>
                <span className="font-semibold text-on-surface">Vibración</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={settings.vibracion} onChange={() => toggleSetting('vibracion')} />
                <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
              </label>
            </div>
          </div>
        </section>

        {/* Base de Datos */}
        <section>
          <h3 className="text-xs font-bold text-outline uppercase tracking-widest mb-4">Base de Datos</h3>
          <div className="bg-surface-container-low dark:bg-[#1e1e1e] rounded-[20px] overflow-hidden border border-outline-variant/30 dark:border-white/5">
            <button onClick={handleExport} className="w-full p-4 flex justify-between items-center border-b border-outline-variant/30 dark:border-white/5 active:bg-surface-container transition-colors text-left">
              <div className="flex items-center gap-3 text-on-surface">
                <span className="material-symbols-outlined text-on-surface-variant">download</span>
                <span className="font-semibold text-on-surface">Exportar Datos (JSON)</span>
              </div>
            </button>
            <button onClick={handleImport} className="w-full p-4 flex justify-between items-center border-b border-outline-variant/30 dark:border-white/5 active:bg-surface-container transition-colors text-left">
              <div className="flex items-center gap-3 text-on-surface">
                <span className="material-symbols-outlined text-on-surface-variant">upload</span>
                <span className="font-semibold text-on-surface">Importar Datos</span>
              </div>
            </button>
            <button onClick={handleResetData} className="w-full p-4 flex justify-between items-center active:bg-red-50/50 dark:active:bg-red-900/10 transition-colors text-left">
              <div className="flex items-center gap-3 text-red-500">
                <span className="material-symbols-outlined">delete_forever</span>
                <span className="font-semibold">Borrar todos los datos</span>
              </div>
            </button>
          </div>
        </section>

      </main>
    </AnimatedPage>
  );
}
