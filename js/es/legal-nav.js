// /js/es/legal-nav.js
document.addEventListener('DOMContentLoaded', () => {
  const sections = Array.from(document.querySelectorAll('.legal-section[id]'));
  const links = Array.from(document.querySelectorAll('.legal-sub-link'));

  if (!sections.length || !links.length) return;

  // Desactivamos la restauración automática de scroll del navegador
  if ('scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual';
  }

  // Si NO hay hash (#sec-x, etc.), siempre empezamos arriba al cargar / recargar
  if (!location.hash) {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  // Mapa id -> link
  const idToLink = new Map();
  links.forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href.startsWith('#')) {
      idToLink.set(href.slice(1), link);
    }
  });

  const setActive = (activeIds) => {
    links.forEach(link => {
      const href = link.getAttribute('href') || '';
      const id = href.startsWith('#') ? href.slice(1) : '';
      link.classList.toggle('is-current', activeIds.has(id));
    });
  };

  const computeActive = () => {
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const docHeight = document.documentElement.scrollHeight;
    const scrollY = window.scrollY || window.pageYOffset;
    const atBottom = scrollY + vh >= docHeight - 2; // casi fondo

    // Calculamos qué parte de cada sección es visible
    const candidates = sections.map(sec => {
      const rect = sec.getBoundingClientRect();
      const visible = Math.min(rect.bottom, vh) - Math.max(rect.top, 0);
      const ratio = rect.height > 0 ? Math.max(0, visible) / rect.height : 0;
      return { id: sec.id, ratio };
    });

    const activeIds = new Set();

    if (!atBottom) {
      // SOLO UNA sección activa: la más visible, pero que tenga al menos ~3/4
      let best = null;
      for (const c of candidates) {
        if (c.ratio < 0.25) continue;       // descartamos casi invisibles
        if (!best || c.ratio > best.ratio) {
          best = c;
        }
      }
      if (best && best.ratio >= 0.75) {
        activeIds.add(best.id);
      } else if (best && best.ratio > 0) {
        // fallback por si ninguna llega a 0.75 (pantallas muy bajas, etc.)
        activeIds.add(best.id);
      }
    } else {
      // EN EL FONDO: puede haber varias secciones si se ven al menos 3/4
      candidates.forEach(c => {
        if (c.ratio >= 0.75) {
          activeIds.add(c.id);
        }
      });

      // Si por alguna razón ninguna llega a 0.75, marcamos la más visible
      if (!activeIds.size) {
        const best = candidates.reduce((a, b) => (b.ratio > a.ratio ? b : a));
        if (best.ratio > 0) activeIds.add(best.id);
      }
    }

    setActive(activeIds);
  };

  // Listener de scroll y resize
  window.addEventListener('scroll', computeActive, { passive: true });
  window.addEventListener('resize', computeActive);
  computeActive(); // estado inicial

  // Scroll suave al hacer clic en el índice y limpiamos el hash
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href') || '';
      if (!href.startsWith('#')) return;

      e.preventDefault();
      const id = href.slice(1);
      const target = document.getElementById(id);
      if (!target) return;

      const rect = target.getBoundingClientRect();
      const offset = 96; // altura aprox. del topbar
      const targetTop = rect.top + window.scrollY - offset;

      window.scrollTo({
        top: targetTop,
        behavior: 'smooth'
      });

      if (window.history && window.history.replaceState) {
        const cleanUrl = window.location.pathname + window.location.search;
        window.history.replaceState(null, '', cleanUrl);
      }

      // Forzamos recalcular después del scroll suave
      setTimeout(computeActive, 400);
    });
  });

  // Si entra con /privacidad#sec-x, respetamos ancla pero limpiamos hash
  if (location.hash && location.hash.startsWith('#sec-')) {
    const id = location.hash.slice(1);
    const target = document.getElementById(id);
    if (target) {
      const rect = target.getBoundingClientRect();
      const offset = 96;
      const targetTop = rect.top + window.scrollY - offset;

      window.scrollTo({ top: targetTop, behavior: 'auto' });

      if (window.history && window.history.replaceState) {
        const cleanUrl = window.location.pathname + window.location.search;
        window.history.replaceState(null, '', cleanUrl);
      }

      computeActive();
    }
  }
});
