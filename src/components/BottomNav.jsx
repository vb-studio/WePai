import React from 'react';
import { NavLink } from 'react-router-dom';

export default function BottomNav() {
  const navItems = [
    { name: 'Registro', path: '/log', icon: 'edit_note' },
    { name: 'Dashboard', path: '/', icon: 'dashboard' },
    { name: 'Rutinas', path: '/routines', icon: 'fitness_center' },
    { name: 'Coach', path: '/coach', icon: 'psychology' },
  ];

  return (
    <nav className="mobile-nav fixed bottom-0 w-full z-50 rounded-t-[24px] bg-[#fcf9f8]/90 dark:bg-[#1c1b1b]/90 backdrop-blur-2xl border-t border-[#e2bfb0]/15 dark:border-[#49454f]/15 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] flex justify-around items-center px-4 pb-8 pt-4 md:hidden">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `nav-item flex flex-col items-center justify-center py-2 transition-colors active:scale-90 duration-300 ${
              isActive
                ? 'text-[#FF6B00]'
                : 'text-[#1c1b1b]/60 dark:text-white/60 hover:text-[#FF6B00]'
            }`
          }
        >
          <span className="material-symbols-outlined text-2xl">{item.icon}</span>
          <span className="font-label text-[10px] mt-1">{item.name}</span>
        </NavLink>
      ))}
    </nav>
  );
}
