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

  function renderTip() {
    msgEl.textContent = tips[currentIndex];
  }

  function scheduleNext(delay) {
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      goNext(false); // false = cambio automático
    }, delay);
  }

  function goNext(fromUser) {
    currentIndex = (currentIndex + 1) % tips.length;
    renderTip();
    scheduleNext(fromUser ? MANUAL_DELAY : DEFAULT_DELAY);
  }

  function goPrev() {
    currentIndex = (currentIndex - 1 + tips.length) % tips.length;
    renderTip();
    scheduleNext(MANUAL_DELAY);
  }

  if (tips.length <= 1 && controlsEl) {
    controlsEl.classList.add('is-hidden');
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => goNext(true));
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', goPrev);
  }

  renderTip();
  scheduleNext(DEFAULT_DELAY);
});
