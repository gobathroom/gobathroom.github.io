// ===========================
// TOP BAR INTERACTIONS
// ===========================
document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const hamburger = document.querySelector('.hamburger');

  if (!hamburger) return;

  // Inicializamos aria-expanded
  const syncAria = () => {
    const open = body.classList.contains('sidebar-open');
    hamburger.setAttribute('aria-expanded', String(open));
  };

  hamburger.addEventListener('click', () => {
    body.classList.toggle('sidebar-open');
    syncAria();
  });

  // Estado inicial
  syncAria();
});
