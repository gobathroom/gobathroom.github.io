// ===========================
// 0. Helper i18n
// ===========================
const I18N = window.GB_I18N || {
  t: (key) => key,
  lang: 'en',
};
const t = I18N.t;


// ===========================
// 1. Refresh brand link según idioma
// ===========================
document.addEventListener('DOMContentLoaded', () => {
  const brand = document.getElementById('brandLink');

  if (brand) {
    const path = window.location.pathname;

    if (path.startsWith('/es')) {
      brand.href = '/es';
    } else {
      brand.href = '/';
    }
  }
});


// ===========================
// 2. MODO OSCURO / CLARO
// ===========================
const themeToggleBtn = document.querySelector('#themeToggle');

function isDark() {
  return document.body.classList.contains('dark');
}

function applyThemeUI(dark) {
  if (!themeToggleBtn) return;
  const icon = themeToggleBtn.querySelector('i');

  if (dark) {
    // activar tema oscuro
    document.body.classList.add('dark');

    // icono sol
    icon.classList.remove('fa-moon');
    icon.classList.add('fa-sun');

    // tooltip + accesibilidad
    const label = t('theme.lightLabel');
    themeToggleBtn.setAttribute('aria-label', label);
    themeToggleBtn.dataset.label = label;

    // recordar preferencia
    localStorage.setItem('gb-theme', 'dark');
  } else {
    // tema claro
    document.body.classList.remove('dark');

    // icono luna
    icon.classList.remove('fa-sun');
    icon.classList.add('fa-moon');

    const label = t('theme.darkLabel');
    themeToggleBtn.setAttribute('aria-label', label);
    themeToggleBtn.dataset.label = label;

    localStorage.setItem('gb-theme', 'light');
  }
}

// Estado inicial: leer de localStorage o del sistema
(() => {
  if (!themeToggleBtn) return;

  const saved = localStorage.getItem('gb-theme');
  let startDark = false;

  if (saved === 'dark') {
    startDark = true;
  } else if (saved === 'light') {
    startDark = false;
  } else if (window.matchMedia) {
    // si no hay preferencia guardada, usar preferencia del sistema
    startDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  applyThemeUI(startDark);

  themeToggleBtn.addEventListener('click', () => {
    const nextDark = !isDark();
    applyThemeUI(nextDark);
  });
})();


// ===========================
// 3. TOPBAR: Compartir
// ===========================
document.addEventListener('DOMContentLoaded', () => {
  // ---- Elementos principales de Compartir ----
  const shareUrlInput   = document.getElementById('shareUrl');
  const copyBtn         = document.getElementById('copyShareUrl');
  const shareBtn        = document.getElementById('shareBtn');
  const shareWrapper    = shareBtn ? shareBtn.closest('.share-wrapper') : null;
  const sharePanel      = document.getElementById('sharePanel');
  const shareUrlWrapper = document.getElementById('shareUrlWrapper');
  const shareSuccess    = shareUrlWrapper
    ? shareUrlWrapper.querySelector('.share-success')
    : null;

  // ===========================
  // 3.1 Compartir: rellenar URL actual
  // ===========================
  if (shareUrlInput) {
    shareUrlInput.value = window.location.href;
  }

  // ===========================
  // 3.2 Compartir: copiar + animación
  // ===========================
  if (copyBtn && shareUrlInput && shareUrlWrapper && shareSuccess) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(shareUrlInput.value)
        .then(() => {
          // Animación de "copiado correctamente"
          shareUrlWrapper.classList.add('copied');
          setTimeout(() => {
            shareUrlWrapper.classList.remove('copied');
          }, 1000);
        })
        .catch(err => {
          console.error(t('share.errorCopy'), err);
        });
    });
  }

  // ======================================================
  // 3.3 Compartir: botones sociales (FB, X, WhatsApp)
  // ======================================================
  const btnFb = document.getElementById('shareFb');
  const btnX  = document.getElementById('shareX');
  const btnWa = document.getElementById('shareWa');

  const rawUrl     = window.location.href;
  const currentUrl = encodeURIComponent(rawUrl);

  const textX  = encodeURIComponent(t('share.msgX'));
  const textWa = encodeURIComponent(`${t('share.msgWa')} ${rawUrl}`);

  // Facebook (solo URL)
  if (btnFb) {
    btnFb.addEventListener('click', () => {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`,
        '_blank',
        'noopener,noreferrer'
      );
    });
  }

  // X (texto + URL)
  if (btnX) {
    btnX.addEventListener('click', () => {
      window.open(
        `https://twitter.com/intent/tweet?text=${textX}&url=${currentUrl}`,
        '_blank',
        'noopener,noreferrer'
      );
    });
  }

  // WhatsApp (mensaje completo)
  if (btnWa) {
    btnWa.addEventListener('click', () => {
      window.open(
        `https://api.whatsapp.com/send?text=${textWa}`,
        '_blank',
        'noopener,noreferrer'
      );
    });
  }

  // ======================================================
  // 3.4 Compartir: abrir / cerrar panel
  // ======================================================
  function closeShare() {
    if (!shareWrapper) return;
    shareWrapper.classList.remove('is-open');
    if (shareBtn)   shareBtn.setAttribute('aria-expanded', 'false');
    if (sharePanel) sharePanel.setAttribute('aria-hidden', 'true');
  }

  function openShare() {
    if (!shareWrapper) return;
    shareWrapper.classList.add('is-open');
    if (shareBtn)   shareBtn.setAttribute('aria-expanded', 'true');
    if (sharePanel) sharePanel.setAttribute('aria-hidden', 'false');
  }

  function toggleShare() {
    if (!shareWrapper) return;
    if (shareWrapper.classList.contains('is-open')) {
      closeShare();
    } else {
      openShare();
    }
  }

  // Click en el icono de compartir → abre/cierra
  if (shareBtn && shareWrapper && sharePanel) {
    shareBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleShare();
    });
  }

  // Click fuera → cierra solo el panel de compartir
  document.addEventListener('click', (e) => {
    if (!shareWrapper) return;
    const insideShare = shareWrapper.contains(e.target);
    if (!insideShare) {
      closeShare();
    }
  });

  // Escape → cierra el panel de compartir
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeShare();
    }
  });
});
