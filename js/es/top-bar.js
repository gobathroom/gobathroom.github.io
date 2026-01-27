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
  if (!brand) return;

  const path = window.location.pathname;
  brand.href = path.startsWith('/es') ? '/es' : '/';
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
  if (!icon) return;

  if (dark) {
    document.body.classList.add('dark');
    icon.classList.remove('fa-moon');
    icon.classList.add('fa-sun');

    const label = t('theme.lightLabel');
    themeToggleBtn.setAttribute('aria-label', label);
    themeToggleBtn.dataset.label = label;

    localStorage.setItem('gb-theme', 'dark');
  } else {
    document.body.classList.remove('dark');
    icon.classList.remove('fa-sun');
    icon.classList.add('fa-moon');

    const label = t('theme.darkLabel');
    themeToggleBtn.setAttribute('aria-label', label);
    themeToggleBtn.dataset.label = label;

    localStorage.setItem('gb-theme', 'light');
  }
}

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
// 3. TOPBAR hide/show tipo FB (mobile)
// - Se mueve con el scroll (lento/rápido igual)
// - Al soltar, hace snap (arriba o visible)
// - Sin opacity, sin trabarse
// ===========================
(function setupTopbarFacebookScroll() {
  const topbar = document.querySelector('.topbar');
  if (!topbar) return;

  const isMobile = () => window.matchMedia('(max-width: 600px)').matches;

  // Usa el elemento real que scrollea (más robusto que window.scrollY)
  const getScroller = () => document.scrollingElement || document.documentElement;

  let lastScrollTop = 0;
  let offset = 0;          // 0 = visible, negativo = ocultándose
  let barH = 0;
  let raf = 0;
  let snapTimer = 0;

  const SHOW_AT_TOP = 6;   // cerca del tope, siempre visible
  const SNAP_DELAY = 90;   // ms sin scroll => snap

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function measure() {
    barH = Math.ceil(topbar.getBoundingClientRect().height || 0);
    if (!barH) barH = 90; // fallback
  }

  function applyOffset() {
    topbar.style.setProperty('--tb-offset', `${offset}px`);
  }

  function showSnap() {
    topbar.classList.add('is-snapping');
    offset = 0;
    applyOffset();
    // quitar transición luego del snap
    window.setTimeout(() => topbar.classList.remove('is-snapping'), 160);
  }

  function hideSnap() {
    topbar.classList.add('is-snapping');
    offset = -barH;
    applyOffset();
    window.setTimeout(() => topbar.classList.remove('is-snapping'), 160);
  }

  function snapIfNeeded() {
    if (!isMobile()) return;
    // si está más de la mitad oculto => se oculta completo, si no => vuelve
    if (offset <= -barH / 2) hideSnap();
    else showSnap();
  }

  function onScrollCore() {
    raf = 0;

    if (!isMobile()) {
      topbar.classList.remove('is-snapping');
      topbar.style.removeProperty('--tb-offset');
      return;
    }

    const scroller = getScroller();
    const y = scroller.scrollTop || 0;

    // Siempre visible cerca del top
    if (y <= SHOW_AT_TOP) {
      offset = 0;
      applyOffset();
      lastScrollTop = y;
      return;
    }

    const delta = y - lastScrollTop; // + bajando, - subiendo
    lastScrollTop = y;

    // Durante el scroll NO queremos transición (para que siga el dedo)
    topbar.classList.remove('is-snapping');

    // FB-like: offset se ajusta proporcional al delta
    // Bajando => offset se hace más negativo (se oculta)
    // Subiendo => offset vuelve a 0 (aparece)
    offset = clamp(offset - delta, -barH, 0);
    applyOffset();

    // Snap al final del gesto
    clearTimeout(snapTimer);
    snapTimer = setTimeout(snapIfNeeded, SNAP_DELAY);
  }

  function onScroll() {
    if (!raf) raf = requestAnimationFrame(onScrollCore);
  }

  // Init
  measure();
  lastScrollTop = (getScroller().scrollTop || 0);
  offset = 0;
  applyOffset();

  window.addEventListener('scroll', onScroll, { passive: true });

  // iOS: cuando sueltas, a veces no dispara más scroll => forzamos snap
  window.addEventListener('touchend', () => {
    clearTimeout(snapTimer);
    snapTimer = setTimeout(snapIfNeeded, 0);
  }, { passive: true });

  window.addEventListener('resize', () => {
    measure();
    if (!isMobile()) {
      offset = 0;
      topbar.classList.remove('is-snapping');
      topbar.style.removeProperty('--tb-offset');
    } else {
      // recalcular offset dentro del nuevo alto
      offset = clamp(offset, -barH, 0);
      applyOffset();
      snapIfNeeded();
    }
  });
})();
