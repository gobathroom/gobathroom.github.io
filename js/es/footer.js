// Función que ya tenías: decide qué URL compartir
function getShareUrl() {
  const url  = new URL(window.location.href);
  const path = url.pathname;

  // 1) Detectar prefijo de idioma: /es/ , /en/ , /fr/, etc.
  let langPrefix = '/';
  const match = path.match(/^\/([a-z]{2})\//i);
  if (match) {
    langPrefix = `/${match[1]}/`;  // ej: "/es/"
  }

  // 2) Obtener el último segmento del path (el "slug")
  const segments   = path.replace(/\/+$/, '').split('/');
  const lastSegment = segments[segments.length - 1] || '';

  // 3) Slugs que NO queremos compartir tal cual (solo compartimos la home del idioma)
  const legalSlugs = new Set([
    'privacidad',
    'terminos',
    'privacy',
    'terms'
  ]);

  if (legalSlugs.has(lastSegment)) {
    url.pathname = langPrefix === '/' ? '/' : langPrefix;
    url.search   = '';
    url.hash     = '';
    return url.toString();
  }

  // 4) En cualquier otra página, compartir la URL actual completa
  return url.toString();
}

// ===========================
// FOOTER: Toggle compartir (opción 2)
// ===========================
(function () {
  const footer = document.querySelector('.site-footer');
  const toggle = document.getElementById('footerShareToggle');
  const shareRow = document.getElementById('footerShareRow');

  if (!footer || !toggle || !shareRow) return;

  const shareButtons = shareRow.querySelectorAll('.share-pill');

  function openShare() {
    footer.classList.add('share-open');
    shareRow.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
  }

  function closeShare() {
    footer.classList.remove('share-open');
    shareRow.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false');
  }

  toggle.addEventListener('click', () => {
    const isOpen = footer.classList.contains('share-open');
    if (isOpen) {
      closeShare();
    } else {
      openShare();
    }
  });

  // Cerrar al hacer clic fuera del footer
  document.addEventListener('click', (ev) => {
    if (!footer.classList.contains('share-open')) return;
    if (footer.contains(ev.target)) return;
    closeShare();
  });

  // Cerrar con ESC
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') {
      closeShare();
    }
  });

  // Lógica de compartir según el botón
  async function handleShare(kind) {
    const urlToShare = getShareUrl();   // usa tu función existente
    const shareTitle = 'Go Bathroom NYC';
    const shareText  = 'Encuentra baños accesibles, gratuitos y para clientes en NYC.';

    try {
      if (kind === 'copy') {
        await navigator.clipboard.writeText(urlToShare);

        const label = shareRow.querySelector('[data-share="copy"] .share-pill-label');
        const original = label ? label.textContent : '';
        if (label) label.textContent = '¡Copiado!';
        setTimeout(() => {
          if (label) label.textContent = original || 'Copiar enlace';
        }, 1500);
      } else if (kind === 'facebook') {
        const shareUrl = 'https://www.facebook.com/sharer/sharer.php?u=' +
          encodeURIComponent(urlToShare);
        window.open(shareUrl, '_blank', 'noopener');
      } else if (kind === 'x') {
        const text = shareText + ' ' + urlToShare;
        const shareUrl = 'https://twitter.com/intent/tweet?text=' +
          encodeURIComponent(text);
        window.open(shareUrl, '_blank', 'noopener');
      } else if (kind === 'whatsapp') {
        const text = shareText + ' ' + urlToShare;
        const shareUrl = 'https://wa.me/?text=' + encodeURIComponent(text);
        window.open(shareUrl, '_blank', 'noopener');
      }
    } catch (err) {
      console.error('Error al compartir:', err);
    } finally {
      // Siempre cerramos el panel después de usar una opción
      closeShare();
    }
  }

  shareButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const kind = btn.dataset.share;
      if (!kind) return;
      handleShare(kind);
    });
  });
})();

