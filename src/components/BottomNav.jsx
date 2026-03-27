import React from 'react';
import { NavLink } from 'react-router-dom';

export default function BottomNav() {
  const navItems = [
    { to: '/log', icon: 'edit_square', label: 'Registro' },
    { to: '/', icon: 'grid_view', label: 'Dashboard' },
    { to: '/routines', icon: 'splitscreen', label: 'Rutinas' },
    { to: '/coach', icon: 'psychology', label: 'Coach', special: true },
  ];

  return (
    <nav className="fixed bottom-0 w-full max-w-[430px] h-[84px] bg-white dark:bg-black/40 border-t border-border dark:border-white/5 flex items-stretch px-2 pb-5 z-50 backdrop-blur-xl">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => `
            flex-1 flex flex-col items-center justify-center gap-1 group relative transition-all
            ${isActive && !item.special ? 'after:content-[""] after:absolute after:top-1 after:w-5 after:h-0.5 after:bg-primary after:rounded-full' : ''}
          `}
        >
          {({ isActive }) => (
            <>
              {item.special ? (
                <div className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-300
                  ${isActive ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-primary-bg text-primary'}
                `}>
                  <span className="material-symbols-outlined !text-[18px]">
                    {item.icon}
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wide">
                    Coach
                  </span>
                </div>
              ) : (
                <span className={`
                  material-symbols-outlined !text-[22px] transition-colors duration-200
                  ${isActive ? 'text-primary' : 'text-text-soft'}
                `}>
                  {item.icon}
                </span>
              )}
              {!item.special && (
                <span className={`
                  text-[9px] font-bold uppercase tracking-widest transition-colors duration-200
                  ${isActive ? 'text-primary' : 'text-text-soft'}
                `}>
                  {item.label}
                </span>
              )}
              {item.special && isActive && (
                <span className="text-[9px] font-bold uppercase tracking-widest text-primary mt-0.5">IA</span>
              )}
              {item.special && !isActive && (
                <span className="text-[9px] font-black uppercase tracking-widest text-primary mt-0.5">IA</span>
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
