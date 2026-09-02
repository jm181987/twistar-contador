(() => {
  'use strict';

  const STORAGE_KEY = 'twistarSidebarCollapsed';
  const desktopQuery = window.matchMedia('(min-width: 821px)');
  const appShell = document.querySelector('.app-shell');
  const sidebar = document.getElementById('sidebar');
  const toggle = document.getElementById('sidebarToggle');
  const navList = document.getElementById('navList');

  if (!appShell || !sidebar || !toggle || !navList) return;

  let prefersCollapsed = false;
  try {
    prefersCollapsed = localStorage.getItem(STORAGE_KEY) === 'true';
  } catch (_) {}

  function decorateNavItems() {
    navList.querySelectorAll('.nav-item').forEach(item => {
      const title = item.querySelector('.nav-title')?.textContent?.trim();
      const category = item.querySelector('.nav-sub')?.textContent?.trim();
      if (title) {
        const label = category ? `${title} · ${category}` : title;
        item.setAttribute('aria-label', label);
        item.title = title;
      }
    });
  }

  function applyState() {
    const collapsed = desktopQuery.matches && prefersCollapsed;
    appShell.classList.toggle('sidebar-collapsed', collapsed);
    sidebar.classList.toggle('collapsed', collapsed);

    toggle.textContent = collapsed ? '⇥' : '⇤';
    toggle.setAttribute('aria-expanded', String(!collapsed));
    toggle.setAttribute('aria-label', collapsed ? 'Expandir columna de herramientas' : 'Contraer columna de herramientas');
    toggle.title = collapsed ? 'Expandir herramientas' : 'Contraer herramientas';
  }

  function persistPreference() {
    try {
      localStorage.setItem(STORAGE_KEY, String(prefersCollapsed));
    } catch (_) {}
  }

  toggle.addEventListener('click', () => {
    prefersCollapsed = !prefersCollapsed;
    persistPreference();
    applyState();
  });

  document.addEventListener('keydown', event => {
    if (event.key === '/' && desktopQuery.matches && prefersCollapsed) {
      prefersCollapsed = false;
      persistPreference();
      applyState();
    }
  }, true);

  if (typeof desktopQuery.addEventListener === 'function') {
    desktopQuery.addEventListener('change', applyState);
  } else if (typeof desktopQuery.addListener === 'function') {
    desktopQuery.addListener(applyState);
  }

  const observer = new MutationObserver(decorateNavItems);
  observer.observe(navList, { childList: true, subtree: true });

  decorateNavItems();
  applyState();
})();
