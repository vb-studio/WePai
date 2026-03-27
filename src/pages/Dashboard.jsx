import React from 'react';
import { Link } from 'react-router-dom';
import AnimatedPage from '../components/AnimatedPage';
import { useStore } from '../store/useStore';

export default function Dashboard() {
  const { perfil, rutinas, registros } = useStore();

  return (
    <AnimatedPage className="pb-32 bg-cream">
      <header className="fixed top-0 w-full max-w-[430px] z-40 bg-white/80 backdrop-blur-xl border-b border-border flex justify-between items-center px-6 py-4">
        <span className="app-title text-2xl font-black font-headline tracking-tighter text-text-dark">WePai</span>
        <div className="flex items-center gap-3">
          <Link to="/profile" className="w-9 h-9 rounded-full signature-gradient flex items-center justify-center text-white text-lg shadow-md shadow-primary/20">
            👤
          </Link>
          <Link to="/settings" className="w-9 h-9 rounded-full bg-beige-card flex items-center justify-center border border-border">
            <span className="material-symbols-outlined text-primary !text-[18px]">settings</span>
          </Link>
        </div>
      </header>

      <main className="px-6 pt-24 space-y-8">
        <section>
          <p className="text-[10px] font-bold text-primary uppercase tracking-[0.14em] mb-1">Tu progreso</p>
          <h1 className="text-[32px] font-extrabold font-headline leading-none text-text-dark">
            Resultados <br/>
            <span className="text-primary-light">WePai</span>
          </h1>
        </section>

        {/* Peso Card */}
        <div className="card-premium flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold font-headline text-text-dark">Peso Actual</h3>
            <p className="text-xs text-text-soft font-medium uppercase tracking-wider">Último registro hoy</p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-black font-headline text-primary">
              {perfil.weight || 75}<span className="text-sm font-bold text-text-soft ml-1">kg</span>
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <section className="grid grid-cols-2 gap-4">
          <div className="bg-primary-bg p-5 rounded-[24px] border border-primary-light/20 relative overflow-hidden group">
            <div className="absolute -right-2 -top-2 w-16 h-16 bg-primary/5 rounded-full group-hover:scale-110 transition-transform" />
            <span className="material-symbols-outlined text-primary text-xl mb-2">fitness_center</span>
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest leading-none mb-1">Rutinas</p>
            <h4 className="text-2xl font-black font-headline text-text-dark">{rutinas.length}</h4>
          </div>
          <div className="bg-[#EFFFFA] p-5 rounded-[24px] border border-[#BFFFEA] relative overflow-hidden group">
            <div className="absolute -right-2 -top-2 w-16 h-16 bg-green-500/5 rounded-full group-hover:scale-110 transition-transform" />
            <span className="material-symbols-outlined text-green-600 text-xl mb-2">trending_up</span>
            <p className="text-[10px] font-bold text-green-700 uppercase tracking-widest leading-none mb-1">Meta</p>
            <h4 className="text-2xl font-black font-headline text-text-dark">75%</h4>
          </div>
        </section>

        {/* Recientes */}
        <section>
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-lg font-extrabold font-headline text-text-dark">Actividad Reciente</h2>
            <Link to="/log" className="text-[10px] font-bold text-primary uppercase tracking-widest">Ver Todo</Link>
          </div>
          
          <div className="space-y-3">
            {registros.length === 0 ? (
              <div className="bg-beige-card border-[1.5px] border-dashed border-border p-8 rounded-[28px] text-center">
                <p className="text-sm text-text-soft font-medium italic">Tu historial está esperando tu primer entreno...</p>
              </div>
            ) : (
              registros.slice(0, 3).reverse().map((reg, i) => (
                <div key={i} className="card-premium !p-4 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-xl bg-primary-bg flex items-center justify-center text-primary">
                       <span className="material-symbols-outlined">event_note</span>
                     </div>
                     <div>
                       <h4 className="font-bold text-text-dark text-sm">{new Date(reg.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })}</h4>
                       <p className="text-[10px] text-text-soft uppercase font-bold tracking-wider">{reg.exercises?.length || 0} Ejercicios</p>
                     </div>
                   </div>
                   <span className="material-symbols-outlined text-text-soft !text-lg">chevron_right</span>
                </div>
              ))
            )}
          </div>
        </section>

        <div className="fixed bottom-32 right-6 md:static md:mt-8 md:flex md:justify-end">
          <Link to="/log" className="signature-gradient text-white flex items-center gap-2 px-6 py-4 rounded-full shadow-lg shadow-primary/25 active:scale-95 transition-all">
            <span className="material-symbols-outlined">add</span>
            <span className="font-bold uppercase tracking-widest text-[11px]">Nuevo Entreno</span>
          </Link>
        </div>
      </main>
    </AnimatedPage>
  );
}
