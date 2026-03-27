import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import BottomNav from './components/BottomNav';
import AnimatedPage from './components/AnimatedPage';
import Modal from './components/Modal';
import { useStore } from './store/useStore';
import { useEffect } from 'react';

// Placholders
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Routines = React.lazy(() => import('./pages/Routines'));
const Log = React.lazy(() => import('./pages/Log'));
const Settings = React.lazy(() => import('./pages/Settings'));
const Coach = React.lazy(() => import('./pages/Coach'));

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/routines" element={<Routines />} />
        <Route path="/log" element={<Log />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/coach" element={<Coach />} />
        <Route path="*" element={<Dashboard />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  const isDarkMode = useStore(state => state.settings.modoOscuro);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <BrowserRouter>
      <div className="phone-container shadow-none md:shadow-2xl md:my-8 md:rounded-[44px]">
        {/* Status Bar Placeholder */}
        <div className="flex justify-between items-center px-8 py-4 shrink-0">
          <span className="text-xs font-bold font-headline">17:39</span>
          <div className="flex gap-1">
            <span className="material-symbols-outlined text-xs">signal_cellular_alt</span>
            <span className="material-symbols-outlined text-xs">wifi</span>
            <span className="material-symbols-outlined text-xs">battery_full</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
          <React.Suspense fallback={
            <div className="flex items-center justify-center h-full">
              <span className="material-symbols-outlined text-4xl animate-spin text-primary">sync</span>
            </div>
          }>
            <AnimatedRoutes />
          </React.Suspense>
        </div>
        
        <BottomNav />
        <Modal />
      </div>
    </BrowserRouter>
  );
}
