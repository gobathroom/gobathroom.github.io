// Helpers
const $ = (s, d=document) => d.querySelector(s);

// ===== Sidebar (soporta los dos toggles: botón del rail y, si existe, el de móvil)
const body = document.body;
const burgers = document.querySelectorAll('.hamburger');

burgers.forEach(btn => {
  btn.addEventListener('click', () => {
    const open = body.classList.toggle('sidebar-open');
    burgers.forEach(b => b.setAttribute('aria-expanded', String(open)));
  });
});

// Cerrar al hacer click fuera (sólo en móvil)
document.addEventListener('click', (e) => {
  if (!body.classList.contains('sidebar-open')) return;
  const insideSidebar = e.target.closest('.sidebar');
  const insideBurger  = e.target.closest('.hamburger');
  if (!insideSidebar && !insideBurger && window.matchMedia('(max-width: 768px)').matches){
    body.classList.remove('sidebar-open');
    burgers.forEach(b => b.setAttribute('aria-expanded', 'false'));
  }
});

// ===== Tema: Light / Dark / System
const root = document.documentElement;
const themeBtn = $('#themeBtn');
const themeLabel = $('#themeLabel');
const cycle = ['system', 'light', 'dark'];
let idx = cycle.indexOf(localStorage.getItem('theme') || 'system');

function applyTheme(){
  const mode = cycle[idx];
  root.setAttribute('data-theme', mode);
  themeLabel.textContent = mode[0].toUpperCase() + mode.slice(1);
  localStorage.setItem('theme', mode);
}
themeBtn.addEventListener('click', () => { idx = (idx + 1) % cycle.length; applyTheme(); });
applyTheme();

// ===== Share: Web Share API + fallback modal
const shareBtn = $('#shareBtn');
const shareModal = $('#shareModal');
const shareLink = $('#shareLink');
const copyLink = $('#copyLink');
const closeShare = $('#closeShare');

function openShare(){
  const url = location.href;
  if (navigator.share){
    navigator.share({ title: document.title, url }).catch(()=>{});
  } else {
    shareLink.value = url;
    shareModal.showModal();
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
