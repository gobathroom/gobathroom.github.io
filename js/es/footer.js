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
   FOOTER: TOGGLES (SHARE + CONTACT)
   =========================== */

(function setupFooterPanels() {
  const footer = document.querySelector('.site-footer');

  // SHARE
  const shareToggleBtn = document.getElementById('footerShareToggle');
  const shareRow       = document.getElementById('footerShareRow');

  // CONTACT
  const contactToggleBtn = document.getElementById('footerContactToggle');
  const contactRow       = document.getElementById('footerContactRow');

  if (!footer) return;

  /* ---------------------------
     SHARE: elementos internos
     --------------------------- */
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

  function openShare() {
    // Cierra contacto si está abierto
    closeContact();

    footer.classList.add('is-sharing');
    if (shareToggleBtn) shareToggleBtn.setAttribute('aria-expanded', 'true');
    if (shareRow) shareRow.setAttribute('aria-hidden', 'false');

    if (tooltip) {
      tooltip.textContent = getShareUrl();
    }
  }

  function closeShare() {
    footer.classList.remove('is-sharing');
    if (shareToggleBtn) shareToggleBtn.setAttribute('aria-expanded', 'false');
    if (shareRow) shareRow.setAttribute('aria-hidden', 'true');

    if (tooltip) {
      tooltip.classList.remove('is-visible');
    }
  }

  function toggleShare() {
    if (footer.classList.contains('is-sharing')) closeShare();
    else openShare();
  }

  /* ---------------------------
     CONTACT: elementos internos
     (reutilizando tus clases del legal)
     --------------------------- */
  const contactCopyBtn   = contactRow ? contactRow.querySelector('.email-copy-btn') : null;
  const contactEmailLink = contactRow ? contactRow.querySelector('.legal-email-link') : null;
  const contactFeedback  = contactRow ? contactRow.querySelector('.email-copy-feedback') : null;

  function openContact() {
    // Cierra share si está abierto
    closeShare();

    footer.classList.add('is-contacting');
    if (contactToggleBtn) contactToggleBtn.setAttribute('aria-expanded', 'true');
    if (contactRow) contactRow.setAttribute('aria-hidden', 'false');
  }

  function closeContact() {
    footer.classList.remove('is-contacting');
    if (contactToggleBtn) contactToggleBtn.setAttribute('aria-expanded', 'false');
    if (contactRow) contactRow.setAttribute('aria-hidden', 'true');

    // Limpia feedback si queda algo
    if (contactFeedback) contactFeedback.textContent = '';
  }

  function toggleContact() {
    if (footer.classList.contains('is-contacting')) closeContact();
    else openContact();
  }

  /* ---------------------------
     1) Click en toggles
     --------------------------- */
  if (shareToggleBtn) {
    shareToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleShare();
    });
  }

  if (contactToggleBtn) {
    contactToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleContact();
    });
  }

  /* ---------------------------
     SHARE: Tooltip hover/focus
     --------------------------- */
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

  /* ---------------------------
     2) SHARE: Click en botones
     --------------------------- */
  if (shareButtons && shareButtons.forEach) {
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

  /* ---------------------------
   3) CONTACT: Copiar correo + cerrar panel (robusto)
   --------------------------- */
let contactCloseTimer = null;

if (contactCopyBtn) {
  contactCopyBtn.addEventListener('click', async (e) => {
    e.stopPropagation();

    // Si por accidente hay otro listener global, esto ayuda a que no "rebote"
    // (opcional, pero recomendado)
    // e.preventDefault();

    const email =
      (contactCopyBtn.dataset && contactCopyBtn.dataset.email)
        ? contactCopyBtn.dataset.email
        : (contactEmailLink ? contactEmailLink.textContent.trim() : '');

    const errorCopyEmail  = tShare('contact.errorCopy') || 'Error copiando correo:';
    const copiedEmailText = tShare('contact.copied')    || '¡Correo copiado!';

    try {
      await navigator.clipboard.writeText(email);

      if (contactFeedback) contactFeedback.textContent = copiedEmailText;

      // Evita que se acumulen timeouts si hacen click varias veces
      if (contactCloseTimer) clearTimeout(contactCloseTimer);

      contactCloseTimer = setTimeout(() => {
        closeContact();

        // Fallback extra por si algún CSS/JS externo dejó display forzado
        if (contactRow) {
          contactRow.style.display = 'none';
          // y limpiamos para que al abrir de nuevo lo controle el CSS
          setTimeout(() => contactRow.style.removeProperty('display'), 0);
        }

        contactCloseTimer = null;
      }, 1200);

    } catch (err) {
      console.error(errorCopyEmail, err);
    }
  });
}

  /* ---------------------------
     4) Cerrar si se hace click fuera del footer
     --------------------------- */
  document.addEventListener('click', (e) => {
    const insideFooter = footer.contains(e.target);

    if (!insideFooter) {
      // Cierra ambos si están abiertos
      if (footer.classList.contains('is-sharing')) closeShare();
      if (footer.classList.contains('is-contacting')) closeContact();
      return;
    }

    // Si el click fue dentro del footer pero fuera de los paneles y fuera de los toggles, cierra.
    const inShareRow   = shareRow ? shareRow.contains(e.target) : false;
    const inContactRow = contactRow ? contactRow.contains(e.target) : false;

    const isShareToggle   = shareToggleBtn ? shareToggleBtn.contains(e.target) : false;
    const isContactToggle = contactToggleBtn ? contactToggleBtn.contains(e.target) : false;

    if (footer.classList.contains('is-sharing') && !inShareRow && !isShareToggle) {
      closeShare();
    }
    if (footer.classList.contains('is-contacting') && !inContactRow && !isContactToggle) {
      closeContact();
    }
  });

  /* ---------------------------
     5) Cerrar con Escape
     --------------------------- */
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;

    if (footer.classList.contains('is-sharing')) closeShare();
    if (footer.classList.contains('is-contacting')) closeContact();
  });
})();
