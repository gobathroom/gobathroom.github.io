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
    'terms',
    'terminos-de-uso',
    'terms-of-use'
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
   FOOTER: SHARE + CONTACT TOGGLES
   =========================== */

(function setupFooterPanels() {
  const footer = document.querySelector('.site-footer');
  if (!footer) return;

  // SHARE
  const shareToggle = document.getElementById('footerShareToggle');
  const shareRow    = document.getElementById('footerShareRow');

  // CONTACT
  const contactToggle = document.getElementById('footerContactToggle');
  const contactRow    = document.getElementById('footerContactRow');

  // Si no existe share ni contacto, salir
  if (!shareToggle && !contactToggle) return;

  // ----- SHARE internals (mantiene tu lógica) -----
  const shareButtons = shareRow ? shareRow.querySelectorAll('.share-pill') : [];
  const copyBtn      = shareRow ? shareRow.querySelector('.share-pill[data-share="copy"]') : null;
  const tooltip      = document.getElementById('shareCopyTooltip');

  // Poner el texto inicial del botón "Copiar enlace" según el idioma
  if (copyBtn) {
    const labelSpan = copyBtn.querySelector('.share-pill-label');
    if (labelSpan) {
      labelSpan.textContent = tShare('share.copyLabel') || 'Copiar enlace';
    }
  }

  // ----- CONTACT internals (reusa tus clases legales) -----
  const contactCopyBtn = contactRow ? contactRow.querySelector('.email-copy-btn') : null;
  const contactFeedback = contactRow ? contactRow.querySelector('.email-copy-feedback') : null;

  // Helpers: abrir/cerrar (solo 1 panel)
  function closeShare() {
    if (!shareToggle || !shareRow) return;
    footer.classList.remove('is-sharing');
    shareToggle.setAttribute('aria-expanded', 'false');
    shareRow.setAttribute('aria-hidden', 'true');
    if (tooltip) tooltip.classList.remove('is-visible');
  }

  function openShare() {
    if (!shareToggle || !shareRow) return;
    // cerrar contacto si está abierto
    closeContact();

    footer.classList.add('is-sharing');
    shareToggle.setAttribute('aria-expanded', 'true');
    shareRow.setAttribute('aria-hidden', 'false');

    if (tooltip) tooltip.textContent = getShareUrl();
  }

  function toggleShare() {
    if (footer.classList.contains('is-sharing')) closeShare();
    else openShare();
  }

  function closeContact() {
    if (!contactToggle || !contactRow) return;
    footer.classList.remove('is-contacting');
    contactToggle.setAttribute('aria-expanded', 'false');
    contactRow.setAttribute('aria-hidden', 'true');

    // limpiar feedback si quieres (opcional)
    if (contactFeedback) contactFeedback.textContent = '';
  }

  function openContact() {
    if (!contactToggle || !contactRow) return;
    // cerrar share si está abierto
    closeShare();

    footer.classList.add('is-contacting');
    contactToggle.setAttribute('aria-expanded', 'true');
    contactRow.setAttribute('aria-hidden', 'false');
  }

  function toggleContact() {
    if (footer.classList.contains('is-contacting')) closeContact();
    else openContact();
  }

  // Click en toggles
  if (shareToggle) {
    shareToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleShare();
    });
  }

  if (contactToggle) {
    contactToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleContact();
    });
  }

  // Tooltip: mostrar solo hover/focus del botón copiar enlace
  if (copyBtn && tooltip) {
    const showTip = () => {
      tooltip.textContent = getShareUrl();
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

  // Botones de compartir
  if (shareButtons && shareButtons.length) {
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
          const icon      = btn.querySelector('i');

          try {
            await navigator.clipboard.writeText(url);

            if (tooltip) tooltip.classList.remove('is-visible');

            btn.classList.add('share-pill--ok');
            if (icon)      icon.style.display = 'none';
            if (labelSpan) labelSpan.style.display = 'none';

            const copiedSpan = document.createElement('span');
            copiedSpan.className = 'share-pill-copied';
            copiedSpan.textContent = copiedLabel;
            btn.appendChild(copiedSpan);

            setTimeout(() => {
              btn.classList.remove('share-pill--ok');
              copiedSpan.remove();

              if (icon) icon.style.display = 'inline-block';
              if (labelSpan) {
                labelSpan.style.display = 'inline';
                labelSpan.textContent = copyLabel;
              }

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
  }

  // Copiar correo (reutiliza tu data-email)
  if (contactCopyBtn) {
    contactCopyBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const email = contactCopyBtn.getAttribute('data-email') || 'contact@gobathroom.io';

      try {
        await navigator.clipboard.writeText(email);
        if (contactFeedback) {
          // si luego quieres i18n para esto, lo agregamos
          contactFeedback.textContent = '✔ Copiado';
        }
        setTimeout(() => {
          if (contactFeedback) contactFeedback.textContent = '';
          closeContact();
        }, 1200);

      } catch (err) {
        console.error('Error copiando email:', err);
      }
    });
  }

  // Cerrar si se hace click fuera del footer
  document.addEventListener('click', (e) => {
    const insideFooter = footer.contains(e.target);

    if (!insideFooter) {
      if (footer.classList.contains('is-sharing')) closeShare();
      if (footer.classList.contains('is-contacting')) closeContact();
    }
  });

  // Cerrar con Escape
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (footer.classList.contains('is-sharing')) closeShare();
    if (footer.classList.contains('is-contacting')) closeContact();
  });
})();
