
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
   3. SHARE BUTTON (desktop popover + Web Share API)
   ========================================================= */

(function () {
  const shareBtn     = document.getElementById('shareBtn');
  const sharePopover = document.getElementById('sharePopover');
  const shareUrlInput = document.getElementById('shareUrl');
  const copyBtn      = document.getElementById('copyShareUrl');
  const shareActionButtons = document.querySelectorAll('.share-action-btn');

  if (!shareBtn || !sharePopover) return;

  // URL actual
  const currentUrl = window.location.href;
  shareUrlInput.value = currentUrl;

  // helper para abrir/cerrar popover
  function setShareOpen(open) {
    sharePopover.classList.toggle('is-open', open);
    shareBtn.classList.toggle('is-open', open);
    shareBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    sharePopover.setAttribute('aria-hidden', open ? 'false' : 'true');
  }

  // click en botón compartir
  shareBtn.addEventListener('click', async () => {
    const isMobile = window.innerWidth <= 768;

    // 1) Mobile / tablet con Web Share API
    if (navigator.share && isMobile) {
      try {
        await navigator.share({
          title: document.title || 'Go Bathroom',
          text: 'Open Restroom Map',
          url: currentUrl
        });
      } catch (err) {
        // usuario canceló → no hacemos nada
      }
      return;
    }

    // 2) Desktop → alternar popover
    const isOpen = sharePopover.classList.contains('is-open');
    setShareOpen(!isOpen);
  });

  // copiar URL
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(currentUrl);
        copyBtn.textContent = 'Copied';
        setTimeout(() => {
          copyBtn.textContent = 'Copy';
        }, 1500);
      } catch (err) {
        // fallback: seleccionar texto
        shareUrlInput.select();
        document.execCommand('copy');
        copyBtn.textContent = 'Copied';
        setTimeout(() => {
          copyBtn.textContent = 'Copy';
        }, 1500);
      }
    });
  }

  // botones Facebook / X / WhatsApp
  shareActionButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-share-target');
      const encodedUrl = encodeURIComponent(currentUrl);
      let shareLink = '';

      if (target === 'facebook') {
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
      } else if (target === 'x') {
        shareLink = `https://twitter.com/intent/tweet?url=${encodedUrl}`;
      } else if (target === 'whatsapp') {
        shareLink = `https://api.whatsapp.com/send?text=${encodedUrl}`;
      }

      if (shareLink) {
        window.open(shareLink, '_blank', 'noopener,noreferrer');
      }
    });
  });

  // cerrar popover haciendo click fuera
  document.addEventListener('click', (e) => {
    if (!sharePopover.classList.contains('is-open')) return;

    const clickInside =
      sharePopover.contains(e.target) ||
      shareBtn.contains(e.target);

    if (!clickInside) {
      setShareOpen(false);
    }
  });

  // cerrar con Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      setShareOpen(false);
    }
  });
})();

