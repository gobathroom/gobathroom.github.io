
// ===========================
// 1.Refresh
// ===========================

document.addEventListener('DOMContentLoaded', () => {
  const brand = document.getElementById('brandLink');

  if (brand) {
    const path = window.location.pathname;

    // Detecta idioma automáticamente
    if (path.startsWith("/es")) {
      brand.href = "/es";
    } else {
      brand.href = "/";
    }
  }
});


// ===========================
// 2.MODO OSCURO / CLARO
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
    themeToggleBtn.setAttribute('aria-label', 'Modo claro');
    themeToggleBtn.dataset.label = 'Modo claro';

    // (opcional) recordar preferencia
    localStorage.setItem('gb-theme', 'dark');
  } else {
    // tema claro
    document.body.classList.remove('dark');

    // icono luna
    icon.classList.remove('fa-sun');
    icon.classList.add('fa-moon');

    themeToggleBtn.setAttribute('aria-label', 'Modo oscuro');
    themeToggleBtn.dataset.label = 'Modo oscuro';

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


/* =========================================================
   3.SHARE BUTTON (desktop popover + Web Share API)
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const shareBtn      = document.getElementById('shareBtn');
  const sharePopover  = document.getElementById('sharePopover');
  const shareUrlSpan  = sharePopover.querySelector('.share-url-text');
  const copyRow       = sharePopover.querySelector('.share-copy-row');
  const copiedRow     = sharePopover.querySelector('.share-copied-row');
  const copyBtn       = sharePopover.querySelector('.share-copy-btn');
  const sharePills    = sharePopover.querySelectorAll('.share-pill');

  let copyTimeout = null;

  // siempre usamos la URL actual de la página
  function getCurrentUrl() {
    return window.location.href;
  }

  function openPopover() {
    shareUrlSpan.textContent = getCurrentUrl();
    sharePopover.classList.add('is-open');
    sharePopover.setAttribute('aria-hidden', 'false');
  }

  function closePopover() {
    sharePopover.classList.remove('is-open');
    sharePopover.setAttribute('aria-hidden', 'true');

    // volver del estado "copiado" al normal
    if (copyTimeout) {
      clearTimeout(copyTimeout);
      copyTimeout = null;
    }
    copyRow.hidden = false;
    copiedRow.hidden = true;
  }

  // click en botón compartir
  shareBtn.addEventListener('click', async () => {
    const url = getCurrentUrl();
    const title = 'Go Bathroom';
    const text = 'Check this restroom map:';

    // Si el navegador soporta Web Share (ideal móvil/tablet)
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return; // no abrimos popover
      } catch (err) {
        // si el usuario cancela o falla -> fallback al popover
      }
    }

    // desktop o sin Web Share -> popover
    if (sharePopover.classList.contains('is-open')) {
      closePopover();
    } else {
      openPopover();
    }
  });

  // botón "Copy"
  copyBtn.addEventListener('click', async () => {
    const url = getCurrentUrl();

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        // fallback muy básico
        const tmp = document.createElement('textarea');
        tmp.value = url;
        document.body.appendChild(tmp);
        tmp.select();
        document.execCommand('copy');
        document.body.removeChild(tmp);
      }

      // mostrar mensaje "copied"
      copyRow.hidden = true;
      copiedRow.hidden = false;

      copyTimeout = setTimeout(() => {
        copyRow.hidden = false;
        copiedRow.hidden = true;
      }, 2000);
    } catch (err) {
      console.error('No se pudo copiar:', err);
    }
  });

  // botones Facebook / X / WhatsApp
  sharePills.forEach(btn => {
    btn.addEventListener('click', () => {
      const url = encodeURIComponent(getCurrentUrl());
      let shareUrl = '';

      switch (btn.dataset.network) {
        case 'facebook':
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
          break;
        case 'x':
          shareUrl = `https://twitter.com/intent/tweet?url=${url}`;
          break;
        case 'whatsapp':
          shareUrl = `https://wa.me/?text=${url}`;
          break;
      }

      if (shareUrl) {
        window.open(shareUrl, '_blank', 'noopener,noreferrer');
      }
    });
  });

  // cerrar al hacer click fuera
  document.addEventListener('click', (e) => {
    if (!sharePopover.classList.contains('is-open')) return;

    const withinButton = shareBtn.contains(e.target);
    const withinPopover = sharePopover.contains(e.target);

    if (!withinButton && !withinPopover) {
      closePopover();
    }
  });

  // cerrar con Esc
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sharePopover.classList.contains('is-open')) {
      closePopover();
    }
  });
});
