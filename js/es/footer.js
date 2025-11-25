// ===========================
// 0. Helper i18n (usa el mismo GB_I18N que el topbar)
// ===========================
const t = (window.GB_I18N && window.GB_I18N.t)
  ? window.GB_I18N.t
  : (key) => key;


/* ===========================
   FOOTER:
   =========================== */
// Decide qué URL compartir (home en páginas legales)
function getShareUrl() {
  const url  = new URL(window.location.href);
  const path = url.pathname;

  // 1) Detectar prefijo de idioma: /es/ , /en/ , etc.
  let langPrefix = '/';
  const match = path.match(/^\/([a-z]{2})\//i);
  if (match) {
    langPrefix = `/${match[1]}/`;  // ej: "/es/"
  }

  // 2) Último segmento del path (slug)
  const segments    = path.replace(/\/+$/, '').split('/');
  const lastSegment = segments[segments.length - 1] || '';

  // 3) Slugs que comparten solo la home del idioma
  const legalSlugs = new Set([
    'privacidad',
    'terminos',
    'privacy',
    'terms'
  ]);

  if (legalSlugs.has(lastSegment)) {
    url.pathname = (langPrefix === '/') ? '/' : langPrefix;
    url.search   = '';
    url.hash     = '';
    return url.toString();
  }

  // 4) En cualquier otra página, compartir la URL completa
  return url.toString();
}

/* ===========================
   FOOTER: TOGGLE COMPARTIR
   =========================== */

(function setupFooterShare(){
  const footer    = document.querySelector('.site-footer');
  const toggleBtn = document.getElementById('footerShareToggle');
  const shareRow  = document.getElementById('footerShareRow');

  if (!footer || !toggleBtn || !shareRow) return;

  const shareButtons = shareRow.querySelectorAll('.share-pill');

  function openShare() {
    footer.classList.add('is-sharing');
    toggleBtn.setAttribute('aria-expanded', 'true');
    shareRow.setAttribute('aria-hidden', 'false');
  }

  function closeShare() {
    footer.classList.remove('is-sharing');
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
  shareButtons.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const type = btn.dataset.share;
      const url  = getShareUrl();

      // textos desde i18n
      const baseText  = t('share.main');
      const textX     = t('share.msgX')  || baseText;
      const textWa    = t('share.msgWa') || baseText;
      const errorCopy = t('share.errorCopy');

      if (type === 'copy') {
        try {
          await navigator.clipboard.writeText(url);
          btn.classList.add('share-pill--ok');
          setTimeout(() => btn.classList.remove('share-pill--ok'), 1200);
        } catch (err) {
          console.error(errorCopy, err);
        }

      } else if (type === 'x') {
        const shareUrl = `https://twitter.com/intent/tweet?url=${
          encodeURIComponent(url)
        }&text=${
          encodeURIComponent(textX)
        }`;
        window.open(shareUrl, '_blank', 'noopener');

      } else if (type === 'facebook') {
        const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        window.open(shareUrl, '_blank', 'noopener');

      } else if (type === 'whatsapp') {
        const shareUrl = `https://api.whatsapp.com/send?text=${
          encodeURIComponent(textWa + ' ' + url)
        }`;
        window.open(shareUrl, '_blank', 'noopener');
      }

      // Después de usar cualquier botón, cerramos el panel
      closeShare();
    });
  });

  // 3) Cerrar si se hace click fuera del footer o de la fila de compartir
  document.addEventListener('click', (e) => {
    if (!footer.classList.contains('is-sharing')) return;

    const insideFooter = footer.contains(e.target);
    const insideRow    = shareRow.contains(e.target);
    const isToggle     = toggleBtn.contains(e.target);

    if (!insideFooter || (!insideRow && !isToggle)) {
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
