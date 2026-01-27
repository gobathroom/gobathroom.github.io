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
// 3. TOPBAR hide/show en scroll (mobile) — ESTABLE
// ===========================
(function setupTopbarHideShowMobile() {
  const topbar = document.querySelector('.topbar');
  if (!topbar) return;

  const isMobile = () => window.matchMedia('(max-width: 600px)').matches;

  // Ajustes anti-bugs
  const MIN_DELTA = 8;      // ignora micro movimientos
  const SHOW_AT_TOP = 5;    // cerca del top, siempre visible

  let lastY = window.scrollY || 0;
  let lastStateHidden = false;
  let raf = 0;

  function setHidden(hidden) {
    if (hidden === lastStateHidden) return; // evita toggles repetidos
    lastStateHidden = hidden;

    if (hidden) topbar.classList.add('is-hidden');
    else topbar.classList.remove('is-hidden');
  }

  function onScrollCore() {
    raf = 0;

    // si no es mobile, no hacemos nada
    if (!isMobile()) {
      setHidden(false);
      lastY = window.scrollY || 0;
      return;
    }

    const y = window.scrollY || 0;

    // iOS rubber band puede dar negativos
    if (y <= SHOW_AT_TOP) {
      setHidden(false);
      lastY = y;
      return;
    }

    const delta = y - lastY;

    // ignora micro scroll
    if (Math.abs(delta) < MIN_DELTA) return;

    // Bajando => esconder
    if (delta > 0) {
      setHidden(true);
    } else {
      // Subiendo => mostrar
      setHidden(false);
    }

    lastY = y;
  }

  window.addEventListener('scroll', () => {
    if (!raf) raf = requestAnimationFrame(onScrollCore);
  }, { passive: true });

  // Al terminar una interacción, recalcula para evitar “mitad”
  window.addEventListener('touchend', () => {
    if (!raf) raf = requestAnimationFrame(onScrollCore);
  }, { passive: true });

  window.addEventListener('resize', () => {
    if (!isMobile()) setHidden(false);
    lastY = window.scrollY || 0;
  });

  // Estado inicial
  setHidden(false);
})();
