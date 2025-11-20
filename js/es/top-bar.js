// ===========================
// 0. Helper i18n
// ===========================
const I18N = window.GB_I18N || {
  t: (key) => key,
  lang: 'en',
};
const t = I18N.t;


// ===========================
// 1.Refresh
// ===========================

document.addEventListener('DOMContentLoaded', () => {
  const brand = document.getElementById('brandLink');

  if (brand) {
    const path = window.location.pathname;

    // Detecta idioma automáticamente por la ruta
    if (path.startsWith('/es')) {
      brand.href = '/es';
    } else {
      brand.href = '/';
    }
  }
});


// ===========================
// 2.MODO OSCURO / CLARO
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

    // tooltip + accesibilidad (usando i18n)
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
// 3.0 Compartir
// ===========================

document.addEventListener('DOMContentLoaded', () => {
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
  // 3.1 Rellenar URL actual
  // ===========================
  if (shareUrlInput) {
    shareUrlInput.value = window.location.href;
  }

  // ===========================
  // 3.2 Copiar + animación "copiado correctamente"
  // ===========================
  if (copyBtn && shareUrlInput && shareUrlWrapper && shareSuccess) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(shareUrlInput.value)
        .then(() => {
          // Ocultar pill de URL y mostrar mensaje verde
          shareUrlWrapper.classList.add('copied');

          // Volver al estado normal después de 1s
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
  // 🔥 3.3 BOTONES SOCIALES (FB, X, WhatsApp)
  // ======================================================

  const btnFb = document.getElementById('shareFb');
  const btnX  = document.getElementById('shareX');
  const btnWa = document.getElementById('shareWa');

  const currentUrl = encodeURIComponent(window.location.href);

  // Facebook
  if (btnFb) {
    btnFb.addEventListener('click', () => {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`,
        '_blank'
      );
    });
  }

  // X (Twitter)
  if (btnX) {
    btnX.addEventListener('click', () => {
      window.open(
        `https://twitter.com/intent/tweet?url=${currentUrl}`,
        '_blank'
      );
    });
  }

  // WhatsApp
  if (btnWa) {
    btnWa.addEventListener('click', () => {
      window.open(
        `https://api.whatsapp.com/send?text=${currentUrl}`,
        '_blank'
      );
    });
  }

  // ===========================
  // 3.4 Abrir / cerrar panel
  // ===========================
  if (shareBtn && shareWrapper && sharePanel) {

    function openShare() {
      shareWrapper.classList.add('is-open');
      shareBtn.setAttribute('aria-expanded', 'true');
      sharePanel.setAttribute('aria-hidden', 'false');
    }

    function closeShare() {
      shareWrapper.classList.remove('is-open');
      shareBtn.setAttribute('aria-expanded', 'false');
      sharePanel.setAttribute('aria-hidden', 'true');
    }

    function toggleShare() {
      if (shareWrapper.classList.contains('is-open')) {
        closeShare();
      } else {
        openShare();
      }
    }

    // Click en el icono → abre/cierra
    shareBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleShare();
    });

    // Click fuera → cierra
    document.addEventListener('click', (e) => {
      if (
        shareWrapper.classList.contains('is-open') &&
        !shareWrapper.contains(e.target)
      ) {
        closeShare();
      }
    });

    // Tecla Escape → cierra
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && shareWrapper.classList.contains('is-open')) {
        closeShare();
      }
    });
  }
});
