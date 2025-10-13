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


// ===== Share: Web Share API + fallback modal
const shareBtn   = $('#shareBtn');
const shareModal = $('#shareModal');
const shareLink  = $('#shareLink');
const copyLink   = $('#copyLink');
const closeShare = $('#closeShare');

function openShare(){
  const url = location.href;
  if (navigator.share){
    navigator.share({ title: document.title, url }).catch(()=>{});
  } else {
    if (shareLink) shareLink.value = url;
    if (shareModal) shareModal.showModal();
  }
}
if (shareBtn) shareBtn.addEventListener('click', openShare);
if (copyLink) copyLink.addEventListener('click', async () => {
  try{
    await navigator.clipboard.writeText(shareLink.value);
    copyLink.textContent = 'Copied!';
    setTimeout(()=>copyLink.textContent='Copy', 1200);
  }catch{}
});
if (closeShare) closeShare.addEventListener('click', () => shareModal.close());

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
