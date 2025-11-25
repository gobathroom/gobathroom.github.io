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

/* ===========================
   FOOTER: TOGGLE COMPARTIR
   =========================== */

(function setupFooterShare() {
  const footer       = document.querySelector('.site-footer');
  const footerLinks  = document.querySelector('.footer-links');
  const toggleBtn    = document.getElementById('footerShareToggle');
  const shareRow     = document.getElementById('footerShareRow');
  const shareButtons = shareRow ? shareRow.querySelectorAll('.share-pill') : [];

  if (!footer || !footerLinks || !toggleBtn || !shareRow) return;

  function openShare() {
    footer.classList.add('is-sharing');
    footerLinks.classList.add('footer-links--sharing');
    toggleBtn.setAttribute('aria-expanded', 'true');
    shareRow.setAttribute('aria-hidden', 'false');
  }

  function closeShare() {
    footer.classList.remove('is-sharing');
    footerLinks.classList.remove('footer-links--sharing');
    toggleBtn.setAttribute('aria-expanded', 'false');
    shareRow.setAttribute('aria-hidden', 'true');
  }

  function toggleShare() {
    if (footer.classList.contains('is-sharing')) {
      closeShare();
    } else {
      openShare();
    }
  }

  // 1) Click en "Compartir"
  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleShare();
  });

  // 2) Click en botones de compartir
  shareButtons.forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();

      const type = btn.dataset.share;
      const url  = getShareUrl();
      const text = 'Encuentra baños accesibles y gratuitos con Go Bathroom.';

      if (type === 'copy') {
        try {
          await navigator.clipboard.writeText(url);
          btn.classList.add('share-pill--ok');
          setTimeout(() => btn.classList.remove('share-pill--ok'), 1200);
        } catch (err) {
          console.error('No se pudo copiar el enlace', err);
        }
      } else if (type === 'x') {
        const shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
        window.open(shareUrl, '_blank', 'noopener');
      } else if (type === 'facebook') {
        const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        window.open(shareUrl, '_blank', 'noopener');
      } else if (type === 'whatsapp') {
        const shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + url)}`;
        window.open(shareUrl, '_blank', 'noopener');
      }

      // cerrar después de compartir
      closeShare();
    });
  });

  // 3) Cerrar si se hace click fuera del footer/row
  document.addEventListener('click', (e) => {
    if (!footer.classList.contains('is-sharing')) return;

    const insideFooter = footer.contains(e.target);
    if (!insideFooter) {
      closeShare();
    }
  });

  // 4) Cerrar con Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && footer.classList.contains('is-sharing')) {
      closeShare();
    }
  });
})();


