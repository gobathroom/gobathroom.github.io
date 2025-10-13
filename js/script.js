// Helpers
const $ = (s, d=document) => d.querySelector(s);

const body  = document.body;
const root  = document.documentElement;

// ====== SIDEBAR TOGGLE (header mobile + rail button) ======
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

// Accesibilidad: cerrar con ESC en móvil (y opcionalmente en desktop)
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && body.classList.contains('sidebar-open')) {
    setSidebar(false);
  }
});

// ===== Tema: Light / Dark / System (Popover con iconos) =====
const themeBtn   = $('#themeBtn');
const themeLabel = $('#themeLabel');
const ICON_BY_THEME = { system: 'fa-laptop', light: 'fa-sun', dark: 'fa-moon' };

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


function applyTheme(val){
  const mode = (val || 'system').toLowerCase();
  root.setAttribute('data-theme', mode);
  themeLabel && (themeLabel.textContent = mode[0].toUpperCase() + mode.slice(1));
  localStorage.setItem('theme', mode);

  // Icono del botón según el tema
  const btnIcon = themeBtn ? themeBtn.querySelector('.ico') : null;
  if (btnIcon){
    btnIcon.classList.remove('fa-circle-half-stroke','fa-laptop','fa-sun','fa-moon');
    btnIcon.classList.add(ICON_BY_THEME[mode] || 'fa-circle-half-stroke');
  }

  // Actualiza aria-selected del popover
  themePop.querySelectorAll('.theme-opt').forEach(opt => {
    opt.setAttribute('aria-selected', opt.dataset.value === mode ? 'true' : 'false');
  });
}


// ===== Share: Desktop con hover tipo Freepik + nativo en tablet/móvil =====
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
    // Sidebar ABIERTO: arriba del botón (si no cabe, debajo)
    left = r.left + (r.width - popW) / 2;
    top  = r.top - gap - popH;
    if (top < 8) top = r.bottom + gap;
  } else {
    // Sidebar CERRADO: a la derecha del rail
    left = r.right + gap;
    top  = r.top + (r.height - popH) / 2;
  }

  // Limitar al viewport
  left = Math.max(8, Math.min(left, window.innerWidth - popW - 8));
  top  = Math.max(8, Math.min(top, window.innerHeight - popH - 8));

  sharePop.style.left = `${Math.round(left)}px`;
  sharePop.style.top  = `${Math.round(top)}px`;
}

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

// 4) Cerrar por clic-fuera y por Esc (desktop)
document.addEventListener('click', (e) => {
  if (useNativeShare()) return; // en móvil/tablet no hay popover
  if (sharePop.hidden) return;
  const inside = e.target.closest('#sharePopover, #shareBtn');
  if (!inside) closeSharePopover();
});

// Esc: cerrar y, si el puntero sigue sobre el icono, reabrir (estilo Freepik)
// Sin devolver el foco, y quitando el foco activo para evitar el ring
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape' || sharePop.hidden) return;

  // Cierra sin devolver foco
  closeSharePopover({ returnFocus: false });

  // Quita el foco del elemento activo (evita outline residual en algunos navegadores)
  if (document.activeElement && typeof document.activeElement.blur === 'function') {
    document.activeElement.blur();
  }

  // Esc: cierre estilo Freepik (si el puntero sigue sobre el icono, se reabre)
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape' || !sharePop || sharePop.hidden) return;

  // Cierra sin devolver foco (evitamos el anillo)
  closeSharePopover({ returnFocus: false });

  // Quita foco activo para evitar contornos residuales
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
        // solo si sigue cerrado (por si el usuario movió el mouse)
        if (sharePop.hidden) openSharePopover();
      }, 120);
    }
  }
});



// 5) Inicializar input/links con la URL actual al cargar popover
document.addEventListener('DOMContentLoaded', () => {
  if (shareInput) shareInput.value = location.href;
});



// ===== Idioma (placeholder)
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
