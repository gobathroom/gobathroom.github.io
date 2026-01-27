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

// Scroll


document.addEventListener('DOMContentLoaded', () => {
  const mq = window.matchMedia('(max-width: 600px)');
  const topbar = document.querySelector('.topbar');
  const scroller = document.querySelector('.content'); // <-- tu contenedor con scroll

  if (!topbar || !scroller) return;

  function setOffset() {
    const h = Math.ceil(topbar.getBoundingClientRect().height);
    document.documentElement.style.setProperty('--gb-topbar-h', `${h}px`);
  }

  let lastY = scroller.scrollTop;
  let acc = 0;
  const THRESH = 20;

  function reset() {
    topbar.classList.remove('gb-hide');
    acc = 0;
    lastY = scroller.scrollTop;
    setOffset();
  }

  function onScroll() {
    if (!mq.matches) return;

    const y = scroller.scrollTop;
    const dy = y - lastY;
    lastY = y;

    if (y < 10) {
      topbar.classList.remove('gb-hide');
      acc = 0;
      return;
    }

    if (Math.abs(dy) < 2) return;

    acc += dy;

    if (acc > THRESH && y > 80) {
      // bajando
      topbar.classList.add('gb-hide');
      acc = 0;
    } else if (acc < -THRESH) {
      // subiendo
      topbar.classList.remove('gb-hide');
      acc = 0;
    }
  }

  // escuchar el scroll DEL CONTENEDOR, no window
  scroller.addEventListener('scroll', onScroll, { passive: true });

  window.addEventListener('resize', () => {
    if (mq.matches) setOffset();
  }, { passive: true });

  if (mq.addEventListener) mq.addEventListener('change', reset);
  else mq.addListener(reset);

  reset();
});

