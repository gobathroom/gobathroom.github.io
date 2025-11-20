
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

  if (shareUrlInput) {
    // URL actual de la página
    shareUrlInput.value = window.location.href;
  }

  if (copyBtn && shareUrlInput) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(shareUrlInput.value)
        .then(() => {
          // Pequeño feedback visual
          const originalText = copyBtn.textContent;
          copyBtn.textContent = 'Copied';
          setTimeout(() => {
            copyBtn.textContent = originalText;
          }, 1200);
        })
        .catch(err => {
          console.error('Error copiando URL:', err);
        });
    });
  }

  // Opcional: marcar aria-expanded para accesibilidad
  if (shareBtn) {
    const wrapper = shareBtn.closest('.share-wrapper');
    ['mouseenter', 'focus'].forEach(evt =>
      wrapper.addEventListener(evt, () => shareBtn.setAttribute('aria-expanded', 'true'))
    );
    ['mouseleave', 'blur'].forEach(evt =>
      wrapper.addEventListener(evt, () => shareBtn.setAttribute('aria-expanded', 'false'))
    );
  }
});


