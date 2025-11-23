// /js/notifast.js
document.addEventListener('DOMContentLoaded', () => {

  // ✔ Comprobar que window.NOTICES existe y es válido
  if (!Array.isArray(window.NOTICES) || !window.NOTICES.length) return;

  const tipsData = window.NOTICES;

  // 👉 aquí decides qué mostrar en la barra:
  const idsParaBarra = [1, 2, 4];
  let tips = tipsData
    .filter(n => idsParaBarra.includes(n.id))
    .map(n => n.text);

  if (!tips.length) return;

  const DEFAULT_DELAY = 8000;  // 8s
  const MANUAL_DELAY  = 15000; // 15s

  const msgEl       = document.getElementById('notifMessage');
  const prevBtn     = document.getElementById('notifPrev');
  const nextBtn     = document.getElementById('notifNext');
  const controlsEl  = document.querySelector('.notifbar-controls');
  const textWrapper = document.querySelector('.notifbar-text-inner');

  let currentIndex = 0;
  let timerId = null;

  function renderTip() {
    msgEl.textContent = tips[currentIndex];
  }

  function scheduleNext(delay) {
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      goNext(false); // false = cambio automático
    }, delay);
  }

  // 🔵 Función genérica para animar cambio
  function animateChange(direction, updateIndexFn, fromUser) {
    if (!textWrapper) {
      // Sin wrapper, cambiamos normal
      updateIndexFn();
      renderTip();
      scheduleNext(fromUser ? MANUAL_DELAY : DEFAULT_DELAY);
      return;
    }

    // Elegir clases segun dirección
    const outClass = direction === 'next'
      ? 'notif-slide-out-next'
      : 'notif-slide-out-prev';
    const inClass = direction === 'next'
      ? 'notif-slide-in-next'
      : 'notif-slide-in-prev';

    // Limpiar posibles clases previas
    textWrapper.classList.remove(
      'notif-slide-out-next',
      'notif-slide-in-next',
      'notif-slide-out-prev',
      'notif-slide-in-prev'
    );

    // 1) animación de salida
    textWrapper.classList.add(outClass);

    function handleOutEnd() {
      textWrapper.removeEventListener('animationend', handleOutEnd);
      textWrapper.classList.remove(outClass);

      // Actualizar índice + texto
      updateIndexFn();
      renderTip();

      // 2) animación de entrada
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

  // --- Siguiente tip ---
  function goNext(fromUser) {
    animateChange(
      'next',
      () => {
        currentIndex = (currentIndex + 1) % tips.length;
      },
      fromUser
    );
  }

  // --- Tip anterior ---
  function goPrev() {
    animateChange(
      'prev',
      () => {
        currentIndex = (currentIndex - 1 + tips.length) % tips.length;
      },
      true // lo tratamos como interacción del usuario
    );
  }

  // --- Ocultar controles si solo hay un tip ---
  if (tips.length <= 1 && controlsEl) {
    controlsEl.classList.add('is-hidden');
  }

  // --- Botones ---
  if (nextBtn) {
    nextBtn.addEventListener('click', () => goNext(true));
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', goPrev);
  }

  // --- Swipe (lo dejamos igual que ya tienes) ---
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

  // --- Iniciar ---
  renderTip();
  scheduleNext(DEFAULT_DELAY);
});
