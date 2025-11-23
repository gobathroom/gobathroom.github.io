// /js/notifast.js
document.addEventListener('DOMContentLoaded', () => {

  // ✔ Comprobar que window.NOTICES existe y es válido
  if (!Array.isArray(window.NOTICES) || !window.NOTICES.length) return;

  const tipsData = window.NOTICES;

  // 👉 aquí decides qué mostrar en la barra:
  const idsParaBarra = [1, 2, 4];

  // ✔ Mantener objetos completos (NO .map(n => n.text))
  let tips = tipsData.filter(n => idsParaBarra.includes(n.id));

  if (!tips.length) return;

  const DEFAULT_DELAY = 8000;  // 8s
  const MANUAL_DELAY  = 15000; // 15s

  const msgEl       = document.getElementById('notifMessage');
  const prevBtn     = document.getElementById('notifPrev');
  const nextBtn     = document.getElementById('notifNext');
  const controlsEl  = document.querySelector('.notifbar-controls');
  const textWrapper = document.querySelector('.notifbar-text-inner');

  // NUEVO → detectamos label e icono dentro del HTML
  const labelEl = document.querySelector('.notifbar-text strong');
  const iconEl  = document.querySelector('.notifbar-pill i');

  let currentIndex = 0;
  let timerId = null;

  // ============================
  // 🔵 ACTUALIZAR TEXTO + ICONO
  // ============================
  function renderTip() {
    const current = tips[currentIndex];
    if (!current) return;

    // Texto principal
    msgEl.textContent = current.text;

    // Tip o Ley
    const isLaw = current.kind === 'law';

    // Cambiar label
    if (labelEl) {
      labelEl.textContent = isLaw ? 'Ley rápida:' : 'Tip rápido:';
    }

    // Cambiar icono
    if (iconEl) {
      iconEl.className = 'fas ' + (isLaw ? 'fa-gavel' : 'fa-bolt');
    }
  }

  // Programar el siguiente cambio
  function scheduleNext(delay) {
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      goNext(false); // false = automático
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

  // Siguiente tip
  function goNext(fromUser) {
    animateChange(
      'next',
      () => { currentIndex = (currentIndex + 1) % tips.length; },
      fromUser
    );
  }

  // Tip anterior
  function goPrev() {
    animateChange(
      'prev',
      () => { currentIndex = (currentIndex - 1 + tips.length) % tips.length; },
      true
    );
  }

  if (tips.length <= 1 && controlsEl) {
    controlsEl.classList.add('is-hidden');
  }

  if (nextBtn) nextBtn.addEventListener('click', () => goNext(true));
  if (prevBtn) prevBtn.addEventListener('click', goPrev);

  // ============================
  // 🔵 SWIPE
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
