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
  setTimeout(() => {
    const installBtn = document.getElementById('install-app-btn');
    if (installBtn) {
      installBtn.classList.remove('hidden');
      installBtn.classList.add('flex');
    }
  }, 500);

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });

  window.installApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        deferredPrompt = null;
      }
    } else {
      // Show instructions based on OS
      const isAndroid = /Android/i.test(navigator.userAgent);
      const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
      
      if (isIOS) {
        alert('Para instalar WePai en tu iPhone:\n\n1. Toca el botón Compartir (cuadrado con flecha)\n2. Desliza y busca "Agregar a pantalla de inicio"\n3. Toca "Agregar"');
      } else if (isAndroid) {
        alert('Para instalar WePai en tu Android:\n\n1. Toca los 3 puntos (menú)\n2. Toca "Agregar a pantalla de inicio"\n3. Toca "Agregar"');
      } else {
        alert('Para instalar en PC:\n\nChrome: Menú → "Instalar WePai"\nO busca "Agregar a pantalla de inicio" en el menú');
      }
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
