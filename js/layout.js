/* =========================================================
   1) OTROS (Idioma, Notifybar, etc.)   (5/-)
   ========================================================= */

// ===== Ajuste real de la altura de la notifybar
const notify = document.getElementById('notifybar');

function setNotifyHeight() {
  const h = notify ? notify.offsetHeight : 0;
  root.style.setProperty('--notify-h', `${h}px`);
}

window.addEventListener('load', setNotifyHeight);
window.addEventListener('resize', setNotifyHeight);

if (window.ResizeObserver && notify) {
  new ResizeObserver(setNotifyHeight).observe(notify);
}
