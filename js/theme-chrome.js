/* =======================================================================================
   1)  Sincroniza color del navegador y barra de estado con el tema (light/dark/system) (7/-)
   ======================================================================================= */
(function syncSystemBarsWithTheme() {
  const root = document.documentElement; // <html>
  const metaTheme = document.querySelector('#metaThemeColor');
  const metaApple = document.querySelector('#metaAppleStatus');

  // Colores alineados con tus tokens CSS
  const COLORS = {
    light: { chrome: '#f5f7fb', appleStatus: 'default' },             // status bar clara (texto oscuro)
    dark:  { chrome: '#0d1117', appleStatus: 'black-translucent' }    // status bar oscura (texto claro)
  };

  function getMode() {
    const d = root.getAttribute('data-theme') || 'system';
    if (d === 'light' || d === 'dark') return d;
    return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function apply() {
    const mode = getMode();
    const c = COLORS[mode];
    if (metaTheme) metaTheme.setAttribute('content', c.chrome);
    if (metaApple) metaApple.setAttribute('content', c.appleStatus);
  }

  // Inicial
  apply();

  // Si estás en "system", reacciona a cambios del SO
  const mm = matchMedia('(prefers-color-scheme: dark)');
  if (mm.addEventListener) {
    mm.addEventListener('change', () => {
      if ((root.getAttribute('data-theme') || 'system') === 'system') apply();
    });
  } else if (mm.addListener) {
    // Safari antiguo
    mm.addListener(() => {
      if ((root.getAttribute('data-theme') || 'system') === 'system') apply();
    });
  }

  // Expón helper para cuando cambies el tema por UI (lo usa applyTheme)
  window.__applyThemeChrome = apply;
})();

// Llamada de seguridad por si el tema cambia antes de que se defina la IIFE
if (typeof window.__applyThemeChrome === 'function') {
  window.__applyThemeChrome();
}
