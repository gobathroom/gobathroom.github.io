/* =========================================================
   1) SHARE: Desktop hover (Freepik) + Mobile nativo (4/-)
   ---------------------------------------------------------
   1.1) Selectores y estado del mouse
   1.2) Detección de dispositivo
   1.3) Tooltip inteligente del rail (desktop cerrado, sin popovers)
   1.4) Lógica de Share (links, abrir/cerrar, posicionamiento, hover corridor)
   1.5) Cierre por clic-fuera y Esc (estilo Freepik)
   1.6) Inicialización de campo de enlace
   ========================================================= */

// 1.1) Selectores y estado del mouse
const shareBtn      = $('#shareBtn');
const shareModal    = $('#shareModal'); // fallback muy viejo
const sharePop      = window.sharePop = $('#sharePopover');  // ⬅️ accesible global
const shareInput    = $('#shareInput');
const shareFacebook = $('#shareFacebook');
const shareX        = $('#shareX');
const shareWhats    = $('#shareWhats');
const shareField    = $('#shareField');
const shareCopyInline = $('#shareCopyInline');

// Posición del mouse (para saber si Esc se pulsa con el puntero sobre el botón)
let lastMouseX = -1, lastMouseY = -1;

// URL principal que queremos mostrar siempre completa
const HOME_URL = 'https://gobathroom.github.io/';

// Normaliza una URL (quita query y hash, asegura slash final)
function normalizeUrl(u) {
  try {
    const a = new URL(u);
    a.hash = '';
    a.search = '';
    let s = a.origin + a.pathname;
    if (!s.endsWith('/')) s += '/';
    return s;
  } catch {
    return u;
  }
}

document.addEventListener('mousemove', (e) => {
  lastMouseX = e.clientX;
  lastMouseY = e.clientY;
}, { passive: true });


// 1.2) Detección de dispositivo
function isTouchDevice() {
  return ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
}
function isTabletOrSmaller() {
  // tablet incl. landscape
  return window.matchMedia('(max-width: 1024px)').matches;
}
function isDesktop() {
  return !isTouchDevice() && window.matchMedia('(min-width: 1025px)').matches;
}
function useNativeShare() {
  return (typeof navigator.share === 'function') && (isTouchDevice() || isTabletOrSmaller());
}


// 1.3) Tooltip inteligente del rail (solo desktop, sidebar cerrado, sin popovers)
const railTip = (() => {
  const el = document.createElement('div');
  el.id = 'railTip';
  el.className = 'rail-tip';
  el.hidden = true;
  document.body.appendChild(el);
  return el;
})();

let tipHideTimer = null;
let currentTipAnchor = null;

function positionRailTip(btn) {
  const r = btn.getBoundingClientRect();
  const tipW = railTip.offsetWidth;
  const tipH = railTip.offsetHeight;
  const gap  = 1;

  let left = r.right + gap;
  let top  = r.top; // alineado al borde superior del item

  left = Math.max(8, Math.min(left, window.innerWidth  - tipW - 8));
  top  = Math.max(8, Math.min(top,  window.innerHeight - tipH - 8));

  railTip.style.left = `${Math.round(left)}px`;
  railTip.style.top  = `${Math.round(top)}px`;
}

function showRailTip(btn) {
  // Solo desktop, sidebar cerrado, y sin popover (share/theme)
  if (!btn || !isDesktop() || body.classList.contains('sidebar-open') || btn.hasAttribute('data-popover')) return;

  // Cancela cualquier ocultado pendiente para evitar “blink”
  clearTimeout(tipHideTimer);

  const txt = btn.querySelector('.txt')?.textContent?.trim();
  if (!txt) return;

  currentTipAnchor = btn;
  railTip.textContent = txt;
  railTip.hidden = false;
  positionRailTip(btn);
  requestAnimationFrame(() => railTip.classList.add('is-visible'));
}

function scheduleHideRailTip(delay = 120) {
  clearTimeout(tipHideTimer);
  tipHideTimer = setTimeout(() => {
    currentTipAnchor = null;
    railTip.classList.remove('is-visible');
    setTimeout(() => { railTip.hidden = true; }, 120);
  }, delay);
}

// ⬅️ Esta función se usa desde sidebar.js
function hideRailTipNow() {
  clearTimeout(tipHideTimer);
  currentTipAnchor = null;
  railTip.classList.remove('is-visible');
  railTip.hidden = true;
}

// Activar tooltips en los botones del rail sin data-popover
const railItems = Array.from(document.querySelectorAll('.sidebar .rail-item'));
railItems.forEach(btn => {
  if (btn.hasAttribute('data-popover')) return; // excluye share/theme
  btn.addEventListener('pointerenter', () => showRailTip(btn));
  btn.addEventListener('pointerleave', () => scheduleHideRailTip());
});

// Mantener estable en scroll/resize
window.addEventListener('scroll', () => {
  if (!currentTipAnchor) return;
  if (currentTipAnchor.matches(':hover')) {
    positionRailTip(currentTipAnchor);
  } else {
    scheduleHideRailTip(0);
  }
}, { passive: true });

window.addEventListener('resize', () => {
  if (!currentTipAnchor) return;
  if (currentTipAnchor.matches(':hover')) {
    positionRailTip(currentTipAnchor);
  } else {
    scheduleHideRailTip(0);
  }
}, { passive: true });


// Esc cierra el tooltip (no interfiere con popovers)
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') scheduleHideRailTip(0);
});


// 1.4) Lógica de Share
function setupShareLinks(url, title) {
  if (shareFacebook) shareFacebook.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  if (shareX)        shareX.href        = `https://x.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
  if (shareWhats)    shareWhats.href    = `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`;
}

function openSharePopover() {
  if (!shareBtn || !sharePop) return;
  shareBtn.setAttribute('aria-expanded', 'true');
  sharePop.hidden = false;
  positionSharePopover();
  window.addEventListener('resize', positionSharePopover, { passive:true });
  window.addEventListener('scroll', positionSharePopover, { passive:true });
  // Accesibilidad: enfoca el botón Copy inline
  setTimeout(()=> shareCopyInline && shareCopyInline.focus(), 0);
}

function closeSharePopover({ returnFocus = false } = {}) {
  if (!sharePop || sharePop.hidden) return;
  if (shareBtn) shareBtn.setAttribute('aria-expanded','false');
  sharePop.hidden = true;
  window.removeEventListener('resize', positionSharePopover);
  window.removeEventListener('scroll', positionSharePopover);
  if (returnFocus && shareBtn) shareBtn.focus();
}

function positionSharePopover() {
  if (!shareBtn || !sharePop) return;

  const r = shareBtn.getBoundingClientRect();
  const railOpen = body.classList.contains('sidebar-open');
  const gap = 10;

  const popW = sharePop.offsetWidth;
  const popH = sharePop.offsetHeight;

  // === Calcular ancho deseado y máximo posible hacia la derecha ===
  const isHome = (normalizeUrl(location.href) === HOME_URL);
  const desired = isHome ? 370 : 360;

  const maxRightWidth = Math.max(240, Math.floor(window.innerWidth - 8 - (r.right + gap)));

  const finalW = Math.max(280, Math.min(desired, maxRightWidth));
  sharePop.style.setProperty('--share-popover-w', `${finalW}px`);

  let left, top;

  if (railOpen) {
    // Sidebar ABIERTO: a la derecha del rail, alineado con el borde superior del item
    left = r.right + gap;
    top  = r.top;
  } else {
    // Sidebar CERRADO: a la derecha del botón, alineado arriba también
    left = r.right + gap;
    top  = r.top;
  }

  // Limitar al viewport
  left = Math.max(8, Math.min(left, window.innerWidth - popW - 8));
  top  = Math.max(8, Math.min(top, window.innerHeight - popH - 8));

  sharePop.style.left = `${Math.round(left)}px`;
  sharePop.style.top  = `${Math.round(top)}px`;
}

if (sharePop && !sharePop.hidden) buildCorridor();

/* ============ Interacción ============ */

// 1) Copiar (inline con feedback)
if (shareCopyInline) {
  shareCopyInline.addEventListener('click', async () => {
    try {
      const url = shareInput?.value || location.href;
      await navigator.clipboard.writeText(url);

      // feedback visual en el campo
      shareField?.classList.add('copied');

      // --- Accesibilidad: anunciar éxito y conservar foco ---
      if (shareField) {
        shareField.setAttribute('role', 'status');
        shareField.setAttribute('aria-live', 'polite');
        shareField.setAttribute('tabindex', '-1');
        shareField.focus({ preventScroll: true });
      }

      const ico = shareCopyInline.querySelector('i');
      const label = shareCopyInline.querySelector('.copy-text');
      const prevIcon = ico?.className || '';
      const prevValue = shareInput?.value || '';

      if (ico) ico.className = 'fa-solid fa-check';
      if (label) label.textContent = 'Copied!';
      if (shareInput) shareInput.value = '✔ Copied successfully!';

      setTimeout(() => {
        shareField?.classList.remove('copied');
        if (ico && prevIcon) ico.className = prevIcon;
        if (label) label.textContent = 'Copy';
        if (shareInput) shareInput.value = prevValue;

        if (shareField) {
          shareField.removeAttribute('tabindex');
        }
        if (shareCopyInline) {
          shareCopyInline.focus();
        }
      }, 1400);
    } catch {}
  });
}

// 2) Click en el botón Share
if (shareBtn) {
  shareBtn.addEventListener('click', (e) => {
    const url = location.href;
    const title = document.title;

    if (useNativeShare()) {
      e.preventDefault();
      navigator.share({ title, url }).catch(()=>{});
      return;
    }

    // Desktop: toggle por click (fallback accesible)
    e.preventDefault();
    if (sharePop.hidden) {
      const normalized = normalizeUrl(url);
      const displayUrl = (normalized === HOME_URL) ? HOME_URL : url;

      if (shareInput) {
        shareInput.value = displayUrl;
        shareInput.title = url;
        shareInput.setAttribute('aria-label', url);
      }

      setupShareLinks(url, title);
      openSharePopover();
    } else {
      closeSharePopover();
    }
  });
}

// 3) Hover tipo Freepik (solo desktop)
let hoverCloseTimer = null;    // temporizador de cierre diferido
let tracking = false;          // ¿estamos siguiendo trayectoria?
let corridor = null;           // “buffer” entre botón y popover

function buildCorridor() {
  if (!shareBtn || !sharePop) return;

  const br = shareBtn.getBoundingClientRect();
  const pr = sharePop.getBoundingClientRect();
  const pad = 12; // tolerancia lateral

  const left = Math.min(br.right, pr.left) - pad;
  const right = Math.max(br.right, pr.left) + pad;
  const top = Math.min(br.top, pr.top) - pad;
  const bottom = Math.max(br.bottom, pr.bottom) + pad;

  corridor = { left, right, top, bottom };
}

function inCorridor(x, y) {
  if (!corridor) return false;
  return x >= corridor.left && x <= corridor.right && y >= corridor.top && y <= corridor.bottom;
}

function startHoverOpen() {
  if (!isDesktop() || !shareBtn) return;
  const url = location.href;
  const title = document.title;

  if (sharePop.hidden) {
    const normalized = normalizeUrl(url);
    const displayUrl = (normalized === HOME_URL) ? HOME_URL : url;

    if (shareInput) {
      shareInput.value = displayUrl;
      shareInput.title = url;
      shareInput.setAttribute('aria-label', url);
    }

    setupShareLinks(url, title);
    openSharePopover();
  }
  buildCorridor();
}

function scheduleHoverClose() {
  if (!isDesktop()) return;

  clearTimeout(hoverCloseTimer);
  tracking = true;

  hoverCloseTimer = setTimeout(() => {
    tracking = false;
    if (!sharePop.matches(':hover') && !shareBtn.matches(':hover')) {
      closeSharePopover();
    }
  }, 180);
}

function cancelHoverClose() {
  clearTimeout(hoverCloseTimer);
  tracking = false;
}

// Eventos de hover
if (shareBtn) {
  shareBtn.addEventListener('mouseenter', startHoverOpen);
  shareBtn.addEventListener('mouseleave', scheduleHoverClose);
}
if (sharePop) {
  sharePop.addEventListener('mouseenter', cancelHoverClose);
  sharePop.addEventListener('mouseleave', () => {
    if (isDesktop()) closeSharePopover();
  });
}

// Seguimiento de trayectoria
document.addEventListener('mousemove', (e) => {
  if (!isDesktop() || !tracking || sharePop.hidden) return;
  if (!inCorridor(e.clientX, e.clientY) &&
      !sharePop.matches(':hover') &&
      !shareBtn.matches(':hover')) {
    clearTimeout(hoverCloseTimer);
    tracking = false;
    closeSharePopover();
  }
});

// 1.5) Cerrar por clic-fuera y por Esc (desktop)
document.addEventListener('click', (e) => {
  if (useNativeShare()) return; // en móvil/tablet no hay popover
  if (sharePop.hidden) return;
  const inside = e.target.closest('#sharePopover, #shareBtn');
  if (!inside) closeSharePopover();
});

// Esc: cierre estilo Freepik (si el puntero sigue sobre el icono, se reabre)
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape' || !sharePop || sharePop.hidden) return;

  closeSharePopover({ returnFocus: false });

  if (document.activeElement && typeof document.activeElement.blur === 'function') {
    document.activeElement.blur();
  }

  if (matchMedia('(pointer:fine)').matches && shareBtn) {
    const r = shareBtn.getBoundingClientRect();
    const overBtn = lastMouseX >= r.left && lastMouseX <= r.right &&
                    lastMouseY >= r.top  && lastMouseY <= r.bottom;
    if (overBtn) {
      setTimeout(() => {
        if (sharePop.hidden) openSharePopover();
      }, 120);
    }
  }
});

// 1.6) Inicialización de campo de enlace
document.addEventListener('DOMContentLoaded', () => {
  const url = location.href;
  const normalized = normalizeUrl(url);
  const displayUrl = (normalized === HOME_URL) ? HOME_URL : url;

  if (shareInput) {
    shareInput.value = displayUrl;
    shareInput.title = url;
    shareInput.setAttribute('aria-label', url);
  }
});
