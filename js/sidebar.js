/* =========================================================
   1) SIDEBAR TOGGLE (header mobile + rail button) (2/-)
   ========================================================= */

const togglers = document.querySelectorAll('.hamburger, .rail-toggle');

function syncBrandA11y(open) {
  // La marca de la topbar se oculta visualmente vía CSS cuando open=true.
  // Aquí solo reflejamos accesibilidad.
  const topbarBrand = document.querySelector('.topbar .brand');
  if (topbarBrand) {
    topbarBrand.setAttribute('aria-hidden', open ? 'true' : 'false');
  }
}

function reflectAria(open) {
  togglers.forEach(btn => {
    if (btn.hasAttribute('aria-expanded')) {
      btn.setAttribute('aria-expanded', String(open));
    }
  });
}

function setSidebar(open) {
  body.classList.toggle('sidebar-open', open);
  reflectAria(open);
  syncBrandA11y(open);

  // Si existe la función para esconder el tooltip del rail, la usamos
  if (typeof hideRailTipNow === 'function') {
    hideRailTipNow();
  }
}

function toggleSidebar() {
  setSidebar(!body.classList.contains('sidebar-open'));
}

togglers.forEach(btn => btn.addEventListener('click', toggleSidebar));

// Cerrar al hacer click fuera (sólo en móvil)
document.addEventListener('click', (e) => {
  if (!body.classList.contains('sidebar-open')) return;

  const clickedInside = e.target.closest('.sidebar, .hamburger, .rail-toggle');
  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  if (!clickedInside && isMobile) {
    setSidebar(false);
  }
});

// Esc NO cierra el sidebar en desktop; solo en móvil y si no hay popovers abiertos
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;

  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  // Puede que sharePop aún no exista, por eso usamos typeof
  const shareOpen = (typeof sharePop !== 'undefined') && sharePop && !sharePop.hidden;

  // Si algún popover está abierto, dejamos que sus propios handlers gestionen Esc
  if (shareOpen || themeOpen) return;

  // Solo en móvil cerramos el sidebar con Esc
  if (isMobile && body.classList.contains('sidebar-open')) {
    setSidebar(false);
  }
});

// Sincronizar estado de marca y aria al cargar
const initiallyOpen = body.classList.contains('sidebar-open');
reflectAria(initiallyOpen);
syncBrandA11y(initiallyOpen);
