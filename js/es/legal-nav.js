// /js/es/legal-nav.js
document.addEventListener('DOMContentLoaded', () => {
  const sections = document.querySelectorAll('.legal-section[id]');
  const links = Array.from(document.querySelectorAll('.legal-sub-link'));
  if (!sections.length || !links.length) return;

  // Mapear id -> enlace del sidebar
  const linkById = new Map();
  links.forEach(link => {
    const hash = link.getAttribute('href');
    if (hash && hash.startsWith('#')) {
      const id = hash.slice(1);
      linkById.set(id, link);
    }
  });

  // Función para actualizar clases según las secciones visibles
  const updateVisible = (visibleIds) => {
    links.forEach(link => {
      const hash = link.getAttribute('href') || '';
      const id = hash.startsWith('#') ? hash.slice(1) : '';
      if (visibleIds.has(id)) {
        link.classList.add('is-current');
      } else {
        link.classList.remove('is-current');
      }
    });
  };

  const visibleIds = new Set();

  // Observer: marca como visibles las secciones que están cerca del centro
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const id = entry.target.id;
      if (!id) return;

      if (entry.isIntersecting) {
        visibleIds.add(id);
      } else {
        visibleIds.delete(id);
      }
    });

    updateVisible(visibleIds);
  }, {
    root: null,
    // “ventana” vertical: se considera visible lo que cae en el 40% central
    rootMargin: '-30% 0px -30% 0px',
    threshold: 0.1
  });

  sections.forEach(sec => observer.observe(sec));

  // Click en el índice: scroll suave + quitar hash de la URL
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) return;

      e.preventDefault();
      const id = href.slice(1);
      const target = document.getElementById(id);
      if (!target) return;

      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });

      // Quitamos el #sec-x de la URL para que al refrescar vuelva arriba
      if (window.history && window.history.replaceState) {
        const cleanUrl = window.location.pathname + window.location.search;
        window.history.replaceState(null, '', cleanUrl);
      }
    });
  });

  // Si entras con un hash escrito a mano (por ejemplo /privacidad#sec-3),
  // respetamos ese ancla, pero usamos scroll suave y también limpiamos la URL.
  if (location.hash && location.hash.startsWith('#sec-')) {
    const id = location.hash.slice(1);
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: 'auto', block: 'start' });
      if (window.history && window.history.replaceState) {
        const cleanUrl = window.location.pathname + window.location.search;
        window.history.replaceState(null, '', cleanUrl);
      }
    }
  }
});
