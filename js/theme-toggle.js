/* =========================================================
   1) THEME: Light / Dark – un solo botón (#themeToggle) (3/-)
   ========================================================= */

// Botón en el footer del rail
const themeToggleBtn = $('#themeToggle');              // <button id="themeToggle" ...>
const themeIcon      = themeToggleBtn ? themeToggleBtn.querySelector('.theme-icon')  : null;
const themeLabel     = themeToggleBtn ? themeToggleBtn.querySelector('.theme-label') : null;

const mediaDark = window.matchMedia('(prefers-color-scheme: dark)');
const THEME_KEY = 'theme';

function getInitialTheme() {
  const stored = (localStorage.getItem(THEME_KEY) || '').toLowerCase();
  if (stored === 'light' || stored === 'dark') return stored;
  return mediaDark.matches ? 'dark' : 'light';
}

// Actualiza icono, texto y aria-pressed según el modo
function updateThemeUI(mode) {
  const isDark = (mode === 'dark');          // modo ACTUAL
  const target = isDark ? 'light' : 'dark';  // modo al que vas a cambiar

  if (themeToggleBtn) {
    // aria-pressed = true cuando estás en dark (como antes)
    themeToggleBtn.setAttribute('aria-pressed', String(isDark));
    // etiqueta accesible describe la acción
    themeToggleBtn.setAttribute(
      'aria-label',
      target === 'light' ? 'Switch to light mode' : 'Switch to dark mode'
    );
  }

  if (themeLabel) {
    // El texto muestra el modo al que vas a cambiar
    themeLabel.textContent = target === 'light' ? 'Light mode' : 'Dark mode';
  }

  if (themeIcon) {
    // Icono = modo de destino (invertido)
    // Si estás en dark → target=light → icono ☀
    // Si estás en light → target=dark → icono 🌙
    themeIcon.classList.toggle('fa-sun',  isDark);   // dark → sun
    themeIcon.classList.toggle('fa-moon', !isDark);  // light → moon
  }
}

// Aplica tema + guarda en localStorage + sincroniza barras del navegador
function applyTheme(mode) {
  mode = (mode === 'light') ? 'light' : 'dark';

  root.setAttribute('data-theme', mode);
  localStorage.setItem(THEME_KEY, mode);

  updateThemeUI(mode);

  if (typeof window.__applyThemeChrome === 'function') {
    window.__applyThemeChrome();
  }
}

// Alternar entre light/dark
function toggleTheme() {
  const current = (root.getAttribute('data-theme') || getInitialTheme()).toLowerCase();
  const next    = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
}

// Click en el botón del rail
if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', (e) => {
    e.preventDefault();
    toggleTheme();
  });
}

// Estado inicial
applyTheme(getInitialTheme());
