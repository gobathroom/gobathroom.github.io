
// ===========================
// 1.Refresh
// ===========================

document.addEventListener('DOMContentLoaded', () => {
  const brand = document.getElementById('brandLink');

  if (brand) {
    const path = window.location.pathname;

    // Detecta idioma automáticamente
    if (path.startsWith("/es")) {
      brand.href = "/es";
    } else {
      brand.href = "/";
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

    // tooltip + accesibilidad
    themeToggleBtn.setAttribute('aria-label', 'Modo claro');
    themeToggleBtn.dataset.label = 'Modo claro';

    // (opcional) recordar preferencia
    localStorage.setItem('gb-theme', 'dark');
  } else {
    // tema claro
    document.body.classList.remove('dark');

    // icono luna
    icon.classList.remove('fa-sun');
    icon.classList.add('fa-moon');

    themeToggleBtn.setAttribute('aria-label', 'Modo oscuro');
    themeToggleBtn.dataset.label = 'Modo oscuro';

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
// 3. Compartir
// ===========================

document.addEventListener('DOMContentLoaded', () => {
  const shareUrlInput = document.getElementById('shareUrl');
  const copyBtn       = document.getElementById('copyShareUrl');
  const shareBtn      = document.getElementById('shareBtn');
  const shareWrapper  = shareBtn ? shareBtn.closest('.share-wrapper') : null;
  const sharePanel    = document.getElementById('sharePanel');

  // 1) Rellenar URL actual
  if (shareUrlInput) {
    shareUrlInput.value = window.location.href;
  }

  // 2) Copiar + mensaje
  if (copyBtn && shareUrlInput && shareSuccess) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(shareUrlInput.value)
        .then(() => {
          // Mostrar mensaje verde
          shareSuccess.classList.add('copied');
          // Ocultarlo después de 1s
          setTimeout(() => {
            shareSuccess.classList.remove('copied');
          }, 1000);
        })
        .catch(err => {
          console.error('Error copiando URL:', err);
        });
    });
  }

  // 3) Abrir / cerrar panel por click, Esc, click fuera
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



