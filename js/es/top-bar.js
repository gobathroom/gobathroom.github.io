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

    if (path.startsWith('/es')) {
      brand.href = '/es';
    } else {
      brand.href = '/';
    }
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
    // activar tema oscuro
    document.body.classList.add('dark');

    // icono sol
    icon.classList.remove('fa-moon');
    icon.classList.add('fa-sun');

    // tooltip + accesibilidad
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
// 3. TOPBAR hide/show en scroll (solo mobile)
// ===========================
(function setupTopbarAutoHideMobile() {
  const topbar = document.querySelector('.topbar');
  if (!topbar) return;

  // Solo mobile
  const isMobile = () => window.matchMedia('(max-width: 600px)').matches;

  let lastY = window.scrollY || 0;
  let ticking = false;

  // Ajustes finos (tipo FB)
  const MIN_SCROLL = 12;     // ignora micro-movimientos
  const SHOW_AT_TOP = 10;    // si estás casi arriba, siempre mostrar
  const LOCK_AFTER_SHOW = 200; // ms: evita parpadeo luego de mostrar

  let lockedUntil = 0;       // tiempo hasta el cual no ocultamos (anti-parpadeo)

  function showBar() {
    topbar.classList.remove('is-hidden');
    lockedUntil = Date.now() + LOCK_AFTER_SHOW;
  }

  function hideBar() {
    // si estamos “bloqueados”, no ocultar
    if (Date.now() < lockedUntil) return;
    topbar.classList.add('is-hidden');
  }

  function onScroll() {
    if (!isMobile()) {
      // si sales de mobile, que quede normal
      topbar.classList.remove('is-hidden');
      lastY = window.scrollY || 0;
      return;
    }

    const y = window.scrollY || 0;

    // Siempre mostrar cerca del top
    if (y <= SHOW_AT_TOP) {
      showBar();
      lastY = y;
      return;
    }

    const delta = y - lastY;

    // Ignorar micro scroll
    if (Math.abs(delta) < MIN_SCROLL) return;

    // Scroll down => esconder
    if (delta > 0) {
      hideBar();
    } else {
      // Scroll up => mostrar
      showBar();
    }

    lastY = y;
  }

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          onScroll();
          ticking = false;
        });
        ticking = true;
      }
    },
    { passive: true }
  );

  // Si cambia el tamaño (rotación / resize) recalcular
  window.addEventListener('resize', () => {
    if (!isMobile()) topbar.classList.remove('is-hidden');
    lastY = window.scrollY || 0;
  });
})();




//____________________________________________________________________________________________________________//
//                                                /ES/AVISOS/                                                 //
//____________________________________________________________________________________________________________//


// ===========================
// 2. Buscador
// ===========================


(function setupNoticeSearch() {
  const form   = document.querySelector('.page-avisos .notice-search');
  if (!form) return;

  const field   = form.querySelector('.notice-search-field');
  const input   = form.querySelector('#noticeSearchInput');
  const clearBtn= form.querySelector('.notice-clear-btn');
  const iconBtn = form.querySelector('.notice-search-icon');

  if (!field || !input) return;

  function updateState() {
    if (input.value.trim()) {
      field.classList.add('has-text');
    } else {
      field.classList.remove('has-text');
    }
  }

  // Mostrar / ocultar X según haya texto
  input.addEventListener('input', updateState);

  // Botón X: limpia y vuelve a enfocar
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      input.value = '';
      updateState();
      input.focus();
    });
  }

  // Lupa: por ahora solo evita recarga y enfoca (luego aquí pondremos el filtro real)
  if (iconBtn) {
    iconBtn.addEventListener('click', (e) => {
      e.preventDefault();
      // Aquí en el futuro: lógica de búsqueda / filtrado
      input.focus();
    });
  }

  // Evitar que el form recargue la página (hasta que tengas backend / filtro)
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    // Aquí ira tu lógica real de búsqueda
    // const query = input.value.trim();
  });

  // Estado inicial
  updateState();
})();


