// /js/notifast.js
document.addEventListener('DOMContentLoaded', () => {

  // ✔ Comprobar que window.NOTICES existe y es válido
  if (!Array.isArray(window.NOTICES) || !window.NOTICES.length) return;

  // ✔ Guardar la data en una variable
  const tipsData = window.NOTICES;

  // 👉 aquí decides qué mostrar en la barra:
  // 1) Solo algunos por id:
  const idsParaBarra = [1, 2, 4];
  let tips = tipsData
    .filter(n => idsParaBarra.includes(n.id))
    .map(n => n.text);

  // 2) O todos los importantes:
  // let tips = tipsData.filter(n => n.important).map(n => n.text);

  // 3) O TODOS:
  // let tips = tipsData.map(n => n.text);

  if (!tips.length) return;

  const DEFAULT_DELAY = 8000;  // 8s
  const MANUAL_DELAY  = 15000; // 15s

  const msgEl      = document.getElementById('notifMessage');
  const prevBtn    = document.getElementById('notifPrev');
  const nextBtn    = document.getElementById('notifNext');
  const controlsEl = document.querySelector('.notifbar-controls');

  let currentIndex = 0;
  let timerId = null;

  // --- Función para mostrar el texto ---
  function renderTip() {
    msgEl.textContent = tips[currentIndex];
  }

  // --- Programar el siguiente cambio ---
  function scheduleNext(delay) {
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      goNext(false); // false = cambio automático
    }, delay);
  }

  // --- Siguiente tip ---
  function goNext(fromUser) {
    currentIndex = (currentIndex + 1) % tips.length;
    renderTip();
    scheduleNext(fromUser ? MANUAL_DELAY : DEFAULT_DELAY);
  }

  // --- Tip anterior ---
  function goPrev() {
    currentIndex = (currentIndex - 1 + tips.length) % tips.length;
    renderTip();
    scheduleNext(MANUAL_DELAY);
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

  /*  
  =====================================================
     🟦 BLOQUE SWIPE (AQUÍ ES DONDE VA)
  =====================================================
  */
  const swipeArea = document.querySelector('.notifbar');
  const SWIPE_THRESHOLD = 40; // píxeles mínimos para swipe
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
  /*  
  =====================================================
     🟦 FIN DEL BLOQUE SWIPE
  =====================================================
  */

  // --- Iniciar ---
  renderTip();
  scheduleNext(DEFAULT_DELAY);
});
