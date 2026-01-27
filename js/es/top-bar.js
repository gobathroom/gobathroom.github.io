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
    brand.href = path.startsWith('/es') ? '/es' : '/';
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
    document.body.classList.add('dark');
    if (icon) {
      icon.classList.remove('fa-moon');
      icon.classList.add('fa-sun');
    }

    const label = t('theme.lightLabel');
    themeToggleBtn.setAttribute('aria-label', label);
    themeToggleBtn.dataset.label = label;

    localStorage.setItem('gb-theme', 'dark');
  } else {
    document.body.classList.remove('dark');
    if (icon) {
      icon.classList.remove('fa-sun');
      icon.classList.add('fa-moon');
    }

    const label = t('theme.darkLabel');
    themeToggleBtn.setAttribute('aria-label', label);
    themeToggleBtn.dataset.label = label;

    localStorage.setItem('gb-theme', 'light');
  }
}

// Estado inicial
(() => {
  if (!themeToggleBtn) return;

  const saved = localStorage.getItem('gb-theme');
  let startDark = false;

  if (saved === 'dark') startDark = true;
  else if (saved === 'light') startDark = false;
  else if (window.matchMedia) startDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  applyThemeUI(startDark);

  themeToggleBtn.addEventListener('click', () => {
    applyThemeUI(!isDark());
  });
})();

// ===========================
// 3. TOPBAR SCROLL (solo mobile)
// ===========================
(() => {
  const mobileQuery = window.matchMedia('(max-width: 600px)');
  const topbar = document.querySelector('.topbar');

  if (!topbar) return;

  let lastScrollY = window.scrollY;
  let ticking = false;

  function onScroll() {
    if (!mobileQuery.matches) return;

    const currentY = window.scrollY;
    const diff = currentY - lastScrollY;

    // Evita micro-scrolls
    if (Math.abs(diff) < 6) return;

    if (diff > 0 && currentY > 80) {
      // Scroll DOWN → ocultar
      topbar.classList.add('is-hidden');
    } else {
      // Scroll UP → mostrar
      topbar.classList.remove('is-hidden');
    }

    lastScrollY = currentY;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        onScroll();
        ticking = false;
      });
      ticking = true;
    }
  });

  // Reset automático si cambia a desktop
  mobileQuery.addEventListener('change', () => {
    topbar.classList.remove('is-hidden');
  });
})();

