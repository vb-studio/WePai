import React from 'react';
import { Link } from 'react-router-dom';
import AnimatedPage from '../components/AnimatedPage';
import { useStore } from '../store/useStore';

export default function Dashboard() {
  const { perfil, rutinas, registros } = useStore();

  return (
    <AnimatedPage>
      <header className="lg:hidden bg-[#fcf9f8]/80 dark:bg-[#1c1b1b]/80 backdrop-blur-xl fixed top-0 w-full z-50">
        <div className="flex justify-between items-center px-6 py-4 w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black tracking-tighter text-[#1c1b1b] dark:text-white font-['Manrope']">WePai</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/profile" className="text-[#FF6B00] hover:opacity-80 transition-opacity">
              <span className="material-symbols-outlined text-2xl">person</span>
            </Link>
            <Link to="/settings" className="text-[#FF6B00] hover:opacity-80 transition-opacity">
              <span className="material-symbols-outlined text-2xl">settings</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-24 pb-32">
        <section className="mb-12">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div>
              <p className="font-label text-primary uppercase tracking-[0.05rem] text-[10px] font-bold mb-1">Tu progreso</p>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-on-surface">
                Resultados <span className="text-primary-container">WePai</span>
              </h1>
            </div>
            <div className="flex flex-col items-end">
              <span className="headline text-4xl font-bold text-on-surface">
                {perfil.peso > 0 ? (
                  <>{perfil.peso}<span className="text-lg text-outline ml-1 font-medium">kg</span></>
                ) : (
                  <>—<span className="text-lg text-outline ml-1 font-medium">kg</span></>
                )}
              </span>
              <p className="font-label text-xs text-outline uppercase tracking-wider">Peso Actual</p>
            </div>
          </div>
        </section>

        {/* Goals / Stats summary */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/20">
            <span className="material-symbols-outlined text-primary mb-2 text-3xl">fitness_center</span>
            <h3 className="text-3xl font-black text-on-surface">{rutinas.length}</h3>
            <p className="text-sm text-on-surface-variant font-medium">Rutinas activas</p>
          </div>
          <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/20">
            <span className="material-symbols-outlined text-green-600 mb-2 text-3xl">trending_up</span>
            <h3 className="text-3xl font-black text-on-surface">75%</h3>
            <p className="text-sm text-on-surface-variant font-medium">Meta semanal</p>
          </div>
          <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/20">
            <span className="material-symbols-outlined text-orange-600 mb-2 text-3xl">history</span>
            <h3 className="text-3xl font-black text-on-surface">{registros.length}</h3>
            <p className="text-sm text-on-surface-variant font-medium">Sesiones totales</p>
          </div>
        </section>

        {/* Recent activity list */}
        <section className="mb-12">
          <h2 className="text-xl font-headline font-bold mb-6 text-on-surface">Actividad Reciente</h2>
          <div className="space-y-4">
            {registros.slice(0, 3).reverse().map((reg, i) => (
              <div key={i} className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">event_note</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface">{new Date(reg.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })}</h4>
                    <p className="text-xs text-on-surface-variant uppercase font-semibold">{reg.exercises?.length || 0} Ejercicios registrados</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-outline">chevron_right</span>
              </div>
            ))}
            {registros.length === 0 && (
              <p className="text-center text-on-surface-variant p-10 bg-surface-container-lowest rounded-3xl border-2 border-dashed border-outline-variant/30">
                Empieza hoy mismo tu primer entrenamiento.
              </p>
            )}
          </div>
        </section>
        
        {/* Floating action button */}
        <div className="fixed bottom-32 md:bottom-8 right-6 z-40">
          <Link to="/log" className="signature-gradient text-white px-5 py-3 rounded-full flex items-center gap-2 font-medium text-sm shadow-lg shadow-primary/20 hover:shadow-xl transition-all active:scale-95">
            <span className="material-symbols-outlined">add</span>
            Nuevo Entreno
          </Link>
        </div>
      </main>
    </AnimatedPage>
  );
}
