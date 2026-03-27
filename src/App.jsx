import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import BottomNav from './components/BottomNav';
import AnimatedPage from './components/AnimatedPage';

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
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <React.Suspense fallback={<div className="page-loading"><span className="material-symbols-outlined text-4xl animate-spin">sync</span></div>}>
          <AnimatedRoutes />
        </React.Suspense>
        <BottomNav />
        <Modal />
      </div>
    </BrowserRouter>
  );
}
