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
// 3. TOPBAR SCROLL (solo mobile) - versión estable
// ===========================
(() => {
  const mq = window.matchMedia('(max-width: 600px)');
  const topbar = document.querySelector('.topbar');
  if (!topbar) return;

  let lastY = window.scrollY;
  let acc = 0;              // acumulador para evitar parpadeo
  const THRESH = 18;        // sensibilidad (más alto = menos cambios)
  let enabled = false;

  function setBodyOffset() {
    // altura real del topbar (2 filas)
    const h = topbar.getBoundingClientRect().height;
    document.documentElement.style.setProperty('--topbar-h', `${h}px`);
  }

  function enable() {
    enabled = true;
    topbar.classList.remove('is-hidden');
    setBodyOffset();
  }

  function disable() {
    enabled = false;
    topbar.classList.remove('is-hidden');
    document.documentElement.style.setProperty('--topbar-h', `0px`);
  }

  function onScroll() {
    if (!enabled) return;

    const y = window.scrollY;

    // Si estás arriba de todo, siempre visible
    if (y <= 0) {
      topbar.classList.remove('is-hidden');
      lastY = y;
      acc = 0;
      return;
    }

    const dy = y - lastY;
    lastY = y;

    // ignora micro scrolls
    if (Math.abs(dy) < 2) return;

    // acumula movimiento para decidir
    acc += dy;

    if (acc > THRESH && y > 80) {
      // bajando
      topbar.classList.add('is-hidden');
      acc = 0;
    } else if (acc < -THRESH) {
      // subiendo
      topbar.classList.remove('is-hidden');
      acc = 0;
    }
  }

  // listener suave
  window.addEventListener('scroll', onScroll, { passive: true });

  // recalcular altura si cambia orientación o carga algo
  window.addEventListener('resize', () => {
    if (mq.matches) setBodyOffset();
  }, { passive: true });

  // activar/desactivar según viewport
  function sync() {
    if (mq.matches) enable();
    else disable();
  }

  // para Safari viejo, change puede no existir como addEventListener
  if (mq.addEventListener) mq.addEventListener('change', sync);
  else mq.addListener(sync);

  // inicia
  sync();
})();


