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
   FOOTER: TOGGLES + SHARE + CONTACT
   =========================== */

(function setupFooterShare() {
  const footer    = document.querySelector('.site-footer');
  const toggleBtn = document.getElementById('footerShareToggle');
  const shareRow  = document.getElementById('footerShareRow');

  // CONTACT
  const contactBtn = document.getElementById('footerContactToggle');
  const contactRow = document.getElementById('footerContactRow');

  // Si no hay footer, no hay nada que hacer
  if (!footer) return;

  // SHARE elements (pueden no existir en algunas páginas)
  const shareButtons = shareRow ? shareRow.querySelectorAll('.share-pill') : [];
  const copyBtn      = shareRow ? shareRow.querySelector('.share-pill[data-share="copy"]') : null;
  const tooltip      = document.getElementById('shareCopyTooltip');

  // CONTACT elements (opcional: copiar email)
  const contactCopyBtn = contactRow ? contactRow.querySelector('.footer-contact-copy') : null;
  const contactEmailEl = contactRow ? contactRow.querySelector('.footer-contact-email') : null;
  const contactFeedback = contactRow ? contactRow.querySelector('.footer-contact-feedback') : null;

  // Poner el texto inicial del botón "Copiar enlace" según el idioma
  if (copyBtn) {
    const labelSpan = copyBtn.querySelector('.share-pill-label');
    if (labelSpan) {
      labelSpan.textContent = tShare('share.copyLabel') || 'Copiar enlace';
    }
  }

  /* ---------------------------
     SHARE open/close
     --------------------------- */
  function openShare() {
    if (!toggleBtn || !shareRow) return;

    // ⬇️ NUEVO: si Contacto estaba abierto, cerrarlo
    closeContact();

    footer.classList.add('is-sharing');
    toggleBtn.setAttribute('aria-expanded', 'true');
    shareRow.setAttribute('aria-hidden', 'false');

    // preparar el contenido del tooltip (pero no mostrarlo aún)
    if (tooltip) {
      tooltip.textContent = getShareUrl();
    }
  }

  function closeShare() {
    if (!toggleBtn || !shareRow) return;

    footer.classList.remove('is-sharing');
    toggleBtn.setAttribute('aria-expanded', 'false');
    shareRow.setAttribute('aria-hidden', 'true');

    if (tooltip) {
      tooltip.classList.remove('is-visible');
    }
  }

  function toggleShare() {
    if (!toggleBtn || !shareRow) return;

    if (footer.classList.contains('is-sharing')) {
      closeShare();
    } else {
      openShare();
    }
  }

  /* ---------------------------
     CONTACT open/close (nuevo)
     --------------------------- */
  function openContact() {
    if (!contactBtn || !contactRow) return;

    // Cerrar compartir si estaba abierto
    closeShare();

    footer.classList.add('is-contacting');
    contactBtn.setAttribute('aria-expanded', 'true');
    contactRow.setAttribute('aria-hidden', 'false');
  }

  function closeContact() {
    if (!contactBtn || !contactRow) return;

    footer.classList.remove('is-contacting');
    contactBtn.setAttribute('aria-expanded', 'false');
    contactRow.setAttribute('aria-hidden', 'true');

    // limpiar feedback si existía
    if (contactFeedback) contactFeedback.textContent = '';
  }

  function toggleContact() {
    if (!contactBtn || !contactRow) return;

    if (footer.classList.contains('is-contacting')) {
      closeContact();
    } else {
      openContact();
    }
  }

  function closeAllPanels() {
    closeShare();
    closeContact();
  }

  /* ---------------------------
     1) Click en "Compartir"
     --------------------------- */
  if (toggleBtn && shareRow) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleShare();
    });
  }

  /* ---------------------------
     1b) Click en "Contacto" (nuevo)
     --------------------------- */
  if (contactBtn && contactRow) {
    contactBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleContact();
    });
  }

  /* ---------------------------
     Tooltip Copy (share)
     --------------------------- */
  if (copyBtn && tooltip) {
    const showTip = () => {
      tooltip.textContent = getShareUrl(); // por si la URL cambió
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

  /* ---------------------------
     2) Click en botones de compartir
     --------------------------- */
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
  }

  /* ---------------------------
     2b) Copiar email (Contacto) - nuevo
     --------------------------- */
  if (contactCopyBtn) {
    contactCopyBtn.addEventListener('click', async (e) => {
      e.stopPropagation();

      const email =
        contactCopyBtn.dataset.email ||
        (contactEmailEl ? contactEmailEl.textContent.trim() : '');

      if (!email) return;

      // textos (puedes ponerlos en i18n luego si quieres)
      const copiedLabel = tShare('contact.copied') || '✔ Copiado';
      const errorCopy   = tShare('contact.errorCopy') || 'Error copiando correo:';

      try {
        await navigator.clipboard.writeText(email);

        if (contactFeedback) {
          contactFeedback.textContent = copiedLabel;
        }

        // cerrar después de un momento (opcional, como share)
        setTimeout(() => {
          if (contactFeedback) contactFeedback.textContent = '';
          closeContact();
        }, 1200);

      } catch (err) {
        console.error(errorCopy, err);
      }
    });
  }

  /* ---------------------------
     3) Cerrar si se hace click fuera del footer
     --------------------------- */
  document.addEventListener('click', (e) => {
    const sharing    = footer.classList.contains('is-sharing');
    const contacting = footer.classList.contains('is-contacting');
    if (!sharing && !contacting) return;

    const insideFooter = footer.contains(e.target);
    if (!insideFooter) {
      closeAllPanels();
    }
  });

  /* ---------------------------
     4) Cerrar con Escape
     --------------------------- */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllPanels();
    }
  });
})();
