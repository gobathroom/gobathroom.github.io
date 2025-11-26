// ===========================
// 0. Helper i18n
// ===========================
const I18N = window.GB_I18N || {
  t: (key) => key,
  lang: 'en',
};
const t = I18N.t;

// ===========================
// 1. info acceso-características
// ===========================
(function setupInfoScroll() {
  const infoLink = document.querySelector('.nav-item[data-nav="info"]');
  const accessSection = document.getElementById('info-acceso');

  if (!infoLink || !accessSection) return;

  // Leer altura del header desde la variable CSS
  const rootStyles = getComputedStyle(document.documentElement);
  const headerVar = rootStyles.getPropertyValue('--header-h').trim();
  const headerH = headerVar ? parseInt(headerVar, 10) : 64; // fallback

  function scrollToInfo() {
    const rect = accessSection.getBoundingClientRect();
    const targetY = window.scrollY + rect.top - (headerH + 10);

    window.scrollTo({
      top: targetY,
      behavior: 'smooth',
    });
  }

  infoLink.addEventListener('click', (e) => {
    e.preventDefault();
    scrollToInfo();
  });

})();



// ===========================
// 2. Refresh brand link según idioma
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
// 3. MODO OSCURO / CLARO
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


