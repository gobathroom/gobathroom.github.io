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
// 3. TOPBAR hide/show PROGRESIVO (solo mobile)
//   - Sin opacity
//   - Si el scroll es lento: se mueve poco a poco (tipo FB)
// ===========================
(function setupTopbarAutoHideMobile() {
  const topbar = document.querySelector('.topbar');
  if (!topbar) return;

  const isMobile = () => window.matchMedia('(max-width: 600px)').matches;
  const reduceMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let lastY = window.scrollY || 0;
  let offset = 0; // 0 ... -H
  let H = 0;

  const SHOW_AT_TOP = 10; // cerca del top: siempre visible
  const SNAP_THRESHOLD = 0.35; // al soltar scroll, "snap" a abierto/cerrado

  function measure() {
    // altura real del topbar (en mobile cambia)
    H = topbar.getBoundingClientRect().height || 0;
    // clamp por si cambió la altura
    offset = Math.max(-H, Math.min(0, offset));
    topbar.style.setProperty('--tb-offset', `${offset}px`);
  }

  function applyOffset(next) {
    offset = Math.max(-H, Math.min(0, next));
    topbar.style.setProperty('--tb-offset', `${offset}px`);
  }

  // Opcional: “snap” cuando paras de scrollear (muy FB)
  let snapTimer = 0;
  function scheduleSnap() {
    clearTimeout(snapTimer);
    snapTimer = setTimeout(() => {
      if (!isMobile() || reduceMotion()) return;
      if (H <= 0) return;

      const hiddenRatio = Math.abs(offset) / H; // 0..1
      if (hiddenRatio > SNAP_THRESHOLD) {
        // más oculto que visible => cierra completo
        applyOffset(-H);
      } else {
        // más visible => abre completo
        applyOffset(0);
      }
    }, 120);
  }

  function onScroll() {
    if (!isMobile() || reduceMotion()) {
      // Desktop o reduce motion => visible
      topbar.style.setProperty('--tb-offset', `0px`);
      lastY = window.scrollY || 0;
      return;
    }

    const y = window.scrollY || 0;

    // Cerca del top siempre visible
    if (y <= SHOW_AT_TOP) {
      applyOffset(0);
      lastY = y;
      return;
    }

    const delta = y - lastY;

    // Scroll DOWN => esconder (offset baja hacia -H)
    // Scroll UP   => mostrar (offset sube hacia 0)
    // IMPORTANTE: delta positivo = down
    applyOffset(offset - delta);

    lastY = y;
    scheduleSnap();
  }

  // Init
  measure();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Resize / rotación
  window.addEventListener('resize', () => {
    measure();
    lastY = window.scrollY || 0;
  });

  // Por si el contenido carga tarde (fuentes, etc.)
  window.addEventListener('load', measure);
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


