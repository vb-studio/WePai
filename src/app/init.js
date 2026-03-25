/**
 * App Bootstrap
 * Initialize app: localStorage, theme, router
 */

import { loadState, applyDarkMode, getState } from '../features/store.js';
import { initRouter, navigate } from './router.js';

let deferredPrompt = null;

/**
 * Initialize PWA install listener
 */
function initPWAInstall() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const installBtn = document.getElementById('install-app-btn');
    if (installBtn) {
      installBtn.classList.remove('hidden');
      installBtn.classList.add('flex');
    }
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    const installBtn = document.getElementById('install-app-btn');
    if (installBtn) {
      installBtn.classList.add('hidden');
      installBtn.classList.remove('flex');
    }
  });

  window.installApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      deferredPrompt = null;
    }
  };
}

/**
 * Initialize the application
 */
export async function init() {
  try {
    console.log('🔄 Initializing WePai...');
    
    loadState();
    
    const state = getState();
    
    applyDarkMode();
    
    initPWAInstall();
    
    const appContainer = document.getElementById('app');
    if (!appContainer) {
      throw new Error('App container not found');
    }
    
    initRouter(appContainer);
    
    window.navigate = navigate;
    window.getState = getState;
    window.reloadPage = () => location.reload();
    
    console.log('✅ WePai initialized');
    
  } catch (error) {
    console.error('❌ Error initializing app:', error);
    showErrorScreen(error);
  }
}

/**
 * Show error screen
 */
function showErrorScreen(error) {
  const app = document.getElementById('app');
  if (app) {
    app.innerHTML = `
      <div class="min-h-screen flex items-center justify-center bg-surface">
        <div class="text-center p-8">
          <span class="material-symbols-outlined text-6xl text-red-500 mb-4">error</span>
          <h1 class="text-2xl font-bold text-on-surface mb-2">Error al cargar la app</h1>
          <p class="text-on-surface-variant mb-4">${error.message}</p>
          <button onclick="location.reload()" class="px-6 py-3 rounded-full signature-gradient text-white">
            Recargar
          </button>
        </div>
      </div>
    `;
  }
}

export default { init };
