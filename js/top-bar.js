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
    brand.href = path.startsWith('/es') ? '/es/' : '/en/';
  }
});

// ===========================
// 2. Theme toggle
// ===========================
document.addEventListener('DOMContentLoaded', () => {
  const themeToggleBtn = document.querySelector('#themeToggle');
  if (!themeToggleBtn) return;

  const icon = themeToggleBtn.querySelector('i');
  const THEME_KEY = 'gb-theme';

  function isDark() {
    return document.body.classList.contains('dark');
  }

  function applyThemeUI(dark) {
    if (dark) {
      document.body.classList.add('dark');

      if (icon) {
        icon.classList.remove('fa-moon', 'fa-circle-half-stroke');
        icon.classList.add('fa-sun');
      }

      // En dark, el botón muestra a dónde vas: light
      const label = t('theme.lightLabel');
      themeToggleBtn.setAttribute('aria-label', label);
      themeToggleBtn.dataset.label = label;

      localStorage.setItem(THEME_KEY, 'dark');
    } else {
      document.body.classList.remove('dark');

      if (icon) {
        icon.classList.remove('fa-sun', 'fa-circle-half-stroke');
        icon.classList.add('fa-moon');
      }

      // En light, el botón muestra a dónde vas: dark
      const label = t('theme.darkLabel');
      themeToggleBtn.setAttribute('aria-label', label);
      themeToggleBtn.dataset.label = label;

      localStorage.setItem(THEME_KEY, 'light');
    }
  }

  function getPreferredTheme() {
    const saved = localStorage.getItem(THEME_KEY);

    if (saved === 'dark') return true;
    if (saved === 'light') return false;

    return window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  applyThemeUI(getPreferredTheme());

  themeToggleBtn.addEventListener('click', () => {
    applyThemeUI(!isDark());
  });
});
