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

  const byId = id => document.getElementById(id);
  const navList = byId('navList');
  const cards = byId('cards');
  const searchInput = byId('searchInput');
  const homeView = byId('homeView');
  const frameWrap = byId('frameWrap');
  const frame = byId('toolFrame');
  const pageTitle = byId('pageTitle');
  const contextLabel = byId('contextLabel');
  const sidebar = byId('sidebar');
  const overlay = byId('overlay');
  const openBtn = byId('openBtn');
  let activeTool = null;

  byId('toolCount').textContent = tools.filter(tool => !tool.external).length;

  const escapeHtml = value => String(value).replace(/[&<>'"]/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[char]));

  const navMarkup = tool => `
    <button class="nav-item" type="button" data-tool-id="${escapeHtml(tool.id)}">
      <span class="nav-icon" aria-hidden="true">${tool.icon}</span>
      <span class="nav-copy">
        <span class="nav-title">${escapeHtml(tool.title)}</span>
        <span class="nav-sub">${escapeHtml(tool.category)}</span>
      </span>
    </button>`;

  const cardMarkup = tool => `
    <article class="card" data-tool-id="${escapeHtml(tool.id)}" tabindex="0" role="button" aria-label="Abrir ${escapeHtml(tool.title)}">
      <span class="card-arrow" aria-hidden="true">↗</span>
      <div class="card-icon" aria-hidden="true">${tool.icon}</div>
      <div><h5>${escapeHtml(tool.title)}</h5><p>${escapeHtml(tool.subtitle)}</p></div>
    </article>`;

  function render(list = tools) {
    navList.innerHTML = list.length ? list.map(navMarkup).join('') : '<div class="empty">No se encontraron herramientas.</div>';
    cards.innerHTML = list.length ? list.map(cardMarkup).join('') : '<div class="empty">No hay resultados para esta búsqueda.</div>';
    bindTriggers();
    syncActive();
  }

  function bindTriggers() {
    document.querySelectorAll('[data-tool-id]').forEach(element => {
      element.addEventListener('click', () => openTool(element.dataset.toolId));
      element.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openTool(element.dataset.toolId);
        }
      });
    });
  }

  function openTool(id, updateHash = true) {
    const tool = tools.find(item => item.id === id);
    if (!tool) return;
    if (tool.external) {
      window.open(tool.href, '_blank', 'noopener');
      closeMobileMenu();
      return;
    }

    activeTool = tool;
    pageTitle.textContent = tool.title;
    contextLabel.textContent = tool.category;
    homeView.hidden = true;
    frameWrap.classList.add('visible');
    openBtn.disabled = false;
    frame.src = tool.href;
    syncActive();
    closeMobileMenu();
    if (updateHash) history.replaceState(null, '', `#${tool.id}`);
  }

  function goHome(updateHash = true) {
    activeTool = null;
    frame.src = 'about:blank';
    frameWrap.classList.remove('visible');
    homeView.hidden = false;
    pageTitle.textContent = 'Visión general';
    contextLabel.textContent = 'Panel principal';
    openBtn.disabled = true;
    if (updateHash) history.replaceState(null, '', location.pathname);
    syncActive();
    closeMobileMenu();
  }

  function syncActive() {
    document.querySelectorAll('.nav-item').forEach(element => {
      element.classList.toggle('active', Boolean(activeTool && element.dataset.toolId === activeTool.id));
    });
  }

  function closeMobileMenu() {
    sidebar.classList.remove('open');
    overlay.classList.remove('visible');
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
    try {
      const doc = frame.contentDocument;
      if (!doc || !doc.documentElement || !doc.head) return;

      doc.documentElement.classList.add('twistar-embedded');
      doc.body?.classList.add('twistar-module');

      if (!doc.querySelector('link[data-twistar-theme]')) {
        const link = doc.createElement('link');
        link.rel = 'stylesheet';
        link.href = new URL('assets/module.css', location.href).href;
        link.dataset.twistarTheme = 'true';
        doc.head.appendChild(link);
      }

      doc.querySelectorAll('nav').forEach(nav => {
        if (!nav.closest('.module-header')) nav.dataset.legacyNav = 'true';
      });

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
    } catch (_) {
      // El navegador puede impedir el acceso a iframes de otro origen.
    }
  }

  searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim().toLowerCase();
    const list = !query ? tools : tools.filter(tool =>
      `${tool.title} ${tool.subtitle} ${tool.category}`.toLowerCase().includes(query)
    );
    render(list);
  });

  byId('homeBtn').addEventListener('click', () => goHome());
  openBtn.addEventListener('click', () => {
    if (activeTool) window.open(activeTool.href, '_blank', 'noopener');
  });
  byId('menuToggle').addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('visible');
  });
  overlay.addEventListener('click', closeMobileMenu);
  frame.addEventListener('load', enhanceFrame);

  window.addEventListener('hashchange', () => {
    const id = location.hash.replace('#', '');
    if (!id) return goHome(false);
    if (tools.some(tool => tool.id === id && !tool.external)) openTool(id, false);
  });

  document.addEventListener('keydown', event => {
    if (event.key === '/' && document.activeElement !== searchInput) {
      event.preventDefault();
      searchInput.focus();
    }
    if (event.key === 'Escape' && activeTool) goHome();
  });

  render();
  openBtn.disabled = true;
  const initialId = location.hash.replace('#', '');
  if (initialId && tools.some(tool => tool.id === initialId && !tool.external)) openTool(initialId, false);
})();
