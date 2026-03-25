/**
 * App Bootstrap
 * Initialize app: localStorage, theme, router
 */

import { loadState, applyDarkMode, getState } from '../features/store.js';
import { initRouter, navigate } from './router.js';

/**
 * Initialize the application
 */
export async function init() {
  try {
    console.log('🔄 Initializing WePai...');
    
    loadState();
    
    const state = getState();
    
    applyDarkMode();
    
    const appContainer = document.getElementById('app');
    if (!appContainer) {
      throw new Error('App container not found');
    }
    
    initRouter(appContainer);
    
    window.navigate = navigate;
    window.getState = getState;
    
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
