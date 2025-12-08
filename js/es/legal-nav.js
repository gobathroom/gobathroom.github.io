// /js/es/legal-nav.js
document.addEventListener('DOMContentLoaded', () => {
  const sections = document.querySelectorAll('.legal-section[id]');
  const links = Array.from(document.querySelectorAll('.legal-sub-link'));
  if (!sections.length || !links.length) return;

  // Map id -> link
  const linkById = new Map();
  links.forEach(link => {
    const hash = link.getAttribute('href');
    if (hash && hash.startsWith('#')) {
      linkById.set(hash.slice(1), link);
    }
  });

  // IDs visibles detectados por IntersectionObserver
  let visibleIdsRaw = new Set();

  // ACTUALIZA LAS CLASES DE LOS LINKS
  function applyHighlight() {
    const scrollY = window.scrollY;
    const viewport = window.innerHeight;
    const pageHeight = document.documentElement.scrollHeight;

    const atTop = scrollY === 0;
    const atBottom = scrollY + viewport >= pageHeight - 2;

    // Si estamos arriba del todo → limpiar todo
    if (atTop) {
      links.forEach(l => l.classList.remove('is-current'));
      return;
    }

    let visibleList = Array.from(visibleIdsRaw);

    // REGLA 1 → Si NO estás al fondo: activar SOLO UNO
    if (!atBottom) {
      if (visibleList.length > 0) {
        visibleList = [visibleList[0]]; // tomamos el primero que entra en ventana
      }
    }
    // REGLA 2 → Si estás al fondo: permitir varios (tal como los encontró el observer)

    // Pintar
    links.forEach(link => {
      const id = link.getAttribute('href').slice(1);
      if (visibleList.includes(id)) {
        link.classList.add('is-current');
      } else {
        link.classList.remove('is-current');
      }
    });
  }

  // OBSERVER → detecta qué secciones entran a la franja central
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        const id = entry.target.id;
        if (!id) return;

        if (entry.isIntersecting) {
          visibleIdsRaw.add(id);
        } else {
          visibleIdsRaw.delete(id);
        }
      });

      applyHighlight();
    },
    {
      root: null,
      rootMargin: "-30% 0px -30% 0px", // franja del 40% central de la pantalla
      threshold: 0.1
    }
  );

  sections.forEach(sec => observer.observe(sec));

  // CLICK → scroll suave + eliminar hash de la URL
  links.forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (!href.startsWith('#')) return;

      e.preventDefault();
      const id = href.slice(1);
      const target = document.getElementById(id);
      if (!target) return;

      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });

      // Borrar hash de la URL luego del scroll
      if (window.history?.replaceState) {
        const clean = window.location.pathname + window.location.search;
        window.history.replaceState(null, "", clean);
      }
    });
  });

  // Si entran con URL tipo /privacidad#sec-4 → respetar pero limpiar hash
  if (location.hash.startsWith('#sec-')) {
    const id = location.hash.slice(1);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "auto", block: "start" });

      if (window.history?.replaceState) {
        const clean = window.location.pathname + window.location.search;
        window.history.replaceState(null, "", clean);
      }
    }
  }
});
