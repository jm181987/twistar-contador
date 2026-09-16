(() => {
  'use strict';

  const tools = [
    { id: 'clients', title: 'Tipos de clientes', subtitle: 'Perfiles y archivos comerciales', icon: '👥', href: 'clientes.html', category: 'Ventas' },
    { id: 'calendar', title: 'Calendario económico', subtitle: 'Eventos y noticias macro', icon: '🗓️', href: 'calen.html', category: 'Mercados' },
    { id: 'stocks', title: 'Acciones', subtitle: 'Mapa de calor de acciones', icon: '📊', href: 'acoes.html', category: 'Mercados' },
    { id: 'crypto', title: 'Cripto', subtitle: 'Cotizaciones y mapa de calor', icon: '₿', href: 'cripto.html', category: 'Mercados' },
    { id: 'forex', title: 'Forex', subtitle: 'Divisas y conversores', icon: '💱', href: 'forex.html', category: 'Mercados' },
    { id: 'indices', title: 'Índices', subtitle: 'Índices y gráficos de mercado', icon: '📈', href: 'indice.html', category: 'Mercados' },
    { id: 'profit', title: 'Ganancias', subtitle: 'Calculadora de lucro', icon: '💹', href: 'lucro.html', category: 'Calculadoras' },
    { id: 'market-profit', title: 'Lucro mercados', subtitle: 'Cálculos complementarios', icon: '🧮', href: 'lucromerc.html', category: 'Calculadoras' },
    { id: 'marketing', title: 'Marketing', subtitle: 'Calculadoras de marketing', icon: '📣', href: 'marketing.html', category: 'Marketing' },
    { id: 'rrhh', title: 'RRHH', subtitle: 'Conversión de números a letras', icon: '🧾', href: 'rrhh.html', category: 'Operaciones' },
    { id: 'news', title: 'Noticias', subtitle: 'Información financiera', icon: '📰', href: 'noticias.html', category: 'Información' },
    { id: 'sounds', title: 'Sonidos', subtitle: 'Biblioteca de audio', icon: '🔊', href: 'sonidos.html', category: 'Utilidades' },
    { id: 'draw', title: 'Sorteo', subtitle: 'Herramienta de sorteo', icon: '🎁', href: 'sorteo.html', category: 'Utilidades' },
    { id: 'chat', title: 'Chat', subtitle: 'Herramienta de conversación', icon: '💬', href: 'Chat.html', category: 'Utilidades' },
    { id: 'ai', title: 'Inteligencia Artificial', subtitle: 'Asistente externo', icon: '✦', href: 'https://talkai.info/pt/chat/', category: 'IA', external: true }
  ];

  const RECENT_KEY = 'twistarRecentToolsV2';
  const byId = id => document.getElementById(id);
  const appShell = byId('appShell');
  const navList = byId('navList');
  const cards = byId('cards');
  const searchInput = byId('searchInput');
  const homeView = byId('homeView');
  const frameWrap = byId('frameWrap');
  const frame = byId('toolFrame');
  const frameLoading = byId('frameLoading');
  const loadingTitle = byId('loadingTitle');
  const pageTitle = byId('pageTitle');
  const contextLabel = byId('contextLabel');
  const viewStatus = byId('viewStatus');
  const sidebar = byId('sidebar');
  const overlay = byId('overlay');
  const openBtn = byId('openBtn');
  const focusBtn = byId('focusBtn');
  const focusExit = byId('focusExit');
  const navCount = byId('navCount');
  const categoryFilters = byId('categoryFilters');
  const recentSection = byId('recentSection');
  const recentList = byId('recentList');
  const commandBackdrop = byId('commandBackdrop');
  const commandInput = byId('commandInput');
  const commandResults = byId('commandResults');
  const commandResultCount = byId('commandResultCount');
  const liveClock = byId('liveClock');

  let activeTool = null;
  let activeCategory = 'Todos';
  let commandMatches = [...tools];
  let commandIndex = 0;
  let recentIds = loadRecentIds();

  const escapeHtml = value => String(value).replace(/[&<>'"]/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[char]));

  function normalize(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  function toolSearchText(tool) {
    return normalize(`${tool.title} ${tool.subtitle} ${tool.category}`);
  }

  function loadRecentIds() {
    try {
      const parsed = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
      return Array.isArray(parsed) ? parsed.filter(id => tools.some(tool => tool.id === id)).slice(0, 6) : [];
    } catch (_) {
      return [];
    }
  }

  function saveRecentIds() {
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(recentIds)); } catch (_) {}
  }

  function addRecent(id) {
    recentIds = [id, ...recentIds.filter(item => item !== id)].slice(0, 6);
    saveRecentIds();
    renderRecent();
  }

  function navMarkup(tool) {
    return `
      <button class="nav-item" type="button" data-tool-id="${escapeHtml(tool.id)}">
        <span class="nav-icon" aria-hidden="true">${tool.icon}</span>
        <span class="nav-copy">
          <span class="nav-title">${escapeHtml(tool.title)}</span>
          <span class="nav-sub">${escapeHtml(tool.category)}</span>
        </span>
      </button>`;
  }

  function cardMarkup(tool) {
    return `
      <article class="card${tool.external ? ' external' : ''}" data-tool-id="${escapeHtml(tool.id)}" data-category="${escapeHtml(tool.category)}" tabindex="0" role="button" aria-label="Abrir ${escapeHtml(tool.title)}">
        <div class="card-top">
          <div class="card-icon" aria-hidden="true">${tool.icon}</div>
          <span class="card-arrow" aria-hidden="true">${tool.external ? '↗' : '→'}</span>
        </div>
        <div>
          <span class="card-category">${escapeHtml(tool.category)}</span>
          <h5>${escapeHtml(tool.title)}</h5>
          <p>${escapeHtml(tool.subtitle)}</p>
        </div>
      </article>`;
  }

  function recentMarkup(tool) {
    return `
      <button class="recent-chip" type="button" data-tool-id="${escapeHtml(tool.id)}">
        <span class="recent-icon" aria-hidden="true">${tool.icon}</span>
        <span><strong>${escapeHtml(tool.title)}</strong><small>${escapeHtml(tool.category)}</small></span>
      </button>`;
  }

  function commandMarkup(tool, index) {
    return `
      <button class="command-item${index === commandIndex ? ' active' : ''}" type="button" data-command-index="${index}" data-tool-id="${escapeHtml(tool.id)}">
        <span class="command-item-icon" aria-hidden="true">${tool.icon}</span>
        <span class="command-item-copy"><strong>${escapeHtml(tool.title)}</strong><small>${escapeHtml(tool.subtitle)}</small></span>
        <span class="command-item-meta">${escapeHtml(tool.category)}${tool.external ? ' · ↗' : ''}</span>
      </button>`;
  }

  function getFilteredTools() {
    const query = normalize(searchInput.value.trim());
    return tools.filter(tool => {
      const matchesQuery = !query || toolSearchText(tool).includes(query);
      const matchesCategory = activeCategory === 'Todos' || tool.category === activeCategory;
      return matchesQuery && matchesCategory;
    });
  }

  function renderNav() {
    const query = normalize(searchInput.value.trim());
    const list = !query ? tools : tools.filter(tool => toolSearchText(tool).includes(query));
    navList.innerHTML = list.length ? list.map(navMarkup).join('') : '<div class="empty">No se encontraron herramientas.</div>';
    navCount.textContent = list.length;
    syncActive();
  }

  function renderCards() {
    const list = getFilteredTools();
    cards.innerHTML = list.length ? list.map(cardMarkup).join('') : '<div class="empty">No hay resultados para este filtro.</div>';
  }

  function renderCategories() {
    const categories = ['Todos', ...new Set(tools.map(tool => tool.category))];
    categoryFilters.innerHTML = categories.map(category => `
      <button class="category-chip${category === activeCategory ? ' active' : ''}" type="button" data-category-filter="${escapeHtml(category)}">${escapeHtml(category)}</button>
    `).join('');
  }

  function renderRecent() {
    const list = recentIds.map(id => tools.find(tool => tool.id === id)).filter(Boolean);
    recentSection.hidden = list.length === 0;
    recentList.innerHTML = list.map(recentMarkup).join('');
  }

  function renderCommandResults() {
    const query = normalize(commandInput.value.trim());
    commandMatches = !query ? [...tools] : tools.filter(tool => toolSearchText(tool).includes(query));
    if (commandIndex >= commandMatches.length) commandIndex = Math.max(0, commandMatches.length - 1);
    commandResults.innerHTML = commandMatches.length
      ? commandMatches.map(commandMarkup).join('')
      : '<div class="empty">No hay herramientas que coincidan.</div>';
    commandResultCount.textContent = `${commandMatches.length} resultado${commandMatches.length === 1 ? '' : 's'}`;
  }

  function renderAll() {
    renderNav();
    renderCards();
    renderCategories();
    renderRecent();
    byId('toolCount')?.remove();
  }

  function closeMobileMenu() {
    sidebar.classList.remove('open');
    overlay.classList.remove('visible');
  }

  function syncActive() {
    document.querySelectorAll('.nav-item').forEach(element => {
      element.classList.toggle('active', Boolean(activeTool && element.dataset.toolId === activeTool.id));
    });
  }

  function setFrameLoading(tool) {
    loadingTitle.textContent = `Abriendo ${tool.title}`;
    frameWrap.classList.add('loading');
    frameLoading.setAttribute('aria-busy', 'true');
  }

  function clearFrameLoading() {
    frameWrap.classList.remove('loading');
    frameLoading.setAttribute('aria-busy', 'false');
  }

  function openTool(id, updateHash = true) {
    const tool = tools.find(item => item.id === id);
    if (!tool) return;

    addRecent(tool.id);

    if (tool.external) {
      window.open(tool.href, '_blank', 'noopener');
      closeCommand();
      closeMobileMenu();
      return;
    }

    activeTool = tool;
    pageTitle.textContent = tool.title;
    contextLabel.textContent = tool.category;
    viewStatus.textContent = 'Módulo activo';
    homeView.hidden = true;
    frameWrap.classList.add('visible');
    setFrameLoading(tool);
    openBtn.disabled = false;
    focusBtn.disabled = false;
    frame.title = `${tool.title} · Twistar`;
    frame.src = tool.href;
    syncActive();
    closeCommand();
    closeMobileMenu();
    if (updateHash) history.replaceState(null, '', `#${tool.id}`);
  }

  function exitFocus() {
    appShell.classList.remove('focus-mode');
    focusBtn.textContent = '⛶';
    focusBtn.setAttribute('aria-label', 'Activar modo foco');
    focusBtn.title = 'Modo foco';
  }

  function toggleFocus() {
    if (!activeTool) return;
    const focused = appShell.classList.toggle('focus-mode');
    focusBtn.textContent = focused ? '↙' : '⛶';
    focusBtn.setAttribute('aria-label', focused ? 'Salir del modo foco' : 'Activar modo foco');
    focusBtn.title = focused ? 'Salir de modo foco' : 'Modo foco';
  }

  function goHome(updateHash = true) {
    exitFocus();
    activeTool = null;
    frame.src = 'about:blank';
    clearFrameLoading();
    frameWrap.classList.remove('visible');
    homeView.hidden = false;
    pageTitle.textContent = 'Visión general';
    contextLabel.textContent = 'Workspace';
    viewStatus.textContent = 'Panel principal';
    openBtn.disabled = true;
    focusBtn.disabled = true;
    if (updateHash) history.replaceState(null, '', location.pathname);
    syncActive();
    closeMobileMenu();
  }

  function findToolByUrl(url) {
    try {
      const parsed = new URL(url, location.href);
      const filename = parsed.pathname.split('/').pop().toLowerCase();
      return tools.find(tool => !tool.external && tool.href.toLowerCase() === filename);
    } catch (_) {
      return null;
    }
  }

  function enhanceFrame() {
    if (!activeTool || frame.src === 'about:blank') return;
    clearFrameLoading();
    try {
      const doc = frame.contentDocument;
      if (!doc || !doc.documentElement || !doc.head) return;

      doc.documentElement.classList.add('twistar-embedded');
      doc.body?.classList.add('twistar-module');

      let link = doc.querySelector('link[data-twistar-theme]');
      if (!link) {
        link = doc.createElement('link');
        link.rel = 'stylesheet';
        link.dataset.twistarTheme = 'true';
        doc.head.appendChild(link);
      }
      link.href = new URL('assets/module.css?v=20260916-v2', location.href).href;

      doc.querySelectorAll('nav').forEach(nav => {
        if (!nav.closest('.module-header')) nav.dataset.legacyNav = 'true';
      });

      if (!doc.documentElement.dataset.twistarBound) {
        doc.documentElement.dataset.twistarBound = 'true';
        doc.addEventListener('click', event => {
          const anchor = event.target.closest('a[href]');
          if (!anchor) return;
          const href = anchor.getAttribute('href');
          if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;
          try {
            const url = new URL(href, doc.location.href);
            if (url.origin !== location.origin) return;
            if (url.pathname.endsWith('/index.html') || url.pathname.endsWith('/')) {
              event.preventDefault();
              goHome();
              return;
            }
            const linkedTool = findToolByUrl(url.href);
            if (linkedTool) {
              event.preventDefault();
              openTool(linkedTool.id);
            }
          } catch (_) {}
        }, { capture: true });
      }
    } catch (_) {
      // Un iframe externo puede impedir acceso; el módulo sigue funcionando normalmente.
    }
  }

  function openCommand(prefill = '') {
    commandBackdrop.hidden = false;
    commandInput.value = prefill;
    commandIndex = 0;
    renderCommandResults();
    requestAnimationFrame(() => commandInput.focus());
  }

  function closeCommand() {
    if (commandBackdrop.hidden) return;
    commandBackdrop.hidden = true;
    commandInput.value = '';
  }

  function moveCommandSelection(direction) {
    if (!commandMatches.length) return;
    commandIndex = (commandIndex + direction + commandMatches.length) % commandMatches.length;
    renderCommandResults();
    commandResults.querySelector('.command-item.active')?.scrollIntoView({ block: 'nearest' });
  }

  function updateClock() {
    const now = new Date();
    const time = new Intl.DateTimeFormat('es-UY', { hour: '2-digit', minute: '2-digit' }).format(now);
    const date = new Intl.DateTimeFormat('es-UY', { weekday: 'short', day: '2-digit', month: 'short' }).format(now);
    liveClock.textContent = `${date} · ${time}`;
  }

  function setPlatformShortcut() {
    const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
    const label = isMac ? '⌘K' : 'Ctrl K';
    document.querySelectorAll('.command-trigger kbd, .hero-primary kbd, .sidebar-footer .shortcut-row:first-child kbd').forEach(kbd => {
      kbd.textContent = label;
    });
  }

  searchInput.addEventListener('input', () => {
    renderNav();
    renderCards();
  });

  navList.addEventListener('click', event => {
    const trigger = event.target.closest('[data-tool-id]');
    if (trigger) openTool(trigger.dataset.toolId);
  });

  cards.addEventListener('click', event => {
    const trigger = event.target.closest('[data-tool-id]');
    if (trigger) openTool(trigger.dataset.toolId);
  });

  cards.addEventListener('keydown', event => {
    const trigger = event.target.closest('[data-tool-id]');
    if (trigger && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      openTool(trigger.dataset.toolId);
    }
  });

  recentList.addEventListener('click', event => {
    const trigger = event.target.closest('[data-tool-id]');
    if (trigger) openTool(trigger.dataset.toolId);
  });

  categoryFilters.addEventListener('click', event => {
    const trigger = event.target.closest('[data-category-filter]');
    if (!trigger) return;
    activeCategory = trigger.dataset.categoryFilter;
    renderCategories();
    renderCards();
  });

  byId('clearRecentBtn').addEventListener('click', () => {
    recentIds = [];
    saveRecentIds();
    renderRecent();
  });

  byId('commandTrigger').addEventListener('click', () => openCommand());
  byId('heroCommandBtn').addEventListener('click', () => openCommand());
  byId('homeBtn').addEventListener('click', () => goHome());
  focusBtn.addEventListener('click', toggleFocus);
  focusExit.addEventListener('click', exitFocus);
  openBtn.addEventListener('click', () => {
    if (activeTool) window.open(activeTool.href, '_blank', 'noopener');
  });

  byId('menuToggle').addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('visible');
  });
  overlay.addEventListener('click', closeMobileMenu);
  frame.addEventListener('load', enhanceFrame);

  commandInput.addEventListener('input', () => {
    commandIndex = 0;
    renderCommandResults();
  });
  commandResults.addEventListener('mousemove', event => {
    const item = event.target.closest('[data-command-index]');
    if (!item) return;
    const nextIndex = Number(item.dataset.commandIndex);
    if (Number.isFinite(nextIndex) && nextIndex !== commandIndex) {
      commandIndex = nextIndex;
      commandResults.querySelectorAll('.command-item').forEach((node, index) => node.classList.toggle('active', index === commandIndex));
    }
  });
  commandResults.addEventListener('click', event => {
    const item = event.target.closest('[data-tool-id]');
    if (item) openTool(item.dataset.toolId);
  });
  commandBackdrop.addEventListener('click', event => {
    if (event.target === commandBackdrop) closeCommand();
  });

  window.addEventListener('hashchange', () => {
    const id = location.hash.replace('#', '');
    if (!id) return goHome(false);
    if (tools.some(tool => tool.id === id && !tool.external)) openTool(id, false);
    else goHome(false);
  });

  document.addEventListener('keydown', event => {
    const commandShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
    if (commandShortcut) {
      event.preventDefault();
      commandBackdrop.hidden ? openCommand() : closeCommand();
      return;
    }

    if (!commandBackdrop.hidden) {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeCommand();
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        moveCommandSelection(1);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        moveCommandSelection(-1);
      } else if (event.key === 'Enter' && document.activeElement === commandInput && commandMatches[commandIndex]) {
        event.preventDefault();
        openTool(commandMatches[commandIndex].id);
      }
      return;
    }

    if (event.key === '/' && document.activeElement !== searchInput && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName || '')) {
      event.preventDefault();
      searchInput.focus();
      return;
    }

    if (event.key === 'Escape') {
      if (appShell.classList.contains('focus-mode')) exitFocus();
      else if (activeTool) goHome();
    }
  });

  renderAll();
  setPlatformShortcut();
  updateClock();
  setInterval(updateClock, 30000);
  openBtn.disabled = true;
  focusBtn.disabled = true;

  const initialId = location.hash.replace('#', '');
  if (initialId && tools.some(tool => tool.id === initialId && !tool.external)) openTool(initialId, false);
})();
