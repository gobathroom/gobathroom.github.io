// js/notifast.js
document.addEventListener('DOMContentLoaded', () => {
  // ============================
  // 🌐 DETECTAR IDIOMA
  // ============================
  const htmlLangRaw = (document.documentElement.lang || 'es').toLowerCase();
  const langBase = htmlLangRaw.split('-')[0]; // "es-ES" -> "es"
  const lang = (langBase === 'en' || langBase === 'es') ? langBase : 'es';

  // ============================
  // 📚 OBTENER NOTICES POR IDIOMA
  // ============================
  const noticesByLang = window.NOTICES || {};
  let tipsData = noticesByLang[lang];

  // Si no hay para ese idioma, caer a español
  if (!Array.isArray(tipsData) || !tipsData.length) {
    tipsData = noticesByLang['es'];
  }
  if (!Array.isArray(tipsData) || !tipsData.length) {
    // No hay datos, salir
    return;
  }

  // 👉 qué mostrar en la barra (ids que quieres usar)
  const idsParaBarra = [1, 2, 3, 4];
  let tips = tipsData.filter(n => idsParaBarra.includes(n.id));

  // Si el filtro deja vacío, mostramos todos
  if (!tips.length) {
    tips = tipsData;
  }

  // ============================
  // 🌐 I18N PARA LABELS CORTOS
  // ============================
  const hasI18n = window.GB_I18N && typeof window.GB_I18N.t === 'function';
  const notifastStrings = {
    lawLabel:  hasI18n ? window.GB_I18N.t('notifast.lawLabel')  : '',
    tipLabel:  hasI18n ? window.GB_I18N.t('notifast.tipLabel')  : '',
    moreLabel: hasI18n ? window.GB_I18N.t('notifast.moreLabel') : ''
  };

  const DEFAULT_DELAY = 8000;  // 8s auto
  const MANUAL_DELAY  = 15000; // 15s si el usuario toca

  const msgEl       = document.getElementById('notifMessage');
  const prevBtn     = document.getElementById('notifPrev');
  const nextBtn     = document.getElementById('notifNext');
  const controlsEl  = document.querySelector('.notifbar-controls');
  const textWrapper = document.querySelector('.notifbar-text-inner');

  const labelEl     = document.querySelector('.notifbar-text strong');
  const iconEl      = document.querySelector('.notifbar-pill i');
  const pillEl      = document.querySelector('.notifbar-pill');
  const moreLinkEl  = document.getElementById('notifMore');

  let currentIndex = 0;
  let timerId = null;

  // ============================
  // 🔵 ACTUALIZAR TEXTO + ICONO
  // ============================
  function renderTip() {
    const current = tips[currentIndex];
    if (!current) return;

    const isLaw = current.kind === 'law';

    // Texto principal
    if (msgEl) {
      msgEl.textContent = current.text;
    }

    // Label (Tip rápido / Ley rápida) con i18n
    if (labelEl) {
      const baseLabel = isLaw
        ? notifastStrings.lawLabel
        : notifastStrings.tipLabel;

      labelEl.textContent = baseLabel ? baseLabel + ':' : '';
    }

    // Icono (martillo / rayo)
    if (iconEl) {
      iconEl.className = 'fas ' + (isLaw ? 'fa-gavel' : 'fa-bolt');
    }

    // Pastilla (color según tipo)
    if (pillEl) {
      pillEl.classList.toggle('notifbar-pill--law', isLaw);
      pillEl.classList.toggle('notifbar-pill--tip', !isLaw);
    }

    // 🔵 Leer más SOLO para leyes con URL
    if (moreLinkEl) {
      if (isLaw && current.moreUrl) {
        moreLinkEl.style.display = 'inline';
        moreLinkEl.href = current.moreUrl;

        if (notifastStrings.moreLabel) {
          moreLinkEl.textContent = notifastStrings.moreLabel;
        }
      } else {
        moreLinkEl.style.display = 'none';
        moreLinkEl.removeAttribute('href');
      }
    }
  }

  function scheduleNext(delay) {
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      goNext(false); // auto
    }, delay);
  }

  // ============================
  // 🔵 ANIMACIÓN SLIDE
  // ============================
  function animateChange(direction, updateIndexFn, fromUser) {
    if (!textWrapper) {
      updateIndexFn();
      renderTip();
      scheduleNext(fromUser ? MANUAL_DELAY : DEFAULT_DELAY);
      return;
    }

    const outClass = direction === 'next'
      ? 'notif-slide-out-next'
      : 'notif-slide-out-prev';
    const inClass = direction === 'next'
      ? 'notif-slide-in-next'
      : 'notif-slide-in-prev';

    textWrapper.classList.remove(
      'notif-slide-out-next',
      'notif-slide-in-next',
      'notif-slide-out-prev',
      'notif-slide-in-prev'
    );

    textWrapper.classList.add(outClass);

    function handleOutEnd() {
      textWrapper.removeEventListener('animationend', handleOutEnd);
      textWrapper.classList.remove(outClass);

      updateIndexFn();
      renderTip();

      textWrapper.classList.add(inClass);

      function handleInEnd() {
        textWrapper.removeEventListener('animationend', handleInEnd);
        textWrapper.classList.remove(inClass);
      }
      textWrapper.addEventListener('animationend', handleInEnd);
    }

    textWrapper.addEventListener('animationend', handleOutEnd);

    scheduleNext(fromUser ? MANUAL_DELAY : DEFAULT_DELAY);
  }

  function goNext(fromUser) {
    animateChange(
      'next',
      () => { currentIndex = (currentIndex + 1) % tips.length; },
      fromUser
    );
  }

  function goPrev() {
    animateChange(
      'prev',
      () => { currentIndex = (currentIndex - 1 + tips.length) % tips.length; },
      true
    );
  }

  // Ocultar controles si solo hay un tip
  if (tips.length <= 1 && controlsEl) {
    controlsEl.classList.add('is-hidden');
  }

  if (nextBtn) nextBtn.addEventListener('click', () => goNext(true));
  if (prevBtn) nextBtn && prevBtn.addEventListener('click', goPrev);

  // ============================
  // 🔵 SWIPE (desktop + mobile)
  // ============================
  const swipeArea = document.querySelector('.notifbar');
  const SWIPE_THRESHOLD = 40;
  let startX = null;
  let isPointerDown = false;

  if (swipeArea) {
    swipeArea.addEventListener('pointerdown', (e) => {
      isPointerDown = true;
      startX = e.clientX;
    });

    swipeArea.addEventListener('pointerup', (e) => {
      if (!isPointerDown || startX === null) return;

      const dx = e.clientX - startX;
      if (Math.abs(dx) > SWIPE_THRESHOLD) {
        dx < 0 ? goNext(true) : goPrev();
      }
      isPointerDown = false;
      startX = null;
    });

    swipeArea.addEventListener('pointerleave', () => {
      isPointerDown = false;
      startX = null;
    });
  }

  // Iniciar
  renderTip();
  scheduleNext(DEFAULT_DELAY);
});
