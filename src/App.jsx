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
      <div className="app-container bg-surface min-h-screen">
        <React.Suspense fallback={<div className="page-loading"><span className="material-symbols-outlined text-4xl animate-spin">sync</span></div>}>
          <AnimatedRoutes />
        </React.Suspense>
        <BottomNav />
        <Modal />
      </div>
    </BrowserRouter>
  );
}
