// ===========================
// 0. Helper i18n (usa el mismo GB_I18N que el topbar)
// ===========================
const tShare = (window.GB_I18N && window.GB_I18N.t)
  ? window.GB_I18N.t
  : (key) => key;


/* ===========================
   FOOTER: Opciones
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

(function setupFooterShare() {
  const footer    = document.querySelector('.site-footer');
  const toggleBtn = document.getElementById('footerShareToggle');
  const shareRow  = document.getElementById('footerShareRow');

  if (!footer || !toggleBtn || !shareRow) return;

  const shareButtons = shareRow.querySelectorAll('.share-pill');
  const copyBtn      = shareRow.querySelector('.share-pill[data-share="copy"]');
  const tooltip      = document.getElementById('shareCopyTooltip');

  // Poner el texto inicial del botón "Copiar enlace" según el idioma
  if (copyBtn) {
    const labelSpan = copyBtn.querySelector('.share-pill-label');
    if (labelSpan) {
      labelSpan.textContent = tShare('share.copyLabel') || 'Copiar enlace';
    }
  }

  function openShare() {
    footer.classList.add('is-sharing');
    toggleBtn.setAttribute('aria-expanded', 'true');
    shareRow.setAttribute('aria-hidden', 'false');

    // preparar el contenido del tooltip (pero no mostrarlo aún)
    if (tooltip) {
      tooltip.textContent = getShareUrl();
    }
  }

  function closeShare() {
    footer.classList.remove('is-sharing');
    toggleBtn.setAttribute('aria-expanded', 'false');
    shareRow.setAttribute('aria-hidden', 'true');

    if (tooltip) {
      tooltip.classList.remove('is-visible');
    }
  }

  function toggleShare() {
    if (footer.classList.contains('is-sharing')) {
      closeShare();
    } else {
      openShare();
    }
  }

  // 1) Click en "Compartir" (fila principal)
  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleShare();
  });

  // Tooltip: solo se muestra al pasar el mouse / foco por el botón "Copiar enlace"
  if (copyBtn && tooltip) {
    const showTip = () => {
      tooltip.textContent = getShareUrl();  // por si la URL cambió
      tooltip.classList.add('is-visible');
    };
    const hideTip = () => {
      tooltip.classList.remove('is-visible');
    };

    copyBtn.addEventListener('mouseenter', showTip);
    copyBtn.addEventListener('mouseleave', hideTip);
    copyBtn.addEventListener('focus', showTip);
    copyBtn.addEventListener('blur', hideTip);
  }

  // 2) Click en botones de compartir
  shareButtons.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const type = btn.dataset.share;
      const url  = getShareUrl();

      // textos desde i18n
      const baseText    = tShare('share.main');
      const textX       = tShare('share.msgX')        || baseText;
      const textWa      = tShare('share.msgWa')       || baseText;
      const errorCopy   = tShare('share.errorCopy')   || 'Error copiando URL:';
      const copyLabel   = tShare('share.copyLabel')   || 'Copiar enlace';
      const copiedLabel = tShare('share.copiedLabel') || '✔ ¡Copiado!';

      if (type === 'copy') {
        const labelSpan = btn.querySelector('.share-pill-label');
        const icon      = btn.querySelector('i');  // el icono de link

        try {
          await navigator.clipboard.writeText(url);

          // Ocultar tooltip al hacer clic
          if (tooltip) {
            tooltip.classList.remove('is-visible');
          }

          // Estilo de éxito
          btn.classList.add('share-pill--ok');

          // Ocultar icono y texto originales
          if (icon)      icon.style.display = 'none';
          if (labelSpan) labelSpan.style.display = 'none';

          // Crear span temporal con "✔ ¡Copiado!"
          const copiedSpan = document.createElement('span');
          copiedSpan.className = 'share-pill-copied';
          copiedSpan.textContent = copiedLabel;
          btn.appendChild(copiedSpan);

          // Revertir después de 1.2 s y cerrar el panel
          setTimeout(() => {
            btn.classList.remove('share-pill--ok');

            // Quitar el mensaje temporal
            copiedSpan.remove();

            // Mostrar de nuevo icono y texto normal
            if (icon) {
              icon.style.display = 'inline-block';
            }
            if (labelSpan) {
              labelSpan.style.display = 'inline';
              labelSpan.textContent = copyLabel;
            }

            // Ahora sí, cerrar el panel de compartir
            closeShare();
          }, 1200);

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
        closeShare();

      } else if (type === 'facebook') {
        const shareUrl =
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        window.open(shareUrl, '_blank', 'noopener');
        closeShare();

      } else if (type === 'whatsapp') {
        const shareUrl = `https://api.whatsapp.com/send?text=${
          encodeURIComponent(textWa + ' ' + url)
        }`;
        window.open(shareUrl, '_blank', 'noopener');
        closeShare();
      }
    });
  });

  // 3) Cerrar si se hace click fuera del footer
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
