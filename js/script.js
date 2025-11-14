/* =========================================================
   1) HELPERS & GLOBALS
   ========================================================= */
// Helpers
const $ = (s, d=document) => d.querySelector(s);

const body  = document.body;
const root  = document.documentElement;



/* =========================================================
   2) SIDEBAR TOGGLE (header mobile + rail button)
   ========================================================= */
const togglers = document.querySelectorAll('.hamburger, .rail-toggle');

function syncBrandA11y(open){
  // La marca de la topbar se oculta visualmente vía CSS cuando open=true.
  // Aquí solo reflejamos accesibilidad.
  const topbarBrand = document.querySelector('.topbar .brand');
  if (topbarBrand) topbarBrand.setAttribute('aria-hidden', open ? 'true' : 'false');
}

function reflectAria(open){
  togglers.forEach(btn => {
    if (btn.hasAttribute('aria-expanded')){
      btn.setAttribute('aria-expanded', String(open));
    }
  });
}

function setSidebar(open){
  body.classList.toggle('sidebar-open', open);
  reflectAria(open);
  syncBrandA11y(open);




function toggleSidebar(){
  setSidebar(!body.classList.contains('sidebar-open'));
}

togglers.forEach(btn => btn.addEventListener('click', toggleSidebar));

// Cerrar al hacer click fuera (sólo en móvil)
document.addEventListener('click', (e) => {
  if (!body.classList.contains('sidebar-open')) return;

  const clickedInside = e.target.closest('.sidebar, .hamburger, .rail-toggle');
  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  if (!clickedInside && isMobile){
    setSidebar(false);
  }
});

// Esc NO cierra el sidebar en desktop; solo en móvil y si no hay popovers abiertos
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;

  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const shareOpen = (typeof sharePop !== 'undefined') && sharePop && !sharePop.hidden;

  // Si algún popover está abierto, dejamos que sus propios handlers gestionen Esc
  if (shareOpen || themeOpen) return;

  // Solo en móvil cerramos el sidebar con Esc
  if (isMobile && body.classList.contains('sidebar-open')) {
    setSidebar(false);
  }
});



/* =========================================================
   3) THEME: Light / Dark – un solo botón (#themeToggle)
   ========================================================= */

// Botón en el footer del rail
const themeToggleBtn = $('#themeToggle');              // <button id="themeToggle" ...>
const themeIcon      = themeToggleBtn ? themeToggleBtn.querySelector('.theme-icon')  : null;
const themeLabel     = themeToggleBtn ? themeToggleBtn.querySelector('.theme-label') : null;

const mediaDark = window.matchMedia('(prefers-color-scheme: dark)');
const THEME_KEY = 'theme';

function getInitialTheme(){
  const stored = (localStorage.getItem(THEME_KEY) || '').toLowerCase();
  if (stored === 'light' || stored === 'dark') return stored;
  return mediaDark.matches ? 'dark' : 'light';
}

// Actualiza icono, texto y aria-pressed según el modo
function updateThemeUI(mode){
  const isDark = (mode === 'dark');

  if (themeToggleBtn){
    themeToggleBtn.setAttribute('aria-pressed', String(isDark));
  }

  if (themeLabel){
    themeLabel.textContent = isDark ? 'Dark mode' : 'Light mode';
  }

  if (themeIcon){
    // Luna para dark, sol para light
    themeIcon.classList.toggle('fa-moon', isDark);
    themeIcon.classList.toggle('fa-sun', !isDark);
  }
}

// Aplica tema + guarda en localStorage + sincroniza barras del navegador
function applyTheme(mode){
  mode = (mode === 'light') ? 'light' : 'dark';

  root.setAttribute('data-theme', mode);
  localStorage.setItem(THEME_KEY, mode);

  updateThemeUI(mode);

  if (typeof window.__applyThemeChrome === 'function'){
    window.__applyThemeChrome();
  }
}

// Alternar entre light/dark
function toggleTheme(){
  const current = (root.getAttribute('data-theme') || getInitialTheme()).toLowerCase();
  const next    = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
}

// Click en el botón del rail
if (themeToggleBtn){
  themeToggleBtn.addEventListener('click', (e) => {
    e.preventDefault();
    toggleTheme();
  });
}

// Estado inicial
applyTheme(getInitialTheme());





/* =========================================================
   4) SHARE: Desktop hover (Freepik) + Mobile nativo
   ---------------------------------------------------------
   4.1) Selectores y estado del mouse
   4.2) Detección de dispositivo
   4.3) Tooltip inteligente del rail (desktop cerrado, sin popovers)
   4.4) Lógica de Share (links, abrir/cerrar, posicionamiento, hover corridor)
   4.5) Cierre por clic-fuera y Esc (estilo Freepik)
   4.6) Inicialización de campo de enlace
   ========================================================= */
// 4.1) Selectores y estado del mouse
const shareBtn    = $('#shareBtn');
const shareModal  = $('#shareModal'); // fallback muy viejo
const sharePop    = window.sharePop = $('#sharePopover');  // ⬅️ AQUÍ creamos sharePop correctamente
const shareInput  = $('#shareInput');
const shareFacebook = $('#shareFacebook');
const shareX      = $('#shareX');
const shareWhats  = $('#shareWhats');
const shareField = $('#shareField');
const shareCopyInline = $('#shareCopyInline');
// Posición del mouse (para saber si Esc se pulsa con el puntero sobre el botón)
let lastMouseX = -1, lastMouseY = -1;

// URL principal que queremos mostrar siempre completa
const HOME_URL = 'https://gobathroom.github.io/';

// Normaliza una URL (quita query y hash, asegura slash final)
function normalizeUrl(u){
  try{
    const a = new URL(u);
    a.hash = '';
    a.search = '';
    let s = a.origin + a.pathname;
    if (!s.endsWith('/')) s += '/';
    return s;
  }catch{
    return u;
  }
}


document.addEventListener('mousemove', (e) => {
  lastMouseX = e.clientX;
  lastMouseY = e.clientY;
}, { passive: true });


// 4.2) Detección de dispositivo
function isTouchDevice(){
  return ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
}
function isTabletOrSmaller(){
  // tablet incl. landscape
  return window.matchMedia('(max-width: 1024px)').matches;
}
function isDesktop(){
  return !isTouchDevice() && window.matchMedia('(min-width: 1025px)').matches;
}
function useNativeShare(){
  return (typeof navigator.share === 'function') && (isTouchDevice() || isTabletOrSmaller());
}


// 4.3) Tooltip inteligente del rail (desktop cerrado, sin popovers)
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

function positionRailTip(btn){
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

function showRailTip(btn){
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

function scheduleHideRailTip(delay = 120){
  clearTimeout(tipHideTimer);
  tipHideTimer = setTimeout(() => {
    currentTipAnchor = null;
    railTip.classList.remove('is-visible');
    setTimeout(() => { railTip.hidden = true; }, 120);
  }, delay);
}

function hideRailTipNow(){
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

let themeOpen = false;  // ya no usamos popover de tema, pero evitamos ReferenceError


// Esc cierra el tooltip (no interfiere con popovers)
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') scheduleHideRailTip(0);
});

// Si el sidebar cambia de estado, oculta el tooltip
// (Puedes dejar esta llamada aquí por si se invoca setSidebar desde otros flujos)
if (typeof setSidebar === 'function') {
  const _setSidebar = setSidebar;
  setSidebar = function(open){
    _setSidebar(open);
    hideRailTipNow();
  };
}



// 4.4) Lógica de Share
function setupShareLinks(url, title){
  if (shareFacebook) shareFacebook.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  if (shareX)     shareX.href     = `https://x.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
  if (shareWhats) shareWhats.href = `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`;
}

function openSharePopover(){
  if (!shareBtn || !sharePop) return;
  shareBtn.setAttribute('aria-expanded', 'true');
  sharePop.hidden = false;
  positionSharePopover();
  window.addEventListener('resize', positionSharePopover, { passive:true });
  window.addEventListener('scroll', positionSharePopover, { passive:true });
  // Accesibilidad: enfoca el botón Copy inline
  setTimeout(()=> shareCopyInline && shareCopyInline.focus(), 0);

}

function closeSharePopover({ returnFocus = false } = {}){
  if (!sharePop || sharePop.hidden) return;
  if (shareBtn) shareBtn.setAttribute('aria-expanded','false');
  sharePop.hidden = true;
  window.removeEventListener('resize', positionSharePopover);
  window.removeEventListener('scroll', positionSharePopover);
  if (returnFocus && shareBtn) shareBtn.focus();
}


function positionSharePopover(){
  if (!shareBtn || !sharePop) return;

  const r = shareBtn.getBoundingClientRect();
  const railOpen = body.classList.contains('sidebar-open');
  const gap = 10;

  const popW = sharePop.offsetWidth;
  const popH = sharePop.offsetHeight;

   // === Calcular ancho deseado y máximo posible hacia la derecha ===
  // 1) Ancho base que quieres (HOME más cómoda), ej. 370px; resto 360px
  const isHome = (normalizeUrl(location.href) === HOME_URL);
  const desired = isHome ? 370 : 360;

  // 2) Máximo permitido hacia la derecha sin mover el borde izquierdo
  const maxRightWidth = Math.max(240, Math.floor(window.innerWidth - 8 - (r.right + gap)));

  // 3) Aplica el ancho final (cap a 92vw lo hace el CSS)
  const finalW = Math.max(280, Math.min(desired, maxRightWidth));
  sharePop.style.setProperty('--share-popover-w', `${finalW}px`);

  let left, top;

  if (railOpen){
  // Sidebar ABIERTO: a la derecha del rail, alineado con el borde superior del item
  left = r.right + gap;
  top  = r.top;                  // ← ALINEADO (no centrado)
} else {
  // Sidebar CERRADO: a la derecha del botón, alineado arriba también
  left = r.right + gap;
  top  = r.top;                  // ← ALINEADO (no centrado)
}



  // Limitar al viewport
  left = Math.max(8, Math.min(left, window.innerWidth - popW - 8));
  top  = Math.max(8, Math.min(top, window.innerHeight - popH - 8));

  sharePop.style.left = `${Math.round(left)}px`;
  sharePop.style.top  = `${Math.round(top)}px`;
}

if (!sharePop.hidden) buildCorridor();


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
  // Región de estado para lectores de pantalla
  shareField.setAttribute('role', 'status');
  shareField.setAttribute('aria-live', 'polite');

  // Foco temporal en el contenedor (Copy está oculto con display:none)
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
        if (ico && prevIcon) ico.className = prevIcon;   // vuelve al icono de copy
        if (label) label.textContent = 'Copy';
        if (shareInput) shareInput.value = prevValue;     // restaura la URL

         
        // --- Restaurar foco y limpiar atributos temporales ---
        if (shareField) {
           shareField.removeAttribute('tabindex');
        }
         if (shareCopyInline) {
            // El botón Copy ya volvió a mostrarse; devuelve el foco para teclado
            shareCopyInline.focus();
         }

         
      }, 1400);
    } catch {}
  });
}


// 2) Click en el botón Share
// - En móvil/tablet → nativo
// - En desktop → también permite toggle con click (accesibilidad/teclado)
if (shareBtn) shareBtn.addEventListener('click', (e) => {
  const url = location.href;
  const title = document.title;

  if (useNativeShare()){
    e.preventDefault();
    navigator.share({ title, url }).catch(()=>{});
    return;
  }

  // Desktop: toggle por click (fallback accesible)
e.preventDefault();
if (sharePop.hidden){
  // --- HOME siempre completa; otras se muestran y si no caben, ellipsis CSS ---
  const normalized = normalizeUrl(url);
  const displayUrl = (normalized === HOME_URL) ? HOME_URL : url;

  if (shareInput){
    shareInput.value = displayUrl;          // lo que se ve
    shareInput.title = url;                 // tooltip con URL completa
    shareInput.setAttribute('aria-label', url); // accesible
  }

  setupShareLinks(url, title);
  openSharePopover();
} else {
  closeSharePopover();
}
});

// 3) Hover tipo Freepik (solo desktop)
let hoverCloseTimer = null;    // temporizador de cierre diferido
let tracking = false;          // ¿estamos siguiendo trayectoria?
let corridor = null;           // “buffer” entre botón y popover

function buildCorridor(){
  // Rectángulo tolerante desde el botón hasta el popover
  const br = shareBtn.getBoundingClientRect();
  const pr = sharePop.getBoundingClientRect();
  const pad = 12; // tolerancia lateral

  const left = Math.min(br.right, pr.left) - pad;
  const right = Math.max(br.right, pr.left) + pad;
  const top = Math.min(br.top, pr.top) - pad;
  const bottom = Math.max(br.bottom, pr.bottom) + pad;

  corridor = { left, right, top, bottom };
}

function inCorridor(x, y){
  if (!corridor) return false;
  return x >= corridor.left && x <= corridor.right && y >= corridor.top && y <= corridor.bottom;
}

function startHoverOpen(){
  if (!isDesktop()) return; // solo desktop
  const url = location.href;
  const title = document.title;

  if (sharePop.hidden){
  const normalized = normalizeUrl(url);
  const displayUrl = (normalized === HOME_URL) ? HOME_URL : url;

  if (shareInput){
    shareInput.value = displayUrl;
    shareInput.title = url;
    shareInput.setAttribute('aria-label', url);
  }

  setupShareLinks(url, title);
  openSharePopover();
}
  buildCorridor();
}

function scheduleHoverClose(){
  // cierra si no entra al popover y no sigue la trayectoria
  if (!isDesktop()) return;

  clearTimeout(hoverCloseTimer);
  tracking = true;

  hoverCloseTimer = setTimeout(() => {
    tracking = false;
    // si aún no entró a la ventana y no está sobre el botón, cerrar
    if (!sharePop.matches(':hover') && !shareBtn.matches(':hover')){
      closeSharePopover();
    }
  }, 180); // ventana breve para “cruzar” hacia el popover
}

function cancelHoverClose(){
  clearTimeout(hoverCloseTimer);
  tracking = false;
}

// Eventos de hover
if (shareBtn){
  shareBtn.addEventListener('mouseenter', startHoverOpen);
  shareBtn.addEventListener('mouseleave', scheduleHoverClose);
}
if (sharePop){
  sharePop.addEventListener('mouseenter', cancelHoverClose);
  sharePop.addEventListener('mouseleave', () => {
    if (isDesktop()) closeSharePopover();
  });
}

// Seguimiento de trayectoria: si el cursor se desvía del corredor antes de llegar
document.addEventListener('mousemove', (e) => {
  if (!isDesktop() || !tracking || sharePop.hidden) return;
  if (!inCorridor(e.clientX, e.clientY) && !sharePop.matches(':hover') && !shareBtn.matches(':hover')){
    // cambió de dirección → cerrar
    clearTimeout(hoverCloseTimer);
    tracking = false;
    closeSharePopover();
  }
});


// 4.5) Cerrar por clic-fuera y por Esc (desktop)
document.addEventListener('click', (e) => {
  if (useNativeShare()) return; // en móvil/tablet no hay popover
  if (sharePop.hidden) return;
  const inside = e.target.closest('#sharePopover, #shareBtn');
  if (!inside) closeSharePopover();
});

// Esc: cierre estilo Freepik (si el puntero sigue sobre el icono, se reabre)
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape' || !sharePop || sharePop.hidden) return;

  // Cierra sin devolver foco (evita contorno)
  closeSharePopover({ returnFocus: false });

  // Limpia foco activo (algunos navegadores dejan ring)
  if (document.activeElement && typeof document.activeElement.blur === 'function') {
    document.activeElement.blur();
  }

  // Si el puntero sigue sobre el botón, reabrir tras un instante (solo desktop)
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


// 4.6) Inicialización de campo de enlace
document.addEventListener('DOMContentLoaded', () => {
  const url = location.href;
  const normalized = normalizeUrl(url);
  const displayUrl = (normalized === HOME_URL) ? HOME_URL : url;

  if (shareInput){
    shareInput.value = displayUrl;
    shareInput.title = url;
    shareInput.setAttribute('aria-label', url);
  }
});




/* =========================================================
   5) OTROS (Idioma, Notifybar, etc.)
   ========================================================= */
// ===== Ajuste real de la altura de la notifybar
const notify = document.getElementById('notifybar');
function setNotifyHeight(){
  const h = notify ? notify.offsetHeight : 0;
  root.style.setProperty('--notify-h', `${h}px`);
}
window.addEventListener('load', setNotifyHeight);
window.addEventListener('resize', setNotifyHeight);
if (window.ResizeObserver && notify){
  new ResizeObserver(setNotifyHeight).observe(notify);
}

// Sincronizar estado de marca y aria al cargar
const initiallyOpen = body.classList.contains('sidebar-open');
reflectAria(initiallyOpen);
syncBrandA11y(initiallyOpen);



// === Registro del Service Worker para la PWA ===
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        console.log("✅ Service Worker registrado con éxito:", registration.scope);
      })
      .catch((error) => {
        console.log("❌ Falló el registro del Service Worker:", error);
      });
  });
}


/* =========================================================
   6) bottom bar actions
   ========================================================= */
const bottomBar = document.getElementById("bottomBar");
let lastScrollY = window.scrollY;

window.addEventListener("scroll", () => {
  const current = window.scrollY;

  // bajando
  if (current > lastScrollY + 5) {
    bottomBar?.classList.add("hidden");
  }
  // subiendo
  else if (current < lastScrollY - 5) {
    bottomBar?.classList.remove("hidden");
  }

  lastScrollY = current;
});

// opcional: marcar activo cuando hacen click
const bottomLinks = document.querySelectorAll(".bottom-bar .bottom-item");
bottomLinks.forEach((link) => {
  link.addEventListener("click", () => {
    bottomLinks.forEach((l) => l.classList.remove("is-active"));
    link.classList.add("is-active");
  });
});




/* =======================================================================================
   7)  Sincroniza color del navegador y barra de estado con el tema (light/dark/system)
   ======================================================================================= */
(function syncSystemBarsWithTheme() {
  const root = document.documentElement; // <html>
  const metaTheme = document.querySelector('#metaThemeColor');
  const metaApple = document.querySelector('#metaAppleStatus');

  // Colores alineados con tus tokens CSS
  const COLORS = {
    light: { chrome: '#f5f7fb', appleStatus: 'default' },             // status bar clara (texto oscuro)
    dark:  { chrome: '#0d1117', appleStatus: 'black-translucent' }    // status bar oscura (texto claro)
  };

  function getMode() {
    const d = root.getAttribute('data-theme') || 'system';
    if (d === 'light' || d === 'dark') return d;
    return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function apply() {
    const mode = getMode();
    const c = COLORS[mode];
    if (metaTheme) metaTheme.setAttribute('content', c.chrome);
    if (metaApple) metaApple.setAttribute('content', c.appleStatus);
  }

  // Inicial
  apply();

  // Si estás en "system", reacciona a cambios del SO
  const mm = matchMedia('(prefers-color-scheme: dark)');
  if (mm.addEventListener) {
    mm.addEventListener('change', () => {
      if ((root.getAttribute('data-theme') || 'system') === 'system') apply();
    });
  } else if (mm.addListener) {
    // Safari antiguo
    mm.addListener(() => {
      if ((root.getAttribute('data-theme') || 'system') === 'system') apply();
    });
  }

  // Expón helper para cuando cambies el tema por UI (lo usa applyTheme)
  window.__applyThemeChrome = apply;
})();

// Llamada de seguridad por si el tema cambia antes de que se defina la IIFE
if (typeof window.__applyThemeChrome === 'function') {
  window.__applyThemeChrome();
}


