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



    // --- Menú de tres puntos ---
  const notifMenuBtn    = document.getElementById('notifMenuBtn');
  const notifMenu       = document.getElementById('notifMenu');
  const notifMarkAllBtn = document.getElementById('notifMarkAllRead');
  const notifOpenPageBtn= document.getElementById('notifOpenPage');
  const notifEmpty      = document.getElementById('notifEmpty');

  let currentNotifFilter = 'all'; // 'all' o 'unread'


  const MAX_VISIBLE = 6;
  let scrollMode = false; // se activa cuando el usuario pulsa "ver anteriores"

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
  // 3.4 Notificaciones: límite inicial + "ver anteriores" + scroll por lotes
  // ======================================================

  // helper: revela hasta N notificaciones ocultas (las que tienen .is-hidden)
  function revealNextBatch(batchSize) {
    if (!allNotifItems.length) return;

    const hidden = allNotifItems.filter(item =>
      item.classList.contains('is-hidden')
    );

    hidden.slice(0, batchSize).forEach(item => {
      item.classList.remove('is-hidden');
      // si estabas usando display:none a mano, lo aseguramos:
      item.style.display = 'flex';
    });
  }

  // estado inicial: hasta 6 sin scroll, resto ocultas y se muestra footer si hace falta
  function applyInitialNotifLimit() {
    if (!allNotifItems.length || !notifList) return;

    scrollMode = false;
    notifList.classList.remove('is-scrollable');

    let hiddenCount = 0;

    allNotifItems.forEach((item, index) => {
      if (index < MAX_VISIBLE) {
        item.classList.remove('is-hidden');
        item.style.display = 'flex';
      } else {
        item.classList.add('is-hidden');
        item.style.display = 'none';
        hiddenCount++;
      }
    });

    if (notifFooter) {
      notifFooter.style.display = hiddenCount > 0 ? 'block' : 'none';
    }
  }

  // se llama cuando el usuario pulsa “ver notificaciones anteriores”
  function loadMoreNotifications() {
    if (!allNotifItems.length || !notifList) return;

    // activamos modo scroll y altura máxima
    notifList.classList.add('is-scrollable');
    scrollMode = true;

    // mostramos un lote extra
    revealNextBatch(MAX_VISIBLE);

    // si después de este lote ya no queda nada oculto, ocultamos el footer
    const stillHidden = allNotifItems.some(item =>
      item.classList.contains('is-hidden')
    );
    if (notifFooter) {
      notifFooter.style.display = stillHidden ? 'none' : 'none';
    }
  }

  // botón "Ver notificaciones anteriores"
  if (notifFooter) {
    const moreBtn = notifFooter.querySelector('.notif-more-btn');
    if (moreBtn) {
      moreBtn.addEventListener('click', () => {
        loadMoreNotifications();
      });
    }
  }

  // inicializamos al cargar la página
  applyInitialNotifLimit();

  // scroll: cuando llegue al fondo, cargamos más en bloques de 6
  if (notifList) {
    notifList.addEventListener('scroll', () => {
      if (!scrollMode) return;

      const threshold = 40; // px antes del fondo
      if (
        notifList.scrollTop + notifList.clientHeight >=
        notifList.scrollHeight - threshold
      ) {
        const beforeHidden = allNotifItems.filter(i => i.classList.contains('is-hidden')).length;
        revealNextBatch(MAX_VISIBLE);
        const afterHidden = allNotifItems.filter(i => i.classList.contains('is-hidden')).length;

        // si ya no había más por mostrar, simplemente no hacemos nada más
        if (afterHidden === beforeHidden) return;
      }
    });
  }

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
      currentNotifFilter = 'all';

      notifTabAll.classList.add('is-active');
      notifTabUnread.classList.remove('is-active');

      allNotifItems.forEach(item => {
        item.style.display = item.classList.contains('is-hidden') ? 'none' : 'flex';
      });

      updateNotifEmptyState();
    });

    notifTabUnread.addEventListener('click', () => {
      currentNotifFilter = 'unread';

      notifTabUnread.classList.add('is-active');
      notifTabAll.classList.remove('is-active');

      setNotifFilter('unread');
      updateNotifEmptyState();
    });
  }

  // ======================================================
  // 3.5.1 Menú tres puntos (opciones del panel)
  // ======================================================

  function openNotifMenu() {
    if (!notifMenu) return;
    notifMenu.classList.add('is-open');
    if (notifMenuBtn) notifMenuBtn.setAttribute('aria-expanded', 'true');
    notifMenu.setAttribute('aria-hidden', 'false');
  }

  function closeNotifMenu() {
    if (!notifMenu) return;
    notifMenu.classList.remove('is-open');
    if (notifMenuBtn) notifMenuBtn.setAttribute('aria-expanded', 'false');
    notifMenu.setAttribute('aria-hidden', 'true');
  }

  if (notifMenuBtn && notifMenu) {
    notifMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (notifMenu.classList.contains('is-open')) {
        closeNotifMenu();
      } else {
        openNotifMenu();
      }
    });
  }

  // Acción: marcar todas como leídas
  if (notifMarkAllBtn) {
    notifMarkAllBtn.addEventListener('click', () => {
      markAllNotificationsRead();
      closeNotifMenu();
    });
  }

  // Acción: abrir página de notificaciones (ajusta la URL a tu gusto)
  if (notifOpenPageBtn) {
    notifOpenPageBtn.addEventListener('click', () => {
      const path = window.location.pathname;
      const notifUrl = path.startsWith('/es')
        ? '/es/notificaciones/'
        : '/notifications/';

      window.location.href = notifUrl;
    });
  }



   // ======================================================
  // 3.6 Actualiza el badge de la campana principal
  // ======================================================
  function updateNotifBadge() {
    if (!notifBtn || !allNotifItems.length) return;
    const hasUnread = allNotifItems.some(item =>
      item.classList.contains('is-unread')
    );
    notifBtn.classList.toggle('has-unread', hasUnread);
  }

  // Muestra / oculta el estado vacío en la pestaña "No leídas"
  function updateNotifEmptyState() {
    if (!notifEmpty || !notifList) return;

    const hasUnreadVisible = allNotifItems.some(item =>
      item.classList.contains('is-unread') &&
      item.style.display !== 'none'
    );

    const isUnreadTab = currentNotifFilter === 'unread';

    if (isUnreadTab && !hasUnreadVisible) {
      notifEmpty.style.display = 'flex';
      notifList.style.display  = 'none';
    } else {
      notifEmpty.style.display = 'none';
      notifList.style.display  = 'block';
    }
  }

  // Marca todas las notificaciones como leídas
  function markAllNotificationsRead() {
    allNotifItems.forEach(item => {
      item.classList.remove('is-unread');
    });
    updateNotifBadge();
    updateNotifEmptyState();
  }

  // Llamada inicial
  updateNotifBadge();


  


  // ======================================================
  // 3.7 Abrir / cerrar paneles (solo uno abierto)
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
      closeNotifMenu();
    }
  });

  // Escape → cierra todo
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeShare();
      closeNotif();
      closeNotifMenu();
    }
  });
});
