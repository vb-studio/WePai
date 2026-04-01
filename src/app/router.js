/**
 * Router - SPA Client-Side Routing
 * Lazy loading with history API
 */

const ROUTES = {
  '/': 'dashboard',
  '/log': 'daily-log',
  '/routines': 'routines',
  '/profile': 'profile',
  '/settings': 'settings',
  '/coach': 'coach'
};

let currentRoute = null;
let routesElement = null;

/**
 * Initialize router
 * @param {HTMLElement} container - Container element for pages
 */
export function initRouter(container) {
  routesElement = container;
  
  window.addEventListener('popstate', handlePopState);
  
  // Use capture phase to handle links properly
  document.addEventListener('click', handleLinkClick, false);
  
  const path = window.location.pathname || '/';
  navigate(path, false);
  
  // Set initial navbar state
  const initialRoute = ROUTES[path] || 'dashboard';
  updateNavbar(initialRoute);
}

/**
 * Handle browser back/forward
 */
function handlePopState() {
  const path = window.location.pathname || '/';
  loadPage(path, false);
}

/**
 * Handle click on links
 */
function handleLinkClick(e) {
  const link = e.target.closest('[data-link]');
  if (!link) return;
  
  e.preventDefault();
  e.stopPropagation();
  const href = link.getAttribute('href');
  if (href) {
    navigate(href);
  }
}

/**
 * Navigate to a path
 * @param {string} path 
 * @param {boolean} [push=true] - Add to history
 */
export function navigate(path, push = true) {
  if (push) {
    window.history.pushState(null, '', path);
  }
  loadPage(path, push);
}

/**
 * Load a page
 */
async function loadPage(path, push = true) {
  const routeName = ROUTES[path];
  
  if (!routeName) {
    console.error(`Route not found: ${path}`);
    navigate('/');
    return;
  }
  
  if (currentRoute === routeName && !push) {
    return;
  }
  
  // Show loading state
  if (routesElement) {
    routesElement.innerHTML = '<div class="page-loading"><span class="material-symbols-outlined text-4xl animate-spin text-primary">sync</span></div>';
  }
  
  try {
    const module = await import(`../pages/${routeName}/index.js`);
    const page = module.default;
    
    if (!routesElement) {
      console.error('Router container not initialized');
      return;
    }
    
    routesElement.innerHTML = '<div class="page-loading">Cargando...</div>';
    
    await page.render(routesElement);
    
    currentRoute = routeName;
    
    updateNavbar(routeName);
    
    window.scrollTo(0, 0);
    
  } catch (error) {
    console.error(`Error loading page ${routeName}:`, error);
    if (!routesElement) return;
    routesElement.innerHTML = `
      <div class="page-error">
        <span class="material-symbols-outlined">error</span>
        <p>Error al cargar la página</p>
        <button onclick="navigate('/')">Volver al inicio</button>
      </div>
    `;
  }
}

/**
 * Update navbar active state
 */
function updateNavbar(routeName) {
  const path = Object.entries(ROUTES).find(([_, name]) => name === routeName)?.[0] || '/';
  
  document.querySelectorAll('.mobile-nav .nav-item').forEach(btn => {
    const href = btn.getAttribute('href');
    if (href === path) {
      btn.classList.add('nav-active');
    } else {
      btn.classList.remove('nav-active');
    }
  });
}

/**
 * Get current route name
 */
export function getCurrentRoute() {
  return currentRoute;
}

/**
 * Go to next page
 */
export function goTo(routeName) {
  const path = Object.entries(ROUTES).find(([_, name]) => name === routeName)?.[0];
  if (path) {
    navigate(path);
  }
}
