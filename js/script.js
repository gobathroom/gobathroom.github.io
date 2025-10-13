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
}

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
  const themeOpen = (typeof themePop !== 'undefined') && themePop && !themePop.hidden;

  // Si algún popover está abierto, dejamos que sus propios handlers gestionen Esc
  if (shareOpen || themeOpen) return;

  // Solo en móvil cerramos el sidebar con Esc
  if (isMobile && body.classList.contains('sidebar-open')) {
    setSidebar(false);
  }
});



/* =========================================================
   3) THEME: Light / Dark / System
   ---------------------------------------------------------
   3.1) Botón y label
   3.2) Icono dinámico (System = sun/moon según SO)
   3.3) Popover: creación, apertura, navegación, posicionamiento
   3.4) applyTheme + listeners de sistema
   ========================================================= */
// 3.1) Botón y label
const themeBtn   = $('#themeBtn');
const themeLabel = $('#themeLabel');
const ICON_BY_THEME = { system: 'fa-laptop', light: 'fa-sun', dark: 'fa-moon' };

// 3.2) Icono dinámico (System = sun/moon)
const mediaDark = window.matchMedia('(prefers-color-scheme: dark)');

// Icono actual del sistema (si el usuario eligió "system")
function systemIcon(){
  return mediaDark.matches ? 'fa-moon' : 'fa-sun';
}

// Pinta el icono del botón según el modo actual
function setThemeButtonIcon(mode){
  const btnIcon = themeBtn ? themeBtn.querySelector('.ico') : null;
  if (!btnIcon) return;

  // Limpiar posibles iconos previos
  btnIcon.classList.remove('fa-circle-half-stroke','fa-laptop','fa-sun','fa-moon');

  // Si es "system", mostramos sun/moon real; si no, el icono propio del modo
  const cls = (mode === 'system') ? systemIcon() : (ICON_BY_THEME[mode] || 'fa-circle-half-stroke');
  btnIcon.classList.add(cls);
}

// Cuando el sistema cambia (solo importa si el usuario eligió "system")
function onSystemThemeChange(){
  const saved = (localStorage.getItem('theme') || 'system').toLowerCase();
  if (saved === 'system') setThemeButtonIcon('system');
}


// 3.3) Popover de Theme
let themePop = document.getElementById('themePopover');

// Crea el popover si no existe en el HTML
if (!themePop) {
  themePop = document.createElement('div');
  themePop.id = 'themePopover';
  themePop.className = 'theme-popover';
  themePop.setAttribute('role','listbox');
  themePop.setAttribute('aria-label','Select theme');
  themePop.hidden = true;
  themePop.innerHTML = `
    <button class="theme-opt" role="option" data-value="system" aria-selected="false">
      <i class="fa-solid fa-laptop opt-ico" aria-hidden="true"></i><span>System</span>
    </button>
    <button class="theme-opt" role="option" data-value="light" aria-selected="false">
      <i class="fa-solid fa-sun opt-ico" aria-hidden="true"></i><span>Light</span>
    </button>
    <button class="theme-opt" role="option" data-value="dark" aria-selected="false">
      <i class="fa-solid fa-moon opt-ico" aria-hidden="true"></i><span>Dark</span>
    </button>
  `;
  document.body.appendChild(themePop);
}

// Estado inicial
applyTheme(localStorage.getItem('theme') || 'system');

// Abrir/cerrar popover
if (themeBtn) {
  themeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleThemePopover();
  });
}

// Cerrar por click fuera o Esc
document.addEventListener('click', (e) => {
  if (!themePop.hidden && !themePop.contains(e.target) && e.target !== themeBtn) {
    closeThemePopover();
  }
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !themePop.hidden) closeThemePopover();
});

// Selección (siempre cierra, aunque repitas la misma)
themePop.addEventListener('click', (e) => {
  const opt = e.target.closest('.theme-opt');
  if (!opt) return;
  const val = opt.dataset.value;
  applyTheme(val);
  closeThemePopover();
  themeBtn && themeBtn.focus();
});

// Navegación por teclado dentro del listbox
themePop.addEventListener('keydown', (e) => {
  const opts = Array.from(themePop.querySelectorAll('.theme-opt'));
  const idx  = opts.indexOf(document.activeElement);
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    (opts[(idx + 1 + opts.length) % opts.length]).focus();
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    (opts[(idx - 1 + opts.length) % opts.length]).focus();
  } else if (e.key === 'Home') {
    e.preventDefault(); opts[0].focus();
  } else if (e.key === 'End') {
    e.preventDefault(); opts[opts.length - 1].focus();
  } else if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault(); document.activeElement.click();
  }
});

function toggleThemePopover(){
  if (themePop.hidden) openThemePopover(); else closeThemePopover();
}

function openThemePopover(){
  if (!themeBtn) return;
  themeBtn.setAttribute('aria-expanded', 'true');
  themePop.hidden = false;

  // Marcar opción seleccionada y enfocar
  const current = (root.getAttribute('data-theme') || 'system').toLowerCase();
  themePop.querySelectorAll('.theme-opt').forEach(opt => {
    const sel = opt.dataset.value === current;
    opt.setAttribute('aria-selected', sel ? 'true' : 'false');
    if (sel) setTimeout(() => opt.focus(), 0);
  });

  positionThemePopover();
  window.addEventListener('resize', positionThemePopover, { passive:true });
  window.addEventListener('scroll', positionThemePopover, { passive:true });
}

function closeThemePopover(){
  themeBtn && themeBtn.setAttribute('aria-expanded', 'false');
  themePop.hidden = true;
  window.removeEventListener('resize', positionThemePopover);
  window.removeEventListener('scroll', positionThemePopover);
}

function positionThemePopover(){
  if (!themeBtn) return;

  const r = themeBtn.getBoundingClientRect();
  const isOpen = body.classList.contains('sidebar-open');
  const gap = 8;

  // medidas del popover (ya visible)
  const popW = themePop.offsetWidth;
  const popH = themePop.offsetHeight;

  let left, top;

  if (isOpen){
    // Sidebar ABIERTO: popover arriba y centrado respecto al botón
    left = r.left + (r.width - popW) / 2;
    top  = r.top - gap - popH;          // arriba del icono
    if (top < 8) top = r.bottom + gap;  // fallback: debajo si no hay espacio
  } else {
    // Sidebar CERRADO: popover a la DERECHA, centrado verticalmente
    left = r.right + gap;
    top  = r.top + (r.height - popH) / 2;
  }

  // Limites de viewport
  left = Math.max(8, Math.min(left, window.innerWidth - popW - 8));
  top  = Math.max(8, Math.min(top, window.innerHeight - popH - 8));

  themePop.style.left = `${Math.round(left)}px`;
  themePop.style.top  = `${Math.round(top)}px`;
}


// 3.4) applyTheme + listeners de sistema
function applyTheme(val){
  const mode = (val || 'system').toLowerCase();
  root.setAttribute('data-theme', mode);
  themeLabel && (themeLabel.textContent = mode[0].toUpperCase() + mode.slice(1));
  localStorage.setItem('theme', mode);

  // Icono del botón según el tema (Freepik-style para "system")
setThemeButtonIcon(mode);

// Suscribir o desuscribir el listener del sistema
if (mode === 'system'){
  if (mediaDark.addEventListener) mediaDark.addEventListener('change', onSystemThemeChange);
  else mediaDark.addListener(onSystemThemeChange); // Safari antiguo
} else {
  if (mediaDark.removeEventListener) mediaDark.removeEventListener('change', onSystemThemeChange);
  else mediaDark.removeListener(onSystemThemeChange);
}


  // Actualiza aria-selected del popover
  themePop.querySelectorAll('.theme-opt').forEach(opt => {
    opt.setAttribute('aria-selected', opt.dataset.value === mode ? 'true' : 'false');
  });
}



/* =========================================================
   4) SHARE: Desktop hover (Freepik) + Mobile nativo
   ---------------------------------------------------------
   4.1) Selectores y estado del mouse
   4.2) Detección de dispositivo
   // 4.3) Tooltip inteligente del rail (desktop cerrado, sin popovers)
   4.4) Lógica de Share (links, abrir/cerrar, posicionamiento, hover corridor)
   4.5) Cierre por clic-fuera y Esc (estilo Freepik)
   ========================================================= */
// 4.1) Selectores y estado del mouse
const shareBtn    = $('#shareBtn');
const shareModal  = $('#shareModal'); // fallback muy viejo
const sharePop    = $('#sharePopover');
const shareInput  = $('#shareInput');
const shareCopy   = $('#shareCopy');
const shareEmail  = $('#shareEmail');
const shareX      = $('#shareX');
const shareWhats  = $('#shareWhats');
// Posición del mouse (para saber si Esc se pulsa con el puntero sobre el botón)
let lastMouseX = -1, lastMouseY = -1;
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
  const gap  = 0;

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
  if (shareEmail) shareEmail.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`;
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
  // Accesibilidad: enfoca acción primaria
  setTimeout(()=> shareCopy && shareCopy.focus(), 0);
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

// 1) Copiar
if (shareCopy) shareCopy.addEventListener('click', async () => {
  try{
    await navigator.clipboard.writeText(shareInput.value || location.href);
    shareCopy.textContent = 'Copied!';
    setTimeout(()=> shareCopy.textContent = 'Copy', 1200);
  } catch{}
});

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
    if (shareInput) shareInput.value = url;
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
    if (shareInput) shareInput.value = url;
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
  if (shareInput) shareInput.value = location.href;
});



/* =========================================================
   5) OTROS (Idioma, Notifybar, etc.)
   ========================================================= */
// Idioma (placeholder)
const langSel = $('#lang');
if (langSel){
  langSel.addEventListener('change', (e) => {
    console.log('Language:', e.target.value);
  });
}

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
