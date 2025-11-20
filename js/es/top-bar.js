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

  if (saved === 'dark') {
    startDark = true;
  } else if (saved === 'light') {
    startDark = false;
  } else if (window.matchMedia) {
    startDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  applyThemeUI(startDark);

  themeToggleBtn.addEventListener('click', () => {
    const nextDark = !isDark();
    applyThemeUI(nextDark);
  });
})();


// ===========================
// 3. TOPBAR: Compartir + Notificaciones
// ===========================

document.addEventListener('DOMContentLoaded', () => {
  // ---- Compartir ----
  const shareUrlInput   = document.getElementById('shareUrl');
  const copyBtn         = document.getElementById('copyShareUrl');
  const shareBtn        = document.getElementById('shareBtn');
  const shareWrapper    = shareBtn ? shareBtn.closest('.share-wrapper') : null;
  const sharePanel      = document.getElementById('sharePanel');
  const shareUrlWrapper = document.getElementById('shareUrlWrapper');
  const shareSuccess    = shareUrlWrapper
    ? shareUrlWrapper.querySelector('.share-success')
    : null;

  // ---- Notificaciones ----
  const notifBtn        = document.getElementById('notifBtn');
  const notifWrapper    = notifBtn ? notifBtn.closest('.notif-wrapper') : null;
  const notifPanel      = document.getElementById('notifPanel');

  const notifTabAll     = document.getElementById('notifTabAll');
  const notifTabUnread  = document.getElementById('notifTabUnread');
  const notifList       = document.getElementById('notifList');
  const notifFooter     = document.getElementById('notifFooter');

  const allNotifItems   = notifList
    ? Array.from(notifList.querySelectorAll('.notif-item'))
    : [];

  const MAX_VISIBLE = 6;

  // ===========================
  // 3.1 Compartir: rellenar URL
  // ===========================
  if (shareUrlInput) {
    shareUrlInput.value = window.location.href;
  }

  // ===========================
  // 3.2 Compartir: copiar + animación
  // ===========================
  if (copyBtn && shareUrlInput && shareUrlWrapper && shareSuccess) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(shareUrlInput.value)
        .then(() => {
          shareUrlWrapper.classList.add('copied');
          setTimeout(() => {
            shareUrlWrapper.classList.remove('copied');
          }, 1000);
        })
        .catch(err => {
          console.error(t('share.errorCopy'), err);
        });
    });
  }

  // ======================================================
  // 3.3 Compartir: botones sociales (FB, X, WhatsApp)
  // ======================================================
  const btnFb = document.getElementById('shareFb');
  const btnX  = document.getElementById('shareX');
  const btnWa = document.getElementById('shareWa');

  const rawUrl     = window.location.href;
  const currentUrl = encodeURIComponent(rawUrl);

  const textX  = encodeURIComponent(t('share.msgX'));
  const textWa = encodeURIComponent(`${t('share.msgWa')} ${rawUrl}`);

  // Facebook (solo URL)
  if (btnFb) {
    btnFb.addEventListener('click', () => {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`,
        '_blank',
        'noopener,noreferrer'
      );
    });
  }

  // X (texto + URL)
  if (btnX) {
    btnX.addEventListener('click', () => {
      window.open(
        `https://twitter.com/intent/tweet?text=${textX}&url=${currentUrl}`,
        '_blank',
        'noopener,noreferrer'
      );
    });
  }

  // WhatsApp (mensaje completo)
  if (btnWa) {
    btnWa.addEventListener('click', () => {
      window.open(
        `https://api.whatsapp.com/send?text=${textWa}`,
        '_blank',
        'noopener,noreferrer'
      );
    });
  }

  // ======================================================
  // 3.4 Notificaciones: límite inicial de 6 + "ver anteriores"
  // ======================================================
  function applyInitialNotifLimit() {
    if (!allNotifItems.length) return;

    let hiddenCount = 0;

    allNotifItems.forEach((item, index) => {
      if (index >= MAX_VISIBLE) {
        item.classList.add('is-hidden');
        hiddenCount++;
      }
    });

    if (notifFooter) {
      notifFooter.style.display = hiddenCount > 0 ? 'block' : 'none';
    }
  }

  function loadMoreNotifications() {
    if (!allNotifItems.length) return;

    const hidden = allNotifItems.filter(item => item.classList.contains('is-hidden'));
    hidden.slice(0, MAX_VISIBLE).forEach(item => {
      item.classList.remove('is-hidden');
    });

    const stillHidden = allNotifItems.some(item => item.classList.contains('is-hidden'));
    if (notifFooter && !stillHidden) {
      notifFooter.style.display = 'none';
    }
  }

  if (notifFooter) {
    const moreBtn = notifFooter.querySelector('.notif-more-btn');
    if (moreBtn) {
      moreBtn.addEventListener('click', () => {
        loadMoreNotifications();
      });
    }
  }

  applyInitialNotifLimit();

  // ======================================================
  // 3.5 Notificaciones: filtro Todas / No leídas
  // ======================================================
  function setNotifFilter(mode) {
    if (!allNotifItems.length) return;

    allNotifItems.forEach(item => {
      const isUnread = item.classList.contains('is-unread');

      if (mode === 'unread') {
        item.style.display = isUnread ? 'flex' : 'none';
      } else {
        // modo 'all'
        item.style.display = item.classList.contains('is-hidden') ? 'none' : 'flex';
      }
    });
  }

  if (notifTabAll && notifTabUnread) {
    notifTabAll.addEventListener('click', () => {
      notifTabAll.classList.add('is-active');
      notifTabUnread.classList.remove('is-active');
      // Mostrar hasta el límite inicial, respetando is-hidden
      allNotifItems.forEach(item => {
        item.style.display = item.classList.contains('is-hidden') ? 'none' : 'flex';
      });
    });

    notifTabUnread.addEventListener('click', () => {
      notifTabUnread.classList.add('is-active');
      notifTabAll.classList.remove('is-active');
      setNotifFilter('unread');
    });
  }

  // ======================================================
  // 3.6 Abrir / cerrar paneles (solo uno abierto)
  // ======================================================
  function closeShare() {
    if (!shareWrapper) return;
    shareWrapper.classList.remove('is-open');
    if (shareBtn) shareBtn.setAttribute('aria-expanded', 'false');
    if (sharePanel) sharePanel.setAttribute('aria-hidden', 'true');
  }

  function openShare() {
    if (!shareWrapper) return;
    closeNotif();
    shareWrapper.classList.add('is-open');
    if (shareBtn) shareBtn.setAttribute('aria-expanded', 'true');
    if (sharePanel) sharePanel.setAttribute('aria-hidden', 'false');
  }

  function closeNotif() {
    if (!notifWrapper) return;
    notifWrapper.classList.remove('is-open');
    if (notifBtn) notifBtn.setAttribute('aria-expanded', 'false');
    if (notifPanel) notifPanel.setAttribute('aria-hidden', 'true');
  }

  function openNotif() {
    if (!notifWrapper) return;
    closeShare();
    notifWrapper.classList.add('is-open');
    if (notifBtn) notifBtn.setAttribute('aria-expanded', 'true');
    if (notifPanel) notifPanel.setAttribute('aria-hidden', 'false');
  }

  // Botón compartir
  if (shareBtn && shareWrapper && sharePanel) {
    shareBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (shareWrapper.classList.contains('is-open')) {
        closeShare();
      } else {
        openShare();
      }
    });
  }

  // Botón notificaciones
  if (notifBtn && notifWrapper && notifPanel) {
    notifBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (notifWrapper.classList.contains('is-open')) {
        closeNotif();
      } else {
        openNotif();
      }
    });
  }

  // Click fuera → cierra todo
  document.addEventListener('click', (e) => {
    const target = e.target;

    const insideShare = shareWrapper && shareWrapper.contains(target);
    const insideNotif = notifWrapper && notifWrapper.contains(target);

    if (!insideShare && !insideNotif) {
      closeShare();
      closeNotif();
    }
  });

  // Escape → cierra todo
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeShare();
      closeNotif();
    }
  });
});
