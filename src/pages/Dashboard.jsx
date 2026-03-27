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
              <p className="font-label text-primary uppercase tracking-[0.05rem] text-[10px] font-bold mb-1">Resumen de Rendimiento</p>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-on-surface">
                Análisis <span className="text-primary-container">WePai</span>
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

        <div className="text-center text-on-surface-variant my-20">
          <p>La migración a React está en curso...</p>
        </div>
        
        {/* Floating action button */}
        <div className="fixed bottom-32 md:bottom-8 right-6 z-40">
          <Link to="/log" className="signature-gradient text-white px-5 py-3 rounded-full flex items-center gap-2 font-medium text-sm shadow-lg shadow-primary/20 hover:shadow-xl transition-all active:scale-95">
            <span className="material-symbols-outlined">add</span>
            Nuevo
          </Link>
        </div>
      </main>
    </AnimatedPage>
  );
}
