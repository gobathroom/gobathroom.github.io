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

// ===== Tema: Light / Dark / System
const themeBtn   = $('#themeBtn');
const themeLabel = $('#themeLabel');
const cycle = ['system', 'light', 'dark'];
let idx = cycle.indexOf(localStorage.getItem('theme') || 'system');

function applyTheme(){
  const mode = cycle[idx];
  root.setAttribute('data-theme', mode);
  if (themeLabel) themeLabel.textContent = mode[0].toUpperCase() + mode.slice(1);
  localStorage.setItem('theme', mode);
}
if (themeBtn){
  themeBtn.addEventListener('click', () => {
    idx = (idx + 1) % cycle.length;
    applyTheme();
  });
}
applyTheme();

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
