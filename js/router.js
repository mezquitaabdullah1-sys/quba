// 🗺️ Router simple para SPA — con history.pushState y popstate
const Router = {
  routes: {
    home: { page: HomePage, tabId: 'home' },
    quran: { page: QuranPage, tabId: 'quran' },
    prayer: { page: PrayerPage, tabId: 'prayer' },
    calendar: { page: CalendarPage, tabId: null },
    wisdom: { page: WisdomPage, tabId: 'wisdom' },
    profile: { page: ProfilePage, tabId: 'profile' },
    surah: { page: QuranPage, tabId: 'quran', method: 'renderDetail' },
    mushaf: { page: QuranMushafPage, tabId: 'quran', method: 'render' },
    'wisdom/quiz': { page: QuizPage, tabId: 'wisdom', method: 'renderCategorySelect' },
    'wisdom/tasbih': { page: TasbihPage, tabId: 'wisdom', method: 'render' },
    'wisdom/adhkar': { page: AdhkarPage, tabId: 'wisdom', method: 'renderHub' },
    'wisdom/duas': { page: DuasPage, tabId: 'wisdom', method: 'renderHub' },
    'wisdom/courses': { page: CoursesPage, tabId: 'wisdom', method: 'renderHub' },
    // v56: الراديو الإسلامي — يُبرز تبويب الحكمة في الشريط السفلي
    radio: { page: RadioPage, tabId: 'wisdom' },
  },

  current: null,
  history: [],
  _navigating: false, // flag para evitar loops popstate
  _navToken: 0, // v19: navigation token — only the latest navigation may render

  // True while `token` is still the active navigation.
  isCurrent(token) { return token === this._navToken; },

  async go(routeName, params = {}, options = {}) {
    const route = this.routes[routeName];
    if (!route) {
      console.warn('Ruta desconocida:', routeName);
      return;
    }

    // v41: tocar la pestaña YA ACTIVA (barra inferior) no vuelve a renderizar
    // la página — antes cada toque en la pestaña actual lanzaba skeleton +
    // peticiones de red (la «recarga al hacer cualquier cosa»).
    // v54: este atajo SOLO se aplica a los toques de la barra inferior
    // (options.skipIfCurrent). Antes se aplicaba a CUALQUIER llamada a la misma
    // ruta, y eso rompía la salida de las subvistas internas de Quiz, Cursos,
    // Du'as y Adhkar: sus botones «atrás / salir / volver» llaman a
    // Router.go('wisdom/quiz') etc. estando YA en esa ruta (las subvistas se
    // pintan dentro de la misma ruta) → el guard los ignoraba y el usuario se
    // quedaba atascado dentro de la categoría/lección/set.
    const sameRoute = !!this.current
      && this.current.name === routeName
      && JSON.stringify(this.current.params || {}) === JSON.stringify(params || {});
    if (options.skipIfCurrent && !options.force && !options.fromPopState && sameRoute) {
      this.updateTabs(route.tabId);
      return;
    }

    // v19: bump token FIRST so any in-flight async render from a previous
    // page (e.g. HomePage still awaiting its API) knows it is now stale and
    // must not wipe/overwrite the new page's DOM.
    const token = ++this._navToken;

    // Cleanup de la página anterior (audio, intervals, listeners)
    if (this.current?.route?.page?.cleanup) {
      try { this.current.route.page.cleanup(); } catch(e) { console.warn('Cleanup error:', e); }
    }

    this.current = { route, name: routeName, params };
    this.updateTabs(route.tabId);

    // history.pushState — sync con URL (soporta zurück, F5, share link)
    if (!options.fromPopState) {
      const url = `#/${routeName}${params && Object.keys(params).length ? '?' + new URLSearchParams(this._serializeParams(params)).toString() : ''}`;
      try {
        // v54: volver a la MISMA ruta (salir de una subvista interna) reemplaza
        // la entrada actual en vez de apilar una duplicada en el historial.
        if (sameRoute) history.replaceState({ name: routeName, params }, '', url);
        else history.pushState({ name: routeName, params }, '', url);
      } catch(e) {
        // Fallback si pushState falla (ej: file:// protocol)
        location.hash = url;
      }
    }

    const container = document.getElementById('main-content');
    if (container) container.scrollTop = 0;

    const method = route.method || 'render';
    if (typeof route.page[method] === 'function') {
      // Pass the token so pages can bail out mid-render if superseded
      await route.page[method](container, params, token);
    }
  },

  _serializeParams(params) {
    const out = {};
    for (const k in params) {
      const v = params[k];
      if (v === null || v === undefined) continue;
      out[k] = typeof v === 'object' ? JSON.stringify(v) : String(v);
    }
    return out;
  },

  push(routeName, params = {}) {
    this.history.push({ name: routeName, params });
    this.go(routeName, params);
  },

  back() {
    // Prefer browser history for consistency
    if (history.length > 1) {
      history.back();
      return;
    }
    if (this.history.length > 0) {
      this.history.pop();
      const prev = this.history.length > 0 ? this.history[this.history.length - 1] : null;
      if (prev) {
        this.go(prev.name, prev.params);
      } else {
        this.go('home');
      }
    } else {
      this.go('home');
    }
  },

  updateTabs(activeTabId) {
    document.querySelectorAll('.bottom-tabs .tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.page === activeTabId);
    });
  },

  // Parsea el hash inicial: #/wisdom/quiz?category=quran
  parseInitialRoute() {
    const hash = location.hash.replace(/^#\/?/, '');
    if (!hash) return { name: 'home', params: {} };
    const [path, query] = hash.split('?');
    const params = {};
    if (query) {
      new URLSearchParams(query).forEach((v, k) => {
        try { params[k] = JSON.parse(v); } catch { params[k] = v; }
      });
    }
    // Verifica que la ruta exista, si no, home
    return { name: this.routes[path] ? path : 'home', params };
  },

  init() {
    // popstate: back/forward del navegador o Android
    window.addEventListener('popstate', (e) => {
      if (e.state && e.state.name) {
        this.go(e.state.name, e.state.params || {}, { fromPopState: true });
      } else {
        const { name, params } = this.parseInitialRoute();
        this.go(name, params, { fromPopState: true });
      }
    });

    // v52: أُزيل السحب بين الصفحات الرئيسية تماماً — يبقى السحب فقط داخل
    // صفحات القرآن (قارئ السور والمصحف) للتنقل بين السور/الصفحات.

    // Ruta inicial desde hash (para deep-linking / F5)
    const initial = this.parseInitialRoute();
    if (initial.name !== 'home') {
      // Reemplaza el estado inicial en el history
      try {
        history.replaceState({ name: initial.name, params: initial.params }, '', `#/${initial.name}`);
      } catch(e) {}
      this.go(initial.name, initial.params, { fromPopState: true });
    }
  },

};

document.querySelectorAll('.bottom-tabs .tab').forEach(tab => {
  tab.addEventListener('click', () => {
    Router.history = [];
    Router.go(tab.dataset.page, {}, { skipIfCurrent: true });
  });
});
