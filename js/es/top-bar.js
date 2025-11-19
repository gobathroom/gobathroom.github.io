
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

